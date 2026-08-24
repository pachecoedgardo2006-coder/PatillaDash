import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, DollarSign, Package, ClipboardList, CheckCircle } from 'lucide-react';

export default function VendedorDashboard() {
  const { user, logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Función que simula el envío del formulario
  const handleRegistrarCierre = () => {
    setIsSubmitting(true);
    
    // Simulamos 1 segundo de carga en el servidor
    setTimeout(() => {
      setIsSubmitting(false);
      setShowToast(true);
      
      // Ocultamos la alerta verde después de 3 segundos
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen pb-10 relative">
      {/* Alerta flotante (Toast) */}
      {showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-bounce">
          <CheckCircle size={20} />
          <span className="font-semibold text-sm">¡Cierre de turno registrado con éxito!</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-patilla-border px-4 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-700">🍉 Mi Turno</h1>
          <p className="text-xs text-gray-500">Local #{user?.localId} - {user?.nombre}</p>
        </div>
        <button onClick={logout} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded">
          <LogOut size={18} />
        </button>
      </header>

      {/* Main Content (Flat Cards) */}
      <main className="p-4 space-y-4 max-w-md mx-auto">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">Cierre Diario</h2>

        <section className="bg-white border border-patilla-border p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4 text-patilla-text">
            <DollarSign size={20} className="text-patilla-secondary" />
            <h3 className="font-semibold">Totales en Caja</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Total Efectivo ($)</label>
              <input type="number" placeholder="Ej. 150000" className="w-full p-2.5 bg-patilla-bg border border-patilla-border rounded outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Total Transferencias ($)</label>
              <input type="number" placeholder="Ej. 45000" className="w-full p-2.5 bg-patilla-bg border border-patilla-border rounded outline-none text-sm" />
            </div>
          </div>
        </section>

        <section className="bg-white border border-patilla-border p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4 text-patilla-text">
            <Package size={20} className="text-patilla-primary" />
            <h3 className="font-semibold">Insumos Gastados</h3>
          </div>
          <div className="flex justify-between items-center bg-patilla-bg border border-patilla-border p-3 rounded mb-2">
            <span className="text-sm">Patillas Enteras</span>
            <input type="number" placeholder="0" className="w-16 p-1 text-center border border-patilla-border rounded text-sm" />
          </div>
          <div className="flex justify-between items-center bg-patilla-bg border border-patilla-border p-3 rounded">
            <span className="text-sm">Vasos 16oz</span>
            <input type="number" placeholder="0" className="w-16 p-1 text-center border border-patilla-border rounded text-sm" />
          </div>
        </section>

        <section className="bg-white border border-patilla-border p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4 text-patilla-text">
            <ClipboardList size={20} className="text-gray-400" />
            <h3 className="font-semibold">Novedades (Opcional)</h3>
          </div>
          <textarea rows="3" placeholder="Observaciones del turno..." className="w-full p-2.5 bg-patilla-bg border border-patilla-border rounded outline-none text-sm resize-none"></textarea>
        </section>

        <button 
          onClick={handleRegistrarCierre}
          disabled={isSubmitting}
          className={`w-full py-3 font-bold rounded mt-6 transition-colors ${
            isSubmitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-patilla-primary hover:bg-patilla-primary-hover text-gray-800'
          }`}
        >
          {isSubmitting ? 'Guardando...' : 'Registrar Cierre'}
        </button>
      </main>
    </div>
  );
}