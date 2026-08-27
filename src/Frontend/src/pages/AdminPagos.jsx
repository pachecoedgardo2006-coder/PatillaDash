import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { pagosService, authService } from '../services/api';
import { formatearFecha } from '../utils/fechas';
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
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Mail,
  MapPin,
  Shield
} from 'lucide-react';

export default function AdminPagos() {
  const [vistaActiva, setVistaActiva] = useState('personal'); // 'personal' | 'pagos'
  const [pagos, setPagos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroLocal, setFiltroLocal] = useState('');
  const [error, setError] = useState('');
  const [exitoToast, setExitoToast] = useState('');

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

  // Modal registrar nuevo colaborador
  const [isModalUsuarioOpen, setIsModalUsuarioOpen] = useState(false);
  const [submittingUsuario, setSubmittingUsuario] = useState(false);
  const [formUsuarioError, setFormUsuarioError] = useState('');
  const [formUsuarioData, setFormUsuarioData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'Vendedor',
    localId: '1',
  });

  // Bloqueo de scroll del fondo cuando cualquiera de los modales está abierto
  useEffect(() => {
    if (isModalOpen || isModalUsuarioOpen) {
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
  }, [isModalOpen, isModalUsuarioOpen]);

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
      }

      if (resUsuarios.status === 'fulfilled') {
        const u = Array.isArray(resUsuarios.value.data) ? resUsuarios.value.data : [];
        setUsuarios(u);
        setFormData(prev => {
          if (!prev.vendedorId && u.length > 0) {
            const primerVendedor = u.find(x => x.rol === 'Vendedor') || u[0];
            return { ...prev, vendedorId: primerVendedor.id };
          }
          return prev;
        });
      } else {
        console.error('Error al cargar usuarios:', resUsuarios.reason);
      }

      if (resPagos.status === 'rejected' && resUsuarios.status === 'rejected') {
        setError('No se pudo conectar con el servidor para consultar nómina y personal.');
      }
    } catch (err) {
      console.error('Error inesperado al cargar datos:', err);
      setError('Ocurrió un error inesperado al consultar la información.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos(filtroLocal);
  }, [filtroLocal]);

  // Lista de usuarios filtrada para la vista
  const usuariosFiltrados = filtroLocal
    ? usuarios.filter(u => u.localId === Number(filtroLocal))
    : usuarios;

  // Paginación calculada para pagos
  const listadoPagos = Array.isArray(pagos) ? pagos : [];
  const totalPaginas = Math.ceil(listadoPagos.length / ITEMS_POR_PAGINA) || 1;
  const pagosPaginados = listadoPagos.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  const abrirModalPagoPara = (usuario) => {
    setFormError('');
    setFormData({
      vendedorId: usuario ? usuario.id : (usuarios[0]?.id || ''),
      monto: '',
      observacion: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmitPago = async (e) => {
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
      setExitoToast('Pago registrado exitosamente.');
      setTimeout(() => setExitoToast(''), 4000);
      await cargarDatos(filtroLocal);
    } catch (err) {
      console.error('Error al registrar pago:', err);
      setFormError(err.response?.data?.detail || err.response?.data?.title || 'Error al registrar el pago en el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitNuevoUsuario = async (e) => {
    e.preventDefault();
    setFormUsuarioError('');

    if (!formUsuarioData.nombre.trim()) {
      setFormUsuarioError('El nombre del colaborador es obligatorio.');
      return;
    }
    if (!formUsuarioData.email.trim()) {
      setFormUsuarioError('El correo es obligatorio.');
      return;
    }
    if (!formUsuarioData.password || formUsuarioData.password.length < 6) {
      setFormUsuarioError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setSubmittingUsuario(true);
    try {
      await authService.register({
        nombre: formUsuarioData.nombre.trim(),
        email: formUsuarioData.email.trim().toLowerCase(),
        password: formUsuarioData.password,
        rol: formUsuarioData.rol,
        localId: Number(formUsuarioData.localId),
      });

      setIsModalUsuarioOpen(false);
      setFormUsuarioData({
        nombre: '',
        email: '',
        password: '',
        rol: 'Vendedor',
        localId: '1',
      });
      setExitoToast('Nuevo colaborador registrado exitosamente.');
      setTimeout(() => setExitoToast(''), 4000);
      await cargarDatos(filtroLocal);
    } catch (err) {
      console.error('Error al registrar colaborador:', err);
      const msj = err.response?.data?.detail 
        || err.response?.data?.message 
        || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : null)
        || 'Error al registrar el colaborador en el servidor.';
      setFormUsuarioError(msj);
    } finally {
      setSubmittingUsuario(false);
    }
  };

  const formatearDinero = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(monto || 0);
  };

  const totalPagos = listadoPagos.reduce((acc, curr) => acc + (Number(curr?.monto) || 0), 0);

  const obtenerTotalPagadoAColaborador = (colaboradorId) => {
    return listadoPagos
      .filter(p => Number(p.vendedorId) === Number(colaboradorId))
      .reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);
  };

  return (
    <AdminLayout
      title="Personal y Pagos de Nómina"
      subtitle="Colaboradores asignados por sede y registro de pagos laborales"
      actionButton={
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setFormUsuarioError('');
              setIsModalUsuarioOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-patilla-border hover:bg-gray-50 text-gray-800 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <UserPlus size={16} className="text-gray-600" />
            Nuevo Colaborador
          </button>
          <button
            onClick={() => abrirModalPagoPara()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-patilla-primary hover:bg-patilla-primary-hover text-gray-900 text-xs sm:text-sm font-black rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            Registrar Pago
          </button>
        </div>
      }
    >
      {/* Toast de notificación de éxito */}
      {exitoToast && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm flex items-center gap-2 font-bold animate-in fade-in transition-all shadow-2xs">
          <CheckCircle size={17} className="text-emerald-600 shrink-0" />
          <span>{exitoToast}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-center gap-2 font-bold">
          <AlertCircle size={17} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Selector de Pestañas de Vista */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="inline-flex p-1 bg-gray-100/90 rounded-2xl border border-gray-200">
          <button
            onClick={() => setVistaActiva('personal')}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              vistaActiva === 'personal'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Users size={16} className={vistaActiva === 'personal' ? 'text-patilla-accent' : ''} />
            Colaboradores ({usuariosFiltrados.length})
          </button>
          <button
            onClick={() => setVistaActiva('pagos')}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              vistaActiva === 'pagos'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <DollarSign size={16} className={vistaActiva === 'pagos' ? 'text-emerald-600' : ''} />
            Historial de Nómina ({listadoPagos.length})
          </button>
        </div>

        {/* Filtro de Sede Compartido */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-700 shrink-0">Sede:</label>
          <select
            value={filtroLocal}
            onChange={(e) => setFiltroLocal(e.target.value)}
            className="p-2.5 border border-patilla-border rounded-xl text-xs sm:text-sm bg-white outline-none font-bold text-gray-800 shadow-2xs"
          >
            <option value="">Todas las sedes</option>
            <option value="1">Punto de la 30 (#1)</option>
            <option value="2">Punto de la 27 (#2)</option>
          </select>
          <button
            onClick={() => cargarDatos(filtroLocal)}
            disabled={loading}
            title="Recargar información"
            className="p-2.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors shrink-0 cursor-pointer shadow-2xs bg-white border border-patilla-border"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* --- VISTA 1: PERSONAL / COLABORADORES --- */}
      {vistaActiva === 'personal' && (
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white border border-patilla-border rounded-2xl p-12 text-center text-gray-400">
              <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-patilla-accent" />
              <p className="text-sm font-bold">Cargando la lista de colaboradores...</p>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="bg-white border border-patilla-border rounded-2xl p-12 text-center text-gray-400">
              <Users size={36} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-bold text-gray-600 mb-1">No hay colaboradores registrados para este filtro.</p>
              <p className="text-xs text-gray-400">Haz clic en &quot;Nuevo Colaborador&quot; para vincular personal al equipo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usuariosFiltrados.map((colaborador) => {
                const totalCobrado = obtenerTotalPagadoAColaborador(colaborador.id);
                const esAdmin = colaborador.rol === 'Administrador';

                return (
                  <div 
                    key={colaborador.id} 
                    className="bg-white border border-patilla-border rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between min-w-0"
                  >
                    <div>
                      {/* Cabecera del colaborador con avatar y nombre */}
                      <div className="flex items-center gap-3 mb-3.5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-xs ${
                          esAdmin ? 'bg-indigo-600' : 'bg-patilla-dark'
                        }`}>
                          {colaborador.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-gray-900 text-sm truncate" title={colaborador.nombre}>
                            {colaborador.nombre}
                          </h4>
                          <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1 mt-0.5 truncate" title={colaborador.email}>
                            <Mail size={12} className="shrink-0 text-gray-400" />
                            <span className="truncate">{colaborador.email}</span>
                          </span>
                        </div>
                      </div>

                      {/* Detalles organizados: Rol, Sede y Total Pagado */}
                      <div className="bg-patilla-bg/70 rounded-xl p-3 mb-4 space-y-2 border border-patilla-border/60 text-xs">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-gray-500 font-bold flex items-center gap-1.5 shrink-0">
                            <Shield size={13} className="text-gray-400 shrink-0" /> Rol:
                          </span>
                          <span className={`text-[10px] uppercase tracking-wider font-black px-2.5 py-0.5 rounded-md shrink-0 ${
                            esAdmin 
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {colaborador.rol}
                          </span>
                        </div>

                        <div className="flex justify-between items-center gap-2">
                          <span className="text-gray-500 font-bold flex items-center gap-1.5 shrink-0">
                            <MapPin size={13} className="text-gray-400 shrink-0" /> Sede:
                          </span>
                          <span className="font-extrabold text-gray-800 truncate text-right max-w-[170px]" title={colaborador.nombreLocal}>
                            {colaborador.nombreLocal || (colaborador.localId ? `Sede #${colaborador.localId}` : 'Sede General')}
                          </span>
                        </div>

                        <div className="flex justify-between items-center gap-2 border-t border-patilla-border/40 pt-2">
                          <span className="text-gray-500 font-bold flex items-center gap-1.5 shrink-0">
                            <DollarSign size={13} className="text-gray-400 shrink-0" /> Total Pagado:
                          </span>
                          <span className="font-black text-emerald-700 text-sm shrink-0">
                            {formatearDinero(totalCobrado)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botón de Acción Directa */}
                    <button
                      onClick={() => abrirModalPagoPara(colaborador)}
                      className="w-full py-2.5 px-3 bg-patilla-primary/20 hover:bg-patilla-primary text-gray-900 border border-patilla-primary text-xs font-black rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <DollarSign size={14} className="text-gray-800" />
                      Registrar Pago a {colaborador.nombre.split(' ')[0]}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- VISTA 2: HISTORIAL DE PAGOS --- */}
      {vistaActiva === 'pagos' && (
        <div className="space-y-6">
          {/* KPI Resumen */}
          <div className="bg-white border border-patilla-border rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider block">Total Nómina Pagada</span>
              <span className="text-2xl sm:text-3xl font-black text-gray-800">{formatearDinero(totalPagos)}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider block">Recibos de Pago</span>
              <span className="text-2xl sm:text-3xl font-black text-gray-800">{listadoPagos.length}</span>
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
        </div>
      )}

      {/* --- MODAL 1: REGISTRAR PAGO --- */}
      {isModalOpen && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }} className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center z-[60] p-3 sm:p-4 overscroll-contain animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-patilla-border overscroll-contain">
            <div className="p-4 sm:p-5 border-b border-patilla-border flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-600" /> Registrar Pago a Colaborador
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitPago} className="p-4 sm:p-5 space-y-4 overflow-y-auto overscroll-contain touch-pan-y flex-1">
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
                  placeholder="Ej. Pago turno domingo + bono"
                  value={formData.observacion}
                  onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                  className="w-full p-3 border border-patilla-border rounded-xl text-sm bg-patilla-bg outline-none font-medium"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-patilla-primary hover:bg-patilla-primary-hover text-gray-900 font-black text-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {submitting ? <RefreshCw size={18} className="animate-spin" /> : <Check size={18} />}
                  Confirmar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: REGISTRAR NUEVO COLABORADOR --- */}
      {isModalUsuarioOpen && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setIsModalUsuarioOpen(false); }} className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center z-[60] p-3 sm:p-4 overscroll-contain animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-patilla-border overscroll-contain">
            <div className="p-4 sm:p-5 border-b border-patilla-border flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                <UserPlus size={18} className="text-patilla-accent" /> Registrar Nuevo Colaborador
              </h3>
              <button
                onClick={() => setIsModalUsuarioOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitNuevoUsuario} className="p-4 sm:p-5 space-y-4 overflow-y-auto overscroll-contain touch-pan-y flex-1">
              {formUsuarioError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={15} /> {formUsuarioError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Mendoza"
                  value={formUsuarioData.nombre}
                  onChange={(e) => setFormUsuarioData({ ...formUsuarioData, nombre: e.target.value })}
                  className="w-full p-3 border border-patilla-border rounded-xl text-sm bg-patilla-bg outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico (Login)</label>
                <input
                  type="email"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  placeholder="Ej. carlos@patilladash.com"
                  value={formUsuarioData.email}
                  onChange={(e) => setFormUsuarioData({ ...formUsuarioData, email: e.target.value })}
                  className="w-full p-3 border border-patilla-border rounded-xl text-base sm:text-sm bg-patilla-bg outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Contraseña Inicial</label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={formUsuarioData.password}
                  onChange={(e) => setFormUsuarioData({ ...formUsuarioData, password: e.target.value })}
                  className="w-full p-3 border border-patilla-border rounded-xl text-base sm:text-sm bg-patilla-bg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Rol</label>
                  <select
                    value={formUsuarioData.rol}
                    onChange={(e) => setFormUsuarioData({ ...formUsuarioData, rol: e.target.value })}
                    className="w-full p-3 border border-patilla-border rounded-xl text-xs sm:text-sm bg-patilla-bg outline-none font-bold"
                  >
                    <option value="Vendedor">Vendedor</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Sede Asignada</label>
                  <select
                    value={formUsuarioData.localId}
                    onChange={(e) => setFormUsuarioData({ ...formUsuarioData, localId: e.target.value })}
                    className="w-full p-3 border border-patilla-border rounded-xl text-xs sm:text-sm bg-patilla-bg outline-none font-bold"
                  >
                    <option value="1">Punto de la 30 (#1)</option>
                    <option value="2">Punto de la 27 (#2)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalUsuarioOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingUsuario}
                  className="flex-1 py-3 px-4 rounded-xl bg-patilla-primary hover:bg-patilla-primary-hover text-gray-900 font-black text-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {submittingUsuario ? <RefreshCw size={18} className="animate-spin" /> : <UserPlus size={18} />}
                  Registrar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
