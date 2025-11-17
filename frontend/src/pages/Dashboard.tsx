import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  TrendingDown,
  FileText,
  ShoppingCart,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import { dteApi, comprasApi, recordatoriosApi } from '../services/api';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
  const currentMonth = new Date();
  const desde = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const hasta = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

  // Consultas
  const { data: dtes } = useQuery({
    queryKey: ['dtes', desde, hasta],
    queryFn: () => dteApi.getAll({ desde, hasta }),
  });

  const { data: comprasResumen } = useQuery({
    queryKey: ['compras-resumen', desde, hasta],
    queryFn: () => comprasApi.getResumen({ desde, hasta }),
  });

  const { data: recordatorios } = useQuery({
    queryKey: ['recordatorios-proximos'],
    queryFn: () => recordatoriosApi.getProximos(30),
  });

  // Calcular totales
  const ventas = dtes?.data?.data || [];
  const ventasFacturas = ventas.filter((v: any) => v.tipo_documento === 33);
  const ventasBoletas = ventas.filter((v: any) => v.tipo_documento === 39);

  const totalVentas = ventas.reduce((sum: number, v: any) => sum + v.monto_total, 0);
  const totalCompras = comprasResumen?.data?.data?.resumen?.total_monto || 0;
  const creditoFiscal = comprasResumen?.data?.data?.resumen?.credito_fiscal || 0;

  const debitoFiscal = ventas.reduce((sum: number, v: any) => sum + v.monto_iva, 0);
  const ivaAPagar = debitoFiscal - creditoFiscal;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(value);
  };

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <div className="card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend > 0 ? (
                <TrendingUp size={16} className="text-green-600" />
              ) : (
                <TrendingDown size={16} className="text-red-600" />
              )}
              <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Título */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">
          ¡Bienvenido! 👋
        </h2>
        <p className="text-gray-600 mt-2">
          Resumen del mes de {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Ventas"
          value={formatCurrency(totalVentas)}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Total Compras"
          value={formatCurrency(totalCompras)}
          icon={ShoppingCart}
          color="bg-blue-500"
        />
        <StatCard
          title="IVA a Pagar (F29)"
          value={formatCurrency(ivaAPagar)}
          icon={FileText}
          color={ivaAPagar > 0 ? 'bg-orange-500' : 'bg-green-500'}
        />
        <StatCard
          title="Documentos Emitidos"
          value={ventas.length}
          icon={FileText}
          color="bg-purple-500"
        />
      </div>

      {/* Dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen de Ventas */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-primary-600" />
            Resumen de Ventas
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Facturas Emitidas</p>
                <p className="text-xl font-bold text-gray-800">{ventasFacturas.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-lg font-semibold text-blue-600">
                  {formatCurrency(
                    ventasFacturas.reduce((sum: number, v: any) => sum + v.monto_total, 0)
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Boletas Emitidas</p>
                <p className="text-xl font-bold text-gray-800">{ventasBoletas.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(
                    ventasBoletas.reduce((sum: number, v: any) => sum + v.monto_total, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cálculo IVA */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-primary-600" />
            Cálculo IVA (F29)
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Débito Fiscal (IVA Ventas)</span>
              <span className="font-semibold text-gray-800">{formatCurrency(debitoFiscal)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Crédito Fiscal (IVA Compras)</span>
              <span className="font-semibold text-gray-800">{formatCurrency(creditoFiscal)}</span>
            </div>
            <div className="h-px bg-gray-300" />
            <div className={`flex items-center justify-between p-4 rounded-lg ${
              ivaAPagar > 0 ? 'bg-orange-100' : 'bg-green-100'
            }`}>
              <span className="font-semibold text-gray-800">IVA a Pagar</span>
              <span className={`text-xl font-bold ${
                ivaAPagar > 0 ? 'text-orange-600' : 'text-green-600'
              }`}>
                {formatCurrency(Math.max(0, ivaAPagar))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recordatorios Próximos */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle size={20} className="text-primary-600" />
          Recordatorios Tributarios Próximos
        </h3>
        {recordatorios?.data?.data?.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay recordatorios próximos</p>
        ) : (
          <div className="space-y-3">
            {recordatorios?.data?.data?.slice(0, 5).map((rec: any) => {
              const diasRestantes = Math.ceil(rec.dias_restantes);
              let colorClass = 'bg-blue-100 text-blue-800';
              if (diasRestantes <= 3) colorClass = 'bg-red-100 text-red-800';
              else if (diasRestantes <= 7) colorClass = 'bg-orange-100 text-orange-800';
              else if (diasRestantes <= 15) colorClass = 'bg-yellow-100 text-yellow-800';

              return (
                <div
                  key={rec.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-800">{rec.nombre}</p>
                    <p className="text-sm text-gray-600">{rec.fecha_vencimiento_formatted}</p>
                  </div>
                  <span className={`badge ${colorClass} font-semibold`}>
                    {diasRestantes === 0
                      ? '¡HOY!'
                      : diasRestantes === 1
                      ? 'Mañana'
                      : `${diasRestantes} días`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
