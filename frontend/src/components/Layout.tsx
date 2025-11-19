import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Home,
  FileText,
  Receipt,
  FileX,
  ShoppingCart,
  Bell,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Settings,
  Building2,
  BookOpen,
} from 'lucide-react';
import { notificacionesApi } from '../services/api';
import NotificationBell from './NotificationBell';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { data: notificaciones } = useQuery({
    queryKey: ['notificaciones'],
    queryFn: () => notificacionesApi.getUnread(),
    refetchInterval: 60000, // Cada minuto
  });

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard', exact: true },
    { path: '/facturas', icon: FileText, label: 'Facturas' },
    { path: '/boletas', icon: Receipt, label: 'Boletas' },
    { path: '/notas-credito', icon: FileX, label: 'Notas de Crédito' },
    { path: '/compras', icon: ShoppingCart, label: 'Compras y Gastos' },
    { path: '/recordatorios', icon: Bell, label: 'Recordatorios Tributarios' },
    { path: '/configuracion', icon: Building2, label: 'Configuración Empresa' },
    { path: '/ayuda', icon: BookOpen, label: 'Centro de Ayuda' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleName = (rol: string) => {
    const roles: { [key: string]: string } = {
      admin: 'Administrador',
      usuario: 'Usuario',
      visor: 'Visor',
    };
    return roles[rol] || rol;
  };

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-primary-800 to-primary-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary-700">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary-800 font-bold text-xl">$</span>
              </div>
              <span className="font-bold text-lg">APP Finanzas</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-primary-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                  active
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-700/50'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight size={16} />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-primary-700">
            <div className="text-xs text-primary-200">
              <p className="font-semibold mb-1">Sistema Tributario SII</p>
              <p>Versión 1.0.0</p>
              <p className="mt-2 text-primary-300">
                Cumple con todas las normativas del SII de Chile
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {menuItems.find((item) => isActive(item.path, item.exact))?.label ||
                  'APP Finanzas'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Sistema de Gestión Financiera y Tributaria
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Notificaciones */}
              <NotificationBell
                count={notificaciones?.data?.count || 0}
                notifications={notificaciones?.data?.data || []}
              />

              {/* Usuario */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.nombre?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-sm text-left">
                    <p className="font-semibold text-gray-800">{user?.nombre || 'Usuario'}</p>
                    <p className="text-gray-500 text-xs">{getRoleName(user?.rol || '')}</p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/configuracion');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Settings size={16} />
                      Configuración
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
