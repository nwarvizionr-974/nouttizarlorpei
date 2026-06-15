// Carte interactive alimentée par data/places.json
let zarlorMap = null;
let placeMarkers = [];

async function initMap(){
  const mapEl = Zarlor.$('#map');
  if(!mapEl) return;
  try{
    const places = await Zarlor.loadJSON('./data/places.json');
    Zarlor.data.places = places;
    setupPlaceFilters(places);
    if(window.L){
      zarlorMap = L.map('map', {scrollWheelZoom:false}).setView([-21.115, 55.536], 9);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'&copy; OpenStreetMap'}).addTo(zarlorMap);
    }else{
      mapEl.innerHTML = '<div class="card-soft"><h3>Carte indisponible</h3><p>Leaflet n’a pas pu être chargé. La liste des lieux reste disponible.</p></div>';
    }
    renderPlaces(places);
    updateFavoriteCount();
  }catch(error){
    console.warn(error);
    mapEl.innerHTML = '<div class="card-soft"><h3>Impossible de charger les lieux</h3><p>Vérifie le fichier data/places.json.</p></div>';
  }
}

function setupPlaceFilters(places){
  const cats = [...new Set(places.map(p => p.categorie).filter(Boolean))];
  const regs = [...new Set(places.map(p => p.region).filter(Boolean))];
  Zarlor.$('#categoryFilter').innerHTML = '<option value="all">Toutes</option>' + cats.map(c=>`<option value="${c}">${c}</option>`).join('');
  Zarlor.$('#regionFilter').innerHTML = '<option value="all">Toutes</option>' + regs.map(r=>`<option value="${r}">${r}</option>`).join('');
  ['#placeSearch','#categoryFilter','#regionFilter'].forEach(sel => Zarlor.$(sel).addEventListener(sel.includes('Search')?'input':'change', () => renderPlaces(filterPlaces())));
}

function filterPlaces(){
  const q = Zarlor.$('#placeSearch').value.toLowerCase();
  const cat = Zarlor.$('#categoryFilter').value;
  const reg = Zarlor.$('#regionFilter').value;
  return (Zarlor.data.places || []).filter(p => {
    const matchQ = JSON.stringify(p).toLowerCase().includes(q);
    return matchQ && (cat==='all'||p.categorie===cat) && (reg==='all'||p.region===reg);
  });
}

function renderPlaces(places){
  renderMarkers(places);
  const favorites = Zarlor.storage.get('zarlor_favorites', []);
  Zarlor.$('#placesList').innerHTML = places.map(p => `<article class="place-item" data-place-id="${p.id}">
    <h4>${p.nom}</h4><p>${p.commune} • ${p.region}</p>
    <div class="badges">${Zarlor.badge(p.categorie,'green')}${Zarlor.badge(p.niveau_famille,'blue')}${p.a_verifier ? Zarlor.badge('À vérifier','red') : ''}</div>
    <button class="btn btn-ghost" data-place-detail="${p.id}">Voir la fiche</button>
    <button class="btn btn-ghost" data-place-fav="${p.id}">${favorites.includes(p.id) ? 'Retirer favori' : 'Ajouter favori'}</button>
  </article>`).join('') || '<p>Aucun lieu pour ces filtres.</p>';
}

function renderMarkers(places){
  if(!zarlorMap) return;
  placeMarkers.forEach(marker => marker.remove());
  placeMarkers = places.map(place => {
    const marker = L.marker([place.latitude, place.longitude]).addTo(zarlorMap);
    marker.bindPopup(`<strong>${place.nom}</strong><br>${place.categorie}<br><button onclick="openPlaceDetail('${place.id}')">Voir la fiche</button>`);
    return marker;
  });
  if(placeMarkers.length){
    const group = L.featureGroup(placeMarkers);
    zarlorMap.fitBounds(group.getBounds().pad(.2));
  }
}

function placeDetailHTML(place){
  return `<h2 id="modalTitle">${place.nom}</h2>
    <div class="detail-hero">${Zarlor.img(place.image || './assets/images/placeholder-place.svg', place.nom)}</div>
    <div class="badges">${Zarlor.badge(place.categorie,'green')}${Zarlor.badge(place.region,'blue')}${Zarlor.badge(place.niveau_famille,'')}${place.a_verifier ? Zarlor.badge('À vérifier','red') : ''}</div>
    <p class="lead">${place.courte_description || ''}</p>
    <div class="detail-grid">
      <span>Commune : ${place.commune}</span><span>Durée : ${place.duree_conseillee || 'À renseigner'}</span>
      <span>Parking : ${place.parking ? 'oui' : 'non'}</span><span>Toilettes : ${place.toilettes ? 'oui' : 'non'}</span>
      <span>Ombre : ${place.ombre ? 'oui' : 'non'}</span><span>Poussette : ${place.poussette ? 'oui' : 'non'}</span>
    </div>
    <h3>Anecdote</h3><p>${place.anecdote || 'À compléter.'}</p>
    <h3>Conseil famille</h3><p>${place.conseil_famille || 'À compléter.'}</p>
    <p class="small"><strong>Source :</strong> ${place.source || 'À compléter'}</p>
    <div class="hero-actions"><a class="btn btn-primary" target="_blank" rel="noopener" href="${place.google_maps || 'https://www.google.com/maps'}">Ouvrir dans Google Maps</a><button class="btn btn-ghost" data-place-fav="${place.id}">Ajouter / retirer favori</button></div>`;
}

window.openPlaceDetail = function(id){
  const place = Zarlor.data.places?.find(p => p.id === id);
  if(place) Zarlor.openModal(placeDetailHTML(place));
}

function toggleFavorite(id){
  const favorites = Zarlor.storage.get('zarlor_favorites', []);
  const next = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
  Zarlor.storage.set('zarlor_favorites', next);
  updateFavoriteCount();
  renderPlaces(filterPlaces());
}
function updateFavoriteCount(){
  Zarlor.$('#favoriteCount').textContent = Zarlor.storage.get('zarlor_favorites', []).length;
}

document.addEventListener('click', (event) => {
  const detail = event.target.closest('[data-place-detail]');
  const fav = event.target.closest('[data-place-fav]');
  if(detail) openPlaceDetail(detail.dataset.placeDetail);
  if(fav) toggleFavorite(fav.dataset.placeFav);
});

document.addEventListener('DOMContentLoaded', initMap);
