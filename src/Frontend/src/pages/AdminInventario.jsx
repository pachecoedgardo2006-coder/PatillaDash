import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { LogOut, PackagePlus, AlertCircle, Search, X } from 'lucide-react';

export default function AdminInventario() {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      
      {/* --- MODAL EMERGENTE --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-4 border-b border-patilla-border flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Registrar Nueva Compra</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Insumo a reabastecer</label>
                <select className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none">
                  <option>Patillas Enteras</option>
                  <option>Vasos 16oz</option>
                  <option>Tapas Domo</option>
                </select>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Cantidad</label>
                  <input type="number" className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none" placeholder="Ej. 50" />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Costo Total ($)</label>
                  <input type="number" className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none" placeholder="Ej. 120000" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Proveedor / Nota</label>
                <input type="text" className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none" placeholder="Nombre del proveedor" />
              </div>
            </div>
            <div className="p-4 border-t border-patilla-border bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded font-semibold transition-colors">
                Cancelar
              </button>
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm bg-patilla-primary hover:bg-patilla-primary-hover text-gray-800 font-bold rounded transition-colors">
                Guardar Inventario
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- FIN DEL MODAL --- */}

      {/* Sidebar Desktop */}
      <aside className="w-full md:w-64 bg-white border-r border-b md:border-b-0 border-patilla-border flex flex-col">
        <div className="p-6 border-b border-patilla-border">
          <h1 className="text-2xl font-bold text-gray-700">🍉 PatillaDash</h1>
          <p className="text-xs text-gray-500 mt-1">Panel de Control</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="block w-full text-left px-4 py-2 text-gray-500 hover:bg-gray-50 rounded transition-colors">Dashboard</Link>
          <Link to="/admin/inventario" className="block w-full text-left px-4 py-2 bg-patilla-bg border border-patilla-border rounded font-semibold text-gray-700">Inventario general</Link>
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

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-700">Inventario y Compras</h2>
            <p className="text-sm text-gray-500">Gestión de existencias y entrada de mercancía</p>
          </div>
          {/* BOTÓN QUE ABRE EL MODAL */}
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-patilla-primary hover:bg-patilla-primary-hover text-gray-800 font-semibold rounded transition-colors text-sm">
            <PackagePlus size={18} />
            Registrar Compra
          </button>
        </header>

        {/* Tabla de Inventario */}
        <div className="bg-white border border-patilla-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-patilla-border flex items-center justify-between">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Buscar insumo..." className="pl-9 pr-4 py-1.5 bg-patilla-bg border border-patilla-border rounded outline-none text-sm focus:border-gray-400" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-patilla-bg text-xs text-gray-500 uppercase">
                  <th className="p-4 font-medium">Insumo</th>
                  <th className="p-4 font-medium">Local</th>
                  <th className="p-4 font-medium text-center">Stock Disponible</th>
                  <th className="p-4 font-medium text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-patilla-border">
                  <td className="p-4">Patilla Entera</td>
                  <td className="p-4 text-gray-500">Sede Centro</td>
                  <td className="p-4 text-center font-medium">4.5 Unidades</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
                      <AlertCircle size={12} /> Alerta
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-4">Vaso 16oz</td>
                  <td className="p-4 text-gray-500">Sede Norte</td>
                  <td className="p-4 text-center font-medium">120 Unidades</td>
                  <td className="p-4 text-center">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">Óptimo</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}