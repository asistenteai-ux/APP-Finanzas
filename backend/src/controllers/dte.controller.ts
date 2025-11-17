import { Request, Response } from 'express';
import { DTEService } from '../services/sii/dte.service';
import { getDatabase } from '../database/schema';

const dteService = new DTEService();

/**
 * Controlador para manejo de Documentos Tributarios Electrónicos
 */
export class DTEController {
  /**
   * Crea un nuevo DTE (Factura, Boleta, etc.)
   */
  static async createDTE(req: Request, res: Response) {
    try {
      const dteData = req.body;

      // Validar datos requeridos
      if (!dteData.tipoDocumento || !dteData.folio || !dteData.fechaEmision || !dteData.receptor || !dteData.detalles) {
        return res.status(400).json({
          error: 'Faltan datos requeridos',
          required: ['tipoDocumento', 'folio', 'fechaEmision', 'receptor', 'detalles'],
        });
      }

      // Generar y firmar DTE
      const { xml, montoTotal } = await dteService.createDTE(dteData);

      // Calcular totales
      const montoNeto = dteData.detalles.reduce((sum: number, det: any) => {
        const monto = det.cantidad * det.precioUnitario - (det.descuentoMonto || 0);
        return sum + monto;
      }, 0);
      const iva = Math.round(montoNeto * 0.19);

      // Guardar en base de datos
      const db = getDatabase();
      const stmt = db.prepare(`
        INSERT INTO documentos (
          tipo_documento, folio, fecha_emision,
          rut_emisor, razon_social_emisor,
          rut_receptor, razon_social_receptor,
          monto_neto, monto_iva, monto_total,
          xml_content, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        dteData.tipoDocumento,
        dteData.folio,
        dteData.fechaEmision,
        req.body.rutEmisor || '12345678-9',
        req.body.razonSocialEmisor || 'Mi Empresa',
        dteData.receptor.rut,
        dteData.receptor.razonSocial,
        Math.round(montoNeto),
        iva,
        montoTotal,
        xml,
        'borrador'
      );

      // Guardar detalles
      const stmtDetalle = db.prepare(`
        INSERT INTO documento_detalles (
          documento_id, numero_linea, nombre_item, descripcion,
          cantidad, unidad_medida, precio_unitario,
          descuento_monto, monto_neto
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      dteData.detalles.forEach((detalle: any) => {
        const montoNetoDetalle = detalle.cantidad * detalle.precioUnitario - (detalle.descuentoMonto || 0);
        stmtDetalle.run(
          result.lastInsertRowid,
          detalle.numeroLinea,
          detalle.nombreItem,
          detalle.descripcion || '',
          detalle.cantidad,
          detalle.unidadMedida || 'UN',
          detalle.precioUnitario,
          detalle.descuentoMonto || 0,
          montoNetoDetalle
        );
      });

      res.json({
        success: true,
        message: 'DTE creado exitosamente',
        data: {
          id: result.lastInsertRowid,
          tipo_documento: dteData.tipoDocumento,
          folio: dteData.folio,
          monto_total: montoTotal,
          xml_preview: xml.substring(0, 500) + '...',
        },
      });
    } catch (error: any) {
      console.error('Error al crear DTE:', error);
      res.status(500).json({
        error: 'Error al crear DTE',
        details: error.message,
      });
    }
  }

  /**
   * Envía un DTE al SII
   */
  static async sendDTE(req: Request, res: Response) {
    try {
      const { documentoId } = req.params;
      const { rutEnvia } = req.body;

      const db = getDatabase();
      const stmt = db.prepare('SELECT * FROM documentos WHERE id = ?');
      const documento = stmt.get(documentoId) as any;

      if (!documento) {
        return res.status(404).json({ error: 'Documento no encontrado' });
      }

      if (!documento.xml_content) {
        return res.status(400).json({ error: 'El documento no tiene XML generado' });
      }

      // Enviar al SII
      const { trackId, estado } = await dteService.sendDTE(
        documento.xml_content,
        documento.rut_emisor,
        rutEnvia || documento.rut_emisor
      );

      // Actualizar estado en BD
      const updateStmt = db.prepare(`
        UPDATE documentos
        SET estado = 'enviado', track_id = ?, fecha_envio = datetime('now')
        WHERE id = ?
      `);
      updateStmt.run(trackId, documentoId);

      res.json({
        success: true,
        message: 'DTE enviado al SII exitosamente',
        data: {
          trackId,
          estado,
        },
      });
    } catch (error: any) {
      console.error('Error al enviar DTE:', error);
      res.status(500).json({
        error: 'Error al enviar DTE al SII',
        details: error.message,
      });
    }
  }

  /**
   * Obtiene todos los DTEs
   */
  static async getAllDTEs(req: Request, res: Response) {
    try {
      const db = getDatabase();
      const { tipo, estado, desde, hasta } = req.query;

      let query = 'SELECT * FROM documentos WHERE 1=1';
      const params: any[] = [];

      if (tipo) {
        query += ' AND tipo_documento = ?';
        params.push(tipo);
      }

      if (estado) {
        query += ' AND estado = ?';
        params.push(estado);
      }

      if (desde) {
        query += ' AND fecha_emision >= ?';
        params.push(desde);
      }

      if (hasta) {
        query += ' AND fecha_emision <= ?';
        params.push(hasta);
      }

      query += ' ORDER BY fecha_emision DESC, folio DESC';

      const stmt = db.prepare(query);
      const documentos = stmt.all(...params);

      res.json({
        success: true,
        data: documentos,
      });
    } catch (error: any) {
      console.error('Error al obtener DTEs:', error);
      res.status(500).json({
        error: 'Error al obtener documentos',
        details: error.message,
      });
    }
  }

  /**
   * Obtiene un DTE por ID con sus detalles
   */
  static async getDTEById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const db = getDatabase();

      const stmtDoc = db.prepare('SELECT * FROM documentos WHERE id = ?');
      const documento = stmtDoc.get(id);

      if (!documento) {
        return res.status(404).json({ error: 'Documento no encontrado' });
      }

      const stmtDetalles = db.prepare('SELECT * FROM documento_detalles WHERE documento_id = ? ORDER BY numero_linea');
      const detalles = stmtDetalles.all(id);

      res.json({
        success: true,
        data: {
          ...documento,
          detalles,
        },
      });
    } catch (error: any) {
      console.error('Error al obtener DTE:', error);
      res.status(500).json({
        error: 'Error al obtener documento',
        details: error.message,
      });
    }
  }

  /**
   * Consulta el estado de un DTE en el SII
   */
  static async queryDTEStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const db = getDatabase();

      const stmt = db.prepare('SELECT track_id FROM documentos WHERE id = ?');
      const documento = stmt.get(id) as any;

      if (!documento || !documento.track_id) {
        return res.status(404).json({ error: 'Documento no encontrado o no tiene Track ID' });
      }

      const status = await dteService.queryDTEStatus(documento.track_id);

      res.json({
        success: true,
        data: status,
      });
    } catch (error: any) {
      console.error('Error al consultar estado:', error);
      res.status(500).json({
        error: 'Error al consultar estado en el SII',
        details: error.message,
      });
    }
  }

  /**
   * Obtiene el siguiente folio disponible para un tipo de documento
   */
  static async getNextFolio(req: Request, res: Response) {
    try {
      const { tipoDocumento } = req.params;
      const db = getDatabase();

      const stmt = db.prepare(`
        SELECT MAX(folio) as ultimo_folio
        FROM documentos
        WHERE tipo_documento = ?
      `);
      const result = stmt.get(tipoDocumento) as any;

      const nextFolio = (result?.ultimo_folio || 0) + 1;

      res.json({
        success: true,
        data: {
          tipoDocumento: parseInt(tipoDocumento),
          nextFolio,
        },
      });
    } catch (error: any) {
      console.error('Error al obtener siguiente folio:', error);
      res.status(500).json({
        error: 'Error al obtener siguiente folio',
        details: error.message,
      });
    }
  }
}
