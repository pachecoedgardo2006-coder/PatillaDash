import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { inventarioService } from '../services/api';
import { 
  PackagePlus, 
  AlertCircle, 
  Search, 
  X, 
  Edit3, 
  RefreshCw, 
  CheckCircle2, 
  Package 
} from 'lucide-react';

export default function AdminInventario() {
  const [localId, setLocalId] = useState(1);
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal para Actualizar Stock Manual
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemEditar, setItemEditar] = useState(null);
  const [nuevaCantidad, setNuevaCantidad] = useState('');
  const [savingStock, setSavingStock] = useState(false);

  const cargarInventario = async (idLocal) => {
    setLoading(true);
    setError('');
    try {
      const response = await inventarioService.obtenerPorLocal(idLocal || localId);
      setInventario(response.data || []);
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      setError('No se pudo cargar el inventario del local seleccionado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarInventario(localId);
  }, [localId]);

  const handleAbrirEditar = (item) => {
    setItemEditar(item);
    setNuevaCantidad(item.cantidadDisponible);
    setIsEditModalOpen(true);
  };

  const handleGuardarStockManual = async (e) => {
    e.preventDefault();
    if (!itemEditar) return;

    setSavingStock(true);
    setError('');
    try {
      await inventarioService.actualizarStockManual({
        localId: Number(localId),
        suministroId: Number(itemEditar.suministroId),
        nuevaCantidad: Number(nuevaCantidad),
      });

      setSuccessMsg(`Stock de ${itemEditar.nombreSuministro} actualizado correctamente.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsEditModalOpen(false);
      setItemEditar(null);
      await cargarInventario(localId);
    } catch (err) {
      console.error('Error al actualizar stock:', err);
      setError('No se pudo actualizar el stock.');
    } finally {
      setSavingStock(false);
    }
  };

  const inventarioFiltrado = inventario.filter((item) =>
    (item.nombreSuministro || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <AdminLayout
      title="Inventario y Suministros"
      subtitle="Monitoreo de existencias y alertas de stock crítico"
      actionButton={
        <div className="flex items-center gap-3">
          <Link
            to="/admin/compras"
            className="flex items-center gap-2 px-4 py-2 bg-patilla-primary hover:bg-patilla-primary-hover text-gray-800 font-semibold rounded transition-colors text-sm"
          >
            <PackagePlus size={18} />
            Registrar Compra
          </Link>
        </div>
      }
    >
      {/* Notificaciones */}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-300 text-green-800 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Filtros de Local y Búsqueda */}
      <div className="bg-white border border-patilla-border rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-600">Local / Sede:</label>
          <select
            value={localId}
            onChange={(e) => setLocalId(Number(e.target.value))}
            className="p-2 border border-patilla-border rounded text-sm bg-patilla-bg outline-none font-medium text-gray-700"
          >
            <option value={1}>Sede Centro (Local #1)</option>
            <option value={2}>Sede Norte (Local #2)</option>
          </select>
          <button
            onClick={() => cargarInventario(localId)}
            disabled={loading}
            title="Recargar inventario"
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar insumo..."
            className="w-full sm:w-64 pl-9 pr-4 py-1.5 bg-patilla-bg border border-patilla-border rounded outline-none text-sm focus:border-gray-400"
          />
        </div>
      </div>

      {/* Tabla de Inventario */}
      <div className="bg-white border border-patilla-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-patilla-bg text-xs text-gray-500 uppercase">
                <th className="p-4 font-medium">Insumo</th>
                <th className="p-4 font-medium text-center">Stock Actual</th>
                <th className="p-4 font-medium text-center">Mínimo Alerta</th>
                <th className="p-4 font-medium text-center">Estado</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-gray-400" />
                    Cargando existencias...
                  </td>
                </tr>
              ) : inventarioFiltrado.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    <Package size={28} className="mx-auto mb-2 text-gray-300" />
                    No se encontraron insumos para este local.
                  </td>
                </tr>
              ) : (
                inventarioFiltrado.map((item) => (
                  <tr key={item.suministroId} className="border-b border-patilla-border hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-gray-800">{item.nombreSuministro}</p>
                      <p className="text-xs text-gray-400">ID #{item.suministroId} — Medida: {item.unidadMedida}</p>
                    </td>
                    <td className="p-4 text-center font-bold text-gray-800">
                      {item.cantidadDisponible} {item.unidadMedida}
                    </td>
                    <td className="p-4 text-center text-gray-500">
                      {item.stockMinimoAlerta} {item.unidadMedida}
                    </td>
                    <td className="p-4 text-center">
                      {item.enAlerta ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs font-bold rounded-full">
                          <AlertCircle size={12} /> Stock Crítico
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 bg-green-100 border border-green-300 text-green-800 text-xs font-bold rounded-full">
                          Óptimo
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleAbrirEditar(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded transition-colors"
                      >
                        <Edit3 size={13} />
                        Ajustar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL AJUSTAR STOCK MANUAL --- */}
      {isEditModalOpen && itemEditar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-4 border-b border-patilla-border flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Ajustar Stock Manual</h3>
              <button
                onClick={() => { setIsEditModalOpen(false); setItemEditar(null); }}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGuardarStockManual}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Insumo</label>
                  <input
                    type="text"
                    readOnly
                    value={`${itemEditar.nombreSuministro} (${itemEditar.unidadMedida})`}
                    className="w-full p-2.5 border border-patilla-border rounded text-sm bg-gray-100 text-gray-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nueva Cantidad Disponible</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={nuevaCantidad}
                    onChange={(e) => setNuevaCantidad(e.target.value)}
                    className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none focus:border-gray-400"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-patilla-border bg-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setItemEditar(null); }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingStock}
                  className="px-4 py-2 text-sm bg-patilla-primary hover:bg-patilla-primary-hover text-gray-800 font-bold rounded transition-colors disabled:opacity-50"
                >
                  {savingStock ? 'Guardando...' : 'Actualizar Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
