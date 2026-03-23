console.log('✅ content.js 已載入！（GraphQL 直接送出模式）');

/* global DLSQ */
const TAG = typeof DLSQ !== 'undefined' ? DLSQ : null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ========= 語言設定 =========
let currentLang = 'zh';

const UI_I18N = {
  zh: {
    addToQuick: '新增到 Sticker Quick',
    fav: '標記常用（★）',
    unfav: '取消常用（★）',
    hide: '隱藏',
    unhide: '取消隱藏',
    tags: '標籤',
    added: (n) => `✅ 已新增（共 ${n} 個）`,
    exists: (n) => `ℹ️ 已存在（共 ${n} 個）`,
    favMarked: '✅ 已標記常用（★）',
    favUnmarked: '✅ 已取消常用',
    hidden: `✅ 已隱藏（到「隱藏」分頁可永久刪除）`,
    unhidden: '✅ 已取消隱藏',
    removeTag: (tag) => `✅ 已移除 #${tag}`,
    addTag: (tag) => `✅ 已加上 #${tag}`,
    deleted: (n) => `✅ 已從清單刪除（剩 ${n} 個）`,
    notInList: 'ℹ️ 清單內沒有此 ID',
    loading: '載入中…',
    all: '全部 / ALL',
    hiddenTab: (n) => `隱藏 (${n})`,
    notInListMsg: '不在清單內',
    emptyVocabMsg: '詞庫為空時仍可用上方「常用／隱藏」；要套用其他 #標籤請到 popup 建立詞庫',
    permDelete: '從清單永久刪除…',
    uncategorizedTab: (n) => `未分類 (${n})`
  },
  en: {
    addToQuick: 'Add to Sticker Quick',
    fav: 'Mark as Favorite (★)',
    unfav: 'Unmark Favorite (★)',
    hide: 'Hide',
    unhide: 'Unhide',
    tags: 'Tags',
    added: (n) => `✅ Added (${n} total)`,
    exists: (n) => `ℹ️ Already exists (${n} total)`,
    favMarked: '✅ Marked as favorite (★)',
    favUnmarked: '✅ Unmarked as favorite',
    hidden: `✅ Hidden (find in "Hidden" tab to permanently delete)`,
    unhidden: '✅ Unhidden',
    removeTag: (tag) => `✅ Removed #${tag}`,
    addTag: (tag) => `✅ Added #${tag}`,
    deleted: (n) => `✅ Deleted from list (${n} remaining)`,
    notInList: 'ℹ️ ID not in list',
    loading: 'Loading…',
    all: 'All',
    hiddenTab: (n) => `Hidden (${n})`,
    notInListMsg: 'Not in list',
    emptyVocabMsg: 'When vocabulary is empty, you can still use "Favorite/Hide" above; to apply other #tags, add them in popup',
    permDelete: 'Permanently delete from list…',
    uncategorizedTab: (n) => `Uncategorized (${n})`
  }
};

function t(key, ...args) {
  const dict = UI_I18N[currentLang] || UI_I18N.zh;
  const val = dict[key];
  if (typeof val === 'function') return val(...args);
  return val || key;
}

function initLanguage() {
  chrome.storage.sync.get(['uiLang'], (result) => {
    currentLang = result.uiLang === 'en' ? 'en' : 'zh';
  });
}

// 監聽語言變化
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.uiLang) {
    currentLang = changes.uiLang.newValue === 'en' ? 'en' : 'zh';
    // 刷新面板以更新語言
    const panel = document.getElementById(UI.panelId);
    if (panel?.classList.contains('open')) refreshPanelStickers();
    // 更新選單文字
    updateContextMenuTexts();
  }
});

// ========= UI: Chat-side button + floating panel =========
const UI = {
  rootId: 'dlsq_root',
  btnId: 'dlsq_btn',
  panelId: 'dlsq_panel',
  styleId: 'dlsq_style_v2',
  ctxMenuId: 'dlsq_ctx_menu',
  panelTagMenuId: 'dlsq_panel_tag_menu',
  failToastId: 'dlsq_fail_overlay'
};

let panelFilterTag = '__all__';
/** 保留標籤：帶此標籤的貼圖只在「隱藏」分頁顯示；一般分頁的「刪除」改為加此標籤 */
const PANEL_HIDDEN_TAG = '隱藏';
const PANEL_FILTER_HIDDEN = '__hidden__';
const PANEL_FILTER_UNCATEGORIZED = '__uncategorized__';
let suppressTileClickUntil = 0;
let suppressPanelAutoCloseUntil = 0;
let panelRefreshSeq = 0;
const PANEL_GRID_COLS = 4;
const PANEL_GRID_ROW_HEIGHT = 72;
const PANEL_GRID_MIN_HEIGHT = 72;
const PANEL_GRID_MAX_HEIGHT = 220;

let failToastHideTimer = null;

function suppressTileClickFor(ms = 450) {
  suppressTileClickUntil = Date.now() + Math.max(0, Number(ms) || 0);
}

function isTileClickSuppressed() {
  return Date.now() < suppressTileClickUntil;
}

function suppressPanelAutoCloseFor(ms = 700) {
  suppressPanelAutoCloseUntil = Date.now() + Math.max(0, Number(ms) || 0);
}

function isPanelAutoCloseSuppressed() {
  return Date.now() < suppressPanelAutoCloseUntil;
}

function ensureStyles() {
  let style = document.getElementById(UI.styleId);
  if (!style) {
    style = document.createElement('style');
    style.id = UI.styleId;
    document.documentElement.appendChild(style);
  }
  style.textContent = `
    #${UI.rootId} { position: relative; z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #${UI.btnId} {
      width: 26px; height: 26px; border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(20,22,26,0.92);
      color: rgba(255,255,255,0.92);
      cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      margin-left: 6px;
      user-select: none;
    }
    #${UI.btnId}:hover { background: rgba(28,30,36,0.96); border-color: rgba(120,190,255,0.45); }

    #${UI.panelId} {
      position: fixed;
      right: 16px;
      bottom: 80px;
      width: 384px;
      max-height: 480px;
      overflow: hidden;
      display: none;
      background: rgba(16,18,22,0.98);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      box-shadow: 0 16px 44px rgba(0,0,0,0.55);
    }
    #${UI.panelId}.open { display: block; }
    #${UI.panelId} .hdr {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 10px;
      background: linear-gradient(180deg, rgba(28,30,36,0.98), rgba(18,20,24,0.98));
      color: rgba(255,255,255,0.92);
      font-size: 12px;
      font-weight: 600;
      border-bottom: 1px solid rgba(255,255,255,0.10);
    }
    #${UI.panelId} .hdr .close {
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 6px;
      background: rgba(255,255,255,0.10);
    }
    #${UI.panelId} .hdr .close:hover { background: rgba(255,255,255,0.18); }
    #${UI.panelId} .body { padding: 10px; overflow: auto; max-height: 420px; }
    #${UI.panelId} .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 10px;
      max-height: 72px;
      overflow-y: auto;
      padding-right: 2px;
    }
    #${UI.panelId} .tabs .tab {
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(10,12,16,0.88);
      color: rgba(255,255,255,0.88);
      font-size: 11px;
      padding: 5px 8px;
      border-radius: 999px;
      cursor: pointer;
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #${UI.panelId} .tabs .tab:hover { background: rgba(120,190,255,0.14); border-color: rgba(120,190,255,0.45); }
    #${UI.panelId} .tabs .tab.on {
      background: rgba(120,190,255,0.22);
      border-color: rgba(120,190,255,0.55);
      color: rgba(255,255,255,0.96);
    }
    #${UI.panelId} .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      max-height: 220px;
      overflow-y: auto;
      padding-right: 2px;
    }
    #${UI.panelId} .tile {
      border: 0 !important;
      outline: none !important;
      box-shadow: none !important;
      border-radius: 10px;
      background: transparent !important;
      padding: 0 !important;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 64px;
      position: relative;
    }
    #${UI.panelId} .tile:hover { background: rgba(120,190,255,0.10); }
    #${UI.panelId} .tile:active { background: rgba(120,190,255,0.16); }
    #${UI.panelId} .tile img { max-width: 48px; max-height: 48px; }
    #${UI.panelId} .tile .fallback {
      font-size: 10px;
      color: rgba(255,255,255,0.82);
      text-align: center;
      line-height: 1.2;
      padding: 0 2px;
      word-break: break-word;
    }
    #${UI.panelId} .tile .fav {
      position: absolute;
      top: 4px;
      left: 6px;
      font-size: 12px;
      color: #ffd43b;
      text-shadow: 0 2px 10px rgba(0,0,0,0.65);
      display: none;
      pointer-events: none;
    }
    #${UI.panelId} .tile.favored .fav { display: block; }
    #${UI.panelId} .status {
      margin-top: 8px;
      font-size: 11px;
      color: rgba(255,255,255,0.72);
      min-height: 14px;
    }

    /* ===== Right-click context menu (add sticker ID) ===== */
    #${UI.ctxMenuId} {
      position: fixed;
      z-index: 1000000;
      min-width: 180px;
      display: none;
      background: rgba(16,18,22,0.98);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      box-shadow: 0 16px 44px rgba(0,0,0,0.55);
      padding: 6px;
      color: rgba(255,255,255,0.92);
      font-size: 12px;
    }
    #${UI.ctxMenuId}.open { display: block; }
    #${UI.ctxMenuId} .item {
      padding: 8px 10px;
      border-radius: 8px;
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    #${UI.ctxMenuId} .item:hover { background: rgba(120,190,255,0.14); }
    #${UI.ctxMenuId} .sub {
      margin-top: 4px;
      padding: 0 10px 6px;
      color: rgba(255,255,255,0.55);
      font-size: 11px;
      word-break: break-all;
    }
    #${UI.panelTagMenuId} {
      position: fixed;
      z-index: 1000000;
      min-width: 180px;
      max-width: 280px;
      display: none;
      background: rgba(16,18,22,0.98);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      box-shadow: 0 16px 44px rgba(0,0,0,0.55);
      padding: 6px;
      color: rgba(255,255,255,0.92);
      font-size: 12px;
    }
    #${UI.panelTagMenuId}.open { display: block; }
    #${UI.panelTagMenuId} .item {
      padding: 8px 10px;
      border-radius: 8px;
      cursor: pointer;
      user-select: none;
    }
    #${UI.panelTagMenuId} .item:hover { background: rgba(120,190,255,0.14); }
    #${UI.panelTagMenuId} .sub {
      padding: 4px 10px 6px;
      color: rgba(255,255,255,0.55);
      font-size: 11px;
      word-break: break-all;
    }
    #${UI.panelTagMenuId} .item.on::after {
      content: "✓";
      float: right;
      opacity: 0.8;
    }

    /* ===== Send failure toast（與貼圖面板同角落，不遮全畫面）===== */
    #${UI.failToastId} {
      position: fixed;
      right: 16px;
      bottom: 80px;
      width: 384px;
      z-index: 1000001;
      display: none;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #${UI.failToastId}.open { display: block; }
    #${UI.failToastId} .dlsq-fail-card {
      width: 100%;
      pointer-events: auto;
      background: rgba(22,24,30,0.98);
      border: 1px solid rgba(255,80,80,0.35);
      border-radius: 10px;
      box-shadow: 0 16px 44px rgba(0,0,0,0.55);
      overflow: hidden;
    }
    #${UI.failToastId} .dlsq-fail-hdr {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 12px 14px;
      background: rgba(40,20,22,0.95);
      border-bottom: 1px solid rgba(255,80,80,0.2);
    }
    #${UI.failToastId} .dlsq-fail-title {
      font-size: 13px;
      font-weight: 600;
      color: #ff6b6b;
    }
    #${UI.failToastId} .dlsq-fail-x {
      border: 0;
      background: rgba(255,255,255,0.10);
      color: rgba(255,255,255,0.85);
      width: 28px;
      height: 28px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
    }
    #${UI.failToastId} .dlsq-fail-x:hover { background: rgba(255,255,255,0.18); }
    #${UI.failToastId} .dlsq-fail-msg {
      padding: 14px;
      font-size: 12px;
      line-height: 1.45;
      color: rgba(255,255,255,0.88);
      word-break: break-word;
      max-height: 180px;
      overflow-y: auto;
    }
  `;
}

function hideSendFailureToast() {
  if (failToastHideTimer) {
    clearTimeout(failToastHideTimer);
    failToastHideTimer = null;
  }
  const wrap = document.getElementById(UI.failToastId);
  if (wrap) wrap.classList.remove('open');
}

function showSendFailureToast(message) {
  const text = String(message || '').trim() || '未知錯誤';
  ensureStyles();
  let wrap = document.getElementById(UI.failToastId);
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = UI.failToastId;
    wrap.innerHTML = `
      <div class="dlsq-fail-card" role="alert" aria-labelledby="dlsq_fail_title">
        <div class="dlsq-fail-hdr">
          <span class="dlsq-fail-title" id="dlsq_fail_title">貼圖送出失敗</span>
          <button type="button" class="dlsq-fail-x" aria-label="關閉">✕</button>
        </div>
        <div class="dlsq-fail-msg"></div>
      </div>
    `;
    document.body.appendChild(wrap);
    wrap.querySelector('.dlsq-fail-x').addEventListener('click', () => hideSendFailureToast());
  }
  wrap.querySelector('.dlsq-fail-msg').textContent = text;
  wrap.classList.add('open');
  if (failToastHideTimer) clearTimeout(failToastHideTimer);
  failToastHideTimer = setTimeout(() => {
    failToastHideTimer = null;
    hideSendFailureToast();
  }, 6200);
}

function setPanelStatus(text, color = '#495057') {
  const panel = document.getElementById(UI.panelId);
  if (!panel) return;
  const status = panel.querySelector('.status');
  if (!status) return;
  status.style.color = color;
  status.textContent = text || '';
}

function togglePanel(force) {
  const panel = document.getElementById(UI.panelId);
  if (!panel) return;
  const shouldOpen = typeof force === 'boolean' ? force : !panel.classList.contains('open');
  panel.classList.toggle('open', shouldOpen);
  if (shouldOpen) {
    panelFilterTag = '__all__';
    refreshPanelStickers();
  }
}

function createPanelIfNeeded() {
  if (document.getElementById(UI.panelId)) return;
  ensureStyles();
  const panel = document.createElement('div');
  panel.id = UI.panelId;
  panel.innerHTML = `
    <div class="hdr">
      <div>Sticker Quick</div>
      <div class="close" title="Close">✕</div>
    </div>
    <div class="body">
      <div class="tabs"></div>
      <div class="grid"></div>
      <div class="status"></div>
    </div>
  `;
  document.body.appendChild(panel);
  panel.querySelector('.close').addEventListener('click', () => togglePanel(false));
}

function applyStableGridHeight(gridEl, allStickerCount) {
  if (!gridEl) return;
  const count = Number.isFinite(allStickerCount) ? allStickerCount : 0;
  const rows = Math.max(1, Math.ceil(Math.max(0, count) / PANEL_GRID_COLS));
  const desired = rows * PANEL_GRID_ROW_HEIGHT;
  const clamped = Math.max(PANEL_GRID_MIN_HEIGHT, Math.min(PANEL_GRID_MAX_HEIGHT, desired));
  gridEl.style.height = `${clamped}px`;
}

function updateContextMenuTexts() {
  const menu = document.getElementById(UI.ctxMenuId);
  if (!menu) return;
  
  const addDiv = menu.querySelector('[data-action="addStickerId"] > div:first-child');
  if (addDiv) addDiv.textContent = t('addToQuick');
  
  const tagsDiv = menu.querySelector('[data-action="openTagMenu"] > div:first-child');
  if (tagsDiv) tagsDiv.textContent = t('tags');
  
  const favDiv = menu.querySelector('[data-label="fav"]');
  if (favDiv) {
    const id = menu.getAttribute('data-id');
    if (id) {
      chrome.storage.local.get(['favoriteStickerIds'], (r) => {
        const fav = new Set(Array.isArray(r.favoriteStickerIds) ? r.favoriteStickerIds : []);
        favDiv.textContent = fav.has(id) ? t('unfav') : t('fav');
      });
    } else {
      favDiv.textContent = t('fav');
    }
  }
  
  const hideDiv = menu.querySelector('[data-action="toggleHidden"] > div:first-child');
  if (hideDiv) {
    const id = menu.getAttribute('data-id');
    if (id) {
      chrome.storage.local.get(['stickerIdsText'], (r) => {
        if (TAG) {
          const parsed = TAG.parseStickerIdsText(r.stickerIdsText || '');
          const row = parsed.rows.find((r) => r.id === id);
          const hiddenKey = PANEL_HIDDEN_TAG.toLowerCase();
          const isHidden = row?.tags?.some((t) => String(t).toLowerCase() === hiddenKey) || false;
          hideDiv.textContent = isHidden ? t('unhide') : t('hide');
        } else {
          hideDiv.textContent = t('hide');
        }
      });
    } else {
      hideDiv.textContent = t('hide');
    }
  }
}

function createContextMenuIfNeeded() {
  if (document.getElementById(UI.ctxMenuId)) {
    updateContextMenuTexts();
    return;
  }
  ensureStyles();
  const menu = document.createElement('div');
  menu.id = UI.ctxMenuId;
  menu.innerHTML = `
    <div class="item" data-action="addStickerId">
      <div></div>
      <div style="opacity:.65;">＋</div>
    </div>
    <div class="item" data-action="toggleFavorite">
      <div data-label="fav"></div>
      <div style="opacity:.65;">★</div>
    </div>
    <div class="item" data-action="toggleHidden">
      <div></div>
      <div style="opacity:.65;">👁️</div>
    </div>
    <div class="item" data-action="openTagMenu">
      <div></div>
      <div style="opacity:.65;">></div>
    </div>
    <div class="sub" data-sub="id"></div>
  `;
  document.body.appendChild(menu);
  updateContextMenuTexts();
}

function isInsideFloatingMenu(menu, e) {
  if (!menu || !e?.target) return false;
  try {
    if (menu.contains(e.target)) return true;
    if (typeof e.composedPath === 'function') {
      const path = e.composedPath();
      for (let i = 0; i < path.length; i++) {
        if (path[i] === menu) return true;
      }
    }
  } catch (_) {
    /* ignore */
  }
  return false;
}

/** 在 document capture 處理，避免頁面（React）在選單節點上攔截不到事件 */
function dispatchContextMenuPointer(e, menu) {
  const actionEl = e.target.closest?.('[data-action]');
  const action = actionEl?.getAttribute('data-action');
  const id = menu.getAttribute('data-id');
  if (!action || !id) return;
  hideContextMenu();

  (async () => {
    try {
      if (action === 'applyTag') {
        const tag = actionEl.getAttribute('data-tag');
        if (!tag) return;
        const r = await applyTagToStickerIdInStorage(id, tag);
        setPanelStatus(
          r.removed ? t('removeTag', tag) : t('addTag', tag),
          '#28a745'
        );
      } else if (action === 'openTagMenu') {
        showPanelTagMenuAt((e.clientX || 0) + 6, (e.clientY || 0) + 6, id);
        return;
      } else if (action === 'addStickerId') {
        const r = await addStickerIdToStorage(id);
        setPanelStatus(
          r.added ? t('added', r.count) : t('exists', r.count),
          r.added ? '#28a745' : '#adb5bd'
        );
      } else if (action === 'toggleFavorite') {
        const r = await toggleFavoriteIdInStorage(id);
        setPanelStatus(
          r.favored ? t('favMarked') : t('favUnmarked'),
          r.favored ? '#ffd43b' : '#adb5bd'
        );
      } else if (action === 'toggleHidden') {
        const r = await applyTagToStickerIdInStorage(id, PANEL_HIDDEN_TAG);
        setPanelStatus(
          r.removed ? t('unhidden') : t('hidden'),
          '#28a745'
        );
      }
      const panel = document.getElementById(UI.panelId);
      if (panel?.classList.contains('open')) refreshPanelStickers();
    } catch (err) {
      const msg = err?.message || String(err);
      setPanelStatus(`❌ ${msg}`, '#dc3545');
      showSendFailureToast(`儲存失敗：${msg}`);
    }
  })();
}

function dispatchPanelTagMenuPointer(e, menu) {
  const target = e.target;
  const actionEl = target.closest?.('[data-action]');
  const action = actionEl?.getAttribute('data-action');
  const pid = menu.getAttribute('data-id');
  const tag = actionEl?.getAttribute('data-tag');

  if (action === 'applyTag' && pid && tag) {
    suppressTileClickFor(1200);
    suppressPanelAutoCloseFor(1200);
    hidePanelTagMenu();
    (async () => {
      try {
        const r = await applyTagToStickerIdInStorage(pid, tag);
        setPanelStatus(
          r.removed ? t('removeTag', tag) : t('addTag', tag),
          '#28a745'
        );
        const panel = document.getElementById(UI.panelId);
        if (panel?.classList.contains('open')) refreshPanelStickers();
      } catch (err) {
        const msg = err?.message || String(err);
        setPanelStatus(`❌ ${msg}`, '#dc3545');
        showSendFailureToast(msg);
      }
    })();
    return;
  }
  if (action === 'panelToggleFavorite' && pid) {
    suppressTileClickFor(1200);
    suppressPanelAutoCloseFor(1200);
    hidePanelTagMenu();
    (async () => {
      try {
        const r = await toggleFavoriteIdInStorage(pid);
        setPanelStatus(
          r.favored ? t('favMarked') : t('favUnmarked'),
          r.favored ? '#ffd43b' : '#adb5bd'
        );
        const panel = document.getElementById(UI.panelId);
        if (panel?.classList.contains('open')) refreshPanelStickers();
      } catch (err) {
        const msg = err?.message || String(err);
        setPanelStatus(`❌ ${msg}`, '#dc3545');
        showSendFailureToast(msg);
      }
    })();
    return;
  }
  if (action === 'panelToggleHidden' && pid) {
    suppressTileClickFor(1200);
    suppressPanelAutoCloseFor(1200);
    hidePanelTagMenu();
    (async () => {
      try {
        const r = await applyTagToStickerIdInStorage(pid, PANEL_HIDDEN_TAG);
        setPanelStatus(
          r.removed ? t('unhidden') : t('hidden'),
          '#28a745'
        );
        const panel = document.getElementById(UI.panelId);
        if (panel?.classList.contains('open')) refreshPanelStickers();
      } catch (err) {
        const msg = err?.message || String(err);
        setPanelStatus(`❌ ${msg}`, '#dc3545');
        showSendFailureToast(msg);
      }
    })();
    return;
  }
  if (action === 'panelRemoveSticker' && pid && panelFilterTag === PANEL_FILTER_HIDDEN) {
    suppressTileClickFor(1200);
    suppressPanelAutoCloseFor(1200);
    hidePanelTagMenu();
    (async () => {
      try {
        const r = await removeStickerIdFromStorage(pid);
        setPanelStatus(
          r.removed ? t('deleted', r.count) : t('notInList'),
          r.removed ? '#28a745' : '#adb5bd'
        );
        const panel = document.getElementById(UI.panelId);
        if (panel?.classList.contains('open')) refreshPanelStickers();
      } catch (err) {
        const msg = err?.message || String(err);
        setPanelStatus(`❌ ${msg}`, '#dc3545');
        showSendFailureToast(msg);
      }
    })();
  }
}

let floatingMenusDocumentCaptureInstalled = false;
function installFloatingMenusDocumentCapture() {
  if (floatingMenusDocumentCaptureInstalled) return;
  floatingMenusDocumentCaptureInstalled = true;

  const onDown = (e) => {
    const pmenu = document.getElementById(UI.panelTagMenuId);
    const ctx = document.getElementById(UI.ctxMenuId);

    if (pmenu?.classList.contains('open') && isInsideFloatingMenu(pmenu, e)) {
      dispatchPanelTagMenuPointer(e, pmenu);
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (ctx?.classList.contains('open') && isInsideFloatingMenu(ctx, e)) {
      dispatchContextMenuPointer(e, ctx);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  document.addEventListener('pointerdown', onDown, true);
  document.addEventListener('mousedown', onDown, true);
}

function hideContextMenu() {
  const menu = document.getElementById(UI.ctxMenuId);
  if (!menu) return;
  menu.classList.remove('open');
  menu.style.display = 'none';
  menu.removeAttribute('data-id');
  const sub = menu.querySelector('[data-sub="id"]');
  if (sub) sub.textContent = '';
}

function createPanelTagMenuIfNeeded() {
  if (document.getElementById(UI.panelTagMenuId)) return;
  ensureStyles();
  const menu = document.createElement('div');
  menu.id = UI.panelTagMenuId;
  menu.innerHTML = `<div class="sub" data-panel-tag-sub></div><div class="tag-block-list" data-panel-tag-list></div>`;
  // Keep native context menu from appearing on top of our custom one.
  const block = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  menu.addEventListener('contextmenu', block);
  document.body.appendChild(menu);
}

function hidePanelTagMenu() {
  const menu = document.getElementById(UI.panelTagMenuId);
  if (!menu) return;
  menu.classList.remove('open');
  menu.style.display = 'none';
  menu.removeAttribute('data-id');
  const actions = menu.querySelector('[data-panel-tag-actions]');
  if (actions) actions.innerHTML = '';
  const list = menu.querySelector('[data-panel-tag-list]');
  if (list) list.innerHTML = '';
}

function ensurePanelTagMenuActionsSlot(menu) {
  let actions = menu.querySelector('[data-panel-tag-actions]');
  if (actions) return actions;
  actions = document.createElement('div');
  actions.setAttribute('data-panel-tag-actions', '');
  const list = menu.querySelector('[data-panel-tag-list]');
  if (list) menu.insertBefore(actions, list);
  else menu.appendChild(actions);
  return actions;
}

function showPanelTagMenuAt(x, y, id) {
  if (!TAG) return;
  createPanelTagMenuIfNeeded();
  const menu = document.getElementById(UI.panelTagMenuId);
  if (!menu) return;
  hideContextMenu();
  suppressPanelAutoCloseFor(1200);

  menu.setAttribute('data-id', id);
  const sub = menu.querySelector('[data-panel-tag-sub]');
  if (sub) sub.textContent = id;
  const actions = ensurePanelTagMenuActionsSlot(menu);
  actions.innerHTML = '';
  const list = menu.querySelector('[data-panel-tag-list]');
  if (list) list.innerHTML = '';

  chrome.storage.local.get(['stickerIdsText', 'stickerTagVocabularyText', 'favoriteStickerIds'], (res) => {
    const parsed = TAG.parseStickerIdsText(res.stickerIdsText || '');
    const row = parsed.rows.find((r) => r.id === id);
    const inList = !!row;
    const currentTags = new Set((row?.tags || []).map((t) => String(t).toLowerCase()));
    const favSet = new Set(Array.isArray(res.favoriteStickerIds) ? res.favoriteStickerIds : []);
    const vocab = TAG.parseTagVocabularyText(res.stickerTagVocabularyText || '');
    const hiddenKey = PANEL_HIDDEN_TAG.toLowerCase();

    if (inList) {
      const mkAction = (dataAction, label) => {
        const div = document.createElement('div');
        div.className = 'item';
        div.setAttribute('data-action', dataAction);
        div.textContent = label;
        actions.appendChild(div);
      };
      mkAction('panelToggleFavorite', favSet.has(id) ? t('unfav') : t('fav'));
      mkAction(
        'panelToggleHidden',
        currentTags.has(hiddenKey) ? t('unhide') : t('hide')
      );
      if (panelFilterTag === PANEL_FILTER_HIDDEN) {
        mkAction('panelRemoveSticker', t('permDelete'));
      }
    }

    if (!inList) {
      list.innerHTML = `<div class="item" style="cursor:default;opacity:.65;">${t('notInListMsg')}</div>`;
    } else if (!vocab.length) {
      list.innerHTML = `<div class="item" style="cursor:default;opacity:.65;">${t('emptyVocabMsg')}</div>`;
    } else {
      for (const t of vocab) {
        if (String(t).toLowerCase() === hiddenKey) continue;
        const div = document.createElement('div');
        div.className = 'item';
        div.setAttribute('data-action', 'applyTag');
        div.setAttribute('data-tag', t);
        if (currentTags.has(String(t).toLowerCase())) div.classList.add('on');
        div.textContent = `#${t}`;
        list.appendChild(div);
      }
    }

    menu.style.left = `${Math.max(8, x)}px`;
    menu.style.top = `${Math.max(8, y)}px`;
    menu.style.display = 'block';
    menu.classList.add('open');
    const rect = menu.getBoundingClientRect();
    const overflowX = rect.right - window.innerWidth + 8;
    const overflowY = rect.bottom - window.innerHeight + 8;
    if (overflowX > 0) menu.style.left = `${Math.max(8, x - overflowX)}px`;
    if (overflowY > 0) menu.style.top = `${Math.max(8, y - overflowY)}px`;
  });
}

function showContextMenuAt(x, y, id) {
  createContextMenuIfNeeded();
  const menu = document.getElementById(UI.ctxMenuId);
  if (!menu) return;

  menu.setAttribute('data-id', id);
  const sub = menu.querySelector('[data-sub="id"]');
  if (sub) sub.textContent = id;
  
  const updateMenuTexts = (favSet, isHidden) => {
    const favLabel = menu.querySelector('[data-label="fav"]');
    if (favLabel) favLabel.textContent = favSet.has(id) ? t('unfav') : t('fav');
    
    const hiddenBtn = menu.querySelector('[data-action="toggleHidden"] > div:first-child');
    if (hiddenBtn) hiddenBtn.textContent = isHidden ? t('unhide') : t('hide');
    
    const addBtn = menu.querySelector('[data-action="addStickerId"] > div:first-child');
    if (addBtn) addBtn.textContent = t('addToQuick');
    
    const tagsBtn = menu.querySelector('[data-action="openTagMenu"] > div:first-child');
    if (tagsBtn) tagsBtn.textContent = t('tags');
  };

  const placeMenu = () => {
    menu.style.left = `${Math.max(8, x)}px`;
    menu.style.top = `${Math.max(8, y)}px`;
    menu.style.display = 'block';
    menu.classList.add('open');
    const rect = menu.getBoundingClientRect();
    const overflowX = rect.right - window.innerWidth + 8;
    const overflowY = rect.bottom - window.innerHeight + 8;
    if (overflowX > 0) menu.style.left = `${Math.max(8, x - overflowX)}px`;
    if (overflowY > 0) menu.style.top = `${Math.max(8, y - overflowY)}px`;
  };

  if (!TAG) {
    placeMenu();
    return;
  }

  chrome.storage.local.get(['stickerIdsText', 'stickerTagVocabularyText', 'favoriteStickerIds'], (res) => {
    const parsed = TAG.parseStickerIdsText(res.stickerIdsText || '');
    const inList = parsed.rows.some((r) => r.id === id);
    const vocab = TAG.parseTagVocabularyText(res.stickerTagVocabularyText || '');
    const hiddenKey = PANEL_HIDDEN_TAG.toLowerCase();
    
    const row = parsed.rows.find((r) => r.id === id);
    const isHidden = row?.tags?.some((t) => String(t).toLowerCase() === hiddenKey) || false;
    
    const favSet = new Set(Array.isArray(res.favoriteStickerIds) ? res.favoriteStickerIds : []);
    updateMenuTexts(favSet, isHidden);
    
    const hiddenBtn = menu.querySelector('[data-action="toggleHidden"]');
    if (hiddenBtn) hiddenBtn.style.display = inList ? '' : 'none';
    
    const openTagBtn = menu.querySelector('[data-action="openTagMenu"]');
    if (openTagBtn) {
      openTagBtn.style.display = inList && vocab.length ? '' : 'none';
    }
    placeMenu();
  });
}

function extractEmoteIdFromSrc(src) {
  if (!src) return null;
  const s = String(src);
  const patterns = [
    /\/emote\/([A-Za-z0-9_]+)(?:[/?#]|$)/i,
    /\/emotes\/([A-Za-z0-9_]+)(?:[/?#]|$)/i,
    /[?&]emote(?:id)?=([A-Za-z0-9_]+)/i
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

function extractEmoteIdFromText(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  const m1 = t.match(/^([A-Za-z0-9_]+)$/);
  if (m1?.[1]) return m1[1];
  const m2 = t.match(/:emote\/mine\/dlive\/([A-Za-z0-9_]+):/);
  return m2?.[1] || null;
}

function getCandidateIdFromRightClick(target) {
  if (!target) return null;

  const img = target.closest ? target.closest('img') : null;
  if (img?.src) {
    const idFromSrc = extractEmoteIdFromSrc(img.src);
    if (idFromSrc) return idFromSrc;
  }

  const sel = window.getSelection ? window.getSelection() : null;
  const selText = sel && typeof sel.toString === 'function' ? sel.toString() : '';
  const idFromSel = extractEmoteIdFromText(selText);
  if (idFromSel) return idFromSel;

  const nearText = target.textContent ? String(target.textContent).slice(0, 220) : '';
  const idFromNear = extractEmoteIdFromText(nearText);
  if (idFromNear) return idFromNear;

  return null;
}

function fallbackRowsFromStickers(stickers) {
  if (!Array.isArray(stickers)) return [];
  const ids = stickers
    .map((s) => String(s?.code || '').match(/^:emote\/mine\/dlive\/([A-Za-z0-9_]+):$/)?.[1] || null)
    .filter(Boolean);
  return [...new Set(ids)].map((sid) => ({ id: sid, tags: [] }));
}

function rowsFromStorageBundle(res) {
  if (!TAG) {
    const lines = (typeof res.stickerIdsText === 'string' ? res.stickerIdsText : '')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    const ids = lines
      .map((line) => line.split(/\s+/)[0])
      .filter((id) => /^[A-Za-z0-9_]+$/.test(id));
    return ids.map((id) => ({ id, tags: [] }));
  }
  const parsed = TAG.parseStickerIdsText(res.stickerIdsText || '');
  if (parsed.rows.length) return parsed.rows;
  return fallbackRowsFromStickers(res.stickers);
}

async function writeStickerRows(rows, favoriteIds) {
  const fav = Array.isArray(favoriteIds) ? favoriteIds : [];
  let sorted = Array.isArray(rows) ? rows : [];
  if (TAG) sorted = TAG.sortRowsWithFavorites(sorted, fav);
  else {
    const favSet = new Set(fav);
    sorted = [...sorted].sort((a, b) => (favSet.has(b.id) ? 1 : 0) - (favSet.has(a.id) ? 1 : 0));
  }
  const text = TAG ? TAG.serializeStickerRows(sorted) : sorted.map((r) => r.id).join('\n');
  const stickers = sorted.map((row, index) => ({
    name: `ID${index + 1}`,
    code: `:emote/mine/dlive/${row.id}:`,
    imageUrl: `https://images.prd.dlivecdn.com/emote/${row.id}`
  }));
  await new Promise((resolve, reject) => {
    chrome.storage.local.set({ stickerIdsText: text, stickers, favoriteStickerIds: fav }, () => {
      const le = chrome.runtime.lastError;
      if (le) reject(new Error(le.message));
      else resolve();
    });
  });
  return { sorted, text, stickers };
}

async function toggleFavoriteIdInStorage(id) {
  const trimmed = String(id || '').trim();
  if (!/^[A-Za-z0-9_]+$/.test(trimmed)) {
    throw new Error(`ID 格式不正確：${trimmed}`);
  }

  const res = await chrome.storage.local.get(['favoriteStickerIds', 'stickerIdsText', 'stickers']);
  const currentFav = Array.isArray(res.favoriteStickerIds) ? res.favoriteStickerIds : [];
  const set = new Set(currentFav);
  const wasFav = set.has(trimmed);
  if (wasFav) set.delete(trimmed);
  else set.add(trimmed);
  const nextFav = [...set];

  const rows = rowsFromStorageBundle(res);
  const { sorted } = await writeStickerRows(rows, nextFav);

  return { favored: !wasFav, count: nextFav.length, total: sorted.length };
}

async function addStickerIdToStorage(id) {
  const trimmed = String(id || '').trim();
  if (!/^[A-Za-z0-9_]+$/.test(trimmed)) {
    throw new Error(`ID 格式不正確：${trimmed}`);
  }

  const res = await chrome.storage.local.get(['stickerIdsText', 'stickers', 'favoriteStickerIds']);
  const rows = rowsFromStorageBundle(res);
  const beforeSize = rows.length;
  let nextRows = rows;
  if (!rows.some((r) => r.id === trimmed)) {
    nextRows = [...rows, { id: trimmed, tags: [] }];
  }
  const afterSize = nextRows.length;
  const fav = Array.isArray(res.favoriteStickerIds) ? res.favoriteStickerIds : [];
  await writeStickerRows(nextRows, fav);

  return { added: afterSize > beforeSize, count: nextRows.length };
}

async function removeStickerIdFromStorage(id) {
  const trimmed = String(id || '').trim();
  if (!/^[A-Za-z0-9_]+$/.test(trimmed)) {
    throw new Error(`ID 格式不正確：${trimmed}`);
  }

  const res = await chrome.storage.local.get(['stickerIdsText', 'stickers', 'favoriteStickerIds']);
  const rows = rowsFromStorageBundle(res);
  const hadId = rows.some((r) => r.id === trimmed);
  const nextRows = rows.filter((r) => r.id !== trimmed);
  const nextFav = (Array.isArray(res.favoriteStickerIds) ? res.favoriteStickerIds : []).filter((x) => x !== trimmed);
  await writeStickerRows(nextRows, nextFav);

  return { removed: hadId, count: nextRows.length };
}

async function applyTagToStickerIdInStorage(id, tagLabel) {
  if (!TAG) throw new Error('標籤模組未載入');
  const trimmed = String(id || '').trim();
  if (!/^[A-Za-z0-9_]+$/.test(trimmed)) {
    throw new Error(`ID 格式不正確：${trimmed}`);
  }
  const label = TAG.normalizeTagToken(tagLabel);
  if (!TAG.isValidTagLabel(label)) {
    throw new Error('標籤格式不正確（最多 16 字元，不可含空白或 #）');
  }

  const res = await chrome.storage.local.get(['stickerIdsText', 'stickers', 'favoriteStickerIds']);
  const rows = rowsFromStorageBundle(res);
  const idx = rows.findIndex((r) => r.id === trimmed);
  if (idx < 0) throw new Error('此 ID 不在清單內（請先新增）');

  const row = rows[idx];
  const tags = Array.isArray(row.tags) ? [...row.tags] : [];
  const key = label.toLowerCase();
  const existingIdx = tags.findIndex((t) => String(t).toLowerCase() === key);
  if (existingIdx >= 0) {
    tags.splice(existingIdx, 1);
    const nextRows = rows.slice();
    nextRows[idx] = { id: trimmed, tags };
    const fav = Array.isArray(res.favoriteStickerIds) ? res.favoriteStickerIds : [];
    await writeStickerRows(nextRows, fav);
    return { removed: true, count: tags.length };
  }
  if (tags.length >= TAG.MAX_TAGS_PER_STICKER) {
    throw new Error(`每張最多 ${TAG.MAX_TAGS_PER_STICKER} 個標籤`);
  }
  tags.push(label);
  const nextRows = rows.slice();
  nextRows[idx] = { id: trimmed, tags };
  const fav = Array.isArray(res.favoriteStickerIds) ? res.favoriteStickerIds : [];
  await writeStickerRows(nextRows, fav);
  return { removed: false, count: tags.length };
}

function getDefaultStickers() {
  return [
    {
      name: '金剛',
      code: ':emote/mine/dlive/826c4ac1e004273_498281:',
      imageUrl: 'https://images.prd.dlivecdn.com/emote/826c4ac1e004273_498281'
    }
  ];
}

async function loadStickersFromStorage() {
  try {
    const res = await chrome.storage.local.get(['stickers', 'favoriteStickerIds']);
    const stickers = Array.isArray(res.stickers) ? res.stickers : null;
    const fav = new Set(Array.isArray(res.favoriteStickerIds) ? res.favoriteStickerIds : []);
    const list = stickers && stickers.length ? stickers : getDefaultStickers();
    // 置頂常用
    return [...list].sort((a, b) => {
      const ida = String(a?.code || '').match(/^:emote\/mine\/dlive\/([A-Za-z0-9_]+):$/)?.[1] || null;
      const idb = String(b?.code || '').match(/^:emote\/mine\/dlive\/([A-Za-z0-9_]+):$/)?.[1] || null;
      const fa = ida && fav.has(ida) ? 1 : 0;
      const fb = idb && fav.has(idb) ? 1 : 0;
      return fb - fa;
    });
  } catch (e) {
    console.warn('Failed to load stickers from storage', e);
    return getDefaultStickers();
  }
}

async function refreshPanelStickers() {
  createPanelIfNeeded();
  const refreshSeq = ++panelRefreshSeq;
  const panel = document.getElementById(UI.panelId);
  const tabs = panel.querySelector('.tabs');
  const grid = panel.querySelector('.grid');
  grid.innerHTML = '';
  if (tabs) tabs.innerHTML = '';
  setPanelStatus(t('loading'));

  const storage = await chrome.storage.local.get(['favoriteStickerIds', 'stickerIdsText']);
  if (refreshSeq !== panelRefreshSeq) return;
  const favSet = new Set(Array.isArray(storage.favoriteStickerIds) ? storage.favoriteStickerIds : []);
  let stickers = await loadStickersFromStorage();
  if (refreshSeq !== panelRefreshSeq) return;
  const allStickerCount = stickers.length;
  applyStableGridHeight(grid, allStickerCount);

  let tagMap = {};
  let tabLabels = [];
  let parsedRows = [];
  if (TAG) {
    parsedRows = TAG.parseStickerIdsText(storage.stickerIdsText || '').rows;
    tagMap = TAG.rowsToIdTagMap(parsedRows);
    tabLabels = TAG.sortedTagLabelsForTabs(parsedRows);
  }
  if (refreshSeq !== panelRefreshSeq) return;

  if (tabs && TAG) {
    const mkTab = (label, value) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `tab${panelFilterTag === value ? ' on' : ''}`;
      b.textContent = label;
      b.title = label;
      b.addEventListener('click', () => {
        panelFilterTag = value;
        refreshPanelStickers();
      });
      tabs.appendChild(b);
    };
    mkTab(t('all'), '__all__');
    const counts = TAG.tagCountsFromRows(parsedRows);
    const hiddenKey = PANEL_HIDDEN_TAG.toLowerCase();
    const hiddenCount = (parsedRows || []).filter((r) =>
      (r?.tags || []).some((t) => String(t).toLowerCase() === hiddenKey)
    ).length;
    // Count stickers with no tags (excluding hidden ones)
    const uncategorizedCount = (parsedRows || []).filter((r) => {
      if ((r?.tags || []).some((t) => String(t).toLowerCase() === hiddenKey)) return false;
      return !r?.tags?.length || r.tags.length === 0;
    }).length;
    mkTab(t('uncategorizedTab', uncategorizedCount), PANEL_FILTER_UNCATEGORIZED);
    for (const lab of tabLabels) {
      if (String(lab).toLowerCase() === hiddenKey) continue;
      const c = counts[lab] || 0;
      mkTab(`${lab} (${c})`, lab);
    }
    mkTab(t('hiddenTab', hiddenCount), PANEL_FILTER_HIDDEN);
  }

  const active = panelFilterTag || '__all__';
  if (TAG) {
    const hiddenKey = PANEL_HIDDEN_TAG.toLowerCase();
    const sidOf = (s) => String(s?.code || '').match(/^:emote\/mine\/dlive\/([A-Za-z0-9_]+):$/)?.[1] || null;
    const isHidden = (sid) => {
      if (!sid) return false;
      const ts = tagMap[sid] || [];
      return ts.some((t) => String(t).toLowerCase() === hiddenKey);
    };

    if (active === '__all__') {
      stickers = stickers.filter((s) => !isHidden(sidOf(s)));
    } else if (active === PANEL_FILTER_HIDDEN) {
      stickers = stickers.filter((s) => isHidden(sidOf(s)));
    } else if (active === PANEL_FILTER_UNCATEGORIZED) {
      stickers = stickers.filter((s) => {
        const sid = sidOf(s);
        if (!sid || isHidden(sid)) return false;
        const ts = tagMap[sid] || [];
        return ts.length === 0;
      });
    } else {
      const key = String(active).toLowerCase();
      stickers = stickers.filter((s) => {
        const sid = sidOf(s);
        if (!sid || isHidden(sid)) return false;
        const ts = tagMap[sid] || [];
        return ts.some((t) => String(t).toLowerCase() === key);
      });
    }
  }
  if (refreshSeq !== panelRefreshSeq) return;

  setPanelStatus('');

  for (const s of stickers) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.title = s.name || '';
    const sid = String(s?.code || '').match(/^:emote\/mine\/dlive\/([A-Za-z0-9_]+):$/)?.[1] || null;
    if (sid && favSet.has(sid)) tile.classList.add('favored');
    tile.innerHTML = `<div class="fav">★</div>`;

    if (s.imageUrl) {
      const img = document.createElement('img');
      img.src = s.imageUrl;
      img.alt = s.name || '';
      img.onerror = () => {
        tile.innerHTML = `${tile.innerHTML}<div class="fallback">${(s.name || 'sticker')}</div>`;
      };
      tile.appendChild(img);
    } else {
      tile.innerHTML = `${tile.innerHTML}<div class="fallback">${(s.name || 'sticker')}</div>`;
    }

    if (sid) {
      tile.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showPanelTagMenuAt(e.clientX, e.clientY, sid);
      });
    }

    tile.addEventListener('click', () => {
      if (isTileClickSuppressed()) return;
      const code = s.code;
      togglePanel(false);
      sendChatMessage(code).catch((e) => {
        showSendFailureToast(e?.message || e);
      });
    });

    grid.appendChild(tile);
  }
}

function findChatContainer() {
  // 參考你給的插件：.chatroom-input 是常見插入點
  return document.querySelector('.chatroom-input');
}

function ensureChatButton() {
  const chat = findChatContainer();
  if (!chat) return false;

  if (!document.getElementById(UI.btnId)) {
    ensureStyles();
    createPanelIfNeeded();

    const btn = document.createElement('button');
    btn.id = UI.btnId;
    btn.type = 'button';
    btn.title = 'Sticker Quick';
    btn.textContent = '🎨';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      togglePanel();
    });
    chat.appendChild(btn);
  }

  return true;
}

function setupUiAutoMount() {
  installFloatingMenusDocumentCapture();
  initLanguage();

  // 初次嘗試
  ensureChatButton();

  // 用 observer 等待 SPA/動態聊天室渲染
  const obs = new MutationObserver(() => {
    ensureChatButton();
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });

  // 右鍵：新增貼圖 ID（能解析到 emote id 才攔截）
  document.addEventListener('contextmenu', (e) => {
    const id = getCandidateIdFromRightClick(e.target);
    if (!id) return;
    e.preventDefault();
    showContextMenuAt(e.clientX, e.clientY, id);
  });

  // 選單內點擊改由 #dlsq_ctx_menu / #dlsq_panel_tag_menu 節點的 capture mousedown 處理（避免 DLive 先攔截）
  document.addEventListener('mousedown', (e) => {
    const pmenu = document.getElementById(UI.panelTagMenuId);
    if (pmenu?.classList.contains('open') && !isInsideFloatingMenu(pmenu, e)) {
      hidePanelTagMenu();
    }
    const ctx = document.getElementById(UI.ctxMenuId);
    if (ctx?.classList.contains('open') && !isInsideFloatingMenu(ctx, e)) {
      hideContextMenu();
    }
  });

  // Some browsers still emit click after mousedown; block click-through here too.
  document.addEventListener('click', (e) => {
    const pmenu = document.getElementById(UI.panelTagMenuId);
    if (pmenu?.classList.contains('open') && pmenu.contains(e.target)) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  // 點外面關閉面板
  document.addEventListener('mousedown', (e) => {
    const panel = document.getElementById(UI.panelId);
    if (!panel || !panel.classList.contains('open')) return;
    if (isPanelAutoCloseSuppressed()) return;
    const btn = document.getElementById(UI.btnId);
    const ctxMenu = document.getElementById(UI.ctxMenuId);
    const panelTagMenu = document.getElementById(UI.panelTagMenuId);
    const t = e.target;
    if (panel.contains(t) || (btn && btn.contains(t))) return;
    // Keep panel open while operating right-click menus for continuous tagging.
    if ((ctxMenu && ctxMenu.contains(t)) || (panelTagMenu && panelTagMenu.contains(t))) return;
    hidePanelTagMenu();
    togglePanel(false);
  });

  // ESC 關閉
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      togglePanel(false);
      hideContextMenu();
      hidePanelTagMenu();
      hideSendFailureToast();
    }
  });

  // storage 更新時即時刷新
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;
    if (!changes.stickers && !changes.stickerIdsText && !changes.favoriteStickerIds && !changes.stickerTagVocabularyText) return;
    const panel = document.getElementById(UI.panelId);
    if (panel?.classList.contains('open')) refreshPanelStickers();
  });
}

function getAccessToken() {
  // DLive web 端常見 key（你給的參考就是這個）
  const raw = localStorage.getItem('LOCAL_ACCESS_TOKEN_KEY');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

async function gqlRequest(payload) {
  const token = getAccessToken();
  if (!token) {
    const err = new Error('找不到登入 token（請先登入 DLive）');
    err.code = 'NO_TOKEN';
    throw err;
  }

  const res = await fetch('https://graphigo.prd.dlive.tv/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    err.code = 'HTTP_ERROR';
    throw err;
  }

  const json = await res.json();
  if (json?.errors?.length) {
    const err = new Error(json.errors[0]?.message || 'GraphQL error');
    err.code = json.errors[0]?.extensions?.code || 'GQL_ERROR';
    throw err;
  }
  return json?.data;
}

function getDisplayNameFromUrl() {
  // 例如 /KingKongMovie 或 /c/KingKongMovie/xxxx
  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts.length === 0) return null;
  if (parts[0] === 'c' && parts[1]) return parts[1].toLowerCase();
  if (parts[0] !== 'c') return parts[0].toLowerCase();
  return null;
}

let cachedStreamer = null;
let cachedDisplayName = null;
let resolvingStreamer = null;

async function resolveStreamerUsername() {
  const displayName = getDisplayNameFromUrl();
  if (!displayName) {
    const err = new Error('目前頁面看起來不是頻道頁（無法判斷 streamer）');
    err.code = 'NO_STREAMER';
    throw err;
  }

  if (cachedStreamer && cachedDisplayName === displayName) return cachedStreamer;

  if (resolvingStreamer) return await resolvingStreamer;

  resolvingStreamer = (async () => {
    // 參考你給的做法：用 displayname 查 username
    const query = {
      query: `
        query {
          userByDisplayName(displayname: "${displayName}") {
            username
          }
        }
      `
    };

    // 有時候剛切頁資料還沒好，最多等 5 秒重試
    let lastErr = null;
    for (let i = 0; i < 5; i++) {
      try {
        const data = await gqlRequest(query);
        const username = data?.userByDisplayName?.username;
        if (username) {
          cachedStreamer = username;
          cachedDisplayName = displayName;
          return username;
        }
      } catch (e) {
        lastErr = e;
      }
      await sleep(1000);
    }
    throw lastErr || new Error('找不到 streamer username');
  })();

  try {
    return await resolvingStreamer;
  } finally {
    resolvingStreamer = null;
  }
}

async function sendChatMessage(message) {
  const streamer = await resolveStreamerUsername();

  const mutation = `
    mutation SendStreamChatMessage($input: SendStreamchatMessageInput!) {
      sendStreamchatMessage(input: $input) {
        err { code }
        message { ... on ChatText { id } }
      }
    }
  `;

  const payload = {
    operationName: 'SendStreamChatMessage',
    query: mutation,
    variables: {
      input: {
        streamer,
        message,
        // 參考版本用 Owner；若你不是台主可能會被後端忽略，但通常不影響送出
        roomRole: 'Owner',
        subscribing: false
      }
    }
  };

  const data = await gqlRequest(payload);
  const errCode = data?.sendStreamchatMessage?.err?.code;
  if (errCode) {
    const err = new Error(`sendStreamchatMessage error: ${errCode}`);
    err.code = errCode;
    throw err;
  }
  return data?.sendStreamchatMessage?.message?.id || true;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action !== 'sendSticker') return;

  (async () => {
    const id = await sendChatMessage(request.code);
    sendResponse({ ok: true, id });
  })().catch((e) => {
    console.error('❌ sendSticker failed', e);
    showSendFailureToast(e?.message || e);
    sendResponse({ ok: false, error: String(e?.message || e), code: e?.code || null });
  });

  // 讓 sendResponse 可以 async
  return true;
});

// 啟動 UI（先遷移 sync → local，避免舊資料留在已爆量的 sync）
(async function dlsqBootContent() {
  try {
    if (typeof DLSQStickerStore !== 'undefined') {
      await DLSQStickerStore.migrateFromSyncIfNeeded();
    }
  } catch (e) {
    console.warn('DLSQ sticker migrate', e);
  }
  setupUiAutoMount();
})();