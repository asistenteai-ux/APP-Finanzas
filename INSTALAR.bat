@echo off
chcp 65001 >nul
color 0A
title Instalador APP Finanzas - Sistema Contable SII Chile

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║         INSTALADOR APP FINANZAS - SISTEMA CONTABLE          ║
echo ║              Sistema de Gestión Financiera SII Chile        ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo.

:: Verificar si Node.js está instalado
echo [1/6] Verificando Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Node.js no está instalado
    echo.
    echo Por favor, instala Node.js primero:
    echo 1. Ve a: https://nodejs.org/
    echo 2. Descarga la versión LTS (recomendada)
    echo 3. Instala Node.js
    echo 4. Vuelve a ejecutar este instalador
    echo.
    pause
    exit /b 1
)

node --version
echo ✅ Node.js instalado correctamente
echo.

:: Verificar si npm está instalado
echo [2/6] Verificando npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: npm no está instalado
    pause
    exit /b 1
)

npm --version
echo ✅ npm instalado correctamente
echo.

:: Ir a la carpeta backend
echo [3/6] Navegando a la carpeta backend...
cd /d "%~dp0backend"
if %errorlevel% neq 0 (
    echo ❌ ERROR: No se encontró la carpeta backend
    pause
    exit /b 1
)
echo ✅ Carpeta backend encontrada
echo.

:: Instalar dependencias del backend
echo [4/6] Instalando dependencias del backend...
echo Este paso puede tardar varios minutos, por favor espera...
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: No se pudieron instalar las dependencias
    echo.
    echo Intenta ejecutar manualmente:
    echo   cd backend
    echo   npm install
    echo.
    pause
    exit /b 1
)
echo.
echo ✅ Dependencias del backend instaladas correctamente
echo.

:: Crear archivo .env si no existe
echo [5/6] Configurando variables de entorno...
if not exist .env (
    echo Creando archivo .env...
    (
        echo # Configuración de la aplicación
        echo NODE_ENV=development
        echo PORT=3000
        echo.
        echo # Base de datos
        echo DATABASE_PATH=./database.sqlite
        echo.
        echo # JWT Secret ^(cambia esto en producción^)
        echo JWT_SECRET=mi_secreto_super_seguro_2025_app_finanzas_chile
        echo.
        echo # SII Chile Configuration
        echo SII_ENVIRONMENT=certificacion
        echo SII_RUT=
        echo SII_COMPANY_NAME=
        echo SII_CERT_PATH=
        echo SII_CERT_PASSWORD=
        echo.
        echo # CORS
        echo CORS_ORIGIN=http://localhost:5173
    ) > .env
    echo ✅ Archivo .env creado
) else (
    echo ✅ Archivo .env ya existe
)
echo.

:: Compilar TypeScript
echo [6/6] Compilando TypeScript...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ⚠️ ADVERTENCIA: No se pudo compilar TypeScript
    echo Esto es normal si es la primera instalación
    echo Puedes ejecutar la app con: npm run dev
    echo.
)
echo.

:: Crear carpeta para uploads
if not exist uploads mkdir uploads
echo ✅ Carpeta uploads creada

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║           ✅ INSTALACIÓN COMPLETADA EXITOSAMENTE             ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 📝 PRÓXIMOS PASOS:
echo.
echo 1. Abre una terminal en la carpeta "backend"
echo 2. Ejecuta: npm run dev
echo 3. La aplicación estará disponible en: http://localhost:3000
echo.
echo 🔐 Usuario admin por defecto:
echo    Email: admin@finanzas.cl
echo    Password: admin123
echo.
echo 📖 Lee el archivo GUIA_INSTALACION_WINDOWS.md para más detalles
echo.
echo ¿Quieres iniciar la aplicación ahora? (S/N)
set /p iniciar="Respuesta: "

if /i "%iniciar%"=="S" (
    echo.
    echo 🚀 Iniciando aplicación...
    echo.
    echo ⚠️ IMPORTANTE: Deja esta ventana abierta mientras usas la app
    echo    Para detener el servidor, presiona Ctrl+C
    echo.
    timeout /t 3 >nul
    call npm run dev
) else (
    echo.
    echo Para iniciar la aplicación más tarde:
    echo 1. Abre una terminal
    echo 2. cd backend
    echo 3. npm run dev
    echo.
)

pause
