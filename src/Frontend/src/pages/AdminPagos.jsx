import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { pagosService, authService } from '../services/api';
import { DollarSign, UserPlus, X, RefreshCw, CheckCircle2, Calendar, Users, AlertCircle } from 'lucide-react';

export default function AdminPagos() {
  const [localId, setLocalId] = useState(1);
  const [pagos, setPagos] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modales
  const [isVendedorModalOpen, setIsVendedorModalOpen] = useState(false);
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form Nuevo Vendedor
  const [vendedorForm, setVendedorForm] = useState({
    nombre: '',
    email: '',
    password: '',
    localId: 1,
  });

  // Form Registrar Pago
  const [pagoForm, setPagoForm] = useState({
    localId: 1,
    vendedorId: '',
    monto: '',
    observacion: 'Día laborado',
  });

  const cargarDatos = async (idLocal) => {
    setLoading(true);
    setError('');
    try {
      const [resPagos, resUsuarios] = await Promise.allSettled([
        pagosService.obtenerPorLocal(idLocal || localId),
        authService.obtenerUsuarios(),
      ]);

      if (resPagos.status === 'fulfilled') {
        setPagos(resPagos.value.data || []);
      }
      if (resUsuarios.status === 'fulfilled') {
        const soloVendedores = (resUsuarios.value.data || []).filter(u => u.rol === 'Vendedor' || u.rol === 2);
        setVendedores(soloVendedores);
        if (soloVendedores.length > 0 && !pagoForm.vendedorId) {
          setPagoForm(prev => ({
            ...prev,
            vendedorId: soloVendedores[0].id,
            localId: soloVendedores[0].localId || 1
          }));
        }
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('No se pudo cargar la información de pagos y personal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos(localId);
  }, [localId]);

  const handleOpenVendedorModal = () => {
    setModalError('');
    setVendedorForm({ nombre: '', email: '', password: '', localId: localId });
    setIsVendedorModalOpen(true);
  };

  const handleOpenPagoModal = () => {
    setModalError('');
    setIsPagoModalOpen(true);
  };

  const handleCrearVendedor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    if (vendedorForm.password.length < 6) {
      setModalError('La contraseña debe tener al menos 6 caracteres.');
      setSubmitting(false);
      return;
    }

    try {
      await authService.register({
        nombre: vendedorForm.nombre.trim(),
        email: vendedorForm.email.trim(),
        password: vendedorForm.password,
        rol: 2, // RolUsuario.Vendedor = 2
        localId: Number(vendedorForm.localId),
      });

      setSuccessMsg(`¡Colaborador ${vendedorForm.nombre} registrado exitosamente!`);
      setTimeout(() => setSuccessMsg(''), 4500);
      setIsVendedorModalOpen(false);
      setVendedorForm({ nombre: '', email: '', password: '', localId: 1 });
      await cargarDatos(localId);
    } catch (err) {
      console.error('Error al registrar vendedor:', err);
      if (err.response?.data?.detail) {
        setModalError(err.response.data.detail);
      } else if (err.response?.data?.errors) {
        const firstKey = Object.keys(err.response.data.errors)[0];
        setModalError(err.response.data.errors[firstKey][0]);
      } else if (err.response?.data?.title) {
        setModalError(err.response.data.title);
      } else {
        setModalError('No se pudo registrar al vendedor. Verifica si el correo ya existe o los datos ingresados.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectVendedorPago = (e) => {
    const vId = Number(e.target.value);
    const vend = vendedores.find(v => v.id === vId);
    setPagoForm({
      ...pagoForm,
      vendedorId: vId,
      localId: vend?.localId || localId
    });
  };

  const handleRegistrarPago = async (e) => {
    e.preventDefault();
    if (!pagoForm.vendedorId) {
      setModalError('Debes seleccionar un colaborador para registrar el pago.');
      return;
    }

    setSubmitting(true);
    setModalError('');
    try {
      await pagosService.registrarPago({
        localId: Number(pagoForm.localId),
        vendedorId: Number(pagoForm.vendedorId),
        monto: Number(pagoForm.monto),
        observacion: pagoForm.observacion.trim(),
      });

      setSuccessMsg('Pago registrado en nómina exitosamente.');
      setTimeout(() => setSuccessMsg(''), 4500);
      setIsPagoModalOpen(false);
      setPagoForm({
        localId: localId,
        vendedorId: vendedores[0]?.id || '',
        monto: '',
        observacion: 'Día laborado',
      });
      await cargarDatos(localId);
    } catch (err) {
      console.error('Error al registrar pago:', err);
      if (err.response?.data?.detail) {
        setModalError(err.response.data.detail);
      } else if (err.response?.data?.errors) {
        const firstKey = Object.keys(err.response.data.errors)[0];
        setModalError(err.response.data.errors[firstKey][0]);
      } else {
        setModalError('Error al registrar el pago en nómina.');
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

  const totalPagos = pagos.reduce((acc, curr) => acc + (curr.monto || 0), 0);

  const getNombreVendedor = (vId) => {
    const vend = vendedores.find(v => v.id === vId);
    return vend ? vend.nombre : `Vendedor #${vId}`;
  };

  return (
    <AdminLayout
      title="Personal y Nómina"
      subtitle="Control de colaboradores, anticipos y registro de pagos diarios"
      actionButton={
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleOpenVendedorModal}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-patilla-border hover:bg-gray-50 text-gray-700 font-semibold rounded transition-colors text-xs sm:text-sm"
          >
            <UserPlus size={16} />
            Nuevo Vendedor
          </button>
          <button
            onClick={handleOpenPagoModal}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-patilla-secondary hover:bg-green-300 text-green-900 font-semibold rounded transition-colors text-xs sm:text-sm"
          >
            <DollarSign size={16} />
            Registrar Pago
          </button>
        </div>
      }
    >
      {/* Alerta de éxito general */}
      {successMsg && (
        <div className="mb-4 p-3.5 bg-green-50 border border-green-300 text-green-800 rounded-lg text-sm flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Alerta de error general (solo si no hay modales abiertos) */}
      {error && !isVendedorModalOpen && !isPagoModalOpen && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Selector de Local y Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-patilla-border rounded-lg p-4 flex items-center justify-between sm:col-span-2">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-gray-600">Local / Sede:</label>
            <select
              value={localId}
              onChange={(e) => setLocalId(Number(e.target.value))}
              className="p-2 border border-patilla-border rounded text-sm bg-patilla-bg outline-none font-medium text-gray-700"
            >
              <option value={1}>Sede Centro (Local #1)</option>
              <option value={2}>Sede Norte (Local #2)</option>
            </select>
          </div>
          <button
            onClick={() => cargarDatos(localId)}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="bg-white border border-patilla-border rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Pagado en Sede</p>
            <p className="text-xl font-bold text-gray-800">{formatearDinero(totalPagos)}</p>
          </div>
          <div className="p-2.5 bg-green-100 text-green-700 rounded">
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      {/* Tabla de Pagos Realizados */}
      <div className="bg-white border border-patilla-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-patilla-border flex items-center justify-between">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2 text-sm sm:text-base">
            <Users size={18} className="text-gray-500" />
            Historial de Pagos a Empleados
          </h4>
          <span className="text-xs text-gray-400">{pagos.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-patilla-bg text-xs text-gray-500 uppercase">
                <th className="p-3 sm:p-4 font-medium">Fecha</th>
                <th className="p-3 sm:p-4 font-medium">Trabajador / Vendedor</th>
                <th className="p-3 sm:p-4 font-medium">Concepto / Observación</th>
                <th className="p-3 sm:p-4 font-medium text-right">Monto Pagado</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-gray-400" />
                    Cargando pagos...
                  </td>
                </tr>
              ) : pagos.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400">
                    <DollarSign size={28} className="mx-auto mb-2 text-gray-300" />
                    No hay pagos registrados para este local.
                  </td>
                </tr>
              ) : (
                pagos.map((pago) => (
                  <tr key={pago.id} className="border-b border-patilla-border hover:bg-gray-50 transition-colors">
                    <td className="p-3 sm:p-4 text-gray-600 flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(pago.fechaPago).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="p-3 sm:p-4 font-semibold text-gray-800">
                      {getNombreVendedor(pago.vendedorId)}
                    </td>
                    <td className="p-3 sm:p-4 text-gray-600">
                      {pago.observacion || 'Sin observaciones'}
                    </td>
                    <td className="p-3 sm:p-4 text-right font-bold text-green-700">
                      {formatearDinero(pago.monto)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL NUEVO VENDEDOR (CON ERROR INTEGRADO DENTRO DEL MODAL) --- */}
      {isVendedorModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-patilla-border flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <UserPlus size={18} className="text-gray-700" /> Registrar Nuevo Vendedor
              </h3>
              <button
                onClick={() => setIsVendedorModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrearVendedor}>
              <div className="p-6 space-y-4">
                {/* ALERTA DE ERROR DENTRO DEL MODAL */}
                {modalError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{modalError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ana Pérez"
                    value={vendedorForm.nombre}
                    onChange={(e) => setVendedorForm({ ...vendedorForm, nombre: e.target.value })}
                    className="w-full p-2.5 border border-patilla-border rounded-lg text-sm bg-patilla-bg outline-none focus:border-gray-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico (Login)</label>
                  <input
                    type="email"
                    required
                    placeholder="ana@patilladash.com"
                    value={vendedorForm.email}
                    onChange={(e) => setVendedorForm({ ...vendedorForm, email: e.target.value })}
                    className="w-full p-2.5 border border-patilla-border rounded-lg text-sm bg-patilla-bg outline-none focus:border-gray-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Contraseña</label>
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 6 carac."
                      value={vendedorForm.password}
                      onChange={(e) => setVendedorForm({ ...vendedorForm, password: e.target.value })}
                      className="w-full p-2.5 border border-patilla-border rounded-lg text-sm bg-patilla-bg outline-none focus:border-gray-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Asignar Sede</label>
                    <select
                      value={vendedorForm.localId}
                      onChange={(e) => setVendedorForm({ ...vendedorForm, localId: Number(e.target.value) })}
                      className="w-full p-2.5 border border-patilla-border rounded-lg text-sm bg-patilla-bg outline-none font-medium"
                    >
                      <option value={1}>Sede Centro (#1)</option>
                      <option value={2}>Sede Norte (#2)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-patilla-border bg-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsVendedorModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-patilla-primary hover:bg-patilla-primary-hover text-gray-900 font-bold rounded-lg transition-colors disabled:opacity-50 shadow-xs"
                >
                  {submitting ? 'Creando...' : 'Crear Vendedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL REGISTRAR PAGO --- */}
      {isPagoModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-patilla-border flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-green-800">
                <DollarSign size={18} /> Registrar Pago en Nómina
              </h3>
              <button
                onClick={() => setIsPagoModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegistrarPago}>
              <div className="p-6 space-y-4">
                {/* ALERTA DE ERROR DENTRO DEL MODAL */}
                {modalError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{modalError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Seleccionar Trabajador / Vendedor
                  </label>
                  {vendedores.length > 0 ? (
                    <select
                      value={pagoForm.vendedorId}
                      onChange={handleSelectVendedorPago}
                      required
                      className="w-full p-2.5 border border-patilla-border rounded-lg text-sm bg-patilla-bg font-semibold text-gray-800 outline-none focus:border-gray-500"
                    >
                      {vendedores.map((vend) => (
                        <option key={vend.id} value={vend.id}>
                          👤 {vend.nombre} — {vend.nombreLocal || `Sede #${vend.localId}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded border border-red-200">
                      No hay vendedores registrados. Usa el botón "Nuevo Vendedor" primero.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Sede de Pago</label>
                    <select
                      value={pagoForm.localId}
                      onChange={(e) => setPagoForm({ ...pagoForm, localId: Number(e.target.value) })}
                      className="w-full p-2.5 border border-patilla-border rounded-lg text-sm bg-patilla-bg outline-none font-medium"
                    >
                      <option value={1}>Sede Centro (#1)</option>
                      <option value={2}>Sede Norte (#2)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Monto ($)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Ej. 60000"
                      value={pagoForm.monto}
                      onChange={(e) => setPagoForm({ ...pagoForm, monto: e.target.value })}
                      className="w-full p-2.5 border border-patilla-border rounded-lg text-sm bg-patilla-bg outline-none focus:border-gray-500 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Concepto / Observación</label>
                  <input
                    type="text"
                    placeholder="Ej. Día laborado / Turno completo / Anticipo"
                    value={pagoForm.observacion}
                    onChange={(e) => setPagoForm({ ...pagoForm, observacion: e.target.value })}
                    className="w-full p-2.5 border border-patilla-border rounded-lg text-sm bg-patilla-bg outline-none focus:border-gray-500"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-patilla-border bg-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPagoModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || vendedores.length === 0}
                  className="px-4 py-2 text-sm bg-patilla-secondary hover:bg-green-300 text-green-900 font-bold rounded-lg transition-colors disabled:opacity-50 shadow-xs"
                >
                  {submitting ? 'Registrando...' : 'Confirmar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
