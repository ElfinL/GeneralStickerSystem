/* global DLSQ */
(function initDlsqTags(global) {
  const MAX_TAG_LEN = 16;
  const MAX_TAGS_PER_STICKER = 4;
  // 支援 DL- 前綴（DLive 貼圖）和 IM- 前綴（Imgur 圖片）
  const DL_ID_RE = /^(?:DL-)?([A-Za-z0-9_]+)$/;
  const IM_ID_RE = /^IM-[a-zA-Z0-9]+(?:\.(?:gif|png|jpg|jpeg|mp4))?$/i;

  function isValidDLId(id) {
    return DL_ID_RE.test(id);
  }

  function isValidIMId(id) {
    return IM_ID_RE.test(id);
  }

  function normalizeId(id) {
    if (!id) return id;
    // IM 格式直接返回
    if (id.startsWith('IM-')) return id;
    // 已經有 DL- 前綴，直接返回
    if (id.startsWith('DL-')) return id;
    // 舊格式，添加 DL- 前綴
    if (/^[A-Za-z0-9_]+$/.test(id)) return `DL-${id}`;
    return id;
  }

  function codePointLength(s) {
    return [...String(s || '')].length;
  }

  function normalizeTagToken(raw) {
    let t = String(raw || '').trim();
    if (t.startsWith('#')) t = t.slice(1).trim();
    return t;
  }

  function isValidTagLabel(t) {
    if (!t) return false;
    if (codePointLength(t) > MAX_TAG_LEN) return false;
    if (/\s/.test(t) || t.includes('#')) return false;
    return true;
  }

  function parseStickerLine(line) {
    const trimmed = String(line || '').trim();
    if (!trimmed) return null;
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (!parts.length) return null;
    const rawId = parts[0];

    // 判斷 ID 類型
    let id;
    if (rawId.startsWith('IM-')) {
      // IM 格式驗證
      if (!isValidIMId(rawId)) {
        return { error: 'bad_id', id: rawId, raw: trimmed };
      }
      id = rawId;
    } else {
      // DL 格式：正規化並驗證
      id = normalizeId(rawId);
      if (!isValidDLId(id)) {
        return { error: 'bad_id', id: rawId, raw: trimmed };
      }
    }

    const tags = [];
    const seen = new Set();
    for (let i = 1; i < parts.length; i++) {
      const label = normalizeTagToken(parts[i]);
      if (!label) continue;
      if (!isValidTagLabel(label)) return { error: 'bad_tag', id, tag: label, raw: trimmed };
      const key = label.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      tags.push(label);
      if (tags.length > MAX_TAGS_PER_STICKER) return { error: 'too_many_tags', id, raw: trimmed };
    }
    return { id, tags, raw: trimmed };
  }

  function parseStickerIdsText(rawText) {
    const lines = String(rawText || '')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    const rows = [];
    const errors = [];
    const seenIds = new Set();
    for (const line of lines) {
      const parsed = parseStickerLine(line);
      if (!parsed) continue;
      if (parsed.error) {
        errors.push(parsed);
        continue;
      }
      if (seenIds.has(parsed.id)) {
        errors.push({ error: 'dup_id', id: parsed.id, raw: line });
        continue;
      }
      seenIds.add(parsed.id);
      rows.push({ id: parsed.id, tags: parsed.tags });
    }
    return { rows, errors };
  }

  function serializeStickerRows(rows) {
    const list = Array.isArray(rows) ? rows : [];
    return list
      .map((r) => {
        const id = r?.id;
        if (!id) return '';
        // IM 格式直接返回，DL 格式確保有前綴
        const normalizedId = id.startsWith('IM-') ? id : (id.startsWith('DL-') ? id : `DL-${id}`);
        const uniq = [];
        const seen = new Set();
        for (const t of Array.isArray(r.tags) ? r.tags : []) {
          const label = normalizeTagToken(t);
          if (!label || !isValidTagLabel(label)) continue;
          const key = label.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          uniq.push(label);
          if (uniq.length >= MAX_TAGS_PER_STICKER) break;
        }
        if (!uniq.length) return normalizedId;
        return `${normalizedId} ${uniq.map((x) => `#${x}`).join(' ')}`;
      })
      .filter(Boolean)
      .join('\n');
  }

  function rowsToIdTagMap(rows) {
    const map = Object.create(null);
    for (const r of rows || []) {
      if (r?.id) map[r.id] = Array.isArray(r.tags) ? [...r.tags] : [];
    }
    return map;
  }

  function parseTagVocabularyText(rawText) {
    const lines = String(rawText || '')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    const out = [];
    const seen = new Set();
    for (const line of lines) {
      const label = normalizeTagToken(line);
      if (!label || !isValidTagLabel(label)) continue;
      const key = label.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(label);
    }
    return out;
  }

  function mergeRowsPreservingTags(prevRows, idsOrdered) {
    const byId = Object.create(null);
    for (const r of prevRows || []) {
      if (r?.id) byId[r.id] = { id: r.id, tags: Array.isArray(r.tags) ? [...r.tags] : [] };
    }
    return (idsOrdered || []).map((id) => byId[id] || { id, tags: [] });
  }

  function sortRowsWithFavorites(rows, favoriteIds) {
    const fav = new Set(Array.isArray(favoriteIds) ? favoriteIds : []);
    const list = Array.isArray(rows) ? rows : [];
    const favRows = list.filter((r) => r?.id && fav.has(r.id));
    const rest = list.filter((r) => r?.id && !fav.has(r.id));
    return [...favRows, ...rest];
  }

  function tagCountsFromRows(rows) {
    const counts = Object.create(null);
    for (const r of rows || []) {
      for (const t of r.tags || []) {
        const k = String(t);
        counts[k] = (counts[k] || 0) + 1;
      }
    }
    return counts;
  }

  function sortedTagLabelsForTabs(rows) {
    const counts = tagCountsFromRows(rows);
    const labels = Object.keys(counts);
    labels.sort((a, b) => {
      const ca = counts[b] - counts[a];
      if (ca !== 0) return ca;
      return String(a).localeCompare(String(b));
    });
    return labels;
  }

  global.DLSQ = global.DLSQ || {};
  Object.assign(global.DLSQ, {
    MAX_TAG_LEN,
    MAX_TAGS_PER_STICKER,
    parseStickerLine,
    parseStickerIdsText,
    serializeStickerRows,
    rowsToIdTagMap,
    parseTagVocabularyText,
    mergeRowsPreservingTags,
    sortRowsWithFavorites,
    sortedTagLabelsForTabs,
    tagCountsFromRows,
    normalizeTagToken,
    isValidTagLabel,
    normalizeId,
    isValidDLId,
    isValidIMId,
    codePointLength
  });
})(typeof self !== 'undefined' ? self : window);
