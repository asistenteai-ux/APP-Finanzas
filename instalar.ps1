# Script de Instalacion PowerShell para APP Finanzas
# Uso: Click derecho -> Ejecutar con PowerShell

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "         INSTALADOR APP FINANZAS - SISTEMA CONTABLE" -ForegroundColor Green
Write-Host "         Sistema de Gestion Financiera SII Chile" -ForegroundColor Green
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "[1/5] Verificando Node.js..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version
    Write-Host "OK - Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "ERROR: Node.js no esta instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Soluciones:" -ForegroundColor Yellow
    Write-Host "1. Ve a: https://nodejs.org/" -ForegroundColor White
    Write-Host "2. Descarga Node.js LTS 20.x" -ForegroundColor White
    Write-Host "3. Instala Node.js" -ForegroundColor White
    Write-Host "4. REINICIA tu PC" -ForegroundColor White
    Write-Host "5. Ejecuta este script de nuevo" -ForegroundColor White
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""

# Verificar npm
Write-Host "[2/5] Verificando npm..." -ForegroundColor Yellow

try {
    $npmVersion = npm --version
    Write-Host "OK - npm instalado: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: npm no esta instalado" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""

# Navegar a la carpeta backend
Write-Host "[3/5] Navegando a la carpeta backend..." -ForegroundColor Yellow

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $scriptPath "backend"

if (Test-Path $backendPath) {
    Set-Location $backendPath
    Write-Host "OK - Carpeta backend encontrada" -ForegroundColor Green
} else {
    Write-Host "ERROR: No se encontro la carpeta backend" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""

# Instalar dependencias
Write-Host "[4/5] Instalando dependencias..." -ForegroundColor Yellow
Write-Host "Este paso puede tardar varios minutos, por favor espera..." -ForegroundColor Cyan
Write-Host ""

try {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "OK - Dependencias instaladas correctamente" -ForegroundColor Green
    } else {
        throw "npm install fallo"
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: No se pudieron instalar las dependencias" -ForegroundColor Red
    Write-Host ""
    Write-Host "Soluciones:" -ForegroundColor Yellow
    Write-Host "1. Ejecuta como Administrador" -ForegroundColor White
    Write-Host "2. Limpia cache: npm cache clean --force" -ForegroundColor White
    Write-Host "3. Intenta de nuevo" -ForegroundColor White
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""

# Crear archivo .env
Write-Host "[5/5] Configurando variables de entorno..." -ForegroundColor Yellow

$envFile = Join-Path $backendPath ".env"

if (-not (Test-Path $envFile)) {
    Write-Host "Creando archivo .env..." -ForegroundColor Cyan

    $envContent = @"
NODE_ENV=development
PORT=3000
DATABASE_PATH=./database.sqlite
JWT_SECRET=mi_secreto_super_seguro_2025_app_finanzas_chile
SII_ENVIRONMENT=certificacion
SII_RUT=
SII_COMPANY_NAME=
SII_CERT_PATH=
SII_CERT_PASSWORD=
CORS_ORIGIN=http://localhost:5173
"@

    $envContent | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "OK - Archivo .env creado" -ForegroundColor Green
} else {
    Write-Host "OK - Archivo .env ya existe" -ForegroundColor Green
}

# Crear carpeta uploads
$uploadsPath = Join-Path $backendPath "uploads"
if (-not (Test-Path $uploadsPath)) {
    New-Item -ItemType Directory -Path $uploadsPath | Out-Null
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "         INSTALACION COMPLETADA EXITOSAMENTE" -ForegroundColor Green
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "PROXIMOS PASOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ejecuta: npm run dev" -ForegroundColor White
Write-Host "2. O ejecuta: iniciar.ps1" -ForegroundColor White
Write-Host "3. Abre tu navegador en: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Usuario admin por defecto:" -ForegroundColor Yellow
Write-Host "   Email: admin@finanzas.cl" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$iniciar = Read-Host "Quieres iniciar la aplicacion ahora? (S/N)"

if ($iniciar -eq "S" -or $iniciar -eq "s") {
    Write-Host ""
    Write-Host "Iniciando aplicacion..." -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANTE: NO CIERRES esta ventana mientras uses la app" -ForegroundColor Yellow
    Write-Host "Para detener el servidor, presiona Ctrl+C" -ForegroundColor Yellow
    Write-Host ""
    Start-Sleep -Seconds 2
    npm run dev
} else {
    Write-Host ""
    Write-Host "Para iniciar la aplicacion mas tarde:" -ForegroundColor Cyan
    Write-Host "1. Abre PowerShell" -ForegroundColor White
    Write-Host "2. cd backend" -ForegroundColor White
    Write-Host "3. npm run dev" -ForegroundColor White
    Write-Host ""
}

Read-Host "Presiona Enter para salir"
