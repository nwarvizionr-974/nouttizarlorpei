// Module créole réunionnais
async function initCreole(){
  try{
    const words = await Zarlor.loadJSON('./data/creole.json');
    Zarlor.data.creole = words;
    renderWordOfDay(words);
    setupCreoleFilters(words);
    renderCreole(words);
    updateLearnedCount();
  }catch(error){ console.warn(error); }
}
function renderWordOfDay(words){
  const date = new Date();
  const word = words[(date.getDate()+date.getMonth()) % words.length];
  Zarlor.$('#wordOfDay').innerHTML = `<p class="eyebrow">Mot du jour</p><h3>${word.mot}</h3><p><strong>${word.traduction_fr}</strong></p><p>${word.phrase_exemple}</p><p>${word.explication}</p>`;
}
function setupCreoleFilters(words){
  const cats = [...new Set(words.map(w => w.categorie).filter(Boolean))];
  Zarlor.$('#creoleCategory').innerHTML = '<option value="all">Toutes</option>' + cats.map(c=>`<option value="${c}">${c}</option>`).join('');
  Zarlor.$('#creoleSearch').addEventListener('input', () => renderCreole(filterCreole()));
  Zarlor.$('#creoleCategory').addEventListener('change', () => renderCreole(filterCreole()));
}
function filterCreole(){
  const q = Zarlor.$('#creoleSearch').value.toLowerCase();
  const cat = Zarlor.$('#creoleCategory').value;
  return (Zarlor.data.creole || []).filter(w => JSON.stringify(w).toLowerCase().includes(q) && (cat==='all'||w.categorie===cat));
}
function renderCreole(words){
  const learned = Zarlor.storage.get('zarlor_learned_words', []);
  Zarlor.$('#creoleList').innerHTML = words.map(w => `<article class="word-card ${learned.includes(w.id)?'learned':''}">
    <div class="badges">${Zarlor.badge(w.type,'green')}${Zarlor.badge(w.niveau,'blue')}</div>
    <h3>${w.mot}</h3><p><strong>${w.traduction_fr}</strong></p><p>${w.phrase_exemple || ''}</p><p>${w.explication || ''}</p>
    <button class="btn btn-secondary" data-learn-word="${w.id}">${learned.includes(w.id)?'Mot appris ✓':'J’ai appris ce mot'}</button>
    <button class="btn btn-ghost" data-toggle-variants="${w.id}">Voir les variantes</button>
    <div class="variants" id="variants-${w.id}">
      <p><strong>77 :</strong> ${w.variante_77 || '—'}</p>
      <p><strong>KWZ :</strong> ${w.variante_kwz || '—'}</p>
      <p><strong>Tangol :</strong> ${w.variante_tangol || '—'}</p>
    </div>
  </article>`).join('');
}
function toggleLearned(id){
  const learned = Zarlor.storage.get('zarlor_learned_words', []);
  const next = learned.includes(id) ? learned.filter(x => x !== id) : [...learned, id];
  Zarlor.storage.set('zarlor_learned_words', next);
  updateLearnedCount();
  renderCreole(filterCreole());
}
function updateLearnedCount(){
  Zarlor.$('#learnedCount').textContent = Zarlor.storage.get('zarlor_learned_words', []).length;
}
document.addEventListener('click', (event) => {
  const learn = event.target.closest('[data-learn-word]');
  const variants = event.target.closest('[data-toggle-variants]');
  if(learn) toggleLearned(learn.dataset.learnWord);
  if(variants) Zarlor.$(`#variants-${variants.dataset.toggleVariants}`)?.classList.toggle('open');
});
document.addEventListener('DOMContentLoaded', initCreole);
