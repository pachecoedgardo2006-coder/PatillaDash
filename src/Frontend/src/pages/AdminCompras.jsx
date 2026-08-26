import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { comprasService, estadisticasService } from '../services/api';
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
  AlertTriangle,
  Building2,
  ChevronLeft,
  ChevronRight,
  PackagePlus,
  ArrowDownCircle
} from 'lucide-react';

export default function AdminCompras() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [compras, setCompras] = useState([]);
  const [insumosCriticos, setInsumosCriticos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAlertas, setLoadingAlertas] = useState(true);
  const [filtroLocal, setFiltroLocal] = useState('');
  const [error, setError] = useState('');

  // Paginación (10 items por página)
  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_POR_PAGINA = 10;

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

  // Cargar compras del historial
  const cargarCompras = async (localId) => {
    setLoading(true);
    setError('');
    try {
      const response = await comprasService.obtenerHistorial(localId ? Number(localId) : null);
      setCompras(response.data || []);
      setPaginaActual(1);
    } catch (err) {
      console.error('Error al cargar compras:', err);
      setError('No se pudo cargar el historial de compras.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar insumos críticos para la sección de reabastecimiento directo
  const cargarAlertasStock = async () => {
    setLoadingAlertas(true);
    try {
      const res = await estadisticasService.obtenerDashboard();
      setInsumosCriticos(res.data?.insumosEnAlerta || []);
    } catch (err) {
      console.error('Error al cargar alertas de stock:', err);
    } finally {
      setLoadingAlertas(false);
    }
  };

  useEffect(() => {
    cargarCompras(filtroLocal);
    cargarAlertasStock();
  }, [filtroLocal]);

  // Manejar apertura automática y prellenado desde URL params (ej. cuando se viene de Estadísticas)
  useEffect(() => {
    const localIdParam = searchParams.get('localId');
    const suministroIdParam = searchParams.get('suministroId');
    const autoOpen = searchParams.get('autoOpen');

    if (autoOpen === '1' || localIdParam || suministroIdParam) {
      setFormData(prev => ({
        ...prev,
        localId: localIdParam ? Number(localIdParam) : prev.localId,
        suministroId: suministroIdParam ? Number(suministroIdParam) : prev.suministroId,
      }));
      setIsModalOpen(true);
      // Limpiar los query params de la URL limpiamente
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Abrir modal pre-configurado para un insumo crítico específico
  const handleReabastecerInsumo = (item) => {
    setFormData({
      localId: item.localId || 1,
      suministroId: item.suministroId || 1,
      cantidad: '',
      costoTotal: '',
      proveedor: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Paginación calculada
  const totalPaginas = Math.ceil(compras.length / ITEMS_POR_PAGINA) || 1;
  const comprasPaginadas = compras.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

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
      // Recargar compras y actualizar alertas
      cargarCompras(filtroLocal);
      cargarAlertasStock();
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

  // Filtrar insumos críticos según la sede seleccionada en la vista
  const insumosCriticosFiltrados = filtroLocal 
    ? insumosCriticos.filter(i => i.localId === Number(filtroLocal))
    : insumosCriticos;

  return (
    <AdminLayout
      title="Compras y Reabastecimiento"
      subtitle="Registro de compras para aumentar automáticamente el stock en inventario"
      actionButton={
        <button
          onClick={() => {
            setFormData({ localId: filtroLocal ? Number(filtroLocal) : 1, suministroId: 1, cantidad: '', costoTotal: '', proveedor: '' });
            setIsModalOpen(true);
          }}
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

      {/* ============================================================ */}
      {/* SECCIÓN DINÁMICA: INSUMOS QUE REQUIEREN COMPRA URGENTE       */}
      {/* ============================================================ */}
      {insumosCriticosFiltrados.length > 0 && (
        <div className="bg-yellow-50/80 border border-yellow-200 rounded-2xl p-4 sm:p-5 mb-6 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-xl text-yellow-800">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-gray-900">
                  Insumos que Necesitan Reabastecimiento ({insumosCriticosFiltrados.length})
                </h3>
                <p className="text-xs text-gray-600">
                  Haz clic en cualquiera de estos insumos para abrir la compra prellenada
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {insumosCriticosFiltrados.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white border border-yellow-300/80 p-3.5 rounded-xl flex flex-col justify-between gap-2.5 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-gray-500 block">{item.nombreLocal}</span>
                    <h4 className="font-extrabold text-gray-800 text-sm">{item.nombreSuministro}</h4>
                  </div>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 border border-red-200 text-xs font-black rounded-lg shrink-0">
                    {item.cantidadDisponible} {item.unidadMedida}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[11px] text-gray-400 font-medium">
                    Mínimo: {item.stockMinimoAlerta} {item.unidadMedida}
                  </span>
                  <button
                    onClick={() => handleReabastecerInsumo(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-patilla-primary hover:bg-patilla-primary-hover text-gray-950 text-xs font-black rounded-lg transition-transform active:scale-95 cursor-pointer shadow-2xs"
                  >
                    <PackagePlus size={13} /> Comprar ahora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Resumen y Filtro de Sede */}
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
            className="flex-1 sm:flex-none p-2.5 border border-patilla-border rounded-xl text-xs sm:text-sm bg-patilla-bg outline-none font-bold text-gray-800 shadow-2xs"
          >
            <option value="">Todas las sedes</option>
            <option value="1">Sede Centro (#1)</option>
            <option value="2">Sede Norte (#2)</option>
          </select>
          <button
            onClick={() => { cargarCompras(filtroLocal); cargarAlertasStock(); }}
            disabled={loading}
            title="Recargar compras"
            className="p-2.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
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
                comprasPaginadas.map((c) => (
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

      {/* --- MODAL REGISTRAR COMPRA --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center z-[60] p-3 sm:p-4 overscroll-contain animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-patilla-border overscroll-contain">
            <div className="p-4 sm:p-5 border-b border-patilla-border flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                <ShoppingCart size={18} className="text-patilla-primary" /> Registrar Entrada de Insumo
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto overscroll-contain touch-pan-y flex-1">
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
                  className="px-4 py-2.5 text-xs font-bold bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 text-xs font-bold bg-patilla-primary hover:bg-patilla-primary-hover text-gray-900 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
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
