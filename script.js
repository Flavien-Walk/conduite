/* ==================== CONFIGURATION ==================== */

const CONFIG = {
    LYON_CENTER: { lat: 45.764043, lng: 4.835659 },
    
    // Zones réelles autour de Lyon
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
    
    // Questions générales de code de la route
    QUESTIONS: [
        {
            q: "En agglomération, quelle est la vitesse maximale autorisée ?",
            a: ["30 km/h", "50 km/h", "70 km/h", "90 km/h"],
            correct: 1
        },
        {
            q: "À quelle distance minimale devez-vous stationner d'un passage piéton ?",
            a: ["3 mètres", "5 mètres", "10 mètres", "15 mètres"],
            correct: 1
        },
        {
            q: "Sur autoroute, quelle est la distance de sécurité minimale recommandée ?",
            a: ["1 seconde", "2 secondes", "3 secondes", "5 secondes"],
            correct: 1
        },
        {
            q: "Que signifie un panneau triangulaire rouge avec bordure blanche ?",
            a: ["Interdiction", "Danger", "Indication", "Obligation"],
            correct: 1
        },
        {
            q: "À un feu orange, vous devez :",
            a: ["Accélérer", "Vous arrêter si possible en sécurité", "Continuer", "Klaxonner"],
            correct: 1
        },
        {
            q: "Le taux d'alcoolémie légal maximum pour un conducteur confirmé est de :",
            a: ["0,2 g/L", "0,5 g/L", "0,8 g/L", "1,0 g/L"],
            correct: 1
        },
        {
            q: "Sur une route nationale bidirectionnelle, la vitesse maximale est de :",
            a: ["70 km/h", "80 km/h", "90 km/h", "110 km/h"],
            correct: 1
        },
        {
            q: "Un triangle de pré-signalisation doit être placé à quelle distance minimum ?",
            a: ["10 mètres", "30 mètres", "50 mètres", "100 mètres"],
            correct: 1
        },
        {
            q: "La ceinture de sécurité est obligatoire :",
            a: ["Seulement sur autoroute", "À partir de 50 km/h", "Partout", "En ville uniquement"],
            correct: 2
        },
        {
            q: "Combien de points possède initialement un permis probatoire ?",
            a: ["6 points", "8 points", "10 points", "12 points"],
            correct: 0
        }
    ],
    
    GPS_OPTIONS: {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000
    },
    
    AVG_SPEED_KMH: 40
};

/* ==================== ÉTAT ==================== */

const state = {
    // Configuration
    selectedZones: [],
    duration: 30,
    vehicle: 'car',
    
    // Navigation
    map: null,
    watchId: null,
    routingControl: null,
    userMarker: null,
    currentPosition: null,
    startPosition: null,
    heading: 0,
    mapBearing: 0, // Bearing actuel de la carte pour interpolation
    
    // Route
    route: null,
    instructions: [],
    currentInstructionIndex: 0,
    
    // Stats
    startTime: null,
    totalDistance: 0,
    totalDuration: 0,
    currentSpeed: 0,
    
    // Questions
    askedQuestions: [],
    correctAnswers: 0,
    totalQuestions: 0,
    lastQuestionTime: 0,
    
    // UI
    isTracking: true,
    lastPosition: null,
    lastPositionTime: null,
    
    // Lissage mouvement
    headingHistory: [],
    maxHeadingHistory: 5
};

/* ==================== APPLICATION ==================== */

const app = {
    
    init() {
        console.log('🚗 Drive Lyon - Application de formation');
        this.renderZones();
        this.setupSlider();
        this.requestGPSPermission();
    },
    
    // ========== NAVIGATION ÉCRANS ==========
    
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
        if (!navigator.geolocation) {
            console.warn('GPS non disponible');
            return;
        }
        
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
        
        document.getElementById('navStreet').textContent = 'Recherche GPS...';
        
        // Position initiale
        navigator.geolocation.getCurrentPosition(
            (pos) => this.onGPSSuccess(pos),
            (err) => this.onGPSError(err),
            CONFIG.GPS_OPTIONS
        );
        
        // Suivi continu
        state.watchId = navigator.geolocation.watchPosition(
            (pos) => this.onGPSUpdate(pos),
            (err) => this.onGPSError(err),
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
        
        console.log('✓ GPS obtenu:', latitude.toFixed(4), longitude.toFixed(4));
        
        this.initMap();
        this.generateRoute();
    },
    
    onGPSUpdate(position) {
        const { latitude, longitude, speed, heading } = position.coords;
        state.currentPosition = { lat: latitude, lng: longitude };
        
        // Mise à jour du cap avec interpolation douce
        if (heading !== null && heading !== undefined && heading >= 0) {
            // Utiliser le heading du GPS s'il est disponible
            state.heading = heading;
        } else if (state.lastPosition) {
            // Calculer le bearing à partir du mouvement
            const newHeading = this.calculateBearing(state.lastPosition, state.currentPosition);
            
            // Interpolation douce du heading
            if (state.heading) {
                const diff = ((newHeading - state.heading + 540) % 360) - 180;
                state.heading = (state.heading + diff * 0.3 + 360) % 360; // Interpolation 30%
            } else {
                state.heading = newHeading;
            }
        }
        
        // Calcul de la vitesse
        if (speed !== null && speed >= 0) {
            state.currentSpeed = Math.round(speed * 3.6);
        } else if (state.lastPosition && state.lastPositionTime) {
            const distance = this.calculateDistance(state.lastPosition, state.currentPosition);
            const time = (Date.now() - state.lastPositionTime) / 1000;
            if (time > 0 && distance > 0.001) { // Minimum 1m de mouvement
                state.currentSpeed = Math.round((distance / time) * 3.6);
            }
        }
        
        state.lastPosition = state.currentPosition;
        state.lastPositionTime = Date.now();
        
        this.updateUI();
        this.updateNavigation();
        this.updateUserMarker();
        this.checkQuestion();
    },
    
    onGPSError(error) {
        console.warn('Erreur GPS:', error.message);
        
        if (!state.startPosition) {
            if (confirm('GPS indisponible. Utiliser une position de test à Lyon ?')) {
                this.useFallbackPosition();
            } else {
                this.showToast('GPS requis pour continuer', 'error');
                setTimeout(() => this.showConfig(), 2000);
            }
        }
    },
    
    useFallbackPosition() {
        console.log('📍 Mode test avec position simulée');
        this.showToast('Mode test : Position simulée à Lyon', 'warning');
        
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
    },
    
    // ========== CARTE ==========
    
    initMap() {
        if (state.map) {
            state.map.remove();
        }
        
        state.map = L.map('map', {
            center: [state.startPosition.lat, state.startPosition.lng],
            zoom: 18, // Zoom plus proche pour vue 3D
            zoomControl: false,
            attributionControl: false,
            rotate: true,
            bearing: 0,
            touchRotate: true,
            rotateControl: false,
            smoothWheelZoom: true,
            smoothSensitivity: 1
        });
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(state.map);
        
        state.map.on('dragstart', () => {
            state.isTracking = false;
        });
        
        console.log('✓ Carte initialisée en mode navigation 3D');
    },
    
    updateUserMarker() {
        if (!state.map || !state.currentPosition) return;
        
        if (state.userMarker) {
            state.map.removeLayer(state.userMarker);
        }
        
        const icon = state.vehicle === 'car' ? '🚗' : '🏍️';
        
        // Le véhicule pointe toujours vers le haut (la carte tourne à la place)
        const userIcon = L.divIcon({
            className: 'user-marker',
            html: `<div style="
                font-size: 40px;
                transform: rotate(0deg);
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
                transition: none;
            ">${icon}</div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        
        state.userMarker = L.marker(
            [state.currentPosition.lat, state.currentPosition.lng],
            { icon: userIcon, zIndexOffset: 1000 }
        ).addTo(state.map);
        
        if (state.isTracking) {
            // Rotation fluide de la carte style Waze
            this.rotateMapToHeading();
            
            // Centrage fluide
            state.map.panTo(
                [state.currentPosition.lat, state.currentPosition.lng],
                {
                    animate: true,
                    duration: 0.3,
                    easeLinearity: 0.3
                }
            );
        }
    },
    
    rotateMapToHeading() {
        if (!state.map) return;
        
        // Calculer le nouveau bearing (rotation inverse pour que le véhicule pointe vers le haut)
        const targetBearing = -state.heading;
        
        // Interpolation douce du bearing
        const currentBearing = state.mapBearing;
        let bearingDiff = targetBearing - currentBearing;
        
        // Normaliser la différence d'angle (-180 à 180)
        while (bearingDiff > 180) bearingDiff -= 360;
        while (bearingDiff < -180) bearingDiff += 360;
        
        // Interpolation douce (20% du chemin à chaque frame)
        const newBearing = currentBearing + bearingDiff * 0.2;
        state.mapBearing = newBearing;
        
        // Appliquer la rotation à la carte via CSS
        const mapPane = state.map.getPanes().mapPane;
        if (mapPane) {
            mapPane.style.transform = `rotateZ(${newBearing}deg)`;
        }
        
        // Rotation inverse des contrôles pour qu'ils restent droits
        const controls = document.querySelectorAll('.nav-card, .speed-widget, .action-buttons, .driving-header');
        controls.forEach(control => {
            if (control) {
                control.style.transform = `rotateZ(${-newBearing}deg)`;
            }
        });
    },
    
    recenterMap() {
        if (state.currentPosition) {
            state.isTracking = true;
            state.map.flyTo(
                [state.currentPosition.lat, state.currentPosition.lng],
                18,
                {
                    animate: true,
                    duration: 0.8
                }
            );
            this.showToast('Carte recentrée', 'success');
        }
    },
    
    // ========== GÉNÉRATION ROUTE ==========
    
    async generateRoute() {
        const loader = document.getElementById('loader');
        loader.classList.add('active');
        
        // Calcul distance désirée
        const desiredDistanceKm = (state.duration / 60) * CONFIG.AVG_SPEED_KMH;
        
        // Sélection des waypoints
        const waypoints = [state.startPosition];
        
        // Ajouter les zones sélectionnées
        state.selectedZones.forEach(zoneId => {
            const zone = CONFIG.ZONES.find(z => z.id === zoneId);
            if (zone) {
                // Variation aléatoire pour éviter les points trop proches
                waypoints.push({
                    lat: zone.lat + (Math.random() - 0.5) * 0.02,
                    lng: zone.lng + (Math.random() - 0.5) * 0.02
                });
            }
        });
        
        // Retour au départ
        waypoints.push(state.startPosition);
        
        console.log(`🎯 Génération parcours ${desiredDistanceKm.toFixed(1)} km avec ${waypoints.length} points`);
        
        try {
            if (state.routingControl) {
                state.map.removeControl(state.routingControl);
            }
            
            state.routingControl = L.Routing.control({
                waypoints: waypoints.map(wp => L.latLng(wp.lat, wp.lng)),
                router: L.Routing.osrmv1({
                    serviceUrl: 'https://router.project-osrm.org/route/v1'
                }),
                routeWhileDragging: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: false,
                showAlternatives: false,
                lineOptions: {
                    styles: [
                        // Bordure sombre pour contraste
                        {
                            color: '#1e293b',
                            opacity: 0.4,
                            weight: 10
                        },
                        // Ligne principale bleue style Waze
                        {
                            color: '#3b82f6',
                            opacity: 0.9,
                            weight: 7
                        }
                    ],
                    extendToWaypoints: true,
                    missingRouteTolerance: 0
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
                
                loader.classList.remove('active');
                this.showToast(`Parcours généré : ${state.totalDistance.toFixed(1)} km`, 'success');
                console.log(`✓ ${state.instructions.length} instructions de navigation`);
                
                this.updateNavigation();
            });
            
            state.routingControl.on('routingerror', (e) => {
                console.error('Erreur routing:', e);
                loader.classList.remove('active');
                this.showToast('Impossible de générer le parcours. Essayez d\'autres zones.', 'error');
                setTimeout(() => this.showConfig(), 2000);
            });
            
            // Masquer le container de routing
            setTimeout(() => {
                const container = document.querySelector('.leaflet-routing-container');
                if (container) container.style.display = 'none';
            }, 100);
            
        } catch (error) {
            console.error('Erreur:', error);
            loader.classList.remove('active');
            this.showToast('Erreur lors de la génération', 'error');
        }
    },
    
    // ========== NAVIGATION ==========
    
    updateNavigation() {
        if (!state.currentPosition || !state.instructions || state.instructions.length === 0) {
            return;
        }
        
        let instruction = state.instructions[state.currentInstructionIndex];
        
        // Vérifier que l'instruction a une position
        if (!instruction || !instruction.latLng) {
            return;
        }
        
        const instructionPos = {
            lat: instruction.latLng.lat,
            lng: instruction.latLng.lng
        };
        
        const distance = this.calculateDistance(state.currentPosition, instructionPos) * 1000; // mètres
        
        // Passer à l'instruction suivante si on est proche
        if (distance < 30 && state.currentInstructionIndex < state.instructions.length - 1) {
            state.currentInstructionIndex++;
            instruction = state.instructions[state.currentInstructionIndex];
            
            if (!instruction || !instruction.latLng) {
                return;
            }
        }
        
        // Recalculer la distance
        const newPos = {
            lat: instruction.latLng.lat,
            lng: instruction.latLng.lng
        };
        const newDistance = this.calculateDistance(state.currentPosition, newPos) * 1000;
        
        // Affichage distance
        const distanceEl = document.getElementById('navDistance');
        if (newDistance > 1000) {
            distanceEl.textContent = `${(newDistance / 1000).toFixed(1)} km`;
        } else {
            distanceEl.textContent = `${Math.round(newDistance)} m`;
        }
        
        // Affichage instruction
        document.getElementById('navStreet').textContent = instruction.text || 'Continuez tout droit';
        
        // Icône de direction
        this.updateDirectionIcon(instruction.type);
    },
    
    updateDirectionIcon(type) {
        const icon = document.getElementById('navIcon');
        
        if (type.includes('SlightLeft')) {
            icon.className = 'fas fa-arrow-up';
            icon.style.transform = 'rotate(-30deg)';
        } else if (type.includes('Left')) {
            icon.className = 'fas fa-arrow-left';
            icon.style.transform = 'rotate(0deg)';
        } else if (type.includes('SlightRight')) {
            icon.className = 'fas fa-arrow-up';
            icon.style.transform = 'rotate(30deg)';
        } else if (type.includes('Right')) {
            icon.className = 'fas fa-arrow-right';
            icon.style.transform = 'rotate(0deg)';
        } else if (type === 'Roundabout') {
            icon.className = 'fas fa-sync';
            icon.style.transform = 'rotate(0deg)';
        } else if (type === 'DestinationReached') {
            icon.className = 'fas fa-flag-checkered';
            icon.style.transform = 'rotate(0deg)';
            this.finishDriving();
        } else {
            icon.className = 'fas fa-arrow-up';
            icon.style.transform = 'rotate(0deg)';
        }
    },
    
    // ========== UI ==========
    
    updateUI() {
        // Vitesse
        document.getElementById('speedValue').textContent = state.currentSpeed;
        
        // Stats
        if (state.startTime && state.totalDuration > 0) {
            const elapsed = (Date.now() - state.startTime) / 1000 / 60;
            const progress = Math.min(100, (elapsed / state.totalDuration) * 100);
            
            document.getElementById('statDistance').textContent = `${state.totalDistance.toFixed(1)} km`;
            document.getElementById('statTime').textContent = `${Math.round(elapsed)} min`;
            document.getElementById('statQuestions').textContent = `${state.correctAnswers}/${state.totalQuestions}`;
            document.getElementById('progressFill').style.width = `${progress}%`;
            document.getElementById('progressText').textContent = `Progression: ${Math.round(progress)}%`;
            
            // Fin du parcours
            if (elapsed >= state.totalDuration) {
                this.finishDriving();
            }
        }
    },
    
    toggleStats() {
        const panel = document.getElementById('statsPanel');
        panel.classList.toggle('active');
    },
    
    // ========== QUESTIONS ==========
    
    checkQuestion() {
        // Ne pas poser trop de questions
        if (state.totalQuestions >= 5) return;
        
        // Attendre au moins 1 minute entre chaque question
        const timeSinceLastQuestion = Date.now() - state.lastQuestionTime;
        if (timeSinceLastQuestion < 60000) return;
        
        // 5% de chance de poser une question à chaque mise à jour GPS
        if (Math.random() > 0.05) return;
        
        // Sélectionner une question non posée
        const availableQuestions = CONFIG.QUESTIONS.filter(
            q => !state.askedQuestions.includes(q.q)
        );
        
        if (availableQuestions.length > 0) {
            const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
            this.showQuestion(question);
            state.lastQuestionTime = Date.now();
        }
    },
    
    showQuestion(question) {
        state.askedQuestions.push(question.q);
        state.totalQuestions++;
        
        const modal = document.getElementById('questionModal');
        const text = document.getElementById('questionText');
        const grid = document.getElementById('answersGrid');
        const btn = document.getElementById('btnContinue');
        
        text.textContent = question.q;
        grid.innerHTML = '';
        btn.classList.remove('active');
        
        question.a.forEach((answer, index) => {
            const answerBtn = document.createElement('button');
            answerBtn.className = 'answer-btn';
            answerBtn.textContent = answer;
            answerBtn.onclick = () => this.selectAnswer(answerBtn, index, question.correct);
            grid.appendChild(answerBtn);
        });
        
        modal.classList.add('active');
    },
    
    selectAnswer(button, index, correctIndex) {
        // Désactiver tous les boutons
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.onclick = null;
            btn.classList.add('disabled');
        });
        
        // Marquer la bonne/mauvaise réponse
        if (index === correctIndex) {
            button.classList.add('correct');
            state.correctAnswers++;
            this.showToast('Bonne réponse ! 👍', 'success');
        } else {
            button.classList.add('incorrect');
            document.querySelectorAll('.answer-btn')[correctIndex].classList.add('correct');
            this.showToast('Réponse incorrecte', 'error');
        }
        
        // Afficher le bouton continuer
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
        
        // Réinitialisation
        state.currentPosition = null;
        state.startPosition = null;
        state.startTime = null;
        state.route = null;
        state.instructions = [];
        state.currentInstructionIndex = 0;
        state.totalDistance = 0;
        state.totalDuration = 0;
        state.askedQuestions = [];
        state.correctAnswers = 0;
        state.totalQuestions = 0;
        state.lastQuestionTime = 0;
        state.currentSpeed = 0;
        state.isTracking = true;
        
        this.showDriving();
        
        setTimeout(() => {
            this.startGPSTracking();
        }, 300);
    },
    
    stopDriving() {
        if (confirm('❓ Arrêter le parcours ?')) {
            this.finishDriving();
        }
    },
    
    finishDriving() {
        this.stopGPSTracking();
        
        const totalTime = state.startTime ? Math.round((Date.now() - state.startTime) / 1000 / 60) : 0;
        
        document.getElementById('finalDistance').textContent = `${state.totalDistance.toFixed(1)} km`;
        document.getElementById('finalTime').textContent = `${totalTime} min`;
        document.getElementById('finalQuestions').textContent = `${state.correctAnswers}/${state.totalQuestions}`;
        
        document.getElementById('finishModal').classList.add('active');
    },
    
    newRoute() {
        document.getElementById('finishModal').classList.remove('active');
        setTimeout(() => this.showConfig(), 300);
    },
    
    // ========== UTILITAIRES ==========
    
    calculateDistance(pos1, pos2) {
        const R = 6371; // Rayon de la Terre en km
        const dLat = this.toRad(pos2.lat - pos1.lat);
        const dLng = this.toRad(pos2.lng - pos1.lng);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this.toRad(pos1.lat)) * Math.cos(this.toRad(pos2.lat)) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },
    
    calculateBearing(pos1, pos2) {
        const lat1 = this.toRad(pos1.lat);
        const lat2 = this.toRad(pos2.lat);
        const dLng = this.toRad(pos2.lng - pos1.lng);
        
        const y = Math.sin(dLng) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) -
                  Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
        
        const bearing = Math.atan2(y, x);
        return (this.toDeg(bearing) + 360) % 360;
    },
    
    toRad(degrees) {
        return degrees * Math.PI / 180;
    },
    
    toDeg(radians) {
        return radians * 180 / Math.PI;
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
        
        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
        `;
        
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

// Export global
window.app = app;