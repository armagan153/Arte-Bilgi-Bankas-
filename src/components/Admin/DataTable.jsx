// src/components/Admin/DataTable.jsx
import { useState } from 'react';
import { Pencil, Trash2, Search, ChevronUp, ChevronDown, UserCircle, Building2 } from 'lucide-react';

const DataTable = ({ records, onEdit, onDelete }) => {
  const [search,    setSearch]    = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir,   setSortDir]   = useState('desc'); // Default to newest first

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const q = search.toLowerCase();
  const filtered = records
    .filter((r) => {
      const searchStr = [
        r.department,
        r.topic,
        r.response,
        r.personnel_name,
        r.extension_number,
        r.title,
        r.unit
      ].join(' ').toLowerCase();
      return searchStr.includes(q);
    })
    .sort((a, b) => {
      let av = (a[sortField] || '').toString().toLowerCase();
      let bv = (b[sortField] || '').toString().toLowerCase();
      
      // Özel sıralamalar
      if (sortField === 'title_name') {
        av = (a.topic || a.personnel_name || '').toString().toLowerCase();
        bv = (b.topic || b.personnel_name || '').toString().toLowerCase();
      } else if (sortField === 'content') {
        av = (a.response || a.extension_number || '').toString().toLowerCase();
        bv = (b.response || b.extension_number || '').toString().toLowerCase();
      }

      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const SortIcon = ({ field }) =>
    sortField === field ? (
      sortDir === 'asc' ? <ChevronUp size={13} className="text-brand-400" /> : <ChevronDown size={13} className="text-brand-400" />
    ) : (
      <ChevronUp size={13} className="text-slate-700" />
    );

  const ThBtn = ({ field, label }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-200 uppercase tracking-wider transition-colors"
    >
      {label}
      <SortIcon field={field} />
    </button>
  );

  return (
    <div className="glass-card overflow-hidden">
      {/* Tablo içi arama */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tabloda ara…"
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800/60 border-b border-slate-700/50">
              <th className="px-4 py-3 text-left w-32 hidden sm:table-cell">
                <ThBtn field="category" label="Kategori" />
              </th>
              <th className="px-4 py-3 text-left">
                <ThBtn field="title_name" label="Başlık / İsim" />
              </th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">
                <ThBtn field="department" label="Departman" />
              </th>
              <th className="px-4 py-3 text-left hidden md:table-cell">
                <ThBtn field="content" label="Cevap / Dahili No" />
              </th>
              <th className="px-4 py-3 text-center w-24">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  İşlem
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-slate-600">
                  {search ? 'Arama sonucu bulunamadı.' : 'Henüz kayıt yok.'}
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const isQa = (r.category || 'qa') === 'qa';
                
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-800/30 transition-colors duration-150 group"
                  >
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {isQa ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-brand-900/30 text-brand-400 border border-brand-800/50 whitespace-nowrap">
                          <Building2 size={12} />
                          Soru-Cevap
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 whitespace-nowrap">
                          <UserCircle size={12} />
                          Rehber
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-100 font-semibold block">
                        {isQa ? r.topic : r.personnel_name}
                      </span>
                      {/* Mobilde departmanı başlık altında göster */}
                      <span className="text-xs text-slate-500 lg:hidden block mt-0.5">
                        {r.department}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-slate-300 font-medium">
                        {r.department || <span className="text-slate-600">—</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell max-w-[260px]">
                      {isQa ? (
                        <span className="text-sm text-slate-300 truncate block" title={r.response}>
                          {r.response}
                        </span>
                      ) : (
                        <span className="text-sm text-brand-300 font-mono font-medium truncate block">
                          📞 {r.extension_number}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(r)}
                          title="Düzenle"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-400 hover:bg-brand-900/30 transition-all duration-150"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => onDelete(r)}
                          title="Sil"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/30 transition-all duration-150"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filtered.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-800/60 text-xs text-slate-500 flex justify-between">
          <span>
            {search
              ? `${filtered.length} / ${records.length} kayıt gösteriliyor`
              : `Toplam ${records.length} kayıt`}
          </span>
        </div>
      )}
    </div>
  );
};

export default DataTable;
