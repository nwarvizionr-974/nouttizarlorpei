/* =========================================================================
   map.js — Carte interactive (Leaflet) des lieux péi
   Charge data/places.json, affiche marqueurs + liste, gère filtres,
   recherche, favoris (localStorage) et fiche lieu en modale.
   ========================================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  const mapEl = document.getElementById("map");
  if (!mapEl || typeof L === "undefined") return; // Leaflet absent : on sort proprement

  /* --- Initialisation de la carte centrée sur La Réunion --- */
  const map = L.map("map", { scrollWheelZoom: false }).setView([-21.115, 55.536], 10);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  /* --- Marqueur personnalisé aux couleurs du site --- */
  const icon = L.divIcon({
    className: "zp-marker",
    html: '<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#C9A24B,#B0843A);transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 3px 6px rgba(0,0,0,.3)"></span>',
    iconSize: [22, 22], iconAnchor: [11, 22], popupAnchor: [0, -20]
  });

  const places = await ZP.getJSON("data/places.json") || [];
  const listEl = document.getElementById("placesList");
  const search = document.getElementById("placeSearch");
  const fCat = document.getElementById("filterCategorie");
  const fReg = document.getElementById("filterRegion");
  const favBtn = document.getElementById("favToggle");
  let markers = [];
  let favOnly = false;

  /* --- Favoris --- */
  function favs() { return ZP.store.get("favs", []); }
  function isFav(id) { return favs().includes(id); }
  function toggleFav(id) {
    const f = favs();
    const i = f.indexOf(id);
    if (i >= 0) f.splice(i, 1); else f.push(id);
    ZP.store.set("favs", f);
  }

  /* --- Rendu d'une fiche lieu (modale) --- */
  ZP.openPlace = function (p) {
    const facts = [];
    if (p.duree_conseillee) facts.push("⏱️ " + p.duree_conseillee);
    if (p.parking) facts.push("🅿️ Parking");
    if (p.toilettes) facts.push("🚻 Toilettes");
    if (p.ombre) facts.push("🌳 Ombre");
    if (p.poussette) facts.push("👶 Poussette OK");
    const html = `
      <button class="modal__close" aria-label="Fermer" onclick="ZP.closeModal()">×</button>
      <img src="${ZP.esc(p.image)}" alt="" onerror="ZP.imgFallback(this,'place')">
      <div class="modal__inner">
        <span class="meta" style="color:var(--gold);font-weight:700">${ZP.esc(p.categorie)} · ${ZP.esc(p.commune)} (${ZP.esc(p.region)})</span>
        <h2>${ZP.esc(p.nom)}</h2>
        <p>${ZP.esc(p.description)}</p>
        <p>${facts.map(f => `<span class="tag">${ZP.esc(f)}</span>`).join(" ")}</p>
        ${p.anecdote ? `<p><strong>Le saviez-vous&nbsp;?</strong> ${ZP.esc(p.anecdote)}</p>` : ""}
        ${p.conseil_famille ? `<p style="background:var(--green-soft);padding:.8rem 1rem;border-radius:14px"><strong>Conseil famille&nbsp;:</strong> ${ZP.esc(p.conseil_famille)}</p>` : ""}
        ${p.a_verifier ? `<p class="tag tag--verif">Info à vérifier avant publication</p>` : ""}
        <div class="card-actions">
          <a class="btn btn--primary" href="${ZP.esc(p.lien_google_maps)}" target="_blank" rel="noopener">Ouvrir dans Google Maps</a>
        </div>
      </div>`;
    ZP.showModal(html);
  };

  /* --- Dessine marqueurs + liste selon les filtres --- */
  function render() {
    const q = (search?.value || "").toLowerCase();
    const c = fCat?.value || "";
    const r = fReg?.value || "";
    const filtered = places.filter(p =>
      (!c || p.categorie === c) &&
      (!r || p.region === r) &&
      (!favOnly || isFav(p.id)) &&
      (!q || (p.nom + " " + p.commune + " " + (p.tags || []).join(" ")).toLowerCase().includes(q)));

    // Marqueurs
    markers.forEach(m => map.removeLayer(m));
    markers = filtered.map(p => {
      const m = L.marker([p.latitude, p.longitude], { icon }).addTo(map);
      m.bindPopup(`<strong>${ZP.esc(p.nom)}</strong><br>${ZP.esc(p.commune)}<br>
        <button class="link-btn" onclick='ZP.openPlace(${JSON.stringify(p).replace(/'/g, "&#39;")})'>Voir la fiche</button>`);
      return m;
    });

    // Liste sous la carte
    if (listEl) {
      listEl.innerHTML = filtered.length ? filtered.map(p => `
        <article class="place-card">
          <img src="${ZP.esc(p.image)}" alt="${ZP.esc(p.nom)}" loading="lazy" onerror="ZP.imgFallback(this,'place')">
          <div class="place-card__body">
            <div class="mot-card__top">
              <h3>${ZP.esc(p.nom)}</h3>
              <button class="fav-btn" data-id="${ZP.esc(p.id)}" aria-pressed="${isFav(p.id)}" aria-label="Ajouter aux favoris">★</button>
            </div>
            <p class="meta">${ZP.esc(p.commune)} · ${ZP.esc(p.region)}</p>
            <div>${(p.tags || []).slice(0, 3).map(t => `<span class="tag">${ZP.esc(t)}</span>`).join("")}
              ${p.a_verifier ? '<span class="tag tag--verif">à vérifier</span>' : ""}</div>
            <div class="card-actions">
              <button class="btn btn--ghost" onclick='ZP.openPlace(${JSON.stringify(p).replace(/'/g, "&#39;")})'>Détails</button>
            </div>
          </div>
        </article>`).join("")
        : `<p class="center">Aucun lieu ne correspond. Essayez d'élargir les filtres.</p>`;

      // Boutons favoris
      listEl.querySelectorAll(".fav-btn").forEach(b => b.addEventListener("click", () => {
        toggleFav(b.dataset.id);
        b.setAttribute("aria-pressed", isFav(b.dataset.id));
        if (favOnly) render();
      }));
    }
  }

  search?.addEventListener("input", render);
  fCat?.addEventListener("change", render);
  fReg?.addEventListener("change", render);
  favBtn?.addEventListener("click", () => {
    favOnly = !favOnly;
    favBtn.setAttribute("aria-pressed", favOnly);
    favBtn.textContent = favOnly ? "★ Tous les lieux" : "★ Mes favoris";
    render();
  });

  // Active la molette au clic (meilleure UX mobile/desktop)
  map.on("click", () => map.scrollWheelZoom.enable());

  render();
});
