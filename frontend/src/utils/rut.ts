/**
 * Valida un RUT chileno
 * @param rut RUT con o sin puntos y guión (ej: 12345678-9 o 12.345.678-9)
 * @returns true si es válido, false si no
 */
export function validarRUT(rut: string): boolean {
  if (!rut || typeof rut !== 'string') return false;

  // Limpiar el RUT
  rut = rut.trim().toUpperCase();

  // Verificar formato con guión
  if (!/^(\d{1,2})\.?(\d{3})\.?(\d{3})-?([0-9K])$/.test(rut)) {
    return false;
  }

  // Extraer dígitos y dígito verificador
  const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '');
  const cuerpo = rutLimpio.slice(0, -1);
  const digitoVerificador = rutLimpio.slice(-1);

  // Calcular dígito verificador
  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i)) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

  return digitoVerificador === dvCalculado;
}

/**
 * Formatea un RUT agregando puntos y guión
 * @param rut RUT sin formato (ej: 123456789)
 * @returns RUT formateado (ej: 12.345.678-9)
 */
export function formatearRUT(rut: string): string {
  if (!rut) return '';

  // Limpiar el RUT
  const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();

  if (rutLimpio.length < 2) return rutLimpio;

  // Separar cuerpo y dígito verificador
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);

  // Agregar puntos al cuerpo
  let cuerpoFormateado = '';
  let contador = 0;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    if (contador === 3) {
      cuerpoFormateado = '.' + cuerpoFormateado;
      contador = 0;
    }
    cuerpoFormateado = cuerpo[i] + cuerpoFormateado;
    contador++;
  }

  return cuerpoFormateado + '-' + dv;
}

/**
 * Limpia un RUT de puntos y guión
 * @param rut RUT formateado (ej: 12.345.678-9)
 * @returns RUT limpio (ej: 123456789)
 */
export function limpiarRUT(rut: string): string {
  if (!rut) return '';
  return rut.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
}

/**
 * Agrega guión al RUT (sin puntos)
 * @param rut RUT sin guión (ej: 123456789)
 * @returns RUT con guión (ej: 12345678-9)
 */
export function agregarGuionRUT(rut: string): string {
  if (!rut) return '';

  const rutLimpio = limpiarRUT(rut);

  if (rutLimpio.length < 2) return rutLimpio;

  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);

  return cuerpo + '-' + dv;
}
