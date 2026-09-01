import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ventasService, inventarioService, productosService } from '../services/api';
import { formatearFecha } from '../utils/fechas';
import { 
  LogOut, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  Plus, 
  Minus, 
  Package, 
  ShoppingBag, 
  Clock, 
  History, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Banknote, 
  CreditCard, 
  Check, 
  X,
  Sparkles,
  Store,
  Zap,
  RotateCcw
} from 'lucide-react';

export default function VendedorDashboard() {
  const { user, logout } = useAuth();
  
  // Pestañas principales
  const [activeTab, setActiveTab] = useState('cierre'); // 'cierre' | 'historial'

  // Wizard de Pasos (1, 2, 3)
  const [pasoActual, setPasoActual] = useState(1);

  // Estados de datos
  const [inventario, setInventario] = useState([]);
  const [historialVentas, setHistorialVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Paginación de Historial (10 por página)
  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_POR_PAGINA = 10;

  // Notificaciones Flotantes (Toasts fijados arriba)
  const [toast, setToast] = useState({ visible: false, tipo: 'success', mensaje: '' });

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ visible: true, tipo, mensaje });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4500);
  };

  // Formulario de Venta Diaria
  const [totalEfectivo, setTotalEfectivo] = useState('');
  const [totalTransferencia, setTotalTransferencia] = useState('');
  const [notas, setNotas] = useState('');

  // Catálogo dinámico de Productos
  const [productos, setProductos] = useState([]);

  // Consumo de Insumos Dinámico (key = suministroId, value = cantidad)
  const [consumos, setConsumos] = useState({});

  const localId = Number(user?.localId) || 1;

  // Función inteligente para determinar si un insumo tiene cálculo 1:1 automático
  const obtenerInfoInsumoAuto = (nombreSuministro, listaProductos) => {
    const norm = (nombreSuministro || '').toLowerCase().replace(/\s+/g, '');

    // 1. Vaso 7oz
    if (norm.includes('vaso') && norm.includes('7oz')) {
      const prod = listaProductos.find(p => p.nombre.toLowerCase().replace(/\s+/g, '').includes('7oz'));
      return { esAuto: true, cantidad: prod?.cantidad || 0, origen: 'Vaso 7oz' };
    }

    // 2. Vaso 9oz
    if (norm.includes('vaso') && norm.includes('9oz')) {
      const prod = listaProductos.find(p => p.nombre.toLowerCase().replace(/\s+/g, '').includes('9oz'));
      return { esAuto: true, cantidad: prod?.cantidad || 0, origen: 'Vaso 9oz' };
    }

    // 3. Vaso 14oz o 16oz
    if (norm.includes('vaso') && (norm.includes('14oz') || norm.includes('16oz'))) {
      const prod = listaProductos.find(p => {
        const np = p.nombre.toLowerCase().replace(/\s+/g, '');
        return np.includes('14oz') || np.includes('16oz');
      });
      return { esAuto: true, cantidad: prod?.cantidad || 0, origen: 'Vaso 14oz' };
    }

    // 4. Deditos
    if (norm.includes('dedito')) {
      const prod = listaProductos.find(p => p.nombre.toLowerCase().includes('dedito'));
      return { esAuto: true, cantidad: prod?.cantidad || 0, origen: 'Deditos' };
    }

    // 5. Pastelitos
    if (norm.includes('pastelito')) {
      const prod = listaProductos.find(p => p.nombre.toLowerCase().includes('pastelito'));
      return { esAuto: true, cantidad: prod?.cantidad || 0, origen: 'Pastelitos' };
    }

    // 6. Galletas
    if (norm.includes('galleta')) {
      const prod = listaProductos.find(p => p.nombre.toLowerCase().includes('galleta'));
      return { esAuto: true, cantidad: prod?.cantidad || 0, origen: 'Galletas' };
    }

    // Manual: Patillas / Sandías, Azúcar, Limones, Bolsas, Servilletas, Cucharas
    return { esAuto: false, cantidad: 0, origen: null };
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resInv, resVentas, resProds] = await Promise.allSettled([
        inventarioService.obtenerPorLocal(localId),
        ventasService.obtenerPorLocal(localId),
        productosService.obtenerTodos(true),
      ]);

      if (resInv.status === 'fulfilled') {
        const inv = resInv.value.data || [];
        setInventario(inv);
        // Inicializar objeto de consumos dinámico si está vacío
        setConsumos(prev => {
          const inicial = { ...prev };
          inv.forEach(item => {
            if (inicial[item.suministroId] === undefined) {
              inicial[item.suministroId] = '';
            }
          });
          return inicial;
        });
      }
      if (resVentas.status === 'fulfilled') {
        setHistorialVentas(resVentas.value.data || []);
      }
      if (resProds.status === 'fulfilled') {
        const prods = (resProds.value.data || []).map(p => ({
          id: p.id,
          nombre: p.nombre,
          precio: p.precioBase,
          categoria: p.categoria,
          cantidad: 0,
        }));
        setProductos(prods);
      }
    } catch (err) {
      console.error('Error al cargar datos del local:', err);
      mostrarToast('Error al conectar con el servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [localId]);

  const updateProductoCantidad = (id, delta) => {
    setProductos(productos.map(p => {
      if (p.id === id) {
        const nuevaCantidad = Math.max(0, p.cantidad + delta);
        return { ...p, cantidad: nuevaCantidad };
      }
      return p;
    }));
  };

  // Sincronizar automáticamente insumos con cantidades exactas de productos vendidos
  const sincronizarInsumosExactos = () => {
    setConsumos(prev => {
      const nuevo = { ...prev };
      inventario.forEach(item => {
        const info = obtenerInfoInsumoAuto(item.nombreSuministro, productos);
        if (info.esAuto) {
          nuevo[item.suministroId] = info.cantidad > 0 ? info.cantidad.toString() : '0';
        }
      });
      return nuevo;
    });
  };

  const handleConsumoChange = (suministroId, valor) => {
    setConsumos(prev => ({ ...prev,
      [suministroId]: valor,
    }));
  };

  const ajustarConsumoDelta = (suministroId, delta) => {
    const actual = Number(consumos[suministroId]) || 0;
    const nuevo = Math.max(0, actual + delta);
    handleConsumoChange(suministroId, nuevo === 0 ? '' : nuevo.toString());
  };

  // Validaciones por paso
  const validarPaso1 = () => {
    const ef = Number(totalEfectivo) || 0;
    const tr = Number(totalTransferencia) || 0;
    if (ef <= 0 && tr <= 0) {
      mostrarToast('Ingresa al menos un monto en efectivo o transferencia para continuar.', 'error');
      return false;
    }
    return true;
  };

  const validarPaso2 = () => {
    const totalProductos = productos.reduce((acc, p) => acc + p.cantidad, 0);
    if (totalProductos <= 0) {
      mostrarToast('Debes seleccionar al menos 1 producto vendido en la jornada.', 'error');
      return false;
    }
    return true;
  };

  const avanzarPaso = () => {
    if (pasoActual === 1 && !validarPaso1()) return;
    if (pasoActual === 2) {
      if (!validarPaso2()) return;
      // Auto-calcular insumos exactos (vasos, fritos, snacks) según productos vendidos
      sincronizarInsumosExactos();
    }
    setPasoActual(prev => Math.min(3, prev + 1));
  };

  const retrocederPaso = () => {
    setPasoActual(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar consumos dinámicos
    const consumosValidos = Object.entries(consumos)
      .filter(([_, cant]) => Number(cant) > 0)
      .map(([id, cant]) => ({
        suministroId: Number(id),
        cantidadGastada: Number(cant),
      }));

    if (consumosValidos.length === 0) {
      mostrarToast('Declara al menos un insumo consumido (ej. patillas, vasos o fritos gastados).', 'error');
      return;
    }

    const detallesValidos = productos
      .filter(p => p.cantidad > 0)
      .map(p => ({
        productoId: p.id,
        cantidadVendida: p.cantidad,
        subtotal: p.cantidad * p.precio,
      }));

    const ef = Number(totalEfectivo) || 0;
    const tr = Number(totalTransferencia) || 0;

    const payload = {
      localId: localId,
      vendedorId: Number(user?.usuarioId || user?.id) || 1,
      totalEfectivo: ef,
      totalTransferencia: tr,
      notas: notas.trim() || undefined,
      detalles: detallesValidos,
      consumos: consumosValidos,
    };

    setSubmitting(true);

    try {
      await ventasService.registrarVentaDiaria(payload);
      mostrarToast('¡Excelente! Cierre de turno registrado y stock descontado con éxito.', 'success');

      // Limpiar formulario
      setTotalEfectivo('');
      setTotalTransferencia('');
      setNotas('');
      setProductos(prev => prev.map(p => ({ ...p, cantidad: 0 })));
      
      const resetConsumos = {};
      inventario.forEach(i => resetConsumos[i.suministroId] = '');
      setConsumos(resetConsumos);
      setPasoActual(1);

      // Recargar datos y cambiar a pestaña de historial
      await cargarDatos();
      setActiveTab('historial');
    } catch (err) {
      console.error('Error al registrar venta:', err);
      if (err.response?.data?.detail) {
        mostrarToast(err.response.data.detail, 'error');
      } else if (err.response?.data?.errors) {
        const firstKey = Object.keys(err.response.data.errors)[0];
        mostrarToast(err.response.data.errors[firstKey][0], 'error');
      } else {
        mostrarToast('Error al procesar el cierre diario. Verifica las existencias de stock.', 'error');
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

  const totalCalculadoProductos = productos.reduce((acc, p) => acc + (p.cantidad * p.precio), 0);
  const totalCaja = (Number(totalEfectivo) || 0) + (Number(totalTransferencia) || 0);

  // Separar inventario en: Insumos Automáticos vs Insumos Manuales
  const insumosAutomaticos = inventario.filter(item => {
    const info = obtenerInfoInsumoAuto(item.nombreSuministro, productos);
    return info.esAuto;
  });

  const insumosManuales = inventario.filter(item => {
    const info = obtenerInfoInsumoAuto(item.nombreSuministro, productos);
    return !info.esAuto;
  });

  // Paginación de Historial
  const totalPaginas = Math.ceil(historialVentas.length / ITEMS_POR_PAGINA) || 1;
  const ventasPaginadas = historialVentas.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  const getInsumoIcon = (nombre) => {
    const n = (nombre || '').toLowerCase();
    if (n.includes('patilla')) return '🍉';
    if (n.includes('vaso')) return '🥤';
    if (n.includes('azúcar') || n.includes('azucar')) return '🍬';
    if (n.includes('limón') || n.includes('limon')) return '🍋';
    if (n.includes('dedito') || n.includes('pastel')) return '🥟';
    if (n.includes('galleta')) return '🍪';
    if (n.includes('bolsa')) return '🛍️';
    if (n.includes('cuchara')) return '🥄';
    if (n.includes('servilleta')) return '🧻';
    return '📦';
  };

  return (
    <div className="min-h-screen bg-patilla-bg pb-20">
      {/* Toast Flotante Fijado */}
      {toast.visible && (
        <div className="fixed top-4 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 max-w-md animate-in fade-in slide-in-from-top-4 duration-200">
          <div className={`p-4 rounded-xl shadow-2xl border flex items-center justify-between gap-3 ${
            toast.tipo === 'success' 
              ? 'bg-green-800 text-white border-green-600' 
              : 'bg-red-800 text-white border-red-600'
          }`}>
            <div className="flex items-center gap-2.5">
              {toast.tipo === 'success' ? (
                <CheckCircle2 size={22} className="text-green-300 shrink-0" />
              ) : (
                <AlertCircle size={22} className="text-red-300 shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-semibold leading-snug">{toast.mensaje}</span>
            </div>
            <button 
              onClick={() => setToast(prev => ({ ...prev, visible: false }))}
              className="text-white/80 hover:text-white p-1 shrink-0 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Header Mobile / Tablet */}
      <header className="bg-white border-b border-patilla-border px-4 py-3.5 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🍉</span>
            <div>
              <h1 className="font-black text-gray-800 text-base leading-tight">PatillaDash</h1>
              <p className="text-xs text-gray-500 font-medium">
                {user?.nombre || 'Vendedor'} • Sede #{localId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={cargarDatos}
              disabled={loading}
              title="Recargar datos"
              aria-label="Recargar"
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors active:scale-95 cursor-pointer"
            >
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={logout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors active:scale-95 cursor-pointer"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* Pestañas de Navegación */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="grid grid-cols-2 gap-2 bg-gray-200/70 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('cierre')}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'cierre'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileText size={16} />
            Registrar Cierre
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'historial'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <History size={16} />
            Mi Historial ({historialVentas.length})
          </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-4">
        {/* ============================================================ */}
        {/* PESTAÑA 1: REGISTRAR CIERRE DIARIO (WIZARD DE 3 PASOS)       */}
        {/* ============================================================ */}
        {activeTab === 'cierre' && (
          <div className="space-y-4">
            {/* Barra de Progreso de Pasos */}
            <div className="bg-white border border-patilla-border rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between relative px-2">
                <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0"></div>
                <div 
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-patilla-primary transition-all duration-300 z-0"
                  style={{ width: pasoActual === 1 ? '0%' : pasoActual === 2 ? '50%' : 'calc(100% - 2rem)' }}
                ></div>

                {/* Paso 1 */}
                <button
                  type="button"
                  onClick={() => setPasoActual(1)}
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                    pasoActual >= 1 ? 'bg-patilla-primary text-gray-900 ring-4 ring-white shadow-2xs font-extrabold' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  1
                </button>

                {/* Paso 2 */}
                <button
                  type="button"
                  onClick={() => { if (validarPaso1()) setPasoActual(2); }}
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                    pasoActual >= 2 ? 'bg-patilla-primary text-gray-900 ring-4 ring-white shadow-2xs font-extrabold' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  2
                </button>

                {/* Paso 3 */}
                <button
                  type="button"
                  onClick={() => { 
                    if (validarPaso1() && validarPaso2()) {
                      sincronizarInsumosExactos();
                      setPasoActual(3);
                    }
                  }}
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                    pasoActual === 3 ? 'bg-patilla-primary text-gray-900 ring-4 ring-white shadow-2xs font-extrabold' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  3
                </button>
              </div>

              <div className="flex justify-between text-[11px] text-gray-600 font-bold mt-2.5 px-0.5">
                <span className={pasoActual === 1 ? 'text-gray-900 font-black' : 'text-gray-400'}>1. Dinero en Caja</span>
                <span className={pasoActual === 2 ? 'text-gray-900 font-black' : 'text-gray-400'}>2. Productos</span>
                <span className={pasoActual === 3 ? 'text-gray-900 font-black' : 'text-gray-400'}>3. Insumos</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* --- PASO 1: TOTALES EN CAJA --- */}
              {pasoActual === 1 && (
                <div className="bg-white border border-patilla-border rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="border-b border-patilla-border pb-3">
                    <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
                      <DollarSign size={18} className="text-green-700" /> Paso 1: Dinero en Caja del Turno
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Ingresa los montos totales recaudados en efectivo y transferencias.
                    </p>
                  </div>

                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <Banknote size={16} className="text-green-600" /> Total Efectivo en Caja ($)
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        placeholder="Ej. 180000"
                        value={totalEfectivo}
                        onChange={(e) => setTotalEfectivo(e.target.value)}
                        className="w-full p-3.5 border border-patilla-border rounded-xl text-lg font-extrabold bg-patilla-bg outline-none focus:border-gray-500 focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <CreditCard size={16} className="text-blue-600" /> Total Transferencias ($ Nequi / Daviplata)
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        placeholder="Ej. 45000"
                        value={totalTransferencia}
                        onChange={(e) => setTotalTransferencia(e.target.value)}
                        className="w-full p-3.5 border border-patilla-border rounded-xl text-lg font-extrabold bg-patilla-bg outline-none focus:border-gray-500 focus:bg-white transition-colors"
                      />
                    </div>

                    {/* Resumen Total en vivo */}
                    <div className="p-4 bg-gray-50 border border-patilla-border rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-500 block">Total Recaudado en Turno:</span>
                        <span className="text-xl font-black text-green-700">{formatearDinero(totalCaja)}</span>
                      </div>
                      <div className="p-2.5 bg-green-100 text-green-800 rounded-xl">
                        <Banknote size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={avanzarPaso}
                      className="w-full py-3.5 bg-patilla-primary hover:bg-patilla-primary-hover text-gray-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-98 text-sm shadow-2xs cursor-pointer"
                    >
                      Siguiente: Productos <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              )}

              {/* --- PASO 2: PRODUCTOS VENDIDOS DINÁMICOS --- */}
              {pasoActual === 2 && (
                <div className="bg-white border border-patilla-border rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="border-b border-patilla-border pb-3">
                    <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
                      <ShoppingBag size={18} className="text-patilla-primary" /> Paso 2: Productos Vendidos
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Indica las unidades servidas de cada presentación. Los vasos y fritos se calcularán automáticamente.
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
                    {productos.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">
                        Cargando catálogo de productos...
                      </p>
                    ) : (
                      productos.map((prod) => (
                        <div
                          key={prod.id}
                          className="flex items-center justify-between p-3.5 bg-patilla-bg border border-patilla-border rounded-xl"
                        >
                          <div className="pr-2">
                            <p className="font-bold text-gray-800 text-sm">{prod.nombre}</p>
                            <p className="text-xs text-gray-500 font-medium">{formatearDinero(prod.precio)} c/u</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateProductoCantidad(prod.id, -1)}
                              className="w-10 h-10 rounded-xl bg-white border border-patilla-border flex items-center justify-center text-gray-700 font-bold hover:bg-gray-100 active:scale-90 transition-transform shadow-2xs cursor-pointer"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-9 text-center font-black text-base text-gray-800">
                              {prod.cantidad}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateProductoCantidad(prod.id, 1)}
                              className="w-10 h-10 rounded-xl bg-patilla-primary flex items-center justify-center text-gray-900 font-bold hover:bg-patilla-primary-hover active:scale-90 transition-transform shadow-2xs cursor-pointer"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}

                    <div className="p-3.5 bg-gray-50 border border-patilla-border rounded-xl flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-600">Total Estimado en Productos:</span>
                      <span className="text-base font-black text-gray-800">{formatearDinero(totalCalculadoProductos)}</span>
                    </div>
                  </div>

                  <div className="pt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={retrocederPaso}
                      className="px-4 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors text-sm cursor-pointer"
                    >
                      <ChevronLeft size={16} /> Atrás
                    </button>
                    <button
                      type="button"
                      onClick={avanzarPaso}
                      className="flex-1 py-3.5 bg-patilla-primary hover:bg-patilla-primary-hover text-gray-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-98 text-sm shadow-2xs cursor-pointer"
                    >
                      Siguiente: Insumos <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              )}

              {/* --- PASO 3: INSUMOS CONSUMIDOS (AUTOMÁTICOS Y MANUALES) --- */}
              {pasoActual === 3 && (
                <div className="bg-white border border-patilla-border rounded-2xl p-5 shadow-2xs space-y-5">
                  <div className="border-b border-patilla-border pb-3">
                    <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
                      <Package size={18} className="text-patilla-secondary" /> Paso 3: Insumos y Consumo de Stock
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Los vasos y fritos se calcularon automáticamente. Solo debes registrar las patillas y productos variables.
                    </p>
                  </div>

                  {/* 1. SECCIÓN: INSUMOS AUTOMÁTICOS EXACTOS */}
                  {insumosAutomaticos.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                          <Zap size={14} className="text-amber-500 fill-amber-500" />
                          Vasos & Fritos (Auto-calculados 1:1)
                        </h3>
                        <button
                          type="button"
                          onClick={sincronizarInsumosExactos}
                          title="Volver a calcular según los productos del Paso 2"
                          className="text-[11px] text-gray-500 hover:text-gray-800 font-bold flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <RotateCcw size={11} /> Re-sincronizar
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {insumosAutomaticos.map((item) => {
                          const info = obtenerInfoInsumoAuto(item.nombreSuministro, productos);
                          return (
                            <div
                              key={item.suministroId}
                              className="p-3 bg-amber-50/40 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-2xl">{getInsumoIcon(item.nombreSuministro)}</span>
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="font-bold text-gray-900 text-xs sm:text-sm">{item.nombreSuministro}</p>
                                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black rounded-md flex items-center gap-0.5">
                                      <Zap size={10} className="fill-amber-600 text-amber-600" /> Auto: {info.cantidad} uds
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-gray-500">
                                    Stock disponible: <strong className="text-gray-700">{item.cantidadDisponible} {item.unidadMedida}</strong>
                                  </span>
                                </div>
                              </div>

                              {/* Control de Cantidad Gastada */}
                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => ajustarConsumoDelta(item.suministroId, -1)}
                                  className="w-9 h-9 rounded-xl bg-white border border-patilla-border flex items-center justify-center text-gray-700 font-bold hover:bg-gray-100 active:scale-90 transition-transform shadow-2xs cursor-pointer"
                                >
                                  <Minus size={15} />
                                </button>
                                <div className="relative w-24">
                                  <input
                                    type="number"
                                    inputMode="decimal"
                                    min="0"
                                    placeholder="0"
                                    value={consumos[item.suministroId] || ''}
                                    onChange={(e) => handleConsumoChange(item.suministroId, e.target.value)}
                                    className="w-full p-2 pr-7 text-center border border-amber-300 rounded-xl text-xs sm:text-sm bg-white font-black text-gray-900 outline-none focus:border-amber-500 shadow-2xs"
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400 pointer-events-none">
                                    uds
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => ajustarConsumoDelta(item.suministroId, 1)}
                                  className="w-9 h-9 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 flex items-center justify-center font-bold active:scale-90 transition-transform shadow-2xs cursor-pointer"
                                >
                                  <Plus size={15} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2. SECCIÓN: INSUMOS MANUALES (PATILLAS, AZÚCAR, LIMONES, BOLSAS) */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <h3 className="text-xs font-black text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                        <span>🍉</span> Insumos de Registro Manual (Rendimiento Variable)
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Indica cuántas sandías/patillas enteras se abrieron hoy y otros insumos usados.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {insumosManuales.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-3">No hay insumos manuales configurados.</p>
                      ) : (
                        insumosManuales.map((item) => {
                          const isPatilla = item.nombreSuministro.toLowerCase().includes('patilla');
                          return (
                            <div
                              key={item.suministroId}
                              className={`p-3.5 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                                isPatilla 
                                  ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs ring-1 ring-emerald-200' 
                                  : 'bg-patilla-bg border-patilla-border'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-2xl">{getInsumoIcon(item.nombreSuministro)}</span>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-bold text-gray-900 text-xs sm:text-sm">{item.nombreSuministro}</p>
                                    {isPatilla && (
                                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black rounded-md">
                                        Principal
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-gray-500">
                                    Stock actual: <strong className="text-gray-700">{item.cantidadDisponible} {item.unidadMedida}</strong>
                                  </span>
                                </div>
                              </div>

                              {/* Control de Cantidad Gastada */}
                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => ajustarConsumoDelta(item.suministroId, item.unidadMedida === 'Kg' ? -0.5 : -1)}
                                  className="w-9 h-9 rounded-xl bg-white border border-patilla-border flex items-center justify-center text-gray-700 font-bold hover:bg-gray-100 active:scale-90 transition-transform shadow-2xs cursor-pointer"
                                >
                                  <Minus size={15} />
                                </button>
                                <div className="relative w-24">
                                  <input
                                    type="number"
                                    inputMode="decimal"
                                    step={item.unidadMedida === 'Kg' ? '0.1' : '1'}
                                    min="0"
                                    placeholder="0"
                                    value={consumos[item.suministroId] || ''}
                                    onChange={(e) => handleConsumoChange(item.suministroId, e.target.value)}
                                    className={`w-full p-2 pr-7 text-center border rounded-xl text-xs sm:text-sm bg-white font-black outline-none shadow-2xs ${
                                      isPatilla 
                                        ? 'border-emerald-400 text-emerald-900 focus:ring-2 focus:ring-emerald-300' 
                                        : 'border-patilla-border text-gray-900 focus:border-gray-500'
                                    }`}
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400 pointer-events-none">
                                    {item.unidadMedida === 'Unidades' ? 'uds' : item.unidadMedida}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => ajustarConsumoDelta(item.suministroId, item.unidadMedida === 'Kg' ? 0.5 : 1)}
                                  className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center active:scale-90 transition-transform shadow-2xs cursor-pointer ${
                                    isPatilla 
                                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                                      : 'bg-patilla-secondary/70 hover:bg-patilla-secondary text-green-950'
                                  }`}
                                >
                                  <Plus size={15} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="pt-1">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Novedades / Observaciones del Turno (Opcional)
                      </label>
                      <textarea
                        rows="2"
                        placeholder="Ej. Se abrió paquete nuevo de vasos / Día con alta afluencia"
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        className="w-full p-3 border border-patilla-border rounded-xl text-xs sm:text-sm bg-patilla-bg outline-none focus:border-gray-500 focus:bg-white"
                      ></textarea>
                    </div>
                  </div>

                  <div className="pt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={retrocederPaso}
                      className="px-4 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors text-sm cursor-pointer"
                    >
                      <ChevronLeft size={16} /> Atrás
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all text-sm shadow-md disabled:opacity-50 active:scale-98 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw size={17} className="animate-spin" /> Guardando Cierre...
                        </>
                      ) : (
                        <>
                          <Check size={18} /> Finalizar y Enviar Cierre
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* PESTAÑA 2: MI HISTORIAL DE TURNOS (PAGINADO A 10 ITEMS)      */}
        {/* ============================================================ */}
        {activeTab === 'historial' && (
          <div className="bg-white border border-patilla-border rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-patilla-border flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" /> Mis Turnos Anteriores
                </h3>
                <p className="text-xs text-gray-500">Historial de ventas y cierres de tu local</p>
              </div>
              <span className="text-xs bg-patilla-bg border border-patilla-border px-2.5 py-1 rounded-full font-bold text-gray-600">
                Total: {historialVentas.length}
              </span>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="py-12 text-center text-gray-400">
                  <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
                  <p className="text-xs">Cargando turnos...</p>
                </div>
              ) : historialVentas.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <FileText size={28} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">No hay turnos registrados en este local aún.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ventasPaginadas.map((v) => (
                    <div
                      key={v.id}
                      className="p-4 border border-patilla-border rounded-xl bg-patilla-bg/60 hover:bg-patilla-bg transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="flex items-center gap-2">
                          <Calendar size={15} className="text-gray-400" />
                          <span className="text-xs font-bold text-gray-800">
                            {formatearFecha(v.fecha, true)}
                          </span>
                        </div>
                        <span className="text-sm font-black text-green-700">
                          {formatearDinero(v.totalGeneral)}
                        </span>
                      </div>

                      <div className="flex justify-between text-xs text-gray-600 pt-2.5 border-t border-patilla-border">
                        <span>Efectivo: <strong>{formatearDinero(v.totalEfectivo)}</strong></span>
                        <span>Transferencias: <strong>{formatearDinero(v.totalTransferencia)}</strong></span>
                      </div>

                      {v.notas && (
                        <p className="text-xs text-gray-500 mt-2 bg-white p-2.5 rounded-lg border border-patilla-border italic">
                          "{v.notas}"
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Controles de Paginación */}
                  {totalPaginas > 1 && (
                    <div className="pt-4 flex items-center justify-between border-t border-patilla-border">
                      <button
                        onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                        disabled={paginaActual === 1}
                        className="px-3 py-2 text-xs font-bold bg-white border border-patilla-border rounded-xl text-gray-700 disabled:opacity-40 hover:bg-gray-50 flex items-center gap-1 active:scale-95 cursor-pointer"
                      >
                        <ChevronLeft size={14} /> Anterior
                      </button>

                      <span className="text-xs text-gray-500 font-semibold">
                        Página {paginaActual} de {totalPaginas}
                      </span>

                      <button
                        onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                        disabled={paginaActual === totalPaginas}
                        className="px-3 py-2 text-xs font-bold bg-white border border-patilla-border rounded-xl text-gray-700 disabled:opacity-40 hover:bg-gray-50 flex items-center gap-1 active:scale-95 cursor-pointer"
                      >
                        Siguiente <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
