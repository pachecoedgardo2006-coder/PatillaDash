import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { estadisticasService } from '../services/api';
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
  Building2
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const formatearDinero = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(monto || 0);
  };

  const totalGastos = (stats?.totalGastosCompras || 0) + (stats?.totalGastosNomina || 0);
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

  return (
    <AdminLayout
      title="Resumen Financiero"
      subtitle="Métricas consolidadas y alertas de stock de todos los locales"
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
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Ingresos */}
            <div className="bg-white border border-patilla-border p-5 rounded-2xl shadow-2xs">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Ingresos Totales</p>
                  <h3 className="text-2xl lg:text-3xl font-black text-gray-800">
                    {formatearDinero(stats?.totalIngresos)}
                  </h3>
                </div>
                <div className="p-3 bg-patilla-secondary/40 rounded-xl text-green-800 border border-green-200">
                  <TrendingUp size={22} />
                </div>
              </div>
              <p className="text-xs text-gray-400">Ventas totales acumuladas</p>
            </div>

            {/* Gastos */}
            <div className="bg-white border border-patilla-border p-5 rounded-2xl shadow-2xs">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Gastos (Compras + Nómina)</p>
                  <h3 className="text-2xl lg:text-3xl font-black text-gray-800">
                    {formatearDinero(totalGastos)}
                  </h3>
                </div>
                <div className="p-3 bg-patilla-primary/40 rounded-xl text-red-700 border border-red-200">
                  <DollarSign size={22} />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-patilla-border font-medium">
                <span>Compras: <strong className="text-gray-700">{formatearDinero(stats?.totalGastosCompras)}</strong></span>
                <span>Nómina: <strong className="text-gray-700">{formatearDinero(stats?.totalGastosNomina)}</strong></span>
              </div>
            </div>

            {/* Balance Neto */}
            <div className="bg-white border border-patilla-border p-5 rounded-2xl shadow-2xs sm:col-span-2 lg:col-span-1">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Balance Neto</p>
                  <h3 className={`text-2xl lg:text-3xl font-black ${
                    (stats?.balanceNeto || 0) >= 0 ? 'text-gray-800' : 'text-red-600'
                  }`}>
                    {formatearDinero(stats?.balanceNeto)}
                  </h3>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Margen neto estimado del negocio
              </p>
            </div>
          </div>

          {/* SECCIÓN ALERTAS DE STOCK CRÍTICO DIVIDIDO POR SEDE */}
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
                    <p className="text-xs text-gray-500">Separado por sede para reabastecimiento</p>
                  </div>
                </div>
                <Link
                  to="/admin/compras"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-bold text-gray-900 bg-patilla-primary hover:bg-patilla-primary-hover px-4 py-2.5 rounded-xl transition-colors shadow-2xs"
                >
                  <PackagePlus size={15} /> Surtir / Comprar
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
                              className="p-3 bg-white border border-yellow-200 rounded-xl flex items-center justify-between shadow-2xs"
                            >
                              <div className="pr-2">
                                <p className="font-bold text-gray-800 text-xs sm:text-sm">{item.nombreSuministro}</p>
                                <p className="text-[11px] text-gray-400">Mínimo: {item.stockMinimoAlerta} {item.unidadMedida}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="inline-block px-2.5 py-1 bg-red-100 text-red-800 border border-red-200 text-xs font-black rounded-lg">
                                  {item.cantidadDisponible} {item.unidadMedida}
                                </span>
                              </div>
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

          {/* Grillas de Información */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ranking de Locales */}
            <div className="bg-white border border-patilla-border rounded-2xl overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-patilla-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store size={18} className="text-gray-500" />
                  <h4 className="font-bold text-gray-800 text-sm sm:text-base">Ranking de Ventas por Sede</h4>
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

            {/* Desglose por Método de Pago */}
            <div className="bg-white border border-patilla-border rounded-2xl overflow-hidden shadow-2xs">
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
                  <span className="text-xs text-gray-600 font-bold bg-white px-2.5 py-1 rounded-lg border border-patilla-border">
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
                  <span className="text-xs text-gray-600 font-bold bg-white px-2.5 py-1 rounded-lg border border-patilla-border">
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
    </AdminLayout>
  );
}
