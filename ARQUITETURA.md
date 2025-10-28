# Arquitetura do Sistema - Clínica Agendamento

## 📐 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                │
│                            ↓                                     │
│                  clinica.123atendi.com.br                       │
└─────────────────────────────────────────────────────────────────┘
                             ↓
                             ↓ (HTTPS - Port 443)
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      TRAEFIK (Reverse Proxy)                    │
│                   - SSL Automático (Let's Encrypt)              │
│                   - Load Balancer                               │
│                   - Service Discovery                           │
└─────────────────────────────────────────────────────────────────┘
                             ↓
                   ┌─────────┴─────────┐
                   ↓                   ↓
       ┌───────────────────┐  ┌──────────────────┐
       │   Route: /        │  │  Route: /api     │
       │   Priority: 1     │  │  Priority: 10    │
       └───────────────────┘  └──────────────────┘
                   ↓                   ↓
                   ↓                   ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│   FRONTEND CONTAINER     │  │   BACKEND CONTAINER      │
│   (React + Nginx)        │  │   (Node.js + Express)    │
│                          │  │                          │
│   - Porta: 80           │  │   - Porta: 3001          │
│   - nginx:alpine        │  │   - node:18-alpine       │
│   - Serve static files  │  │   - REST API             │
│   - SPA routing         │  │   - JWT Auth             │
│   - Gzip compression    │  │   - CORS enabled         │
│                          │  │                          │
│   Health: /health       │  │   Health: /              │
└──────────────────────────┘  └──────────────────────────┘
                                        ↓
                                        ↓
                              ┌──────────────────┐
                              │  SQLITE DATABASE │
                              │                  │
                              │  Volume:         │
                              │  clinica-db      │
                              │                  │
                              │  - Persistent    │
                              │  - Backup ready  │
                              └──────────────────┘
```

## 🔀 Fluxo de Requisições

### 1. Acesso ao Frontend (/)

```
Usuário → https://clinica.123atendi.com.br
    ↓
Traefik (verifica certificado SSL)
    ↓
[Rule: Host(clinica.123atendi.com.br) - Priority: 1]
    ↓
Frontend Container (nginx:80)
    ↓
Serve: /usr/share/nginx/html/index.html
    ↓
Browser carrega React App
```

### 2. Chamada à API (/api)

```
React App → https://clinica.123atendi.com.br/api/pacientes
    ↓
Traefik (verifica certificado SSL)
    ↓
[Rule: Host(clinica.123atendi.com.br) && PathPrefix(/api) - Priority: 10]
    ↓
Backend Container (node:3001)
    ↓
Express Router → /api/pacientes
    ↓
SQLite Query
    ↓
JSON Response → Frontend
```

### 3. Comunicação Interna Frontend → Backend

```
Frontend nginx.conf:
  location /api {
    proxy_pass http://backend:3001;
  }
    ↓
Rede: clinica-internal (overlay)
    ↓
Backend Container
```

## 🌐 Configuração de Redes

### Rede: `externa` (overlay, external)
- **Propósito**: Comunicação com Traefik
- **Conectados**: Frontend, Backend, Traefik
- **Driver**: overlay (Docker Swarm)
- **Escopo**: Global no Swarm

### Rede: `clinica-internal` (overlay, internal)
- **Propósito**: Comunicação segura entre Frontend e Backend
- **Conectados**: Frontend, Backend
- **Driver**: overlay (Docker Swarm)
- **Escopo**: Interno da stack (sem acesso externo)
- **Isolamento**: Backend não é acessível externamente, apenas via Traefik

## 🔐 Camadas de Segurança

```
1. INTERNET
   └─> Firewall (UFW)
       - Apenas portas 22, 80, 443 abertas
       └─> Traefik (porta 443)
           - SSL/TLS (Let's Encrypt)
           - Certificate validation
           └─> Rede Externa (overlay)
               - Frontend container
               - Backend container
                   └─> Rede Interna (overlay, isolated)
                       - Comunicação backend ↔ frontend
                       └─> SQLite Volume
                           - Persistência isolada
```

### Checklist de Segurança:

✅ **Camada 1: Network**
- Firewall habilitado (UFW)
- Apenas portas essenciais abertas

✅ **Camada 2: Transport**
- HTTPS obrigatório (Let's Encrypt)
- TLS 1.2+ apenas

✅ **Camada 3: Application**
- CORS restrito ao domínio específico
- JWT para autenticação
- Headers de segurança (nginx)

✅ **Camada 4: Data**
- SQLite em volume persistente
- Backups automáticos (cron)
- Sem acesso direto externo ao DB

## 🏗️ Docker Swarm Stack

```
STACK: clinica
├── SERVICE: clinica_backend
│   ├── Replicas: 1
│   ├── Image: 123atendi/clinica-agendamento-backend:latest
│   ├── Networks: [externa, clinica-internal]
│   ├── Volumes: [clinica-db:/app/data]
│   └── Labels: [Traefik rules]
│
└── SERVICE: clinica_frontend
    ├── Replicas: 1
    ├── Image: 123atendi/clinica-agendamento-frontend:latest
    ├── Networks: [externa, clinica-internal]
    ├── Depends_on: [backend]
    └── Labels: [Traefik rules]

NETWORKS:
├── externa (external, overlay)
│   └── Conecta: Traefik ↔ Services
└── clinica-internal (overlay, internal)
    └── Conecta: Frontend ↔ Backend

VOLUMES:
└── clinica-db (local)
    └── Monta: /app/data (SQLite)
```

## 🔄 Escalabilidade

### Scaling Horizontal

```bash
# Escalar backend para 3 réplicas
docker service scale clinica_backend=3

# Traefik fará load balancing automaticamente:
┌──────────────┐
│   Traefik    │
└──────┬───────┘
       ├──────> Backend Replica 1 (node1)
       ├──────> Backend Replica 2 (node2)
       └──────> Backend Replica 3 (node3)
```

**Nota:** SQLite não suporta escritas concorrentes. Para escalar backend:
- Migrar para PostgreSQL/MySQL
- Ou usar SQLite apenas em modo leitura com réplicas

### Scaling Vertical

```yaml
# Adicionar limites de recursos:
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
    reservations:
      cpus: '0.5'
      memory: 512M
```

## 📊 Monitoramento

### Health Checks

```
Frontend (nginx)
├── Endpoint: GET /health
├── Interval: 30s
├── Timeout: 3s
└── Retries: 3

Backend (express)
├── Endpoint: GET /
├── Interval: 30s
├── Timeout: 3s
└── Retries: 3
```

### Logs Centralizados

```bash
# Logs em tempo real
docker service logs clinica_backend -f
docker service logs clinica_frontend -f

# Logs do Traefik (rotas)
docker service logs traefik | grep clinica
```

### Métricas

```bash
# Uso de recursos por serviço
docker stats $(docker ps -q -f name=clinica)

# Status das réplicas
docker service ps clinica_backend
docker service ps clinica_frontend

# Inspecionar configuração
docker service inspect clinica_backend --pretty
```

## 🔄 CI/CD Sugerido

```
┌─────────────────┐
│   GitHub Repo   │
│                 │
│  - Push code    │
└────────┬────────┘
         ↓
┌────────────────────┐
│  GitHub Actions    │
│                    │
│  1. Run tests      │
│  2. Build images   │
│  3. Push to Docker │
│     Hub            │
└────────┬───────────┘
         ↓
┌─────────────────────┐
│   Docker Hub        │
│                     │
│  123atendi/         │
│  clinica-backend    │
│  clinica-frontend   │
└────────┬────────────┘
         ↓
┌─────────────────────┐
│  Produção Server    │
│                     │
│  1. Pull images     │
│  2. Update services │
│  3. Health check    │
└─────────────────────┘
```

## 🗂️ Persistência de Dados

### Volume Mapping

```
Host (Docker Volume)        Container
┌─────────────────┐        ┌──────────────┐
│  clinica-db     │ ────> │  /app/data/  │
│  (managed)      │        │  clinica.db  │
└─────────────────┘        └──────────────┘
        ↓
   Backup Script
   (cron daily)
        ↓
┌─────────────────┐
│ ~/backups/      │
│ clinica/        │
│ backup-*.db     │
└─────────────────┘
```

### Estratégia de Backup

```
1. Backup Diário (Cron 3h AM)
   └─> Copia clinica.db para ~/backups/

2. Backup Semanal
   └─> Copia para storage remoto (S3/rsync)

3. Retenção
   ├─> Diários: 7 dias
   ├─> Semanais: 4 semanas
   └─> Mensais: 12 meses
```

## 🎯 Pontos de Configuração

### Variáveis de Ambiente (.env.production)

```env
Backend:
├── NODE_ENV=production
├── PORT=3001
├── JWT_SECRET=[crypto random 64 chars]
└── CORS_ORIGIN=https://clinica.123atendi.com.br

Frontend:
└── REACT_APP_API_URL=https://clinica.123atendi.com.br/api
```

### Labels Traefik (docker-compose.yml)

```yaml
Backend API:
├── traefik.http.routers.clinica-api.rule
│   └─> "Host(`clinica.123atendi.com.br`) && PathPrefix(`/api`)"
├── traefik.http.routers.clinica-api.priority
│   └─> "10"
└── traefik.http.routers.clinica-api.tls.certresolver
    └─> "le"

Frontend:
├── traefik.http.routers.clinica-frontend.rule
│   └─> "Host(`clinica.123atendi.com.br`)"
├── traefik.http.routers.clinica-frontend.priority
│   └─> "1"
└── traefik.http.routers.clinica-frontend.tls.certresolver
    └─> "le"
```

---

**Arquitetura desenhada para:** Escalabilidade, Segurança, Manutenibilidade
**Stack:** Docker Swarm + Traefik + Node.js + React + SQLite
**Deploy target:** https://clinica.123atendi.com.br
