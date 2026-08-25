import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { comprasService } from '../services/api';
import { 
  ShoppingCart, 
  Plus, 
  RefreshCw, 
  Calendar, 
  DollarSign, 
  Truck, 
  Package, 
  X, 
  Check, 
  AlertCircle,
  Building2
} from 'lucide-react';

export default function AdminCompras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroLocal, setFiltroLocal] = useState('');
  const [error, setError] = useState('');

  // Modal para registrar nueva compra
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    localId: 1,
    suministroId: 1,
    cantidad: '',
    costoTotal: '',
    proveedor: '',
  });

  const cargarCompras = async (localId) => {
    setLoading(true);
    setError('');
    try {
      const response = await comprasService.obtenerHistorial(localId ? Number(localId) : null);
      setCompras(response.data || []);
    } catch (err) {
      console.error('Error al cargar compras:', err);
      setError('No se pudo cargar el historial de compras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCompras(filtroLocal);
  }, [filtroLocal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.cantidad || Number(formData.cantidad) <= 0) {
      setFormError('Ingresa una cantidad mayor a 0.');
      return;
    }
    if (!formData.costoTotal || Number(formData.costoTotal) <= 0) {
      setFormError('Ingresa un costo total válido.');
      return;
    }
    if (!formData.proveedor.trim()) {
      setFormError('Ingresa el nombre del proveedor.');
      return;
    }

    setSubmitting(true);
    try {
      await comprasService.registrarCompra({
        localId: Number(formData.localId),
        suministroId: Number(formData.suministroId),
        cantidad: Number(formData.cantidad),
        costoTotal: Number(formData.costoTotal),
        proveedor: formData.proveedor.trim(),
      });

      setIsModalOpen(false);
      setFormData({
        localId: 1,
        suministroId: 1,
        cantidad: '',
        costoTotal: '',
        proveedor: '',
      });
      cargarCompras(filtroLocal);
    } catch (err) {
      console.error('Error al registrar compra:', err);
      setFormError('No se pudo registrar la compra en el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatearDinero = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(monto || 0);
  };

  const totalGastadoCompras = compras.reduce((acc, curr) => acc + (curr.costoTotal || 0), 0);

  return (
    <AdminLayout
      title="Compras y Reabastecimiento"
      subtitle="Registro de compras de insumos para sumar existencias automáticamente al inventario"
      actionButton={
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-patilla-primary hover:bg-patilla-primary-hover text-gray-900 text-xs sm:text-sm font-black rounded-xl transition-transform active:scale-95 shadow-2xs cursor-pointer"
        >
          <Plus size={16} />
          Registrar Compra
        </button>
      }
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* KPI Resumen */}
      <div className="bg-white border border-patilla-border rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider block">Gasto Total en Insumos</span>
          <span className="text-2xl sm:text-3xl font-black text-gray-800">{formatearDinero(totalGastadoCompras)}</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-gray-700 shrink-0">Filtrar Sede:</label>
          <select
            value={filtroLocal}
            onChange={(e) => setFiltroLocal(e.target.value)}
            className="flex-1 sm:flex-none p-2 border border-patilla-border rounded-xl text-xs bg-patilla-bg outline-none font-bold text-gray-800"
          >
            <option value="">Todas las sedes</option>
            <option value="1">Sede Centro (#1)</option>
            <option value="2">Sede Norte (#2)</option>
          </select>
        </div>
      </div>

      {/* Tabla Responsiva de Compras */}
      <div className="bg-white border border-patilla-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[580px]">
            <thead>
              <tr className="bg-patilla-bg text-[11px] text-gray-500 uppercase tracking-wider">
                <th className="p-3.5 font-bold">Fecha</th>
                <th className="p-3.5 font-bold">Sede Destino</th>
                <th className="p-3.5 font-bold">Insumo Comprado</th>
                <th className="p-3.5 font-bold text-center">Cantidad Entrada</th>
                <th className="p-3.5 font-bold">Proveedor</th>
                <th className="p-3.5 font-bold text-right">Costo Total</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-gray-400" />
                    Cargando compras...
                  </td>
                </tr>
              ) : compras.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    <ShoppingCart size={28} className="mx-auto mb-2 text-gray-300" />
                    No hay compras registradas en este local.
                  </td>
                </tr>
              ) : (
                compras.map((c) => (
                  <tr key={c.id} className="border-b border-patilla-border hover:bg-gray-50 transition-colors">
                    <td className="p-3.5 text-gray-600 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{new Date(c.fecha).toLocaleDateString('es-CO')}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-gray-800 text-xs sm:text-sm">{c.nombreLocal}</td>
                    <td className="p-3.5 font-bold text-gray-800 text-xs sm:text-sm">{c.nombreSuministro}</td>
                    <td className="p-3.5 text-center font-bold text-green-700 text-xs">+{c.cantidad}</td>
                    <td className="p-3.5 text-gray-600 text-xs">{c.proveedor}</td>
                    <td className="p-3.5 text-right font-black text-gray-900 text-xs sm:text-sm">
                      {formatearDinero(c.costoTotal)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL REGISTRAR COMPRA --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-patilla-border flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                <ShoppingCart size={17} /> Registrar Entrada de Insumo
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={15} /> {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Sede de Destino</label>
                <select
                  value={formData.localId}
                  onChange={(e) => setFormData({ ...formData, localId: Number(e.target.value) })}
                  className="w-full p-3 border border-patilla-border rounded-xl text-sm bg-patilla-bg outline-none font-bold"
                >
                  <option value={1}>Sede Principal Centro (#1)</option>
                  <option value={2}>Sede Sucursal Norte (#2)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Insumo / Suministro</label>
                <select
                  value={formData.suministroId}
                  onChange={(e) => setFormData({ ...formData, suministroId: Number(e.target.value) })}
                  className="w-full p-3 border border-patilla-border rounded-xl text-sm bg-patilla-bg outline-none font-bold"
                >
                  <option value={1}>🍉 Sandías / Patillas Enteras (Kg)</option>
                  <option value={2}>🥤 Vasos Desechables 16oz (Uds)</option>
                  <option value={3}>🥤 Vasos Desechables 24oz (Uds)</option>
                  <option value={4}>🍬 Azúcar Morena (Kg)</option>
                  <option value={5}>🧊 Hielo Triturado en Cubos (Kg)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Cantidad Comprada</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0.1"
                    required
                    placeholder="Ej. 100"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                    className="w-full p-3 border border-patilla-border rounded-xl text-sm bg-patilla-bg outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Costo Total ($)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    required
                    placeholder="Ej. 150000"
                    value={formData.costoTotal}
                    onChange={(e) => setFormData({ ...formData, costoTotal: e.target.value })}
                    className="w-full p-3 border border-patilla-border rounded-xl text-sm bg-patilla-bg outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Proveedor / Lugar de Compra</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Central Mayorista / Distribuidora La 33"
                  value={formData.proveedor}
                  onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                  className="w-full p-3 border border-patilla-border rounded-xl text-sm bg-patilla-bg outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 text-xs font-bold bg-patilla-primary hover:bg-patilla-primary-hover text-gray-900 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  {submitting ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  Guardar y Sumar Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
