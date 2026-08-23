import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas Públicas
import Login from './pages/Login';

// Páginas de Vendedor
import VendedorDashboard from './pages/VendedorDashboard';

// Páginas de Administrador
import AdminDashboard from './pages/AdminDashboard';
import AdminInventario from './pages/AdminInventario';
import AdminPagos from './pages/AdminPagos';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta Pública */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas de Vendedor */}
          <Route
            path="/vendedor"
            element={
              <ProtectedRoute allowedRoles={['Vendedor']}>
                <VendedorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Rutas de Administrador */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Administrador']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/inventario"
            element={
              <ProtectedRoute allowedRoles={['Administrador']}>
                <AdminInventario />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/pagos"
            element={
              <ProtectedRoute allowedRoles={['Administrador']}>
                <AdminPagos />
              </ProtectedRoute>
            }
          />

          {/* Ruta por defecto (Redirige al login si la URL no existe) */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}