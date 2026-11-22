/* OLAF live-order toast (UI only).
   Reads the rows that app.js already renders into #recent-purchases-list
   and shows them one at a time above the friends button (bottom-left):
   visible ~3 s, then fades out. No extra network requests. */
(() => {
  const list = document.getElementById("recent-purchases-list");
  if (!list) return;

  const SHOW_MS = 3000;     // time on screen
  const GAP_MS = 7000;      // pause between toasts
  const FIRST_MS = 4000;    // first toast after page load
  let index = 0;
  let timer = 0;
  let host = null;

  const rows = () => [...list.querySelectorAll(".recent-purchase-row:not(.is-loading)")];

  function ensureHost() {
    if (host) return host;
    host = document.createElement("div");
    host.className = "olaf-live-toast";
    host.setAttribute("role", "status");
    host.setAttribute("aria-live", "polite");
    document.body.append(host);
    return host;
  }

  function place() {
    const box = ensureHost();
    const friends = document.querySelector(".friends-launch");
    let bottom = 20;
    let left = 20;
    if (friends && getComputedStyle(friends).display !== "none") {
      const r = friends.getBoundingClientRect();
      if (r.height) {
        bottom = Math.max(20, window.innerHeight - r.top + 10);
        left = Math.max(12, r.left);
      }
    }
    box.style.bottom = `${bottom}px`;
    box.style.left = `${left}px`;
  }

  function schedule(ms) {
    clearTimeout(timer);
    timer = setTimeout(show, ms);
  }

  function show() {
    const all = rows();
    if (!all.length || document.hidden) return schedule(FIRST_MS);
    const row = all[index++ % all.length];
    const box = ensureHost();
    place();

    const card = document.createElement("div");
    card.className = "olaf-live-toast-card";
    const label = document.createElement("span");
    label.className = "olaf-live-toast-label";
    label.textContent = "มีคนเพิ่งสั่งซื้อ";
    card.append(label, row.cloneNode(true));
    box.replaceChildren(card);

    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add("is-in")));
    setTimeout(() => {
      card.classList.remove("is-in");
      card.classList.add("is-out");
      setTimeout(() => card.remove(), 600);
    }, SHOW_MS);

    schedule(SHOW_MS + GAP_MS);
  }

  window.addEventListener("resize", () => host && place(), { passive: true });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) schedule(FIRST_MS); });
  schedule(FIRST_MS);
})();
