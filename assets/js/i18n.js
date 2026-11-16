(() => {
  'use strict';

  // Original Russian content remains the source of truth for the default locale.
  const source = Array.from(document.querySelectorAll('[data-i18n]'))
    .map(node => ({ node, key: node.dataset.i18n, ru: node.textContent }));

  const en = {
    name: 'Ivan Mudriakov',
    aboutNav: 'About',
    projectsNav: 'Projects',
    contactsNav: 'Contacts',
    heroEyebrow: 'Ivan Mudriakov · Full-stack Developer',
    heroTitle: 'I build digital products',
    heroAccent: 'for real-world needs.',
    heroDescription: 'Web applications, Telegram Mini Apps, AI tools and process automation. From architecture and development to launch and ongoing support.',
    heroProjects: 'Explore projects',
    heroContact: 'Get in touch',
    aboutEyebrow: 'About the developer',
    aboutTitle: 'Ivan Mudriakov',
    aboutText: 'I am a full-stack developer. I build web services, Telegram bots and mini apps, develop APIs, integrate external systems and automate workflows. My work spans front-end interfaces, back-end architecture, databases and infrastructure.',
    aiSkill: 'AI integrations',
    projectsHeading: 'Projects',
    contactEyebrow: 'Get in touch',
    contactsHeading: 'Contacts',
    contactDescription: "Tell me about your project so we can find the right way to build it.",
    emailAction: 'Send an email',
    vkName: 'VK',
    footerServices: 'Web development · AI · Automation',
    devStatus: 'In development',
    cookieText: 'We use browser storage for essential site features. With your permission, we also use Yandex Metrica to understand site visits.',
    cookieDetails: 'Analytics is optional. You can change your choice using Cookie settings in the footer.',
    cookieAccept: 'Allow analytics',
    cookieReject: 'Essential only',
    cookieSettings: 'Cookie settings',
  };

  const projectTranslations = [
    {
      title: 'Shuhov Code - AI Platform',
      body: 'A web platform for building websites and web applications with artificial intelligence. It brings together an AI agent, visual interface editing and source-code tools in one workspace.<br>Named in honor of the engineer Vladimir Grigoryevich Shukhov.'
    },
    {
      title: 'MinuetAI | AI Music',
      body: 'A Telegram Mini App for creating music and songs with artificial intelligence. Turn ideas and text prompts into complete tracks with music and vocals right inside Telegram.<br>Create your own songs, explore musical styles and listen to the results in the app.'
    },
    {
      title: 'Erokha - AI VPS Administrator',
      body: 'An AI assistant for VPS and Docker administration: monitors container status, sends Telegram alerts about failures and helps investigate issues.<br>The owner can use authorized server commands, while visitors can contact the developer through the bot’s reception.'
    },
    {
      title: 'Horo Telegram',
      body: 'Personalized horoscopes and AI-powered predictions about life, love, work, finances and the future. Daily, weekly, monthly and yearly forecasts, plus individual astrology readings in a Telegram Mini App.<br>The app also offers a referral program.'
    },
    {
      title: 'Tarot Readings',
      body: 'A Telegram Mini App for personalized Tarot readings and card interpretations. Choose a spread, ask your question and explore the meaning of the cards directly in Telegram.<br>The app also features a referral program.'
    },
    {
      title: 'Magic 8 Ball',
      body: 'A Telegram bot with mystical predictions. Ask a question that can be answered with “yes” or “no” and receive a mysterious answer from the Magic 8 Ball.<br>The bot also features a referral program.'
    },
    {
      title: 'MyBooking.uz Telegram MINI APP',
      body: 'Find and book hotels across Uzbekistan directly in Telegram.<br><span class="text-gray-500">Stack:</span><br>React 18 + TypeScript • Vite (SWC) • TailwindCSS • shadcn/ui • Framer Motion • Axios • Telegram WebApp SDK<br>Node.js (Express) • Nginx (reverse proxy, caching, SSL, CORS) • Partners API (MyBooking.uz)<br><span class="text-gray-500 text-sm">Open the app and try it right now!</span>'
    }
  ];

  const projectCards = Array.from(document.querySelectorAll('#projects .grid > div'))
    .map(card => {
      const heading = card.querySelector('h3');
      const description = card.querySelector('p');
      return {
        heading, description,
        originalHeading: heading ? heading.textContent : '',
        originalDescription: description ? description.innerHTML : ''
      };
    });

  const projectActionLinks = Array.from(document.querySelectorAll('#projects .grid > div'))
    .map(card => card.querySelector('a'))
    .filter(Boolean);
  const originalProjectActionLabels = projectActionLinks.map(link => link.textContent);
  const metaDescription = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  const nav = document.querySelector('.site-nav');
  const brand = document.querySelector('.brand');
  const avatar = document.querySelector('.portrait');
  const skills = document.querySelector('.skills');
  const languageButtons = Array.from(document.querySelectorAll('[data-language]'));
  const emailLink = document.querySelector('.contact-links a[href^="mailto:"]');
  const vkLink = document.querySelector('.contact-links a[href^="https://vk.ru/"]');

  function storePreference(language) {
    try { localStorage.setItem('siteLanguage', language); } catch (_) { /* Storage may be disabled. */ }
  }

  function readPreference() {
    try {
      const stored = localStorage.getItem('siteLanguage');
      return stored === 'ru' || stored === 'en' ? stored : null;
    } catch (_) { return null; }
  }

  function defaultLanguage() {
    const browserLocale = navigator.language || (navigator.languages && navigator.languages[0]) || '';
    const primary = String(browserLocale).toLowerCase().split('-')[0];
    return primary === 'en' ? 'en' : 'ru';
  }

  const cookieRu = {
    cookieText: 'Для работы сайта используем хранилище браузера. С Вашего разрешения также подключим Яндекс Метрику для анализа посещений.',
    cookieDetails: 'Аналитика необязательна. Изменить выбор можно в разделе «Настройки cookie» внизу страницы.',
    cookieAccept: 'Разрешить аналитику',
    cookieReject: 'Только необходимые',
    cookieSettings: 'Настройки cookie'
  };

  function updateCookieNotice(language) {
    const text = language === 'en' ? en : cookieRu;
    const settings = document.getElementById('cookieSettings');
    if (settings) text.cookieSettings && (settings.textContent = text.cookieSettings);
    const notice = document.getElementById('cookie-notice');
    if (!notice) return;
    notice.setAttribute('aria-label', text.cookieSettings);
    const label = notice.querySelector('.cookie-label');
    const details = notice.querySelector('.cookie-details');
    const accept = notice.querySelector('#acceptCookies');
    const reject = notice.querySelector('#rejectCookies');
    if (label) label.textContent = text.cookieText;
    if (details) details.textContent = text.cookieDetails;
    if (accept) accept.textContent = text.cookieAccept;
    if (reject) reject.textContent = text.cookieReject;
  }

  function cookieChoice() {
    try {
      const choice = localStorage.getItem('siteCookieConsent');
      return choice === 'analytics' || choice === 'essential' ? choice : null;
    } catch (_) { return null; }
  }

  let analyticsLoaded = false;
  function enableAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    // Only initialize Yandex Metrica when analytics was explicitly allowed.
    (function(m,e,t,r,i,k,a) {
      m[i] = m[i] || function() { (m[i].a=m[i].a||[]).push(arguments); };
      m[i].l = 1*new Date();
      for (let j=0; j<document.scripts.length; j++) {
        if (document.scripts[j].src === r) return;
      }
      k=e.createElement(t); a=e.getElementsByTagName(t)[0];
      k.async=1; k.src=r; a.parentNode.insertBefore(k,a);
    })(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
    window.ym(100821330, 'init', {
      clickmap:true,
      trackLinks:true,
      accurateTrackBounce:true,
      webvisor:true
    });
  }

  function applyLanguage(language) {
    const isEnglish = language === 'en';
    document.documentElement.lang = language;
    for (const item of source) {
      item.node.textContent = isEnglish ? (en[item.key] ?? item.ru) : item.ru;
    }
    projectCards.forEach((card, index) => {
      if (!card.heading || !card.description) return;
      const translated = projectTranslations[index];
      if (isEnglish && translated) {
        card.heading.textContent = translated.title;
        card.description.innerHTML = translated.body;
      } else {
        card.heading.textContent = card.originalHeading;
        card.description.innerHTML = card.originalDescription;
      }
    });
    projectActionLinks.forEach((link, index) => {
      link.textContent = isEnglish
        ? (link.href.includes('shuhov-code.ru') ? 'Visit platform' : link.href.includes('Mybookinguz_app_bot') ? 'Open MyBooking.uz' : (link.href.includes('m8all_MJFW_bot') || link.href.includes('ai_vps_administrator_bot')) ? 'Open bot' : 'Open app')
        : originalProjectActionLabels[index];
    });

    // The browser tab title must contain the localized personal name only.
    document.title = isEnglish ? 'Ivan Mudriakov' : 'Иван Мудряков';
    if (metaDescription) metaDescription.content = isEnglish
      ? 'Ivan Mudriakov - Full-stack developer. Web applications, Telegram Mini Apps, AI tools and business process automation.'
      : 'Иван Мудряков - Fullstack-разработчик. Веб-приложения, Telegram Mini Apps, AI-инструменты и автоматизация бизнес-процессов.';
    if (ogTitle) ogTitle.content = document.title;
    if (ogDescription) ogDescription.content = isEnglish
      ? 'Web applications, Telegram Mini Apps, AI tools and automation.'
      : 'Веб-приложения, Telegram Mini Apps, AI-инструменты и автоматизация.';
    if (ogLocale) ogLocale.content = isEnglish ? 'en_US' : 'ru_RU';
    if (nav) nav.setAttribute('aria-label', isEnglish ? 'Main navigation' : 'Основная навигация');
    if (brand) brand.setAttribute('aria-label', isEnglish ? 'Ivan Mudriakov - Home' : 'Иван Мудряков - на главную');
    if (avatar) avatar.alt = document.title;
    if (skills) skills.setAttribute('aria-label', isEnglish ? 'Technologies' : 'Технологии');
    if (emailLink) emailLink.setAttribute('aria-label', isEnglish ? 'Email - Send an email' : 'Email - Написать письмо');
    if (vkLink) vkLink.setAttribute('aria-label', (isEnglish ? 'VK' : 'ВКонтакте') + ' - @ivan_mudriakov');
    for (const button of languageButtons) {
      const active = button.dataset.language === language;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('active', active);
    }
    const switcher = document.querySelector('.language-switch');
    if (switcher) switcher.setAttribute('aria-label', isEnglish ? 'Choose language' : 'Выбор языка');
    updateCookieNotice(language);
  }

  languageButtons.forEach(button => {
    button.addEventListener('click', () => {
      const chosen = button.dataset.language;
      if (chosen !== 'ru' && chosen !== 'en') return;
      storePreference(chosen);
      applyLanguage(chosen);
    });
  });

  const initialLanguage = readPreference() || defaultLanguage();
  applyLanguage(initialLanguage);

  document.getElementById('year').textContent = new Date().getFullYear();
  let consent = cookieChoice();
  const notice = document.createElement('section');
  notice.id = 'cookie-notice';
  notice.className = 'cookie-consent';
  notice.setAttribute('role', 'region');
  notice.innerHTML = [
    '<div class="cookie-copy"><span class="cookie-label"></span><span class="cookie-details"></span></div>',
    '<div class="cookie-buttons"><button type="button" id="rejectCookies"></button>',
    '<button type="button" id="acceptCookies"></button></div>'
  ].join('');
  notice.hidden = consent !== null;
  document.body.appendChild(notice);
  const cookieSettings = document.getElementById('cookieSettings');
  const setConsent = choice => {
    const previous = consent;
    consent = choice;
    try {
      localStorage.setItem('siteCookieConsent', choice);
      localStorage.removeItem('cookiesAccepted');
    } catch (_) {}
    notice.hidden = true;
    if (choice === 'analytics') enableAnalytics();
    // A reload is needed to stop an analytics script already running on this page.
    else if (previous === 'analytics' || analyticsLoaded) window.location.reload();
    else if (cookieSettings) cookieSettings.focus({preventScroll:true});
  };
  notice.querySelector('#rejectCookies').addEventListener('click', () => setConsent('essential'));
  notice.querySelector('#acceptCookies').addEventListener('click', () => setConsent('analytics'));
  if (cookieSettings) cookieSettings.addEventListener('click', () => {
    notice.hidden = false;
    updateCookieNotice(document.documentElement.lang);
    notice.querySelector('#rejectCookies').focus({preventScroll:true});
  });
  updateCookieNotice(initialLanguage);
  if (consent === 'analytics') enableAnalytics();
})();
