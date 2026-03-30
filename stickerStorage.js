/* global self, window, chrome */
(function initDlsqStickerStorage(global) {
  const MIGRATION_FLAG = 'dlsqStickerLocalV1';
  const STICKER_KEYS = ['stickerIdsText', 'stickers', 'favoriteStickerIds', 'stickerTagVocabularyText'];

  const api = {
    MIGRATION_FLAG,
    STICKER_KEYS,
    /** 貼圖清單等大量資料改存 local，避免 sync 單 key 8KB 上限 */
    area: () => chrome.storage.local,

    /**
     * 從 sync 複製到 local 並刪除 sync 上的同鍵（只執行一次）
     */
    migrateFromSyncIfNeeded() {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get([MIGRATION_FLAG], (gate) => {
          const err0 = chrome.runtime.lastError;
          if (err0) {
            reject(new Error(err0.message));
            return;
          }
          if (gate[MIGRATION_FLAG]) {
            resolve();
            return;
          }
          chrome.storage.sync.get(STICKER_KEYS, (sync) => {
            const err1 = chrome.runtime.lastError;
            if (err1) {
              reject(new Error(err1.message));
              return;
            }
            const out = { [MIGRATION_FLAG]: true };
            if (typeof sync.stickerIdsText === 'string') out.stickerIdsText = sync.stickerIdsText;
            if (Array.isArray(sync.stickers)) out.stickers = sync.stickers;
            if (Array.isArray(sync.favoriteStickerIds)) out.favoriteStickerIds = sync.favoriteStickerIds;
            if (typeof sync.stickerTagVocabularyText === 'string') {
              out.stickerTagVocabularyText = sync.stickerTagVocabularyText;
            }
            chrome.storage.local.set(out, () => {
              const err2 = chrome.runtime.lastError;
              if (err2) {
                reject(new Error(err2.message));
                return;
              }
              chrome.storage.sync.remove(STICKER_KEYS, () => {
                const err3 = chrome.runtime.lastError;
                resolve();
              });
            });
          });
        });
      });
    }
  };

  global.DLSQStickerStore = api;
})(typeof self !== 'undefined' ? self : window);
