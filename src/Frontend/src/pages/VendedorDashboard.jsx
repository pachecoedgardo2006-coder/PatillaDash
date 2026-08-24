import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { inventarioService, ventasService } from '../services/api';
import { 
  LogOut, 
  DollarSign, 
  Package, 
  ClipboardList, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  ShoppingBag,
  History
} from 'lucide-react';

export default function VendedorDashboard() {
  const { user, logout } = useAuth();
  
  // Estado del formulario
  const [totalEfectivo, setTotalEfectivo] = useState('');
  const [totalTransferencia, setTotalTransferencia] = useState('');
  const [notas, setNotas] = useState('');
  
  // Productos a vender (Vaso 16oz, Vaso 24oz, Jarra Patillazo, Refresco)
  const [productosVenta, setProductosVenta] = useState([
    { id: 1, nombre: 'Patillazo Vaso 16oz', precio: 5000, cantidad: '' },
    { id: 2, nombre: 'Patillazo Vaso 24oz', precio: 7000, cantidad: '' },
    { id: 3, nombre: 'Patillazo Jarra Familiar', precio: 18000, cantidad: '' },
    { id: 4, nombre: 'Refresco Artesanal', precio: 4000, cantidad: '' },
  ]);

  // Consumo de insumos declarados
  const [consumosInsumos, setConsumosInsumos] = useState({});

  // Datos auxiliares
  const [inventario, setInventario] = useState([]);
  const [historialVentas, setHistorialVentas] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const localId = user?.localId || 1;

  const cargarDatos = async () => {
    setLoadingData(true);
    setErrorMessage('');
    try {
      const [resInventario, resVentas] = await Promise.allSettled([
        inventarioService.obtenerPorLocal(localId),
        ventasService.obtenerPorLocal(localId),
      ]);

      if (resInventario.status === 'fulfilled') {
        setInventario(resInventario.value.data || []);
      }
      if (resVentas.status === 'fulfilled') {
        setHistorialVentas(resVentas.value.data || []);
      }
    } catch (err) {
      console.error('Error al cargar datos del local:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [localId]);

  const handleProductoCantidadChange = (productoId, cantidad) => {
    setProductosVenta((prev) =>
      prev.map((p) => (p.id === productoId ? { ...p, cantidad } : p))
    );
  };

  const handleConsumoChange = (suministroId, cantidad) => {
    setConsumosInsumos((prev) => ({
      ...prev,
      [suministroId]: cantidad,
    }));
  };

  // Cálculo automático del total estimado de ventas según productos
  const totalCalculado = productosVenta.reduce((sum, p) => {
    const qty = Number(p.cantidad) || 0;
    return sum + (qty * p.precio);
  }, 0);

  const formatearDinero = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(monto || 0);
  };

  const handleRegistrarCierre = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const efectivo = Number(totalEfectivo) || 0;
    const transferencia = Number(totalTransferencia) || 0;

    if (efectivo === 0 && transferencia === 0) {
      setErrorMessage('Debes ingresar al menos el monto en Efectivo o Transferencia.');
      return;
    }

    // Filtrar los detalles de productos que tengan cantidad > 0
    const detalles = productosVenta
      .filter((p) => Number(p.cantidad) > 0)
      .map((p) => ({
        productoId: p.id,
        cantidadVendida: Number(p.cantidad),
        subtotal: Number(p.cantidad) * p.precio,
      }));

    if (detalles.length === 0) {
      // Si el vendedor no especificó items individuales, enviamos un item genérico
      detalles.push({
        productoId: 1,
        cantidadVendida: 1,
        subtotal: efectivo + transferencia,
      });
    }

    // Filtrar insumos gastados declarados
    const consumos = Object.entries(consumosInsumos)
      .filter(([_, cant]) => Number(cant) > 0)
      .map(([sumId, cant]) => ({
        suministroId: Number(sumId),
        cantidadGastada: Number(cant),
      }));

    const payload = {
      localId: Number(localId),
      vendedorId: Number(user?.id || 1),
      totalEfectivo: efectivo,
      totalTransferencia: transferencia,
      notas: notas.trim() || undefined,
      detalles,
      consumos,
    };

    setIsSubmitting(true);

    try {
      await ventasService.registrarVentaDiaria(payload);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);

      // Limpiar formulario
      setTotalEfectivo('');
      setTotalTransferencia('');
      setNotas('');
      setProductosVenta((prev) => prev.map((p) => ({ ...p, cantidad: '' })));
      setConsumosInsumos({});

      // Recargar historial e inventario actualizado
      await cargarDatos();
    } catch (err) {
      console.error('Error al registrar venta diaria:', err);
      if (err.response?.data?.detail) {
        setErrorMessage(err.response.data.detail);
      } else if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0]?.[0];
        setErrorMessage(firstError || 'Error de validación al registrar el cierre.');
      } else {
        setErrorMessage('No se pudo registrar el cierre. Revisa la conexión con el servidor.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-12 relative bg-patilla-bg">
      {/* Alerta flotante (Toast) */}
      {showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-800 px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-bounce">
          <CheckCircle size={20} className="text-green-600" />
          <span className="font-semibold text-sm">¡Cierre de turno registrado y stock actualizado con éxito!</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-patilla-border px-4 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-700">🍉 Mi Turno</h1>
          <p className="text-xs text-gray-500">
            Sede #{localId} — <strong className="text-gray-700">{user?.nombre || 'Vendedor'}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={cargarDatos}
            disabled={loadingData}
            title="Recargar datos"
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            <RefreshCw size={16} className={loadingData ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-4 max-w-lg mx-auto">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleRegistrarCierre} className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">
            Reporte de Cierre de Turno
          </h2>

          {/* Sección 1: Totales en Caja */}
          <section className="bg-white border border-patilla-border p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-4 text-patilla-text">
              <DollarSign size={20} className="text-patilla-secondary" />
              <h3 className="font-semibold text-gray-800">Totales en Caja</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Total Efectivo Recibido ($)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={totalEfectivo}
                  onChange={(e) => setTotalEfectivo(e.target.value)}
                  placeholder="Ej. 150000"
                  className="w-full p-2.5 bg-patilla-bg border border-patilla-border rounded outline-none text-sm focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Total Transferencias / Nequi / Daviplata ($)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={totalTransferencia}
                  onChange={(e) => setTotalTransferencia(e.target.value)}
                  placeholder="Ej. 45000"
                  className="w-full p-2.5 bg-patilla-bg border border-patilla-border rounded outline-none text-sm focus:border-gray-400"
                />
              </div>
            </div>
          </section>

          {/* Sección 2: Desglose de Productos Vendidos */}
          <section className="bg-white border border-patilla-border p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-patilla-text">
                <ShoppingBag size={20} className="text-patilla-primary" />
                <h3 className="font-semibold text-gray-800">Productos Vendidos</h3>
              </div>
              {totalCalculado > 0 && (
                <span className="text-xs bg-patilla-bg px-2 py-1 border border-patilla-border rounded text-gray-600 font-bold">
                  Calc: {formatearDinero(totalCalculado)}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {productosVenta.map((prod) => (
                <div
                  key={prod.id}
                  className="flex justify-between items-center bg-patilla-bg border border-patilla-border p-3 rounded"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-700">{prod.nombre}</span>
                    <span className="block text-xs text-gray-400">{formatearDinero(prod.precio)} c/u</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={prod.cantidad}
                    onChange={(e) => handleProductoCantidadChange(prod.id, e.target.value)}
                    className="w-20 p-1.5 text-center bg-white border border-patilla-border rounded text-sm outline-none focus:border-gray-400 font-semibold"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Sección 3: Declaración de Insumos Consumidos */}
          <section className="bg-white border border-patilla-border p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3 text-patilla-text">
              <div className="flex items-center gap-2">
                <Package size={20} className="text-patilla-primary" />
                <h3 className="font-semibold text-gray-800">Insumos Gastados en Turno</h3>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Declara exactamente lo que se utilizó durante la jornada. Se descontará del stock.
            </p>

            <div className="space-y-2">
              {inventario.length > 0 ? (
                inventario.map((item) => (
                  <div
                    key={item.suministroId}
                    className="flex justify-between items-center bg-patilla-bg border border-patilla-border p-3 rounded"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-700">{item.nombreSuministro}</span>
                      <span className="block text-xs text-gray-400">
                        Disponible: {item.cantidadDisponible} {item.unidadMedida}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0"
                        value={consumosInsumos[item.suministroId] || ''}
                        onChange={(e) => handleConsumoChange(item.suministroId, e.target.value)}
                        className="w-20 p-1.5 text-center bg-white border border-patilla-border rounded text-sm outline-none focus:border-gray-400 font-semibold"
                      />
                      <span className="text-xs text-gray-500">{item.unidadMedida}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-patilla-bg border border-patilla-border p-3 rounded">
                    <span className="text-sm text-gray-700">Patillas Enteras (Uds)</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="0"
                      value={consumosInsumos[1] || ''}
                      onChange={(e) => handleConsumoChange(1, e.target.value)}
                      className="w-20 p-1.5 text-center bg-white border border-patilla-border rounded text-sm"
                    />
                  </div>
                  <div className="flex justify-between items-center bg-patilla-bg border border-patilla-border p-3 rounded">
                    <span className="text-sm text-gray-700">Vasos 16oz (Uds)</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={consumosInsumos[2] || ''}
                      onChange={(e) => handleConsumoChange(2, e.target.value)}
                      className="w-20 p-1.5 text-center bg-white border border-patilla-border rounded text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Sección 4: Observaciones */}
          <section className="bg-white border border-patilla-border p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3 text-patilla-text">
              <ClipboardList size={20} className="text-gray-400" />
              <h3 className="font-semibold text-gray-800">Novedades y Observaciones</h3>
            </div>
            <textarea
              rows="3"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Reporte de averías, falta de hielo o incidencias..."
              className="w-full p-2.5 bg-patilla-bg border border-patilla-border rounded outline-none text-sm resize-none focus:border-gray-400"
            />
          </section>

          {/* Botón Guardar */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 font-bold rounded-lg transition-colors text-sm shadow-xs ${
              isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-patilla-primary hover:bg-patilla-primary-hover text-gray-800'
            }`}
          >
            {isSubmitting ? 'Guardando cierre...' : 'Registrar Cierre de Turno'}
          </button>
        </form>

        {/* Historial Reciente de Ventas */}
        {historialVentas.length > 0 && (
          <section className="bg-white border border-patilla-border p-4 rounded-lg mt-6">
            <div className="flex items-center gap-2 mb-3 text-gray-700">
              <History size={18} className="text-gray-400" />
              <h3 className="font-semibold text-sm">Historial Reciente de la Sede</h3>
            </div>
            <div className="space-y-2">
              {historialVentas.slice(0, 3).map((v) => (
                <div
                  key={v.id}
                  className="flex justify-between items-center p-2.5 bg-patilla-bg border border-patilla-border rounded text-xs"
                >
                  <div>
                    <span className="font-semibold text-gray-700">
                      {new Date(v.fecha).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {v.notas && <p className="text-gray-400 truncate max-w-xs">{v.notas}</p>}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-800 block">
                      {formatearDinero(v.totalEfectivo + v.totalTransferencia)}
                    </span>
                    <span className="text-gray-400">Ef: {formatearDinero(v.totalEfectivo)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
