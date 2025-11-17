import { getDatabase } from '../database/schema';
import { differenceInDays, addMonths, addYears, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface Recordatorio {
  id: number;
  tipo: string;
  nombre: string;
  descripcion: string;
  fecha_vencimiento: string;
  periodicidad: 'mensual' | 'semestral' | 'anual' | 'unica';
  dias_aviso: string;
  activo: number;
}

export interface Notificacion {
  id: number;
  recordatorio_id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  dias_restantes: number;
  leida: number;
  created_at: string;
}

/**
 * Servicio para gestión de recordatorios tributarios
 */
export class ReminderService {
  private db;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Obtiene todos los recordatorios activos
   */
  getAllReminders(): Recordatorio[] {
    const stmt = this.db.prepare('SELECT * FROM recordatorios WHERE activo = 1 ORDER BY fecha_vencimiento ASC');
    return stmt.all() as Recordatorio[];
  }

  /**
   * Obtiene un recordatorio por ID
   */
  getReminderById(id: number): Recordatorio | undefined {
    const stmt = this.db.prepare('SELECT * FROM recordatorios WHERE id = ?');
    return stmt.get(id) as Recordatorio | undefined;
  }

  /**
   * Crea un nuevo recordatorio
   */
  createReminder(reminder: Omit<Recordatorio, 'id'>): number {
    const stmt = this.db.prepare(`
      INSERT INTO recordatorios (tipo, nombre, descripcion, fecha_vencimiento, periodicidad, dias_aviso, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      reminder.tipo,
      reminder.nombre,
      reminder.descripcion,
      reminder.fecha_vencimiento,
      reminder.periodicidad,
      reminder.dias_aviso,
      reminder.activo
    );

    return result.lastInsertRowid as number;
  }

  /**
   * Actualiza un recordatorio
   */
  updateReminder(id: number, reminder: Partial<Recordatorio>): boolean {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(reminder).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    const stmt = this.db.prepare(`UPDATE recordatorios SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);

    return result.changes > 0;
  }

  /**
   * Elimina un recordatorio
   */
  deleteReminder(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM recordatorios WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Procesa recordatorios y genera notificaciones
   */
  processReminders(): void {
    const reminders = this.getAllReminders();
    const today = new Date();

    reminders.forEach((reminder) => {
      const fechaVencimiento = parseISO(reminder.fecha_vencimiento);
      const diasRestantes = differenceInDays(fechaVencimiento, today);

      // Si ya venció, actualizar fecha según periodicidad
      if (diasRestantes < 0) {
        this.updateReminderDate(reminder);
        return;
      }

      // Parsear días de aviso (ej: "30,15,7,3,1")
      const diasAviso = reminder.dias_aviso.split(',').map(Number);

      // Verificar si debemos crear notificación
      diasAviso.forEach((diasAviso) => {
        if (diasRestantes === diasAviso) {
          this.createNotification(reminder, diasRestantes);
        }
      });
    });
  }

  /**
   * Actualiza la fecha de vencimiento de un recordatorio según su periodicidad
   */
  private updateReminderDate(reminder: Recordatorio): void {
    const fechaActual = parseISO(reminder.fecha_vencimiento);
    let nuevaFecha: Date;

    switch (reminder.periodicidad) {
      case 'mensual':
        nuevaFecha = addMonths(fechaActual, 1);
        break;
      case 'semestral':
        nuevaFecha = addMonths(fechaActual, 6);
        break;
      case 'anual':
        nuevaFecha = addYears(fechaActual, 1);
        break;
      default:
        return; // No actualizar si es única
    }

    const stmt = this.db.prepare('UPDATE recordatorios SET fecha_vencimiento = ? WHERE id = ?');
    stmt.run(format(nuevaFecha, 'yyyy-MM-dd'), reminder.id);

    console.log(`📅 Recordatorio "${reminder.nombre}" actualizado a ${format(nuevaFecha, 'dd/MM/yyyy')}`);
  }

  /**
   * Crea una notificación para un recordatorio
   */
  private createNotification(reminder: Recordatorio, diasRestantes: number): void {
    // Verificar si ya existe una notificación para este día
    const checkStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM notificaciones
      WHERE recordatorio_id = ? AND dias_restantes = ? AND leida = 0
    `);
    const exists = checkStmt.get(reminder.id, diasRestantes) as { count: number };

    if (exists.count > 0) {
      return; // Ya existe la notificación
    }

    let titulo: string;
    let mensaje: string;
    let tipo: 'info' | 'warning' | 'urgent';

    if (diasRestantes === 0) {
      titulo = `⚠️ ¡HOY VENCE! ${reminder.nombre}`;
      mensaje = `Hoy es el último día para ${reminder.descripcion}`;
      tipo = 'urgent';
    } else if (diasRestantes <= 3) {
      titulo = `⚡ Urgente: ${reminder.nombre}`;
      mensaje = `Quedan solo ${diasRestantes} días para ${reminder.descripcion}`;
      tipo = 'urgent';
    } else if (diasRestantes <= 7) {
      titulo = `⚠️ Recordatorio: ${reminder.nombre}`;
      mensaje = `Quedan ${diasRestantes} días para ${reminder.descripcion}`;
      tipo = 'warning';
    } else {
      titulo = `📅 Próximamente: ${reminder.nombre}`;
      mensaje = `Quedan ${diasRestantes} días para ${reminder.descripcion}`;
      tipo = 'info';
    }

    const stmt = this.db.prepare(`
      INSERT INTO notificaciones (recordatorio_id, tipo, titulo, mensaje, dias_restantes, leida)
      VALUES (?, ?, ?, ?, ?, 0)
    `);

    stmt.run(reminder.id, tipo, titulo, mensaje, diasRestantes);
    console.log(`🔔 Notificación creada: ${titulo}`);
  }

  /**
   * Obtiene todas las notificaciones no leídas
   */
  getUnreadNotifications(): Notificacion[] {
    const stmt = this.db.prepare(`
      SELECT n.*, r.nombre as recordatorio_nombre
      FROM notificaciones n
      JOIN recordatorios r ON n.recordatorio_id = r.id
      WHERE n.leida = 0
      ORDER BY n.dias_restantes ASC, n.created_at DESC
    `);
    return stmt.all() as Notificacion[];
  }

  /**
   * Marca una notificación como leída
   */
  markAsRead(notificationId: number): boolean {
    const stmt = this.db.prepare('UPDATE notificaciones SET leida = 1 WHERE id = ?');
    const result = stmt.run(notificationId);
    return result.changes > 0;
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  markAllAsRead(): boolean {
    const stmt = this.db.prepare('UPDATE notificaciones SET leida = 1 WHERE leida = 0');
    const result = stmt.run();
    return result.changes > 0;
  }

  /**
   * Obtiene el resumen de recordatorios próximos
   */
  getUpcomingReminders(days: number = 30): any[] {
    const stmt = this.db.prepare(`
      SELECT *,
        (julianday(fecha_vencimiento) - julianday('now')) as dias_restantes
      FROM recordatorios
      WHERE activo = 1
        AND julianday(fecha_vencimiento) >= julianday('now')
        AND julianday(fecha_vencimiento) <= julianday('now', '+' || ? || ' days')
      ORDER BY fecha_vencimiento ASC
    `);

    const reminders = stmt.all(days) as any[];

    return reminders.map((r) => ({
      ...r,
      dias_restantes: Math.ceil(r.dias_restantes),
      fecha_vencimiento_formatted: format(parseISO(r.fecha_vencimiento), "d 'de' MMMM 'de' yyyy", { locale: es }),
    }));
  }
}
