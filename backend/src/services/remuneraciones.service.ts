import { getDatabase } from '../database/schema';
import { ContabilidadService } from './contabilidad.service';
import { PLAN_CUENTAS_CHILE } from '../config/plan-cuentas';

/**
 * Servicio de Remuneraciones y Cotizaciones Previsionales
 * Cumple con legislación chilena vigente 2025
 */
export class RemuneracionesService {
  private db;
  private contabilidad: ContabilidadService;

  // TASAS LEGALES CHILE 2025
  private readonly TASAS = {
    AFP: 0.1298, // 12.98% (promedio AFP)
    SEGURO_CESANTIA_TRABAJADOR: 0.006, // 0.6%
    SEGURO_CESANTIA_EMPLEADOR: 0.0024, // 0.24%
    FONASA: 0.07, // 7%
    ISAPRE_MIN: 0.07, // 7% mínimo
    TOPE_IMPONIBLE_UF: 81.6, // Tope imponible AFP/Salud
    UF_VALOR: 37842, // Valor UF (debe actualizarse)
  };

  // TRAMOS IMPUESTO ÚNICO (2025)
  private readonly TRAMOS_IMPUESTO = [
    { hasta: 13.5, tasa: 0, rebaja: 0 },
    { hasta: 30, tasa: 0.04, rebaja: 0.54 },
    { hasta: 50, tasa: 0.08, rebaja: 1.74 },
    { hasta: 70, tasa: 0.135, rebaja: 4.49 },
    { hasta: 90, tasa: 0.23, rebaja: 11.14 },
    { hasta: 120, tasa: 0.304, rebaja: 17.8 },
    { hasta: 150, tasa: 0.355, rebaja: 23.92 },
    { hasta: Infinity, tasa: 0.40, rebaja: 30.67 },
  ];

  constructor() {
    this.db = getDatabase();
    this.contabilidad = new ContabilidadService();
  }

  /**
   * Calcula liquidación de sueldo completa
   */
  calcularLiquidacion(datos: {
    trabajador_rut: string;
    trabajador_nombre: string;
    periodo: string; // YYYY-MM
    sueldo_base: number;
    horas_extra?: number;
    bono?: number;
    comisiones?: number;
    dias_trabajados?: number;
    afp?: string;
    isapre_nombre?: string;
    isapre_porcentaje?: number;
    cargas_familiares?: number;
  }) {
    const diasMes = 30;
    const diasTrabajados = datos.dias_trabajados || diasMes;

    // HABERES
    const sueldoBase = Math.round((datos.sueldo_base / diasMes) * diasTrabajados);
    const horasExtra = datos.horas_extra || 0;
    const bono = datos.bono || 0;
    const comisiones = datos.comisiones || 0;

    const totalHaberes = sueldoBase + horasExtra + bono + comisiones;

    // Calcular tope imponible
    const topeImponible = Math.round(this.TASAS.TOPE_IMPONIBLE_UF * this.TASAS.UF_VALOR);
    const baseImponible = Math.min(totalHaberes, topeImponible);

    // DESCUENTOS
    // 1. AFP
    const descuentoAFP = Math.round(baseImponible * this.TASAS.AFP);

    // 2. Salud (ISAPRE o FONASA)
    let descuentoSalud: number;
    if (datos.isapre_nombre && datos.isapre_porcentaje) {
      // ISAPRE
      descuentoSalud = Math.round(baseImponible * (datos.isapre_porcentaje / 100));
    } else {
      // FONASA (7%)
      descuentoSalud = Math.round(baseImponible * this.TASAS.FONASA);
    }

    // 3. Seguro de Cesantía
    const descuentoCesantia = Math.round(baseImponible * this.TASAS.SEGURO_CESANTIA_TRABAJADOR);

    // 4. Impuesto Único (solo si aplica)
    const rentaImponible = totalHaberes - descuentoAFP - descuentoSalud - descuentoCesantia;
    const rentaImponibleUF = rentaImponible / this.TASAS.UF_VALOR;
    const impuestoUnico = this.calcularImpuestoUnico(rentaImponibleUF);

    // TOTALES
    const totalDescuentos = descuentoAFP + descuentoSalud + descuentoCesantia + impuestoUnico;
    const sueldoLiquido = totalHaberes - totalDescuentos;

    // COSTO EMPLEADOR (lo que paga la empresa ADICIONAL)
    const cesantiaEmpleador = Math.round(baseImponible * this.TASAS.SEGURO_CESANTIA_EMPLEADOR);
    const costoTotal = totalHaberes + cesantiaEmpleador;

    return {
      trabajador: {
        rut: datos.trabajador_rut,
        nombre: datos.trabajador_nombre,
      },
      periodo: datos.periodo,
      haberes: {
        sueldo_base: sueldoBase,
        horas_extra: horasExtra,
        bono,
        comisiones,
        total: totalHaberes,
      },
      descuentos: {
        afp: descuentoAFP,
        salud: descuentoSalud,
        seguro_cesantia: descuentoCesantia,
        impuesto_unico: impuestoUnico,
        total: totalDescuentos,
      },
      sueldo_liquido: Math.round(sueldoLiquido),
      costo_empleador: {
        remuneracion: totalHaberes,
        cesantia_empleador: cesantiaEmpleador,
        total_costo: costoTotal,
      },
    };
  }

  /**
   * Calcula Impuesto Único según tramos 2025
   */
  private calcularImpuestoUnico(rentaUF: number): number {
    for (const tramo of this.TRAMOS_IMPUESTO) {
      if (rentaUF <= tramo.hasta) {
        const impuestoUF = rentaUF * tramo.tasa - tramo.rebaja;
        return Math.max(0, Math.round(impuestoUF * this.TASAS.UF_VALOR));
      }
    }
    return 0;
  }

  /**
   * Registra liquidación y genera asiento contable
   */
  async registrarLiquidacion(liquidacion: any) {
    // Guardar en tabla de remuneraciones
    const stmt = this.db.prepare(`
      INSERT INTO remuneraciones (
        trabajador_rut, trabajador_nombre, periodo,
        sueldo_base, total_haberes, total_descuentos, sueldo_liquido,
        afp, salud, cesantia, impuesto_unico, cesantia_empleador,
        estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')
    `);

    const result = stmt.run(
      liquidacion.trabajador.rut,
      liquidacion.trabajador.nombre,
      liquidacion.periodo,
      liquidacion.haberes.sueldo_base,
      liquidacion.haberes.total,
      liquidacion.descuentos.total,
      liquidacion.sueldo_liquido,
      liquidacion.descuentos.afp,
      liquidacion.descuentos.salud,
      liquidacion.descuentos.seguro_cesantia,
      liquidacion.descuentos.impuesto_unico,
      liquidacion.costo_empleador.cesantia_empleador
    );

    // Generar asiento contable
    const fecha = `${liquidacion.periodo}-28`; // Último día del mes

    await this.contabilidad.crearAsiento({
      fecha,
      glosa: `Remuneración ${liquidacion.trabajador.nombre} - ${liquidacion.periodo}`,
      movimientos: [
        // DEBE: Gasto por remuneración
        {
          cuenta_codigo: PLAN_CUENTAS_CHILE.REMUNERACIONES.codigo,
          debe: liquidacion.haberes.total,
        },
        // DEBE: Leyes sociales (cesantía empleador)
        {
          cuenta_codigo: PLAN_CUENTAS_CHILE.LEYES_SOCIALES.codigo,
          debe: liquidacion.costo_empleador.cesantia_empleador,
        },
        // HABER: Remuneraciones por pagar (líquido)
        {
          cuenta_codigo: PLAN_CUENTAS_CHILE.REMUNERACIONES_POR_PAGAR.codigo,
          haber: liquidacion.sueldo_liquido,
        },
        // HABER: AFP por pagar
        {
          cuenta_codigo: PLAN_CUENTAS_CHILE.AFP_POR_PAGAR.codigo,
          haber: liquidacion.descuentos.afp,
        },
        // HABER: ISAPRE/FONASA por pagar
        {
          cuenta_codigo: liquidacion.trabajador.isapre
            ? PLAN_CUENTAS_CHILE.ISAPRE_POR_PAGAR.codigo
            : PLAN_CUENTAS_CHILE.FONASA_POR_PAGAR.codigo,
          haber: liquidacion.descuentos.salud,
        },
        // HABER: Seguro Cesantía
        {
          cuenta_codigo: PLAN_CUENTAS_CHILE.SEGURO_CESANTIA_POR_PAGAR.codigo,
          haber: liquidacion.descuentos.seguro_cesantia + liquidacion.costo_empleador.cesantia_empleador,
        },
        // HABER: Impuesto Único (si aplica)
        ...(liquidacion.descuentos.impuesto_unico > 0 ? [{
          cuenta_codigo: PLAN_CUENTAS_CHILE.IMPUESTO_UNICO_POR_PAGAR.codigo,
          haber: liquidacion.descuentos.impuesto_unico,
        }] : []),
      ],
      documento_ref: `LIQ-${liquidacion.periodo}-${liquidacion.trabajador.rut}`,
    });

    console.log(`✅ Liquidación registrada: ${liquidacion.trabajador.nombre} - ${liquidacion.periodo}`);
    return result.lastInsertRowid;
  }

  /**
   * Obtiene libro de remuneraciones del período
   */
  async getLibroRemuneraciones(periodo: string) {
    const stmt = this.db.prepare(`
      SELECT * FROM remuneraciones
      WHERE periodo = ?
      ORDER BY trabajador_nombre
    `);

    return stmt.all(periodo);
  }

  /**
   * Genera centralización de remuneraciones para contabilidad
   */
  async getCentralizacionRemuneraciones(periodo: string) {
    const remuneraciones = await this.getLibroRemuneraciones(periodo);

    const totales = remuneraciones.reduce(
      (acc: any, rem: any) => ({
        total_haberes: acc.total_haberes + rem.total_haberes,
        total_afp: acc.total_afp + rem.afp,
        total_salud: acc.total_salud + rem.salud,
        total_cesantia: acc.total_cesantia + rem.cesantia,
        total_impuesto: acc.total_impuesto + rem.impuesto_unico,
        total_liquido: acc.total_liquido + rem.sueldo_liquido,
        total_empleador: acc.total_empleador + rem.cesantia_empleador,
      }),
      {
        total_haberes: 0,
        total_afp: 0,
        total_salud: 0,
        total_cesantia: 0,
        total_impuesto: 0,
        total_liquido: 0,
        total_empleador: 0,
      }
    );

    return {
      periodo,
      cantidad_trabajadores: remuneraciones.length,
      totales,
      detalle: remuneraciones,
    };
  }
}
