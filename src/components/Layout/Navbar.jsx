// src/components/Layout/Navbar.jsx
import { LogOut, BookOpen, Shield, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ variant = 'reader' }) => {
  const { isAdmin, logoutReader, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (isAdmin) {
      logoutAdmin();
    }
    logoutReader();
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-900/50">
            <BookOpen size={16} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-wide">ARTE</span>
            <span className="text-slate-500 text-xs ml-2 font-medium">Bilgi Bankası</span>
          </div>
        </div>

        {/* Orta - Breadcrumb */}
        <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500">
          <span>ARTE</span>
          <ChevronRight size={12} />
          {variant === 'admin' ? (
            <>
              <Shield size={12} className="text-brand-400" />
              <span className="text-brand-400 font-medium">Admin Paneli</span>
            </>
          ) : (
            <span className="text-slate-300 font-medium">Bilgi Arama</span>
          )}
        </div>

        {/* Sağ - Kullanıcı bilgisi + Çıkış */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-slate-400 max-w-[140px] truncate">
                Yönetici
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="btn-ghost text-sm py-1.5"
            title="Çıkış Yap"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
