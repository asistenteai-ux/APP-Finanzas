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

  /**
   * Anula un DTE mediante una Nota de Crédito
   */
  static async anularDTE(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { razon } = req.body;

      if (!razon) {
        return res.status(400).json({ error: 'Debe especificar la razón de la anulación' });
      }

      const db = getDatabase();
      const stmt = db.prepare('SELECT * FROM documentos WHERE id = ?');
      const documento = stmt.get(id) as any;

      if (!documento) {
        return res.status(404).json({ error: 'Documento no encontrado' });
      }

      // Verificar que el documento no esté ya anulado
      if (documento.estado === 'anulado') {
        return res.status(400).json({ error: 'El documento ya está anulado' });
      }

      // Solo se pueden anular facturas (33) y boletas (39)
      if (![33, 39].includes(documento.tipo_documento)) {
        return res.status(400).json({ error: 'Solo se pueden anular facturas (33) y boletas (39)' });
      }

      // Obtener detalles del documento original
      const stmtDetalles = db.prepare('SELECT * FROM documento_detalles WHERE documento_id = ? ORDER BY numero_linea');
      const detalles = stmtDetalles.all(id) as any[];

      // Obtener siguiente folio para Nota de Crédito (tipo 61)
      const stmtFolio = db.prepare('SELECT MAX(folio) as ultimo_folio FROM documentos WHERE tipo_documento = 61');
      const resultFolio = stmtFolio.get() as any;
      const nextFolio = (resultFolio?.ultimo_folio || 0) + 1;

      // Crear Nota de Crédito (tipo 61) que referencia al documento original
      const notaCreditoData = {
        tipoDocumento: 61, // Nota de Crédito
        folio: nextFolio,
        fechaEmision: new Date().toISOString().split('T')[0],
        receptor: {
          rut: documento.rut_receptor,
          razonSocial: documento.razon_social_receptor,
        },
        detalles: detalles.map((det) => ({
          numeroLinea: det.numero_linea,
          nombreItem: det.nombre_item,
          descripcion: `Anulación: ${det.descripcion || det.nombre_item}`,
          cantidad: det.cantidad,
          unidadMedida: det.unidad_medida,
          precioUnitario: det.precio_unitario,
          descuentoMonto: det.descuento_monto,
        })),
        referencias: [
          {
            tipoDocumento: documento.tipo_documento,
            folio: documento.folio,
            fechaDocumento: documento.fecha_emision,
            razonReferencia: razon,
          },
        ],
      };

      // Generar y firmar la Nota de Crédito
      const { xml, montoTotal } = await dteService.createDTE(notaCreditoData);

      // Guardar Nota de Crédito en la base de datos
      const stmtNC = db.prepare(`
        INSERT INTO documentos (
          tipo_documento, folio, fecha_emision,
          rut_emisor, razon_social_emisor,
          rut_receptor, razon_social_receptor,
          monto_neto, monto_iva, monto_total,
          xml_content, estado, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const resultNC = stmtNC.run(
        61, // Nota de Crédito
        nextFolio,
        notaCreditoData.fechaEmision,
        documento.rut_emisor,
        documento.razon_social_emisor,
        documento.rut_receptor,
        documento.razon_social_receptor,
        documento.monto_neto,
        documento.monto_iva,
        montoTotal,
        xml,
        'borrador',
        `Anulación de ${documento.tipo_documento === 33 ? 'Factura' : 'Boleta'} N° ${documento.folio}: ${razon}`
      );

      // Guardar detalles de la Nota de Crédito
      const stmtNCDetalle = db.prepare(`
        INSERT INTO documento_detalles (
          documento_id, numero_linea, nombre_item, descripcion,
          cantidad, unidad_medida, precio_unitario,
          descuento_monto, monto_neto
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      notaCreditoData.detalles.forEach((detalle: any) => {
        const montoNetoDetalle = detalle.cantidad * detalle.precioUnitario - (detalle.descuentoMonto || 0);
        stmtNCDetalle.run(
          resultNC.lastInsertRowid,
          detalle.numeroLinea,
          detalle.nombreItem,
          detalle.descripcion,
          detalle.cantidad,
          detalle.unidadMedida,
          detalle.precioUnitario,
          detalle.descuentoMonto || 0,
          montoNetoDetalle
        );
      });

      // Marcar el documento original como anulado
      const stmtUpdate = db.prepare(`
        UPDATE documentos
        SET estado = 'anulado',
            observaciones = ?
        WHERE id = ?
      `);
      stmtUpdate.run(`Anulado por Nota de Crédito N° ${nextFolio}: ${razon}`, id);

      res.json({
        success: true,
        message: 'Documento anulado exitosamente mediante Nota de Crédito',
        data: {
          documentoOriginal: {
            id: documento.id,
            tipo: documento.tipo_documento,
            folio: documento.folio,
            estado: 'anulado',
          },
          notaCredito: {
            id: resultNC.lastInsertRowid,
            tipo: 61,
            folio: nextFolio,
            monto_total: montoTotal,
          },
        },
      });
    } catch (error: any) {
      console.error('Error al anular DTE:', error);
      res.status(500).json({
        error: 'Error al anular documento',
        details: error.message,
      });
    }
  }

  /**
   * Genera una vista previa del DTE sin guardarlo
   */
  static async previewDTE(req: Request, res: Response) {
    try {
      const dteData = req.body;

      // Validar datos requeridos
      if (!dteData.tipoDocumento || !dteData.folio || !dteData.fechaEmision || !dteData.receptor || !dteData.detalles) {
        return res.status(400).json({
          error: 'Faltan datos requeridos',
          required: ['tipoDocumento', 'folio', 'fechaEmision', 'receptor', 'detalles'],
        });
      }

      // Generar XML (sin firmar para preview)
      const xmlPreview = dteService.generateDTEXML(dteData);

      // Calcular totales
      const montoNeto = dteData.detalles.reduce((sum: number, det: any) => {
        const monto = det.cantidad * det.precioUnitario - (det.descuentoMonto || 0);
        return sum + monto;
      }, 0);
      const iva = Math.round(montoNeto * 0.19);
      const montoTotal = Math.round(montoNeto) + iva;

      // Obtener datos de la empresa para la vista previa
      const db = getDatabase();
      const empresa = db.prepare('SELECT * FROM configuracion_empresa WHERE id = 1').get() as any;

      res.json({
        success: true,
        message: 'Vista previa generada',
        data: {
          tipoDocumento: dteData.tipoDocumento,
          nombreDocumento: getTipoDocumentoNombre(dteData.tipoDocumento),
          folio: dteData.folio,
          fechaEmision: dteData.fechaEmision,
          emisor: empresa ? {
            rut: empresa.rut,
            razonSocial: empresa.razon_social,
            giro: empresa.giro,
            direccion: empresa.direccion,
            comuna: empresa.comuna,
            ciudad: empresa.ciudad,
            logoPath: empresa.logo_path,
          } : null,
          receptor: dteData.receptor,
          detalles: dteData.detalles.map((det: any) => ({
            ...det,
            montoLinea: det.cantidad * det.precioUnitario - (det.descuentoMonto || 0),
          })),
          totales: {
            montoNeto: Math.round(montoNeto),
            iva,
            montoTotal,
          },
          xmlPreview: xmlPreview.substring(0, 1000) + '...',
        },
      });
    } catch (error: any) {
      console.error('Error al generar vista previa:', error);
      res.status(500).json({
        error: 'Error al generar vista previa',
        details: error.message,
      });
    }
  }
}

// Función auxiliar para obtener el nombre del tipo de documento
function getTipoDocumentoNombre(tipo: number): string {
  const tipos: { [key: number]: string } = {
    33: 'Factura Electrónica',
    34: 'Factura No Afecta o Exenta',
    39: 'Boleta Electrónica',
    41: 'Boleta Exenta',
    52: 'Guía de Despacho',
    56: 'Nota de Débito',
    61: 'Nota de Crédito',
  };
  return tipos[tipo] || `Documento tipo ${tipo}`;
}
