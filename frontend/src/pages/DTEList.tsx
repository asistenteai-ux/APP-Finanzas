import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, FileText, Download, Send } from 'lucide-react';
import { dteApi } from '../services/api';
import { format, parseISO } from 'date-fns';

interface DTEListProps {
  tipo: number; // 33=Factura, 39=Boleta, 61=Nota Crédito
}

const tipoNombres: Record<number, string> = {
  33: 'Factura Electrónica',
  39: 'Boleta Electrónica',
  61: 'Nota de Crédito Electrónica',
};

const DTEList = ({ tipo }: DTEListProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['dtes', tipo],
    queryFn: () => dteApi.getAll({ tipo }),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(value);
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, string> = {
      borrador: 'badge-info',
      enviado: 'badge-warning',
      aceptado: 'badge-success',
      rechazado: 'badge-danger',
    };
    return badges[estado] || 'badge-info';
  };

  const documentos = data?.data?.data || [];
  const routeBase = tipo === 33 ? 'facturas' : tipo === 39 ? 'boletas' : 'notas-credito';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{tipoNombres[tipo]}</h2>
          <p className="text-gray-600 mt-1">Gestión de documentos tributarios electrónicos</p>
        </div>
        <Link to={`/${routeBase}/crear`} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Crear {tipoNombres[tipo]}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Total Documentos</p>
          <p className="text-3xl font-bold text-gray-800">{documentos.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Total Monto</p>
          <p className="text-3xl font-bold text-primary-600">
            {formatCurrency(documentos.reduce((sum: number, d: any) => sum + d.monto_total, 0))}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Enviados al SII</p>
          <p className="text-3xl font-bold text-green-600">
            {documentos.filter((d: any) => d.estado === 'enviado' || d.estado === 'aceptado').length}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        {isLoading ? (
          <p className="text-center py-8 text-gray-500">Cargando...</p>
        ) : documentos.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No hay documentos registrados</p>
            <Link to={`/${routeBase}/crear`} className="btn-primary inline-flex items-center gap-2">
              <Plus size={20} />
              Crear primer {tipoNombres[tipo]}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Folio</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Receptor</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Monto</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Estado</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {documentos.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-800">{doc.folio}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(parseISO(doc.fecha_emision), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="font-medium text-gray-800">{doc.razon_social_receptor}</p>
                        <p className="text-gray-500 text-xs">{doc.rut_receptor}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-right text-gray-800">
                      {formatCurrency(doc.monto_total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge ${getEstadoBadge(doc.estado)}`}>
                        {doc.estado.charAt(0).toUpperCase() + doc.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Descargar XML">
                          <Download size={18} className="text-blue-600" />
                        </button>
                        {doc.estado === 'borrador' && (
                          <button className="p-2 hover:bg-green-50 rounded-lg transition-colors" title="Enviar al SII">
                            <Send size={18} className="text-green-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DTEList;
