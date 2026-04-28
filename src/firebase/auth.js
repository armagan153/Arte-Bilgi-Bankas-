// src/firebase/auth.js
import { auth } from './config';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
};

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

export const isAdminEmail = (email) => {
  if (!email) return false;
  const adminEmailsStr = import.meta.env.VITE_ADMIN_EMAILS || '';
  if (!adminEmailsStr) return true; // Eğer kısıtlama girilmediyse herkes admin
  
  const adminEmails = adminEmailsStr.split(',').map(e => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
};
