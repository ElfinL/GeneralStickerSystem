/* global DLSQ */
const TAG = typeof DLSQ !== 'undefined' ? DLSQ : null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ========= 語言設定 =========
let currentLang = 'zh';

// 支援的語言列表
const SUPPORTED_LANGS = ['zh', 'zh-CN', 'en', 'ja', 'ko'];

// 語言對應表：將 i18n.js 的語言代碼映射到 content.js 的語言代碼
const LANG_MAP = {
  'zh-TW': 'zh',
  'zh-CN': 'zh-CN',
  'en': 'en',
  'ja': 'ja',
  'ko': 'ko'
};

function getContentLang(uiLang) {
  return LANG_MAP[uiLang] || 'zh';
}

const UI_I18N = {
  zh: {
    addToQuick: '新增到 GSS',
    fav: '標記常用（★）',
    unfav: '取消常用（★）',
    hide: '隱藏',
    unhide: '取消隱藏',
    tags: '標籤',
    zoomImage: '放大圖片',
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
    dl: 'DL',
    im: 'IM',
    hiddenTab: (n) => `隱藏 (${n})`,
    notInListMsg: '不在清單內',
    emptyVocabMsg: '詞庫為空時仍可用上方「常用／隱藏」；要套用其他 #標籤請到 popup 建立詞庫',
    permDelete: '從清單永久刪除…',
    uncategorizedTab: (n) => `未分類 (${n})`
  },
  'zh-CN': {
    addToQuick: '添加到 GSS',
    fav: '标记常用（★）',
    unfav: '取消常用（★）',
    hide: '隐藏',
    unhide: '取消隐藏',
    tags: '标签',
    zoomImage: '放大图片',
    added: (n) => `✅ 已添加（共 ${n} 个）`,
    exists: (n) => `ℹ️ 已存在（共 ${n} 个）`,
    favMarked: '✅ 已标记常用（★）',
    favUnmarked: '✅ 已取消常用',
    hidden: `✅ 已隐藏（到「隐藏」分页可永久删除）`,
    unhidden: '✅ 已取消隐藏',
    removeTag: (tag) => `✅ 已移除 #${tag}`,
    addTag: (tag) => `✅ 已添加 #${tag}`,
    deleted: (n) => `✅ 已从清单删除（剩 ${n} 个）`,
    notInList: 'ℹ️ 清单内没有此 ID',
    loading: '加载中…',
    all: '全部 / ALL',
    dl: 'DL',
    im: 'IM',
    hiddenTab: (n) => `隐藏 (${n})`,
    notInListMsg: '不在清单内',
    emptyVocabMsg: '词库为空时仍可用上方「常用／隐藏」；要套用其他 #标签请到 popup 建立词库',
    permDelete: '从清单永久删除…',
    uncategorizedTab: (n) => `未分类 (${n})`
  },
  en: {
    addToQuick: 'Add to GSS',
    fav: 'Mark as Favorite (★)',
    unfav: 'Unmark Favorite (★)',
    hide: 'Hide',
    unhide: 'Unhide',
    tags: 'Tags',
    zoomImage: 'Zoom Image',
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
    dl: 'DL',
    im: 'IM',
    hiddenTab: (n) => `Hidden (${n})`,
    notInListMsg: 'Not in list',
    emptyVocabMsg: 'When vocabulary is empty, you can still use "Favorite/Hide" above; to apply other #tags, add them in popup',
    permDelete: 'Permanently delete from list…',
    uncategorizedTab: (n) => `Uncategorized (${n})`
  },
  ja: {
    addToQuick: 'GSSに追加',
    fav: 'お気に入り登録（★）',
    unfav: 'お気に入り解除（★）',
    hide: '非表示',
    unhide: '非表示解除',
    tags: 'タグ',
    zoomImage: '画像を拡大',
    added: (n) => `✅ 追加しました（計 ${n} 個）`,
    exists: (n) => `ℹ️ 既に存在します（計 ${n} 個）`,
    favMarked: '✅ お気に入りに追加しました（★）',
    favUnmarked: '✅ お気に入りから削除しました',
    hidden: `✅ 非表示にしました（「非表示」タブで完全削除可能）`,
    unhidden: '✅ 非表示を解除しました',
    removeTag: (tag) => `✅ #${tag} を削除しました`,
    addTag: (tag) => `✅ #${tag} を追加しました`,
    deleted: (n) => `✅ リストから削除しました（残り ${n} 個）`,
    notInList: 'ℹ️ リストにこの ID がありません',
    loading: '読み込み中…',
    all: '全て / ALL',
    dl: 'DL',
    im: 'IM',
    hiddenTab: (n) => `非表示 (${n})`,
    notInListMsg: 'リストにありません',
    emptyVocabMsg: '辞書が空でも「お気に入り／非表示」は使用可能；その他の #タグ を追加するには popup で辞書を作成してください',
    permDelete: 'リストから完全に削除…',
    uncategorizedTab: (n) => `未分類 (${n})`
  },
  ko: {
    addToQuick: 'GSS에 추가',
    fav: '즐겨찾기 등록（★）',
    unfav: '즐겨찾기 해제（★）',
    hide: '숨기기',
    unhide: '숨기기 해제',
    tags: '태그',
    zoomImage: '이미지 확대',
    added: (n) => `✅ 추가되었습니다（총 ${n} 개）`,
    exists: (n) => `ℹ️ 이미 존재합니다（총 ${n} 개）`,
    favMarked: '✅ 즐겨찾기에 추가되었습니다（★）',
    favUnmarked: '✅ 즐겨찾기에서 제거되었습니다',
    hidden: `✅ 숨김 처리되었습니다（"숨김" 탭에서 완전 삭제 가능）`,
    unhidden: '✅ 숨김 해제되었습니다',
    removeTag: (tag) => `✅ #${tag} 삭제됨`,
    addTag: (tag) => `✅ #${tag} 추가됨`,
    deleted: (n) => `✅ 목록에서 삭제되었습니다（남은 ${n} 개）`,
    notInList: 'ℹ️ 목록에 이 ID가 없습니다',
    loading: '로딩 중…',
    all: '전체 / ALL',
    dl: 'DL',
    im: 'IM',
    hiddenTab: (n) => `숨김 (${n})`,
    notInListMsg: '목록에 없음',
    emptyVocabMsg: '사전이 비어있어도 "즐겨찾기／숨김"은 사용 가능；다른 #태그 를 추가하려면 popup에서 사전을 만드세요',
    permDelete: '목록에서 영구 삭제…',
    uncategorizedTab: (n) => `미분류 (${n})`
  }
};

function t(key, ...args) {
  const dict = UI_I18N[currentLang] || UI_I18N.zh;
  const val = dict[key];
  if (typeof val === 'function') return val(...args);
  return val || key;
}

function initLanguage() {
  try {
    chrome.storage.sync.get(['uiLang'], (result) => {
      currentLang = getContentLang(result.uiLang);
    });
  } catch (e) {
    // Extension context invalidated
  }
}

// 監聽語言變化
try {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes.uiLang) {
      currentLang = getContentLang(changes.uiLang.newValue);
      // 刷新面板以更新語言
      const panel = document.getElementById(UI.panelId);
      if (panel?.classList.contains('open')) {
        refreshPanelStickers().catch(() => { });
      }
      // 更新選單文字
      updateContextMenuTexts();
    }
  });
} catch (e) {
  // Extension context invalidated
}

// ========= 零寬字符隱藏訊息功能 =========
// 方案C: 只使用2種零寬字符表示1bit (Twitch會過濾U+FEFF和U+200D)
const ZW_CHARS = {
  '0': '\u200B', // 零寬空格 = 0
  '1': '\u200C'  // 零寬非連接符 = 1
};
const ZW_REVERSE = Object.fromEntries(Object.entries(ZW_CHARS).map(([k, v]) => [v, k]));

// 將字串編碼為零寬字符
function encodeToZeroWidth(str) {
  const bytes = new TextEncoder().encode(str);
  let encoded = '';
  for (const byte of bytes) {
    // 每個byte轉成8個bit，每個bit用一個零寬字符表示
    const b = byte.toString(2).padStart(8, '0');
    for (const bit of b) {
      encoded += ZW_CHARS[bit];
    }
  }
  return encoded;
}

// 從零寬字符解碼
function decodeFromZeroWidth(zwStr) {
  let bits = '';
  for (const char of zwStr) {
    const bit = ZW_REVERSE[char];
    if (bit) bits += bit;
  }
  // 每8bit一組轉成byte
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    const byte = bits.slice(i, i + 8);
    if (byte.length === 8) {
      bytes.push(parseInt(byte, 2));
    }
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

// 發送隱藏訊息（使用 GraphQL 像 IM 功能一樣）
async function sendHiddenMessage(message, visibleMarker = ' ') {
  const encoded = encodeToZeroWidth(message);
  const fullText = visibleMarker + encoded;

  try {
    await sendChatMessage(fullText);
    return true;
  } catch (err) {
    showSendFailureToast(`發送失敗: ${err.message}`);
    return false;
  }
}

// ========= UI: Chat-side button + floating panel =========
const UI = {
  rootId: 'dlsq_root',
  btnId: 'dlsq_btn',
  panelId: 'dlsq_panel',
  styleId: 'dlsq_style_v2',
  ctxMenuId: 'dlsq_ctx_menu',
  panelTagMenuId: 'dlsq_panel_tag_menu',
  failToastId: 'dlsq_fail_overlay',
  tabDLId: 'dlsq_tab_dl',
  tabIMId: 'dlsq_tab_im',
  zoomOverlayId: 'dlsq_zoom_overlay'
};

let panelFilterType = 'all'; // 'all', 'DL', 'IM'
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
      margin-right: 10px;
      user-select: none;
    }
    #${UI.btnId}:hover { background: rgba(28,30,36,0.96); border-color: rgba(120,190,255,0.45); }

    #${UI.panelId} {
      position: fixed;
      right: 16px;
      bottom: 100px;
      width: 384px;
      max-height: 480px;
      overflow: hidden;
      display: none;
      background: rgba(16,18,22,0.98);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      box-shadow: 0 16px 44px rgba(0,0,0,0.55);
      z-index: 2147483647;
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
      height: 72px;
      overflow-y: auto;
      padding: 6px 2px 6px 0;
      flex-shrink: 0;
      align-content: flex-start;
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

    /* ===== Chat Button (聊天室輸入框按鈕) ===== */
    #${UI.btnId} {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      margin: 0 4px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      transition: background 0.15s ease;
    }
    #${UI.btnId}:hover {
      background: rgba(120,190,255,0.2);
    }
    #${UI.btnId} img {
      display: block;
      width: 20px;
      height: 20px;
    }

    /* ===== Right-click context menu (add sticker ID) ===== */
    #${UI.ctxMenuId} {
      position: fixed;
      z-index: 2147483647 !important;
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
      z-index: 2147483647 !important;
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

    /* ===== Image Zoom Overlay ===== */
    #${UI.zoomOverlayId} {
      position: fixed;
      z-index: 1000002;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.85);
      display: none;
      align-items: center;
      justify-content: center;
      cursor: zoom-out;
    }
    #${UI.zoomOverlayId}.open { display: flex; }
    #${UI.zoomOverlayId} .zoom-img {
      max-width: 80vw;
      max-height: 80vh;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), top 0.2s cubic-bezier(0.4, 0, 0.2, 1), left 0.2s cubic-bezier(0.4, 0, 0.2, 1), width 0.2s cubic-bezier(0.4, 0, 0.2, 1), height 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: fixed;
      transform-origin: center center;
    }
    #${UI.zoomOverlayId} .zoom-img.fly-complete {
      transition: none;
    }

    /* ===== DLive Layout Compress Styles ===== */
    .dlsq-donation-hidden {
      display: none !important;
    }
    .dlsq-title-hidden {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      min-height: 0 !important;
      overflow: hidden !important;
    }
    .dlsq-title-hidden-fix1 {
      display: none !important;
    }

    /* ===== Chat Room Control (聊天室控制) ===== */
    .dlsq-chat-narrow {
      width: 160px !important;
      min-width: 160px !important;
      max-width: 160px !important;
    }
    .dlsq-chat-hidden {
      display: none !important;
      width: 0 !important;
      min-width: 0 !important;
    }
    /* Chat Ghost Mode - 半透明只顯示對話 */
    .dlsq-chat-ghost {
      opacity: 0.3 !important;
      transition: none !important;
    }
    .dlsq-chat-ghost:hover {
      opacity: 1 !important;
    }
    .dlsq-chat-ghost .v-stream-chatroom-input,
    .dlsq-chat-ghost .chatroom-top-contributors,
    .dlsq-chat-ghost [class*="top-contributor"] {
      display: none !important;
    }
    .dlsq-chat-ghost .chatroom:hover {
      opacity: 1 !important;
    }

    /* ===== Chat Overlay Mode (聊天室浮動在影片上) ===== */
    .dlsq-chat-overlay {
      position: fixed !important;
      right: 0 !important;
      top: 60px !important;
      height: calc(100vh - 60px) !important;
      width: 393px !important;
      z-index: 1000 !important;
      background: transparent !important;
    }
    .dlsq-chat-overlay .chatroom {
      background: transparent !important;
    }
    .dlsq-chat-overlay:hover {
      background: rgba(0, 0, 0, 0.3) !important;
    }

    /* ===== Sidebar & Nav Bar Control (側邊欄和頂部導航控制) ===== */
    .dlsq-sidebar-hidden {
      display: none !important;
      width: 0 !important;
      min-width: 0 !important;
    }
    .dlsq-navbar-hidden {
      display: none !important;
      height: 0 !important;
      min-height: 0 !important;
      max-height: 0 !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    /* When navbar is hidden, adjust main content to fill viewport */
    .application:has(.dlsq-navbar-hidden),
    #genius:has(.dlsq-navbar-hidden) {
      padding-top: 0 !important;
      margin-top: 0 !important;
    }
    /* Adjust mobile-page when navbar is hidden */
    .application:has(.dlsq-navbar-hidden) .mobile-page,
    #genius:has(.dlsq-navbar-hidden) .mobile-page {
      height: 100vh !important;
      min-height: 100vh !important;
    }
    .dlsq-extra-hidden {
      display: none !important;
    }
    /* Hide Vuetify dialog overlays that block video - disabled as it hides video */
    /* .v-dialog__content { display: none !important; } */
    /* Hide DPlayer gift animations only, keep mask and bezel for controls */
    .dplayer-gifts {
      display: none !important;
      pointer-events: none !important;
    }
    /* NOTE: .dplayer-mask and .dplayer-bezel removed - they are needed for video controls */
    /* About Panel Hidden */
    .dlsq-about-hidden {
      display: none !important;
    }
    /* Video expand mode - make video fill remaining space */
    .dlsq-video-expanded .dplayer,
    .dlsq-video-expanded .dplayer-video-wrap {
      height: auto !important;
      flex: 1 1 auto !important;
    }
    .dlsq-video-expanded .dplayer-video {
      object-fit: cover !important;
    }
    .dlsq-video-expanded .dplayer-video-wrap {
      background: transparent !important;
    }
    /* Remove dark background from application container */
    .dlsq-video-expanded .application,
    .dlsq-video-expanded .application--wrap,
    .dlsq-video-expanded #genius {
      background: transparent !important;
      background-color: transparent !important;
    }
    .dlsq-video-expanded.mobile-page,
    .dlsq-video-expanded .mobile-page {
      height: 100vh !important;
      min-height: 100vh !important;
    }
    /* Remove padding from ancestor containers to eliminate side black bars */
    .dlsq-video-expanded .mobile-page,
    .dlsq-video-expanded .mobile-page > div,
    .dlsq-video-expanded .position-absolute,
    .dlsq-video-expanded .width-100 {
      padding: 0 !important;
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

    const card = document.createElement('div');
    card.className = 'dlsq-fail-card';
    card.setAttribute('role', 'alert');
    card.setAttribute('aria-labelledby', 'dlsq_fail_title');

    const hdr = document.createElement('div');
    hdr.className = 'dlsq-fail-hdr';

    const title = document.createElement('span');
    title.className = 'dlsq-fail-title';
    title.id = 'dlsq_fail_title';
    title.textContent = '貼圖送出失敗';

    const xBtn = document.createElement('button');
    xBtn.type = 'button';
    xBtn.className = 'dlsq-fail-x';
    xBtn.setAttribute('aria-label', '關閉');
    xBtn.textContent = '✕';
    xBtn.addEventListener('click', () => hideSendFailureToast());

    hdr.appendChild(title);
    hdr.appendChild(xBtn);

    const msgDiv = document.createElement('div');
    msgDiv.className = 'dlsq-fail-msg';

    card.appendChild(hdr);
    card.appendChild(msgDiv);
    wrap.appendChild(card);
    document.body.appendChild(wrap);
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
    panelFilterType = 'all';
    panelFilterTag = '__all__';
    refreshPanelStickers();
  }
}

function applyStickerTypeFilter() {
  const grid = document.getElementById(UI.panelId)?.querySelector('.grid');
  if (!grid) return;

  const tiles = grid.querySelectorAll('.tile');
  tiles.forEach(tile => {
    const type = tile.getAttribute('data-type');
    if (panelFilterType === 'all') {
      tile.style.display = '';
    } else if (panelFilterType === 'DL') {
      tile.style.display = type === 'DL' ? '' : 'none';
    } else if (panelFilterType === 'IM') {
      tile.style.display = type === 'IM' ? '' : 'none';
    }
  });
}

async function refreshTagTabs() {
  // 只更新標籤按鈕，不清空重建 grid，避免掉落震動
  const panel = document.getElementById(UI.panelId);
  if (!panel) return;
  const tabs = panel.querySelector('.tabs');
  if (!tabs || !TAG) return;

  const storage = await chrome.storage.local.get(['stickerIdsText', 'stickerTagVocabularyText', 'favoriteStickerIds']);
  const parsed = TAG.parseStickerIdsText(storage.stickerIdsText || '');
  const tabMap = TAG.rowsToIdTagMap(parsed.rows);
  const tabLabels = TAG.sortedTagLabelsForTabs(parsed.rows);

  // 根據當前類型過濾 rows 統計數量
  const isIMId = (id) => id && id.startsWith('IM-');
  const isDLId = (id) => id && (id.startsWith('DL-') || /^[A-Za-z0-9_]+$/.test(id));

  const filteredRows = parsed.rows.filter((r) => {
    if (panelFilterType === 'DL') return isDLId(r.id);
    if (panelFilterType === 'IM') return isIMId(r.id);
    return true;
  });

  // 清空並重建標籤按鈕
  tabs.innerHTML = '';

  const mkTab = (label, value) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `tab${panelFilterTag === value ? ' on' : ''}`;
    b.textContent = label;
    b.title = label;
    b.addEventListener('click', () => {
      panelFilterTag = value;
      // 只更新標籤過濾，不清空重建 grid
      applyTagFilter();
      // 更新按鈕樣式
      tabs.querySelectorAll('.tab').forEach(btn => btn.classList.remove('on'));
      b.classList.add('on');
    });
    tabs.appendChild(b);
  };

  const hiddenKey = PANEL_HIDDEN_TAG.toLowerCase();
  const counts = TAG.tagCountsFromRows(filteredRows);
  const hiddenCount = (filteredRows || []).filter((r) =>
    (r?.tags || []).some((t) => String(t).toLowerCase() === hiddenKey)
  ).length;
  const uncategorizedCount = (filteredRows || []).filter((r) => {
    if ((r?.tags || []).some((t) => String(t).toLowerCase() === hiddenKey)) return false;
    return !r?.tags?.length || r.tags.length === 0;
  }).length;

  mkTab(t('all'), '__all__');
  mkTab(t('uncategorizedTab', uncategorizedCount), PANEL_FILTER_UNCATEGORIZED);

  // 收集當前類型下存在的標籤
  const existingLabels = new Set();
  for (const lab of tabLabels) {
    if (String(lab).toLowerCase() === hiddenKey) continue;
    const c = counts[lab] || 0;
    mkTab(`${lab} (${c})`, lab);
    existingLabels.add(String(lab).toLowerCase());
  }

  // 如果當前選中的標籤不在新類型下，仍然創建一個計數為0的按鈕以保持選中狀態
  const currentTag = panelFilterTag;
  if (currentTag &&
    currentTag !== '__all__' &&
    currentTag !== PANEL_FILTER_HIDDEN &&
    currentTag !== PANEL_FILTER_UNCATEGORIZED &&
    !existingLabels.has(String(currentTag).toLowerCase())) {
    mkTab(`${currentTag} (0)`, currentTag);
  }

  mkTab(t('hiddenTab', hiddenCount), PANEL_FILTER_HIDDEN);
}

// 輕量級標籤過濾：只顯示/隱藏 tile，不清空重建 DOM
async function applyTagFilter() {
  const grid = document.getElementById(UI.panelId)?.querySelector('.grid');
  if (!grid) return;

  const active = panelFilterTag || '__all__';
  const hiddenKey = PANEL_HIDDEN_TAG.toLowerCase();

  // 獲取所有 tile
  const tiles = grid.querySelectorAll('.tile');

  // 如果沒有標籤數據，先加載
  let tagMap = {};
  if (TAG) {
    try {
      const storage = await chrome.storage.local.get(['stickerIdsText']);
      const parsed = TAG.parseStickerIdsText(storage.stickerIdsText || '');
      tagMap = TAG.rowsToIdTagMap(parsed.rows);
    } catch (e) {
      // 忽略錯誤
    }
  }

  tiles.forEach(tile => {
    const code = tile.getAttribute('data-code');
    const sid = tile.getAttribute('data-id');
    if (!code || !sid) {
      tile.style.display = 'none';
      return;
    }

    // 先檢查 DL/IM 類型過濾
    const type = tile.getAttribute('data-type');
    if (panelFilterType === 'DL' && type !== 'DL') {
      tile.style.display = 'none';
      return;
    }
    if (panelFilterType === 'IM' && type !== 'IM') {
      tile.style.display = 'none';
      return;
    }

    // 再檢查標籤過濾
    const tags = tagMap[sid] || [];
    const isHidden = tags.some((t) => String(t).toLowerCase() === hiddenKey);

    if (active === '__all__') {
      tile.style.display = isHidden ? 'none' : '';
    } else if (active === PANEL_FILTER_HIDDEN) {
      tile.style.display = isHidden ? '' : 'none';
    } else if (active === PANEL_FILTER_UNCATEGORIZED) {
      tile.style.display = (!isHidden && tags.length === 0) ? '' : 'none';
    } else {
      const key = String(active).toLowerCase();
      const hasTag = tags.some((t) => String(t).toLowerCase() === key);
      tile.style.display = (!isHidden && hasTag) ? '' : 'none';
    }
  });
}

function createPanelIfNeeded() {
  if (document.getElementById(UI.panelId)) return;
  ensureStyles();
  const panel = document.createElement('div');
  panel.id = UI.panelId;
  const hdr = document.createElement('div');
  hdr.className = 'hdr';

  // 左側：標題
  const title = document.createElement('div');
  title.textContent = 'GSS';

  // 中間：DL/IM 切換 Tab
  const tabsContainer = document.createElement('div');
  tabsContainer.style.display = 'flex';
  tabsContainer.style.gap = '6px';
  tabsContainer.style.alignItems = 'center';
  tabsContainer.style.marginLeft = 'auto';
  tabsContainer.style.marginRight = '12px';

  const tabAll = document.createElement('button');
  tabAll.id = 'dlsq_tab_all';
  tabAll.textContent = t('all');
  tabAll.style.padding = '3px 8px';
  tabAll.style.borderRadius = '6px';
  tabAll.style.border = '1px solid rgba(255,255,255,0.14)';
  tabAll.style.background = 'rgba(120,190,255,0.22)';
  tabAll.style.color = 'rgba(255,255,255,0.96)';
  tabAll.style.fontSize = '10px';
  tabAll.style.cursor = 'pointer';
  tabAll.style.fontWeight = '600';
  tabAll.addEventListener('click', async () => {
    panelFilterType = 'all';
    updatePanelTypeTabs();
    await refreshTagTabs();
    applyTagFilter();
  });

  const tabDL = document.createElement('button');
  tabDL.id = UI.tabDLId;
  tabDL.textContent = 'DL';
  tabDL.style.padding = '3px 8px';
  tabDL.style.borderRadius = '6px';
  tabDL.style.border = '1px solid rgba(255,255,255,0.14)';
  tabDL.style.background = 'rgba(10,12,16,0.88)';
  tabDL.style.color = 'rgba(255,255,255,0.88)';
  tabDL.style.fontSize = '10px';
  tabDL.style.cursor = 'pointer';
  tabDL.style.fontWeight = '600';
  tabDL.addEventListener('click', async () => {
    panelFilterType = 'DL';
    updatePanelTypeTabs();
    await refreshTagTabs();
    applyTagFilter();
  });

  const tabIM = document.createElement('button');
  tabIM.id = UI.tabIMId;
  tabIM.textContent = 'IM';
  tabIM.style.padding = '3px 8px';
  tabIM.style.borderRadius = '6px';
  tabIM.style.border = '1px solid rgba(255,255,255,0.14)';
  tabIM.style.background = 'rgba(10,12,16,0.88)';
  tabIM.style.color = 'rgba(255,255,255,0.88)';
  tabIM.style.fontSize = '10px';
  tabIM.style.cursor = 'pointer';
  tabIM.style.fontWeight = '600';
  tabIM.addEventListener('click', async () => {
    panelFilterType = 'IM';
    updatePanelTypeTabs();
    await refreshTagTabs();
    applyTagFilter();
  });

  tabsContainer.appendChild(tabAll);
  tabsContainer.appendChild(tabDL);
  tabsContainer.appendChild(tabIM);

  // 右側：關閉按鈕
  const closeBtn = document.createElement('div');
  closeBtn.className = 'close';
  closeBtn.title = 'Close';
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', () => togglePanel(false));

  hdr.appendChild(title);
  hdr.appendChild(tabsContainer);
  hdr.appendChild(closeBtn);

  const body = document.createElement('div');
  body.className = 'body';
  const tabs = document.createElement('div');
  tabs.className = 'tabs';
  const grid = document.createElement('div');
  grid.className = 'grid';

  // 【已刪除視頻控制區域按鈕】

  // 標籤分類區域

  const status = document.createElement('div');
  status.className = 'status';
  body.appendChild(tabs);
  body.appendChild(grid);
  body.appendChild(status);
  panel.appendChild(hdr);
  panel.appendChild(body);
  document.body.appendChild(panel);
}

function updatePanelTypeTabs() {
  const tabAll = document.getElementById('dlsq_tab_all');
  const tabDL = document.getElementById(UI.tabDLId);
  const tabIM = document.getElementById(UI.tabIMId);
  if (!tabAll || !tabDL || !tabIM) return;

  // 重置所有樣式
  const inactiveStyle = {
    background: 'rgba(10,12,16,0.88)',
    color: 'rgba(255,255,255,0.88)'
  };
  const activeStyle = {
    background: 'rgba(120,190,255,0.22)',
    color: 'rgba(255,255,255,0.96)'
  };

  // 全部
  if (panelFilterType === 'all') {
    tabAll.style.background = activeStyle.background;
    tabAll.style.color = activeStyle.color;
  } else {
    tabAll.style.background = inactiveStyle.background;
    tabAll.style.color = inactiveStyle.color;
  }

  // DL
  if (panelFilterType === 'DL') {
    tabDL.style.background = activeStyle.background;
    tabDL.style.color = activeStyle.color;
  } else {
    tabDL.style.background = inactiveStyle.background;
    tabDL.style.color = inactiveStyle.color;
  }

  // IM
  if (panelFilterType === 'IM') {
    tabIM.style.background = activeStyle.background;
    tabIM.style.color = activeStyle.color;
  } else {
    tabIM.style.background = inactiveStyle.background;
    tabIM.style.color = inactiveStyle.color;
  }
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

  const zoomDiv = menu.querySelector('[data-action="zoomImage"] > div:first-child');
  if (zoomDiv) zoomDiv.textContent = t('zoomImage');

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

  const mkItem = (action, icon) => {
    const item = document.createElement('div');
    item.className = 'item';
    item.setAttribute('data-action', action);
    const labelDiv = document.createElement('div');
    if (action === 'toggleFavorite') labelDiv.setAttribute('data-label', 'fav');
    const iconDiv = document.createElement('div');
    iconDiv.style.opacity = '0.65';
    iconDiv.textContent = icon;
    item.appendChild(labelDiv);
    item.appendChild(iconDiv);
    return item;
  };

  menu.appendChild(mkItem('addStickerId', '＋'));
  menu.appendChild(mkItem('toggleFavorite', '★'));
  menu.appendChild(mkItem('toggleHidden', '👁️'));
  menu.appendChild(mkItem('zoomImage', '🔍'));
  menu.appendChild(mkItem('openTagMenu', '>'));

  const sub = document.createElement('div');
  sub.className = 'sub';
  sub.setAttribute('data-sub', 'id');
  menu.appendChild(sub);

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
      } else if (action === 'zoomImage') {
        hideContextMenu();
        // 使用右鍵點擊時記錄的目標元素
        const targetEl = lastRightClickTarget;
        if (targetEl) {
          const isVideo = targetEl.tagName === 'VIDEO';
          showZoomOverlay({ element: targetEl, isVideo });
        }
        return;
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
    suppressTileClickFor(300);
    suppressPanelAutoCloseFor(300);
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
    suppressTileClickFor(300);
    suppressPanelAutoCloseFor(300);
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

function hideZoomOverlay() {
  const overlay = document.getElementById(UI.zoomOverlayId);
  if (!overlay) return;
  overlay.classList.remove('open');
  const img = overlay.querySelector('.zoom-img');
  if (img) img.remove();
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

function findEmoteImageById(id) {
  // 處理 IM 類型：移除 IM- 前綴來比對 imgur URL
  const isIM = id && id.startsWith('IM-');
  const searchId = isIM ? id.slice(3) : id;

  // 搜尋 img 元素
  const imgs = document.querySelectorAll('img');
  for (const img of imgs) {
    const src = img.src || '';
    if (src.includes(id) || (!isIM && src.includes(id.replace('DL-', '')))) {
      return { element: img, isVideo: false };
    }
    // 對於 IM 類型，比對不含前綴的 ID
    if (isIM && src.includes(searchId)) {
      return { element: img, isVideo: false };
    }
  }

  // 對於 IM mp4，搜尋 video 元素
  if (isIM) {
    const videos = document.querySelectorAll('video');
    for (const video of videos) {
      const src = video.src || video.currentSrc || '';
      if (src.includes(searchId)) {
        return { element: video, isVideo: true };
      }
    }
  }

  return null;
}

function showZoomOverlay(sourceObj) {
  ensureStyles();
  let overlay = document.getElementById(UI.zoomOverlayId);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = UI.zoomOverlayId;
    overlay.addEventListener('click', hideZoomOverlay);
    document.body.appendChild(overlay);
  }

  const sourceEl = sourceObj.element;
  const isVideo = sourceObj.isVideo;

  // 取得原始圖片位置
  const rect = sourceEl.getBoundingClientRect();
  const startX = rect.left;
  const startY = rect.top;
  const startW = rect.width;
  const startH = rect.height;

  // 建立放大元素（圖片或影片）
  let zoomEl;
  if (isVideo) {
    zoomEl = document.createElement('video');
    zoomEl.className = 'zoom-img';
    zoomEl.src = sourceEl.src || sourceEl.currentSrc;
    zoomEl.muted = true;
    zoomEl.autoplay = true;
    zoomEl.loop = true;
    zoomEl.playsInline = true;
  } else {
    zoomEl = document.createElement('img');
    zoomEl.className = 'zoom-img';
    zoomEl.src = sourceEl.src;
  }
  zoomEl.style.left = `${startX}px`;
  zoomEl.style.top = `${startY}px`;
  zoomEl.style.width = `${startW}px`;
  zoomEl.style.height = `${startH}px`;
  zoomEl.style.transform = 'scale(1)';

  overlay.innerHTML = '';
  overlay.appendChild(zoomEl);
  overlay.classList.add('open');

  // 強制 reflow 確保動畫生效
  void zoomEl.offsetWidth;

  // 計算目標位置（畫面中央）
  const targetW = Math.min(320, window.innerWidth * 0.8);
  const targetH = Math.min(320, window.innerHeight * 0.8);
  const targetX = (window.innerWidth - targetW) / 2;
  const targetY = (window.innerHeight - targetH) / 2;

  // 觸發動畫
  requestAnimationFrame(() => {
    zoomEl.style.left = `${targetX}px`;
    zoomEl.style.top = `${targetY}px`;
    zoomEl.style.width = `${targetW}px`;
    zoomEl.style.height = `${targetH}px`;
  });
}


function createPanelTagMenuIfNeeded() {
  if (document.getElementById(UI.panelTagMenuId)) return;
  ensureStyles();
  const menu = document.createElement('div');
  menu.id = UI.panelTagMenuId;

  const sub = document.createElement('div');
  sub.className = 'sub';
  sub.setAttribute('data-panel-tag-sub', '');

  const list = document.createElement('div');
  list.className = 'tag-block-list';
  list.setAttribute('data-panel-tag-list', '');

  menu.appendChild(sub);
  menu.appendChild(list);

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
      const item = document.createElement('div');
      item.className = 'item';
      item.style.cursor = 'default';
      item.style.opacity = '0.65';
      item.textContent = t('notInListMsg');
      list.appendChild(item);
    } else if (!vocab.length) {
      const item = document.createElement('div');
      item.className = 'item';
      item.style.cursor = 'default';
      item.style.opacity = '0.65';
      item.textContent = t('emptyVocabMsg');
      list.appendChild(item);
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

let lastRightClickTarget = null;

function showContextMenuAt(x, y, id, targetElement) {
  createContextMenuIfNeeded();
  const menu = document.getElementById(UI.ctxMenuId);
  if (!menu) return;

  menu.setAttribute('data-id', id);
  // 記錄右鍵點擊的目標元素，供放大功能使用
  lastRightClickTarget = targetElement || null;

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

    const zoomBtn = menu.querySelector('[data-action="zoomImage"] > div:first-child');
    if (zoomBtn) zoomBtn.textContent = t('zoomImage');
  };

  const placeMenu = () => {
    // 將選單移到正確的容器末端，確保層級在最上層
    // 在全螢幕模式下，需要附加到全螢幕元素而非 body
    const fullscreenEl = document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;
    const targetParent = fullscreenEl || document.body;

    if (menu.parentNode !== targetParent) {
      targetParent.appendChild(menu);
    } else {
      targetParent.appendChild(menu); // 重新附加到末端
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

  // Imgur 圖片 URL：i.imgur.com/xxx.gif → IM-xxx.gif
  const imgurMatch = s.match(/i\.imgur\.com\/([a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4))/i);
  if (imgurMatch) {
    return `IM-${imgurMatch[1]}`;
  }

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
    const rows = [];
    for (const line of lines) {
      const parts = line.split(/\s+/).filter(Boolean);
      if (!parts.length) continue;
      const rawId = parts[0];
      // 自動轉換舊 ID 格式（加 DL- 前綴）
      const id = rawId.startsWith('DL-') ? rawId : `DL-${rawId}`;
      // 驗證 ID 格式（支援 DL- 前綴）
      if (!/^(?:DL-)?[A-Za-z0-9_]+$/.test(id)) continue;
      const tags = parts.slice(1).filter(p => p.startsWith('#')).map(p => p.slice(1));
      rows.push({ id, tags });
    }
    return rows;
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
  let trimmed = String(id || '').trim();

  // IM 格式：將 -gif, -png, -jpg, -jpeg, -mp4 結尾替換為 . 點格式
  if (trimmed.startsWith('IM-')) {
    trimmed = trimmed.replace(/-(gif|png|jpg|jpeg|mp4)$/i, '.$1');
  }

  // 支援 DL- 前綴（DLive 貼圖）和 IM- 前綴（Imgur 圖片）
  const isValidDL = /^(?:DL-)?[A-Za-z0-9_]+$/.test(trimmed);
  const isValidIM = /^IM-[a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4)$/i.test(trimmed);
  if (!isValidDL && !isValidIM) {
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
  let trimmed = String(id || '').trim();

  // IM 格式：將 -gif, -png, -jpg, -jpeg, -mp4 結尾替換為 . 點格式
  if (trimmed.startsWith('IM-')) {
    trimmed = trimmed.replace(/-(gif|png|jpg|jpeg|mp4)$/i, '.$1');
  }

  // 支援 DL- 前綴（DLive 貼圖）和 IM- 前綴（Imgur 圖片）
  const isValidDL = /^(?:DL-)?[A-Za-z0-9_]+$/.test(trimmed);
  const isValidIM = /^IM-[a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4)$/i.test(trimmed);
  if (!isValidDL && !isValidIM) {
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
  let trimmed = String(id || '').trim();

  // IM 格式：將 -gif, -png, -jpg, -jpeg, -mp4 結尾替換為 . 點格式
  if (trimmed.startsWith('IM-')) {
    trimmed = trimmed.replace(/-(gif|png|jpg|jpeg|mp4)$/i, '.$1');
  }

  // 支援 DL- 前綴（DLive 貼圖）和 IM- 前綴（Imgur 圖片）
  const isValidDL = /^(?:DL-)?[A-Za-z0-9_]+$/.test(trimmed);
  const isValidIM = /^IM-[a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4)$/i.test(trimmed);
  if (!isValidDL && !isValidIM) {
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
  let trimmed = String(id || '').trim();

  // IM 格式：將 -gif, -png, -jpg, -jpeg, -mp4 結尾替換為 . 點格式
  if (trimmed.startsWith('IM-')) {
    trimmed = trimmed.replace(/-(gif|png|jpg|jpeg|mp4)$/i, '.$1');
  }

  // 支援 DL- 前綴（DLive 貼圖）和 IM- 前綴（Imgur 圖片）
  const isValidDL = /^(?:DL-)?[A-Za-z0-9_]+$/.test(trimmed);
  const isValidIM = /^IM-[a-zA-Z0-9-]+\.(?:gif|png|jpg|jpeg|mp4)$/i.test(trimmed);
  if (!isValidDL && !isValidIM) {
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
    // Failed to load stickers from storage
    return getDefaultStickers();
  }
}

async function refreshPanelStickers() {
  createPanelIfNeeded();
  updatePanelTypeTabs(); // 更新 DL/IM 切換按鈕樣式
  const refreshSeq = ++panelRefreshSeq;
  const panel = document.getElementById(UI.panelId);
  const tabs = panel.querySelector('.tabs');
  const grid = panel.querySelector('.grid');
  grid.innerHTML = '';
  if (tabs) tabs.innerHTML = '';
  setPanelStatus(t('loading'));

  let storage;
  try {
    storage = await chrome.storage.local.get(['favoriteStickerIds', 'stickerIdsText', 'stickerTagVocabularyText']);
  } catch (e) {
    // Extension context invalidated - 擴充重新載入後無法使用 storage
    setPanelStatus('❌ 擴充已更新，請重新整理頁面', '#dc3545');
    return;
  }
  if (refreshSeq !== panelRefreshSeq) return;
  const favSet = new Set(Array.isArray(storage.favoriteStickerIds) ? storage.favoriteStickerIds : []);

  let tagMap = {};
  let tabLabels = [];
  let parsedRows = [];
  if (TAG) {
    parsedRows = TAG.parseStickerIdsText(storage.stickerIdsText || '').rows;
    tagMap = TAG.rowsToIdTagMap(parsedRows);
    tabLabels = TAG.sortedTagLabelsForTabs(parsedRows);
  }
  if (refreshSeq !== panelRefreshSeq) return;

  // 從 rows 創建混合 DL/IM 的 stickers
  let stickers = parsedRows.map((row, index) => {
    const id = row.id;
    if (id.startsWith('IM-')) {
      const idWithExt = id.slice(3);
      const isVideo = /\.mp4$/i.test(idWithExt);
      return {
        name: `LID ${index + 1}`,
        code: id,
        imageUrl: `https://i.imgur.com/${idWithExt}`,
        isVideo: isVideo,
        isIM: true
      };
    } else {
      // DL 類型
      const cleanId = id.startsWith('DL-') ? id.slice(3) : id;
      return {
        name: `LID ${index + 1}`,
        code: `:emote/mine/dlive/${cleanId}:`,
        imageUrl: `https://images.prd.dlivecdn.com/emote/${cleanId}`
      };
    }
  });

  // 保存全部贴图（用于创建 DOM）
  const allStickers = stickers.slice();

  // 使用總數固定面板高度（讓 DL/IM/全部 切換時大小一致）
  const totalStickerCount = stickers.length;
  applyStableGridHeight(grid, totalStickerCount);

  // 根據 panelFilterType 過濾類型（僅用於標籤統計，不改變 allStickers）
  let filteredForTags = allStickers;
  if (panelFilterType === 'DL') {
    filteredForTags = allStickers.filter(s => !s.isIM);
  } else if (panelFilterType === 'IM') {
    filteredForTags = allStickers.filter(s => s.isIM);
  }

  if (tabs && TAG) {
    // 根據當前類型過濾 rows 統計數量
    const isIMId = (id) => id && id.startsWith('IM-');
    const isDLId = (id) => id && (id.startsWith('DL-') || /^[A-Za-z0-9_]+$/.test(id));

    const filteredRows = parsedRows.filter((r) => {
      if (panelFilterType === 'DL') return isDLId(r.id);
      if (panelFilterType === 'IM') return isIMId(r.id);
      return true; // 全部
    });

    // 為標籤統計，也過濾 sticker 對象以匹配
    const stickerIdsInFilteredRows = new Set(filteredRows.map(r => r.id));
    const filteredStickersForTagCounts = allStickers.filter(s => {
      const sid = s.code?.startsWith('IM-') ? s.code : (String(s.code).match(/^:emote\/mine\/dlive\/([A-Za-z0-9_]+):$/) ? `DL-${RegExp.$1}` : null);
      return sid && stickerIdsInFilteredRows.has(sid);
    });

    const mkTab = (label, value) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `tab${panelFilterTag === value ? ' on' : ''}`;
      b.textContent = label;
      b.title = label;
      b.addEventListener('click', () => {
        panelFilterTag = value;
        // 只更新標籤過濾，不清空重建 grid
        applyTagFilter();
        // 更新按鈕樣式
        tabs.querySelectorAll('.tab').forEach(btn => btn.classList.remove('on'));
        b.classList.add('on');
      });
      tabs.appendChild(b);
    };
    mkTab(t('all'), '__all__');
    const counts = TAG.tagCountsFromRows(filteredRows);
    const hiddenKey = PANEL_HIDDEN_TAG.toLowerCase();
    const hiddenCount = (filteredRows || []).filter((r) =>
      (r?.tags || []).some((t) => String(t).toLowerCase() === hiddenKey)
    ).length;
    // Count stickers with no tags (excluding hidden ones)
    const uncategorizedCount = (filteredRows || []).filter((r) => {
      if ((r?.tags || []).some((t) => String(t).toLowerCase() === hiddenKey)) return false;
      return !r?.tags?.length || r.tags.length === 0;
    }).length;
    mkTab(t('uncategorizedTab', uncategorizedCount), PANEL_FILTER_UNCATEGORIZED);

    // 收集當前類型下存在的標籤
    const existingLabels = new Set();
    for (const lab of tabLabels) {
      if (String(lab).toLowerCase() === hiddenKey) continue;
      const c = counts[lab] || 0;
      mkTab(`${lab} (${c})`, lab);
      existingLabels.add(String(lab).toLowerCase());
    }

    // 如果當前選中的標籤不在新類型下，仍然創建一個計數為0的按鈕以保持選中狀態
    const currentTag = panelFilterTag;
    if (currentTag &&
      currentTag !== '__all__' &&
      currentTag !== PANEL_FILTER_HIDDEN &&
      currentTag !== PANEL_FILTER_UNCATEGORIZED &&
      !existingLabels.has(String(currentTag).toLowerCase())) {
      mkTab(`${currentTag} (0)`, currentTag);
    }

    mkTab(t('hiddenTab', hiddenCount), PANEL_FILTER_HIDDEN);
  }

  const active = panelFilterTag || '__all__';

  // 決定要渲染的貼圖：先用標籤過濾，再應用 DL/IM 過濾
  let stickersToRender = allStickers;

  if (TAG) {
    const hiddenKey = PANEL_HIDDEN_TAG.toLowerCase();
    // 獲取 ID 函數（支援 DL 和 IM）
    const getId = (s) => {
      const code = String(s?.code || '');
      // DL 格式
      const dlMatch = code.match(/^:emote\/mine\/dlive\/([A-Za-z0-9_]+):$/);
      if (dlMatch) return `DL-${dlMatch[1]}`;
      // IM 格式
      if (code.startsWith('IM-')) return code;
      return null;
    };
    const isHidden = (sid) => {
      if (!sid) return false;
      const ts = tagMap[sid] || [];
      return ts.some((t) => String(t).toLowerCase() === hiddenKey);
    };

    if (active === '__all__') {
      stickersToRender = stickersToRender.filter((s) => !isHidden(getId(s)));
    } else if (active === PANEL_FILTER_HIDDEN) {
      stickersToRender = stickersToRender.filter((s) => isHidden(getId(s)));
    } else if (active === PANEL_FILTER_UNCATEGORIZED) {
      stickersToRender = stickersToRender.filter((s) => {
        const sid = getId(s);
        if (!sid || isHidden(sid)) return false;
        const ts = tagMap[sid] || [];
        return ts.length === 0;
      });
    } else {
      const key = String(active).toLowerCase();
      stickersToRender = stickersToRender.filter((s) => {
        const sid = getId(s);
        if (!sid || isHidden(sid)) return false;
        const ts = tagMap[sid] || [];
        return ts.some((t) => String(t).toLowerCase() === key);
      });
    }
  }

  // 應用 DL/IM 過濾
  if (panelFilterType === 'DL') {
    stickersToRender = stickersToRender.filter(s => !s.isIM);
  } else if (panelFilterType === 'IM') {
    stickersToRender = stickersToRender.filter(s => s.isIM);
  }

  if (refreshSeq !== panelRefreshSeq) return;

  // 常用置頂排序
  stickersToRender.sort((a, b) => {
    const ida = a.code?.startsWith('IM-') ? a.code : (String(a.code).match(/^:emote\/mine\/dlive\/([A-Za-z0-9_]+):$/) ? `DL-${RegExp.$1}` : null);
    const idb = b.code?.startsWith('IM-') ? b.code : (String(b.code).match(/^:emote\/mine\/dlive\/([A-Za-z0-9_]+):$/) ? `DL-${RegExp.$1}` : null);
    const fa = ida && favSet.has(ida) ? 1 : 0;
    const fb = idb && favSet.has(idb) ? 1 : 0;
    return fb - fa;
  });

  setPanelStatus('');

  for (const s of stickersToRender) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.classList.add(s.isIM ? 'type-im' : 'type-dl');
    tile.setAttribute('data-type', s.isIM ? 'IM' : 'DL');
    tile.setAttribute('data-code', s.code);
    tile.title = s.name || '';

    // 取得 ID 用於常用標記和標籤存儲
    const sid = s.code?.startsWith('IM-') ? s.code : (String(s.code).match(/^:emote\/mine\/dlive\/([A-Za-z0-9_]+):$/) ? `DL-${RegExp.$1}` : null);
    if (sid) {
      tile.setAttribute('data-id', sid);
      // 存儲標籤信息供輕量級過濾使用
      const tags = tagMap[sid] || [];
      if (tags.length > 0) {
        tile.setAttribute('data-tags', tags.join(','));
      }
    }
    if (sid && favSet.has(sid)) tile.classList.add('favored');

    const favMark = document.createElement('div');
    favMark.className = 'fav';
    favMark.textContent = '★';
    tile.appendChild(favMark);

    // 顯示圖片或視頻
    if (s.isVideo) {
      const video = document.createElement('video');
      video.src = s.imageUrl;
      video.style.maxWidth = '48px';
      video.style.maxHeight = '48px';
      video.style.pointerEvents = 'none'; // 防止視頻阻擋點擊
      video.muted = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.onerror = () => {
        const fallback = document.createElement('div');
        fallback.className = 'fallback';
        fallback.textContent = s.name || 'video';
        tile.appendChild(fallback);
      };
      tile.appendChild(video);
    } else if (s.imageUrl) {
      const img = document.createElement('img');
      img.src = s.imageUrl;
      img.alt = s.name || '';
      img.onerror = () => {
        const fallback = document.createElement('div');
        fallback.className = 'fallback';
        fallback.textContent = s.name || 'sticker';
        tile.appendChild(fallback);
      };
      tile.appendChild(img);
    } else {
      const fallback = document.createElement('div');
      fallback.className = 'fallback';
      fallback.textContent = s.name || 'sticker';
      tile.appendChild(fallback);
    }

    // 右鍵選單（支援 DL 和 IM 類型）
    if (sid) {
      tile.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showPanelTagMenuAt(e.clientX, e.clientY, sid);
      });
    }

    // 點擊發送
    tile.addEventListener('click', () => {
      if (isTileClickSuppressed()) return;
      // 檢查當前是否可見（過濾後的）
      if (tile.style.display === 'none') return;
      const code = s.code;
      togglePanel(false);

      // 在 Twitch 上，DL/IM 都直接發送明文 ID；在 DLive 上，DL 直接發送，IM 使用零寬編碼
      if (s.isIM && isDLive()) {
        // 只在 DLive 使用零寬編碼
        sendHiddenMessage(code).catch((e) => {
          showSendFailureToast(e?.message || e);
        });
      } else {
        // Twitch 或 DLive 的 DL：直接發送
        let sendCode = code;
        if (isTwitch() && code.startsWith(':emote/mine/dlive/')) {
          // 從 :emote/mine/dlive/xxx: 提取 ID 並轉換為 DL-xxx
          const match = code.match(/:emote\/mine\/dlive\/([a-zA-Z0-9_]+):/);
          if (match) {
            sendCode = `DL-${match[1]}`;
          }
        } else if (isTwitch() && code.startsWith('IM-')) {
          // 【Twitch 格式】IM-xxx.gif → IM-xxx-gif（用 - 代替 .）
          sendCode = code.replace(/\.(gif|png|jpg|jpeg|mp4)$/i, '-$1');
        }
        sendChatMessage(sendCode).catch((e) => {
          showSendFailureToast(e?.message || e);
        });
      }
    });

    grid.appendChild(tile);

    // 如果不在當前過濾結果中，立即隱藏
    const shouldShow = stickersToRender.some(sr => sr.code === s.code);
    if (!shouldShow) {
      tile.style.display = 'none';
    }
  }

  // 應用 DL/IM 類型過濾（切換時無閃爍）
  applyStickerTypeFilter();
}

function findChatContainer() {
  // DLive: .chatroom-input
  // Twitch: 需要找到包含輸入框和表情按鈕的容器
  const selectors = [
    '.chatroom-input',                           // DLive
    '[data-a-target="chat-input-container"]',   // Twitch
    '.chat-input__container',                    // Twitch alternate
    '.chat-input-container',                     // Twitch alternate
    '.chat-input__textarea',                     // Twitch textarea container
    '[class*="chat-input"]',                      // Generic fallback
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      return el;
    }
  }
  return null;
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
    btn.title = 'GSS 通用貼圖系統';
    const iconImg = document.createElement('img');
    iconImg.src = chrome.runtime.getURL('icons/icon16.png');
    iconImg.style.width = '24px';
    iconImg.style.height = '24px';
    iconImg.style.display = 'block';
    btn.appendChild(iconImg);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      togglePanel();
    });

    // 根據平台調整按鈕插入位置
    if (isTwitch()) {
      // 查找笑臉表情按鈕
      const emojiBtn = document.querySelector('[data-a-target="emote-picker-button"]');

      if (emojiBtn) {
        // 找到笑臉按鈕的父容器（div.bkOPih 或類似的容器）
        let container = emojiBtn.parentElement;

        // 如果父容器存在，直接在其中插入
        if (container) {
          // 設置按鈕樣式
          btn.style.cssText = '';
          btn.style.background = 'transparent';
          btn.style.border = 'none';
          btn.style.cursor = 'pointer';
          btn.style.padding = '4px';
          btn.style.marginLeft = '4px';
          btn.style.width = '30px';
          btn.style.height = '30px';
          btn.style.display = 'inline-flex';
          btn.style.alignItems = 'center';
          btn.style.justifyContent = 'center';
          btn.style.verticalAlign = 'middle';

          // 插入到笑臉按鈕之後
          emojiBtn.after(btn);
        }
      }
    } else {
      // DLive: 直接附加到聊天輸入框
      chat.appendChild(btn);
    }
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
    showContextMenuAt(e.clientX, e.clientY, id, e.target);
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
      hideZoomOverlay();
    }
  });

  // storage 更新時即時刷新
  try {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local') return;
      if (!changes.stickers && !changes.stickerIdsText && !changes.favoriteStickerIds && !changes.stickerTagVocabularyText) return;
      const panel = document.getElementById(UI.panelId);
      if (panel?.classList.contains('open')) {
        refreshPanelStickers().catch(() => {
          // Extension context invalidated, ignore
        });
      }
    });
  } catch (e) {
    // Extension context invalidated, ignore
  }
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

async function sendChatMessage(message, retries = 2) {
  // 根據平台使用不同的發送方式
  if (isTwitch()) {
    return await sendTwitchChatMessage(message);
  }

  // DLive 原有的發送邏輯
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

  let lastErr = null;
  for (let i = 0; i <= retries; i++) {
    try {
      const data = await gqlRequest(payload);
      const errCode = data?.sendStreamchatMessage?.err?.code;
      if (errCode) {
        // 某些錯誤不需要重試
        if (errCode === 'RATE_LIMIT' || errCode === 'BANNED' || errCode === 'CHAT_FROZEN') {
          const err = new Error(`發送被拒絕: ${errCode}`);
          err.code = errCode;
          throw err;
        }
        if (i < retries) {
          await sleep(300 + i * 200);
          continue;
        }
        const err = new Error(`發送失敗: ${errCode}`);
        err.code = errCode;
        throw err;
      }
      return data?.sendStreamchatMessage?.message?.id || true;
    } catch (e) {
      lastErr = e;
      // 網路錯誤或 token 問題才重試
      if ((e.code === 'HTTP_ERROR' || e.code === 'NO_TOKEN') && i < retries) {
        await sleep(500 + i * 300);
        continue;
      }
      throw e;
    }
  }
  throw lastErr || new Error('發送失敗');
}

// Twitch 聊天發送功能 - 只填充輸入框，不自動發送（避免 React DOM 衝突）
// 【最保守策略】只觸發事件，讓 React 自己處理 DOM 更新
async function sendTwitchChatMessage(message) {
  // 【關鍵保護】設置標誌，暫停 IM 轉圖掃描
  isSendingMessage = true;

  try {
    // 找到 Twitch 的聊天輸入框
    const chatInput = document.querySelector('[data-a-target="chat-input"], .chat-wysiwyg-input__editor, [contenteditable="true"]');

    if (!chatInput) {
      throw new Error('找不到 Twitch 聊天輸入框');
    }

    // 聚焦輸入框
    chatInput.focus();

    // 【關鍵】觸發 beforeinput 事件，讓 React 準備接收輸入
    const beforeInput = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: message
    });
    chatInput.dispatchEvent(beforeInput);

    // 【關鍵】使用 execCommand 讓瀏覽器處理插入，React 應該能正確響應
    const success = document.execCommand('insertText', false, message);

    if (!success) {
      // execCommand 失敗，嘗試另一種方式：創建一個臨時的 paste 事件
      try {
        const dt = new DataTransfer();
        dt.setData('text/plain', message);
        const pasteEvent = new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: dt
        });
        chatInput.dispatchEvent(pasteEvent);
      } catch (e) {
        // 忽略錯誤
      }
    }

    // 【關鍵】觸發 input 事件，通知 React 值已改變
    const inputEvent = new InputEvent('input', {
      bubbles: true,
      inputType: 'insertText',
      data: message
    });
    chatInput.dispatchEvent(inputEvent);

    // 觸發 change 事件（某些 React 組件會監聽）
    chatInput.dispatchEvent(new Event('change', { bubbles: true }));

    // 不自動發送，讓用戶手動按 Enter
    return true;
  } finally {
    // 【關鍵保護】延遲清除標誌
    setTimeout(() => {
      isSendingMessage = false;
    }, 500);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 處理來自 popup 的 DLive 控制命令
  if (request.type === 'DLIVE_CONTROL') {
    handleDliveControlCommand(request.command, sendResponse);
    return true; // 讓 sendResponse 可以 async
  }

  if (request.action !== 'sendSticker') return;

  (async () => {
    const id = await sendChatMessage(request.code);
    sendResponse({ ok: true, id });
  })().catch((e) => {
    showSendFailureToast(e?.message || e);
    sendResponse({ ok: false, error: String(e?.message || e), code: e?.code || null });
  });

  // 讓 sendResponse 可以 async
  return true;
});

// ==================== 平台檢測 ====================
function getCurrentPlatform() {
  const hostname = window.location.hostname;
  if (hostname.includes('twitch.tv')) return 'twitch';
  if (hostname.includes('dlive.tv')) return 'dlive';
  return 'unknown';
}

function isDLive() {
  return getCurrentPlatform() === 'dlive';
}

function isTwitch() {
  return getCurrentPlatform() === 'twitch';
}

// ==================== DLive 控制命令處理器 ====================
function handleDliveControlCommand(command, sendResponse) {
  // Twitch 平台不支援 UI 調整功能（Twitch 劇院模式已經做得很好）
  if (isTwitch()) {
    sendResponse({ success: false, message: 'ℹ️ Twitch 平台不支援畫面調整功能' });
    return;
  }

  try {
    switch (command) {
      // 元素控制
      case 'toggleDonation': {
        const donationArea = findDonationArea();
        if (!donationArea) {
          sendResponse({ success: false, message: '❌ 找不到課金區' });
          return;
        }
        donationArea.classList.toggle('dlsq-donation-hidden');
        const isHidden = donationArea.classList.contains('dlsq-donation-hidden');
        sendResponse({ success: true, message: isHidden ? '✅ 已隱藏課金區' : '已顯示課金區', active: isHidden });
        break;
      }

      case 'toggleTitleFix1': {
        const titleAreaFix1 = findTitleArea();
        if (!titleAreaFix1) {
          sendResponse({ success: false, message: '❌ 找不到標題區' });
          return;
        }
        titleAreaFix1.classList.toggle('dlsq-title-hidden-fix1');
        const isHiddenFix1 = titleAreaFix1.classList.contains('dlsq-title-hidden-fix1');
        sendResponse({ success: true, message: isHiddenFix1 ? '✅ 已隱藏標題區' : '已顯示標題區', active: isHiddenFix1 });
        break;
      }

      case 'toggleAboutFix1': {
        const aboutPanelsFix1 = document.querySelectorAll('.about-panel');
        if (aboutPanelsFix1.length === 0) {
          sendResponse({ success: false, message: '❌ 找不到實況主簡介面板' });
          return;
        }
        const mobilePageFix1 = document.querySelector('.mobile-page');
        const hasHiddenClassFix1 = aboutPanelsFix1[0].classList.contains('dlsq-about-hidden');

        aboutPanelsFix1.forEach(panel => {
          if (hasHiddenClassFix1) {
            panel.classList.remove('dlsq-about-hidden');
          } else {
            panel.classList.add('dlsq-about-hidden');
          }
        });

        if (mobilePageFix1) {
          if (hasHiddenClassFix1) {
            mobilePageFix1.classList.remove('dlsq-video-expanded');
          } else {
            mobilePageFix1.classList.add('dlsq-video-expanded');
          }
        }

        // 【修正】背景處理 - 帶備份和恢復
        const appElementsFix1 = document.querySelectorAll('.application, .application--wrap, #genius, .bg-grey-darken-5, .height-100.bg-grey-darken-7');
        appElementsFix1.forEach(el => {
          if (hasHiddenClassFix1) {
            // 顯示時恢復背景（使用備份的值）
            if (el.dataset.dlsqOriginalBgColor) {
              el.style.setProperty('background-color', el.dataset.dlsqOriginalBgColor, 'important');
              delete el.dataset.dlsqOriginalBgColor;
            } else {
              el.style.removeProperty('background-color');
            }
            if (el.dataset.dlsqOriginalBg) {
              el.style.setProperty('background', el.dataset.dlsqOriginalBg, 'important');
              delete el.dataset.dlsqOriginalBg;
            } else {
              el.style.removeProperty('background');
            }
          } else {
            // 隱藏時備份並設定透明背景
            if (!el.dataset.dlsqOriginalBgColor) {
              el.dataset.dlsqOriginalBgColor = el.style.getPropertyValue('background-color') || '';
            }
            if (!el.dataset.dlsqOriginalBg) {
              el.dataset.dlsqOriginalBg = el.style.getPropertyValue('background') || '';
            }
            el.style.setProperty('background-color', 'transparent', 'important');
            el.style.setProperty('background', 'transparent', 'important');
          }
        });

        sendResponse({ success: true, message: hasHiddenClassFix1 ? '已顯示簡介面板' : '✅ 已隱藏簡介面板並啟用影片擴展', active: !hasHiddenClassFix1 });
        break;
      }

      case 'toggleSidebar': {
        const sidebar = findSidebar();
        if (!sidebar) {
          sendResponse({ success: false, message: '❌ 找不到側邊欄' });
          return;
        }
        sidebar.classList.toggle('dlsq-sidebar-hidden');
        const isHidden = sidebar.classList.contains('dlsq-sidebar-hidden');
        sendResponse({ success: true, message: isHidden ? '✅ 已隱藏側邊欄' : '已顯示側邊欄', active: isHidden });
        break;
      }

      case 'toggleNavbar': {
        // 【修復版】同時執行導航欄隱藏 + flex-box 高度調整（帶備份）
        const navbar = findNavbar();
        const flexBox = document.querySelector('.flex-box.dl-flex-row');

        if (!navbar) {
          sendResponse({ success: false, message: '❌ 找不到頂部導航' });
          return;
        }

        // 檢查當前狀態：是否已經是隱藏+100vh模式
        const isNavbarHidden = navbar.classList.contains('dlsq-navbar-hidden');
        const isFullViewport = flexBox && flexBox.offsetHeight >= window.innerHeight - 10;

        if (isNavbarHidden && isFullViewport) {
          // ===== 恢復模式 =====
          // 1. 恢復導航欄
          navbar.classList.remove('dlsq-navbar-hidden');

          // 2. 恢復 flex-box 高度（使用備份）
          if (flexBox) {
            const originalHeight = flexBox.dataset.dlsqOriginalHeight;
            if (originalHeight) {
              flexBox.style.setProperty('height', originalHeight, 'important');
            } else {
              flexBox.style.setProperty('height', 'calc(100% - 60px)', 'important');
            }
            delete flexBox.dataset.dlsqOriginalHeight;
          }

          sendResponse({
            success: true,
            message: `✅ 已恢復顯示 (高度: ${flexBox?.dataset.dlsqOriginalHeight || 'calc(100% - 60px)'})`,
            active: false
          });
        } else {
          // ===== 隱藏模式 =====
          // 1. 隱藏導航欄
          navbar.classList.add('dlsq-navbar-hidden');

          // 2. 備份並設置 flex-box 高度
          if (flexBox) {
            const currentHeight = flexBox.style.getPropertyValue('height');
            if (currentHeight && currentHeight !== '100vh') {
              flexBox.dataset.dlsqOriginalHeight = currentHeight;
            }
            flexBox.style.setProperty('height', '100vh', 'important');
          }

          sendResponse({
            success: true,
            message: `✅ 已隱藏導航並設置 100vh`,
            active: true
          });
        }
        break;
      }

      case 'toggleChatNarrow': {
        const chatArea = findChatArea();
        if (!chatArea) {
          sendResponse({ success: false, message: '❌ 找不到聊天室' });
          return;
        }
        chatArea.classList.toggle('dlsq-chat-narrow');
        const isActive = chatArea.classList.contains('dlsq-chat-narrow');
        sendResponse({ success: true, message: isActive ? '✅ 聊天室已變窄 (160px)' : '已恢復聊天室寬度', active: isActive });
        break;
      }

      case 'toggleChatHidden': {
        const chatArea = findChatArea();
        if (!chatArea) {
          sendResponse({ success: false, message: '❌ 找不到聊天室' });
          return;
        }
        chatArea.classList.toggle('dlsq-chat-hidden');
        const isActive = chatArea.classList.contains('dlsq-chat-hidden');
        sendResponse({ success: true, message: isActive ? '✅ 已隱藏聊天室' : '已顯示聊天室', active: isActive });
        break;
      }

      case 'toggleChatOverlayFix1': {
        const chatAreaFix1 = findChatArea();
        if (!chatAreaFix1) {
          sendResponse({ success: false, message: '❌ 找不到聊天室' });
          return;
        }
        const topContributorsFix1 = document.querySelector('.top-contributors');
        const hasOverlayClass = chatAreaFix1.classList.contains('dlsq-chat-overlay');

        if (hasOverlayClass) {
          // 關閉浮動
          chatAreaFix1.classList.remove('dlsq-chat-overlay');
          if (topContributorsFix1) {
            topContributorsFix1.style.removeProperty('box-shadow');
          }
          sendResponse({ success: true, message: '已恢復聊天室原位置', active: false });
        } else {
          // 開啟浮動
          chatAreaFix1.classList.add('dlsq-chat-overlay');
          if (topContributorsFix1) {
            topContributorsFix1.style.setProperty('box-shadow', 'none', 'important');
          }
          sendResponse({ success: true, message: '✅ 聊天室已浮動在影片上', active: true });
        }
        break;
      }

      // 劇院模式 - 調用完整實現函數
      case 'toggleTheaterMode13': {
        // 創建虛擬按鈕對象來調用 toggleTheaterMode13（async 函數）
        const mockBtn = {
          textContent: theaterMode13Active ? '🎭 關閉劇院13' : '🎭 劇院模式13',
          style: { background: theaterMode13Active ? 'rgba(100, 200, 255, 0.6)' : '' },
          set text(val) { this.textContent = val; },
          get text() { return this.textContent; }
        };
        // 調用 async 函數並等待完成
        (async () => {
          await toggleTheaterMode13(mockBtn);
          sendResponse({
            success: true,
            message: theaterMode13Active ? '✅ 劇院模式13已啟用' : '已關閉劇院模式13',
            active: theaterMode13Active
          });
        })();
        return true; // 異步響應
      }

      // 測試按鈕
      case 'testZoomIn': {
        const video = document.querySelector('video');
        if (video) {
          const currentScale = parseFloat(video.getAttribute('data-scale') || '1');
          const newScale = currentScale + 0.1;
          video.style.setProperty('transform', `scale(${newScale})`, 'important');
          video.style.setProperty('transform-origin', 'top left', 'important');
          video.setAttribute('data-scale', newScale.toString());
          sendResponse({ success: true, message: `✅ 影片縮放: ${Math.round(newScale * 100)}%` });
        } else {
          sendResponse({ success: false, message: '❌ 找不到 video' });
        }
        break;
      }

      case 'testZoomOut': {
        const video = document.querySelector('video');
        if (video) {
          const currentScale = parseFloat(video.getAttribute('data-scale') || '1');
          const newScale = Math.max(0.1, currentScale - 0.1);
          video.style.setProperty('transform', `scale(${newScale})`, 'important');
          video.style.setProperty('transform-origin', 'top left', 'important');
          video.setAttribute('data-scale', newScale.toString());
          sendResponse({ success: true, message: `✅ 影片縮放: ${Math.round(newScale * 100)}%` });
        } else {
          sendResponse({ success: false, message: '❌ 找不到 video' });
        }
        break;
      }

      case 'testZoomReset': {
        const video = document.querySelector('video');
        if (video) {
          video.style.removeProperty('transform');
          video.style.removeProperty('transform-origin');
          video.removeAttribute('data-scale');
          sendResponse({ success: true, message: '✅ 影片縮放已重置' });
        } else {
          sendResponse({ success: false, message: '❌ 找不到 video' });
        }
        break;
      }

      case 'toggleBlackBackgroundFix1': {
        const candidatesFix1 = ['.bg-grey-darken-6', '[class*="grey-darken"]', '.flex-all-center', '.height-100.bg-grey-darken-6'];

        if (!blackBgActiveFix1) {
          // 開啟黑色背景
          let found = false;
          candidatesFix1.forEach(sel => {
            const el = document.querySelector(sel);
            if (el && !el.dataset.originalBgColor) {
              el.dataset.originalBgColor = el.style.backgroundColor || '';
              el.dataset.originalBg = el.style.background || '';
              el.style.setProperty('background-color', '#000', 'important');
              el.style.setProperty('background', '#000', 'important');
              found = true;
            }
          });
          // body 和 html
          if (!document.body.dataset.originalBgColor) {
            document.body.dataset.originalBgColor = document.body.style.backgroundColor || '';
          }
          if (!document.documentElement.dataset.originalBgColor) {
            document.documentElement.dataset.originalBgColor = document.documentElement.style.backgroundColor || '';
          }
          document.body.style.setProperty('background-color', '#000', 'important');
          document.documentElement.style.setProperty('background-color', '#000', 'important');
          sendResponse({ success: true, message: found ? '✅ 已設置黑色背景' : '⚠️ 已嘗試設置黑色背景', active: true });
          blackBgActiveFix1 = true;
        } else {
          // 關閉黑色背景 - 恢復原始樣式
          candidatesFix1.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) {
              if (el.dataset.originalBgColor) {
                el.style.backgroundColor = el.dataset.originalBgColor;
                delete el.dataset.originalBgColor;
              } else {
                el.style.removeProperty('background-color');
              }
              if (el.dataset.originalBg) {
                el.style.background = el.dataset.originalBg;
                delete el.dataset.originalBg;
              } else {
                el.style.removeProperty('background');
              }
            }
          });
          // 恢復 body 和 html
          if (document.body.dataset.originalBgColor) {
            document.body.style.backgroundColor = document.body.dataset.originalBgColor;
            delete document.body.dataset.originalBgColor;
          } else {
            document.body.style.removeProperty('background-color');
          }
          if (document.documentElement.dataset.originalBgColor) {
            document.documentElement.style.backgroundColor = document.documentElement.dataset.originalBgColor;
            delete document.documentElement.dataset.originalBgColor;
          } else {
            document.documentElement.style.removeProperty('background-color');
          }
          sendResponse({ success: true, message: '已恢復背景', active: false });
          blackBgActiveFix1 = false;
        }
        break;
      }

      // ==================== 隱藏頂部欄分解測試 ====================
      case 'toggleNavbarTest1': {
        // 測試1: 僅隱藏/顯示導航欄（只操作 class）
        const navbar = findNavbar();
        if (!navbar) {
          sendResponse({ success: false, message: '❌ 找不到頂部導航' });
          return;
        }
        navbar.classList.toggle('dlsq-navbar-hidden');
        const isHidden = navbar.classList.contains('dlsq-navbar-hidden');
        sendResponse({ success: true, message: isHidden ? '✅ 僅隱藏導航欄 (class)' : '僅顯示導航欄 (class)', active: isHidden });
        break;
      }

      case 'toggleNavbarTest2': {
        // 測試2: 僅調整 flex-box 高度
        const flexBox = document.querySelector('.flex-box.dl-flex-row');
        if (!flexBox) {
          sendResponse({ success: false, message: '❌ 找不到 flex-box' });
          return;
        }
        // 使用 computedStyle 檢查實際高度是否為 100vh（通過比較 offsetHeight 和 window.innerHeight）
        const computedHeight = window.getComputedStyle(flexBox).height;
        const isFullViewport = flexBox.offsetHeight >= window.innerHeight - 10; // 允許 10px 誤差
        if (isFullViewport) {
          flexBox.style.removeProperty('height');
          sendResponse({ success: true, message: '已移除 flex-box height', active: false });
        } else {
          flexBox.style.setProperty('height', '100vh', 'important');
          sendResponse({ success: true, message: '✅ 設置 flex-box height: 100vh', active: true });
        }
        break;
      }

      case 'toggleNavbarTest3': {
        // 測試3: 僅調整聊天室高度
        const chatArea = findChatArea();
        if (!chatArea) {
          sendResponse({ success: false, message: '❌ 找不到聊天室' });
          return;
        }
        const currentHeight = chatArea.style.getPropertyValue('height');
        if (currentHeight === '100vh') {
          chatArea.style.removeProperty('height');
          chatArea.style.removeProperty('max-height');
          sendResponse({ success: true, message: '已移除聊天室 height', active: false });
        } else {
          chatArea.style.setProperty('height', '100vh', 'important');
          sendResponse({ success: true, message: '✅ 設置聊天室 height: 100vh', active: true });
        }
        break;
      }

      case 'toggleNavbarTest4': {
        // 測試4: 強制重排（reflow）
        const flexBox = document.querySelector('.flex-box.dl-flex-row');
        if (!flexBox) {
          sendResponse({ success: false, message: '❌ 找不到 flex-box' });
          return;
        }
        // 觸發重排
        flexBox.style.height = flexBox.style.height;
        void flexBox.offsetHeight;
        setTimeout(() => {
          flexBox.style.removeProperty('height');
          sendResponse({ success: true, message: '✅ 已執行強制重排', active: false });
        }, 0);
        return true; // 異步響應
      }

      case 'toggleNavbarTest5': {
        // 測試5: 完整功能（當前 toggleNavbar 的實現）
        const navbar = findNavbar();
        if (!navbar) {
          sendResponse({ success: false, message: '❌ 找不到頂部導航' });
          return;
        }
        navbar.classList.toggle('dlsq-navbar-hidden');
        const isHidden = navbar.classList.contains('dlsq-navbar-hidden');

        // 調整 flex-box 高度
        const flexBox = document.querySelector('.flex-box.dl-flex-row');
        if (flexBox) {
          if (isHidden) {
            flexBox.style.setProperty('height', '100vh', 'important');
          } else {
            flexBox.style.removeProperty('height');
            // 【修正】強制重排以恢復原始佈局
            flexBox.style.height = flexBox.style.height;
            setTimeout(() => {
              flexBox.style.removeProperty('height');
            }, 0);
          }
        }

        // 【修正】同時調整聊天室容器
        const chatArea = findChatArea();
        if (chatArea) {
          if (isHidden) {
            chatArea.style.setProperty('height', '100vh', 'important');
          } else {
            chatArea.style.removeProperty('height');
            chatArea.style.removeProperty('max-height');
          }
        }

        sendResponse({ success: true, message: isHidden ? '✅ 已隱藏頂部欄 (完整)' : '已顯示頂部欄 (完整)', active: isHidden });
        break;
      }

      // ==================== 問題診斷測試按鈮 ====================
      case 'toggleNavbarTest6': {
        // 測試6: 檢查屬性值 - 回報 getPropertyValue 的實際值
        const flexBox = document.querySelector('.flex-box.dl-flex-row');
        if (!flexBox) {
          sendResponse({ success: false, message: '❌ 找不到 flex-box' });
          return;
        }
        const propValue = flexBox.style.getPropertyValue('height');
        const hasHeightAttr = flexBox.hasAttribute('style');
        const styleCssText = flexBox.style.cssText;
        sendResponse({
          success: true,
          message: `getPropertyValue: "${propValue}" | hasAttribute: ${hasHeightAttr} | cssText: "${styleCssText}"`
        });
        break;
      }

      case 'toggleNavbarTest7': {
        // 測試7: 檢查計算樣式 - 回報 getComputedStyle 的實際值
        const flexBox = document.querySelector('.flex-box.dl-flex-row');
        if (!flexBox) {
          sendResponse({ success: false, message: '❌ 找不到 flex-box' });
          return;
        }
        const computedStyle = window.getComputedStyle(flexBox);
        const computedHeight = computedStyle.height;
        const offsetHeight = flexBox.offsetHeight;
        const windowHeight = window.innerHeight;
        sendResponse({
          success: true,
          message: `computed: ${computedHeight} | offset: ${offsetHeight}px | window: ${windowHeight}px`
        });
        break;
      }

      case 'toggleNavbarTest8': {
        // 測試8: 比較高度 - 切換並顯示高度變化
        const flexBox = document.querySelector('.flex-box.dl-flex-row');
        if (!flexBox) {
          sendResponse({ success: false, message: '❌ 找不到 flex-box' });
          return;
        }
        const before = flexBox.offsetHeight;
        // 切換
        const computedHeight = window.getComputedStyle(flexBox).height;
        const isFullViewport = flexBox.offsetHeight >= window.innerHeight - 10;
        if (isFullViewport) {
          flexBox.style.removeProperty('height');
        } else {
          flexBox.style.setProperty('height', '100vh', 'important');
        }
        const after = flexBox.offsetHeight;
        sendResponse({
          success: true,
          message: `切換前: ${before}px → 切換後: ${after}px | computed: ${computedHeight}`,
          active: !isFullViewport
        });
        break;
      }

      case 'toggleNavbarTest9': {
        // 測試9: 直接設置空值 - 測試 style.height = '' 的效果
        const flexBox = document.querySelector('.flex-box.dl-flex-row');
        if (!flexBox) {
          sendResponse({ success: false, message: '❌ 找不到 flex-box' });
          return;
        }
        const before = flexBox.offsetHeight;
        // 直接設置空字符串
        flexBox.style.height = '';
        const after = flexBox.offsetHeight;
        sendResponse({
          success: true,
          message: `height='' 前: ${before}px → 後: ${after}px`
        });
        break;
      }

      case 'toggleNavbarTest10': {
        // 測試10: 清空再恢復 - 測試清空 cssText 再恢復的效果
        const flexBox = document.querySelector('.flex-box.dl-flex-row');
        if (!flexBox) {
          sendResponse({ success: false, message: '❌ 找不到 flex-box' });
          return;
        }
        const before = flexBox.offsetHeight;
        const originalCssText = flexBox.style.cssText;
        // 清空所有 inline styles
        flexBox.style.cssText = '';
        void flexBox.offsetHeight; // 強制重排
        // 恢復（但不包括 height）
        if (originalCssText.includes('height')) {
          // 如果有 height，只恢復其他屬性
          const newCssText = originalCssText.replace(/height:\s*[^;]+;?/gi, '');
          flexBox.style.cssText = newCssText;
        }
        const after = flexBox.offsetHeight;
        sendResponse({
          success: true,
          message: `清空再恢復: ${before}px → ${after}px | 原始css: "${originalCssText.substring(0, 50)}..."`
        });
        break;
      }

      // ==================== 2號按鈮修復版 ====================
      case 'toggleNavbarTest2Fix': {
        // 修復版: 帶備份的 flex-box 高度切換
        const flexBox = document.querySelector('.flex-box.dl-flex-row');
        if (!flexBox) {
          sendResponse({ success: false, message: '❌ 找不到 flex-box' });
          return;
        }

        // 檢查是否已經是 100vh 模式（通過比較高度）
        const isFullViewport = flexBox.offsetHeight >= window.innerHeight - 10;

        if (isFullViewport) {
          // 恢復：使用備份的原始值，而不是直接 removeProperty
          const originalHeight = flexBox.dataset.dlsqOriginalHeight;
          if (originalHeight) {
            flexBox.style.setProperty('height', originalHeight, 'important');
            sendResponse({ success: true, message: `✅ 恢復原始高度: ${originalHeight}`, active: false });
          } else {
            // 沒有備份，嘗試硬編碼 DLive 的默認值
            flexBox.style.setProperty('height', 'calc(100% - 60px)', 'important');
            sendResponse({ success: true, message: '✅ 恢復默認: calc(100% - 60px)', active: false });
          }
          // 清除備份
          delete flexBox.dataset.dlsqOriginalHeight;
        } else {
          // 設置 100vh：先備份原始值
          const currentHeight = flexBox.style.getPropertyValue('height');
          if (currentHeight && currentHeight !== '100vh') {
            flexBox.dataset.dlsqOriginalHeight = currentHeight;
          }
          flexBox.style.setProperty('height', '100vh', 'important');
          sendResponse({ success: true, message: `✅ 設置 100vh (備份: ${currentHeight || 'none'})`, active: true });
        }
        break;
      }

      // ==================== 1號+2號修復組合 ====================
      case 'toggleNavbarTestCombo': {
        // 組合版: 同時執行導航欄隱藏 + flex-box 高度調整（帶備份）
        const navbar = findNavbar();
        const flexBox = document.querySelector('.flex-box.dl-flex-row');

        if (!navbar) {
          sendResponse({ success: false, message: '❌ 找不到頂部導航' });
          return;
        }
        if (!flexBox) {
          sendResponse({ success: false, message: '❌ 找不到 flex-box' });
          return;
        }

        // 檢查當前狀態：是否已經是隱藏+100vh模式
        const isNavbarHidden = navbar.classList.contains('dlsq-navbar-hidden');
        const isFullViewport = flexBox.offsetHeight >= window.innerHeight - 10;

        if (isNavbarHidden && isFullViewport) {
          // ===== 恢復模式 =====
          // 1. 恢復導航欄
          navbar.classList.remove('dlsq-navbar-hidden');

          // 2. 恢復 flex-box 高度（使用備份）
          const originalHeight = flexBox.dataset.dlsqOriginalHeight;
          if (originalHeight) {
            flexBox.style.setProperty('height', originalHeight, 'important');
          } else {
            flexBox.style.setProperty('height', 'calc(100% - 60px)', 'important');
          }
          delete flexBox.dataset.dlsqOriginalHeight;

          sendResponse({
            success: true,
            message: `✅ 已恢復顯示 (高度: ${originalHeight || 'calc(100% - 60px)'})`,
            active: false
          });
        } else {
          // ===== 隱藏模式 =====
          // 1. 隱藏導航欄
          navbar.classList.add('dlsq-navbar-hidden');

          // 2. 備份並設置 flex-box 高度
          const currentHeight = flexBox.style.getPropertyValue('height');
          if (currentHeight && currentHeight !== '100vh') {
            flexBox.dataset.dlsqOriginalHeight = currentHeight;
          }
          flexBox.style.setProperty('height', '100vh', 'important');

          sendResponse({
            success: true,
            message: `✅ 已隱藏導航並設置 100vh (備份: ${currentHeight || 'none'})`,
            active: true
          });
        }
        break;
      }

      // ==================== 劇院模式（修復版）====================
      case 'toggleTheaterCombo': {
        // 狀態變量（使用 dataset 儲存在 body 上）
        if (!document.body.dataset.theaterComboActive) {
          document.body.dataset.theaterComboActive = 'false';
        }
        const isActive = document.body.dataset.theaterComboActive === 'true';

        if (!isActive) {
          // ===== 啟用劇院模式 =====

          // 1. 隱藏課金區
          const donationArea = findDonationArea();
          if (donationArea) {
            donationArea.classList.add('dlsq-donation-hidden');
          }

          // 2. 隱藏標題
          const titleArea = findTitleArea();
          if (titleArea) {
            titleArea.classList.add('dlsq-title-hidden-fix1');
          }

          // 3. 隱藏下方區 + 【關鍵】透明背景處理
          const aboutPanels = document.querySelectorAll('.about-panel');
          aboutPanels.forEach(panel => panel.classList.add('dlsq-about-hidden'));
          const mobilePage = document.querySelector('.mobile-page');
          if (mobilePage) {
            mobilePage.classList.add('dlsq-video-expanded');
          }
          // 【修正】透明背景處理（來自 toggleAboutFix1）
          const appElements = document.querySelectorAll('.application, .application--wrap, #genius, .bg-grey-darken-5, .height-100.bg-grey-darken-7');
          appElements.forEach(el => {
            if (!el.dataset.originalAppBg) {
              el.dataset.originalAppBg = el.style.background || '';
              el.dataset.originalAppBgColor = el.style.backgroundColor || '';
            }
            el.style.setProperty('background-color', 'transparent', 'important');
            el.style.setProperty('background', 'transparent', 'important');
          });

          // 4. 隱藏側邊欄
          const sidebar = findSidebar();
          if (sidebar) {
            sidebar.classList.add('dlsq-sidebar-hidden');
          }

          // 5. 隱藏頂部欄 + 調整 flex-box（帶備份）
          const navbar = findNavbar();
          const flexBox = document.querySelector('.flex-box.dl-flex-row');
          if (navbar) {
            navbar.classList.add('dlsq-navbar-hidden');
          }
          if (flexBox) {
            const currentHeight = flexBox.style.getPropertyValue('height');
            if (currentHeight && currentHeight !== '100vh') {
              flexBox.dataset.dlsqOriginalHeight = currentHeight;
            }
            flexBox.style.setProperty('height', '100vh', 'important');
          }

          // 6. 浮動聊天室（儲存原始樣式）
          const chatArea = findChatArea();
          if (chatArea) {
            if (!chatArea.dataset.originalCssText) {
              chatArea.dataset.originalCssText = chatArea.style.cssText;
            }
            chatArea.classList.add('dlsq-chat-overlay');
            const topContributors = document.querySelector('.top-contributors');
            if (topContributors) {
              topContributors.style.setProperty('box-shadow', 'none', 'important');
            }
          }

          // 7. 黑色背景
          const bgCandidates = ['.bg-grey-darken-6', '[class*="grey-darken"]', '.flex-all-center', '.height-100.bg-grey-darken-6'];
          bgCandidates.forEach(sel => {
            const el = document.querySelector(sel);
            if (el && !el.dataset.originalBgColor) {
              el.dataset.originalBgColor = el.style.backgroundColor || '';
              el.dataset.originalBg = el.style.background || '';
              el.style.setProperty('background-color', '#000', 'important');
              el.style.setProperty('background', '#000', 'important');
            }
          });
          if (!document.body.dataset.originalBgColor) {
            document.body.dataset.originalBgColor = document.body.style.backgroundColor || '';
          }
          if (!document.documentElement.dataset.originalBgColor) {
            document.documentElement.dataset.originalBgColor = document.documentElement.style.backgroundColor || '';
          }
          document.body.style.setProperty('background-color', '#000', 'important');
          document.documentElement.style.setProperty('background-color', '#000', 'important');

          document.body.dataset.theaterComboActive = 'true';
          sendResponse({ success: true, message: '✅ 劇院模式（修復版）已啟用', active: true });
        } else {
          // ===== 關閉劇院模式 =====

          // 1. 恢復課金區
          const donationArea = findDonationArea();
          if (donationArea) {
            donationArea.classList.remove('dlsq-donation-hidden');
          }

          // 2. 恢復標題
          const titleArea = findTitleArea();
          if (titleArea) {
            titleArea.classList.remove('dlsq-title-hidden-fix1');
          }

          // 3. 恢復下方區 + 【關鍵】恢復背景
          const aboutPanels = document.querySelectorAll('.about-panel');
          aboutPanels.forEach(panel => panel.classList.remove('dlsq-about-hidden'));
          const mobilePage = document.querySelector('.mobile-page');
          if (mobilePage) {
            mobilePage.classList.remove('dlsq-video-expanded');
          }
          // 【修正】恢復透明背景
          const appElements = document.querySelectorAll('.application, .application--wrap, #genius, .bg-grey-darken-5, .height-100.bg-grey-darken-7');
          appElements.forEach(el => {
            if (el.dataset.originalAppBg) {
              el.style.background = el.dataset.originalAppBg;
              delete el.dataset.originalAppBg;
            } else {
              el.style.removeProperty('background');
            }
            if (el.dataset.originalAppBgColor) {
              el.style.backgroundColor = el.dataset.originalAppBgColor;
              delete el.dataset.originalAppBgColor;
            } else {
              el.style.removeProperty('background-color');
            }
          });

          // 4. 恢復側邊欄
          const sidebar = findSidebar();
          if (sidebar) {
            sidebar.classList.remove('dlsq-sidebar-hidden');
          }

          // 5. 恢復頂部欄 + flex-box（使用備份）
          const navbar = findNavbar();
          const flexBox = document.querySelector('.flex-box.dl-flex-row');
          if (navbar) {
            navbar.classList.remove('dlsq-navbar-hidden');
          }
          if (flexBox) {
            const originalHeight = flexBox.dataset.dlsqOriginalHeight;
            if (originalHeight) {
              flexBox.style.setProperty('height', originalHeight, 'important');
            } else {
              flexBox.style.setProperty('height', 'calc(100% - 60px)', 'important');
            }
            delete flexBox.dataset.dlsqOriginalHeight;
          }

          // 6. 恢復聊天室
          const chatArea = findChatArea();
          if (chatArea) {
            chatArea.classList.remove('dlsq-chat-overlay');
            if (chatArea.dataset.originalCssText) {
              chatArea.style.cssText = chatArea.dataset.originalCssText;
              delete chatArea.dataset.originalCssText;
            }
            const topContributors = document.querySelector('.top-contributors');
            if (topContributors) {
              topContributors.style.removeProperty('box-shadow');
            }
          }

          // 7. 恢復背景
          const bgCandidates = ['.bg-grey-darken-6', '[class*="grey-darken"]', '.flex-all-center', '.height-100.bg-grey-darken-6'];
          bgCandidates.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) {
              if (el.dataset.originalBgColor) {
                el.style.backgroundColor = el.dataset.originalBgColor;
                delete el.dataset.originalBgColor;
              } else {
                el.style.removeProperty('background-color');
              }
              if (el.dataset.originalBg) {
                el.style.background = el.dataset.originalBg;
                delete el.dataset.originalBg;
              } else {
                el.style.removeProperty('background');
              }
            }
          });
          if (document.body.dataset.originalBgColor) {
            document.body.style.backgroundColor = document.body.dataset.originalBgColor;
            delete document.body.dataset.originalBgColor;
          } else {
            document.body.style.removeProperty('background-color');
          }
          if (document.documentElement.dataset.originalBgColor) {
            document.documentElement.style.backgroundColor = document.documentElement.dataset.originalBgColor;
            delete document.documentElement.dataset.originalBgColor;
          } else {
            document.documentElement.style.removeProperty('background-color');
          }

          document.body.dataset.theaterComboActive = 'false';
          sendResponse({ success: true, message: '✅ 劇院模式（修復版）已關閉', active: false });
        }
        break;
      }

      // ==================== 劇院模式（透明背景版）====================
      case 'toggleTheaterComboFix': {
        // 狀態變量（使用 dataset 儲存在 body 上）
        if (!document.body.dataset.theaterComboFixActive) {
          document.body.dataset.theaterComboFixActive = 'false';
        }
        const isActive = document.body.dataset.theaterComboFixActive === 'true';

        if (!isActive) {
          // ===== 啟用劇院模式（透明背景版）=====

          // 1. 隱藏課金區
          const donationArea = findDonationArea();
          if (donationArea) {
            donationArea.classList.add('dlsq-donation-hidden');
          }

          // 2. 隱藏標題
          const titleArea = findTitleArea();
          if (titleArea) {
            titleArea.classList.add('dlsq-title-hidden-fix1');
          }

          // 3. 隱藏下方區 + 【關鍵】透明背景處理
          const aboutPanels = document.querySelectorAll('.about-panel');
          aboutPanels.forEach(panel => panel.classList.add('dlsq-about-hidden'));
          const mobilePage = document.querySelector('.mobile-page');
          if (mobilePage) {
            mobilePage.classList.add('dlsq-video-expanded');
          }
          // 【修正】透明背景處理（來自 toggleAboutFix1）
          const appElements = document.querySelectorAll('.application, .application--wrap, #genius, .bg-grey-darken-5, .height-100.bg-grey-darken-7');
          appElements.forEach(el => {
            if (!el.dataset.originalAppBg) {
              el.dataset.originalAppBg = el.style.background || '';
              el.dataset.originalAppBgColor = el.style.backgroundColor || '';
            }
            el.style.setProperty('background-color', 'transparent', 'important');
            el.style.setProperty('background', 'transparent', 'important');
          });

          // 4. 隱藏側邊欄
          const sidebar = findSidebar();
          if (sidebar) {
            sidebar.classList.add('dlsq-sidebar-hidden');
          }

          // 5. 隱藏頂部欄 + 調整 flex-box（帶備份）
          const navbar = findNavbar();
          const flexBox = document.querySelector('.flex-box.dl-flex-row');
          if (navbar) {
            navbar.classList.add('dlsq-navbar-hidden');
          }
          if (flexBox) {
            const currentHeight = flexBox.style.getPropertyValue('height');
            if (currentHeight && currentHeight !== '100vh') {
              flexBox.dataset.dlsqOriginalHeight = currentHeight;
            }
            flexBox.style.setProperty('height', '100vh', 'important');
          }

          // 6. 浮動聊天室（儲存原始樣式）
          const chatArea = findChatArea();
          if (chatArea) {
            if (!chatArea.dataset.originalCssText) {
              chatArea.dataset.originalCssText = chatArea.style.cssText;
            }
            chatArea.classList.add('dlsq-chat-overlay');
            const topContributors = document.querySelector('.top-contributors');
            if (topContributors) {
              topContributors.style.setProperty('box-shadow', 'none', 'important');
            }
          }

          // 7. 黑色背景
          const bgCandidates = ['.bg-grey-darken-6', '[class*="grey-darken"]', '.flex-all-center', '.height-100.bg-grey-darken-6'];
          bgCandidates.forEach(sel => {
            const el = document.querySelector(sel);
            if (el && !el.dataset.originalBgColor) {
              el.dataset.originalBgColor = el.style.backgroundColor || '';
              el.dataset.originalBg = el.style.background || '';
              el.style.setProperty('background-color', '#000', 'important');
              el.style.setProperty('background', '#000', 'important');
            }
          });
          if (!document.body.dataset.originalBgColor) {
            document.body.dataset.originalBgColor = document.body.style.backgroundColor || '';
          }
          if (!document.documentElement.dataset.originalBgColor) {
            document.documentElement.dataset.originalBgColor = document.documentElement.style.backgroundColor || '';
          }
          document.body.style.setProperty('background-color', '#000', 'important');
          document.documentElement.style.setProperty('background-color', '#000', 'important');

          document.body.dataset.theaterComboFixActive = 'true';
          sendResponse({ success: true, message: '✅ 劇院模式（透明背景版）已啟用', active: true });
        } else {
          // ===== 關閉劇院模式（透明背景版）=====

          // 1. 恢復課金區
          const donationArea = findDonationArea();
          if (donationArea) {
            donationArea.classList.remove('dlsq-donation-hidden');
          }

          // 2. 恢復標題
          const titleArea = findTitleArea();
          if (titleArea) {
            titleArea.classList.remove('dlsq-title-hidden-fix1');
          }

          // 3. 恢復下方區 + 【關鍵】恢復背景
          const aboutPanels = document.querySelectorAll('.about-panel');
          aboutPanels.forEach(panel => panel.classList.remove('dlsq-about-hidden'));
          const mobilePage = document.querySelector('.mobile-page');
          if (mobilePage) {
            mobilePage.classList.remove('dlsq-video-expanded');
          }
          // 【修正】恢復透明背景
          const appElements = document.querySelectorAll('.application, .application--wrap, #genius, .bg-grey-darken-5, .height-100.bg-grey-darken-7');
          appElements.forEach(el => {
            if (el.dataset.originalAppBg) {
              el.style.background = el.dataset.originalAppBg;
              delete el.dataset.originalAppBg;
            } else {
              el.style.removeProperty('background');
            }
            if (el.dataset.originalAppBgColor) {
              el.style.backgroundColor = el.dataset.originalAppBgColor;
              delete el.dataset.originalAppBgColor;
            } else {
              el.style.removeProperty('background-color');
            }
          });

          // 4. 恢復側邊欄
          const sidebar = findSidebar();
          if (sidebar) {
            sidebar.classList.remove('dlsq-sidebar-hidden');
          }

          // 5. 恢復頂部欄 + flex-box（使用備份）
          const navbar = findNavbar();
          const flexBox = document.querySelector('.flex-box.dl-flex-row');
          if (navbar) {
            navbar.classList.remove('dlsq-navbar-hidden');
          }
          if (flexBox) {
            const originalHeight = flexBox.dataset.dlsqOriginalHeight;
            if (originalHeight) {
              flexBox.style.setProperty('height', originalHeight, 'important');
            } else {
              flexBox.style.setProperty('height', 'calc(100% - 60px)', 'important');
            }
            delete flexBox.dataset.dlsqOriginalHeight;
          }

          // 6. 恢復聊天室
          const chatArea = findChatArea();
          if (chatArea) {
            chatArea.classList.remove('dlsq-chat-overlay');
            if (chatArea.dataset.originalCssText) {
              chatArea.style.cssText = chatArea.dataset.originalCssText;
              delete chatArea.dataset.originalCssText;
            }
            const topContributors = document.querySelector('.top-contributors');
            if (topContributors) {
              topContributors.style.removeProperty('box-shadow');
            }
          }

          // 7. 恢復背景
          const bgCandidates = ['.bg-grey-darken-6', '[class*="grey-darken"]', '.flex-all-center', '.height-100.bg-grey-darken-6'];
          bgCandidates.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) {
              if (el.dataset.originalBgColor) {
                el.style.backgroundColor = el.dataset.originalBgColor;
                delete el.dataset.originalBgColor;
              } else {
                el.style.removeProperty('background-color');
              }
              if (el.dataset.originalBg) {
                el.style.background = el.dataset.originalBg;
                delete el.dataset.originalBg;
              } else {
                el.style.removeProperty('background');
              }
            }
          });
          if (document.body.dataset.originalBgColor) {
            document.body.style.backgroundColor = document.body.dataset.originalBgColor;
            delete document.body.dataset.originalBgColor;
          } else {
            document.body.style.removeProperty('background-color');
          }
          if (document.documentElement.dataset.originalBgColor) {
            document.documentElement.style.backgroundColor = document.documentElement.dataset.originalBgColor;
            delete document.documentElement.dataset.originalBgColor;
          } else {
            document.documentElement.style.removeProperty('background-color');
          }

          document.body.dataset.theaterComboFixActive = 'false';
          sendResponse({ success: true, message: '✅ 劇院模式（透明背景版）已關閉', active: false });
        }
        break;
      }

      default:
        sendResponse({ success: false, message: '❌ 未知命令' });
        break;
    }
  } catch (e) {
    sendResponse({ success: false, message: '❌ 執行錯誤: ' + e.message });
  }
}

const DKIP = {
  // 編碼：imgur URL → IM-xxx（Twitch 格式：IM-id-gif 或 IM-id-mp4，不用點號）
  encode(url, useTwitchFormat = false) {
    const match = url.match(/(?:i\.)?imgur\.com\/([a-zA-Z0-9]+)(?:\.(gif|png|jpg|jpeg|mp4))?/i);
    if (!match || match[1].length < 5) return null;
    const id = match[1];
    const ext = match[2] || 'gif'; // 默認 gif
    if (useTwitchFormat) {
      // Twitch 格式：IM-ha3eTC7-gif（用 - 代替 .）
      return `IM-${id}-${ext}`;
    }
    // 標準格式：IM-ha3eTC7.gif
    return ext === 'gif' ? `IM-${id}` : `IM-${id}.${ext}`;
  },

  // 解碼：IM-xxx → 圖片URL（支援兩種格式：IM-id.gif 和 IM-id-gif）
  decode(text) {
    if (!text || !text.startsWith('IM-')) return null;
    const idPart = text.slice(3); // 去掉 "IM-"
    if (!idPart || idPart.length < 5) return null;

    // 檢查新格式 IM-ha3eTC7-gif（用 - 分隔，支持 ID 中包含 -）
    // 從末尾找最後一個 - 後的擴展名
    const lastDashIndex = idPart.lastIndexOf('-');
    if (lastDashIndex > 0) {
      const possibleExt = idPart.slice(lastDashIndex + 1).toLowerCase();
      if (['gif', 'png', 'jpg', 'jpeg', 'mp4'].includes(possibleExt)) {
        const id = idPart.slice(0, lastDashIndex);
        return `https://i.imgur.com/${id}.${possibleExt}`;
      }
    }

    // 檢查舊格式 IM-ha3eTC7.gif（用 . 分隔）
    const lastDotIndex = idPart.lastIndexOf('.');
    if (lastDotIndex > 0) {
      const possibleExt = idPart.slice(lastDotIndex + 1).toLowerCase();
      if (['gif', 'png', 'jpg', 'jpeg', 'mp4'].includes(possibleExt)) {
        return `https://i.imgur.com/${idPart}`;
      }
    }

    // 無後綴，默認 .gif
    return `https://i.imgur.com/${idPart}.gif`;
  },

  // 判斷是否視頻（支援兩種格式）
  isVideo(text) {
    if (!text) return false;
    return /-mp4$/i.test(text) || /.mp4$/i.test(text);
  },

  isValid(text) {
    return text && text.startsWith('IM-') && text.length > 5;
  }
};

// 掃描並替換聊天室中的 IM- 文字為圖片（同時檢測零寬字符編碼的隱藏訊息）
function scanAndReplaceIMImages() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const textNodes = [];
  let node;
  while (node = walker.nextNode()) {
    // 跳過已處理過的節點 和 聊天輸入框
    if (node.parentElement?.closest('.dlsq-im-replaced, img, video, script, style, textarea')) continue;
    // 跳過 Twitch/DLive 聊天輸入框（避免在輸入框中轉換圖片）
    // 【加強】添加更多 Twitch 輸入框相關選擇器
    if (node.parentElement?.closest('[data-a-target="chat-input"], [data-a-target="chat-input-container"], .chat-wysiwyg-input__editor, [contenteditable="true"], .chatroom-input, .chat-input, [class*="chat-input"]')) continue;
    const text = node.textContent;
    // 檢查常規 IM- 或零寬字符或 DL- 或 Twitch emote 格式
    if (text.includes('IM-') || text.includes('DL-') || text.includes(':emote/mine/dlive/') || /[\u200B\u200C\u200D\uFEFF]/.test(text)) {
      textNodes.push(node);
    }
  }

  textNodes.forEach(textNode => {
    const text = textNode.textContent;

    // 先嘗試解碼零寬字符
    let hiddenStickerId = null;
    let isDLSticker = false;
    const zwChars = text.match(/[\u200B\u200C\u200D\uFEFF]/g);
    if (zwChars && zwChars.length >= 8) {
      try {
        const decoded = decodeFromZeroWidth(zwChars.join(''));
        if (decoded && decoded.startsWith('IM-')) {
          hiddenStickerId = decoded;
        } else if (decoded && decoded.startsWith('DL-')) {
          hiddenStickerId = decoded;
          isDLSticker = true;
        }
      } catch (e) {
        // 解碼失敗，繼續正常處理
      }
    }

    // 如果找到隱藏的貼圖ID，直接替換整個文本節點
    if (hiddenStickerId && !textNode.parentElement?.closest('.dlsq-hidden-decoded')) {
      const wrapper = document.createElement('span');
      wrapper.className = 'dlsq-im-replaced dlsq-hidden-decoded';

      if (isDLSticker) {
        // DL 貼圖：顯示實際圖片
        const dlId = hiddenStickerId.slice(3); // 去掉 "DL-" 前綴
        const img = document.createElement('img');
        img.src = `https://images.prd.dlivecdn.com/emote/${dlId}`;
        img.alt = hiddenStickerId;
        img.className = 'dlsq-im-replaced';
        img.style.cssText = 'max-width: 100px; max-height: 100px; border-radius: 8px; cursor: default; display: block; margin: 4px 0; border: 2px solid transparent; object-fit: contain;';
        wrapper.appendChild(img);
      } else {
        // IM 貼圖：顯示圖片
        const url = DKIP.decode(hiddenStickerId);
        if (url) {
          const isVideo = /\.mp4$/i.test(url);
          if (isVideo) {
            const video = document.createElement('video');
            video.src = url;
            video.className = 'dlsq-im-replaced';
            video.muted = true;
            video.autoplay = true;
            video.loop = true;
            video.playsInline = true;
            video.style.cssText = 'max-width: 100px; max-height: 100px; border-radius: 8px; cursor: default; display: block; margin: 4px 0; border: 2px solid transparent;';
            wrapper.appendChild(video);
          } else {
            const img = document.createElement('img');
            img.src = url;
            img.className = 'dlsq-im-replaced';
            img.style.cssText = 'max-width: 100px; max-height: 100px; border-radius: 8px; cursor: default; display: block; margin: 4px 0; border: 2px solid transparent;';
            wrapper.appendChild(img);
          }
        }
      }

      // 使用 replaceWith 代替 replaceChild，更兼容 React
      try {
        // 額外檢查：確保節點還在 DOM 中且沒有被 React 移除
        if (!textNode.parentNode || !document.contains(textNode)) {
          return; // 節點已被移除，跳過
        }
        textNode.replaceWith(wrapper);
      } catch (e) {
        // 如果 replaceWith 失敗，嘗試 insertBefore + remove
        try {
          const parent = textNode.parentNode;
          if (parent && document.contains(textNode)) {
            parent.insertBefore(wrapper, textNode);
            parent.removeChild(textNode);
          }
        } catch (e2) {
          // 節點可能已被 React 移除，忽略錯誤
        }
      }

      // 等待圖片加載完成後再滾動（僅 IM 貼圖需要）
      if (!isDLSticker) {
        const mediaEl = wrapper.querySelector('img, video');
        if (mediaEl) {
          const doScroll = () => {
            // 檢查消息時間，只滾動10秒內的新消息
            const msgContainer = wrapper.closest('[class*="message"], [data-testid*="message"]');
            if (msgContainer) {
              const timeEl = msgContainer.querySelector('time, [class*="time"], [class*="timestamp"]');
              if (timeEl) {
                const timeText = timeEl.textContent || timeEl.getAttribute('datetime') || '';
                const msgTime = new Date(timeText).getTime();
                if (!isNaN(msgTime) && (Date.now() - msgTime) >= 10000) {
                  return; // 超過10秒不滾動
                }
              }
            }

            // 檢查用戶是否在底部附近（距離底部200px內才滾動）
            const chatContainers = document.querySelectorAll('.overflow-y-auto.height-100');
            let chatContainer = null;
            for (const el of chatContainers) {
              if (el.scrollHeight > 3000) {
                chatContainer = el;
                break;
              }
            }
            if (chatContainer) {
              const distanceToBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight;
              if (distanceToBottom > 200) {
                return; // 用戶在看歷史消息，不打擾
              }
            }

            // 直接滾動
            wrapper.parentElement?.scrollIntoView(false);
          };

          if (mediaEl.complete || mediaEl.readyState >= 3) {
            // 圖片已加載，延遲0.5秒後滾動
            setTimeout(doScroll, 500);
          } else if (mediaEl.tagName === 'VIDEO') {
            // 視頻使用 loadeddata 事件
            mediaEl.addEventListener('loadeddata', () => setTimeout(doScroll, 500), { once: true });
          } else {
            // 圖片等待加載
            mediaEl.onload = () => setTimeout(doScroll, 500);
          }
        }
      }

      return; // 已處理，跳過常規 IM- 檢查
    }

    // 檢查明文 DL- ID 或 Twitch emote 格式 :emote/mine/dlive/xxx:
    const dlRegex = /DL-[a-zA-Z0-9_]+|:emote\/mine\/dlive\/([a-zA-Z0-9_]+):/gi;
    let dlMatch;
    let dlLastIndex = 0;
    const dlFragments = [];

    while ((dlMatch = dlRegex.exec(text)) !== null) {
      const fullMatch = dlMatch[0];
      const emoteId = dlMatch[1]; // 如果是 emote 格式，這是捕獲組中的 ID

      if (dlMatch.index > dlLastIndex) {
        dlFragments.push(document.createTextNode(text.slice(dlLastIndex, dlMatch.index)));
      }

      if (emoteId) {
        // Twitch emote 格式 :emote/mine/dlive/xxx: - 顯示實際圖片
        const img = document.createElement('img');
        img.src = `https://images.prd.dlivecdn.com/emote/${emoteId}`;
        img.alt = `DL-${emoteId}`;
        img.className = 'dlsq-im-replaced';
        img.style.cssText = 'max-width: 100px; max-height: 100px; border-radius: 8px; cursor: default; display: inline-block; vertical-align: middle; margin: 4px; border: 2px solid transparent; object-fit: contain;';
        dlFragments.push(img);
      } else {
        // 純文字 DL-xxx 格式 - 也顯示為實際圖片
        const dlId = fullMatch.slice(3); // 去掉 "DL-" 前綴
        const img = document.createElement('img');
        img.src = `https://images.prd.dlivecdn.com/emote/${dlId}`;
        img.alt = fullMatch;
        img.className = 'dlsq-im-replaced';
        img.style.cssText = 'max-width: 100px; max-height: 100px; border-radius: 8px; cursor: default; display: inline-block; vertical-align: middle; margin: 4px; border: 2px solid transparent; object-fit: contain;';
        dlFragments.push(img);
      }

      dlLastIndex = dlRegex.lastIndex;
    }

    if (dlLastIndex < text.length) {
      dlFragments.push(document.createTextNode(text.slice(dlLastIndex)));
    }

    if (dlFragments.length > 1 || (dlFragments.length === 1 && dlFragments[0].tagName === 'IMG')) {
      const wrapper = document.createElement('span');
      wrapper.className = 'dlsq-im-replaced';
      dlFragments.forEach(f => wrapper.appendChild(f));

      // 使用 replaceWith 代替 replaceChild
      try {
        if (textNode.parentNode) {
          textNode.replaceWith(wrapper);
        }
      } catch (e) {
        try {
          const parent = textNode.parentNode;
          if (parent) {
            parent.insertBefore(wrapper, textNode);
            parent.removeChild(textNode);
          }
        } catch (e2) {
          // 忽略錯誤
        }
      }
      return; // 已處理 DL，跳過 IM- 檢查
    }

    // 常規 IM- 檢查（DLive 用舊格式：IM-id.gif 或 IM-id）
    const regex = /IM-[a-zA-Z0-9]+(?:\.(?:gif|png|jpg|jpeg|mp4))?/gi;

    let match;
    let lastIndex = 0;
    const fragments = [];

    while ((match = regex.exec(text)) !== null) {
      const fullMatch = match[0];

      if (match.index > lastIndex) {
        fragments.push(document.createTextNode(text.slice(lastIndex, match.index)));
      }

      const url = DKIP.decode(fullMatch);
      if (url) {
        const isVideo = /\.mp4$/i.test(url);
        if (isVideo) {
          const video = document.createElement('video');
          video.src = url;
          video.className = 'dlsq-im-replaced';
          video.muted = true;
          video.autoplay = true;
          video.loop = true;
          video.playsInline = true;
          video.style.cssText = 'max-width: 100px; max-height: 100px; border-radius: 8px; cursor: default; display: inline-block; vertical-align: middle; margin: 4px; border: 2px solid transparent;';
          fragments.push(video);
        } else {
          const img = document.createElement('img');
          img.src = url;
          img.className = 'dlsq-im-replaced';
          img.style.cssText = 'max-width: 100px; max-height: 100px; border-radius: 8px; cursor: default; display: inline-block; vertical-align: middle; margin: 4px; border: 2px solid transparent;';
          fragments.push(img);
        }
      } else {
        fragments.push(document.createTextNode(fullMatch));
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      fragments.push(document.createTextNode(text.slice(lastIndex)));
    }

    if (fragments.length > 1 || (fragments.length === 1 && (fragments[0].tagName === 'IMG' || fragments[0].tagName === 'VIDEO'))) {
      const wrapper = document.createElement('span');
      wrapper.className = 'dlsq-im-replaced';
      fragments.forEach(f => wrapper.appendChild(f));

      // 使用 replaceWith 代替 replaceChild，更兼容 React
      try {
        if (textNode.parentNode) {
          textNode.replaceWith(wrapper);
        }
      } catch (e) {
        try {
          const parent = textNode.parentNode;
          if (parent) {
            parent.insertBefore(wrapper, textNode);
            parent.removeChild(textNode);
          }
        } catch (e2) {
          // 忽略錯誤
        }
      }
    }
  });
}

// 右鍵 imgur 圖片發送功能
function getImageUrlFromTarget(target) {
  if (!target) return null;
  if (target.tagName === 'IMG' && target.src) return target.src;
  if (target.tagName === 'VIDEO' && target.src) return target.src;
  const img = target.closest?.('img');
  if (img?.src) return img.src;
  const video = target.closest?.('video');
  if (video?.src) return video.src;
  return null;
}

function extractImgurId(url, useTwitchFormat = false) {
  if (!url) return null;
  const match = url.match(/(?:i\.)?imgur\.com\/([a-zA-Z0-9]+)(?:\.(gif|png|jpg|jpeg|mp4))?/i);
  if (!match) return null;
  const id = match[1];
  const ext = match[2] || 'gif'; // 默認 gif
  if (useTwitchFormat) {
    // Twitch 格式：IM-ha3eTC7-gif（用 - 代替 .）
    return `${id}-${ext}`;
  }
  // 標準格式：ha3eTC7.gif
  return ext === 'gif' ? id : `${id}.${ext}`;
}

// 初始化 IM 功能
// 全局標誌：是否正在發送消息（用於暫停 IM 轉圖掃描）
let isSendingMessage = false;

function initIMFeature() {
  // 【修復】DLive 和 Twitch 分開處理
  const isTwitchPage = window.location.hostname.includes('twitch.tv');

  if (!isTwitchPage) {
    // ===== DLive 頁面：完整 IM 轉圖功能 =====
    setInterval(() => {
      if (!isSendingMessage) scanAndReplaceIMImages();
    }, 1500);

    const chatContainer = document.querySelector('.chat-list, .chat-scroll-area, [class*="chat-list"], [class*="message-list"]');
    if (chatContainer) {
      let mutationTimeout = null;
      const observer = new MutationObserver((mutations) => {
        if (isSendingMessage) return;
        if (mutationTimeout) clearTimeout(mutationTimeout);
        mutationTimeout = setTimeout(() => {
          mutationTimeout = null;
          const hasNewMessages = mutations.some(m => {
            return Array.from(m.addedNodes).some(n => {
              return n.nodeType === Node.ELEMENT_NODE && (
                n.matches?.('[class*="message"]') ||
                n.querySelector?.('[class*="message"]')
              );
            });
          });
          if (hasNewMessages) scanAndReplaceIMImages();
        }, 100);
      });
      observer.observe(chatContainer, { childList: true, subtree: true });
    }
  } else {
    // ===== Twitch 頁面：只處理聊天消息列表，完全避開輸入框區域 =====
    // 延遲啟動，等待頁面完全渲染
    setTimeout(() => {
      initTwitchIMFeature();
    }, 2000);
  }

  // 右鍵 imgur 圖片選單（所有頁面）
  document.addEventListener('contextmenu', (e) => {
    const url = getImageUrlFromTarget(e.target);
    if (!url || !extractImgurId(url)) return;
    e.preventDefault();
    // 【Twitch 格式】使用 -gif 格式（用 - 代替 .）
    const isTwitchPage = window.location.hostname.includes('twitch.tv');
    const id = 'IM-' + extractImgurId(url, isTwitchPage);
    showContextMenuAt(e.clientX, e.clientY, id, e.target);
  }, true);
}

// ===== Twitch 專用的 IM 轉圖功能 =====
function initTwitchIMFeature() {
  // 只查找 Twitch 聊天消息列表（不是輸入框）
  const chatList = document.querySelector('.chat-list, [data-a-target="chat-list"], .chat-scroll-area, [class*="chat-list"]');
  if (!chatList) {
    return;
  }

  // 只在聊天列表內掃描，不掃描整個 body
  setInterval(() => {
    if (!isSendingMessage) {
      scanTwitchChatMessages(chatList);
    }
  }, 2000); // Twitch 用較長間隔，減少衝突

  // 只在聊天列表上監聽變化
  let mutationTimeout = null;
  const observer = new MutationObserver((mutations) => {
    // 發送消息期間暫停
    if (isSendingMessage) return;

    // 檢查是否有新增消息
    const hasNewMessages = mutations.some(m => {
      return Array.from(m.addedNodes).some(n => {
        return n.nodeType === Node.ELEMENT_NODE && (
          n.matches?.('[class*="chat-line"], [data-a-target="chat-line-message"], [class*="message"]') ||
          n.querySelector?.('[class*="chat-line"], [data-a-target="chat-line-message"]')
        );
      });
    });

    if (hasNewMessages) {
      if (mutationTimeout) clearTimeout(mutationTimeout);
      mutationTimeout = setTimeout(() => {
        mutationTimeout = null;
        scanTwitchChatMessages(chatList);
      }, 200);
    }
  });

  observer.observe(chatList, { childList: true, subtree: true });
}

// Twitch 專用的聊天消息掃描
function scanTwitchChatMessages(chatContainer) {
  // 只查找聊天消息行，不查找輸入框
  const messageElements = chatContainer.querySelectorAll('[class*="chat-line"], [data-a-target="chat-line-message"], .chat-message');

  messageElements.forEach(msgEl => {
    // 【關鍵】跳過任何靠近輸入框的元素
    if (msgEl.closest('[data-a-target="chat-input"], [class*="chat-input"], [contenteditable="true"]')) {
      return;
    }

    // 跳過已處理過的（檢查是否已有轉換後的圖片或標記）
    if (msgEl.querySelector('.gss-im-replaced, .gss-im-image, .gss-im-converted')) return;
    if (msgEl.dataset.gssImProcessed) return;

    // 查找消息中的文本節點
    const walker = document.createTreeWalker(
      msgEl,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent;
      // 檢查 IM- 或 DL- 格式
      if (text.includes('IM-') || text.includes('DL-') || /[\u200B\u200C\u200D\uFEFF]/.test(text)) {
        // 確保不是輸入框內的節點
        if (!node.parentElement?.closest('[contenteditable="true"], [data-a-target="chat-input"]')) {
          textNodes.push(node);
        }
      }
    }

    // 處理找到的文本節點
    textNodes.forEach(textNode => {
      processTwitchIMTextNode(textNode, msgEl);
    });

    // 標記已處理
    if (textNodes.length > 0) {
      msgEl.dataset.gssImProcessed = 'true';
    }
  });
}

// 處理 Twitch 聊天消息中的 IM 文本
function processTwitchIMTextNode(textNode, messageEl) {
  const text = textNode.textContent;

  // 檢查零寬字符（隱藏貼圖）
  const zwChars = text.match(/[\u200B\u200C\u200D\uFEFF]/g);
  if (zwChars && zwChars.length >= 8) {
    try {
      const decoded = decodeFromZeroWidth(zwChars.join(''));
      if (decoded && (decoded.startsWith('IM-') || decoded.startsWith('DL-'))) {
        // 創建圖片元素替換文字
        const img = createIMImage(decoded);
        if (img) {
          // 使用更安全的方式：隱藏原文字，插入圖片
          const span = document.createElement('span');
          span.className = 'gss-im-image';
          span.appendChild(img);

          try {
            textNode.parentNode.insertBefore(span, textNode);
            textNode.parentNode.removeChild(textNode);
            // 【修復】給父元素添加標記，防止 React 重渲染後重複處理
            textNode.parentNode.classList.add('gss-im-converted');
          } catch (e) {
            // 忽略錯誤
          }
        }
      }
    } catch (e) {
      // 忽略解碼錯誤
    }
    return;
  }

  // 【Twitch 專用】合併匹配 IM 和 DL 格式，避免重複替換問題
  const combinedRegex = /(IM-[a-zA-Z0-9-]+-(?:gif|png|jpg|jpeg|mp4))|(DL-[a-zA-Z0-9_]+)/gi;
  const matches = [];
  let m;
  while ((m = combinedRegex.exec(text)) !== null) {
    if (m[1]) {
      matches.push({ type: 'IM', id: m[1], index: m.index, length: m[1].length });
    } else if (m[2]) {
      matches.push({ type: 'DL', id: m[2], index: m.index, length: m[2].length });
    }
  }

  if (matches.length === 0) return;

  // 從後向前替換，避免索引偏移
  matches.reverse().forEach(match => {
    const img = createIMImage(match.id);
    if (img && textNode.parentNode) {
      try {
        const before = text.slice(0, match.index);
        const after = text.slice(match.index + match.length);

        const fragment = document.createDocumentFragment();
        if (before) fragment.appendChild(document.createTextNode(before));
        fragment.appendChild(img);
        if (after) fragment.appendChild(document.createTextNode(after));

        textNode.parentNode.replaceChild(fragment, textNode);
        // 【修復】給父元素添加標記，防止 React 重渲染後重複處理
        if (textNode.parentNode) {
          textNode.parentNode.classList.add('gss-im-converted');
        }
        // 更新 textNode 為 after 部分，以便下一個替換
        if (after && textNode.parentNode) {
          const newNodes = Array.from(textNode.parentNode.childNodes);
          const afterNode = newNodes.find(n => n.nodeType === Node.TEXT_NODE && n.textContent === after);
          if (afterNode) {
            textNode = afterNode;
            text = after;
          }
        }
      } catch (e) {
        // 忽略錯誤
      }
    }
  });
}

// 創建 IM 圖片/視頻元素（根據類型自動選擇 img 或 video）
function createIMImage(imId) {
  const isDL = imId.startsWith('DL-');

  if (isDL) {
    const dlId = imId.slice(3);
    const img = document.createElement('img');
    img.src = `https://images.prd.dlivecdn.com/emote/${dlId}`;
    img.alt = imId;
    img.className = 'gss-im-replaced';
    img.style.cssText = 'max-width: 100px; max-height: 100px; border-radius: 8px; cursor: default; display: inline-block; vertical-align: middle; margin: 4px; border: 2px solid transparent; object-fit: contain;';
    return img;
  }

  // IM 貼圖：先解碼 URL 判斷類型
  const url = DKIP.decode(imId);
  if (!url) return null;

  // 檢查是否為視頻（.mp4）
  const isVideo = /\.mp4$/i.test(url) || imId.toLowerCase().endsWith('-mp4') || imId.toLowerCase().endsWith('.mp4');

  if (isVideo) {
    // 創建 video 元素
    const video = document.createElement('video');
    video.src = url;
    video.alt = imId;
    video.className = 'gss-im-replaced';
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.style.cssText = 'max-width: 100px; max-height: 100px; border-radius: 8px; cursor: default; display: inline-block; vertical-align: middle; margin: 4px; border: 2px solid transparent; object-fit: contain;';
    return video;
  } else {
    // 創建 img 元素
    const img = document.createElement('img');
    img.src = url;
    img.alt = imId;
    img.className = 'gss-im-replaced';
    img.style.cssText = 'max-width: 100px; max-height: 100px; border-radius: 8px; cursor: default; display: inline-block; vertical-align: middle; margin: 4px; border: 2px solid transparent; object-fit: contain;';
    return img;
  }
}

function findTitleArea() {
  // 找標題/直播資訊區域 - DLive 使用 #livestream-info 或 .livestream-info
  const selectors = [
    '#livestream-info',
    '.livestream-info',
    '.living-duration',
    '.stream-title',
    '[class*="livestream-info"]',
    '[class*="living-duration"]',
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      return el;
    }
  }

  // 備選：找包含特定文字的區域（排除已隱藏的）
  const allDivs = document.querySelectorAll('div');
  for (const div of allDivs) {
    const text = div.textContent || '';
    const style = window.getComputedStyle(div);
    // 找包含直播資訊且可見的區域
    if ((text.includes('直播中') || text.includes('LIVE') || text.includes('觀看'))
      && div.offsetHeight > 30
      && div.offsetHeight < 300
      && style.display !== 'none') {
      return div;
    }
  }

  return null;
}

function findDonationArea() {
  // 找課金區域
  const selectors = [
    '.donation-wrapper',
    '.donation-box',
    '[class*="donation"]',
    '[class*="donate"]',
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) return el;
  }

  // 備選：找包含特定文字的區域
  const allDivs = document.querySelectorAll('div');
  for (const div of allDivs) {
    const text = div.textContent?.toLowerCase() || '';
    if ((text.includes('donate') || text.includes('課金') || text.includes('贊助')) && div.offsetHeight > 50) {
      return div;
    }
  }

  return null;
}

function findChatArea() {
  const selectors = ['.chatroom-right', '[class*="chatroom"]', '.chat-room', '.chat-container'];
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) return el;
  }
  return null;
}

function findSidebar() {
  return document.querySelector('.sidebar');
}

function findNavbar() {
  const navbar = document.querySelector('.nav-bar');
  // 返回父元素，這樣隱藏時可以移除整個頂部區域
  return navbar?.parentElement || navbar;
}

// ==================== 全螢幕聊天室功能 ====================
let fullscreenChatActive = false;
let fullscreenChatClone = null;
let fullscreenScrollSyncInterval = null;
let blackBgActiveFix1 = false;

// 初始化全螢幕聊天室功能
function initFullscreenChat() {
  // 監聽全螢幕變化
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);

  // 監聽鍵盤事件（按C鍵切換聊天室）
  document.addEventListener('keydown', (e) => {
    // 只在全螢幕模式下響應，且不是輸入框
    if (!isFullscreen()) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'c' || e.key === 'C') {
      toggleFullscreenChat();
    }
  });

  // 【修復】阻止全螢幕影片捕獲左右鍵事件
  document.addEventListener('keydown', (e) => {
    if (!isFullscreen()) return;

    // 當聊天室顯示時，阻止左右鍵傳播到影片
    if (fullscreenChatActive) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.stopPropagation();
        e.preventDefault();
      }
    }
  }, true); // 使用 capture 階段確保先攔截

  // 監聽滑鼠移動（移到右邊顯示聊天室）
  document.addEventListener('mousemove', (e) => {
    if (!isFullscreen()) return;

    const screenWidth = window.screen.width;
    const mouseX = e.clientX;

    // 滑鼠移到畫面右邊 50px 內，自動顯示聊天室
    if (mouseX > screenWidth - 50) {
      if (!fullscreenChatActive) {
        showFullscreenChat();
      }
    }
  });
}

// 檢查是否處於全螢幕模式
function isFullscreen() {
  return !!(document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement);
}

// 處理全螢幕變化
function handleFullscreenChange() {
  if (isFullscreen()) {
    // 進入全螢幕，準備聊天室
    prepareFullscreenChat();
  } else {
    // 退出全螢幕，清理
    cleanupFullscreenChat();
  }
}

// 準備全螢幕聊天室
function prepareFullscreenChat() {
  const originalChat = findChatArea();
  if (!originalChat) return;

  // 【改為浮動聊天室方式】給原始聊天室添加浮動 class
  originalChat.classList.add('dlsq-chat-overlay');

  // 【修復】移除聊天室頂部陰影（參考劇院模式13）
  const topContributors = document.querySelector('.top-contributors');
  if (topContributors) {
    topContributors.style.setProperty('box-shadow', 'none', 'important');
  }

  // 儲存原始樣式以便恢復
  if (!originalChat.dataset.originalFullscreenStyles) {
    originalChat.dataset.originalFullscreenStyles = originalChat.style.cssText;
  }

  // 設定全螢幕浮動樣式
  originalChat.style.cssText = `
    position: fixed !important;
    right: 0 !important;
    top: 60px !important;
    width: 350px !important;
    height: calc(100vh - 60px) !important;
    z-index: 999999 !important;
    display: none !important;
    background: transparent !important;
    overflow-y: auto !important;
    pointer-events: auto !important;
    user-select: text !important;
    -webkit-user-select: text !important;
  `;

  // 將聊天室移到全螢幕元素中
  const fullscreenEl = document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement;
  if (fullscreenEl) {
    fullscreenEl.appendChild(originalChat);
    fullscreenChatClone = originalChat;

    // 【修復】為所有子元素添加 pointer-events: auto 確保可互動
    originalChat.querySelectorAll('*').forEach(child => {
      child.style.setProperty('pointer-events', 'auto', 'important');
    });

    // 【關鍵】將插件面板也移到全螢幕元素中
    const panel = document.getElementById(UI.panelId);
    if (panel && panel.parentNode !== fullscreenEl) {
      fullscreenEl.appendChild(panel);
    }

    // 【關鍵】將右鍵選單也移到全螢幕元素中
    const ctxMenu = document.getElementById(UI.ctxMenuId);
    if (ctxMenu && ctxMenu.parentNode !== fullscreenEl) {
      fullscreenEl.appendChild(ctxMenu);
    }

    // 【關鍵】將面板標籤選單也移到全螢幕元素中
    const panelTagMenu = document.getElementById(UI.panelTagMenuId);
    if (panelTagMenu && panelTagMenu.parentNode !== fullscreenEl) {
      fullscreenEl.appendChild(panelTagMenu);
    }
  }
}

// 切換全螢幕聊天室顯示
function toggleFullscreenChat() {
  if (fullscreenChatActive) {
    hideFullscreenChat();
  } else {
    showFullscreenChat();
  }
}

// 顯示全螢幕聊天室
function showFullscreenChat() {
  if (fullscreenChatClone) {
    fullscreenChatClone.style.setProperty('display', 'block', 'important');
    fullscreenChatActive = true;

    // 同步滾動位置
    const originalChat = findChatArea();
    if (originalChat) {
      fullscreenChatClone.scrollTop = originalChat.scrollTop;
    }
  }
}

// 隱藏全螢幕聊天室
function hideFullscreenChat() {
  if (fullscreenChatClone) {
    fullscreenChatClone.style.setProperty('display', 'none', 'important');
    fullscreenChatActive = false;
  }
}

// 清理全螢幕聊天室
function cleanupFullscreenChat() {
  // 清除捲動同步定時器
  if (fullscreenScrollSyncInterval) {
    clearInterval(fullscreenScrollSyncInterval);
    fullscreenScrollSyncInterval = null;
  }

  if (fullscreenChatClone) {
    // 移除浮動 class
    fullscreenChatClone.classList.remove('dlsq-chat-overlay');

    // 【修復】恢復聊天室頂部陰影（參考劇院模式13）
    const topContributors = document.querySelector('.top-contributors');
    if (topContributors) {
      topContributors.style.removeProperty('box-shadow');
    }

    // 恢復原始樣式
    if (fullscreenChatClone.dataset.originalFullscreenStyles) {
      fullscreenChatClone.style.cssText = fullscreenChatClone.dataset.originalFullscreenStyles;
      delete fullscreenChatClone.dataset.originalFullscreenStyles;
    } else {
      fullscreenChatClone.style.cssText = '';
    }

    // 將聊天室放回原始 flex 容器
    const flexBox = document.querySelector('.flex-box.dl-flex-row');
    if (flexBox && fullscreenChatClone.parentNode !== flexBox) {
      flexBox.appendChild(fullscreenChatClone);
    }
  }

  // 【關鍵】將面板移回 body
  const panel = document.getElementById(UI.panelId);
  if (panel && panel.parentNode !== document.body) {
    document.body.appendChild(panel);
  }

  // 【關鍵】將右鍵選單移回 body
  const ctxMenu = document.getElementById(UI.ctxMenuId);
  if (ctxMenu && ctxMenu.parentNode !== document.body) {
    document.body.appendChild(ctxMenu);
  }

  // 【關鍵】將面板標籤選單移回 body
  const panelTagMenu = document.getElementById(UI.panelTagMenuId);
  if (panelTagMenu && panelTagMenu.parentNode !== document.body) {
    document.body.appendChild(panelTagMenu);
  }

  fullscreenChatClone = null;
  fullscreenChatActive = false;
}

// 啟動 UI（先遷移 sync → local，避免舊資料留在已爆量的 sync）
(async function dlsqBootContent() {
  try {
    if (typeof DLSQStickerStore !== 'undefined') {
      await DLSQStickerStore.migrateFromSyncIfNeeded();
    }
  } catch (e) {
    // DLSQ sticker migrate error
  }
  setupUiAutoMount();
  initIMFeature();
  initFullscreenChat();
})();