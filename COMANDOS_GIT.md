# Comandos Git - Setup Inicial

Este arquivo contém todos os comandos necessários para configurar o repositório Git pela primeira vez.

## Passo 1: Inicializar Repositório Local

```bash
# Navegar para o diretório do projeto
cd C:\Users\carla\clinica-agendamento

# Inicializar repositório Git
git init

# Verificar status
git status
```

## Passo 2: Adicionar Arquivos ao Stage

```bash
# Adicionar todos os arquivos (respeitando .gitignore)
git add .

# Verificar o que será commitado
git status
```

## Passo 3: Criar Primeiro Commit

```bash
git commit -m "feat: configuração inicial do sistema de agendamento

- Backend Node.js com Express e SQLite
- Frontend React com interface responsiva
- Dockerfiles otimizados para produção
- GitHub Actions para CI/CD automático
- Stack pronta para Portainer com Traefik
- Documentação completa de deploy

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Passo 4: Conectar ao GitHub

**IMPORTANTE**: Substitua `SEU-USUARIO` pelo seu nome de usuário do GitHub!

```bash
# Adicionar remote do GitHub
git remote add origin https://github.com/SEU-USUARIO/clinica-agendamento.git

# Verificar remote configurado
git remote -v

# Renomear branch para main (se necessário)
git branch -M main
```

## Passo 5: Fazer Push para GitHub

```bash
# Push inicial
git push -u origin main
```

**Se pedir autenticação:**
- Usuário: seu usuário do GitHub
- Senha: use um Personal Access Token (não a senha da conta)
  - Gere em: https://github.com/settings/tokens

## Comandos para Atualizações Futuras

```bash
# Ver status
git status

# Adicionar arquivos modificados
git add .

# Commit com mensagem descritiva
git commit -m "feat: descrição da mudança"

# Push para GitHub
git push origin main
```

## Exemplos de Mensagens de Commit

Use o padrão Conventional Commits:

```bash
# Nova funcionalidade
git commit -m "feat: adicionar validação de CPF"

# Correção de bug
git commit -m "fix: corrigir erro no cálculo de horários"

# Documentação
git commit -m "docs: atualizar README com instruções de backup"

# Estilização
git commit -m "style: ajustar cores do tema"

# Refatoração
git commit -m "refactor: reorganizar estrutura de rotas"

# Performance
git commit -m "perf: otimizar query de listagem de consultas"

# Testes
git commit -m "test: adicionar testes para API de agendamentos"

# Configuração
git commit -m "chore: atualizar dependências"
```

## Verificar Logs do Git

```bash
# Ver histórico de commits
git log

# Ver histórico resumido
git log --oneline

# Ver últimos 5 commits
git log -5

# Ver diferenças do último commit
git show
```

## Desfazer Mudanças

```bash
# Desfazer mudanças em arquivo não commitado
git checkout -- arquivo.js

# Remover arquivo do stage
git reset HEAD arquivo.js

# Desfazer último commit (mantém alterações)
git reset --soft HEAD~1

# Desfazer último commit (descarta alterações) - CUIDADO!
git reset --hard HEAD~1
```

## Trabalhar com Branches

```bash
# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Listar branches
git branch

# Mudar de branch
git checkout main

# Fazer merge de branch
git checkout main
git merge feature/nova-funcionalidade

# Deletar branch
git branch -d feature/nova-funcionalidade
```

## Sincronizar com GitHub

```bash
# Baixar mudanças do GitHub
git pull origin main

# Ver diferenças antes de pull
git fetch origin
git diff origin/main

# Forçar sobrescrita local (CUIDADO!)
git fetch origin
git reset --hard origin/main
```

## Resolver Conflitos

Se houver conflitos ao fazer pull:

```bash
# 1. Git mostrará os arquivos em conflito
git status

# 2. Abrir arquivos e resolver manualmente
# Procure por marcadores: <<<<<<<, =======, >>>>>>>

# 3. Adicionar arquivos resolvidos
git add arquivo-resolvido.js

# 4. Finalizar merge
git commit -m "merge: resolver conflitos"

# 5. Push
git push origin main
```

## Ignorar Arquivos

O arquivo `.gitignore` já está configurado. Para adicionar mais padrões:

```bash
# Editar .gitignore
echo "arquivo-secreto.txt" >> .gitignore

# Remover arquivo do Git mas manter localmente
git rm --cached arquivo.txt
git commit -m "chore: remover arquivo do controle de versão"
```

## Verificar Configuração

```bash
# Ver configuração do Git
git config --list

# Configurar nome e email (se necessário)
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# Ver remote configurado
git remote -v
```

## Troubleshooting

### Erro: "fatal: not a git repository"
```bash
# Você não está no diretório correto
cd C:\Users\carla\clinica-agendamento
git init
```

### Erro: "Permission denied (publickey)"
```bash
# Use HTTPS ao invés de SSH
git remote set-url origin https://github.com/SEU-USUARIO/clinica-agendamento.git
```

### Erro: "Updates were rejected"
```bash
# Primeiro faça pull, depois push
git pull origin main --rebase
git push origin main
```

### Erro: "Please commit your changes or stash them"
```bash
# Opção 1: Commit as mudanças
git add .
git commit -m "wip: trabalho em progresso"

# Opção 2: Stash (guardar temporariamente)
git stash
git pull origin main
git stash pop
```

## Atalhos Úteis

```bash
# Status resumido
git status -s

# Add e commit em um comando (apenas para arquivos já trackeados)
git commit -am "mensagem"

# Ver branches remotas
git branch -r

# Ver todas as branches (locais e remotas)
git branch -a

# Criar branch e fazer checkout
git checkout -b nova-branch

# Ver diferenças
git diff
git diff --staged
git diff HEAD~1
```

## Referências Rápidas

- **Status**: `git status`
- **Adicionar**: `git add .`
- **Commit**: `git commit -m "mensagem"`
- **Push**: `git push origin main`
- **Pull**: `git pull origin main`
- **Log**: `git log --oneline`

---

**Dica**: Sempre faça `git status` antes e depois de cada comando para entender o que está acontecendo!
