#!/bin/sh
# Script para substituir variáveis de ambiente em runtime no frontend

# Substituir REACT_APP_API_URL no código JavaScript buildado
if [ ! -z "$REACT_APP_API_URL" ]; then
  echo "Configurando REACT_APP_API_URL para: $REACT_APP_API_URL"
  find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|http://localhost:3001/api|$REACT_APP_API_URL|g" {} \;
fi

# Executar comando passado (nginx)
exec "$@"
