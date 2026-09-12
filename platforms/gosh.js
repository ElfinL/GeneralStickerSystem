/**
 * Gosh Platform Adapter
 * Gosh Live (gosh.com) 平台的發圖邏輯適配器
 */

class GoshAdapter extends PlatformAdapter {
  constructor() {
    super();
    this.name = 'gosh';
    this.isSendingMessage = false;
  }

  isMatch() {
    return window.location.hostname.includes('gosh.com');
  }

  findChatInput() {
    const selectors = [
      '.rich-message-editor[contenteditable="true"]',
      '[role="textbox"][contenteditable="true"]',
      '.rich-message-editor'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  findChatContainer() {
    const selectors = [
      '.pc-chat-panel-main',
      '.pc-chat-panel-world-cup-bg',
      'section.pc-chat-panel-main'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  /**
   * 掛載點：輸入框與表情按鈕所在的 bordered 容器
   */
  findEmoteButton() {
    const emojiBtn = document.querySelector('button.emoji-trigger');
    if (emojiBtn?.parentElement) {
      return emojiBtn.parentElement;
    }

    const editor = this.findChatInput();
    return editor?.closest('.flex.flex-1.min-w-0.items-center') || null;
  }

  findSendButton() {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const text = btn.textContent?.trim();
      if (text === '發送' || text === 'Send') {
        return btn;
      }
    }
    return null;
  }

  async sendMessage(message) {
    this.isSendingMessage = true;

    try {
      const chatInput = this.findChatInput();
      if (!chatInput) {
        throw new Error('找不到 Gosh 聊天輸入框');
      }

      chatInput.focus();
      chatInput.click();
      await this.delay(50);

      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(chatInput);
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, message);

      chatInput.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: message
      }));

      await this.delay(50);

      const enterEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13
      });
      chatInput.dispatchEvent(enterEvent);

      await this.delay(50);

      const sendBtn = this.findSendButton();
      if (sendBtn && !sendBtn.disabled) {
        sendBtn.click();
      }

      return { ok: true };
    } finally {
      this.isSendingMessage = false;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async insertToInput(text) {
    const chatInput = this.findChatInput();
    if (!chatInput) {
      throw new Error('找不到 Gosh 聊天輸入框');
    }

    chatInput.focus();
    chatInput.click();
    await this.delay(50);

    document.execCommand('insertText', false, text);
    chatInput.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: text
    }));
  }
}
