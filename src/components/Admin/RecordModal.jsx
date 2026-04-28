// src/components/Admin/RecordModal.jsx
import { useState, useEffect } from 'react';
import { X, Save, Plus, Building2, UserCircle } from 'lucide-react';
import { addRecord, updateRecord } from '../../firebase/firestore';

const EMPTY_FORM = {
  category:         'qa', // 'qa' | 'directory'
  department:       '',
  // QA
  topic:            '',
  extra_checks:     '',
  response:         '',
  // Directory
  personnel_name:   '',
  unit:             '',
  title:            '',
  extension_number: '',
};

const RecordModal = ({ record, onClose, onSaved }) => {
  const isEdit = Boolean(record?.id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setForm({
        category:         record.category         || 'qa',
        department:       record.department       || '',
        topic:            record.topic            || '',
        extra_checks:     record.extra_checks     || '',
        response:         record.response         || '',
        personnel_name:   record.personnel_name   || '',
        unit:             record.unit             || '',
        title:            record.title            || '',
        extension_number: record.extension_number || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [record]);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.category === 'qa') {
      if (!form.topic.trim() || !form.response.trim()) {
        setError('Soru-Cevap için Konu ve Cevap alanları zorunludur.');
        return;
      }
    } else {
      if (!form.personnel_name.trim() || !form.extension_number.trim()) {
        setError('Personel Listesi için İsim ve Dahili No alanları zorunludur.');
        return;
      }
    }
    
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await updateRecord(record.id, form);
      } else {
        await addRecord(form);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(`Kayıt ${isEdit ? 'güncellenemedi' : 'eklenemedi'}: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const isQa = form.category === 'qa';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card p-6 animate-slide-up shadow-2xl custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-900/90 py-2 -mt-2 -mx-2 px-2 z-10 backdrop-blur-md rounded-b-xl border-b border-slate-800">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            {isEdit ? (
              <>
                <Save size={18} className="text-brand-400" />
                Kaydı Düzenle
              </>
            ) : (
              <>
                <Plus size={18} className="text-brand-400" />
                Yeni Kayıt Ekle
              </>
            )}
          </h2>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Kayıt Tipi
            </label>
            <div className="flex gap-2 p-1 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, category: 'qa' }))}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isQa ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Building2 size={16} />
                Soru ve Cevaplar
              </button>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, category: 'directory' }))}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  !isQa ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <UserCircle size={16} />
                Personel Dahili Listesi
              </button>
            </div>
          </div>

          {/* Ortak Alan */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Müdürlük / Departman
            </label>
            <input
              type="text"
              value={form.department}
              onChange={handleChange('department')}
              placeholder="ör: Kurumsal İletişim Birimi"
              className="input-field"
            />
          </div>

          {/* QA Alanları */}
          {isQa && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Konu <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.topic}
                  onChange={handleChange('topic')}
                  placeholder="ör: Röportaj talepleri"
                  className="input-field"
                  required={isQa}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Ek Kontroller / İşlemler <span className="text-slate-600 font-normal normal-case">(isteğe bağlı)</span>
                </label>
                <textarea
                  value={form.extra_checks}
                  onChange={handleChange('extra_checks')}
                  placeholder="Cevap vermeden önce yapılması gerekenler..."
                  rows={2}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Verilmesi Gereken Cevap <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.response}
                  onChange={handleChange('response')}
                  placeholder="Asıl cevap metni..."
                  rows={4}
                  className="input-field resize-none"
                  required={isQa}
                />
              </div>
            </div>
          )}

          {/* Directory Alanları */}
          {!isQa && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Personel Adı <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.personnel_name}
                  onChange={handleChange('personnel_name')}
                  placeholder="ör: Ahmet Yılmaz"
                  className="input-field"
                  required={!isQa}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Birim <span className="text-slate-600 font-normal normal-case">(isteğe bağlı)</span>
                  </label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={handleChange('unit')}
                    placeholder="ör: Yazılım"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Ünvan <span className="text-slate-600 font-normal normal-case">(isteğe bağlı)</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={handleChange('title')}
                    placeholder="ör: Uzman"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Dahili No <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.extension_number}
                  onChange={handleChange('extension_number')}
                  placeholder="ör: 1234"
                  className="input-field font-mono"
                  required={!isQa}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/40 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              İptal
            </button>
            <button
              id="modal-save-btn"
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 justify-center"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Kaydediliyor…
                </>
              ) : (
                <>
                  <Save size={16} />
                  {isEdit ? 'Güncelle' : 'Kaydet'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordModal;
