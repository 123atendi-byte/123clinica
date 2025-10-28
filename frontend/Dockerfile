# Dockerfile Frontend - Sistema de Agendamento Clínica
# Multi-stage build para produção otimizada

# Estágio 1: Build da aplicação React
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci && npm cache clean --force

# Copiar código fonte
COPY . .

# Build de produção
RUN npm run build

# Estágio 2: Servir com Nginx
FROM nginx:alpine

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar arquivos buildados do estágio anterior
COPY --from=builder /app/build /usr/share/nginx/html

# Adicionar script para substituir variáveis de ambiente em runtime
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expor porta 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Usar entrypoint customizado para injetar env vars
ENTRYPOINT ["/docker-entrypoint.sh"]

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
