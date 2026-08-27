import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Inicialización síncrona instantánea desde LocalStorage para eliminar retrasos de render
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (storedUser && token) {
        return JSON.parse(storedUser);
      }
    } catch (e) {
      console.warn('Advertencia al leer usuario de localStorage (Safari/iOS):', e);
    }
    return null;
  });

  const [loading] = useState(false);

  const login = (data) => {
    const userData = {
      id: data.id || data.usuarioId,
      usuarioId: data.id || data.usuarioId,
      nombre: data.nombre,
      email: data.email,
      rol: data.rol,
      localId: data.localId,
    };
    try {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (e) {
      console.warn('Advertencia al escribir en localStorage (Safari/iOS):', e);
    }
    setUser(userData);
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {
      console.warn('Advertencia al limpiar localStorage:', e);
    }
    setUser(null);
    window.location.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
