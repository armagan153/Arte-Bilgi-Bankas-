// src/components/Layout/LoadingSpinner.jsx
const LoadingSpinner = ({ message = 'Yükleniyor...' }) => (
  <div className="min-h-screen bg-mesh flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-brand-900/40" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
      </div>
      <p className="text-slate-400 text-sm font-medium animate-pulse-soft">{message}</p>
    </div>
  </div>
);

export default LoadingSpinner;
