# Checklist de Setup - Deploy GitHub → DockerHub → Portainer

Use este checklist para configurar o deploy automatizado do Sistema de Agendamento da Clínica.

## Pré-requisitos

- [ ] Node.js 18+ instalado localmente
- [ ] Git instalado e configurado
- [ ] Conta no GitHub (github.com)
- [ ] Conta no DockerHub (hub.docker.com)
- [ ] Acesso ao servidor com Docker Swarm
- [ ] Portainer instalado e acessível
- [ ] Traefik configurado no Swarm
- [ ] DNS configurado (clinica.123atendi.com.br → IP do servidor)

## Fase 1: Preparação Local

### 1.1 Verificar Estrutura do Projeto

- [ ] Pasta `backend/` existe com Dockerfile
- [ ] Pasta `frontend/` existe com Dockerfile
- [ ] Arquivo `.github/workflows/docker-build.yml` criado
- [ ] Arquivo `portainer-stack.yml` criado
- [ ] Arquivo `.gitignore` está completo
- [ ] Arquivo `README.md` atualizado

### 1.2 Testar Localmente (Opcional mas Recomendado)

```bash
# Backend
cd backend
npm install
npm start
# Deve iniciar em http://localhost:3001

# Frontend (novo terminal)
cd frontend
npm install
npm start
# Deve iniciar em http://localhost:3000
```

- [ ] Backend inicia sem erros
- [ ] Frontend inicia e conecta ao backend
- [ ] Login funciona (admin/admin123)

## Fase 2: Configurar GitHub

### 2.1 Criar Repositório

- [ ] Acessar https://github.com/new
- [ ] Nome: `clinica-agendamento`
- [ ] Visibilidade: Private (recomendado)
- [ ] NÃO inicializar com README
- [ ] Clicar em "Create repository"

### 2.2 Conectar Repositório Local

```bash
cd C:\Users\carla\clinica-agendamento

# Inicializar (se necessário)
git init

# Adicionar arquivos
git add .

# Primeiro commit
git commit -m "feat: configuração inicial do sistema

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Adicionar remote (SUBSTITUIR SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/clinica-agendamento.git

# Push
git branch -M main
git push -u origin main
```

- [ ] Comando `git init` executado
- [ ] Comando `git add .` executado
- [ ] Comando `git commit` executado
- [ ] Comando `git remote add origin` executado (com URL correta)
- [ ] Comando `git push` executado com sucesso
- [ ] Código visível no GitHub

## Fase 3: Configurar DockerHub

### 3.1 Criar Token de Acesso

- [ ] Acessar https://hub.docker.com/
- [ ] Login realizado
- [ ] Ir em: Avatar → Account Settings → Security
- [ ] Clicar em "New Access Token"
- [ ] Nome: `GitHub Actions - Clinica Agendamento`
- [ ] Permissões: Read, Write, Delete
- [ ] Clicar em "Generate"
- [ ] **TOKEN COPIADO E SALVO** (não será mostrado novamente!)

### 3.2 Verificar Organização/Repositórios

- [ ] Acesso à organização `123atendi` confirmado
- [ ] OU repositórios criados manualmente:
  - [ ] `123atendi/clinica-agendamento-backend`
  - [ ] `123atendi/clinica-agendamento-frontend`

## Fase 4: Configurar Secrets no GitHub

### 4.1 Acessar Settings do Repositório

- [ ] Abrir repositório no GitHub
- [ ] Clicar em "Settings" (aba superior)
- [ ] Menu lateral: "Secrets and variables" → "Actions"

### 4.2 Adicionar DOCKERHUB_USERNAME

- [ ] Clicar em "New repository secret"
- [ ] Name: `DOCKERHUB_USERNAME`
- [ ] Secret: `123atendi` (ou seu usuário)
- [ ] Clicar em "Add secret"
- [ ] Secret aparece na lista ✓

### 4.3 Adicionar DOCKERHUB_TOKEN

- [ ] Clicar em "New repository secret"
- [ ] Name: `DOCKERHUB_TOKEN`
- [ ] Secret: (colar token copiado do DockerHub)
- [ ] Clicar em "Add secret"
- [ ] Secret aparece na lista ✓

### 4.4 Verificação Final

- [ ] Ambos secrets visíveis na lista:
  - ✅ DOCKERHUB_USERNAME
  - ✅ DOCKERHUB_TOKEN

## Fase 5: Testar GitHub Actions

### 5.1 Trigger do Build

```bash
# Fazer uma alteração simples
echo "# Deploy configurado com sucesso" >> NOTES.md

# Commit e push
git add .
git commit -m "docs: adicionar notas sobre deploy"
git push origin main
```

- [ ] Arquivo alterado localmente
- [ ] Commit criado
- [ ] Push para GitHub executado

### 5.2 Acompanhar Build

- [ ] Acessar repositório no GitHub
- [ ] Clicar na aba "Actions"
- [ ] Workflow "Build and Push Docker Images" aparece
- [ ] Clicar no workflow para ver detalhes

### 5.3 Aguardar Conclusão

- [ ] Job "build-backend" iniciou
- [ ] Job "build-frontend" iniciou
- [ ] Job "build-backend" concluído com sucesso ✅
- [ ] Job "build-frontend" concluído com sucesso ✅

**Tempo estimado**: 5-10 minutos

### 5.4 Verificar DockerHub

- [ ] Acessar https://hub.docker.com/
- [ ] Ir em "Repositories"
- [ ] Repositório `123atendi/clinica-agendamento-backend` existe
  - [ ] Tag `latest` presente
  - [ ] Tag do commit (SHA) presente
- [ ] Repositório `123atendi/clinica-agendamento-frontend` existe
  - [ ] Tag `latest` presente
  - [ ] Tag do commit (SHA) presente

## Fase 6: Preparar Produção

### 6.1 Gerar JWT Secret

Executar um dos comandos:

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# PowerShell
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# OU usar: https://www.random.org/strings/
```

- [ ] JWT_SECRET gerado
- [ ] JWT_SECRET salvo temporariamente

### 6.2 Verificar Infraestrutura

**No servidor (via SSH ou Portainer terminal):**

```bash
# Verificar Docker Swarm
docker node ls
# Deve mostrar pelo menos 1 manager

# Verificar rede externa
docker network ls | grep externa
# Deve existir

# Verificar Traefik
docker service ls | grep traefik
# Deve estar rodando
```

- [ ] Docker Swarm ativo
- [ ] Rede `externa` existe
- [ ] Traefik rodando

## Fase 7: Deploy no Portainer

### 7.1 Acessar Portainer

- [ ] URL do Portainer acessível (ex: https://portainer.seuservidor.com)
- [ ] Login realizado
- [ ] Swarm endpoint selecionado

### 7.2 Criar Stack

- [ ] Menu lateral: Clicar em "Stacks"
- [ ] Clicar em "+ Add stack"
- [ ] Name: `clinica-agendamento`
- [ ] Build method: "Web editor"

### 7.3 Copiar Stack YAML

- [ ] Abrir arquivo `portainer-stack.yml` localmente
- [ ] Copiar TODO o conteúdo
- [ ] Colar no editor do Portainer

### 7.4 Configurar Variáveis

- [ ] Rolar para baixo até "Environment variables"
- [ ] Clicar em "+ Add an environment variable"
- [ ] Name: `JWT_SECRET`
- [ ] Value: (colar JWT_SECRET gerado anteriormente)

### 7.5 Deploy

- [ ] Rolar até o final da página
- [ ] Clicar em "Deploy the stack"
- [ ] Aguardar mensagem de sucesso
- [ ] Redirecionado para lista de Stacks

## Fase 8: Verificação do Deploy

### 8.1 Verificar Status dos Serviços

- [ ] Clicar na stack `clinica-agendamento`
- [ ] Serviços listados:
  - [ ] `clinica-agendamento_backend` - Status: Running (1/1)
  - [ ] `clinica-agendamento_frontend` - Status: Running (1/1)

**Se status diferente, ver seção Troubleshooting**

### 8.2 Verificar Logs

**Backend:**
- [ ] Clicar em `clinica-agendamento_backend`
- [ ] Aba "Logs"
- [ ] Ver logs sem erros graves
- [ ] Mensagens esperadas:
  - "Server running on port 3001"
  - "Database initialized"

**Frontend:**
- [ ] Clicar em `clinica-agendamento_frontend`
- [ ] Aba "Logs"
- [ ] Ver logs do Nginx
- [ ] Mensagem esperada:
  - "ready for start up"

### 8.3 Testar Acesso Web

- [ ] Abrir navegador
- [ ] Acessar: https://clinica.123atendi.com.br
- [ ] Certificado SSL válido (cadeado verde) ✅
- [ ] Página de login carrega
- [ ] Testar login (admin/admin123)
- [ ] Login funciona ✅

### 8.4 Testar API

- [ ] Abrir: https://clinica.123atendi.com.br/api
- [ ] OU testar endpoint específico:
  ```bash
  curl https://clinica.123atendi.com.br/api/medicos
  ```
- [ ] API responde (mesmo que com erro 401 de auth)

## Fase 9: Teste do Fluxo Completo

### 9.1 Fazer Alteração no Código

```bash
# Exemplo: editar README
echo "## Deploy configurado com sucesso!" >> README.md

git add README.md
git commit -m "docs: confirmar deploy funcionando"
git push origin main
```

- [ ] Alteração feita
- [ ] Commit criado
- [ ] Push executado

### 9.2 Verificar Build Automático

- [ ] GitHub Actions iniciou automaticamente
- [ ] Build concluído com sucesso
- [ ] Imagens atualizadas no DockerHub

### 9.3 Atualizar no Portainer

**Opção A: Via Interface**
- [ ] Portainer → Stacks → clinica-agendamento
- [ ] Clicar em "Pull and redeploy"
- [ ] Confirmar ação
- [ ] Aguardar atualização (1-2 min)

**Opção B: Via CLI**
```bash
docker service update --image 123atendi/clinica-agendamento-backend:latest clinica-agendamento_backend
docker service update --image 123atendi/clinica-agendamento-frontend:latest clinica-agendamento_frontend
```

- [ ] Serviços atualizados
- [ ] Status: Running (1/1)

### 9.4 Verificar Mudança Aplicada

- [ ] Acessar https://clinica.123atendi.com.br
- [ ] Mudança refletida (se aplicável)

## Fase 10: Segurança e Backup

### 10.1 Checklist de Segurança

- [ ] JWT_SECRET é forte (32+ caracteres)
- [ ] Secrets do GitHub configurados (não no código)
- [ ] Token DockerHub tem permissões mínimas
- [ ] Repositório GitHub é privado
- [ ] CORS_ORIGIN configurado corretamente
- [ ] Firewall do servidor configurado (portas 80, 443 apenas)

### 10.2 Configurar Backup

- [ ] Volume `clinica-db` identificado no Portainer
- [ ] Script de backup configurado:
  ```bash
  # Exemplo de backup
  docker run --rm -v clinica-agendamento_clinica-db:/data \
    -v /backup:/backup alpine \
    tar czf /backup/clinica-db-$(date +%Y%m%d).tar.gz /data
  ```
- [ ] Cron job ou schedule configurado

### 10.3 Documentação

- [ ] README.md revisado
- [ ] DEPLOY_GITHUB_PORTAINER.md consultado
- [ ] Credenciais documentadas em local seguro
- [ ] Procedimentos de emergência definidos

## Troubleshooting Rápido

### GitHub Actions falha

- [ ] Verificar secrets configurados
- [ ] Ver logs detalhados na aba Actions
- [ ] Confirmar Dockerfiles corretos

### Portainer não inicia serviços

- [ ] Ver logs do serviço
- [ ] Verificar se rede `externa` existe
- [ ] Confirmar imagens no DockerHub

### Erro de SSL

- [ ] Verificar DNS: `nslookup clinica.123atendi.com.br`
- [ ] Ver logs do Traefik
- [ ] Aguardar alguns minutos (Let's Encrypt demora)

### Erro de CORS

- [ ] Verificar `CORS_ORIGIN` no env do backend
- [ ] Deve ser: `https://clinica.123atendi.com.br`
- [ ] Atualizar serviço backend se necessário

## Conclusão

- [ ] ✅ GitHub Actions configurado
- [ ] ✅ DockerHub recebendo imagens
- [ ] ✅ Portainer fazendo deploy
- [ ] ✅ Site acessível com SSL
- [ ] ✅ API funcionando
- [ ] ✅ Fluxo completo testado

**PARABÉNS! Deploy automatizado configurado com sucesso!**

## Próximos Passos

- [ ] Configurar monitoramento (Grafana, Prometheus)
- [ ] Implementar testes automatizados
- [ ] Configurar ambiente de staging
- [ ] Documentar processos internos
- [ ] Treinar equipe no fluxo de deploy

---

**Documento criado**: Outubro 2025
**Última revisão**: Outubro 2025
**Versão**: 1.0

Para dúvidas, consulte: [DEPLOY_GITHUB_PORTAINER.md](./DEPLOY_GITHUB_PORTAINER.md)
