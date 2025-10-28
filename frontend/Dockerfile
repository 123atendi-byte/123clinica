FROM node:18-alpine AS builder
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar depend�ncias
RUN npm ci && npm cache clean --force

# Copiar c�digo fonte
COPY . .

# Build de produ��o
RUN npm run build

# Est�gio 2: Servir com Nginx
FROM nginx:alpine

# Copiar configura��o customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar arquivos buildados do est�gio anterior
COPY --from=builder /app/build /usr/share/nginx/html

# Adicionar script de entrypoint simplificado
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expor porta 80
EXPOSE 80

# Usar entrypoint customizado
ENTRYPOINT ["/docker-entrypoint.sh"]

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
