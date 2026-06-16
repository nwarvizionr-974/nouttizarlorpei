/* =========================================================================
   creole.js — Module « Kréol dann poche »
   Graphie principale lisible + variantes 77 / KWZ / Tangol en option.
   Mot du jour, recherche, filtre, compteur de mots appris, mini-défi.
   ========================================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  const list = document.getElementById("creoleList");
  if (!list) return;

  const data = await ZP.getJSON("data/creole.json") || [];
  const search = document.getElementById("creoleSearch");
  const cat = document.getElementById("creoleCat");
  const countEl = document.getElementById("apprisCount");
  const motDuJour = document.getElementById("motDuJour");

  /* ----- Mots appris (localStorage) ----- */
  function appris() { return ZP.store.get("appris", []); }
  function setAppris(arr) { ZP.store.set("appris", arr); refreshCount(); }
  function refreshCount() { if (countEl) countEl.textContent = appris().length; }
  refreshCount();

  /* ----- Mot du jour : déterministe sur la date (même mot toute la journée) ----- */
  if (motDuJour && data.length) {
    const day = Math.floor(Date.now() / 86400000);
    const m = data[day % data.length];
    motDuJour.innerHTML = `
      <p class="label">Mot du jour</p>
      <p class="mot">${ZP.esc(m.mot)}</p>
      <p>${ZP.esc(m.traduction_fr)}</p>
      <p style="font-style:italic;opacity:.9">« ${ZP.esc(m.phrase_exemple)} »</p>`;
  }

  /* ----- Carte d'un mot ----- */
  function card(m) {
    const hasVar = m.variante_77 || m.variante_kwz || m.variante_tangol;
    const learned = appris().includes(m.id);
    return `
    <article class="mot-card">
      <div class="mot-card__top">
        <h3>${ZP.esc(m.mot)}</h3>
        <span class="niveau">${ZP.esc(m.niveau)}</span>
      </div>
      <p class="fr">${ZP.esc(m.traduction_fr)}</p>
      ${m.phrase_exemple ? `<p class="ex">« ${ZP.esc(m.phrase_exemple)} »</p>` : ""}
      ${m.explication ? `<p>${ZP.esc(m.explication)}</p>` : ""}
      ${m.a_verifier ? '<p class="tag tag--verif">à vérifier</p>' : ""}
      ${hasVar ? `<button class="link-btn" data-var="${ZP.esc(m.id)}">Voir les variantes ▾</button>
        <div class="variantes" id="var-${ZP.esc(m.id)}">
          ${m.variante_77 ? `<div><strong>Lékritir 77 :</strong> <code>${ZP.esc(m.variante_77)}</code></div>` : ""}
          ${m.variante_kwz ? `<div><strong>KWZ (1983) :</strong> <code>${ZP.esc(m.variante_kwz)}</code></div>` : ""}
          ${m.variante_tangol ? `<div><strong>Tangol (2001) :</strong> <code>${ZP.esc(m.variante_tangol)}</code></div>` : ""}
        </div>` : ""}
      <button class="btn ${learned ? "btn--soft" : "btn--ghost"} appris-btn" data-appris="${ZP.esc(m.id)}">
        ${learned ? "✓ Mot appris" : "J'ai appris ce mot"}
      </button>
    </article>`;
  }

  /* ----- Rendu filtré ----- */
  function render() {
    const q = (search?.value || "").toLowerCase();
    const c = cat?.value || "";
    const filtered = data.filter(m =>
      (!c || m.categorie === c) &&
      (!q || (m.mot + " " + m.traduction_fr + " " + (m.tags || []).join(" ")).toLowerCase().includes(q)));
    list.innerHTML = filtered.length ? filtered.map(card).join("")
      : `<p class="center">Aucun mot trouvé.</p>`;

    // Toggle variantes
    list.querySelectorAll("[data-var]").forEach(b => b.addEventListener("click", () => {
      const box = document.getElementById("var-" + b.dataset.var);
      const open = box.classList.toggle("open");
      b.textContent = open ? "Masquer les variantes ▴" : "Voir les variantes ▾";
    }));
    // Bouton "j'ai appris"
    list.querySelectorAll("[data-appris]").forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.appris;
      const arr = appris();
      const i = arr.indexOf(id);
      if (i >= 0) { arr.splice(i, 1); } else { arr.push(id); }
      setAppris(arr);
      render();
    }));
  }
  search?.addEventListener("input", render);
  cat?.addEventListener("change", render);
  render();

  /* ----- Mini-défi créole (quiz sur les mots du JSON) ----- */
  const quizBox = document.getElementById("creoleQuiz");
  const startBtn = document.getElementById("startCreoleQuiz");
  const qEl = document.getElementById("cqQuestion");
  const optsEl = document.getElementById("cqOptions");
  const fbEl = document.getElementById("cqFeedback");
  const nextEl = document.getElementById("cqNext");

  function newChallenge() {
    if (data.length < 2) return;
    fbEl.textContent = "";
    const correct = data[Math.floor(Math.random() * data.length)];
    // 3 mauvaises réponses au hasard
    const others = data.filter(m => m.id !== correct.id)
      .sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [correct, ...others].sort(() => Math.random() - 0.5);
    qEl.textContent = `Que veut dire « ${correct.mot} » ?`;
    optsEl.innerHTML = options.map(o =>
      `<button class="opt" data-ok="${o.id === correct.id}">${ZP.esc(o.traduction_fr)}</button>`).join("");
    optsEl.querySelectorAll(".opt").forEach(btn => btn.addEventListener("click", () => {
      const ok = btn.dataset.ok === "true";
      optsEl.querySelectorAll(".opt").forEach(b => {
        b.disabled = true;
        if (b.dataset.ok === "true") b.classList.add("correct");
      });
      if (!ok) btn.classList.add("wrong");
      fbEl.textContent = ok ? "Bravo ! 🌺" : `C'était : ${correct.traduction_fr}`;
    }));
  }
  startBtn?.addEventListener("click", () => {
    quizBox.hidden = false;
    startBtn.hidden = true;
    newChallenge();
    quizBox.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  nextEl?.addEventListener("click", newChallenge);
});
