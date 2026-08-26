import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas Públicas
import Login from './pages/Login';

// Páginas de Vendedor
import VendedorDashboard from './pages/VendedorDashboard';

// Páginas de Administrador
import AdminDashboard from './pages/AdminDashboard';
import AdminVentas from './pages/AdminVentas';
import AdminInventario from './pages/AdminInventario';
import AdminCompras from './pages/AdminCompras';
import AdminPagos from './pages/AdminPagos';
import AdminProductos from './pages/AdminProductos';

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
            path="/admin/ventas"
            element={
              <ProtectedRoute allowedRoles={['Administrador']}>
                <AdminVentas />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/productos"
            element={
              <ProtectedRoute allowedRoles={['Administrador']}>
                <AdminProductos />
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
            path="/admin/compras"
            element={
              <ProtectedRoute allowedRoles={['Administrador']}>
                <AdminCompras />
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

          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
