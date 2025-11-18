# 🔨 Cómo Generar el Ejecutable (.exe) para Windows

## 📋 Requisitos Previos

Para **GENERAR** el .exe necesitas (solo una vez):
- Node.js 18+ o 20.x LTS instalado
- Conexión a internet

Para **USAR** el .exe (el usuario final):
- ❌ **NO** necesita Node.js
- ❌ **NO** necesita npm
- ✅ Solo Windows 10/11 de 64 bits

---

## ⚡ Guía Rápida (3 Pasos)

### Paso 1: Instalar Dependencias

```cmd
cd backend
npm install
```

### Paso 2: Generar el Ejecutable

```cmd
npm run build:exe
```

Espera 2-3 minutos. Se creará el archivo `app-finanzas.exe` en la carpeta raíz.

### Paso 3: ¡Listo!

El archivo `app-finanzas.exe` ahora puede ejecutarse en **cualquier Windows** sin necesidad de Node.js.

---

## 📖 Guía Detallada Paso a Paso

### 1. Preparar el Entorno

Abre **cmd** (Símbolo del sistema) y navega a la carpeta del proyecto:

```cmd
cd C:\ruta\a\APP-Finanzas\backend
```

### 2. Instalar Todas las Dependencias

Incluida la herramienta `pkg` que empaqueta la aplicación:

```cmd
npm install
```

Esto instalará:
- Todas las dependencias de la aplicación
- `pkg` (empaquetador)
- TypeScript y herramientas de compilación

**Tiempo estimado:** 3-5 minutos

### 3. Construir el Ejecutable

Ejecuta el script de build:

```cmd
npm run build:exe
```

Este comando hace **automáticamente**:
1. ✅ Compila TypeScript a JavaScript (`npm run build`)
2. ✅ Empaqueta todo con `pkg`
3. ✅ Incluye Node.js runtime dentro del .exe
4. ✅ Incluye todas las dependencias
5. ✅ Crea `app-finanzas.exe` en la carpeta raíz

**Tiempo estimado:** 2-3 minutos

Verás algo como:
```
> Compiled: dist/server.js
> Fetching base Node.js binaries...
> Fetched 100%
> Packaging...
> app-finanzas.exe created successfully!
```

### 4. Verificar el Ejecutable

Verifica que se haya creado:

```cmd
cd ..
dir app-finanzas.exe
```

Deberías ver un archivo de aproximadamente 50-80 MB.

---

## 🚀 Usar el Ejecutable

### Primera Vez

1. Copia `app-finanzas.exe` a donde quieras
2. Crea un archivo `.env` en la misma carpeta (ver configuración abajo)
3. Doble clic en `app-finanzas.exe`
4. Abre navegador: `http://localhost:3000`

### Archivo .env Necesario

Crea un archivo llamado `.env` junto al ejecutable:

```env
NODE_ENV=production
PORT=3000
DATABASE_PATH=./database.sqlite
JWT_SECRET=cambia_este_secreto_por_uno_seguro_aleatorio
SII_ENVIRONMENT=certificacion
SII_RUT=
SII_COMPANY_NAME=
CORS_ORIGIN=http://localhost:5173
```

---

## 🔧 Configuración Avanzada

### Cambiar el Puerto

Edita `pkg-config.json` **antes** de generar el .exe, o edita el `.env` **después**.

### Generar para Diferentes Versiones de Node

Edita `backend/package.json`, línea `build:exe`:

```json
"build:exe": "npm run build && pkg dist/server.js --targets node20-win-x64 --output ../app-finanzas.exe"
```

Opciones de targets:
- `node18-win-x64` - Node.js 18 (recomendado)
- `node20-win-x64` - Node.js 20
- `node16-win-x64` - Node.js 16

### Incluir Archivos Adicionales

Edita `backend/pkg-config.json`:

```json
{
  "assets": [
    "node_modules/better-sqlite3/build/Release/**/*",
    "dist/**/*",
    "tu-archivo-adicional.txt"
  ]
}
```

---

## ⚠️ Limitaciones Conocidas

### 1. Módulos Nativos (better-sqlite3)

**Problema:** `better-sqlite3` es un módulo nativo (código C++) compilado.

**Solución implementada:**
- Incluimos los binarios nativos en `pkg-config.json`
- Funciona en la mayoría de casos

**Si falla:**
```cmd
cd backend/node_modules/better-sqlite3
npm run build-release
```

Luego regenera el .exe.

### 2. Tesseract.js (OCR)

**Problema:** Tesseract necesita archivos de idioma (traineddata).

**Solución:**
Los archivos de idioma se incluyen automáticamente en `pkg-config.json`.

Si el OCR no funciona, descarga manualmente:
https://github.com/naptha/tessdata/raw/gh-pages/4.0.0/spa.traineddata.gz

Y colócalo junto al ejecutable en: `tessdata/spa.traineddata`

### 3. Tamaño del Ejecutable

El .exe será de **50-80 MB** porque incluye:
- Node.js runtime completo
- Todas las dependencias
- Módulos nativos

Esto es **normal** y necesario para que funcione sin Node.js instalado.

---

## 🐛 Solución de Problemas

### Error: "pkg: command not found"

**Solución:**
```cmd
npm install -g pkg
```

O usa el script npm:
```cmd
npm run build:exe
```

### Error al Compilar TypeScript

**Solución:**
```cmd
cd backend
npm run build
```

Revisa los errores de TypeScript y corrígelos antes de generar el .exe.

### Error: "Cannot find module"

**Solución:**
Asegúrate de incluir el módulo en `pkg-config.json`:

```json
{
  "assets": [
    "node_modules/nombre-del-modulo/**/*"
  ]
}
```

### El .exe No Inicia

**Solución:**
1. Verifica que existe el archivo `.env`
2. Ejecuta desde cmd para ver errores:
   ```cmd
   app-finanzas.exe
   ```
3. Revisa los logs de error

### Error de SQLite

**Problema:** SQLite nativo no funciona.

**Solución Alternativa:**
Usa `sql.js` (SQLite en JavaScript puro) en vez de `better-sqlite3`.

Edita `backend/package.json`:
```json
"dependencies": {
  "sql.js": "^1.8.0"
}
```

Y modifica el código para usar `sql.js`.

---

## 📦 Distribución del Ejecutable

### Qué Incluir

Cuando distribuyas tu aplicación, incluye:

```
APP-Finanzas/
├── app-finanzas.exe          (ejecutable)
├── .env                       (configuración)
├── README_USUARIO.md          (instrucciones)
└── tessdata/                  (opcional - para OCR)
    └── spa.traineddata
```

### Crear un Instalador (Opcional)

Usa herramientas como:
- **Inno Setup**: https://jrsoftware.org/isinfo.php
- **NSIS**: https://nsis.sourceforge.io/
- **Electron Builder**: Para apps más complejas

Ejemplo con Inno Setup:

```iss
[Setup]
AppName=APP Finanzas
AppVersion=1.0
DefaultDirName={pf}\APP Finanzas
DefaultGroupName=APP Finanzas
OutputBaseFilename=app-finanzas-setup

[Files]
Source: "app-finanzas.exe"; DestDir: "{app}"
Source: ".env"; DestDir: "{app}"

[Icons]
Name: "{group}\APP Finanzas"; Filename: "{app}\app-finanzas.exe"
```

---

## ✅ Checklist de Build

Antes de generar el .exe:

- [ ] Node.js instalado (18+ o 20.x)
- [ ] Estoy en la carpeta `backend`
- [ ] Ejecuté `npm install`
- [ ] No hay errores de TypeScript
- [ ] El código funciona con `npm run dev`
- [ ] Tengo espacio en disco (500 MB mínimo)

Para generar:

- [ ] Ejecuté `npm run build:exe`
- [ ] No hubo errores
- [ ] El archivo `app-finanzas.exe` se creó
- [ ] El tamaño del .exe es razonable (50-80 MB)

Para distribuir:

- [ ] Probé el .exe en otra máquina
- [ ] Incluí archivo `.env`
- [ ] Incluí documentación para usuarios
- [ ] Funciona sin Node.js instalado

---

## 🎯 Comandos de Referencia Rápida

### Generar el .exe

```cmd
cd backend
npm install
npm run build:exe
```

### Limpiar y Regenerar

```cmd
cd backend
rmdir /s /q dist
rmdir /s /q node_modules
npm install
npm run build:exe
```

### Ver Versión de pkg

```cmd
npx pkg --version
```

### Ayuda de pkg

```cmd
npx pkg --help
```

---

## 📚 Recursos Adicionales

- **pkg GitHub:** https://github.com/vercel/pkg
- **Documentación pkg:** https://github.com/vercel/pkg#readme
- **Node.js Binaries:** https://nodejs.org/dist/

---

## 💡 Consejos Finales

1. **Prueba el .exe** en una máquina limpia sin Node.js antes de distribuir
2. **Versiona tus builds**: `app-finanzas-v1.0.0.exe`
3. **Mantén backups** del código fuente
4. **Documenta cambios** en cada versión
5. **Incluye instrucciones** claras para usuarios finales

---

**¿Listo para generar tu ejecutable?**

```cmd
cd backend
npm install
npm run build:exe
```

¡Eso es todo! 🎉
