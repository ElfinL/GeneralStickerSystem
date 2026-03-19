// 語系設定
let currentLang = 'zh';

const I18N = {
  zh: {
    headerSubtitle: '貼圖清單管理',
    configTitle: '貼圖 ID 設定',
    configHint: '一行一個 ID，儲存後會自動列出圖片',
    saveButton: '儲存 ID 清單',
    reminder: '提醒：需要先在 DLive 登入；並在頻道頁使用',
    footer: '🔥 點「★」設常用 • 點「✕」刪除',
    favTitle: '常用',
    delTitle: '刪除',
    statusFavOn: '✅ 已標記常用',
    statusFavOff: '✅ 已取消常用',
    statusCleared: '✅ 已清空 ID 清單',
    statusSavedCount: (n) => `✅ 已儲存 ${n} 個 ID`,
    statusDeleted: '✅ 已刪除',
    statusInvalidId: (id) => `❌ ID 格式錯誤：${id}`,
    langToggleLabel: '中 / EN'
  },
  en: {
    headerSubtitle: 'Sticker list manager',
    configTitle: 'Sticker ID settings',
    configHint: 'One ID per line, images will be listed automatically after saving',
    saveButton: 'Save ID list',
    reminder: 'Tip: Please log in to DLive first and use this on a channel page',
    footer: '🔥 Click "★" to mark favorite • Click "✕" to delete',
    favTitle: 'Favorite',
    delTitle: 'Delete',
    statusFavOn: '✅ Marked as favorite',
    statusFavOff: '✅ Unmarked as favorite',
    statusCleared: '✅ Cleared ID list',
    statusSavedCount: (n) => `✅ Saved ${n} IDs`,
    statusDeleted: '✅ Deleted',
    statusInvalidId: (id) => `❌ Invalid ID format: ${id}`,
    langToggleLabel: 'EN / 中'
  }
};

function t(key, ...args) {
  const dict = I18N[currentLang] || I18N.zh;
  const val = dict[key];
  if (typeof val === 'function') return val(...args);
  return val;
}

function applyLanguage(lang) {
  currentLang = lang === 'en' ? 'en' : 'zh';

  const subtitleEl = document.getElementById('subtitleText');
  if (subtitleEl) subtitleEl.textContent = t('headerSubtitle');

  const configTitleEl = document.getElementById('configTitle');
  if (configTitleEl) configTitleEl.textContent = t('configTitle');

  const configHintEl = document.getElementById('configHint');
  if (configHintEl) configHintEl.textContent = t('configHint');

  const saveBtn = document.getElementById('saveIdsBtn');
  if (saveBtn) saveBtn.textContent = t('saveButton');

  const reminderEl = document.getElementById('reminderText');
  if (reminderEl) reminderEl.textContent = t('reminder');

  const footerEl = document.getElementById('footerText');
  if (footerEl) footerEl.textContent = t('footer');

  const langToggle = document.getElementById('langToggle');
  if (langToggle) langToggle.textContent = t('langToggleLabel');

  const idListInput = document.getElementById('idListInput');
  if (idListInput) {
    idListInput.placeholder = '826c4ac1e004273_498281\n826cd8c8b004273_335245';
  }

  chrome.storage.sync.set({ uiLang: currentLang });
}

function initLanguage() {
  chrome.storage.sync.get(['uiLang'], (result) => {
    const lang = result.uiLang === 'en' ? 'en' : 'zh';
    applyLanguage(lang);
  });
}

// 預設貼圖
const defaultStickers = [
  {
    name: 'test01',
    code: ':emote/mine/dlive/826c4ac1e004273_498281:',
    imageUrl: 'https://images.prd.dlivecdn.com/emote/826c4ac1e004273_498281'
  },
  {
    name: 'test02',
    code: ':emote/mine/dlive/1234567890abcdef:',
    imageUrl: ''
  },
  {
    name: 'test03',
    code: ':emote/mine/dlive/abcdef1234567890:',
    imageUrl: ''
  }
];

function setStatus(text, color = '#28a745') {
  const el = document.getElementById('configStatus');
  el.style.color = color;
  el.textContent = text;
  if (!text) return;
  setTimeout(() => {
    el.textContent = '';
  }, 2000);
}

function buildStickerFromId(id, index) {
  return {
    name: `ID${index + 1}`,
    code: `:emote/mine/dlive/${id}:`,
    imageUrl: `https://images.prd.dlivecdn.com/emote/${id}`
  };
}

function parseIdsFromText(rawText) {
  return (rawText || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function idsToText(ids) {
  return (ids || []).join('\n');
}

function extractIdFromSticker(sticker) {
  const match = String(sticker?.code || '').match(/^:emote\/mine\/dlive\/([A-Za-z0-9_]+):$/);
  return match?.[1] || null;
}

function sortIdsWithFavorites(ids, favoriteIds) {
  const fav = new Set(Array.isArray(favoriteIds) ? favoriteIds : []);
  const unique = [...new Set(ids)];
  const favIds = unique.filter((id) => fav.has(id));
  const rest = unique.filter((id) => !fav.has(id));
  return [...favIds, ...rest];
}

function removeUnknownFavorites(favoriteIds, ids) {
  const set = new Set(ids);
  return (favoriteIds || []).filter((id) => set.has(id));
}

function loadSettings() {
  const idListInput = document.getElementById('idListInput');
  if (!idListInput) return;

  chrome.storage.sync.get(['stickerIdsText', 'stickers', 'favoriteStickerIds'], (result) => {
    // 新格式優先，舊格式則嘗試從 stickers 還原 ID 顯示
    if (typeof result.stickerIdsText === 'string') {
      const ids = parseIdsFromText(result.stickerIdsText);
      const sorted = sortIdsWithFavorites(ids, result.favoriteStickerIds);
      idListInput.value = idsToText(sorted);
      return;
    }

    const stickers = Array.isArray(result.stickers) ? result.stickers : [];
    const ids = stickers.map(extractIdFromSticker).filter(Boolean);
    const sorted = sortIdsWithFavorites(ids, result.favoriteStickerIds);
    idListInput.value = idsToText(sorted);
  });
}

loadSettings();
initLanguage();

const langToggleBtn = document.getElementById('langToggle');
if (langToggleBtn) {
  langToggleBtn.addEventListener('click', () => {
    const next = currentLang === 'zh' ? 'en' : 'zh';
    applyLanguage(next);
    loadStickers();
  });
}

// ===== 貼圖功能（圖片版）=====
function loadStickers() {
  chrome.storage.sync.get(['stickers', 'favoriteStickerIds'], (result) => {
    const stickers = result.stickers || defaultStickers;
    const fav = Array.isArray(result.favoriteStickerIds) ? result.favoriteStickerIds : [];
    displayStickers(stickers, fav);
  });
}

function displayStickers(stickers, favoriteIds = []) {
  const grid = document.getElementById('stickerGrid');
  grid.innerHTML = '';
  
  const favSet = new Set(favoriteIds);
  const sorted = [...stickers].sort((a, b) => {
    const ida = extractIdFromSticker(a);
    const idb = extractIdFromSticker(b);
    const fa = ida && favSet.has(ida) ? 1 : 0;
    const fb = idb && favSet.has(idb) ? 1 : 0;
    return fb - fa;
  });

  sorted.forEach((sticker) => {
    const id = extractIdFromSticker(sticker);
    const item = document.createElement('div');
    item.className = 'sticker-item';
    if (id) item.setAttribute('data-id', id);
    
    // 有圖片的顯示圖片，沒圖片的顯示名稱
    if (sticker.imageUrl) {
      item.innerHTML = `
        <div style="text-align: center;">
          <img src="${sticker.imageUrl}" 
               style="max-width: 50px; max-height: 50px; margin-bottom: 5px;" 
               alt="${sticker.name}"
               onerror="this.style.display='none'; this.parentElement.innerHTML='${sticker.name}';">
          ${id ? `<div class="sticker-id">${id}</div>` : ''}
        </div>
      `;
    } else {
      item.innerHTML = `
        <div>${sticker.name}</div>
        <div class="sticker-code">${sticker.code.substring(0, 20)}...</div>
      `;
    }

    // actions: favorite + delete
    if (id) {
      const actions = document.createElement('div');
      actions.className = 'sticker-actions';
      actions.innerHTML = `
        <button class="fav ${favSet.has(id) ? 'on' : ''}" title="${t('favTitle')}">★</button>
        <button class="del" title="${t('delTitle')}">✕</button>
      `;
      item.appendChild(actions);

      actions.querySelector('.fav').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        chrome.storage.sync.get(['favoriteStickerIds'], (r) => {
          const current = Array.isArray(r.favoriteStickerIds) ? r.favoriteStickerIds : [];
          const set = new Set(current);
          if (set.has(id)) set.delete(id);
          else set.add(id);
          const next = [...set];
          chrome.storage.sync.set({ favoriteStickerIds: next }, () => {
            loadStickers();
            loadSettings();
            setStatus(set.has(id) ? t('statusFavOn') : t('statusFavOff'));
          });
        });
      });

      actions.querySelector('.del').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        chrome.storage.sync.get(['stickerIdsText', 'favoriteStickerIds'], (r) => {
          const ids = parseIdsFromText(r.stickerIdsText || '');
          const nextIds = ids.filter((x) => x !== id);
          const nextFav = (Array.isArray(r.favoriteStickerIds) ? r.favoriteStickerIds : []).filter((x) => x !== id);
          const sortedIds = sortIdsWithFavorites(nextIds, nextFav);
          const stickersNext = sortedIds.map((sid, index) => buildStickerFromId(sid, index));
          chrome.storage.sync.set(
            {
              stickerIdsText: idsToText(sortedIds),
              stickers: stickersNext,
              favoriteStickerIds: nextFav
            },
            () => {
              loadStickers();
              loadSettings();
              setStatus(t('statusDeleted'));
            }
          );
        });
      });
    }
    
    grid.appendChild(item);
  });
}

// ===== 新增貼圖（只存 ID）= 新版本 =====
document.getElementById('saveIdsBtn').addEventListener('click', () => {
  const idListInput = document.getElementById('idListInput');
  const rawText = idListInput.value || '';
  const ids = parseIdsFromText(rawText);

  if (!ids.length) {
    chrome.storage.sync.set({ stickerIdsText: '', stickers: [], favoriteStickerIds: [] }, () => {
      loadStickers();
      setStatus(t('statusCleared'));
    });
    return;
  }

  const invalidId = ids.find((id) => !/^[A-Za-z0-9_]+$/.test(id));
  if (invalidId) {
    setStatus(t('statusInvalidId', invalidId), '#dc3545');
    return;
  }

  chrome.storage.sync.get(['favoriteStickerIds'], (r) => {
    const uniqueIds = [...new Set(ids)];
    const cleanedFav = removeUnknownFavorites(Array.isArray(r.favoriteStickerIds) ? r.favoriteStickerIds : [], uniqueIds);
    const sortedIds = sortIdsWithFavorites(uniqueIds, cleanedFav);
    const stickers = sortedIds.map((id, index) => buildStickerFromId(id, index));

    chrome.storage.sync.set(
      {
        stickerIdsText: idsToText(sortedIds),
        stickers,
        favoriteStickerIds: cleanedFav
      },
      () => {
        idListInput.value = idsToText(sortedIds);
        loadStickers();
        setStatus(t('statusSavedCount', sortedIds.length));
      }
    );
  });
});

// 已改用上方「ID 清單」作為唯一新增方式，因此不再提供「新增貼圖」按鈕。

// 初始化
loadStickers();