# Guia Completo: Deploy GitHub Actions + DockerHub + Portainer

Este documento detalha o processo completo para configurar o fluxo automatizado de deploy do Sistema de Agendamento da Clínica.

## Visão Geral do Fluxo

```
[GitHub Repository]
       ↓ (Push to main)
[GitHub Actions]
       ↓ (Build images)
[DockerHub Registry]
       ↓ (Pull images)
[Portainer Stack]
       ↓ (Deploy with Traefik)
[Produção: clinica.123atendi.com.br]
```

## Pré-requisitos

- [ ] Conta no GitHub
- [ ] Conta no DockerHub (hub.docker.com)
- [ ] Servidor com Docker Swarm configurado
- [ ] Portainer instalado e acessível
- [ ] Traefik configurado no Swarm
- [ ] DNS apontando `clinica.123atendi.com.br` para o servidor

## Etapa 1: Criar Repositório no GitHub

### 1.1 Criar Repositório

1. Acesse GitHub.com e faça login
2. Clique no botão **"New repository"** (ou acesse https://github.com/new)
3. Configure o repositório:
   - **Repository name**: `clinica-agendamento`
   - **Description**: "Sistema de agendamento para clínicas médicas"
   - **Visibility**: Private (recomendado) ou Public
   - **NÃO** marque "Add a README file" (já temos um)
   - **NÃO** adicione .gitignore (já temos um)
   - Clique em **"Create repository"**

### 1.2 Conectar Repositório Local

No seu terminal, dentro da pasta `C:\Users\carla\clinica-agendamento`:

```bash
# Inicializar repositório Git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "feat: configuração inicial do sistema de agendamento

- Backend Node.js com Express e SQLite
- Frontend React com interface responsiva
- Dockerfiles otimizados para produção
- GitHub Actions para CI/CD automático
- Stack pronta para Portainer

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Adicionar remote do GitHub (substitua SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/clinica-agendamento.git

# Renomear branch para main (se necessário)
git branch -M main

# Fazer push para GitHub
git push -u origin main
```

**IMPORTANTE**: Substitua `SEU-USUARIO` pelo seu nome de usuário do GitHub.

## Etapa 2: Configurar DockerHub

### 2.1 Criar Token de Acesso

1. Acesse https://hub.docker.com/
2. Faça login
3. Clique no seu avatar (canto superior direito) → **"Account Settings"**
4. No menu lateral, clique em **"Security"**
5. Clique no botão **"New Access Token"**
6. Configure:
   - **Access Token Description**: `GitHub Actions - Clinica Agendamento`
   - **Access permissions**: Read, Write, Delete
7. Clique em **"Generate"**
8. **COPIE O TOKEN AGORA** (não será mostrado novamente)
   - Salve em um local seguro temporariamente

### 2.2 Verificar Organização DockerHub

- Confirme que você tem acesso à organização `123atendi` no DockerHub
- Ou crie os repositórios manualmente:
  - `123atendi/clinica-agendamento-backend`
  - `123atendi/clinica-agendamento-frontend`

## Etapa 3: Configurar Secrets no GitHub

### 3.1 Adicionar Secrets

1. No GitHub, acesse seu repositório `clinica-agendamento`
2. Clique em **"Settings"** (aba superior)
3. No menu lateral esquerdo, clique em **"Secrets and variables"** → **"Actions"**
4. Clique no botão **"New repository secret"**

### 3.2 Criar Secret: DOCKERHUB_USERNAME

- **Name**: `DOCKERHUB_USERNAME`
- **Secret**: `123atendi` (ou seu usuário DockerHub)
- Clique em **"Add secret"**

### 3.3 Criar Secret: DOCKERHUB_TOKEN

- Clique em **"New repository secret"** novamente
- **Name**: `DOCKERHUB_TOKEN`
- **Secret**: Cole o token que você copiou do DockerHub
- Clique em **"Add secret"**

### 3.4 Verificar Secrets

Você deve ver ambos os secrets listados:
- ✅ DOCKERHUB_USERNAME
- ✅ DOCKERHUB_TOKEN

## Etapa 4: Testar GitHub Actions

### 4.1 Trigger do Build Automático

O workflow já está configurado para rodar automaticamente em push na branch `main`. Para testar:

```bash
# Fazer uma pequena alteração (exemplo)
echo "# Deploy configurado" >> .github/workflows/README.md

# Commit e push
git add .
git commit -m "docs: adicionar nota sobre deploy configurado"
git push origin main
```

### 4.2 Acompanhar o Build

1. No GitHub, vá para a aba **"Actions"**
2. Você verá um workflow rodando: "Build and Push Docker Images"
3. Clique nele para ver detalhes
4. Aguarde a conclusão (pode levar 5-10 minutos)

### 4.3 Verificar Status

Você deve ver:
- ✅ **build-backend** - Completed successfully
- ✅ **build-frontend** - Completed successfully

### 4.4 Verificar no DockerHub

1. Acesse https://hub.docker.com/
2. Vá em **Repositories**
3. Você deve ver:
   - `123atendi/clinica-agendamento-backend` com tag `latest` e tag do commit
   - `123atendi/clinica-agendamento-frontend` com tag `latest` e tag do commit

## Etapa 5: Deploy no Portainer

### 5.1 Acessar Portainer

1. Acesse seu Portainer (ex: `https://portainer.seuservidor.com`)
2. Faça login
3. Selecione seu **Swarm endpoint**

### 5.2 Criar Stack

1. No menu lateral, clique em **"Stacks"**
2. Clique no botão **"+ Add stack"**
3. Configure:
   - **Name**: `clinica-agendamento`
   - **Build method**: "Web editor"

### 5.3 Copiar Conteúdo do Stack

Copie todo o conteúdo do arquivo `portainer-stack.yml` e cole no editor do Portainer.

**Arquivo**: `C:\Users\carla\clinica-agendamento\portainer-stack.yml`

### 5.4 Configurar Variáveis de Ambiente

Role para baixo até a seção **"Environment variables"**.

Clique em **"+ Add an environment variable"** e adicione:

| Name | Value |
|------|-------|
| `JWT_SECRET` | (gere um secret forte - veja abaixo) |

**Gerar JWT_SECRET**:
```bash
# No terminal/PowerShell:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ou use um gerador online:
# https://www.random.org/strings/
```

Copie o valor gerado e cole no campo **Value**.

### 5.5 Deploy da Stack

1. Role até o final da página
2. Clique no botão **"Deploy the stack"**
3. Aguarde alguns segundos
4. Você será redirecionado para a lista de Stacks

### 5.6 Verificar Status

1. Clique na stack **"clinica-agendamento"**
2. Você verá 2 serviços:
   - `clinica-agendamento_backend` - Status: Running (1/1)
   - `clinica-agendamento_frontend` - Status: Running (1/1)

Se o status estiver diferente, veja a seção de **Troubleshooting** abaixo.

### 5.7 Verificar Logs

Para cada serviço:
1. Clique no serviço
2. Clique na aba **"Logs"**
3. Verifique se não há erros

**Backend - Logs esperados**:
```
Server running on port 3001
Database initialized successfully
```

**Frontend - Logs esperados**:
```
/docker-entrypoint.sh: Configuration complete; ready for start up
```

### 5.8 Testar Acesso

Abra o navegador e acesse:

- **Frontend**: https://clinica.123atendi.com.br
- **API Health**: https://clinica.123atendi.com.br/api

Você deve ver:
- ✅ Certificado SSL válido (Let's Encrypt)
- ✅ Interface de login da clínica
- ✅ API respondendo

## Etapa 6: Fluxo de Atualização

Agora que tudo está configurado, o fluxo de atualização é simples:

### 6.1 Fazer Alterações no Código

```bash
# Edite seus arquivos
# Exemplo: vim backend/routes/agenda.js

# Stage e commit
git add .
git commit -m "feat: adicionar validação de horários"

# Push para GitHub
git push origin main
```

### 6.2 Aguardar Build Automático

- O GitHub Actions detecta o push automaticamente
- Inicia o build das imagens Docker
- Faz push para o DockerHub

### 6.3 Atualizar Stack no Portainer

**Opção A: Atualização Manual via Portainer**

1. Acesse Portainer → Stacks → `clinica-agendamento`
2. Clique em **"Pull and redeploy"**
3. Confirme a ação
4. Aguarde a atualização (1-2 minutos)

**Opção B: Atualização via CLI (Docker Swarm)**

```bash
# Conectar ao servidor via SSH
ssh usuario@servidor.com

# Fazer pull das novas imagens
docker pull 123atendi/clinica-agendamento-backend:latest
docker pull 123atendi/clinica-agendamento-frontend:latest

# Atualizar serviços
docker service update --image 123atendi/clinica-agendamento-backend:latest clinica-agendamento_backend
docker service update --image 123atendi/clinica-agendamento-frontend:latest clinica-agendamento_frontend

# Verificar status
docker service ls | grep clinica
```

## Troubleshooting

### GitHub Actions: Build Falha

**Erro: "Error: Cannot connect to the Docker daemon"**
- Geralmente é um erro temporário da infraestrutura do GitHub
- Tente fazer push novamente ou execute manualmente a Action

**Erro: "denied: requested access to the resource is denied"**
- Verifique se `DOCKERHUB_USERNAME` está correto
- Confirme que `DOCKERHUB_TOKEN` é válido
- Teste login manual: `docker login -u 123atendi`

**Erro: "No such file or directory" ao buildar**
- Verifique os paths no `docker-build.yml`
- Confirme que `backend/Dockerfile` e `frontend/Dockerfile` existem

### Portainer: Serviços não iniciam

**Status: "No running tasks"**

1. Clique no serviço → Aba **"Logs"**
2. Veja o erro específico

Erros comuns:

**"network externa not found"**
```bash
# SSH no servidor
docker network create --driver=overlay externa
```

**"error pulling image"**
- Confirme que as imagens existem no DockerHub
- Verifique se o nome está correto: `123atendi/clinica-agendamento-backend`

**"no suitable node"**
- Verifique constraints no stack:
  ```yaml
  placement:
    constraints:
      - node.role == manager
  ```

### Erro de CORS no Frontend

**Console do navegador: "CORS policy: No 'Access-Control-Allow-Origin'"**

1. Verifique variável `CORS_ORIGIN` no backend (Portainer)
2. Deve estar: `https://clinica.123atendi.com.br` (SEM barra no final)
3. Atualize o serviço backend se necessário

### Traefik: SSL não funciona

**Erro: "Your connection is not private"**

1. Verifique se o DNS está correto:
   ```bash
   nslookup clinica.123atendi.com.br
   ```

2. Verifique logs do Traefik:
   ```bash
   docker service logs traefik | grep clinica
   docker service logs traefik | grep "acme"
   ```

3. Confirme que Traefik tem `certresolver` configurado

4. Aguarde alguns minutos (Let's Encrypt demora)

### Banco de dados perde dados após restart

**Problema: Volume não está persistindo**

1. Verifique no Portainer → Volumes
2. Deve existir: `clinica-agendamento_clinica-db`
3. Se não existir, verifique a seção `volumes:` no stack.yml

## Comandos Úteis

### Verificar Status dos Serviços

```bash
# Listar serviços
docker service ls | grep clinica

# Ver detalhes de um serviço
docker service ps clinica-agendamento_backend --no-trunc

# Ver logs em tempo real
docker service logs -f clinica-agendamento_backend
docker service logs -f clinica-agendamento_frontend
```

### Forçar Recriação de Container

```bash
# Forçar atualização do backend
docker service update --force clinica-agendamento_backend

# Forçar atualização do frontend
docker service update --force clinica-agendamento_frontend
```

### Escalar Serviços

```bash
# Aumentar réplicas do frontend
docker service scale clinica-agendamento_frontend=3

# Voltar para 1 réplica
docker service scale clinica-agendamento_frontend=1
```

### Remover Stack Completa

```bash
# Via CLI
docker stack rm clinica-agendamento

# Ou via Portainer:
# Stacks → clinica-agendamento → Delete
```

## Segurança em Produção

### Checklist de Segurança

- [ ] JWT_SECRET é forte e único (32+ caracteres aleatórios)
- [ ] Secrets do GitHub estão configurados como secrets (não em código)
- [ ] Token do DockerHub tem apenas permissões necessárias
- [ ] Repositório GitHub é privado (ou secrets protegidos)
- [ ] CORS_ORIGIN está restrito ao domínio correto
- [ ] Firewall configurado no servidor (apenas portas 80, 443)
- [ ] Backup regular do volume `clinica-db`

### Recomendações

1. **Rotação de Secrets**: Troque JWT_SECRET e DOCKERHUB_TOKEN a cada 90 dias
2. **Monitoramento**: Configure alertas no Portainer para falhas de serviço
3. **Backup**: Configure backup automático diário do volume do banco
4. **Logs**: Configure agregação de logs (ex: Grafana Loki)
5. **Updates**: Mantenha imagens Docker atualizadas

## Próximos Passos

Após configurar o deploy com sucesso:

1. Configure monitoramento (ex: Grafana + Prometheus)
2. Configure backup automático do banco de dados
3. Adicione testes automatizados ao CI/CD
4. Configure staging environment para testes
5. Implemente Blue-Green deployment para zero downtime

## Suporte

Problemas ou dúvidas:
- Consulte [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)
- Veja [README.md](./README.md)
- Abra uma issue no GitHub

---

**Documento criado em**: Outubro 2025
**Última atualização**: Outubro 2025
**Versão**: 1.0
