import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { comprasApi } from '../services/api';

const ComprasCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tipo_documento: 33,
    folio: '',
    fecha_documento: new Date().toISOString().split('T')[0],
    rut_proveedor: '',
    razon_social_proveedor: '',
    descripcion: '',
    monto_neto: 0,
    categoria: 'general',
    es_credito_fiscal: true,
  });

  const createMutation = useMutation({
    mutationFn: comprasApi.create,
    onSuccess: () => {
      alert('Compra registrada exitosamente');
      navigate('/compras');
    },
    onError: (error: any) => {
      alert('Error al registrar compra: ' + error.response?.data?.error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const iva = Math.round(formData.monto_neto * 0.19);
  const total = Math.round(formData.monto_neto) + iva;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Registrar Compra o Gasto</h2>
        <p className="text-gray-600 mt-1">Ingrese los datos del documento de compra</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Documento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo de Documento</label>
              <select
                className="input"
                value={formData.tipo_documento}
                onChange={(e) => setFormData({ ...formData, tipo_documento: parseInt(e.target.value) })}
                required
              >
                <option value={33}>Factura (33)</option>
                <option value={34}>Factura Exenta (34)</option>
                <option value={46}>Factura de Compra (46)</option>
              </select>
            </div>
            <div>
              <label className="label">Folio</label>
              <input
                type="text"
                className="input"
                placeholder="Número del documento"
                value={formData.folio}
                onChange={(e) => setFormData({ ...formData, folio: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Fecha del Documento</label>
              <input
                type="date"
                className="input"
                value={formData.fecha_documento}
                onChange={(e) => setFormData({ ...formData, fecha_documento: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Categoría</label>
              <select
                className="input"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              >
                <option value="general">General</option>
                <option value="servicios">Servicios</option>
                <option value="insumos">Insumos</option>
                <option value="equipamiento">Equipamiento</option>
                <option value="arriendo">Arriendo</option>
                <option value="otros">Otros</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos del Proveedor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">RUT Proveedor</label>
              <input
                type="text"
                className="input"
                placeholder="12.345.678-9"
                value={formData.rut_proveedor}
                onChange={(e) => setFormData({ ...formData, rut_proveedor: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Razón Social</label>
              <input
                type="text"
                className="input"
                placeholder="Nombre del proveedor"
                value={formData.razon_social_proveedor}
                onChange={(e) => setFormData({ ...formData, razon_social_proveedor: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Descripción</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Descripción de la compra o servicio"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Montos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Monto Neto</label>
              <input
                type="number"
                className="input"
                placeholder="0"
                value={formData.monto_neto}
                onChange={(e) => setFormData({ ...formData, monto_neto: parseFloat(e.target.value) || 0 })}
                min="0"
                step="1"
                required
              />
            </div>
            <div>
              <label className="label flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.es_credito_fiscal}
                  onChange={(e) => setFormData({ ...formData, es_credito_fiscal: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>Es crédito fiscal (IVA recuperable)</span>
              </label>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-primary-50 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Neto:</span>
                <span className="font-semibold">${formData.monto_neto.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>IVA (19%):</span>
                <span className="font-semibold">${iva.toLocaleString('es-CL')}</span>
              </div>
              <div className="h-px bg-gray-300" />
              <div className="flex justify-between text-xl font-bold text-primary-700">
                <span>Total:</span>
                <span>${total.toLocaleString('es-CL')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/compras')} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save size={20} />
            Guardar Compra
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComprasCreate;
