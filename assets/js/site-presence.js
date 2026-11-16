(() => {
  "use strict";

  const script = document.currentScript;
  const api = String(script?.dataset.presenceApi || "").replace(/\/+$/, "");
  const endpoint = api + "/v1/site-presence";
  if (!/^https:\/\/[^/\s]+$/i.test(api)) return;

  function init() {
    const widget = document.getElementById("site-live-visitors");
    if (!widget) return;

    const label = widget.querySelector(".site-live-visitors-label");
    const storageKey = "mudriakov_presence_session_v1";
    let visitorId = null;
    let timer = null;
    let inflight = false;
    let lastCount = null;
    let consecutiveFailures = 0;

    try {
      visitorId = sessionStorage.getItem(storageKey);
      if (!visitorId || !/^[0-9a-f-]{36}$/i.test(visitorId)) {
        visitorId = crypto.randomUUID();
        sessionStorage.setItem(storageKey, visitorId);
      }
    } catch (_) {
      visitorId = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : null;
    }
    if (!visitorId) return;

    function render() {
      if (lastCount === null) {
        widget.hidden = true;
        return;
      }
      const english = document.documentElement.lang.toLowerCase().startsWith("en");
      label.textContent = english
        ? "Visitors online: " + lastCount
        : "Сейчас на сайте: " + lastCount;
      widget.title = english
        ? "Active browser sessions in the last 45 seconds. Approximate count."
        : "Активные браузерные сессии за последние 45 секунд. Приблизительное число.";
      widget.hidden = false;
    }

    async function heartbeat(active, keepalive = false) {
      if (inflight && active) return;
      if (active) inflight = true;
      const controller = keepalive ? null : new AbortController();
      const timeout = controller ? setTimeout(() => controller.abort(), 8000) : null;
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          mode: "cors",
          credentials: "omit",
          cache: "no-store",
          keepalive,
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({visitor_id:visitorId,active}),
          ...(controller ? {signal:controller.signal} : {})
        });
        if (!response.ok) throw new Error("Presence service unavailable");
        if (!active || document.hidden) return;
        const data = await response.json();
        if (!Number.isSafeInteger(data.online) || data.online < 0 || data.online > 1000000) {
          throw new Error("Invalid presence count");
        }
        consecutiveFailures = 0;
        lastCount = data.online;
        render();
      } catch (_) {
        if (active) {
          consecutiveFailures++;
          if (consecutiveFailures >= 2) {
            lastCount = null;
            render();
          }
        }
      } finally {
        if (timeout !== null) clearTimeout(timeout);
        if (active) inflight = false;
      }
    }

    function schedule() {
      if (timer !== null) clearInterval(timer);
      timer = null;
      if (document.hidden) {
        lastCount = null;
        render();
        void heartbeat(false, true);
      } else {
        void heartbeat(true);
        timer = setInterval(() => { void heartbeat(true); }, 15000);
      }
    }

    document.addEventListener("visibilitychange", schedule);
    window.addEventListener("pagehide", () => {
      if (timer !== null) clearInterval(timer);
      timer = null;
      void heartbeat(false, true);
    });
    new MutationObserver(render).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"]
    });
    schedule();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {once:true});
  } else {
    init();
  }
})();
