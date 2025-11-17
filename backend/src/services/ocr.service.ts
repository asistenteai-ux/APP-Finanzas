import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Tesseract from 'tesseract.js';
import { PDFExtract } from 'pdf.js-extract';

/**
 * Servicio de OCR y Extracción de Datos de Facturas
 * Extrae automáticamente datos de facturas PDF o imágenes
 */
export class OCRService {
  private uploadDir: string;
  private pdfExtract: PDFExtract;

  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.pdfExtract = new PDFExtract();

    // Crear carpeta de uploads si no existe
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Configuración de Multer para subida de archivos
   */
  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      },
    });

    return multer({
      storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB máximo
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
          return cb(null, true);
        } else {
          cb(new Error('Solo se permiten imágenes (JPG, PNG) o PDF'));
        }
      },
    });
  }

  /**
   * Extrae texto de una imagen usando OCR
   */
  async extraerTextoImagen(rutaArchivo: string): Promise<string> {
    try {
      console.log('🔍 Procesando imagen con OCR...');

      const {
        data: { text },
      } = await Tesseract.recognize(rutaArchivo, 'spa', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      return text;
    } catch (error: any) {
      console.error('Error en OCR:', error.message);
      throw new Error(`Error al extraer texto de imagen: ${error.message}`);
    }
  }

  /**
   * Extrae texto de un PDF
   */
  async extraerTextoPDF(rutaArchivo: string): Promise<string> {
    try {
      console.log('📄 Extrayendo texto de PDF...');

      const data = await this.pdfExtract.extract(rutaArchivo, {});

      let textoCompleto = '';
      data.pages.forEach((page) => {
        page.content.forEach((item) => {
          if (item.str) {
            textoCompleto += item.str + ' ';
          }
        });
      });

      return textoCompleto;
    } catch (error: any) {
      console.error('Error extrayendo PDF:', error.message);
      throw new Error(`Error al extraer texto de PDF: ${error.message}`);
    }
  }

  /**
   * Procesa un archivo y extrae texto
   */
  async procesarArchivo(rutaArchivo: string): Promise<string> {
    const extension = path.extname(rutaArchivo).toLowerCase();

    if (extension === '.pdf') {
      return this.extraerTextoPDF(rutaArchivo);
    } else if (['.jpg', '.jpeg', '.png'].includes(extension)) {
      return this.extraerTextoImagen(rutaArchivo);
    } else {
      throw new Error('Tipo de archivo no soportado');
    }
  }

  /**
   * Extrae datos estructurados de una factura chilena
   */
  async extraerDatosFactura(texto: string): Promise<any> {
    // Patrones regex para facturas chilenas
    const patrones = {
      // RUT: 12.345.678-9 o 12345678-9
      rut: /(\d{1,2}\.?\d{3}\.?\d{3}-[\dkK])/gi,

      // Monto total: TOTAL $1.234.567 o Total: $1,234,567
      total: /(?:total|monto\s+total)[\s:$]*(\d{1,3}(?:[.,]\d{3})*)/gi,

      // Fecha: 12-01-2025 o 12/01/2025 o 12.01.2025
      fecha: /(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})/g,

      // Número de factura: N° 123456 o Folio 123456
      folio: /(?:n[°º]|folio|factura)[\s:]*(\d+)/gi,

      // Razón social (después de palabras clave)
      razonSocial: /(?:señor(?:es)?|empresa|cliente)[\s:]*([A-Z][A-Za-z\s\.]+(?:S\.A\.|SpA|Ltda\.)?)/gi,

      // Neto y IVA
      neto: /(?:neto|afecto)[\s:$]*(\d{1,3}(?:[.,]\d{3})*)/gi,
      iva: /(?:iva|i\.v\.a\.)[\s:$]*(\d{1,3}(?:[.,]\d{3})*)/gi,
    };

    const datos: any = {
      texto_completo: texto,
      rut: null,
      razon_social: null,
      folio: null,
      fecha: null,
      monto_neto: null,
      monto_iva: null,
      monto_total: null,
      confianza: 'baja',
    };

    // Extraer RUT
    const matchRut = texto.match(patrones.rut);
    if (matchRut && matchRut.length > 0) {
      // El primer RUT suele ser del emisor
      datos.rut = matchRut[0].replace(/\./g, '');
    }

    // Extraer folio
    const matchFolio = patrones.folio.exec(texto);
    if (matchFolio) {
      datos.folio = parseInt(matchFolio[1]);
    }

    // Extraer fecha
    const matchFecha = texto.match(patrones.fecha);
    if (matchFecha && matchFecha.length > 0) {
      datos.fecha = matchFecha[0];
    }

    // Extraer montos (tomar el último de cada uno, generalmente es el correcto)
    const matchesTotal = Array.from(texto.matchAll(patrones.total));
    if (matchesTotal.length > 0) {
      const montoStr = matchesTotal[matchesTotal.length - 1][1].replace(/[.,]/g, '');
      datos.monto_total = parseInt(montoStr);
    }

    const matchesNeto = Array.from(texto.matchAll(patrones.neto));
    if (matchesNeto.length > 0) {
      const montoStr = matchesNeto[matchesNeto.length - 1][1].replace(/[.,]/g, '');
      datos.monto_neto = parseInt(montoStr);
    }

    const matchesIva = Array.from(texto.matchAll(patrones.iva));
    if (matchesIva.length > 0) {
      const montoStr = matchesIva[matchesIva.length - 1][1].replace(/[.,]/g, '');
      datos.monto_iva = parseInt(montoStr);
    }

    // Extraer razón social
    const matchRazon = patrones.razonSocial.exec(texto);
    if (matchRazon) {
      datos.razon_social = matchRazon[1].trim();
    }

    // Calcular nivel de confianza
    let camposCompletos = 0;
    const camposClave = ['rut', 'folio', 'monto_total'];

    camposClave.forEach(campo => {
      if (datos[campo]) camposCompletos++;
    });

    if (camposCompletos === 3) {
      datos.confianza = 'alta';
    } else if (camposCompletos >= 2) {
      datos.confianza = 'media';
    }

    console.log(`✅ Datos extraídos (confianza: ${datos.confianza}):`, {
      rut: datos.rut,
      folio: datos.folio,
      total: datos.monto_total,
    });

    return datos;
  }

  /**
   * Proceso completo: sube archivo, extrae texto, extrae datos
   */
  async procesarFacturaCompleta(rutaArchivo: string): Promise<any> {
    try {
      // 1. Extraer texto
      const texto = await this.procesarArchivo(rutaArchivo);

      // 2. Extraer datos estructurados
      const datos = await this.extraerDatosFactura(texto);

      return {
        success: true,
        archivo: rutaArchivo,
        datos_extraidos: datos,
      };
    } catch (error: any) {
      console.error('Error procesando factura:', error);
      return {
        success: false,
        error: error.message,
        archivo: rutaArchivo,
      };
    }
  }

  /**
   * Elimina archivo temporal
   */
  eliminarArchivo(rutaArchivo: string) {
    if (fs.existsSync(rutaArchivo)) {
      fs.unlinkSync(rutaArchivo);
      console.log(`🗑️  Archivo eliminado: ${rutaArchivo}`);
    }
  }
}
