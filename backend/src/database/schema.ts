import Database from 'better-sqlite3';
import { config } from '../config';

export function initializeDatabase() {
  const db = new Database(config.databasePath);

  // Habilitar foreign keys
  db.pragma('foreign_keys = ON');

  // Tabla de empresas/clientes
  db.exec(`
    CREATE TABLE IF NOT EXISTS empresas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rut TEXT UNIQUE NOT NULL,
      razon_social TEXT NOT NULL,
      nombre_fantasia TEXT,
      giro TEXT,
      direccion TEXT,
      comuna TEXT,
      ciudad TEXT,
      telefono TEXT,
      email TEXT,
      tipo TEXT NOT NULL CHECK(tipo IN ('cliente', 'proveedor', 'ambos')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabla de productos/servicios
  db.exec(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT UNIQUE,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio_unitario REAL NOT NULL,
      unidad_medida TEXT DEFAULT 'UN',
      tipo TEXT CHECK(tipo IN ('producto', 'servicio')),
      activo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabla de documentos tributarios electrónicos (DTEs)
  db.exec(`
    CREATE TABLE IF NOT EXISTS documentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo_documento INTEGER NOT NULL,
      folio INTEGER NOT NULL,
      fecha_emision DATE NOT NULL,
      rut_emisor TEXT NOT NULL,
      razon_social_emisor TEXT NOT NULL,
      rut_receptor TEXT NOT NULL,
      razon_social_receptor TEXT NOT NULL,
      monto_neto REAL NOT NULL,
      monto_iva REAL NOT NULL,
      monto_total REAL NOT NULL,
      estado TEXT NOT NULL DEFAULT 'borrador' CHECK(estado IN ('borrador', 'enviado', 'aceptado', 'rechazado', 'anulado')),
      xml_content TEXT,
      track_id TEXT,
      fecha_envio DATETIME,
      observaciones TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(tipo_documento, folio)
    );
  `);

  // Tabla de detalles de documentos
  db.exec(`
    CREATE TABLE IF NOT EXISTS documento_detalles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      documento_id INTEGER NOT NULL,
      numero_linea INTEGER NOT NULL,
      producto_id INTEGER,
      nombre_item TEXT NOT NULL,
      descripcion TEXT,
      cantidad REAL NOT NULL,
      unidad_medida TEXT DEFAULT 'UN',
      precio_unitario REAL NOT NULL,
      descuento_porcentaje REAL DEFAULT 0,
      descuento_monto REAL DEFAULT 0,
      monto_neto REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE CASCADE,
      FOREIGN KEY (producto_id) REFERENCES productos(id)
    );
  `);

  // Tabla de compras y gastos
  db.exec(`
    CREATE TABLE IF NOT EXISTS compras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo_documento INTEGER NOT NULL,
      folio INTEGER NOT NULL,
      fecha_documento DATE NOT NULL,
      rut_proveedor TEXT NOT NULL,
      razon_social_proveedor TEXT NOT NULL,
      descripcion TEXT,
      monto_neto REAL NOT NULL,
      monto_iva REAL NOT NULL,
      monto_total REAL NOT NULL,
      categoria TEXT,
      es_credito_fiscal INTEGER DEFAULT 1,
      archivo_adjunto TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabla de folios
  db.exec(`
    CREATE TABLE IF NOT EXISTS folios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo_documento INTEGER NOT NULL,
      folio_desde INTEGER NOT NULL,
      folio_hasta INTEGER NOT NULL,
      folio_actual INTEGER NOT NULL,
      caf_xml TEXT NOT NULL,
      fecha_autorizacion DATE NOT NULL,
      fecha_vencimiento DATE,
      activo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(tipo_documento, folio_desde)
    );
  `);

  // Tabla de recordatorios tributarios
  db.exec(`
    CREATE TABLE IF NOT EXISTS recordatorios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      fecha_vencimiento DATE NOT NULL,
      periodicidad TEXT NOT NULL CHECK(periodicidad IN ('mensual', 'semestral', 'anual', 'unica')),
      dias_aviso TEXT NOT NULL,
      activo INTEGER DEFAULT 1,
      ultima_notificacion DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabla de notificaciones
  db.exec(`
    CREATE TABLE IF NOT EXISTS notificaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recordatorio_id INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      titulo TEXT NOT NULL,
      mensaje TEXT NOT NULL,
      dias_restantes INTEGER NOT NULL,
      leida INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (recordatorio_id) REFERENCES recordatorios(id) ON DELETE CASCADE
    );
  `);

  // Índices para mejorar rendimiento
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_documentos_tipo_folio ON documentos(tipo_documento, folio);
    CREATE INDEX IF NOT EXISTS idx_documentos_fecha ON documentos(fecha_emision);
    CREATE INDEX IF NOT EXISTS idx_documentos_estado ON documentos(estado);
    CREATE INDEX IF NOT EXISTS idx_compras_fecha ON compras(fecha_documento);
    CREATE INDEX IF NOT EXISTS idx_compras_proveedor ON compras(rut_proveedor);
    CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);
  `);

  // Insertar recordatorios por defecto
  insertDefaultReminders(db);

  console.log('✅ Base de datos inicializada correctamente');

  return db;
}

function insertDefaultReminders(db: Database.Database) {
  const checkReminders = db.prepare('SELECT COUNT(*) as count FROM recordatorios').get() as { count: number };

  if (checkReminders.count === 0) {
    const insert = db.prepare(`
      INSERT INTO recordatorios (tipo, nombre, descripcion, fecha_vencimiento, periodicidad, dias_aviso)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // F29 - Declaración Mensual IVA
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(12);

    insert.run(
      'F29',
      'Declaración Mensual IVA (F29)',
      'Declaración mensual de IVA y otros impuestos',
      nextMonth.toISOString().split('T')[0],
      'mensual',
      '30,15,7,3,1'
    );

    // Operación Renta
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    nextYear.setMonth(3); // Abril
    nextYear.setDate(30);

    insert.run(
      'F22',
      'Operación Renta (F22)',
      'Declaración anual de impuestos a la renta',
      nextYear.toISOString().split('T')[0],
      'anual',
      '60,30,15,7,3'
    );

    // Declaraciones Juradas
    const nextYearMarch = new Date();
    nextYearMarch.setFullYear(nextYearMarch.getFullYear() + 1);
    nextYearMarch.setMonth(2); // Marzo
    nextYearMarch.setDate(31);

    insert.run(
      'DJ',
      'Declaraciones Juradas',
      'Declaraciones juradas informativas ante el SII',
      nextYearMarch.toISOString().split('T')[0],
      'anual',
      '60,30,15,7'
    );

    // Patente Comercial - Enero
    const nextYearJan = new Date();
    nextYearJan.setFullYear(nextYearJan.getFullYear() + 1);
    nextYearJan.setMonth(0); // Enero
    nextYearJan.setDate(31);

    insert.run(
      'PATENTE',
      'Patente Comercial - Primera Cuota',
      'Pago de patente comercial municipal (primera cuota)',
      nextYearJan.toISOString().split('T')[0],
      'semestral',
      '30,15,7,3'
    );

    console.log('✅ Recordatorios por defecto insertados');
  }
}

export function getDatabase(): Database.Database {
  return new Database(config.databasePath);
}
