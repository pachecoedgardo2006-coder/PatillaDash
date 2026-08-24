import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { pagosService, authService } from '../services/api';
import { DollarSign, UserPlus, X, RefreshCw, CheckCircle2, Calendar, Users } from 'lucide-react';

export default function AdminPagos() {
  const [localId, setLocalId] = useState(1);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modales
  const [isVendedorModalOpen, setIsVendedorModalOpen] = useState(false);
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    vendedorId: 1,
    monto: '',
    observacion: 'Día laborado',
  });

  const cargarPagos = async (idLocal) => {
    setLoading(true);
    setError('');
    try {
      const response = await pagosService.obtenerPorLocal(idLocal || localId);
      setPagos(response.data || []);
    } catch (err) {
      console.error('Error al cargar pagos:', err);
      setError('No se pudo cargar el historial de pagos del local.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPagos(localId);
  }, [localId]);

  const handleCrearVendedor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await authService.register({
        nombre: vendedorForm.nombre.trim(),
        email: vendedorForm.email.trim(),
        password: vendedorForm.password,
        rol: 'Vendedor',
        localId: Number(vendedorForm.localId),
      });

      setSuccessMsg(`Colaborador ${vendedorForm.nombre} registrado exitosamente.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsVendedorModalOpen(false);
      setVendedorForm({ nombre: '', email: '', password: '', localId: 1 });
    } catch (err) {
      console.error('Error al registrar vendedor:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('No se pudo registrar al vendedor. Verifica si el correo ya existe.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegistrarPago = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await pagosService.registrarPago({
        localId: Number(pagoForm.localId),
        vendedorId: Number(pagoForm.vendedorId),
        monto: Number(pagoForm.monto),
        observacion: pagoForm.observacion.trim(),
      });

      setSuccessMsg('Pago registrado en nómina exitosamente.');
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsPagoModalOpen(false);
      setPagoForm({
        localId: localId,
        vendedorId: 1,
        monto: '',
        observacion: 'Día laborado',
      });
      await cargarPagos(localId);
    } catch (err) {
      console.error('Error al registrar pago:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Error al registrar el pago.');
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

  return (
    <AdminLayout
      title="Personal y Nómina"
      subtitle="Control de colaboradores, anticipos y registro de pagos diarios"
      actionButton={
        <div className="flex gap-2">
          <button
            onClick={() => setIsVendedorModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-patilla-border hover:bg-gray-50 text-gray-700 font-semibold rounded transition-colors text-sm"
          >
            <UserPlus size={18} />
            Nuevo Vendedor
          </button>
          <button
            onClick={() => setIsPagoModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-patilla-secondary hover:bg-green-300 text-green-900 font-semibold rounded transition-colors text-sm"
          >
            <DollarSign size={18} />
            Registrar Pago
          </button>
        </div>
      }
    >
      {/* Alertas */}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-300 text-green-800 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
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
            onClick={() => cargarPagos(localId)}
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
          <h4 className="font-semibold text-gray-700 flex items-center gap-2">
            <Users size={18} className="text-gray-500" />
            Historial de Pagos a Empleados
          </h4>
          <span className="text-xs text-gray-400">{pagos.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-patilla-bg text-xs text-gray-500 uppercase">
                <th className="p-4 font-medium">Fecha</th>
                <th className="p-4 font-medium">ID Vendedor</th>
                <th className="p-4 font-medium">Concepto / Observación</th>
                <th className="p-4 font-medium text-right">Monto Pagado</th>
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
                    <td className="p-4 text-gray-600 flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(pago.fechaPago).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="p-4 font-semibold text-gray-700">
                      Vendedor #{pago.vendedorId}
                    </td>
                    <td className="p-4 text-gray-600">
                      {pago.observacion || 'Sin observaciones'}
                    </td>
                    <td className="p-4 text-right font-bold text-green-700">
                      {formatearDinero(pago.monto)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL NUEVO VENDEDOR --- */}
      {isVendedorModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-4 border-b border-patilla-border flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <UserPlus size={18} /> Registrar Vendedor
              </h3>
              <button
                onClick={() => setIsVendedorModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrearVendedor}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ana Pérez"
                    value={vendedorForm.nombre}
                    onChange={(e) => setVendedorForm({ ...vendedorForm, nombre: e.target.value })}
                    className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none focus:border-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Correo Electrónico (Para Login)</label>
                  <input
                    type="email"
                    required
                    placeholder="ana@patilladash.com"
                    value={vendedorForm.email}
                    onChange={(e) => setVendedorForm({ ...vendedorForm, email: e.target.value })}
                    className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none focus:border-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Contraseña</label>
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 6 caract."
                      value={vendedorForm.password}
                      onChange={(e) => setVendedorForm({ ...vendedorForm, password: e.target.value })}
                      className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none focus:border-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Asignar Sede</label>
                    <select
                      value={vendedorForm.localId}
                      onChange={(e) => setVendedorForm({ ...vendedorForm, localId: e.target.value })}
                      className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none"
                    >
                      <option value="1">Sede Centro (#1)</option>
                      <option value="2">Sede Norte (#2)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-patilla-border bg-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsVendedorModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-patilla-primary hover:bg-patilla-primary-hover text-gray-800 font-bold rounded transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creando...' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL REGISTRAR PAGO --- */}
      {isPagoModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-4 border-b border-patilla-border flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-green-700">
                <DollarSign size={18} /> Registrar Pago a Personal
              </h3>
              <button
                onClick={() => setIsPagoModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegistrarPago}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Sede</label>
                    <select
                      value={pagoForm.localId}
                      onChange={(e) => setPagoForm({ ...pagoForm, localId: e.target.value })}
                      className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none"
                    >
                      <option value="1">Sede Centro (#1)</option>
                      <option value="2">Sede Norte (#2)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">ID Vendedor</label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Ej. 1"
                      value={pagoForm.vendedorId}
                      onChange={(e) => setPagoForm({ ...pagoForm, vendedorId: e.target.value })}
                      className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none focus:border-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Monto a Pagar ($)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Ej. 60000"
                    value={pagoForm.monto}
                    onChange={(e) => setPagoForm({ ...pagoForm, monto: e.target.value })}
                    className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none focus:border-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Concepto / Observación</label>
                  <input
                    type="text"
                    placeholder="Ej. Turno completo del día / Bono"
                    value={pagoForm.observacion}
                    onChange={(e) => setPagoForm({ ...pagoForm, observacion: e.target.value })}
                    className="w-full p-2.5 border border-patilla-border rounded text-sm bg-patilla-bg outline-none focus:border-gray-400"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-patilla-border bg-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPagoModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-patilla-secondary hover:bg-green-300 text-green-900 font-bold rounded transition-colors disabled:opacity-50"
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
