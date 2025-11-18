# 🚀 Instalación Manual - Copia y Pega los Comandos

## ✅ Instalación en 5 Pasos (10 minutos)

No necesitas archivos .bat ni .exe. Solo **copia y pega** estos comandos.

---

## 📋 Requisitos Previos

### Instalar Node.js (si no lo tienes)

1. Ve a: **https://nodejs.org/**
2. Descarga la versión **LTS 20.x** (NO la 24.x)
3. Instala (dale "Siguiente" a todo)
4. **REINICIA TU PC** (muy importante)

---

## 🎯 Instalación Paso a Paso

### Paso 1: Abrir Terminal

1. Presiona `Windows + R`
2. Escribe: `cmd`
3. Presiona Enter

Se abrirá una ventana negra (terminal).

---

### Paso 2: Navegar a la Carpeta del Proyecto

**Copia y pega** este comando (ajusta la ruta a donde esté tu proyecto):

```cmd
cd C:\Users\TuUsuario\Desktop\APP-Finanzas\backend
```

**IMPORTANTE:** Cambia `C:\Users\TuUsuario\Desktop\APP-Finanzas` por la ruta real donde descargaste el proyecto.

**Truco fácil para obtener la ruta:**
1. Abre la carpeta `APP-Finanzas\backend` en el explorador de Windows
2. Haz clic en la barra de direcciones (arriba)
3. Copia la ruta completa
4. Pégala en el comando `cd` arriba

---

### Paso 3: Instalar Dependencias

**Copia y pega** este comando:

```cmd
npm install
```

**Espera 3-5 minutos.** Verás muchas líneas de texto pasando. Es normal.

Cuando termine, verás algo como:
```
added 234 packages in 3m
```

---

### Paso 4: Crear Archivo de Configuración

**Copia y pega** estos comandos **UNO POR UNO**:

```cmd
echo NODE_ENV=development > .env
```

```cmd
echo PORT=3000 >> .env
```

```cmd
echo DATABASE_PATH=./database.sqlite >> .env
```

```cmd
echo JWT_SECRET=mi_secreto_super_seguro_2025_app_finanzas_chile >> .env
```

```cmd
echo SII_ENVIRONMENT=certificacion >> .env
```

```cmd
echo CORS_ORIGIN=http://localhost:5173 >> .env
```

---

### Paso 5: Iniciar la Aplicación

**Copia y pega** este comando:

```cmd
npm run dev
```

Verás algo como:
```
✅ Servidor iniciado exitosamente!
📍 URL: http://localhost:3000
🔐 Usuario admin por defecto: admin@finanzas.cl / admin123
```

**¡LISTO!** La aplicación está corriendo.

---

## 🌐 Usar la Aplicación

1. Abre tu navegador (Chrome, Firefox, Edge, etc.)
2. Ve a: **http://localhost:3000**
3. Usa estas credenciales:
   - **Email:** admin@finanzas.cl
   - **Password:** admin123

---

## ⏸️ Detener la Aplicación

1. Ve a la ventana negra (terminal)
2. Presiona `Ctrl + C`
3. Escribe `S` y presiona Enter

---

## 🔄 Iniciar la Aplicación Otra Vez

Cada vez que quieras usar la aplicación:

1. Abre terminal (cmd)
2. Navega a la carpeta:
   ```cmd
   cd C:\ruta\a\APP-Finanzas\backend
   ```
3. Ejecuta:
   ```cmd
   npm run dev
   ```

---

## ❌ Solución de Problemas

### Error: "npm no se reconoce como comando"

**Solución:**
1. Instala Node.js desde: https://nodejs.org/
2. Descarga versión **LTS 20.x**
3. **Reinicia tu PC**
4. Intenta de nuevo

---

### Error: "no se puede encontrar la ruta especificada"

**Solución:**
Verifica que estás en la carpeta correcta:
```cmd
dir
```

Deberías ver el archivo `package.json` en la lista.

Si NO lo ves, estás en la carpeta incorrecta. Navega a la carpeta `backend`.

---

### Error: "Cannot find module..."

**Solución:**
```cmd
npm cache clean --force
npm install
```

---

### Error: "Puerto 3000 ya está en uso"

**Solución:**
Edita el archivo `.env` y cambia:
```
PORT=3001
```

Luego reinicia la aplicación.

---

## 📝 Resumen de Comandos (Copia Todo)

Para instalación completa, copia todo esto y pégalo en cmd:

```cmd
cd C:\ruta\a\APP-Finanzas\backend
npm install
echo NODE_ENV=development > .env
echo PORT=3000 >> .env
echo DATABASE_PATH=./database.sqlite >> .env
echo JWT_SECRET=mi_secreto_super_seguro_2025_app_finanzas_chile >> .env
echo SII_ENVIRONMENT=certificacion >> .env
echo CORS_ORIGIN=http://localhost:5173 >> .env
npm run dev
```

**IMPORTANTE:** Cambia `C:\ruta\a\APP-Finanzas\backend` por tu ruta real.

---

## 🎯 Alternativa: Usar PowerShell

Si cmd no funciona, usa PowerShell:

1. Presiona `Windows + X`
2. Selecciona "Windows PowerShell"
3. Ejecuta:
   ```powershell
   cd C:\ruta\a\APP-Finanzas\backend
   npm install
   npm run dev
   ```

---

## ✅ Verificación Final

Después de `npm run dev`, deberías ver:

```
🚀 Iniciando APP Finanzas Backend...
✅ Base de datos inicializada correctamente
👤 Usuario admin creado: admin@finanzas.cl
✅ Servidor iniciado exitosamente!
📍 URL: http://localhost:3000
```

Si ves esto, **¡TODO FUNCIONA!** 🎉

Abre http://localhost:3000 en tu navegador.

---

## 💡 Consejo

Guarda estos comandos en un archivo de texto para usarlos después sin buscar.

---

**¿Sigues teniendo problemas?** Copia el error exacto que recibes y te ayudo a solucionarlo.
