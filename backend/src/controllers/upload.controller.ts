import { Request, Response } from 'express';
import { OCRService } from '../services/ocr.service';
import path from 'path';

const ocrService = new OCRService();

/**
 * Controlador de Subida de Archivos y OCR
 * Maneja la subida de facturas/documentos y extracción automática de datos
 */
export class UploadController {
  /**
   * POST /api/upload/factura
   * Sube una factura (imagen o PDF) y extrae datos automáticamente
   */
  async uploadFactura(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Archivo requerido',
          message: 'Debes subir una imagen (JPG, PNG) o PDF',
        });
      }

      const archivo = req.file;
      const rutaArchivo = archivo.path;

      console.log(`📤 Procesando archivo: ${archivo.originalname}`);

      // Procesar factura completa con OCR
      const resultado = await ocrService.procesarFacturaCompleta(rutaArchivo);

      if (!resultado.success) {
        return res.status(500).json({
          error: 'Error al procesar factura',
          message: resultado.error,
        });
      }

      // Opcional: eliminar archivo temporal después de procesarlo
      // ocrService.eliminarArchivo(rutaArchivo);

      res.json({
        success: true,
        message: 'Factura procesada correctamente',
        archivo: {
          nombre_original: archivo.originalname,
          ruta: rutaArchivo,
          tamaño: archivo.size,
        },
        datos_extraidos: resultado.datos_extraidos,
        ayuda: {
          mensaje: 'Revisa los datos extraídos y corrígelos si es necesario antes de guardar',
          confianza: resultado.datos_extraidos.confianza,
          campos_detectados: {
            rut: resultado.datos_extraidos.rut ? '✓' : '✗',
            folio: resultado.datos_extraidos.folio ? '✓' : '✗',
            fecha: resultado.datos_extraidos.fecha ? '✓' : '✗',
            monto_total: resultado.datos_extraidos.monto_total ? '✓' : '✗',
          },
        },
      });
    } catch (error: any) {
      console.error('Error en upload factura:', error);
      res.status(500).json({
        error: 'Error al procesar archivo',
        message: error.message,
      });
    }
  }

  /**
   * POST /api/upload/gasto
   * Sube un comprobante de gasto y extrae datos
   */
  async uploadGasto(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Archivo requerido',
          message: 'Debes subir una imagen (JPG, PNG) o PDF del comprobante',
        });
      }

      const archivo = req.file;
      const rutaArchivo = archivo.path;

      console.log(`📤 Procesando gasto: ${archivo.originalname}`);

      // Procesar con OCR
      const resultado = await ocrService.procesarFacturaCompleta(rutaArchivo);

      if (!resultado.success) {
        return res.status(500).json({
          error: 'Error al procesar comprobante',
          message: resultado.error,
        });
      }

      res.json({
        success: true,
        message: 'Comprobante de gasto procesado correctamente',
        archivo: {
          nombre_original: archivo.originalname,
          ruta: rutaArchivo,
          tamaño: archivo.size,
        },
        datos_extraidos: resultado.datos_extraidos,
        ayuda: {
          mensaje: '💡 Estos son los datos que detectamos automáticamente. Puedes editarlos antes de guardar.',
          sugerencias: [
            resultado.datos_extraidos.rut
              ? 'RUT detectado correctamente'
              : 'No se detectó el RUT. Por favor ingrésalo manualmente.',
            resultado.datos_extraidos.monto_total
              ? 'Monto total detectado'
              : 'No se detectó el monto. Por favor ingrésalo manualmente.',
            resultado.datos_extraidos.fecha
              ? 'Fecha detectada'
              : 'No se detectó la fecha. Por favor ingrésala manualmente.',
          ],
        },
      });
    } catch (error: any) {
      console.error('Error en upload gasto:', error);
      res.status(500).json({
        error: 'Error al procesar archivo',
        message: error.message,
      });
    }
  }

  /**
   * POST /api/upload/extraer-texto
   * Extrae texto de una imagen o PDF (uso general)
   */
  async extraerTexto(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Archivo requerido',
          message: 'Debes subir una imagen o PDF',
        });
      }

      const archivo = req.file;
      const rutaArchivo = archivo.path;

      console.log(`📄 Extrayendo texto de: ${archivo.originalname}`);

      // Extraer solo texto
      const texto = await ocrService.procesarArchivo(rutaArchivo);

      res.json({
        success: true,
        archivo: archivo.originalname,
        texto_extraido: texto,
        longitud: texto.length,
      });
    } catch (error: any) {
      console.error('Error extrayendo texto:', error);
      res.status(500).json({
        error: 'Error al extraer texto',
        message: error.message,
      });
    }
  }

  /**
   * GET /api/upload/configuracion
   * Obtiene la configuración de Multer para usar en el frontend
   */
  getConfiguracion(req: Request, res: Response) {
    res.json({
      success: true,
      configuracion: {
        tipos_permitidos: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
        extensiones: ['.jpg', '.jpeg', '.png', '.pdf'],
        tamano_maximo: 10 * 1024 * 1024, // 10MB
        tamano_maximo_texto: '10MB',
      },
      ayuda: {
        mensaje: 'Sube tu factura o comprobante en formato JPG, PNG o PDF',
        pasos: [
          '1. Toma una foto clara del documento o escanéalo',
          '2. Sube el archivo usando el botón de abajo',
          '3. La aplicación extraerá automáticamente los datos',
          '4. Revisa y corrige los datos si es necesario',
          '5. Guarda el registro',
        ],
      },
    });
  }

  /**
   * Middleware para configurar Multer
   */
  getMulterMiddleware() {
    return ocrService.getMulterConfig().single('archivo');
  }
}

export const uploadController = new UploadController();
