# 💼 APP Finanzas - Guía del Usuario

## 🚀 Inicio Rápido

### ¿Qué es esto?

APP Finanzas es un **sistema completo de gestión financiera y tributaria** para empresas chilenas que cumple con todas las normativas del SII.

### ¿Qué puedo hacer?

- ✅ Registrar ventas y generar facturas electrónicas
- ✅ Registrar gastos y compras
- ✅ Subir fotos de facturas (OCR automático extrae los datos)
- ✅ Gestión contable completa con doble partida
- ✅ Recordatorios automáticos de obligaciones tributarias (F29, F22, etc.)
- ✅ Múltiples usuarios con diferentes permisos

---

## 📦 Instalación

### Paso 1: Descargar

Descarga estos archivos:
- `app-finanzas.exe` (el programa)
- `.env` (archivo de configuración)

### Paso 2: Colocar en una Carpeta

Crea una carpeta, por ejemplo:
```
C:\APP-Finanzas\
```

Y coloca ahí los dos archivos.

### Paso 3: Configurar (Opcional)

Abre el archivo `.env` con Bloc de notas y ajusta si es necesario:

```env
PORT=3000
```

Si el puerto 3000 está ocupado, cámbialo a 3001, 3002, etc.

---

## ▶️ Cómo Usar

### Iniciar la Aplicación

1. **Doble clic** en `app-finanzas.exe`
2. Espera unos segundos (aparecerá una ventana negra)
3. Verás un mensaje: "Servidor iniciado exitosamente"
4. Abre tu navegador (Chrome, Firefox, Edge, etc.)
5. Ve a: **http://localhost:3000**

### Login por Primera Vez

**Credenciales iniciales:**
- **Email:** admin@finanzas.cl
- **Password:** admin123

⚠️ **MUY IMPORTANTE:** Cambia la contraseña inmediatamente después del primer login.

### Cambiar Contraseña

1. Haz login
2. Ve a "Mi Perfil" o "Configuración"
3. Cambia la contraseña
4. Guarda los cambios

---

## 👥 Crear Usuarios

### Tipos de Usuario

1. **Admin (Administrador/Contador)**
   - Puede hacer TODO
   - Crear usuarios, eliminar datos, configurar sistema
   - Ver toda la contabilidad

2. **Usuario (Empleado)**
   - Puede registrar gastos y ventas
   - Subir facturas
   - NO puede eliminar ni ver contabilidad completa

3. **Visor (Inversionista/Socio)**
   - Solo puede VER
   - NO puede editar ni registrar nada

### Crear un Nuevo Usuario

1. Haz login como Admin
2. Ve a "Usuarios" en el menú
3. Click en "Nuevo Usuario"
4. Completa:
   - Nombre
   - Email
   - Contraseña
   - Rol (admin, usuario, visor)
5. Guarda

---

## 📸 Subir Facturas con OCR

### ¿Qué es OCR?

OCR lee automáticamente el texto de las facturas. Solo subes la foto y el sistema extrae los datos.

### Cómo Usar

1. Ve a "Gastos" → "Nuevo Gasto"
2. Click en "Subir Factura"
3. Selecciona la foto o PDF de tu factura
4. Espera unos segundos
5. El sistema extrae automáticamente:
   - RUT del proveedor
   - Número de folio
   - Fecha
   - Montos
6. Revisa que los datos sean correctos
7. Corrige si es necesario
8. Guarda

### Tipos de Archivo Soportados

- JPG, JPEG
- PNG
- PDF

### Consejos para Mejor OCR

- Foto clara y con buena luz
- Documento completo visible
- Sin sombras
- Foto derecha (no inclinada)

---

## ⏸️ Detener la Aplicación

1. Ve a la ventana negra (donde está corriendo)
2. Presiona **Ctrl + C**
3. Escribe **S** y presiona Enter

O simplemente cierra la ventana.

---

## 🔄 Usar Otra Vez

Cada vez que quieras usar la aplicación:

1. Doble clic en `app-finanzas.exe`
2. Espera a que inicie
3. Abre navegador: `http://localhost:3000`
4. ¡Listo!

---

## 📁 Respaldo de Datos

### Dónde Están Mis Datos

Todos tus datos están en:
```
C:\APP-Finanzas\database.sqlite
```

Este archivo contiene TODA tu información.

### Hacer Respaldo

**MUY IMPORTANTE:** Haz respaldos regularmente.

1. Detén la aplicación (Ctrl + C)
2. Copia el archivo `database.sqlite`
3. Pégalo en otro lugar seguro (USB, nube, etc.)
4. Nombra con fecha: `database-2025-11-18.sqlite`

### Restaurar Respaldo

1. Detén la aplicación
2. Borra el archivo `database.sqlite` actual
3. Copia tu respaldo y renómbralo a `database.sqlite`
4. Inicia la aplicación

---

## 🆘 Solución de Problemas

### La Aplicación No Inicia

**Solución:**
1. Verifica que exista el archivo `.env`
2. Ejecuta desde cmd para ver el error:
   ```cmd
   cd C:\APP-Finanzas
   app-finanzas.exe
   ```
3. Lee el error y busca ayuda

### Error: "Puerto ya está en uso"

**Solución:**
1. Abre el archivo `.env`
2. Cambia `PORT=3000` a `PORT=3001`
3. Guarda
4. Reinicia la aplicación
5. Ahora ve a: `http://localhost:3001`

### No Puedo Hacer Login

**Solución:**
1. Verifica email y contraseña
2. Si olvidaste la contraseña del admin:
   - Detén la aplicación
   - Borra el archivo `database.sqlite`
   - Inicia de nuevo (se creará un admin nuevo)
   - Login: admin@finanzas.cl / admin123

### OCR No Funciona

**Solución:**
1. Verifica que la foto sea clara
2. Usa formato JPG o PDF
3. Si persiste, ingresa los datos manualmente

### Perdí Mis Datos

**Solución:**
1. Busca tu último respaldo de `database.sqlite`
2. Restaura siguiendo las instrucciones arriba

---

## 📞 Contacto y Ayuda

Para soporte técnico:
- Revisa la documentación completa
- Busca en el archivo `PROBLEMAS_COMUNES.md`
- Contacta al desarrollador/empresa

---

## 🔒 Seguridad

### Contraseñas

- **NUNCA** compartas tu contraseña
- Usa contraseñas seguras (mínimo 8 caracteres)
- Cambia la contraseña por defecto inmediatamente

### Respaldos

- Haz respaldos DIARIOS si usas la app en producción
- Guarda respaldos en 2 lugares diferentes
- Prueba restaurar respaldos periódicamente

### Actualizaciones

- Mantén la aplicación actualizada
- Lee los cambios antes de actualizar
- Haz respaldo antes de actualizar

---

## ✅ Checklist de Inicio

Primera vez:

- [ ] Descargué `app-finanzas.exe` y `.env`
- [ ] Los coloqué en una carpeta
- [ ] Hice doble clic en el .exe
- [ ] Abrí navegador en `http://localhost:3000`
- [ ] Hice login: admin@finanzas.cl / admin123
- [ ] Cambié la contraseña del admin
- [ ] Creé mi primer usuario
- [ ] Hice un respaldo del `database.sqlite`

Uso diario:

- [ ] Doble clic en `app-finanzas.exe`
- [ ] Abro navegador
- [ ] Hago login
- [ ] Registro mis operaciones
- [ ] Hago respaldo al finalizar el día

---

## 🎉 ¡Listo!

Ya puedes usar APP Finanzas para gestionar tu empresa.

**Recuerda:**
- Haz respaldos regularmente
- Cambia la contraseña por defecto
- Lee la documentación completa para aprovechar todas las funciones

---

**Versión:** 1.0.0
**Sistema Operativo:** Windows 10/11 (64 bits)
**Requisitos:** Ninguno (el .exe incluye todo)
