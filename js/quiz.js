/* =========================================================================
   quiz.js — Module « Kosa mi lé ? »
   Charge data/quizzes.json. Une question à la fois, correction immédiate,
   score, explication, meilleur score (localStorage) et badge final.
   ========================================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  const root = document.getElementById("quiz");
  if (!root) return;

  const data = (await ZP.getJSON("data/quizzes.json") || []).sort(() => Math.random() - 0.5);
  const qEl = document.getElementById("quizQuestion");
  const optsEl = document.getElementById("quizOptions");
  const imgEl = document.getElementById("quizImg");
  const fbEl = document.getElementById("quizFeedback");
  const nextEl = document.getElementById("quizNext");
  const restartEl = document.getElementById("quizRestart");
  const scoreEl = document.getElementById("quizScore");
  const bestEl = document.getElementById("quizBest");
  const progEl = document.getElementById("quizProgress");

  let i = 0, score = 0, answered = false;
  bestEl.textContent = ZP.store.get("quizBest", 0);

  if (!data.length) { qEl.textContent = "Aucune question disponible."; return; }

  /* Badge symbolique selon le score final */
  function badge(s, total) {
    const r = s / total;
    if (r === 1) return "Gran transmetèr";
    if (r >= 0.8) return "Fanmiy péi";
    if (r >= 0.6) return "Gardien zarlor";
    if (r >= 0.4) return "Marmay malin";
    return "Ti découvreur";
  }

  function show() {
    answered = false;
    const q = data[i];
    progEl.textContent = `Question ${i + 1} / ${data.length}`;
    qEl.textContent = q.question;
    fbEl.textContent = ""; fbEl.className = "quiz__feedback";
    nextEl.hidden = true;

    if (q.image) { imgEl.src = q.image; imgEl.hidden = false; imgEl.alt = q.question; }
    else imgEl.hidden = true;

    optsEl.innerHTML = q.options.map(o => `<button class="opt">${ZP.esc(o)}</button>`).join("");
    optsEl.querySelectorAll(".opt").forEach(btn => btn.addEventListener("click", () => {
      if (answered) return;
      answered = true;
      const ok = btn.textContent === q.bonne_reponse;
      optsEl.querySelectorAll(".opt").forEach(b => {
        b.disabled = true;
        if (b.textContent === q.bonne_reponse) b.classList.add("correct");
      });
      if (!ok) btn.classList.add("wrong");
      if (ok) { score++; scoreEl.textContent = score; fbEl.textContent = "Bonne réponse ! " + (q.explication || ""); fbEl.classList.add("ok"); }
      else { fbEl.textContent = (q.explication || `La bonne réponse était : ${q.bonne_reponse}`); fbEl.classList.add("ko"); }
      nextEl.hidden = false;
      nextEl.textContent = (i + 1 < data.length) ? "Question suivante" : "Voir mon résultat";
    }));
  }

  function finish() {
    const best = Math.max(score, ZP.store.get("quizBest", 0));
    ZP.store.set("quizBest", best);
    bestEl.textContent = best;
    qEl.textContent = `Terminé ! Score : ${score} / ${data.length}`;
    optsEl.innerHTML = `<p class="badge">Badge gagné : ${badge(score, data.length)} 🏅</p>`;
    imgEl.hidden = true; fbEl.textContent = ""; nextEl.hidden = true;
    restartEl.hidden = false;
  }

  nextEl.addEventListener("click", () => {
    i++;
    if (i < data.length) show(); else finish();
  });
  restartEl.addEventListener("click", () => {
    i = 0; score = 0; scoreEl.textContent = 0; restartEl.hidden = true;
    data.sort(() => Math.random() - 0.5);
    show();
  });

  show();
});
