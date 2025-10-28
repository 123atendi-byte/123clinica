# Início Rápido - Setup em 15 Minutos

Este guia permite configurar todo o deploy em aproximadamente 15 minutos.

## Pré-requisitos

- [ ] Conta GitHub criada
- [ ] Conta DockerHub criada
- [ ] Git instalado localmente

## Passo 1: Criar Repositório no GitHub (2 min)

1. Acesse: https://github.com/new
2. Repository name: `clinica-agendamento`
3. Visibility: Private
4. **NÃO** marque "Add a README"
5. Clique "Create repository"
6. **Copie a URL** do repositório (aparecerá na tela)

## Passo 2: Configurar DockerHub (3 min)

1. Acesse: https://hub.docker.com/settings/security
2. Clique "New Access Token"
3. Description: `GitHub Actions - Clinica`
4. Permissions: Read, Write, Delete
5. Clique "Generate"
6. **COPIE O TOKEN** e salve temporariamente

## Passo 3: Configurar Secrets no GitHub (2 min)

1. No GitHub, vá em: `Settings > Secrets and variables > Actions`
2. Clique "New repository secret"
3. Adicione:
   - Name: `DOCKERHUB_USERNAME`
   - Value: `123atendi`
   - Clique "Add secret"
4. Clique "New repository secret" novamente
5. Adicione:
   - Name: `DOCKERHUB_TOKEN`
   - Value: (cole o token copiado)
   - Clique "Add secret"

## Passo 4: Fazer Push para GitHub (3 min)

Abra terminal/PowerShell no diretório do projeto:

```bash
# Navegar para o projeto
cd C:\Users\carla\clinica-agendamento

# Inicializar Git (se necessário)
git init

# Adicionar todos os arquivos
git add .

# Criar primeiro commit
git commit -m "feat: configuração inicial do sistema de agendamento

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Adicionar remote (SUBSTITUIR pela URL copiada no Passo 1)
git remote add origin https://github.com/SEU-USUARIO/clinica-agendamento.git

# Renomear branch para main
git branch -M main

# Push para GitHub
git push -u origin main
```

**Se pedir senha:**
- Use Personal Access Token (não a senha da conta)
- Gere em: https://github.com/settings/tokens

## Passo 5: Aguardar Build (5-10 min)

1. No GitHub, vá em aba "Actions"
2. Veja workflow "Build and Push Docker Images" rodando
3. Aguarde conclusão (ambos jobs devem ficar verdes ✅)

## Passo 6: Verificar DockerHub (1 min)

1. Acesse: https://hub.docker.com/repositories
2. Confirme que existem:
   - `123atendi/clinica-agendamento-backend`
   - `123atendi/clinica-agendamento-frontend`

## Passo 7: Deploy no Portainer (5 min)

### 7.1 Gerar JWT Secret

Execute no terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
**COPIE O RESULTADO** (será usado no Portainer)

### 7.2 Criar Stack no Portainer

1. Acesse seu Portainer
2. Menu lateral → Stacks
3. Clique "+ Add stack"
4. Configure:
   - Name: `clinica-agendamento`
   - Build method: Web editor
5. Abra o arquivo `portainer-stack.yml` localmente
6. Copie TODO o conteúdo
7. Cole no editor do Portainer
8. Em "Environment variables":
   - Clique "+ Add environment variable"
   - Name: `JWT_SECRET`
   - Value: (cole o secret gerado acima)
9. Role até o final
10. Clique "Deploy the stack"

### 7.3 Verificar Deploy

1. Stack → clinica-agendamento
2. Deve mostrar:
   - `backend` - Running (1/1) ✅
   - `frontend` - Running (1/1) ✅

Se não estiver rodando, clique no serviço e veja os logs.

## Passo 8: Testar Acesso (1 min)

Abra o navegador:
- Frontend: https://clinica.123atendi.com.br
- API: https://clinica.123atendi.com.br/api

Deve ter:
- ✅ Certificado SSL válido
- ✅ Página de login carregando
- ✅ Login funciona (admin/admin123)

## Troubleshooting Rápido

### GitHub Actions falha

**Erro de autenticação no DockerHub:**
```
Verifique:
1. Secret DOCKERHUB_USERNAME = 123atendi
2. Secret DOCKERHUB_TOKEN está correto
3. Token tem permissão de Write
```

**Erro "No such file or directory":**
```
Confirme que os Dockerfiles existem:
- backend/Dockerfile
- frontend/Dockerfile
```

### Portainer não inicia serviços

**"network externa not found":**
```bash
# SSH no servidor
docker network create --driver=overlay externa
```

**Erro ao puxar imagem:**
```
Aguarde GitHub Actions terminar
Verifique que imagens estão no DockerHub
```

**Serviço reiniciando constantemente:**
```
1. Clique no serviço
2. Aba "Logs"
3. Veja o erro específico
```

### Site não abre

**DNS não resolve:**
```bash
# Verificar DNS
nslookup clinica.123atendi.com.br

# Deve retornar o IP do servidor
```

**Certificado SSL inválido:**
```
Aguarde 2-5 minutos
Let's Encrypt demora para emitir
Verifique logs do Traefik
```

**Erro de CORS:**
```
No Portainer, edite a stack:
- CORS_ORIGIN deve ser: https://clinica.123atendi.com.br
- SEM barra no final
- Salve e redeploy
```

## Comandos de Verificação

```bash
# Ver status dos serviços
docker service ls | grep clinica

# Ver logs do backend
docker service logs -f clinica-agendamento_backend

# Ver logs do frontend
docker service logs -f clinica-agendamento_frontend

# Verificar rede
docker network ls | grep externa

# Forçar atualização
docker service update --force clinica-agendamento_backend
docker service update --force clinica-agendamento_frontend
```

## Fluxo de Atualização

Para atualizar o código depois de tudo configurado:

```bash
# 1. Editar código
vim backend/routes/agenda.js

# 2. Commit
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# 3. Aguardar GitHub Actions (5-10 min)

# 4. Atualizar no Portainer
# Via interface: Stacks → Pull and redeploy
# OU via CLI:
docker service update --image 123atendi/clinica-agendamento-backend:latest clinica-agendamento_backend
docker service update --image 123atendi/clinica-agendamento-frontend:latest clinica-agendamento_frontend
```

## Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Secrets configurados (DOCKERHUB_USERNAME e DOCKERHUB_TOKEN)
- [ ] Código enviado para GitHub (git push)
- [ ] GitHub Actions concluído com sucesso
- [ ] Imagens visíveis no DockerHub
- [ ] JWT_SECRET gerado
- [ ] Stack criada no Portainer
- [ ] Serviços rodando (backend e frontend)
- [ ] Site acessível com SSL
- [ ] Login funciona

## Próximos Passos

Após setup completo:
1. Configure backup do banco de dados
2. Configure monitoramento (opcional)
3. Treine equipe no fluxo de atualização
4. Documente procedimentos internos

## Documentação Completa

Para detalhes, consulte:
- [DEPLOY_GITHUB_PORTAINER.md](./DEPLOY_GITHUB_PORTAINER.md) - Guia detalhado
- [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) - Checklist completo
- [COMANDOS_GIT.md](./COMANDOS_GIT.md) - Referência Git
- [README.md](./README.md) - Documentação do projeto

## Suporte

Problemas? Consulte a seção de Troubleshooting em:
- [DEPLOY_GITHUB_PORTAINER.md](./DEPLOY_GITHUB_PORTAINER.md)

---

**Tempo total estimado:** 15-20 minutos
**Última atualização:** Outubro 2025
