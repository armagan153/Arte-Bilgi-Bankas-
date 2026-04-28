import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin]           = useState(false);
  const [isReader, setIsReader]         = useState(false);
  const [authLoading, setAuthLoading]   = useState(true);

  // Oturumları sessionStorage'dan geri yükle
  useEffect(() => {
    const readerStored = sessionStorage.getItem('arte_reader');
    if (readerStored === 'true') setIsReader(true);

    const adminStored = sessionStorage.getItem('arte_admin');
    if (adminStored === 'true') setIsAdmin(true);

    setAuthLoading(false);
  }, []);

  const loginAsReader = () => {
    setIsReader(true);
    sessionStorage.setItem('arte_reader', 'true');
  };

  const loginAsAdmin = () => {
    setIsAdmin(true);
    sessionStorage.setItem('arte_admin', 'true');
  };

  const logoutReader = () => {
    setIsReader(false);
    sessionStorage.removeItem('arte_reader');
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('arte_admin');
  };

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        isReader,
        authLoading,
        loginAsReader,
        logoutReader,
        loginAsAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
