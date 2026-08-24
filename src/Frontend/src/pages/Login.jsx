import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      login(response.data);

      if (response.data.rol === 'Administrador') {
        navigate('/admin');
      } else {
        navigate('/vendedor');
      }
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0]?.[0];
        setError(firstError || 'Datos de inicio de sesión inválidos.');
      } else if (err.response?.data?.title) {
        setError(err.response.data.title);
      } else {
        setError('No se pudo conectar con el servidor backend (http://localhost:5136).');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-patilla-bg">
      <div className="bg-white border border-patilla-border p-8 rounded-lg max-w-md w-full shadow-xs">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-700">🍉 PatillaDash</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de Bebidas Artesanales</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@patilladash.com"
              className="w-full p-2.5 bg-gray-50 border border-patilla-border rounded outline-none focus:border-gray-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 bg-gray-50 border border-patilla-border rounded outline-none focus:border-gray-400 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-patilla-primary hover:bg-patilla-primary-hover text-gray-800 font-semibold rounded text-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
