# Sistema de Agendamento para Clínicas

![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?logo=github-actions&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Traefik](https://img.shields.io/badge/Traefik-Reverse_Proxy-24A1C1?logo=traefik-proxy&logoColor=white)
![Portainer](https://img.shields.io/badge/Portainer-Stack-13BEF9?logo=portainer&logoColor=white)

Sistema completo de agendamento online para clínicas médicas com interface moderna e API RESTful.

## Características

- **Frontend React**: Interface responsiva e intuitiva para pacientes e administradores
- **Backend Node.js**: API RESTful robusta com autenticação JWT
- **Banco SQLite**: Persistência de dados leve e confiável
- **Docker**: Containerização completa para fácil deployment
- **CI/CD Automatizado**: GitHub Actions com build e push automático para DockerHub
- **Deploy via Portainer**: Stack pronta para produção com Traefik
- **HTTPS Automático**: Certificados SSL via Let's Encrypt (Traefik)

## Stack Tecnológico

### Backend
- Node.js 18 (Alpine)
- Express.js
- SQLite3
- JWT para autenticação
- CORS configurado

### Frontend
- React 18
- React Router
- Axios
- React Calendar
- Nginx (produção)

### Infraestrutura
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- DockerHub (registry)
- Portainer (orchestration)
- Traefik (reverse proxy)
- Let's Encrypt (SSL/TLS)

## Acesso em Produção

- **URL**: https://clinica.123atendi.com.br
- **API**: https://clinica.123atendi.com.br/api

## Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Git

### Instalação

```bash
# Clone o repositório
git clone https://github.com/SEU-USUARIO/clinica-agendamento.git
cd clinica-agendamento

# Backend
cd backend
npm install
cp .env.example .env
# Edite o .env conforme necessário
npm run seed    # Popular banco com dados fictícios
npm start

# Frontend (em outro terminal)
cd frontend
npm install
npm start
```

### Variáveis de Ambiente

#### Backend (.env)
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=seu-secret-super-seguro-aqui
CORS_ORIGIN=http://localhost:3000
```

#### Frontend
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### Credenciais Padrão
- **Usuário**: admin
- **Senha**: admin123

## Deploy com Docker

### Build Local

```bash
# Build das imagens
docker compose build

# Iniciar containers
docker compose up -d

# Verificar logs
docker compose logs -f
```

### Deploy Automatizado (GitHub Actions + DockerHub + Portainer)

O projeto está configurado para deploy automático seguindo este fluxo:

1. **Commit & Push** para branch `main`
2. **GitHub Actions** builda automaticamente as imagens
3. **DockerHub** recebe as imagens atualizadas
4. **Portainer** pode fazer pull das imagens e atualizar a stack

Veja documentação completa em [DEPLOY_GITHUB_PORTAINER.md](./DEPLOY_GITHUB_PORTAINER.md)

## Estrutura do Projeto

```
clinica-agendamento/
├── backend/                    # API Node.js
│   ├── routes/                # Rotas da API
│   ├── database.js            # Configuração do banco
│   ├── server.js              # Entry point
│   ├── Dockerfile             # Build do backend
│   └── package.json
├── frontend/                  # App React
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── pages/            # Páginas
│   │   └── services/         # Serviços (API calls)
│   ├── Dockerfile            # Build do frontend
│   ├── nginx.conf            # Config Nginx
│   └── package.json
├── .github/
│   └── workflows/
│       └── docker-build.yml  # CI/CD Pipeline
├── docker-compose.yml        # Desenvolvimento local
├── portainer-stack.yml       # Deploy produção (Portainer)
├── DEPLOY_GITHUB_PORTAINER.md # Doc completa de deploy
└── SETUP_CHECKLIST.md        # Checklist de configuração
```

## Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login

### Pacientes
- `GET /api/pacientes` - Listar pacientes
- `POST /api/pacientes` - Cadastrar paciente
- `PUT /api/pacientes/:id` - Atualizar paciente
- `DELETE /api/pacientes/:id` - Deletar paciente

### Médicos
- `GET /api/medicos` - Listar médicos
- `POST /api/medicos` - Cadastrar médico
- `PUT /api/medicos/:id` - Atualizar médico
- `DELETE /api/medicos/:id` - Deletar médico

### Agenda
- `GET /api/agenda/horarios-livres` - Horários disponíveis
- `GET /api/agenda` - Listar consultas
- `POST /api/agenda` - Agendar consulta
- `PUT /api/agenda/:id` - Atualizar consulta
- `DELETE /api/agenda/:id` - Cancelar consulta

Documentação completa da API disponível em: [Clinica_API.postman_collection.json](./Clinica_API.postman_collection.json)

## Configuração para Produção

### Secrets Necessários no GitHub

Configure em: `Settings > Secrets and variables > Actions`

- `DOCKERHUB_USERNAME`: Usuário do DockerHub
- `DOCKERHUB_TOKEN`: Token de acesso do DockerHub

### Variáveis no Portainer

Ao fazer deploy da stack no Portainer, configure:

- `JWT_SECRET`: Secret forte para tokens JWT (gere com `openssl rand -hex 32`)

## Documentação Adicional

- [DEPLOY_GITHUB_PORTAINER.md](./DEPLOY_GITHUB_PORTAINER.md) - Guia completo de deploy
- [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) - Checklist de configuração
- [ARQUITETURA.md](./ARQUITETURA.md) - Arquitetura detalhada
- [CHANGELOG.md](./CHANGELOG.md) - Histórico de mudanças

## Troubleshooting

### Build falha no GitHub Actions
- Verifique se os secrets estão configurados
- Confirme que os Dockerfiles estão corretos
- Veja os logs detalhados na aba Actions

### Container não inicia no Portainer
- Verifique se a rede `externa` existe
- Confirme as variáveis de ambiente
- Veja os logs do container no Portainer

### Erro de CORS
- Verifique `CORS_ORIGIN` no backend
- Confirme labels do Traefik no `portainer-stack.yml`

## Suporte

Para problemas ou dúvidas:
- Abra uma issue no GitHub
- Verifique a documentação em [/docs](./docs)

## Licença

Propriedade de 123atendi - Todos os direitos reservados

---

**Desenvolvido por 123atendi**

Última atualização: Outubro 2025
