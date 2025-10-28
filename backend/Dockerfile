# Dockerfile Backend - Sistema de Agendamento Clínica
# Build otimizado para produção com Node.js Alpine

FROM node:18-alpine

# Instalar dependências do sistema necessárias para SQLite
RUN apk add --no-cache python3 make g++

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Copiar código da aplicação
COPY . .

# Criar diretório para o banco de dados se não existir
RUN mkdir -p /app/data

# Dar permissão de execução ao script de inicialização
RUN chmod +x start.sh

# Expor porta do backend
EXPOSE 3001

# Health check para monitoramento
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar o servidor (roda seed antes se necessário)
CMD ["sh", "start.sh"]
