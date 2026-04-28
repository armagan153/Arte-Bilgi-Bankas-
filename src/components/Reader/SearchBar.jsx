// src/components/Reader/SearchBar.jsx
import { Search, X } from 'lucide-react';
import { useRef } from 'react';

const SearchBar = ({ value, onChange }) => {
  const inputRef = useRef(null);

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-brand-600/20 to-brand-400/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-all duration-500 -z-10" />
      <div className="relative flex items-center glass-card px-5 py-4 gap-4 focus-within:border-brand-600/60 transition-all duration-300">
        <Search
          size={22}
          className="text-slate-500 group-focus-within:text-brand-400 transition-colors duration-300 shrink-0"
        />
        <input
          ref={inputRef}
          id="search-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Konu veya departman ara… (ör: Röportaj, Kurumsal İletişim)"
          className="flex-1 bg-transparent text-slate-100 text-lg placeholder-slate-600 focus:outline-none"
          autoFocus
          autoComplete="off"
        />
        {value && (
          <button
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Aramayı temizle"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
