@echo off
chcp 65001 >nul
color 0E
title Verificación de Instalación - APP Finanzas

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║           VERIFICACIÓN DE INSTALACIÓN APP FINANZAS          ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

set ERRORES=0

:: Ir a la carpeta backend
cd /d "%~dp0backend"

echo [1/8] Verificando Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js NO encontrado
    set /a ERRORES+=1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js instalado: %NODE_VERSION%
)
echo.

echo [2/8] Verificando npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm NO encontrado
    set /a ERRORES+=1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm instalado: v%NPM_VERSION%
)
echo.

echo [3/8] Verificando carpeta backend...
if not exist package.json (
    echo ❌ No se encuentra package.json en backend
    set /a ERRORES+=1
) else (
    echo ✅ Carpeta backend correcta
)
echo.

echo [4/8] Verificando dependencias instaladas...
if not exist node_modules (
    echo ❌ Dependencias NO instaladas - Ejecuta: npm install
    set /a ERRORES+=1
) else (
    echo ✅ Carpeta node_modules encontrada

    :: Verificar dependencias críticas
    if not exist "node_modules\express" (
        echo ⚠️  Falta: express
        set /a ERRORES+=1
    )
    if not exist "node_modules\bcryptjs" (
        echo ⚠️  Falta: bcryptjs
        set /a ERRORES+=1
    )
    if not exist "node_modules\jsonwebtoken" (
        echo ⚠️  Falta: jsonwebtoken
        set /a ERRORES+=1
    )
    if not exist "node_modules\multer" (
        echo ⚠️  Falta: multer
        set /a ERRORES+=1
    )
    if not exist "node_modules\tesseract.js" (
        echo ⚠️  Falta: tesseract.js
        set /a ERRORES+=1
    )
)
echo.

echo [5/8] Verificando archivo .env...
if not exist .env (
    echo ⚠️  Archivo .env NO encontrado - Se creará uno por defecto
) else (
    echo ✅ Archivo .env existe
)
echo.

echo [6/8] Verificando carpeta uploads...
if not exist uploads (
    echo ⚠️  Carpeta uploads NO existe - Se creará automáticamente
    mkdir uploads 2>nul
    echo ✅ Carpeta uploads creada
) else (
    echo ✅ Carpeta uploads existe
)
echo.

echo [7/8] Verificando archivos críticos...
set ARCHIVOS_OK=0
set ARCHIVOS_TOTAL=0

if exist "src\server.ts" (
    set /a ARCHIVOS_OK+=1
)
set /a ARCHIVOS_TOTAL+=1

if exist "src\services\auth.service.ts" (
    set /a ARCHIVOS_OK+=1
)
set /a ARCHIVOS_TOTAL+=1

if exist "src\services\ocr.service.ts" (
    set /a ARCHIVOS_OK+=1
)
set /a ARCHIVOS_TOTAL+=1

if exist "src\middleware\auth.middleware.ts" (
    set /a ARCHIVOS_OK+=1
)
set /a ARCHIVOS_TOTAL+=1

if exist "src\controllers\auth.controller.ts" (
    set /a ARCHIVOS_OK+=1
)
set /a ARCHIVOS_TOTAL+=1

if exist "src\controllers\upload.controller.ts" (
    set /a ARCHIVOS_OK+=1
)
set /a ARCHIVOS_TOTAL+=1

if exist "src\database\schema.ts" (
    set /a ARCHIVOS_OK+=1
)
set /a ARCHIVOS_TOTAL+=1

if exist "src\routes\index.ts" (
    set /a ARCHIVOS_OK+=1
)
set /a ARCHIVOS_TOTAL+=1

echo ✅ Archivos encontrados: %ARCHIVOS_OK%/%ARCHIVOS_TOTAL%
if %ARCHIVOS_OK% LSS %ARCHIVOS_TOTAL% (
    echo ⚠️  Faltan algunos archivos del proyecto
    set /a ERRORES+=1
)
echo.

echo [8/8] Verificando puerto disponible...
netstat -ano | findstr ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Puerto 3000 está en uso - Puedes cambiarlo en .env
) else (
    echo ✅ Puerto 3000 disponible
)
echo.

echo ═══════════════════════════════════════════════════════════════
echo.

if %ERRORES% equ 0 (
    echo ✅ ¡TODO CORRECTO! La aplicación está lista para ejecutarse
    echo.
    echo 💡 Para iniciar la aplicación:
    echo    1. Ejecuta: INICIAR_APP.bat
    echo    2. O ejecuta manualmente: npm run dev
    echo.
    echo 🔐 Usuario admin por defecto:
    echo    Email: admin@finanzas.cl
    echo    Password: admin123
) else (
    echo ❌ Se encontraron %ERRORES% problemas
    echo.
    echo 🔧 Soluciones:
    echo    1. Si falta Node.js: Descarga desde https://nodejs.org/
    echo    2. Si faltan dependencias: Ejecuta INSTALAR.bat
    echo    3. O ejecuta manualmente: npm install
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo.
pause
