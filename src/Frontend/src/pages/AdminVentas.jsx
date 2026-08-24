import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { ventasService } from '../services/api';
import { 
  ReceiptText, 
  Search, 
  Eye, 
  X, 
  RefreshCw, 
  Calendar, 
  DollarSign, 
  Package, 
  ShoppingBag,
  MessageSquare,
  CreditCard,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  Scale
} from 'lucide-react';

export default function AdminVentas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroLocal, setFiltroLocal] = useState('');
  const [error, setError] = useState('');
  
  // Modal de Detalle
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cargarVentas = async (localId) => {
    setLoading(true);
    setError('');
    try {
      const response = await ventasService.obtenerHistorial(localId ? Number(localId) : null);
      setVentas(response.data || []);
    } catch (err) {
      console.error('Error al cargar ventas:', err);
      setError('No se pudo cargar el historial de ventas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVentas(filtroLocal);
  }, [filtroLocal]);

  const handleVerDetalle = (venta) => {
    setVentaSeleccionada(venta);
    setIsModalOpen(true);
  };

  const formatearDinero = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(monto || 0);
  };

  const totalVentas = ventas.reduce((acc, curr) => acc + (curr.totalGeneral || 0), 0);
  const totalEfectivo = ventas.reduce((acc, curr) => acc + (curr.totalEfectivo || 0), 0);
  const totalTransferencia = ventas.reduce((acc, curr) => acc + (curr.totalTransferencia || 0), 0);

  // Cálculos para el modal seleccionado
  const totalProductosVendidos = ventaSeleccionada?.detalles?.reduce((acc, curr) => acc + (curr.subtotal || 0), 0) || 0;
  const totalCajaReportado = ventaSeleccionada ? (ventaSeleccionada.totalGeneral || (ventaSeleccionada.totalEfectivo + ventaSeleccionada.totalTransferencia)) : 0;
  const diferenciaCuadre = totalCajaReportado - totalProductosVendidos;

  return (
    <AdminLayout
      title="Cierres de Ventas Diarias"
      subtitle="Auditoría y detalle de turnos, productos vendidos e insumos consumidos"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-patilla-border rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Ventas</p>
            <p className="text-2xl font-bold text-gray-800">{formatearDinero(totalVentas)}</p>
          </div>
          <div className="p-2.5 bg-patilla-secondary/40 rounded text-green-800">
            <DollarSign size={22} />
          </div>
        </div>

        <div className="bg-white border border-patilla-border rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Efectivo</p>
            <p className="text-xl font-bold text-gray-800">{formatearDinero(totalEfectivo)}</p>
          </div>
          <div className="p-2.5 bg-green-100 rounded text-green-700">
            <Banknote size={20} />
          </div>
        </div>

        <div className="bg-white border border-patilla-border rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Transferencias</p>
            <p className="text-xl font-bold text-gray-800">{formatearDinero(totalTransferencia)}</p>
          </div>
          <div className="p-2.5 bg-blue-100 rounded text-blue-700">
            <CreditCard size={20} />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-patilla-border rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
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
          <button
            onClick={() => cargarVentas(filtroLocal)}
            disabled={loading}
            title="Recargar ventas"
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <span className="text-xs text-gray-400 self-center">{ventas.length} cierres registrados</span>
      </div>

      {/* Tabla de Ventas */}
      <div className="bg-white border border-patilla-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-patilla-bg text-xs text-gray-500 uppercase">
                <th className="p-4 font-medium">Fecha y Hora</th>
                <th className="p-4 font-medium">Sede</th>
                <th className="p-4 font-medium">Vendedor</th>
                <th className="p-4 font-medium text-right">Efectivo</th>
                <th className="p-4 font-medium text-right">Transferencia</th>
                <th className="p-4 font-medium text-right">Total Turno</th>
                <th className="p-4 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-gray-400" />
                    Cargando ventas...
                  </td>
                </tr>
              ) : ventas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    <ReceiptText size={28} className="mx-auto mb-2 text-gray-300" />
                    No hay reportes de ventas en este periodo.
                  </td>
                </tr>
              ) : (
                ventas.map((v) => (
                  <tr key={v.id} className="border-b border-patilla-border hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="font-medium">
                          {new Date(v.fecha).toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-800">
                      {v.nombreLocal || `Local #${v.localId}`}
                    </td>
                    <td className="p-4 text-gray-600">
                      {v.nombreVendedor || `Vendedor #${v.vendedorId}`}
                    </td>
                    <td className="p-4 text-right text-gray-700">
                      {formatearDinero(v.totalEfectivo)}
                    </td>
                    <td className="p-4 text-right text-gray-700">
                      {formatearDinero(v.totalTransferencia)}
                    </td>
                    <td className="p-4 text-right font-bold text-gray-900">
                      {formatearDinero(v.totalGeneral)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleVerDetalle(v)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-patilla-primary/40 hover:bg-patilla-primary text-gray-800 text-xs font-semibold rounded transition-colors"
                      >
                        <Eye size={14} />
                        Detalles
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DETALLE DE VENTA --- */}
      {isModalOpen && ventaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-patilla-border flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <ReceiptText size={18} /> Auditoría de Cierre \u2014 Reporte #{ventaSeleccionada.id}
                </h3>
                <p className="text-xs text-gray-500">
                  {ventaSeleccionada.nombreLocal} • Vendedor: <strong>{ventaSeleccionada.nombreVendedor}</strong> • {new Date(ventaSeleccionada.fecha).toLocaleString('es-CO')}
                </p>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); setVentaSeleccionada(null); }}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Tarjetas Totales Reportados en Caja */}
              <div>
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Banknote size={15} className="text-green-700" /> Dinero Reportado en Caja
                </h4>
                <div className="grid grid-cols-3 gap-3 bg-patilla-bg p-3 rounded-lg border border-patilla-border">
                  <div className="text-center">
                    <span className="text-xs text-gray-500 block">Efectivo Físico</span>
                    <span className="font-bold text-gray-800 text-sm">
                      {formatearDinero(ventaSeleccionada.totalEfectivo)}
                    </span>
                  </div>
                  <div className="text-center border-x border-patilla-border">
                    <span className="text-xs text-gray-500 block">Transferencias (Nequi/Davi)</span>
                    <span className="font-bold text-gray-800 text-sm">
                      {formatearDinero(ventaSeleccionada.totalTransferencia)}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-500 block font-semibold">Total en Caja</span>
                    <span className="font-extrabold text-green-800 text-sm">
                      {formatearDinero(totalCajaReportado)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comparativa / Relación entre Caja y Productos */}
              <div className="p-3.5 bg-gray-50 border border-patilla-border rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5">
                    <Scale size={14} className="text-gray-500" /> Relación y Cuadre de Turno:
                  </span>
                  {diferenciaCuadre === 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full border border-green-300">
                      <CheckCircle2 size={13} /> Cuadre Perfecto ($0 de diferencia)
                    </span>
                  ) : diferenciaCuadre > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-300">
                      <CheckCircle2 size={13} /> Sobrante en caja (+{formatearDinero(diferenciaCuadre)})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-900 text-xs font-bold rounded-full border border-yellow-300">
                      <AlertTriangle size={13} /> Descuadre en caja (-{formatearDinero(Math.abs(diferenciaCuadre))})
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-200">
                  <div className="p-2 bg-white rounded border border-gray-200 flex justify-between items-center">
                    <span className="text-gray-500">Total según Caja:</span>
                    <strong className="text-gray-800">{formatearDinero(totalCajaReportado)}</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-gray-200 flex justify-between items-center">
                    <span className="text-gray-500">Total según Productos:</span>
                    <strong className="text-patilla-primary-hover font-bold">{formatearDinero(totalProductosVendidos)}</strong>
                  </div>
                </div>
              </div>

              {/* Productos Vendidos */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag size={15} className="text-patilla-primary" /> Productos Vendidos
                  </h4>
                  <span className="text-xs font-extrabold text-gray-800 bg-patilla-bg border border-patilla-border px-2.5 py-0.5 rounded">
                    Total Productos: {formatearDinero(totalProductosVendidos)}
                  </span>
                </div>

                {ventaSeleccionada.detalles && ventaSeleccionada.detalles.length > 0 ? (
                  <div className="border border-patilla-border rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-patilla-bg text-gray-500 uppercase">
                        <tr>
                          <th className="p-2.5 font-semibold">Producto</th>
                          <th className="p-2.5 text-center font-semibold">Cantidad</th>
                          <th className="p-2.5 text-right font-semibold">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ventaSeleccionada.detalles.map((d, i) => (
                          <tr key={i} className="border-t border-patilla-border">
                            <td className="p-2.5 font-medium text-gray-700">{d.nombreProducto}</td>
                            <td className="p-2.5 text-center font-bold text-gray-800">{d.cantidadVendida} uds</td>
                            <td className="p-2.5 text-right font-semibold text-gray-800">{formatearDinero(d.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No se discriminaron productos individuales.</p>
                )}
              </div>

              {/* Insumos Consumidos Declarados */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Package size={15} className="text-patilla-secondary" /> Insumos Declarados y Descontados de Stock
                </h4>
                {ventaSeleccionada.consumos && ventaSeleccionada.consumos.length > 0 ? (
                  <div className="border border-patilla-border rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-patilla-bg text-gray-500 uppercase">
                        <tr>
                          <th className="p-2.5 font-semibold">Insumo</th>
                          <th className="p-2.5 text-center font-semibold">Unidad</th>
                          <th className="p-2.5 text-right font-semibold">Cantidad Gastada</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ventaSeleccionada.consumos.map((c, i) => (
                          <tr key={i} className="border-t border-patilla-border">
                            <td className="p-2.5 font-medium text-gray-700">{c.nombreSuministro}</td>
                            <td className="p-2.5 text-center text-gray-500">{c.unidadMedida}</td>
                            <td className="p-2.5 text-right font-bold text-red-700">-{c.cantidadGastada}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No se declararon insumos en este reporte.</p>
                )}
              </div>

              {/* Observaciones y Notas */}
              {ventaSeleccionada.notas && (
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <MessageSquare size={15} className="text-gray-400" /> Novedades / Observaciones del Vendedor
                  </h4>
                  <div className="p-3 bg-patilla-bg border border-patilla-border rounded text-xs text-gray-700">
                    {ventaSeleccionada.notas}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-patilla-border bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setVentaSeleccionada(null); }}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
