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
  // IM 類型
  if (id.startsWith('IM-')) {
    const idWithExt = id.slice(3);
    const isVideo = /\.mp4$/i.test(idWithExt);
    return {
      name: `圖片 ${index + 1}`,
      rawId: id,
      code: id,
      imageUrl: `https://i.imgur.com/${idWithExt}`,
      isVideo: isVideo,
      isIM: true
    };
  }
  // ME 類型
  if (id.startsWith('ME-')) {
    const idWithExt = id.slice(3);
    const isVideo = /\.mp4$/i.test(idWithExt);
    return {
      name: `圖片 ${index + 1}`,
      rawId: id,
      code: id,
      imageUrl: `https://meee.com.tw/${idWithExt}`,
      isVideo: isVideo,
      isME: true
    };
  }
  // DL 類型：移除 DL- 前綴
  const cleanId = id.startsWith('DL-') ? id.slice(3) : id;
  return {
    name: `ID${index + 1}`,
    rawId: id,
    code: `:emote/mine/dlive/${cleanId}:`,
    imageUrl: `https://images.prd.dlivecdn.com/emote/${cleanId}`
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
}

function deleteSticker(id) {
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
  // 驗證 ID 格式（支援 DL-、IM- 和 ME- 前綴）
  const invalidId = ids.find((id) => {
    if (TAG) {
      return !TAG.isValidDLId(id) && !TAG.isValidIMId(id) && !TAG.isValidMEId(id);
    }
    // 後備驗證
    const isDL = /^(?:DL-)?[A-Za-z0-9_]+$/.test(id);
    const isIM = /^IM-[a-zA-Z0-9]+(?:\.(?:gif|png|jpg|jpeg|mp4))?$/i.test(id);
    const isME = /^ME-[a-zA-Z0-9]+(?:\.(?:gif|png|jpg|jpeg|mp4))?$/i.test(id);
    return !isDL && !isIM && !isME;
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
  // 更新標題版本號
  try {
    const manifest = chrome.runtime.getManifest();
    const version = manifest?.version || '3.0';
    const titleEl = document.getElementById('titleText');
    if (titleEl) {
      titleEl.innerHTML = '<img src="icons/icon16.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"> General Sticker System (GSS) V' + version;
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
  initLanguage();
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
    } else if (url.includes('dlive.tv')) {
      callback('dlive');
    } else {
      callback('unknown');
    }
  });
}

// ==================== 頁面切換功能 ====================
let currentPage = 'main'; // 'main' 或 'dlive'

function initPageToggle() {
  const tabSticker = document.getElementById('tabSticker');
  const tabDlive = document.getElementById('tabDlive');
  const mainPage = document.getElementById('mainPage');
  const dlivePage = document.getElementById('dlivePage');

  if (!tabSticker || !tabDlive || !mainPage || !dlivePage) return;

  // 檢測當前平台並調整 UI
  getCurrentPlatform((platform) => {
    if (platform === 'twitch') {
      // Twitch 平台：隱藏 DLive 設定頁，因為 Twitch 劇院模式已經做得很好
      tabDlive.style.display = 'none';
      // 更新提醒文字（根據當前語言）
      const reminderText = document.getElementById('reminderText');
      if (reminderText && typeof t === 'function') {
        reminderText.textContent = t('reminder');
      }
    }
  });

  function switchToPage(page) {
    currentPage = page;
    if (page === 'main') {
      mainPage.classList.add('active');
      dlivePage.classList.remove('active');
      tabSticker.classList.add('active');
      tabDlive.classList.remove('active');
    } else {
      mainPage.classList.remove('active');
      dlivePage.classList.add('active');
      tabSticker.classList.remove('active');
      tabDlive.classList.add('active');
    }
  }

  tabSticker.addEventListener('click', () => switchToPage('main'));
  tabDlive.addEventListener('click', () => switchToPage('dlive'));

  // 圖庫編輯按鈕 - 在新分頁開啟編輯器
  const openEditorBtn = document.getElementById('openEditorBtn');
  if (openEditorBtn) {
    openEditorBtn.addEventListener('click', () => {
      const editorUrl = chrome.runtime.getURL('editor.html');
      chrome.tabs.create({ url: editorUrl });
    });
  }

  // 初始化 DLive 設定頁按鈕
  initDliveButtons();
}

// ==================== DLive 設定頁按鈕 ====================
function initDliveButtons() {
  // 元素控制
  bindDliveButton('btnDonation', 'toggleDonation');
  bindDliveButton('btnTitleFix1', 'toggleTitleFix1');
  bindDliveButton('btnAboutFix1', 'toggleAboutFix1');
  bindDliveButton('btnSidebar', 'toggleSidebar');
  bindDliveButton('btnNavbar', 'toggleNavbar');

  // 聊天室控制
  bindDliveButton('btnChatNarrow', 'toggleChatNarrow');
  bindDliveButton('btnChatHidden', 'toggleChatHidden');
  bindDliveButton('btnChatOverlayFix1', 'toggleChatOverlayFix1');

  // 劇院模式
  bindDliveButton('btnTheater13', 'toggleTheaterComboFix');

  // 測試按鈕
  bindDliveButton('btnTestZoomIn', 'testZoomIn');
  bindDliveButton('btnTestZoomOut', 'testZoomOut');
  bindDliveButton('btnTestZoomReset', 'testZoomReset');
  bindDliveButton('btnTestBlackFix1', 'toggleBlackBackgroundFix1');

  // 隱藏頂部欄分解測試按鈕
  bindDliveButton('btnNavbarTest1', 'toggleNavbarTest1');
  bindDliveButton('btnNavbarTest2', 'toggleNavbarTest2');
  bindDliveButton('btnNavbarTest3', 'toggleNavbarTest3');
  bindDliveButton('btnNavbarTest4', 'toggleNavbarTest4');
  bindDliveButton('btnNavbarTest5', 'toggleNavbarTest5');
  bindDliveButton('btnNavbarTest6', 'toggleNavbarTest6');
  bindDliveButton('btnNavbarTest7', 'toggleNavbarTest7');
  bindDliveButton('btnNavbarTest8', 'toggleNavbarTest8');
  bindDliveButton('btnNavbarTest9', 'toggleNavbarTest9');
  bindDliveButton('btnNavbarTest10', 'toggleNavbarTest10');
  bindDliveButton('btnNavbarTest2Fix', 'toggleNavbarTest2Fix');
  bindDliveButton('btnNavbarTestCombo', 'toggleNavbarTestCombo');
  bindDliveButton('btnTheaterCombo', 'toggleTheaterComboFix');
  bindDliveButton('btnTheaterComboFix', 'toggleTheaterComboFix');
}

function bindDliveButton(btnId, command) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  btn.addEventListener('click', () => {
    sendDliveCommand(command);
  });
}

function sendDliveCommand(command) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) {
      showDliveStatus('❌ 找不到當前頁面', '#dc3545');
      return;
    }

    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'DLIVE_CONTROL',
      command: command
    }, (response) => {
      if (chrome.runtime.lastError) {
        showDliveStatus('❌ 無法連接到頁面，請確保在 DLive 頻道頁', '#dc3545');
      } else if (response) {
        showDliveStatus(response.message || '✅ 已執行', response.success ? '#28a745' : '#dc3545');
        // 更新按鈕狀態（如果有回傳）
        if (response.active !== undefined && response.buttonId) {
          const btn = document.getElementById(response.buttonId);
          if (btn) {
            btn.classList.toggle('active', response.active);
          }
        }
      }
    });
  });
}

function showDliveStatus(message, color) {
  const status = document.getElementById('dliveStatus');
  if (status) {
    status.textContent = message;
    status.style.color = color || 'rgba(255, 255, 255, 0.7)';
  }
}

// DOM 載入後初始化頁面切換
document.addEventListener('DOMContentLoaded', () => {
  initPageToggle();
  initHelpPopover();
});

// ==================== Help Button 功能 ====================
function initHelpPopover() {
  const helpBtn = document.getElementById('helpBtn');
  if (!helpBtn) return;

  // 問號按鈕點擊 - 在新分頁打開說明頁面
  helpBtn.addEventListener('click', () => {
    const helpUrl = chrome.runtime.getURL('help.html');
    chrome.tabs.create({ url: helpUrl });
  });
}
