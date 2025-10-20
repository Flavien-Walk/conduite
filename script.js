/* ==================== CONFIGURATION ==================== */

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
    
    GPS_OPTIONS: { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 },
    AVG_SPEED_KMH: 40,
    DEFAULT_SPEED_LIMIT: 50
};

/* ==================== ÉTAT ==================== */

const state = {
    selectedZones: [],
    duration: 30,
    vehicle: 'car',
    map: null,
    watchId: null,
    routingControl: null,
    userMarker: null,
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
    lastQuestionTime: 0,
    isTracking: true,
    lastPosition: null,
    lastPositionTime: null,
    speedLimitCache: {}
};

/* ==================== APPLICATION ==================== */

const app = {
    
    init() {
        console.log('🚗 Drive Lyon - Formation GPS Professionnelle');
        this.renderZones();
        this.setupSlider();
        this.requestGPSPermission();
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
    
    // ========== CONFIGURATION ==========
    
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
        if (index > -1) {
            state.selectedZones.splice(index, 1);
        } else {
            state.selectedZones.push(zoneId);
        }
    },
    
    setupSlider() {
        const slider = document.getElementById('durationSlider');
        const label = document.getElementById('durationLabel');
        slider.addEventListener('input', (e) => {
            state.duration = parseInt(e.target.value);
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
    
    async requestGPSPermission() {
        if (!navigator.geolocation) return;
        try {
            await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, CONFIG.GPS_OPTIONS);
            });
            console.log('✓ GPS autorisé');
        } catch (err) {
            console.warn('⚠️ GPS non autorisé');
        }
    },
    
    startGPSTracking() {
        if (!navigator.geolocation) {
            this.showToast('GPS non disponible', 'error');
            this.useFallbackPosition();
            return;
        }
        
        console.log('📍 Démarrage GPS...');
        document.getElementById('loaderText').textContent = 'Activation GPS...';
        document.getElementById('loaderDetail').textContent = 'Recherche de votre position';
        document.getElementById('navStreet').textContent = 'Activation GPS...';
        
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                console.log('✓ GPS actif');
                this.onGPSSuccess(pos);
            },
            (err) => {
                console.error('❌ Erreur GPS:', err.message);
                this.onGPSError(err);
            },
            CONFIG.GPS_OPTIONS
        );
        
        state.watchId = navigator.geolocation.watchPosition(
            (pos) => this.onGPSUpdate(pos),
            (err) => console.warn('GPS update error:', err),
            CONFIG.GPS_OPTIONS
        );
    },
    
    stopGPSTracking() {
        if (state.watchId) {
            navigator.geolocation.clearWatch(state.watchId);
            state.watchId = null;
        }
    },
    
    onGPSSuccess(position) {
        const { latitude, longitude } = position.coords;
        state.currentPosition = { lat: latitude, lng: longitude };
        state.startPosition = { lat: latitude, lng: longitude };
        state.startTime = Date.now();
        
        console.log('📍 Position:', latitude.toFixed(5), longitude.toFixed(5));
        
        document.getElementById('gpsStatus').textContent = 'GPS actif';
        document.getElementById('loaderText').textContent = 'Calcul du parcours...';
        document.getElementById('loaderDetail').textContent = 'Optimisation de l\'itinéraire';
        
        this.initMap();
        this.generateRoute();
    },
    
    onGPSUpdate(position) {
        const { latitude, longitude, speed, heading } = position.coords;
        
        state.currentPosition = { lat: latitude, lng: longitude };
        
        // Calcul distance parcourue avec Turf.js
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
            const distance = this.calculateDistanceTurf(state.lastPosition, state.currentPosition);
            if (distance > 0.005) {
                state.heading = this.calculateBearing(state.lastPosition, state.currentPosition);
            }
        }
        
        // Vitesse
        if (speed !== null && speed >= 0) {
            state.currentSpeed = Math.round(speed * 3.6);
        } else if (state.lastPosition && state.lastPositionTime) {
            const distance = this.calculateDistanceTurf(state.lastPosition, state.currentPosition);
            const time = (Date.now() - state.lastPositionTime) / 1000;
            if (time > 0 && distance > 0.001) {
                state.currentSpeed = Math.round((distance / time) * 3.6);
            }
        }
        
        state.lastPosition = state.currentPosition;
        state.lastPositionTime = Date.now();
        
        // Récupérer limitation de vitesse
        this.getSpeedLimit(latitude, longitude);
        
        this.updateUI();
        this.updateNavigation();
        this.updateUserMarker();
        this.checkQuestion();
    },
    
    onGPSError(error) {
        console.warn('Erreur GPS:', error.message);
        if (!state.startPosition) {
            setTimeout(() => {
                if (confirm('GPS indisponible.\n\nUtiliser une position de test à Lyon Centre ?')) {
                    this.useFallbackPosition();
                } else {
                    this.showToast('GPS requis', 'error');
                    setTimeout(() => this.showConfig(), 2000);
                }
            }, 500);
        }
    },
    
    useFallbackPosition() {
        console.log('🧪 Mode TEST');
        this.showToast('Mode TEST : Position simulée', 'warning');
        
        const fakePosition = {
            coords: {
                latitude: CONFIG.LYON_CENTER.lat,
                longitude: CONFIG.LYON_CENTER.lng,
                speed: 0,
                heading: 0,
                accuracy: 10
            }
        };
        
        this.onGPSSuccess(fakePosition);
        
        // Simulation mouvement
        let angle = 0;
        setInterval(() => {
            if (state.currentPosition) {
                angle += 5;
                const radius = 0.002;
                const fakePos = {
                    coords: {
                        latitude: CONFIG.LYON_CENTER.lat + Math.cos(angle * Math.PI / 180) * radius,
                        longitude: CONFIG.LYON_CENTER.lng + Math.sin(angle * Math.PI / 180) * radius,
                        speed: 10,
                        heading: angle,
                        accuracy: 10
                    }
                };
                this.onGPSUpdate(fakePos);
            }
        }, 1000);
    },
    
    // ========== LIMITE DE VITESSE (API Overpass) ==========
    
    async getSpeedLimit(lat, lng) {
        const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
        
        // Cache pour éviter trop de requêtes
        if (state.speedLimitCache[cacheKey]) {
            state.currentSpeedLimit = state.speedLimitCache[cacheKey];
            document.getElementById('speedLimit').textContent = state.currentSpeedLimit;
            return;
        }
        
        try {
            const radius = 50; // 50m de rayon
            const query = `
                [out:json][timeout:5];
                way(around:${radius},${lat},${lng})["maxspeed"];
                out body;
            `;
            
            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.elements && data.elements.length > 0) {
                    const maxspeed = data.elements[0].tags.maxspeed;
                    const limit = parseInt(maxspeed);
                    if (!isNaN(limit)) {
                        state.currentSpeedLimit = limit;
                        state.speedLimitCache[cacheKey] = limit;
                        document.getElementById('speedLimit').textContent = limit;
                        console.log(`🚦 Limite: ${limit} km/h`);
                        return;
                    }
                }
            }
        } catch (error) {
            console.warn('Erreur récupération limite vitesse:', error);
        }
        
        // Valeur par défaut
        state.currentSpeedLimit = CONFIG.DEFAULT_SPEED_LIMIT;
        document.getElementById('speedLimit').textContent = CONFIG.DEFAULT_SPEED_LIMIT;
    },
    
    // ========== CARTE ==========
    
    initMap() {
        if (state.map) state.map.remove();
        
        state.map = L.map('map', {
            center: [state.startPosition.lat, state.startPosition.lng],
            zoom: 17,
            zoomControl: false,
            attributionControl: false
        });
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(state.map);
        
        state.map.on('dragstart', () => { state.isTracking = false; });
        
        console.log('✓ Carte initialisée');
    },
    
    updateUserMarker() {
        if (!state.map || !state.currentPosition) return;
        
        if (state.userMarker) state.map.removeLayer(state.userMarker);
        
        const icon = state.vehicle === 'car' ? '🚗' : '🏍️';
        
        const userIcon = L.divIcon({
            className: 'user-marker',
            html: `<div style="
                font-size: 36px;
                transform: rotate(${state.heading}deg);
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
                transition: transform 0.5s ease;
            ">${icon}</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        
        state.userMarker = L.marker(
            [state.currentPosition.lat, state.currentPosition.lng],
            { icon: userIcon, zIndexOffset: 1000 }
        ).addTo(state.map);
        
        if (state.isTracking) {
            state.map.setView(
                [state.currentPosition.lat, state.currentPosition.lng],
                17,
                { animate: true, duration: 0.5 }
            );
        }
    },
    
    recenterMap() {
        if (state.currentPosition) {
            state.isTracking = true;
            state.map.setView(
                [state.currentPosition.lat, state.currentPosition.lng],
                17,
                { animate: true, duration: 0.8 }
            );
            this.showToast('Carte recentrée', 'success');
        }
    },
    
    // ========== GÉNÉRATION ROUTE ==========
    
    async generateRoute() {
        const loader = document.getElementById('loader');
        loader.classList.add('active');
        
        const desiredDistanceKm = (state.duration / 60) * CONFIG.AVG_SPEED_KMH;
        const waypoints = [state.startPosition];
        
        state.selectedZones.forEach(zoneId => {
            const zone = CONFIG.ZONES.find(z => z.id === zoneId);
            if (zone) {
                waypoints.push({
                    lat: zone.lat + (Math.random() - 0.5) * 0.015,
                    lng: zone.lng + (Math.random() - 0.5) * 0.015
                });
            }
        });
        
        waypoints.push(state.startPosition);
        
        console.log(`🎯 Parcours: ${desiredDistanceKm.toFixed(1)} km, ${waypoints.length} points`);
        
        document.getElementById('loaderText').textContent = 'Calcul de l\'itinéraire...';
        document.getElementById('loaderDetail').textContent = 'Optimisation du parcours';
        
        try {
            if (state.routingControl) state.map.removeControl(state.routingControl);
            
            state.routingControl = L.Routing.control({
                waypoints: waypoints.map(wp => L.latLng(wp.lat, wp.lng)),
                router: L.Routing.osrmv1({
                    serviceUrl: 'https://router.project-osrm.org/route/v1'
                }),
                routeWhileDragging: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: true,
                showAlternatives: false,
                lineOptions: {
                    styles: [
                        { color: '#1e40af', opacity: 0.3, weight: 12 },
                        { color: '#3b82f6', opacity: 0.9, weight: 8 }
                    ]
                },
                createMarker: () => null
            }).addTo(state.map);
            
            state.routingControl.on('routesfound', (e) => {
                const route = e.routes[0];
                
                if (!route || !route.instructions) {
                    this.showToast('Route invalide', 'error');
                    loader.classList.remove('active');
                    return;
                }
                
                state.route = route;
                state.totalDistance = route.summary.totalDistance / 1000;
                state.totalDuration = route.summary.totalTime / 60;
                state.instructions = route.instructions;
                state.currentInstructionIndex = 0;
                
                // MASQUER LE LOADER
                loader.classList.remove('active');
                
                this.showToast(`Parcours: ${state.totalDistance.toFixed(1)} km`, 'success');
                console.log(`✓ ${state.instructions.length} instructions`);
                
                // Afficher instructions immédiatement
                this.updateNavigation();
                this.updateNextInstructions();
            });
            
            state.routingControl.on('routingerror', (e) => {
                console.error('Erreur routing:', e);
                loader.classList.remove('active');
                this.showToast('Erreur génération. Essayez d\'autres zones.', 'error');
                setTimeout(() => this.showConfig(), 2000);
            });
            
            setTimeout(() => {
                const container = document.querySelector('.leaflet-routing-container');
                if (container) container.style.display = 'none';
            }, 100);
            
        } catch (error) {
            console.error('Erreur:', error);
            loader.classList.remove('active');
            this.showToast('Erreur génération', 'error');
        }
    },
    
    // ========== NAVIGATION ==========
    
    updateNavigation() {
        if (!state.currentPosition || !state.instructions || state.instructions.length === 0) return;
        
        let instruction = state.instructions[state.currentInstructionIndex];
        
        if (!instruction || !instruction.latLng) {
            if (state.currentInstructionIndex < state.instructions.length - 1) {
                state.currentInstructionIndex++;
                this.updateNavigation();
            }
            return;
        }
        
        const instructionPos = { lat: instruction.latLng.lat, lng: instruction.latLng.lng };
        const distanceM = this.calculateDistanceTurf(state.currentPosition, instructionPos) * 1000;
        
        // Passer à l'instruction suivante
        if (distanceM < 50 && state.currentInstructionIndex < state.instructions.length - 1) {
            state.currentInstructionIndex++;
            instruction = state.instructions[state.currentInstructionIndex];
            if (!instruction || !instruction.latLng) return;
            this.showToast('Nouvelle direction !', 'success');
            this.updateNextInstructions();
        }
        
        const newPos = { lat: instruction.latLng.lat, lng: instruction.latLng.lng };
        const newDistance = this.calculateDistanceTurf(state.currentPosition, newPos) * 1000;
        
        // Affichage distance
        const distanceEl = document.getElementById('navDistance');
        if (newDistance > 1000) {
            distanceEl.textContent = `${(newDistance / 1000).toFixed(1)} km`;
        } else if (newDistance > 100) {
            distanceEl.textContent = `${Math.round(newDistance / 10) * 10} m`;
        } else {
            distanceEl.textContent = `${Math.round(newDistance)} m`;
        }
        
        // Calcul temps avec vitesse actuelle ou moyenne
        const speed = state.currentSpeed > 0 ? state.currentSpeed : CONFIG.AVG_SPEED_KMH;
        const timeMinutes = (newDistance / 1000) / speed * 60;
        const timeEl = document.getElementById('navTime');
        if (timeMinutes < 1) {
            timeEl.textContent = `${Math.round(timeMinutes * 60)} sec`;
        } else {
            timeEl.textContent = `${Math.round(timeMinutes)} min`;
        }
        
        // Instruction simplifiée
        let instructionText = instruction.text || 'Continuez tout droit';
        instructionText = instructionText
            .replace('Continue onto ', '')
            .replace('Turn ', '')
            .replace('Head ', '');
        
        document.getElementById('navStreet').textContent = instructionText;
        
        // Icône
        this.updateDirectionIcon(instruction.type);
    },
    
    updateDirectionIcon(type) {
        const icon = document.getElementById('navIcon');
        if (!type) {
            icon.className = 'fas fa-arrow-up';
            icon.style.transform = 'rotate(0deg)';
            return;
        }
        
        const typeStr = type.toLowerCase();
        
        if (typeStr.includes('left') && typeStr.includes('slight')) {
            icon.className = 'fas fa-arrow-up';
            icon.style.transform = 'rotate(-30deg)';
        } else if (typeStr.includes('left') && typeStr.includes('sharp')) {
            icon.className = 'fas fa-arrow-left';
            icon.style.transform = 'rotate(-45deg)';
        } else if (typeStr.includes('left')) {
            icon.className = 'fas fa-arrow-left';
            icon.style.transform = 'rotate(0deg)';
        } else if (typeStr.includes('right') && typeStr.includes('slight')) {
            icon.className = 'fas fa-arrow-up';
            icon.style.transform = 'rotate(30deg)';
        } else if (typeStr.includes('right') && typeStr.includes('sharp')) {
            icon.className = 'fas fa-arrow-right';
            icon.style.transform = 'rotate(45deg)';
        } else if (typeStr.includes('right')) {
            icon.className = 'fas fa-arrow-right';
            icon.style.transform = 'rotate(0deg)';
        } else if (typeStr.includes('roundabout')) {
            icon.className = 'fas fa-sync';
            icon.style.transform = 'rotate(0deg)';
        } else if (typeStr.includes('destination')) {
            icon.className = 'fas fa-flag-checkered';
            icon.style.transform = 'rotate(0deg)';
            setTimeout(() => this.finishDriving(), 2000);
        } else {
            icon.className = 'fas fa-arrow-up';
            icon.style.transform = 'rotate(0deg)';
        }
    },
    
    // LISTE DES PROCHAINES INSTRUCTIONS
    updateNextInstructions() {
        const listEl = document.getElementById('nextList');
        listEl.innerHTML = '';
        
        // Afficher les 5 prochaines instructions
        for (let i = state.currentInstructionIndex + 1; i < Math.min(state.currentInstructionIndex + 6, state.instructions.length); i++) {
            const inst = state.instructions[i];
            if (!inst || !inst.latLng) continue;
            
            const item = document.createElement('div');
            item.className = 'next-item';
            
            const distanceM = this.calculateDistanceTurf(state.currentPosition, {
                lat: inst.latLng.lat,
                lng: inst.latLng.lng
            }) * 1000;
            
            let text = inst.text || 'Continuer';
            text = text.replace('Continue onto ', '').replace('Turn ', '').replace('Head ', '');
            
            item.innerHTML = `
                <div class="next-item-icon">
                    <i class="fas ${this.getIconForType(inst.type)}"></i>
                </div>
                <div class="next-item-info">
                    <div class="next-item-distance">${distanceM > 1000 ? (distanceM/1000).toFixed(1) + ' km' : Math.round(distanceM) + ' m'}</div>
                    <div class="next-item-text">${text}</div>
                </div>
            `;
            
            listEl.appendChild(item);
        }
    },
    
    getIconForType(type) {
        if (!type) return 'fa-arrow-up';
        const typeStr = type.toLowerCase();
        if (typeStr.includes('left')) return 'fa-arrow-left';
        if (typeStr.includes('right')) return 'fa-arrow-right';
        if (typeStr.includes('roundabout')) return 'fa-sync';
        if (typeStr.includes('destination')) return 'fa-flag-checkered';
        return 'fa-arrow-up';
    },
    
    toggleInstructions() {
        const panel = document.getElementById('nextInstructions');
        panel.classList.toggle('active');
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
            
            if (elapsed >= state.totalDuration) {
                this.finishDriving();
            }
        }
    },
    
    toggleStats() {
        document.getElementById('statsPanel').classList.toggle('active');
    },
    
    // ========== QUESTIONS ==========
    
    checkQuestion() {
        if (state.totalQuestions >= 5) return;
        if (Date.now() - state.lastQuestionTime < 60000) return;
        if (Math.random() > 0.05) return;
        
        const available = CONFIG.QUESTIONS.filter(q => !state.askedQuestions.includes(q.q));
        if (available.length > 0) {
            const question = available[Math.floor(Math.random() * available.length)];
            this.showQuestion(question);
            state.lastQuestionTime = Date.now();
        }
    },
    
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
            this.showToast('Sélectionnez au moins 2 zones', 'warning');
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
            lastQuestionTime: 0,
            currentSpeed: 0,
            currentSpeedLimit: CONFIG.DEFAULT_SPEED_LIMIT,
            isTracking: true,
            heading: 0,
            speedLimitCache: {}
        });
        
        this.showDriving();
        setTimeout(() => this.startGPSTracking(), 500);
    },
    
    stopDriving() {
        if (confirm('❓ Arrêter le parcours ?')) {
            this.finishDriving();
        }
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
    
    // ========== UTILITAIRES ==========
    
    calculateDistanceTurf(pos1, pos2) {
        const from = turf.point([pos1.lng, pos1.lat]);
        const to = turf.point([pos2.lng, pos2.lat]);
        return turf.distance(from, to, { units: 'kilometers' });
    },
    
    calculateBearing(pos1, pos2) {
        const from = turf.point([pos1.lng, pos1.lat]);
        const to = turf.point([pos2.lng, pos2.lat]);
        return turf.bearing(from, to);
    },
    
    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-info-circle'
        };
        
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
    app.init();
});

window.app = app;