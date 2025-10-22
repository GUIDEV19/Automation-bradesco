# Script de Reinicialização do Sistema de Automação
# Execute com: .\reiniciar.ps1

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Reinicializando Sistema de Automação Excel              ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Limpar cache do Next.js
Write-Host "🧹 Limpando cache do Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ Cache .next removido" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Cache .next não encontrado (ok)" -ForegroundColor Gray
}

# 2. Verificar se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
}

# 3. Iniciar aplicativo
Write-Host ""
Write-Host "🚀 Iniciando aplicativo..." -ForegroundColor Yellow
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  LEMBRE-SE:" -ForegroundColor White
Write-Host "  1. Pressione F12 para ver o console" -ForegroundColor White
Write-Host "  2. Selecione a planilha Excel" -ForegroundColor White
Write-Host "  3. Digite a URL completa" -ForegroundColor White
Write-Host "  4. Observe a caixa de debug abaixo do botão" -ForegroundColor White
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

npm run electron-dev

