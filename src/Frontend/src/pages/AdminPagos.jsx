import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { pagosService, authService } from '../services/api';
import { 
  Users, 
  DollarSign, 
  Plus, 
  Calendar, 
  UserCheck, 
  RefreshCw, 
  X, 
  Check, 
  AlertCircle, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AdminPagos() {
  const [pagos, setPagos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroLocal, setFiltroLocal] = useState('');
  const [error, setError] = useState('');

  // Paginación (10 items por página)
  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_POR_PAGINA = 10;

  // Modal registrar pago
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    vendedorId: '',
    monto: '',
    observacion: '',
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

  const cargarDatos = async (localId) => {
    setLoading(true);
    setError('');
    try {
      const [resPagos, resUsuarios] = await Promise.allSettled([
        pagosService.obtenerHistorial(localId ? Number(localId) : null),
        authService.obtenerUsuarios(),
      ]);

      if (resPagos.status === 'fulfilled') {
        setPagos(Array.isArray(resPagos.value.data) ? resPagos.value.data : []);
        setPaginaActual(1);
      } else {
        console.error('Error al cargar pagos:', resPagos.reason);
        setError('No se pudo cargar el historial de nómina.');
      }

      if (resUsuarios.status === 'fulfilled') {
        const u = Array.isArray(resUsuarios.value.data) ? resUsuarios.value.data : [];
        setUsuarios(u);
        setFormData(prev => {
          if (!prev.vendedorId && u.length > 0) {
            return { ...prev, vendedorId: u[0].id };
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('No se pudo cargar la información de nómina.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos(filtroLocal);
  }, [filtroLocal]);

  // Paginación calculada protegida contra fallos
  const listadoPagos = Array.isArray(pagos) ? pagos : [];
  const totalPaginas = Math.ceil(listadoPagos.length / ITEMS_POR_PAGINA) || 1;
  const pagosPaginados = listadoPagos.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.monto || Number(formData.monto) <= 0) {
      setFormError('Ingresa un monto válido mayor a 0.');
      return;
    }
    if (!formData.vendedorId) {
      setFormError('Selecciona un trabajador.');
      return;
    }

    setSubmitting(true);
    try {
      const usuarioSel = usuarios.find(u => u.id === Number(formData.vendedorId));
      const localEfectivo = (usuarioSel?.localId && usuarioSel.localId > 0)
        ? usuarioSel.localId
        : (filtroLocal ? Number(filtroLocal) : 1);

      await pagosService.registrarPago({
        localId: localEfectivo,
        vendedorId: Number(formData.vendedorId),
        monto: Number(formData.monto),
        observacion: formData.observacion.trim() || undefined,
      });

      setIsModalOpen(false);
      setFormData(prev => ({
        ...prev,
        monto: '',
        observacion: '',
      }));
      await cargarDatos(filtroLocal);
    } catch (err) {
      console.error('Error al registrar pago:', err);
      setFormError(err.response?.data?.detail || err.response?.data?.title || 'Error al registrar el pago en el servidor.');
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

  const formatearFecha = (fechaValor) => {
    if (!fechaValor) return '-';
    const fecha = new Date(fechaValor);
    return isNaN(fecha.getTime()) ? '-' : fecha.toLocaleDateString('es-CO');
  };

  const totalPagos = listadoPagos.reduce((acc, curr) => acc + (Number(curr?.monto) || 0), 0);

  return (
    <AdminLayout
      title="Personal y Pagos de Nómina"
      subtitle="Registro de pagos a colaboradores y control de egresos laborales"
      actionButton={
        <button
          onClick={() => {
            setFormError('');
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-patilla-primary hover:bg-patilla-primary-hover text-gray-900 text-xs sm:text-sm font-black rounded-xl transition-transform active:scale-95 shadow-2xs cursor-pointer"
        >
          <Plus size={16} />
          Registrar Pago
        </button>
      }
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* KPI Resumen */}
      <div className="bg-white border border-patilla-border rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider block">Total Nómina Pagada</span>
          <span className="text-2xl sm:text-3xl font-black text-gray-800">{formatearDinero(totalPagos)}</span>
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
            onClick={() => cargarDatos(filtroLocal)}
            disabled={loading}
            title="Recargar pagos"
            className="p-2.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tabla Responsiva de Pagos */}
      <div className="bg-white border border-patilla-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[580px]">
            <thead>
              <tr className="bg-patilla-bg text-[11px] text-gray-500 uppercase tracking-wider">
                <th className="p-3.5 font-bold">Fecha</th>
                <th className="p-3.5 font-bold">Colaborador</th>
                <th className="p-3.5 font-bold">Sede</th>
                <th className="p-3.5 font-bold">Concepto / Nota</th>
                <th className="p-3.5 font-bold text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-gray-400" />
                    Cargando nómina...
                  </td>
                </tr>
              ) : listadoPagos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    <UserCheck size={28} className="mx-auto mb-2 text-gray-300" />
                    No hay pagos registrados para el filtro seleccionado.
                  </td>
                </tr>
              ) : (
                pagosPaginados.map((p) => (
                  <tr key={p.id} className="border-b border-patilla-border hover:bg-gray-50 transition-colors">
                    <td className="p-3.5 text-gray-600 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{formatearFecha(p.fechaPago || p.fecha)}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-gray-800 text-xs sm:text-sm">
                      {p.nombreVendedor || `Colaborador #${p.vendedorId || '-'}`}
                    </td>
                    <td className="p-3.5 text-gray-600 text-xs">
                      {p.nombreLocal || (p.localId ? `Sede #${p.localId}` : '-')}
                    </td>
                    <td className="p-3.5 text-gray-500 text-xs">{p.observacion || '-'}</td>
                    <td className="p-3.5 text-right font-black text-gray-900 text-xs sm:text-sm">
                      {formatearDinero(p.monto)}
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

      {/* --- MODAL REGISTRAR PAGO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center z-[60] p-3 sm:p-4 overscroll-contain animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-patilla-border overscroll-contain">
            <div className="p-4 sm:p-5 border-b border-patilla-border flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                <DollarSign size={18} className="text-green-700" /> Registrar Pago a Colaborador
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Colaborador / Vendedor</label>
                <select
                  value={formData.vendedorId}
                  onChange={(e) => setFormData({ ...formData, vendedorId: e.target.value })}
                  className="w-full p-3 border border-patilla-border rounded-xl text-sm bg-patilla-bg outline-none font-bold"
                >
                  {usuarios.length === 0 ? (
                    <option value="">No hay colaboradores disponibles</option>
                  ) : (
                    usuarios.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.nombre} ({u.nombreLocal || (u.localId ? `Sede #${u.localId}` : 'Sede General')})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Monto Pagado ($ COP)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  required
                  placeholder="Ej. 50000"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  className="w-full p-3 border border-patilla-border rounded-xl text-sm bg-patilla-bg outline-none font-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Concepto / Observación</label>
                <input
                  type="text"
                  placeholder="Ej. Pago turno completo + transporte"
                  value={formData.observacion}
                  onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
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
                  disabled={submitting || usuarios.length === 0}
                  className="flex-1 px-4 py-2.5 text-xs font-bold bg-patilla-primary hover:bg-patilla-primary-hover text-gray-900 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  {submitting ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  Registrar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
