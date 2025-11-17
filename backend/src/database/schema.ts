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

  // Tabla de libros electrónicos (OBLIGATORIO por ley)
  db.exec(`
    CREATE TABLE IF NOT EXISTS libros_electronicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      periodo TEXT NOT NULL,
      tipo_libro TEXT NOT NULL CHECK(tipo_libro IN ('COMPRA_VENTA', 'IECV', 'DIARIO', 'MAYOR', 'BALANCE')),
      xml_content TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'generado' CHECK(estado IN ('generado', 'enviado', 'aceptado', 'rechazado')),
      track_id TEXT,
      fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_envio DATETIME,
      observaciones TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(periodo, tipo_libro)
    );
  `);

  // Tabla de retenciones de honorarios
  db.exec(`
    CREATE TABLE IF NOT EXISTS retenciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo_retencion TEXT NOT NULL CHECK(tipo_retencion IN ('honorarios', 'trabajadores')),
      folio INTEGER NOT NULL,
      fecha_documento DATE NOT NULL,
      rut_retenido TEXT NOT NULL,
      razon_social_retenido TEXT NOT NULL,
      monto_bruto REAL NOT NULL,
      tasa_retencion REAL NOT NULL DEFAULT 10,
      monto_retenido REAL NOT NULL,
      monto_liquido REAL NOT NULL,
      periodo_tributario TEXT NOT NULL,
      declarado INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabla de declaraciones juradas
  db.exec(`
    CREATE TABLE IF NOT EXISTS declaraciones_juradas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo_formulario TEXT NOT NULL,
      nombre TEXT NOT NULL,
      periodo TEXT NOT NULL,
      fecha_vencimiento DATE NOT NULL,
      estado TEXT NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'presentada', 'rechazada')),
      folio_declaracion TEXT,
      fecha_presentacion DATETIME,
      xml_content TEXT,
      observaciones TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(codigo_formulario, periodo)
    );
  `);

  // Tabla de movimientos contables (para libro diario)
  db.exec(`
    CREATE TABLE IF NOT EXISTS movimientos_contables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha DATE NOT NULL,
      numero_asiento INTEGER NOT NULL,
      glosa TEXT NOT NULL,
      cuenta_contable TEXT NOT NULL,
      debe REAL DEFAULT 0,
      haber REAL DEFAULT 0,
      documento_referencia TEXT,
      centro_costo TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabla de remuneraciones
  db.exec(`
    CREATE TABLE IF NOT EXISTS remuneraciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trabajador_rut TEXT NOT NULL,
      trabajador_nombre TEXT NOT NULL,
      periodo TEXT NOT NULL,
      sueldo_base REAL NOT NULL,
      total_haberes REAL NOT NULL,
      total_descuentos REAL NOT NULL,
      sueldo_liquido REAL NOT NULL,
      afp REAL NOT NULL,
      salud REAL NOT NULL,
      cesantia REAL NOT NULL,
      impuesto_unico REAL NOT NULL DEFAULT 0,
      cesantia_empleador REAL NOT NULL,
      estado TEXT NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'pagado')),
      fecha_pago DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(trabajador_rut, periodo)
    );
  `);

  // Tabla de activos fijos
  db.exec(`
    CREATE TABLE IF NOT EXISTS activos_fijos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      categoria TEXT NOT NULL,
      fecha_adquisicion DATE NOT NULL,
      valor_compra REAL NOT NULL,
      vida_util_anos INTEGER NOT NULL,
      depreciacion_anual REAL NOT NULL,
      depreciacion_mensual REAL NOT NULL,
      depreciacion_acumulada REAL NOT NULL DEFAULT 0,
      valor_libro REAL NOT NULL,
      estado TEXT NOT NULL DEFAULT 'activo' CHECK(estado IN ('activo', 'vendido', 'dado_baja')),
      proveedor_rut TEXT,
      proveedor_nombre TEXT,
      numero_factura TEXT,
      observaciones TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabla de depreciaciones (historial)
  db.exec(`
    CREATE TABLE IF NOT EXISTS depreciaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activo_id INTEGER NOT NULL,
      periodo TEXT NOT NULL,
      monto REAL NOT NULL,
      depreciacion_acumulada REAL NOT NULL,
      valor_libro REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (activo_id) REFERENCES activos_fijos(id) ON DELETE CASCADE,
      UNIQUE(activo_id, periodo)
    );
  `);

  // Tabla de contratos (honorarios, leasing, arriendos)
  db.exec(`
    CREATE TABLE IF NOT EXISTS contratos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL CHECK(tipo IN ('HONORARIOS', 'LEASING', 'ARRIENDO', 'PRESTAMO')),
      proveedor_rut TEXT,
      proveedor_nombre TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      monto_total REAL,
      monto_mensual REAL NOT NULL,
      numero_cuotas INTEGER,
      tasa_interes REAL,
      fecha_inicio DATE NOT NULL,
      fecha_termino DATE,
      dia_pago INTEGER NOT NULL,
      saldo_pendiente REAL,
      estado TEXT NOT NULL DEFAULT 'activo' CHECK(estado IN ('activo', 'finalizado', 'cancelado')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabla de cuentas por cobrar
  db.exec(`
    CREATE TABLE IF NOT EXISTS cuentas_por_cobrar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_rut TEXT NOT NULL,
      cliente_nombre TEXT NOT NULL,
      documento_id INTEGER,
      numero_documento TEXT NOT NULL,
      tipo_documento INTEGER NOT NULL,
      fecha_emision DATE NOT NULL,
      fecha_vencimiento DATE NOT NULL,
      monto_total REAL NOT NULL,
      saldo_pendiente REAL NOT NULL,
      estado TEXT NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'pagado_parcial', 'pagado', 'vencido')),
      observaciones TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (documento_id) REFERENCES documentos(id)
    );
  `);

  // Tabla de cuentas por pagar
  db.exec(`
    CREATE TABLE IF NOT EXISTS cuentas_por_pagar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      proveedor_rut TEXT NOT NULL,
      proveedor_nombre TEXT NOT NULL,
      compra_id INTEGER,
      numero_documento TEXT NOT NULL,
      tipo_documento INTEGER NOT NULL,
      fecha_emision DATE NOT NULL,
      fecha_vencimiento DATE NOT NULL,
      monto_total REAL NOT NULL,
      saldo_pendiente REAL NOT NULL,
      estado TEXT NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'pagado_parcial', 'pagado', 'vencido')),
      observaciones TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (compra_id) REFERENCES compras(id)
    );
  `);

  // Tabla de cuentas bancarias
  db.exec(`
    CREATE TABLE IF NOT EXISTS cuentas_bancarias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      banco TEXT NOT NULL,
      tipo_cuenta TEXT NOT NULL CHECK(tipo_cuenta IN ('corriente', 'ahorro', 'vista')),
      numero_cuenta TEXT NOT NULL,
      saldo_actual REAL NOT NULL DEFAULT 0,
      moneda TEXT NOT NULL DEFAULT 'CLP',
      activa INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(banco, numero_cuenta)
    );
  `);

  // Tabla de movimientos bancarios
  db.exec(`
    CREATE TABLE IF NOT EXISTS movimientos_bancarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cuenta_id INTEGER NOT NULL,
      fecha DATE NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('deposito', 'retiro', 'transferencia', 'comision', 'interes')),
      monto REAL NOT NULL,
      descripcion TEXT NOT NULL,
      numero_documento TEXT,
      saldo_despues REAL NOT NULL,
      conciliado INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cuenta_id) REFERENCES cuentas_bancarias(id) ON DELETE CASCADE
    );
  `);

  // Tabla de usuarios (sistema de autenticación)
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      rol TEXT NOT NULL CHECK(rol IN ('admin', 'usuario', 'visor')),
      rut TEXT,
      telefono TEXT,
      activo INTEGER DEFAULT 1,
      ultimo_acceso DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
    CREATE INDEX IF NOT EXISTS idx_libros_periodo ON libros_electronicos(periodo, tipo_libro);
    CREATE INDEX IF NOT EXISTS idx_retenciones_periodo ON retenciones(periodo_tributario);
    CREATE INDEX IF NOT EXISTS idx_dj_periodo ON declaraciones_juradas(periodo);
    CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
    CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
  `);

  // Insertar recordatorios por defecto
  insertDefaultReminders(db);

  // Insertar declaraciones juradas obligatorias
  insertDefaultDeclaracionesJuradas(db);

  console.log('✅ Base de datos inicializada correctamente');
  console.log('📚 Tablas creadas: documentos, compras, libros_electronicos, retenciones, declaraciones_juradas, usuarios');

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

function insertDefaultDeclaracionesJuradas(db: Database.Database) {
  const checkDJ = db.prepare('SELECT COUNT(*) as count FROM declaraciones_juradas').get() as { count: number };

  if (checkDJ.count === 0) {
    const insert = db.prepare(`
      INSERT INTO declaraciones_juradas (codigo_formulario, nombre, periodo, fecha_vencimiento, estado)
      VALUES (?, ?, ?, ?, ?)
    `);

    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    // DJ más comunes que deben presentar las empresas
    const declaraciones = [
      {
        codigo: '1812',
        nombre: 'Relación de Enajenación de Activos',
        vencimiento: `${nextYear}-03-14`,
      },
      {
        codigo: '1834',
        nombre: 'Relación de Créditos por Impuestos Externos',
        vencimiento: `${nextYear}-03-27`,
      },
      {
        codigo: '1887',
        nombre: 'Relación de Retenciones de Trabajadores Independientes',
        vencimiento: `${nextYear}-03-15`,
      },
      {
        codigo: '1879',
        nombre: 'Relación de Rentas y Retenciones de Trabajadores Dependientes',
        vencimiento: `${nextYear}-03-10`,
      },
      {
        codigo: '1926',
        nombre: 'Registro de Rentas Empresariales (Régimen Semi Integrado)',
        vencimiento: `${nextYear}-06-30`,
      },
      {
        codigo: '1948',
        nombre: 'Declaración Jurada Régimen ProPyme',
        vencimiento: `${nextYear}-04-30`,
      },
      {
        codigo: '1947',
        nombre: 'Declaración Jurada Régimen Renta Presunta',
        vencimiento: `${nextYear}-04-30`,
      },
    ];

    declaraciones.forEach((dj) => {
      insert.run(
        dj.codigo,
        dj.nombre,
        nextYear.toString(),
        dj.vencimiento,
        'pendiente'
      );
    });

    // Recordatorio mensual del día 10 para envío de libros contables
    const envioLibros = db.prepare(`
      INSERT INTO recordatorios (tipo, nombre, descripcion, fecha_vencimiento, periodicidad, dias_aviso)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(10);

    envioLibros.run(
      'LIBROS_ELECTRONICOS',
      'Envío Libros Electrónicos al SII',
      'Obligación mensual de enviar libros contables electrónicos antes del día 10',
      nextMonth.toISOString().split('T')[0],
      'mensual',
      '7,3,1'
    );

    console.log('✅ Declaraciones Juradas y recordatorios legales insertados');
  }
}

export function getDatabase(): Database.Database {
  return new Database(config.databasePath);
}
