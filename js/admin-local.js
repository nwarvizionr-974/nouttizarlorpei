/* =====================================================================
   admin-local.js — Générateur de blocs JSON (aide locale, hors-ligne)
   ---------------------------------------------------------------------
   Cette page NE MODIFIE PAS le site. Elle lit les champs des formulaires
   (repérés par l'attribut data-f="...") et fabrique un objet JSON propre,
   prêt à être collé dans le fichier /data correspondant.

   - Bouton data-gen="place|creole|recipe"  -> génère le JSON
   - Sortie affichée dans #out-place / #out-creole / #out-recipe
   - Bouton data-copy="out-xxx"             -> copie le bloc affiché
   ===================================================================== */
(function () {
  "use strict";

  /* Lit tous les champs data-f situés dans le même <fieldset> que le bouton. */
  function lireChamps(bouton) {
    var bloc = bouton.closest("fieldset") || document;
    var champs = {};
    bloc.querySelectorAll("[data-f]").forEach(function (el) {
      champs[el.getAttribute("data-f")] = (el.value || "").trim();
    });
    return champs;
  }

  /* Transforme un texte multi-lignes en tableau (une ligne = un élément). */
  function enListe(texte) {
    if (!texte) return [];
    return texte
      .split(/\r?\n/)
      .map(function (l) { return l.trim(); })
      .filter(function (l) { return l.length > 0; });
  }

  /* Transforme "a, b ; c" en tableau de tags nettoyés. */
  function enTags(texte) {
    if (!texte) return [];
    return texte
      .split(/[,;]+/)
      .map(function (t) { return t.trim().toLowerCase(); })
      .filter(Boolean);
  }

  /* Nombre sûr (renvoie null si vide / invalide). */
  function nombre(v) {
    if (v === "" || v == null) return null;
    var n = Number(v);
    return isNaN(n) ? null : n;
  }

  /* id de secours à partir du nom si l'utilisateur n'en saisit pas. */
  function slug(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /* ---- Constructeurs d'objets, alignés sur les schémas de /data ---- */

  function construireLieu(c) {
    var lat = nombre(c.latitude);
    var lng = nombre(c.longitude);
    return {
      id: c.id || slug(c.nom) || "nouveau-lieu",
      nom: c.nom || "",
      commune: c.commune || "",
      region: c.region || "Nord",
      latitude: lat,
      longitude: lng,
      categorie: c.categorie || "famille",
      niveau_famille: c.niveau_famille || "facile",
      duree_conseillee: c.duree_conseillee || "",
      parking: true,
      toilettes: false,
      ombre: false,
      poussette: false,
      image: "assets/images/placeholder-place.svg",
      description: c.description || "",
      anecdote: "",
      conseil_famille: c.conseil_famille || "",
      lien_google_maps:
        lat != null && lng != null
          ? "https://www.google.com/maps/search/?api=1&query=" + lat + "," + lng
          : "",
      tags: [],
      source: "À compléter",
      a_verifier: true
    };
  }

  function construireMot(c) {
    return {
      id: c.id || slug(c.mot) || "nouveau-mot",
      mot: c.mot || "",
      traduction_fr: c.traduction_fr || "",
      type: c.type || "mot",
      phrase_exemple: c.phrase_exemple || "",
      explication: c.explication || "",
      niveau: c.niveau || "facile",
      categorie: c.categorie || "quotidien",
      variante_77: c.variante_77 || "",
      variante_kwz: c.variante_kwz || "",
      variante_tangol: c.variante_tangol || "",
      audio: "",
      tags: []
    };
  }

  function construireRecette(c) {
    return {
      id: c.id || slug(c.titre) || "nouvelle-recette",
      titre: c.titre || "",
      categorie: c.categorie || "plat",
      difficulte: c.difficulte || "facile",
      temps: c.temps || "",
      portions: nombre(c.portions) || 4,
      image: "assets/images/placeholder-recipe.svg",
      introduction: c.introduction || "",
      ingredients: enListe(c.ingredients),
      etapes: enListe(c.etapes),
      astuce: c.astuce || "",
      souvenir: "",
      tags: [],
      a_verifier: true
    };
  }

  var CONSTRUCTEURS = {
    place: { build: construireLieu, sortie: "out-place" },
    creole: { build: construireMot, sortie: "out-creole" },
    recipe: { build: construireRecette, sortie: "out-recipe" }
  };

  /* ---- Câblage des boutons « Générer » ---- */
  document.querySelectorAll("[data-gen]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var type = btn.getAttribute("data-gen");
      var conf = CONSTRUCTEURS[type];
      if (!conf) return;
      var objet = conf.build(lireChamps(btn));
      var json = JSON.stringify(objet, null, 2);
      var cible = document.getElementById(conf.sortie);
      if (cible) cible.textContent = json;
    });
  });

  /* ---- Câblage des boutons « Copier » ---- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cible = document.getElementById(btn.getAttribute("data-copy"));
      if (!cible) return;
      var texte = cible.textContent || "";
      var ok = function () {
        var label = btn.textContent;
        btn.textContent = "Copié ✓";
        setTimeout(function () { btn.textContent = label; }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texte).then(ok).catch(function () {
          repliCopie(texte, ok);
        });
      } else {
        repliCopie(texte, ok);
      }
    });
  });

  /* Repli pour les navigateurs sans API Clipboard. */
  function repliCopie(texte, ok) {
    var z = document.createElement("textarea");
    z.value = texte;
    z.style.position = "fixed";
    z.style.opacity = "0";
    document.body.appendChild(z);
    z.select();
    try { document.execCommand("copy"); ok(); } catch (e) {}
    document.body.removeChild(z);
  }
})();
