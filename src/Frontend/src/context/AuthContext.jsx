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
      console.error('Error al parsear usuario de localStorage:', e);
    }
    return null;
  });

  const [loading] = useState(false);

  const login = (data) => {
    const userData = {
      nombre: data.nombre,
      email: data.email,
      rol: data.rol,
      localId: data.localId,
    };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
