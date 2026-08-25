import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users,
  ReceiptText,
  Menu,
  X,
  Store,
  ChevronRight
} from 'lucide-react';

export default function AdminLayout({ children, title, subtitle, actionButton }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: TrendingUp, shortLabel: 'Inicio' },
    { path: '/admin/ventas', label: 'Ventas y Cierres', icon: ReceiptText, shortLabel: 'Ventas' },
    { path: '/admin/inventario', label: 'Inventario General', icon: Package, shortLabel: 'Inventario' },
    { path: '/admin/compras', label: 'Compras y Entradas', icon: ShoppingCart, shortLabel: 'Compras' },
    { path: '/admin/pagos', label: 'Personal y Pagos', icon: Users, shortLabel: 'Personal' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-patilla-bg text-gray-800">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-patilla-border px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú de navegación"
            className="p-2 -ml-1 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🍉</span>
            <span className="font-extrabold text-gray-800 text-base tracking-tight">PatillaDash</span>
            <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded border border-red-200">Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-600 truncate max-w-[110px]">
            {user?.nombre?.split(' ')[0] || 'Admin'}
          </span>
          <button 
            onClick={logout}
            title="Cerrar sesión"
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-2xs animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Desktop & Mobile Slide-out Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-patilla-border flex flex-col transition-transform duration-300 ease-in-out
        md:static md:translate-x-0 md:w-64 md:z-0 md:shrink-0
        ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-patilla-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🍉</span>
            <div>
              <h1 className="text-xl font-black text-gray-800 tracking-tight">PatillaDash</h1>
              <p className="text-[11px] text-gray-400 font-medium">Panel Administrativo</p>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Módulos Principales
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-patilla-primary/30 border border-patilla-primary/40 text-gray-900 shadow-2xs'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={19} className={isActive ? 'text-gray-900' : 'text-gray-400'} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={15} className="text-gray-800" />}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-patilla-border bg-gray-50/70">
          <div className="flex items-center justify-between gap-2">
            <div className="overflow-hidden min-w-0">
              <span className="block text-xs font-bold text-gray-800 truncate">
                {user?.nombre || 'Administrador'}
              </span>
              <span className="block text-[11px] text-gray-400 truncate">
                {user?.email || 'admin@patilladash.com'}
              </span>
            </div>
            <button 
              onClick={logout} 
              title="Cerrar sesión"
              className="p-2 bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg border border-patilla-border transition-colors shrink-0 shadow-2xs"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto pb-24 md:pb-10">
        {(title || actionButton) && (
          <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              {title && <h2 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight">{title}</h2>}
              {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            {actionButton && <div className="w-full sm:w-auto shrink-0">{actionButton}</div>}
          </header>
        )}
        {children}
      </main>

      {/* Bottom Mobile Navigation Bar for High-Speed Switching */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-patilla-border z-30 px-2 py-1.5 flex justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors min-w-[56px] ${
                isActive
                  ? 'text-gray-900 font-black'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-patilla-primary/40' : ''}`}>
                <Icon size={18} className={isActive ? 'text-gray-900' : 'text-gray-400'} />
              </div>
              <span className="mt-0.5 leading-none">{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
