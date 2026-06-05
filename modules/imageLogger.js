/**
 * GSS Image Logger Module
 * 功能：掃描聊天室中的貼圖並顯示在獨立的浮動視窗中，方便使用者查看圖片歷史。
 */

const ImageLogger = {
  containerId: 'gss_image_logger',
  bodyId: 'gss_image_logger_body',
  isVisible: false,
  maxImages: 10, // 最多保留 10 張圖片，避免視窗過長或效能問題

  init() {
    if (document.getElementById(this.containerId)) return;

    // 從儲存空間讀取狀態
    chrome.storage.local.get(['gss_logger_state'], (res) => {
      const state = res.gss_logger_state || {
        visible: false,
        top: '100px',
        left: 'auto',
        right: '20px',
        width: '300px',
        height: '400px'
      };

      this.isVisible = state.visible;

      // 建立主容器
      const container = document.createElement('div');
      container.id = this.containerId;
      container.setAttribute('data-gss-managed', 'true'); // 標記為 GSS 管理，防止被某些清理邏輯誤刪
      container.style.cssText = `
        position: fixed !important;
        right: ${state.right} !important;
        left: ${state.left} !important;
        top: ${state.top} !important;
        width: ${state.width} !important;
        height: ${state.height} !important;
        background: rgba(16, 18, 22, 0.95) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        border-radius: 12px !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
        z-index: 2147483647 !important;
        display: ${state.visible ? 'flex' : 'none'} !important;
        flex-direction: column !important;
        overflow: hidden !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        pointer-events: auto !important;
      `;

      this.buildUI(container);
      
      // 雙重檢查：確保 500ms 後狀態依然正確 (防止被其他腳本覆蓋)
      if (state.visible) {
        setTimeout(() => {
          if (container.style.display === 'none') {
            console.log('[GSS Logger] 偵測到意外隱藏，正在恢復顯示...');
            container.style.setProperty('display', 'flex', 'important');
          }
        }, 500);
      }
    });
  },

  buildUI(container) {
    // 建立標題列 (拖動把手)
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 10px 15px;
      background: rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      cursor: move;
      display: flex;
      align-items: center;
      justify-content: space-between;
      user-select: none;
    `;
    
    const title = document.createElement('span');
    title.textContent = '🖼️ 貼圖記錄牆';
    title.style.cssText = 'color: #eee; font-size: 13px; font-weight: bold;';
    
    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.gap = '8px';

    const clearBtn = document.createElement('span');
    clearBtn.textContent = '🗑️';
    clearBtn.title = '清空記錄';
    clearBtn.style.cursor = 'pointer';
    clearBtn.onclick = () => this.clear();

    const closeBtn = document.createElement('span');
    closeBtn.textContent = '✕';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.color = '#999';
    closeBtn.onclick = () => this.toggle();

    controls.appendChild(clearBtn);
    controls.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(controls);

    // 建立圖片顯示區域
    const body = document.createElement('div');
    body.id = this.bodyId;
    body.style.cssText = `
      flex: 1;
      padding: 10px;
      overflow-y: scroll !important;
      overflow-x: hidden !important;
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    `;

    // 隱藏滾動條但保留滾動功能 (Chrome/Safari/Edge)
    const style = document.createElement('style');
    style.textContent = `
      #${this.bodyId}::-webkit-scrollbar {
        display: none;
      }
      #${this.bodyId} {
        -ms-overflow-style: none;
      }
    `;
    document.head.appendChild(style);

    // 建立調整大小的手柄
    const resizeHandle = document.createElement('div');
    resizeHandle.style.cssText = `
      position: absolute;
      bottom: 0;
      right: 0;
      width: 15px;
      height: 15px;
      cursor: nwse-resize;
      background: linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.3) 50%);
    `;

    container.appendChild(header);
    container.appendChild(body);
    container.appendChild(resizeHandle);
    document.body.appendChild(container);

    this.initDrag(header, container);
    this.initResize(resizeHandle, container);

    // 掃描頁面上已存在的貼圖
    this.scanExistingImages();
  },

  scanExistingImages() {
    // 尋找頁面上所有 GSS 轉換過的圖片或影片
    const existingMedia = document.querySelectorAll('.dlsq-im-replaced img, .dlsq-im-replaced video, .gss-im-replaced img, .gss-im-replaced video, .dlsq-chat-img, .dlsq-chat-video');
    console.log('[GSS Logger] Scanning existing media:', existingMedia.length);
    existingMedia.forEach(el => {
      const url = el.src || el.dataset.gssUrl;
      const id = el.alt || '';
      if (url) {
        this.log(url, id);
      }
    });
  },

  saveState() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // 獲取目前的顯示狀態
    const currentVisible = container.style.display !== 'none';

    const state = {
      visible: currentVisible,
      top: container.style.top,
      left: container.style.left,
      right: container.style.right,
      width: container.style.width,
      height: container.style.height
    };

    chrome.storage.local.set({ 'gss_logger_state': state });
  },

  toggle() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      this.init();
      return;
    }
    
    // 強制檢查實際顯示狀態，防止狀態不同步
    const isCurrentlyHidden = container.style.display === 'none';
    this.isVisible = isCurrentlyHidden; 
    
    container.style.setProperty('display', this.isVisible ? 'flex' : 'none', 'important');
    this.saveState();
  },

  log(url, id = '') {
    console.log('[GSS Logger] Logging media:', url, id);
    const body = document.getElementById(this.bodyId);
    if (!body) {
      console.warn('[GSS Logger] Body element not found!');
      return;
    }

    // 避免重複添加（如果是連續發送）
    const lastItem = body.lastElementChild;
    if (lastItem && (lastItem.dataset.url === url || lastItem.dataset.id === id)) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'gss-logger-item';
    wrapper.dataset.url = url;
    wrapper.dataset.id = id;
    wrapper.style.cssText = `
      position: relative;
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: transform 0.2s, border-color 0.2s;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      flex-shrink: 0;
    `;
    
    // 如果是 YT 短片 ID
    const isYT = id.startsWith('YT-');
    const isVideo = url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('catbox.moe') && url.toLowerCase().endsWith('.mp4');

    if (isYT) {
      const videoId = id.slice(3);
      wrapper.style.width = '70%'; // 讓短片稍微縮小一點比例
      wrapper.style.aspectRatio = '9 / 16';
      
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0&controls=0`;
      iframe.style.cssText = 'width: 100%; height: 100%; border: none; pointer-events: none;';
      iframe.onload = () => {
        // iframe 加載完成後滾動到底部
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            body.scrollTop = body.scrollHeight;
          });
        });
      };
      wrapper.appendChild(iframe);
      
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;';
      wrapper.appendChild(overlay);
    } else if (isVideo) {
      const video = document.createElement('video');
      video.src = url;
      video.muted = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.style.cssText = 'width: 100%; height: auto; max-height: none; object-fit: contain; display: block;';
      video.onloadeddata = () => {
        // 視頻加載完成後滾動到底部
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            body.scrollTop = body.scrollHeight;
          });
        });
      };
      wrapper.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = url;
      img.style.cssText = `
        width: 100%;
        height: auto;
        max-height: none;
        object-fit: contain;
        display: block;
      `;
      img.title = id || '貼圖預覽';
      img.onerror = () => {
        console.warn('[GSS Logger] Image load failed:', url);
        wrapper.style.border = '1px solid #f44336';
      };
      img.onload = () => {
        // 圖片加載完成後滾動到底部
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            body.scrollTop = body.scrollHeight;
          });
        });
      };
      wrapper.appendChild(img);
    }

    wrapper.onmouseenter = () => wrapper.style.transform = 'scale(1.02)';
    wrapper.onmouseleave = () => wrapper.style.transform = 'scale(1)';
    
    // 點擊事件：左鍵放大，右鍵菜單
    wrapper.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (isYT) {
        if (typeof window.openYouTubePlayer === 'function') {
          window.openYouTubePlayer(id.slice(3));
        } else {
          window.open(`https://www.youtube.com/watch?v=${id.slice(3)}`, '_blank');
        }
      } else if (typeof window.showZoomOverlay === 'function') {
        // 使用插件內建的放大功能
        const mediaEl = wrapper.querySelector('img, video');
        if (mediaEl) {
          window.showZoomOverlay({
            element: mediaEl,
            isVideo: isVideo
          });
        }
      }
    };

    wrapper.oncontextmenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (typeof window.showContextMenuAt === 'function') {
        const mediaEl = wrapper.querySelector('img, video');
        // 如果是 YT 短片，ID 已經是 YT-xxx；如果是其他，ID 也已經是 IM-xxx 等
        window.showContextMenuAt(e.clientX, e.clientY, id, mediaEl);
      }
    };

    body.appendChild(wrapper);

    // 限制數量
    while (body.children.length > this.maxImages) {
      body.removeChild(body.firstChild);
    }

    // 自動捲動到底部（雙重 requestAnimationFrame 確保布局完全更新）
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        body.scrollTop = body.scrollHeight;
      });
    });
  },

  clear() {
    const body = document.getElementById(this.bodyId);
    if (body) body.innerHTML = '';
  },

  initDrag(handle, target) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    handle.onmousedown = (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialX = target.offsetLeft;
      initialY = target.offsetTop;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      target.style.left = initialX + dx + 'px';
      target.style.top = initialY + dy + 'px';
      target.style.right = 'auto';
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      this.saveState(); // 拖動結束後儲存位置
    };
  },

  initResize(handle, target) {
    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    handle.onmousedown = (e) => {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = target.offsetWidth;
      startHeight = target.offsetHeight;
      e.preventDefault();
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!isResizing) return;
      const nw = startWidth + (e.clientX - startX);
      const nh = startHeight + (e.clientY - startY);
      target.style.width = Math.max(200, nw) + 'px';
      target.style.height = Math.max(200, nh) + 'px';
    };

    const onMouseUp = () => {
      isResizing = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      this.saveState(); // 縮放結束後儲存大小
    };
  }
};

// 導出到全局以便 content.js 調用
window.GSS_ImageLogger = ImageLogger;
