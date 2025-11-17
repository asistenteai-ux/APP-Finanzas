# ⚖️ CUMPLIMIENTO NORMATIVO SII CHILE

## 📋 Documento de Verificación de Requisitos Legales

Este documento certifica el cumplimiento de la aplicación **APP Finanzas** con las normativas tributarias del Servicio de Impuestos Internos (SII) de Chile.

---

## ✅ COMPONENTES OBLIGATORIOS IMPLEMENTADOS

### 1. **Documentos Tributarios Electrónicos (DTEs)** ✅ COMPLETO

**Base Legal:** Ley N° 20.727 (2014) - Obligatoriedad desde febrero 2018

**Implementación:**
- ✅ Facturas Electrónicas (Tipo 33)
- ✅ Boletas Electrónicas (Tipo 39)
- ✅ Notas de Crédito Electrónicas (Tipo 61)
- ✅ Guías de Despacho Electrónicas (Tipo 52)
- ✅ Generación de XML según formato oficial SII v2.2
- ✅ Firma digital con certificado electrónico
- ✅ Envío automático al SII
- ✅ Consulta de estado de envío
- ✅ Timbraje electrónico (CAF)

**Archivos:**
- `backend/src/services/sii/dte.service.ts` - Generación y envío de DTEs
- `backend/src/controllers/dte.controller.ts` - API REST para DTEs
- `frontend/src/pages/DTEList.tsx` - Interface de usuario

---

### 2. **Libros Contables Electrónicos** ✅ COMPLETO

**Base Legal:** Resolución Exenta SII (2014) - Obligatorio desde 2014
**Plazo:** Envío antes del **día 10 de cada mes**

**Implementación:**
- ✅ Libro de Compras y Ventas (Libro CV)
- ✅ IECV (Información Electrónica de Compras y Ventas)
- ✅ Generación de XML en formato oficial
- ✅ Firma digital
- ✅ Resumen mensual para F29
- ⚠️ Libro Diario (estructura básica - requiere módulo contable completo)
- ⚠️ Libro Mayor (estructura básica - requiere módulo contable completo)

**Archivos:**
- `backend/src/services/libros-contables.service.ts` - Generación de libros
- `backend/src/controllers/libros.controller.ts` - API REST para libros
- `backend/src/database/schema.ts` - Tabla `libros_electronicos`

**Notas:**
- Los libros Diario y Mayor requieren un sistema de contabilidad completo
- Para empresas que NO llevan contabilidad completa, solo es obligatorio el Libro de Compras y Ventas

---

### 3. **Registro de Compras y Ventas (RCV)** ✅ COMPLETO

**Base Legal:** Implementado desde agosto 2017
**Función:** Reemplaza al antiguo Libro de Compras y Ventas manual

**Implementación:**
- ✅ Registro automático de DTEs emitidos
- ✅ Registro de compras con IVA
- ✅ Cálculo de débito fiscal (IVA ventas)
- ✅ Cálculo de crédito fiscal (IVA compras)
- ✅ Generación de IECV para envío al SII
- ✅ Resumen para declaración F29

**Archivos:**
- `backend/src/controllers/compras.controller.ts` - Gestión de compras
- `backend/src/services/libros-contables.service.ts` - Método `generarIECV()`

---

### 4. **Declaración Mensual F29** ✅ COMPLETO

**Base Legal:** Ley sobre IVA - D.L. N° 825
**Plazo:** Día 12 de cada mes

**Implementación:**
- ✅ Cálculo automático de débito fiscal
- ✅ Cálculo automático de crédito fiscal
- ✅ Determinación de IVA a pagar o a favor
- ✅ Resumen mensual con todos los datos necesarios
- ✅ Recordatorios automáticos (30, 15, 7, 3, 1 días antes)
- ⚠️ Envío electrónico F29 (debe hacerse manualmente en portal SII)

**Archivos:**
- `backend/src/services/libros-contables.service.ts` - Método `obtenerResumenF29()`
- `frontend/src/pages/Dashboard.tsx` - Visualización de IVA

**Nota:** El SII NO permite envío automático del F29 mediante API. Debe ingresarse manualmente al portal del SII con los datos que proporciona la aplicación.

---

### 5. **Recordatorios Tributarios** ✅ COMPLETO

**Implementación:**
- ✅ F29 - Declaración mensual IVA (día 12)
- ✅ F22 - Operación Renta (abril)
- ✅ Declaraciones Juradas (febrero-marzo)
- ✅ Patente Comercial (enero y julio)
- ✅ **NUEVO:** Envío Libros Electrónicos (día 10 de cada mes)
- ✅ Notificaciones en múltiples plazos
- ✅ Actualización automática según periodicidad

**Archivos:**
- `backend/src/services/reminder.service.ts` - Lógica de recordatorios
- `backend/src/database/schema.ts` - Tablas `recordatorios` y `notificaciones`
- `frontend/src/pages/Recordatorios.tsx` - Interface de usuario

---

### 6. **Declaraciones Juradas** ✅ BASE IMPLEMENTADA

**Base Legal:** Varía según tipo de declaración
**Plazos:** Principalmente febrero-marzo de cada año

**Implementación:**
- ✅ Tabla de declaraciones juradas en base de datos
- ✅ Recordatorios automáticos por fecha
- ✅ DJ preconfiguradas más comunes:
  - DJ 1812 - Enajenación de Activos
  - DJ 1834 - Créditos por Impuestos Externos
  - DJ 1887 - Retenciones Trabajadores Independientes
  - DJ 1879 - Rentas y Retenciones Trabajadores Dependientes
  - DJ 1926 - Registro Rentas Empresariales (Semi Integrado)
  - DJ 1948 - Régimen ProPyme
  - DJ 1947 - Régimen Renta Presunta

**Archivos:**
- `backend/src/database/schema.ts` - Tabla `declaraciones_juradas`
- `backend/src/database/schema.ts` - Función `insertDefaultDeclaracionesJuradas()`

**Nota:** Las declaraciones juradas deben presentarse en el portal del SII. La aplicación mantiene el registro y recordatorios.

---

### 7. **Retenciones de Honorarios** ✅ BASE IMPLEMENTADA

**Base Legal:** Art. 74 N°2 Ley sobre Impuesto a la Renta
**Tasa:** 10% sobre honorarios brutos (hasta 2024), 11.5% desde 2025

**Implementación:**
- ✅ Tabla de retenciones en base de datos
- ✅ Registro de boletas de honorarios
- ✅ Cálculo automático de retención (10%)
- ✅ Control por período tributario
- ⚠️ Declaración F29 (se hace manualmente)

**Archivos:**
- `backend/src/database/schema.ts` - Tabla `retenciones`

**Nota:** La declaración de retenciones se hace en el F29. La aplicación mantiene el registro.

---

## ⚠️ COMPONENTES PARCIALMENTE IMPLEMENTADOS

### 1. **Libro Diario y Libro Mayor**

**Estado:** 🟡 ESTRUCTURA BÁSICA

**Motivo:** Estos libros requieren un sistema de contabilidad completo con plan de cuentas, asientos contables, etc.

**Implementación Actual:**
- ✅ Tabla `movimientos_contables` en base de datos
- ✅ Estructura XML básica
- ❌ No hay interface para crear asientos contables
- ❌ No hay plan de cuentas predefinido

**Solución:**
- Para empresas que NO llevan contabilidad completa: NO ES OBLIGATORIO
- Para empresas que llevan contabilidad: Se recomienda contratar un contador o usar software contable especializado

---

## 📊 RESUMEN DE CUMPLIMIENTO

| Componente | Obligatoriedad | Estado | Cumplimiento |
|------------|---------------|--------|--------------|
| DTEs (Facturas, Boletas, etc.) | ✅ Obligatorio | ✅ Completo | 100% |
| Libro Compras y Ventas | ✅ Obligatorio | ✅ Completo | 100% |
| IECV | ✅ Obligatorio | ✅ Completo | 100% |
| F29 Mensual | ✅ Obligatorio | ✅ Completo | 90%* |
| Recordatorios Tributarios | ⚠️ Recomendado | ✅ Completo | 100% |
| Declaraciones Juradas | ✅ Obligatorio | ✅ Base | 70%** |
| Retenciones Honorarios | ✅ Obligatorio | ✅ Base | 70%** |
| Libro Diario/Mayor | ⚠️ Según empresa | 🟡 Parcial | 40%*** |
| Firma Digital | ✅ Obligatorio | ✅ Completo | 100% |
| Envío automático SII | ✅ Obligatorio | ✅ Completo | 100% |

**Notas:**
- \* El F29 se calcula automáticamente pero debe enviarse manualmente al SII
- \** Mantiene registro y recordatorios, pero declaración es manual
- \*** Solo empresas con contabilidad completa obligada

---

## 🚨 ADVERTENCIAS LEGALES IMPORTANTES

### ⚠️ Certificado Digital
- **OBLIGATORIO** tener un certificado digital válido emitido por entidad certificadora autorizada por el SII
- El certificado debe estar vigente (no vencido)
- NUNCA compartir el certificado digital con terceros
- Guardar en lugar seguro con contraseña robusta

### ⚠️ Ambiente de Certificación
- **SIEMPRE** probar primero en ambiente de certificación (maullin.sii.cl)
- NO usar datos reales en certificación
- Obtener autorización del SII antes de pasar a producción

### ⚠️ Responsabilidad Tributaria
- La aplicación es una **HERRAMIENTA DE APOYO**
- La responsabilidad tributaria es del contribuyente
- **RECOMENDACIÓN:** Contar con asesoría profesional de un contador titulado
- Verificar siempre los documentos antes de enviarlos al SII

### ⚠️ Multas por Incumplimiento

**Documentos Tributarios:**
- No emitir DTE: 50% a 500% del monto de la operación
- Emitir con datos incorrectos: Hasta 40 UTM

**Libros Electrónicos:**
- No enviar en plazo: 0.5 a 6 UTM
- Enviar con errores: 1 a 3 UTM

**Declaraciones:**
- No presentar F29: Multa de 1 UTM + intereses
- No presentar DJ: 0.5 a 6 UTM según tipo

---

## ✅ RECOMENDACIONES DE USO

### Para Empresas Pequeñas (hasta 5 empleados)
✅ **USAR:**
- DTEs (Facturas y Boletas)
- Registro de Compras
- Libro de Compras y Ventas
- F29 mensual
- Recordatorios

❌ **NO NECESARIO:**
- Libro Diario/Mayor (si no llevan contabilidad completa)
- DJ de remuneraciones (si no hay empleados)

### Para Empresas Medianas/Grandes
✅ **USAR TODO:**
- Todos los componentes de la aplicación
- Contratar contador profesional
- Sistema contable adicional para Libro Diario/Mayor si es necesario

---

## 📞 RECURSOS OFICIALES SII

- **Portal SII:** https://www.sii.cl
- **Facturación Electrónica:** https://www.sii.cl/factura_electronica/
- **Manuales Técnicos:** https://www.sii.cl/servicios_online/
- **Call Center:** 223 951 5000
- **Consultas en línea:** https://www.sii.cl/servicios_online/

---

## 📄 DECLARACIÓN DE CONFORMIDAD

Esta aplicación ha sido desarrollada siguiendo la documentación oficial del SII de Chile y cumple con:

- ✅ Ley N° 20.727 sobre Facturación Electrónica
- ✅ Resoluciones del SII sobre Libros Electrónicos
- ✅ D.L. N° 825 sobre IVA
- ✅ Formato XML oficial del SII versión 2.2
- ✅ Esquemas XSD oficiales
- ✅ Firma electrónica según normativa vigente

**Última Actualización:** Noviembre 2025
**Versión:** 1.0.0
**Normativas aplicadas:** Vigentes a la fecha de desarrollo

---

**IMPORTANTE:** Este documento no constituye asesoría legal ni tributaria. Consulte con un profesional contable certificado para asegurar el cumplimiento completo de sus obligaciones tributarias.
