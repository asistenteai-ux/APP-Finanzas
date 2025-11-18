# 🔧 Solución: Node.js Instalado pero No Detectado

## 🎯 El Problema

Tienes **Node.js 24.11.1 instalado** pero el instalador dice:
```
ERROR: Node.js no esta instalado o no esta en el PATH
```

## ✅ Soluciones Paso a Paso

### Solución 1: Reiniciar tu PC (La Más Simple)

**Esta solución funciona el 80% de las veces:**

1. Cierra todas las ventanas
2. **Reinicia tu computadora**
3. Ejecuta `INSTALAR.bat` de nuevo

**¿Por qué funciona?**
- Cuando instalas Node.js, Windows necesita reiniciarse para actualizar las variables de entorno
- Sin reiniciar, las nuevas variables no están disponibles

---

### Solución 2: Verificar que Node.js Está en el PATH

#### Paso 1: Verificar en CMD

1. Abre **cmd** (Símbolo del sistema)
2. Escribe:
   ```cmd
   node -v
   ```
3. **Si funciona:** Verás algo como `v24.11.1`
4. **Si NO funciona:** Dice "no se reconoce como comando"

#### Paso 2: Si NO Funciona, Agregar al PATH

**Windows 10/11:**

1. Presiona `Windows + Pausa/Break` o busca "Sistema"
2. Click en **"Configuración avanzada del sistema"**
3. Click en **"Variables de entorno"**
4. En "Variables del sistema", busca la variable **`Path`**
5. Click en **"Editar"**
6. Verifica que esté esta ruta:
   ```
   C:\Program Files\nodejs\
   ```
7. Si **NO está**, haz click en **"Nuevo"** y agrégala
8. Click en **"Aceptar"** en todas las ventanas
9. **Reinicia tu PC**

**Capturas de referencia:**
```
Panel de Control
  → Sistema
    → Configuración avanzada del sistema
      → Variables de entorno
        → Path (en "Variables del sistema")
          → Editar
            → Agregar: C:\Program Files\nodejs\
```

---

### Solución 3: Usar Node.js LTS en vez de v24.x

**Tu Node.js 24.11.1 es muy nuevo:**

- Node.js 24.x es una versión **experimental/actual**
- Las versiones **LTS (Long Term Support)** son más estables
- Versión recomendada: **Node.js 20.x LTS**

**Cómo cambiar a Node.js LTS:**

#### Opción A: Desinstalar 24.x e Instalar 20.x

1. Ve a **Panel de Control → Desinstalar programas**
2. Busca **Node.js** y desinstálalo
3. Ve a: **https://nodejs.org/**
4. Descarga la versión **LTS** (20.x)
5. Instala Node.js 20.x
6. **Reinicia tu PC**
7. Ejecuta `INSTALAR.bat` de nuevo

#### Opción B: Usar nvm-windows (Avanzado)

Si quieres tener ambas versiones:

1. Descarga **nvm-windows** desde: https://github.com/coreybutler/nvm-windows/releases
2. Instala nvm-windows
3. Abre **cmd como administrador**
4. Ejecuta:
   ```cmd
   nvm install 20
   nvm use 20
   ```
5. Ejecuta `INSTALAR.bat` de nuevo

---

### Solución 4: Ejecutar como Administrador

Si Node.js está instalado solo para tu usuario:

1. **Clic derecho** en `INSTALAR.bat`
2. Selecciona **"Ejecutar como administrador"**
3. Acepta el UAC (Control de cuentas de usuario)

---

### Solución 5: Reinstalar Node.js Para Todos los Usuarios

1. Desinstala Node.js actual
2. Descarga Node.js LTS desde: https://nodejs.org/
3. Durante la instalación, asegúrate de seleccionar:
   - ✅ "Add to PATH"
   - ✅ "Install for all users"
4. **Reinicia tu PC**
5. Ejecuta `INSTALAR.bat` de nuevo

---

## 🧪 Cómo Verificar que Funciona

Después de aplicar cualquier solución:

1. Abre **nueva** ventana de cmd (importante: nueva ventana)
2. Ejecuta:
   ```cmd
   node -v
   npm -v
   ```
3. Deberías ver:
   ```
   v20.11.0  (o la versión que instalaste)
   10.2.4    (o similar)
   ```

Si ves las versiones, **¡funcionó!** Ahora ejecuta `INSTALAR.bat`

---

## 🎯 Instalador Mejorado

He actualizado `INSTALAR.bat` para que:

✅ **Detecta tu versión de Node.js** y te avisa si es compatible
✅ **Muestra diagnóstico detallado** si no encuentra Node.js
✅ **Te advierte si tienes v24.x** y recomienda v20.x LTS
✅ **Mejor manejo de errores** en cada paso

---

## 📝 Resumen de Compatibilidad

| Versión Node.js | Estado | Recomendación |
|-----------------|--------|---------------|
| v18.x | ✅ Compatible | OK para usar |
| v20.x LTS | ✅ Recomendada | **Mejor opción** |
| v22.x | ✅ Compatible | OK para usar |
| v24.x | ⚠️ Muy nueva | Puede tener problemas |

---

## 🆘 Si Nada Funciona

Instala manualmente:

1. **Abre cmd** (no como administrador)
2. Navega a la carpeta:
   ```cmd
   cd C:\ruta\a\APP-Finanzas\backend
   ```
3. Ejecuta:
   ```cmd
   npm install
   ```
4. Espera 3-5 minutos
5. Ejecuta:
   ```cmd
   npm run dev
   ```
6. Abre navegador: `http://localhost:3000`

---

## ✅ Checklist Final

Antes de ejecutar `INSTALAR.bat`:

- [ ] Node.js LTS 20.x instalado
- [ ] Reinicié mi PC después de instalar Node.js
- [ ] `node -v` funciona en cmd
- [ ] `npm -v` funciona en cmd
- [ ] Estoy en la carpeta APP-Finanzas
- [ ] Ejecuto `INSTALAR.bat` desde esa carpeta

**Si todos los checks están OK, el instalador funcionará sin problemas.**

---

## 💡 Recomendación Final

**La solución más simple y que funciona siempre:**

```
1. Desinstala Node.js 24.x
2. Descarga Node.js 20.x LTS desde https://nodejs.org/
3. Instala marcando "Add to PATH"
4. Reinicia tu PC
5. Ejecuta INSTALAR.bat
```

¡Eso es todo! 🎉
