# Nout Ti Zarlor Péi

**La Réunion à découvrir, apprendre et transmettre en famille.**

Mini-application culturelle, familiale et ludique : carte interactive des lieux péi, mots et proverbes créoles, quiz, recettes, souvenirs lontan et une boutique de zarlor à venir. Site **100 % statique** (HTML / CSS / JavaScript + fichiers JSON), **installable en PWA**, prêt pour **GitHub Pages** comme pour un hébergement **OVH** classique.

> Aucun framework, aucune compilation, aucun serveur. Vous modifiez des fichiers texte, vous publiez, c'est en ligne.

---

## Sommaire

1. [Arborescence du projet](#1-arborescence-du-projet)
2. [Mise en route en local](#2-mise-en-route-en-local)
3. [Déployer sur GitHub Pages](#3-déployer-sur-github-pages)
4. [Transférer sur OVH](#4-transférer-sur-ovh)
5. [Où modifier quoi (titre, logo, couleurs, liens…)](#5-où-modifier-quoi)
6. [Ajouter du contenu (lieu, mot, quiz, recette, article, produit)](#6-ajouter-du-contenu)
7. [La page admin-local (générateur de JSON)](#7-la-page-admin-local)
8. [Images et placeholders](#8-images-et-placeholders)
9. [PWA, cache et mises à jour](#9-pwa-cache-et-mises-à-jour)
10. [Bon à savoir](#10-bon-à-savoir)

---

## 1. Arborescence du projet

```
nout-ti-zarlor-pei/
├── index.html              ← page unique (toutes les sections)
├── offline.html            ← page affichée hors-ligne
├── admin-local.html        ← aide locale pour générer du JSON (non publique)
├── 404.html                ← page d'erreur
├── README.md               ← ce fichier
├── .nojekyll               ← indispensable pour GitHub Pages (ne pas supprimer)
├── robots.txt
├── sitemap.xml
├── manifest.json           ← configuration PWA (nom, icônes, couleurs)
├── service-worker.js       ← cache hors-ligne
│
├── css/
│   └── styles.css          ← TOUT le style + les variables de couleurs
│
├── js/
│   ├── app.js              ← cœur : navigation, PWA, recettes, articles, boutique
│   ├── map.js              ← carte interactive (Leaflet)
│   ├── creole.js           ← module créole (mot du jour, variantes, défi)
│   ├── quiz.js             ← module quiz et badges
│   └── admin-local.js      ← générateur JSON de la page admin-local
│
├── data/                   ← TOUT votre contenu modifiable est ici
│   ├── settings.json       ← coordonnées, réseaux, URL du site
│   ├── places.json         ← lieux de la carte
│   ├── creole.json         ← mots / expressions / proverbes
│   ├── quizzes.json        ← questions de quiz
│   ├── recipes.json        ← recettes
│   ├── articles.json       ← souvenirs lontan
│   └── products.json       ← boutique
│
└── assets/
    ├── icons/              ← icônes de l'app et favicons
    ├── images/             ← photos des lieux, recettes, articles (placeholders fournis)
    └── illustrations/      ← illustrations SVG (île, lambrequin)
```

Deux dossiers comptent au quotidien : **`data/`** pour le contenu et **`assets/images/`** pour les photos. Le reste, vous y touchez rarement.

---

## 2. Mise en route en local

Comme le site charge des fichiers JSON, il faut le servir via un petit serveur local (un double-clic sur `index.html` peut bloquer ces chargements). Au choix :

```bash
# Avec Python (déjà installé sur Mac/Linux)
cd nout-ti-zarlor-pei
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

```bash
# Avec Node, si vous l'avez
npx serve .
```

Sous VS Code, l'extension **Live Server** fait la même chose en un clic.

---

## 3. Déployer sur GitHub Pages

1. **Créer un dépôt** sur GitHub (par ex. `nout-ti-zarlor-pei`), public.
2. **Envoyer les fichiers** dans le dépôt :
   ```bash
   cd nout-ti-zarlor-pei
   git init
   git add .
   git commit -m "Première version du site"
   git branch -M main
   git remote add origin https://github.com/VOTRE-COMPTE/nout-ti-zarlor-pei.git
   git push -u origin main
   ```
   (Ou, plus simple : bouton **Add file → Upload files** sur le site de GitHub, puis glisser tout le contenu du dossier.)
3. **Activer Pages** : onglet **Settings → Pages**.
4. **Source** : *Deploy from a branch* → branche **main** → dossier **/ (root)** → **Save**.
5. Patientez ~1 minute, puis **ouvrez le lien** affiché (du type `https://VOTRE-COMPTE.github.io/nout-ti-zarlor-pei/`).
6. **Tester la PWA** : sur mobile (Chrome/Safari) ou desktop, le navigateur propose « Installer l'application ». Le bouton « Installer l'app » du site apparaît quand c'est disponible.
7. **Domaine personnalisé** (facultatif) : **Settings → Pages → Custom domain**, saisissez votre domaine et suivez la configuration DNS indiquée. Pensez à mettre à jour `site.url` dans `data/settings.json` et l'URL dans `sitemap.xml`.

> ⚠️ Le fichier **`.nojekyll`** doit rester à la racine : il empêche GitHub d'ignorer certains fichiers. Les chemins du site sont **relatifs**, donc le sous-dossier `/nout-ti-zarlor-pei/` ne pose aucun problème.

---

## 4. Transférer sur OVH

Le site fonctionne sur n'importe quel hébergement mutualisé classique, sans configuration particulière.

1. Connectez-vous à votre espace OVH et ouvrez l'accès **FTP** (logiciel **FileZilla** recommandé), ou le gestionnaire de fichiers OVH.
2. Placez-vous dans le dossier public de l'hébergement : en général **`www/`** (parfois `public_html/`).
3. **Transférez tout le contenu** du dossier `nout-ti-zarlor-pei/` (et non le dossier lui-même) à l'intérieur de `www/` : `index.html`, `manifest.json`, `service-worker.js`, ainsi que les dossiers `css/`, `js/`, `data/`, `assets/`.
4. Ouvrez votre domaine dans le navigateur : le site est en ligne.

**Mettre à jour ensuite :**

- **Modifier un contenu** → éditez le fichier concerné dans `data/`, ré-envoyez-le par FTP (il remplace l'ancien).
- **Changer / ajouter une image** → déposez le fichier dans `assets/images/`, puis indiquez son chemin dans le JSON correspondant (champ `image`).
- **Publier une mise à jour** → ré-envoyez les fichiers modifiés. Voir aussi [§9 sur le cache PWA](#9-pwa-cache-et-mises-à-jour) pour forcer le rafraîchissement.

> Si HTTPS n'est pas déjà actif, activez le **certificat SSL gratuit** dans l'espace OVH : la PWA et le service worker nécessitent HTTPS (sauf en `localhost`).

---

## 5. Où modifier quoi

| Je veux changer… | Fichier à ouvrir | Quoi modifier |
|---|---|---|
| Le **nom**, le **sous-titre**, la **promesse** | `data/settings.json` | bloc `site` |
| L'**email**, le **WhatsApp**, le lien **Google Forms** | `data/settings.json` | bloc `contact` |
| Les **réseaux sociaux** | `data/settings.json` | bloc `reseaux` (laisser `""` pour masquer un réseau) |
| L'action des boutons boutique/participation | `data/settings.json` | `boutique.mode_contact` → `email`, `whatsapp` ou `form` |
| L'**URL publique** du site | `data/settings.json` | `site.url` (+ `sitemap.xml`) |
| Les **couleurs** | `css/styles.css` | variables `--sun-1`, `--sun-2`, `--green`, `--ocean`, `--paper`, `--brown`… tout en haut, dans `:root` |
| Les **polices** | `index.html` (lien Google Fonts) + `css/styles.css` (variables `--font-…`) | |
| Le **logo / l'icône** | `assets/icons/` | remplacez `icon-192.png`, `icon-512.png`, `favicon-64.png` (gardez les mêmes noms et tailles) |
| Le **titre SEO / la description** | `index.html` | balises `<title>` et `<meta name="description">` dans le `<head>` |

> **Couleurs en un coup d'œil** : tout est centralisé en haut de `css/styles.css` dans le bloc `:root { … }`. Changez par exemple `--sun-2` et toute l'identité orange suit.

Après chaque modification : **enregistrez**, puis **publiez** (push GitHub ou envoi FTP OVH).

---

## 6. Ajouter du contenu

Tous les fichiers de `data/` sont des **listes JSON** : une paire de crochets `[ … ]` contenant des objets `{ … }` séparés par des virgules. Pour ajouter un élément, copiez un modèle ci-dessous **à l'intérieur des crochets**, après le dernier objet, en ajoutant une **virgule** entre les deux.

> 💡 Pas à l'aise avec le JSON ? Utilisez **`admin-local.html`** ([§7](#7-la-page-admin-local)) : il remplit ces blocs pour vous. Et collez toujours votre résultat dans un validateur comme jsonlint.com en cas de doute (une virgule oubliée casse le fichier).

### Comment ajouter un lieu ? → `data/places.json`

```json
{
  "id": "cap-noir",
  "nom": "Point de vue du Cap Noir",
  "commune": "La Possession",
  "region": "Ouest",
  "latitude": -21.0167,
  "longitude": 55.4000,
  "categorie": "point de vue",
  "niveau_famille": "facile",
  "duree_conseillee": "1 à 2 h",
  "parking": true,
  "toilettes": false,
  "ombre": true,
  "poussette": false,
  "image": "assets/images/placeholder-place.svg",
  "description": "Belvédère avec vue sur le cirque de Mafate.",
  "anecdote": "",
  "conseil_famille": "Tenez bien les enfants près des barrières.",
  "lien_google_maps": "https://www.google.com/maps/search/?api=1&query=-21.0167,55.4000",
  "tags": ["vue", "mafate", "ouest"],
  "source": "À compléter",
  "a_verifier": true
}
```
`region` : `Nord` · `Sud` · `Est` · `Ouest` · `Hauts`.
`categorie` : `pique-nique` · `bassin` · `plage` · `point de vue` · `patrimoine` · `marché` · `balade` · `jardin` · `famille`.
Laissez `"a_verifier": true` tant que l'information n'est pas confirmée.

### Comment ajouter un mot créole ? → `data/creole.json`

```json
{
  "id": "dofe",
  "mot": "dofé",
  "traduction_fr": "feu",
  "type": "mot",
  "phrase_exemple": "Alim le dofé pou fé griyad.",
  "explication": "« Dofé » désigne le feu, la flamme.",
  "niveau": "facile",
  "categorie": "quotidien",
  "variante_77": "",
  "variante_kwz": "",
  "variante_tangol": "",
  "audio": "",
  "tags": ["feu", "cuisine"]
}
```
`type` : `mot` · `expression` · `proverbe`.
`categorie` : `famille` · `cuisine` · `nature` · `quotidien` · `emotion` · `lontan`.
Les variantes graphiques (77 / KWZ / Tangol) sont **facultatives** : laissées vides, le bouton « Voir les variantes » ne les affiche pas.

### Comment ajouter un quiz ? → `data/quizzes.json`

```json
{
  "id": "q6",
  "question": "Que veut dire « lontan » ?",
  "type": "creole_vers_fr",
  "image": "",
  "audio": "",
  "options": ["Loin", "Autrefois", "Lentement", "Longtemps après"],
  "bonne_reponse": "Autrefois",
  "explication": "« Lontan » évoque le temps d'avant, le « bon vieux temps ».",
  "niveau": "facile",
  "categorie": "lontan"
}
```
`type` : `creole_vers_fr` · `fr_vers_creole` · `vrai_faux` · `choix_multiple` · `devinette`.
La `bonne_reponse` doit être **identique** à l'une des `options`.

### Comment ajouter une recette ? → `data/recipes.json`

```json
{
  "id": "bouchon-vapeur",
  "titre": "Bouchons vapeur",
  "categorie": "plat",
  "difficulte": "moyen",
  "temps": "1 h",
  "portions": 4,
  "image": "assets/images/placeholder-recipe.svg",
  "introduction": "Le petit en-cas péi par excellence.",
  "ingredients": ["Pâte à bouchon", "Viande de porc", "Oignons", "Sel, poivre"],
  "etapes": ["Préparer la farce.", "Garnir les pâtes.", "Cuire à la vapeur 20 min."],
  "astuce": "Servez avec du piment et de la sauce soja.",
  "souvenir": "",
  "tags": ["porc", "vapeur"],
  "a_verifier": true
}
```
`ingredients` et `etapes` sont des **listes** : chaque élément entre guillemets, séparé par une virgule.

### Comment ajouter un article (souvenir lontan) ? → `data/articles.json`

```json
{
  "id": "lecole-lontan",
  "titre": "L'école lontan",
  "categorie": "ecole",
  "date": "2024-01-15",
  "image": "assets/images/placeholder-article.svg",
  "resume": "Quand on écrivait à la plume et à l'ardoise.",
  "contenu": "Texte court de l'article, deux ou trois paragraphes…",
  "source": "Témoignages familiaux",
  "tags": ["école", "mémoire"],
  "a_verifier": true
}
```
`categorie` : `objet lontan` · `tradition` · `metier` · `ecole` · `cuisine` · `quartier` · `histoire` · `memoire familiale`.

### Comment ajouter un produit ? → `data/products.json`

```json
{
  "id": "guide-10-sorties",
  "nom": "Guide PDF · 10 sorties péi en famille",
  "type": "guide",
  "prix_indicatif": "9 €",
  "description": "Dix idées de sorties testées en famille, avec conseils pratiques.",
  "statut": "bientot",
  "image": "assets/images/placeholder-product.svg",
  "bouton_label": "Me prévenir",
  "lien": ""
}
```
`statut` : `bientot` · `disponible` · `test`.
Le `lien` peut rester vide : le bouton utilisera alors le contact défini dans `settings.json` (`boutique.mode_contact`).

---

## 7. La page admin-local

`admin-local.html` est une **aide hors-ligne** pour fabriquer les blocs JSON sans les écrire à la main. Elle **ne modifie pas** le site (impossible sur un hébergement statique) : elle génère un texte que **vous copiez** dans le fichier `data/` correspondant.

**Utilisation :**
1. Ouvrez `admin-local.html` (en local ou via l'URL du site).
2. Remplissez le formulaire **Lieu**, **Mot créole** ou **Recette**.
3. Cliquez sur **Générer le JSON** → le bloc s'affiche.
4. Cliquez sur **Copier**.
5. Ouvrez le bon fichier dans `data/`, collez le bloc **avant le crochet final `]`**, en le séparant du précédent par une **virgule**.
6. Publiez (GitHub ou OVH).

Cette page est volontairement **absente de la navigation** et marquée `noindex` : elle n'apparaît pas dans Google. Pour la garder privée, vous pouvez aussi simplement ne pas la mettre en ligne.

---

## 8. Images et placeholders

Des **placeholders SVG** sont fournis pour que le site soit beau dès le départ, même sans vos photos :
`placeholder-place.svg`, `placeholder-recipe.svg`, `placeholder-article.svg`, `placeholder-product.svg`.

Pour mettre **vos** images :
1. Déposez le fichier (JPG/PNG/WebP) dans `assets/images/`.
2. Renseignez son chemin dans le champ `"image"` du JSON concerné, par ex. `"image": "assets/images/grand-anse.jpg"`.

Le code prévoit un **repli automatique** : si une image est introuvable, le placeholder correspondant s'affiche, rien ne casse. Pensez au **lazy loading** déjà en place (les images se chargent au défilement) — gardez des fichiers légers (idéalement < 300 ko) pour la rapidité.

---

## 9. PWA, cache et mises à jour

Le **service worker** met en cache les fichiers essentiels (page, styles, scripts, JSON, icônes) pour un fonctionnement **hors-ligne** et un chargement rapide. Les fichiers `data/*.json` sont récupérés **en priorité depuis le réseau** : vos mises à jour de contenu apparaissent donc rapidement.

Si après une mise à jour vous voyez encore l'ancienne version (CSS, scripts) :
- ouvrez `service-worker.js` et **incrémentez la version du cache** (par ex. `zarlor-v1` → `zarlor-v2`). À la prochaine visite, l'ancien cache est purgé et tout est rechargé.
- côté visiteur, un simple rechargement forcé (Ctrl/Cmd + Maj + R) suffit en général.

---

## 10. Bon à savoir

- **Carte interactive** : propulsée par **Leaflet** (chargé depuis un CDN). Une connexion est nécessaire au premier affichage de la carte ; le reste du site fonctionne hors-ligne.
- **Données « à vérifier »** : plusieurs contenus d'exemple portent `"a_verifier": true` et un champ `source`. Ils sont **illustratifs** : vérifiez et complétez avant diffusion large, puis passez à `false`.
- **Variantes créoles** : la graphie principale est volontairement **lisible grand public**. Les variantes 77 / KWZ / Tangol sont proposées comme **information pédagogique**, jamais imposées.
- **Aucune donnée personnelle** n'est collectée : favoris, mots appris et meilleurs scores sont stockés **localement** dans le navigateur (localStorage), rien n'est envoyé sur un serveur.
- **Accessibilité & performance** : structure sémantique, navigation clavier, focus visible, `prefers-reduced-motion`, images en lazy loading, zéro dépendance superflue.

---

*Nout Ti Zarlor Péi — fé nout zarlor rayonné, an fanmiy.* 🌺
