/**
 * storage.js - 清潔元素規則存儲管理
 * 按平台/域名獨立存儲隱藏規則
 */

const CleanStorage = {
  STORAGE_KEY: 'cleanElementRules',
  STORAGE_KEY: 'cleanElementRules',

  /**
   * 獲取指定平台的規則
   */
  async getRules(platform) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get([this.STORAGE_KEY], (result) => {
          const allRules = result[this.STORAGE_KEY] || {};
          resolve(allRules[platform] || []);
        });
      } else {
        // Fallback for testing
        const allRules = localStorage.getItem(this.STORAGE_KEY) || '{}';
        const parsed = JSON.parse(allRules);
        resolve(parsed[platform] || []);
      }
    });
  },

  /**
   * 保存指定平台的規則
   */
  async saveRules(platform, rules) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get([this.STORAGE_KEY], (result) => {
          const allRules = result[this.STORAGE_KEY] || {};
          allRules[platform] = rules;
          chrome.storage.local.set({ [this.STORAGE_KEY]: allRules }, () => {
            resolve();
          });
        });
      } else {
        // Fallback for testing
        const allRules = localStorage.getItem(this.STORAGE_KEY) || '{}';
        const parsed = JSON.parse(allRules);
        parsed[platform] = rules;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(parsed));
        resolve();
      }
    });
  },

  /**
   * 添加一條規則
   */
  async addRule(platform, rule) {
    const rules = await this.getRules(platform);
    // 檢查是否已存在相同選擇器
    if (rules.some(r => r.selector === rule.selector)) {
      return { success: false, message: '選擇器已存在' };
    }
    rules.push(rule);
    await this.saveRules(platform, rules);
    return { success: true };
  },

  /**
   * 刪除一條規則
   */
  async removeRule(platform, ruleId) {
    const rules = await this.getRules(platform);
    const filtered = rules.filter(r => r.id !== ruleId);
    await this.saveRules(platform, filtered);
    return { success: true };
  },

  /**
   * 刪除平台的所有規則
   */
  async clearRules(platform) {
    await this.saveRules(platform, []);
    return { success: true };
  },

  /**
   * 更新規則狀態（啟用/禁用）
   */
  async updateRuleStatus(platform, ruleId, enabled) {
    const rules = await this.getRules(platform);
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
      await this.saveRules(platform, rules);
      return { success: true };
    }
    return { success: false, message: '規則不存在' };
  },

  /**
   * 獲取所有平台的規則摘要
   */
  async getAllRulesSummary() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get([this.STORAGE_KEY], (result) => {
          const allRules = result[this.STORAGE_KEY] || {};
          const summary = {};
          for (const platform in allRules) {
            summary[platform] = {
              count: allRules[platform].length,
              enabled: allRules[platform].filter(r => r.enabled !== false).length
            };
          }
          resolve(summary);
        });
      } else {
        // Fallback for testing
        const allRules = localStorage.getItem(this.STORAGE_KEY) || '{}';
        const parsed = JSON.parse(allRules);
        const summary = {};
        for (const platform in parsed) {
          summary[platform] = {
            count: parsed[platform].length,
            enabled: parsed[platform].filter(r => r.enabled !== false).length
          };
        }
        resolve(summary);
      }
    });
  }
};

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CleanStorage;
}