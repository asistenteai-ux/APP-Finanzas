import { getDatabase } from '../database/schema';
import { ContabilidadService } from './contabilidad.service';
import { PLAN_CUENTAS_CHILE } from '../config/plan-cuentas';

/**
 * Servicio de Activos Fijos y Depreciación
 * Cumple con normativa tributaria chilena
 */
export class ActivosFijosService {
  private db;
  private contabilidad: ContabilidadService;

  // VIDA ÚTIL SEGÚN SII CHILE (años)
  private readonly VIDA_UTIL = {
    EDIFICIOS: 50,
    MAQUINARIAS: 10,
    VEHICULOS: 7,
    MUEBLES: 7,
    EQUIPOS_COMPUTACION: 3,
    EQUIPOS_OFICINA: 5,
    INSTALACIONES: 10,
  };

  constructor() {
    this.db = getDatabase();
    this.contabilidad = new ContabilidadService();
  }

  /**
   * Registra un nuevo activo fijo
   */
  async registrarActivoFijo(activo: {
    nombre: string;
    categoria: keyof typeof this.VIDA_UTIL;
    fecha_adquisicion: string;
    valor_compra: number;
    proveedor_rut?: string;
    proveedor_nombre?: string;
    numero_factura?: string;
    vida_util_personalizada?: number; // Permite override
  }) {
    const vidaUtil = activo.vida_util_personalizada || this.VIDA_UTIL[activo.categoria];
    const depreciacionAnual = Math.round(activo.valor_compra / vidaUtil);
    const depreciacionMensual = Math.round(depreciacionAnual / 12);

    // Guardar en BD
    const stmt = this.db.prepare(`
      INSERT INTO activos_fijos (
        nombre, categoria, fecha_adquisicion, valor_compra,
        vida_util_anos, depreciacion_anual, depreciacion_mensual,
        depreciacion_acumulada, valor_libro, estado,
        proveedor_rut, proveedor_nombre, numero_factura
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 'activo', ?, ?, ?)
    `);

    const result = stmt.run(
      activo.nombre,
      activo.categoria,
      activo.fecha_adquisicion,
      activo.valor_compra,
      vidaUtil,
      depreciacionAnual,
      depreciacionMensual,
      activo.valor_compra, // Valor libro inicial
      activo.proveedor_rut,
      activo.proveedor_nombre,
      activo.numero_factura
    );

    // Registrar asiento de compra
    const cuentaActivo = this.getCuentaActivoFijo(activo.categoria);

    await this.contabilidad.crearAsiento({
      fecha: activo.fecha_adquisicion,
      glosa: `Adquisición ${activo.nombre}`,
      movimientos: [
        {
          cuenta_codigo: cuentaActivo,
          debe: activo.valor_compra,
        },
        {
          cuenta_codigo: PLAN_CUENTAS_CHILE.CAJA.codigo,
          haber: activo.valor_compra,
        },
      ],
      documento_ref: activo.numero_factura,
    });

    console.log(`✅ Activo fijo registrado: ${activo.nombre}`);
    return result.lastInsertRowid;
  }

  /**
   * Procesa depreciación mensual de todos los activos
   */
  async procesarDepreciacionMensual(periodo: string) {
    // Obtener todos los activos activos
    const activos = this.db
      .prepare(`SELECT * FROM activos_fijos WHERE estado = 'activo'`)
      .all() as any[];

    const [year, month] = periodo.split('-');
    const fechaDepreciacion = `${year}-${month}-30`;

    let totalDepreciacion = 0;

    const transaction = this.db.transaction(() => {
      activos.forEach((activo) => {
        // Verificar que no haya depreciación registrada para este período
        const existe = this.db
          .prepare(
            `SELECT COUNT(*) as count FROM depreciaciones
             WHERE activo_id = ? AND periodo = ?`
          )
          .get(activo.id, periodo) as any;

        if (existe.count > 0) {
          console.log(`⏭️  Depreciación ya registrada para ${activo.nombre} en ${periodo}`);
          return;
        }

        const depreciacion = activo.depreciacion_mensual;
        const nuevaDepreciacionAcum = activo.depreciacion_acumulada + depreciacion;
        const nuevoValorLibro = activo.valor_compra - nuevaDepreciacionAcum;

        // Si ya está totalmente depreciado, saltar
        if (nuevoValorLibro <= 0) {
          console.log(`⏭️  ${activo.nombre} ya está totalmente depreciado`);
          return;
        }

        // Registrar depreciación
        this.db
          .prepare(
            `INSERT INTO depreciaciones (activo_id, periodo, monto, depreciacion_acumulada, valor_libro)
             VALUES (?, ?, ?, ?, ?)`
          )
          .run(activo.id, periodo, depreciacion, nuevaDepreciacionAcum, nuevoValorLibro);

        // Actualizar activo
        this.db
          .prepare(
            `UPDATE activos_fijos
             SET depreciacion_acumulada = ?, valor_libro = ?
             WHERE id = ?`
          )
          .run(nuevaDepreciacionAcum, nuevoValorLibro, activo.id);

        totalDepreciacion += depreciacion;
        console.log(`📉 Depreciación: ${activo.nombre} = $${depreciacion.toLocaleString()}`);
      });
    });

    transaction();

    // Generar asiento contable de depreciación centralizada
    if (totalDepreciacion > 0) {
      await this.contabilidad.crearAsiento({
        fecha: fechaDepreciacion,
        glosa: `Depreciación activos fijos ${periodo}`,
        movimientos: [
          {
            cuenta_codigo: PLAN_CUENTAS_CHILE.DEPRECIACION_GASTO.codigo,
            debe: totalDepreciacion,
          },
          {
            cuenta_codigo: PLAN_CUENTAS_CHILE.DEPRECIACION_EDIFICIOS.codigo, // Simplificado
            haber: totalDepreciacion,
          },
        ],
        documento_ref: `DEP-${periodo}`,
      });
    }

    return {
      periodo,
      activos_procesados: activos.length,
      total_depreciacion: totalDepreciacion,
    };
  }

  /**
   * Obtiene cuenta contable según categoría de activo
   */
  private getCuentaActivoFijo(categoria: string): string {
    const mapa: any = {
      EDIFICIOS: PLAN_CUENTAS_CHILE.EDIFICIOS.codigo,
      MAQUINARIAS: PLAN_CUENTAS_CHILE.MAQUINARIAS.codigo,
      VEHICULOS: PLAN_CUENTAS_CHILE.VEHICULOS.codigo,
      MUEBLES: PLAN_CUENTAS_CHILE.MUEBLES.codigo,
      EQUIPOS_COMPUTACION: PLAN_CUENTAS_CHILE.EQUIPOS_COMPUTACION.codigo,
    };
    return mapa[categoria] || PLAN_CUENTAS_CHILE.MUEBLES.codigo;
  }

  /**
   * Obtiene listado de activos fijos
   */
  async getActivosFijos() {
    return this.db.prepare('SELECT * FROM activos_fijos ORDER BY fecha_adquisicion DESC').all();
  }

  /**
   * Obtiene historial de depreciaciones de un activo
   */
  async getHistorialDepreciacion(activoId: number) {
    return this.db
      .prepare('SELECT * FROM depreciaciones WHERE activo_id = ? ORDER BY periodo')
      .all(activoId);
  }
}
