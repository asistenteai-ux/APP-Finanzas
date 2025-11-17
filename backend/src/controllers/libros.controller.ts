import { Request, Response } from 'express';
import { LibrosContablesService } from '../services/libros-contables.service';
import { getDatabase } from '../database/schema';

const librosService = new LibrosContablesService();

export class LibrosController {
  /**
   * Genera el Libro de Compras y Ventas del período
   */
  static async generarLibroComprasVentas(req: Request, res: Response) {
    try {
      const { periodo } = req.params; // Formato: YYYY-MM

      if (!/^\d{4}-\d{2}$/.test(periodo)) {
        return res.status(400).json({
          error: 'Formato de período inválido. Use YYYY-MM (ej: 2025-01)',
        });
      }

      const xml = await librosService.generarLibroComprasVentas(periodo);

      // Guardar en base de datos
      const db = getDatabase();
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO libros_electronicos (periodo, tipo_libro, xml_content, estado)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(periodo, 'COMPRA_VENTA', xml, 'generado');

      res.json({
        success: true,
        message: 'Libro de Compras y Ventas generado exitosamente',
        data: {
          periodo,
          xml_preview: xml.substring(0, 500) + '...',
        },
      });
    } catch (error: any) {
      console.error('Error al generar libro:', error);
      res.status(500).json({
        error: 'Error al generar Libro de Compras y Ventas',
        details: error.message,
      });
    }
  }

  /**
   * Genera IECV (Información Electrónica de Compras y Ventas)
   */
  static async generarIECV(req: Request, res: Response) {
    try {
      const { periodo } = req.params;

      if (!/^\d{4}-\d{2}$/.test(periodo)) {
        return res.status(400).json({
          error: 'Formato de período inválido. Use YYYY-MM (ej: 2025-01)',
        });
      }

      const xml = await librosService.generarIECV(periodo);

      // Guardar en base de datos
      const db = getDatabase();
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO libros_electronicos (periodo, tipo_libro, xml_content, estado)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(periodo, 'IECV', xml, 'generado');

      res.json({
        success: true,
        message: 'IECV generado exitosamente',
        data: {
          periodo,
          xml_preview: xml.substring(0, 500) + '...',
        },
      });
    } catch (error: any) {
      console.error('Error al generar IECV:', error);
      res.status(500).json({
        error: 'Error al generar IECV',
        details: error.message,
      });
    }
  }

  /**
   * Obtiene resumen para F29
   */
  static async obtenerResumenF29(req: Request, res: Response) {
    try {
      const { periodo } = req.params;

      if (!/^\d{4}-\d{2}$/.test(periodo)) {
        return res.status(400).json({
          error: 'Formato de período inválido. Use YYYY-MM (ej: 2025-01)',
        });
      }

      const resumen = await librosService.obtenerResumenF29(periodo);

      res.json({
        success: true,
        data: resumen,
      });
    } catch (error: any) {
      console.error('Error al obtener resumen F29:', error);
      res.status(500).json({
        error: 'Error al obtener resumen F29',
        details: error.message,
      });
    }
  }

  /**
   * Descarga XML de un libro electrónico
   */
  static async descargarLibro(req: Request, res: Response) {
    try {
      const { periodo, tipo } = req.params;

      const db = getDatabase();
      const stmt = db.prepare(`
        SELECT * FROM libros_electronicos
        WHERE periodo = ? AND tipo_libro = ?
      `);
      const libro = stmt.get(periodo, tipo) as any;

      if (!libro) {
        return res.status(404).json({
          error: 'Libro no encontrado',
        });
      }

      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="Libro_${tipo}_${periodo}.xml"`);
      res.send(libro.xml_content);
    } catch (error: any) {
      console.error('Error al descargar libro:', error);
      res.status(500).json({
        error: 'Error al descargar libro',
        details: error.message,
      });
    }
  }

  /**
   * Lista todos los libros electrónicos generados
   */
  static async listarLibros(req: Request, res: Response) {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        SELECT id, periodo, tipo_libro, estado, fecha_generacion, fecha_envio
        FROM libros_electronicos
        ORDER BY periodo DESC, tipo_libro
      `);
      const libros = stmt.all();

      res.json({
        success: true,
        data: libros,
      });
    } catch (error: any) {
      console.error('Error al listar libros:', error);
      res.status(500).json({
        error: 'Error al listar libros',
        details: error.message,
      });
    }
  }

  /**
   * Obtiene períodos pendientes de envío
   */
  static async obtenerPeriodosPendientes(req: Request, res: Response) {
    try {
      const db = getDatabase();

      // Obtener períodos con documentos pero sin libro generado
      const periodos = db
        .prepare(
          `
        SELECT DISTINCT strftime('%Y-%m', fecha_emision) as periodo
        FROM documentos
        WHERE strftime('%Y-%m', fecha_emision) NOT IN (
          SELECT periodo FROM libros_electronicos WHERE tipo_libro = 'IECV'
        )
        ORDER BY periodo DESC
      `
        )
        .all() as any[];

      res.json({
        success: true,
        data: periodos,
        message:
          periodos.length > 0
            ? `Hay ${periodos.length} período(s) pendiente(s) de envío al SII`
            : 'Todos los períodos están al día',
      });
    } catch (error: any) {
      console.error('Error al obtener períodos pendientes:', error);
      res.status(500).json({
        error: 'Error al obtener períodos pendientes',
        details: error.message,
      });
    }
  }
}
