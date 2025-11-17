import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== DTEs ====================
export interface DTECreateData {
  tipoDocumento: number;
  folio: number;
  fechaEmision: string;
  receptor: {
    rut: string;
    razonSocial: string;
    giro?: string;
    direccion?: string;
    comuna?: string;
    ciudad?: string;
  };
  detalles: Array<{
    numeroLinea: number;
    nombreItem: string;
    descripcion?: string;
    cantidad: number;
    unidadMedida?: string;
    precioUnitario: number;
    descuentoPorcentaje?: number;
    descuentoMonto?: number;
  }>;
}

export const dteApi = {
  getAll: (params?: any) => api.get('/dte', { params }),
  getById: (id: number) => api.get(`/dte/${id}`),
  create: (data: DTECreateData) => api.post('/dte', data),
  send: (id: number, rutEnvia: string) => api.post(`/dte/${id}/send`, { rutEnvia }),
  getStatus: (id: number) => api.get(`/dte/${id}/status`),
  getNextFolio: (tipoDocumento: number) => api.get(`/dte/folio/${tipoDocumento}`),
};

// ==================== COMPRAS ====================
export interface CompraCreateData {
  tipo_documento: number;
  folio: number;
  fecha_documento: string;
  rut_proveedor: string;
  razon_social_proveedor: string;
  descripcion?: string;
  monto_neto: number;
  monto_iva?: number;
  categoria?: string;
  es_credito_fiscal?: boolean;
}

export const comprasApi = {
  getAll: (params?: any) => api.get('/compras', { params }),
  getById: (id: number) => api.get(`/compras/${id}`),
  create: (data: CompraCreateData) => api.post('/compras', data),
  update: (id: number, data: Partial<CompraCreateData>) => api.put(`/compras/${id}`, data),
  delete: (id: number) => api.delete(`/compras/${id}`),
  getResumen: (params?: any) => api.get('/compras/resumen', { params }),
};

// ==================== RECORDATORIOS ====================
export interface RecordatorioCreateData {
  tipo: string;
  nombre: string;
  descripcion?: string;
  fecha_vencimiento: string;
  periodicidad: 'mensual' | 'semestral' | 'anual' | 'unica';
  dias_aviso: string;
}

export const recordatoriosApi = {
  getAll: () => api.get('/recordatorios'),
  getProximos: (days?: number) => api.get('/recordatorios/proximos', { params: { days } }),
  create: (data: RecordatorioCreateData) => api.post('/recordatorios', data),
  update: (id: number, data: Partial<RecordatorioCreateData>) => api.put(`/recordatorios/${id}`, data),
  delete: (id: number) => api.delete(`/recordatorios/${id}`),
  process: () => api.post('/recordatorios/process'),
};

// ==================== NOTIFICACIONES ====================
export const notificacionesApi = {
  getUnread: () => api.get('/notificaciones'),
  markAsRead: (id: number) => api.put(`/notificaciones/${id}/read`),
  markAllAsRead: () => api.put('/notificaciones/read-all'),
};

export default api;
