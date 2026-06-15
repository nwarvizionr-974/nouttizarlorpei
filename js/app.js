/* =========================================================================
   app.js — Orchestrateur du site Nout Ti Zarlor Péi
   Contient les utilitaires partagés (objet global ZP) utilisés par
   map.js, creole.js et quiz.js, puis initialise les modules simples.
   ========================================================================= */

/* Namespace global partagé entre les fichiers JS */
window.ZP = window.ZP || {};

/* ----- Utilitaires ----- */
ZP.getJSON = async function (path) {
  try {
    const res = await fetch(path, { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (e) {
    console.warn("Données indisponibles :", path, e);
    return null;
  }
};

/* Échappe le HTML pour éviter toute injection depuis le JSON */
ZP.esc = function (s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
};

/* Stockage local simple (favoris, mots appris, scores) */
ZP.store = {
  get(key, def) { try { return JSON.parse(localStorage.getItem("zp_" + key)) ?? def; } catch { return def; } },
  set(key, val) { try { localStorage.setItem("zp_" + key, JSON.stringify(val)); } catch {} }
};

/* Remplace une image cassée par un placeholder */
ZP.imgFallback = function (img, type) {
  const map = {
    place: "assets/images/placeholder-place.svg",
    recipe: "assets/images/placeholder-recipe.svg",
    article: "assets/images/placeholder-article.svg",
    product: "assets/images/placeholder-product.svg"
  };
  img.onerror = null;
  img.src = map[type] || map.place;
};

/* Construit un lien de contact selon le canal choisi dans settings.json */
ZP.contactLink = function (settings, sujet, mode) {
  const c = settings.contact || {};
  mode = mode || (settings.boutique && settings.boutique.mode_contact) || "email";
  const msg = "Bonjour Nout Ti Zarlor Péi, " + sujet;
  if (mode === "whatsapp" && c.whatsapp) return "https://wa.me/" + c.whatsapp + "?text=" + encodeURIComponent(msg);
  if (mode === "form" && c.google_form_url) return c.google_form_url;
  return "mailto:" + (c.email || "") + "?subject=" + encodeURIComponent(sujet);
};

/* ============================ INITIALISATION ============================= */
document.addEventListener("DOMContentLoaded", async () => {

  /* ----- 1. Menu burger mobile ----- */
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }));
  }

  /* ----- 2. Pied de page : année + version ----- */
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ----- 3. Bouton "Installer l'app" (PWA) ----- */
  let deferredPrompt = null;
  const installBtn = document.getElementById("installBtn");
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); deferredPrompt = e;
    if (installBtn) installBtn.hidden = false;
  });
  if (installBtn) installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null; installBtn.hidden = true;
  });

  /* ----- 4. Enregistrement du service worker (chemin relatif pour GitHub Pages) ----- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(err =>
        console.warn("Service worker non enregistré :", err));
    });
  }

  /* ----- 5. Chargement des réglages puis remplissage dépendant ----- */
  const settings = await ZP.getJSON("data/settings.json") || {};
  ZP.settings = settings;

  const ver = document.getElementById("appVersion");
  if (ver) ver.textContent = (settings.site && settings.site.version) || "1.0.0";
  const promise = document.getElementById("footerPromise");
  if (promise) promise.textContent = (settings.site && settings.site.promesse) || "";

  // Réseaux sociaux du footer
  const socials = document.getElementById("footerSocials");
  if (socials && settings.reseaux) {
    const icons = { instagram: "IG", facebook: "f", tiktok: "TT", youtube: "▶" };
    socials.innerHTML = Object.entries(settings.reseaux)
      .filter(([, url]) => url)
      .map(([k, url]) => `<a href="${ZP.esc(url)}" target="_blank" rel="noopener" aria-label="${k}">${icons[k] || "•"}</a>`)
      .join("") || '<span style="color:#9a8f7c">À configurer dans data/settings.json</span>';
  }
  const fc = document.getElementById("footerContact");
  if (fc && settings.contact) fc.innerHTML = settings.contact.email
    ? `<a href="mailto:${ZP.esc(settings.contact.email)}">${ZP.esc(settings.contact.email)}</a>` : "";

  /* ----- 6. Boutons de participation ----- */
  const part = document.getElementById("participate");
  if (part) {
    const items = [
      ["Un mot créole", "je veux proposer un mot créole."],
      ["Un proverbe", "je veux proposer un proverbe."],
      ["Une recette", "je veux partager une recette péi."],
      ["Une photo / un souvenir", "je veux partager une photo ou un souvenir lontan."],
      ["Un lieu", "je veux proposer un lieu à découvrir."],
      ["Une anecdote", "je veux partager une anecdote."]
    ];
    part.innerHTML = items.map(([label, sujet]) =>
      `<a class="btn btn--soft" href="${ZP.esc(ZP.contactLink(settings, sujet))}" target="_blank" rel="noopener">${label}</a>`
    ).join("");
  }

  /* ----- 7. Modules de contenu simples (data → cartes) ----- */
  renderRecipes(settings);
  renderArticles();
  renderProducts(settings);
});

/* =============================== RECETTES =============================== */
async function renderRecipes() {
  const list = document.getElementById("recipesList");
  if (!list) return;
  const data = await ZP.getJSON("data/recipes.json") || [];
  const search = document.getElementById("recipeSearch");
  const cat = document.getElementById("recipeCat");

  function draw() {
    const q = (search?.value || "").toLowerCase();
    const c = cat?.value || "";
    const filtered = data.filter(r =>
      (!c || r.categorie === c) &&
      (!q || (r.titre + " " + (r.tags || []).join(" ")).toLowerCase().includes(q)));
    list.innerHTML = filtered.length ? filtered.map(r => `
      <article class="ecard">
        <img src="${ZP.esc(r.image)}" alt="${ZP.esc(r.titre)}" loading="lazy" onerror="ZP.imgFallback(this,'recipe')">
        <div class="ecard__body">
          <span class="meta">${ZP.esc(r.categorie)} · ${ZP.esc(r.temps)} · ${ZP.esc(r.difficulte)}</span>
          <h3>${ZP.esc(r.titre)}</h3>
          <p>${ZP.esc(r.introduction)}</p>
          <button class="btn btn--ghost" onclick='ZP.openRecipe(${JSON.stringify(r).replace(/'/g, "&#39;")})'>Voir la recette</button>
        </div>
      </article>`).join("") : `<p class="center">Aucune recette trouvée.</p>`;
  }
  search?.addEventListener("input", draw);
  cat?.addEventListener("change", draw);
  draw();
}

ZP.openRecipe = function (r) {
  const html = `
    <button class="modal__close" aria-label="Fermer" onclick="ZP.closeModal()">×</button>
    <img src="${ZP.esc(r.image)}" alt="" onerror="ZP.imgFallback(this,'recipe')">
    <div class="modal__inner">
      <span class="meta" style="color:var(--sun-2);font-weight:700">${ZP.esc(r.categorie)} · ${ZP.esc(r.temps)} · ${ZP.esc(r.portions)} parts</span>
      <h2>${ZP.esc(r.titre)}</h2>
      <p>${ZP.esc(r.introduction)}</p>
      <h3>Ingrédients</h3>
      <ul>${(r.ingredients || []).map(i => `<li>${ZP.esc(i)}</li>`).join("")}</ul>
      <h3>Préparation</h3>
      <ol>${(r.etapes || []).map(e => `<li>${ZP.esc(e)}</li>`).join("")}</ol>
      ${r.astuce ? `<p><strong>Astuce&nbsp;:</strong> ${ZP.esc(r.astuce)}</p>` : ""}
      ${r.souvenir ? `<p style="font-style:italic;color:var(--muted)">« ${ZP.esc(r.souvenir)} »</p>` : ""}
      <button class="btn btn--soft" onclick="window.print()">Imprimer la fiche</button>
    </div>`;
  ZP.showModal(html);
};

/* =============================== ARTICLES =============================== */
async function renderArticles() {
  const list = document.getElementById("articlesList");
  if (!list) return;
  const data = await ZP.getJSON("data/articles.json") || [];
  list.innerHTML = data.map(a => `
    <article class="ecard">
      <img src="${ZP.esc(a.image)}" alt="${ZP.esc(a.titre)}" loading="lazy" onerror="ZP.imgFallback(this,'article')">
      <div class="ecard__body">
        <span class="meta">${ZP.esc(a.categorie)}</span>
        <h3>${ZP.esc(a.titre)}</h3>
        <p>${ZP.esc(a.resume)}</p>
        <button class="btn btn--ghost" onclick='ZP.openArticle(${JSON.stringify(a).replace(/'/g, "&#39;")})'>Lire</button>
      </div>
    </article>`).join("");
}

ZP.openArticle = function (a) {
  const html = `
    <button class="modal__close" aria-label="Fermer" onclick="ZP.closeModal()">×</button>
    <img src="${ZP.esc(a.image)}" alt="" onerror="ZP.imgFallback(this,'article')">
    <div class="modal__inner">
      <span class="meta" style="color:var(--sun-2);font-weight:700">${ZP.esc(a.categorie)}</span>
      <h2>${ZP.esc(a.titre)}</h2>
      <p>${ZP.esc(a.contenu)}</p>
      ${a.a_verifier ? `<p class="tag tag--verif">Contenu à vérifier avant diffusion</p>` : ""}
      ${a.source ? `<p style="color:var(--muted);font-size:.85rem">Source&nbsp;: ${ZP.esc(a.source)}</p>` : ""}
    </div>`;
  ZP.showModal(html);
};

/* =============================== BOUTIQUE =============================== */
async function renderProducts(settings) {
  const list = document.getElementById("productsList");
  if (!list) return;
  const data = await ZP.getJSON("data/products.json") || [];
  list.innerHTML = data.map(p => {
    const mode = p.id === "partenariat-kartie" ? (settings.boutique?.mode_contact || "email") : (settings.boutique?.mode_contact || "email");
    const href = p.lien || ZP.contactLink(settings, "à propos de « " + p.nom + " »", mode);
    return `
    <article class="ecard">
      <img src="${ZP.esc(p.image)}" alt="${ZP.esc(p.nom)}" loading="lazy" onerror="ZP.imgFallback(this,'product')">
      <div class="ecard__body">
        <span class="statut ${ZP.esc(p.statut)}">${ZP.esc(p.statut)}</span>
        <h3 style="margin-top:.4rem">${ZP.esc(p.nom)}</h3>
        <p>${ZP.esc(p.description)}</p>
        <p class="price">${ZP.esc(p.prix_indicatif)}</p>
        <a class="btn btn--primary" href="${ZP.esc(href)}" target="_blank" rel="noopener">${ZP.esc(p.bouton_label || "En savoir plus")}</a>
      </div>
    </article>`;
  }).join("");
}

/* ============================ MODALE PARTAGÉE ============================ */
ZP.showModal = function (innerHTML) {
  let modal = document.getElementById("zpModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "zpModal"; modal.className = "modal";
    modal.innerHTML = `<div class="modal__box" role="dialog" aria-modal="true" style="position:relative"></div>`;
    modal.addEventListener("click", e => { if (e.target === modal) ZP.closeModal(); });
    document.body.appendChild(modal);
  }
  modal.querySelector(".modal__box").innerHTML = innerHTML;
  modal.classList.add("open");
  document.addEventListener("keydown", ZP._escClose);
};
ZP.closeModal = function () {
  const modal = document.getElementById("zpModal");
  if (modal) modal.classList.remove("open");
  document.removeEventListener("keydown", ZP._escClose);
};
ZP._escClose = function (e) { if (e.key === "Escape") ZP.closeModal(); };
