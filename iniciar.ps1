# Script para Iniciar APP Finanzas
# Uso: Click derecho -> Ejecutar con PowerShell

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "              APP FINANZAS - SERVIDOR BACKEND" -ForegroundColor Green
Write-Host "         Sistema de Gestion Financiera SII Chile" -ForegroundColor Green
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Navegar a la carpeta backend
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $scriptPath "backend"

if (Test-Path $backendPath) {
    Set-Location $backendPath
} else {
    Write-Host "ERROR: No se encontro la carpeta backend" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar package.json
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: No se encontro package.json" -ForegroundColor Red
    Write-Host "Asegurate de estar en la carpeta correcta" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "Iniciando servidor..." -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE: NO CIERRES esta ventana mientras uses la aplicacion" -ForegroundColor Yellow
Write-Host "Para detener el servidor, presiona Ctrl+C" -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar la aplicacion
npm run dev

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Servidor detenido." -ForegroundColor Yellow
Write-Host ""
Read-Host "Presiona Enter para salir"
