// Nout Ti Zarlor Péi - fonctions globales, rendu contenus et PWA
const Zarlor = {
  data: {},
  async loadJSON(path){
    const response = await fetch(path, {cache:'no-store'});
    if(!response.ok) throw new Error(`Impossible de charger ${path}`);
    return response.json();
  },
  $(selector, root=document){ return root.querySelector(selector); },
  $$(selector, root=document){ return [...root.querySelectorAll(selector)]; },
  storage: {
    get(key, fallback=[]){ try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
    set(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
  },
  img(src, alt){ return `<img src="${src || './assets/images/placeholder-article.svg'}" alt="${alt || ''}" loading="lazy" onerror="this.src='./assets/images/placeholder-article.svg'">`; },
  badge(text, cls=''){ return `<span class="badge ${cls}">${text}</span>`; },
  openModal(html){
    const modal = this.$('#modal');
    const body = this.$('#modalBody');
    body.innerHTML = html;
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  },
  closeModal(){
    const modal = this.$('#modal');
    modal.setAttribute('aria-hidden','true');
    this.$('#modalBody').innerHTML='';
    document.body.style.overflow='';
  }
};

window.Zarlor = Zarlor;

function setupNavigation(){
  const toggle = Zarlor.$('.nav-toggle');
  const menu = Zarlor.$('#navMenu');
  if(!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  Zarlor.$$('#navMenu a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded','false');
  }));
}

function setupModal(){
  document.addEventListener('click', (event) => {
    if(event.target.matches('[data-close-modal]')) Zarlor.closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if(event.key === 'Escape') Zarlor.closeModal();
  });
}

async function loadSettings(){
  try{
    const settings = await Zarlor.loadJSON('./data/settings.json');
    Zarlor.data.settings = settings;
    Zarlor.$('#appVersion').textContent = settings.version || '1.0.0';
    const email = settings.contact_email || 'contact@zarlorpei.re';
    Zarlor.$('#footerMail').href = `mailto:${email}`;
    Zarlor.$('#footerMail').textContent = email;
    Zarlor.$('#mailLink').href = `mailto:${email}?subject=Partaz%20out%20zarlor`;
    Zarlor.$('#whatsappLink').href = `https://wa.me/${settings.whatsapp || ''}`;
    Zarlor.$('#formLink').href = settings.google_form_url || '#';
    Zarlor.$('#partnerLink').href = settings.partner_url || `mailto:${email}`;
  }catch(error){ console.warn(error); }
}

function setupInstallPrompt(){
  let deferredPrompt = null;
  const btn = Zarlor.$('#installAppBtn');
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    btn.hidden = false;
  });
  btn?.addEventListener('click', async () => {
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    btn.hidden = true;
  });
}

function registerServiceWorker(){
  if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(err => console.warn('SW:', err));
    });
  }
}

function renderContentCard(item, type){
  const image = item.image || (type === 'recipe' ? './assets/images/placeholder-recipe.svg' : './assets/images/placeholder-article.svg');
  const title = item.titre || item.nom;
  const meta = [item.categorie || item.catégorie, item.difficulte || item.date].filter(Boolean).join(' • ');
  const intro = item.resume || item.introduction || item.description || '';
  return `<article class="content-card">
    ${Zarlor.img(image, title)}
    <div class="content-card-body">
      <p class="meta">${meta}</p>
      <h3>${title}</h3>
      <p>${intro}</p>
      ${item.a_verifier ? Zarlor.badge('À vérifier','red') : ''}
      <button class="btn btn-ghost" data-open-${type}="${item.id}">Voir le détail</button>
    </div>
  </article>`;
}

function recipeDetail(recipe){
  return `<h2 id="modalTitle">${recipe.titre}</h2>
    <div class="detail-hero">${Zarlor.img(recipe.image || './assets/images/placeholder-recipe.svg', recipe.titre)}</div>
    <div class="badges">${Zarlor.badge(recipe.categorie,'green')}${Zarlor.badge(recipe.difficulte || 'facile','blue')}${Zarlor.badge(recipe.temps || '')}</div>
    <p>${recipe.introduction || ''}</p>
    <h3>Ingrédients</h3><ul>${(recipe.ingredients||[]).map(x=>`<li>${x}</li>`).join('')}</ul>
    <h3>Étapes</h3><ol>${(recipe.etapes||[]).map(x=>`<li>${x}</li>`).join('')}</ol>
    ${recipe.astuce ? `<h3>Astuce</h3><p>${recipe.astuce}</p>` : ''}
    ${recipe.souvenir ? `<h3>Souvenir</h3><p>${recipe.souvenir}</p>` : ''}
    ${recipe.a_verifier ? '<p><strong>Note :</strong> fiche exemple à vérifier avant publication.</p>' : ''}
    <button class="btn btn-primary" onclick="window.print()">Imprimer la fiche</button>`;
}

function articleDetail(article){
  return `<h2 id="modalTitle">${article.titre}</h2>
    <div class="detail-hero">${Zarlor.img(article.image || './assets/images/placeholder-article.svg', article.titre)}</div>
    <div class="badges">${Zarlor.badge(article.categorie,'green')}${article.a_verifier ? Zarlor.badge('À vérifier','red') : ''}</div>
    <p class="lead">${article.resume || ''}</p>
    <p>${article.contenu_court || ''}</p>
    <p class="small"><strong>Source :</strong> ${article.source || 'À compléter'}</p>`;
}

async function loadRecipesAndArticles(){
  try{
    const [recipes, articles, products, places, words, quizzes] = await Promise.all([
      Zarlor.loadJSON('./data/recipes.json'), Zarlor.loadJSON('./data/articles.json'), Zarlor.loadJSON('./data/products.json'), Zarlor.loadJSON('./data/places.json'), Zarlor.loadJSON('./data/creole.json'), Zarlor.loadJSON('./data/quizzes.json')
    ]);
    Object.assign(Zarlor.data, {recipes, articles, products});
    Zarlor.$('#countPlaces').textContent = places.length;
    Zarlor.$('#countWords').textContent = words.length;
    Zarlor.$('#countQuizzes').textContent = quizzes.length;

    renderRecipes(recipes);
    renderArticles(articles);
    renderProducts(products);
  }catch(error){ console.warn(error); }
}

function renderRecipes(recipes){
  const list = Zarlor.$('#recipesList');
  const search = Zarlor.$('#recipeSearch');
  const category = Zarlor.$('#recipeCategory');
  const categories = [...new Set(recipes.map(r => r.categorie).filter(Boolean))];
  category.innerHTML = '<option value="all">Toutes</option>' + categories.map(c=>`<option value="${c}">${c}</option>`).join('');
  const draw = () => {
    const q = search.value.toLowerCase(); const c = category.value;
    const filtered = recipes.filter(r => (c==='all'||r.categorie===c) && JSON.stringify(r).toLowerCase().includes(q));
    list.innerHTML = filtered.map(r => renderContentCard(r,'recipe')).join('');
  };
  search.addEventListener('input', draw); category.addEventListener('change', draw); draw();
}
function renderArticles(articles){
  Zarlor.$('#articlesList').innerHTML = articles.map(a => renderContentCard(a,'article')).join('');
}
function renderProducts(products){
  Zarlor.$('#productsList').innerHTML = products.map(p => `<article class="product-card">
    ${Zarlor.img(p.image || './assets/images/placeholder-product.svg', p.nom)}
    <p class="meta">${p.type} • ${p.statut}</p><h3>${p.nom}</h3><p>${p.description}</p>
    <div class="badges">${Zarlor.badge(p.prix_indicatif || 'à venir','blue')}</div>
    <a class="btn btn-ghost" href="${p.lien || '#'}">${p.bouton_label || 'Voir'}</a>
  </article>`).join('');
}

document.addEventListener('click', (event) => {
  const recipeBtn = event.target.closest('[data-open-recipe]');
  const articleBtn = event.target.closest('[data-open-article]');
  if(recipeBtn){
    const recipe = Zarlor.data.recipes?.find(r => r.id === recipeBtn.dataset.openRecipe);
    if(recipe) Zarlor.openModal(recipeDetail(recipe));
  }
  if(articleBtn){
    const article = Zarlor.data.articles?.find(a => a.id === articleBtn.dataset.openArticle);
    if(article) Zarlor.openModal(articleDetail(article));
  }
});

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation(); setupModal(); setupInstallPrompt(); registerServiceWorker(); loadSettings(); loadRecipesAndArticles();
});
