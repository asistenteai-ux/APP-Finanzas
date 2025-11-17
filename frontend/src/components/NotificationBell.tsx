import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificacionesApi } from '../services/api';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  dias_restantes: number;
  created_at: string;
}

interface NotificationBellProps {
  count: number;
  notifications: Notification[];
}

const NotificationBell = ({ count, notifications }: NotificationBellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: notificacionesApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificacionesApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
      setIsOpen(false);
    },
  });

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={24} className="text-gray-700" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-[500px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">
                Notificaciones ({count})
              </h3>
              {count > 0 && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No hay notificaciones nuevas</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getTipoColor(
                        notif.tipo
                      )}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-800 mb-1">
                            {notif.titulo}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            {notif.mensaje}
                          </p>
                          <p className="text-xs text-gray-400">
                            {format(parseISO(notif.created_at), "d 'de' MMMM, HH:mm", {
                              locale: es,
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => markAsReadMutation.mutate(notif.id)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <X size={16} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
