/* global DLSQ, I18N, SUPPORTED_LANGS, currentLang, t, applyLanguage, initLanguage, setLanguage */
const TAG = typeof DLSQ !== 'undefined' ? DLSQ : null;

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
  // 使用 StickerRegistry 统一获取贴纸信息
  const info = StickerRegistry.getStickerInfo(id);
  if (!info) {
    // 无效 ID 的降级处理
    return {
      name: `ID${index + 1}`,
      rawId: id,
      code: id,
      imageUrl: ''
    };
  }

  // 构建向后兼容的贴纸对象
  // 使用正规化的 ID 作为 code（DL-xxx 格式），而非平台特定格式
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
        // 驗證 IM ID 格式（必須有點號擴展名）
        if (!/^IM-[a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4)$/i.test(id)) continue;
        const tags = parts.slice(1).filter(p => p.startsWith('#')).map(p => p.slice(1));
        rows.push({ id, tags });
        continue;
      }
      // ME 格式：將 -gif, -png, -jpg, -jpeg, -mp4 結尾替換為 . 點格式
      if (rawId.startsWith('ME-')) {
        const id = rawId.replace(/-(gif|png|jpg|jpeg|mp4)$/i, '.$1');
        // 驗證 ME ID 格式（必須有點號擴展名）
        if (!/^ME-[a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4)$/i.test(id)) continue;
        const tags = parts.slice(1).filter(p => p.startsWith('#')).map(p => p.slice(1));
        rows.push({ id, tags });
        continue;
      }
      // 自動轉換舊 ID 格式
      const id = rawId.startsWith('DL-') ? rawId : `DL-${rawId}`;
      // 驗證 ID 格式（支援 DL- 前綴）
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
  // 移除 DLive 格式處理，返回 null
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

  // 使用統一的 storage key
  chrome.storage.local.get(['stickerIdsText', 'stickerTagVocabularyText', 'favoriteStickerIds'], (result) => {
    // 載入詞庫
    if (tagVocabInput) {
      tagVocabInput.value = typeof result.stickerTagVocabularyText === 'string' ? result.stickerTagVocabularyText : '';
    }

    // 載入 ID 清單
    if (typeof result.stickerIdsText === 'string') {
      const { rows } = parseStickerIdsWithTag(result.stickerIdsText);
      const sorted = sortRowsWithFavorites(rows, result.favoriteStickerIds);
      idListInput.value = TAG ? TAG.serializeStickerRows(sorted) : idsToText(sorted.map((r) => r.id));
    } else {
      idListInput.value = '';
    }

    // 更新行號顯示
    updateLineInfo();

    // 重置到開頭（不移除焦點，避免自動選中輸入框）
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

    // 混合 DL 和 IM 的 stickers
    const stickers = rows.map((row, index) => buildStickerFromId(row.id, index));
    displayStickers(stickers, fav, tagMap);
  });
}

function displayStickers(stickers, favoriteIds = [], idToTags = {}) {
  const grid = document.getElementById('stickerGrid');
  grid.innerHTML = '';

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
        // IM 視頻類型
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
        // 圖片類型
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

// 抽出來的常用/刪除函數
function toggleFavorite(id) {
  chrome.storage.local.get(['stickerIdsText', 'favoriteStickerIds', 'stickerTagVocabularyText'], (r) => {
    const current = Array.isArray(r.favoriteStickerIds) ? r.favoriteStickerIds : [];
    const set = new Set(current);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    const next = [...set];

    // 統一處理 DL 和 IM
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
  // 更新標題版本號
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
  } catch (e) {
    // Version load error
  }

  try {
    if (typeof DLSQStickerStore !== 'undefined') {
      await DLSQStickerStore.migrateFromSyncIfNeeded();
    }
  } catch (e) {
    // DLSQ sticker migrate error
  }

  loadSettings();
  initLanguage(() => {
    updateTexoTexts();
  });
  initLineInfo();
  loadStickers();
})();

// ==================== 行號信息显示 ====================
function updateLineInfo() {
  const textarea = document.getElementById('idListInput');
  const lineInfoText = document.getElementById('lineInfoText');
  if (!textarea || !lineInfoText) return;

  // 處理 \r\n 和 \n 兩種換行符格式
  const normalizedValue = textarea.value.replace(/\r\n/g, '\n');
  const lines = normalizedValue.split('\n');
  const totalLines = lines.length;

  // 計算當前光標所在行
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

    // 計算目標行的起始位置
    let targetPos = 0;
    for (let i = 0; i < lineNum - 1; i++) {
      targetPos += lines[i].length + 1; // +1 for \n
    }

    // 設置光標位置並聚焦
    textarea.focus();
    textarea.setSelectionRange(targetPos, targetPos);
    updateLineInfo();

    // 滾動到該行
    const lineHeight = 18; // 近似行高
    textarea.scrollTop = (lineNum - 1) * lineHeight;
  }

  // 監聽光標移動
  textarea.addEventListener('keyup', updateLineInfo);
  textarea.addEventListener('click', updateLineInfo);
  textarea.addEventListener('input', updateLineInfo);
  textarea.addEventListener('scroll', updateLineInfo);

  // 跳轉按鈕
  if (gotoLineBtn) {
    gotoLineBtn.addEventListener('click', gotoLine);
  }
  if (gotoLineInput) {
    gotoLineInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') gotoLine();
    });
  }

  // 初始更新 - 不移除焦點，避免自動選中輸入框
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
let currentPage = 'main'; // 'main', 'texo', 或 'settings'

function initPageToggle() {
  const tabSticker = document.getElementById('tabSticker');
  const tabTexo = document.getElementById('tabTexo');
  const tabSettings = document.getElementById('tabSettings');
  const mainPage = document.getElementById('mainPage');
  const texoPage = document.getElementById('texoPage');
  const settingsPage = document.getElementById('settingsPage');

  if (!tabSticker || !tabSettings || !mainPage || !settingsPage) return;

  // 檢測當前平台並調整 UI
  getCurrentPlatform((platform) => {
    // 更新提醒文字（根據當前語言）
    const reminderText = document.getElementById('reminderText');
    if (reminderText && typeof t === 'function') {
      reminderText.textContent = t('reminder');
    }
  }
  );

  function switchToPage(page) {
    currentPage = page;
    // 重置所有頁面和按鈕狀態
    mainPage.classList.remove('active');
    if (texoPage) texoPage.classList.remove('active');
    settingsPage.classList.remove('active');
    tabSticker.classList.remove('active');
    if (tabTexo) tabTexo.classList.remove('active');
    tabSettings.classList.remove('active');

    // 激活當前頁面
    if (page === 'main') {
      mainPage.classList.add('active');
      tabSticker.classList.add('active');
    } else if (page === 'texo') {
      if (texoPage) texoPage.classList.add('active');
      if (tabTexo) tabTexo.classList.add('active');
      // 初始化 TSC 開關
      initTscToggles();
    } else if (page === 'settings') {
      settingsPage.classList.add('active');
      tabSettings.classList.add('active');
    }
  }

  tabSticker.addEventListener('click', () => switchToPage('main'));
  if (tabTexo) tabTexo.addEventListener('click', () => switchToPage('texo'));
  tabSettings.addEventListener('click', () => switchToPage('settings'));

  // 初始化編織頁面功能
  if (typeof TexoPopup !== 'undefined') {
    TexoPopup.init();
  }

  // 圖庫編輯按鈕 - 在新分頁開啟編輯器
  const openEditorBtn = document.getElementById('openEditorBtn');
  if (openEditorBtn) {
    openEditorBtn.addEventListener('click', () => {
      const editorUrl = chrome.runtime.getURL('editor.html');
      window.open(editorUrl, '_blank');
    });
  }

  // 移除 DLive 設定頁按鈕初始化
}

// 禁用原生右鍵面板按鈕
initDisableNativeContextMenuButton();

// 貼圖大小控制
initStickerSizeControl();

// ==================== 自動關閉 Mature 警告功能 ====================

// 自定義確認對話框
let customDialogCallback = null;

function initCustomDialog() {
  const dialog = document.getElementById('customConfirmDialog');
  const cancelBtn = document.getElementById('customDialogCancel');
  const confirmBtn = document.getElementById('customDialogConfirm');

  if (!dialog || !cancelBtn || !confirmBtn) return;

  cancelBtn.addEventListener('click', () => {
    hideCustomDialog(false);
  });

  confirmBtn.addEventListener('click', () => {
    hideCustomDialog(true);
  });

  // 點擊背景關閉
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      hideCustomDialog(false);
    }
  });
}

function showCustomDialog(title, content, onConfirm) {
  const dialog = document.getElementById('customConfirmDialog');
  const titleEl = document.getElementById('customDialogTitle');
  const contentEl = document.getElementById('customDialogContent');
  const cancelBtn = document.getElementById('customDialogCancel');
  const confirmBtn = document.getElementById('customDialogConfirm');

  if (!dialog || !titleEl || !contentEl) return;

  // 更新文字（支援多語言）
  titleEl.textContent = title || t('autoMatureTitle') || '🔞 自動關閉 Mature 警告';
  contentEl.textContent = content;

  // 按鈕文字
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

  // 初始化自定義對話框
  initCustomDialog();

  // 載入當前設置狀態
  chrome.storage.local.get(['autoCloseMatureWarning'], (result) => {
    const isEnabled = result.autoCloseMatureWarning === true;
    updateAutoMatureButtonState(btn, isEnabled);
  });

  btn.addEventListener('click', () => {
    chrome.storage.local.get(['autoCloseMatureWarning'], (result) => {
      const currentState = result.autoCloseMatureWarning === true;

      if (!currentState) {
        // 要開啟 - 顯示自定義確認對話框
        const confirmMessage = t('autoMatureConfirm');

        showCustomDialog(null, confirmMessage, (confirmed) => {
          if (confirmed) {
            setAutoMatureWarning(true);
            updateAutoMatureButtonState(btn, true);
          }
        });
      } else {
        // 要關閉 - 直接關閉
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
  chrome.storage.local.set({ autoCloseMatureWarning: enabled }, () => {
    // 移除 DLive 相關邏輯，只保存設置
  });
  showSettingsStatus(
    enabled ? t('autoMatureEnabled') : t('autoMatureDisabled'),
    enabled ? '#28a745' : '#dc3545'
  );
}

// ==================== 禁用原生右鍵面板功能 ====================

function initDisableNativeContextMenuButton() {
  const btn = document.getElementById('btnDisableNativeContextMenu');
  if (!btn) return;

  // 載入當前設置狀態
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

        // 通知所有頁面更新設置
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
              type: 'GSS_CONTROL',
              command: newState ? 'disableNativeContextMenu' : 'enableNativeContextMenu'
            }).catch(() => {
              // 忽略無法連接的頁面錯誤
            });
          });
        });
      });
    });
  });
}

function updateDisableNativeContextMenuButtonState(btn, isDisabled) {
  btn.classList.toggle('active', isDisabled);
  const baseText = t('disableNativeContextMenuTitle') || '關閉右鍵面板';
  // 【修改】只更新 .btn-text 元素的內容
  const textEl = btn.querySelector('.btn-text');
  if (textEl) {
    textEl.textContent = isDisabled ? `${baseText} (✓)` : baseText;
  } else {
    // 如果沒有 .btn-text 元素，則更新整個按鈕（向後兼容）
    btn.textContent = isDisabled ? `${baseText} (✓)` : baseText;
  }
}

// ==================== 貼圖大小設定功能 ====================

function initStickerSizeControl() {
  const buttons = document.querySelectorAll('.sticker-size-btn');
  
  if (buttons.length === 0) return;
  
  // 載入當前設定（預設為大圖模式）
  chrome.storage.local.get(['stickerSizeMode'], (result) => {
    // 如果 stickerSizeMode 不存在或為舊的 boolean 值，轉換為新的 string 值
    let currentMode = result.stickerSizeMode;
    if (currentMode === undefined || currentMode === false) {
      currentMode = 'large'; // 預設大圖模式
    } else if (currentMode === true) {
      currentMode = 'small'; // 舊的 true 轉為小圖模式
    }
    
    updateStickerSizeButtons(currentMode);
    
    // 如果 stickerSizeMode 不存在，設置默認值
    if (result.stickerSizeMode === undefined) {
      chrome.storage.local.set({ stickerSizeMode: 'large' });
    }
    
    // 初始化時立即應用設定到所有頁面
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'GSS_CONTROL',
          command: 'updateStickerSizeMode',
          data: { mode: currentMode }
        }).catch(() => {
          // 忽略無法連接的頁面錯誤
        });
      });
    });
  });
  
  // 按鈕點擊事件
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const mode = button.getAttribute('data-size');
      saveStickerSizeMode(mode);
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
      'small': t('stickerSizeModeSmall') || '小'
    };
    const message = `已切換為${modeNames[mode]}`;
    showSettingsStatus(message, '#4CAF50');
    
    // 通知所有頁面更新設定
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'GSS_CONTROL',
          command: 'updateStickerSizeMode',
          data: { mode: mode }
        }).catch(() => {
          // 忽略無法連接的頁面錯誤
        });
      });
    });
  });
}

// ==================== TSC 開關功能 ====================

function initTscToggles() {
  const tscEnabled = document.getElementById('tscEnabled');
  const tscAutoCollect = document.getElementById('tscAutoCollect');
  const tscEnabledLabel = document.getElementById('tscEnabledLabel');
  const tscAutoCollectLabel = document.getElementById('tscAutoCollectLabel');

  if (!tscEnabled || !tscAutoCollect) return;

  // 設置 i18n 文字（使用項目的 t() 函數）
  if (tscEnabledLabel && typeof t === 'function') {
    const text = t('tscEnabledLabel');
    if (text) tscEnabledLabel.textContent = text;
  }
  if (tscAutoCollectLabel && typeof t === 'function') {
    const text = t('tscAutoCollectLabel');
    if (text) tscAutoCollectLabel.textContent = text;
  }

  // 防止重複初始化
  if (tscEnabled.dataset.initialized === 'true') return;
  tscEnabled.dataset.initialized = 'true';

  // 載入儲存的設定（預設開啟）
  chrome.storage.local.get(['tscEnabled', 'tscAutoCollect'], (result) => {
    const isEnabled = result.tscEnabled !== false; // 預設 true
    const isAutoCollect = result.tscAutoCollect !== false; // 預設 true

    tscEnabled.checked = isEnabled;
    tscAutoCollect.checked = isAutoCollect;
    tscAutoCollect.disabled = !isEnabled; // 如果主開關關閉，自動抓取也禁用
  });

  // 主開關變更事件
  tscEnabled.addEventListener('change', () => {
    const isEnabled = tscEnabled.checked;

    // 立即更新 UI（不等待 storage）
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
      // 通知所有頁面更新設置
      notifyAllTabs({ type: 'GSS_CONTROL', command: isEnabled ? 'enableTsc' : 'disableTsc' });
    });
  });

  // 自動抓取開關變更事件
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

// 通知所有頁面的輔助函數
function notifyAllTabs(message) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, message).catch(() => {
        // 忽略無法連接的頁面錯誤
      });
    });
  });
}

// 當語言切換時更新所有設定按鈕文字
function updateSettingsButtonTexts() {
  // 通用設定標題
  const generalSettingsText = document.getElementById('generalSettingsText');
  if (generalSettingsText) generalSettingsText.textContent = t('generalSettings') || '通用設定';

  // 更新右鍵面板按鈕
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

  // 貼圖大小設定翻譯
  const stickerSizeTitle = document.getElementById('stickerSizeTitle');
  if (stickerSizeTitle) stickerSizeTitle.textContent = t('stickerSizeTitle') || '📏 貼圖大小設定';

  // 更新貼圖大小模式標籤
  const stickerSizeToggle = document.getElementById('stickerSizeToggle');
  if (stickerSizeToggle) {
    const isSmallMode = stickerSizeToggle.checked;
    updateStickerSizeLabel(isSmallMode);
  }

  // 自定義平台翻譯
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

  // 對話框翻譯
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

  // 重新渲染列表以更新「無數據」文字
  if (typeof renderCustomPlatforms === 'function') {
    renderCustomPlatforms();
  }
}

// 當語言切換時更新 TexoStreamCore 頁面文字
function updateTexoTexts() {
  // 標題
  const texoTitle = document.getElementById('texoTitle');
  if (texoTitle) texoTitle.textContent = t('texoTitle') || '🧶 實況編織核心';

  // 副標題
  const texoSubtitle = document.getElementById('texoSubtitle');
  if (texoSubtitle) texoSubtitle.textContent = t('texoSubtitle') || 'Texo Stream Core - 管理多平台實況資訊';

  // 輸入框標籤
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

  // placeholder
  const texoInput = document.getElementById('texoInput');
  if (texoInput) texoInput.placeholder = t('texoPlaceholder') || '>主播名稱 #https://www.twitch.tv/xxx\n#https://www.youtube.com/...\n#https://www.kick.com/...';

  // 格式說明
  const texoFormatTitle = document.getElementById('texoFormatTitle');
  if (texoFormatTitle) texoFormatTitle.textContent = t('texoFormatTitle') || '格式規則：';

  const texoFormatDisplayName = document.getElementById('texoFormatDisplayName');
  if (texoFormatDisplayName) texoFormatDisplayName.textContent = t('texoFormatDisplayName') || '顯示名稱';

  const texoFormatPlatform = document.getElementById('texoFormatPlatform');
  if (texoFormatPlatform) texoFormatPlatform.textContent = t('texoFormatPlatform') || '直播平台';

  // TSC 標籤
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

  // 儲存按鈕
  const texoSaveText = document.getElementById('texoSaveText');
  if (texoSaveText) texoSaveText.textContent = t('texoSave') || '💾 儲存';

  // 狀態（如果不是顯示已儲存狀態）
  const texoStatus = document.getElementById('texoStatus');
  if (texoStatus && !texoStatus.textContent.includes('✅')) {
    texoStatus.textContent = t('texoStatus') || '自動載入上次儲存的內容';
  }

  // Tab 按鈕（只更新文字部分，保留 emoji）
  const tabTexoSpan = document.querySelector('#tabTexo [data-i18n="tabTexo"]');
  if (tabTexoSpan) tabTexoSpan.textContent = t('tabTexo') || '編織';
  
  const tabSettingsText = document.getElementById('tabSettingsText');
  if (tabSettingsText) tabSettingsText.textContent = t('tabSettings') || '設定';
  
  // 【新增】貼圖大小調整翻譯
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
  });
});

// ==================== Sticker Size Buttons 功能 ====================
function initStickerSizeButtons() {
  const largeBtn = document.getElementById('stickerSizeLargeBtn');
  const mediumBtn = document.getElementById('stickerSizeMediumBtn');
  const smallBtn = document.getElementById('stickerSizeSmallBtn');

  if (largeBtn && typeof t === 'function') {
    largeBtn.textContent = t('stickerSizeModeLarge') || '大';
  }
  if (mediumBtn && typeof t === 'function') {
    mediumBtn.textContent = t('stickerSizeModeMedium') || '中';
  }
  if (smallBtn && typeof t === 'function') {
    smallBtn.textContent = t('stickerSizeModeSmall') || '小';
  }
}

// ==================== Home Button 功能 ====================
function initHomeButton() {
  const homeBtn = document.getElementById('homeBtn');
  if (!homeBtn) return;

  // 主頁按鈕點擊 - 在新分頁打開主頁
  homeBtn.addEventListener('click', () => {
    const homeUrl = 'https://elfinl.github.io/General-Sticker-System/';
    window.open(homeUrl, '_blank');
  });
}

// ==================== Help Button 功能 ====================
function initHelpPopover() {
  const helpBtn = document.getElementById('helpBtn');
  if (!helpBtn) return;

  // 問號按鈕點擊 - 在新分頁打開說明頁面
  helpBtn.addEventListener('click', () => {
    const helpUrl = 'https://elfinl.github.io/General-Sticker-System/help.html';
    window.open(helpUrl, '_blank');
  });
}

// ==================== Update Notification Button 功能 ====================
// 直接讀取 manifest.json 的版本號（只需改 manifest.json 即可）
const CURRENT_VERSION = chrome.runtime.getManifest().version;

function initUpdateButton() {
  const updateBtn = document.getElementById('updateBtn');
  if (!updateBtn) return;

  // 先隱藏按鈕，等待檢查存儲狀態後再顯示，避免閃爍
  updateBtn.style.visibility = 'hidden';

  // 檢查是否已看過當前版本
  chrome.storage.local.get(['lastSeenVersion'], (result) => {
    const hasSeen = result.lastSeenVersion === CURRENT_VERSION;

    // 顯示按鈕
    updateBtn.style.visibility = 'visible';

    // 如果已看過，移除高亮狀態；否則添加高亮
    if (hasSeen) {
      updateBtn.classList.remove('highlighted');
      updateBtn.title = '查看更新日誌';
    } else {
      updateBtn.classList.add('highlighted');
      updateBtn.title = '📢 有新更新！點擊查看';
    }
  });

  // 點擊事件 - 打開更新日誌
  updateBtn.addEventListener('click', () => {
    // 移除高亮狀態
    updateBtn.classList.remove('highlighted');
    updateBtn.title = '查看更新日誌';

    // 標記為已讀（立即保存）
    chrome.storage.local.set({ lastSeenVersion: CURRENT_VERSION }, () => {
      console.log('[GSS] Update button clicked, marked as seen for version', CURRENT_VERSION);
    });

    // 打開更新日誌頁面
    const updatelogUrl = 'https://elfinl.github.io/General-Sticker-System/updatelog.html';
    window.open(updatelogUrl, '_blank');
  });

  // 監聽 storage 變化 - 當其他頁面（如聊天面板）標記為已讀時，同步移除高亮
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
  // 使用現有的狀態顯示機制或創建一個簡單的 toast
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

// ==================== 自定義平台管理邏輯 (簡化版) ====================
let customPlatforms = [];
let editingIndex = -1;

// 解析新版配置格式（支持 @hostname/@chatContainer/@logic 指令）
function parseCustomPlatformConfig(text) {
  const lines = text.split('\n');
  const config = {
    hostname: '',
    chatContainer: '',
    logic: ''
  };
  
  let currentSection = null;
  let logicLines = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // 检测新的 @ 指令
    if (/^@hostname\s+/i.test(trimmed)) {
      config.hostname = trimmed.replace(/^@hostname\s+/i, '').trim();
      currentSection = 'hostname';
    } else if (/^@chatcontainer\s+/i.test(trimmed)) {
      config.chatContainer = trimmed.replace(/^@chatcontainer\s+/i, '').trim();
      currentSection = 'chatContainer';
    } else if (/^@logic\s*/i.test(trimmed)) {
      // 提取 @logic 后的第一行内容
      const firstLine = trimmed.replace(/^@logic\s*/i, '').trim();
      if (firstLine) {
        logicLines.push(firstLine);
      }
      currentSection = 'logic';
    } else if (currentSection === 'logic' && trimmed) {
      // 继续收集 logic 的多行内容
      logicLines.push(line); // 保留原始缩进
    } else if (trimmed && !config.hostname) {
      // 兼容旧格式：第一行非空且没有 @ 指令，视为 hostname
      config.hostname = trimmed;
    } else if (trimmed && !config.chatContainer && config.hostname) {
      // 兼容旧格式：第二行视为 chatContainer
      config.chatContainer = trimmed;
    } else if (trimmed && config.chatContainer) {
      // 兼容旧格式：后续行视为 logic
      logicLines.push(line);
    }
  }
  
  config.logic = logicLines.join('\n').trim();
  return config;
}

// 将配置转换为可编辑的文本格式
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

  chrome.storage.local.get(['customPlatforms'], (r) => {
    customPlatforms = Array.isArray(r.customPlatforms) ? r.customPlatforms : [];
    renderCustomPlatforms();
  });

  function renderCustomPlatforms() {
    listEl.textContent = '';
    
    if (customPlatforms.length === 0) {
      listEl.innerHTML = '<div style="text-align:center; color:rgba(255,255,255,0.3); padding:20px; font-size:12px;">尚無自定義平台</div>';
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
    // 使用新的大文本框
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
    
    // 使用新的大文本框，格式化显示
    const configTextarea = document.getElementById('customPlatformConfig');
    if (configTextarea) {
      configTextarea.value = formatCustomPlatformConfig(p);
      configTextarea.focus();
    }
    dialog.classList.add('show');
  };

  cancelBtn.onclick = () => dialog.classList.remove('show');

  saveBtn.onclick = async () => {
    // 优先使用新的大文本框
    const configTextarea = document.getElementById('customPlatformConfig');
    let hostname, chatContainer, logic;
    
    if (configTextarea) {
      // 解析新格式
      const parsed = parseCustomPlatformConfig(configTextarea.value);
      hostname = normalizeHostname(parsed.hostname);
      chatContainer = parsed.chatContainer;
      logic = parsed.logic;
    } else {
      // 兼容旧格式（如果 HTML 还没更新）
      hostname = normalizeHostname(
        document.getElementById('customPlatformHostname').value
      );
      chatContainer = document.getElementById('customPlatformChatContainer').value.trim();
      logic = document.getElementById('customPlatformLogic').value.trim();
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
  
  // 【新增】点击 overlay 背景关闭对话框（但在 textarea 内点击不关闭）
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      // 检查当前焦点是否在配置文本框内
      const configTextarea = document.getElementById('customPlatformConfig');
      const activeElement = document.activeElement;
      
      // 如果焦点不在 textarea 内，才关闭对话框
      if (!configTextarea || activeElement !== configTextarea) {
        dialog.classList.remove('show');
      }
    }
  });
}
document.addEventListener('DOMContentLoaded', initCustomPlatformManager);