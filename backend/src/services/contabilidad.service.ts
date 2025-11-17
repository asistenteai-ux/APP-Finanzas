import { getDatabase } from '../database/schema';
import { PLAN_CUENTAS_CHILE, getCuentaByCodigo } from '../config/plan-cuentas';
import { XMLBuilder } from 'fast-xml-parser';

/**
 * Servicio de Contabilidad Completo
 * Implementa Libro Diario, Libro Mayor, Balance de 8 Columnas y Estados Financieros
 */
export class ContabilidadService {
  private db;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Crea un asiento contable con partida doble
   * REGLA DE ORO: Debe = Haber SIEMPRE
   */
  async crearAsiento(asiento: {
    fecha: string;
    glosa: string;
    movimientos: Array<{
      cuenta_codigo: string;
      debe?: number;
      haber?: number;
      centro_costo?: string;
    }>;
    documento_ref?: string;
  }) {
    // Validar partida doble
    const totalDebe = asiento.movimientos.reduce((sum, m) => sum + (m.debe || 0), 0);
    const totalHaber = asiento.movimientos.reduce((sum, m) => sum + (m.haber || 0), 0);

    if (Math.abs(totalDebe - totalHaber) > 0.01) {
      throw new Error(`Partida doble no cuadra: Debe=${totalDebe}, Haber=${totalHaber}`);
    }

    // Obtener siguiente número de asiento
    const ultimoAsiento = this.db
      .prepare('SELECT MAX(numero_asiento) as ultimo FROM movimientos_contables')
      .get() as any;
    const numeroAsiento = (ultimoAsiento?.ultimo || 0) + 1;

    // Insertar movimientos
    const stmt = this.db.prepare(`
      INSERT INTO movimientos_contables (fecha, numero_asiento, glosa, cuenta_contable, debe, haber, documento_referencia, centro_costo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = this.db.transaction(() => {
      asiento.movimientos.forEach((mov) => {
        // Validar que la cuenta existe
        const cuenta = getCuentaByCodigo(mov.cuenta_codigo);
        if (!cuenta) {
          throw new Error(`Cuenta ${mov.cuenta_codigo} no existe en el plan de cuentas`);
        }

        stmt.run(
          asiento.fecha,
          numeroAsiento,
          asiento.glosa,
          mov.cuenta_codigo,
          mov.debe || 0,
          mov.haber || 0,
          asiento.documento_ref || null,
          mov.centro_costo || null
        );
      });
    });

    transaction();

    console.log(`✅ Asiento #${numeroAsiento} creado: ${asiento.glosa}`);
    return numeroAsiento;
  }

  /**
   * Registra una venta (genera asiento automático)
   */
  async registrarVenta(venta: {
    fecha: string;
    cliente_rut: string;
    cliente_nombre: string;
    monto_neto: number;
    monto_iva: number;
    forma_pago: 'contado' | 'credito';
    documento_ref: string;
  }) {
    const montoTotal = Math.round(venta.monto_neto + venta.monto_iva);

    const movimientos = [];

    if (venta.forma_pago === 'contado') {
      // Débito: Caja o Banco
      movimientos.push({
        cuenta_codigo: PLAN_CUENTAS_CHILE.CAJA.codigo,
        debe: montoTotal,
      });
    } else {
      // Débito: Clientes (por cobrar)
      movimientos.push({
        cuenta_codigo: PLAN_CUENTAS_CHILE.CLIENTES.codigo,
        debe: montoTotal,
      });
    }

    // Crédito: Ventas (Neto)
    movimientos.push({
      cuenta_codigo: PLAN_CUENTAS_CHILE.VENTAS.codigo,
      haber: Math.round(venta.monto_neto),
    });

    // Crédito: Débito Fiscal IVA
    movimientos.push({
      cuenta_codigo: PLAN_CUENTAS_CHILE.DEBITO_FISCAL_IVA.codigo,
      haber: Math.round(venta.monto_iva),
    });

    return this.crearAsiento({
      fecha: venta.fecha,
      glosa: `Venta a ${venta.cliente_nombre} - ${venta.documento_ref}`,
      movimientos,
      documento_ref: venta.documento_ref,
    });
  }

  /**
   * Registra una compra (genera asiento automático)
   */
  async registrarCompra(compra: {
    fecha: string;
    proveedor_rut: string;
    proveedor_nombre: string;
    monto_neto: number;
    monto_iva: number;
    es_credito_fiscal: boolean;
    tipo_gasto: 'costo_venta' | 'gasto_admin' | 'activo_fijo';
    cuenta_especifica?: string;
    forma_pago: 'contado' | 'credito';
    documento_ref: string;
  }) {
    const montoTotal = Math.round(compra.monto_neto + compra.monto_iva);
    const movimientos = [];

    // Débito: Según tipo de compra
    let cuentaDebito = compra.cuenta_especifica;
    if (!cuentaDebito) {
      if (compra.tipo_gasto === 'costo_venta') {
        cuentaDebito = PLAN_CUENTAS_CHILE.COSTO_VENTAS.codigo;
      } else if (compra.tipo_gasto === 'activo_fijo') {
        cuentaDebito = PLAN_CUENTAS_CHILE.MUEBLES.codigo; // Por defecto
      } else {
        cuentaDebito = PLAN_CUENTAS_CHILE.OTROS_GASTOS.codigo;
      }
    }

    movimientos.push({
      cuenta_codigo: cuentaDebito,
      debe: Math.round(compra.monto_neto),
    });

    // Débito: Crédito Fiscal IVA (si corresponde)
    if (compra.es_credito_fiscal) {
      movimientos.push({
        cuenta_codigo: PLAN_CUENTAS_CHILE.CREDITO_FISCAL_IVA.codigo,
        debe: Math.round(compra.monto_iva),
      });
    }

    // Crédito: Proveedores o Caja
    if (compra.forma_pago === 'contado') {
      movimientos.push({
        cuenta_codigo: PLAN_CUENTAS_CHILE.CAJA.codigo,
        haber: montoTotal,
      });
    } else {
      movimientos.push({
        cuenta_codigo: PLAN_CUENTAS_CHILE.PROVEEDORES.codigo,
        haber: montoTotal,
      });
    }

    return this.crearAsiento({
      fecha: compra.fecha,
      glosa: `Compra a ${compra.proveedor_nombre} - ${compra.documento_ref}`,
      movimientos,
      documento_ref: compra.documento_ref,
    });
  }

  /**
   * Obtiene el Libro Diario de un período
   */
  async getLibroDiario(desde: string, hasta: string) {
    const movimientos = this.db
      .prepare(
        `SELECT * FROM movimientos_contables
         WHERE fecha >= ? AND fecha <= ?
         ORDER BY fecha, numero_asiento, id`
      )
      .all(desde, hasta) as any[];

    // Agrupar por asiento
    const asientos: any[] = [];
    let asientoActual: any = null;

    movimientos.forEach((mov) => {
      if (!asientoActual || asientoActual.numero !== mov.numero_asiento) {
        if (asientoActual) asientos.push(asientoActual);
        asientoActual = {
          numero: mov.numero_asiento,
          fecha: mov.fecha,
          glosa: mov.glosa,
          documento: mov.documento_referencia,
          movimientos: [],
          totalDebe: 0,
          totalHaber: 0,
        };
      }

      const cuenta = getCuentaByCodigo(mov.cuenta_contable);
      asientoActual.movimientos.push({
        cuenta_codigo: mov.cuenta_contable,
        cuenta_nombre: cuenta?.nombre || mov.cuenta_contable,
        debe: mov.debe,
        haber: mov.haber,
      });
      asientoActual.totalDebe += mov.debe;
      asientoActual.totalHaber += mov.haber;
    });

    if (asientoActual) asientos.push(asientoActual);

    return asientos;
  }

  /**
   * Obtiene el Libro Mayor (movimientos por cuenta)
   */
  async getLibroMayor(desde: string, hasta: string, cuenta_codigo?: string) {
    let query = `
      SELECT cuenta_contable, fecha, numero_asiento, glosa, debe, haber, documento_referencia
      FROM movimientos_contables
      WHERE fecha >= ? AND fecha <= ?
    `;
    const params: any[] = [desde, hasta];

    if (cuenta_codigo) {
      query += ' AND cuenta_contable = ?';
      params.push(cuenta_codigo);
    }

    query += ' ORDER BY cuenta_contable, fecha, numero_asiento';

    const movimientos = this.db.prepare(query).all(...params) as any[];

    // Agrupar por cuenta
    const cuentas: any = {};
    movimientos.forEach((mov) => {
      if (!cuentas[mov.cuenta_contable]) {
        const cuenta = getCuentaByCodigo(mov.cuenta_contable);
        cuentas[mov.cuenta_contable] = {
          codigo: mov.cuenta_contable,
          nombre: cuenta?.nombre || mov.cuenta_contable,
          naturaleza: cuenta?.naturaleza || 'deudor',
          movimientos: [],
          saldoInicial: 0,
          totalDebe: 0,
          totalHaber: 0,
          saldoFinal: 0,
        };
      }

      cuentas[mov.cuenta_contable].movimientos.push(mov);
      cuentas[mov.cuenta_contable].totalDebe += mov.debe;
      cuentas[mov.cuenta_contable].totalHaber += mov.haber;
    });

    // Calcular saldos
    Object.values(cuentas).forEach((cuenta: any) => {
      if (cuenta.naturaleza === 'deudor') {
        cuenta.saldoFinal = cuenta.totalDebe - cuenta.totalHaber;
      } else {
        cuenta.saldoFinal = cuenta.totalHaber - cuenta.totalDebe;
      }
    });

    return Object.values(cuentas);
  }

  /**
   * Genera Balance de 8 Columnas
   */
  async getBalanceOchoColumnas(hasta: string) {
    const cuentas = await this.getLibroMayor('2000-01-01', hasta);

    return cuentas.map((cuenta: any) => ({
      codigo: cuenta.codigo,
      nombre: cuenta.nombre,
      debe: cuenta.totalDebe,
      haber: cuenta.totalHaber,
      deudor: cuenta.saldoFinal > 0 ? cuenta.saldoFinal : 0,
      acreedor: cuenta.saldoFinal < 0 ? Math.abs(cuenta.saldoFinal) : 0,
    }));
  }

  /**
   * Genera Balance General (Estado de Situación Financiera)
   */
  async getBalanceGeneral(hasta: string) {
    const balance = await this.getBalanceOchoColumnas(hasta);

    const activos = balance.filter(c => c.codigo.startsWith('1'));
    const pasivos = balance.filter(c => c.codigo.startsWith('2'));
    const patrimonio = balance.filter(c => c.codigo.startsWith('3'));

    const totalActivos = activos.reduce((sum, c) => sum + c.deudor, 0);
    const totalPasivos = pasivos.reduce((sum, c) => sum + c.acreedor, 0);
    const totalPatrimonio = patrimonio.reduce((sum, c) => sum + c.acreedor, 0);

    return {
      fecha: hasta,
      activos: {
        detalle: activos,
        total: Math.round(totalActivos),
      },
      pasivos: {
        detalle: pasivos,
        total: Math.round(totalPasivos),
      },
      patrimonio: {
        detalle: patrimonio,
        total: Math.round(totalPatrimonio),
      },
      ecuacion: {
        activos: Math.round(totalActivos),
        pasivos_patrimonio: Math.round(totalPasivos + totalPatrimonio),
        cuadra: Math.abs(totalActivos - (totalPasivos + totalPatrimonio)) < 1,
      },
    };
  }

  /**
   * Genera Estado de Resultados
   */
  async getEstadoResultados(desde: string, hasta: string) {
    const balance = await this.getBalanceOchoColumnas(hasta);

    const ingresos = balance.filter(c => c.codigo.startsWith('4'));
    const costos = balance.filter(c => c.codigo.startsWith('5'));
    const gastos = balance.filter(c => c.codigo.startsWith('6'));

    const totalIngresos = ingresos.reduce((sum, c) => sum + c.acreedor, 0);
    const totalCostos = costos.reduce((sum, c) => sum + c.deudor, 0);
    const totalGastos = gastos.reduce((sum, c) => sum + c.deudor, 0);

    const utilidadBruta = totalIngresos - totalCostos;
    const utilidadOperacional = utilidadBruta - totalGastos;

    return {
      periodo: { desde, hasta },
      ingresos: {
        detalle: ingresos,
        total: Math.round(totalIngresos),
      },
      costos: {
        detalle: costos,
        total: Math.round(totalCostos),
      },
      utilidad_bruta: Math.round(utilidadBruta),
      gastos: {
        detalle: gastos,
        total: Math.round(totalGastos),
      },
      utilidad_operacional: Math.round(utilidadOperacional),
      utilidad_neta: Math.round(utilidadOperacional),
    };
  }
}
