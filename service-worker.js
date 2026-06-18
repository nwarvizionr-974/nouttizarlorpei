/* =========================================================================
   service-worker.js — PWA Nout Ti Zarlor Péi
   Stratégie : "cache d'abord" pour les fichiers de l'app (rapide + offline),
   "réseau d'abord" pour les données JSON (toujours à jour si en ligne).
   ⚠️ Incrémentez CACHE_VERSION à chaque mise à jour pour forcer le rafraîchissement.
   ========================================================================= */
const CACHE_VERSION = "zarlor-v6";

/* Chemins RELATIFS (important pour fonctionner dans un sous-dossier GitHub Pages) */
const CORE_ASSETS = [
  "./",
  "index.html",
  "offline.html",
  "404.html",
  "manifest.json",
  "css/styles.css",
  "js/app.js",
  "js/map.js",
  "js/creole.js",
  "js/quiz.js",
  "data/settings.json",
  "data/places.json",
  "data/creole.json",
  "data/quizzes.json",
  "data/recipes.json",
  "data/articles.json",
  "data/products.json",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/illustrations/hero-bg.svg",
  "assets/illustrations/torn-top.svg",
  "assets/illustrations/torn-bottom.svg",
  "assets/illustrations/doodle-cloud.svg",
  "assets/illustrations/doodle-wave.svg",
  "assets/illustrations/doodle-mountains.svg",
  "assets/images/placeholder-place.svg",
  "assets/images/placeholder-recipe.svg",
  "assets/images/placeholder-article.svg",
  "assets/images/placeholder-product.svg"
];

/* Installation : on pré-charge le cœur de l'app */
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(c => c.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

/* Activation : on supprime les anciens caches */
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Requêtes */
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Données JSON : réseau d'abord, repli sur le cache
  if (url.pathname.endsWith(".json")) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Autres ressources : cache d'abord, repli réseau, puis page offline pour les pages
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      // Met en cache les ressources de même origine
      if (url.origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => {
      if (req.mode === "navigate") return caches.match("offline.html");
    }))
  );
});
