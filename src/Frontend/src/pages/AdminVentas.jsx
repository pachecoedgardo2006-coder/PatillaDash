import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { ventasService } from '../services/api';
import { 
  ReceiptText, 
  RefreshCw, 
  Calendar, 
  DollarSign, 
  Eye, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Banknote,
  CreditCard,
  ShoppingBag,
  Package,
  MessageSquare,
  Scale
} from 'lucide-react';

export default function AdminVentas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroLocal, setFiltroLocal] = useState('');
  const [error, setError] = useState('');

  // Paginación (10 items por página)
  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_POR_PAGINA = 10;
  
  // Modal de Detalle
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Bloqueo de scroll del fondo cuando el modal está abierto para evitar bugs en la barra móvil
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const cargarVentas = async (localId) => {
    setLoading(true);
    setError('');
    try {
      const response = await ventasService.obtenerHistorial(localId ? Number(localId) : null);
      setVentas(response.data || []);
      setPaginaActual(1);
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

  // Paginación calculada
  const totalPaginas = Math.ceil(ventas.length / ITEMS_POR_PAGINA) || 1;
  const ventasPaginadas = ventas.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

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
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-patilla-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Total Recaudado</p>
            <p className="text-xl sm:text-2xl font-black text-gray-800">{formatearDinero(totalVentas)}</p>
          </div>
          <div className="p-3 bg-patilla-secondary/40 rounded-xl text-green-800">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="bg-white border border-patilla-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Efectivo en Caja</p>
            <p className="text-xl sm:text-2xl font-black text-gray-800">{formatearDinero(totalEfectivo)}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-xl text-green-700 border border-green-200">
            <Banknote size={22} />
          </div>
        </div>

        <div className="bg-white border border-patilla-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Transferencias</p>
            <p className="text-xl sm:text-2xl font-black text-gray-800">{formatearDinero(totalTransferencia)}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-700 border border-blue-200">
            <CreditCard size={22} />
          </div>
        </div>
      </div>

      {/* Filtro por Sede */}
      <div className="bg-white border border-patilla-border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <ReceiptText size={18} className="text-gray-500" />
          <h3 className="font-bold text-gray-800 text-sm sm:text-base">Historial de Cierres de Turno</h3>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-gray-700 shrink-0">Filtrar Sede:</label>
          <select
            value={filtroLocal}
            onChange={(e) => setFiltroLocal(e.target.value)}
            className="flex-1 sm:flex-none p-2.5 border border-patilla-border rounded-xl text-xs sm:text-sm bg-patilla-bg outline-none font-bold text-gray-800 shadow-2xs"
          >
            <option value="">Todas las sedes</option>
            <option value="1">Sede Centro (#1)</option>
            <option value="2">Sede Norte (#2)</option>
          </select>
          <button
            onClick={() => cargarVentas(filtroLocal)}
            disabled={loading}
            title="Recargar ventas"
            className="p-2.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tabla Responsiva de Cierres */}
      <div className="bg-white border border-patilla-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="bg-patilla-bg text-[11px] text-gray-500 uppercase tracking-wider">
                <th className="p-3.5 font-bold">Fecha</th>
                <th className="p-3.5 font-bold">Sede</th>
                <th className="p-3.5 font-bold">Vendedor</th>
                <th className="p-3.5 font-bold text-right">Efectivo</th>
                <th className="p-3.5 font-bold text-right">Transferencia</th>
                <th className="p-3.5 font-bold text-right">Total Turno</th>
                <th className="p-3.5 font-bold text-center">Auditoría</th>
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
                    No hay ventas registradas en este local.
                  </td>
                </tr>
              ) : (
                ventasPaginadas.map((v) => (
                  <tr key={v.id} className="border-b border-patilla-border hover:bg-gray-50 transition-colors">
                    <td className="p-3.5 text-gray-600 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{new Date(v.fecha).toLocaleDateString('es-CO')}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-gray-800 text-xs sm:text-sm">{v.nombreLocal}</td>
                    <td className="p-3.5 text-gray-700 text-xs font-semibold">{v.nombreVendedor}</td>
                    <td className="p-3.5 text-right font-medium text-gray-700 text-xs">{formatearDinero(v.totalEfectivo)}</td>
                    <td className="p-3.5 text-right font-medium text-gray-700 text-xs">{formatearDinero(v.totalTransferencia)}</td>
                    <td className="p-3.5 text-right font-black text-gray-900 text-xs sm:text-sm">
                      {formatearDinero(v.totalGeneral)}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleVerDetalle(v)}
                        className="p-1.5 sm:px-3 sm:py-1.5 bg-patilla-primary/30 hover:bg-patilla-primary text-gray-900 font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1 active:scale-95 cursor-pointer shadow-2xs"
                      >
                        <Eye size={14} />
                        <span className="hidden sm:inline">Ver Detalle</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="p-4 border-t border-patilla-border flex items-center justify-between bg-gray-50/70">
            <button
              onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
              disabled={paginaActual === 1}
              className="px-3.5 py-2 text-xs font-bold bg-white border border-patilla-border rounded-xl text-gray-700 disabled:opacity-40 hover:bg-gray-100 flex items-center gap-1.5 active:scale-95 transition-all shadow-2xs cursor-pointer"
            >
              <ChevronLeft size={14} /> Anterior
            </button>

            <span className="text-xs text-gray-600 font-bold">
              Página {paginaActual} de {totalPaginas}
            </span>

            <button
              onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
              disabled={paginaActual === totalPaginas}
              className="px-3.5 py-2 text-xs font-bold bg-white border border-patilla-border rounded-xl text-gray-700 disabled:opacity-40 hover:bg-gray-100 flex items-center gap-1.5 active:scale-95 transition-all shadow-2xs cursor-pointer"
            >
              Siguiente <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* --- MODAL DETALLE DE VENTA --- */}
      {isModalOpen && ventaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center z-[60] p-3 sm:p-4 overscroll-contain animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-patilla-border overscroll-contain">
            <div className="p-4 sm:p-5 border-b border-patilla-border flex justify-between items-center bg-gray-50 shrink-0">
              <div>
                <h3 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                  <ReceiptText size={18} className="text-patilla-primary" /> Auditoría de Cierre — Reporte #{ventaSeleccionada.id}
                </h3>
                <p className="text-[11px] text-gray-500">
                  {ventaSeleccionada.nombreLocal} • Vendedor: <strong>{ventaSeleccionada.nombreVendedor}</strong> • {new Date(ventaSeleccionada.fecha).toLocaleDateString('es-CO')}
                </p>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); setVentaSeleccionada(null); }}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5 overflow-y-auto overscroll-contain touch-pan-y flex-1">
              {/* Tarjetas Totales Reportados en Caja */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Banknote size={15} className="text-green-700" /> Dinero Reportado en Caja
                </h4>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-patilla-bg p-3 rounded-xl border border-patilla-border">
                  <div className="text-center">
                    <span className="text-[10px] sm:text-xs text-gray-500 block font-medium">Efectivo</span>
                    <span className="font-black text-gray-800 text-xs sm:text-sm">
                      {formatearDinero(ventaSeleccionada.totalEfectivo)}
                    </span>
                  </div>
                  <div className="text-center border-x border-patilla-border">
                    <span className="text-[10px] sm:text-xs text-gray-500 block font-medium">Transferencia</span>
                    <span className="font-black text-gray-800 text-xs sm:text-sm">
                      {formatearDinero(ventaSeleccionada.totalTransferencia)}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] sm:text-xs text-gray-500 block font-bold">Total Caja</span>
                    <span className="font-black text-green-800 text-xs sm:text-sm">
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
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 text-[11px] font-black rounded-full border border-green-300">
                      <CheckCircle2 size={13} /> Cuadre Perfecto ($0)
                    </span>
                  ) : diferenciaCuadre > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 text-[11px] font-black rounded-full border border-blue-300">
                      <CheckCircle2 size={13} /> Sobrante (+{formatearDinero(diferenciaCuadre)})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-900 text-[11px] font-black rounded-full border border-yellow-300">
                      <AlertTriangle size={13} /> Descuadre (-{formatearDinero(Math.abs(diferenciaCuadre))})
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-200">
                  <div className="p-2 bg-white rounded-lg border border-gray-200 flex justify-between items-center">
                    <span className="text-gray-500 text-[11px]">Según Caja:</span>
                    <strong className="text-gray-800">{formatearDinero(totalCajaReportado)}</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-gray-200 flex justify-between items-center">
                    <span className="text-gray-500 text-[11px]">Según Prod:</span>
                    <strong className="text-patilla-primary-hover font-bold">{formatearDinero(totalProductosVendidos)}</strong>
                  </div>
                </div>
              </div>

              {/* Productos Vendidos */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag size={15} className="text-patilla-primary" /> Productos Vendidos
                  </h4>
                  <span className="text-xs font-black text-gray-800 bg-patilla-bg border border-patilla-border px-2 py-0.5 rounded-lg">
                    Total: {formatearDinero(totalProductosVendidos)}
                  </span>
                </div>

                {ventaSeleccionada.detalles && ventaSeleccionada.detalles.length > 0 ? (
                  <div className="border border-patilla-border rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-patilla-bg text-gray-500 uppercase">
                        <tr>
                          <th className="p-2.5 font-bold">Producto</th>
                          <th className="p-2.5 text-center font-bold">Cantidad</th>
                          <th className="p-2.5 text-right font-bold">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ventaSeleccionada.detalles.map((d, i) => (
                          <tr key={i} className="border-t border-patilla-border">
                            <td className="p-2.5 font-semibold text-gray-800">{d.nombreProducto}</td>
                            <td className="p-2.5 text-center font-bold text-gray-700">{d.cantidadVendida} uds</td>
                            <td className="p-2.5 text-right font-bold text-gray-800">{formatearDinero(d.subtotal)}</td>
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
                <h4 className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Package size={15} className="text-patilla-secondary" /> Insumos Declarados
                </h4>
                {ventaSeleccionada.consumos && ventaSeleccionada.consumos.length > 0 ? (
                  <div className="border border-patilla-border rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-patilla-bg text-gray-500 uppercase">
                        <tr>
                          <th className="p-2.5 font-bold">Insumo</th>
                          <th className="p-2.5 text-center font-bold">Unidad</th>
                          <th className="p-2.5 text-right font-bold">Consumo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ventaSeleccionada.consumos.map((c, i) => (
                          <tr key={i} className="border-t border-patilla-border">
                            <td className="p-2.5 font-semibold text-gray-800">{c.nombreSuministro}</td>
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
                  <h4 className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <MessageSquare size={15} className="text-gray-400" /> Observaciones
                  </h4>
                  <div className="p-3 bg-patilla-bg border border-patilla-border rounded-xl text-xs text-gray-700">
                    {ventaSeleccionada.notas}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-patilla-border bg-gray-50 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setVentaSeleccionada(null); }}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition-colors cursor-pointer"
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
