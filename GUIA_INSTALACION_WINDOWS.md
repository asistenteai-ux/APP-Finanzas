# 📦 Guía de Instalación Paso a Paso - Windows

## 🎯 GUÍA COMPLETA PARA PRINCIPIANTES

Esta guía te enseñará a instalar la aplicación **desde cero**, aunque no sepas nada de programación.

---

## ⚡ OPCIÓN 1: INSTALACIÓN AUTOMÁTICA (MÁS FÁCIL)

### Paso 1: Descargar el código

1. Si descargaste un archivo ZIP:
   - Haz clic derecho sobre el archivo ZIP
   - Selecciona "Extraer aquí" o "Extraer todo"
   - Se creará una carpeta llamada `APP-Finanzas`

2. Si usaste Git:
   - Ya tienes la carpeta lista

### Paso 2: Instalar Node.js (si no lo tienes)

1. Ve a: **https://nodejs.org/**
2. Descarga la versión **LTS** (la que dice "Recomendada para la mayoría")
3. Ejecuta el instalador descargado
4. Haz clic en "Next" (Siguiente) hasta terminar
5. **Reinicia tu computadora** después de instalar

### Paso 3: Ejecutar el instalador automático

1. Ve a la carpeta `APP-Finanzas`
2. Busca el archivo **INSTALAR.bat**
3. **Haz doble clic** sobre él
4. Se abrirá una ventana negra que hará todo automáticamente
5. Espera a que termine (puede tardar 3-5 minutos)
6. Cuando pregunte "¿Quieres iniciar la aplicación ahora?", escribe **S** y presiona Enter

### Paso 4: ¡Listo!

La aplicación está corriendo en: **http://localhost:3000**

Para detener la aplicación, presiona **Ctrl+C** en la ventana negra.

---

## 🛠️ OPCIÓN 2: INSTALACIÓN MANUAL (PASO A PASO)

Si el instalador automático no funciona, sigue estos pasos manualmente:

### Paso 1: Verificar que Node.js está instalado

1. Presiona `Windows + R`
2. Escribe: **cmd**
3. Presiona Enter
4. En la ventana negra, escribe:
   ```
   node --version
   ```
5. Deberías ver algo como: `v20.10.0`
6. Si dice "no se reconoce el comando", necesitas instalar Node.js primero

### Paso 2: Navegar a la carpeta del proyecto

En la ventana negra (cmd), escribe:

```cmd
cd C:\ruta\donde\esta\APP-Finanzas\backend
```

**Ejemplo:**
```cmd
cd C:\Users\TuNombre\Desktop\APP-Finanzas\backend
```

**Truco fácil:**
1. Abre la carpeta `APP-Finanzas\backend` en el explorador de Windows
2. Haz clic en la barra de direcciones (donde dice la ruta)
3. Escribe **cmd** y presiona Enter
4. Se abrirá cmd ya en la carpeta correcta

### Paso 3: Instalar dependencias

En la ventana cmd, escribe:

```cmd
npm install
```

**IMPORTANTE:** Este paso puede tardar **5-10 minutos**. Espera pacientemente.

Verás algo como:
```
downloading packages...
installing packages...
```

### Paso 4: Crear archivo de configuración

1. Ve a la carpeta `backend`
2. Crea un archivo nuevo llamado: **.env**
3. Ábrelo con el Bloc de notas
4. Copia y pega esto:

```env
# Configuración de la aplicación
NODE_ENV=development
PORT=3000

# Base de datos
DATABASE_PATH=./database.sqlite

# JWT Secret (cambia esto en producción)
JWT_SECRET=mi_secreto_super_seguro_2025_app_finanzas_chile

# SII Chile Configuration
SII_ENVIRONMENT=certificacion
SII_RUT=
SII_COMPANY_NAME=
SII_CERT_PATH=
SII_CERT_PASSWORD=

# CORS
CORS_ORIGIN=http://localhost:5173
```

5. Guarda el archivo

**Nota:** El archivo debe llamarse exactamente `.env` (con el punto al inicio)

### Paso 5: Crear carpeta para uploads

En la carpeta `backend`, crea una carpeta nueva llamada: **uploads**

### Paso 6: Iniciar la aplicación

En la ventana cmd (dentro de la carpeta backend), escribe:

```cmd
npm run dev
```

Deberías ver algo como:

```
🚀 Iniciando APP Finanzas Backend...

⚙️  Validando configuración...
📊 Inicializando base de datos...
✅ Base de datos inicializada correctamente
👤 Verificando usuario administrador...
✅ Usuario admin creado: admin@finanzas.cl
🔔 Configurando procesamiento de recordatorios...

✅ Servidor iniciado exitosamente!

📍 URL: http://localhost:3000
🌍 Ambiente: development
🔐 Usuario admin por defecto: admin@finanzas.cl / admin123
```

### Paso 7: Probar que funciona

1. Abre tu navegador (Chrome, Firefox, Edge, etc.)
2. Ve a: **http://localhost:3000**
3. Deberías ver un JSON con la información de la API

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Problema 1: "node no se reconoce como comando"

**Solución:**
1. Instala Node.js desde: https://nodejs.org/
2. Reinicia tu computadora
3. Vuelve a intentar

### Problema 2: "npm install" da errores

**Solución A - Limpiar caché:**
```cmd
npm cache clean --force
npm install
```

**Solución B - Usar versión antigua de npm:**
```cmd
npm install --legacy-peer-deps
```

### Problema 3: "Error: Cannot find module..."

**Solución:**
```cmd
cd backend
npm install
```

Asegúrate de estar en la carpeta `backend`.

### Problema 4: El puerto 3000 está ocupado

**Solución:**

1. Edita el archivo `.env`
2. Cambia la línea:
   ```
   PORT=3000
   ```
   Por:
   ```
   PORT=3001
   ```
3. Guarda y reinicia la aplicación

### Problema 5: "Access denied" o "Permiso denegado"

**Solución:**
1. Cierra el cmd
2. Haz clic derecho en "cmd" o "Terminal"
3. Selecciona "Ejecutar como administrador"
4. Vuelve a intentar

---

## 🚀 CÓMO USAR LA APLICACIÓN

### Primera vez - Login como Admin

1. Abre tu navegador
2. Ve a: **http://localhost:3000**
3. Usa el cliente API (Postman, Thunder Client, o cURL)
4. Haz login:

**POST** `http://localhost:3000/api/auth/login`

Body:
```json
{
  "email": "admin@finanzas.cl",
  "password": "admin123"
}
```

5. Copia el `token` que recibes en la respuesta
6. Usa ese token en todas las peticiones

### Crear tu primer usuario

**POST** `http://localhost:3000/api/auth/register`

Body:
```json
{
  "nombre": "Tu Nombre",
  "email": "tu@email.com",
  "password": "tuContraseña",
  "rol": "usuario",
  "rut": "12345678-9"
}
```

---

## 🛡️ SEGURIDAD

### ⚠️ IMPORTANTE - Cambia la contraseña del admin

Después de instalar, **INMEDIATAMENTE** cambia la contraseña por defecto:

**PUT** `http://localhost:3000/api/auth/cambiar-password`

Headers:
```
Authorization: Bearer TU_TOKEN
```

Body:
```json
{
  "password_actual": "admin123",
  "password_nueva": "TuNuevaContraseñaSegura123!"
}
```

### Configuración para producción

Si vas a usar la app en producción (no solo para pruebas):

1. Edita el archivo `.env`
2. Cambia estas líneas:

```env
NODE_ENV=production
JWT_SECRET=genera_un_secreto_muy_largo_y_aleatorio_aqui
SII_ENVIRONMENT=produccion
```

**⚠️ NUNCA** compartas tu archivo `.env` con nadie.

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
APP-Finanzas/
├── backend/                    ← Carpeta principal del servidor
│   ├── src/                    ← Código fuente
│   │   ├── controllers/        ← Controladores de la API
│   │   ├── services/           ← Lógica de negocio
│   │   ├── routes/             ← Rutas de la API
│   │   ├── middleware/         ← Middleware de autenticación
│   │   ├── database/           ← Esquema de base de datos
│   │   └── server.ts           ← Archivo principal
│   ├── uploads/                ← Archivos subidos (facturas, etc.)
│   ├── package.json            ← Dependencias
│   ├── .env                    ← Configuración (CREAR MANUALMENTE)
│   └── database.sqlite         ← Base de datos (se crea automáticamente)
├── INSTALAR.bat                ← Instalador automático
├── GUIA_INSTALACION_WINDOWS.md ← Este archivo
├── SISTEMA_MULTIUSUARIO.md     ← Guía de uso del sistema
└── README.md                   ← Documentación general
```

---

## 🎓 PRÓXIMOS PASOS

Después de instalar:

1. **Lee:** `SISTEMA_MULTIUSUARIO.md` - Cómo usar el sistema
2. **Lee:** `FUNCIONALIDADES_CONTADOR.md` - Todo lo que puede hacer la app
3. **Lee:** `CUMPLIMIENTO_NORMATIVO.md` - Cumplimiento legal SII

---

## ⏸️ DETENER LA APLICACIÓN

Para detener el servidor:

1. Ve a la ventana negra (cmd) donde está corriendo
2. Presiona **Ctrl+C**
3. Se preguntará "Terminar programa por lotes (S/N)?"
4. Escribe **S** y presiona Enter

---

## 🔄 INICIAR LA APLICACIÓN DESPUÉS DE INSTALAR

Cada vez que quieras usar la aplicación:

1. Abre cmd
2. Navega a la carpeta backend:
   ```cmd
   cd C:\ruta\a\APP-Finanzas\backend
   ```
3. Ejecuta:
   ```cmd
   npm run dev
   ```
4. Deja la ventana abierta mientras usas la app
5. Para detener, presiona **Ctrl+C**

---

## 📞 AYUDA

### Logs y errores

Si algo no funciona, revisa los logs en la ventana negra. Busca mensajes que digan:

- ❌ ERROR
- ⚠️ ADVERTENCIA

Copia el error completo para buscar ayuda.

### Archivos importantes

- **database.sqlite** - Base de datos (NO borrar)
- **.env** - Configuración (NO compartir)
- **uploads/** - Facturas subidas (NO borrar)

---

## 🎉 ¡FELICIDADES!

Si llegaste hasta aquí, la aplicación debería estar funcionando correctamente.

**Recuerda:**
- Usuario admin: `admin@finanzas.cl`
- Password: `admin123`
- URL: `http://localhost:3000`

---

## 🚀 BONUS: Crear un acceso directo

Para no tener que abrir cmd cada vez:

1. Crea un archivo llamado: **INICIAR_APP.bat**
2. Ábrelo con Bloc de notas
3. Escribe:
   ```bat
   @echo off
   cd C:\ruta\a\APP-Finanzas\backend
   npm run dev
   pause
   ```
4. Guarda el archivo
5. Ahora solo haz doble clic en **INICIAR_APP.bat** para iniciar la app

---

**¿Todo funcionó? ¡Perfecto! Ahora lee `SISTEMA_MULTIUSUARIO.md` para aprender a usar la aplicación.**
