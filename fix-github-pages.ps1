# Script para corrigir erro 404 no GitHub Pages
# Executar em PowerShell

Write-Host "🔧 Corrigindo arquivos 404 no GitHub Pages..." -ForegroundColor Green
Write-Host ""

# Adicionar todos os arquivos
Write-Host "📦 Adicionando arquivos..." -ForegroundColor Yellow
git add -A
git add -f firebase-config.js
git add -f js/main-static.js

# Mostrar o que vai ser commitado
Write-Host ""
Write-Host "📋 Arquivos a serem enviados:" -ForegroundColor Cyan
git diff --cached --name-only | Select-Object -First 20

# Fazer commit
Write-Host ""
Write-Host "💾 Criando commit..." -ForegroundColor Yellow
git commit -m "fix: adicionar arquivos faltantes para GitHub Pages (firebase-config.js e js/main-static.js)"

# Fazer push
Write-Host ""
Write-Host "🚀 Enviando para GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ Pronto! Arquivos atualizados." -ForegroundColor Green
Write-Host "Aguarde 5-10 minutos para GitHub Pages recarregar." -ForegroundColor Cyan
Write-Host ""
Write-Host "Acesse: https://leandrocamargo1.github.io/appfinanceiro" -ForegroundColor Blue
