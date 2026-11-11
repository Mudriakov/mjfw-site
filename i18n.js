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
    cookieText: 'This website uses cookies to improve your experience.',
    cookieAccept: 'Accept',
  };

  const projectTranslations = [
    {
      title: 'MyBooking.uz Telegram MINI APP',
      body: 'Find and book hotels across Uzbekistan directly in Telegram.<br><span class="text-gray-500">Stack:</span><br>React 18 + TypeScript • Vite (SWC) • TailwindCSS • shadcn/ui • Framer Motion • Axios • Telegram WebApp SDK<br>Node.js (Express) • Nginx (reverse proxy, caching, SSL, CORS) • Partners API (MyBooking.uz)<br><span class="text-gray-500 text-sm">Open the app and try it right now!</span>'
    },
    {
      title: 'Telegram Business Card MINI APP',
      body: 'A modern business-card mini app for Telegram.<br>Demo features include an interactive calculator, playful buttons and a practical showcase of Telegram WebApp capabilities.<br>Responsive layouts, smooth animations and clean code demonstrate how to present projects or services directly inside Telegram.<br>All logic and event handling were built from scratch.<br><span class="text-gray-500 text-sm">Launch the app from the bot and try it now!</span>'
    },
    {
      title: 'Crypto Bot',
      body: 'Real-time cryptocurrency prices and price history powered by Binance.'
    },
    {
      title: 'Weather Bot',
      body: 'Weather forecasts by city, with emoji and detailed descriptions.'
    },
    {
      title: 'Moderation Bot',
      body: 'A Telegram chat moderation bot with word filters and temporary bans.'
    },
    {
      title: 'Russian News',
      body: 'An RSS bot for posting Russian-language news to Telegram channels.'
    },
    {
      title: 'English News',
      body: 'A bot for publishing English-language news on Telegram.'
    },
    {
      title: 'Magic 8 Ball',
      body: 'A Telegram fortune-telling bot with voice replies and emoji.'
    },
    {
      title: 'M/W Show Parser',
      body: 'A script that extracts full episodes of the TV show “Muzhskoye / Zhenskoye” from 1tv.ru, excluding clips and fragments while preserving titles and descriptions.'
    },
    {
      title: 'Telegram ID Logger',
      body: 'A universal script that instantly retrieves <b>chat_id</b> and <b>user_id</b>, and logs activity in Telegram chats, groups and channels.<br>Add a bot token, start the script and forward a message to see IDs and events in the logs.'
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

  const botLinks = Array.from(document.querySelectorAll('#projects a'))
    .filter(link => link.textContent.trim() === 'Бот в действии');
  const metaDescription = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  const nav = document.querySelector('.site-nav');
  const brand = document.querySelector('.brand');
  const avatar = document.querySelector('.portrait');
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
    const languages = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || ''];
    for (const value of languages) {
      const primary = String(value || '').toLowerCase().split('-')[0];
      if (primary === 'ru' || primary === 'en') return primary;
    }
    return 'ru';
  }

  function updateCookieNotice(language) {
    const notice = document.getElementById('cookie-notice');
    if (!notice) return;
    const label = notice.querySelector('.cookie-label');
    const accept = notice.querySelector('#acceptCookies');
    if (label) label.textContent = language === 'en' ? en.cookieText : 'Сайт использует cookies для улучшения работы.';
    if (accept) accept.textContent = language === 'en' ? en.cookieAccept : 'Принять';
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
    botLinks.forEach(link => { link.textContent = isEnglish ? 'Live bot' : 'Бот в действии'; });

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
  let cookieAccepted = false;
  try { cookieAccepted = !!localStorage.getItem('cookiesAccepted'); } catch (_) {}
  if (!cookieAccepted) {
    const notice = document.createElement('div');
    notice.id = 'cookie-notice';
    notice.innerHTML = '<span class="cookie-label"></span><button type="button" id="acceptCookies"></button>';
    document.body.appendChild(notice);
    updateCookieNotice(initialLanguage);
    notice.querySelector('#acceptCookies').addEventListener('click', () => {
      try { localStorage.setItem('cookiesAccepted', 'true'); } catch (_) {}
      notice.remove();
    });
  }
})();
