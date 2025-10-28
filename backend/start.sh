#!/bin/sh
# Script de inicialização do backend
# Roda seed automaticamente se banco estiver vazio

echo "🚀 Iniciando backend..."

# Verificar se precisa popular o banco
echo "📊 Verificando banco de dados..."
node seed.js

# Iniciar servidor
echo "🌐 Iniciando servidor..."
node server.js
