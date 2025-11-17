import { useQuery } from '@tanstack/react-query';
import { Bell, Calendar, AlertTriangle } from 'lucide-react';
import { recordatoriosApi } from '../services/api';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

const Recordatorios = () => {
  const { data: proximosData } = useQuery({
    queryKey: ['recordatorios-proximos'],
    queryFn: () => recordatoriosApi.getProximos(90),
  });

  const recordatorios = proximosData?.data?.data || [];

  const getUrgenciaColor = (diasRestantes: number) => {
    if (diasRestantes <= 3) return 'border-red-500 bg-red-50';
    if (diasRestantes <= 7) return 'border-orange-500 bg-orange-50';
    if (diasRestantes <= 15) return 'border-yellow-500 bg-yellow-50';
    return 'border-blue-500 bg-blue-50';
  };

  const getUrgenciaBadge = (diasRestantes: number) => {
    if (diasRestantes === 0) return <span className="badge-danger">¡HOY!</span>;
    if (diasRestantes === 1) return <span className="badge-danger">Mañana</span>;
    if (diasRestantes <= 3) return <span className="badge-danger">{diasRestantes} días</span>;
    if (diasRestantes <= 7) return <span className="badge-warning">{diasRestantes} días</span>;
    if (diasRestantes <= 15) return <span className="badge-warning">{diasRestantes} días</span>;
    return <span className="badge-info">{diasRestantes} días</span>;
  };

  const recordatoriosUrgentes = recordatorios.filter((r: any) => r.dias_restantes <= 7);
  const recordatoriosProximos = recordatorios.filter((r: any) => r.dias_restantes > 7 && r.dias_restantes <= 30);
  const recordatoriosFuturos = recordatorios.filter((r: any) => r.dias_restantes > 30);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Recordatorios Tributarios</h2>
        <p className="text-gray-600 mt-1">
          Manténgase al día con sus obligaciones tributarias ante el SII
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-red-50 border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <AlertTriangle size={32} className="text-red-600" />
            <div>
              <p className="text-sm text-red-700">Urgentes</p>
              <p className="text-3xl font-bold text-red-700">{recordatoriosUrgentes.length}</p>
            </div>
          </div>
        </div>
        <div className="card bg-yellow-50 border-l-4 border-yellow-500">
          <div className="flex items-center gap-3">
            <Calendar size={32} className="text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-700">Próximos (30 días)</p>
              <p className="text-3xl font-bold text-yellow-700">{recordatoriosProximos.length}</p>
            </div>
          </div>
        </div>
        <div className="card bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <Bell size={32} className="text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">Futuros</p>
              <p className="text-3xl font-bold text-blue-700">{recordatoriosFuturos.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recordatorios Urgentes */}
      {recordatoriosUrgentes.length > 0 && (
        <div className="card border-l-4 border-red-500">
          <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} />
            Recordatorios Urgentes (≤7 días)
          </h3>
          <div className="space-y-3">
            {recordatoriosUrgentes.map((rec: any) => (
              <div
                key={rec.id}
                className={`p-4 rounded-lg border-l-4 ${getUrgenciaColor(rec.dias_restantes)} transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-800">{rec.nombre}</h4>
                      {getUrgenciaBadge(rec.dias_restantes)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rec.descripcion}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>📅 Vence: {rec.fecha_vencimiento_formatted}</span>
                      <span>🔄 Periodicidad: {rec.periodicidad}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recordatorios Próximos */}
      {recordatoriosProximos.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-primary-600" />
            Próximos 30 Días
          </h3>
          <div className="space-y-3">
            {recordatoriosProximos.map((rec: any) => (
              <div
                key={rec.id}
                className={`p-4 rounded-lg border-l-4 ${getUrgenciaColor(rec.dias_restantes)} transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-800">{rec.nombre}</h4>
                      {getUrgenciaBadge(rec.dias_restantes)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rec.descripcion}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>📅 Vence: {rec.fecha_vencimiento_formatted}</span>
                      <span>🔄 Periodicidad: {rec.periodicidad}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recordatorios Futuros */}
      {recordatoriosFuturos.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Bell size={20} className="text-primary-600" />
            Recordatorios Futuros ({'>'}30 días)
          </h3>
          <div className="space-y-3">
            {recordatoriosFuturos.map((rec: any) => (
              <div
                key={rec.id}
                className="p-4 rounded-lg bg-gray-50 border-l-4 border-gray-300 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-800">{rec.nombre}</h4>
                      {getUrgenciaBadge(rec.dias_restantes)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rec.descripcion}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>📅 Vence: {rec.fecha_vencimiento_formatted}</span>
                      <span>🔄 Periodicidad: {rec.periodicidad}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recordatorios.length === 0 && (
        <div className="card text-center py-12">
          <Bell size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hay recordatorios configurados</p>
        </div>
      )}
    </div>
  );
};

export default Recordatorios;
