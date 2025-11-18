#!/usr/bin/env node

/**
 * Script Automatizado para Generar el Ejecutable de APP Finanzas
 *
 * Uso:
 *   node build-exe.js
 *
 * Este script:
 * 1. Verifica requisitos
 * 2. Compila TypeScript
 * 3. Empaqueta con pkg
 * 4. Crea el ejecutable
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(60));
console.log('  Generador de Ejecutable - APP Finanzas');
console.log('  Sistema de Gestion Financiera SII Chile');
console.log('='.repeat(60) + '\n');

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function error(message) {
  log('ERROR: ' + message, 'red');
}

function success(message) {
  log('OK: ' + message, 'green');
}

function info(message) {
  log(message, 'cyan');
}

function warning(message) {
  log('ADVERTENCIA: ' + message, 'yellow');
}

function execute(command, description) {
  try {
    info(`[${description}]`);
    execSync(command, { stdio: 'inherit' });
    success(`${description} completado\n`);
    return true;
  } catch (err) {
    error(`${description} fallo`);
    console.error(err.message);
    return false;
  }
}

// Paso 1: Verificar requisitos
info('[1/5] Verificando requisitos...\n');

// Verificar Node.js
try {
  const nodeVersion = execSync('node --version').toString().trim();
  success(`Node.js instalado: ${nodeVersion}`);
} catch (err) {
  error('Node.js no esta instalado');
  process.exit(1);
}

// Verificar npm
try {
  const npmVersion = execSync('npm --version').toString().trim();
  success(`npm instalado: v${npmVersion}\n`);
} catch (err) {
  error('npm no esta instalado');
  process.exit(1);
}

// Paso 2: Verificar package.json
info('[2/5] Verificando archivos del proyecto...\n');

if (!fs.existsSync('package.json')) {
  error('No se encuentra package.json');
  error('Ejecuta este script desde la carpeta backend');
  process.exit(1);
}

success('package.json encontrado');

// Verificar si pkg está instalado
try {
  execSync('npx pkg --version', { stdio: 'pipe' });
  success('pkg disponible\n');
} catch (err) {
  warning('pkg no encontrado, se instalara automaticamente\n');
}

// Paso 3: Limpiar build anterior (opcional)
info('[3/5] Limpiando build anterior...\n');

if (fs.existsSync('dist')) {
  info('Eliminando carpeta dist/');
  fs.rmSync('dist', { recursive: true, force: true });
  success('Carpeta dist/ eliminada');
}

const exePath = path.join('..', 'app-finanzas.exe');
if (fs.existsSync(exePath)) {
  info('Eliminando app-finanzas.exe anterior');
  fs.unlinkSync(exePath);
  success('app-finanzas.exe eliminado');
}

console.log();

// Paso 4: Compilar TypeScript
info('[4/5] Compilando TypeScript...\n');

if (!execute('npm run build', 'Compilacion TypeScript')) {
  error('Fallo la compilacion de TypeScript');
  process.exit(1);
}

// Verificar que se haya creado dist/server.js
if (!fs.existsSync('dist/server.js')) {
  error('No se genero dist/server.js');
  process.exit(1);
}

success('dist/server.js generado correctamente\n');

// Paso 5: Empaquetar con pkg
info('[5/5] Empaquetando con pkg...\n');
info('Este paso puede tardar 2-3 minutos la primera vez...\n');

const pkgCommand = 'npx pkg dist/server.js --targets node18-win-x64 --output ../app-finanzas.exe';

if (!execute(pkgCommand, 'Empaquetado con pkg')) {
  error('Fallo el empaquetado con pkg');
  error('');
  error('Posibles soluciones:');
  error('1. Ejecuta: npm install -g pkg');
  error('2. Verifica conexion a internet (pkg descarga binarios de Node.js)');
  error('3. Intenta manualmente: ' + pkgCommand);
  process.exit(1);
}

// Verificar que se haya creado el .exe
if (!fs.existsSync(exePath)) {
  error('No se genero app-finanzas.exe');
  process.exit(1);
}

// Obtener tamaño del archivo
const stats = fs.statSync(exePath);
const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log('\n' + '='.repeat(60));
success('EXITO: Ejecutable generado correctamente');
console.log('='.repeat(60) + '\n');

info('Detalles del ejecutable:');
console.log(`  Archivo: app-finanzas.exe`);
console.log(`  Ubicacion: ${path.resolve(exePath)}`);
console.log(`  Tamano: ${fileSizeMB} MB`);
console.log(`  Target: Windows 10/11 (64 bits)`);
console.log(`  Node.js: v18 (incluido)\n`);

info('Proximos pasos:');
console.log(`  1. Prueba el ejecutable: app-finanzas.exe`);
console.log(`  2. Crea un archivo .env junto al .exe`);
console.log(`  3. Distribuye app-finanzas.exe + .env a los usuarios\n`);

success('Build completado exitosamente!\n');
