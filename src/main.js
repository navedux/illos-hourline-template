const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Illos.dev: each animated asset loops while it is on screen and pauses when it is not. Under reduced motion the
// stylesheet pauses them and each asset shows its still frame.
if (!reduce) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) e.target.style.setProperty("--illos-play", e.isIntersecting ? "running" : "paused");
  });
  for (const el of document.querySelectorAll("[data-illos]")) {
    el.style.setProperty("--illos-play", "paused");
    io.observe(el);
  }
}

// The bar gets a hairline once the page scrolls under it.
const bar = document.getElementById("top");
const onScroll = () => bar.classList.toggle("is-scrolled", scrollY > 8);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Mobile menu.
const menu = document.getElementById("menu");
const menuBtn = document.getElementById("menu-btn");
const setMenu = (open) => {
  menu.hidden = !open;
  menuBtn.setAttribute("aria-expanded", open);
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};
menuBtn.addEventListener("click", () => setMenu(menu.hidden));
menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
matchMedia("(min-width: 901px)").addEventListener("change", () => setMenu(false));

// Tabs: the team cards and the setup steps. Click, or arrow keys, Home and End once a tab has focus.
const tablist = (list) => {
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  const select = (tab, focus) => {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    }
    if (focus) tab.focus();
  };
  const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(t));
    t.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key in keys) next = tabs[(i + keys[e.key] + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next, true); }
    });
  });
  return select;
};
const pickTeam = tablist(document.querySelector(".personas"));
tablist(document.querySelector(".steps"));
// The footer's team links open that team's tab.
for (const a of document.querySelectorAll("[data-persona]")) a.addEventListener("click", () => pickTeam(document.getElementById(a.dataset.persona)));

// Billing period: a two-option radio group that swaps every price and its note.
const period = document.querySelector(".period");
const options = [...period.querySelectorAll('[role="radio"]')];
const setPeriod = (btn, focus) => {
  for (const o of options) {
    const on = o === btn;
    o.setAttribute("aria-checked", on);
    o.tabIndex = on ? 0 : -1;
  }
  const p = btn.dataset.period;
  for (const el of document.querySelectorAll("[data-month]")) el.textContent = el.dataset[p];
  if (focus) btn.focus();
};
options.forEach((o, i) => {
  o.addEventListener("click", () => setPeriod(o));
  o.addEventListener("keydown", (e) => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (d) { e.preventDefault(); setPeriod(options[(i + d + options.length) % options.length], true); }
  });
});

// Copy the booking link; the button shows a tick and "Copied" for a moment.
const copyBtn = document.querySelector("[data-copy]");
const status = document.querySelector(".share__status");
let copyTimer;
copyBtn.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(copyBtn.dataset.copy); } catch { /* the template still shows the state */ }
  copyBtn.classList.add("is-done");
  copyBtn.querySelector(".share__word").textContent = "Copied";
  status.textContent = "Booking link copied";
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => {
    copyBtn.classList.remove("is-done");
    copyBtn.querySelector(".share__word").textContent = "Copy";
    status.textContent = "";
  }, 1600);
});
