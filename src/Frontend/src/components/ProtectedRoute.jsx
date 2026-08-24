import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    const redirectPath = user.rol === 'Administrador' ? '/admin' : '/vendedor';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}