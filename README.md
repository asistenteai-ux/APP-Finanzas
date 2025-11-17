# 💼 APP Finanzas - Sistema de Gestión Tributaria para Chile

Sistema completo de gestión financiera y tributaria que cumple con todas las normativas del SII de Chile. Permite gestionar compras, ventas, gastos, emitir documentos tributarios electrónicos (DTEs) y conectarse directamente con el SII.

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

### 🔔 Recordatorios Tributarios Inteligentes
- ⏰ Formulario F29 (Declaración mensual IVA) - Día 12 de cada mes
- 📅 Operación Renta F22 (Anual) - Abril
- 📋 Declaraciones Juradas - Febrero/Marzo
- 🏢 Patente Comercial - Enero y Julio
- ⚡ Notificaciones de 30, 15, 7 y 3 días antes del vencimiento

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

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS** para diseño moderno
- **Vite** como bundler
- **React Router** para navegación
- **Axios** para peticiones HTTP
- **React Query** para gestión de estado

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js 18+ y npm
- Certificado digital (.pfx o .p12) para firma electrónica
- RUT de empresa registrada en el SII

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd APP-Finanzas
```

2. **Instalar dependencias del backend**
```bash
cd backend
npm install
```

3. **Instalar dependencias del frontend**
```bash
cd ../frontend
npm install
```

4. **Configurar variables de entorno**

Crear archivo `.env` en la carpeta `backend`:
```env
PORT=3001
NODE_ENV=development
DATABASE_PATH=./database.sqlite

# SII Configuration
SII_ENVIRONMENT=certificacion  # o "produccion"
SII_RUT=12345678-9
SII_COMPANY_NAME=Mi Empresa SpA

# Certificado Digital
CERT_PATH=./certificates/certificado.pfx
CERT_PASSWORD=tu_password_certificado
```

5. **Iniciar la aplicación**

Backend:
```bash
cd backend
npm run dev
```

Frontend (en otra terminal):
```bash
cd frontend
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

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
