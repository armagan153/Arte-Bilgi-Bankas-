// src/pages/ReaderPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { Search as SearchIcon, Inbox, Filter } from 'lucide-react';
import Navbar             from '../components/Layout/Navbar';
import SearchBar          from '../components/Reader/SearchBar';
import DepartmentFilters  from '../components/Reader/DepartmentFilters';
import KnowledgeCard      from '../components/Reader/KnowledgeCard';
import { subscribeToRecords } from '../firebase/firestore';

const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const ReaderPage = () => {
  const [records,    setRecords]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [query,      setQuery]      = useState('');
  const [activeDept, setActiveDept] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'qa' | 'directory'

  const debouncedQuery = useDebounce(query, 250);

  // Firestore realtime listener
  useEffect(() => {
    const unsub = subscribeToRecords((docs) => {
      setRecords(docs);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Benzersiz departmanlar (aktif kategoriye göre filtrelenmiş kayıtlar üzerinden)
  const departments = useMemo(() => {
    const filteredByCategory = activeCategory === 'all' 
      ? records 
      : records.filter(r => (r.category || 'qa') === activeCategory);
      
    return [...new Set(filteredByCategory.map((r) => r.department).filter(Boolean))].sort();
  }, [records, activeCategory]);

  // Filtrelenmiş kayıtlar
  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLocaleLowerCase('tr-TR');
    return records.filter((r) => {
      // Kategori filtresi
      const recordCategory = r.category || 'qa';
      if (activeCategory !== 'all' && recordCategory !== activeCategory) return false;

      // Departman filtresi
      if (activeDept && r.department !== activeDept) return false;

      // Metin araması
      if (!q) return true;
      
      return (
        r.topic?.toLocaleLowerCase('tr-TR').includes(q) ||
        r.department?.toLocaleLowerCase('tr-TR').includes(q) ||
        r.response?.toLocaleLowerCase('tr-TR').includes(q) ||
        r.extra_checks?.toLocaleLowerCase('tr-TR').includes(q) ||
        r.personnel_name?.toLocaleLowerCase('tr-TR').includes(q) ||
        r.extension_number?.toLocaleLowerCase('tr-TR').includes(q) ||
        r.unit?.toLocaleLowerCase('tr-TR').includes(q) ||
        r.title?.toLocaleLowerCase('tr-TR').includes(q)
      );
    });
  }, [records, debouncedQuery, activeDept, activeCategory]);

  const handleDeptSelect = (dept) => {
    setActiveDept(dept);
  };

  const handleCategorySelect = (cat) => {
    setActiveCategory(cat);
    setActiveDept(null); // Kategori değişince departmanı sıfırla
  };

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar variant="reader" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Başlık */}
        <div className="text-center space-y-1 pb-2">
          <h1 className="text-2xl font-bold text-slate-100">Bilgi Bankası Arama</h1>
          <p className="text-slate-500 text-sm">
            Konuya, personel adına veya departmana göre arayın
          </p>
        </div>

        {/* Arama Çubuğu */}
        <SearchBar value={query} onChange={setQuery} />

        {/* Kategori Filtreleri */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
              activeCategory === 'all'
                ? 'bg-slate-100 text-slate-900 shadow-lg'
                : 'bg-slate-800/70 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => handleCategorySelect('qa')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
              activeCategory === 'qa'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-900/40'
                : 'bg-slate-800/70 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            Soru ve Cevaplar
          </button>
          <button
            onClick={() => handleCategorySelect('directory')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
              activeCategory === 'directory'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                : 'bg-slate-800/70 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            Personel Dahili Listesi
          </button>
        </div>

        {/* Departman Filtreleri */}
        {!loading && departments.length > 0 && (
          <DepartmentFilters
            departments={departments}
            active={activeDept}
            onSelect={handleDeptSelect}
          />
        )}

        {/* Sonuç sayısı */}
        {!loading && (query || activeDept || activeCategory !== 'all') && (
          <p className="text-xs text-slate-600 font-medium">
            {filtered.length} sonuç bulundu
            {activeDept && <span className="text-brand-500"> · {activeDept}</span>}
          </p>
        )}

        {/* Yükleniyor */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="w-10 h-10 rounded-full border-3 border-brand-900/40 border-t-brand-500 animate-spin" />
            <p className="text-slate-500 text-sm">Veriler yükleniyor…</p>
          </div>
        )}

        {/* Boş sonuç */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center">
              {query || activeDept ? (
                <SearchIcon size={28} className="text-slate-600" />
              ) : (
                <Inbox size={28} className="text-slate-600" />
              )}
            </div>
            <div>
              <p className="text-slate-300 font-semibold">
                {query || activeDept ? 'Sonuç bulunamadı' : 'Henüz kayıt yok'}
              </p>
              <p className="text-slate-600 text-sm mt-1">
                Arama kriterlerinizi değiştirerek tekrar deneyin.
              </p>
            </div>
          </div>
        )}

        {/* Kartlar */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((record, i) => (
              <KnowledgeCard key={record.id} record={record} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ReaderPage;
