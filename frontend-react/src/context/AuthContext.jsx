import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('c2_token') || null);

  useEffect(() => {
    if (token) {
      const savedUser = localStorage.getItem('c2_user');
      if (savedUser) setUsuario(JSON.parse(savedUser));
    }
  }, [token]);

  const login = (tokenData, userData) => {
    localStorage.setItem('c2_token', tokenData);
    localStorage.setItem('c2_user', JSON.stringify(userData));
    setToken(tokenData);
    setUsuario(userData);
  };

  const logout = () => {
    localStorage.removeItem('c2_token');
    localStorage.removeItem('c2_user');
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};