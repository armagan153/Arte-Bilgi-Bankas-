// src/components/Reader/KnowledgeCard.jsx
import { useState } from 'react';
import { Copy, Check, AlertTriangle, MessageSquare, Tag, User, Phone, Briefcase, Building } from 'lucide-react';

const DEPT_COLORS = [
  'bg-violet-900/40 text-violet-300 border-violet-700/40',
  'bg-sky-900/40 text-sky-300 border-sky-700/40',
  'bg-emerald-900/40 text-emerald-300 border-emerald-700/40',
  'bg-rose-900/40 text-rose-300 border-rose-700/40',
  'bg-amber-900/40 text-amber-300 border-amber-700/40',
  'bg-teal-900/40 text-teal-300 border-teal-700/40',
  'bg-indigo-900/40 text-indigo-300 border-indigo-700/40',
  'bg-pink-900/40 text-pink-300 border-pink-700/40',
];

/** Departman adına göre sabit bir renk seç */
const getDeptColor = (dept) => {
  let hash = 0;
  for (let i = 0; i < dept.length; i++) {
    hash = dept.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DEPT_COLORS[Math.abs(hash) % DEPT_COLORS.length];
};

const hasContent = (val) => val && val.trim() !== '' && val.trim() !== '-';

const KnowledgeCard = ({ record, index }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (textToCopy) => {
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = textToCopy;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const deptColor = getDeptColor(record.department || '');
  const isDirectory = record.category === 'directory';

  if (isDirectory) {
    const isManager = record.title && record.title.toLowerCase().includes('müdür');
    
    // Müdür olanlarda vurgulu kırmızı çerçeve
    const baseClass = "p-5 animate-fade-in transition-all duration-300 hover:shadow-lg hover:shadow-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl";
    const highlightClass = isManager 
      ? "bg-red-950/20 border border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:border-red-400" 
      : "glass-card hover:border-slate-600/60";

    return (
      <article
        className={`${baseClass} ${highlightClass}`}
        style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${
            isManager ? 'bg-red-950 border-red-500/50 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <User size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`text-lg font-bold flex items-center gap-2 ${isManager ? 'text-red-100' : 'text-slate-100'}`}>
              {record.personnel_name || 'İsimsiz Personel'}
            </h2>
            <div className={`flex flex-col gap-y-1 mt-1.5 text-sm ${isManager ? 'text-red-200/70' : 'text-slate-400'}`}>
              {hasContent(record.title) && (
                <span className="flex items-start gap-1">
                  <Briefcase size={14} className={`${isManager ? 'text-red-400/80' : 'text-slate-500'} shrink-0 mt-0.5`} />
                  <span className="break-words font-medium">{record.title}</span>
                </span>
              )}
              {hasContent(record.department) && (
                <span className="flex items-start gap-1">
                  <Building size={14} className={`${isManager ? 'text-red-400/80' : 'text-slate-500'} shrink-0 mt-0.5`} />
                  <span className="break-words">{record.department}</span>
                </span>
              )}
              {hasContent(record.unit) && (
                <span className="flex items-start gap-1">
                  <Tag size={14} className={`${isManager ? 'text-red-400/80' : 'text-slate-500'} shrink-0 mt-0.5`} />
                  <span className="break-words">{record.unit}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {hasContent(record.extension_number) && (
          <div className={`flex items-center gap-3 shrink-0 p-2 pl-4 rounded-xl border ${
            isManager ? 'bg-red-950/40 border-red-800/50' : 'bg-slate-900/50 border-slate-700/50'
          }`}>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${isManager ? 'text-red-400/80' : 'text-slate-500'}`}>Dahili No</p>
              <p className={`text-xl font-bold tracking-wider ${isManager ? 'text-red-400' : 'text-brand-400'}`}>
                {record.extension_number}
              </p>
            </div>
            <button
              onClick={() => handleCopy(record.extension_number)}
              title="Dahili Numarayı Kopyala"
              className={`p-2.5 rounded-lg transition-all duration-200 active:scale-95 ${
                copied
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/40'
                  : isManager
                    ? 'bg-red-950/80 text-red-300 hover:bg-red-900 hover:text-white border border-red-800/50'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600'
              }`}
            >
              {copied ? <Check size={18} /> : <Phone size={18} />}
            </button>
          </div>
        )}
      </article>
    );
  }

  // Soru-Cevap (qa) kartı görünümü
  return (
    <article
      className="glass-card p-5 animate-fade-in hover:border-slate-600/60 transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      {/* Başlık + Rozet */}
      <div className="flex flex-wrap items-start gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-slate-100 leading-snug">
            {record.topic || 'Konu Belirtilmemiş'}
          </h2>
        </div>
        {hasContent(record.department) && (
          <span className={`badge border shrink-0 ${deptColor}`}>
            <Tag size={11} className="mr-1 shrink-0" />
            {record.department}
          </span>
        )}
      </div>

      {/* Extra Checks uyarı kutusu */}
      {hasContent(record.extra_checks) && (
        <div className="flex gap-3 bg-amber-950/40 border border-amber-700/30 rounded-xl px-4 py-3 mb-4">
          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-200/80 text-sm leading-relaxed whitespace-pre-line">
            {record.extra_checks}
          </p>
        </div>
      )}

      {/* Cevap kutusu */}
      {hasContent(record.response) && (
        <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-xl px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-2.5 flex-1 min-w-0">
              <MessageSquare size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-emerald-100/90 text-sm leading-relaxed whitespace-pre-line break-words flex-1">
                {record.response}
              </p>
            </div>
            <button
              id={`copy-btn-${record.id}`}
              onClick={() => handleCopy(record.response)}
              title="Kopyala"
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 ${
                copied
                  ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-600/40'
                  : 'bg-slate-700/60 text-slate-400 hover:bg-slate-600/60 hover:text-slate-200 border border-slate-600/30'
              }`}
            >
              {copied ? (
                <>
                  <Check size={13} />
                  Kopyalandı
                </>
              ) : (
                <>
                  <Copy size={13} />
                  Kopyala
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

export default KnowledgeCard;
