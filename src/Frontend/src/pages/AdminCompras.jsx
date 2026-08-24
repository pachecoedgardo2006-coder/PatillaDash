import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { comprasService } from '../services/api';
import { ShoppingCart, Plus, RefreshCw, CheckCircle2, DollarSign, Calendar, Truck } from 'lucide-react';

export default function AdminCompras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [filtroLocal, setFiltroLocal] = useState('');

  // Modal registrar compra
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    localId: 1,
    suministroId: 1,
    cantidad: '',
    costoTotal: '',
    proveedor: '',
  });

  const cargarCompras = async (localIdSeleccionado) => {
    setLoading(true);
    setError('');
    try {
      const response = await comprasService.obtenerHistorial(
        localIdSeleccionado ? Number(localIdSeleccionado) : null
      );
      setCompras(response.data || []);
    } catch (err) {
      console.error('Error al cargar historial de compras:', err);
      setError('No se pudo cargar el historial de compras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCompras(filtroLocal);
  }, [filtroLocal]);

  const handleSubmitCompra = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await comprasService.registrarCompra({
        localId: Number(formData.localId),
        suministroId: Number(formData.suministroId),
        cantidad: Number(formData.cantidad),
        costoTotal: Number(formData.costoTotal),
        proveedor: formData.proveedor.trim(),
      });

      setSuccessMsg('¡Compra registrada e inventario incrementado exitosamente!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsModalOpen(false);
      setFormData({
        localId: 1,
        suministroId: 1,
        cantidad: '',
        costoTotal: '',
        proveedor: '',
      });
      await cargarCompras(filtroLocal);
    } catch (err) {
      console.error('Error al registrar compra:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Error al registrar la compra. Verifica los datos.');
      }
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

  const totalComprasMonto = compras.reduce((acc, curr) => acc + (curr.costoTotal || 0), 0);

  return (
    <AdminLayout
      title="Compras y Reabastecimiento"
      subtitle="Registro de compras de materia prima con incremento automático de stock"
      actionButton={
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-patilla-primary hover:bg-patilla-primary-hover text-gray-800 font-semibold rounded transition-colors text-sm"
        >
          <Plus size={18} />
          Nueva Compra
        </button>
      }
    >
      {/* Alertas */}
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

      {/* Barra de Filtros y Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-patilla-border rounded-lg p-4 flex items-center justify-between sm:col-span-2">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-gray-600">Filtrar por Sede:</label>
            <select
              value={filtroLocal}
              onChange={(e) => setFiltroLocal(e.target.value)}
              className="p-2 border border-patilla-border rounded text-sm bg-patilla-bg outline-none font-medium text-gray-700"
            >
              <option value="">Todas las sedes</option>
              <option value="1">Sede Centro (#1)</option>
              <option value="2">Sede Norte (#2)</option>
            </select>
          </div>
          <button
            onClick={() => cargarCompras(filtroLocal)}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="bg-white border border-patilla-border rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total en Compras</p>
            <p className="text-xl font-bold text-gray-800">{formatearDinero(totalComprasMonto)}</p>
          </div>
          <div className="p-2.5 bg-patilla-primary/30 rounded text-red-700">
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      {/* Tabla de Historial de Compras */}
      <div className="bg-white border border-patilla-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-patilla-border flex items-center justify-between">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <ShoppingCart size={18} className="text-gray-500" />
            Historial de Facturas y Compras
          </h4>
          <span className="text-xs text-gray-400">{compras.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-patilla-bg text-xs text-gray-500 uppercase">
                <th className="p-4 font-medium">Fecha</th>
                <th className="p-4 font-medium">Insumo</th>
                <th className="p-4 font-medium">Sede Destino</th>
                <th className="p-4 font-medium">Proveedor</th>
                <th className="p-4 font-medium text-center">Cantidad</th>
                <th className="p-4 font-medium text-right">Costo Total</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-gray-400" />
                    Cargando historial de compras...
                  </td>
                </tr>
              ) : compras.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    <Truck size={28} className="mx-auto mb-2 text-gray-300" />
                    No hay compras registradas en el periodo.
                  </td>
                </tr>
              ) : (
                compras.map((compra) => (
                  <tr key={compra.id} className="border-b border-patilla-border hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-600 flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(compra.fecha).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="p-4 font-semibold text-gray-800">
                      {compra.nombreSuministro || `Insumo #${compra.suministroId || ''}`}
                    </td>
                    <td className="p-4 text-gray-600">
                      {compra.nombreLocal || `Local #${compra.localId}`}
                    </td>
                    <td className="p-4 text-gray-600">{compra.proveedor || 'Sin proveedor'}</td>
                    <td className="p-4 text-center font-bold text-gray-700">
                      +{compra.cantidad}
                    </td>
                    <td className="p-4 text-right font-bold text-gray-800">
                      {formatearDinero(compra.costoTotal)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Compra */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-4 border-b border-patilla-border flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart size={18} /> Registrar Nueva Compra
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitCompra}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Sede Destino</label>
                    <select
                      value={formData.localId}
                      onChange={(e) => setFormData({ ...formData, localId: e.target.value })}
                      className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none"
                    >
                      <option value="1">Sede Centro (#1)</option>
                      <option value="2">Sede Norte (#2)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Insumo</label>
                    <select
                      value={formData.suministroId}
                      onChange={(e) => setFormData({ ...formData, suministroId: e.target.value })}
                      className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none"
                    >
                      <option value="1">🍉 Patilla Entera</option>
                      <option value="2">🥤 Vasos 16oz</option>
                      <option value="3">🥣 Vasos 24oz</option>
                      <option value="4">🔘 Tapas Domo</option>
                      <option value="5">🧊 Bolsa de Hielo</option>
                      <option value="6">🍬 Azúcar (Kg)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Cantidad Comprada</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      placeholder="Ej. 10"
                      value={formData.cantidad}
                      onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                      className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none focus:border-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Costo Total ($)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Ej. 75000"
                      value={formData.costoTotal}
                      onChange={(e) => setFormData({ ...formData, costoTotal: e.target.value })}
                      className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none focus:border-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Proveedor / Factura</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Frutas Don Pedro / Fac #1024"
                    value={formData.proveedor}
                    onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                    className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none focus:border-gray-400"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-patilla-border bg-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-patilla-primary hover:bg-patilla-primary-hover text-gray-800 font-bold rounded transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar y Sumar Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
