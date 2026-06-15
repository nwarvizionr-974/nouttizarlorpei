// Mini quiz Kosa mi lé ?
let quizQuestions = []; let quizIndex = 0; let quizScore = 0; let answered = false;
async function initQuiz(){
  try{ quizQuestions = await Zarlor.loadJSON('./data/quizzes.json'); renderQuestion(); updateBestScore(); }
  catch(error){ console.warn(error); Zarlor.$('#quizQuestion').textContent = 'Impossible de charger le quiz.'; }
}
function renderQuestion(){
  answered = false;
  const q = quizQuestions[quizIndex];
  if(!q) return showFinalScore();
  Zarlor.$('#quizProgress').textContent = `Question ${quizIndex+1}/${quizQuestions.length}`;
  Zarlor.$('#quizQuestion').textContent = q.question;
  Zarlor.$('#quizFeedback').textContent = '';
  Zarlor.$('#nextQuestionBtn').hidden = true;
  const img = Zarlor.$('#quizImage');
  if(q.image){ img.src=q.image; img.alt=q.question; img.hidden=false; } else { img.hidden=true; }
  Zarlor.$('#quizOptions').innerHTML = q.options.map(opt => `<button data-answer="${opt}">${opt}</button>`).join('');
}
function answerQuestion(answer, btn){
  if(answered) return; answered = true;
  const q = quizQuestions[quizIndex]; const correct = answer === q.bonne_reponse;
  if(correct) quizScore++;
  Zarlor.$$('#quizOptions button').forEach(b => {
    if(b.dataset.answer === q.bonne_reponse) b.classList.add('correct');
    else if(b === btn) b.classList.add('wrong');
    b.disabled = true;
  });
  Zarlor.$('#quizFeedback').innerHTML = `<strong>${correct ? 'Bravo !' : 'Presque.'}</strong> ${q.explication || ''}`;
  Zarlor.$('#nextQuestionBtn').hidden = false;
}
function showFinalScore(){
  const best = Math.max(quizScore, Number(localStorage.getItem('zarlor_best_score') || 0));
  localStorage.setItem('zarlor_best_score', String(best)); updateBestScore();
  const badge = quizScore >= quizQuestions.length ? 'Gran transmetèr' : quizScore >= Math.ceil(quizQuestions.length*.75) ? 'Gardien zarlor' : quizScore >= Math.ceil(quizQuestions.length*.5) ? 'Fanmiy péi' : quizScore > 0 ? 'Marmay malin' : 'Ti découvreur';
  Zarlor.$('#quizProgress').textContent = 'Résultat';
  Zarlor.$('#quizQuestion').innerHTML = `Score : ${quizScore}/${quizQuestions.length}<br><span class="badge green">${badge}</span>`;
  Zarlor.$('#quizOptions').innerHTML = '';
  Zarlor.$('#quizFeedback').textContent = 'Rejoue pour améliorer ton score ou ajoute de nouvelles questions dans quizzes.json.';
  const next = Zarlor.$('#nextQuestionBtn'); next.hidden = false; next.textContent = 'Rejouer';
}
function updateBestScore(){ Zarlor.$('#bestScore').textContent = localStorage.getItem('zarlor_best_score') || '0'; }
document.addEventListener('click', (event) => {
  const opt = event.target.closest('#quizOptions button');
  if(opt) answerQuestion(opt.dataset.answer, opt);
  if(event.target.matches('#nextQuestionBtn')){
    if(quizIndex >= quizQuestions.length){ quizIndex=0; quizScore=0; event.target.textContent='Question suivante'; }
    else quizIndex++;
    renderQuestion();
  }
});
document.addEventListener('DOMContentLoaded', initQuiz);
