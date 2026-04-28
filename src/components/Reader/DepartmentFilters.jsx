import { useState } from 'react';
import { Building2, ChevronDown, ChevronUp } from 'lucide-react';

const DepartmentFilters = ({ departments, active, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!departments.length) return null;

  return (
    <div className="space-y-3">
      {/* Toggle Butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
          active !== null
            ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
            : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70 hover:text-slate-200 border border-slate-700/50'
        }`}
      >
        <Building2 size={16} />
        <span className="truncate max-w-[200px] sm:max-w-none">
          {active ? `Departman: ${active}` : 'Departmanlara Göre Filtrele'}
        </span>
        {isOpen ? <ChevronUp size={16} className="ml-1 shrink-0" /> : <ChevronDown size={16} className="ml-1 shrink-0" />}
      </button>

      {/* Açılır Kapanır Filtre Listesi */}
      {isOpen && (
        <div className="flex flex-wrap gap-2 animate-fade-in bg-slate-900/40 p-3 rounded-2xl border border-slate-800/50">
          <button
            id="filter-all"
            onClick={() => {
              onSelect(null);
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
              active === null
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/40'
                : 'bg-slate-800/70 text-slate-400 hover:bg-slate-700/70 hover:text-slate-200 border border-slate-700/50'
            }`}
          >
            <Building2 size={14} />
            Tümü
          </button>

          {departments.map((dept) => (
            <button
              key={dept}
              id={`filter-${dept.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => {
                onSelect(dept);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 text-left ${
                active === dept
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/40'
                  : 'bg-slate-800/70 text-slate-400 hover:bg-slate-700/70 hover:text-slate-200 border border-slate-700/50'
              }`}
              title={dept}
            >
              {dept}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentFilters;
