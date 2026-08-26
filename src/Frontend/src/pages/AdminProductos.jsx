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

  // Bloqueo de scroll cuando el modal está abierto
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

  const cargarProductos = async () => {
    setLoading(true);
    setError('');
    try {
      // Obtenemos todos (incluyendo inactivos para gestión de admin)
      const res = await productosService.obtenerTodos();
      setProductos(res.data || []);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('No se pudo conectar con el catálogo de productos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const abrirModalCreacion = () => {
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

  const abrirModalEdicion = (prod) => {
    setModoEdicion(true);
    setProductoEditandoId(prod.id);
    setFormData({
      nombre: prod.nombre,
      precioBase: prod.precioBase.toString(),
      categoria: prod.categoria || 'General',
      activo: prod.activo,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleToggleEstado = async (prod) => {
    try {
      await productosService.cambiarEstado(prod.id);
      setProductos(prev => prev.map(p => p.id === prod.id ? { ...p, activo: !p.activo } : p));
      mostrarToast(
        `Producto "${prod.nombre}" ahora está ${!prod.activo ? 'activo' : 'desactivado'}.`,
        'success'
      );
    } catch (err) {
      console.error('Error al cambiar estado del producto:', err);
      mostrarToast('No se pudo actualizar el estado del producto.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const nombreLimpio = formData.nombre.trim();
    const precio = Number(formData.precioBase);

    if (!nombreLimpio) {
      setFormError('Ingresa el nombre del producto.');
      return;
    }
    if (!precio || precio <= 0) {
      setFormError('Ingresa un precio de venta mayor a $0.');
      return;
    }

    setSubmitting(true);
    try {
      if (modoEdicion) {
        await productosService.actualizar(productoEditandoId, {
          nombre: nombreLimpio,
          precioBase: precio,
          categoria: formData.categoria.trim() || 'General',
          activo: formData.activo,
        });
        mostrarToast('¡Producto actualizado exitosamente!', 'success');
      } else {
        await productosService.crear({
          nombre: nombreLimpio,
          precioBase: precio,
          categoria: formData.categoria.trim() || 'General',
        });
        mostrarToast('¡Nuevo producto agregado al catálogo!', 'success');
      }

      setIsModalOpen(false);
      cargarProductos();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      if (err.response?.data?.detail) {
        setFormError(err.response.data.detail);
      } else {
        setFormError('Ocurrió un problema al guardar el producto.');
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

  // Categorías únicas para filtro
  const categoriasUnicas = Array.from(new Set(productos.map(p => p.categoria || 'General')));

  // Productos filtrados según búsqueda y categoría
  const productosFiltrados = productos.filter(p => {
    const coincideTexto = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          p.categoria.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCat = filtroCategoria ? p.categoria === filtroCategoria : true;
    return coincideTexto && coincideCat;
  });

  const getProductIcon = (nombre, categoria) => {
    const n = (nombre || '').toLowerCase();
    const c = (categoria || '').toLowerCase();
    if (n.includes('vaso') || c.includes('bebida') || n.includes('patilla') || n.includes('jugo')) return '🍉';
    if (n.includes('dedito') || n.includes('pastelito') || n.includes('empanada') || c.includes('frito')) return '🥟';
    if (n.includes('galleta') || c.includes('snack')) return '🍪';
    return '🥤';
  };

  return (
    <AdminLayout
      title="Productos y Precios de Venta"
      subtitle="Catálogo de venta al público sincronizado en vivo con los puntos de venta"
      actionButton={
        <button
          onClick={abrirModalCreacion}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-patilla-primary hover:bg-patilla-primary-hover text-gray-900 text-xs sm:text-sm font-black rounded-xl transition-transform active:scale-95 shadow-2xs cursor-pointer"
        >
          <Plus size={16} />
          Nuevo Producto
        </button>
      }
    >
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed top-4 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 max-w-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <div className={`p-4 rounded-xl shadow-2xl border flex items-center justify-between gap-3 ${
            toast.tipo === 'success' ? 'bg-green-800 text-white border-green-600' : 'bg-red-800 text-white border-red-600'
          }`}>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={20} className="text-green-300 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold">{toast.mensaje}</span>
            </div>
            <button onClick={() => setToast(prev => ({ ...prev, visible: false }))} className="text-white/80 hover:text-white p-1">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Tarjetas KPI Superiores */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white border border-patilla-border rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <ShoppingBag size={16} className="text-patilla-primary" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Productos</span>
          </div>
          <span className="text-2xl font-black text-gray-800">{productos.length}</span>
        </div>

        <div className="bg-white border border-patilla-border rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle2 size={16} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Activos en Caja</span>
          </div>
          <span className="text-2xl font-black text-green-700">
            {productos.filter(p => p.activo).length}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white border border-patilla-border rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Tag size={16} className="text-blue-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Categorías</span>
          </div>
          <span className="text-2xl font-black text-gray-800">{categoriasUnicas.length}</span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white border border-patilla-border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-patilla-bg border border-patilla-border rounded-xl text-xs sm:text-sm font-semibold outline-none focus:bg-white focus:border-gray-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            aria-label="Filtrar por categoría"
            className="flex-1 sm:flex-none py-2.5 px-3 bg-patilla-bg border border-patilla-border rounded-xl text-xs font-bold text-gray-700 outline-none"
          >
            <option value="">Todas las Categorías</option>
            {categoriasUnicas.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            onClick={cargarProductos}
            disabled={loading}
            title="Recargar catálogo"
            className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Grid Dinámico de Productos (Adaptado Mobile & PC) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-gray-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-xs">Cargando catálogo de productos...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-2xl border border-patilla-border p-6">
            <ShoppingBag size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-bold text-gray-600">No se encontraron productos.</p>
            <p className="text-xs text-gray-400 mt-1">Crea tu primer producto con el botón de arriba.</p>
          </div>
        ) : (
          productosFiltrados.map((prod) => {
            const icon = getProductIcon(prod.nombre, prod.categoria);
            return (
              <div
                key={prod.id}
                className={`bg-white border rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3 relative ${
                  prod.activo ? 'border-patilla-border' : 'border-gray-200 opacity-60 bg-gray-50/50'
                }`}
              >
                {/* Encabezado del Producto */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-patilla-bg rounded-xl shrink-0 select-none">
                      {icon}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-sm sm:text-base leading-tight">
                        {prod.nombre}
                      </h3>
                      <span className="inline-block mt-0.5 text-[10px] font-extrabold uppercase px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                        {prod.categoria}
                      </span>
                    </div>
                  </div>

                  {/* Estado Activo / Inactivo */}
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 border ${
                    prod.activo 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-gray-200 text-gray-600 border-gray-300'
                  }`}>
                    {prod.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Precio y Botones de Acción */}
                <div className="pt-2 border-t border-patilla-border flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Precio Venta</span>
                    <span className="text-lg sm:text-xl font-black text-gray-900">
                      {formatearDinero(prod.precioBase)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Botón Editar Precio / Datos */}
                    <button
                      onClick={() => abrirModalEdicion(prod)}
                      title="Editar producto"
                      className="px-3 py-2 bg-gray-100 hover:bg-patilla-primary text-gray-700 hover:text-gray-900 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 border border-patilla-border cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <Edit2 size={13} />
                      <span>Editar</span>
                    </button>

                    {/* Botón Switch Activar / Desactivar */}
                    <button
                      onClick={() => handleToggleEstado(prod)}
                      title={prod.activo ? 'Desactivar en puntos de venta' : 'Activar en puntos de venta'}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer active:scale-95 shadow-2xs ${
                        prod.activo
                          ? 'bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 border-patilla-border'
                          : 'bg-white hover:bg-green-50 text-gray-400 hover:text-green-600 border-patilla-border'
                      }`}
                    >
                      {prod.activo ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Crear / Editar Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center z-[60] p-3 sm:p-4 overscroll-contain animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-patilla-border">
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

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
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
