// src/pages/LoginPage.jsx
import { useState } from 'react';
import { BookOpen, KeyRound, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as OTPAuth from 'otpauth';

const LoginPage = () => {
  const { loginAsReader, loginAsAdmin } = useAuth();
  const navigate           = useNavigate();
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [adminError, setAdminError] = useState('');
  const [activeTab, setActiveTab] = useState('reader'); // 'reader' | 'admin'

  const READER_PASSWORD = import.meta.env.VITE_READER_PASSWORD || 'arte2024';
  // Varsayılan TOTP Secret (Kullanıcı Cloudflare'a ekleyene kadar bu geçerli olur)
  const TOTP_SECRET = import.meta.env.VITE_TOTP_SECRET || 'WHZ2TTUWSAJW677K4K4ZAC6PEHWMJMMC';

  const handlePasswordLogin = (e) => {
    e.preventDefault();
    if (password === READER_PASSWORD) {
      loginAsReader();
      navigate('/search', { replace: true });
    } else {
      setPassError('Hatalı şifre. Lütfen tekrar deneyin.');
      setTimeout(() => setPassError(''), 3000);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    
    // TOTP Doğrulama Objesi
    let totp = new OTPAuth.TOTP({
      issuer: 'ARTE Bilgi Bankası',
      label: 'Admin',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: TOTP_SECRET,
    });

    const delta = totp.validate({ token: totpCode, window: 1 });

    if (delta !== null) {
      loginAsAdmin();
      navigate('/admin', { replace: true });
    } else {
      setAdminError('Hatalı kod. Lütfen Google Authenticator kodunuzu tekrar deneyin.');
      setTimeout(() => setAdminError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex flex-col items-center justify-center p-4">
      {/* Dekoratif arka plan elementleri */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-brand-400/4 rounded-full blur-3xl" />
      </div>

      {/* Logo & Başlık */}
      <div className="relative text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-xl shadow-brand-900/50 mb-4">
          <BookOpen size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          ARTE
          <span className="text-brand-400 ml-2">Bilgi Bankası</span>
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          Çağrı Merkezi · İç Kaynak Sistemi
        </p>
      </div>

      {/* Kart */}
      <div className="relative w-full max-w-md glass-card p-8 shadow-2xl animate-slide-up">
        {/* Tabs */}
        <div className="flex rounded-xl bg-slate-900/60 p-1 mb-8">
          <button
            id="tab-reader"
            onClick={() => setActiveTab('reader')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'reader'
                ? 'bg-slate-700 text-slate-100 shadow'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <KeyRound size={15} />
            Personel Girişi
          </button>
          <button
            id="tab-admin"
            onClick={() => setActiveTab('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'admin'
                ? 'bg-slate-700 text-slate-100 shadow'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Shield size={15} />
            Yönetici
          </button>
        </div>

        {/* --- Personel Girişi --- */}
        {activeTab === 'reader' && (
          <form onSubmit={handlePasswordLogin} className="space-y-5 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Erişim Şifresi
              </label>
              <div className="relative">
                <input
                  id="reader-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifrenizi girin…"
                  className="input-field pr-11"
                  autoComplete="current-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {passError && (
              <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/40 rounded-lg px-4 py-2.5 animate-fade-in">
                {passError}
              </p>
            )}

            <button
              id="reader-login-btn"
              type="submit"
              className="btn-primary w-full justify-center py-3"
            >
              <KeyRound size={16} />
              Giriş Yap
            </button>

            <p className="text-center text-xs text-slate-600 pt-2">
              Şifreyi bilmiyorsanız sistem yöneticinizle iletişime geçin.
            </p>
          </form>
        )}

        {/* --- Admin Girişi --- */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-5 animate-fade-in">
            <div className="text-center">
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Yönetici paneline erişim sağlamak için Google Authenticator uygulamasındaki 6 haneli kodu girin.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Google Auth Kodu (6 Hane)
              </label>
              <div className="relative">
                <input
                  id="admin-totp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="input-field text-center text-lg tracking-[0.5em] font-mono font-bold"
                  autoComplete="off"
                  autoFocus
                />
              </div>
            </div>

            {adminError && (
              <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/40 rounded-lg px-4 py-2.5 animate-fade-in">
                {adminError}
              </p>
            )}

            <button
              id="admin-login-btn"
              type="submit"
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6
                         bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl
                         transition-all duration-200 active:scale-95 shadow-lg"
            >
              <Shield size={20} className="text-brand-500" />
              Yönetici Olarak Giriş Yap
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      <p className="relative mt-8 text-xs text-slate-700">
        © {new Date().getFullYear()} ARTE · Tüm hakları saklıdır.
      </p>
    </div>
  );
};

export default LoginPage;
