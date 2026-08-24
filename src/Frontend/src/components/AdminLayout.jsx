import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users,
  ReceiptText 
} from 'lucide-react';

export default function AdminLayout({ children, title, subtitle, actionButton }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: TrendingUp },
    { path: '/admin/ventas', label: 'Ventas y Cierres', icon: ReceiptText },
    { path: '/admin/inventario', label: 'Inventario general', icon: Package },
    { path: '/admin/compras', label: 'Compras y Entradas', icon: ShoppingCart },
    { path: '/admin/pagos', label: 'Personal y Pagos', icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-patilla-bg">
      {/* Sidebar Desktop */}
      <aside className="w-full md:w-64 bg-white border-r border-b md:border-b-0 border-patilla-border flex flex-col">
        <div className="p-6 border-b border-patilla-border">
          <h1 className="text-2xl font-bold text-gray-700">🍉 PatillaDash</h1>
          <p className="text-xs text-gray-500 mt-1">Panel de Control</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 w-full text-left px-4 py-2.5 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-patilla-bg border border-patilla-border font-semibold text-gray-800'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-gray-700' : 'text-gray-400'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-patilla-border">
          <div className="flex items-center justify-between">
            <div className="overflow-hidden">
              <span className="block text-sm font-medium text-gray-700 truncate">{user?.nombre || 'Administrador'}</span>
              <span className="block text-xs text-gray-400 truncate">{user?.email}</span>
            </div>
            <button 
              onClick={logout} 
              title="Cerrar sesión"
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        {(title || actionButton) && (
          <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              {title && <h2 className="text-2xl font-bold text-gray-700">{title}</h2>}
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
            {actionButton && <div>{actionButton}</div>}
          </header>
        )}
        {children}
      </main>
    </div>
  );
}
