console.log('✅ content.js 已載入！（GraphQL 直接送出模式）');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ========= UI: Chat-side button + floating panel =========
const UI = {
  rootId: 'dlsq_root',
  btnId: 'dlsq_btn',
  panelId: 'dlsq_panel',
  styleId: 'dlsq_style_v2',
  ctxMenuId: 'dlsq_ctx_menu',
  failToastId: 'dlsq_fail_overlay'
};

let failToastHideTimer = null;

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
      width: 320px;
      max-height: 420px;
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
    #${UI.panelId} .body { padding: 10px; overflow: auto; max-height: 370px; }
    #${UI.panelId} .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      max-height: 136px; /* 約兩行 (64*2 + gap) */
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

    /* ===== Send failure toast（與貼圖面板同角落，不遮全畫面）===== */
    #${UI.failToastId} {
      position: fixed;
      right: 16px;
      bottom: 80px;
      width: 320px;
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
  if (shouldOpen) refreshPanelStickers();
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
      <div class="grid"></div>
      <div class="status"></div>
    </div>
  `;
  document.body.appendChild(panel);
  panel.querySelector('.close').addEventListener('click', () => togglePanel(false));
}

function createContextMenuIfNeeded() {
  if (document.getElementById(UI.ctxMenuId)) return;
  ensureStyles();
  const menu = document.createElement('div');
  menu.id = UI.ctxMenuId;
  menu.innerHTML = `
    <div class="item" data-action="addStickerId">
      <div>新增到 Sticker Quick</div>
      <div style="opacity:.65;">＋</div>
    </div>
    <div class="item" data-action="toggleFavorite">
      <div data-label="fav">標記常用（★）</div>
      <div style="opacity:.65;">★</div>
    </div>
    <div class="item" data-action="removeStickerId">
      <div>從清單刪除</div>
      <div style="opacity:.65;">✕</div>
    </div>
    <div class="sub" data-sub="id"></div>
  `;
  document.body.appendChild(menu);
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

function showContextMenuAt(x, y, id) {
  createContextMenuIfNeeded();
  const menu = document.getElementById(UI.ctxMenuId);
  if (!menu) return;

  menu.setAttribute('data-id', id);
  const sub = menu.querySelector('[data-sub="id"]');
  if (sub) sub.textContent = id;
  const favLabel = menu.querySelector('[data-label="fav"]');
  if (favLabel) favLabel.textContent = '標記常用（★）';

  menu.style.left = `${Math.max(8, x)}px`;
  menu.style.top = `${Math.max(8, y)}px`;
  menu.style.display = 'block';
  menu.classList.add('open');

  const rect = menu.getBoundingClientRect();
  const overflowX = rect.right - window.innerWidth + 8;
  const overflowY = rect.bottom - window.innerHeight + 8;
  if (overflowX > 0) menu.style.left = `${Math.max(8, x - overflowX)}px`;
  if (overflowY > 0) menu.style.top = `${Math.max(8, y - overflowY)}px`;
}

function extractEmoteIdFromSrc(src) {
  if (!src) return null;
  const s = String(src);
  const m1 = s.match(/\/emote\/([A-Za-z0-9_]+)(?:\?|$)/);
  if (m1?.[1]) return m1[1];
  const m2 = s.match(/\/emote\/([A-Za-z0-9_]+)$/);
  return m2?.[1] || null;
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

async function toggleFavoriteIdInStorage(id) {
  const trimmed = String(id || '').trim();
  if (!/^[A-Za-z0-9_]+$/.test(trimmed)) {
    throw new Error(`ID 格式不正確：${trimmed}`);
  }

  const res = await chrome.storage.sync.get(['favoriteStickerIds', 'stickerIdsText', 'stickers']);
  const currentFav = Array.isArray(res.favoriteStickerIds) ? res.favoriteStickerIds : [];
  const set = new Set(currentFav);
  const wasFav = set.has(trimmed);
  if (wasFav) set.delete(trimmed);
  else set.add(trimmed);
  const nextFav = [...set];

  // 也順便把 stickers 依 favorites 置頂（若有資料）
  const idsFromText = (typeof res.stickerIdsText === 'string' ? res.stickerIdsText : '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const idsFromStickers = Array.isArray(res.stickers)
    ? res.stickers
        .map((s) => String(s?.code || ''))
        .map((code) => (code.match(/^:emote\/mine\/dlive\/([A-Za-z0-9_]+):$/)?.[1] || null))
        .filter(Boolean)
    : [];
  const allIds = [...new Set([...idsFromText, ...idsFromStickers])];
  const favSet = new Set(nextFav);
  const sortedIds = [...allIds].sort((a, b) => (favSet.has(b) ? 1 : 0) - (favSet.has(a) ? 1 : 0));
  const stickers = sortedIds.map((sid, index) => ({
    name: `ID${index + 1}`,
    code: `:emote/mine/dlive/${sid}:`,
    imageUrl: `https://images.prd.dlivecdn.com/emote/${sid}`
  }));

  await chrome.storage.sync.set({
    favoriteStickerIds: nextFav,
    stickerIdsText: sortedIds.join('\n'),
    stickers
  });

  return { favored: !wasFav, count: nextFav.length };
}

async function addStickerIdToStorage(id) {
  const trimmed = String(id || '').trim();
  if (!/^[A-Za-z0-9_]+$/.test(trimmed)) {
    throw new Error(`ID 格式不正確：${trimmed}`);
  }

  const res = await chrome.storage.sync.get(['stickerIdsText', 'stickers', 'favoriteStickerIds']);

  const idsFromText = (typeof res.stickerIdsText === 'string' ? res.stickerIdsText : '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const idsFromStickers = Array.isArray(res.stickers)
    ? res.stickers
        .map((s) => String(s?.code || ''))
        .map((code) => (code.match(/^:emote\/mine\/dlive\/([A-Za-z0-9_]+):$/)?.[1] || null))
        .filter(Boolean)
    : [];

  const set = new Set([...idsFromText, ...idsFromStickers]);
  const beforeSize = set.size;
  set.add(trimmed);
  const afterSize = set.size;

  const favSet = new Set(Array.isArray(res.favoriteStickerIds) ? res.favoriteStickerIds : []);
  const uniqueIds = [...set].sort((a, b) => (favSet.has(b) ? 1 : 0) - (favSet.has(a) ? 1 : 0));
  const stickers = uniqueIds.map((sid, index) => ({
    name: `ID${index + 1}`,
    code: `:emote/mine/dlive/${sid}:`,
    imageUrl: `https://images.prd.dlivecdn.com/emote/${sid}`
  }));

  await chrome.storage.sync.set({
    stickerIdsText: uniqueIds.join('\n'),
    stickers
  });

  return { added: afterSize > beforeSize, count: uniqueIds.length };
}

async function removeStickerIdFromStorage(id) {
  const trimmed = String(id || '').trim();
  if (!/^[A-Za-z0-9_]+$/.test(trimmed)) {
    throw new Error(`ID 格式不正確：${trimmed}`);
  }

  const res = await chrome.storage.sync.get(['stickerIdsText', 'stickers', 'favoriteStickerIds']);

  const idsFromText = (typeof res.stickerIdsText === 'string' ? res.stickerIdsText : '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const idsFromStickers = Array.isArray(res.stickers)
    ? res.stickers
        .map((s) => String(s?.code || ''))
        .map((code) => (code.match(/^:emote\/mine\/dlive\/([A-Za-z0-9_]+):$/)?.[1] || null))
        .filter(Boolean)
    : [];

  const merged = [...new Set([...idsFromText, ...idsFromStickers])];
  const hadId = merged.includes(trimmed);
  const nextIds = merged.filter((x) => x !== trimmed);
  const nextFav = (Array.isArray(res.favoriteStickerIds) ? res.favoriteStickerIds : []).filter((x) => x !== trimmed);
  const favSet = new Set(nextFav);
  const sortedIds = [...nextIds].sort((a, b) => (favSet.has(b) ? 1 : 0) - (favSet.has(a) ? 1 : 0));
  const stickers = sortedIds.map((sid, index) => ({
    name: `ID${index + 1}`,
    code: `:emote/mine/dlive/${sid}:`,
    imageUrl: `https://images.prd.dlivecdn.com/emote/${sid}`
  }));

  await chrome.storage.sync.set({
    stickerIdsText: sortedIds.join('\n'),
    stickers,
    favoriteStickerIds: nextFav
  });

  return { removed: hadId, count: sortedIds.length };
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
    const res = await chrome.storage.sync.get(['stickers', 'favoriteStickerIds']);
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
  const panel = document.getElementById(UI.panelId);
  const grid = panel.querySelector('.grid');
  grid.innerHTML = '';
  setPanelStatus('載入中…');

  const storage = await chrome.storage.sync.get(['favoriteStickerIds']);
  const favSet = new Set(Array.isArray(storage.favoriteStickerIds) ? storage.favoriteStickerIds : []);
  const stickers = await loadStickersFromStorage();
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

    tile.addEventListener('click', () => {
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

    // 更新 label（依目前是否常用）
    chrome.storage.sync.get(['favoriteStickerIds'], (r) => {
      const fav = new Set(Array.isArray(r.favoriteStickerIds) ? r.favoriteStickerIds : []);
      const menu = document.getElementById(UI.ctxMenuId);
      const favLabel = menu?.querySelector('[data-label="fav"]');
      if (favLabel) favLabel.textContent = fav.has(id) ? '取消常用（★）' : '標記常用（★）';
    });
  });

  // context menu：點擊操作 / 點外面關閉
  document.addEventListener('mousedown', (e) => {
    const menu = document.getElementById(UI.ctxMenuId);
    if (!menu || !menu.classList.contains('open')) return;

    const t = e.target;
    if (!menu.contains(t)) {
      hideContextMenu();
      return;
    }

    const actionEl = t.closest ? t.closest('[data-action]') : null;
    const action = actionEl?.getAttribute('data-action');
    const id = menu.getAttribute('data-id');
    if (!action || !id) return;
    hideContextMenu();

    (async () => {
      try {
        if (action === 'addStickerId') {
          const r = await addStickerIdToStorage(id);
          setPanelStatus(
            r.added ? `✅ 已新增（共 ${r.count} 個）` : `ℹ️ 已存在（共 ${r.count} 個）`,
            r.added ? '#28a745' : '#adb5bd'
          );
        } else if (action === 'toggleFavorite') {
          const r = await toggleFavoriteIdInStorage(id);
          setPanelStatus(r.favored ? '✅ 已標記常用（★）' : '✅ 已取消常用', r.favored ? '#ffd43b' : '#adb5bd');
        } else if (action === 'removeStickerId') {
          const r = await removeStickerIdFromStorage(id);
          setPanelStatus(
            r.removed ? `✅ 已從清單刪除（剩 ${r.count} 個）` : 'ℹ️ 清單內沒有此 ID',
            r.removed ? '#28a745' : '#adb5bd'
          );
        }
        const panel = document.getElementById(UI.panelId);
        if (panel?.classList.contains('open')) refreshPanelStickers();
      } catch (err) {
        setPanelStatus(`❌ 新增失敗：${err?.message || err}`, '#dc3545');
      }
    })();
  });

  // 點外面關閉面板
  document.addEventListener('mousedown', (e) => {
    const panel = document.getElementById(UI.panelId);
    if (!panel || !panel.classList.contains('open')) return;
    const btn = document.getElementById(UI.btnId);
    const t = e.target;
    if (panel.contains(t) || (btn && btn.contains(t))) return;
    togglePanel(false);
  });

  // ESC 關閉
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      togglePanel(false);
      hideContextMenu();
      hideSendFailureToast();
    }
  });

  // storage 更新時即時刷新
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'sync') return;
    if (!changes.stickers) return;
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

// 啟動 UI
setupUiAutoMount();