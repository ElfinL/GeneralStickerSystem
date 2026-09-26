/**
 * Gosh Platform Adapter
 * Gosh Live (gosh.com) 平台的發圖邏輯適配器
 */

class GoshAdapter extends PlatformAdapter {
  constructor() {
    super();
    this.name = 'gosh';
    this.isSendingMessage = false;

    // 初始化點擊放大功能
    if (!this._goshClickZoomInitialized) {
      this.initGoshClickZoom();
    }
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

  /**
   * 使用 gosh.com 獨有的 insertImage 命令直接插入圖片
   * 這是 gosh.com 平台的特殊功能，可以不用轉圖直接顯示圖片
   * 完全按照用戶提供的 Console 代碼邏輯實現
   * @param {string} imageUrl - 圖片 URL
   * @param {string} stickerId - 可選的貼圖 ID，用於右鍵功能
   * @param {boolean} autoSend - 是否自動發送（默認 true）
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  async sendImage(imageUrl, stickerId = null, autoSend = true) {
    this.isSendingMessage = true;

    try {
      // 按照用戶提供的代碼邏輯
      let c = document.querySelector('.rich-message-editor');
      if (!c) {
        throw new Error('找不到 .rich-message-editor 元素');
      }

      console.log('[GoshAdapter] 使用 insertImage 插入圖片:', imageUrl, '貼圖 ID:', stickerId, '自動發送:', autoSend);

      // 聚焦輸入框
      c.focus();

      // 直接用瀏覽器內置插圖指令
      const success = document.execCommand('insertImage', false, imageUrl);
      console.log('[GoshAdapter] insertImage 結果:', success);

      // 為插入的圖片添加 data-sticker-id 屬性以支援右鍵功能
      if (success && stickerId) {
        // 立即嘗試為圖片添加屬性
        const images = c.querySelectorAll('img');
        if (images.length > 0) {
          const lastImage = images[images.length - 1];
          // 檢查是否是我們剛插入的圖片（通過 src 匹配）
          if (lastImage.src === imageUrl || lastImage.src.includes(imageUrl)) {
            lastImage.setAttribute('data-sticker-id', stickerId);
            console.log('[GoshAdapter] 為圖片添加 data-sticker-id:', stickerId);
          } else {
            // 如果立即找不到，使用 setTimeout 延遲處理
            setTimeout(() => {
              const delayedImages = c.querySelectorAll('img');
              if (delayedImages.length > 0) {
                const delayedLastImage = delayedImages[delayedImages.length - 1];
                if (delayedLastImage.src === imageUrl || delayedLastImage.src.includes(imageUrl)) {
                  delayedLastImage.setAttribute('data-sticker-id', stickerId);
                  console.log('[GoshAdapter] 延遲為圖片添加 data-sticker-id:', stickerId);
                }
              }
            }, 50);
          }
        }
      }

      // 觸發 input 事件
      c.dispatchEvent(new InputEvent('input', { bubbles: true }));

      // 只有在 autoSend 為 true 時才自動按 Enter 發送
      if (autoSend) {
        // 幫你按 Enter 發送（延遲 150ms）
        await new Promise(resolve => setTimeout(resolve, 150));

        c.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          bubbles: true
        }));

        // 發送後監聽聊天室中的新圖片，為其添加屬性
        if (stickerId) {
          this.monitorChatImages(imageUrl, stickerId);
        }
      } else {
        console.log('[GoshAdapter] 自動發送已關閉，只插入圖片不發送');
      }

      return { ok: true };
    } finally {
      this.isSendingMessage = false;
    }
  }

  /**
   * 監聽聊天室中的新圖片，為匹配的圖片添加 data-sticker-id
   * @param {string} targetUrl - 目標圖片 URL
   * @param {string} stickerId - 貼圖 ID
   */
  monitorChatImages(targetUrl, stickerId) {
    const chatContainer = this.findChatContainer();
    if (!chatContainer) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
            images.forEach((img) => {
              if (img.src === targetUrl || img.src.includes(targetUrl)) {
                if (!img.dataset.stickerId) {
                  img.setAttribute('data-sticker-id', stickerId);
                  console.log('[GoshAdapter] 為聊天室中的圖片添加 data-sticker-id:', stickerId);
                }
              }
            });
          }
        });
      });
    });

    observer.observe(chatContainer, { childList: true, subtree: true });

    // 5秒後停止監聽
    setTimeout(() => {
      observer.disconnect();
      console.log('[GoshAdapter] 停止監聽聊天室圖片');
    }, 5000);
  }

  /**
   * 初始化 gosh.com 平台的點擊放大功能（使用事件委托）
   */
  initGoshClickZoom() {
    const chatContainer = this.findChatContainer();
    if (!chatContainer) {
      console.log('[GoshAdapter] 找不到聊天容器，延遲初始化點擊放大');
      setTimeout(() => this.initGoshClickZoom(), 1000);
      return;
    }

    console.log('[GoshAdapter] 初始化 gosh.com 點擊放大功能');

    // 使用事件委托，在聊天室容器上監聽點擊事件
    chatContainer.addEventListener('click', (e) => {
      const img = e.target.closest('img');
      if (!img) return;

      // 所有圖片都可以放大，不限制於我們的貼圖
      e.preventDefault();
      e.stopPropagation();
      console.log('[GoshAdapter] 檢測到點擊圖片:', img.src);
      this.showZoomOverlay(img);
    });

    // 標記已初始化
    this._goshClickZoomInitialized = true;
  }

  /**
   * 顯示圖片放大覆蓋層（直接實現，不依賴全局函數）
   * @param {HTMLImageElement} img - 要放大的圖片元素
   */
  showZoomOverlay(img) {
    // 創建覆蓋層
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    `;

    // 創建放大圖片
    const largeImg = document.createElement('img');
    largeImg.src = img.src;
    largeImg.style.cssText = `
      max-width: 90vw;
      max-height: 90vh;
      object-fit: contain;
      border-radius: 8px;
    `;

    overlay.appendChild(largeImg);
    document.body.appendChild(overlay);

    // 點擊覆蓋層關閉
    overlay.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    console.log('[GoshAdapter] 顯示圖片放大覆蓋層');
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
