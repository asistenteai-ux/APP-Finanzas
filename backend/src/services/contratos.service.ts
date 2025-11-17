import { getDatabase } from '../database/schema';
import { ContabilidadService } from './contabilidad.service';
import { PLAN_CUENTAS_CHILE } from '../config/plan-cuentas';

/**
 * Servicio de Gestión de Contratos
 * Maneja: Honorarios, Leasing, Arriendos, Préstamos
 */
export class ContratosService {
  private db;
  private contabilidad: ContabilidadService;

  constructor() {
    this.db = getDatabase();
    this.contabilidad = new ContabilidadService();
  }

  /**
   * Registra un contrato de honorarios
   */
  async registrarContratoHonorarios(contrato: {
    proveedor_rut: string;
    proveedor_nombre: string;
    descripcion_servicio: string;
    monto_mensual: number;
    fecha_inicio: string;
    fecha_termino?: string;
    numero_cuotas?: number;
    dia_pago: number; // Día del mes en que se paga (1-31)
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO contratos (
        tipo, proveedor_rut, proveedor_nombre, descripcion,
        monto_mensual, fecha_inicio, fecha_termino,
        numero_cuotas, dia_pago, estado
      ) VALUES ('HONORARIOS', ?, ?, ?, ?, ?, ?, ?, ?, 'activo')
    `);

    const result = stmt.run(
      contrato.proveedor_rut,
      contrato.proveedor_nombre,
      contrato.descripcion_servicio,
      contrato.monto_mensual,
      contrato.fecha_inicio,
      contrato.fecha_termino || null,
      contrato.numero_cuotas || null,
      contrato.dia_pago
    );

    console.log(`✅ Contrato de honorarios registrado: ${contrato.proveedor_nombre}`);
    return result.lastInsertRowid;
  }

  /**
   * Registra pago de honorarios con retención
   */
  async pagarHonorarios(pago: {
    contrato_id: number;
    fecha_pago: string;
    monto_bruto: number;
    numero_boleta: string;
  }) {
    // Retención 10% (vigente 2024), será 11.5% desde 2025
    const tasaRetencion = 0.10;
    const montoRetencion = Math.round(pago.monto_bruto * tasaRetencion);
    const montoLiquido = pago.monto_bruto - montoRetencion;

    // Obtener datos del contrato
    const contrato = this.db
      .prepare('SELECT * FROM contratos WHERE id = ?')
      .get(pago.contrato_id) as any;

    // Registrar en tabla de retenciones
    const stmtRet = this.db.prepare(`
      INSERT INTO retenciones (
        tipo_retencion, folio, fecha_documento,
        rut_retenido, razon_social_retenido,
        monto_bruto, tasa_retencion, monto_retenido, monto_liquido,
        periodo_tributario
      ) VALUES ('honorarios', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const [year, month] = pago.fecha_pago.split('-');
    const periodo = `${year}-${month}`;

    stmtRet.run(
      pago.numero_boleta,
      pago.fecha_pago,
      contrato.proveedor_rut,
      contrato.proveedor_nombre,
      pago.monto_bruto,
      tasaRetencion * 100,
      montoRetencion,
      montoLiquido,
      periodo
    );

    // Generar asiento contable
    await this.contabilidad.crearAsiento({
      fecha: pago.fecha_pago,
      glosa: `Honorarios ${contrato.proveedor_nombre} - Boleta ${pago.numero_boleta}`,
      movimientos: [
        // DEBE: Gasto por honorarios
        {
          cuenta_codigo: PLAN_CUENTAS_CHILE.HONORARIOS_GASTO.codigo,
          debe: pago.monto_bruto,
        },
        // HABER: Caja (líquido pagado)
        {
          cuenta_codigo: PLAN_CUENTAS_CHILE.CAJA.codigo,
          haber: montoLiquido,
        },
        // HABER: Retención por pagar
        {
          cuenta_codigo: PLAN_CUENTAS_CHILE.RETENCION_HONORARIOS.codigo,
          haber: montoRetencion,
        },
      ],
      documento_ref: pago.numero_boleta,
    });

    console.log(`✅ Pago de honorarios registrado: ${contrato.proveedor_nombre} - $${montoLiquido.toLocaleString()}`);

    return {
      monto_bruto: pago.monto_bruto,
      monto_retencion: montoRetencion,
      monto_liquido: montoLiquido,
      tasa_retencion: tasaRetencion * 100,
    };
  }

  /**
   * Registra contrato de leasing
   */
  async registrarLeasing(leasing: {
    proveedor_nombre: string;
    descripcion_bien: string;
    valor_bien: number;
    cuota_mensual: number;
    numero_cuotas: number;
    tasa_interes_anual: number;
    fecha_inicio: string;
    dia_pago: number;
  }) {
    const fechaTermino = new Date(leasing.fecha_inicio);
    fechaTermino.setMonth(fechaTermino.getMonth() + leasing.numero_cuotas);

    const stmt = this.db.prepare(`
      INSERT INTO contratos (
        tipo, proveedor_nombre, descripcion,
        monto_total, monto_mensual, numero_cuotas,
        tasa_interes, fecha_inicio, fecha_termino,
        dia_pago, saldo_pendiente, estado
      ) VALUES ('LEASING', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')
    `);

    const result = stmt.run(
      leasing.proveedor_nombre,
      leasing.descripcion_bien,
      leasing.valor_bien,
      leasing.cuota_mensual,
      leasing.numero_cuotas,
      leasing.tasa_interes_anual,
      leasing.fecha_inicio,
      fechaTermino.toISOString().split('T')[0],
      leasing.dia_pago,
      leasing.valor_bien
    );

    console.log(`✅ Leasing registrado: ${leasing.descripcion_bien}`);
    return result.lastInsertRowid;
  }

  /**
   * Registra pago de cuota de leasing
   */
  async pagarCuotaLeasing(pago: {
    contrato_id: number;
    fecha_pago: string;
    numero_cuota: number;
  }) {
    const contrato = this.db
      .prepare('SELECT * FROM contratos WHERE id = ?')
      .get(pago.contrato_id) as any;

    const cuotaMensual = contrato.monto_mensual;

    // Calcular interés y capital (simplificado - método francés)
    const tasaMensual = contrato.tasa_interes / 12 / 100;
    const interesMes = Math.round(contrato.saldo_pendiente * tasaMensual);
    const capitalMes = cuotaMensual - interesMes;
    const nuevoSaldo = contrato.saldo_pendiente - capitalMes;

    // Actualizar saldo
    this.db
      .prepare('UPDATE contratos SET saldo_pendiente = ? WHERE id = ?')
      .run(nuevoSaldo, pago.contrato_id);

    // Generar asiento
    await this.contabilidad.crearAsiento({
      fecha: pago.fecha_pago,
      glosa: `Cuota ${pago.numero_cuota} leasing ${contrato.descripcion}`,
      movimientos: [
        // DEBE: Intereses (gasto)
        {
          cuenta_codigo: PLAN_CUENTAS_CHILE.INTERESES_LEASING.codigo,
          debe: interesMes,
        },
        // DEBE: Leasing por pagar (amortización capital)
        {
          cuenta_codigo: PLAN_CUENTAS_CHILE.LEASING_POR_PAGAR.codigo,
          debe: capitalMes,
        },
        // HABER: Caja
        {
          cuenta_codigo: PLAN_CUENTAS_CHILE.CAJA.codigo,
          haber: cuotaMensual,
        },
      ],
      documento_ref: `LEASING-${pago.contrato_id}-${pago.numero_cuota}`,
    });

    console.log(`✅ Cuota leasing pagada: ${contrato.descripcion} - Cuota ${pago.numero_cuota}`);

    return {
      cuota: cuotaMensual,
      interes: interesMes,
      capital: capitalMes,
      saldo_pendiente: nuevoSaldo,
    };
  }

  /**
   * Registra contrato de arriendo
   */
  async registrarArriendo(arriendo: {
    arrendador_nombre: string;
    direccion_inmueble: string;
    monto_mensual: number;
    fecha_inicio: string;
    duracion_meses: number;
    dia_pago: number;
  }) {
    const fechaTermino = new Date(arriendo.fecha_inicio);
    fechaTermino.setMonth(fechaTermino.getMonth() + arriendo.duracion_meses);

    const stmt = this.db.prepare(`
      INSERT INTO contratos (
        tipo, proveedor_nombre, descripcion,
        monto_mensual, numero_cuotas,
        fecha_inicio, fecha_termino, dia_pago, estado
      ) VALUES ('ARRIENDO', ?, ?, ?, ?, ?, ?, ?, 'activo')
    `);

    const result = stmt.run(
      arriendo.arrendador_nombre,
      arriendo.direccion_inmueble,
      arriendo.monto_mensual,
      arriendo.duracion_meses,
      arriendo.fecha_inicio,
      fechaTermino.toISOString().split('T')[0],
      arriendo.dia_pago
    );

    console.log(`✅ Contrato de arriendo registrado: ${arriendo.direccion_inmueble}`);
    return result.lastInsertRowid;
  }

  /**
   * Registra pago de arriendo
   */
  async pagarArriendo(pago: {
    contrato_id: number;
    fecha_pago: string;
    mes_pago: string; // YYYY-MM
  }) {
    const contrato = this.db
      .prepare('SELECT * FROM contratos WHERE id = ?')
      .get(pago.contrato_id) as any;

    await this.contabilidad.crearAsiento({
      fecha: pago.fecha_pago,
      glosa: `Arriendo ${pago.mes_pago} - ${contrato.descripcion}`,
      movimientos: [
        // DEBE: Gasto por arriendo
        {
          cuenta_codigo: PLAN_CUENTAS_CHILE.ARRIENDOS.codigo,
          debe: contrato.monto_mensual,
        },
        // HABER: Caja
        {
          cuenta_codigo: PLAN_CUENTAS_CHILE.CAJA.codigo,
          haber: contrato.monto_mensual,
        },
      ],
      documento_ref: `ARR-${pago.contrato_id}-${pago.mes_pago}`,
    });

    console.log(`✅ Arriendo pagado: ${contrato.descripcion} - ${pago.mes_pago}`);
    return { monto: contrato.monto_mensual };
  }

  /**
   * Obtiene contratos activos por tipo
   */
  async getContratosPorTipo(tipo: 'HONORARIOS' | 'LEASING' | 'ARRIENDO' | 'PRESTAMO') {
    return this.db
      .prepare('SELECT * FROM contratos WHERE tipo = ? AND estado = ? ORDER BY fecha_inicio DESC')
      .all(tipo, 'activo');
  }

  /**
   * Obtiene contratos con pagos pendientes
   */
  async getContratosConPagosPendientes(fecha: string) {
    const [year, month, day] = fecha.split('-');
    const diaActual = parseInt(day);

    return this.db
      .prepare(
        `SELECT * FROM contratos
         WHERE estado = 'activo'
         AND dia_pago <= ?
         ORDER BY dia_pago`
      )
      .all(diaActual);
  }
}
