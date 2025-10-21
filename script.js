/* ==================== CONFIGURATION ==================== */

if (typeof mapboxgl === 'undefined') {
  console.error('❌ Mapbox GL JS non chargé !');
  alert('Erreur : Mapbox GL JS non chargé. Vérifiez votre connexion internet.');
}
if (typeof turf === 'undefined') {
  console.error('❌ Turf.js non chargé !');
  alert('Erreur : Turf.js non chargé. Vérifiez votre connexion internet.');
}

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

  DEFAULT_SPEED_LIMIT: 50,
  
  CAMERA: {
    MIN_ZOOM: 17.5,
    MAX_ZOOM: 19,
    BASE_ZOOM: 18,
    PITCH: 0,
    SPEED_ZOOM_FACTOR: 0.005,
    LOOK_AHEAD_DISTANCE: 50,
    PREVIEW_ZOOM: 15,
    PREVIEW_PITCH: 60
  },
  
  // 🌓 Styles jour/nuit
  MAP_STYLES: {
    day: 'mapbox://styles/mapbox/streets-v12',
    night: 'mapbox://styles/mapbox/dark-v11'
  }
};

/* ==================== TRADUCTION ==================== */

const TRANSLATION_DICT = {
  'left': 'gauche', 'right': 'droite', 'straight': 'tout droit',
  'slight': 'légèrement', 'sharp': 'fortement', 'turn': 'tourner',
  'roundabout': 'rond-point', 'rotary': 'rond-point', 'u-turn': 'demi-tour',
  'merge': 's\'insérer', 'ramp': 'bretelle', 'fork': 'bifurcation',
  'continue': 'continuer', 'proceed': 'continuer', 'head': 'se diriger',
  'take': 'prendre', 'exit': 'sortie', 'arrive': 'arriver',
  'destination': 'destination', 'the': 'la', 'on': 'sur', 'onto': 'sur',
  'toward': 'vers', 'towards': 'vers', 'at': 'à', 'in': 'dans',
  'meters': 'mètres', 'kilometers': 'kilomètres',
  'you have arrived': 'vous êtes arrivé', 'your destination': 'votre destination'
};

function detectLanguage(text) {
  const frenchWords = ['gauche', 'droite', 'tout', 'droit', 'tourner', 'rond-point', 'demi-tour', 'continuer', 'arriver', 'vers', 'sur', 'dans'];
  const lowerText = text.toLowerCase();
  return frenchWords.some(word => lowerText.includes(word)) ? 'fr' : 'en';
}

function translateIfNeeded(instruction) {
  if (!instruction) return instruction;
  if (detectLanguage(instruction) === 'fr') return instruction;
  
  let translated = instruction;
  Object.keys(TRANSLATION_DICT).forEach(en => {
    const fr = TRANSLATION_DICT[en];
    const regex = new RegExp('\\b' + en + '\\b', 'gi');
    translated = translated.replace(regex, fr);
  });
  return translated;
}

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatTime(minutes) {
  if (minutes < 1) return `${Math.round(minutes * 60)} sec`;
  return `${Math.round(minutes)} min`;
}

/* ==================== 📢 SYNTHÈSE VOCALE ==================== */

const voiceSystem = {
  enabled: true,
  synthesis: window.speechSynthesis,
  lastAnnouncement: null,
  
  speak(text, priority = 'normal') {
    if (!this.enabled || !this.synthesis) return;
    
    // Éviter répétitions
    if (this.lastAnnouncement === text && Date.now() - this.lastAnnouncementTime < 5000) {
      return;
    }
    
    // Annuler si parole en cours pour priorité haute
    if (priority === 'high') {
      this.synthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    this.synthesis.speak(utterance);
    this.lastAnnouncement = text;
    this.lastAnnouncementTime = Date.now();
  },
  
  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.synthesis.cancel();
    }
    return this.enabled;
  }
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
  routeGeometry: null,
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
  userMarker: null,
  use3D: false,
  isPreviewMode: true,
  navigationStarted: false,
  gpsRetries: 0,
  
  // 📊 Statistiques avancées
  stats: {
    maxSpeed: 0,
    avgSpeed: 0,
    speedSum: 0,
    speedCount: 0,
    speedViolations: [],
    harshBrakings: 0,
    lastSpeed: 0,
    score: 100
  },
  
  // 🌓 Mode nuit
  isDarkMode: false,
  
  // 👨‍🏫 Mode accompagnateur
  supervisorNotes: {
    positive: [],
    negative: [],
    general: ''
  }
};

/* ==================== 📝 HISTORIQUE PARCOURS ==================== */

const historyManager = {
  save(data) {
    try {
      const history = this.getAll();
      history.unshift({
        id: Date.now(),
        date: new Date().toISOString(),
        ...data
      });
      
      // Garder max 50 parcours
      if (history.length > 50) history.pop();
      
      localStorage.setItem('driveLyonHistory', JSON.stringify(history));
      console.log('✅ Parcours sauvegardé');
    } catch (e) {
      console.error('❌ Erreur sauvegarde:', e);
    }
  },
  
  getAll() {
    try {
      const data = localStorage.getItem('driveLyonHistory');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  
  clear() {
    localStorage.removeItem('driveLyonHistory');
  },
  
  export() {
    const history = this.getAll();
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drive-lyon-history-${Date.now()}.json`;
    a.click();
  }
};

/* ==================== 🌓 GESTION JOUR/NUIT ==================== */

const themeManager = {
  isDarkMode() {
    const hour = new Date().getHours();
    return hour >= 19 || hour < 7;
  },
  
  apply(map, forceDark = null) {
    const dark = forceDark !== null ? forceDark : this.isDarkMode();
    const style = dark ? CONFIG.MAP_STYLES.night : CONFIG.MAP_STYLES.day;
    
    if (map) {
      map.setStyle(style);
      console.log(`🌓 Style: ${dark ? 'Nuit' : 'Jour'}`);
    }
    
    return dark;
  },
  
  toggle(map) {
    state.isDarkMode = !state.isDarkMode;
    this.apply(map, state.isDarkMode);
    return state.isDarkMode;
  }
};

/* ==================== APPLICATION ==================== */

const app = {
  lastRouteUpdateLog: null,
  lastRecalculation: null,
  speedLimitErrors: 0,
  lastSpeedLimitCheck: null,
  lastVoiceInstruction: null,
  
  init() {
    console.log('🚗 Drive Lyon - Version Complète');
    
    if (typeof THREE !== 'undefined') {
      state.use3D = true;
      console.log('✅ Three.js détecté');
    }
    
    this.renderZones();
    this.setupSlider();
    this.checkVoiceSupport();
    
    // Détecter mode nuit automatiquement
    state.isDarkMode = themeManager.isDarkMode();
  },
  
  checkVoiceSupport() {
    if (!window.speechSynthesis) {
      console.warn('⚠️ Synthèse vocale non supportée');
      voiceSystem.enabled = false;
    } else {
      console.log('✅ Synthèse vocale disponible');
    }
  },

  // ========== ÉCRANS ==========
  showHome() {
    this.hideAllScreens();
    document.getElementById('homeScreen').classList.add('active');
    this.stopGPSTracking();
    this.cleanupMap();
    document.getElementById('finishModal').classList.remove('active');
    document.getElementById('questionModal').classList.remove('active');
    
    // Fermer panneau accompagnateur
    const supervisorPanel = document.getElementById('supervisorPanel');
    if (supervisorPanel) supervisorPanel.classList.remove('active');
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
    console.log('📍 Démarrage GPS...');
    document.getElementById('loaderText').textContent = 'Activation GPS...';
    document.getElementById('loaderDetail').textContent = 'Autorisation requise';

    if (!navigator.geolocation) {
      this.showToast('❌ GPS non disponible', 'error');
      return;
    }

    const askPosition = () => {
      const gpsOptions = { 
        enableHighAccuracy: true, 
        timeout: 30000,
        maximumAge: 5000
      };
      
      navigator.geolocation.getCurrentPosition(
        (position) => this.onGPSSuccess(position),
        (error) => this.handleGPSError(error),
        gpsOptions
      );
      
      state.watchId = navigator.geolocation.watchPosition(
        (pos) => this.onGPSUpdate(pos),
        (err) => {
          if (err.code !== 3) console.warn('⚠️ GPS update:', err);
        },
        gpsOptions
      );
    };

    try {
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((res) => {
          if (res.state === 'denied') {
            this.showToast('❌ Autorisation GPS refusée', 'error');
            return;
          }
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
        this.showToast('❌ Autorisation GPS refusée', 'error');
        setTimeout(() => this.showConfig(), 3000);
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Position GPS indisponible';
        this.showToast('❌ GPS indisponible', 'error');
        setTimeout(() => this.showConfig(), 3000);
        break;
      case error.TIMEOUT:
        state.gpsRetries++;
        if (state.gpsRetries > 3) {
          this.showToast('❌ Signal GPS trop faible', 'error');
          setTimeout(() => this.showConfig(), 3000);
          return;
        }
        message = `GPS ne répond pas (${state.gpsRetries}/3)`;
        this.showToast(`⏱️ Tentative ${state.gpsRetries}/3...`, 'warning');
        setTimeout(() => this.startGPSTracking(), 3000);
        break;
      default:
        this.showToast('❌ Erreur GPS', 'error');
        setTimeout(() => this.showConfig(), 3000);
    }
    
    document.getElementById('loaderText').textContent = message;
    document.getElementById('loaderDetail').textContent = detail;
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
    state.gpsRetries = 0;

    console.log('✅ GPS Position acquise:', latitude.toFixed(6), longitude.toFixed(6));
    console.log('🎯 Précision:', accuracy.toFixed(0) + 'm');
    
    document.getElementById('gpsStatus').textContent = 'GPS actif';
    
    voiceSystem.speak('GPS activé, génération du parcours');

    this.initMap3D();
    this.generateRoute();
  },

  onGPSUpdate(position) {
    const { latitude, longitude, speed, heading } = position.coords;
    state.currentPosition = { lat: latitude, lng: longitude };

    if (state.lastPosition) {
      const from = turf.point([state.lastPosition.lng, state.lastPosition.lat]);
      const to = turf.point([longitude, latitude]);
      const distance = turf.distance(from, to, { units: 'kilometers' });
      state.distanceTraveled += distance;
    }

    if (heading !== null && heading !== undefined && heading >= 0) {
      state.heading = heading;
    } else if (state.lastPosition) {
      const from = turf.point([state.lastPosition.lng, state.lastPosition.lat]);
      const to = turf.point([longitude, latitude]);
      state.heading = turf.bearing(from, to);
    }

    if (speed !== null && speed >= 0) {
      const newSpeed = Math.round(speed * 3.6);
      
      // 📊 Stats: Détecter freinage brusque
      if (state.stats.lastSpeed > 0 && newSpeed < state.stats.lastSpeed - 15) {
        state.stats.harshBrakings++;
        console.log('⚠️ Freinage brusque détecté');
        voiceSystem.speak('Attention au freinage', 'high');
      }
      
      state.currentSpeed = newSpeed;
      state.stats.lastSpeed = newSpeed;
      
      // 📊 Stats moyennes
      state.stats.speedSum += newSpeed;
      state.stats.speedCount++;
      state.stats.avgSpeed = Math.round(state.stats.speedSum / state.stats.speedCount);
      
      if (newSpeed > state.stats.maxSpeed) {
        state.stats.maxSpeed = newSpeed;
      }
      
      // ⚠️ Dépassement vitesse
      if (newSpeed > state.currentSpeedLimit) {
        const excess = newSpeed - state.currentSpeedLimit;
        state.stats.speedViolations.push({
          time: Date.now(),
          speed: newSpeed,
          limit: state.currentSpeedLimit,
          excess: excess
        });
        
        if (excess >= 10 && (!this.lastSpeedWarning || Date.now() - this.lastSpeedWarning > 10000)) {
          voiceSystem.speak(`Attention, vous dépassez de ${excess} kilomètres heure`, 'high');
          this.lastSpeedWarning = Date.now();
        }
      }
    }

    state.lastPosition = state.currentPosition;
    state.lastPositionTime = Date.now();

    if (state.navigationStarted) {
      this.checkRouteDeviation();
      this.updateUI();
      this.updateNavigation();
      this.updateCamera3D();
      this.updateUserMarker();
      this.updateVisibleRoute();
      this.checkProximityAlerts();
      
      if (!this.lastSpeedLimitCheck || Date.now() - this.lastSpeedLimitCheck > 10000) {
        this.getSpeedLimit(latitude, longitude);
        this.lastSpeedLimitCheck = Date.now();
      }
    }
  },

  // ⚠️ Alertes de proximité
  checkProximityAlerts() {
    if (!state.instructions.length || state.currentInstructionIndex >= state.instructions.length) return;
    
    const instruction = state.instructions[state.currentInstructionIndex];
    if (!instruction || !instruction.location) return;
    
    const from = turf.point([state.currentPosition.lng, state.currentPosition.lat]);
    const to = turf.point(instruction.location);
    const distanceM = turf.distance(from, to, { units: 'meters' });
    
    // Annonce vocale des directions
    if (distanceM < 200 && distanceM > 150) {
      if (!this.lastVoiceInstruction || this.lastVoiceInstruction !== state.currentInstructionIndex) {
        voiceSystem.speak(`Dans ${Math.round(distanceM)} mètres, ${instruction.text}`);
        this.lastVoiceInstruction = state.currentInstructionIndex;
      }
    } else if (distanceM < 50) {
      if (this.lastVoiceInstruction === state.currentInstructionIndex) {
        voiceSystem.speak(instruction.text, 'high');
        this.lastVoiceInstruction = null;
      }
    }
  },

  checkRouteDeviation() {
    if (!state.currentPosition || !state.routeGeometry) return;
    
    try {
      const currentPoint = turf.point([state.currentPosition.lng, state.currentPosition.lat]);
      const routeLine = turf.lineString(state.routeGeometry.coordinates);
      
      const nearestPoint = turf.nearestPointOnLine(routeLine, currentPoint);
      const distanceFromRoute = turf.distance(currentPoint, nearestPoint, { units: 'meters' });
      
      if (distanceFromRoute > 50) {
        if (!this.lastRecalculation || Date.now() - this.lastRecalculation > 10000) {
          console.log('🔄 Déviation détectée:', distanceFromRoute.toFixed(0) + 'm');
          this.showToast('🔄 Recalcul de l\'itinéraire...', 'warning');
          voiceSystem.speak('Recalcul de l\'itinéraire');
          this.lastRecalculation = Date.now();
          setTimeout(() => this.recalculateRoute(), 1000);
        }
      }
    } catch (error) {
      console.warn('⚠️ Erreur checkRouteDeviation:', error);
    }
  },

  async recalculateRoute() {
    if (!state.currentPosition || state.selectedZones.length === 0) return;
    
    const waypoints = [state.currentPosition];
    
    state.selectedZones.forEach(zoneId => {
      const zone = CONFIG.ZONES.find(z => z.id === zoneId);
      if (zone) {
        waypoints.push({
          lat: zone.lat + (Math.random() - 0.5) * 0.01,
          lng: zone.lng + (Math.random() - 0.5) * 0.01
        });
      }
    });
    
    if (state.startPosition) waypoints.push(state.startPosition);
    
    const coordinates = waypoints.map(wp => `${wp.lng},${wp.lat}`).join(';');
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&steps=true&language=fr&voice_units=metric&access_token=${mapboxgl.accessToken}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        state.route = route;
        state.routeGeometry = route.geometry;
        state.totalDistance = route.distance / 1000;
        state.totalDuration = route.duration / 60;
        state.instructions = [];
        
        route.legs.forEach(leg => {
          leg.steps.forEach(step => {
            const instruction = translateIfNeeded(step.maneuver.instruction);
            const streetName = step.name || step.ref || '';
            state.instructions.push({
              text: instruction,
              street: streetName,
              distance: step.distance,
              duration: step.duration,
              location: step.maneuver.location
            });
          });
        });
        
        state.currentInstructionIndex = 0;
        this.updateVisibleRoute();
        this.updateNavigation();
        this.showToast('✅ Nouvel itinéraire calculé', 'success');
      }
    } catch (error) {
      console.error('❌ Erreur recalcul:', error);
    }
  },

  // ========== CARTE MAPBOX ==========
  initMap3D() {
    console.log('🗺️ Initialisation carte...');
    
    const mapStyle = state.isDarkMode ? CONFIG.MAP_STYLES.night : CONFIG.MAP_STYLES.day;
    
    state.map = new mapboxgl.Map({
      container: 'map',
      style: mapStyle,
      center: [state.startPosition.lng, state.startPosition.lat],
      zoom: CONFIG.CAMERA.BASE_ZOOM,
      pitch: CONFIG.CAMERA.PREVIEW_PITCH,
      bearing: 0,
      antialias: true,
      maxPitch: 60
    });

    state.map.on('load', () => {
      console.log('✅ Carte chargée');
      
      state.map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'height']],
          'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'min_height']],
          'fill-extrusion-opacity': 0.6
        }
      });
    });
  },

  updateUserMarker() {
    if (!state.map || !state.currentPosition || !state.navigationStarted) return;

    if (state.userMarker) state.userMarker.remove();

    let markerRotation = 0;
    
    if (state.instructions.length > 0 && state.currentInstructionIndex < state.instructions.length) {
      const nextInstruction = state.instructions[state.currentInstructionIndex];
      if (nextInstruction && nextInstruction.location) {
        const currentPoint = turf.point([state.currentPosition.lng, state.currentPosition.lat]);
        const targetPoint = turf.point(nextInstruction.location);
        markerRotation = turf.bearing(currentPoint, targetPoint);
      }
    }

    const icon = state.vehicle === 'car' ? '🚗' : '🏍️';
    const el = document.createElement('div');
    el.className = 'user-marker-2d';
    el.innerHTML = icon;
    el.style.fontSize = '40px';
    el.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.7))';

    state.userMarker = new mapboxgl.Marker({ 
      element: el, 
      anchor: 'center',
      rotation: markerRotation,
      rotationAlignment: 'map'
    })
      .setLngLat([state.currentPosition.lng, state.currentPosition.lat])
      .addTo(state.map);
  },

  updateCamera3D() {
    if (!state.map || !state.currentPosition || !state.navigationStarted) return;

    let targetBearing = state.heading;
    
    if (state.instructions.length > 0 && state.currentInstructionIndex < state.instructions.length) {
      const nextInstruction = state.instructions[state.currentInstructionIndex];
      if (nextInstruction && nextInstruction.location) {
        const currentPoint = turf.point([state.currentPosition.lng, state.currentPosition.lat]);
        const targetPoint = turf.point(nextInstruction.location);
        targetBearing = turf.bearing(currentPoint, targetPoint);
      }
    }

    const lookAheadDistance = CONFIG.CAMERA.LOOK_AHEAD_DISTANCE / 1000;
    const currentPoint = turf.point([state.currentPosition.lng, state.currentPosition.lat]);
    const targetPoint = turf.destination(currentPoint, lookAheadDistance, targetBearing, { units: 'kilometers' });
    const targetCoords = targetPoint.geometry.coordinates;

    const speedFactor = Math.min(state.currentSpeed * CONFIG.CAMERA.SPEED_ZOOM_FACTOR, 1);
    const dynamicZoom = Math.max(
      CONFIG.CAMERA.MIN_ZOOM,
      Math.min(CONFIG.CAMERA.MAX_ZOOM, CONFIG.CAMERA.BASE_ZOOM - speedFactor)
    );

    state.map.easeTo({
      center: targetCoords,
      bearing: targetBearing,
      pitch: CONFIG.CAMERA.PITCH,
      zoom: dynamicZoom,
      duration: 500,
      easing: (t) => t * (2 - t)
    });
  },

  updateVisibleRoute() {
    if (!state.map || !state.routeGeometry || !state.currentPosition || !state.navigationStarted) return;

    try {
      const currentPoint = turf.point([state.currentPosition.lng, state.currentPosition.lat]);
      const routeCoords = state.routeGeometry.coordinates;
      
      let closestIndex = 0;
      let minDistance = Infinity;
      
      for (let i = 0; i < routeCoords.length; i++) {
        const routePoint = turf.point(routeCoords[i]);
        const distance = turf.distance(currentPoint, routePoint, { units: 'meters' });
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }
      
      const LOOK_AHEAD_DISTANCE = 300;
      let targetIndex = routeCoords.length - 1;
      let accumulatedDistance = 0;
      
      for (let i = closestIndex; i < routeCoords.length - 1; i++) {
        const point1 = turf.point(routeCoords[i]);
        const point2 = turf.point(routeCoords[i + 1]);
        const segmentDistance = turf.distance(point1, point2, { units: 'meters' });
        accumulatedDistance += segmentDistance;
        
        if (accumulatedDistance >= LOOK_AHEAD_DISTANCE) {
          targetIndex = i + 1;
          break;
        }
      }
      
      if (state.instructions.length > 0 && state.currentInstructionIndex < state.instructions.length) {
        const nextInstruction = state.instructions[state.currentInstructionIndex];
        if (nextInstruction && nextInstruction.location) {
          const targetPoint = turf.point(nextInstruction.location);
          let instructionIndex = targetIndex;
          let minDistToTarget = Infinity;
          
          for (let i = closestIndex; i < routeCoords.length; i++) {
            const routePoint = turf.point(routeCoords[i]);
            const distToTarget = turf.distance(targetPoint, routePoint, { units: 'meters' });
            
            if (distToTarget < minDistToTarget) {
              minDistToTarget = distToTarget;
              instructionIndex = i;
            }
            
            if (distToTarget > minDistToTarget + 50) break;
          }
          
          targetIndex = Math.max(targetIndex, instructionIndex + 20);
        }
      }
      
      targetIndex = Math.min(targetIndex, routeCoords.length - 1);
      const forwardCoords = routeCoords.slice(closestIndex, targetIndex + 1);
      
      if (forwardCoords.length > 0) {
        const visibleCoords = [
          [state.currentPosition.lng, state.currentPosition.lat],
          ...forwardCoords
        ];
        
        if (visibleCoords.length >= 2) {
          const newGeometry = {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: visibleCoords },
            properties: {}
          };
          
          const source = state.map.getSource('route');
          if (source) source.setData(newGeometry);
          
          if (!this.lastRouteUpdateLog || Date.now() - this.lastRouteUpdateLog > 5000) {
            const percentComplete = Math.round((closestIndex / routeCoords.length) * 100);
            console.log(`✂️ Route: ${forwardCoords.length} pts | ${closestIndex}/${routeCoords.length} (${percentComplete}%)`);
            this.lastRouteUpdateLog = Date.now();
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur updateVisibleRoute:', error);
    }
  },

  recenterMap() {
    if (!state.currentPosition || !state.map) return;
    
    if (!state.navigationStarted) {
      if (state.routeGeometry) {
        const coordinates = state.routeGeometry.coordinates;
        const bounds = coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

        state.map.fitBounds(bounds, {
          padding: { top: 100, bottom: 200, left: 50, right: 50 },
          pitch: CONFIG.CAMERA.PREVIEW_PITCH,
          duration: 1200
        });
      }
      this.showToast('Vue recentrée', 'success');
      return;
    }
    
    let targetBearing = state.heading || 0;
    
    if (state.instructions.length > 0 && state.currentInstructionIndex < state.instructions.length) {
      const nextInstruction = state.instructions[state.currentInstructionIndex];
      if (nextInstruction && nextInstruction.location) {
        const currentPoint = turf.point([state.currentPosition.lng, state.currentPosition.lat]);
        const targetPoint = turf.point(nextInstruction.location);
        targetBearing = turf.bearing(currentPoint, targetPoint);
      }
    }
    
    const lookAheadDistance = CONFIG.CAMERA.LOOK_AHEAD_DISTANCE / 1000;
    const currentPoint = turf.point([state.currentPosition.lng, state.currentPosition.lat]);
    const targetPoint = turf.destination(currentPoint, lookAheadDistance, targetBearing, { units: 'kilometers' });
    
    state.map.flyTo({
      center: targetPoint.geometry.coordinates,
      bearing: targetBearing,
      pitch: CONFIG.CAMERA.PITCH,
      zoom: CONFIG.CAMERA.BASE_ZOOM,
      duration: 1500,
      essential: true
    });
    
    this.showToast('🗺️ Vue recentrée', 'success');
  },

  // ========== ROUTING ==========
  async generateRoute() {
    document.getElementById('loaderText').textContent = 'Calcul du parcours...';

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

    waypoints.push(state.startPosition);

    const coordinates = waypoints.map(wp => `${wp.lng},${wp.lat}`).join(';');
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&steps=true&language=fr&voice_units=metric&access_token=${mapboxgl.accessToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        state.route = route;
        state.routeGeometry = route.geometry;
        state.totalDistance = route.distance / 1000;
        state.totalDuration = route.duration / 60;
        state.instructions = [];

        route.legs.forEach(leg => {
          leg.steps.forEach(step => {
            const instruction = translateIfNeeded(step.maneuver.instruction);
            const streetName = step.name || step.ref || '';
            state.instructions.push({
              text: instruction,
              street: streetName,
              distance: step.distance,
              duration: step.duration,
              location: step.maneuver.location
            });
          });
        });

        console.log('✅ Route:', route.geometry.coordinates.length, 'points');

        state.isPreviewMode = true;
        this.drawRoute(route.geometry);
        document.getElementById('loader').classList.remove('active');
        this.showPreviewControls();
        
        voiceSystem.speak(`Parcours calculé, ${state.totalDistance.toFixed(1)} kilomètres`);
        this.showToast(`✅ Parcours: ${state.totalDistance.toFixed(1)} km`, 'success');
      } else {
        throw new Error('Aucune route trouvée');
      }
    } catch (error) {
      console.error('❌ Erreur routing:', error);
      this.showToast('Erreur génération parcours', 'error');
      document.getElementById('loader').classList.remove('active');
    }
  },

  showPreviewControls() {
    document.querySelector('.nav-card').style.display = 'none';
    document.querySelector('.speed-widget').style.display = 'none';
    document.querySelector('.action-buttons').style.display = 'none';
    
    const existingBtn = document.getElementById('startNavigationBtn');
    if (existingBtn) existingBtn.remove();
    
    const btn = document.createElement('button');
    btn.id = 'startNavigationBtn';
    btn.className = 'btn-start-navigation';
    btn.innerHTML = '<i class="fas fa-play"></i><span>Commencer la navigation</span>';
    btn.onclick = () => this.startNavigation();
    
    document.getElementById('drivingScreen').appendChild(btn);
  },

  startNavigation() {
    console.log('🚀 Démarrage navigation');
    
    const btn = document.getElementById('startNavigationBtn');
    if (btn) btn.remove();
    
    document.querySelector('.nav-card').style.display = 'flex';
    document.querySelector('.speed-widget').style.display = 'flex';
    document.querySelector('.action-buttons').style.display = 'flex';
    
    state.isPreviewMode = false;
    state.navigationStarted = true;
    state.startTime = Date.now();
    
    // Réinitialiser stats
    state.stats = {
      maxSpeed: 0,
      avgSpeed: 0,
      speedSum: 0,
      speedCount: 0,
      speedViolations: [],
      harshBrakings: 0,
      lastSpeed: 0,
      score: 100
    };
    
    if (state.map && state.map.getLayer('3d-buildings')) {
      state.map.setLayoutProperty('3d-buildings', 'visibility', 'none');
    }
    
    this.updateNavigation();
    this.updateNextInstructions();
    
    if (state.currentPosition && state.routeGeometry) {
      this.updateVisibleRoute();
    }
    
    setTimeout(() => this.transitionToFirstPersonView(), 100);
    
    voiceSystem.speak('Navigation démarrée');
    this.showToast('🗺️ Navigation démarrée !', 'success');
  },

  transitionToFirstPersonView() {
    if (!state.map || !state.currentPosition) return;
    
    let targetBearing = state.heading || 0;
    
    if (state.instructions.length > 0 && state.instructions[0]) {
      const nextInstruction = state.instructions[0];
      if (nextInstruction && nextInstruction.location) {
        const currentPoint = turf.point([state.currentPosition.lng, state.currentPosition.lat]);
        const targetPoint = turf.point(nextInstruction.location);
        targetBearing = turf.bearing(currentPoint, targetPoint);
      }
    }
    
    const lookAheadDistance = CONFIG.CAMERA.LOOK_AHEAD_DISTANCE / 1000;
    const currentPoint = turf.point([state.currentPosition.lng, state.currentPosition.lat]);
    const targetPoint = turf.destination(currentPoint, lookAheadDistance, targetBearing, { units: 'kilometers' });
    
    state.map.flyTo({
      center: targetPoint.geometry.coordinates,
      zoom: CONFIG.CAMERA.BASE_ZOOM,
      pitch: CONFIG.CAMERA.PITCH,
      bearing: targetBearing,
      duration: 2000,
      essential: true
    });
    
    setTimeout(() => this.updateUserMarker(), 500);
  },

  drawRoute(geometry) {
    if (!state.map) return;

    const geojson = { type: 'Feature', geometry: geometry, properties: {} };

    if (state.map.getLayer('route-center')) state.map.removeLayer('route-center');
    if (state.map.getLayer('route')) state.map.removeLayer('route');
    if (state.map.getLayer('route-outline')) state.map.removeLayer('route-outline');
    if (state.map.getSource('route')) state.map.removeSource('route');

    state.map.addSource('route', { type: 'geojson', data: geojson, lineMetrics: true });

    state.map.addLayer({
      id: 'route-outline',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#0c2461', 'line-width': 16, 'line-opacity': 0.5, 'line-blur': 4 }
    });

    state.map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#2563eb', 'line-width': 12, 'line-opacity': 0.95 }
    });

    state.map.addLayer({
      id: 'route-center',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#60a5fa', 'line-width': 6, 'line-opacity': 1 }
    });

    if (state.isPreviewMode) {
      const coordinates = geometry.coordinates;
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      state.map.fitBounds(bounds, {
        padding: { top: 100, bottom: 200, left: 50, right: 50 },
        pitch: CONFIG.CAMERA.PREVIEW_PITCH,
        duration: 2000
      });
    }
  },

  // ========== NAVIGATION ==========
  updateNavigation() {
    if (!state.currentPosition || !state.instructions.length || !state.navigationStarted) {
      if (!state.navigationStarted) return;
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

    document.getElementById('navDistance').textContent = formatDistance(distanceM);

    const speed = state.currentSpeed > 0 ? state.currentSpeed : 40;
    const timeMin = (distanceM / 1000) / speed * 60;
    document.getElementById('navTime').textContent = formatTime(timeMin);

    const streetInfo = instruction.street ? ` - ${instruction.street}` : '';
    document.getElementById('navStreet').textContent = instruction.text + streetInfo;
    
    this.updateDirectionIcon(instruction.text);
  },

  updateDirectionIcon(text) {
    const icon = document.getElementById('navIcon');
    const t = text.toLowerCase();
    
    if (t.includes('gauche')) {
      icon.className = 'fas fa-arrow-left';
    } else if (t.includes('droite')) {
      icon.className = 'fas fa-arrow-right';
    } else if (t.includes('demi-tour')) {
      icon.className = 'fas fa-undo';
    } else if (t.includes('rond-point')) {
      icon.className = 'fas fa-sync';
    } else if (t.includes('arrivée') || t.includes('arrivé') || t.includes('destination')) {
      icon.className = 'fas fa-flag-checkered';
      setTimeout(() => this.finishDriving(), 2000);
    } else if (t.includes('tout droit') || t.includes('continuer')) {
      icon.className = 'fas fa-arrow-up';
    } else {
      icon.className = 'fas fa-arrow-up';
    }
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
          <div class="next-item-distance">${formatDistance(distanceM)}</div>
          <div class="next-item-text">${inst.text}</div>
        </div>`;
      listEl.appendChild(item);
    }
  },

  toggleInstructions() {
    document.getElementById('nextInstructions').classList.toggle('active');
  },

  // ========== LIMITES VITESSE ==========
  async getSpeedLimit(lat, lng) {
    if (this.speedLimitErrors > 3) return;
    
    try {
      const radius = 50;
      const query = `[out:json][timeout:5];way(around:${radius},${lat},${lng})["maxspeed"];out body;`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://overpass-api.de/api/interpreter', { 
        method: 'POST', 
        body: query,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
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
    } catch (error) {
      if (!this.speedLimitErrors) this.speedLimitErrors = 0;
      this.speedLimitErrors++;
    }
    
    document.getElementById('speedLimit').textContent = CONFIG.DEFAULT_SPEED_LIMIT;
  },

  // ========== UI ==========
  updateUI() {
    if (!state.navigationStarted) return;
    
    document.getElementById('speedValue').textContent = state.currentSpeed;
    
    if (state.startTime && state.totalDuration > 0) {
      const elapsed = (Date.now() - state.startTime) / 1000 / 60;
      const progress = Math.min(100, (elapsed / state.totalDuration) * 100);

      document.getElementById('statDistance').textContent = `${state.distanceTraveled.toFixed(1)} km`;
      document.getElementById('statTime').textContent = `${Math.round(elapsed)} min`;
      document.getElementById('statQuestions').textContent = `${state.correctAnswers}/${state.totalQuestions}`;
      
      // 📊 Stats avancées
      const statsAdvEl = document.getElementById('statsAdvanced');
      if (statsAdvEl) {
        statsAdvEl.innerHTML = `
          <div class="stat-advanced">
            <i class="fas fa-tachometer-alt"></i>
            <div>
              <strong>${state.stats.avgSpeed} km/h</strong>
              <span>Vitesse moyenne</span>
            </div>
          </div>
          <div class="stat-advanced">
            <i class="fas fa-rocket"></i>
            <div>
              <strong>${state.stats.maxSpeed} km/h</strong>
              <span>Vitesse max</span>
            </div>
          </div>
          <div class="stat-advanced">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
              <strong>${state.stats.speedViolations.length}</strong>
              <span>Dépassements</span>
            </div>
          </div>
          <div class="stat-advanced">
            <i class="fas fa-hand-paper"></i>
            <div>
              <strong>${state.stats.harshBrakings}</strong>
              <span>Freinages brusques</span>
            </div>
          </div>
        `;
      }
      
      document.getElementById('progressFill').style.width = `${progress}%`;
      document.getElementById('progressText').textContent = `Progression: ${Math.round(progress)}%`;

      if (elapsed >= state.totalDuration) this.finishDriving();
    }
  },

  toggleStats() {
    document.getElementById('statsPanel').classList.toggle('active');
  },
  
  // 🌓 Toggle mode nuit
  toggleDarkMode() {
    if (!state.map) return;
    state.isDarkMode = themeManager.toggle(state.map);
    
    // Redessiner la route après changement de style
    state.map.once('styledata', () => {
      if (state.routeGeometry) {
        this.drawRoute(state.routeGeometry);
      }
    });
    
    this.showToast(`Mode ${state.isDarkMode ? 'Nuit' : 'Jour'} activé`, 'success');
  },
  
  // 📢 Toggle voix
  toggleVoice() {
    const enabled = voiceSystem.toggle();
    this.showToast(`Voix ${enabled ? 'activée' : 'désactivée'}`, 'success');
  },
  
  // 👨‍🏫 Accompagnateur
  toggleSupervisor() {
    const panel = document.getElementById('supervisorPanel');
    if (!panel) {
      this.createSupervisorPanel();
    } else {
      panel.classList.toggle('active');
    }
  },
  
  createSupervisorPanel() {
    const panel = document.createElement('div');
    panel.id = 'supervisorPanel';
    panel.className = 'supervisor-panel';
    panel.innerHTML = `
      <div class="supervisor-header">
        <h3>👨‍🏫 Notes Accompagnateur</h3>
        <button class="btn-close" onclick="app.toggleSupervisor()"><i class="fas fa-times"></i></button>
      </div>
      <div class="supervisor-content">
        <div class="supervisor-section">
          <h4>✅ Points positifs</h4>
          <textarea id="supervisorPositive" placeholder="Bonne anticipation, respect des distances..."></textarea>
          <button class="btn-add-note" onclick="app.addSupervisorNote('positive')">
            <i class="fas fa-plus"></i> Ajouter
          </button>
          <div id="positiveNotes" class="notes-list"></div>
        </div>
        <div class="supervisor-section">
          <h4>⚠️ À améliorer</h4>
          <textarea id="supervisorNegative" placeholder="Vitesse excessive, oubli clignotant..."></textarea>
          <button class="btn-add-note negative" onclick="app.addSupervisorNote('negative')">
            <i class="fas fa-plus"></i> Ajouter
          </button>
          <div id="negativeNotes" class="notes-list"></div>
        </div>
        <div class="supervisor-section">
          <h4>📝 Commentaire général</h4>
          <textarea id="supervisorGeneral" rows="3" placeholder="Impression générale sur la conduite..."></textarea>
        </div>
      </div>
    `;
    document.getElementById('drivingScreen').appendChild(panel);
    panel.classList.add('active');
  },
  
  addSupervisorNote(type) {
    const textareaId = type === 'positive' ? 'supervisorPositive' : 'supervisorNegative';
    const textarea = document.getElementById(textareaId);
    const text = textarea.value.trim();
    
    if (!text) return;
    
    const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    if (type === 'positive') {
      state.supervisorNotes.positive.push({ time: timestamp, text });
    } else {
      state.supervisorNotes.negative.push({ time: timestamp, text });
    }
    
    textarea.value = '';
    this.renderSupervisorNotes();
  },
  
  renderSupervisorNotes() {
    const positiveList = document.getElementById('positiveNotes');
    const negativeList = document.getElementById('negativeNotes');
    
    if (positiveList) {
      positiveList.innerHTML = state.supervisorNotes.positive.map((note, i) => `
        <div class="note-item positive">
          <span class="note-time">${note.time}</span>
          <span class="note-text">${note.text}</span>
          <button class="btn-remove-note" onclick="app.removeSupervisorNote('positive', ${i})">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `).join('');
    }
    
    if (negativeList) {
      negativeList.innerHTML = state.supervisorNotes.negative.map((note, i) => `
        <div class="note-item negative">
          <span class="note-time">${note.time}</span>
          <span class="note-text">${note.text}</span>
          <button class="btn-remove-note" onclick="app.removeSupervisorNote('negative', ${i})">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `).join('');
    }
  },
  
  removeSupervisorNote(type, index) {
    if (type === 'positive') {
      state.supervisorNotes.positive.splice(index, 1);
    } else {
      state.supervisorNotes.negative.splice(index, 1);
    }
    this.renderSupervisorNotes();
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

    Object.assign(state, {
      currentPosition: null,
      startPosition: null,
      startTime: null,
      route: null,
      routeGeometry: null,
      instructions: [],
      currentInstructionIndex: 0,
      totalDistance: 0,
      totalDuration: 0,
      distanceTraveled: 0,
      askedQuestions: [],
      correctAnswers: 0,
      totalQuestions: 0,
      currentSpeed: 0,
      heading: 0,
      isPreviewMode: true,
      navigationStarted: false,
      gpsRetries: 0,
      stats: {
        maxSpeed: 0,
        avgSpeed: 0,
        speedSum: 0,
        speedCount: 0,
        speedViolations: [],
        harshBrakings: 0,
        lastSpeed: 0,
        score: 100
      },
      supervisorNotes: {
        positive: [],
        negative: [],
        general: ''
      }
    });

    this.showDriving();
    document.getElementById('loader').classList.add('active');
    setTimeout(() => this.startGPSTracking(), 500);
  },

  stopDriving() {
    if (confirm('⚠️ Arrêter le parcours ?')) this.finishDriving();
  },

  finishDriving() {
    this.stopGPSTracking();
    voiceSystem.speak('Parcours terminé');
    
    const totalTime = state.startTime ? Math.round((Date.now() - state.startTime) / 1000 / 60) : 0;
    
    // Récupérer notes accompagnateur
    const generalNote = document.getElementById('supervisorGeneral');
    if (generalNote) {
      state.supervisorNotes.general = generalNote.value;
    }
    
    // Calculer score final
    let score = 100;
    score -= state.stats.speedViolations.length * 5;
    score -= state.stats.harshBrakings * 3;
    score = Math.max(0, score);
    state.stats.score = score;
    
    // 📝 Sauvegarder dans historique
    historyManager.save({
      zones: state.selectedZones.map(zoneId => {
        const zone = CONFIG.ZONES.find(z => z.id === zoneId);
        return zone ? zone.name : zoneId;
      }),
      distance: state.distanceTraveled,
      duration: totalTime,
      avgSpeed: state.stats.avgSpeed,
      maxSpeed: state.stats.maxSpeed,
      speedViolations: state.stats.speedViolations.length,
      harshBrakings: state.stats.harshBrakings,
      score: score,
      correctAnswers: state.correctAnswers,
      totalQuestions: state.totalQuestions,
      supervisorNotes: state.supervisorNotes
    });
    
    document.getElementById('finalDistance').textContent = `${state.distanceTraveled.toFixed(1)} km`;
    document.getElementById('finalTime').textContent = `${totalTime} min`;
    document.getElementById('finalQuestions').textContent = `${state.correctAnswers}/${state.totalQuestions}`;
    
    // Afficher stats avancées dans modal
    const finalStatsEl = document.getElementById('finalStatsAdvanced');
    if (finalStatsEl) {
      finalStatsEl.innerHTML = `
        <div class="final-stat-row">
          <strong>Vitesse moyenne:</strong> <span>${state.stats.avgSpeed} km/h</span>
        </div>
        <div class="final-stat-row">
          <strong>Vitesse max:</strong> <span>${state.stats.maxSpeed} km/h</span>
        </div>
        <div class="final-stat-row">
          <strong>Dépassements vitesse:</strong> <span>${state.stats.speedViolations.length}</span>
        </div>
        <div class="final-stat-row">
          <strong>Freinages brusques:</strong> <span>${state.stats.harshBrakings}</span>
        </div>
        <div class="final-stat-row score">
          <strong>Score de conduite:</strong> <span class="score-value">${score}/100</span>
        </div>
      `;
    }
    
    // Afficher notes accompagnateur
    const supervisorReportEl = document.getElementById('supervisorReport');
    if (supervisorReportEl) {
      let reportHTML = '<h4>📋 Rapport Accompagnateur</h4>';
      
      if (state.supervisorNotes.positive.length > 0) {
        reportHTML += '<div class="report-section positive"><h5>✅ Points positifs</h5><ul>';
        state.supervisorNotes.positive.forEach(note => {
          reportHTML += `<li><span class="note-time">${note.time}</span> ${note.text}</li>`;
        });
        reportHTML += '</ul></div>';
      }
      
      if (state.supervisorNotes.negative.length > 0) {
        reportHTML += '<div class="report-section negative"><h5>⚠️ À améliorer</h5><ul>';
        state.supervisorNotes.negative.forEach(note => {
          reportHTML += `<li><span class="note-time">${note.time}</span> ${note.text}</li>`;
        });
        reportHTML += '</ul></div>';
      }
      
      if (state.supervisorNotes.general) {
        reportHTML += `<div class="report-section"><h5>💬 Commentaire général</h5><p>${state.supervisorNotes.general}</p></div>`;
      }
      
      if (state.supervisorNotes.positive.length === 0 && 
          state.supervisorNotes.negative.length === 0 && 
          !state.supervisorNotes.general) {
        reportHTML += '<p class="no-notes">Aucune note d\'accompagnateur</p>';
      }
      
      supervisorReportEl.innerHTML = reportHTML;
    }
    
    document.getElementById('finishModal').classList.add('active');
  },

  newRoute() {
    document.getElementById('finishModal').classList.remove('active');
    setTimeout(() => this.showConfig(), 300);
  },

  // ========== CLEANUP ==========
  cleanupMap() {
    const btn = document.getElementById('startNavigationBtn');
    if (btn) btn.remove();
    
    const supervisorPanel = document.getElementById('supervisorPanel');
    if (supervisorPanel) supervisorPanel.remove();
    
    if (state.userMarker) {
      state.userMarker.remove();
      state.userMarker = null;
    }
    if (state.map) {
      state.map.remove();
      state.map = null;
    }
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

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (typeof mapboxgl !== 'undefined' && typeof turf !== 'undefined') {
      window.app = app;
      app.init();
    } else {
      console.error('❌ Librairies manquantes');
      alert('Erreur de chargement. Rechargez la page.');
    }
  }, 100);
});