import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RefreshCw } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  // Comprobación segura (Context State con fallback instantáneo a localStorage)
  let currentUser = user;
  if (!currentUser) {
    try {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (stored && token) {
        currentUser = JSON.parse(stored);
      }
    } catch {
      currentUser = null;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-patilla-bg">
        <RefreshCw size={28} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.rol)) {
    const redirectPath = currentUser.rol === 'Administrador' ? '/admin' : '/vendedor';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
