// src/services/githubSync.js

export const syncToGithub = async (records) => {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const owner = import.meta.env.VITE_GITHUB_OWNER;
  const repo = import.meta.env.VITE_GITHUB_REPO;
  const branch = import.meta.env.VITE_GITHUB_BRANCH || 'main';
  const path = 'src/data/data.json';

  if (!token || !owner || !repo) {
    console.warn("GitHub sync credentials missing. VITE_GITHUB_TOKEN, VITE_GITHUB_OWNER, VITE_GITHUB_REPO required.");
    return false;
  }

  try {
    // 1. Mevcut dosyanın SHA'sını al (Dosya varsa güncelleyebilmek için SHA zorunlu)
    let sha = '';
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    
    const getRes = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (getRes.ok) {
      const getJson = await getRes.json();
      sha = getJson.sha;
    } else if (getRes.status !== 404) {
      throw new Error("GitHub API hatası (GET): " + getRes.statusText);
    }

    // 2. Yeni içeriği Base64 formatına çevir (Büyük veriler için call stack hatasını önler)
    const contentStr = JSON.stringify(records, null, 2);
    // Türkçe karakterlerin düzgün base64 olması için güvenli yöntem
    const base64Content = btoa(unescape(encodeURIComponent(contentStr)));

    // 3. Dosyayı güncelle veya oluştur
    const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Otomatik veri güncelleme: ${new Date().toLocaleString()}`,
        content: base64Content,
        sha: sha || undefined,
        branch: branch,
      }),
    });

    if (!putRes.ok) {
      throw new Error("GitHub API hatası (PUT): " + putRes.statusText);
    }

    return true;
  } catch (error) {
    console.error("GitHub Sync Hatası:", error);
    return false;
  }
};
