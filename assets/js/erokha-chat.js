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
      error:"Сервис временно недоступен. Попробуйте позже.", sent:"Обращение передано Ивану. Ответ появится здесь, когда он ответит.",
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
      error:"Service is temporarily unavailable. Please try again later.", sent:"Inquiry sent. Ivan's reply will appear here when available.",
      owner:"Ivan Mudriakov", choices:["Web application","Telegram Mini App","AI / automation","Another project"],
      questions:["Hello! I need a web application. What do we need to start?","I need a Telegram Mini App for my business. Can you advise?","I would like to automate a workflow with AI.","Hello! I would like to describe a development project."]
    }
  };
  const start = () => {
    if (document.getElementById("erokha-chat")) return;
    const root = document.createElement("section");
    root.id = "erokha-chat";
    root.innerHTML = [
      '<div class="erokha-panel" role="dialog" aria-modal="false" aria-labelledby="ero-title" id="ero-panel">',
      '<div class="erokha-head"><img alt="" src="/assets/images/erokha-avatar.png" width="42" height="42">',
      '<div class="erokha-identity"><strong id="ero-title" data-ero="title"></strong><small data-ero="subtitle"></small></div>',
      '<button type="button" class="erokha-icon erokha-close">×</button></div>',
      '<div class="erokha-scroll" aria-live="polite"><div class="erokha-welcome" data-ero="hello"></div>',
      '<div class="erokha-chips"></div><div class="erokha-messages"></div></div>',
      '<div class="erokha-status" role="status"></div>',
      '<div class="erokha-actions"><button type="button" class="erokha-action" data-ero="action"></button>',
      '<a class="erokha-direct" href="#contact" data-ero="direct"></a></div>',
      '<form class="erokha-compose"><textarea class="erokha-input" rows="1" maxlength="2500" required></textarea>',
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
    try { token = sessionStorage.getItem("erokha_session_v1"); } catch (_) {}
    const inform = key => { statusKey = key; status.textContent = key ? tr(key) : ""; };
    function setBusy(value) {
      busy = value;
      input.disabled = value || !enabled;
      get(".erokha-send").disabled = value || !enabled;
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
      const atEnd = scroll.scrollHeight-scroll.scrollTop-scroll.clientHeight < 90;
      list.replaceChildren();
      for (const msg of items) {
        if (!["user","assistant","developer"].includes(msg.role)) continue;
        const bubble = document.createElement("div"); bubble.className = "erokha-bubble "+msg.role;
        if (msg.role==="developer") {
          const label = document.createElement("span"); label.className = "erokha-role"; label.textContent = tr("owner"); bubble.append(label);
        }
        messageText(bubble,msg.text); list.append(bubble);
      }
      if (atEnd) scroll.scrollTop = scroll.scrollHeight;
    }
    async function call(path,options={}) {
      if (!enabled) throw new Error("offline");
      const controller = new AbortController(), timeout = setTimeout(()=>controller.abort(),90000);
      try {
        const response = await fetch(api+path,{
          ...options, signal:controller.signal, mode:"cors",credentials:"omit",cache:"no-store",
          headers:{"Content-Type":"application/json",...(token?{"X-Eroha-Session":token}:{}),...(options.headers||{})}
        });
        if (!response.ok) { const error = new Error("Request failed"); error.status=response.status; throw error; }
        return response.json();
      } finally { clearTimeout(timeout); }
    }
    async function session() {
      if (token) return;
      const data = await call("/v1/session",{method:"POST",body:JSON.stringify({language:language()})});
      token = data.session_token;
      if (!token) throw new Error("Session missing");
      try { sessionStorage.setItem("erokha_session_v1",token); } catch (_) {}
    }
    async function refresh() {
      if (!open || fetching || busy || !enabled) return;
      fetching = true;
      try {
        await session(); const data = await call("/v1/history"); show(data.messages||[]);
        if (statusKey==="loading") inform("");
      } catch (error) {
        if (error.status===401) {
          token=null; try { sessionStorage.removeItem("erokha_session_v1"); } catch (_) {}
        }
        inform("error");
      } finally { fetching=false; }
    }
    function close() {
      open=false; root.classList.remove("is-open","contact-open");
      launcher.setAttribute("aria-expanded","false");
      if (poll) clearInterval(poll); poll=null; launcher.focus();
    }
    launcher.addEventListener("click",()=>{
      open=true; root.classList.add("is-open"); launcher.setAttribute("aria-expanded","true");
      inform(enabled?"loading":"offline");
      if (enabled) { refresh(); if (!poll) poll=setInterval(refresh,12000); input.focus(); }
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
      e.preventDefault(); const value = input.value.trim();
      if (!enabled||!value||busy) return;
      setBusy(true); inform("typing");
      const id = (crypto.randomUUID?.() || String(Date.now())+"_"+Math.random().toString(36).slice(2)).replace(/[^A-Za-z0-9_-]/g,"_");
      try {
        await session();
        await call("/v1/message",{method:"POST",body:JSON.stringify({message:value,language:language(),request_id:id})});
        input.value=""; inform("");
      } catch (_) { inform("error"); }
      finally { setBusy(false); await refresh(); if (open) input.focus(); }
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
        await call("/v1/contact",{method:"POST",body:JSON.stringify({
          message:text,contact:get(".erokha-contact-detail").value.trim(),consent:true
        })});
        root.classList.remove("contact-open"); inform("sent");
      } catch (_) { inform("error"); }
      finally { setBusy(false); await refresh(); }
    });
    new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
    window.addEventListener("site:languagechange",translate);
    translate(); setBusy(false);
    if (!enabled) inform("offline");
  };
  if (document.readyState==="loading") document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();
