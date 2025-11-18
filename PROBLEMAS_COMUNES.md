# 🔧 Solución de Problemas Comunes

## 📋 Tabla de Contenidos

1. [Problemas de Instalación](#problemas-de-instalación)
2. [Problemas al Iniciar](#problemas-al-iniciar)
3. [Errores de Dependencias](#errores-de-dependencias)
4. [Errores de Base de Datos](#errores-de-base-de-datos)
5. [Errores de Autenticación](#errores-de-autenticación)
6. [Errores de OCR](#errores-de-ocr)
7. [Problemas de Red](#problemas-de-red)
8. [Cómo Obtener Ayuda](#cómo-obtener-ayuda)

---

## 🛠️ Problemas de Instalación

### Error: "node no se reconoce como comando"

**Causa:** Node.js no está instalado o no está en el PATH.

**Solución:**
```bash
1. Descargar Node.js de: https://nodejs.org/
2. Instalar la versión LTS (recomendada)
3. IMPORTANTE: Reiniciar la computadora
4. Abrir nueva terminal y verificar: node --version
```

---

### Error: "npm install" falla con errores

**Causa:** Problemas de caché o permisos.

**Solución A - Limpiar caché:**
```bash
cd backend
npm cache clean --force
npm install
```

**Solución B - Usar modo legacy:**
```bash
npm install --legacy-peer-deps
```

**Solución C - Eliminar node_modules:**
```bash
# Windows
rmdir /s /q node_modules
npm install

# Linux/Mac
rm -rf node_modules
npm install
```

---

### Error: "EACCES: permission denied"

**Causa:** Sin permisos de escritura.

**Solución Windows:**
```bash
1. Cierra el cmd
2. Haz clic derecho en cmd
3. "Ejecutar como administrador"
4. Navega a la carpeta e intenta de nuevo
```

**Solución Linux/Mac:**
```bash
sudo npm install
```

---

## 🚀 Problemas al Iniciar

### Error: "Cannot find module 'express'"

**Causa:** Dependencias no instaladas.

**Solución:**
```bash
cd backend
npm install
```

---

### Error: "Cannot find module './config'"

**Causa:** Estructura de carpetas incorrecta.

**Verificación:**
```bash
# Debe existir: backend/src/config/index.ts
# Si no existe, descarga de nuevo el proyecto
```

---

### Error: "Port 3000 is already in use"

**Causa:** El puerto ya está ocupado.

**Solución A - Cambiar puerto:**
```bash
# Edita backend/.env
PORT=3001
```

**Solución B - Cerrar proceso:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <numero_pid> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

---

### Error: "Module not found: Can't resolve 'bcryptjs'"

**Causa:** Dependencia faltante.

**Solución:**
```bash
cd backend
npm install bcryptjs @types/bcryptjs
```

---

## 📦 Errores de Dependencias

### Error: "Cannot find module 'tesseract.js'"

**Solución:**
```bash
npm install tesseract.js
```

---

### Error: "Cannot find module 'pdf.js-extract'"

**Solución:**
```bash
npm install pdf.js-extract
```

---

### Error: "ERR_PACKAGE_PATH_NOT_EXPORTED"

**Causa:** Versión incompatible de Node.js.

**Solución:**
```bash
# Actualiza Node.js a versión 18+
# Descarga desde: https://nodejs.org/
```

---

## 💾 Errores de Base de Datos

### Error: "SQLITE_CANTOPEN: unable to open database"

**Causa:** Permisos o ruta incorrecta.

**Solución:**
```bash
# Verificar que la carpeta backend existe
# Verificar permisos de escritura
# Si el error persiste:
cd backend
mkdir -p .
# Reintentar
```

---

### Error: "SQLITE_ERROR: no such table: usuarios"

**Causa:** Base de datos no inicializada.

**Solución:**
```bash
# Eliminar base de datos corrupta
cd backend
del database.sqlite  # Windows
# rm database.sqlite  # Linux/Mac

# Reiniciar la aplicación (creará nueva BD)
npm run dev
```

---

### Error: "UNIQUE constraint failed: usuarios.email"

**Causa:** Intentando registrar email duplicado.

**Solución:**
```bash
# Usa otro email o elimina el usuario existente
# Como admin, puedes desactivar el usuario antiguo
```

---

## 🔐 Errores de Autenticación

### Error: "Token inválido o expirado"

**Causa:** El token JWT expiró (7 días por defecto).

**Solución:**
```bash
# Hacer login nuevamente para obtener nuevo token
POST /api/auth/login
```

---

### Error: "Email o contraseña incorrectos"

**Causa:** Credenciales inválidas.

**Solución:**
```bash
# Verifica que usas:
Email: admin@finanzas.cl
Password: admin123

# Si cambiaste la contraseña y la olvidaste:
# Opción 1: Eliminar database.sqlite y reiniciar
# Opción 2: Conectarte a SQLite y actualizar manualmente
```

---

### Error: "No autorizado. Token requerido"

**Causa:** No enviaste el token en el header.

**Solución:**
```bash
# Incluye en TODAS las peticiones protegidas:
Authorization: Bearer TU_TOKEN_AQUI

# Ejemplo con curl:
curl -H "Authorization: Bearer eyJhbG..." http://localhost:3000/api/dte
```

---

### Error: "Acceso denegado. Esta acción requiere rol: admin"

**Causa:** Tu usuario no tiene el rol requerido.

**Solución:**
```bash
# Solo un admin puede cambiar roles
# Pide a un admin que te cambie el rol:
PUT /api/auth/usuarios/:id/rol
Body: { "rol": "admin" }
```

---

## 📸 Errores de OCR

### Error: "Solo se permiten imágenes (JPG, PNG) o PDF"

**Causa:** Formato de archivo no soportado.

**Solución:**
```bash
# Formatos permitidos:
- .jpg
- .jpeg
- .png
- .pdf

# Convierte tu archivo a uno de estos formatos
```

---

### Error: "File too large"

**Causa:** Archivo mayor a 10MB.

**Solución:**
```bash
# Reduce el tamaño del archivo
# O edita backend/src/services/ocr.service.ts:
fileSize: 20 * 1024 * 1024  # 20MB
```

---

### Problema: "OCR no detecta datos correctamente"

**Causa:** Imagen borrosa o mal escaneada.

**Solución:**
```bash
# Consejos para mejor OCR:
1. Usa buena iluminación
2. Foto recta (no inclinada)
3. Alta resolución
4. Escanea en vez de fotografiar
5. Asegúrate que el texto sea legible

# El sistema retorna "confianza: baja" cuando no está seguro
# En ese caso, completa los datos manualmente
```

---

### Error: "Error al extraer texto de imagen: Worker failed to load"

**Causa:** Problema con Tesseract.js.

**Solución:**
```bash
cd backend
npm uninstall tesseract.js
npm install tesseract.js@latest
```

---

## 🌐 Problemas de Red

### Error: "connect ECONNREFUSED 127.0.0.1:3000"

**Causa:** El servidor no está corriendo.

**Solución:**
```bash
# Inicia el servidor:
cd backend
npm run dev

# O usa:
INICIAR_APP.bat  # Doble clic
```

---

### Error: "CORS policy blocked"

**Causa:** Petición desde origen no permitido.

**Solución:**
```bash
# Edita backend/.env:
CORS_ORIGIN=http://localhost:TU_PUERTO

# O permite todos (NO recomendado en producción):
# En backend/src/server.ts:
app.use(cors({ origin: '*' }))
```

---

### Error: "Request timeout"

**Causa:** El servidor está sobrecargado o el OCR tarda mucho.

**Solución:**
```bash
# Espera más tiempo (el OCR puede tardar 10-30 segundos)
# O aumenta el timeout en tu cliente
```

---

## 🔍 Cómo Obtener Ayuda

### 1. Verificar Instalación

```bash
# Ejecuta el verificador:
VERIFICAR.bat  # Doble clic

# O manualmente:
node --version
npm --version
cd backend
npm list
```

---

### 2. Ver Logs Detallados

```bash
# Los logs se muestran en la terminal donde corre el servidor
# Busca mensajes que digan:
- ❌ ERROR
- ⚠️ ADVERTENCIA
```

---

### 3. Verificar Estado del Servidor

```bash
# Abre navegador en:
http://localhost:3000

# Deberías ver un JSON con info de la API
```

---

### 4. Probar Endpoint de Health

```bash
# En navegador o Postman:
GET http://localhost:3000/api/health

# Debería responder:
{
  "status": "ok",
  "message": "API funcionando correctamente"
}
```

---

## 🆘 Comandos Útiles de Diagnóstico

### Verificar que Node.js funciona:
```bash
node --version
npm --version
```

### Listar dependencias instaladas:
```bash
cd backend
npm list --depth=0
```

### Verificar archivos del proyecto:
```bash
cd backend
dir src  # Windows
ls -la src  # Linux/Mac
```

### Ver procesos usando puerto 3000:
```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

### Limpiar todo y empezar de cero:
```bash
cd backend

# Eliminar dependencias
rmdir /s /q node_modules  # Windows
rm -rf node_modules  # Linux/Mac

# Eliminar base de datos
del database.sqlite  # Windows
rm database.sqlite  # Linux/Mac

# Reinstalar
npm install

# Reiniciar
npm run dev
```

---

## 📝 Checklist de Verificación

Antes de pedir ayuda, verifica:

- [ ] Node.js 18+ instalado
- [ ] Reiniciaste el PC después de instalar Node.js
- [ ] Estás en la carpeta `backend`
- [ ] Ejecutaste `npm install` sin errores
- [ ] Existe el archivo `.env`
- [ ] Existe la carpeta `uploads`
- [ ] El puerto 3000 está disponible
- [ ] No hay otros procesos de Node.js corriendo
- [ ] Logs del servidor no muestran errores

---

## 🐛 Reportar un Bug

Si encontraste un error que no está en esta lista:

1. **Copia el error completo** de la terminal
2. **Indica qué estabas haciendo** cuando ocurrió
3. **Comparte tu configuración:**
   - Sistema operativo
   - Versión de Node.js
   - Versión de npm
   - Contenido de `.env` (SIN passwords)

---

## ✅ Soluciones Rápidas

| Problema | Solución Rápida |
|----------|-----------------|
| Node.js no reconocido | Instalar Node.js y reiniciar PC |
| npm install falla | `npm cache clean --force` |
| Puerto ocupado | Cambiar PORT en .env |
| Token expirado | Hacer login de nuevo |
| OCR no funciona | Subir imagen más clara |
| Base de datos error | Eliminar database.sqlite |
| Módulo no encontrado | `npm install` |
| Permisos denegados | Ejecutar como administrador |

---

**¿Aún tienes problemas?**

1. Ejecuta `VERIFICAR.bat` para diagnóstico completo
2. Revisa los logs en la terminal del servidor
3. Lee la documentación completa en `README.md`
4. Consulta `GUIA_INSTALACION_WINDOWS.md`

---

**💡 TIP:** El 90% de los problemas se solucionan con:
```bash
cd backend
npm cache clean --force
rm -rf node_modules
npm install
npm run dev
```
