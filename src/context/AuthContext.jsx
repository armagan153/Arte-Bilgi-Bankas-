import { createContext, useContext, useEffect, useState } from 'react';
import { subscribeToAuthChanges, isAdminEmail } from '../firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isAdmin, setIsAdmin]           = useState(false);
  const [isReader, setIsReader]         = useState(false);
  const [authLoading, setAuthLoading]   = useState(true);

  // Auth durumunu dinle (Admin girişi için)
  useEffect(() => {
    const unsub = subscribeToAuthChanges((user) => {
      setFirebaseUser(user);
      setIsAdmin(user ? isAdminEmail(user.email) : false);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Okuyucu oturumunu session storage'dan geri yükle
  useEffect(() => {
    const stored = sessionStorage.getItem('arte_reader');
    if (stored === 'true') setIsReader(true);
  }, []);

  const loginAsReader = () => {
    setIsReader(true);
    sessionStorage.setItem('arte_reader', 'true');
  };

  const logoutReader = () => {
    setIsReader(false);
    sessionStorage.removeItem('arte_reader');
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        isAdmin,
        isReader,
        authLoading,
        loginAsReader,
        logoutReader,
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
