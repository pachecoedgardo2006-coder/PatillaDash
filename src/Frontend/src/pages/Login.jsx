import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Si el usuario ya está autenticado, redirigir automáticamente
  useEffect(() => {
    if (!authLoading && user) {
      const targetPath = user.rol === 'Administrador' ? '/admin' : '/vendedor';
      navigate(targetPath, { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      
      // 1. Guardar sesión en Context y LocalStorage
      login(response.data);

      // 2. Redirección inmediata y limpia garantizada
      const targetPath = response.data.rol === 'Administrador' ? '/admin' : '/vendedor';
      window.location.replace(targetPath);
    } catch (err) {
      setLoading(false);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0]?.[0];
        setError(firstError || 'Datos de inicio de sesión inválidos.');
      } else if (err.response?.data?.title) {
        setError(err.response.data.title);
      } else {
        setError('No se pudo conectar con el servidor backend.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-patilla-bg">
      <div className="bg-white border border-patilla-border p-6 sm:p-8 rounded-2xl max-w-md w-full shadow-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-patilla-primary/30 mb-3 text-3xl">
            🍉
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">PatillaDash</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Gestión Inteligente de Bebidas Artesanales</p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-start gap-2 animate-in fade-in">
            <AlertCircle size={17} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5 text-gray-700">Correo Electrónico</label>
            <div className="relative">
              <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@patilladash.com"
                className="w-full pl-9 pr-3.5 py-3 bg-patilla-bg border border-patilla-border rounded-xl outline-none focus:border-gray-500 focus:bg-white text-sm font-medium transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 text-gray-700">Contraseña</label>
            <div className="relative">
              <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-3 bg-patilla-bg border border-patilla-border rounded-xl outline-none focus:border-gray-500 focus:bg-white text-sm font-medium transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-patilla-primary hover:bg-patilla-primary-hover text-gray-900 font-bold rounded-xl text-sm transition-transform active:scale-98 disabled:opacity-50 cursor-pointer shadow-2xs flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Ingresando...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-patilla-border text-center">
          <p className="text-[11px] text-gray-400">
            Acceso administrativo y puntos de venta móviles
          </p>
        </div>
      </div>
    </div>
  );
}
