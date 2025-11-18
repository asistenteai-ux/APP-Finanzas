@echo off
title Instalador APP Finanzas - Sistema Contable SII Chile

echo.
echo ============================================================
echo.
echo         INSTALADOR APP FINANZAS - SISTEMA CONTABLE
echo         Sistema de Gestion Financiera SII Chile
echo.
echo ============================================================
echo.
echo.

:: Verificar si Node.js esta instalado
echo [1/6] Verificando Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Node.js no esta instalado
    echo.
    echo Por favor, instala Node.js primero:
    echo 1. Ve a: https://nodejs.org/
    echo 2. Descarga la version LTS (recomendada)
    echo 3. Instala Node.js
    echo 4. Vuelve a ejecutar este instalador
    echo.
    pause
    exit /b 1
)

node --version
echo OK - Node.js instalado correctamente
echo.

:: Verificar si npm esta instalado
echo [2/6] Verificando npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm no esta instalado
    pause
    exit /b 1
)

npm --version
echo OK - npm instalado correctamente
echo.

:: Ir a la carpeta backend
echo [3/6] Navegando a la carpeta backend...
cd /d "%~dp0backend"
if %errorlevel% neq 0 (
    echo ERROR: No se encontro la carpeta backend
    pause
    exit /b 1
)
echo OK - Carpeta backend encontrada
echo.

:: Instalar dependencias del backend
echo [4/6] Instalando dependencias del backend...
echo Este paso puede tardar varios minutos, por favor espera...
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: No se pudieron instalar las dependencias
    echo.
    echo Intenta ejecutar manualmente:
    echo   cd backend
    echo   npm install
    echo.
    pause
    exit /b 1
)
echo.
echo OK - Dependencias del backend instaladas correctamente
echo.

:: Crear archivo .env si no existe
echo [5/6] Configurando variables de entorno...
if not exist .env (
    echo Creando archivo .env...
    echo NODE_ENV=development > .env
    echo PORT=3000 >> .env
    echo DATABASE_PATH=./database.sqlite >> .env
    echo JWT_SECRET=mi_secreto_super_seguro_2025_app_finanzas_chile >> .env
    echo SII_ENVIRONMENT=certificacion >> .env
    echo SII_RUT= >> .env
    echo SII_COMPANY_NAME= >> .env
    echo SII_CERT_PATH= >> .env
    echo SII_CERT_PASSWORD= >> .env
    echo CORS_ORIGIN=http://localhost:5173 >> .env
    echo OK - Archivo .env creado
) else (
    echo OK - Archivo .env ya existe
)
echo.

:: Compilar TypeScript
echo [6/6] Compilando TypeScript...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ADVERTENCIA: No se pudo compilar TypeScript
    echo Esto es normal si es la primera instalacion
    echo Puedes ejecutar la app con: npm run dev
    echo.
)
echo.

:: Crear carpeta para uploads
if not exist uploads mkdir uploads
echo OK - Carpeta uploads creada

echo.
echo ============================================================
echo.
echo         INSTALACION COMPLETADA EXITOSAMENTE
echo.
echo ============================================================
echo.
echo PROXIMOS PASOS:
echo.
echo 1. Ejecuta: INICIAR_APP.bat
echo 2. O manualmente: cd backend y luego npm run dev
echo 3. La aplicacion estara en: http://localhost:3000
echo.
echo Usuario admin por defecto:
echo    Email: admin@finanzas.cl
echo    Password: admin123
echo.
echo Lee el archivo GUIA_INSTALACION_WINDOWS.md para mas detalles
echo.
echo ============================================================
echo.

set /p iniciar="Quieres iniciar la aplicacion ahora? (S/N): "

if /i "%iniciar%"=="S" (
    echo.
    echo Iniciando aplicacion...
    echo.
    echo IMPORTANTE: Deja esta ventana abierta mientras usas la app
    echo Para detener el servidor, presiona Ctrl+C
    echo.
    timeout /t 3 >nul
    call npm run dev
) else (
    echo.
    echo Para iniciar la aplicacion mas tarde:
    echo 1. Abre una terminal
    echo 2. cd backend
    echo 3. npm run dev
    echo.
)

pause
