import { Router } from 'express';
import { DTEController } from '../controllers/dte.controller';
import { ReminderController } from '../controllers/reminder.controller';
import { ComprasController } from '../controllers/compras.controller';
import { LibrosController } from '../controllers/libros.controller';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando correctamente' });
});

// ==================== RUTAS DTEs ====================
router.post('/dte', DTEController.createDTE);
router.get('/dte', DTEController.getAllDTEs);
router.get('/dte/:id', DTEController.getDTEById);
router.post('/dte/:id/send', DTEController.sendDTE);
router.get('/dte/:id/status', DTEController.queryDTEStatus);
router.get('/dte/folio/:tipoDocumento', DTEController.getNextFolio);

// ==================== RUTAS COMPRAS ====================
router.post('/compras', ComprasController.createCompra);
router.get('/compras', ComprasController.getAllCompras);
router.get('/compras/resumen', ComprasController.getResumenCompras);
router.get('/compras/:id', ComprasController.getCompraById);
router.put('/compras/:id', ComprasController.updateCompra);
router.delete('/compras/:id', ComprasController.deleteCompra);

// ==================== RUTAS RECORDATORIOS ====================
router.get('/recordatorios', ReminderController.getAllReminders);
router.get('/recordatorios/proximos', ReminderController.getUpcomingReminders);
router.post('/recordatorios', ReminderController.createReminder);
router.put('/recordatorios/:id', ReminderController.updateReminder);
router.delete('/recordatorios/:id', ReminderController.deleteReminder);
router.post('/recordatorios/process', ReminderController.processReminders);

// ==================== RUTAS NOTIFICACIONES ====================
router.get('/notificaciones', ReminderController.getUnreadNotifications);
router.put('/notificaciones/:id/read', ReminderController.markAsRead);
router.put('/notificaciones/read-all', ReminderController.markAllAsRead);

// ==================== RUTAS LIBROS CONTABLES (OBLIGATORIO SII) ====================
router.get('/libros', LibrosController.listarLibros);
router.get('/libros/pendientes', LibrosController.obtenerPeriodosPendientes);
router.get('/libros/:periodo/:tipo/descargar', LibrosController.descargarLibro);
router.post('/libros/:periodo/compra-venta', LibrosController.generarLibroComprasVentas);
router.post('/libros/:periodo/iecv', LibrosController.generarIECV);
router.get('/libros/:periodo/resumen-f29', LibrosController.obtenerResumenF29);

export default router;
