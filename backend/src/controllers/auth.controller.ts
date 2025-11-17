import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

/**
 * Controlador de Autenticación
 * Maneja registro, login, y gestión de usuarios
 */
export class AuthController {
  /**
   * POST /api/auth/register
   * Registra un nuevo usuario
   */
  async register(req: Request, res: Response) {
    try {
      const { nombre, email, password, rol, rut, telefono } = req.body;

      // Validaciones básicas
      if (!nombre || !email || !password) {
        return res.status(400).json({
          error: 'Datos incompletos',
          message: 'Nombre, email y password son obligatorios',
        });
      }

      if (!rol || !['admin', 'usuario', 'visor'].includes(rol)) {
        return res.status(400).json({
          error: 'Rol inválido',
          message: 'El rol debe ser: admin, usuario o visor',
        });
      }

      // Validar longitud de contraseña
      if (password.length < 6) {
        return res.status(400).json({
          error: 'Contraseña débil',
          message: 'La contraseña debe tener al menos 6 caracteres',
        });
      }

      // Registrar usuario
      const usuario = await authService.registrarUsuario({
        nombre,
        email,
        password,
        rol,
        rut,
        telefono,
      });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado correctamente',
        usuario,
      });
    } catch (error: any) {
      console.error('Error en registro:', error);
      res.status(400).json({
        error: 'Error al registrar usuario',
        message: error.message,
      });
    }
  }

  /**
   * POST /api/auth/login
   * Inicia sesión y obtiene token JWT
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'Datos incompletos',
          message: 'Email y password son obligatorios',
        });
      }

      const result = await authService.login(email, password);

      res.json({
        success: true,
        message: 'Login exitoso',
        ...result,
      });
    } catch (error: any) {
      console.error('Error en login:', error);
      res.status(401).json({
        error: 'Credenciales inválidas',
        message: error.message,
      });
    }
  }

  /**
   * GET /api/auth/me
   * Obtiene información del usuario autenticado
   */
  async getMe(req: Request, res: Response) {
    try {
      const usuario = (req as any).usuario;

      res.json({
        success: true,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
      });
    } catch (error: any) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({
        error: 'Error al obtener datos del usuario',
        message: error.message,
      });
    }
  }

  /**
   * GET /api/auth/usuarios
   * Obtiene todos los usuarios (solo admin)
   */
  async getUsuarios(req: Request, res: Response) {
    try {
      const usuarios = authService.getUsuarios();

      res.json({
        success: true,
        usuarios,
      });
    } catch (error: any) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({
        error: 'Error al obtener usuarios',
        message: error.message,
      });
    }
  }

  /**
   * PUT /api/auth/usuarios/:id/rol
   * Cambia el rol de un usuario (solo admin)
   */
  async cambiarRol(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { rol } = req.body;

      if (!rol || !['admin', 'usuario', 'visor'].includes(rol)) {
        return res.status(400).json({
          error: 'Rol inválido',
          message: 'El rol debe ser: admin, usuario o visor',
        });
      }

      const result = authService.cambiarRol(parseInt(id), rol);

      res.json({
        success: true,
        message: `Rol actualizado a: ${rol}`,
      });
    } catch (error: any) {
      console.error('Error cambiando rol:', error);
      res.status(400).json({
        error: 'Error al cambiar rol',
        message: error.message,
      });
    }
  }

  /**
   * DELETE /api/auth/usuarios/:id
   * Desactiva un usuario (solo admin)
   */
  async desactivarUsuario(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = authService.desactivarUsuario(parseInt(id));

      res.json({
        success: true,
        message: 'Usuario desactivado correctamente',
      });
    } catch (error: any) {
      console.error('Error desactivando usuario:', error);
      res.status(400).json({
        error: 'Error al desactivar usuario',
        message: error.message,
      });
    }
  }

  /**
   * PUT /api/auth/cambiar-password
   * Cambia la contraseña del usuario autenticado
   */
  async cambiarPassword(req: Request, res: Response) {
    try {
      const usuario = (req as any).usuario;
      const { password_actual, password_nueva } = req.body;

      if (!password_actual || !password_nueva) {
        return res.status(400).json({
          error: 'Datos incompletos',
          message: 'Se requiere contraseña actual y nueva',
        });
      }

      if (password_nueva.length < 6) {
        return res.status(400).json({
          error: 'Contraseña débil',
          message: 'La contraseña nueva debe tener al menos 6 caracteres',
        });
      }

      const result = await authService.cambiarPassword(
        usuario.id,
        password_actual,
        password_nueva
      );

      res.json({
        success: true,
        message: 'Contraseña actualizada correctamente',
      });
    } catch (error: any) {
      console.error('Error cambiando password:', error);
      res.status(400).json({
        error: 'Error al cambiar contraseña',
        message: error.message,
      });
    }
  }
}

export const authController = new AuthController();
