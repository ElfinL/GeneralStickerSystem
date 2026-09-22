/**
 * selector.js - 智能選擇器生成器（直接照抄 meta AI）
 */

const SelectorGenerator = {
  isStableClass(cls) {
    if (!cls) return false;
    if (cls.length > 28) return false;
    if (cls.length < 2) return false;
    if (/^\d+$/.test(cls)) return false;
    if (/[0-9]{4,}/.test(cls)) return false;
    if (cls.includes(':')) return false;
    if (cls.startsWith('css-') || cls.startsWith('sc-') || cls.startsWith('emotion-')) {
      if (/[a-f0-9]{4,}/i.test(cls)) return false;
    }
    if (/^(x|a|b|c|d|e|f|g)\d{6,}/i.test(cls)) return false;
    if (/^[a-z]{1,2}\d{2,}$/.test(cls)) return false;
    if (/[A-Z]{3,}/.test(cls) && cls.length > 10) return false;
    return true;
  },

  isStableId(id) {
    if (!id) return false;
    if (id.length > 40) return false;
    if (/[0-9]{5,}/.test(id)) return false;
    if (id.includes(':')) return false;
    return true;
  },

  safeQueryCount(sel) {
    try { return document.querySelectorAll(sel).length; } catch { return 999; }
  },

  getTextSnippet(el) {
    try {
      let t = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
      if (t.length > 60) t = t.slice(0, 60) + '…';
      return t;
    } catch { return ''; }
  },

  generateSelector(el) {
    if (!el || el === document.documentElement) return 'html';
    if (el.id && this.isStableId(el.id)) {
      const idSel = '#' + CSS.escape(el.id);
      if (this.safeQueryCount(idSel) === 1) return idSel;
    }
    let path = [];
    let cur = el;
    let depth = 0;
    while (cur && cur !== document.body && cur !== document.documentElement && depth < 6) {
      let sel = cur.tagName.toLowerCase();
      if (cur.id && this.isStableId(cur.id)) {
        const idSel = '#' + CSS.escape(cur.id);
        if (this.safeQueryCount(idSel) === 1) {
          path.unshift(idSel);
          break;
        }
      }
      const stableClasses = Array.from(cur.classList || []).filter(this.isStableClass);
      if (stableClasses.length > 0) {
        sel = sel + '.' + stableClasses.slice(0,2).map(c => CSS.escape(c)).join('.');
      }
      const parent = cur.parentElement;
      if (parent) {
        const sameTag = Array.from(parent.children).filter(c => c.tagName === cur.tagName);
        if (sameTag.length > 1) {
          const idx = sameTag.indexOf(cur) + 1;
          sel += ':nth-of-type(' + idx + ')';
        }
      }
      path.unshift(sel);
      const full = path.join(' > ');
      if (this.safeQueryCount(full) === 1) break;
      cur = cur.parentElement;
      depth++;
    }
    let finalSel = path.join(' > ');
    // 只有當選擇器不唯一時才使用 nth-child fallback
    if (this.safeQueryCount(finalSel) !== 1) {
      let fallback = [];
      let c = el;
      while (c && c.parentElement && fallback.length < 10) {
        let s = c.tagName.toLowerCase();
        const idx = Array.from(c.parentElement.children).indexOf(c) + 1;
        s += ':nth-child(' + idx + ')';
        fallback.unshift(s);
        c = c.parentElement;
      }
      finalSel = fallback.join(' > ');
    }
    return finalSel;
  },

  getElementInfo(el) {
    return {
      selector: this.generateSelector(el),
      tag: el.tagName.toLowerCase(),
      text: this.getTextSnippet(el),
      id: el.id || '',
      classes: Array.from(el.classList || []).slice(0, 3).join(' ')
    };
  }
};

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SelectorGenerator;
}