import { Request, Response } from 'express';
import { getDatabase } from '../database/schema';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración de multer para subir logos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, svg)'));
    }
  },
});

export class EmpresaController {
  // Obtener configuración de la empresa
  static async getConfiguracion(req: Request, res: Response) {
    try {
      const db = getDatabase();
      const config = db.prepare('SELECT * FROM configuracion_empresa WHERE id = 1').get();

      if (!config) {
        return res.json({
          success: true,
          data: null,
          message: 'No hay configuración de empresa aún',
        });
      }

      res.json({
        success: true,
        data: config,
      });
    } catch (error: any) {
      console.error('Error al obtener configuración:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener configuración de empresa',
      });
    }
  }

  // Crear o actualizar configuración de la empresa
  static async updateConfiguracion(req: Request, res: Response) {
    try {
      const {
        rut,
        razon_social,
        nombre_fantasia,
        giro,
        direccion,
        comuna,
        ciudad,
        region,
        telefono,
        email,
        sitio_web,
        actividad_economica,
        representante_legal,
        representante_rut,
        codigo_sii,
        resolucion_sii,
        ambiente_sii,
      } = req.body;

      // Validar RUT
      if (!validarRUT(rut)) {
        return res.status(400).json({
          success: false,
          error: 'RUT inválido. Debe tener formato 12345678-9',
        });
      }

      if (representante_rut && !validarRUT(representante_rut)) {
        return res.status(400).json({
          success: false,
          error: 'RUT del representante inválido. Debe tener formato 12345678-9',
        });
      }

      // Validar campos requeridos
      if (!razon_social || !giro || !direccion || !comuna || !ciudad || !region) {
        return res.status(400).json({
          success: false,
          error: 'Faltan campos obligatorios',
        });
      }

      const db = getDatabase();

      // Verificar si ya existe configuración
      const existe = db.prepare('SELECT id FROM configuracion_empresa WHERE id = 1').get();

      let logo_path = null;
      if (req.file) {
        logo_path = `/uploads/logos/${req.file.filename}`;
      } else if (existe && req.body.logo_path) {
        // Mantener el logo existente si no se subió uno nuevo
        const existente: any = db.prepare('SELECT logo_path FROM configuracion_empresa WHERE id = 1').get();
        logo_path = existente?.logo_path;
      }

      if (existe) {
        // Actualizar
        const stmt = db.prepare(`
          UPDATE configuracion_empresa
          SET rut = ?,
              razon_social = ?,
              nombre_fantasia = ?,
              giro = ?,
              direccion = ?,
              comuna = ?,
              ciudad = ?,
              region = ?,
              telefono = ?,
              email = ?,
              sitio_web = ?,
              logo_path = ?,
              actividad_economica = ?,
              representante_legal = ?,
              representante_rut = ?,
              codigo_sii = ?,
              resolucion_sii = ?,
              ambiente_sii = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = 1
        `);

        stmt.run(
          rut,
          razon_social,
          nombre_fantasia,
          giro,
          direccion,
          comuna,
          ciudad,
          region,
          telefono,
          email,
          sitio_web,
          logo_path,
          actividad_economica,
          representante_legal,
          representante_rut,
          codigo_sii,
          resolucion_sii,
          ambiente_sii || 'certificacion'
        );
      } else {
        // Crear
        const stmt = db.prepare(`
          INSERT INTO configuracion_empresa (
            id, rut, razon_social, nombre_fantasia, giro, direccion, comuna, ciudad, region,
            telefono, email, sitio_web, logo_path, actividad_economica, representante_legal,
            representante_rut, codigo_sii, resolucion_sii, ambiente_sii
          ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          rut,
          razon_social,
          nombre_fantasia,
          giro,
          direccion,
          comuna,
          ciudad,
          region,
          telefono,
          email,
          sitio_web,
          logo_path,
          actividad_economica,
          representante_legal,
          representante_rut,
          codigo_sii,
          resolucion_sii,
          ambiente_sii || 'certificacion'
        );
      }

      const config = db.prepare('SELECT * FROM configuracion_empresa WHERE id = 1').get();

      res.json({
        success: true,
        data: config,
        message: 'Configuración guardada exitosamente',
      });
    } catch (error: any) {
      console.error('Error al guardar configuración:', error);
      res.status(500).json({
        success: false,
        error: 'Error al guardar configuración de empresa',
      });
    }
  }

  // Middleware de multer
  static getUploadMiddleware() {
    return upload.single('logo');
  }
}

// Función para validar RUT chileno
function validarRUT(rut: string): boolean {
  if (!rut || typeof rut !== 'string') return false;

  // Limpiar el RUT
  rut = rut.trim().toUpperCase();

  // Verificar formato con guión
  if (!/^(\d{1,2})\.?(\d{3})\.?(\d{3})-?([0-9K])$/.test(rut)) {
    return false;
  }

  // Extraer dígitos y dígito verificador
  const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '');
  const cuerpo = rutLimpio.slice(0, -1);
  const digitoVerificador = rutLimpio.slice(-1);

  // Calcular dígito verificador
  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i)) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

  return digitoVerificador === dvCalculado;
}

// Función para formatear RUT (agregar guión)
export function formatearRUT(rut: string): string {
  if (!rut) return '';

  // Limpiar el RUT
  const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();

  // Agregar guión antes del último dígito
  if (rutLimpio.length > 1) {
    return rutLimpio.slice(0, -1) + '-' + rutLimpio.slice(-1);
  }

  return rutLimpio;
}
