/**
 * index.js - 清潔元素核心邏輯（直接照抄 meta AI 實現）
 */

// 確保 SelectorGenerator 可用
if (typeof SelectorGenerator === 'undefined') {
  console.error('[CleanElement] SelectorGenerator not loaded!');
}

const CleanElement = {
  state: {
    initialized: false,
    currentPlatform: null,
    rules: [],
    observer: null,
    styleElement: null,
    enabled: false,
    picker: {
      active: false,
      hoverBox: null,
      tooltip: null,
      lastElement: null
    }
  },

  /**
   * 初始化清潔元素功能
   */
  async init(platform) {
    if (this.state.initialized) return;

    this.state.currentPlatform = platform;
    console.log('[CleanElement] 開始初始化，平台:', platform);

    // 等待 DOM 完全載入
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    await this.loadRules();
    this.setupObserver();
    this.setupMessageListener();
    this.setupPickerUI();

    this.state.initialized = true;
    console.log('[CleanElement] 初始化完成，平台:', platform);
  },

  /**
   * 加載規則
   */
  async loadRules() {
    if (!this.state.currentPlatform) return;

    try {
      this.state.rules = await CleanStorage.getRules(this.state.currentPlatform);
      this.state.enabled = this.state.rules.length > 0;
      console.log('[CleanElement] 加載規則，平台:', this.state.currentPlatform, '規則數:', this.state.rules.length, '規則詳情:', this.state.rules);
      this.applyHideStyle();
    } catch (error) {
      console.error('[CleanElement] 加載規則失敗:', error);
    }
  },

  /**
   * 設置 MutationObserver
   */
  setupObserver() {
    if (this.state.observer) {
      this.state.observer.disconnect();
    }

    this.state.observer = new MutationObserver((mutations) => {
      let hasReal = false;
      for (const m of mutations) {
        for (const n of m.addedNodes) if (!this.isCleanerNode(n)) { hasReal = true; break; }
        if (hasReal) break;
      }
      if (!hasReal) return;
      if (this.state.picker.active) return;
      // 新元素出現，重新應用隱藏
      clearTimeout(this.state._debounce);
      this.state._debounce = setTimeout(() => this.applyHideStyle(), 120);
    });

    this.state.observer.observe(document.documentElement, { childList: true, subtree: true });
  },

  /**
   * 暫停 observer
   */
  pauseObserver() {
    if (this.state.observer) this.state.observer.disconnect();
  },

  /**
   * 恢復 observer
   */
  resumeObserver() {
    if (this.state.observer) this.state.observer.observe(document.documentElement, { childList: true, subtree: true });
  },

  /**
   * 設置消息監聽器
   */
  setupMessageListener() {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg.action === 'startPicker') {
          this.enterPicker();
          sendResponse({ ok: true, picking: this.state.picker.active });
        } else if (msg.action === 'exitPicker') {
          this.exitPicker();
          sendResponse({ ok: true });
        } else if (msg.action === 'reloadCleanRules') {
          this.loadRules();
          sendResponse({ ok: true });
        } else if (msg.action === 'updateLanguage') {
          // 轉換語言代碼（zh-TW -> zh-TW, zh -> zh-TW）
          const langMap = {
            'zh': 'zh-TW',
            'zh-CN': 'zh-CN',
            'zh-TW': 'zh-TW',
            'en': 'en',
            'ja': 'ja',
            'ko': 'ko'
          };
          this.state.currentLanguage = langMap[msg.lang] || msg.lang || 'zh-TW';
          console.log('[CleanElement] 語言更新為:', this.state.currentLanguage);
          // 如果揀選模式處於活動狀態，更新提示消息
          if (this.state.picker.active && this.state.picker.toast) {
            this.state.picker.toast.textContent = this.getPickerMessage();
          }
          sendResponse({ ok: true });
        }
        return true;
      });
    }
  },

  /**
   * 應用隱藏樣式（直接照抄 meta AI）
   */
  applyHideStyle() {
    if (this.state.picker.active) return;
    this.pauseObserver();
    let style = document.getElementById('clean-element-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'clean-element-style';
      (document.head || document.documentElement).appendChild(style);
    }
    if (this.state.rules.length === 0) {
      style.textContent = '';
    } else {
      style.textContent = this.state.rules.map(r => r.selector + ' { display: none !important; }').join('\n') + '\n[data-cleaner-hidden] { display: none !important; }';
    }
    // 同時直接把符合的元素 inline 藏，保證立即生效
    try {
      this.state.rules.forEach(rule => {
        document.querySelectorAll(rule.selector).forEach(el => {
          if (this.isCleanerNode(el)) return;
          el.setAttribute('data-cleaner-hidden', rule.id);
          el.style.setProperty('display', 'none', 'important');
        });
      });
    } catch {}
    setTimeout(() => this.resumeObserver(), 80);
  },

  /**
   * 設置揀選模式 UI
   */
  setupPickerUI() {
    if (!this.state.picker.hoverBox) {
      const box = document.createElement('div');
      box.id = 'clean-element-hover-box';
      box.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483646;border:2px solid #3b82f6;background:rgba(59,130,246,0.15);border-radius:6px;box-sizing:border-box;display:none;';
      document.documentElement.appendChild(box);
      this.state.picker.hoverBox = box;
    }

    if (!this.state.picker.tooltip) {
      const tip = document.createElement('div');
      tip.id = 'clean-element-tooltip';
      tip.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483647;background:#0f172a;color:#f8fafc;padding:6px 10px;border-radius:8px;font-size:12px;font-family:ui-monospace,monospace;line-height:1.4;max-width:360px;box-shadow:0 4px 16px rgba(0,0,0,0.3);display:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
      document.documentElement.appendChild(tip);
      this.state.picker.tooltip = tip;
    }
  },

  /**
   * 進入揀選模式
   */
  enterPicker() {
    if (this.state.picker.active) return;
    this.state.picker.active = true;
    this.ensureUI();
    document.body.style.cursor = 'crosshair';

    // 根據當前語言顯示提示消息
    const message = this.getPickerMessage();
    this.showPersistentToast(message);

    document.addEventListener('mouseover', CleanElement.onMouseOver, true);
    document.addEventListener('click', CleanElement.onClick, true);
    document.addEventListener('keydown', CleanElement.onKeyDown, true);
  },

  /**
   * 獲取揀選模式提示消息
   */
  getPickerMessage() {
    // 獲取當前語言
    const lang = this.getCurrentLanguage();
    const messages = {
      'zh-TW': '🎯 揀選模式中 | 點擊元素隱藏 | 按 Esc 退出',
      'zh-CN': '🎯 拣选模式中 | 点击元素隐藏 | 按 Esc 退出',
      'en': '🎯 Picker Mode | Click element to hide | Press Esc to exit',
      'ja': '🎯 ピッカーモード | クリックで非表示 | Escで終了',
      'ko': '🎯 선택기 모드 | 클릭으로 숨기기 | Esc로 종료'
    };
    return messages[lang] || messages['en'];
  },

  /**
   * 獲取當前語言
   */
  getCurrentLanguage() {
    // 優先使用 popup 設置的語言
    if (this.state.currentLanguage) {
      return this.state.currentLanguage;
    }

    // 嘗試從 chrome 獲取語言
    if (typeof chrome !== 'undefined' && chrome.i18n) {
      const uiLang = chrome.i18n.getUILanguage();
      if (uiLang) {
        const langMap = {
          'zh-TW': 'zh-TW',
          'zh-HK': 'zh-TW',
          'zh-CN': 'zh-CN',
          'zh': 'zh-TW',
          'ja': 'ja',
          'ko': 'ko',
          'en': 'en'
        };
        return langMap[uiLang] || langMap[uiLang.split('-')[0]] || 'en';
      }
    }
    // 從 html lang 屬性獲取
    const htmlLang = document.documentElement.lang;
    if (htmlLang) {
      const langMap = {
        'zh': 'zh-TW',
        'zh-cn': 'zh-CN',
        'zh-tw': 'zh-TW',
        'ja': 'ja',
        'ko': 'ko',
        'en': 'en'
      };
      return langMap[htmlLang] || langMap[htmlLang.split('-')[0]] || 'en';
    }
    // 從 navigator.language 獲取
    if (typeof navigator !== 'undefined' && navigator.language) {
      const navLang = navigator.language;
      const langMap = {
        'zh-TW': 'zh-TW',
        'zh-HK': 'zh-TW',
        'zh-CN': 'zh-CN',
        'zh': 'zh-TW',
        'ja': 'ja',
        'ko': 'ko',
        'en': 'en'
      };
      return langMap[navLang] || langMap[navLang.split('-')[0]] || 'en';
    }
    return 'en';
  },

  /**
   * 退出揀選模式
   */
  exitPicker() {
    if (!this.state.picker.active) return;
    this.state.picker.active = false;
    document.body.style.cursor = '';
    if (this.state.picker.hoverBox) this.state.picker.hoverBox.style.display = 'none';
    if (this.state.picker.tooltip) this.state.picker.tooltip.style.display = 'none';
    if (this.state.picker.status) {
      this.state.picker.status.remove();
      this.state.picker.status = null;
    }
    if (this.state.picker.toast) {
      this.state.picker.toast.remove();
      this.state.picker.toast = null;
    }
    document.removeEventListener('mouseover', CleanElement.onMouseOver, true);
    document.removeEventListener('click', CleanElement.onClick, true);
    document.removeEventListener('keydown', CleanElement.onKeyDown, true);
    this.state.picker.lastElement = null;
  },

  /**
   * 鼠標懸停處理
   */
  onMouseOver(e) {
    if (!CleanElement.state.picker.active) return;
    CleanElement.highlight(e.target);
  },

  /**
   * 點擊處理
   */
  onClick(e) {
    if (!CleanElement.state.picker.active) return;
    if (CleanElement.isCleanerNode(e.target)) return;
    if (e.target.closest && e.target.closest('#clean-element-hover-box, #clean-element-tooltip')) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const target = CleanElement.state.picker.lastElement || e.target;
    if (!target || CleanElement.isCleanerNode(target)) return;
    CleanElement.hideElement(target);
  },

  /**
   * 鍵盤處理
   */
  onKeyDown(e) {
    if (e.key === 'Escape') {
      CleanElement.exitPicker();
      CleanElement.showToast(CleanElement.getTranslation('cleanExitedPicker'));
    }
  },

  /**
   * 高亮元素
   */
  highlight(el) {
    if (!CleanElement.state.picker.active || !el) return;
    if (this.isCleanerNode(el)) return;
    if (el === document.documentElement || el === document.body) return;
    if (el.closest && el.closest('#clean-element-hover-box, #clean-element-tooltip')) return;
    if (el === CleanElement.state.picker.lastElement) return;

    CleanElement.state.picker.lastElement = el;
    this.ensureUI();
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    CleanElement.state.picker.hoverBox.style.display = 'block';
    CleanElement.state.picker.hoverBox.style.left = (rect.left - 2) + 'px';
    CleanElement.state.picker.hoverBox.style.top = (rect.top - 2) + 'px';
    CleanElement.state.picker.hoverBox.style.width = (rect.width + 4) + 'px';
    CleanElement.state.picker.hoverBox.style.height = (rect.height + 4) + 'px';

    const info = SelectorGenerator.getElementInfo(el);
    const size = Math.round(rect.width) + 'x' + Math.round(rect.height);
    CleanElement.state.picker.tooltip.textContent = info.tag + ' | ' + size + ' | ' + (info.text || CleanElement.getTranslation('cleanNoText'));
    CleanElement.state.picker.tooltip.style.display = 'block';

    let top = rect.top - 34;
    if (top < 6) top = rect.bottom + 8;
    CleanElement.state.picker.tooltip.style.left = Math.min(window.innerWidth - 200, rect.left) + 'px';
    CleanElement.state.picker.tooltip.style.top = top + 'px';
  },

  /**
   * 隱藏元素
   */
  async hideElement(el) {
    if (!el || el === document.documentElement || el === document.body) {
      this.showToast(this.getTranslation('cleanCannotHideBody'));
      return;
    }

    const selector = SelectorGenerator.generateSelector(el);
    if (this.state.rules.some(r => r.selector === selector)) {
      el.setAttribute('data-cleaner-hidden', 'dup');
      el.style.setProperty('display', 'none', 'important');
      this.showToast(this.getTranslation('cleanAlreadyHidden'));
      return;
    }

    // 檢查選擇器是否包含 nth-child（不穩定）
    if (selector.includes('nth-child') || selector.includes('nth-of-type')) {
      this.showToast(this.getTranslation('cleanUnstableSelector'));
    }

    const rule = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      selector,
      tag: el.tagName,
      text: SelectorGenerator.getTextSnippet(el),
      host: this.state.currentPlatform,
      createdAt: Date.now()
    };

    el.setAttribute('data-cleaner-hidden', rule.id);
    el.style.setProperty('display', 'none', 'important');

    this.state.rules.push(rule);
    const platformRules = await CleanStorage.getRules(this.state.currentPlatform);
    platformRules.push(rule);
    await CleanStorage.saveRules(this.state.currentPlatform, platformRules);

    this.applyHideStyle();
    this.showToast(this.getTranslation('cleanAddedRule') + ' ' + rule.tag + ' - ' + (rule.text || selector));
    console.log('[CleanElement] hidden', rule);
    // 不退出揀選模式，保持連續添加
  },

  /**
   * 獲取翻譯
   */
  getTranslation(key) {
    const lang = this.getCurrentLanguage();
    const translations = {
      'zh-TW': {
        cleanCannotHideBody: '不能隱藏 html / body',
        cleanAlreadyHidden: '已經隱藏過，幫你再藏一次',
        cleanUnstableSelector: '⚠️ 選擇器可能不穩定，建議重新選擇',
        cleanAddedRule: '已隱藏',
        cleanExitedPicker: '已退出揀選',
        cleanNoText: '無文字'
      },
      'zh-CN': {
        cleanCannotHideBody: '不能隐藏 html / body',
        cleanAlreadyHidden: '已经隐藏过，帮你再藏一次',
        cleanUnstableSelector: '⚠️ 选择器可能不稳定，建议重新选择',
        cleanAddedRule: '已隐藏',
        cleanExitedPicker: '已退出拣选',
        cleanNoText: '无文字'
      },
      'en': {
        cleanCannotHideBody: 'Cannot hide html / body',
        cleanAlreadyHidden: 'Already hidden, hiding again',
        cleanUnstableSelector: '⚠️ Selector may be unstable, try reselecting',
        cleanAddedRule: 'Hidden',
        cleanExitedPicker: 'Picker exited',
        cleanNoText: 'no text'
      },
      'ja': {
        cleanCannotHideBody: 'html / bodyは非表示できません',
        cleanAlreadyHidden: '既に非表示済み、再度非表示',
        cleanUnstableSelector: '⚠️ セレクタが不安定かもしれません、再選択してください',
        cleanAddedRule: '非表示済み',
        cleanExitedPicker: 'ピッカー終了',
        cleanNoText: 'テキストなし'
      },
      'ko': {
        cleanCannotHideBody: 'html / body는 숨길 수 없음',
        cleanAlreadyHidden: '이미 숨겨짐, 다시 숨김',
        cleanUnstableSelector: '⚠️ 선택기가 불안정할 수 있음, 다시 선택',
        cleanAddedRule: '숨김됨',
        cleanExitedPicker: '선택기 종료',
        cleanNoText: '텍스트 없음'
      }
    };
    return translations[lang][key] || translations['en'][key];
  },

  /**
   * 確保 UI 存在
   */
  ensureUI() {
    if (!this.state.picker.hoverBox) {
      const box = document.createElement('div');
      box.id = 'clean-element-hover-box';
      box.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483646;border:2px solid #3b82f6;background:rgba(59,130,246,0.15);border-radius:6px;box-sizing:border-box;display:none;';
      document.documentElement.appendChild(box);
      this.state.picker.hoverBox = box;
    }

    if (!this.state.picker.tooltip) {
      const tip = document.createElement('div');
      tip.id = 'clean-element-tooltip';
      tip.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483647;background:#0f172a;color:#f8fafc;padding:6px 10px;border-radius:8px;font-size:12px;font-family:ui-monospace,monospace;line-height:1.4;max-width:360px;box-shadow:0 4px 16px rgba(0,0,0,0.3);display:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
      document.documentElement.appendChild(tip);
      this.state.picker.tooltip = tip;
    }
  },

  /**
   * 顯示持久的中央提示
   */
  showPersistentToast(msg) {
    if (this.state.picker.toast) {
      this.state.picker.toast.remove();
    }

    const toast = document.createElement('div');
    toast.id = 'clean-element-toast';
    toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);background:#0f172a;color:white;padding:16px 24px;border-radius:999px;font-size:16px;font-family:system-ui;z-index:2147483648;box-shadow:0 8px 32px rgba(0,0,0,0.4);pointer-events:none;font-weight:500;white-space:nowrap;';
    toast.textContent = msg;
    document.documentElement.appendChild(toast);
    this.state.picker.toast = toast;
  },

  /**
   * 顯示臨時提示
   */
  showToast(msg) {
    let toast = document.getElementById('clean-element-temp-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'clean-element-temp-toast';
      toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);background:#0f172a;color:white;padding:16px 24px;border-radius:999px;font-size:16px;font-family:system-ui;z-index:2147483649;box-shadow:0 8px 32px rgba(0,0,0,0.4);pointer-events:none;font-weight:500;white-space:nowrap;opacity:0;transition:opacity 0.25s;';
      document.documentElement.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(this.state.tempToastTimer);
    this.state.tempToastTimer = setTimeout(() => { if (toast) toast.style.opacity = '0'; }, 2200);
  },

  /**
   * 判斷是否為清潔元素節點
   */
  isCleanerNode(node) {
    if (!node) return false;
    if (node.id && typeof node.id === 'string' && (node.id.startsWith('clean-element-') || node.id === 'clean-element-style' || node.id === 'clean-element-toast')) return true;
    if (node.classList && node.classList.contains && node.classList.contains('clean-element-overlay')) return true;
    return false;
  }
};

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CleanElement;
}