import { getDatabase } from '../database/schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Servicio de Autenticación y Gestión de Usuarios
 * Roles: admin (contador), usuario (dueño/empleado), visor (solo lectura)
 */
export class AuthService {
  private db;
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'APP_FINANZAS_SECRET_2025';
  private readonly JWT_EXPIRES_IN = '7d';

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Crea un nuevo usuario
   */
  async registrarUsuario(datos: {
    nombre: string;
    email: string;
    password: string;
    rol: 'admin' | 'usuario' | 'visor';
    rut?: string;
    telefono?: string;
  }) {
    // Validar que el email no exista
    const existente = this.db
      .prepare('SELECT id FROM usuarios WHERE email = ?')
      .get(datos.email);

    if (existente) {
      throw new Error('El email ya está registrado');
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(datos.password, 10);

    // Insertar usuario
    const stmt = this.db.prepare(`
      INSERT INTO usuarios (nombre, email, password_hash, rol, rut, telefono, activo)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);

    const result = stmt.run(
      datos.nombre,
      datos.email,
      passwordHash,
      datos.rol,
      datos.rut || null,
      datos.telefono || null
    );

    console.log(`✅ Usuario registrado: ${datos.nombre} (${datos.rol})`);

    return {
      id: result.lastInsertRowid,
      nombre: datos.nombre,
      email: datos.email,
      rol: datos.rol,
    };
  }

  /**
   * Login de usuario
   */
  async login(email: string, password: string) {
    // Buscar usuario
    const usuario = this.db
      .prepare('SELECT * FROM usuarios WHERE email = ? AND activo = 1')
      .get(email) as any;

    if (!usuario) {
      throw new Error('Email o contraseña incorrectos');
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
      throw new Error('Email o contraseña incorrectos');
    }

    // Actualizar último acceso
    this.db
      .prepare("UPDATE usuarios SET ultimo_acceso = datetime('now') WHERE id = ?")
      .run(usuario.id);

    // Generar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        nombre: usuario.nombre,
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        rut: usuario.rut,
      },
    };
  }

  /**
   * Verifica el token JWT
   */
  verificarToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      return decoded;
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  /**
   * Obtiene todos los usuarios (solo admin)
   */
  getUsuarios() {
    return this.db.prepare('SELECT id, nombre, email, rol, rut, telefono, activo, created_at, ultimo_acceso FROM usuarios').all();
  }

  /**
   * Cambia rol de usuario (solo admin)
   */
  cambiarRol(usuarioId: number, nuevoRol: 'admin' | 'usuario' | 'visor') {
    const stmt = this.db.prepare('UPDATE usuarios SET rol = ? WHERE id = ?');
    const result = stmt.run(nuevoRol, usuarioId);

    if (result.changes === 0) {
      throw new Error('Usuario no encontrado');
    }

    console.log(`✅ Rol cambiado para usuario ${usuarioId}: ${nuevoRol}`);
    return { success: true };
  }

  /**
   * Desactiva usuario (solo admin)
   */
  desactivarUsuario(usuarioId: number) {
    const stmt = this.db.prepare('UPDATE usuarios SET activo = 0 WHERE id = ?');
    const result = stmt.run(usuarioId);

    if (result.changes === 0) {
      throw new Error('Usuario no encontrado');
    }

    return { success: true };
  }

  /**
   * Cambia contraseña
   */
  async cambiarPassword(usuarioId: number, passwordActual: string, passwordNueva: string) {
    // Verificar contraseña actual
    const usuario = this.db
      .prepare('SELECT password_hash FROM usuarios WHERE id = ?')
      .get(usuarioId) as any;

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const passwordValida = await bcrypt.compare(passwordActual, usuario.password_hash);

    if (!passwordValida) {
      throw new Error('Contraseña actual incorrecta');
    }

    // Hash de nueva contraseña
    const nuevoHash = await bcrypt.hash(passwordNueva, 10);

    // Actualizar
    this.db
      .prepare('UPDATE usuarios SET password_hash = ? WHERE id = ?')
      .run(nuevoHash, usuarioId);

    return { success: true, message: 'Contraseña actualizada' };
  }

  /**
   * Crea usuario administrador por defecto
   */
  async crearAdminDefault() {
    const adminExiste = this.db
      .prepare("SELECT id FROM usuarios WHERE rol = 'admin'")
      .get();

    if (!adminExiste) {
      await this.registrarUsuario({
        nombre: 'Administrador',
        email: 'admin@finanzas.cl',
        password: 'admin123',
        rol: 'admin',
      });

      console.log('⚠️  Usuario admin creado:');
      console.log('   Email: admin@finanzas.cl');
      console.log('   Password: admin123');
      console.log('   ⚠️  CAMBIAR PASSWORD INMEDIATAMENTE');
    }
  }
}

/**
 * Permisos por rol
 */
export const PERMISOS = {
  admin: {
    // Control total
    ver_todo: true,
    crear_usuario: true,
    cambiar_roles: true,
    ver_contabilidad: true,
    editar_asientos: true,
    eliminar_documentos: true,
    ver_reportes: true,
    configurar_sistema: true,
    ver_declaraciones: true,
    generar_libros: true,
  },
  usuario: {
    // Solo registro de operaciones
    ver_todo: false,
    crear_usuario: false,
    cambiar_roles: false,
    ver_contabilidad: false, // No ve asientos contables
    editar_asientos: false,
    eliminar_documentos: false, // No puede eliminar
    ver_reportes: true, // Puede ver sus reportes
    configurar_sistema: false,
    ver_declaraciones: false, // No ve declaraciones
    generar_libros: false,
    // Permisos específicos de usuario
    registrar_gasto: true,
    registrar_venta: true,
    subir_factura: true,
    ver_dashboard: true,
  },
  visor: {
    // Solo lectura
    ver_todo: true,
    crear_usuario: false,
    cambiar_roles: false,
    ver_contabilidad: true,
    editar_asientos: false,
    eliminar_documentos: false,
    ver_reportes: true,
    configurar_sistema: false,
    ver_declaraciones: true,
    generar_libros: false,
    // No puede registrar nada
    registrar_gasto: false,
    registrar_venta: false,
    subir_factura: false,
  },
};

/**
 * Verifica si un usuario tiene un permiso específico
 */
export function tienePermiso(rol: 'admin' | 'usuario' | 'visor', permiso: string): boolean {
  return (PERMISOS[rol] as any)[permiso] === true;
}
