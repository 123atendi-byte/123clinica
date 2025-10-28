# 🚀 Quick Start - Deploy Rápido

**Objetivo:** Deploy do sistema em produção em 10 minutos.

---

## ⚡ Modo Automático (Recomendado)

Execute o script automatizado:

```bash
cd C:\Users\carla\clinica-agendamento
chmod +x COMANDOS_DEPLOY.sh
./COMANDOS_DEPLOY.sh
```

O script fará automaticamente:
1. ✅ Gerar JWT Secret
2. ✅ Criar .env.production
3. ✅ Build das imagens
4. ✅ Verificar pré-requisitos
5. ✅ Deploy no Swarm
6. ✅ Popular banco de dados

---

## 🔧 Modo Manual (Passo a Passo)

### 1️⃣ Gerar JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copie o hash gerado!**

### 2️⃣ Criar .env.production

```bash
cd C:\Users\carla\clinica-agendamento
cp .env.production.example .env.production
```

Edite `.env.production` e cole o JWT_SECRET gerado no passo 1.

### 3️⃣ Build das Imagens

```bash
# Backend
docker build -t 123atendi/clinica-agendamento-backend:latest ./backend

# Frontend
docker build -t 123atendi/clinica-agendamento-frontend:latest ./frontend
```

### 4️⃣ Deploy

```bash
# Carregar JWT_SECRET
export JWT_SECRET="cole_o_hash_gerado_no_passo_1"

# Deploy
docker stack deploy -c docker-compose.yml clinica
```

### 5️⃣ Verificar

```bash
# Ver status
docker stack services clinica

# Ver logs
docker service logs clinica_backend -f
```

### 6️⃣ Popular Banco

```bash
docker exec $(docker ps -q -f name=clinica_backend) npm run seed
```

---

## ✅ Verificação Pós-Deploy

### Testar Acesso

```bash
# Frontend
curl -I https://clinica.123atendi.com.br

# API
curl https://clinica.123atendi.com.br/api
```

### Acessar no Navegador

- **URL:** https://clinica.123atendi.com.br
- **Usuário:** admin
- **Senha:** admin123

---

## 📊 Comandos Úteis

```bash
# Ver status
docker stack ps clinica

# Ver logs backend
docker service logs clinica_backend -f

# Ver logs frontend
docker service logs clinica_frontend -f

# Reiniciar serviço
docker service update --force clinica_backend

# Backup banco
docker cp $(docker ps -q -f name=clinica_backend):/app/data/clinica.db ./backup.db

# Remover stack
docker stack rm clinica
```

---

## 🆘 Troubleshooting Rápido

### Serviço não inicia

```bash
docker service ps clinica_backend --no-trunc
docker service logs clinica_backend
```

### SSL não funciona

```bash
# Verificar logs do Traefik
docker service logs traefik | grep clinica

# Aguardar 1-2 minutos para emissão do certificado
```

### Erro 502

```bash
# Verificar se backend está rodando
docker ps | grep clinica_backend

# Ver logs
docker service logs clinica_backend
```

---

## 📚 Documentação Completa

Para instruções detalhadas, consulte:

- **DEPLOY.md** - Guia completo de deploy passo a passo
- **ARQUITETURA.md** - Diagrama da arquitetura completa
- **RESUMO_CONFIGURACAO_DOCKER.md** - Resumo de todos os arquivos criados
- **README.md** - Documentação geral do projeto

---

## 🎯 Checklist Pré-Deploy

Antes de executar o deploy, verifique:

- [ ] Docker Swarm está inicializado
- [ ] Traefik está rodando no Swarm
- [ ] Rede `externa` existe
- [ ] DNS aponta clinica.123atendi.com.br para o servidor
- [ ] Portas 80 e 443 estão abertas
- [ ] JWT_SECRET foi gerado e configurado

---

**Tempo estimado de deploy:** 5-10 minutos
**Domínio:** https://clinica.123atendi.com.br
