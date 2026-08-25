import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { inventarioService } from '../services/api';
import { 
  Package, 
  RefreshCw, 
  AlertTriangle, 
  Edit3, 
  Check, 
  X, 
  Search, 
  TrendingDown, 
  CheckCircle2, 
  Building2 
} from 'lucide-react';

export default function AdminInventario() {
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSeleccionado, setLocalSeleccionado] = useState(1);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edición rápida de stock
  const [editandoItem, setEditandoItem] = useState(null);
  const [nuevoStock, setNuevoStock] = useState('');

  const cargarInventario = async (localId) => {
    setLoading(true);
    setError('');
    try {
      const response = await inventarioService.obtenerPorLocal(localId);
      setInventario(response.data || []);
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      setError('No se pudo cargar el inventario del local seleccionado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarInventario(localSeleccionado);
  }, [localSeleccionado]);

  const handleIniciarEdicion = (item) => {
    setEditandoItem(item.suministroId);
    setNuevoStock(item.cantidadDisponible.toString());
  };

  const handleGuardarAjuste = async (suministroId) => {
    if (nuevoStock === '' || isNaN(Number(nuevoStock)) || Number(nuevoStock) < 0) {
      setError('Por favor ingresa una cantidad válida de stock mayor o igual a 0.');
      return;
    }

    try {
      await inventarioService.actualizarStockManual({
        localId: localSeleccionado,
        suministroId: suministroId,
        nuevaCantidad: Number(nuevoStock),
      });

      setSuccessMsg('Stock actualizado correctamente.');
      setTimeout(() => setSuccessMsg(''), 3000);
      setEditandoItem(null);
      cargarInventario(localSeleccionado);
    } catch (err) {
      console.error('Error al actualizar stock:', err);
      setError('Error al actualizar el stock en la base de datos.');
    }
  };

  return (
    <AdminLayout
      title="Inventario y Suministros"
      subtitle="Supervisión de stock por sede y ajustes manuales"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* Selector de Sede */}
      <div className="bg-white border border-patilla-border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <Building2 size={18} className="text-gray-500 shrink-0" />
          <label className="text-xs font-bold text-gray-700 shrink-0">Selecciona Sede:</label>
          <select
            value={localSeleccionado}
            onChange={(e) => setLocalSeleccionado(Number(e.target.value))}
            className="flex-1 sm:flex-none p-2.5 border border-patilla-border rounded-xl text-xs sm:text-sm bg-patilla-bg outline-none font-bold text-gray-800"
          >
            <option value={1}>Sede Principal Centro (#1)</option>
            <option value={2}>Sede Sucursal Norte (#2)</option>
          </select>
        </div>
        <button
          onClick={() => cargarInventario(localSeleccionado)}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gray-50 border border-patilla-border rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors shrink-0 active:scale-95"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualizar Stock
        </button>
      </div>

      {/* Listado de Inventario Responsivo (Tabla / Cards) */}
      <div className="bg-white border border-patilla-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[580px]">
            <thead>
              <tr className="bg-patilla-bg text-[11px] text-gray-500 uppercase tracking-wider">
                <th className="p-3.5 font-bold">Insumo / Suministro</th>
                <th className="p-3.5 font-bold text-center">Unidad</th>
                <th className="p-3.5 font-bold text-center">Stock Mínimo</th>
                <th className="p-3.5 font-bold text-right">Cantidad Disponible</th>
                <th className="p-3.5 font-bold text-center">Estado</th>
                <th className="p-3.5 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-gray-400" />
                    Consultando existencias de la sede...
                  </td>
                </tr>
              ) : inventario.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    <Package size={28} className="mx-auto mb-2 text-gray-300" />
                    No hay insumos registrados para esta sede.
                  </td>
                </tr>
              ) : (
                inventario.map((item) => {
                  const enAlerta = item.cantidadDisponible <= item.stockMinimoAlerta;
                  const isEditing = editandoItem === item.suministroId;

                  return (
                    <tr key={item.suministroId} className="border-b border-patilla-border hover:bg-gray-50 transition-colors">
                      <td className="p-3.5 font-bold text-gray-800 text-xs sm:text-sm">
                        {item.nombreSuministro}
                      </td>
                      <td className="p-3.5 text-center text-gray-500 text-xs">
                        {item.unidadMedida}
                      </td>
                      <td className="p-3.5 text-center text-gray-400 text-xs font-semibold">
                        {item.stockMinimoAlerta} {item.unidadMedida}
                      </td>
                      <td className="p-3.5 text-right font-black">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-1 justify-end">
                            <input
                              type="number"
                              step="any"
                              value={nuevoStock}
                              onChange={(e) => setNuevoStock(e.target.value)}
                              className="w-20 p-1.5 border border-patilla-border rounded-lg text-sm text-right font-black outline-none bg-white shadow-2xs"
                              autoFocus
                            />
                            <span className="text-xs text-gray-500">{item.unidadMedida}</span>
                          </div>
                        ) : (
                          <span className={`text-sm sm:text-base ${enAlerta ? 'text-red-700' : 'text-gray-900'}`}>
                            {item.cantidadDisponible} {item.unidadMedida}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        {enAlerta ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 text-[11px] font-bold rounded-full border border-red-200">
                            <AlertTriangle size={12} /> Stock Crítico
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 text-[11px] font-bold rounded-full border border-green-200">
                            <CheckCircle2 size={12} /> Óptimo
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleGuardarAjuste(item.suministroId)}
                              title="Guardar"
                              className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-2xs"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditandoItem(null)}
                              title="Cancelar"
                              className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleIniciarEdicion(item)}
                            title="Ajustar Stock Manualmente"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-patilla-border hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg transition-colors shadow-2xs"
                          >
                            <Edit3 size={12} /> Ajustar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
