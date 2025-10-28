# Guia de Deploy - Sistema de Agendamento com Docker Swarm + Traefik

Este guia detalha o processo completo de deploy do sistema de agendamento de clínicas em produção usando **Docker Swarm** e **Traefik** como reverse proxy com SSL automático.

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de que o ambiente de produção possui:

- ✅ Docker Swarm inicializado (`docker swarm init`)
- ✅ Traefik rodando como serviço no Swarm
- ✅ Rede `externa` criada (`docker network create --driver overlay externa`)
- ✅ DNS configurado: `clinica.123atendi.com.br` → IP do servidor
- ✅ Portas 80 e 443 abertas no firewall
- ✅ Acesso ao Docker Hub (123atendi)

## 🔐 Passo 1: Configurar Variáveis de Ambiente

### 1.1 Gerar JWT Secret Seguro

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o hash gerado (ex: `a3f5d8c9b2e1...`).

### 1.2 Criar Arquivo .env.production

```bash
cd clinica-agendamento
cp .env.production.example .env.production
```

Edite o arquivo `.env.production` e preencha:

```env
# Backend Configuration
NODE_ENV=production
PORT=3001
JWT_SECRET=cole_aqui_o_hash_gerado_no_passo_1.1
CORS_ORIGIN=https://clinica.123atendi.com.br

# Frontend Configuration
REACT_APP_API_URL=https://clinica.123atendi.com.br/api
```

**⚠️ IMPORTANTE:** Nunca commite o arquivo `.env.production` no Git!

## 🐳 Passo 2: Build das Imagens Docker

### 2.1 Build do Backend

```bash
cd backend
docker build -t 123atendi/clinica-agendamento-backend:latest .
```

### 2.2 Build do Frontend

```bash
cd ../frontend
docker build -t 123atendi/clinica-agendamento-frontend:latest .
```

### 2.3 Verificar Imagens Criadas

```bash
docker images | grep clinica-agendamento
```

Você deve ver:
```
123atendi/clinica-agendamento-backend    latest    <image_id>   X minutes ago   XXX MB
123atendi/clinica-agendamento-frontend   latest    <image_id>   X minutes ago   XXX MB
```

## 📤 Passo 3: Push para Docker Hub (Opcional mas Recomendado)

Se você quiser fazer deploy em múltiplos servidores ou manter backup das imagens:

```bash
# Login no Docker Hub
docker login

# Push das imagens
docker push 123atendi/clinica-agendamento-backend:latest
docker push 123atendi/clinica-agendamento-frontend:latest
```

## 🚀 Passo 4: Deploy no Docker Swarm

### 4.1 Carregar Variáveis de Ambiente

```bash
cd clinica-agendamento
export JWT_SECRET="cole_aqui_o_mesmo_hash_do_passo_1.1"
```

### 4.2 Fazer Deploy da Stack

```bash
docker stack deploy -c docker-compose.yml clinica
```

**Saída esperada:**
```
Creating network clinica_clinica-internal
Creating service clinica_backend
Creating service clinica_frontend
```

### 4.3 Verificar Status do Deploy

```bash
# Listar serviços da stack
docker stack services clinica

# Verificar réplicas (deve mostrar 1/1)
docker service ls | grep clinica
```

**Saída esperada:**
```
ID            NAME               MODE         REPLICAS   IMAGE
xxxxxxxxxxxx  clinica_backend    replicated   1/1        123atendi/clinica-agendamento-backend:latest
xxxxxxxxxxxx  clinica_frontend   replicated   1/1        123atendi/clinica-agendamento-frontend:latest
```

## ✅ Passo 5: Verificar Funcionamento

### 5.1 Verificar Logs dos Serviços

```bash
# Logs do backend
docker service logs clinica_backend -f

# Logs do frontend
docker service logs clinica_frontend -f

# Logs do Traefik (verificar se registrou as rotas)
docker service logs traefik | grep clinica
```

### 5.2 Verificar Certificado SSL

Aguarde cerca de 1-2 minutos para o Let's Encrypt emitir o certificado.

```bash
# Ver logs do Traefik para confirmar emissão do certificado
docker service logs traefik 2>&1 | grep -i "clinica.123atendi.com.br"
```

Você deve ver mensagens como:
```
time="..." level=info msg="Certificate obtained for domains [clinica.123atendi.com.br]"
```

### 5.3 Testar Acesso

```bash
# Testar se o frontend responde
curl -I https://clinica.123atendi.com.br

# Testar se a API responde
curl https://clinica.123atendi.com.br/api
```

Acesse no navegador:
- **Frontend**: https://clinica.123atendi.com.br
- **API**: https://clinica.123atendi.com.br/api

## 🗄️ Passo 6: Popular Banco de Dados (Primeira Vez)

Após o deploy inicial, popule o banco com dados de exemplo:

```bash
# Encontrar o container do backend em execução
docker ps | grep clinica_backend

# Executar seed no container
docker exec $(docker ps -q -f name=clinica_backend) npm run seed
```

**Credenciais padrão criadas:**
- Usuário: `admin`
- Senha: `admin123`

## 📊 Monitoramento e Manutenção

### Ver Logs em Tempo Real

```bash
# Todos os serviços da stack
docker stack ps clinica

# Logs do backend
docker service logs clinica_backend -f --tail 100

# Logs do frontend
docker service logs clinica_frontend -f --tail 100
```

### Verificar Status dos Containers

```bash
# Listar containers em execução
docker ps | grep clinica

# Status detalhado dos serviços
docker service ps clinica_backend
docker service ps clinica_frontend
```

### Verificar Rotas do Traefik

```bash
# Ver configuração do Traefik
docker service inspect clinica_frontend --pretty

# Verificar labels do Traefik
docker service inspect clinica_backend | jq '.[].Spec.TaskTemplate.ContainerSpec.Labels'
```

## 🔄 Atualizar Aplicação

### Opção 1: Build Local + Deploy

```bash
# 1. Build novas imagens
docker build -t 123atendi/clinica-agendamento-backend:latest ./backend
docker build -t 123atendi/clinica-agendamento-frontend:latest ./frontend

# 2. (Opcional) Push para Docker Hub
docker push 123atendi/clinica-agendamento-backend:latest
docker push 123atendi/clinica-agendamento-frontend:latest

# 3. Atualizar serviços
docker service update --image 123atendi/clinica-agendamento-backend:latest clinica_backend
docker service update --image 123atendi/clinica-agendamento-frontend:latest clinica_frontend
```

### Opção 2: Redeployar Stack Completa

```bash
# Remover stack antiga
docker stack rm clinica

# Aguardar remoção completa (15-30 segundos)
sleep 30

# Deploy novamente
export JWT_SECRET="seu_secret_aqui"
docker stack deploy -c docker-compose.yml clinica
```

## 💾 Backup do Banco de Dados

### Backup Manual

```bash
# Criar diretório de backups
mkdir -p ~/backups/clinica

# Copiar banco de dados
docker cp $(docker ps -q -f name=clinica_backend):/app/data/clinica.db ~/backups/clinica/backup-$(date +%Y%m%d-%H%M%S).db
```

### Backup Automático (Cron)

```bash
# Editar crontab
crontab -e

# Adicionar linha para backup diário às 3h da manhã
0 3 * * * docker cp $(docker ps -q -f name=clinica_backend):/app/data/clinica.db ~/backups/clinica/backup-$(date +\%Y\%m\%d).db
```

### Restaurar Backup

```bash
# Copiar backup para dentro do container
docker cp ~/backups/clinica/backup-20231201.db $(docker ps -q -f name=clinica_backend):/app/data/clinica.db

# Reiniciar serviço
docker service update --force clinica_backend
```

## 🔍 Troubleshooting

### Serviço não inicia (0/1 replicas)

```bash
# Ver logs detalhados
docker service ps clinica_backend --no-trunc

# Ver mensagens de erro
docker service logs clinica_backend
```

**Problemas comuns:**
- JWT_SECRET não definido: exportar variável antes do deploy
- Rede `externa` não existe: criar com `docker network create --driver overlay externa`
- Imagem não encontrada: fazer build ou pull das imagens

### Certificado SSL não é emitido

```bash
# Verificar logs do Traefik
docker service logs traefik | grep -i error

# Verificar DNS
nslookup clinica.123atendi.com.br

# Verificar se porta 80 está acessível (Let's Encrypt usa HTTP challenge)
curl http://clinica.123atendi.com.br
```

**Soluções:**
- Aguardar propagação DNS (pode levar até 48h)
- Verificar firewall (portas 80 e 443 devem estar abertas)
- Verificar logs do Traefik para erros específicos

### Erro 502 Bad Gateway

```bash
# Verificar se backend está rodando
docker service ps clinica_backend

# Verificar logs do backend
docker service logs clinica_backend

# Verificar health check
docker exec $(docker ps -q -f name=clinica_backend) wget -qO- http://localhost:3001/
```

### Frontend não consegue acessar API (CORS)

Verificar variáveis de ambiente:

```bash
# Ver env do backend
docker service inspect clinica_backend | jq '.[].Spec.TaskTemplate.ContainerSpec.Env'
```

Deve conter:
```json
"CORS_ORIGIN=https://clinica.123atendi.com.br"
```

## 🔐 Segurança em Produção

### Checklist de Segurança

- ✅ JWT_SECRET forte (64+ caracteres hexadecimais)
- ✅ Certificado SSL válido (Let's Encrypt)
- ✅ CORS configurado apenas para domínio correto
- ✅ Firewall configurado (portas 22, 80, 443)
- ✅ Backups automáticos do banco de dados
- ✅ Variáveis sensíveis não commitadas no Git
- ✅ Health checks configurados
- ✅ Logs sendo monitorados

### Configurar Firewall (UFW)

```bash
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP (para Let's Encrypt)
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable
```

### Atualizar Senhas Padrão

```bash
# Acessar o sistema e alterar senha do admin
# Via interface web: Login > Configurações > Alterar Senha
```

## 📈 Escalabilidade Futura

Este setup está pronto para escalar. Para aumentar capacidade:

```bash
# Aumentar réplicas do backend
docker service scale clinica_backend=3

# Aumentar réplicas do frontend
docker service scale clinica_frontend=2
```

O Traefik fará load balancing automaticamente entre as réplicas.

## 🆘 Comandos Úteis Resumo

```bash
# Ver status geral
docker stack ps clinica

# Reiniciar serviço
docker service update --force clinica_backend

# Escalar serviço
docker service scale clinica_backend=2

# Remover stack
docker stack rm clinica

# Ver logs
docker service logs -f clinica_backend

# Executar comando no container
docker exec $(docker ps -q -f name=clinica_backend) <comando>

# Backup
docker cp $(docker ps -q -f name=clinica_backend):/app/data/clinica.db ./backup.db
```

## 📞 Suporte

Para problemas técnicos:
1. Verificar logs: `docker service logs clinica_backend`
2. Verificar status: `docker stack ps clinica`
3. Consultar documentação do Traefik: https://doc.traefik.io/traefik/

---

**Deploy realizado com sucesso! 🎉**

O sistema está disponível em: **https://clinica.123atendi.com.br**
