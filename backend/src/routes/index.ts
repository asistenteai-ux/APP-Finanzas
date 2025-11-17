import { Router } from 'express';
import { DTEController } from '../controllers/dte.controller';
import { ReminderController } from '../controllers/reminder.controller';
import { ComprasController } from '../controllers/compras.controller';
import { LibrosController } from '../controllers/libros.controller';
import { authController } from '../controllers/auth.controller';
import { uploadController } from '../controllers/upload.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando correctamente' });
});

// ==================== RUTAS DE AUTENTICACIÓN ====================
// Rutas públicas (no requieren autenticación)
router.post('/auth/register', (req, res) => authController.register(req, res));
router.post('/auth/login', (req, res) => authController.login(req, res));

// Rutas protegidas (requieren autenticación)
router.get('/auth/me', requireAuth, (req, res) => authController.getMe(req, res));
router.put('/auth/cambiar-password', requireAuth, (req, res) => authController.cambiarPassword(req, res));

// Rutas de administración (solo admin)
router.get('/auth/usuarios', requireAuth, requireRole('admin'), (req, res) => authController.getUsuarios(req, res));
router.put('/auth/usuarios/:id/rol', requireAuth, requireRole('admin'), (req, res) => authController.cambiarRol(req, res));
router.delete('/auth/usuarios/:id', requireAuth, requireRole('admin'), (req, res) => authController.desactivarUsuario(req, res));

// ==================== RUTAS DE SUBIDA DE ARCHIVOS Y OCR ====================
// Configuración y ayuda
router.get('/upload/configuracion', (req, res) => uploadController.getConfiguracion(req, res));

// Subida de facturas y gastos (requiere autenticación, roles: admin o usuario)
router.post(
  '/upload/factura',
  requireAuth,
  requireRole('admin', 'usuario'),
  uploadController.getMulterMiddleware(),
  (req, res) => uploadController.uploadFactura(req, res)
);

router.post(
  '/upload/gasto',
  requireAuth,
  requireRole('admin', 'usuario'),
  uploadController.getMulterMiddleware(),
  (req, res) => uploadController.uploadGasto(req, res)
);

router.post(
  '/upload/extraer-texto',
  requireAuth,
  uploadController.getMulterMiddleware(),
  (req, res) => uploadController.extraerTexto(req, res)
);

// ==================== RUTAS DTEs ====================
// Consultas (todos los usuarios autenticados)
router.get('/dte', requireAuth, DTEController.getAllDTEs);
router.get('/dte/:id', requireAuth, DTEController.getDTEById);
router.get('/dte/:id/status', requireAuth, DTEController.queryDTEStatus);
router.get('/dte/folio/:tipoDocumento', requireAuth, DTEController.getNextFolio);

// Creación y edición (admin y usuario)
router.post('/dte', requireAuth, requireRole('admin', 'usuario'), DTEController.createDTE);

// Envío al SII (solo admin)
router.post('/dte/:id/send', requireAuth, requireRole('admin'), DTEController.sendDTE);

// ==================== RUTAS COMPRAS ====================
// Consultas (todos los usuarios autenticados)
router.get('/compras', requireAuth, ComprasController.getAllCompras);
router.get('/compras/resumen', requireAuth, ComprasController.getResumenCompras);
router.get('/compras/:id', requireAuth, ComprasController.getCompraById);

// Creación (admin y usuario)
router.post('/compras', requireAuth, requireRole('admin', 'usuario'), ComprasController.createCompra);

// Edición y eliminación (solo admin)
router.put('/compras/:id', requireAuth, requireRole('admin'), ComprasController.updateCompra);
router.delete('/compras/:id', requireAuth, requireRole('admin'), ComprasController.deleteCompra);

// ==================== RUTAS RECORDATORIOS ====================
// Consultas (todos los usuarios autenticados)
router.get('/recordatorios', requireAuth, ReminderController.getAllReminders);
router.get('/recordatorios/proximos', requireAuth, ReminderController.getUpcomingReminders);

// Gestión (solo admin)
router.post('/recordatorios', requireAuth, requireRole('admin'), ReminderController.createReminder);
router.put('/recordatorios/:id', requireAuth, requireRole('admin'), ReminderController.updateReminder);
router.delete('/recordatorios/:id', requireAuth, requireRole('admin'), ReminderController.deleteReminder);
router.post('/recordatorios/process', requireAuth, requireRole('admin'), ReminderController.processReminders);

// ==================== RUTAS NOTIFICACIONES ====================
// Todos los usuarios autenticados pueden ver y marcar notificaciones
router.get('/notificaciones', requireAuth, ReminderController.getUnreadNotifications);
router.put('/notificaciones/:id/read', requireAuth, ReminderController.markAsRead);
router.put('/notificaciones/read-all', requireAuth, ReminderController.markAllAsRead);

// ==================== RUTAS LIBROS CONTABLES (OBLIGATORIO SII) ====================
// Consultas (todos los usuarios autenticados)
router.get('/libros', requireAuth, LibrosController.listarLibros);
router.get('/libros/pendientes', requireAuth, LibrosController.obtenerPeriodosPendientes);
router.get('/libros/:periodo/:tipo/descargar', requireAuth, LibrosController.descargarLibro);
router.get('/libros/:periodo/resumen-f29', requireAuth, LibrosController.obtenerResumenF29);

// Generación de libros (solo admin - tareas contables críticas)
router.post('/libros/:periodo/compra-venta', requireAuth, requireRole('admin'), LibrosController.generarLibroComprasVentas);
router.post('/libros/:periodo/iecv', requireAuth, requireRole('admin'), LibrosController.generarIECV);

export default router;
