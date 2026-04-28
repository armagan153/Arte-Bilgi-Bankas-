// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import { Plus, Upload, Database, Users, BookOpen, TrendingUp, Trash2, AlertTriangle, X, Download } from 'lucide-react';
import Navbar        from '../components/Layout/Navbar';
import DataTable     from '../components/Admin/DataTable';
import RecordModal   from '../components/Admin/RecordModal';
import ImportCSV     from '../components/Admin/ImportCSV';
import { subscribeToRecords, deleteRecord, deleteAllRecords } from '../firebase/firestore';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="glass-card p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
    </div>
  </div>
);

const AdminPage = () => {
  const [records,       setRecords]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [modalRecord,   setModalRecord]   = useState(undefined); // undefined=kapalı, null=yeni, obj=düzenle
  const [showImport,    setShowImport]    = useState(false);
  const [deleteTarget,  setDeleteTarget]  = useState(null); // Tekil silme hedefi
  const [showClearAll,  setShowClearAll]  = useState(false); // Tümünü silme modal durumu
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeToRecords((docs) => {
      setRecords(docs);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteRecord(deleteTarget.id);
    } catch (err) {
      console.error('Silme hatası:', err);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleClearAllConfirm = async (category = null) => {
    setDeleteLoading(true);
    try {
      await deleteAllRecords(category);
    } catch (err) {
      console.error('Tümünü silme hatası:', err);
    } finally {
      setDeleteLoading(false);
      setShowClearAll(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(records, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const departments = [...new Set(records.map((r) => r.department).filter(Boolean))];
  
  const qaCount = records.filter((r) => (r.category || 'qa') === 'qa').length;
  const dirCount = records.filter((r) => r.category === 'directory').length;

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar variant="admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Sayfa başlığı */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Admin Paneli</h1>
            <p className="text-slate-500 text-sm mt-0.5">Bilgi bankasını yönetin</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowClearAll(true)}
              className="btn-ghost text-red-400 hover:bg-red-900/30 hover:text-red-300"
              disabled={records.length === 0}
              title="Tüm veya seçili kategorilerdeki kayıtları sil"
            >
              <Trash2 size={16} />
              Toplu Sil
            </button>
            <button
              onClick={handleExportJSON}
              className="btn-secondary"
              disabled={records.length === 0}
              title="Verileri data.json olarak indir (Github için)"
            >
              <Download size={16} />
              JSON İndir
            </button>
            <button
              id="import-btn"
              onClick={() => setShowImport(true)}
              className="btn-secondary"
            >
              <Upload size={16} />
              CSV/Excel İçe Aktar
            </button>
            <button
              id="add-record-btn"
              onClick={() => setModalRecord(null)}
              className="btn-primary"
            >
              <Plus size={16} />
              Yeni Kayıt
            </button>
          </div>
        </div>

        {/* İstatistik kartları */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Database}
            label="Toplam Kayıt"
            value={records.length}
            color="bg-brand-600"
          />
          <StatCard
            icon={BookOpen}
            label="Departman"
            value={departments.length}
            color="bg-violet-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Bu Hafta Eklenen"
            value={records.filter((r) => {
              if (!r.createdAt?.toDate) return false;
              const d = r.createdAt.toDate();
              const now = new Date();
              return (now - d) < 7 * 24 * 60 * 60 * 1000;
            }).length}
            color="bg-emerald-600"
          />
          <StatCard
            icon={Users}
            label="Aktif Kullanıcı"
            value="—"
            color="bg-amber-600"
          />
        </div>

        {/* Tablo */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-brand-900/40 border-t-brand-500 animate-spin" />
          </div>
        ) : (
          <DataTable
            records={records}
            onEdit={(r) => setModalRecord(r)}
            onDelete={(r) => setDeleteTarget(r)}
          />
        )}
      </main>

      {/* Kayıt Modal */}
      {modalRecord !== undefined && (
        <RecordModal
          record={modalRecord}
          onClose={() => setModalRecord(undefined)}
          onSaved={() => setModalRecord(undefined)}
        />
      )}

      {/* Import Modal */}
      {showImport && (
        <ImportCSV
          onClose={() => setShowImport(false)}
          onImported={() => setShowImport(false)}
        />
      )}

      {/* Silme Onay Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-md glass-card p-6 animate-slide-up shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-2">Kaydı Sil</h3>
            <p className="text-slate-400 text-sm mb-1">
              <span className="text-slate-200 font-semibold">
                "{deleteTarget.topic || deleteTarget.personnel_name}"
              </span> başlıklı kaydı silmek istediğinize emin misiniz?
            </p>
            <p className="text-red-400 text-xs mb-6">Bu işlem geri alınamaz.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn-secondary flex-1"
              >
                Vazgeç
              </button>
              <button
                id="confirm-delete-btn"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5
                           bg-red-700 hover:bg-red-600 text-white font-semibold rounded-xl
                           transition-all duration-200 active:scale-95 disabled:opacity-60"
              >
                {deleteLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Evet, Sil'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toplu Silme Dialog */}
      {showClearAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowClearAll(false)}
          />
          <div className="relative w-full max-w-md glass-card p-6 animate-slide-up shadow-2xl border-red-900/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle size={20} />
                Toplu Silme İşlemi
              </h3>
              <button onClick={() => setShowClearAll(false)} className="text-slate-500 hover:text-slate-300">
                <X size={18} />
              </button>
            </div>
            
            <p className="text-slate-300 text-sm mb-5">
              Hangi kategorideki kayıtları silmek istiyorsunuz? Bu işlem geri alınamaz.
            </p>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleClearAllConfirm('qa')}
                disabled={qaCount === 0 || deleteLoading}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-red-900/20 border border-slate-700/50 hover:border-red-800/50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-slate-200 font-medium">Soru ve Cevapları Sil</span>
                <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-md">{qaCount} Kayıt</span>
              </button>
              
              <button
                onClick={() => handleClearAllConfirm('directory')}
                disabled={dirCount === 0 || deleteLoading}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-red-900/20 border border-slate-700/50 hover:border-red-800/50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-slate-200 font-medium">Personel Rehberini Sil</span>
                <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-md">{dirCount} Kayıt</span>
              </button>
              
              <button
                onClick={() => handleClearAllConfirm(null)}
                disabled={records.length === 0 || deleteLoading}
                className="w-full flex items-center justify-between px-4 py-3 bg-red-950/30 hover:bg-red-900/50 border border-red-900/50 hover:border-red-700/50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-red-300 font-bold">Tüm Kayıtları Sil (Komple)</span>
                <span className="bg-red-900/50 text-red-300 text-xs px-2 py-1 rounded-md">{records.length} Kayıt</span>
              </button>
            </div>
            
            {deleteLoading && (
              <div className="flex items-center justify-center gap-2 text-red-400 text-sm font-medium mt-4">
                <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                Kayıtlar siliniyor...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
