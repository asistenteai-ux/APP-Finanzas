/**
 * Plan de Cuentas Estándar para Chile
 * Basado en IFRS (Normas Internacionales de Información Financiera)
 * Adaptado para PYMES chilenas
 */

export const PLAN_CUENTAS_CHILE = {
  // ========== ACTIVOS (1) ==========
  ACTIVO: {
    codigo: '1',
    nombre: 'ACTIVO',
    tipo: 'titulo',
  },

  // ACTIVO CIRCULANTE (11)
  ACTIVO_CIRCULANTE: {
    codigo: '11',
    nombre: 'ACTIVO CIRCULANTE',
    tipo: 'titulo',
  },

  // Disponible (111)
  CAJA: { codigo: '1110101', nombre: 'Caja', tipo: 'detalle', naturaleza: 'deudor' },
  CAJA_CHICA: { codigo: '1110102', nombre: 'Caja Chica', tipo: 'detalle', naturaleza: 'deudor' },
  BANCO_CUENTA_CORRIENTE: { codigo: '1110201', nombre: 'Banco Cuenta Corriente', tipo: 'detalle', naturaleza: 'deudor' },
  BANCO_CUENTA_AHORRO: { codigo: '1110202', nombre: 'Banco Cuenta de Ahorro', tipo: 'detalle', naturaleza: 'deudor' },

  // Deudores (112)
  CLIENTES: { codigo: '1120101', nombre: 'Clientes', tipo: 'detalle', naturaleza: 'deudor' },
  DEUDORES_VARIOS: { codigo: '1120102', nombre: 'Deudores Varios', tipo: 'detalle', naturaleza: 'deudor' },
  DOCUMENTOS_POR_COBRAR: { codigo: '1120201', nombre: 'Documentos por Cobrar', tipo: 'detalle', naturaleza: 'deudor' },
  PROVISION_DEUDORES_INCOBRABLES: { codigo: '1120301', nombre: 'Provisión Deudores Incobrables', tipo: 'detalle', naturaleza: 'acreedor' },

  // Existencias (113)
  MERCADERIAS: { codigo: '1130101', nombre: 'Mercaderías', tipo: 'detalle', naturaleza: 'deudor' },
  MATERIAS_PRIMAS: { codigo: '1130102', nombre: 'Materias Primas', tipo: 'detalle', naturaleza: 'deudor' },
  PRODUCTOS_EN_PROCESO: { codigo: '1130103', nombre: 'Productos en Proceso', tipo: 'detalle', naturaleza: 'deudor' },
  PRODUCTOS_TERMINADOS: { codigo: '1130104', nombre: 'Productos Terminados', tipo: 'detalle', naturaleza: 'deudor' },

  // Impuestos (114)
  CREDITO_FISCAL_IVA: { codigo: '1140101', nombre: 'Crédito Fiscal IVA', tipo: 'detalle', naturaleza: 'deudor' },
  PPM_POR_RECUPERAR: { codigo: '1140201', nombre: 'PPM por Recuperar', tipo: 'detalle', naturaleza: 'deudor' },
  IMPUESTO_RENTA_POR_RECUPERAR: { codigo: '1140202', nombre: 'Impuesto a la Renta por Recuperar', tipo: 'detalle', naturaleza: 'deudor' },

  // ACTIVO FIJO (12)
  ACTIVO_FIJO: {
    codigo: '12',
    nombre: 'ACTIVO FIJO',
    tipo: 'titulo',
  },

  TERRENOS: { codigo: '1210101', nombre: 'Terrenos', tipo: 'detalle', naturaleza: 'deudor' },
  EDIFICIOS: { codigo: '1210201', nombre: 'Edificios', tipo: 'detalle', naturaleza: 'deudor' },
  MAQUINARIAS: { codigo: '1210301', nombre: 'Maquinarias y Equipos', tipo: 'detalle', naturaleza: 'deudor' },
  VEHICULOS: { codigo: '1210401', nombre: 'Vehículos', tipo: 'detalle', naturaleza: 'deudor' },
  MUEBLES: { codigo: '1210501', nombre: 'Muebles y Útiles', tipo: 'detalle', naturaleza: 'deudor' },
  EQUIPOS_COMPUTACION: { codigo: '1210601', nombre: 'Equipos Computacionales', tipo: 'detalle', naturaleza: 'deudor' },

  // Depreciación Acumulada
  DEPRECIACION_EDIFICIOS: { codigo: '1210202', nombre: 'Depreciación Acumulada Edificios', tipo: 'detalle', naturaleza: 'acreedor' },
  DEPRECIACION_MAQUINARIAS: { codigo: '1210302', nombre: 'Depreciación Acumulada Maquinarias', tipo: 'detalle', naturaleza: 'acreedor' },
  DEPRECIACION_VEHICULOS: { codigo: '1210402', nombre: 'Depreciación Acumulada Vehículos', tipo: 'detalle', naturaleza: 'acreedor' },
  DEPRECIACION_MUEBLES: { codigo: '1210502', nombre: 'Depreciación Acumulada Muebles', tipo: 'detalle', naturaleza: 'acreedor' },
  DEPRECIACION_EQUIPOS_COMP: { codigo: '1210602', nombre: 'Depreciación Acumulada Equipos Comp.', tipo: 'detalle', naturaleza: 'acreedor' },

  // ========== PASIVOS (2) ==========
  PASIVO: {
    codigo: '2',
    nombre: 'PASIVO',
    tipo: 'titulo',
  },

  // PASIVO CIRCULANTE (21)
  PASIVO_CIRCULANTE: {
    codigo: '21',
    nombre: 'PASIVO CIRCULANTE',
    tipo: 'titulo',
  },

  PROVEEDORES: { codigo: '2110101', nombre: 'Proveedores', tipo: 'detalle', naturaleza: 'acreedor' },
  CUENTAS_POR_PAGAR: { codigo: '2110102', nombre: 'Cuentas por Pagar', tipo: 'detalle', naturaleza: 'acreedor' },
  DOCUMENTOS_POR_PAGAR: { codigo: '2110201', nombre: 'Documentos por Pagar', tipo: 'detalle', naturaleza: 'acreedor' },

  // Impuestos
  DEBITO_FISCAL_IVA: { codigo: '2120101', nombre: 'Débito Fiscal IVA', tipo: 'detalle', naturaleza: 'acreedor' },
  IVA_POR_PAGAR: { codigo: '2120102', nombre: 'IVA por Pagar', tipo: 'detalle', naturaleza: 'acreedor' },
  PPM_POR_PAGAR: { codigo: '2120201', nombre: 'PPM por Pagar', tipo: 'detalle', naturaleza: 'acreedor' },
  IMPUESTO_RENTA_POR_PAGAR: { codigo: '2120202', nombre: 'Impuesto a la Renta por Pagar', tipo: 'detalle', naturaleza: 'acreedor' },

  // Remuneraciones
  REMUNERACIONES_POR_PAGAR: { codigo: '2130101', nombre: 'Remuneraciones por Pagar', tipo: 'detalle', naturaleza: 'acreedor' },
  AFP_POR_PAGAR: { codigo: '2130201', nombre: 'AFP por Pagar', tipo: 'detalle', naturaleza: 'acreedor' },
  ISAPRE_POR_PAGAR: { codigo: '2130202', nombre: 'ISAPRE por Pagar', tipo: 'detalle', naturaleza: 'acreedor' },
  FONASA_POR_PAGAR: { codigo: '2130203', nombre: 'FONASA por Pagar', tipo: 'detalle', naturaleza: 'acreedor' },
  SEGURO_CESANTIA_POR_PAGAR: { codigo: '2130204', nombre: 'Seguro de Cesantía por Pagar', tipo: 'detalle', naturaleza: 'acreedor' },
  IMPUESTO_UNICO_POR_PAGAR: { codigo: '2130301', nombre: 'Impuesto Único por Pagar', tipo: 'detalle', naturaleza: 'acreedor' },

  // Honorarios
  RETENCION_HONORARIOS: { codigo: '2140101', nombre: 'Retención Honorarios 10%', tipo: 'detalle', naturaleza: 'acreedor' },

  // PASIVO LARGO PLAZO (22)
  PASIVO_LARGO_PLAZO: {
    codigo: '22',
    nombre: 'PASIVO LARGO PLAZO',
    tipo: 'titulo',
  },

  PRESTAMOS_BANCARIOS_LP: { codigo: '2210101', nombre: 'Préstamos Bancarios Largo Plazo', tipo: 'detalle', naturaleza: 'acreedor' },
  LEASING_POR_PAGAR: { codigo: '2210201', nombre: 'Leasing por Pagar', tipo: 'detalle', naturaleza: 'acreedor' },
  ARRIENDOS_POR_PAGAR_LP: { codigo: '2210301', nombre: 'Arriendos por Pagar Largo Plazo', tipo: 'detalle', naturaleza: 'acreedor' },

  // ========== PATRIMONIO (3) ==========
  PATRIMONIO: {
    codigo: '3',
    nombre: 'PATRIMONIO',
    tipo: 'titulo',
  },

  CAPITAL: { codigo: '3110101', nombre: 'Capital', tipo: 'detalle', naturaleza: 'acreedor' },
  UTILIDADES_RETENIDAS: { codigo: '3120101', nombre: 'Utilidades Retenidas', tipo: 'detalle', naturaleza: 'acreedor' },
  UTILIDAD_EJERCICIO: { codigo: '3120201', nombre: 'Utilidad del Ejercicio', tipo: 'detalle', naturaleza: 'acreedor' },
  PERDIDA_EJERCICIO: { codigo: '3120202', nombre: 'Pérdida del Ejercicio', tipo: 'detalle', naturaleza: 'deudor' },

  // ========== INGRESOS (4) ==========
  INGRESOS: {
    codigo: '4',
    nombre: 'INGRESOS',
    tipo: 'titulo',
  },

  VENTAS: { codigo: '4110101', nombre: 'Ventas', tipo: 'detalle', naturaleza: 'acreedor' },
  SERVICIOS: { codigo: '4110201', nombre: 'Ingresos por Servicios', tipo: 'detalle', naturaleza: 'acreedor' },
  HONORARIOS: { codigo: '4110301', nombre: 'Honorarios', tipo: 'detalle', naturaleza: 'acreedor' },
  OTROS_INGRESOS: { codigo: '4120101', nombre: 'Otros Ingresos', tipo: 'detalle', naturaleza: 'acreedor' },
  INGRESOS_FINANCIEROS: { codigo: '4120201', nombre: 'Ingresos Financieros', tipo: 'detalle', naturaleza: 'acreedor' },

  // ========== COSTOS (5) ==========
  COSTOS: {
    codigo: '5',
    nombre: 'COSTOS',
    tipo: 'titulo',
  },

  COSTO_VENTAS: { codigo: '5110101', nombre: 'Costo de Ventas', tipo: 'detalle', naturaleza: 'deudor' },
  COSTO_SERVICIOS: { codigo: '5110201', nombre: 'Costo de Servicios', tipo: 'detalle', naturaleza: 'deudor' },

  // ========== GASTOS (6) ==========
  GASTOS: {
    codigo: '6',
    nombre: 'GASTOS',
    tipo: 'titulo',
  },

  // Gastos de Administración
  REMUNERACIONES: { codigo: '6110101', nombre: 'Remuneraciones', tipo: 'detalle', naturaleza: 'deudor' },
  HONORARIOS_GASTO: { codigo: '6110102', nombre: 'Honorarios', tipo: 'detalle', naturaleza: 'deudor' },
  LEYES_SOCIALES: { codigo: '6110103', nombre: 'Leyes Sociales', tipo: 'detalle', naturaleza: 'deudor' },
  ARRIENDOS: { codigo: '6110201', nombre: 'Arriendos', tipo: 'detalle', naturaleza: 'deudor' },
  LUZ: { codigo: '6110301', nombre: 'Luz', tipo: 'detalle', naturaleza: 'deudor' },
  AGUA: { codigo: '6110302', nombre: 'Agua', tipo: 'detalle', naturaleza: 'deudor' },
  TELEFONO: { codigo: '6110303', nombre: 'Teléfono e Internet', tipo: 'detalle', naturaleza: 'deudor' },
  UTILES_OFICINA: { codigo: '6110401', nombre: 'Útiles de Oficina', tipo: 'detalle', naturaleza: 'deudor' },
  COMBUSTIBLE: { codigo: '6110501', nombre: 'Combustible', tipo: 'detalle', naturaleza: 'deudor' },
  MANTENCIONES: { codigo: '6110502', nombre: 'Mantenciones y Reparaciones', tipo: 'detalle', naturaleza: 'deudor' },
  SEGUROS: { codigo: '6110601', nombre: 'Seguros', tipo: 'detalle', naturaleza: 'deudor' },
  PATENTES: { codigo: '6110701', nombre: 'Patentes Municipales', tipo: 'detalle', naturaleza: 'deudor' },
  DEPRECIACION_GASTO: { codigo: '6110801', nombre: 'Depreciación', tipo: 'detalle', naturaleza: 'deudor' },

  // Gastos Financieros
  INTERESES_PRESTAMOS: { codigo: '6120101', nombre: 'Intereses Préstamos', tipo: 'detalle', naturaleza: 'deudor' },
  INTERESES_LEASING: { codigo: '6120102', nombre: 'Intereses Leasing', tipo: 'detalle', naturaleza: 'deudor' },
  COMISIONES_BANCARIAS: { codigo: '6120201', nombre: 'Comisiones Bancarias', tipo: 'detalle', naturaleza: 'deudor' },

  // Otros Gastos
  OTROS_GASTOS: { codigo: '6130101', nombre: 'Otros Gastos', tipo: 'detalle', naturaleza: 'deudor' },
  MULTAS_RECARGOS: { codigo: '6130201', nombre: 'Multas y Recargos', tipo: 'detalle', naturaleza: 'deudor' },
};

/**
 * Obtiene las cuentas por categoría
 */
export function getCuentasPorCategoria() {
  const cuentas = Object.values(PLAN_CUENTAS_CHILE);

  return {
    activos: cuentas.filter(c => c.codigo.startsWith('1') && c.tipo === 'detalle'),
    pasivos: cuentas.filter(c => c.codigo.startsWith('2') && c.tipo === 'detalle'),
    patrimonio: cuentas.filter(c => c.codigo.startsWith('3') && c.tipo === 'detalle'),
    ingresos: cuentas.filter(c => c.codigo.startsWith('4') && c.tipo === 'detalle'),
    costos: cuentas.filter(c => c.codigo.startsWith('5') && c.tipo === 'detalle'),
    gastos: cuentas.filter(c => c.codigo.startsWith('6') && c.tipo === 'detalle'),
  };
}

/**
 * Busca una cuenta por código
 */
export function getCuentaByCodigo(codigo: string) {
  return Object.values(PLAN_CUENTAS_CHILE).find(c => c.codigo === codigo);
}

/**
 * Obtiene todas las cuentas de detalle (para usar en asientos)
 */
export function getCuentasDetalle() {
  return Object.values(PLAN_CUENTAS_CHILE).filter(c => c.tipo === 'detalle');
}
