import { Request, Response } from 'express';
import { SIIAuthService } from '../services/sii/auth.service';
import { DTEService } from '../services/sii/dte.service';
import { getDatabase } from '../database/schema';

const siiAuthService = new SIIAuthService();
const dteService = new DTEService();

/**
 * Controlador para pruebas y diagnóstico de conexión con SII
 */
export class SIIDiagnosticoController {
  /**
   * Prueba completa de conexión con el SII
   */
  static async testConexion(req: Request, res: Response) {
    const resultados: any = {
      timestamp: new Date().toISOString(),
      ambiente: process.env.SII_ENVIRONMENT || 'certificacion',
      pruebas: {},
      errores: [],
      advertencias: [],
    };

    try {
      // 1. Verificar configuración de empresa
      console.log('\n🔍 PRUEBA 1: Verificando configuración de empresa...');
      const db = getDatabase();
      const empresa = db.prepare('SELECT * FROM configuracion_empresa WHERE id = 1').get() as any;

      if (!empresa) {
        resultados.pruebas.configuracion_empresa = {
          exito: false,
          mensaje: 'No hay configuración de empresa. Configure en /configuracion',
        };
        resultados.errores.push('Falta configuración de empresa');
      } else {
        resultados.pruebas.configuracion_empresa = {
          exito: true,
          mensaje: 'Configuración de empresa encontrada',
          datos: {
            rut: empresa.rut,
            razon_social: empresa.razon_social,
            ambiente_sii: empresa.ambiente_sii,
            tiene_codigo_sii: !!empresa.codigo_sii,
            tiene_resolucion_sii: !!empresa.resolucion_sii,
          },
        };

        if (!empresa.codigo_sii || !empresa.resolucion_sii) {
          resultados.advertencias.push('Faltan código y/o resolución del SII en configuración de empresa');
        }
      }

      // 2. Verificar certificado digital
      console.log('\n🔍 PRUEBA 2: Verificando certificado digital...');
      const certPath = process.env.CERT_PATH;
      const certPassword = process.env.CERT_PASSWORD;

      if (!certPath || !certPassword) {
        resultados.pruebas.certificado = {
          exito: false,
          mensaje: 'No se configuró CERT_PATH o CERT_PASSWORD en .env',
        };
        resultados.errores.push('Falta configuración de certificado digital');
      } else {
        const certValido = siiAuthService.validateCertificate();

        if (certValido) {
          try {
            const certInfo = siiAuthService.getCertificateInfo();
            resultados.pruebas.certificado = {
              exito: true,
              mensaje: 'Certificado digital válido',
              info: {
                validFrom: certInfo.validFrom,
                validTo: certInfo.validTo,
                serialNumber: certInfo.serialNumber,
              },
            };

            // Verificar vencimiento
            const ahora = new Date();
            const vencimiento = new Date(certInfo.validTo);
            const diasRestantes = Math.floor((vencimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));

            if (diasRestantes < 0) {
              resultados.errores.push('El certificado digital está vencido');
              resultados.pruebas.certificado.exito = false;
            } else if (diasRestantes < 30) {
              resultados.advertencias.push(`El certificado vence en ${diasRestantes} días`);
            }
          } catch (error: any) {
            resultados.pruebas.certificado = {
              exito: false,
              mensaje: `Error al leer certificado: ${error.message}`,
            };
            resultados.errores.push(`Error al leer certificado: ${error.message}`);
          }
        } else {
          resultados.pruebas.certificado = {
            exito: false,
            mensaje: 'Certificado digital inválido o password incorrecto',
          };
          resultados.errores.push('Certificado digital inválido');
        }
      }

      // 3. Probar obtención de semilla
      console.log('\n🔍 PRUEBA 3: Obteniendo semilla del SII...');
      try {
        const semilla = await siiAuthService.getSeed();
        resultados.pruebas.semilla = {
          exito: true,
          mensaje: 'Semilla obtenida correctamente del SII',
          semilla_preview: semilla.substring(0, 20) + '...',
        };
      } catch (error: any) {
        resultados.pruebas.semilla = {
          exito: false,
          mensaje: `Error al obtener semilla: ${error.message}`,
        };
        resultados.errores.push(`No se pudo obtener semilla del SII: ${error.message}`);
      }

      // 4. Probar obtención de token (solo si tenemos certificado)
      console.log('\n🔍 PRUEBA 4: Obteniendo token del SII...');
      if (resultados.pruebas.certificado?.exito && resultados.pruebas.semilla?.exito) {
        try {
          const token = await siiAuthService.getToken();
          resultados.pruebas.token = {
            exito: true,
            mensaje: 'Token obtenido correctamente del SII',
            token_preview: token.substring(0, 30) + '...',
          };
        } catch (error: any) {
          resultados.pruebas.token = {
            exito: false,
            mensaje: `Error al obtener token: ${error.message}`,
          };
          resultados.errores.push(`No se pudo obtener token del SII: ${error.message}`);
        }
      } else {
        resultados.pruebas.token = {
          exito: false,
          mensaje: 'Omitida: falló prueba de certificado o semilla',
        };
      }

      // Resumen final
      const pruebasExitosas = Object.values(resultados.pruebas).filter((p: any) => p.exito).length;
      const totalPruebas = Object.keys(resultados.pruebas).length;

      resultados.resumen = {
        pruebas_exitosas: pruebasExitosas,
        total_pruebas: totalPruebas,
        porcentaje_exito: Math.round((pruebasExitosas / totalPruebas) * 100),
        estado_general: resultados.errores.length === 0 ? 'LISTO PARA USAR' : 'REQUIERE CONFIGURACIÓN',
      };

      const statusCode = resultados.errores.length === 0 ? 200 : 500;

      console.log('\n✅ Diagnóstico completado');
      res.status(statusCode).json({
        success: resultados.errores.length === 0,
        message: resultados.resumen.estado_general,
        data: resultados,
      });
    } catch (error: any) {
      console.error('❌ Error en diagnóstico:', error);
      res.status(500).json({
        success: false,
        error: 'Error al realizar diagnóstico de conexión con SII',
        details: error.message,
      });
    }
  }

  /**
   * Obtiene solo la semilla (prueba rápida)
   */
  static async getSemilla(req: Request, res: Response) {
    try {
      const semilla = await siiAuthService.getSeed();
      res.json({
        success: true,
        message: 'Semilla obtenida correctamente',
        data: {
          semilla: semilla.substring(0, 50) + '...',
          longitud: semilla.length,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Error al obtener semilla del SII',
        details: error.message,
      });
    }
  }

  /**
   * Obtiene token (prueba completa de autenticación)
   */
  static async getToken(req: Request, res: Response) {
    try {
      const token = await siiAuthService.getToken();
      res.json({
        success: true,
        message: 'Token obtenido correctamente',
        data: {
          token: token.substring(0, 50) + '...',
          longitud: token.length,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Error al obtener token del SII',
        details: error.message,
      });
    }
  }

  /**
   * Información del certificado digital
   */
  static async getCertificadoInfo(req: Request, res: Response) {
    try {
      const certInfo = siiAuthService.getCertificateInfo();

      // Calcular días restantes
      const ahora = new Date();
      const vencimiento = new Date(certInfo.validTo);
      const diasRestantes = Math.floor((vencimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));

      res.json({
        success: true,
        message: 'Información del certificado digital',
        data: {
          ...certInfo,
          diasRestantes,
          estado: diasRestantes < 0 ? 'VENCIDO' : diasRestantes < 30 ? 'PRÓXIMO A VENCER' : 'VIGENTE',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Error al leer certificado digital',
        details: error.message,
      });
    }
  }
}
