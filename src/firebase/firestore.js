// src/firebase/firestore.js (Artık LocalStorage kullanıyor)
import defaultData from '../data/data.json';
import { syncToGithub } from '../services/githubSync';

const STORAGE_KEY = 'arte_knowledge_base';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const getRecords = () => {
  const isAdmin = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('arte_admin') === 'true';
  const localDataStr = localStorage.getItem(STORAGE_KEY);
  
  // Eğer okuyucu (personel) ise HER ZAMAN Cloudflare'dan gelen güncel build verisini göster.
  // Böylece mobil cihazlarda asla eski veri kalmaz (soruların gelmemesi sorunu çözülür).
  if (!isAdmin) {
    return defaultData || [];
  }

  // Admin ise anlık değişikliklerini görebilmesi için localStorage'ı kullan.
  let localData = [];
  if (localDataStr) {
    try {
      localData = JSON.parse(localDataStr);
    } catch (e) {
      localData = [];
    }
  }

  // Admin yeni bir cihazdan giriyorsa localStorage boştur, build verisini yükle.
  if (!localData || localData.length === 0) {
    if (defaultData && defaultData.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      return defaultData;
    }
    return [];
  }

  return localData;
};

const saveRecords = (records) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  listeners.forEach(fn => fn([...records]));
  return records;
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
  const updatedRecords = [...records, newRecord];
  saveRecords(updatedRecords);
  
  // GitHub'a asenkron gönder
  syncToGithub(updatedRecords);
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
  
  // GitHub'a asenkron gönder
  syncToGithub(updated);
};

export const deleteRecord = async (id) => {
  const records = getRecords();
  const updated = records.filter(r => r.id !== id);
  saveRecords(updated);
  
  // GitHub'a asenkron gönder
  syncToGithub(updated);
};

export const deleteAllRecords = async (category = null) => {
  let finalRecords = [];
  if (category) {
    const records = getRecords();
    finalRecords = records.filter(r => {
      const cat = r.category || 'qa';
      return cat !== category;
    });
    saveRecords(finalRecords);
  } else {
    saveRecords([]);
  }
  
  // GitHub'a asenkron gönder
  syncToGithub(finalRecords);
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
  const updatedRecords = [...records, ...newRecords];
  saveRecords(updatedRecords);
  
  // GitHub'a asenkron gönder
  syncToGithub(updatedRecords);
};
