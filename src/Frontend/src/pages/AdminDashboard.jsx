import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, TrendingUp, DollarSign, Store, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="w-full md:w-64 bg-white border-r border-b md:border-b-0 border-patilla-border flex flex-col">
        <div className="p-6 border-b border-patilla-border">
          <h1 className="text-2xl font-bold text-gray-700">🍉 PatillaDash</h1>
          <p className="text-xs text-gray-500 mt-1">Panel de Control</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="block w-full text-left px-4 py-2 bg-patilla-bg border border-patilla-border rounded font-semibold text-gray-700">Dashboard</Link>
          <Link to="/admin/inventario" className="block w-full text-left px-4 py-2 text-gray-500 hover:bg-gray-50 rounded transition-colors">Inventario general</Link>
          <Link to="/admin/pagos" className="block w-full text-left px-4 py-2 text-gray-500 hover:bg-gray-50 rounded transition-colors">Personal y Pagos</Link>
        </nav>
        <div className="p-4 border-t border-patilla-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">{user?.nombre}</span>
            <button onClick={logout} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Desktop */}
      <main className="flex-1 p-6 lg:p-10">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-gray-700">Resumen Financiero</h2>
          <p className="text-sm text-gray-500">Métricas consolidadas de todos los locales (Mes actual)</p>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-patilla-border p-6 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Ingresos Totales</p>
                <h3 className="text-3xl font-bold text-gray-800">$ 1.540.000</h3>
              </div>
              <div className="p-3 bg-patilla-secondary bg-opacity-30 rounded text-green-700 border border-green-200">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-patilla-border p-6 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Gastos (Compras + Nómina)</p>
                <h3 className="text-3xl font-bold text-gray-800">$ 720.000</h3>
              </div>
              <div className="p-3 bg-patilla-primary bg-opacity-30 rounded text-red-700 border border-red-200">
                <DollarSign size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-patilla-border p-6 rounded-lg bg-gray-50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Balance Neto</p>
                <h3 className="text-3xl font-bold text-gray-800">$ 820.000</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Tablas / Grillas de Información */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ranking Locales */}
          <div className="bg-white border border-patilla-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-patilla-border flex items-center gap-2">
              <Store size={18} className="text-gray-500" />
              <h4 className="font-semibold text-gray-700">Ranking de Ventas</h4>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-patilla-bg text-xs text-gray-500 uppercase">
                    <th className="p-3 font-medium">Local</th>
                    <th className="p-3 font-medium text-right">Ventas</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-patilla-border">
                    <td className="p-3">Sede Principal - Centro</td>
                    <td className="p-3 text-right font-medium">$ 950.000</td>
                  </tr>
                  <tr>
                    <td className="p-3">Sede Norte</td>
                    <td className="p-3 text-right font-medium">$ 590.000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Alertas de Stock */}
          <div className="bg-white border border-patilla-border rounded-lg overflow-hidden">
             <div className="p-4 border-b border-patilla-border flex items-center gap-2">
              <AlertCircle size={18} className="text-patilla-alert text-yellow-600" />
              <h4 className="font-semibold text-gray-700">Alertas de Stock</h4>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between p-3 mb-2 bg-yellow-50 border border-yellow-200 rounded">
                <span className="text-sm text-yellow-800">Patilla Entera (Sede Centro)</span>
                <span className="text-xs font-bold px-2 py-1 bg-yellow-200 text-yellow-900 rounded">4 uds rest.</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-patilla-bg border border-patilla-border rounded">
                <span className="text-sm text-gray-600">Azúcar (Sede Norte)</span>
                <span className="text-xs font-bold px-2 py-1 bg-gray-200 text-gray-600 rounded">Normal</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}