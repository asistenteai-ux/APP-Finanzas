@echo off
title Diagnostico de Node.js - APP Finanzas

echo.
echo ============================================================
echo.
echo         DIAGNOSTICO DE NODE.JS - APP FINANZAS
echo.
echo ============================================================
echo.
echo Este script verificara tu instalacion de Node.js
echo y te dira exactamente que esta mal.
echo.
echo ============================================================
echo.

echo [1/5] Verificando si Node.js esta instalado...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ PROBLEMA ENCONTRADO: Node.js NO esta en el PATH
    echo.
    echo Esto significa que:
    echo - Node.js puede estar instalado, pero Windows no lo encuentra
    echo - O Node.js no esta instalado
    echo.
    echo DIAGNOSTICO ADICIONAL:
    echo.

    :: Buscar Node.js en ubicaciones comunes
    if exist "C:\Program Files\nodejs\node.exe" (
        echo ✓ Node.js ESTA instalado en: C:\Program Files\nodejs\
        echo.
        echo PROBLEMA: Node.js esta instalado pero NO esta en el PATH
        echo.
        echo SOLUCION:
        echo 1. Opcion mas simple: REINICIA TU PC
        echo 2. Opcion alternativa: Agregar manualmente al PATH
        echo    - Panel de Control - Sistema - Variables de entorno
        echo    - Agregar: C:\Program Files\nodejs\
        echo.
    ) else if exist "C:\Program Files (x86)\nodejs\node.exe" (
        echo ✓ Node.js ESTA instalado en: C:\Program Files (x86)\nodejs\
        echo.
        echo PROBLEMA: Node.js esta instalado pero NO esta en el PATH
        echo.
        echo SOLUCION:
        echo 1. Opcion mas simple: REINICIA TU PC
        echo 2. Opcion alternativa: Agregar manualmente al PATH
        echo    - Panel de Control - Sistema - Variables de entorno
        echo    - Agregar: C:\Program Files (x86)\nodejs\
        echo.
    ) else if exist "%USERPROFILE%\AppData\Local\Programs\nodejs\node.exe" (
        echo ✓ Node.js ESTA instalado en: %USERPROFILE%\AppData\Local\Programs\nodejs\
        echo.
        echo PROBLEMA: Node.js esta instalado pero NO esta en el PATH
        echo.
        echo SOLUCION:
        echo 1. Opcion mas simple: REINICIA TU PC
        echo 2. Opcion alternativa: Agregar manualmente al PATH
        echo.
    ) else (
        echo ✗ Node.js NO esta instalado en ubicaciones comunes
        echo.
        echo SOLUCION:
        echo 1. Ve a: https://nodejs.org/
        echo 2. Descarga Node.js LTS (version 20.x recomendada)
        echo 3. Instala Node.js
        echo 4. REINICIA tu PC
        echo 5. Ejecuta INSTALAR.bat
        echo.
    )

    echo Lee el archivo: SOLUCION_NODEJS_PATH.md
    echo para instrucciones detalladas paso a paso.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v 2^>^&1') do set NODE_VERSION=%%i
echo ✓ Node.js ENCONTRADO: %NODE_VERSION%
echo.

echo [2/5] Verificando version de Node.js...
echo %NODE_VERSION% | findstr /C:"v18." /C:"v20." /C:"v22." >nul
if %errorlevel% equ 0 (
    echo ✓ Version compatible: %NODE_VERSION%
) else (
    echo ⚠ Version no probada: %NODE_VERSION%
    echo.
    echo ADVERTENCIA:
    echo - Tu version puede ser muy nueva o muy antigua
    echo - Versiones recomendadas: v18.x, v20.x, v22.x
    echo.
    echo Si tienes v24.x:
    echo - Es una version experimental muy nueva
    echo - Puede causar problemas con algunas dependencias
    echo - Recomendamos usar Node.js 20.x LTS
    echo.
    echo SOLUCION:
    echo 1. Ve a: https://nodejs.org/
    echo 2. Descarga Node.js LTS 20.x
    echo 3. Instalalo
    echo 4. REINICIA tu PC
    echo.
)
echo.

echo [3/5] Verificando npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ npm NO encontrado
    echo.
    echo PROBLEMA: npm deberia venir incluido con Node.js
    echo.
    echo SOLUCION:
    echo 1. Reinstala Node.js desde: https://nodejs.org/
    echo 2. Asegurate de marcar "Install npm"
    echo 3. REINICIA tu PC
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v 2^>^&1') do set NPM_VERSION=%%i
echo ✓ npm ENCONTRADO: v%NPM_VERSION%
echo.

echo [4/5] Verificando permisos...
echo Probando si puedes ejecutar comandos npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Hay problemas de permisos
    echo.
    echo SOLUCION:
    echo 1. Ejecuta este script como Administrador
    echo 2. O ejecuta INSTALAR.bat como Administrador
    echo.
    pause
    exit /b 1
)
echo ✓ Permisos OK
echo.

echo [5/5] Verificando carpeta del proyecto...
cd /d "%~dp0"
if exist backend\package.json (
    echo ✓ Carpeta del proyecto correcta
    echo ✓ Archivo backend\package.json encontrado
) else (
    echo ✗ No se encuentra backend\package.json
    echo.
    echo PROBLEMA: Estas ejecutando este script desde la ubicacion incorrecta
    echo.
    echo SOLUCION:
    echo 1. Asegurate de estar en la carpeta APP-Finanzas
    echo 2. Ejecuta este script desde ahi
    echo.
    pause
    exit /b 1
)
echo.

echo ============================================================
echo.
echo         DIAGNOSTICO COMPLETADO
echo.
echo ============================================================
echo.
echo RESUMEN:
echo - Node.js: %NODE_VERSION%
echo - npm: v%NPM_VERSION%
echo - Carpeta del proyecto: OK
echo.
echo TODO ESTA CORRECTO
echo.
echo Ahora puedes ejecutar: INSTALAR.bat
echo.
echo ============================================================
echo.

pause
