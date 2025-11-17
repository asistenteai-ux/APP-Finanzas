import { Request, Response } from 'express';
import { getDatabase } from '../database/schema';

export class ComprasController {
  /**
   * Crea una nueva compra o gasto
   */
  static createCompra(req: Request, res: Response) {
    try {
      const {
        tipo_documento,
        folio,
        fecha_documento,
        rut_proveedor,
        razon_social_proveedor,
        descripcion,
        monto_neto,
        monto_iva,
        categoria,
        es_credito_fiscal,
      } = req.body;

      if (!tipo_documento || !folio || !fecha_documento || !rut_proveedor || !razon_social_proveedor || monto_neto === undefined) {
        return res.status(400).json({
          error: 'Faltan datos requeridos',
          required: ['tipo_documento', 'folio', 'fecha_documento', 'rut_proveedor', 'razon_social_proveedor', 'monto_neto'],
        });
      }

      const db = getDatabase();
      const stmt = db.prepare(`
        INSERT INTO compras (
          tipo_documento, folio, fecha_documento,
          rut_proveedor, razon_social_proveedor, descripcion,
          monto_neto, monto_iva, monto_total,
          categoria, es_credito_fiscal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const montoIva = monto_iva !== undefined ? monto_iva : Math.round(monto_neto * 0.19);
      const montoTotal = Math.round(monto_neto) + montoIva;

      const result = stmt.run(
        tipo_documento,
        folio,
        fecha_documento,
        rut_proveedor,
        razon_social_proveedor,
        descripcion || '',
        monto_neto,
        montoIva,
        montoTotal,
        categoria || 'general',
        es_credito_fiscal !== undefined ? es_credito_fiscal : 1
      );

      res.status(201).json({
        success: true,
        message: 'Compra registrada exitosamente',
        data: {
          id: result.lastInsertRowid,
          monto_total: montoTotal,
        },
      });
    } catch (error: any) {
      console.error('Error al crear compra:', error);
      res.status(500).json({
        error: 'Error al registrar compra',
        details: error.message,
      });
    }
  }

  /**
   * Obtiene todas las compras
   */
  static getAllCompras(req: Request, res: Response) {
    try {
      const db = getDatabase();
      const { desde, hasta, categoria, proveedor } = req.query;

      let query = 'SELECT * FROM compras WHERE 1=1';
      const params: any[] = [];

      if (desde) {
        query += ' AND fecha_documento >= ?';
        params.push(desde);
      }

      if (hasta) {
        query += ' AND fecha_documento <= ?';
        params.push(hasta);
      }

      if (categoria) {
        query += ' AND categoria = ?';
        params.push(categoria);
      }

      if (proveedor) {
        query += ' AND rut_proveedor = ?';
        params.push(proveedor);
      }

      query += ' ORDER BY fecha_documento DESC';

      const stmt = db.prepare(query);
      const compras = stmt.all(...params);

      res.json({
        success: true,
        data: compras,
      });
    } catch (error: any) {
      console.error('Error al obtener compras:', error);
      res.status(500).json({
        error: 'Error al obtener compras',
        details: error.message,
      });
    }
  }

  /**
   * Obtiene una compra por ID
   */
  static getCompraById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const db = getDatabase();

      const stmt = db.prepare('SELECT * FROM compras WHERE id = ?');
      const compra = stmt.get(id);

      if (!compra) {
        return res.status(404).json({ error: 'Compra no encontrada' });
      }

      res.json({
        success: true,
        data: compra,
      });
    } catch (error: any) {
      console.error('Error al obtener compra:', error);
      res.status(500).json({
        error: 'Error al obtener compra',
        details: error.message,
      });
    }
  }

  /**
   * Actualiza una compra
   */
  static updateCompra(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const fields: string[] = [];
      const values: any[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id' && value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });

      if (fields.length === 0) {
        return res.status(400).json({ error: 'No hay datos para actualizar' });
      }

      values.push(id);
      const db = getDatabase();
      const stmt = db.prepare(`UPDATE compras SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`);
      const result = stmt.run(...values);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Compra no encontrada' });
      }

      res.json({
        success: true,
        message: 'Compra actualizada exitosamente',
      });
    } catch (error: any) {
      console.error('Error al actualizar compra:', error);
      res.status(500).json({
        error: 'Error al actualizar compra',
        details: error.message,
      });
    }
  }

  /**
   * Elimina una compra
   */
  static deleteCompra(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const db = getDatabase();

      const stmt = db.prepare('DELETE FROM compras WHERE id = ?');
      const result = stmt.run(id);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Compra no encontrada' });
      }

      res.json({
        success: true,
        message: 'Compra eliminada exitosamente',
      });
    } catch (error: any) {
      console.error('Error al eliminar compra:', error);
      res.status(500).json({
        error: 'Error al eliminar compra',
        details: error.message,
      });
    }
  }

  /**
   * Obtiene resumen de compras por período
   */
  static getResumenCompras(req: Request, res: Response) {
    try {
      const { desde, hasta } = req.query;
      const db = getDatabase();

      let query = `
        SELECT
          COUNT(*) as total_compras,
          SUM(monto_neto) as total_neto,
          SUM(monto_iva) as total_iva,
          SUM(monto_total) as total_monto,
          SUM(CASE WHEN es_credito_fiscal = 1 THEN monto_iva ELSE 0 END) as credito_fiscal
        FROM compras
        WHERE 1=1
      `;
      const params: any[] = [];

      if (desde) {
        query += ' AND fecha_documento >= ?';
        params.push(desde);
      }

      if (hasta) {
        query += ' AND fecha_documento <= ?';
        params.push(hasta);
      }

      const stmt = db.prepare(query);
      const resumen = stmt.get(...params);

      // Obtener resumen por categoría
      let queryCategorias = `
        SELECT
          categoria,
          COUNT(*) as cantidad,
          SUM(monto_total) as total
        FROM compras
        WHERE 1=1
      `;

      if (desde) queryCategorias += ' AND fecha_documento >= ?';
      if (hasta) queryCategorias += ' AND fecha_documento <= ?';
      queryCategorias += ' GROUP BY categoria ORDER BY total DESC';

      const stmtCategorias = db.prepare(queryCategorias);
      const categorias = stmtCategorias.all(...params);

      res.json({
        success: true,
        data: {
          resumen,
          por_categoria: categorias,
        },
      });
    } catch (error: any) {
      console.error('Error al obtener resumen:', error);
      res.status(500).json({
        error: 'Error al obtener resumen de compras',
        details: error.message,
      });
    }
  }
}
