import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { productosService } from '../services/api';
import { 
  ShoppingBag, 
  Plus, 
  RefreshCw, 
  Edit2, 
  Check, 
  X, 
  AlertCircle, 
  Search, 
  Tag, 
  DollarSign, 
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react';

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [toast, setToast] = useState({ visible: false, mensaje: '', tipo: 'success' });

  // Modal Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditandoId, setProductoEditandoId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    precioBase: '',
    categoria: 'Bebidas',
    activo: true,
  });

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  // Bloqueo de scroll completo cuando el modal está abierto para mobile
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

  const cargarProductos = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await productosService.obtenerTodos(true); // Incluir inactivos
      setProductos(res.data || []);
    } catch (err) {
      console.error('Error al cargar catálogo de productos:', err);
      setError('No se pudo cargar el listado de productos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setProductoEditandoId(null);
    setFormData({
      nombre: '',
      precioBase: '',
      categoria: 'Bebidas',
      activo: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const abrirModalEditar = (prod) => {
    setModoEdicion(true);
    setProductoEditandoId(prod.id);
    setFormData({
      nombre: prod.nombre,
      precioBase: prod.precioBase.toString(),
      categoria: prod.categoria || 'Bebidas',
      activo: prod.activo,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.nombre.trim()) {
      setFormError('El nombre del producto es obligatorio.');
      return;
    }
    if (!formData.precioBase || Number(formData.precioBase) <= 0) {
      setFormError('El precio debe ser un número mayor a cero.');
      return;
    }

    setSubmitting(true);
    try {
      if (modoEdicion) {
        await productosService.actualizar(productoEditandoId, {
          nombre: formData.nombre.trim(),
          precioBase: Number(formData.precioBase),
          categoria: formData.categoria,
          activo: formData.activo,
        });
        mostrarToast('Producto actualizado correctamente con éxito.');
      } else {
        await productosService.crear({
          nombre: formData.nombre.trim(),
          precioBase: Number(formData.precioBase),
          categoria: formData.categoria,
        });
        mostrarToast('Nuevo producto registrado exitosamente en el catálogo.');
      }

      setIsModalOpen(false);
      cargarProductos();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      setFormError(err.response?.data?.detail || err.response?.data?.message || 'Error al procesar el producto.');
    } finally {
      setSubmitting(false);
    }
  };

  const alternarEstado = async (prod) => {
    try {
      await productosService.cambiarEstado(prod.id);
      mostrarToast(`Producto ${prod.activo ? 'desactivado' : 'activado'} correctamente.`);
      cargarProductos();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      mostrarToast('No se pudo cambiar el estado del producto.', 'error');
    }
  };

  const formatearDinero = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(monto || 0);
  };

  // Categorías fijas y dinámicas
  const categorias = ['Todas', 'Bebidas', 'Fritos', 'Snacks', 'General'];

  // Filtrado de productos
  const productosFiltrados = productos.filter(p => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          p.categoria?.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = !filtroCategoria || filtroCategoria === 'Todas' || p.categoria === filtroCategoria;
    return matchBusqueda && matchCategoria;
  });

  const totalActivos = productos.filter(p => p.activo).length;

  return (
    <AdminLayout
      title="Catálogo de Productos y Precios"
      subtitle="Define los productos de venta y sus precios para el registro eficiente de ventas"
      actionButton={
        <button
          onClick={abrirModalCrear}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-patilla-primary hover:bg-patilla-primary-hover text-gray-900 text-xs sm:text-sm font-black rounded-xl transition-all active:scale-95 shadow-2xs cursor-pointer"
        >
          <Plus size={16} />
          Nuevo Producto
        </button>
      }
    >
      {/* Toast Notificación */}
      {toast.visible && (
        <div className={`mb-4 p-3.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all animate-in fade-in shadow-2xs ${
          toast.tipo === 'error' 
            ? 'bg-red-50 text-red-700 border-red-200' 
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {toast.tipo === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} className="text-emerald-600" />}
          <span>{toast.mensaje}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Barra Superior */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white border border-patilla-border p-4 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Catálogo Activo</span>
            <span className="text-xl sm:text-2xl font-black text-gray-800">{totalActivos} productos</span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
            <ShoppingBag size={20} />
          </div>
        </div>

        <div className="bg-white border border-patilla-border p-4 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Registrados</span>
            <span className="text-xl sm:text-2xl font-black text-gray-800">{productos.length}</span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
            <Tag size={20} />
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white border border-patilla-border p-4 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Precios Rango</span>
            <span className="text-base sm:text-lg font-black text-gray-700">
              {productos.length > 0
                ? `${formatearDinero(Math.min(...productos.map(p => p.precioBase)))} - ${formatearDinero(Math.max(...productos.map(p => p.precioBase)))}`
                : '$0'}
            </span>
          </div>
          <div className="p-2.5 bg-patilla-primary/30 text-gray-800 rounded-xl">
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Categorías */}
      <div className="bg-white border border-patilla-border rounded-2xl p-4 mb-6 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar producto por nombre (ej. 16oz, Empanada)..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-patilla-bg border border-patilla-border rounded-xl text-xs sm:text-sm font-medium outline-none focus:bg-white focus:border-gray-400 transition-colors"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Botones de Categorías */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categorias.map(cat => {
            const activo = (filtroCategoria === '' && cat === 'Todas') || filtroCategoria === cat;
            return (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat === 'Todas' ? '' : cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activo 
                    ? 'bg-gray-900 text-white shadow-2xs' 
                    : 'bg-patilla-bg border border-patilla-border text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            );
          })}

          <button
            onClick={cargarProductos}
            disabled={loading}
            title="Recargar catálogo"
            className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors shrink-0 ml-1 cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-gray-600' : ''} />
          </button>
        </div>
      </div>

      {/* Grid de Tarjetas de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full bg-white border border-patilla-border rounded-2xl p-12 text-center text-gray-400">
            <RefreshCw size={28} className="animate-spin mx-auto mb-2 text-patilla-primary" />
            Cargando catálogo de productos...
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="col-span-full bg-white border border-patilla-border rounded-2xl p-12 text-center text-gray-400">
            <ShoppingBag size={32} className="mx-auto mb-2 text-gray-300" />
            No se encontraron productos coincidentes.
          </div>
        ) : (
          productosFiltrados.map((prod) => {
            return (
              <div
                key={prod.id}
                className={`bg-white border rounded-2xl p-4 flex flex-col justify-between transition-all shadow-2xs hover:shadow-sm ${
                  prod.activo 
                    ? 'border-patilla-border' 
                    : 'border-dashed border-gray-300 opacity-60 bg-gray-50/50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-patilla-bg border border-patilla-border text-gray-600">
                      {prod.categoria || 'General'}
                    </span>
                    <button
                      onClick={() => alternarEstado(prod)}
                      title={prod.activo ? 'Clic para desactivar' : 'Clic para activar'}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                        prod.activo 
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:text-red-700' 
                          : 'bg-gray-200 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      {prod.activo ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Activo
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Inactivo
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="font-black text-gray-800 text-base mb-1" title={prod.nombre}>
                    {prod.nombre}
                  </h3>
                  <div className="font-black text-xl text-gray-900 mb-4">
                    {formatearDinero(prod.precioBase)}
                  </div>
                </div>

                <div className="pt-3 border-t border-patilla-border flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-400 font-medium">#{prod.id}</span>
                  <button
                    onClick={() => abrirModalEditar(prod)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-patilla-primary/40 px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <Edit2 size={13} /> Editar Producto
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Crear / Editar Producto */}
      {isModalOpen && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
          className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center z-[60] p-3 sm:p-4 overscroll-contain animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-patilla-border overscroll-contain">
            <div className="p-4 sm:p-5 border-b border-patilla-border flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                <ShoppingBag size={18} className="text-patilla-primary" />
                {modoEdicion ? 'Editar Producto' : 'Crear Nuevo Producto'}
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
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Nombre del Producto / Presentación
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Vaso 9oz / Pastelitos / Granizado"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full p-3 border border-patilla-border rounded-xl text-sm font-bold bg-patilla-bg outline-none focus:bg-white focus:border-gray-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Precio de Venta al Público ($ COP)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="100"
                    step="100"
                    required
                    placeholder="Ej. 3000"
                    value={formData.precioBase}
                    onChange={(e) => setFormData({ ...formData, precioBase: e.target.value })}
                    className="w-full pl-8 pr-4 p-3 border border-patilla-border rounded-xl text-base font-extrabold bg-patilla-bg outline-none focus:bg-white focus:border-gray-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Categoría
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full p-3 border border-patilla-border rounded-xl text-sm font-bold bg-patilla-bg outline-none"
                >
                  <option value="Bebidas">Bebidas (Vasos, Jugos, Patillazos)</option>
                  <option value="Fritos">Fritos (Deditos, Pastelitos, Empanadas)</option>
                  <option value="Snacks">Snacks (Galletas, Dulces)</option>
                  <option value="General">General / Otros</option>
                </select>
              </div>

              {modoEdicion && (
                <div className="p-3 bg-gray-50 border border-patilla-border rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Disponible para Venta</span>
                    <span className="text-[11px] text-gray-500">¿Aparece en la pantalla de cobro de las vendedoras?</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="w-5 h-5 accent-patilla-primary rounded cursor-pointer"
                  />
                </div>
              )}

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 text-xs font-bold bg-patilla-primary hover:bg-patilla-primary-hover text-gray-900 rounded-xl transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  {submitting ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  {modoEdicion ? 'Actualizar Producto' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
