#!/bin/bash
# Script para corrigir erro 404 no GitHub Pages

echo "🔧 Corrigindo arquivos 404 no GitHub Pages..."
echo ""

# Adicionar todos os arquivos
echo "📦 Adicionando arquivos..."
git add -A
git add -f firebase-config.js
git add -f js/main-static.js

# Mostrar o que vai ser commitado
echo ""
echo "📋 Arquivos a serem enviados:"
git diff --cached --name-only | head -20

# Fazer commit
echo ""
echo "💾 Criando commit..."
git commit -m "fix: adicionar arquivos faltantes para GitHub Pages (firebase-config.js e js/main-static.js)"

# Fazer push
echo ""
echo "🚀 Enviando para GitHub..."
git push origin main

echo ""
echo "✅ Pronto! Arquivos atualizados."
echo "Aguarde 5-10 minutos para GitHub Pages recarregar."
echo ""
echo "Acesse: https://leandrocamargo1.github.io/appfinanceiro"
