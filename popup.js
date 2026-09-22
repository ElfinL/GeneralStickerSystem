/* global DLSQ, I18N, SUPPORTED_LANGS, currentLang, t, applyLanguage, initLanguage, setLanguage, StickerRegistry, DLSQStickerStore, TexoPopup, CleanStorage */
const TAG = typeof DLSQ !== 'undefined' ? DLSQ : null;

function setStatus(text, color = '#28a745') {
  const el = document.getElementById('configStatus');
  if (!el) return;
  el.style.color = color;
  el.textContent = text;
  if (!text) return;
  setTimeout(() => {
    el.textContent = '';
  }, 2800);
}

function buildStickerFromId(id, index) {
  // 使用 StickerRegistry 統一獲取貼圖資訊
  const info = StickerRegistry.getStickerInfo(id);
  if (!info) {
    // 無效 ID 的降級處理
    return {
      name: `ID${index + 1}`,
      rawId: id,
      code: id,
      imageUrl: ''
    };
  }

  // 構建向後相容的貼圖物件
  // 使用正規化的 ID 作為 code（DL-xxx 格式），而非平台特定格式
  return {
    name: info.type === 'DL' ? `ID${index + 1}` : `圖片 ${index + 1}`,
    rawId: info.id,
    code: info.id,
    imageUrl: info.previewUrl,
    isVideo: info.isVideo,
    isIM: info.type === 'IM',
    isME: info.type === 'ME'
  };
}

function parseStickerIdsWithTag(rawText) {
  if (!TAG) {
    const lines = (rawText || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const rows = [];
    for (const line of lines) {
      const parts = line.split(/\s+/).filter(Boolean);
      if (!parts.length) continue;
      const rawId = parts[0];
      // IM 格式：將 -gif, -png, -jpg, -jpeg, -mp4 結尾替換為 . 點格式
      if (rawId.startsWith('IM-')) {
        const id = rawId.replace(/-(gif|png|jpg|jpeg|mp4)$/i, '.$1');
        if (!/^IM-[a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4)$/i.test(id)) continue;
        const tags = parts.slice(1).filter(p => p.startsWith('#')).map(p => p.slice(1));
        rows.push({ id, tags });
        continue;
      }
      // ME 格式：將 -gif, -png, -jpg, -jpeg, -mp4 結尾替換為 . 點格式
      if (rawId.startsWith('ME-')) {
        const id = rawId.replace(/-(gif|png|jpg|jpeg|mp4)$/i, '.$1');
        if (!/^ME-[a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4)$/i.test(id)) continue;
        const tags = parts.slice(1).filter(p => p.startsWith('#')).map(p => p.slice(1));
        rows.push({ id, tags });
        continue;
      }
      // 自動轉換舊 ID 格式
      const id = rawId.startsWith('DL-') ? rawId : `DL-${rawId}`;
      if (!/^(?:DL-)?[A-Za-z0-9_]+$/.test(id)) continue;
      const tags = parts.slice(1).filter(p => p.startsWith('#')).map(p => p.slice(1));
      rows.push({ id, tags });
    }
    return { rows, errors: [] };
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
  return null;
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

  chrome.storage.local.get(['stickerIdsText', 'stickerTagVocabularyText', 'favoriteStickerIds'], (result) => {
    if (tagVocabInput) {
      tagVocabInput.value = typeof result.stickerTagVocabularyText === 'string' ? result.stickerTagVocabularyText : '';
    }

    if (typeof result.stickerIdsText === 'string') {
      const { rows } = parseStickerIdsWithTag(result.stickerIdsText);
      const sorted = sortRowsWithFavorites(rows, result.favoriteStickerIds);
      idListInput.value = TAG ? TAG.serializeStickerRows(sorted) : idsToText(sorted.map((r) => r.id));
    } else {
      idListInput.value = '';
    }

    updateLineInfo();

    requestAnimationFrame(() => {
      setTimeout(() => {
        idListInput.setSelectionRange(0, 0);
        idListInput.scrollTop = 0;
        updateLineInfo();
      }, 100);
    });
  });
}

// 初始化語言按鈕事件
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.dataset.lang;
    if (lang && setLanguage(lang)) {
      updateLineInfo();
      loadStickers();
      updateSettingsButtonTexts();
      updateTexoTexts();
      initStickerSizeButtons();
    }
  });
});

function loadStickers() {
  chrome.storage.local.get(['stickerIdsText', 'favoriteStickerIds'], (result) => {
    const fav = Array.isArray(result.favoriteStickerIds) ? result.favoriteStickerIds : [];
    const { rows } = parseStickerIdsWithTag(result.stickerIdsText || '');
    const tagMap = TAG ? TAG.rowsToIdTagMap(rows) : {};

    const stickers = rows.map((row, index) => buildStickerFromId(row.id, index));
    displayStickers(stickers, fav, tagMap);
  });
}

function displayStickers(stickers, favoriteIds = [], idToTags = {}) {
  const grid = document.getElementById('stickerGrid');
  if (!grid) return;
  grid.textContent = '';

  const favSet = new Set(favoriteIds);
  const sorted = [...stickers].sort((a, b) => {
    const ida = a.rawId || a.code;
    const idb = b.rawId || b.code;
    const fa = ida && favSet.has(ida) ? 1 : 0;
    const fb = idb && favSet.has(idb) ? 1 : 0;
    return fb - fa;
  });

  sorted.forEach((sticker) => {
    const id = sticker.rawId || sticker.code;
    const isIM = sticker.isIM || id.startsWith('IM-');
    const item = document.createElement('div');
    item.className = 'sticker-item';
    if (id) item.setAttribute('data-id', id);

    const tags = id && idToTags[id] && idToTags[id].length ? idToTags[id] : [];

    if (sticker.imageUrl) {
      const imgContainer = document.createElement('div');
      imgContainer.style.textAlign = 'center';

      if (sticker.isVideo) {
        const video = document.createElement('video');
        video.src = sticker.imageUrl;
        video.style.maxWidth = '50px';
        video.style.maxHeight = '50px';
        video.style.marginBottom = '5px';
        video.muted = true;
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;
        video.onerror = () => {
          video.style.display = 'none';
          imgContainer.textContent = sticker.name;
        };
        imgContainer.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = sticker.imageUrl;
        img.style.maxWidth = '50px';
        img.style.maxHeight = '50px';
        img.style.marginBottom = '5px';
        img.alt = sticker.name;
        img.onerror = () => {
          img.style.display = 'none';
          imgContainer.textContent = sticker.name;
        };
        imgContainer.appendChild(img);
      }

      if (id) {
        const idDiv = document.createElement('div');
        idDiv.className = 'sticker-id';
        idDiv.textContent = sticker.code.length > 20 ? sticker.code.slice(0, 20) + '...' : sticker.code;
        imgContainer.appendChild(idDiv);

        if (tags.length) {
          const tagsDiv = document.createElement('div');
          tagsDiv.className = 'sticker-tags';
          tags.forEach(x => {
            const span = document.createElement('span');
            span.className = 'tag-pill';
            span.textContent = `#${String(x)}`;
            tagsDiv.appendChild(span);
          });
          imgContainer.appendChild(tagsDiv);
        }
      }
      item.appendChild(imgContainer);
    } else {
      const nameDiv = document.createElement('div');
      nameDiv.textContent = sticker.name;
      const codeDiv = document.createElement('div');
      codeDiv.className = 'sticker-code';
      codeDiv.textContent = `${sticker.code.substring(0, 20)}...`;
      item.appendChild(nameDiv);
      item.appendChild(codeDiv);
    }

    if (id) {
      const actions = document.createElement('div');
      actions.className = 'sticker-actions';

      const favBtn = document.createElement('button');
      favBtn.className = `fav ${favSet.has(id) ? 'on' : ''}`;
      favBtn.title = t('favTitle');
      favBtn.textContent = '★';

      const delBtn = document.createElement('button');
      delBtn.className = 'del';
      delBtn.title = t('delTitle');
      delBtn.textContent = '✕';

      actions.appendChild(favBtn);
      actions.appendChild(delBtn);
      item.appendChild(actions);

      favBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(id);
      });

      delBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        deleteSticker(id);
      });
    }

    grid.appendChild(item);
  });
}

function toggleFavorite(id) {
  chrome.storage.local.get(['stickerIdsText', 'favoriteStickerIds', 'stickerTagVocabularyText'], (r) => {
    const current = Array.isArray(r.favoriteStickerIds) ? r.favoriteStickerIds : [];
    const set = new Set(current);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    const next = [...set];

    const { rows } = parseStickerIdsWithTag(r.stickerIdsText || '');
    const sortedRows = sortRowsWithFavorites(rows, next);
    const nextText = TAG ? TAG.serializeStickerRows(sortedRows) : idsToText(sortedRows.map((x) => x.id));

    chrome.storage.local.set(
      {
        favoriteStickerIds: next,
        stickerIdsText: nextText
      },
      () => {
        loadStickers();
        loadSettings();
        setStatus(set.has(id) ? t('statusFavOn') : t('statusFavOff'));
      }
    );
  });
}

function deleteSticker(id) {
  chrome.storage.local.get(['stickerIdsText', 'favoriteStickerIds'], (r) => {
    const { rows } = parseStickerIdsWithTag(r.stickerIdsText || '');
    const nextRows = rows.filter((x) => x.id !== id);
    const nextFav = (Array.isArray(r.favoriteStickerIds) ? r.favoriteStickerIds : []).filter((x) => x !== id);
    const sortedRows = sortRowsWithFavorites(nextRows, nextFav);
    const nextText = TAG ? TAG.serializeStickerRows(sortedRows) : idsToText(sortedRows.map((x) => x.id));

    chrome.storage.local.set(
      {
        stickerIdsText: nextText,
        favoriteStickerIds: nextFav
      },
      () => {
        loadStickers();
        loadSettings();
        setStatus(t('statusDeleted'));
      }
    );
  });
}

function initSaveIdsButton() {
  const saveBtn = document.getElementById('saveIdsBtn');
  if (!saveBtn) return;

  saveBtn.addEventListener('click', () => {
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
    const invalidId = ids.find((id) => {
      if (TAG && typeof TAG.isValidDLId === 'function') {
        return !TAG.isValidDLId(id) && !TAG.isValidIMId(id) && !TAG.isValidMEId(id) && !TAG.isValidYTId(id) && !TAG.isValidCBId(id) && !TAG.isValidGSSId(id);
      }
      const isDL = /^(?:DL-)?[A-Za-z0-9_]+$/.test(id);
      const isIM = /^IM-[a-zA-Z0-9]+(?:\.(?:gif|png|jpg|jpeg|mp4))?$/i.test(id);
      const isME = /^ME-[a-zA-Z0-9]+(?:\.(?:gif|png|jpg|jpeg|mp4))?$/i.test(id);
      const isYT = /^YT-[a-zA-Z0-9_-]+$/.test(id);
      const isYTS = /^YTS-[a-zA-Z0-9_-]+$/.test(id);
      const isCB = /^CB-[a-zA-Z0-9]{6}(?:\.(?:gif|png|jpg|jpeg|mp4|webp))?$/i.test(id);
      const isGSS = /^GSS-(?:https?:\/\/)?[^\s]+\.(?:jpg|jpeg|png|gif|webp|bmp|svg|mp4)(?:\?[^\s]*)?$/i.test(id);
      return !isDL && !isIM && !isME && !isYT && !isYTS && !isCB && !isGSS;
    });
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
      const nextText = TAG ? TAG.serializeStickerRows(sortedRows) : idsToText(sortedRows.map((x) => x.id));

      chrome.storage.local.set(
        {
          stickerIdsText: nextText,
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
}

(async function dlsqBootPopup() {
  try {
    const manifest = chrome.runtime.getManifest();
    const version = manifest?.version || '3.0';
    const titleEl = document.getElementById('titleText');
    if (titleEl) {
      titleEl.textContent = '';
      const img = document.createElement('img');
      img.src = 'icons/icon16.png';
      img.style.cssText = 'width:16px;height:16px;vertical-align:middle;margin-right:4px;';
      titleEl.appendChild(img);
      titleEl.appendChild(document.createTextNode(' General Sticker System (GSS) V' + version));
    }
  } catch (e) {}

  try {
    if (typeof DLSQStickerStore !== 'undefined') {
      await DLSQStickerStore.migrateFromSyncIfNeeded();
    }
  } catch (e) {}

  loadSettings();
  initLanguage(() => {
    updateTexoTexts();
  });
  initLineInfo();
  loadStickers();
})();

// ==================== 行號資訊顯示 ====================
function updateLineInfo() {
  const textarea = document.getElementById('idListInput');
  const lineInfoText = document.getElementById('lineInfoText');
  if (!textarea || !lineInfoText) return;

  const normalizedValue = textarea.value.replace(/\r\n/g, '\n');
  const lines = normalizedValue.split('\n');
  const totalLines = lines.length;

  const cursorPos = textarea.selectionStart;
  const textBeforeCursor = textarea.value.substring(0, cursorPos).replace(/\r\n/g, '\n');
  const currentLine = textBeforeCursor.split('\n').length;

  lineInfoText.textContent = t('lineInfo', currentLine, totalLines);
}

function initLineInfo() {
  const textarea = document.getElementById('idListInput');
  const gotoLineInput = document.getElementById('gotoLineInput');
  const gotoLineBtn = document.getElementById('gotoLineBtn');
  if (!textarea) return;

  function gotoLine() {
    const lineNum = parseInt(gotoLineInput.value, 10);
    if (isNaN(lineNum) || lineNum < 1) return;

    const lines = textarea.value.split('\n');
    if (lineNum > lines.length) return;

    let targetPos = 0;
    for (let i = 0; i < lineNum - 1; i++) {
      targetPos += lines[i].length + 1;
    }

    textarea.focus();
    textarea.setSelectionRange(targetPos, targetPos);
    updateLineInfo();

    const lineHeight = 18;
    textarea.scrollTop = (lineNum - 1) * lineHeight;
  }

  textarea.addEventListener('keyup', updateLineInfo);
  textarea.addEventListener('click', updateLineInfo);
  textarea.addEventListener('input', updateLineInfo);
  textarea.addEventListener('scroll', updateLineInfo);

  if (gotoLineBtn) {
    gotoLineBtn.addEventListener('click', gotoLine);
  }
  if (gotoLineInput) {
    gotoLineInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') gotoLine();
    });
  }

  setTimeout(() => {
    textarea.setSelectionRange(0, 0);
    textarea.scrollTop = 0;
    updateLineInfo();
  }, 200);
}

// ==================== 平台檢測 ====================
function getCurrentPlatform(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) {
      callback('unknown');
      return;
    }
    const url = tabs[0].url || '';
    if (url.includes('twitch.tv')) {
      callback('twitch');
    } else {
      callback('unknown');
    }
  });
}

// ==================== 頁面切換功能 ====================
let currentPage = 'main';

function initPageToggle() {
  const tabSticker = document.getElementById('tabSticker');
  const tabTexo = document.getElementById('tabTexo');
  const tabClean = document.getElementById('tabClean');
  const tabSettings = document.getElementById('tabSettings');
  const tabDisclaimer = document.getElementById('tabDisclaimer');
  const mainPage = document.getElementById('mainPage');
  const texoPage = document.getElementById('texoPage');
  const cleanPage = document.getElementById('cleanPage');
  const settingsPage = document.getElementById('settingsPage');
  const disclaimerPage = document.getElementById('disclaimerPage');

  if (!tabSticker || !tabSettings || !mainPage || !settingsPage) return;

  getCurrentPlatform((platform) => {
    const reminderText = document.getElementById('reminderText');
    if (reminderText && typeof t === 'function') {
      reminderText.textContent = t('reminder');
    }
  });

  function switchToPage(page) {
    currentPage = page;
    mainPage.classList.remove('active');
    if (texoPage) texoPage.classList.remove('active');
    if (cleanPage) cleanPage.classList.remove('active');
    settingsPage.classList.remove('active');
    if (disclaimerPage) disclaimerPage.classList.remove('active');
    tabSticker.classList.remove('active');
    if (tabTexo) tabTexo.classList.remove('active');
    if (tabClean) tabClean.classList.remove('active');
    tabSettings.classList.remove('active');
    if (tabDisclaimer) tabDisclaimer.classList.remove('active');

    if (page === 'main') {
      mainPage.classList.add('active');
      tabSticker.classList.add('active');
    } else if (page === 'texo') {
      if (texoPage) texoPage.classList.add('active');
      if (tabTexo) tabTexo.classList.add('active');
      initTscToggles();
    } else if (page === 'clean') {
      if (cleanPage) cleanPage.classList.add('active');
      if (tabClean) tabClean.classList.add('active');
      initCleanPage();
    } else if (page === 'settings') {
      settingsPage.classList.add('active');
      tabSettings.classList.add('active');
    } else if (page === 'disclaimer') {
      if (disclaimerPage) disclaimerPage.classList.add('active');
      if (tabDisclaimer) tabDisclaimer.classList.add('active');
    }
  }

  tabSticker.addEventListener('click', () => switchToPage('main'));
  if (tabTexo) tabTexo.addEventListener('click', () => switchToPage('texo'));
  if (tabClean) tabClean.addEventListener('click', () => switchToPage('clean'));
  tabSettings.addEventListener('click', () => switchToPage('settings'));
  if (tabDisclaimer) tabDisclaimer.addEventListener('click', () => switchToPage('disclaimer'));

  if (typeof TexoPopup !== 'undefined') {
    TexoPopup.init();
  }

  const openEditorBtn = document.getElementById('openEditorBtn');
  if (openEditorBtn) {
    openEditorBtn.addEventListener('click', () => {
      const editorUrl = chrome.runtime.getURL('editor.html');
      window.open(editorUrl, '_blank');
    });
  }
}

// 禁用原生右鍵面板按鈕
initDisableNativeContextMenuButton();

// 貼圖大小控制
initStickerSizeControl();

// ==================== 自動關閉 Mature 警告功能 ====================
let customDialogCallback = null;

function initCustomDialog() {
  const dialog = document.getElementById('customConfirmDialog');
  const cancelBtn = document.getElementById('customDialogCancel');
  const confirmBtn = document.getElementById('customDialogConfirm');

  if (!dialog || !cancelBtn || !confirmBtn) return;

  cancelBtn.addEventListener('click', () => hideCustomDialog(false));
  confirmBtn.addEventListener('click', () => hideCustomDialog(true));

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) hideCustomDialog(false);
  });
}

function showCustomDialog(title, content, onConfirm) {
  const dialog = document.getElementById('customConfirmDialog');
  const titleEl = document.getElementById('customDialogTitle');
  const contentEl = document.getElementById('customDialogContent');
  const cancelBtn = document.getElementById('customDialogCancel');
  const confirmBtn = document.getElementById('customDialogConfirm');

  if (!dialog || !titleEl || !contentEl) return;

  titleEl.textContent = title || t('autoMatureTitle') || '🔞 自動關閉 Mature 警告';
  contentEl.textContent = content;

  if (cancelBtn) cancelBtn.textContent = t('deleteCancelBtn') || '取消';
  if (confirmBtn) confirmBtn.textContent = t('deleteConfirmBtn') || '確定';

  customDialogCallback = onConfirm;
  dialog.classList.add('show');
}

function hideCustomDialog(result) {
  const dialog = document.getElementById('customConfirmDialog');
  if (dialog) {
    dialog.classList.remove('show');
  }

  if (customDialogCallback) {
    const callback = customDialogCallback;
    customDialogCallback = null;
    callback(result);
  }
}

function initAutoMatureButton() {
  const btn = document.getElementById('btnAutoMature');
  if (!btn) return;

  initCustomDialog();

  chrome.storage.local.get(['autoCloseMatureWarning'], (result) => {
    const isEnabled = result.autoCloseMatureWarning === true;
    updateAutoMatureButtonState(btn, isEnabled);
  });

  btn.addEventListener('click', () => {
    chrome.storage.local.get(['autoCloseMatureWarning'], (result) => {
      const currentState = result.autoCloseMatureWarning === true;

      if (!currentState) {
        const confirmMessage = t('autoMatureConfirm');
        showCustomDialog(null, confirmMessage, (confirmed) => {
          if (confirmed) {
            setAutoMatureWarning(true);
            updateAutoMatureButtonState(btn, true);
          }
        });
      } else {
        setAutoMatureWarning(false);
        updateAutoMatureButtonState(btn, false);
      }
    });
  });
}

function updateAutoMatureButtonState(btn, isEnabled) {
  btn.classList.toggle('active', isEnabled);
  const baseText = t('autoMatureTitle') || '🔞 記住 Mature 同意';
  btn.textContent = isEnabled ? `${baseText} (✓)` : baseText;
}

function setAutoMatureWarning(enabled) {
  chrome.storage.local.set({ autoCloseMatureWarning: enabled }, () => {});
  showSettingsStatus(
    enabled ? t('autoMatureEnabled') : t('autoMatureDisabled'),
    enabled ? '#28a745' : '#dc3545'
  );
}

// ==================== 禁用原生右鍵面板功能 ====================
function initDisableNativeContextMenuButton() {
  const btn = document.getElementById('btnDisableNativeContextMenu');
  if (!btn) return;

  chrome.storage.local.get(['disableNativeContextMenu'], (result) => {
    const isDisabled = result.disableNativeContextMenu === true;
    updateDisableNativeContextMenuButtonState(btn, isDisabled);
  });

  btn.addEventListener('click', () => {
    chrome.storage.local.get(['disableNativeContextMenu'], (result) => {
      const currentState = result.disableNativeContextMenu === true;
      const newState = !currentState;

      chrome.storage.local.set({ disableNativeContextMenu: newState }, () => {
        updateDisableNativeContextMenuButtonState(btn, newState);
        showSettingsStatus(
          newState ? t('disableNativeContextMenuEnabled') : t('disableNativeContextMenuDisabled'),
          newState ? '#28a745' : '#dc3545'
        );

        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
              type: 'GSS_CONTROL',
              command: newState ? 'disableNativeContextMenu' : 'enableNativeContextMenu'
            }).catch(() => {});
          });
        });
      });
    });
  });
}

function updateDisableNativeContextMenuButtonState(btn, isDisabled) {
  btn.classList.toggle('active', isDisabled);
  const baseText = t('disableNativeContextMenuTitle') || '關閉右鍵面板';
  const textEl = btn.querySelector('.btn-text');
  if (textEl) {
    textEl.textContent = isDisabled ? `${baseText} (✓)` : baseText;
  } else {
    btn.textContent = isDisabled ? `${baseText} (✓)` : baseText;
  }
}

// ==================== 貼圖大小設定功能 ====================
function initStickerSizeControl() {
  const buttons = document.querySelectorAll('.sticker-size-btn');
  const customSizeArea = document.getElementById('customSizeArea');
  const customInput = document.getElementById('customStickerSizeInput');
  
  if (buttons.length === 0) return;
  
  chrome.storage.local.get(['stickerSizeMode', 'stickerSizePercent'], (result) => {
    let currentMode = result.stickerSizeMode;
    if (currentMode === undefined || currentMode === false) {
      currentMode = 'large';
    } else if (currentMode === true) {
      currentMode = 'small';
    }
    
    if (customInput) {
      customInput.value = result.stickerSizePercent || 100;
    }
    
    updateStickerSizeButtons(currentMode);
    
    if (customSizeArea) {
      customSizeArea.style.display = (currentMode === 'custom') ? 'flex' : 'none';
    }
    
    if (result.stickerSizeMode === undefined) {
      chrome.storage.local.set({ stickerSizeMode: 'large' });
    }
    
    notifySizeChange(currentMode, customInput?.value);
  });
  
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const mode = button.getAttribute('data-size');
      if (customSizeArea) {
        customSizeArea.style.display = (mode === 'custom') ? 'flex' : 'none';
      }
      saveStickerSizeMode(mode);
    });
  });

  if (customInput) {
    customInput.addEventListener('change', () => {
      let val = parseInt(customInput.value);
      if (isNaN(val) || val < 5) val = 5;
      if (val > 300) val = 300;
      customInput.value = val;
      chrome.storage.local.set({ stickerSizePercent: val, stickerSizeMode: 'custom' }, () => {
        updateStickerSizeButtons('custom');
        notifySizeChange('custom', val);
      });
    });
  }
}

function notifySizeChange(mode, percent) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'GSS_CONTROL',
        command: 'updateStickerSizeMode',
        data: { 
          mode: mode,
          percent: percent
        }
      }).catch(() => {});
    });
  });
}

function updateStickerSizeButtons(currentMode) {
  const buttons = document.querySelectorAll('.sticker-size-btn');
  buttons.forEach(button => {
    const mode = button.getAttribute('data-size');
    if (mode === currentMode) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

function saveStickerSizeMode(mode) {
  chrome.storage.local.set({ stickerSizeMode: mode }, () => {
    updateStickerSizeButtons(mode);
    
    const modeNames = {
      'large': t('stickerSizeModeLarge') || '大',
      'medium': t('stickerSizeModeMedium') || '中',
      'small': t('stickerSizeModeSmall') || '小',
      'custom': t('stickerSizeModeCustom') || '自定義'
    };
    const message = `已切換為${modeNames[mode]}`;
    showSettingsStatus(message, '#4CAF50');
    
    const customInput = document.getElementById('customStickerSizeInput');
    notifySizeChange(mode, customInput?.value);
  });
}

// ==================== TSC 開關功能 ====================
function initTscToggles() {
  const tscEnabled = document.getElementById('tscEnabled');
  const tscAutoCollect = document.getElementById('tscAutoCollect');
  const tscEnabledLabel = document.getElementById('tscEnabledLabel');
  const tscAutoCollectLabel = document.getElementById('tscAutoCollectLabel');

  if (!tscEnabled || !tscAutoCollect) return;

  if (tscEnabledLabel && typeof t === 'function') {
    const text = t('tscEnabledLabel');
    if (text) tscEnabledLabel.textContent = text;
  }
  if (tscAutoCollectLabel && typeof t === 'function') {
    const text = t('tscAutoCollectLabel');
    if (text) tscAutoCollectLabel.textContent = text;
  }

  if (tscEnabled.dataset.initialized === 'true') return;
  tscEnabled.dataset.initialized = 'true';

  chrome.storage.local.get(['tscEnabled', 'tscAutoCollect'], (result) => {
    const isEnabled = result.tscEnabled !== false;
    const isAutoCollect = result.tscAutoCollect !== false;

    tscEnabled.checked = isEnabled;
    tscAutoCollect.checked = isAutoCollect;
    tscAutoCollect.disabled = !isEnabled;
  });

  tscEnabled.addEventListener('change', () => {
    const isEnabled = tscEnabled.checked;

    tscAutoCollect.disabled = !isEnabled;
    if (!isEnabled) {
      tscAutoCollect.checked = false;
    }

    chrome.storage.local.set({ tscEnabled: isEnabled }, () => {
      if (!isEnabled) {
        chrome.storage.local.set({ tscAutoCollect: false });
      }
      showSettingsStatus(
        isEnabled ? 'TSC 系統已開啟' : 'TSC 系統已關閉',
        isEnabled ? '#28a745' : '#dc3545'
      );
      notifyAllTabs({ type: 'GSS_CONTROL', command: isEnabled ? 'enableTsc' : 'disableTsc' });
    });
  });

  tscAutoCollect.addEventListener('change', () => {
    const isAutoCollect = tscAutoCollect.checked;
    chrome.storage.local.set({ tscAutoCollect: isAutoCollect }, () => {
      showSettingsStatus(
        isAutoCollect ? t('tscAutoCollectEnabled') : t('tscAutoCollectDisabled'),
        isAutoCollect ? '#28a745' : '#dc3545'
      );
      notifyAllTabs({ type: 'GSS_CONTROL', command: isAutoCollect ? 'enableTscAutoCollect' : 'disableTscAutoCollect' });
    });
  });
}

function notifyAllTabs(message) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, message).catch(() => {});
    });
  });
}

function updateSettingsButtonTexts() {
  const generalSettingsText = document.getElementById('generalSettingsText');
  if (generalSettingsText) generalSettingsText.textContent = t('generalSettings') || '通用設定';

  const btnDisableNativeContextMenu = document.getElementById('btnDisableNativeContextMenu');
  if (btnDisableNativeContextMenu) {
    const textEl = btnDisableNativeContextMenu.querySelector('.btn-text');
    if (textEl) {
      const isDisabled = btnDisableNativeContextMenu.classList.contains('active');
      const baseText = t('disableNativeContextMenuTitle') || '關閉右鍵面板';
      textEl.textContent = isDisabled ? `${baseText} (✓)` : baseText;
    }
  }

  const openEditorBtn = document.getElementById('openEditorBtn');
  if (openEditorBtn) openEditorBtn.textContent = t('openEditor');

  const stickerSizeTitle = document.getElementById('stickerSizeTitle');
  if (stickerSizeTitle) stickerSizeTitle.textContent = t('stickerSizeTitle') || '📏 貼圖大小設定';

  const stickerSizeToggle = document.getElementById('stickerSizeToggle');
  if (stickerSizeToggle) {
    const isSmallMode = stickerSizeToggle.checked;
    updateStickerSizeLabel(isSmallMode);
  }

  const customPlatformSectionTitle = document.getElementById('customPlatformSectionTitle');
  if (customPlatformSectionTitle) customPlatformSectionTitle.textContent = t('customPlatformTitle');

  const customPlatformSectionHint = document.getElementById('customPlatformSectionHint');
  if (customPlatformSectionHint) customPlatformSectionHint.textContent = t('customPlatformHint');

  const btnAddCustomPlatform = document.getElementById('btnAddCustomPlatform');
  if (btnAddCustomPlatform) {
    const textEl = btnAddCustomPlatform.querySelector('.btn-text');
    if (textEl) textEl.textContent = t('btnAddCustomPlatform');
  }

  const btnEditCustomPlatform = document.getElementById('btnEditCustomPlatform');
  if (btnEditCustomPlatform) {
    const textEl = btnEditCustomPlatform.querySelector('.btn-text');
    if (textEl) textEl.textContent = t('btnEditCustomPlatform');
  }

  const customPlatformDialogTitle = document.getElementById('customPlatformDialogTitle');
  if (customPlatformDialogTitle) customPlatformDialogTitle.textContent = t('customPlatformDialogTitle');

  const hostnameLabel = document.querySelector('#customPlatformDialog label[style*="color: #ffd43b"]');
  if (hostnameLabel) hostnameLabel.textContent = t('customPlatformHostnameLabel');

  const chatContainerLabel = document.querySelector('#customPlatformDialog label[style*="color: #28a745"]');
  if (chatContainerLabel) chatContainerLabel.textContent = t('customPlatformChatContainerLabel');

  const logicLabel = document.querySelector('#customPlatformDialog label[style*="color: #4a90e2"]');
  if (logicLabel) logicLabel.textContent = t('customPlatformLogicLabel');

  const logicTextarea = document.getElementById('customPlatformLogic');
  if (logicTextarea) logicTextarea.placeholder = t('customPlatformLogicPlaceholder');

  const btnCancelCustomPlatform = document.getElementById('btnCancelCustomPlatform');
  if (btnCancelCustomPlatform) btnCancelCustomPlatform.textContent = t('deleteCancelBtn');

  const btnSaveCustomPlatform = document.getElementById('btnSaveCustomPlatform');
  if (btnSaveCustomPlatform) btnSaveCustomPlatform.textContent = t('texoSave');

  if (typeof renderCustomPlatforms === 'function') {
    renderCustomPlatforms();
  }
}

function updateTexoTexts() {
  const texoTitle = document.getElementById('texoTitle');
  if (texoTitle) texoTitle.textContent = t('texoTitle') || '🧶 實況編織核心';

  const texoSubtitle = document.getElementById('texoSubtitle');
  if (texoSubtitle) texoSubtitle.textContent = t('texoSubtitle') || 'Texo Stream Core - 管理多平台實況資訊';

  const texoLabel = document.getElementById('texoLabel');
  if (texoLabel) {
    const label = t('texoLabel') || '編織資料';
    const onePerLine = t('texoOnePerLine') || '(一行一筆)';
    texoLabel.textContent = '';
    texoLabel.appendChild(document.createTextNode(label + ' '));
    const span = document.createElement('span');
    span.id = 'texoOnePerLine';
    span.style.cssText = 'color: #868e96; font-weight: 400;';
    span.textContent = onePerLine;
    texoLabel.appendChild(span);
  }

  const texoInput = document.getElementById('texoInput');
  if (texoInput) texoInput.placeholder = t('texoPlaceholder') || '>主播名稱 #https://www.twitch.tv/xxx\n#https://www.youtube.com/...\n#https://www.kick.com/...';

  const texoFormatTitle = document.getElementById('texoFormatTitle');
  if (texoFormatTitle) texoFormatTitle.textContent = t('texoFormatTitle') || '格式規則：';

  const texoFormatDisplayName = document.getElementById('texoFormatDisplayName');
  if (texoFormatDisplayName) texoFormatDisplayName.textContent = t('texoFormatDisplayName') || '顯示名稱';

  const texoFormatPlatform = document.getElementById('texoFormatPlatform');
  if (texoFormatPlatform) texoFormatPlatform.textContent = t('texoFormatPlatform') || '直播平台';

  const tscEnabledLabel = document.getElementById('tscEnabledLabel');
  if (tscEnabledLabel) {
    const text = t('tscEnabledLabel');
    if (text) tscEnabledLabel.textContent = text;
  }
  const tscAutoCollectLabel = document.getElementById('tscAutoCollectLabel');
  if (tscAutoCollectLabel) {
    const text = t('tscAutoCollectLabel');
    if (text) tscAutoCollectLabel.textContent = text;
  }

  const texoFormatSharedChat = document.getElementById('texoFormatSharedChat');
  if (texoFormatSharedChat) texoFormatSharedChat.textContent = t('texoFormatSharedChat') || '共用聊天室';

  const texoFormatSeeHelp = document.getElementById('texoFormatSeeHelp');
  if (texoFormatSeeHelp) texoFormatSeeHelp.textContent = t('texoFormatSeeHelp') || '詳見';

  const texoSaveText = document.getElementById('texoSaveText');
  if (texoSaveText) texoSaveText.textContent = t('texoSave') || '💾 儲存';

  const texoStatus = document.getElementById('texoStatus');
  if (texoStatus && !texoStatus.textContent.includes('✅')) {
    texoStatus.textContent = t('texoStatus') || '自動載入上次儲存的內容';
  }

  const tabTexoSpan = document.querySelector('#tabTexo [data-i18n="tabTexo"]');
  if (tabTexoSpan) tabTexoSpan.textContent = t('tabTexo') || '編織';

  const tabCleanSpan = document.querySelector('#tabClean [data-i18n="tabClean"]');
  if (tabCleanSpan) tabCleanSpan.textContent = t('tabClean') || '清潔';

  const tabSettingsText = document.getElementById('tabSettingsText');
  if (tabSettingsText) tabSettingsText.textContent = t('tabSettings') || '設定';

  if (typeof t === 'function') {
    const cleanTitle = document.querySelector('#cleanPage .settings-section-title');
    if (cleanTitle) cleanTitle.textContent = t('cleanTitle') || '🧹 清潔元素';

    const cleanDescription = document.querySelector('#cleanPage .settings-section > div:nth-child(2)');
    if (cleanDescription) cleanDescription.textContent = t('cleanDescription') || '隱藏或移除網頁上的干擾元素，讓實況界面更乾淨。';

    const startPickerBtn = document.getElementById('startPickerBtn');
    if (startPickerBtn) startPickerBtn.textContent = t('cleanStartPicker') || '🎯 開始揀選元素';

    const exitPickerBtn = document.getElementById('exitPickerBtn');
    if (exitPickerBtn) exitPickerBtn.textContent = t('cleanExitPicker') || '🚫 退出揀選';

    const pickerStatus = document.getElementById('pickerStatus');
    if (pickerStatus) pickerStatus.textContent = t('cleanPickerStatus') || '揀選模式中：移動鼠標到要隱藏的元素上，點擊即可添加規則。按 Esc 退出。';

    const manualSelectorLabel = document.querySelector('#cleanPage div:nth-child(4) > div:nth-child(1)');
    if (manualSelectorLabel) manualSelectorLabel.textContent = t('cleanManualSelector') || '手動添加 CSS 選擇器：';

    const manualSelector = document.getElementById('manualSelector');
    if (manualSelector) manualSelector.placeholder = t('cleanManualPlaceholder') || '.sidebar 或 #ads';

    const addManualBtn = document.getElementById('addManualSelectorBtn');
    if (addManualBtn) addManualBtn.textContent = t('cleanAddManual') || '添加';

    const rulesTitle = document.querySelector('#cleanPage div:nth-child(5) > div:nth-child(1)');
    if (rulesTitle) rulesTitle.textContent = t('cleanRulesTitle') || '隱藏規則列表：';

    const clearAllBtn = document.getElementById('clearAllRulesBtn');
    if (clearAllBtn) clearAllBtn.textContent = t('cleanClearAll') || '清空全部';

    displayRulesTable();

    getCurrentTab().then(tab => {
      if (tab) {
        chrome.tabs.sendMessage(tab.id, { action: 'updateLanguage', lang: currentLang });
      }
    });
  }
  
  const stickerSizeTitle = document.getElementById('stickerSizeTitle');
  if (stickerSizeTitle) stickerSizeTitle.textContent = t('stickerSizeTitle') || '📏 貼圖大小設定';
  
  const stickerSizeRange = document.getElementById('stickerSizeRange');
  if (stickerSizeRange) stickerSizeRange.textContent = t('stickerSizeRange') || '範圍：5% - 200% • 每次 ±5%';
}

function showSettingsStatus(message, color) {
  const status = document.getElementById('settingsStatus');
  if (status) {
    status.textContent = message;
    status.style.color = color || 'rgba(255, 255, 255, 0.7)';
  }
}

// DOM 載入後初始化頁面切換
document.addEventListener('DOMContentLoaded', () => {
  initLanguage(() => {
    initPageToggle();
    initHomeButton();
    initHelpPopover();
    initUpdateButton();
    initTscToggles();
    initSaveIdsButton();
    initCustomPlatformManager();
    initStickerSizeButtons();
    initCleanPage();
  });
});

// ==================== 清潔元素頁面功能 ====================
let cleanRulesList = [];
let isPickerActive = false;

function initCleanPage() {
  loadAllCleanRules();

  const startPickerBtn = document.getElementById('startPickerBtn');
  const exitPickerBtn = document.getElementById('exitPickerBtn');

  if (startPickerBtn) {
    startPickerBtn.addEventListener('click', () => {
      startPickerMode();
    });
  }

  if (exitPickerBtn) {
    exitPickerBtn.addEventListener('click', () => {
      exitPickerMode();
    });
  }

  const addManualBtn = document.getElementById('addManualSelectorBtn');
  const manualInput = document.getElementById('manualSelector');

  if (addManualBtn && manualInput) {
    addManualBtn.addEventListener('click', () => {
      const selector = manualInput.value.trim();
      if (selector) {
        addRuleToSelector(selector);
        manualInput.value = '';
      }
    });

    manualInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addManualBtn.click();
      }
    });
  }

  const clearAllBtn = document.getElementById('clearAllRulesBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (confirm('確定要清空所有隱藏規則嗎？')) {
        clearAllRules();
      }
    });
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'pickerElementSelected') {
      handlePickerSelection(message.rule);
    } else if (message.action === 'pickerExited') {
      exitPickerMode();
    }
  });
}

async function loadAllCleanRules() {
  try {
    const result = await CleanStorage.getAllRulesSummary();
    cleanRulesList = [];

    for (const platform in result) {
      const platformRules = await CleanStorage.getRules(platform);
      platformRules.forEach(rule => {
        rule.platform = platform;
        cleanRulesList.push(rule);
      });
    }

    displayRulesTable();
  } catch (error) {
    console.error('[CleanPopup] 載入規則失敗:', error);
  }
}

// 重構表單渲染：全面改用 DOM API (createElement + textContent) 消滅所有 innerHTML 警告
function displayRulesTable() {
  const tableEl = document.getElementById('cleanRulesTable');
  if (!tableEl) return;

  const t = typeof window.t === 'function' ? window.t : null;

  tableEl.textContent = '';

  if (cleanRulesList.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.style.cssText = 'text-align: center; color: rgba(255,255,255,0.5); padding: 20px;';
    emptyDiv.setAttribute('data-i18n', 'cleanNoRules');
    emptyDiv.textContent = t ? t('cleanNoRules') || '暫無隱藏規則' : '暫無隱藏規則';
    tableEl.appendChild(emptyDiv);
    return;
  }

  const table = document.createElement('table');
  table.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 11px;';

  const thead = document.createElement('thead');
  const headerTr = document.createElement('tr');
  headerTr.style.background = 'rgba(255,255,255,0.1)';

  const headers = [
    { name: t ? t('cleanTablePlatform') || '平台' : '平台', width: '15%', align: 'left' },
    { name: t ? t('cleanTableSelector') || '選擇器' : '選擇器', width: '25%', align: 'left' },
    { name: t ? t('cleanTableElement') || '元素' : '元素', width: '15%', align: 'left' },
    { name: t ? t('cleanTableText') || '文字' : '文字', width: '30%', align: 'left' },
    { name: t ? t('cleanTableAction') || '操作' : '操作', width: '15%', align: 'center' }
  ];

  headers.forEach(h => {
    const th = document.createElement('th');
    th.style.cssText = `padding: 8px; text-align: ${h.align}; color: rgba(255,255,255,0.8); border-bottom: 1px solid rgba(255,255,255,0.1); width: ${h.width};`;
    th.textContent = h.name;
    headerTr.appendChild(th);
  });
  thead.appendChild(headerTr);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  const noTextTranslation = t ? t('cleanNoText') || '(無文字)' : '(無文字)';

  const sortedRules = [...cleanRulesList].sort((a, b) => {
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  sortedRules.forEach((rule) => {
    const tr = document.createElement('tr');
    tr.style.cssText = 'border-bottom: 1px solid rgba(255,255,255,0.05);';

    const shortSelector = rule.selector.length > 40 ? rule.selector.substring(0, 40) + '...' : rule.selector;
    const shortText = rule.text && rule.text.length > 20 ? rule.text.substring(0, 20) + '...' : (rule.text || noTextTranslation);

    const tdPlatform = document.createElement('td');
    tdPlatform.style.cssText = 'padding: 8px; color: rgba(255,255,255,0.7);';
    tdPlatform.textContent = rule.platform;

    const tdSelector = document.createElement('td');
    tdSelector.style.cssText = 'padding: 8px; font-family: Consolas, monospace; color: #4a90e2; word-break: break-all;';
    tdSelector.title = rule.selector;
    tdSelector.textContent = shortSelector;

    const tdTag = document.createElement('td');
    tdTag.style.cssText = 'padding: 8px; color: rgba(255,255,255,0.6);';
    tdTag.textContent = rule.tag || 'element';

    const tdText = document.createElement('td');
    tdText.style.cssText = 'padding: 8px; color: rgba(255,255,255,0.5);';
    tdText.title = rule.text || noTextTranslation;
    tdText.textContent = shortText;

    const tdAction = document.createElement('td');
    tdAction.style.cssText = 'padding: 8px; text-align: center;';

    const btnDelete = document.createElement('button');
    btnDelete.className = 'delete-rule-btn';
    btnDelete.dataset.id = rule.id;
    btnDelete.dataset.platform = rule.platform;
    btnDelete.style.cssText = 'background: rgba(255,255,255,0.1); border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 10px; color: #ff6b6b;';
    btnDelete.textContent = t ? t('cleanTableDelete') || '刪除' : '刪除';

    btnDelete.addEventListener('click', () => {
      deleteRule(rule.id, rule.platform);
    });

    tdAction.appendChild(btnDelete);

    tr.appendChild(tdPlatform);
    tr.appendChild(tdSelector);
    tr.appendChild(tdTag);
    tr.appendChild(tdText);
    tr.appendChild(tdAction);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableEl.appendChild(table);
}

async function addRuleToSelector(selector) {
  try {
    const currentPlatform = await getCurrentPlatformHost();

    const existing = cleanRulesList.find(r => r.selector === selector && r.platform === currentPlatform);
    if (existing) {
      showCleanStatus('選擇器已存在', '#ffc107');
      return;
    }

    const newRule = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      selector: selector,
      tag: 'manual',
      text: '',
      enabled: true,
      createdAt: Date.now(),
      platform: currentPlatform
    };

    const platformRules = await CleanStorage.getRules(currentPlatform);
    platformRules.push(newRule);
    await CleanStorage.saveRules(currentPlatform, platformRules);

    newRule.platform = currentPlatform;
    cleanRulesList.push(newRule);

    displayRulesTable();
    showCleanStatus('規則已添加', '#28a745');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'reloadCleanRules' });
      }
    });
  } catch (error) {
    console.error('[CleanPopup] 添加規則失敗:', error);
    showCleanStatus('添加失敗', '#dc3545');
  }
}

async function deleteRule(ruleId, platform) {
  try {
    const platformRules = await CleanStorage.getRules(platform);
    const filtered = platformRules.filter(r => r.id !== ruleId);
    await CleanStorage.saveRules(platform, filtered);

    cleanRulesList = cleanRulesList.filter(r => r.id !== ruleId);

    displayRulesTable();
    showCleanStatus('規則已刪除', '#28a745');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'reloadCleanRules' });
      }
    });
  } catch (error) {
    console.error('[CleanPopup] 刪除規則失敗:', error);
    showCleanStatus('刪除失敗', '#dc3545');
  }
}

async function clearAllRules() {
  try {
    const platforms = [...new Set(cleanRulesList.map(r => r.platform))];
    for (const platform of platforms) {
      await CleanStorage.clearRules(platform);
    }

    cleanRulesList = [];
    displayRulesTable();
    showCleanStatus('所有規則已清空', '#28a745');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'reloadCleanRules' });
      }
    });
  } catch (error) {
    console.error('[CleanPopup] 清空規則失敗:', error);
    showCleanStatus('清空失敗', '#dc3545');
  }
}

async function startPickerMode() {
  try {
    const tab = await getCurrentTab();
    if (!tab) {
      showCleanStatus('無法獲取當前標籤頁', '#dc3545');
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: 'startPicker' }, (response) => {
      if (chrome.runtime.lastError) {
        showCleanStatus('無法啟動揀選模式', '#dc3545');
      } else if (response && (response.success || response.ok)) {
        isPickerActive = true;
        document.getElementById('startPickerBtn').style.display = 'none';
        document.getElementById('exitPickerBtn').style.display = 'block';
        document.getElementById('pickerStatus').style.display = 'block';
        window.close();
      }
    });
  } catch (error) {
    console.error('[CleanPopup] 啟動揀選模式失敗:', error);
    showCleanStatus('啟動失敗', '#dc3545');
  }
}

function exitPickerMode() {
  isPickerActive = false;
  document.getElementById('startPickerBtn').style.display = 'block';
  document.getElementById('exitPickerBtn').style.display = 'none';
  document.getElementById('pickerStatus').style.display = 'none';

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'exitPicker' });
    }
  });
}

async function handlePickerSelection(rule) {
  try {
    const currentPlatform = await getCurrentPlatformHost();

    const existing = cleanRulesList.find(r => r.selector === rule.selector && r.platform === currentPlatform);
    if (existing) {
      showCleanStatus('選擇器已存在', '#ffc107');
      return;
    }

    rule.platform = currentPlatform;
    const platformRules = await CleanStorage.getRules(currentPlatform);
    platformRules.push(rule);
    await CleanStorage.saveRules(currentPlatform, platformRules);

    cleanRulesList.push(rule);

    displayRulesTable();
    showCleanStatus('已添加隱藏規則', '#28a745');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'reloadCleanRules' });
      }
    });
  } catch (error) {
    console.error('[CleanPopup] 處理揀選失敗:', error);
    showCleanStatus('添加失敗', '#dc3545');
  }
}

async function getCurrentPlatformHost() {
  const tab = await getCurrentTab();
  if (tab && tab.url) {
    try {
      const url = new URL(tab.url);
      return url.hostname;
    } catch {
      return 'unknown';
    }
  }
  return 'unknown';
}

function getCurrentTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0] || null);
    });
  });
}

function showCleanStatus(message, color) {
  const status = document.getElementById('cleanStatus');
  if (status) {
    status.textContent = message;
    status.style.color = color || '#28a745';
    setTimeout(() => {
      status.textContent = '';
    }, 2000);
  }
}

// ==================== Sticker Size Buttons 功能 ====================
function initStickerSizeButtons() {
  const largeBtn = document.getElementById('stickerSizeLargeBtn');
  const mediumBtn = document.getElementById('stickerSizeMediumBtn');
  const smallBtn = document.getElementById('stickerSizeSmallBtn');
  const customBtn = document.getElementById('stickerSizeCustomBtn');

  if (largeBtn && typeof t === 'function') {
    largeBtn.textContent = t('stickerSizeModeLarge') || '大';
  }
  if (mediumBtn && typeof t === 'function') {
    mediumBtn.textContent = t('stickerSizeModeMedium') || '中';
  }
  if (smallBtn && typeof t === 'function') {
    smallBtn.textContent = t('stickerSizeModeSmall') || '小';
  }
  if (customBtn && typeof t === 'function') {
    customBtn.textContent = t('stickerSizeModeCustom') || '自定義';
  }
  
  const percentLabel = document.getElementById('stickerSizePercentLabel');
  if (percentLabel && typeof t === 'function') {
    percentLabel.textContent = t('stickerSizePercentLabel') || '縮放百分比';
  }
}

// ==================== Home Button 功能 ====================
function initHomeButton() {
  const homeBtn = document.getElementById('homeBtn');
  if (!homeBtn) return;

  homeBtn.addEventListener('click', () => {
    const homeUrl = 'https://elfinl.github.io/General-Sticker-System/';
    window.open(homeUrl, '_blank');
  });
}

// ==================== Help Button 功能 ====================
function initHelpPopover() {
  const helpBtn = document.getElementById('helpBtn');
  if (!helpBtn) return;

  helpBtn.addEventListener('click', () => {
    const helpUrl = 'https://elfinl.github.io/General-Sticker-System/help.html';
    window.open(helpUrl, '_blank');
  });
}

// ==================== Update Notification Button 功能 ====================
const CURRENT_VERSION = chrome.runtime.getManifest().version;

function initUpdateButton() {
  const updateBtn = document.getElementById('updateBtn');
  if (!updateBtn) return;

  updateBtn.style.visibility = 'hidden';

  chrome.storage.local.get(['lastSeenVersion'], (result) => {
    const hasSeen = result.lastSeenVersion === CURRENT_VERSION;

    updateBtn.style.visibility = 'visible';

    if (hasSeen) {
      updateBtn.classList.remove('highlighted');
      updateBtn.title = '查看更新日誌';
    } else {
      updateBtn.classList.add('highlighted');
      updateBtn.title = '📢 有新更新！點擊查看';
    }
  });

  updateBtn.addEventListener('click', () => {
    updateBtn.classList.remove('highlighted');
    updateBtn.title = '查看更新日誌';

    chrome.storage.local.set({ lastSeenVersion: CURRENT_VERSION }, () => {});

    const updatelogUrl = 'https://elfinl.github.io/General-Sticker-System/updatelog.html';
    window.open(updatelogUrl, '_blank');
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.lastSeenVersion) {
      const newVersion = changes.lastSeenVersion.newValue;
      if (newVersion === CURRENT_VERSION) {
        updateBtn.classList.remove('highlighted');
        updateBtn.title = '查看更新日誌';
      }
    }
  });
}

// ==================== 通用提示功能 ====================
function showToast(message) {
  const statusEl = document.getElementById('texoStatus') || document.getElementById('settingsStatus');
  if (statusEl) {
    const originalText = statusEl.textContent;
    statusEl.textContent = message;
    statusEl.style.color = message.includes('❌') ? '#ff6b6b' : '#28a745';
    setTimeout(() => {
      statusEl.textContent = originalText;
      statusEl.style.color = '';
    }, 3000);
  }
}

function normalizeHostname(input) {
  return String(input || '')
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .trim();
}

function hostnameToOrigins(hostname) {
  const host = normalizeHostname(hostname);
  if (!host) return [];
  return [
    `https://${host}/*`,
    `https://*.${host}/*`,
    `http://${host}/*`,
    `http://*.${host}/*`
  ];
}

async function requestCustomPlatformPermission(hostname) {
  const origins = hostnameToOrigins(hostname);
  if (!origins.length) return false;
  if (!chrome.permissions?.request) return true;
  return await chrome.permissions.request({ origins });
}

function registerCustomPlatformInBackground(hostname) {
  return chrome.runtime.sendMessage({
    type: 'GSS_REGISTER_CUSTOM_PLATFORM',
    hostname: normalizeHostname(hostname)
  });
}

// ==================== 自定義平台管理邏輯 ====================
let customPlatforms = [];
let editingIndex = -1;

function parseCustomPlatformConfig(text) {
  const lines = (text || '').split(/\r?\n/);
  const config = {
    hostname: '',
    chatContainer: '',
    logic: ''
  };
  
  let currentSection = null;
  const logicLines = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (/^@hostname\s+/i.test(trimmed)) {
      config.hostname = trimmed.replace(/^@hostname\s+/i, '').trim();
      currentSection = 'hostname';
    } else if (/^@chatcontainer\s+/i.test(trimmed)) {
      config.chatContainer = trimmed.replace(/^@chatcontainer\s+/i, '').trim();
      currentSection = 'chatContainer';
    } else if (/^@logic\s*/i.test(trimmed)) {
      const firstLine = line.replace(/^[ \t]*@logic\s*/i, '');
      if (firstLine) {
        logicLines.push(firstLine);
      }
      currentSection = 'logic';
    } else if (currentSection === 'logic') {
      logicLines.push(line);
    } else if (trimmed && !config.hostname) {
      config.hostname = trimmed;
      currentSection = 'hostname';
    } else if (trimmed && !config.chatContainer && config.hostname) {
      config.chatContainer = trimmed;
      currentSection = 'chatContainer';
    } else if (trimmed && config.chatContainer) {
      logicLines.push(line);
      currentSection = 'logic';
    }
  }
  
  config.logic = logicLines.join('\n').trim();
  return config;
}

function formatCustomPlatformConfig(config) {
  return `@hostname ${config.hostname || ''}\n@chatContainer ${config.chatContainer || ''}\n@logic ${config.logic || ''}`;
}

function initCustomPlatformManager() {
  const listEl = document.getElementById('customPlatformsList');
  const addBtn = document.getElementById('btnAddCustomPlatform');
  const editBtn = document.getElementById('btnEditCustomPlatform');
  const dialog = document.getElementById('customPlatformDialog');
  const saveBtn = document.getElementById('btnSaveCustomPlatform');
  const cancelBtn = document.getElementById('btnCancelCustomPlatform');

  if (!listEl || !addBtn || !dialog) return;

  if (dialog.dataset.bound === 'true') return;
  dialog.dataset.bound = 'true';

  chrome.storage.local.get(['customPlatforms'], (r) => {
    customPlatforms = Array.isArray(r.customPlatforms) ? r.customPlatforms : [];
    renderCustomPlatforms();
  });

  function renderCustomPlatforms() {
    listEl.textContent = '';
    
    if (customPlatforms.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.style.cssText = 'text-align:center; color:rgba(255,255,255,0.3); padding:20px; font-size:12px;';
      emptyDiv.textContent = '尚無自定義平台';
      listEl.appendChild(emptyDiv);
      return;
    }
    customPlatforms.forEach((p, i) => {
      const item = document.createElement('div');
      item.className = 'custom-platform-item' + (editingIndex === i ? ' selected' : '');

      const hostDiv = document.createElement('div');
      hostDiv.className = 'hostname';
      hostDiv.textContent = '🌐 ' + (p.hostname || '');

      const actions = document.createElement('div');
      actions.className = 'actions';

      const delBtn = document.createElement('button');
      delBtn.className = 'delete';
      delBtn.title = '刪除';
      delBtn.textContent = '✕';

      actions.appendChild(delBtn);
      item.appendChild(hostDiv);
      item.appendChild(actions);

      item.onclick = () => { editingIndex = i; renderCustomPlatforms(); };
      delBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm('確定要刪除 ' + (p.hostname || '') + ' 嗎？')) {
          const removed = customPlatforms.splice(i, 1)[0];
          editingIndex = -1;
          if (removed?.hostname && typeof chrome.scripting !== 'undefined') {
            chrome.runtime.sendMessage({
              type: 'GSS_UNREGISTER_CUSTOM_PLATFORM',
              hostname: removed.hostname
            });
          }
          saveAndRefresh();
        }
      };
      listEl.appendChild(item);
    });
  }

  function saveAndRefresh() {
    chrome.storage.local.set({ customPlatforms }, () => {
      renderCustomPlatforms();
      showSettingsStatus('自定義平台已儲存', '#28a745');
    });
  }

  addBtn.onclick = () => {
    editingIndex = -1;
    const configTextarea = document.getElementById('customPlatformConfig');
    if (configTextarea) {
      configTextarea.value = '@hostname \n@chatContainer \n@logic ';
      configTextarea.focus();
    }
    dialog.classList.add('show');
  };

  editBtn.onclick = () => {
    if (editingIndex < 0) return showSettingsStatus('請先選擇一個平台', '#dc3545');
    const p = customPlatforms[editingIndex];
    
    const configTextarea = document.getElementById('customPlatformConfig');
    if (configTextarea) {
      configTextarea.value = formatCustomPlatformConfig(p);
      configTextarea.focus();
    }
    dialog.classList.add('show');
  };

  cancelBtn.onclick = () => dialog.classList.remove('show');

  saveBtn.onclick = async () => {
    const configTextarea = document.getElementById('customPlatformConfig');
    let hostname, chatContainer, logic;
    
    if (configTextarea) {
      const parsed = parseCustomPlatformConfig(configTextarea.value);
      hostname = normalizeHostname(parsed.hostname);
      chatContainer = parsed.chatContainer;
      logic = parsed.logic;
    } else {
      hostname = normalizeHostname(
        document.getElementById('customPlatformHostname')?.value
      );
      chatContainer = (document.getElementById('customPlatformChatContainer')?.value || '').trim();
      logic = (document.getElementById('customPlatformLogic')?.value || '').trim();
    }

    if (!hostname || !logic) {
      return showSettingsStatus('請填寫網域與腳本邏輯', '#dc3545');
    }

    const granted = await requestCustomPlatformPermission(hostname);
    if (!granted) {
      return showSettingsStatus('未授予網域權限，無法在此站使用 GSS', '#dc3545');
    }

    const reg = await registerCustomPlatformInBackground(hostname);
    if (!reg?.ok) {
      return showSettingsStatus('註冊失敗：' + (reg?.error || '未知'), '#dc3545');
    }

    const config = { hostname, chatContainer, logic };
    if (editingIndex >= 0) customPlatforms[editingIndex] = config;
    else customPlatforms.push(config);

    dialog.classList.remove('show');
    saveAndRefresh();
    showSettingsStatus('已儲存。請重新整理該平台分頁', '#28a745');
  };
  
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      const configTextarea = document.getElementById('customPlatformConfig');
      const activeElement = document.activeElement;
      
      if (!configTextarea || activeElement !== configTextarea) {
        dialog.classList.remove('show');
      }
    }
  });
}