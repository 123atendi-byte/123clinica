# Guia de Início Rápido

## Opção 1: Rodar com Docker (Recomendado)

```bash
# 1. Entre na pasta do projeto
cd clinica-agendamento

# 2. Suba os containers
docker-compose up -d

# 3. Popular o banco com dados de exemplo
docker exec -it clinica-backend npm run seed

# 4. Acesse o sistema
# Frontend: http://localhost
# API: http://localhost:3001
```

Login:
- Usuário: `admin`
- Senha: `admin123`

## Opção 2: Rodar Localmente (Desenvolvimento)

### Terminal 1 - Backend
```bash
cd backend
npm install
npm run seed
npm start
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm start
```

Acesse: http://localhost:3000

## O que você terá

Após o seed, o sistema incluirá:
- 1 usuário admin
- 5 médicos (Cardiologia, Dermatologia, Ortopedia, Pediatria, Clínico Geral)
- 20 pacientes fictícios
- 15 consultas agendadas

## Funcionalidades

1. **Dashboard**: Visualize estatísticas e próximas consultas
2. **Pacientes**: Cadastre, edite e gerencie pacientes
3. **Agendamento**: Selecione data, médico e horário disponível
4. **Consultas**: Visualize e gerencie todas as consultas agendadas

## Estrutura de Pastas

```
clinica-agendamento/
├── backend/              # API Node.js + Express
│   ├── routes/          # Endpoints da API
│   ├── database.js      # Configuração SQLite
│   └── seed.js          # Dados fictícios
├── frontend/            # React App
│   ├── src/
│   │   ├── pages/      # Páginas da aplicação
│   │   └── services/   # Integração com API
│   └── public/
└── docker-compose.yml   # Orquestração Docker
```

## API Endpoints

- `POST /api/auth/login` - Login
- `GET /api/pacientes` - Listar pacientes
- `POST /api/pacientes` - Cadastrar paciente
- `GET /api/medicos` - Listar médicos
- `POST /api/medicos` - Cadastrar médico
- `GET /api/agenda/horarios-livres?medico_id=X&data=YYYY-MM-DD` - Horários disponíveis
- `POST /api/agenda` - Agendar consulta
- `GET /api/agenda` - Listar consultas

## Tecnologias

- **Backend**: Node.js, Express, SQLite, JWT
- **Frontend**: React, React Router, Axios, React Calendar
- **Deploy**: Docker, Docker Compose

## Próximos Passos

1. Para deploy em produção, consulte `DEPLOY.md`
2. Para documentação completa, consulte `README.md`
3. Personalize as cores em `frontend/src/index.css`
4. Altere o JWT_SECRET em produção

## Comandos Úteis

```bash
# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Rebuild após mudanças
docker-compose up -d --build

# Backup do banco
docker cp clinica-backend:/app/clinica.db ./backup.db
```

## Troubleshooting

### Porta já em uso
```bash
# Altere as portas em docker-compose.yml
ports:
  - "8080:80"    # Frontend
  - "3002:3001"  # Backend
```

### Erro de permissão
```bash
sudo chmod -R 755 clinica-agendamento
```

### Container não inicia
```bash
docker logs clinica-backend
docker logs clinica-frontend
```

## Suporte

Para mais informações:
- `README.md` - Documentação completa
- `DEPLOY.md` - Guia de deploy em VPS
- Logs: `docker-compose logs`
