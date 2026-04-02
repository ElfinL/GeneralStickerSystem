// help.js - Help page language switch functionality

document.addEventListener('DOMContentLoaded', () => {
  const langBtns = document.querySelectorAll('.lang-btn');
  const contentZhTW = document.getElementById('content-zh-TW');
  const contentZhCN = document.getElementById('content-zh-CN');
  const contentEn = document.getElementById('content-en');
  const contentJa = document.getElementById('content-ja');
  const contentKo = document.getElementById('content-ko');
  const headerSubtitle = document.getElementById('header-subtitle');

  const subtitles = {
    'zh-TW': '通用貼圖系統',
    'zh-CN': '通用贴图系统',
    'en': 'General Sticker System',
    'ja': '汎用ステッカーシステム',
    'ko': '범용 스티커 시스템'
  };

  const pageTitles = {
    'zh-TW': 'GSS - 使用說明',
    'zh-CN': 'GSS - 使用说明',
    'en': 'GSS - Help',
    'ja': 'GSS - 使い方',
    'ko': 'GSS - 사용 방법'
  };

  function showContent(lang) {
    // Hide all content
    contentZhTW.classList.add('hidden');
    contentZhCN.classList.add('hidden');
    contentEn.classList.add('hidden');
    contentJa.classList.add('hidden');
    contentKo.classList.add('hidden');

    // Show selected content
    if (lang === 'zh-TW') contentZhTW.classList.remove('hidden');
    else if (lang === 'zh-CN') contentZhCN.classList.remove('hidden');
    else if (lang === 'en') contentEn.classList.remove('hidden');
    else if (lang === 'ja') contentJa.classList.remove('hidden');
    else if (lang === 'ko') contentKo.classList.remove('hidden');

    // Update header subtitle
    if (headerSubtitle && subtitles[lang]) {
      headerSubtitle.textContent = subtitles[lang];
    }

    // Update page title
    if (pageTitles[lang]) {
      document.title = pageTitles[lang];
    }
  }

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;

      // Update button states
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show selected content
      showContent(lang);
    });
  });
});
