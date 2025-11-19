import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus, Trash2, Save, FileText, Receipt, FileX } from 'lucide-react';
import { dteApi } from '../services/api';
import { AyudaContable } from '../components/InfoTooltip';
import { validarRUT, agregarGuionRUT } from '../utils/rut';

interface DTECreateProps {
  tipo: number;
}

const tipoNombres: Record<number, string> = {
  33: 'Factura Electrónica',
  39: 'Boleta Electrónica',
  61: 'Nota de Crédito Electrónica',
};

const DTECreate = ({ tipo }: DTECreateProps) => {
  const navigate = useNavigate();
  const [receptor, setReceptor] = useState({
    rut: '',
    razonSocial: '',
    giro: '',
    direccion: '',
    comuna: '',
  });

  const [rutError, setRutError] = useState('');

  const [detalles, setDetalles] = useState([
    { numeroLinea: 1, nombreItem: '', cantidad: 1, precioUnitario: 0 },
  ]);

  const { data: folioData } = useQuery({
    queryKey: ['next-folio', tipo],
    queryFn: () => dteApi.getNextFolio(tipo),
  });

  const createMutation = useMutation({
    mutationFn: dteApi.create,
    onSuccess: () => {
      alert('Documento creado exitosamente');
      navigate(-1);
    },
    onError: (error: any) => {
      alert('Error al crear documento: ' + error.response?.data?.error);
    },
  });

  const agregarLinea = () => {
    setDetalles([
      ...detalles,
      { numeroLinea: detalles.length + 1, nombreItem: '', cantidad: 1, precioUnitario: 0 },
    ]);
  };

  const eliminarLinea = (index: number) => {
    if (detalles.length > 1) {
      setDetalles(detalles.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fechaEmision = new Date().toISOString().split('T')[0];

    createMutation.mutate({
      tipoDocumento: tipo,
      folio: folioData?.data?.data?.nextFolio || 1,
      fechaEmision,
      receptor,
      detalles,
    });
  };

  const calcularTotal = () => {
    const neto = detalles.reduce((sum, d) => sum + d.cantidad * d.precioUnitario, 0);
    const iva = Math.round(neto * 0.19);
    return { neto, iva, total: Math.round(neto) + iva };
  };

  const { neto, iva, total } = calcularTotal();

  const getDocumentIcon = () => {
    switch (tipo) {
      case 33:
        return <FileText className="text-blue-600" size={32} />;
      case 39:
        return <Receipt className="text-green-600" size={32} />;
      case 61:
        return <FileX className="text-orange-600" size={32} />;
      default:
        return <FileText className="text-gray-600" size={32} />;
    }
  };

  const getDocumentHelp = () => {
    switch (tipo) {
      case 33:
        return 'factura';
      case 39:
        return 'boleta';
      case 61:
        return 'nota-credito';
      default:
        return 'factura';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              {getDocumentIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-800">Crear {tipoNombres[tipo]}</h2>
                <AyudaContable tipo={getDocumentHelp() as any} />
              </div>
              <p className="text-gray-600 mt-1">Folio: <span className="font-semibold text-primary-600">#{folioData?.data?.data?.nextFolio || '-'}</span></p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos del Receptor */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos del Receptor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">RUT</label>
              <input
                type="text"
                className={`input ${rutError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="12345678-9"
                value={receptor.rut}
                onChange={(e) => {
                  const rutFormateado = agregarGuionRUT(e.target.value);
                  setReceptor({ ...receptor, rut: rutFormateado });

                  if (rutFormateado.length >= 3) {
                    if (!validarRUT(rutFormateado)) {
                      setRutError('RUT inválido');
                    } else {
                      setRutError('');
                    }
                  } else {
                    setRutError('');
                  }
                }}
                required
              />
              {rutError && <p className="text-sm text-red-600 mt-1">{rutError}</p>}
            </div>
            <div>
              <label className="label">Razón Social</label>
              <input
                type="text"
                className="input"
                placeholder="Nombre de la empresa"
                value={receptor.razonSocial}
                onChange={(e) => setReceptor({ ...receptor, razonSocial: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Giro</label>
              <input
                type="text"
                className="input"
                placeholder="Actividad comercial"
                value={receptor.giro}
                onChange={(e) => setReceptor({ ...receptor, giro: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Dirección</label>
              <input
                type="text"
                className="input"
                placeholder="Dirección completa"
                value={receptor.direccion}
                onChange={(e) => setReceptor({ ...receptor, direccion: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Detalles */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Detalles</h3>
            <button type="button" onClick={agregarLinea} className="btn-primary btn-sm flex items-center gap-2">
              <Plus size={16} />
              Agregar Línea
            </button>
          </div>

          <div className="space-y-3">
            {detalles.map((detalle, index) => (
              <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    className="input"
                    placeholder="Nombre del producto/servicio"
                    value={detalle.nombreItem}
                    onChange={(e) => {
                      const newDetalles = [...detalles];
                      newDetalles[index].nombreItem = e.target.value;
                      setDetalles(newDetalles);
                    }}
                    required
                  />
                  <input
                    type="number"
                    className="input"
                    placeholder="Cantidad"
                    value={detalle.cantidad}
                    onChange={(e) => {
                      const newDetalles = [...detalles];
                      newDetalles[index].cantidad = parseFloat(e.target.value) || 0;
                      setDetalles(newDetalles);
                    }}
                    min="0.01"
                    step="0.01"
                    required
                  />
                  <input
                    type="number"
                    className="input"
                    placeholder="Precio unitario"
                    value={detalle.precioUnitario}
                    onChange={(e) => {
                      const newDetalles = [...detalles];
                      newDetalles[index].precioUnitario = parseFloat(e.target.value) || 0;
                      setDetalles(newDetalles);
                    }}
                    min="0"
                    step="1"
                    required
                  />
                </div>
                {detalles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarLinea(index)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Totales */}
        <div className="card bg-gradient-to-br from-primary-50 to-blue-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Totales</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Neto:</span>
              <span className="font-semibold">${neto.toLocaleString('es-CL')}</span>
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

        {/* Botones */}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save size={20} />
            Guardar Documento
          </button>
        </div>
      </form>
    </div>
  );
};

export default DTECreate;
