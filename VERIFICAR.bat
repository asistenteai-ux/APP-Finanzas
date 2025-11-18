@echo off
title Verificacion de Instalacion - APP Finanzas

echo.
echo ============================================================
echo.
echo        VERIFICACION DE INSTALACION APP FINANZAS
echo.
echo ============================================================
echo.

set ERRORES=0

:: Ir a la carpeta backend
cd /d "%~dp0backend"

echo [1/6] Verificando Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js NO encontrado
    set /a ERRORES+=1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo OK - Node.js instalado: %NODE_VERSION%
)
echo.

echo [2/6] Verificando npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm NO encontrado
    set /a ERRORES+=1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo OK - npm instalado: v%NPM_VERSION%
)
echo.

echo [3/6] Verificando carpeta backend...
if not exist package.json (
    echo ERROR: No se encuentra package.json en backend
    set /a ERRORES+=1
) else (
    echo OK - Carpeta backend correcta
)
echo.

echo [4/6] Verificando dependencias instaladas...
if not exist node_modules (
    echo ADVERTENCIA: Dependencias NO instaladas
    echo Ejecuta: npm install
    set /a ERRORES+=1
) else (
    echo OK - Carpeta node_modules encontrada
)
echo.

echo [5/6] Verificando archivo .env...
if not exist .env (
    echo ADVERTENCIA: Archivo .env NO encontrado
    echo Se creara uno por defecto al ejecutar INSTALAR.bat
) else (
    echo OK - Archivo .env existe
)
echo.

echo [6/6] Verificando carpeta uploads...
if not exist uploads (
    echo ADVERTENCIA: Carpeta uploads NO existe
    echo Se creara automaticamente
    mkdir uploads 2>nul
    echo OK - Carpeta uploads creada
) else (
    echo OK - Carpeta uploads existe
)
echo.

echo ============================================================
echo.

if %ERRORES% equ 0 (
    echo TODO CORRECTO - La aplicacion esta lista
    echo.
    echo Para iniciar la aplicacion:
    echo    1. Ejecuta: INICIAR_APP.bat
    echo    2. O manualmente: npm run dev
    echo.
    echo Usuario admin por defecto:
    echo    Email: admin@finanzas.cl
    echo    Password: admin123
) else (
    echo Se encontraron %ERRORES% problemas
    echo.
    echo Soluciones:
    echo    1. Si falta Node.js: https://nodejs.org/
    echo    2. Si faltan dependencias: Ejecuta INSTALAR.bat
    echo    3. O manualmente: npm install
)

echo.
echo ============================================================
echo.
pause
