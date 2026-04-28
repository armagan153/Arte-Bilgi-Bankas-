// src/firebase/firestore.js (Artık LocalStorage kullanıyor)

const STORAGE_KEY = 'arte_knowledge_base';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const getRecords = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveRecords = (records) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  listeners.forEach(fn => fn([...records]));
};

const listeners = new Set();

/** Tüm kayıtları "gerçek zamanlı" dinle (LocalStorage üzerinden) */
export const subscribeToRecords = (callback) => {
  const records = getRecords();
  
  // Sıralama (createdAt'e göre eskiden yeniye)
  const sortedRecords = records.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  callback(sortedRecords);
  
  listeners.add(callback);
  
  // Diğer sekmelerden gelen güncellemeleri dinle
  const handleStorage = (e) => {
    if (e.key === STORAGE_KEY) {
      const updatedRecords = getRecords().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      callback(updatedRecords);
    }
  };
  window.addEventListener('storage', handleStorage);
  
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', handleStorage);
  };
};

export const fetchAllRecords = async () => {
  return getRecords().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

export const addRecord = async (data) => {
  const records = getRecords();
  const newRecord = {
    id: generateId(),
    category:         data.category || 'qa',
    // Ortak alan
    department:       data.department?.trim()   || '',
    // QA alanları
    topic:            data.topic?.trim()        || '',
    extra_checks:     data.extra_checks?.trim() || '',
    response:         data.response?.trim()     || '',
    // Directory alanları
    personnel_name:   data.personnel_name?.trim() || '',
    unit:             data.unit?.trim()           || '',
    title:            data.title?.trim()          || '',
    extension_number: data.extension_number?.trim() || '',
    
    createdAt:        new Date().toISOString(),
    updatedAt:        new Date().toISOString(),
  };
  saveRecords([...records, newRecord]);
};

export const updateRecord = async (id, data) => {
  const records = getRecords();
  const updated = records.map(r => r.id === id ? {
    ...r,
    category:         data.category || r.category || 'qa',
    department:       data.department?.trim()   || '',
    topic:            data.topic?.trim()        || '',
    extra_checks:     data.extra_checks?.trim() || '',
    response:         data.response?.trim()     || '',
    personnel_name:   data.personnel_name?.trim() || '',
    unit:             data.unit?.trim()           || '',
    title:            data.title?.trim()          || '',
    extension_number: data.extension_number?.trim() || '',
    updatedAt:        new Date().toISOString(),
  } : r);
  saveRecords(updated);
};

export const deleteRecord = async (id) => {
  const records = getRecords();
  saveRecords(records.filter(r => r.id !== id));
};

export const deleteAllRecords = async (category = null) => {
  if (category) {
    const records = getRecords();
    const filtered = records.filter(r => {
      const cat = r.category || 'qa';
      return cat !== category;
    });
    saveRecords(filtered);
  } else {
    saveRecords([]);
  }
};

export const importRecords = async (rows) => {
  const records = getRecords();
  const newRecords = rows.map(row => {
    // Kategori belirleme: Satırda "personnel_name" varsa veya kullanıcı "directory" olarak belirttiyse
    const isDirectory = row.category === 'directory' || !!row.personnel_name;
    
    return {
      id: generateId(),
      category:         isDirectory ? 'directory' : 'qa',
      department:       (row.department   || '').toString().trim(),
      topic:            (row.topic        || '').toString().trim(),
      extra_checks:     (row.extra_checks || '').toString().trim(),
      response:         (row.response     || '').toString().trim(),
      personnel_name:   (row.personnel_name || '').toString().trim(),
      unit:             (row.unit         || '').toString().trim(),
      title:            (row.title        || '').toString().trim(),
      extension_number: (row.extension_number || '').toString().trim(),
      createdAt:        new Date().toISOString(),
      updatedAt:        new Date().toISOString(),
    };
  });
  saveRecords([...records, ...newRecords]);
};
