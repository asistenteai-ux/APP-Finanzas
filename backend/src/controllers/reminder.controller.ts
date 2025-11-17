import { Request, Response } from 'express';
import { ReminderService } from '../services/reminder.service';

const reminderService = new ReminderService();

export class ReminderController {
  /**
   * Obtiene todos los recordatorios
   */
  static getAllReminders(req: Request, res: Response) {
    try {
      const reminders = reminderService.getAllReminders();
      res.json({
        success: true,
        data: reminders,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Error al obtener recordatorios',
        details: error.message,
      });
    }
  }

  /**
   * Obtiene recordatorios próximos
   */
  static getUpcomingReminders(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const reminders = reminderService.getUpcomingReminders(days);

      res.json({
        success: true,
        data: reminders,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Error al obtener recordatorios próximos',
        details: error.message,
      });
    }
  }

  /**
   * Crea un nuevo recordatorio
   */
  static createReminder(req: Request, res: Response) {
    try {
      const { tipo, nombre, descripcion, fecha_vencimiento, periodicidad, dias_aviso } = req.body;

      if (!tipo || !nombre || !fecha_vencimiento || !periodicidad || !dias_aviso) {
        return res.status(400).json({
          error: 'Faltan datos requeridos',
          required: ['tipo', 'nombre', 'fecha_vencimiento', 'periodicidad', 'dias_aviso'],
        });
      }

      const id = reminderService.createReminder({
        tipo,
        nombre,
        descripcion: descripcion || '',
        fecha_vencimiento,
        periodicidad,
        dias_aviso,
        activo: 1,
      });

      res.status(201).json({
        success: true,
        message: 'Recordatorio creado exitosamente',
        data: { id },
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Error al crear recordatorio',
        details: error.message,
      });
    }
  }

  /**
   * Actualiza un recordatorio
   */
  static updateReminder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const success = reminderService.updateReminder(parseInt(id), updates);

      if (!success) {
        return res.status(404).json({ error: 'Recordatorio no encontrado' });
      }

      res.json({
        success: true,
        message: 'Recordatorio actualizado exitosamente',
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Error al actualizar recordatorio',
        details: error.message,
      });
    }
  }

  /**
   * Elimina un recordatorio
   */
  static deleteReminder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = reminderService.deleteReminder(parseInt(id));

      if (!success) {
        return res.status(404).json({ error: 'Recordatorio no encontrado' });
      }

      res.json({
        success: true,
        message: 'Recordatorio eliminado exitosamente',
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Error al eliminar recordatorio',
        details: error.message,
      });
    }
  }

  /**
   * Obtiene notificaciones no leídas
   */
  static getUnreadNotifications(req: Request, res: Response) {
    try {
      const notifications = reminderService.getUnreadNotifications();
      res.json({
        success: true,
        data: notifications,
        count: notifications.length,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Error al obtener notificaciones',
        details: error.message,
      });
    }
  }

  /**
   * Marca una notificación como leída
   */
  static markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = reminderService.markAsRead(parseInt(id));

      if (!success) {
        return res.status(404).json({ error: 'Notificación no encontrada' });
      }

      res.json({
        success: true,
        message: 'Notificación marcada como leída',
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Error al marcar notificación',
        details: error.message,
      });
    }
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  static markAllAsRead(req: Request, res: Response) {
    try {
      reminderService.markAllAsRead();
      res.json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas',
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Error al marcar notificaciones',
        details: error.message,
      });
    }
  }

  /**
   * Procesa recordatorios y genera notificaciones
   */
  static processReminders(req: Request, res: Response) {
    try {
      reminderService.processReminders();
      res.json({
        success: true,
        message: 'Recordatorios procesados exitosamente',
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Error al procesar recordatorios',
        details: error.message,
      });
    }
  }
}
