# Nout Ti Zarlor Péi

Mini site / PWA culturelle familiale : **La Réunion à découvrir, apprendre et transmettre en famille.**

## 1. Structure

```txt
index.html
admin-local.html
offline.html
404.html
css/styles.css
js/app.js
js/map.js
js/creole.js
js/quiz.js
js/admin-local.js
data/*.json
assets/icons
assets/images
assets/illustrations
manifest.json
service-worker.js
```

## 2. Tester en local

Ne double-clique pas directement sur `index.html`, car les fichiers JSON peuvent être bloqués par le navigateur.

Dans le dossier du projet :

```bash
python3 -m http.server 8080
```

Puis ouvre :

```txt
http://localhost:8080
```

## 3. Déployer sur GitHub Pages

1. Crée un dépôt GitHub.
2. Envoie tous les fichiers du dossier.
3. Va dans **Settings > Pages**.
4. Source : branche `main`, dossier `/root`.
5. Clique sur Save.
6. Attends la génération du lien.
7. Ouvre le site et teste : carte, quiz, recettes, PWA.

Le fichier `.nojekyll` évite certains blocages de fichiers sur GitHub Pages.

## 4. Transférer sur OVH

1. Connecte-toi à ton hébergement OVH via FTP.
2. Ouvre le dossier public du site, souvent `www`.
3. Envoie tous les fichiers et dossiers du projet.
4. Vérifie que `index.html` est à la racine du dossier public.
5. Ouvre ton nom de domaine.

## 5. Modifier les couleurs

Ouvre :

```txt
css/styles.css
```

Modifie les variables dans `:root` :

```css
--cream:#FFF7E6;
--sun:#F7C948;
--orange:#E8872E;
```

## 6. Changer le logo

Remplace :

```txt
assets/images/logo-zarlor-pei.jpg
```

Garde le même nom de fichier pour éviter de modifier le code.

## 7. Ajouter une image

1. Ajoute ton image dans `assets/images/`.
2. Dans le JSON, indique le chemin :

```json
"image": "assets/images/mon-image.jpg"
```

## 8. Ajouter un lieu

Ouvre :

```txt
data/places.json
```

Ajoute un objet dans le tableau :

```json
{
  "id": "place-007",
  "nom": "Nom du lieu",
  "commune": "Commune",
  "region": "Sud",
  "latitude": -21.000,
  "longitude": 55.000,
  "categorie": "pique-nique",
  "niveau_famille": "facile",
  "duree_conseillee": "1h",
  "parking": true,
  "toilettes": false,
  "ombre": true,
  "poussette": false,
  "image": "assets/images/placeholder-place.svg",
  "courte_description": "Description courte.",
  "anecdote": "Anecdote.",
  "conseil_famille": "Conseil.",
  "google_maps": "https://www.google.com/maps",
  "tags": ["famille"],
  "source": "À compléter",
  "a_verifier": true
}
```

## 9. Ajouter un mot créole

Ouvre `data/creole.json` :

```json
{
  "id": "kr-009",
  "mot": "mot",
  "traduction_fr": "traduction",
  "type": "mot",
  "phrase_exemple": "Phrase exemple.",
  "explication": "Explication.",
  "niveau": "facile",
  "categorie": "quotidien",
  "variante_77": "",
  "variante_kwz": "",
  "variante_tangol": "",
  "audio": "",
  "tags": []
}
```

## 10. Ajouter un quiz

Ouvre `data/quizzes.json` :

```json
{
  "id": "q-006",
  "question": "Question ?",
  "type": "choix multiple",
  "image": "",
  "audio": "",
  "options": ["Réponse A", "Réponse B", "Réponse C"],
  "bonne_reponse": "Réponse A",
  "explication": "Explication courte.",
  "niveau": "facile",
  "categorie": "culture péi"
}
```

## 11. Ajouter une recette

Ouvre `data/recipes.json` et copie la structure existante. Les `ingredients` et `etapes` sont des listes.

## 12. Ajouter un article

Ouvre `data/articles.json`. Ajoute toujours une `source`. Si l’information n’est pas vérifiée, garde :

```json
"a_verifier": true
```

## 13. Ajouter un produit

Ouvre `data/products.json`. Le lien peut être un mailto, une page, un Google Form ou un lien de paiement futur.

## 14. Utiliser l’admin JSON local

Ouvre :

```txt
admin-local.html
```

Remplis le formulaire, génère le JSON, copie le bloc dans le fichier correspondant.

## 15. Éviter les erreurs JSON

- Chaque objet est séparé par une virgule.
- Pas de virgule après le dernier objet.
- Les textes sont entre guillemets doubles.
- Les listes utilisent `[ ]`.
- Les booléens utilisent `true` ou `false`, sans guillemets.

## 16. Mettre à jour le service worker

Après une grosse modification, change le nom du cache dans `service-worker.js` :

```js
const CACHE_NAME = 'nout-ti-zarlor-pei-v2';
```

Cela force les navigateurs à prendre la nouvelle version.

## 17. Notes importantes

Les données d’exemple ne sont pas des informations officielles. Remplace ou vérifie tout contenu marqué `a_verifier: true` avant communication publique.
