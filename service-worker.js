const CACHE_NAME = 'nout-ti-zarlor-pei-v1';
const ASSETS = [
  './','./index.html','./offline.html','./css/styles.css','./js/app.js','./js/map.js','./js/creole.js','./js/quiz.js','./data/settings.json','./data/places.json','./data/creole.json','./data/quizzes.json','./data/recipes.json','./data/articles.json','./data/products.json','./manifest.json','./assets/icons/icon-192.png','./assets/icons/icon-512.png','./assets/icons/favicon.png','./assets/illustrations/island-hero.svg','./assets/images/placeholder-place.svg','./assets/images/placeholder-recipe.svg','./assets/images/placeholder-article.svg','./assets/images/placeholder-product.svg'
];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(()=>self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => { const clone=response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone)); return response; }).catch(() => caches.match('./offline.html'))));
});
