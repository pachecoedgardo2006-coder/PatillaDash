import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { ventasService } from '../services/api';
import { formatearFecha } from '../utils/fechas';
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
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const cargarVentas = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ventasService.obtenerTodas(filtroLocal ? Number(filtroLocal) : undefined);
      setVentas(res.data || []);
      setPaginaActual(1);
    } catch (err) {
      console.error('Error al cargar ventas:', err);
      setError('Error al cargar el historial de ventas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, [filtroLocal]);

  const formatearDinero = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(monto || 0);
  };

  const handleVerDetalle = (venta) => {
    setVentaSeleccionada(venta);
    setIsModalOpen(true);
  };

  // Métricas generales
  const totalCajaGlobal = ventas.reduce((acc, v) => acc + (v.totalGeneral || 0), 0);
  const totalEfectivoGlobal = ventas.reduce((acc, v) => acc + (v.totalEfectivo || 0), 0);
  const totalTransfGlobal = ventas.reduce((acc, v) => acc + (v.totalTransferencia || 0), 0);

  // Cálculos para el modal de detalle auditado
  const totalCajaReportado = ventaSeleccionada 
    ? (Number(ventaSeleccionada.totalEfectivo) || 0) + (Number(ventaSeleccionada.totalTransferencia) || 0)
    : 0;

  const totalProductosVendidos = ventaSeleccionada?.detalles?.reduce(
    (acc, d) => acc + (Number(d.subtotal) || 0), 
    0
  ) || 0;

  const diferenciaCuadre = totalCajaReportado - totalProductosVendidos;

  // Lógica de Paginación
  const totalPaginas = Math.ceil(ventas.length / ITEMS_POR_PAGINA) || 1;
  const ventasPaginadas = ventas.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  return (
    <AdminLayout>
      {/* Header & Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ReceiptText className="text-patilla-primary" /> Historial de Turnos y Ventas Diarias
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Control integral de cierres de caja y auditoría por punto de venta
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-white border border-patilla-border px-3 py-2 rounded-xl flex-1 sm:flex-initial">
            <Building2 size={16} className="text-gray-400" />
            <select
              value={filtroLocal}
              onChange={(e) => setFiltroLocal(e.target.value)}
              className="text-xs font-semibold bg-transparent outline-none cursor-pointer text-gray-700 w-full"
            >
              <option value="">Todas las Sedes</option>
              <option value="1">Punto de la 30</option>
              <option value="2">Punto de la 27</option>
            </select>
          </div>

          <button
            onClick={cargarVentas}
            disabled={loading}
            className="p-2.5 bg-white border border-patilla-border hover:bg-gray-50 text-gray-700 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center justify-center font-bold text-xs"
            title="Recargar ventas"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white border border-patilla-border p-4 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Total Recaudado</span>
            <span className="text-xl sm:text-2xl font-black text-gray-800">{formatearDinero(totalCajaGlobal)}</span>
          </div>
          <div className="p-3 bg-green-50 text-green-700 rounded-xl">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="bg-white border border-patilla-border p-4 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Total en Efectivo</span>
            <span className="text-xl sm:text-2xl font-black text-green-700">{formatearDinero(totalEfectivoGlobal)}</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Banknote size={22} />
          </div>
        </div>

        <div className="bg-white border border-patilla-border p-4 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Total Transferencias</span>
            <span className="text-xl sm:text-2xl font-black text-blue-700">{formatearDinero(totalTransfGlobal)}</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <CreditCard size={22} />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold mb-6 flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabla Registros */}
      <div className="bg-white border border-patilla-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-patilla-border flex items-center justify-between bg-gray-50/50">
          <h2 className="font-bold text-gray-800 text-sm sm:text-base">
            Cierres Registrados ({ventas.length})
          </h2>
          <span className="text-xs text-gray-500 font-semibold">
            Página {paginaActual} de {totalPaginas}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-patilla-border bg-patilla-bg/60 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5">Sede</th>
                <th className="p-3.5">Vendedor</th>
                <th className="p-3.5 text-right">Efectivo</th>
                <th className="p-3.5 text-right">Transferencia</th>
                <th className="p-3.5 text-right">Total Turno</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-gray-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
                    Cargando ventas...
                  </td>
                </tr>
              ) : ventas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-gray-400">
                    No se encontraron registros de ventas.
                  </td>
                </tr>
              ) : (
                ventasPaginadas.map((v) => (
                  <tr key={v.id} className="border-b border-patilla-border hover:bg-gray-50 transition-colors">
                    <td className="p-3.5 text-gray-600 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{formatearFecha(v.fecha)}</span>
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
        <div onClick={(e) => { if (e.target === e.currentTarget) { setIsModalOpen(false); setVentaSeleccionada(null); } }} className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center z-[60] p-3 sm:p-4 overscroll-contain animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-patilla-border overscroll-contain">
            <div className="p-4 sm:p-5 border-b border-patilla-border flex justify-between items-center bg-gray-50 shrink-0">
              <div>
                <h3 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                  <ReceiptText size={18} className="text-patilla-primary" /> Auditoría de Cierre — Reporte #{ventaSeleccionada.id}
                </h3>
                <p className="text-[11px] text-gray-500">
                  {ventaSeleccionada.nombreLocal} • Vendedor: <strong>{ventaSeleccionada.nombreVendedor}</strong> • {formatearFecha(ventaSeleccionada.fecha)}
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
