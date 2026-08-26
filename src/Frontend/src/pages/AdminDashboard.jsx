import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { estadisticasService, ventasService } from '../services/api';
import { 
  TrendingUp, 
  DollarSign, 
  Store, 
  CreditCard, 
  Banknote, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  PackagePlus, 
  ArrowRight, 
  Building2,
  BarChart3,
  ShoppingBag,
  ShoppingCart,
  Users,
  Filter,
  X,
  ArrowUpRight,
  PieChart
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estado del Modal de Business Intelligence (BI)
  const [isBiModalOpen, setIsBiModalOpen] = useState(false);
  const [ventasBi, setVentasBi] = useState([]);
  const [loadingBi, setLoadingBi] = useState(false);
  const [filtroBiLocal, setFiltroBiLocal] = useState('todos'); // 'todos' | '1' | '2'
  const [filtroBiPeriodo, setFiltroBiPeriodo] = useState('todos'); // 'todos' | '7dias' | '30dias'

  // Bloquear el scroll del fondo cuando el modal está abierto para evitar bugs en la barra inferior móvil
  useEffect(() => {
    if (isBiModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isBiModalOpen]);

  const cargarEstadisticas = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await estadisticasService.obtenerDashboard();
      setStats(response.data);
    } catch (err) {
      console.error('Error al cargar dashboard:', err);
      setError('No se pudieron cargar las estadísticas. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const abrirModalBi = async () => {
    setIsBiModalOpen(true);
    if (ventasBi.length === 0) {
      setLoadingBi(true);
      try {
        const res = await ventasService.obtenerHistorial();
        setVentasBi(res.data || []);
      } catch (err) {
        console.error('Error al cargar datos detallados de BI:', err);
      } finally {
        setLoadingBi(false);
      }
    }
  };

  const formatearDinero = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(monto || 0);
  };

  const totalGastosCompras = stats?.totalGastosCompras || 0;
  const totalGastosNomina = stats?.totalGastosNomina || 0;
  const totalGastos = totalGastosCompras + totalGastosNomina;

  const porcentajeCompras = totalGastos > 0 ? Math.round((totalGastosCompras / totalGastos) * 100) : 0;
  const porcentajeNomina = totalGastos > 0 ? Math.round((totalGastosNomina / totalGastos) * 100) : 0;

  const insumosAlerta = stats?.insumosEnAlerta || [];

  // Agrupación de Insumos Críticos por Sede / Local
  const alertasPorSede = insumosAlerta.reduce((acc, item) => {
    const key = item.localId || 'General';
    if (!acc[key]) {
      acc[key] = {
        localId: item.localId,
        nombreLocal: item.nombreLocal || `Local #${item.localId}`,
        items: []
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {});

  const sedesConAlerta = Object.values(alertasPorSede);

  // --- CÁLCULOS DE BUSINESS INTELLIGENCE (BI) EN TIEMPO REAL ---
  const ahora = new Date();
  const ventasFiltradasBi = ventasBi.filter(v => {
    // Filtro por Sede
    if (filtroBiLocal !== 'todos' && v.localId !== Number(filtroBiLocal)) {
      return false;
    }
    // Filtro por Periodo
    const fechaVenta = new Date(v.fecha);
    if (filtroBiPeriodo === '7dias') {
      const sieteDiasAtras = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (fechaVenta < sieteDiasAtras) return false;
    } else if (filtroBiPeriodo === '30dias') {
      const treintaDiasAtras = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (fechaVenta < treintaDiasAtras) return false;
    }
    return true;
  });

  const biTotalIngresos = ventasFiltradasBi.reduce((acc, v) => acc + (v.totalGeneral || 0), 0);
  const biTotalEfectivo = ventasFiltradasBi.reduce((acc, v) => acc + (v.totalEfectivo || 0), 0);
  const biTotalTransferencia = ventasFiltradasBi.reduce((acc, v) => acc + (v.totalTransferencia || 0), 0);
  const biTotalCierres = ventasFiltradasBi.length;
  const biTicketPromedio = biTotalCierres > 0 ? Math.round(biTotalIngresos / biTotalCierres) : 0;

  // Desglose por Productos
  const productosVendidosMap = {};
  ventasFiltradasBi.forEach(v => {
    (v.detalles || []).forEach(d => {
      const nombre = d.nombreProducto || `Producto #${d.productoId}`;
      if (!productosVendidosMap[nombre]) {
        productosVendidosMap[nombre] = { nombre, cantidad: 0, subtotal: 0 };
      }
      productosVendidosMap[nombre].cantidad += d.cantidadVendida;
      productosVendidosMap[nombre].subtotal += d.subtotal;
    });
  });

  const listaProductosBi = Object.values(productosVendidosMap).sort((a, b) => b.subtotal - a.subtotal);
  const biTotalUnidades = listaProductosBi.reduce((acc, p) => acc + p.cantidad, 0);

  // Desglose por Sedes para la gráfica
  const sedesMap = {};
  ventasFiltradasBi.forEach(v => {
    const nombre = v.nombreLocal || `Local #${v.localId}`;
    if (!sedesMap[nombre]) {
      sedesMap[nombre] = { nombre, total: 0, transacciones: 0 };
    }
    sedesMap[nombre].total += v.totalGeneral;
    sedesMap[nombre].transacciones += 1;
  });

  const listaSedesBi = Object.values(sedesMap).sort((a, b) => b.total - a.total);

  return (
    <AdminLayout
      title="Resumen Financiero y Estadísticas"
      subtitle="Métricas consolidadas, analítica de ventas y distribución de ingresos vs egresos"
      actionButton={
        <button
          onClick={cargarEstadisticas}
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 bg-white border border-patilla-border hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-2xs cursor-pointer active:scale-95"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Actualizar Datos
        </button>
      }
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm">
          {error}
        </div>
      )}

      {loading && !stats ? (
        <div className="py-20 text-center text-gray-400">
          <RefreshCw size={32} className="animate-spin mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium">Cargando métricas del negocio...</p>
        </div>
      ) : (
        <>
          {/* KPI CARDS: INGRESOS, GASTOS DE PRODUCTOS, NÓMINA Y BALANCE NETO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            
            {/* 1. Ingresos Totales (Analítica BI) */}
            <div 
              onClick={abrirModalBi}
              role="button"
              tabIndex={0}
              title="Haz clic para ver el análisis detallado de Business Intelligence"
              className="bg-white border border-patilla-border hover:border-green-300 p-5 rounded-2xl shadow-2xs cursor-pointer hover:shadow-md transition-all group relative overflow-hidden active:scale-98 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[11px] text-gray-500 font-extrabold uppercase tracking-wider mb-1">Ingresos Totales</p>
                    <h3 className="text-2xl lg:text-3xl font-black text-gray-800 transition-colors">
                      {formatearDinero(stats?.totalIngresos)}
                    </h3>
                  </div>
                  <div className="p-3 bg-patilla-secondary/40 group-hover:bg-patilla-secondary/70 rounded-xl text-green-800 border border-green-200 transition-colors">
                    <TrendingUp size={22} />
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-patilla-border flex items-center justify-between text-xs text-gray-500">
                <span>Ventas consolidadas</span>
                <span className="text-xs font-bold text-gray-700 group-hover:text-green-800 flex items-center gap-0.5 transition-colors shrink-0">
                  Ver analítica <ArrowUpRight size={13} />
                </span>
              </div>
            </div>

            {/* 2. Gastos de Productos / Insumos (Redirige a /admin/compras) */}
            <Link
              to="/admin/compras"
              title="Haz clic para ir al módulo de Compras y Reabastecimiento de insumos"
              className="bg-white border border-patilla-border hover:border-amber-300 p-5 rounded-2xl shadow-2xs cursor-pointer hover:shadow-md transition-all group relative overflow-hidden active:scale-98 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[11px] text-gray-500 font-extrabold uppercase tracking-wider mb-1">Gastos de Productos</p>
                    <h3 className="text-2xl lg:text-3xl font-black text-gray-800 transition-colors">
                      {formatearDinero(totalGastosCompras)}
                    </h3>
                  </div>
                  <div className="p-3 bg-amber-50 group-hover:bg-amber-100 rounded-xl text-amber-700 border border-amber-200 transition-colors">
                    <ShoppingCart size={22} />
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-patilla-border flex items-center justify-between text-xs text-gray-500">
                <span>{porcentajeCompras}% del total egresos</span>
                <span className="text-xs font-bold text-amber-800 group-hover:text-amber-950 flex items-center gap-0.5 transition-colors shrink-0">
                  Ver compras <ArrowUpRight size={13} />
                </span>
              </div>
            </Link>

            {/* 3. Gastos de Nómina / Personal (Redirige a /admin/pagos) */}
            <Link
              to="/admin/pagos"
              title="Haz clic para ir al módulo de Gestión de Pagos y Nómina de Personal"
              className="bg-white border border-patilla-border hover:border-blue-300 p-5 rounded-2xl shadow-2xs cursor-pointer hover:shadow-md transition-all group relative overflow-hidden active:scale-98 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[11px] text-gray-500 font-extrabold uppercase tracking-wider mb-1">Nómina y Personal</p>
                    <h3 className="text-2xl lg:text-3xl font-black text-gray-800 transition-colors">
                      {formatearDinero(totalGastosNomina)}
                    </h3>
                  </div>
                  <div className="p-3 bg-blue-50 group-hover:bg-blue-100 rounded-xl text-blue-700 border border-blue-200 transition-colors">
                    <Users size={22} />
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-patilla-border flex items-center justify-between text-xs text-gray-500">
                <span>{porcentajeNomina}% del total egresos</span>
                <span className="text-xs font-bold text-blue-800 group-hover:text-blue-950 flex items-center gap-0.5 transition-colors shrink-0">
                  Ver nómina <ArrowUpRight size={13} />
                </span>
              </div>
            </Link>

            {/* 4. Balance Neto */}
            <div className="bg-white border border-patilla-border p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[11px] text-gray-500 font-extrabold uppercase tracking-wider mb-1">Balance Neto</p>
                    <h3 className={`text-2xl lg:text-3xl font-black ${
                      (stats?.balanceNeto || 0) >= 0 ? 'text-gray-800' : 'text-red-600'
                    }`}>
                      {formatearDinero(stats?.balanceNeto)}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-xl border transition-colors ${
                    (stats?.balanceNeto || 0) >= 0 
                      ? 'bg-patilla-primary/40 text-gray-800 border-green-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    <DollarSign size={22} />
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-patilla-border flex items-center justify-between text-xs text-gray-500">
                <span>Total egresos:</span>
                <strong className="text-gray-800 font-black">{formatearDinero(totalGastos)}</strong>
              </div>
            </div>

          </div>

          {/* SECCIÓN ALERTAS DE STOCK CRÍTICO DIVIDIDO POR SEDE CON ACCESO DIRECTO A REABASTECIMIENTO */}
          <div className="mb-6">
            <div className="bg-white border border-patilla-border rounded-2xl overflow-hidden shadow-2xs">
              <div className="p-4 sm:p-5 border-b border-patilla-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-yellow-50/70">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-yellow-100 rounded-xl text-yellow-700">
                    <AlertTriangle size={19} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm sm:text-base">
                      Insumos en Stock Crítico ({insumosAlerta.length})
                    </h4>
                    <p className="text-xs text-gray-500">Separado por sede con acceso directo a reabastecer</p>
                  </div>
                </div>
                <Link
                  to="/admin/compras"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-bold text-gray-900 bg-patilla-primary hover:bg-patilla-primary-hover px-4 py-2.5 rounded-xl transition-colors shadow-2xs cursor-pointer active:scale-95"
                >
                  <PackagePlus size={15} /> Surtir Todo / Compras
                </Link>
              </div>

              <div className="p-4 sm:p-5">
                {insumosAlerta.length === 0 ? (
                  <div className="flex items-center gap-2.5 text-green-800 py-3 px-2">
                    <CheckCircle2 size={20} className="text-green-600 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold">
                      ¡Excelente! Todas las sedes cuentan con niveles óptimos de stock en todos sus insumos.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sedesConAlerta.map((sede) => (
                      <div key={sede.localId} className="border border-patilla-border rounded-xl p-4 bg-gray-50/70">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-bold text-gray-800 text-xs sm:text-sm flex items-center gap-2">
                            <Building2 size={16} className="text-gray-500" />
                            {sede.nombreLocal}
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[11px] font-bold rounded-full border border-yellow-300">
                              {sede.items.length} {sede.items.length === 1 ? 'crítico' : 'críticos'}
                            </span>
                          </h5>
                          <Link
                            to="/admin/inventario"
                            className="text-xs text-gray-500 hover:text-gray-800 font-bold flex items-center gap-1"
                          >
                            Ver inventario <ArrowRight size={12} />
                          </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {sede.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-white border border-yellow-200 rounded-xl flex flex-col justify-between gap-2 shadow-2xs"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-gray-800 text-xs sm:text-sm">{item.nombreSuministro}</p>
                                  <p className="text-[11px] text-gray-400">Mínimo: {item.stockMinimoAlerta} {item.unidadMedida}</p>
                                </div>
                                <span className="inline-block px-2 py-0.5 bg-red-100 text-red-800 border border-red-200 text-xs font-black rounded-lg">
                                  {item.cantidadDisponible} {item.unidadMedida}
                                </span>
                              </div>
                              <Link
                                to={`/admin/compras?localId=${sede.localId}&suministroId=${item.suministroId}&autoOpen=1`}
                                className="w-full text-center py-1.5 bg-patilla-primary/30 hover:bg-patilla-primary text-gray-900 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 active:scale-95"
                              >
                                <PackagePlus size={13} /> Surtir este insumo
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* GRILLAS DE INFORMACIÓN: RANKING SEDES, ESTRUCTURA DE GASTOS Y MÉTODOS DE PAGO */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* 1. Ranking de Locales */}
            <div className="bg-white border border-patilla-border rounded-2xl overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-patilla-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store size={18} className="text-gray-500" />
                  <h4 className="font-bold text-gray-800 text-sm sm:text-base">Ranking Ventas por Sede</h4>
                </div>
                <Link to="/admin/ventas" className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 font-bold">
                  Ver cierres <ArrowRight size={13} />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-patilla-bg text-[11px] text-gray-500 uppercase tracking-wider">
                      <th className="p-3.5 font-bold">Local</th>
                      <th className="p-3.5 font-bold text-right">Total Ventas</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {stats?.rankingLocales && stats.rankingLocales.length > 0 ? (
                      stats.rankingLocales.map((local, idx) => (
                        <tr key={local.localId || idx} className="border-b border-patilla-border last:border-0 hover:bg-gray-50">
                          <td className="p-3.5 font-medium text-gray-700">
                            <span className="inline-block w-6 text-gray-400 font-black">#{idx + 1}</span>
                            {local.nombreLocal || `Local #${local.localId}`}
                          </td>
                          <td className="p-3.5 text-right font-black text-gray-800">
                            {formatearDinero(local.totalVentas)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="p-6 text-center text-gray-400 text-sm">
                          No hay ventas registradas aún.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Estructura de Gastos: Productos vs Nómina */}
            <div className="bg-white border border-patilla-border rounded-2xl overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-patilla-border flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PieChart size={18} className="text-gray-500" />
                  <h4 className="font-bold text-gray-800 text-sm sm:text-base">Estructura de Gastos</h4>
                </div>
                <span className="text-xs font-black text-gray-700">
                  Total: {formatearDinero(totalGastos)}
                </span>
              </div>

              <div className="p-4 sm:p-5 space-y-3">
                {/* Barra combinada comparativa si totalGastos > 0 */}
                {totalGastos > 0 && (
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex shadow-2xs mb-1">
                    <div 
                      className="h-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${porcentajeCompras}%` }}
                      title={`Compras productos: ${formatearDinero(totalGastosCompras)} (${porcentajeCompras}%)`}
                    />
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${porcentajeNomina}%` }}
                      title={`Nómina personal: ${formatearDinero(totalGastosNomina)} (${porcentajeNomina}%)`}
                    />
                  </div>
                )}

                {/* Fila Gastos de Productos */}
                <Link
                  to="/admin/compras"
                  title="Haz clic para ir a Compras y Entradas de insumos"
                  className="p-3.5 bg-patilla-bg border border-patilla-border hover:border-amber-300 rounded-xl flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-xl group-hover:bg-amber-200 transition-colors">
                      <ShoppingCart size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 uppercase font-bold flex items-center gap-1">
                        Insumos y Productos
                        <ArrowUpRight size={12} className="text-gray-400 group-hover:text-amber-700 transition-colors" />
                      </p>
                      <p className="text-base font-black text-gray-800">
                        {formatearDinero(totalGastosCompras)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-amber-900 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    {porcentajeCompras}%
                  </span>
                </Link>

                {/* Fila Gastos de Nómina */}
                <Link
                  to="/admin/pagos"
                  title="Haz clic para ir a Gestión de Pagos a Personal"
                  className="p-3.5 bg-patilla-bg border border-patilla-border hover:border-blue-300 rounded-xl flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-xl group-hover:bg-blue-200 transition-colors">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 uppercase font-bold flex items-center gap-1">
                        Nómina de Personal
                        <ArrowUpRight size={12} className="text-gray-400 group-hover:text-blue-700 transition-colors" />
                      </p>
                      <p className="text-base font-black text-gray-800">
                        {formatearDinero(totalGastosNomina)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-blue-900 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    {porcentajeNomina}%
                  </span>
                </Link>
              </div>
            </div>

            {/* 3. Desglose por Método de Pago */}
            <div className="bg-white border border-patilla-border rounded-2xl overflow-hidden shadow-2xs md:col-span-2 xl:col-span-1">
              <div className="p-4 border-b border-patilla-border flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-gray-500" />
                  <h4 className="font-bold text-gray-800 text-sm sm:text-base">Métodos de Pago</h4>
                </div>
                {stats?.metodoPagoPredominante && (
                  <span className="text-xs bg-patilla-bg border border-patilla-border px-2.5 py-1 rounded-full font-bold text-gray-700">
                    {stats.metodoPagoPredominante}
                  </span>
                )}
              </div>
              <div className="p-4 sm:p-5 space-y-3">
                <div className="p-3.5 bg-patilla-bg border border-patilla-border rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 text-green-700 rounded-xl">
                      <Banknote size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 uppercase font-bold">Efectivo en Caja</p>
                      <p className="text-base sm:text-lg font-black text-gray-800">
                        {formatearDinero(stats?.ventasMetodoPago?.totalEfectivo)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 font-bold bg-white px-2.5 py-1 rounded-lg border border-patilla-border font-mono">
                    {stats?.totalIngresos > 0 
                      ? `${Math.round(((stats.ventasMetodoPago?.totalEfectivo || 0) / stats.totalIngresos) * 100)}%` 
                      : '0%'}
                  </span>
                </div>

                <div className="p-3.5 bg-patilla-bg border border-patilla-border rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 uppercase font-bold">Transferencias (Nequi / Davi)</p>
                      <p className="text-base sm:text-lg font-black text-gray-800">
                        {formatearDinero(stats?.ventasMetodoPago?.totalTransferencia)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 font-bold bg-white px-2.5 py-1 rounded-lg border border-patilla-border font-mono">
                    {stats?.totalIngresos > 0 
                      ? `${Math.round(((stats.ventasMetodoPago?.totalTransferencia || 0) / stats.totalIngresos) * 100)}%` 
                      : '0%'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* MODAL BUSINESS INTELLIGENCE (BI) & ANALÍTICA DE VENTAS      */}
      {/* ============================================================ */}
      {isBiModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center z-[60] p-3 sm:p-5 overscroll-contain animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[94vh] flex flex-col border border-patilla-border overscroll-contain">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-patilla-border bg-gradient-to-r from-patilla-bg via-white to-patilla-bg flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-patilla-primary rounded-2xl text-gray-950 shadow-2xs">
                  <BarChart3 size={22} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-base sm:text-lg tracking-tight flex items-center gap-1.5">
                    Business Intelligence — Análisis de Ingresos
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Analítica visual de rendimiento por sedes, productos más vendidos y flujos de caja
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBiModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Cerrar modal BI"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body with Touch Overscroll Containment */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 overscroll-contain touch-pan-y flex-1">
              
              {/* FILTROS INTERACTIVOS BI */}
              <div className="bg-gray-50 border border-patilla-border p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-500" />
                  <span className="text-xs font-bold text-gray-700">Filtros de BI:</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Selector de Sede */}
                  <select
                    value={filtroBiLocal}
                    onChange={(e) => setFiltroBiLocal(e.target.value)}
                    className="p-2 bg-white border border-patilla-border rounded-xl text-xs font-bold text-gray-800 outline-none shadow-2xs"
                  >
                    <option value="todos">Todas las Sedes</option>
                    <option value="1">Sede Centro (#1)</option>
                    <option value="2">Sede Norte (#2)</option>
                  </select>

                  {/* Selector de Rango */}
                  <div className="flex items-center bg-white border border-patilla-border rounded-xl p-0.5 shadow-2xs">
                    <button
                      onClick={() => setFiltroBiPeriodo('todos')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        filtroBiPeriodo === 'todos' ? 'bg-patilla-primary text-gray-900' : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      Histórico
                    </button>
                    <button
                      onClick={() => setFiltroBiPeriodo('30dias')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        filtroBiPeriodo === '30dias' ? 'bg-patilla-primary text-gray-900' : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      30 días
                    </button>
                    <button
                      onClick={() => setFiltroBiPeriodo('7dias')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        filtroBiPeriodo === '7dias' ? 'bg-patilla-primary text-gray-900' : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      7 días
                    </button>
                  </div>
                </div>
              </div>

              {loadingBi ? (
                <div className="py-16 text-center text-gray-400">
                  <RefreshCw size={28} className="animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-xs font-semibold">Generando métricas y analítica avanzada...</p>
                </div>
              ) : (
                <>
                  {/* KPIs RÁPIDOS FILTRADOS */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-patilla-bg border border-patilla-border p-3.5 rounded-2xl">
                      <span className="text-[10px] font-extrabold uppercase text-gray-500 block">Ingresos Filtrados</span>
                      <span className="text-lg sm:text-xl font-black text-gray-900">{formatearDinero(biTotalIngresos)}</span>
                    </div>

                    <div className="bg-patilla-bg border border-patilla-border p-3.5 rounded-2xl">
                      <span className="text-[10px] font-extrabold uppercase text-gray-500 block">Ticket Promedio / Turno</span>
                      <span className="text-lg sm:text-xl font-black text-gray-900">{formatearDinero(biTicketPromedio)}</span>
                    </div>

                    <div className="bg-patilla-bg border border-patilla-border p-3.5 rounded-2xl">
                      <span className="text-[10px] font-extrabold uppercase text-gray-500 block">Total Bebidas Servidas</span>
                      <span className="text-lg sm:text-xl font-black text-patilla-primary-hover">{biTotalUnidades} uds</span>
                    </div>

                    <div className="bg-patilla-bg border border-patilla-border p-3.5 rounded-2xl">
                      <span className="text-[10px] font-extrabold uppercase text-gray-500 block">Turnos Auditados</span>
                      <span className="text-lg sm:text-xl font-black text-gray-900">{biTotalCierres}</span>
                    </div>
                  </div>

                  {/* GRÁFICAS Y ANALÍTICA */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* GRÁFICA 1: PARTICIPACIÓN POR SEDE */}
                    <div className="border border-patilla-border rounded-2xl p-4 bg-white shadow-2xs">
                      <div className="flex items-center justify-between mb-3.5">
                        <h4 className="font-bold text-gray-800 text-xs sm:text-sm flex items-center gap-2">
                          <Store size={16} className="text-patilla-secondary" /> Ventas por Local / Sede
                        </h4>
                        <span className="text-[11px] text-gray-400 font-semibold">% de facturación</span>
                      </div>

                      <div className="space-y-3">
                        {listaSedesBi.length === 0 ? (
                          <p className="text-xs text-gray-400 py-6 text-center">No hay datos en el periodo seleccionado.</p>
                        ) : (
                          listaSedesBi.map((sede, idx) => {
                            const porcentaje = biTotalIngresos > 0 ? Math.round((sede.total / biTotalIngresos) * 100) : 0;
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold text-gray-700">
                                  <span>{sede.nombre} ({sede.transacciones} turnos)</span>
                                  <span className="font-black text-gray-900">{formatearDinero(sede.total)} <strong className="text-gray-500">({porcentaje}%)</strong></span>
                                </div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                                  <div 
                                    className="h-full bg-patilla-secondary transition-all duration-500 rounded-full"
                                    style={{ width: `${porcentaje}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* GRÁFICA 2: PRODUCTOS MÁS VENDIDOS */}
                    <div className="border border-patilla-border rounded-2xl p-4 bg-white shadow-2xs">
                      <div className="flex items-center justify-between mb-3.5">
                        <h4 className="font-bold text-gray-800 text-xs sm:text-sm flex items-center gap-2">
                          <ShoppingBag size={16} className="text-patilla-primary" /> Productos Más Vendidos
                        </h4>
                        <span className="text-[11px] text-gray-400 font-semibold">Unidades & Ingresos</span>
                      </div>

                      <div className="space-y-3">
                        {listaProductosBi.length === 0 ? (
                          <p className="text-xs text-gray-400 py-6 text-center">No hay productos registrados en el periodo.</p>
                        ) : (
                          listaProductosBi.map((prod, idx) => {
                            const porcentaje = biTotalIngresos > 0 ? Math.round((prod.subtotal / biTotalIngresos) * 100) : 0;
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold text-gray-700">
                                  <span className="truncate max-w-[180px]">{prod.nombre} ({prod.cantidad} uds)</span>
                                  <span className="font-black text-gray-900">{formatearDinero(prod.subtotal)} <strong className="text-gray-500">({porcentaje}%)</strong></span>
                                </div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                                  <div 
                                    className="h-full bg-patilla-primary transition-all duration-500 rounded-full"
                                    style={{ width: `${porcentaje}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                  </div>

                  {/* PROPORCIÓN DE MEDIOS DE PAGO */}
                  <div className="border border-patilla-border rounded-2xl p-4 bg-gray-50">
                    <h4 className="font-bold text-gray-800 text-xs sm:text-sm mb-2 flex items-center gap-2">
                      <CreditCard size={16} className="text-blue-600" /> Distribución de Medios de Pago
                    </h4>
                    
                    {biTotalIngresos > 0 && (
                      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex mb-2.5 shadow-2xs">
                        <div 
                          className="h-full bg-green-500 transition-all duration-500"
                          style={{ width: `${Math.round((biTotalEfectivo / biTotalIngresos) * 100)}%` }}
                          title={`Efectivo: ${formatearDinero(biTotalEfectivo)}`}
                        ></div>
                        <div 
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${Math.round((biTotalTransferencia / biTotalIngresos) * 100)}%` }}
                          title={`Transferencia: ${formatearDinero(biTotalTransferencia)}`}
                        ></div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 bg-white border border-patilla-border rounded-xl flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-green-800">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Efectivo:
                        </span>
                        <strong className="text-gray-900">{formatearDinero(biTotalEfectivo)} ({biTotalIngresos > 0 ? Math.round((biTotalEfectivo / biTotalIngresos) * 100) : 0}%)</strong>
                      </div>
                      <div className="p-2.5 bg-white border border-patilla-border rounded-xl flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-blue-800">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Transferencias:
                        </span>
                        <strong className="text-gray-900">{formatearDinero(biTotalTransferencia)} ({biTotalIngresos > 0 ? Math.round((biTotalTransferencia / biTotalIngresos) * 100) : 0}%)</strong>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-patilla-border bg-gray-50 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsBiModalOpen(false)}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar Analítica
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
