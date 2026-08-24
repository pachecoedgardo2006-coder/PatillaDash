import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { estadisticasService } from '../services/api';
import { TrendingUp, DollarSign, Store, CreditCard, Banknote, RefreshCw } from 'lucide-react';

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

  return (
    <AdminLayout
      title="Resumen Financiero"
      subtitle="Métricas consolidadas de todos los locales"
      actionButton={
        <button
          onClick={cargarEstadisticas}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-patilla-border hover:bg-gray-50 text-gray-700 text-sm font-medium rounded transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      }
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading && !stats ? (
        <div className="py-20 text-center text-gray-400">
          <RefreshCw size={32} className="animate-spin mx-auto mb-3 text-gray-400" />
          <p className="text-sm">Cargando métricas financieras...</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Ingresos */}
            <div className="bg-white border border-patilla-border p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ingresos Totales</p>
                  <h3 className="text-3xl font-bold text-gray-800">
                    {formatearDinero(stats?.totalIngresos)}
                  </h3>
                </div>
                <div className="p-3 bg-patilla-secondary bg-opacity-30 rounded text-green-700 border border-green-200">
                  <TrendingUp size={24} />
                </div>
              </div>
              <p className="text-xs text-gray-400">Ventas totales acumuladas</p>
            </div>

            {/* Gastos */}
            <div className="bg-white border border-patilla-border p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Gastos (Compras + Nómina)</p>
                  <h3 className="text-3xl font-bold text-gray-800">
                    {formatearDinero(totalGastos)}
                  </h3>
                </div>
                <div className="p-3 bg-patilla-primary bg-opacity-30 rounded text-red-700 border border-red-200">
                  <DollarSign size={24} />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 pt-1 border-t border-patilla-border">
                <span>Compras: {formatearDinero(stats?.totalGastosCompras)}</span>
                <span>Nómina: {formatearDinero(stats?.totalGastosNomina)}</span>
              </div>
            </div>

            {/* Balance Neto */}
            <div className="bg-white border border-patilla-border p-6 rounded-lg bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Balance Neto</p>
                  <h3 className={`text-3xl font-bold ${
                    (stats?.balanceNeto || 0) >= 0 ? 'text-gray-800' : 'text-red-600'
                  }`}>
                    {formatearDinero(stats?.balanceNeto)}
                  </h3>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Margen neto estimado del negocio
              </p>
            </div>
          </div>

          {/* Grillas de Información */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ranking de Locales */}
            <div className="bg-white border border-patilla-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-patilla-border flex items-center gap-2">
                <Store size={18} className="text-gray-500" />
                <h4 className="font-semibold text-gray-700">Ranking de Ventas por Local</h4>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-patilla-bg text-xs text-gray-500 uppercase">
                      <th className="p-3 font-medium">Local</th>
                      <th className="p-3 font-medium text-right">Total Ventas</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {stats?.rankingLocales && stats.rankingLocales.length > 0 ? (
                      stats.rankingLocales.map((local, idx) => (
                        <tr key={local.localId || idx} className="border-b border-patilla-border last:border-0">
                          <td className="p-3 font-medium text-gray-700">
                            <span className="inline-block w-5 text-gray-400 font-bold">#{idx + 1}</span>
                            {local.nombreLocal || `Local #${local.localId}`}
                          </td>
                          <td className="p-3 text-right font-semibold text-gray-800">
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
            <div className="bg-white border border-patilla-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-patilla-border flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-gray-500" />
                  <h4 className="font-semibold text-gray-700">Métodos de Pago</h4>
                </div>
                {stats?.metodoPagoPredominante && (
                  <span className="text-xs bg-patilla-bg border border-patilla-border px-2.5 py-1 rounded-full font-medium text-gray-600">
                    Predominante: <strong className="text-gray-800">{stats.metodoPagoPredominante}</strong>
                  </span>
                )}
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 bg-patilla-bg border border-patilla-border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 text-green-700 rounded">
                      <Banknote size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Efectivo en Caja</p>
                      <p className="text-lg font-bold text-gray-800">
                        {formatearDinero(stats?.ventasMetodoPago?.totalEfectivo)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {stats?.totalIngresos > 0 
                      ? `${Math.round(((stats.ventasMetodoPago?.totalEfectivo || 0) / stats.totalIngresos) * 100)}%` 
                      : '0%'}
                  </span>
                </div>

                <div className="p-4 bg-patilla-bg border border-patilla-border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Transferencias (Nequi / Daviplata)</p>
                      <p className="text-lg font-bold text-gray-800">
                        {formatearDinero(stats?.ventasMetodoPago?.totalTransferencia)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
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
