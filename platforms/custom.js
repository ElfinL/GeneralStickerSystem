/**
 * Custom Platform Adapter
 * 用戶自定義適配器 - 腳本引擎版 (強化發送邏輯)
 */
class CustomAdapter extends GSS.PlatformAdapter {
  constructor(config) {
    super();
    this.config = config;
    this.name = config.hostname;
    this.isSendingMessage = false;
    this.parsedLogic = this.parseLogic(config.logic || '');
  }

  parseLogic(logicText) {
    const logic = {};
    const lines = logicText.split('\n');
    lines.forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim().toLowerCase();
        const value = parts.slice(1).join(':').trim();
        logic[key] = value;
      }
    });
    return logic;
  }

  isMatch() {
    return window.location.hostname.includes(this.config.hostname);
  }

  findChatContainer() {
    return document.querySelector(this.config.chatContainer) || this.findChatInput()?.parentElement;
  }

  findChatInput() {
    return document.querySelector(this.parsedLogic.input);
  }

  findEmoteButton() {
    return document.querySelector(this.parsedLogic.mount) || document.querySelector(this.parsedLogic.send) || this.findChatInput();
  }

  async sendMessage(message) {
    this.isSendingMessage = true;
    try {
      const input = this.findChatInput();
      if (!input) return { ok: false, error: '找不到輸入框' };

      input.focus();
      
      // 1. 填入文字
      const success = document.execCommand('insertText', false, message);
      if (!success) {
        input.value = message;
      }
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));

      // 延遲一下再發送，確保網頁反應過來
      await new Promise(r => setTimeout(r, 100));

      // 2. 執行發送
      const sendBtn = document.querySelector(this.parsedLogic.send);
      if (sendBtn) {
        // --- 強化版按鈕點擊 ---
        sendBtn.click(); // 原生點擊
        
        // 模擬完整滑鼠事件 (有些網站只吃這個)
        ['mousedown', 'mouseup', 'click'].forEach(type => {
          sendBtn.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
        });
      } else {
        // --- 強化版 Enter 模擬 ---
        const enterOptions = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true };
        input.dispatchEvent(new KeyboardEvent('keydown', enterOptions));
        input.dispatchEvent(new KeyboardEvent('keypress', enterOptions));
        input.dispatchEvent(new KeyboardEvent('keyup', enterOptions));
        
        // 嘗試在父容器也發一次 (有些框架監聽在外面)
        input.parentElement?.dispatchEvent(new KeyboardEvent('keydown', enterOptions));
      }
      return { ok: true };
    } finally {
      setTimeout(() => { this.isSendingMessage = false; }, 500);
    }
  }
}
window.CustomAdapter = CustomAdapter;
