import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { LogOut, DollarSign, UserPlus, X } from 'lucide-react';

export default function AdminPagos() {
  const { user, logout } = useAuth();
  
  // Estados independientes para cada modal
  const [isVendedorModalOpen, setIsVendedorModalOpen] = useState(false);
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      
      {/* --- MODAL NUEVO VENDEDOR --- */}
      {isVendedorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-4 border-b border-patilla-border flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><UserPlus size={18} /> Registrar Vendedor</h3>
              <button onClick={() => setIsVendedorModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre Completo</label>
                <input type="text" className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none" placeholder="Ej. Ana Pérez" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Correo Electrónico (Para Login)</label>
                <input type="email" className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none" placeholder="ana@patilladash.com" />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Contraseña Temporal</label>
                  <input type="text" className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none" defaultValue="Password123!" />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Asignar a Local</label>
                  <select className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none">
                    <option>Sede Centro (ID: 1)</option>
                    <option>Sede Norte (ID: 2)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-patilla-border bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsVendedorModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded font-semibold transition-colors">
                Cancelar
              </button>
              <button onClick={() => setIsVendedorModalOpen(false)} className="px-4 py-2 text-sm bg-patilla-primary hover:bg-patilla-primary-hover text-gray-800 font-bold rounded transition-colors">
                Crear Cuenta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL REGISTRAR PAGO --- */}
      {isPagoModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-4 border-b border-patilla-border flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-green-700"><DollarSign size={18} /> Registrar Pago a Personal</h3>
              <button onClick={() => setIsPagoModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Seleccionar Colaborador</label>
                <select className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none">
                  <option>Carlos Vendedor (Sede Centro)</option>
                  <option>Ana Pérez (Sede Norte)</option>
                </select>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Monto a Pagar ($)</label>
                  <input type="number" className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none" placeholder="Ej. 60000" />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Concepto</label>
                  <select className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none">
                    <option>Día laborado (Base)</option>
                    <option>Anticipo</option>
                    <option>Bono extra</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Observaciones</label>
                <input type="text" className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none" placeholder="Opcional..." />
              </div>
            </div>
            <div className="p-4 border-t border-patilla-border bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsPagoModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded font-semibold transition-colors">
                Cancelar
              </button>
              <button onClick={() => setIsPagoModalOpen(false)} className="px-4 py-2 text-sm bg-green-200 hover:bg-green-300 text-green-900 font-bold rounded transition-colors border border-green-300">
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className="w-full md:w-64 bg-white border-r border-b md:border-b-0 border-patilla-border flex flex-col">
        <div className="p-6 border-b border-patilla-border">
          <h1 className="text-2xl font-bold text-gray-700">🍉 PatillaDash</h1>
          <p className="text-xs text-gray-500 mt-1">Panel de Control</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="block w-full text-left px-4 py-2 text-gray-500 hover:bg-gray-50 rounded transition-colors">Dashboard</Link>
          <Link to="/admin/inventario" className="block w-full text-left px-4 py-2 text-gray-500 hover:bg-gray-50 rounded transition-colors">Inventario general</Link>
          <Link to="/admin/pagos" className="block w-full text-left px-4 py-2 bg-patilla-bg border border-patilla-border rounded font-semibold text-gray-700">Personal y Pagos</Link>
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
            <h2 className="text-2xl font-bold text-gray-700">Personal y Pagos</h2>
            <p className="text-sm text-gray-500">Gestión de nómina, anticipos y colaboradores</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsVendedorModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-patilla-border hover:bg-gray-50 text-gray-700 font-semibold rounded transition-colors text-sm"
            >
              <UserPlus size={18} />
              Nuevo Vendedor
            </button>
            <button 
              onClick={() => setIsPagoModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-patilla-secondary hover:bg-green-300 text-green-900 font-semibold rounded transition-colors text-sm border border-transparent"
            >
              <DollarSign size={18} />
              Registrar Pago
            </button>
          </div>
        </header>

        {/* Tabla de Personal */}
        <div className="bg-white border border-patilla-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-patilla-bg text-xs text-gray-500 uppercase">
                  <th className="p-4 font-medium">Colaborador</th>
                  <th className="p-4 font-medium">Local Asignado</th>
                  <th className="p-4 font-medium text-right">Último Pago</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-patilla-border">
                  <td className="p-4">
                    <p className="font-semibold text-gray-700">Carlos Vendedor</p>
                    <p className="text-xs text-gray-500">carlos@patilladash.com</p>
                  </td>
                  <td className="p-4 text-gray-600">Sede Centro</td>
                  <td className="p-4 text-right">
                    <p className="font-medium text-gray-800">$ 60.000</p>
                    <p className="text-xs text-gray-500">hace 2 días</p>
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