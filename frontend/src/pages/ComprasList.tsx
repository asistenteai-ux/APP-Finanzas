import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, ShoppingCart } from 'lucide-react';
import { comprasApi } from '../services/api';
import { format, parseISO } from 'date-fns';

const ComprasList = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['compras'],
    queryFn: () => comprasApi.getAll(),
  });

  const { data: resumen } = useQuery({
    queryKey: ['compras-resumen'],
    queryFn: () => comprasApi.getResumen(),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(value);
  };

  const compras = data?.data?.data || [];
  const resumenData = resumen?.data?.data?.resumen;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Compras y Gastos</h2>
          <p className="text-gray-600 mt-1">Gestión de compras y cálculo de crédito fiscal</p>
        </div>
        <Link to="/compras/crear" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Registrar Compra
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Total Compras</p>
          <p className="text-3xl font-bold text-gray-800">{compras.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Total Neto</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(resumenData?.total_neto || 0)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Total IVA</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(resumenData?.total_iva || 0)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Crédito Fiscal</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(resumenData?.credito_fiscal || 0)}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        {isLoading ? (
          <p className="text-center py-8 text-gray-500">Cargando...</p>
        ) : compras.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No hay compras registradas</p>
            <Link to="/compras/crear" className="btn-primary inline-flex items-center gap-2">
              <Plus size={20} />
              Registrar primera compra
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Proveedor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Descripción</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Neto</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">IVA</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Crédito</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {compras.map((compra: any) => (
                  <tr key={compra.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(parseISO(compra.fecha_documento), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="font-medium text-gray-800">{compra.razon_social_proveedor}</p>
                        <p className="text-gray-500 text-xs">{compra.rut_proveedor}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{compra.descripcion || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-800">
                      {formatCurrency(compra.monto_neto)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-800">
                      {formatCurrency(compra.monto_iva)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-right text-gray-800">
                      {formatCurrency(compra.monto_total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {compra.es_credito_fiscal ? (
                        <span className="badge-success">Sí</span>
                      ) : (
                        <span className="badge-danger">No</span>
                      )}
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

export default ComprasList;
