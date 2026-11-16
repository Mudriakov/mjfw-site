(() => {
  "use strict";
  const el = document.currentScript;
  const api = String(el?.dataset.erokhaApi || "").replace(/\/+$/, "");
  const enabled = /^https:\/\/[^/\s]+/i.test(api);
  const copy = {
    ru: {
      title:"Ероха", subtitle:"ИИ-ассистент Ивана Мудрякова", open:"Открыть чат", close:"Свернуть чат",
      hello:"Здравствуйте! 👋 Я Ероха, помощник Ивана Мудрякова. Расскажу о проектах, помогу разобраться с разработкой и передать заявку. Переписка сохраняется; Иван получит Ваше обращение только с согласия.",
      input:"Ваше сообщение...", send:"Отправить", action:"Передать заявку Ивану", direct:"Контакты Ивана",
      request:"Расскажите о своей задаче", contact:"Telegram или email (необязательно)",
      consent:"Согласен на сохранение переписки и передачу заявки Ивану Мудрякову.",
      cancel:"Отмена", submit:"Передать", typing:"Ероха думает...", loading:"Загружаю переписку...",
      offline:"Чат пока не подключён к серверу. Вы можете связаться с Иваном через раздел «Контакты».",
      error:"Сервис временно недоступен. Попробуйте позже.", sent:"Обращение принято для передачи Ивану. Ответ появится здесь, когда он ответит.",
      expired:"Сессия обновлена. Черновик сохранён, отправьте его ещё раз.", conflict:"Конфликт повторной отправки. Проверьте историю, прежде чем отправлять заново.",
      slowDown:"Давайте немного подождём. При необходимости можно оставить обращение Ивану.",
      owner:"Иван Мудряков", choices:["Веб-приложение","Telegram Mini App","ИИ / автоматизация","Другая задача"],
      questions:["Здравствуйте! Хочу заказать веб-приложение. Что нужно для старта?","Мне нужно Telegram Mini App для бизнеса. Поможете разобраться?","Хочу автоматизировать бизнес-процесс с помощью ИИ.","Здравствуйте! Хочу рассказать о своём проекте."]
    },
    en: {
      title:"Erokha", subtitle:"Ivan Mudriakov's AI assistant", open:"Open chat", close:"Minimize chat",
      hello:"Hello! 👋 I'm Erokha, Ivan Mudriakov's assistant. I can explain his projects, answer development questions, and help you send an inquiry. The chat is saved; your inquiry is shared only with consent.",
      input:"Your message...", send:"Send", action:"Send an inquiry to Ivan", direct:"Ivan's contacts",
      request:"Describe your development project", contact:"Telegram or email (optional)",
      consent:"I agree to save this conversation and forward my inquiry to Ivan Mudriakov.",
      cancel:"Cancel", submit:"Send", typing:"Erokha is thinking...", loading:"Loading conversation...",
      offline:"Chat is not connected to the server yet. Please use the Contacts section to reach Ivan.",
      error:"Service is temporarily unavailable. Please try again later.", sent:"Your inquiry has been queued for delivery to Ivan. His reply will appear here when available.",
      expired:"Your session has been renewed. Your draft is saved; please submit it again.", conflict:"Message request conflict. Check the conversation before submitting again.",
      slowDown:"Please wait a little before trying again. You can also leave an inquiry for Ivan.",
      owner:"Ivan Mudriakov", choices:["Web application","Telegram Mini App","AI / automation","Another project"],
      questions:["Hello! I need a web application. What do we need to start?","I need a Telegram Mini App for my business. Can you advise?","I would like to automate a workflow with AI.","Hello! I would like to describe a development project."]
    }
  };
  const start = () => {
    if (document.getElementById("erokha-chat")) return;
    const root = document.createElement("section");
    root.id = "erokha-chat";
    root.innerHTML = [
      '<div class="erokha-panel" role="dialog" aria-modal="false" aria-labelledby="ero-title" id="ero-panel" aria-hidden="true" inert>',
      '<div class="erokha-head"><img alt="" src="/assets/images/erokha-avatar.png" width="42" height="42">',
      '<div class="erokha-identity"><strong id="ero-title" data-ero="title"></strong><small data-ero="subtitle"></small></div>',
      '<button type="button" class="erokha-icon erokha-close">×</button></div>',
      '<div class="erokha-scroll" aria-live="polite"><div class="erokha-welcome" data-ero="hello"></div>',
      '<div class="erokha-chips"></div><div class="erokha-messages"></div></div>',
      '<div class="erokha-status" role="status"></div>',
      '<div class="erokha-actions"><button type="button" class="erokha-action" data-ero="action"></button>',
      '<a class="erokha-direct" href="#contact" data-ero="direct"></a></div>',
      '<form class="erokha-compose"><textarea class="erokha-input" rows="1" maxlength="4000" required></textarea>',
      '<button type="submit" class="erokha-send">➤</button></form>',
      '<form class="erokha-contact-form"><label><span data-ero="request"></span>',
      '<textarea class="erokha-contact-field erokha-request" rows="3" maxlength="2500" required></textarea></label>',
      '<input class="erokha-contact-field erokha-contact-detail" maxlength="300">',
      '<label class="erokha-consent"><input type="checkbox" class="erokha-optin" required><span data-ero="consent"></span></label>',
      '<div class="erokha-contact-row"><button type="button" class="erokha-btn erokha-cancel" data-ero="cancel"></button>',
      '<button class="erokha-btn primary erokha-submit" type="submit" data-ero="submit"></button></div></form></div>',
      '<button type="button" class="erokha-launcher" aria-controls="ero-panel" aria-expanded="false">',
      '<img src="/assets/images/erokha-avatar.png" alt="" width="56" height="56"></button>'
    ].join("");
    document.body.append(root);
    const get = selector => root.querySelector(selector);
    const launcher = get(".erokha-launcher"), input = get(".erokha-input");
    const list = get(".erokha-messages"), scroll = get(".erokha-scroll"), status = get(".erokha-status");
    const language = () => document.documentElement.lang === "en" ? "en" : "ru";
    const tr = key => copy[language()][key];
    let token, busy = false, open = false, fetching = false, poll = null, statusKey = "";
    let sessionPromise = null, pending = null, waitingForResponse = false, lastItems = [], cooldownUntil = 0;
    try {
      token = sessionStorage.getItem("erokha_session_v1");
      const stored = JSON.parse(sessionStorage.getItem("erokha_pending_v1") || "null");
      if (stored && typeof stored.message === "string" && typeof stored.request_id === "string") {
        pending = stored;
        waitingForResponse = stored.state === "processing";
      }
    } catch (_) {}
    function savePending() {
      try {
        if (pending) sessionStorage.setItem("erokha_pending_v1", JSON.stringify(pending));
        else sessionStorage.removeItem("erokha_pending_v1");
      } catch (_) {}
    }
    const inform = key => { statusKey = key; status.textContent = key ? tr(key) : ""; };
    function setBusy(value) {
      busy = value;
      input.disabled = value || waitingForResponse || !enabled;
      get(".erokha-send").disabled = value || waitingForResponse || !enabled;
      get(".erokha-action").disabled = value || !enabled;
      get(".erokha-submit").disabled = value || !enabled;
    }
    function translate() {
      root.querySelectorAll("[data-ero]").forEach(node => node.textContent = tr(node.dataset.ero));
      launcher.setAttribute("aria-label",tr("open"));
      get(".erokha-close").setAttribute("aria-label",tr("close"));
      input.placeholder = tr("input");
      get(".erokha-send").setAttribute("aria-label",tr("send"));
      get(".erokha-contact-detail").placeholder = tr("contact");
      status.textContent = statusKey ? tr(statusKey) : "";
      const chips = get(".erokha-chips"); chips.replaceChildren();
      tr("choices").forEach((label, i) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "erokha-chip"; b.textContent = label; b.disabled = !enabled;
        b.addEventListener("click", () => { if (!busy) { input.value = tr("questions")[i]; input.focus(); } });
        chips.append(b);
      });
    }
    function messageText(parent,text) {
      const content = String(text || "");
      const regex = /(\*\*[^*\n]+\*\*|\x60[^\x60\n]+\x60|https:\/\/[^\s<>]+)/g;
      let start = 0;
      for (const hit of content.matchAll(regex)) {
        parent.append(document.createTextNode(content.slice(start,hit.index)));
        const s = hit[0], node = document.createElement(s.startsWith("**")?"strong":s[0]==="\x60"?"code":"a");
        if (s.startsWith("**")) node.textContent = s.slice(2,-2);
        else if (s[0]==="\x60") node.textContent = s.slice(1,-1);
        else {
          const u = new URL(s); node.href = u.href; node.target = "_blank"; node.rel = "noopener noreferrer"; node.textContent = s;
        }
        parent.append(node); start = hit.index+s.length;
      }
      parent.append(document.createTextNode(content.slice(start)));
    }
    function show(items) {
      lastItems = items.filter(item => ["user","assistant","developer"].includes(item.role));
      const atEnd = scroll.scrollHeight-scroll.scrollTop-scroll.clientHeight < 90;
      const fingerprint = JSON.stringify(lastItems.map(item => [item.role,item.text,language()]));
      if (list.dataset.fingerprint !== fingerprint) {
        list.dataset.fingerprint = fingerprint;
        list.replaceChildren();
        for (const item of lastItems) {
          const bubble = document.createElement("div");
          bubble.className = "erokha-bubble " + item.role;
          const label = document.createElement("span");
          label.className = "erokha-role";
          label.textContent = item.role === "developer" ? tr("owner") : item.role === "user"
            ? (language() === "en" ? "You" : "Вы") : tr("title");
          bubble.append(label);
          messageText(bubble,item.text);
          list.append(bubble);
        }
      }
      if (atEnd) scroll.scrollTop = scroll.scrollHeight;
      if (waitingForResponse && pending) {
        const newer = lastItems.slice(Math.max(0,pending.baseline || 0));
        const userIndex = newer.findLastIndex(item => item.role === "user" && item.text === pending.message);
        if (userIndex >= 0 && newer.slice(userIndex + 1).some(item => item.role === "assistant")) {
          waitingForResponse = false;
          pending = null;
          savePending();
          setBusy(false);
          inform("");
        }
      }
    }
    async function call(path,options={}) {
      if (!enabled) throw new Error("offline");
      const controller = new AbortController(), timeout = setTimeout(()=>controller.abort(),90000);
      try {
        const response = await fetch(api+path,{
          ...options, signal:controller.signal, mode:"cors",credentials:"omit",cache:"no-store",
          headers:{"Content-Type":"application/json",...(token?{"X-Eroha-Session":token}:{}),...(options.headers||{})}
        });
        if (!response.ok) {
          const error = new Error("Request failed");
          error.status = response.status;
          try { error.code = (await response.json()).error; } catch (_) {}
          throw error;
        }
        return response.json();
      } finally { clearTimeout(timeout); }
    }
    async function session() {
      if (token) return;
      if (!sessionPromise) {
        sessionPromise = (async () => {
          const data = await call("/v1/session",{method:"POST",body:JSON.stringify({language:language()})});
          if (!data.session_token) throw new Error("Session missing");
          token = data.session_token;
          try { sessionStorage.setItem("erokha_session_v1",token); } catch (_) {}
        })().finally(() => { sessionPromise = null; });
      }
      await sessionPromise;
    }
    async function handleError(error) {
      if (error.status === 401) {
        token = null;
        pending = null;
        waitingForResponse = false;
        savePending();
        try { sessionStorage.removeItem("erokha_session_v1"); } catch (_) {}
        inform("expired");
        try { await session(); } catch (_) { inform("error"); }
      } else if (error.status === 409) {
        pending = null; savePending(); inform("conflict");
      } else if (error.status === 429) {
        cooldownUntil = Date.now() + 30000;
        inform("slowDown");
      } else {
        inform("error");
      }
    }
    async function refresh() {
      if (!open || document.hidden || fetching || !enabled || Date.now() < cooldownUntil) return;
      fetching = true;
      try {
        await session();
        const data = await call("/v1/history");
        show(Array.isArray(data.messages) ? data.messages : []);
        if (statusKey === "loading") inform("");
      } catch (error) {
        await handleError(error);
      } finally { fetching = false; }
    }
    function updatePolling() {
      if (poll) clearInterval(poll);
      poll = null;
      if (open && !document.hidden && enabled) {
        poll = setInterval(refresh,5000);
        void refresh();
      }
    }
    function close() {
      open=false; root.classList.remove("is-open","contact-open");
      get(".erokha-panel").setAttribute("inert","");
      get(".erokha-panel").setAttribute("aria-hidden","true");
      launcher.setAttribute("aria-expanded","false");
      if (poll) clearInterval(poll); poll=null; launcher.focus();
    }
    launcher.addEventListener("click",()=>{
      open=true; root.classList.add("is-open"); launcher.setAttribute("aria-expanded","true");
      get(".erokha-panel").removeAttribute("inert");
      get(".erokha-panel").setAttribute("aria-hidden","false");
      inform(enabled?"loading":"offline");
      if (enabled) { updatePolling(); if (!waitingForResponse) input.focus(); }
      else get(".erokha-direct").focus();
    });
    get(".erokha-close").addEventListener("click",close);
    root.addEventListener("keydown",e=>{
      if (e.key==="Escape"&&open) {
        e.preventDefault(); if (root.classList.contains("contact-open")) root.classList.remove("contact-open");
        else close();
      }
    });
    get(".erokha-direct").addEventListener("click",close);
    input.addEventListener("keydown",e=>{
      if (e.key==="Enter"&&!e.shiftKey&&!e.isComposing) { e.preventDefault(); get(".erokha-compose").requestSubmit(); }
    });
    get(".erokha-compose").addEventListener("submit",async e=>{
      e.preventDefault();
      const value = input.value.trim(), selectedLanguage = language();
      if (!enabled || !value || busy || waitingForResponse || Date.now() < cooldownUntil) return;
      if (!pending || pending.message !== value || pending.language !== selectedLanguage || pending.state === "processing") {
        if (!crypto.randomUUID) { inform("error"); return; }
        pending = {message:value, language:selectedLanguage, request_id:crypto.randomUUID(), baseline:lastItems.length, state:"retryable"};
        savePending();
      }
      setBusy(true); inform("typing");
      try {
        await session();
        const result = await call("/v1/message",{method:"POST",body:JSON.stringify({
          message:pending.message, language:pending.language, request_id:pending.request_id
        })});
        if (result.status !== "done" && result.status !== "processing") throw new Error("Unexpected message status");
        waitingForResponse = true;
        pending.state = "processing";
        savePending();
        input.value = "";
        inform("typing");
      } catch (error) {
        await handleError(error);
      } finally {
        setBusy(false);
        await refresh();
        if (open && !waitingForResponse) input.focus();
      }
    });
    get(".erokha-action").addEventListener("click",()=>{
      if (!enabled) return;
      root.classList.add("contact-open");
      if (input.value.trim()&&!get(".erokha-request").value) get(".erokha-request").value=input.value;
      get(".erokha-request").focus();
    });
    get(".erokha-cancel").addEventListener("click",()=>root.classList.remove("contact-open"));
    get(".erokha-contact-form").addEventListener("submit",async e=>{
      e.preventDefault(); const text=get(".erokha-request").value.trim();
      if (!enabled||!text||!get(".erokha-optin").checked||busy) return;
      setBusy(true); inform("typing");
      try {
        await session();
        const result = await call("/v1/contact",{method:"POST",body:JSON.stringify({
          message:text,contact:get(".erokha-contact-detail").value.trim(),consent:true
        })});
        if (!result.id || result.status !== "queued") throw new Error("Unexpected inquiry response");
        root.classList.remove("contact-open");
        get(".erokha-optin").checked = false;
        get(".erokha-request").value = "";
        get(".erokha-contact-detail").value = "";
        inform("sent");
      } catch (error) { await handleError(error); }
      finally { setBusy(false); await refresh(); }
    });
    document.addEventListener("visibilitychange",updatePolling);
    new MutationObserver(() => { translate(); show(lastItems); }).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
    window.addEventListener("site:languagechange",() => { translate(); show(lastItems); });
    translate(); setBusy(false);
    if (pending && pending.state === "processing") {
      waitingForResponse = true;
      setBusy(false);
      inform("typing");
    }
    if (!enabled) inform("offline");
  };
  if (document.readyState==="loading") document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();
