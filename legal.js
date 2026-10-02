(() => {
  let lang = "es";
  try {
    const q = new URLSearchParams(location.search).get("lang");
    const s = localStorage.getItem("ruger-lang");
    lang = (q || s || "en") === "es" ? "es" : "en";
  } catch (e) {}
  const apply = () => {
    document.documentElement.lang = lang;
    document.querySelectorAll("article[lang]").forEach(a => { a.hidden = a.lang !== lang; });
    document.querySelectorAll(".lang button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    document.querySelectorAll("[data-es]").forEach(el => { el.textContent = el.dataset[lang]; });
    const h = document.querySelector(`article[lang="${lang}"] h1`);
    if (h) document.title = `${h.textContent} | RugeR Arts`;
  };
  document.querySelectorAll(".lang button").forEach(b => b.addEventListener("click", () => {
    lang = b.dataset.lang;
    try { localStorage.setItem("ruger-lang", lang); } catch (e) {}
    apply();
  }));
  apply();
})();
