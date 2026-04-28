// src/firebase/auth.js (Artık LocalStorage kullanıyor)

const AUTH_KEY = 'arte_admin_user';

const listeners = new Set();

const notifyListeners = (user) => {
  listeners.forEach(fn => fn(user));
};

export const signInWithGoogle = async () => {
  // Demo amaçlı gecikme simülasyonu
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const user = {
    email: 'admin@arte.com.tr',
    displayName: 'Sistem Yöneticisi',
    photoURL: 'https://ui-avatars.com/api/?name=Admin&background=3b5ff5&color=fff'
  };
  
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  notifyListeners(user);
  return user;
};

export const signOutUser = async () => {
  localStorage.removeItem(AUTH_KEY);
  notifyListeners(null);
};

export const subscribeToAuthChanges = (callback) => {
  const data = localStorage.getItem(AUTH_KEY);
  callback(data ? JSON.parse(data) : null);
  
  listeners.add(callback);
  
  return () => {
    listeners.delete(callback);
  };
};

export const isAdminEmail = (email) => {
  // Local demo'da herkes admindir
  return true;
};
