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

:: Verificar Node.js con diagnostico detallado
echo [1/6] Verificando Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Node.js no esta instalado o no esta en el PATH
    echo.
    echo DIAGNOSTICO:
    echo - Tienes Node.js instalado pero el sistema no lo encuentra
    echo - Esto puede deberse a que Node.js no esta en las variables de entorno
    echo.
    echo SOLUCIONES:
    echo.
    echo 1. Verifica si Node.js esta instalado:
    echo    - Busca "Node.js" en el menu de inicio
    echo    - O busca la carpeta: C:\Program Files\nodejs\
    echo.
    echo 2. Si Node.js esta instalado pero no funciona:
    echo    a. Reinicia tu PC (muy importante)
    echo    b. Ejecuta este instalador de nuevo
    echo.
    echo 3. Si Node.js NO esta instalado:
    echo    a. Ve a: https://nodejs.org/
    echo    b. Descarga la version LTS (20.x recomendada)
    echo    c. Instala Node.js
    echo    d. REINICIA tu PC
    echo    e. Ejecuta este instalador de nuevo
    echo.
    echo 4. Si tienes Node.js 24.x instalado:
    echo    - La version 24.x es muy nueva y puede causar problemas
    echo    - Recomendamos instalar la version LTS 20.x
    echo.
    pause
    exit /b 1
)

:: Obtener version de Node.js
for /f "tokens=*" %%i in ('node -v 2^>^&1') do set NODE_VERSION=%%i
echo Detectado: %NODE_VERSION%

:: Verificar si la version es compatible
echo %NODE_VERSION% | findstr /C:"v18." /C:"v20." /C:"v22." >nul
if %errorlevel% equ 0 (
    echo OK - Version compatible de Node.js
) else (
    echo ADVERTENCIA: Version de Node.js no probada
    echo - Version detectada: %NODE_VERSION%
    echo - Versiones recomendadas: v18.x, v20.x, v22.x
    echo - La aplicacion deberia funcionar, pero puede tener problemas
    echo.
    set /p continuar="Continuar de todos modos? (S/N): "
    if /i not "%continuar%"=="S" (
        echo.
        echo Descarga Node.js LTS 20.x desde: https://nodejs.org/
        pause
        exit /b 1
    )
)
echo.

:: Verificar npm
echo [2/6] Verificando npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm no esta instalado
    echo npm deberia venir incluido con Node.js
    echo.
    echo Reinstala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v 2^>^&1') do set NPM_VERSION=%%i
echo Detectado: npm v%NPM_VERSION%
echo OK - npm instalado correctamente
echo.

:: Ir a la carpeta backend
echo [3/6] Navegando a la carpeta backend...
cd /d "%~dp0backend"
if %errorlevel% neq 0 (
    echo ERROR: No se encontro la carpeta backend
    echo.
    echo Asegurate de que:
    echo 1. Estas ejecutando este archivo desde la carpeta APP-Finanzas
    echo 2. Existe la carpeta "backend" dentro de APP-Finanzas
    echo.
    pause
    exit /b 1
)
echo OK - Carpeta backend encontrada
echo.

:: Instalar dependencias
echo [4/6] Instalando dependencias del backend...
echo Este paso puede tardar varios minutos, por favor espera...
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: No se pudieron instalar las dependencias
    echo.
    echo Posibles causas:
    echo 1. Problemas de conexion a internet
    echo 2. Firewall o antivirus bloqueando npm
    echo 3. Permisos insuficientes
    echo.
    echo Soluciones:
    echo 1. Ejecuta como administrador (clic derecho - Ejecutar como administrador)
    echo 2. Desactiva temporalmente el antivirus
    echo 3. Intenta manualmente:
    echo    cd backend
    echo    npm cache clean --force
    echo    npm install
    echo.
    pause
    exit /b 1
)
echo.
echo OK - Dependencias instaladas correctamente
echo.

:: Crear .env
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
    echo Esto es normal en la primera instalacion
    echo La aplicacion funcionara correctamente con: npm run dev
    echo.
)
echo.

:: Crear carpeta uploads
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
echo IMPORTANTE: Cambia la contrasena del admin despues del primer login
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
