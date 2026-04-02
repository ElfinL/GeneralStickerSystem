/**
 * i18n.js - 語言國際化模組
 * General Sticker System (GSS) 插件的語言切換功能
 */

const I18N = {
  'zh-TW': {
    headerSubtitle: '通用貼圖系統 (GSS)',
    configTitle: '貼圖 ID 與標籤',
    configHint: '一行一組：DL-xxx 或 IM-xxx，後可接 #標籤（每張最多 4 個）',
    tagVocabTitle: '標籤詞庫（一行一個）',
    tagVocabHint: '頻道頁右鍵貼圖或面板內右鍵可套用；每張最多 4 個標籤',
    saveButton: '儲存 ID 清單與詞庫',
    reminder: '提醒：需要先在 DLive 或 Twitch 登入；並在頻道頁使用',
    footer: '',
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
    lineInfo: (current, total) => `第 ${current} 行 / 共 ${total} 行`,
    gotoLinePlaceholder: '跳轉到行',
    gotoLineButton: '跳轉',
    idPlaceholder: 'DL-826c4ac1e004273_498281 #梗圖 #反應\nIM-ha3eTC7.gif #搞笑\nDL-826cd8c8b004273_335245',
    vocabPlaceholder: 'meme\nreaction\n搞笑',
    errBadId: (id) => `${id || ''}`.trim() || '無效 ID',
    errBadTag: (id, tag) => `${id}: #${tag} 無效`,
    errTooManyTags: (id) => `${id}: 標籤超過 4 個`,
    errDupId: (id) => `重複 ID: ${id}`,
    errUnknown: '未知錯誤',
    dliveTheaterTitle: '🎭 劇院模式',
    dliveTheaterMode: '🎭 劇院模式',
    dliveZoomReset: '🔄 縮放重置',
    dliveZoomOut: '🔍- 縮小10%',
    dliveZoomIn: '🔍+ 放大10%',
    dliveChatTitle: '💬 聊天室控制',
    dliveChatNarrow: '💬 聊天室變窄',
    dliveChatHidden: '🚫 隱藏聊天室',
    dliveChatOverlay: '🎬 浮動聊天室',
    dliveElementTitle: '👁️ 元素控制',
    dliveNavbar: '📌 隱藏頂部欄',
    dliveTitle: '👁️ 隱藏標題',
    dliveDonation: '💰 隱藏送禮區',
    dliveSidebar: '📁 隱藏側邊欄',
    dliveAbout: '📦 隱藏下方區',
    dliveBlackBg: '🖤 黑色背景',
    dliveStatusHint: 'ℹ️ 這些功能只在 DLive 頻道頁面有效',
    helpTitle: '使用說明',
    helpContent: `<p><b>貼圖格式：</b></p>
<ul>
  <li>DL-xxx：DLive 官方貼圖</li>
  <li>IM-xxx：Imgur 圖片/影片</li>
</ul>
<p><b>標籤功能：</b></p>
<ul>
  <li>每張貼圖可添加最多 4 個標籤</li>
  <li>格式：ID #標籤1 #標籤2</li>
</ul>
<p><b>快捷操作：</b></p>
<ul>
  <li>★ 標記常用</li>
  <li>✕ 刪除貼圖</li>
  <li>右鍵貼圖可添加標籤</li>
</ul>
<p><b>DLive 功能：</b></p>
<ul>
  <li>劇院模式：全屏觀看體驗</li>
  <li>聊天室控制：調整聊天室顯示</li>
</ul>`,
  },
  'zh-CN': {
    headerSubtitle: '通用贴图系统 (GSS)',
    configTitle: '贴纸 ID 与标签',
    configHint: '一行一组：DL-xxx 或 IM-xxx，后可接 #标签（每张最多 4 个）',
    tagVocabTitle: '标签词库（一行一个）',
    tagVocabHint: '频道页右键贴纸或面板内右键可套用；每张最多 4 个标签',
    saveButton: '保存 ID 清单与词库',
    reminder: '提醒：需要先在 DLive 或 Twitch 登录；并在频道页使用',
    footer: '',
    favTitle: '常用',
    delTitle: '删除',
    statusFavOn: '✅ 已标记常用',
    statusFavOff: '✅ 已取消常用',
    statusCleared: '✅ 已清空 ID 清单',
    statusSavedCount: (n) => `✅ 已保存 ${n} 个 ID`,
    statusDeleted: '✅ 已删除',
    statusInvalidId: (id) => `❌ ID 格式错误：${id}`,
    statusParseErr: (detail) => `❌ 清单格式错误：${detail}`,
    statusVocabBadLine: (line) => `❌ 词库无效标签（最多 16 字符、不可空白/#）：${line}`,
    lineInfo: (current, total) => `第 ${current} 行 / 共 ${total} 行`,
    gotoLinePlaceholder: '跳转到行',
    gotoLineButton: '跳转',
    idPlaceholder: 'DL-826c4ac1e004273_498281 #梗图 #反应\nIM-ha3eTC7.gif #搞笑\nDL-826cd8c8b004273_335245',
    vocabPlaceholder: 'meme\nreaction\n搞笑',
    errBadId: (id) => `${id || ''}`.trim() || '无效 ID',
    errBadTag: (id, tag) => `${id}: #${tag} 无效`,
    errTooManyTags: (id) => `${id}: 标签超过 4 个`,
    errDupId: (id) => `重复 ID: ${id}`,
    errUnknown: '未知错误',
    dliveTheaterTitle: '🎭 剧院模式',
    dliveTheaterMode: '🎭 剧院模式',
    dliveZoomReset: '🔄 缩放重置',
    dliveZoomOut: '🔍- 缩小10%',
    dliveZoomIn: '🔍+ 放大10%',
    dliveChatTitle: '💬 聊天室控制',
    dliveChatNarrow: '💬 聊天室变窄',
    dliveChatHidden: '🚫 隐藏聊天室',
    dliveChatOverlay: '🎬 浮动聊天室',
    dliveElementTitle: '👁️ 元素控制',
    dliveNavbar: '📌 隐藏顶部栏',
    dliveTitle: '👁️ 隐藏标题',
    dliveDonation: '💰 隐藏送礼区',
    dliveSidebar: '📁 隐藏侧边栏',
    dliveAbout: '📦 隐藏下方区',
    dliveBlackBg: '🖤 黑色背景',
    dliveStatusHint: 'ℹ️ 这些功能只在 DLive 频道页面有效',
    helpTitle: '使用说明',
    helpContent: `<p><b>贴纸格式：</b></p>
<ul>
  <li>DL-xxx：DLive 官方贴纸</li>
  <li>IM-xxx：Imgur 图片/视频</li>
</ul>
<p><b>标签功能：</b></p>
<ul>
  <li>每张贴纸可添加最多 4 个标签</li>
  <li>格式：ID #标签1 #标签2</li>
</ul>
<p><b>快捷操作：</b></p>
<ul>
  <li>★ 标记常用</li>
  <li>✕ 删除贴纸</li>
  <li>右键贴纸可添加标签</li>
</ul>
<p><b>DLive 功能：</b></p>
<ul>
  <li>剧院模式：全屏观看体验</li>
  <li>聊天室控制：调整聊天室显示</li>
</ul>`,
  },
  en: {
    headerSubtitle: 'General Sticker System (GSS)',
    configTitle: 'Sticker IDs & tags',
    configHint: 'One per line: DL-xxx or IM-xxx, then optional #tags (max 4 tags)',
    tagVocabTitle: 'Tag vocabulary (one per line)',
    tagVocabHint: 'Right-click emote on channel or tile in panel to apply tags; max 4 tags per sticker',
    saveButton: 'Save IDs & vocabulary',
    reminder: 'Tip: Log in to DLive or Twitch first and use this on a channel page',
    footer: '',
    favTitle: 'Favorite',
    delTitle: 'Delete',
    statusFavOn: '✅ Marked as favorite',
    statusFavOff: '✅ Unmarked as favorite',
    statusCleared: '✅ Cleared ID list',
    statusSavedCount: (n) => `✅ Saved ${n} IDs`,
    statusDeleted: '✅ Deleted',
    statusInvalidId: (id) => `❌ Invalid ID format: ${id}`,
    statusParseErr: (detail) => `❌ List parse error: ${detail}`,
    statusVocabBadLine: (line) => `❌ Invalid tag (max 16 chars, no spaces/# allowed): ${line}`,
    lineInfo: (current, total) => `Line ${current} / ${total} total`,
    gotoLinePlaceholder: 'Go to line',
    gotoLineButton: 'Go',
    idPlaceholder: 'DL-826c4ac1e004273_498281 #meme #reaction\nIM-ha3eTC7.gif #funny\nDL-826cd8c8b004273_335245',
    vocabPlaceholder: 'meme\nreaction\nfunny',
    errBadId: (id) => `${id || ''}`.trim() || 'Invalid ID',
    errBadTag: (id, tag) => `${id}: Invalid tag #${tag}`,
    errTooManyTags: (id) => `${id}: More than 4 tags`,
    errDupId: (id) => `Duplicate ID: ${id}`,
    errUnknown: 'Unknown error',
    dliveTheaterTitle: '🎭 Theater Mode',
    dliveTheaterMode: '🎭 Theater Mode',
    dliveZoomReset: '🔄 Zoom Reset',
    dliveZoomOut: '🔍- Zoom Out 10%',
    dliveZoomIn: '🔍+ Zoom In 10%',
    dliveChatTitle: '💬 Chat Control',
    dliveChatNarrow: '💬 Narrow Chat',
    dliveChatHidden: '🚫 Hide Chat',
    dliveChatOverlay: '🎬 Float Chat',
    dliveElementTitle: '👁️ Elements',
    dliveNavbar: '📌 Hide Navbar',
    dliveTitle: '👁️ Hide Title',
    dliveDonation: '💰 Hide Gift Area',
    dliveSidebar: '📁 Hide Sidebar',
    dliveAbout: '📦 Hide About',
    dliveBlackBg: '🖤 Black Bg',
    dliveStatusHint: 'ℹ️ These features only work on DLive channel pages',
    helpTitle: 'Help',
    helpContent: `<p><b>Sticker Formats:</b></p>
<ul>
  <li>DL-xxx: DLive official emotes</li>
  <li>IM-xxx: Imgur images/videos</li>
</ul>
<p><b>Tags:</b></p>
<ul>
  <li>Max 4 tags per sticker</li>
  <li>Format: ID #tag1 #tag2</li>
</ul>
<p><b>Shortcuts:</b></p>
<ul>
  <li>★ Mark as favorite</li>
  <li>✕ Delete sticker</li>
  <li>Right-click to add tags</li>
</ul>
<p><b>DLive Features:</b></p>
<ul>
  <li>Theater Mode: Fullscreen viewing</li>
  <li>Chat Control: Adjust chat display</li>
</ul>`,
  },
  ja: {
    headerSubtitle: '汎用ステッカーシステム (GSS)',
    configTitle: 'ステッカーIDとタグ',
    configHint: '1行1つ：DL-xxx または IM-xxx、後に #タグを追加可能（最大4つ）',
    tagVocabTitle: 'タグ辞書（1行1つ）',
    tagVocabHint: 'チャンネルまたはパネルで右クリックしてタグを適用；1ステッカー最大4タグ',
    saveButton: 'IDリストと辞書を保存',
    reminder: 'ヒント：DLiveまたはTwitchにログインして、チャンネルページで使用してください',
    footer: '',
    favTitle: 'お気に入り',
    delTitle: '削除',
    statusFavOn: '✅ お気に入りに追加',
    statusFavOff: '✅ お気に入りから削除',
    statusCleared: '✅ IDリストをクリア',
    statusSavedCount: (n) => `✅ ${n}個のIDを保存`,
    statusDeleted: '✅ 削除しました',
    statusInvalidId: (id) => `❌ ID形式エラー：${id}`,
    statusParseErr: (detail) => `❌ リスト形式エラー：${detail}`,
    statusVocabBadLine: (line) => `❌ 無効なタグ（最大16文字、空白/#不可）：${line}`,
    lineInfo: (current, total) => `行 ${current} / ${total}`,
    gotoLinePlaceholder: '行へ移動',
    gotoLineButton: '移動',
    idPlaceholder: 'DL-826c4ac1e004273_498281 #ミーム #反応\nIM-ha3eTC7.gif #面白い\nDL-826cd8c8b004273_335245',
    vocabPlaceholder: 'ミーム\n反応\n面白い',
    errBadId: (id) => `${id || ''}`.trim() || '無効なID',
    errBadTag: (id, tag) => `${id}: #${tag} は無効`,
    errTooManyTags: (id) => `${id}: タグは4つまで`,
    errDupId: (id) => `重複ID: ${id}`,
    errUnknown: '不明なエラー',
    dliveTheaterTitle: '🎭 シアターモード',
    dliveTheaterMode: '🎭 シアターモード',
    dliveZoomReset: '🔄 ズームリセット',
    dliveZoomOut: '🔍- 縮小10%',
    dliveZoomIn: '🔍+ 拡大10%',
    dliveChatTitle: '💬 チャット制御',
    dliveChatNarrow: '💬 チャット縮小',
    dliveChatHidden: '🚫 チャット非表示',
    dliveChatOverlay: '🎬 フローティングチャット',
    dliveElementTitle: '👁️ 要素制御',
    dliveNavbar: '📌 ナビバー非表示',
    dliveTitle: '👁️ タイトル非表示',
    dliveDonation: '💰 ギフトエリア非表示',
    dliveSidebar: '📁 サイドバー非表示',
    dliveAbout: '📦 下部非表示',
    dliveBlackBg: '🖤 黒背景',
    dliveStatusHint: 'ℹ️ これらの機能はDLiveチャンネルページでのみ有効',
    helpTitle: '使い方',
    helpContent: `<p><b>ステッカー形式：</b></p>
<ul>
  <li>DL-xxx：DLive公式ステッカー</li>
  <li>IM-xxx：Imgur画像/動画</li>
</ul>
<p><b>タグ機能：</b></p>
<ul>
  <li>ステッカー1つに最大4タグ</li>
  <li>形式：ID #タグ1 #タグ2</li>
</ul>
<p><b>ショートカット：</b></p>
<ul>
  <li>★ お気に入り登録</li>
  <li>✕ ステッカー削除</li>
  <li>右クリックでタグ追加</li>
</ul>
<p><b>DLive機能：</b></p>
<ul>
  <li>シアターモード：全画面表示</li>
  <li>チャット制御：チャット表示調整</li>
</ul>`,
  },
  ko: {
    headerSubtitle: '범용 스티커 시스템 (GSS)',
    configTitle: '스티커 ID와 태그',
    configHint: '한 줄에 하나: DL-xxx 또는 IM-xxx, 선택적으로 #태그 추가 (최대 4개)',
    tagVocabTitle: '태그 사전 (한 줄에 하나)',
    tagVocabHint: '채널 또는 패널에서 우클릭하여 태그 적용; 스티커당 최대 4개 태그',
    saveButton: 'ID 목록과 사전 저장',
    reminder: '팁: DLive 또는 Twitch에 먼저 로그인하고 채널 페이지에서 사용하세요',
    footer: '',
    favTitle: '즐겨찾기',
    delTitle: '삭제',
    statusFavOn: '✅ 즐겨찾기 추가됨',
    statusFavOff: '✅ 즐겨찾기 제거됨',
    statusCleared: '✅ ID 목록 지워짐',
    statusSavedCount: (n) => `✅ ${n}개 ID 저장됨`,
    statusDeleted: '✅ 삭제됨',
    statusInvalidId: (id) => `❌ ID 형식 오류: ${id}`,
    statusParseErr: (detail) => `❌ 목록 형식 오류: ${detail}`,
    statusVocabBadLine: (line) => `❌ 유효하지 않은 태그 (최대 16자, 공백/# 불가): ${line}`,
    lineInfo: (current, total) => `줄 ${current} / ${total}`,
    gotoLinePlaceholder: '줄로 이동',
    gotoLineButton: '이동',
    idPlaceholder: 'DL-826c4ac1e004273_498281 #밈 #반응\nIM-ha3eTC7.gif #웃긴\nDL-826cd8c8b004273_335245',
    vocabPlaceholder: '밈\n반응\n웃긴',
    errBadId: (id) => `${id || ''}`.trim() || '유효하지 않은 ID',
    errBadTag: (id, tag) => `${id}: #${tag} 유효하지 않음`,
    errTooManyTags: (id) => `${id}: 태그는 4개까지`,
    errDupId: (id) => `중복 ID: ${id}`,
    errUnknown: '알 수 없는 오류',
    dliveTheaterTitle: '🎭 극장 모드',
    dliveTheaterMode: '🎭 극장 모드',
    dliveZoomReset: '🔄 줌 리셋',
    dliveZoomOut: '🔍- 축소 10%',
    dliveZoomIn: '🔍+ 확대 10%',
    dliveChatTitle: '💬 채팅 제어',
    dliveChatNarrow: '💬 채팅 좁게',
    dliveChatHidden: '🚫 채팅 숨기기',
    dliveChatOverlay: '🎬 플로팅 채팅',
    dliveElementTitle: '👁️ 요소 제어',
    dliveNavbar: '📌 네비바 숨기기',
    dliveTitle: '👁️ 제목 숨기기',
    dliveDonation: '💰 선물 영역 숨기기',
    dliveSidebar: '📁 사이드바 숨기기',
    dliveAbout: '📦 하단 숨기기',
    dliveBlackBg: '🖤 검은 배경',
    dliveStatusHint: 'ℹ️ 이 기능은 DLive 채널 페이지에서만 작동',
    helpTitle: '사용 방법',
    helpContent: `<p><b>스티커 형식：</b></p>
<ul>
  <li>DL-xxx: DLive 공식 스티커</li>
  <li>IM-xxx: Imgur 이미지/영상</li>
</ul>
<p><b>태그 기능：</b></p>
<ul>
  <li>스티커당 최대 4개 태그</li>
  <li>형식: ID #태그1 #태그2</li>
</ul>
<p><b>단축키：</b></p>
<ul>
  <li>★ 즐겨찾기 추가</li>
  <li>✕ 스티커 삭제</li>
  <li>우클릭으로 태그 추가</li>
</ul>
<p><b>DLive 기능：</b></p>
<ul>
  <li>극장 모드: 전체 화면 보기</li>
  <li>채팅 제어: 채팅 표시 조정</li>
</ul>`,
  }
};

let currentLang = 'zh-TW';

// 支援的語言列表
const SUPPORTED_LANGS = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko'];

/**
 * 翻譯函數 - 根據 key 取得對應語言的文字
 * @param {string} key - 翻譯鍵值
 * @param {...any} args - 動態參數（用於函數類型的翻譯值）
 * @returns {string} 翻譯後的文字
 */
function t(key, ...args) {
  const dict = I18N[currentLang] || I18N['zh-TW'];
  const val = dict[key];
  if (typeof val === 'function') return val(...args);
  return val;
}

/**
 * 套用語言設定到所有 UI 元素
 * @param {string} lang - 語言代碼 ('zh' 或 'en')
 */
function applyLanguage(lang) {
  currentLang = SUPPORTED_LANGS.includes(lang) ? lang : 'zh-TW';

  // 更新語言按鈕的 active 狀態
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.dataset.lang === currentLang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

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

  // 更新語言按鈕的顯示文字（如有需要）
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const langKey = btn.dataset.lang;
    if (langKey && I18N[langKey]) {
      // 按鈕文字已固定為 中/简/En/日/한，這裡可以根據需要更新
    }
  });

  const idListInput = document.getElementById('idListInput');
  if (idListInput) idListInput.placeholder = t('idPlaceholder');

  const tagVocabInput = document.getElementById('tagVocabInput');
  if (tagVocabInput) tagVocabInput.placeholder = t('vocabPlaceholder');

  const gotoLineInput = document.getElementById('gotoLineInput');
  if (gotoLineInput) gotoLineInput.placeholder = t('gotoLinePlaceholder');

  const gotoLineBtn = document.getElementById('gotoLineBtn');
  if (gotoLineBtn) gotoLineBtn.textContent = t('gotoLineButton');

  // DLive 頁面翻譯
  const dliveTheaterTitle = document.querySelector('#dlivePage .dlive-section:nth-child(1) .dlive-section-title');
  if (dliveTheaterTitle) dliveTheaterTitle.textContent = t('dliveTheaterTitle');

  const btnTheater13 = document.getElementById('btnTheater13');
  if (btnTheater13) btnTheater13.textContent = t('dliveTheaterMode');

  const btnTestZoomReset = document.getElementById('btnTestZoomReset');
  if (btnTestZoomReset) btnTestZoomReset.textContent = t('dliveZoomReset');

  const btnTestZoomOut = document.getElementById('btnTestZoomOut');
  if (btnTestZoomOut) btnTestZoomOut.textContent = t('dliveZoomOut');

  const btnTestZoomIn = document.getElementById('btnTestZoomIn');
  if (btnTestZoomIn) btnTestZoomIn.textContent = t('dliveZoomIn');

  const dliveChatTitle = document.querySelector('#dlivePage .dlive-section:nth-child(2) .dlive-section-title');
  if (dliveChatTitle) dliveChatTitle.textContent = t('dliveChatTitle');

  const btnChatNarrow = document.getElementById('btnChatNarrow');
  if (btnChatNarrow) btnChatNarrow.textContent = t('dliveChatNarrow');

  const btnChatHidden = document.getElementById('btnChatHidden');
  if (btnChatHidden) btnChatHidden.textContent = t('dliveChatHidden');

  const btnChatOverlayFix1 = document.getElementById('btnChatOverlayFix1');
  if (btnChatOverlayFix1) btnChatOverlayFix1.textContent = t('dliveChatOverlay');

  const dliveElementTitle = document.querySelector('#dlivePage .dlive-section:nth-child(3) .dlive-section-title');
  if (dliveElementTitle) dliveElementTitle.textContent = t('dliveElementTitle');

  const btnNavbar = document.getElementById('btnNavbar');
  if (btnNavbar) btnNavbar.textContent = t('dliveNavbar');

  const btnTitleFix1 = document.getElementById('btnTitleFix1');
  if (btnTitleFix1) btnTitleFix1.textContent = t('dliveTitle');

  const btnDonation = document.getElementById('btnDonation');
  if (btnDonation) btnDonation.textContent = t('dliveDonation');

  const btnSidebar = document.getElementById('btnSidebar');
  if (btnSidebar) btnSidebar.textContent = t('dliveSidebar');

  const btnAboutFix1 = document.getElementById('btnAboutFix1');
  if (btnAboutFix1) btnAboutFix1.textContent = t('dliveAbout');

  const btnTestBlackFix1 = document.getElementById('btnTestBlackFix1');
  if (btnTestBlackFix1) btnTestBlackFix1.textContent = t('dliveBlackBg');

  const dliveStatus = document.getElementById('dliveStatus');
  if (dliveStatus) dliveStatus.textContent = t('dliveStatusHint');

  chrome.storage.sync.set({ uiLang: currentLang });
}

/**
 * 初始化語言設定（從 storage 載入）
 */
function initLanguage() {
  chrome.storage.sync.get(['uiLang'], (result) => {
    const lang = SUPPORTED_LANGS.includes(result.uiLang) ? result.uiLang : 'zh-TW';
    applyLanguage(lang);
  });
}

/**
 * 設定特定語言
 * @param {string} lang - 語言代碼
 * @returns {boolean} 是否設定成功
 */
function setLanguage(lang) {
  if (SUPPORTED_LANGS.includes(lang)) {
    applyLanguage(lang);
    return true;
  }
  return false;
}

// 暴露全局變數供其他腳本使用
window.I18N = I18N;
window.SUPPORTED_LANGS = SUPPORTED_LANGS;
window.currentLang = currentLang;
window.t = t;
window.applyLanguage = applyLanguage;
window.initLanguage = initLanguage;
window.setLanguage = setLanguage;
