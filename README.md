# 💼 APP Finanzas - Sistema de Gestión Tributaria para Chile

Sistema completo de gestión financiera y tributaria que cumple con todas las normativas del SII de Chile. Permite gestionar compras, ventas, gastos, emitir documentos tributarios electrónicos (DTEs) y conectarse directamente con el SII.

## ⚠️ ADVERTENCIA LEGAL IMPORTANTE

**Esta aplicación es una herramienta de apoyo para la gestión tributaria.**

- ✅ Cumple con normativas vigentes del SII de Chile
- ⚠️ La responsabilidad tributaria es del contribuyente
- 📋 Se recomienda contar con asesoría de un contador profesional
- 🔐 NUNCA compartir certificado digital ni credenciales
- ✅ Siempre probar en ambiente de certificación primero

**Ver documento completo:** [CUMPLIMIENTO_NORMATIVO.md](./CUMPLIMIENTO_NORMATIVO.md)

## ✨ Características Principales

### 📄 Documentos Tributarios Electrónicos (DTE)
- ✅ Facturas Electrónicas (Tipo 33)
- ✅ Boletas Electrónicas (Tipo 39)
- ✅ Notas de Crédito (Tipo 61)
- ✅ Guías de Despacho (Tipo 52)
- ✅ Timbraje electrónico automático
- ✅ Firma digital de documentos

### 💰 Gestión Financiera
- 📊 Control de compras y gastos
- 💵 Registro de ventas e ingresos
- 📈 Dashboard con resumen financiero
- 📉 Reportes de IVA (débito y crédito fiscal)
- 💳 Control de pagos y cobros

### 👥 Sistema Multiusuario con Roles (NUEVO)
- 🔐 **Autenticación JWT** con contraseñas encriptadas
- 👤 **3 Roles de Usuario:**
  - **Admin** (Contador): Control total del sistema
  - **Usuario** (Empleado): Solo puede registrar datos
  - **Visor** (Inversionista): Solo lectura
- 🔒 **Permisos granulares** por rol
- 👨‍💼 Usuario administrador por defecto creado automáticamente
- 📱 Múltiples usuarios trabajando simultáneamente

### 📸 OCR Automático de Facturas (NUEVO)
- 🤖 **Extracción automática de datos** de facturas escaneadas
- 📷 Soporta **imágenes** (JPG, PNG) y **PDFs**
- 🎯 Detecta automáticamente:
  - RUT del proveedor
  - Número de folio
  - Fecha del documento
  - Montos (neto, IVA, total)
  - Razón social
- ✨ **Súper fácil:** Solo sube la foto, el sistema hace el resto
- ⚡ Ahorra tiempo y evita errores de digitación

### 📚 Libros Contables Electrónicos (OBLIGATORIO por ley)
- ✅ **Libro de Compras y Ventas** - Envío mensual (antes del día 10)
- ✅ **IECV** (Información Electrónica Compras y Ventas)
- ✅ **Resumen automático para F29**
- ✅ Generación de XML según formato SII
- ✅ Firma digital automática
- ⚠️ Libro Diario y Mayor (estructura básica - requiere contabilidad completa)

### 🔔 Recordatorios Tributarios Inteligentes
- ⏰ **F29** (Declaración mensual IVA) - Día 12 de cada mes
- 📚 **Libros Electrónicos** - Día 10 de cada mes (NUEVO)
- 📅 **F22** (Operación Renta) - Abril
- 📋 **Declaraciones Juradas** - Febrero/Marzo (DJ 1812, 1834, 1887, 1879, 1926, 1948, 1947)
- 🏢 **Patente Comercial** - Enero y Julio
- ⚡ Notificaciones automáticas: 60, 30, 15, 7, 3 y 1 días antes del vencimiento

### 🔐 Integración Directa con SII
- 🔑 Autenticación con certificado digital
- 📤 Envío automático de DTEs
- ✅ Validación de documentos en tiempo real
- 🔄 Sincronización de folios electrónicos
- 🌐 Ambiente de certificación y producción

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** + **Express** + **TypeScript**
- **SQLite** para base de datos local
- **xml2js** para generación de XML
- **node-forge** para firma digital
- **soap** para servicios web del SII
- **bcryptjs** para encriptación de contraseñas
- **jsonwebtoken** para autenticación JWT
- **multer** para subida de archivos
- **tesseract.js** para OCR de imágenes
- **pdf.js-extract** para extracción de texto de PDFs

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS** para diseño moderno
- **Vite** como bundler
- **React Router** para navegación
- **Axios** para peticiones HTTP
- **React Query** para gestión de estado

## 🚀 Instalación y Configuración

### ⚡ INSTALACIÓN SUPER SIMPLE (5 pasos)

**Solo copia y pega comandos. Sin archivos .bat ni .exe necesarios.**

#### Paso 1: Instalar Node.js

1. Ve a: **https://nodejs.org/**
2. Descarga la versión **LTS 20.x**
3. Instala (dale "Siguiente" a todo)
4. **REINICIA tu PC**

#### Paso 2: Abrir Terminal

- Presiona `Windows + R`
- Escribe: `cmd`
- Presiona Enter

#### Paso 3: Navegar a la Carpeta del Proyecto

```cmd
cd C:\ruta\donde\descargaste\APP-Finanzas\backend
```

**Truco:** Abre la carpeta `backend` en el explorador, haz clic en la barra de direcciones, copia la ruta, y úsala en el comando `cd`.

#### Paso 4: Instalar Dependencias (Tarda 3-5 minutos)

```cmd
npm install
```

Espera a que termine.

#### Paso 5: Iniciar la Aplicación

```cmd
npm run dev
```

**¡LISTO!** Abre tu navegador en: **http://localhost:3000**

**Credenciales:**
- Email: `admin@finanzas.cl`
- Password: `admin123`

---

### 📖 Guía Detallada

Si necesitas instrucciones más detalladas: **[INSTALACION_MANUAL.md](./INSTALACION_MANUAL.md)**

---

### 🔄 Alternativa: PowerShell (Más Moderno)

Si prefieres usar PowerShell:

1. **Click derecho** en `instalar.ps1`
2. Selecciona **"Ejecutar con PowerShell"**
3. Sigue las instrucciones

---

### 🛠️ Requisitos

- **Node.js 20.x LTS** (obligatorio)
- Certificado digital SII (opcional - solo si usarás integración SII)
- RUT de empresa (opcional)

### ⏸️ Detener la Aplicación

1. Ve a la terminal donde está corriendo
2. Presiona `Ctrl + C`
3. Escribe `S` y presiona Enter

---

### 🔄 Iniciar Después

Para usar la aplicación otra vez:

```cmd
cd C:\ruta\a\APP-Finanzas\backend
npm run dev
```

---

## 📚 Documentación del SII

Esta aplicación se basa en la documentación oficial del SII:

- **Facturación Electrónica**: https://www.sii.cl/factura_electronica/
- **Servicios Web**: Endpoints en maullin.sii.cl (certificación) y palena.sii.cl (producción)
- **Calendario Tributario**: https://misiir.sii.cl/cgi_calendario/calendario.cgi

### Servicios Web del SII Implementados

**Autenticación:**
- `CrSeed.jws` - Obtener semilla
- `GetTokenFromSeed.jws` - Generar token

**Documentos Tributarios:**
- `DTEUpload` - Envío de DTEs
- `QueryEstDte.jws` - Consulta estado DTE
- `QueryEstUp.jws` - Consulta estado de envío

## 📖 Guía de Uso

### 1. Configuración Inicial
- Importar certificado digital
- Configurar datos de la empresa
- Solicitar folios electrónicos al SII

### 2. Emisión de Documentos
- Crear factura o boleta
- Sistema genera XML según formato SII
- Firma automática con certificado digital
- Envío automático al SII
- Obtención de folio timbrado

### 3. Gestión de Compras y Gastos
- Registrar compras con IVA
- Subir documentos respaldo (PDF/XML)
- Clasificación por categorías
- Cálculo automático de crédito fiscal

### 4. Declaraciones Tributarias
- Vista previa de F29 con datos del período
- Cálculo automático de débito y crédito fiscal
- Exportación de información para declaración
- Recordatorios automáticos de vencimientos

## 🔒 Seguridad

- ⚠️ **NUNCA** compartir el certificado digital
- 🔐 Archivo `.env` no se sube al repositorio (incluido en .gitignore)
- 🛡️ Certificados almacenados localmente en carpeta protegida
- 🔑 Tokens de autenticación con tiempo de expiración
- 🚨 Validación de RUT chileno en todos los documentos

## 📝 Normativa SII

Esta aplicación cumple con:
- ✅ Resolución Exenta SII N° 44/2025 (Boletas electrónicas nominativas)
- ✅ Formato XML DTE versión 2.2
- ✅ Timbraje electrónico según instructivo técnico SII
- ✅ Firma electrónica con certificado digital válido
- ✅ Esquemas XSD oficiales del SII

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork del proyecto
2. Crear rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## ⚖️ Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## ⚠️ Disclaimer

Esta aplicación es una herramienta de apoyo para la gestión tributaria. Se recomienda siempre contar con asesoría de un contador profesional para asegurar el cumplimiento tributario completo. El desarrollador no se hace responsable por errores en declaraciones o uso inadecuado del sistema.

## 📞 Soporte

Para consultas sobre el SII:
- 📞 Call Center SII: 223 951 5000
- 🌐 Portal SII: https://www.sii.cl
- 📧 Consultas técnicas: ayuda@sii.cl

---

Desarrollado con ❤️ para facilitar la gestión tributaria de empresas chilenas
