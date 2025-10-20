/* ==================== CONFIGURATION ==================== */

// Vérification chargement des librairies
if (typeof mapboxgl === 'undefined') {
  console.error('❌ Mapbox GL JS non chargé !');
  alert('Erreur : Mapbox GL JS non chargé. Vérifiez votre connexion internet.');
}
if (typeof turf === 'undefined') {
  console.error('❌ Turf.js non chargé !');
  alert('Erreur : Turf.js non chargé. Vérifiez votre connexion internet.');
}

// ⚠️ Ton token Mapbox
mapboxgl.accessToken = 'pk.eyJ1Ijoid2F6ZXRlc3R3YXplIiwiYSI6ImNtZDMxOXQ3YjFmNWUybHFucXg1dGM2Z2YifQ.5cGV03JsDPzm1QV-LNikFA';

const CONFIG = {
  LYON_CENTER: { lat: 45.764043, lng: 4.835659 },

  ZONES: [
    { id: 'lyon1', name: 'Lyon 1er', lat: 45.7675, lng: 4.8340 },
    { id: 'lyon2', name: 'Lyon 2e', lat: 45.7540, lng: 4.8270 },
    { id: 'lyon3', name: 'Lyon 3e', lat: 45.7570, lng: 4.8490 },
    { id: 'lyon5', name: 'Lyon 5e', lat: 45.7575, lng: 4.8095 },
    { id: 'lyon6', name: 'Lyon 6e', lat: 45.7705, lng: 4.8510 },
    { id: 'lyon7', name: 'Lyon 7e', lat: 45.7335, lng: 4.8410 },
    { id: 'villeurbanne', name: 'Villeurbanne', lat: 45.7665, lng: 4.8795 },
    { id: 'caluire', name: 'Caluire', lat: 45.7975, lng: 4.8475 },
    { id: 'oullins', name: 'Oullins', lat: 45.7150, lng: 4.8070 },
    { id: 'venissieux', name: 'Vénissieux', lat: 45.6965, lng: 4.8840 },
    { id: 'bron', name: 'Bron', lat: 45.7355, lng: 4.9110 },
    { id: 'ecully', name: 'Écully', lat: 45.7745, lng: 4.7785 }
  ],

  QUESTIONS: [
    { q: "En agglomération, quelle est la vitesse maximale autorisée ?", a: ["30 km/h", "50 km/h", "70 km/h", "90 km/h"], correct: 1 },
    { q: "À quelle distance minimale devez-vous stationner d'un passage piéton ?", a: ["3 mètres", "5 mètres", "10 mètres", "15 mètres"], correct: 1 },
    { q: "Sur autoroute, quelle est la distance de sécurité minimale recommandée ?", a: ["1 seconde", "2 secondes", "3 secondes", "5 secondes"], correct: 1 },
    { q: "Que signifie un panneau triangulaire rouge avec bordure blanche ?", a: ["Interdiction", "Danger", "Indication", "Obligation"], correct: 1 },
    { q: "À un feu orange, vous devez :", a: ["Accélérer", "Vous arrêter si possible en sécurité", "Continuer", "Klaxonner"], correct: 1 }
  ],

  DEFAULT_SPEED_LIMIT: 50
};

/* ==================== ÉTAT ==================== */

const state = {
  selectedZones: [],
  duration: 30,
  vehicle: 'car',
  map: null,
  watchId: null,
  currentPosition: null,
  startPosition: null,
  heading: 0,
  route: null,
  instructions: [],
  currentInstructionIndex: 0,
  startTime: null,
  totalDistance: 0,
  totalDuration: 0,
  currentSpeed: 0,
  currentSpeedLimit: CONFIG.DEFAULT_SPEED_LIMIT,
  distanceTraveled: 0,
  askedQuestions: [],
  correctAnswers: 0,
  totalQuestions: 0,
  lastPosition: null,
  lastPositionTime: null,
  userMarker: null
};

/* ==================== APPLICATION ==================== */

const app = {
  init() {
    console.log('🚗 Drive Lyon - Mapbox uniquement');
    this.renderZones();
    this.setupSlider();
  },

  // ========== ÉCRANS ==========
  showHome() {
    this.hideAllScreens();
    document.getElementById('homeScreen').classList.add('active');
    this.stopGPSTracking();
  },
  showConfig() {
    this.hideAllScreens();
    document.getElementById('configScreen').classList.add('active');
  },
  showDriving() {
    this.hideAllScreens();
    document.getElementById('drivingScreen').classList.add('active');
  },
  hideAllScreens() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  },

  // ========== CONFIG ==========
  renderZones() {
    const grid = document.getElementById('zonesGrid');
    grid.innerHTML = '';
    CONFIG.ZONES.forEach(zone => {
      const chip = document.createElement('div');
      chip.className = 'zone-chip';
      chip.textContent = zone.name;
      chip.dataset.zoneId = zone.id;
      chip.onclick = () => this.toggleZone(zone.id);
      grid.appendChild(chip);
    });
  },
  toggleZone(zoneId) {
    const chip = document.querySelector(`[data-zone-id="${zoneId}"]`);
    chip.classList.toggle('selected');
    const index = state.selectedZones.indexOf(zoneId);
    if (index > -1) state.selectedZones.splice(index, 1);
    else state.selectedZones.push(zoneId);
  },
  setupSlider() {
    const slider = document.getElementById('durationSlider');
    const label = document.getElementById('durationLabel');
    slider.addEventListener('input', (e) => {
      state.duration = parseInt(e.target.value, 10);
      label.textContent = `${state.duration} minutes`;
    });
  },
  selectVehicle(vehicle) {
    state.vehicle = vehicle;
    document.querySelectorAll('.vehicle-card').forEach(card => {
      card.classList.toggle('active', card.dataset.vehicle === vehicle);
    });
  },

  // ========== GPS ==========
  startGPSTracking() {
    console.log('📍 Démarrage GPS RÉEL...');
    document.getElementById('loaderText').textContent = 'Activation GPS...';
    document.getElementById('loaderDetail').textContent = 'Autorisation requise';

    if (!navigator.geolocation) {
      this.showToast('❌ GPS non disponible sur cet appareil', 'error');
      document.getElementById('loaderDetail').textContent = 'GPS non supporté';
      return;
    }

    const askPosition = () => {
      const gpsOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
      navigator.geolocation.getCurrentPosition(
        (position) => this.onGPSSuccess(position),
        (error) => this.handleGPSError(error),
        gpsOptions
      );
      state.watchId = navigator.geolocation.watchPosition(
        (pos) => this.onGPSUpdate(pos),
        (err) => console.warn('⚠️ GPS update:', err),
        gpsOptions
      );
    };

    try {
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((res) => {
          if (res.state === 'denied') {
            this.showToast('❌ Autorisation GPS refusée. Activez-la dans les paramètres.', 'error');
            document.getElementById('loaderDetail').textContent = 'Permission refusée';
            return;
          }
          document.getElementById('loaderDetail').textContent = 'Recherche satellite GPS...';
          askPosition();
        }).catch(() => askPosition());
      } else {
        askPosition();
      }
    } catch {
      askPosition();
    }
  },

  handleGPSError(error) {
    let message = 'Erreur GPS', detail = '';
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Permission GPS refusée';
        detail = 'Activez la géolocalisation dans les paramètres';
        this.showToast('❌ Autorisation GPS refusée', 'error');
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Position GPS indisponible';
        detail = 'Impossible de déterminer votre position';
        this.showToast('❌ GPS indisponible', 'error');
        break;
      case error.TIMEOUT:
        message = 'GPS ne répond pas';
        detail = 'Vérifiez que le GPS est activé';
        this.showToast('⏱️ GPS trop lent, réessayez', 'warning');
        break;
      default:
        this.showToast('❌ Erreur GPS', 'error');
    }
    document.getElementById('loaderText').textContent = message;
    document.getElementById('loaderDetail').textContent = detail;
    setTimeout(() => this.showConfig(), 3000);
  },

  stopGPSTracking() {
    if (state.watchId) {
      navigator.geolocation.clearWatch(state.watchId);
      state.watchId = null;
    }
  },

  onGPSSuccess(position) {
    const { latitude, longitude, accuracy } = position.coords;
    state.currentPosition = { lat: latitude, lng: longitude };
    state.startPosition = { lat: latitude, lng: longitude };
    state.startTime = Date.now();

    document.getElementById('gpsStatus').textContent = 'GPS actif';
    document.getElementById('loaderDetail').textContent = `Précision: ${accuracy.toFixed(0)}m`;

    this.initMap3D();
    this.generateRoute();
  },

  onGPSUpdate(position) {
    const { latitude, longitude, speed, heading } = position.coords;
    state.currentPosition = { lat: latitude, lng: longitude };

    // Distance parcourue
    if (state.lastPosition) {
      const from = turf.point([state.lastPosition.lng, state.lastPosition.lat]);
      const to = turf.point([longitude, latitude]);
      const distance = turf.distance(from, to, { units: 'kilometers' });
      state.distanceTraveled += distance;
    }

    // Direction
    if (heading !== null && heading !== undefined && heading >= 0) {
      state.heading = heading;
    } else if (state.lastPosition) {
      const from = turf.point([state.lastPosition.lng, state.lastPosition.lat]);
      const to = turf.point([longitude, latitude]);
      state.heading = turf.bearing(from, to);
    }

    // Vitesse (m/s -> km/h)
    if (speed !== null && speed >= 0) {
      state.currentSpeed = Math.round(speed * 3.6);
    }

    state.lastPosition = state.currentPosition;
    state.lastPositionTime = Date.now();

    this.updateUI();
    this.updateNavigation();
    this.updateUserMarker3D();
    this.getSpeedLimit(latitude, longitude);
  },

  // ========== CARTE 3D MAPBOX ==========
  initMap3D() {
    console.log('🗺️ Initialisation carte 3D...');
    state.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [state.startPosition.lng, state.startPosition.lat],
      zoom: 17,
      pitch: 60,
      bearing: 0,
      antialias: true
    });

    state.map.on('load', () => {
      // Couche bâtiments 3D
      state.map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      });
    });
  },

  updateUserMarker3D() {
    if (!state.map || !state.currentPosition) return;

    if (state.userMarker) state.userMarker.remove();

    const icon = state.vehicle === 'car' ? '🚗' : '🏍️';
    const el = document.createElement('div');
    el.className = 'user-marker-3d';
    el.innerHTML = icon;
    el.style.fontSize = '36px';
    el.style.transform = `rotate(${state.heading}deg)`;
    el.style.transition = 'transform 0.5s ease';

    state.userMarker = new mapboxgl.Marker(el)
      .setLngLat([state.currentPosition.lng, state.currentPosition.lat])
      .addTo(state.map);

    // Suivi caméra
    state.map.easeTo({
      center: [state.currentPosition.lng, state.currentPosition.lat],
      bearing: state.heading,
      pitch: 60,
      zoom: 17,
      duration: 500
    });
  },

  recenterMap() {
    if (state.currentPosition && state.map) {
      state.map.flyTo({
        center: [state.currentPosition.lng, state.currentPosition.lat],
        bearing: state.heading,
        pitch: 60,
        zoom: 17,
        duration: 1000
      });
      this.showToast('Carte recentrée', 'success');
    }
  },

  // ========== ROUTING (Mapbox Directions API REST) ==========
  async generateRoute() {
    document.getElementById('loaderText').textContent = 'Calcul du parcours...';
    document.getElementById('loaderDetail').textContent = 'Génération itinéraire';

    const waypoints = [state.startPosition];

    state.selectedZones.forEach(zoneId => {
      const zone = CONFIG.ZONES.find(z => z.id === zoneId);
      if (zone) {
        waypoints.push({
          lat: zone.lat + (Math.random() - 0.5) * 0.01,
          lng: zone.lng + (Math.random() - 0.5) * 0.01
        });
      }
    });

    // Retour au point de départ
    waypoints.push(state.startPosition);

    const coordinates = waypoints.map(wp => `${wp.lng},${wp.lat}`).join(';');
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&steps=true&access_token=${mapboxgl.accessToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];

        state.route = route;
        state.totalDistance = route.distance / 1000;
        state.totalDuration = route.duration / 60;
        state.instructions = [];

        // Extraire les instructions
        route.legs.forEach(leg => {
          leg.steps.forEach(step => {
            state.instructions.push({
              text: step.maneuver.instruction,
              distance: step.distance,
              duration: step.duration,
              location: step.maneuver.location
            });
          });
        });

        // Afficher la ligne sur la carte
        const geojson = {
          type: 'Feature',
          geometry: route.geometry,
          properties: {}
        };

        if (state.map.getSource('route')) {
          state.map.getSource('route').setData(geojson);
        } else {
          state.map.addSource('route', { type: 'geojson', data: geojson });
          state.map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#3b82f6', 'line-width': 8, 'line-opacity': 0.9 }
          });
        }

        // Masquer le loader
        document.getElementById('loader').classList.remove('active');

        this.showToast(`✅ Parcours: ${state.totalDistance.toFixed(1)} km`, 'success');
        this.updateNavigation();
        this.updateNextInstructions();
      } else {
        throw new Error('Aucune route trouvée.');
      }
    } catch (error) {
      console.error('❌ Erreur routing:', error);
      this.showToast('Erreur génération parcours', 'error');
      document.getElementById('loader').classList.remove('active');
    }
  },

  // ========== NAVIGATION ==========
  updateNavigation() {
    if (!state.currentPosition || !state.instructions.length) {
      document.getElementById('navDistance').textContent = '--';
      document.getElementById('navStreet').textContent = 'Aucune instruction';
      return;
    }

    let instruction = state.instructions[state.currentInstructionIndex];
    if (!instruction || !instruction.location) return;

    const from = turf.point([state.currentPosition.lng, state.currentPosition.lat]);
    const to = turf.point(instruction.location);
    const distanceM = turf.distance(from, to, { units: 'kilometers' }) * 1000;

    if (distanceM < 30 && state.currentInstructionIndex < state.instructions.length - 1) {
      state.currentInstructionIndex++;
      instruction = state.instructions[state.currentInstructionIndex];
      this.showToast('Nouvelle direction !', 'success');
      this.updateNextInstructions();
    }

    // Distance
    document.getElementById('navDistance').textContent =
      distanceM > 1000 ? `${(distanceM / 1000).toFixed(1)} km` : `${Math.round(distanceM)} m`;

    // Temps estimé simple
    const speed = state.currentSpeed > 0 ? state.currentSpeed : 40;
    const timeMin = (distanceM / 1000) / speed * 60;
    document.getElementById('navTime').textContent = timeMin < 1
      ? `${Math.round(timeMin * 60)} sec`
      : `${Math.round(timeMin)} min`;

    // Instruction + icône
    document.getElementById('navStreet').textContent = instruction.text;
    this.updateDirectionIcon(instruction.text);
  },

  updateDirectionIcon(text) {
    const icon = document.getElementById('navIcon');
    const t = text.toLowerCase();
    if (t.includes('gauche') || t.includes('left')) icon.className = 'fas fa-arrow-left';
    else if (t.includes('droite') || t.includes('right')) icon.className = 'fas fa-arrow-right';
    else if (t.includes('demi-tour') || t.includes('u-turn')) icon.className = 'fas fa-undo';
    else if (t.includes('rond-point') || t.includes('roundabout')) icon.className = 'fas fa-sync';
    else if (t.includes('arrivée') || t.includes('arrived')) {
      icon.className = 'fas fa-flag-checkered';
      setTimeout(() => this.finishDriving(), 2000);
    } else icon.className = 'fas fa-arrow-up';
  },

  updateNextInstructions() {
    const listEl = document.getElementById('nextList');
    listEl.innerHTML = '';

    for (let i = state.currentInstructionIndex + 1; i < Math.min(state.currentInstructionIndex + 6, state.instructions.length); i++) {
      const inst = state.instructions[i];
      if (!inst || !inst.location) continue;

      const from = turf.point([state.currentPosition.lng, state.currentPosition.lat]);
      const to = turf.point(inst.location);
      const distanceM = turf.distance(from, to, { units: 'kilometers' }) * 1000;

      const item = document.createElement('div');
      item.className = 'next-item';
      item.innerHTML = `
        <div class="next-item-icon"><i class="fas fa-arrow-up"></i></div>
        <div class="next-item-info">
          <div class="next-item-distance">${distanceM > 1000 ? (distanceM/1000).toFixed(1) + ' km' : Math.round(distanceM) + ' m'}</div>
          <div class="next-item-text">${inst.text}</div>
        </div>`;
      listEl.appendChild(item);
    }
  },

  toggleInstructions() {
    document.getElementById('nextInstructions').classList.toggle('active');
  },

  // ========== LIMITES DE VITESSE (OSM Overpass) ==========
  async getSpeedLimit(lat, lng) {
    try {
      const radius = 50;
      const query = `[out:json][timeout:3];way(around:${radius},${lat},${lng})["maxspeed"];out body;`;
      const response = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query });
      if (response.ok) {
        const data = await response.json();
        if (data.elements && data.elements.length > 0) {
          const limit = parseInt(data.elements[0].tags.maxspeed, 10);
          if (!isNaN(limit)) {
            state.currentSpeedLimit = limit;
            document.getElementById('speedLimit').textContent = limit;
            return;
          }
        }
      }
    } catch { /* silencieux */ }
    document.getElementById('speedLimit').textContent = CONFIG.DEFAULT_SPEED_LIMIT;
  },

  // ========== UI ==========
  updateUI() {
    document.getElementById('speedValue').textContent = state.currentSpeed;
    if (state.startTime && state.totalDuration > 0) {
      const elapsed = (Date.now() - state.startTime) / 1000 / 60;
      const progress = Math.min(100, (elapsed / state.totalDuration) * 100);

      document.getElementById('statDistance').textContent = `${state.distanceTraveled.toFixed(1)} km`;
      document.getElementById('statTime').textContent = `${Math.round(elapsed)} min`;
      document.getElementById('statQuestions').textContent = `${state.correctAnswers}/${state.totalQuestions}`;
      document.getElementById('progressFill').style.width = `${progress}%`;
      document.getElementById('progressText').textContent = `Progression: ${Math.round(progress)}%`;

      if (elapsed >= state.totalDuration) this.finishDriving();
    }
  },

  toggleStats() {
    document.getElementById('statsPanel').classList.toggle('active');
  },

  // ========== QUESTIONS ==========
  showQuestion(question) {
    state.askedQuestions.push(question.q);
    state.totalQuestions++;

    document.getElementById('questionText').textContent = question.q;
    const grid = document.getElementById('answersGrid');
    grid.innerHTML = '';
    document.getElementById('btnContinue').classList.remove('active');

    question.a.forEach((answer, index) => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = answer;
      btn.onclick = () => this.selectAnswer(btn, index, question.correct);
      grid.appendChild(btn);
    });

    document.getElementById('questionModal').classList.add('active');
  },

  selectAnswer(button, index, correctIndex) {
    document.querySelectorAll('.answer-btn').forEach(btn => {
      btn.onclick = null;
      btn.classList.add('disabled');
    });

    if (index === correctIndex) {
      button.classList.add('correct');
      state.correctAnswers++;
      this.showToast('Bonne réponse ! 👍', 'success');
    } else {
      button.classList.add('incorrect');
      document.querySelectorAll('.answer-btn')[correctIndex].classList.add('correct');
      this.showToast('Réponse incorrecte', 'error');
    }

    document.getElementById('btnContinue').classList.add('active');
    this.updateUI();
  },

  closeQuestion() {
    document.getElementById('questionModal').classList.remove('active');
  },

  // ========== DÉMARRAGE/ARRÊT ==========
  startDriving() {
    if (state.selectedZones.length < 2) {
      this.showToast('❌ Sélectionnez au moins 2 zones', 'warning');
      return;
    }

    // Reset
    Object.assign(state, {
      currentPosition: null,
      startPosition: null,
      startTime: null,
      route: null,
      instructions: [],
      currentInstructionIndex: 0,
      totalDistance: 0,
      totalDuration: 0,
      distanceTraveled: 0,
      askedQuestions: [],
      correctAnswers: 0,
      totalQuestions: 0,
      currentSpeed: 0,
      heading: 0
    });

    this.showDriving();
    document.getElementById('loader').classList.add('active');
    setTimeout(() => this.startGPSTracking(), 500);
  },

  stopDriving() {
    if (confirm('❓ Arrêter le parcours ?')) this.finishDriving();
  },

  finishDriving() {
    this.stopGPSTracking();
    const totalTime = state.startTime ? Math.round((Date.now() - state.startTime) / 1000 / 60) : 0;
    document.getElementById('finalDistance').textContent = `${state.distanceTraveled.toFixed(1)} km`;
    document.getElementById('finalTime').textContent = `${totalTime} min`;
    document.getElementById('finalQuestions').textContent = `${state.correctAnswers}/${state.totalQuestions}`;
    document.getElementById('finishModal').classList.add('active');
  },

  newRoute() {
    document.getElementById('finishModal').classList.remove('active');
    setTimeout(() => this.showConfig(), 300);
  },

  // ========== UTIL ==========
  showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-info-circle' };
    toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

/* ==================== DÉMARRAGE ==================== */

document.addEventListener('DOMContentLoaded', () => {
  // attendre un instant que Mapbox/Turf soient prêts
  setTimeout(() => {
    if (typeof mapboxgl !== 'undefined' && typeof turf !== 'undefined') {
      window.app = app; // rendre global pour les onclick du HTML
      app.init();
    } else {
      console.error('❌ Librairies manquantes');
      alert('Erreur de chargement. Rechargez la page.');
    }
  }, 100);
});
