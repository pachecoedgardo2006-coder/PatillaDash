import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4 bg-patilla-bg">
          <div className="bg-white border border-patilla-border p-6 sm:p-8 rounded-2xl max-w-md w-full shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 mb-4">
              <AlertTriangle size={28} />
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Algo inesperado ocurrió
            </h2>
            
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              La aplicación detectó una inconsistencia visual en la pantalla. Puedes reiniciar la sesión de forma segura.
            </p>

            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-patilla-primary hover:bg-patilla-primary-hover text-gray-900 font-bold rounded-xl text-sm transition-transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
