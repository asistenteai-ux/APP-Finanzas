# 📋 Guía de Instalación - APP Finanzas

## ⚙️ Requisitos Previos

Antes de comenzar, asegúrese de tener instalado:

- **Node.js 18+** y npm
- **Git** para clonar el repositorio
- **Certificado Digital** (.pfx o .p12) para firma electrónica
- **RUT de empresa** registrada en el SII

## 🚀 Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd APP-Finanzas
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

#### Configurar Variables de Entorno

Copiar el archivo de ejemplo y editarlo:

```bash
cp .env.example .env
```

Editar `.env` con sus datos:

```env
PORT=3001
NODE_ENV=development
DATABASE_PATH=./database.sqlite

# SII Configuration
SII_ENVIRONMENT=certificacion  # Usar "certificacion" para pruebas
SII_RUT=12345678-9             # Su RUT de empresa
SII_COMPANY_NAME=Mi Empresa SpA
SII_COMPANY_ADDRESS=Av. Ejemplo 123, Santiago
SII_COMPANY_ACTIVITY=Servicios de Tecnología

# Certificado Digital
CERT_PATH=./certificates/certificado.pfx
CERT_PASSWORD=tu_password_certificado

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### Configurar Certificado Digital

1. Crear carpeta para certificados:
```bash
mkdir certificates
```

2. Copiar su certificado digital:
```bash
cp /ruta/a/tu/certificado.pfx ./certificates/
```

**⚠️ IMPORTANTE:** Nunca suba su certificado digital a Git. La carpeta `certificates/` está en `.gitignore`.

### 3. Configurar el Frontend

Abrir una nueva terminal:

```bash
cd frontend
npm install
```

### 4. Iniciar la Aplicación

#### Terminal 1 - Backend:

```bash
cd backend
npm run dev
```

El backend estará disponible en: http://localhost:3001

#### Terminal 2 - Frontend:

```bash
cd frontend
npm run dev
```

El frontend estará disponible en: http://localhost:5173

## 🔐 Configuración del SII

### Ambiente de Certificación (Pruebas)

Para probar la aplicación sin afectar datos reales, use el ambiente de certificación del SII:

1. En `.env`, configurar: `SII_ENVIRONMENT=certificacion`
2. Obtener certificado de prueba del SII
3. Los DTEs se enviarán a `maullin.sii.cl` (servidor de pruebas)

### Ambiente de Producción

**⚠️ SOLO cuando esté listo para operar en producción:**

1. En `.env`, configurar: `SII_ENVIRONMENT=produccion`
2. Usar certificado digital de producción
3. Los DTEs se enviarán a `palena.sii.cl` (servidor real del SII)

## 📝 Primeros Pasos

### 1. Verificar Conexión

Una vez iniciada la aplicación, abrir: http://localhost:5173

Debería ver el Dashboard principal.

### 2. Configurar Recordatorios

La aplicación viene con recordatorios por defecto:
- **F29** - Declaración mensual IVA (día 12 de cada mes)
- **F22** - Operación Renta (abril)
- **Declaraciones Juradas** (febrero-marzo)
- **Patente Comercial** (enero y julio)

### 3. Solicitar Folios Electrónicos

Antes de emitir DTEs, debe:

1. Ingresar al portal del SII: https://maullin.sii.cl (certificación) o https://palena.sii.cl (producción)
2. Ir a "Timbraje Electrónico"
3. Solicitar folios para:
   - Facturas (Tipo 33)
   - Boletas (Tipo 39)
   - Notas de Crédito (Tipo 61)

**Nota:** La aplicación gestiona los folios automáticamente una vez obtenidos del SII.

### 4. Crear su Primera Factura

1. Ir a **Facturas** en el menú lateral
2. Click en **"Crear Factura Electrónica"**
3. Completar datos del receptor
4. Agregar productos/servicios
5. Guardar documento
6. Enviar al SII

## 🐛 Solución de Problemas

### Error: "Certificado digital no encontrado"

**Solución:**
- Verificar que el certificado está en `backend/certificates/`
- Verificar que `CERT_PATH` en `.env` apunta al archivo correcto
- Verificar que `CERT_PASSWORD` es correcto

### Error: "No se pudo obtener token del SII"

**Solución:**
- Verificar conexión a Internet
- Verificar que el certificado es válido y no está vencido
- Si usa certificación, verificar que `SII_ENVIRONMENT=certificacion`
- Verificar que los servicios del SII están disponibles

### Error de CORS en el frontend

**Solución:**
- Verificar que el backend está corriendo en puerto 3001
- Verificar que `CORS_ORIGIN` en `.env` del backend es `http://localhost:5173`

### Base de datos no se crea

**Solución:**
- Verificar permisos de escritura en carpeta `backend/`
- Eliminar `database.sqlite` si existe y reiniciar el backend

## 📚 Documentación Oficial del SII

- Portal SII: https://www.sii.cl
- Facturación Electrónica: https://www.sii.cl/factura_electronica/
- Manuales Técnicos: https://www.sii.cl/servicios_online/
- Calendario Tributario: https://misiir.sii.cl/cgi_calendario/calendario.cgi

## 🔧 Comandos Útiles

### Backend

```bash
npm run dev      # Iniciar en modo desarrollo
npm run build    # Compilar TypeScript
npm start        # Iniciar versión compilada
```

### Frontend

```bash
npm run dev      # Iniciar en modo desarrollo
npm run build    # Compilar para producción
npm run preview  # Preview de build de producción
```

## 📞 Soporte

### Consultas SII
- Call Center: 223 951 5000
- Portal: https://www.sii.cl
- Email técnico: ayuda@sii.cl

### Documentación del Proyecto
Ver archivo `README.md` para más detalles sobre la arquitectura y funcionalidades.

## ⚠️ Advertencias Importantes

1. **NUNCA** comparta su certificado digital
2. **NUNCA** suba su archivo `.env` a Git
3. **SIEMPRE** pruebe en ambiente de certificación primero
4. **RESPALDE** su base de datos regularmente
5. **CONSULTE** con su contador antes de enviar DTEs al SII

---

✅ **¡Listo!** Su aplicación de gestión tributaria está configurada y lista para usar.

Para más información, consulte el archivo `README.md` o visite la documentación oficial del SII.
