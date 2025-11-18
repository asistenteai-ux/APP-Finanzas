@echo off
chcp 65001 >nul
color 0B
title APP Finanzas - Servidor Backend

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║              APP FINANZAS - SERVIDOR BACKEND                 ║
echo ║              Sistema de Gestión Financiera SII Chile        ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Navegar a la carpeta backend
cd /d "%~dp0backend"

:: Verificar que estamos en la carpeta correcta
if not exist package.json (
    echo ❌ ERROR: No se encontró el archivo package.json
    echo Verifica que estés en la carpeta correcta
    pause
    exit /b 1
)

echo 🚀 Iniciando servidor...
echo.
echo ⚠️ IMPORTANTE: NO CIERRES esta ventana mientras uses la aplicación
echo    Para detener el servidor, presiona Ctrl+C
echo.
echo ═══════════════════════════════════════════════════════════════
echo.

:: Iniciar la aplicación
call npm run dev

echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo Servidor detenido.
echo.
pause
