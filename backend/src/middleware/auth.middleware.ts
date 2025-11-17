import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

/**
 * Middleware de autenticación
 * Verifica que el usuario tenga un token válido
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No autorizado. Token requerido.',
      });
    }

    const token = authHeader.substring(7);
    const usuario = authService.verificarToken(token);

    // Adjuntar usuario a la request
    (req as any).usuario = usuario;

    next();
  } catch (error: any) {
    return res.status(401).json({
      error: 'Token inválido o expirado',
      details: error.message,
    });
  }
}

/**
 * Middleware para verificar rol específico
 */
export function requireRole(...rolesPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const usuario = (req as any).usuario;

    if (!usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!rolesPermitidos.includes(usuario.rol)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: `Esta acción requiere rol: ${rolesPermitidos.join(' o ')}`,
        tu_rol: usuario.rol,
      });
    }

    next();
  };
}

/**
 * Middleware para verificar permiso específico
 */
export function requirePermiso(permiso: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const usuario = (req as any).usuario;

    if (!usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { tienePermiso } = require('../services/auth.service');

    if (!tienePermiso(usuario.rol, permiso)) {
      return res.status(403).json({
        error: 'Permiso denegado',
        message: `No tienes permiso para: ${permiso}`,
        tu_rol: usuario.rol,
      });
    }

    next();
  };
}
