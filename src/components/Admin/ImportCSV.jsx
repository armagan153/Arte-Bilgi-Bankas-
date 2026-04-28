import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, ArrowRight, Settings } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { importRecords } from '../../firebase/firestore';

const QA_FIELDS = [
  { key: 'department', label: 'Müdürlük / Departman', required: false },
  { key: 'topic', label: 'Konu', required: true },
  { key: 'extra_checks', label: 'Ek Kontroller', required: false },
  { key: 'response', label: 'Cevap', required: true }
];

const DIR_FIELDS = [
  { key: 'personnel_name', label: 'Personel Adı', required: true },
  { key: 'department', label: 'Müdürlük / Departman', required: false },
  { key: 'unit', label: 'Birim', required: false },
  { key: 'title', label: 'Ünvan', required: false },
  { key: 'extension_number', label: 'Dahili No', required: true }
];

// Olası başlık tahminleri için sözlük
const COLUMN_MAPPING = {
  'müdürlük': 'department', 'mudurluk': 'department', 'departman': 'department',
  'konu': 'topic', 'yapılması gereken ek kontroller veya işlemler': 'extra_checks',
  'yapilmasi gereken ek kontroller veya islemler': 'extra_checks',
  'ek kontroller': 'extra_checks', 'işlemler': 'extra_checks', 'verilmesi gereken cevap': 'response',
  'cevap': 'response', 'personel adı': 'personnel_name', 'personel adi': 'personnel_name',
  'isim': 'personnel_name', 'ad soyad': 'personnel_name', 'birim': 'unit', 'ünvan': 'title',
  'unvan': 'title', 'görev': 'title', 'dahili no': 'extension_number', 'dahili': 'extension_number',
  'telefon': 'extension_number', 'tel': 'extension_number',
};

const normalizeKey = (k) => {
  const lower = (k || '').toString().toLowerCase().trim();
  return COLUMN_MAPPING[lower] || null;
};

const ImportCSV = ({ onClose, onImported }) => {
  const fileRef = useRef(null);
  const [rawHeaders, setRawHeaders] = useState([]);
  const [rawRows, setRawRows]       = useState([]);
  const [category, setCategory]     = useState('qa');
  const [mapping, setMapping]       = useState({});
  const [filename, setFilename]     = useState('');
  const [error, setError]           = useState('');
  const [importing, setImporting]   = useState(false);
  const [done, setDone]             = useState(false);
  const [step, setStep]             = useState('upload'); // 'upload' | 'mapping'

  const parseFile = (file) => {
    setError('');
    setFilename(file.name);
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: ({ data, meta }) => {
          handleParsedData(meta.fields || Object.keys(data[0] || {}), data);
        },
        error: (err) => setError(`CSV parse hatası: ${err.message}`),
      });
    } else if (['xlsx', 'xls'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
          const headers = XLSX.utils.sheet_to_json(ws, { header: 1 })[0] || Object.keys(data[0] || {});
          handleParsedData(headers, data);
        } catch (err) {
          setError(`Excel parse hatası: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError('Desteklenmeyen dosya formatı. Lütfen .csv, .xlsx veya .xls yükleyin.');
    }
  };

  const handleParsedData = (headers, data) => {
    if (!data.length) {
      setError('Dosya boş görünüyor.');
      return;
    }
    
    // Başlıkları temizle (Bazen boş başlıklar olabiliyor)
    const validHeaders = headers.filter(h => h && h.trim());
    setRawHeaders(validHeaders);
    setRawRows(data);

    // Kategori tahmin et
    const joinedHeaders = validHeaders.join(' ').toLowerCase();
    const isDirectory = joinedHeaders.includes('personel') || joinedHeaders.includes('dahili') || joinedHeaders.includes('ünvan');
    const detectedCategory = isDirectory ? 'directory' : 'qa';
    setCategory(detectedCategory);

    // Otomatik eşleştirme
    const initialMapping = {};
    validHeaders.forEach(h => {
      const internalKey = normalizeKey(h);
      if (internalKey) {
        initialMapping[internalKey] = h;
      }
    });
    setMapping(initialMapping);
    setStep('mapping');
  };

  const handleMappingChange = (internalKey, rawHeader) => {
    setMapping(prev => ({
      ...prev,
      [internalKey]: rawHeader
    }));
  };

  const handleImport = async () => {
    setError('');
    
    // Zorunlu alan kontrolü
    const activeFields = category === 'qa' ? QA_FIELDS : DIR_FIELDS;
    const missingRequired = activeFields.filter(f => f.required && !mapping[f.key]);
    
    if (missingRequired.length > 0) {
      setError(`Lütfen şu zorunlu alanları eşleştirin: ${missingRequired.map(f => f.label).join(', ')}`);
      return;
    }

    setImporting(true);
    
    try {
      const mappedRows = rawRows.map(row => {
        const mappedData = { category };
        activeFields.forEach(f => {
          const rawCol = mapping[f.key];
          mappedData[f.key] = rawCol ? (row[rawCol] || '').toString().trim() : '';
        });
        return mappedData;
      });

      // Boş satırları filtrele (zorunlu alanları boş olanlar)
      const validRows = mappedRows.filter(row => {
        if (category === 'qa') return row.topic && row.response;
        return row.personnel_name && row.extension_number;
      });

      if (validRows.length === 0) {
        throw new Error("Geçerli kayıt bulunamadı. Lütfen sütun eşleştirmelerinizi kontrol edin.");
      }

      await importRecords(validRows);
      setDone(true);
      onImported?.();
    } catch (err) {
      setError(`İçe aktarma hatası: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl glass-card p-6 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-900/90 py-2 -mt-2 -mx-2 px-2 z-10 backdrop-blur-md rounded-b-xl border-b border-slate-800">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-brand-400" />
            CSV / Excel İçe Aktar
          </h2>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle size={48} className="text-emerald-400" />
            <p className="text-slate-200 font-semibold text-lg text-center">
              Kayıtlar başarıyla içe aktarıldı!
            </p>
            <button onClick={onClose} className="btn-primary mt-2">
              Kapat
            </button>
          </div>
        ) : (
          <>
            {/* Adım 1: Yükleme */}
            {step === 'upload' && (
              <div
                className="border-2 border-dashed border-slate-700 hover:border-brand-600/60 rounded-xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-colors duration-300"
                onClick={() => fileRef.current?.click()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if(f) parseFile(f); }}
                onDragOver={(e) => e.preventDefault()}
              >
                <Upload size={36} className="text-slate-500" />
                <div className="text-center">
                  <p className="text-slate-300 font-semibold">Dosya sürükleyin veya tıklayın</p>
                  <p className="text-slate-500 text-sm mt-1">.csv, .xlsx, .xls desteklenir</p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => e.target.files[0] && parseFile(e.target.files[0])}
                />
              </div>
            )}

            {/* Adım 2: Eşleştirme (Mapping) */}
            {step === 'mapping' && (
              <div className="animate-fade-in space-y-6">
                
                <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings size={18} className="text-brand-400" />
                    <h3 className="font-semibold text-slate-200">Sütun Eşleştirme</h3>
                  </div>
                  
                  <div className="mb-5">
                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                      Aktarılacak Veri Tipi
                    </label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setMapping({}); // Kategori değişince mapping'i sıfırla
                      }}
                      className="input-field max-w-sm"
                    >
                      <option value="qa">Soru ve Cevaplar</option>
                      <option value="directory">Personel Dahili Listesi</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-slate-400">
                      Lütfen sistemdeki alanlar ile yüklediğiniz Excel/CSV dosyasındaki sütun başlıklarını eşleştirin:
                    </p>
                    
                    <div className="grid gap-3">
                      {(category === 'qa' ? QA_FIELDS : DIR_FIELDS).map(field => (
                        <div key={field.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                          <div className="flex-1 min-w-[200px]">
                            <span className="text-sm font-semibold text-slate-200">
                              {field.label}
                            </span>
                            {field.required && <span className="text-red-400 ml-1">*</span>}
                          </div>
                          
                          <div className="flex-1">
                            <select
                              value={mapping[field.key] || ''}
                              onChange={(e) => handleMappingChange(field.key, e.target.value)}
                              className="input-field py-2 text-sm"
                            >
                              <option value="">-- Eşleştirilmedi --</option>
                              {rawHeaders.map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hata Mesajı */}
                {error && (
                  <div className="flex gap-2 bg-red-950/40 border border-red-800/40 rounded-xl px-4 py-3">
                    <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                    <p className="text-red-300 text-sm whitespace-pre-line">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setStep('upload'); setRawHeaders([]); setRawRows([]); setError(''); }}
                    className="btn-secondary flex-1"
                  >
                    Farklı Dosya
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="btn-primary flex-1 justify-center"
                  >
                    {importing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Aktarılıyor…
                      </>
                    ) : (
                      <>
                        <ArrowRight size={16} />
                        {rawRows.length} Kaydı Aktar
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ImportCSV;
