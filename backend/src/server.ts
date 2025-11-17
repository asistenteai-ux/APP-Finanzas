import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config';
import { initializeDatabase } from './database/schema';
import routes from './routes';
import { ReminderService } from './services/reminder.service';

// Inicializar aplicación
const app = express();

// Middlewares
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api', routes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    name: 'APP Finanzas - Backend',
    version: '1.0.0',
    description: 'Sistema de gestión financiera y tributaria para Chile (SII)',
    endpoints: {
      health: '/api/health',
      dte: '/api/dte',
      compras: '/api/compras',
      recordatorios: '/api/recordatorios',
      notificaciones: '/api/notificaciones',
    },
    environment: config.sii.environment,
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
  });
});

// Manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// Inicializar servidor
async function startServer() {
  try {
    console.log('\n🚀 Iniciando APP Finanzas Backend...\n');

    // Validar configuración
    console.log('⚙️  Validando configuración...');
    validateConfig();

    // Inicializar base de datos
    console.log('📊 Inicializando base de datos...');
    initializeDatabase();

    // Procesar recordatorios al inicio y cada hora
    console.log('🔔 Configurando procesamiento de recordatorios...');
    const reminderService = new ReminderService();
    reminderService.processReminders();
    setInterval(() => {
      console.log('🔄 Procesando recordatorios...');
      reminderService.processReminders();
    }, 60 * 60 * 1000); // Cada hora

    // Iniciar servidor
    app.listen(config.port, () => {
      console.log('\n✅ Servidor iniciado exitosamente!\n');
      console.log(`📍 URL: http://localhost:${config.port}`);
      console.log(`🌍 Ambiente: ${config.nodeEnv}`);
      console.log(`🏢 Empresa: ${config.sii.companyName || 'No configurada'}`);
      console.log(`📋 RUT: ${config.sii.rut || 'No configurado'}`);
      console.log(`🔐 Ambiente SII: ${config.sii.environment}`);
      console.log('\n💡 Endpoints disponibles:');
      console.log(`   - GET  /api/health`);
      console.log(`   - GET  /api/dte`);
      console.log(`   - POST /api/dte`);
      console.log(`   - GET  /api/compras`);
      console.log(`   - POST /api/compras`);
      console.log(`   - GET  /api/recordatorios`);
      console.log(`   - GET  /api/notificaciones`);
      console.log('\n📖 Documentación completa en README.md\n');
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('\n👋 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 Cerrando servidor...');
  process.exit(0);
});

// Iniciar
startServer();
