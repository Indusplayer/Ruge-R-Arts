const ICON = {
  whatsapp:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.8-1.3 2.2 2.2 0 00.2-1.3c-.1-.1-.2-.2-.5-.3z"/></svg>',
  email:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3.5 6l8.5 7 8.5-7"/></svg>',
  instagram:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>'
};

let lang = "en", filter = "all", cat = "all", sort = "default", copRate = CONFIG.copFallbackRate, current = -1;
try { const q = new URLSearchParams(location.search).get("lang"); const s = localStorage.getItem("ruger-lang"); lang = (q || s) === "es" ? "es" : "en"; } catch(e){}

const $ = s => document.querySelector(s);
const t = (k, vars={}) => (T[lang][k] ?? T.en[k] ?? k).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? "");
const loc = v => (v && typeof v === "object") ? (v[lang] ?? v.en) : v;
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const usd = n => "US$ " + n.toLocaleString("en-US");
const cop = n => (Math.round(n * copRate / 10000) * 10000).toLocaleString("es-CO");
const MONTHS = { en:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], es:["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"] };
const dateOf = w => { if (!w.year) return ""; const [y, m] = String(w.year).split("-"); return m ? `${MONTHS[lang][+m - 1]} ${y}` : y; };
const num = n => lang === "es" ? String(n).replace(".", ",") : String(n);
const sizeOf = w => w.cm ? `${num(w.cm[0])} × ${num(w.cm[1])} cm` : (w.size || "");
const mediumOf = w => w.medium ? (T[lang]["medium." + w.medium] ? t("medium." + w.medium) : w.medium) : "";

function dotFor(s){ return s === "sold" ? '<span class="dot" aria-hidden="true"></span>' : s === "reserved" ? '<span class="dot half" aria-hidden="true"></span>' : ""; }
function priceLine(w){
  if (w.status === "sold" && w.priceUSD) return `<s class="was">${usd(w.priceUSD)}</s>` + dotFor("sold") + t("status.sold");
  if (w.status !== "available") return dotFor(w.status) + t("status." + w.status);
  return w.priceUSD ? usd(w.priceUSD) : t("price.request");
}
function labelHTML(w){
  const meta = [mediumOf(w), sizeOf(w)].filter(Boolean).join(", ");
  return `<div class="label"><div class="t">${esc(w.title)}${w.year ? `<span class="y">, ${dateOf(w)}</span>` : ""}</div>${meta ? `<div>${esc(meta)}</div>` : ""}<div class="price">${priceLine(w)}</div></div>`;
}

function renderStatic(){
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll(".lang button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  if ($("#shows")) $("#shows").innerHTML = SHOWS.map(s => `<li><span>${s.year}</span><div><em>${esc(loc(s.title))}</em><br>${esc(loc(s.place))}</div></li>`).join("");
  const msg = encodeURIComponent(t("contact.msg"));
  const links = [];
  if (CONFIG.whatsapp) links.push(`<a class="btn primary" href="https://wa.me/${CONFIG.whatsapp}?text=${msg}" target="_blank" rel="noopener">${ICON.whatsapp}${t("contact.whatsapp")}</a>`);
  if (CONFIG.email) links.push(`<a class="btn${CONFIG.whatsapp ? "" : " primary"}" href="mailto:${CONFIG.email}?subject=RugeR%20Arts">${ICON.email}${esc(CONFIG.email)}</a>`);
  if (CONFIG.instagram) links.push(`<a class="btn" href="https://instagram.com/${CONFIG.instagram}" target="_blank" rel="noopener">${ICON.instagram}@${esc(CONFIG.instagram)}</a>`);
  if ($("#contact-links")) $("#contact-links").innerHTML = links.join("");
  if ($("#journey-text")) $("#journey-text").innerHTML = (JOURNEY[lang] || []).map(p => `<p>${esc(p)}</p>`).join("");
  if (!$("#hero-piece")) return;
  const hi = Math.max(0, WORKS.findIndex(w => w.hero)), hero = WORKS[hi];
  $("#hero-piece").innerHTML = `<button type="button" style="all:unset;display:block;cursor:zoom-in" data-open="${hi}" aria-label="${esc(t("open",{t:hero.title}))}"><span class="frame"><img src="images/works/${hero.id}.jpg" alt="${esc(hero.title)}" width="${hero.w}" height="${hero.h}"></span></button>`;
  const hs = (hero.shows || []).map(id => SHOWS.find(x => x.id === id)).filter(Boolean);
  $("#featured-info").innerHTML = `<h2 id="featured-h">${t("featured.title")}</h2>
    <h3>${esc(hero.title)}</h3>
    <p class="meta">${esc([dateOf(hero), mediumOf(hero), sizeOf(hero)].filter(Boolean).join(", "))}</p>
    ${hero.desc ? `<p class="desc">${esc(loc(hero.desc))}</p>` : ""}
    ${hs.map(x => `<div class="v-shows"><strong>${t("exhibited")}:</strong> ${esc(loc(x.title))}, ${esc(loc(x.place)).split(".")[0]} (${x.year})</div>`).join("")}
    <div class="price">${priceLine(hero)}</div>
    <button type="button" class="btn primary" data-open="${hi}">${t("featured.more")}</button>`;
  if (EXPLORE[lang] && EXPLORE[lang].length && $("#explore-text")) {
    $("#explorations").hidden = false;
    $("#explore-text").innerHTML = EXPLORE[lang].map(p => `<p>${esc(p)}</p>`).join("");
  }
}

const CATS = ["sacred","expressionist","aboriginal","equestrian","animals","realist"];
const RANK = { available:0, reserved:1, sold:2, notforsale:3 };
const gallery = () => WORKS.map((w,i) => [w,i]).filter(([w]) => !w.hero);

function renderFilters(){
  const base = gallery().filter(([w]) => cat === "all" || (w.cats || []).includes(cat));
  const counts = { all: base.length, available: base.filter(([w]) => w.status === "available").length, sold: base.filter(([w]) => w.status === "sold").length };
  $("#filters").innerHTML = ["all","available","sold"].map(f =>
    `<button type="button" data-filter="${f}" aria-pressed="${f === filter}">${t("filter." + f)} (${counts[f]})</button>`).join("");
  $("#cats").innerHTML = ["all", ...CATS].map(c =>
    `<button type="button" data-cat="${c}" aria-pressed="${c === cat}">${t("cat." + c)}</button>`).join("");
  $("#sort").innerHTML = ["default","asc","desc","old","new"].map(o => `<option value="${o}"${o === sort ? " selected" : ""}>${t("sort." + o)}</option>`).join("");
}

function visible(){
  const list = gallery()
    .filter(([w]) => filter === "all" || w.status === filter)
    .filter(([w]) => cat === "all" || (w.cats || []).includes(cat));
  const price = w => w.priceUSD ?? (sort === "asc" ? Infinity : -Infinity);
  if (sort === "old" || sort === "new") {
    const d = w => String(w.year || (sort === "old" ? "9999" : "0000")).padEnd(7, "-00").replace("--", "-");
    return list.sort(([a,ia],[b,ib]) => (sort === "old" ? d(a).localeCompare(d(b)) : d(b).localeCompare(d(a))) || (ia - ib));
  }
  return list.sort(([a,ia],[b,ib]) =>
    (RANK[a.status] - RANK[b.status]) ||
    (sort === "asc" ? price(a) - price(b) : sort === "desc" ? price(b) - price(a) : 0) ||
    (ia - ib));
}

const colCount = () => { const w = $("#salon").clientWidth || window.innerWidth; return w >= 940 ? 3 : w >= 540 ? 2 : 1; };
let lastCols = 0, io = null;

function renderSalon(){
  const list = visible(), n = colCount();
  lastCols = n;
  $("#salon").style.setProperty("--cols", list.length ? n : 1);
  if (!list.length) { $("#salon").innerHTML = `<p class="empty">${t("works.empty")}</p>`; return; }
  const cols = Array.from({length:n}, () => ({ h:0, html:"" }));
  list.forEach(([w,i]) => {
    const c = cols.reduce((m, x) => x.h < m.h ? x : m, cols[0]);
    c.h += w.h / w.w + .32;
    c.html += `
    <figure class="piece${w.status === "sold" ? " is-sold" : ""}">
      <button type="button" data-open="${i}" aria-label="${esc(t("open",{t:w.title}))}">
        <span class="frame"><img src="images/thumbs/${w.id}.jpg" alt="${esc(w.title)}" width="${w.w}" height="${w.h}" loading="lazy"></span>
      </button>
      <figcaption>${labelHTML(w)}</figcaption>
    </figure>`;
  });
  $("#salon").innerHTML = cols.map(c => `<div class="col">${c.html}</div>`).join("");
  const pieces = document.querySelectorAll("#salon .piece");
  if (!("IntersectionObserver" in window)) { pieces.forEach(p => p.classList.add("in")); return; }
  if (io) io.disconnect();
  io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold:.15 });
  pieces.forEach(p => io.observe(p));
}
window.addEventListener("resize", () => { if ($("#salon") && colCount() !== lastCols) renderSalon(); });

function renderAll(){ renderStatic(); if ($("#salon")) { renderFilters(); renderSalon(); } if (current >= 0 && $("#viewer") && $("#viewer").open) fillViewer(current); }

/* viewer */
function fillViewer(i){
  current = i;
  const w = WORKS[i];
  const img = $("#v-img");
  img.src = `images/works/${w.id}.jpg`; img.alt = w.title;
  $("#v-title").textContent = w.title;
  $("#v-meta").textContent = [dateOf(w), mediumOf(w), sizeOf(w)].filter(Boolean).join(", ");
  const shows = (w.shows || []).map(id => SHOWS.find(x => x.id === id)).filter(Boolean);
  $("#v-desc").innerHTML = (w.desc ? `<p>${esc(loc(w.desc))}</p>` : "") +
    shows.map(x => `<div class="v-shows"><strong>${t("exhibited")}:</strong> ${esc(loc(x.title))}, ${esc(loc(x.place)).split(".")[0]} (${x.year})</div>`).join("");
  $("#v-desc").hidden = !w.desc && !shows.length;
  let p = "";
  if (w.status === "available") {
    p = w.priceUSD ? `<div class="usd">${usd(w.priceUSD)}</div><div class="cop">${t("price.cop",{cop:cop(w.priceUSD)})}</div>` : `<div class="usd">${t("price.request")}</div>`;
    p += `<div class="v-status">${t("status.available")}</div>`;
  } else {
    p = (w.status === "sold" && w.priceUSD ? `<div class="usd"><s class="was">${usd(w.priceUSD)}</s></div>` : "") + `<div class="v-status">${dotFor(w.status)}${t("status." + w.status)}</div>`;
  }
  $("#v-price").innerHTML = p;
  const text = encodeURIComponent(t(w.status !== "available" ? "ask.soldmsg" : "ask.msg", {t:w.title}));
  const a = [];
  if (CONFIG.whatsapp) a.push(`<a class="btn primary" href="https://wa.me/${CONFIG.whatsapp}?text=${text}" target="_blank" rel="noopener">${ICON.whatsapp}${w.status !== "available" ? t("ask.similar") : t("ask.whatsapp")}</a>`);
  if (CONFIG.email) a.push(`<a class="btn${CONFIG.whatsapp ? "" : " primary"}" href="mailto:${CONFIG.email}?subject=${encodeURIComponent("RugeR Arts: " + w.title)}&body=${text}">${ICON.email}${w.status !== "available" ? t("ask.similar") : t("ask.email")}</a>`);
  $("#v-actions").innerHTML = a.join("");
}
function step(d){
  let list = visible().map(([,i]) => i);
  if (!list.includes(current)) list = WORKS.map((_,i) => i);
  fillViewer(list[(list.indexOf(current) + d + list.length) % list.length]);
}
let opener = null;
document.addEventListener("click", e => {
  const o = e.target.closest("[data-open]");
  if (o) { opener = o; fillViewer(+o.dataset.open); $("#viewer").showModal(); return; }
  const f = e.target.closest("[data-filter]");
  if (f) { filter = f.dataset.filter; renderFilters(); renderSalon(); return; }
  const c = e.target.closest("[data-cat]");
  if (c) { cat = c.dataset.cat; renderFilters(); renderSalon(); return; }
  const l = e.target.closest("[data-lang]");
  if (l) { lang = l.dataset.lang; try { localStorage.setItem("ruger-lang", lang); } catch(err){} renderAll(); }
});
if ($("#sort")) $("#sort").addEventListener("change", e => { sort = e.target.value; renderSalon(); });
if ($("#viewer")) {
  $("#v-close").onclick = () => $("#viewer").close();
  $("#v-prev").onclick = () => step(-1);
  $("#v-next").onclick = () => step(1);
  $("#viewer").addEventListener("close", () => { if (opener) opener.focus(); });
  $("#viewer").addEventListener("keydown", e => { if (e.key === "ArrowLeft") step(-1); if (e.key === "ArrowRight") step(1); });
  $("#viewer").addEventListener("click", e => { if (e.target.classList.contains("v-stage")) $("#viewer").close(); });
}

/* live USD→COP rate, falls back to CONFIG.copFallbackRate */
fetch("https://open.er-api.com/v6/latest/USD").then(r => r.json()).then(d => {
  if (d && d.rates && d.rates.COP) { copRate = d.rates.COP; if ($("#viewer") && $("#viewer").open) fillViewer(current); }
}).catch(() => {});

$("#year").textContent = new Date().getFullYear();
(() => {
  const sig = $(".hero .sig"); if (!sig) return;
  const go = () => sig.classList.add("drawn");
  if (sig.complete && sig.naturalWidth) requestAnimationFrame(go);
  else { sig.addEventListener("load", go); sig.addEventListener("error", go); }
  setTimeout(go, 3000);
})();
renderAll();

/* reel on the About page: moves on its own, and can be dragged with mouse or finger */
(() => {
  const reel = $(".reel"), track = $("#reel"); if (!reel || !track) return;
  track.innerHTML += track.innerHTML;              /* duplicate for a seamless loop */
  let x = 0, half = 0, last = 0, dragging = false, startX = 0, startOff = 0;
  const speed = 45;                                /* pixels per second */
  const measure = () => { half = track.scrollWidth / 2; };
  track.querySelectorAll("img").forEach(i => { i.loading = "eager"; i.addEventListener("load", measure); });
  window.addEventListener("resize", measure); measure();
  const wrap = () => { if (!half) return; while (x <= -half) x += half; while (x > 0) x -= half; };
  const tick = t => {
    const dt = last ? Math.min(.1, (t - last) / 1000) : 0; last = t;
    if (!dragging) x -= speed * dt;
    wrap(); track.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  reel.addEventListener("pointerdown", e => { dragging = true; startX = e.clientX; startOff = x; reel.classList.add("dragging"); reel.setPointerCapture(e.pointerId); });
  reel.addEventListener("pointermove", e => { if (dragging) x = startOff + (e.clientX - startX); });
  const end = () => { dragging = false; reel.classList.remove("dragging"); };
  reel.addEventListener("pointerup", end); reel.addEventListener("pointercancel", end);
})();

/* mobile menu */
(() => {
  const btn = $(".menu-btn"), nav = $("#main-nav"); if (!btn || !nav) return;
  const set = open => { nav.classList.toggle("open", open); btn.setAttribute("aria-expanded", String(open)); };
  btn.addEventListener("click", e => { e.stopPropagation(); set(!nav.classList.contains("open")); });
  nav.addEventListener("click", e => { if (e.target.closest("a")) set(false); });
  document.addEventListener("click", e => { if (!e.target.closest(".top")) set(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") set(false); });
})();

/* viewer zoom: click the painting to magnify, move the mouse to pan, scroll to adjust, click again to return */
(() => {
  const img = $("#v-img"); if (!img || !window.matchMedia("(hover:hover)").matches) return;
  let scale = 2.2, on = false;
  const aim = e => {
    const r = img.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100, y = ((e.clientY - r.top) / r.height) * 100;
    img.style.transformOrigin = `${Math.max(0, Math.min(100, x))}% ${Math.max(0, Math.min(100, y))}%`;
  };
  const reset = () => { on = false; img.style.transform = ""; img.classList.remove("zoomed"); };
  img.addEventListener("click", e => {
    if (on) { reset(); return; }
    aim(e); on = true; img.style.transform = `scale(${scale})`; img.classList.add("zoomed");
  });
  img.addEventListener("mousemove", e => { if (on) aim(e); });
  img.addEventListener("wheel", e => {
    if (!on) return;
    e.preventDefault();
    scale = Math.max(1.4, Math.min(4, scale + (e.deltaY < 0 ? .3 : -.3)));
    img.style.transform = `scale(${scale})`;
  }, { passive:false });
  img.addEventListener("load", reset);
  $("#viewer").addEventListener("close", reset);
})();
