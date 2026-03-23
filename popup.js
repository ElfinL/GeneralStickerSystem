/* global DLSQ */
const TAG = typeof DLSQ !== 'undefined' ? DLSQ : null;

let currentLang = 'zh';

const I18N = {
  zh: {
    headerSubtitle: '貼圖清單管理',
    configTitle: '貼圖 ID 與標籤',
    configHint: '一行一組：ID 後可接 #標籤（每張最多 4 個，單一標籤最多 16 字元）',
    tagVocabTitle: '標籤詞庫（一行一個）',
    tagVocabHint: '頻道頁右鍵貼圖或面板內右鍵可套用；每張最多 4 個標籤',
    saveButton: '儲存 ID 清單與詞庫',
    reminder: '提醒：需要先在 DLive 登入；並在頻道頁使用',
    footer: '🔥 點「★」常用 •「✕」刪除 • 頻道頁／面板右鍵可套標籤',
    favTitle: '常用',
    delTitle: '刪除',
    statusFavOn: '✅ 已標記常用',
    statusFavOff: '✅ 已取消常用',
    statusCleared: '✅ 已清空 ID 清單',
    statusSavedCount: (n) => `✅ 已儲存 ${n} 個 ID`,
    statusDeleted: '✅ 已刪除',
    statusInvalidId: (id) => `❌ ID 格式錯誤：${id}`,
    statusParseErr: (detail) => `❌ 清單格式錯誤：${detail}`,
    statusVocabBadLine: (line) => `❌ 詞庫無效標籤（最多 16 字元、不可空白/#）：${line}`,
    langToggleLabel: '中 / EN',
    idPlaceholder: '826c4ac1e004273_498281 #梗圖 #反應\n826cd8c8b004273_335245',
    vocabPlaceholder: 'meme\nreaction\n搞笑',
    errBadId: (id) => `${id || ''}`.trim() || '無效 ID',
    errBadTag: (id, tag) => `${id}: #${tag} 無效`,
    errTooManyTags: (id) => `${id}: 標籤超過 4 個`,
    errDupId: (id) => `重複 ID: ${id}`,
    errUnknown: '未知錯誤'
  },
  en: {
    headerSubtitle: 'Sticker list manager',
    configTitle: 'Sticker IDs & tags',
    configHint: 'One per line: ID then optional #tags (max 4 tags, 16 chars each)',
    tagVocabTitle: 'Tag vocabulary (one per line)',
    tagVocabHint: 'Right-click emote on channel or tile in panel to apply; max 4 tags per sticker',
    saveButton: 'Save IDs & vocabulary',
    reminder: 'Tip: Please log in to DLive first and use this on a channel page',
    footer: '🔥 ★ favorite • ✕ delete • right-click to tag (page or panel)',
    favTitle: 'Favorite',
    delTitle: 'Delete',
    statusFavOn: '✅ Marked as favorite',
    statusFavOff: '✅ Unmarked as favorite',
    statusCleared: '✅ Cleared ID list',
    statusSavedCount: (n) => `✅ Saved ${n} IDs`,
    statusDeleted: '✅ Deleted',
    statusInvalidId: (id) => `❌ Invalid ID format: ${id}`,
    statusParseErr: (detail) => `❌ List parse error: ${detail}`,
    statusVocabBadLine: (line) => `❌ Invalid vocab tag (max 16 chars, no spaces/#): ${line}`,
    langToggleLabel: 'EN / 中',
    idPlaceholder: '826c4ac1e004273_498281 #meme #reaction\n826cd8c8b004273_335245',
    vocabPlaceholder: 'meme\nreaction\nfunny',
    errBadId: (id) => `${id || ''}`.trim() || 'Invalid ID',
    errBadTag: (id, tag) => `${id}: Invalid tag #${tag}`,
    errTooManyTags: (id) => `${id}: More than 4 tags`,
    errDupId: (id) => `Duplicate ID: ${id}`,
    errUnknown: 'Unknown error'
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

  const tagVocabTitleEl = document.getElementById('tagVocabTitle');
  if (tagVocabTitleEl) tagVocabTitleEl.textContent = t('tagVocabTitle');

  const tagVocabHintEl = document.getElementById('tagVocabHint');
  if (tagVocabHintEl) tagVocabHintEl.textContent = t('tagVocabHint');

  const saveBtn = document.getElementById('saveIdsBtn');
  if (saveBtn) saveBtn.textContent = t('saveButton');

  const reminderEl = document.getElementById('reminderText');
  if (reminderEl) reminderEl.textContent = t('reminder');

  const footerEl = document.getElementById('footerText');
  if (footerEl) footerEl.textContent = t('footer');

  const langToggle = document.getElementById('langToggle');
  if (langToggle) langToggle.textContent = t('langToggleLabel');

  const idListInput = document.getElementById('idListInput');
  if (idListInput) idListInput.placeholder = t('idPlaceholder');

  const tagVocabInput = document.getElementById('tagVocabInput');
  if (tagVocabInput) tagVocabInput.placeholder = t('vocabPlaceholder');

  chrome.storage.sync.set({ uiLang: currentLang });
}

function initLanguage() {
  chrome.storage.sync.get(['uiLang'], (result) => {
    const lang = result.uiLang === 'en' ? 'en' : 'zh';
    applyLanguage(lang);
  });
}

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
  }, 2800);
}

function buildStickerFromId(id, index) {
  return {
    name: `ID${index + 1}`,
    code: `:emote/mine/dlive/${id}:`,
    imageUrl: `https://images.prd.dlivecdn.com/emote/${id}`
  };
}

function parseStickerIdsWithTag(rawText) {
  if (!TAG) {
    const ids = (rawText || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    return {
      rows: ids.filter((id) => /^[A-Za-z0-9_]+$/.test(id)).map((id) => ({ id, tags: [] })),
      errors: []
    };
  }
  return TAG.parseStickerIdsText(rawText);
}

function parseIdsFromText(rawText) {
  const { rows } = parseStickerIdsWithTag(rawText);
  return rows.map((r) => r.id);
}

function idsToText(ids) {
  return (ids || []).join('\n');
}

function extractIdFromSticker(sticker) {
  const match = String(sticker?.code || '').match(/^:emote\/mine\/dlive\/([A-Za-z0-9_]+):$/);
  return match?.[1] || null;
}

function sortRowsWithFavorites(rows, favoriteIds) {
  const fav = new Set(Array.isArray(favoriteIds) ? favoriteIds : []);
  const list = Array.isArray(rows) ? rows : [];
  const favRows = list.filter((r) => r?.id && fav.has(r.id));
  const rest = list.filter((r) => r?.id && !fav.has(r.id));
  return [...favRows, ...rest];
}

function removeUnknownFavorites(favoriteIds, ids) {
  const set = new Set(ids);
  return (favoriteIds || []).filter((id) => set.has(id));
}

function formatParseError(err) {
  if (!err) return '';
  if (err.error === 'bad_id') return t('errBadId', err.id);
  if (err.error === 'bad_tag') return t('errBadTag', err.id, err.tag);
  if (err.error === 'too_many_tags') return t('errTooManyTags', err.id);
  if (err.error === 'dup_id') return t('errDupId', err.id);
  return String(err.error || t('errUnknown'));
}

function validateVocabInput(rawText) {
  if (!TAG) return { ok: true, text: rawText || '' };
  const lines = String(rawText || '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const line of lines) {
    const label = TAG.normalizeTagToken(line);
    if (!TAG.isValidTagLabel(label)) {
      return { ok: false, line: line.slice(0, 40) };
    }
  }
  return { ok: true, text: rawText || '' };
}

function mergeVocabWithRowTags(vocabRaw, rows) {
  if (!TAG) return vocabRaw || '';
  const list = TAG.parseTagVocabularyText(vocabRaw || '');
  const seen = new Set(list.map((x) => String(x).toLowerCase()));
  for (const row of Array.isArray(rows) ? rows : []) {
    for (const tag of Array.isArray(row?.tags) ? row.tags : []) {
      const label = TAG.normalizeTagToken(tag);
      if (!TAG.isValidTagLabel(label)) continue;
      const key = String(label).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      list.push(label);
    }
  }
  return list.join('\n');
}

function loadSettings() {
  const idListInput = document.getElementById('idListInput');
  const tagVocabInput = document.getElementById('tagVocabInput');
  if (!idListInput) return;

  chrome.storage.local.get(['stickerIdsText', 'stickers', 'favoriteStickerIds', 'stickerTagVocabularyText'], (result) => {
    if (tagVocabInput) {
      tagVocabInput.value =
        typeof result.stickerTagVocabularyText === 'string' ? result.stickerTagVocabularyText : '';
    }

    if (typeof result.stickerIdsText === 'string') {
      const { rows } = parseStickerIdsWithTag(result.stickerIdsText);
      const sorted = sortRowsWithFavorites(rows, result.favoriteStickerIds);
      idListInput.value = TAG ? TAG.serializeStickerRows(sorted) : idsToText(sorted.map((r) => r.id));
      return;
    }

    const stickers = Array.isArray(result.stickers) ? result.stickers : [];
    const ids = stickers.map(extractIdFromSticker).filter(Boolean);
    const rows = ids.map((id) => ({ id, tags: [] }));
    const sorted = sortRowsWithFavorites(rows, result.favoriteStickerIds);
    idListInput.value = TAG ? TAG.serializeStickerRows(sorted) : idsToText(sorted.map((r) => r.id));
  });
}

const langToggleBtn = document.getElementById('langToggle');
if (langToggleBtn) {
  langToggleBtn.addEventListener('click', () => {
    const next = currentLang === 'zh' ? 'en' : 'zh';
    applyLanguage(next);
    loadStickers();
  });
}

function loadStickers() {
  chrome.storage.local.get(['stickers', 'favoriteStickerIds', 'stickerIdsText'], (result) => {
    const stickers = result.stickers || defaultStickers;
    const fav = Array.isArray(result.favoriteStickerIds) ? result.favoriteStickerIds : [];
    const { rows } = parseStickerIdsWithTag(result.stickerIdsText || '');
    const tagMap = TAG ? TAG.rowsToIdTagMap(rows) : {};
    displayStickers(stickers, fav, tagMap);
  });
}

function displayStickers(stickers, favoriteIds = [], idToTags = {}) {
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

    const tags = id && idToTags[id] && idToTags[id].length ? idToTags[id] : [];
    const tagHtml = tags.length
      ? `<div class="sticker-tags">${tags.map((x) => `<span class="tag-pill">#${String(x)}</span>`).join('')}</div>`
      : '';

    if (sticker.imageUrl) {
      item.innerHTML = `
        <div style="text-align: center;">
          <img src="${sticker.imageUrl}" 
               style="max-width: 50px; max-height: 50px; margin-bottom: 5px;" 
               alt="${sticker.name}"
               onerror="this.style.display='none'; this.parentElement.innerHTML='${sticker.name}';">
          ${id ? `<div class="sticker-id">${id}</div>${tagHtml}` : ''}
        </div>
      `;
    } else {
      item.innerHTML = `
        <div>${sticker.name}</div>
        <div class="sticker-code">${sticker.code.substring(0, 20)}...</div>
      `;
    }

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
        chrome.storage.local.get(['favoriteStickerIds', 'stickerIdsText'], (r) => {
          const current = Array.isArray(r.favoriteStickerIds) ? r.favoriteStickerIds : [];
          const set = new Set(current);
          if (set.has(id)) set.delete(id);
          else set.add(id);
          const next = [...set];
          const { rows } = parseStickerIdsWithTag(r.stickerIdsText || '');
          const sortedRows = sortRowsWithFavorites(rows, next);
          const nextText = TAG ? TAG.serializeStickerRows(sortedRows) : idsToText(sortedRows.map((x) => x.id));
          const stickersNext = sortedRows.map((row, index) => buildStickerFromId(row.id, index));
          chrome.storage.local.set(
            {
              favoriteStickerIds: next,
              stickerIdsText: nextText,
              stickers: stickersNext
            },
            () => {
              loadStickers();
              loadSettings();
              setStatus(set.has(id) ? t('statusFavOn') : t('statusFavOff'));
            }
          );
        });
      });

      actions.querySelector('.del').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        chrome.storage.local.get(['stickerIdsText', 'favoriteStickerIds'], (r) => {
          const { rows } = parseStickerIdsWithTag(r.stickerIdsText || '');
          const nextRows = rows.filter((x) => x.id !== id);
          const nextFav = (Array.isArray(r.favoriteStickerIds) ? r.favoriteStickerIds : []).filter((x) => x !== id);
          const sortedRows = sortRowsWithFavorites(nextRows, nextFav);
          const nextText = TAG ? TAG.serializeStickerRows(sortedRows) : idsToText(sortedRows.map((x) => x.id));
          const stickersNext = sortedRows.map((row, index) => buildStickerFromId(row.id, index));
          chrome.storage.local.set(
            {
              stickerIdsText: nextText,
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

document.getElementById('saveIdsBtn').addEventListener('click', () => {
  const idListInput = document.getElementById('idListInput');
  const tagVocabInput = document.getElementById('tagVocabInput');
  const rawText = idListInput.value || '';
  const vocabRaw = tagVocabInput ? tagVocabInput.value || '' : '';

  const vocabCheck = validateVocabInput(vocabRaw);
  if (!vocabCheck.ok) {
    setStatus(t('statusVocabBadLine', vocabCheck.line), '#dc3545');
    return;
  }

  if (!rawText.trim()) {
    chrome.storage.local.set(
      {
        stickerIdsText: '',
        stickers: [],
        favoriteStickerIds: [],
        stickerTagVocabularyText: vocabRaw
      },
      () => {
        loadStickers();
        setStatus(t('statusCleared'));
      }
    );
    return;
  }

  const { rows, errors } = parseStickerIdsWithTag(rawText);
  if (errors.length) {
    setStatus(t('statusParseErr', formatParseError(errors[0])), '#dc3545');
    return;
  }
  const mergedVocabRaw = mergeVocabWithRowTags(vocabRaw, rows);

  const ids = rows.map((r) => r.id);
  const invalidId = ids.find((id) => !/^[A-Za-z0-9_]+$/.test(id));
  if (invalidId) {
    setStatus(t('statusInvalidId', invalidId), '#dc3545');
    return;
  }

  chrome.storage.local.get(['favoriteStickerIds'], (r) => {
    const uniqueRows = [];
    const seen = new Set();
    for (const row of rows) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      uniqueRows.push(row);
    }
    const cleanedFav = removeUnknownFavorites(Array.isArray(r.favoriteStickerIds) ? r.favoriteStickerIds : [], uniqueRows.map((x) => x.id));
    const sortedRows = sortRowsWithFavorites(uniqueRows, cleanedFav);
    const stickers = sortedRows.map((row, index) => buildStickerFromId(row.id, index));
    const nextText = TAG ? TAG.serializeStickerRows(sortedRows) : idsToText(sortedRows.map((x) => x.id));

    chrome.storage.local.set(
      {
        stickerIdsText: nextText,
        stickers,
        favoriteStickerIds: cleanedFav,
        stickerTagVocabularyText: mergedVocabRaw
      },
      () => {
        idListInput.value = nextText;
        if (tagVocabInput) tagVocabInput.value = mergedVocabRaw;
        loadStickers();
        setStatus(t('statusSavedCount', sortedRows.length));
      }
    );
  });
});

(async function dlsqBootPopup() {
  try {
    if (typeof DLSQStickerStore !== 'undefined') {
      await DLSQStickerStore.migrateFromSyncIfNeeded();
    }
  } catch (e) {
    console.warn('DLSQ sticker migrate', e);
  }
  loadSettings();
  initLanguage();
  loadStickers();
})();
