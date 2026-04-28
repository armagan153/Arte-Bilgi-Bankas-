// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage  from './pages/LoginPage';
import ReaderPage from './pages/ReaderPage';
import AdminPage  from './pages/AdminPage';
import LoadingSpinner from './components/Layout/LoadingSpinner';

/** Okuyucu koruması */
const ReaderRoute = ({ children }) => {
  const { isReader, isAdmin, authLoading } = useAuth();
  if (authLoading) return <LoadingSpinner />;
  if (isAdmin || isReader) return children;
  return <Navigate to="/" replace />;
};

/** Admin koruması */
const AdminRoute = ({ children }) => {
  const { isAdmin, authLoading } = useAuth();
  if (authLoading) return <LoadingSpinner />;
  if (isAdmin) return children;
  return <Navigate to="/" replace />;
};

const AppRoutes = () => {
  const { isAdmin, isReader, authLoading } = useAuth();

  if (authLoading) return <LoadingSpinner />;

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAdmin
            ? <Navigate to="/admin"  replace />
            : isReader
            ? <Navigate to="/search" replace />
            : <LoginPage />
        }
      />
      <Route
        path="/search"
        element={<ReaderRoute><ReaderPage /></ReaderRoute>}
      />
      <Route
        path="/admin"
        element={<AdminRoute><AdminPage /></AdminRoute>}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/** AppRoutes, AuthProvider içinde olmalı; AuthProvider ise BrowserRouter içinde */
const InnerApp = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

const App = () => (
  <BrowserRouter>
    <InnerApp />
  </BrowserRouter>
);

export default App;
