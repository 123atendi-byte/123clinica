#!/bin/bash
# ============================================================================
# COMANDOS DE DEPLOY - Sistema de Agendamento Clínica
# ============================================================================
# Domínio: clinica.123atendi.com.br
# Stack: Docker Swarm + Traefik + Node.js + React
# ============================================================================

# ----------------------------------------------------------------------------
# PASSO 1: GERAR JWT SECRET
# ----------------------------------------------------------------------------
echo "Gerando JWT Secret..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "JWT_SECRET gerado: $JWT_SECRET"
echo ""
echo "⚠️  IMPORTANTE: Copie este JWT_SECRET e guarde em local seguro!"
echo ""

# ----------------------------------------------------------------------------
# PASSO 2: CRIAR ARQUIVO .env.production
# ----------------------------------------------------------------------------
echo "Criando arquivo .env.production..."
cat > .env.production << EOF
# IMPORTANTE: Este arquivo contém informações sensíveis
# Nunca commite este arquivo no Git

# =====================================
# VARIÁVEIS DO BACKEND
# =====================================
NODE_ENV=production
PORT=3001
JWT_SECRET=$JWT_SECRET
CORS_ORIGIN=https://clinica.123atendi.com.br

# =====================================
# VARIÁVEIS DO FRONTEND
# =====================================
REACT_APP_API_URL=https://clinica.123atendi.com.br/api
EOF

echo "✅ Arquivo .env.production criado com sucesso!"
echo ""

# ----------------------------------------------------------------------------
# PASSO 3: BUILD DAS IMAGENS DOCKER
# ----------------------------------------------------------------------------
echo "Iniciando build das imagens Docker..."
echo ""

# Build Backend
echo "🐳 Building backend..."
cd backend
docker build -t 123atendi/clinica-agendamento-backend:latest .
if [ $? -eq 0 ]; then
    echo "✅ Backend build concluído!"
else
    echo "❌ Erro no build do backend"
    exit 1
fi
cd ..

# Build Frontend
echo ""
echo "🐳 Building frontend..."
cd frontend
docker build -t 123atendi/clinica-agendamento-frontend:latest .
if [ $? -eq 0 ]; then
    echo "✅ Frontend build concluído!"
else
    echo "❌ Erro no build do frontend"
    exit 1
fi
cd ..

echo ""
echo "✅ Todas as imagens foram buildadas com sucesso!"
echo ""

# ----------------------------------------------------------------------------
# PASSO 4: (OPCIONAL) PUSH PARA DOCKER HUB
# ----------------------------------------------------------------------------
echo "Deseja fazer push das imagens para o Docker Hub? (s/n)"
read -r PUSH_DOCKERHUB

if [ "$PUSH_DOCKERHUB" = "s" ] || [ "$PUSH_DOCKERHUB" = "S" ]; then
    echo ""
    echo "Fazendo login no Docker Hub..."
    docker login

    echo ""
    echo "📤 Pushing backend..."
    docker push 123atendi/clinica-agendamento-backend:latest

    echo ""
    echo "📤 Pushing frontend..."
    docker push 123atendi/clinica-agendamento-frontend:latest

    echo ""
    echo "✅ Push para Docker Hub concluído!"
fi

# ----------------------------------------------------------------------------
# PASSO 5: VERIFICAR PRÉ-REQUISITOS
# ----------------------------------------------------------------------------
echo ""
echo "Verificando pré-requisitos..."
echo ""

# Verificar se está em um Swarm
if ! docker info | grep -q "Swarm: active"; then
    echo "❌ Docker Swarm não está ativo!"
    echo "   Execute: docker swarm init"
    exit 1
else
    echo "✅ Docker Swarm está ativo"
fi

# Verificar se rede externa existe
if ! docker network ls | grep -q "externa"; then
    echo "⚠️  Rede 'externa' não encontrada"
    echo "   Criando rede externa..."
    docker network create --driver overlay externa
    echo "✅ Rede 'externa' criada"
else
    echo "✅ Rede 'externa' existe"
fi

# Verificar se Traefik está rodando
if docker service ls | grep -q "traefik"; then
    echo "✅ Traefik está rodando"
else
    echo "⚠️  Traefik não encontrado como serviço"
    echo "   Certifique-se de que o Traefik está configurado corretamente"
fi

# Verificar DNS
echo ""
echo "Verificando DNS..."
if nslookup clinica.123atendi.com.br > /dev/null 2>&1; then
    echo "✅ DNS configurado: clinica.123atendi.com.br"
else
    echo "⚠️  DNS não resolvido ou não propagado ainda"
    echo "   Aguarde a propagação ou verifique a configuração"
fi

# ----------------------------------------------------------------------------
# PASSO 6: DEPLOY NO DOCKER SWARM
# ----------------------------------------------------------------------------
echo ""
echo "============================================================================"
echo "PRONTO PARA DEPLOY!"
echo "============================================================================"
echo ""
echo "Deseja fazer o deploy agora? (s/n)"
read -r DO_DEPLOY

if [ "$DO_DEPLOY" = "s" ] || [ "$DO_DEPLOY" = "S" ]; then
    echo ""
    echo "🚀 Iniciando deploy da stack 'clinica'..."
    echo ""

    # Exportar JWT_SECRET
    export JWT_SECRET="$JWT_SECRET"

    # Deploy
    docker stack deploy -c docker-compose.yml clinica

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Deploy concluído com sucesso!"
        echo ""
        echo "Verificando status dos serviços..."
        sleep 3
        docker stack services clinica

        echo ""
        echo "============================================================================"
        echo "🎉 DEPLOY REALIZADO COM SUCESSO!"
        echo "============================================================================"
        echo ""
        echo "📍 URLs:"
        echo "   Frontend: https://clinica.123atendi.com.br"
        echo "   API:      https://clinica.123atendi.com.br/api"
        echo ""
        echo "🔑 Credenciais padrão:"
        echo "   Usuário: admin"
        echo "   Senha:   admin123"
        echo ""
        echo "📊 Comandos úteis:"
        echo "   Ver logs backend:  docker service logs clinica_backend -f"
        echo "   Ver logs frontend: docker service logs clinica_frontend -f"
        echo "   Ver status:        docker stack ps clinica"
        echo "   Popular banco:     docker exec \$(docker ps -q -f name=clinica_backend) npm run seed"
        echo ""
        echo "⚠️  IMPORTANTE:"
        echo "   - Aguarde 1-2 minutos para emissão do certificado SSL"
        echo "   - Altere a senha padrão após primeiro login"
        echo "   - Configure backup automático do banco de dados"
        echo ""
        echo "============================================================================"
    else
        echo ""
        echo "❌ Erro no deploy"
        echo "Verifique os logs para mais detalhes"
        exit 1
    fi
else
    echo ""
    echo "Deploy cancelado pelo usuário"
    echo ""
    echo "Para fazer deploy manualmente, execute:"
    echo "  export JWT_SECRET=\"$JWT_SECRET\""
    echo "  docker stack deploy -c docker-compose.yml clinica"
fi

# ----------------------------------------------------------------------------
# PASSO 7: POPULAR BANCO DE DADOS (OPCIONAL)
# ----------------------------------------------------------------------------
if [ "$DO_DEPLOY" = "s" ] || [ "$DO_DEPLOY" = "S" ]; then
    echo ""
    echo "Deseja popular o banco de dados com dados de exemplo? (s/n)"
    read -r SEED_DB

    if [ "$SEED_DB" = "s" ] || [ "$SEED_DB" = "S" ]; then
        echo ""
        echo "Aguardando container do backend ficar pronto..."
        sleep 5

        BACKEND_CONTAINER=$(docker ps -q -f name=clinica_backend)

        if [ -z "$BACKEND_CONTAINER" ]; then
            echo "⚠️  Container do backend ainda não está rodando"
            echo "   Execute manualmente depois:"
            echo "   docker exec \$(docker ps -q -f name=clinica_backend) npm run seed"
        else
            echo "Populando banco de dados..."
            docker exec "$BACKEND_CONTAINER" npm run seed

            if [ $? -eq 0 ]; then
                echo "✅ Banco de dados populado com sucesso!"
                echo ""
                echo "Dados criados:"
                echo "  - 1 usuário admin"
                echo "  - 5 médicos"
                echo "  - 20 pacientes"
                echo "  - 15 consultas"
            else
                echo "⚠️  Erro ao popular banco. Execute manualmente:"
                echo "   docker exec \$(docker ps -q -f name=clinica_backend) npm run seed"
            fi
        fi
    fi
fi

echo ""
echo "============================================================================"
echo "SCRIPT DE DEPLOY FINALIZADO"
echo "============================================================================"
echo ""
