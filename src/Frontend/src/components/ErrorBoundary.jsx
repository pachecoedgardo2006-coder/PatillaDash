import React from 'react';
import { RefreshCw, AlertTriangle, LogOut } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un fallo visual en la vista:', error, errorInfo);
  }

  handleReload = () => {
    // Recarga la aplicación conservando la sesión activa del usuario
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleLogoutReset = () => {
    // Solo si el usuario explícitamente desea reiniciar su sesión
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {
      // Ignorar errores de storage en iOS privado
    }
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4 bg-patilla-bg">
          <div className="bg-white border border-patilla-border p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 mb-4 shadow-2xs">
              <AlertTriangle size={28} />
            </div>
            
            <h2 className="text-xl font-black text-gray-800 mb-2">
              Algo inesperado ocurrió en la vista
            </h2>
            
            <p className="text-xs sm:text-sm text-gray-500 mb-6 font-medium">
              Se presentó un detalle inesperado al procesar la pantalla. Puedes reintentar sin perder tu sesión activa.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={this.handleReload}
                className="w-full py-3.5 bg-patilla-primary hover:bg-patilla-primary-hover text-gray-900 font-extrabold rounded-xl text-sm transition-transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
              >
                <RefreshCw size={16} /> Reintentar y Continuar
              </button>

              <button
                onClick={this.handleLogoutReset}
                className="w-full py-2.5 text-xs text-gray-400 hover:text-red-600 font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut size={13} /> Cerrar sesión y volver al login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
