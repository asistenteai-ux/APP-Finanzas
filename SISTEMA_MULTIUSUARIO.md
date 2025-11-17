# 👥 Sistema Multiusuario con Roles y OCR Automático

## 🎯 OBJETIVO

Esta aplicación ahora permite que **múltiples usuarios** trabajen con ella, cada uno con diferentes permisos según su rol. Además, incluye **OCR (Reconocimiento Óptico de Caracteres)** para extraer datos automáticamente de facturas y comprobantes.

## 👤 ROLES DE USUARIO

### 1. **ADMIN (Administrador/Contador)**
- **Acceso:** TOTAL
- **Puede hacer:**
  - ✅ Ver todo
  - ✅ Crear, editar y eliminar cualquier dato
  - ✅ Generar libros contables
  - ✅ Enviar documentos al SII
  - ✅ Crear y gestionar usuarios
  - ✅ Cambiar roles de usuarios
  - ✅ Configurar el sistema
  - ✅ Ver asientos contables
  - ✅ Editar asientos contables
  - ✅ Generar declaraciones juradas

**Es el rol del contador profesional o dueño con conocimientos contables.**

---

### 2. **USUARIO (Empleado/Dueño sin conocimientos)**
- **Acceso:** LIMITADO
- **Puede hacer:**
  - ✅ Registrar gastos
  - ✅ Registrar ventas
  - ✅ Subir facturas y comprobantes
  - ✅ Ver reportes básicos
  - ✅ Ver dashboard
  - ❌ **NO puede** ver asientos contables
  - ❌ **NO puede** eliminar documentos
  - ❌ **NO puede** editar datos importantes
  - ❌ **NO puede** configurar el sistema
  - ❌ **NO puede** generar libros contables

**Es el rol para empleados o dueños que solo necesitan registrar operaciones diarias.**

---

### 3. **VISOR (Solo Lectura)**
- **Acceso:** SOLO LECTURA
- **Puede hacer:**
  - ✅ Ver todo (reportes, documentos, contabilidad)
  - ❌ **NO puede** registrar nada
  - ❌ **NO puede** editar nada
  - ❌ **NO puede** eliminar nada
  - ❌ **NO puede** subir archivos

**Es el rol para inversionistas, socios o auditores que solo necesitan revisar información.**

---

## 🚀 CÓMO EMPEZAR

### Paso 1: Instalación de Dependencias

```bash
cd backend
npm install
```

Las nuevas dependencias instaladas:
- `bcryptjs` - Encriptación de contraseñas
- `jsonwebtoken` - Tokens de autenticación
- `multer` - Subida de archivos
- `tesseract.js` - OCR para imágenes
- `pdf.js-extract` - Extracción de texto de PDFs

### Paso 2: Iniciar el Servidor

```bash
npm run dev
```

### Paso 3: Usuario Administrador por Defecto

Al iniciar por primera vez, se crea automáticamente un usuario admin:

```
Email: admin@finanzas.cl
Password: admin123
```

**⚠️ IMPORTANTE: Cambia esta contraseña inmediatamente después del primer login.**

---

## 🔐 API DE AUTENTICACIÓN

### 1. Registrar Nuevo Usuario

**POST** `/api/auth/register`

```json
{
  "nombre": "Juan Pérez",
  "email": "juan@empresa.cl",
  "password": "secreto123",
  "rol": "usuario",
  "rut": "12345678-9",
  "telefono": "+56912345678"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario registrado correctamente",
  "usuario": {
    "id": 2,
    "nombre": "Juan Pérez",
    "email": "juan@empresa.cl",
    "rol": "usuario"
  }
}
```

---

### 2. Login (Iniciar Sesión)

**POST** `/api/auth/login`

```json
{
  "email": "admin@finanzas.cl",
  "password": "admin123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre": "Administrador",
    "email": "admin@finanzas.cl",
    "rol": "admin",
    "rut": null
  }
}
```

**⚠️ IMPORTANTE:** Guarda el `token`. Debes enviarlo en todas las peticiones protegidas.

---

### 3. Usar el Token en Peticiones

Todas las peticiones protegidas requieren el token en el header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Ejemplo con cURL:
```bash
curl -H "Authorization: Bearer TU_TOKEN_AQUI" http://localhost:3000/api/dte
```

---

### 4. Ver Mi Perfil

**GET** `/api/auth/me`

Headers:
```
Authorization: Bearer TU_TOKEN
```

**Respuesta:**
```json
{
  "success": true,
  "usuario": {
    "id": 1,
    "nombre": "Administrador",
    "email": "admin@finanzas.cl",
    "rol": "admin"
  }
}
```

---

### 5. Cambiar Contraseña

**PUT** `/api/auth/cambiar-password`

Headers:
```
Authorization: Bearer TU_TOKEN
```

Body:
```json
{
  "password_actual": "admin123",
  "password_nueva": "nuevaContraseña456"
}
```

---

### 6. Gestión de Usuarios (Solo Admin)

**GET** `/api/auth/usuarios` - Listar todos los usuarios

**PUT** `/api/auth/usuarios/:id/rol` - Cambiar rol de un usuario

Body:
```json
{
  "rol": "admin"
}
```

**DELETE** `/api/auth/usuarios/:id` - Desactivar usuario

---

## 📸 SUBIDA DE ARCHIVOS Y OCR AUTOMÁTICO

### ¿Qué es OCR?

**OCR (Optical Character Recognition)** es una tecnología que **lee el texto de imágenes o PDFs** automáticamente.

En esta aplicación:
- Subes una foto de una factura
- El sistema **extrae automáticamente**: RUT, folio, fecha, montos
- Tú solo verificas y guardas

---

### 1. Subir Factura con OCR

**POST** `/api/upload/factura`

Headers:
```
Authorization: Bearer TU_TOKEN
Content-Type: multipart/form-data
```

Body (form-data):
- **archivo**: [archivo JPG, PNG o PDF]

**Respuesta:**
```json
{
  "success": true,
  "message": "Factura procesada correctamente",
  "archivo": {
    "nombre_original": "factura_123.jpg",
    "ruta": "/uploads/archivo-1234567890-123456789.jpg",
    "tamaño": 245678
  },
  "datos_extraidos": {
    "rut": "76123456-7",
    "razon_social": "EMPRESA LTDA",
    "folio": 12345,
    "fecha": "15-11-2025",
    "monto_neto": 100000,
    "monto_iva": 19000,
    "monto_total": 119000,
    "confianza": "alta"
  },
  "ayuda": {
    "mensaje": "Revisa los datos extraídos y corrígelos si es necesario antes de guardar",
    "confianza": "alta",
    "campos_detectados": {
      "rut": "✓",
      "folio": "✓",
      "fecha": "✓",
      "monto_total": "✓"
    }
  }
}
```

---

### 2. Subir Comprobante de Gasto

**POST** `/api/upload/gasto`

Headers:
```
Authorization: Bearer TU_TOKEN
Content-Type: multipart/form-data
```

Body (form-data):
- **archivo**: [archivo JPG, PNG o PDF]

Similar a `/api/upload/factura` pero optimizado para gastos.

---

### 3. Extraer Texto General

**POST** `/api/upload/extraer-texto`

Headers:
```
Authorization: Bearer TU_TOKEN
Content-Type: multipart/form-data
```

Body (form-data):
- **archivo**: [archivo JPG, PNG o PDF]

**Respuesta:**
```json
{
  "success": true,
  "archivo": "documento.pdf",
  "texto_extraido": "FACTURA ELECTRONICA N° 12345...",
  "longitud": 1234
}
```

---

### 4. Obtener Configuración de Upload

**GET** `/api/upload/configuracion`

**Respuesta:**
```json
{
  "success": true,
  "configuracion": {
    "tipos_permitidos": ["image/jpeg", "image/jpg", "image/png", "application/pdf"],
    "extensiones": [".jpg", ".jpeg", ".png", ".pdf"],
    "tamano_maximo": 10485760,
    "tamano_maximo_texto": "10MB"
  },
  "ayuda": {
    "mensaje": "Sube tu factura o comprobante en formato JPG, PNG o PDF",
    "pasos": [
      "1. Toma una foto clara del documento o escanéalo",
      "2. Sube el archivo usando el botón de abajo",
      "3. La aplicación extraerá automáticamente los datos",
      "4. Revisa y corrige los datos si es necesario",
      "5. Guarda el registro"
    ]
  }
}
```

---

## 🔒 PROTECCIÓN DE RUTAS POR ROL

### Rutas Públicas (No requieren login)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/health`

### Rutas para Usuarios Autenticados (Cualquier rol)
- `GET /api/auth/me`
- `PUT /api/auth/cambiar-password`
- `GET /api/dte`
- `GET /api/compras`
- `GET /api/recordatorios`
- `GET /api/notificaciones`
- `GET /api/libros`

### Rutas para Admin y Usuario
- `POST /api/dte`
- `POST /api/compras`
- `POST /api/upload/factura`
- `POST /api/upload/gasto`

### Rutas Solo para Admin
- `GET /api/auth/usuarios`
- `PUT /api/auth/usuarios/:id/rol`
- `DELETE /api/auth/usuarios/:id`
- `PUT /api/compras/:id`
- `DELETE /api/compras/:id`
- `POST /api/dte/:id/send`
- `POST /api/libros/:periodo/compra-venta`
- `POST /api/libros/:periodo/iecv`

---

## 🧑‍💼 FLUJO DE TRABAJO TÍPICO

### Empleado (Rol: Usuario)

1. **Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@empresa.cl","password":"secreto123"}'
```

2. **Registrar un gasto** (subiendo foto de la factura)
```bash
curl -X POST http://localhost:3000/api/upload/gasto \
  -H "Authorization: Bearer TU_TOKEN" \
  -F "archivo=@factura.jpg"
```

3. **Revisar datos extraídos** y guardar en el sistema

4. **Ver notificaciones**
```bash
curl -X GET http://localhost:3000/api/notificaciones \
  -H "Authorization: Bearer TU_TOKEN"
```

---

### Contador (Rol: Admin)

1. **Login como admin**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finanzas.cl","password":"admin123"}'
```

2. **Revisar todas las compras**
```bash
curl -X GET http://localhost:3000/api/compras \
  -H "Authorization: Bearer TU_TOKEN"
```

3. **Generar libros contables**
```bash
curl -X POST http://localhost:3000/api/libros/2025-11/compra-venta \
  -H "Authorization: Bearer TU_TOKEN"
```

4. **Enviar DTE al SII**
```bash
curl -X POST http://localhost:3000/api/dte/123/send \
  -H "Authorization: Bearer TU_TOKEN"
```

---

## 📱 EJEMPLO DE USO REAL

### Escenario: Empresa con 3 usuarios

1. **Juan (Empleado)** - Rol: `usuario`
   - Registra gastos del día
   - Sube fotos de facturas
   - El OCR extrae los datos automáticamente
   - Juan solo verifica y guarda

2. **María (Contador)** - Rol: `admin`
   - Revisa los gastos registrados por Juan
   - Corrige si hay errores
   - Genera libros contables
   - Envía documentos al SII
   - Prepara declaraciones

3. **Pedro (Inversionista)** - Rol: `visor`
   - Solo ve reportes financieros
   - No puede modificar nada
   - Revisa estado de resultados y balance

---

## ⚡ VENTAJAS DEL SISTEMA

### Para Empresas Sin Conocimientos Contables

✅ **Fácil de usar:** Solo sube la foto de la factura, el sistema hace el resto

✅ **Sin errores de digitación:** OCR extrae los datos automáticamente

✅ **Seguro:** Cada usuario solo puede hacer lo que su rol permite

✅ **Ahorro de tiempo:** No necesitas escribir RUT, montos, fechas manualmente

✅ **Control:** El admin puede revisar todo lo que hacen los demás

---

### Para Contadores

✅ **Control total:** Como admin tienes acceso a todo

✅ **Delegación segura:** Puedes dejar que empleados registren datos sin riesgo

✅ **Auditoría:** Sabes quién registró cada operación

✅ **Automatización:** El sistema hace asientos contables automáticos

---

## 🛡️ SEGURIDAD

### Contraseñas
- Encriptadas con **bcrypt** (10 rounds)
- Nunca se almacenan en texto plano
- No se pueden recuperar (solo resetear)

### Tokens JWT
- Expiran en **7 días**
- Firmados con clave secreta
- Se validan en cada petición

### Permisos
- Validados en el backend
- No se puede hacer nada sin el rol correcto
- Logs de todas las operaciones

---

## 🔧 CONFIGURACIÓN AVANZADA

### Cambiar tiempo de expiración del token

Editar `backend/src/services/auth.service.ts`:

```typescript
private readonly JWT_EXPIRES_IN = '30d'; // 30 días en vez de 7
```

### Cambiar clave secreta JWT

Editar `.env`:

```
JWT_SECRET=mi_clave_super_secreta_2025
```

---

## ❓ PREGUNTAS FRECUENTES

### ¿Puedo crear más roles?

Actualmente solo hay 3 roles (admin, usuario, visor). Para agregar más, deberías modificar el código en:
- `backend/src/services/auth.service.ts` (PERMISOS)
- `backend/src/database/schema.ts` (CHECK constraint)

### ¿El OCR siempre funciona bien?

El OCR tiene una **confianza** (alta, media, baja). Siempre revisa los datos extraídos antes de guardar. Funciona mejor con:
- Fotos claras y con buena iluminación
- Documentos escaneados
- Facturas electrónicas en PDF

### ¿Qué pasa si subo una factura borrosa?

El sistema intentará extraer los datos pero la confianza será "baja". Deberás completar manualmente los campos que no se detectaron.

### ¿Puedo eliminar el usuario admin por defecto?

Sí, pero asegúrate de crear otro admin primero. Nunca dejes la aplicación sin al menos un usuario admin.

---

## 📞 SOPORTE

Para dudas técnicas:
- Revisar logs del servidor
- Verificar que el token esté correcto
- Verificar que el rol del usuario sea el adecuado

---

**¡El sistema está listo para usar con múltiples usuarios y OCR automático!** 🎉
