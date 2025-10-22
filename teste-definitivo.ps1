# Script de Teste Definitivo
# Execute: .\teste-definitivo.ps1

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        TESTE DEFINITIVO - Sistema de Automação           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Parar qualquer processo Node.js rodando
Write-Host "⏹️  Parando processos existentes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "electron" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Limpar caches
Write-Host "🧹 Limpando caches..." -ForegroundColor Yellow

if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "   ✅ .next removido" -ForegroundColor Green
}

if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force node_modules\.cache
    Write-Host "   ✅ node_modules\.cache removido" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Iniciando aplicativo..." -ForegroundColor Yellow
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📋 INSTRUÇÕES:" -ForegroundColor White
Write-Host ""
Write-Host "  1. Quando o app abrir, pressione F12" -ForegroundColor White
Write-Host "  2. Vá na aba 'Console'" -ForegroundColor White
Write-Host "  3. Você verá uma CAIXA GRANDE com:" -ForegroundColor White
Write-Host "     '🔍 Status do Sistema'" -ForegroundColor White
Write-Host ""
Write-Host "  4. Selecione a planilha Excel" -ForegroundColor White
Write-Host "     → A caixa deve mostrar ✅ no Arquivo" -ForegroundColor White
Write-Host "     → O console deve mostrar logs" -ForegroundColor White
Write-Host ""
Write-Host "  5. Digite a URL completa" -ForegroundColor White
Write-Host "     → A caixa deve mostrar ✅ na URL" -ForegroundColor White
Write-Host ""
Write-Host "  6. O fundo da última linha deve ficar VERDE" -ForegroundColor White
Write-Host "     'Botão: ✅ DISPONÍVEL'" -ForegroundColor White
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Aguarde o Next.js compilar..." -ForegroundColor Gray
Write-Host ""

# Iniciar
npm run electron-dev

