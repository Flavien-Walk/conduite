/* ==================== CONFIGURATION GLOBALE ==================== */

const CONFIG = {
    // Centre de Lyon
    LYON_CENTER: { lat: 45.764043, lng: 4.835659 },
    
    // Zones géographiques
    ZONES: [
        'Lyon 1', 'Lyon 2', 'Lyon 3', 'Lyon 4', 'Lyon 5',
        'Lyon 6', 'Lyon 7', 'Lyon 8', 'Lyon 9',
        'Villeurbanne', 'Oullins', 'Pierre-Bénite',
        'Saint-Priest', 'Caluire-et-Cuire', 'Écully',
        'Bron', 'Tassin-la-Demi-Lune', 'Vénissieux',
        'Décines', 'Meyzieu', 'Routes de campagne'
    ],
    
    // Types de parcours
    CATEGORIES: [
        { id: 'agglomeration', name: 'Agglomération', icon: 'fa-city', speedLimit: 50 },
        { id: 'priority', name: 'Priorité', icon: 'fa-exclamation-triangle', speedLimit: 50 },
        { id: 'roundabout', name: 'Rond-point', icon: 'fa-sync', speedLimit: 30 },
        { id: 'autoroute', name: 'Autoroute', icon: 'fa-road', speedLimit: 130 },
        { id: 'campagne', name: 'Campagne', icon: 'fa-tree', speedLimit: 80 },
        { id: 'zone30', name: 'Zone 30', icon: 'fa-school', speedLimit: 30 }
    ],
    
    // Descriptions de difficulté
    DIFFICULTY_LABELS: [
        { level: 1, name: 'Débutant', desc: 'Parcours simple avec peu de manœuvres' },
        { level: 2, name: 'Facile', desc: 'Parcours accessible avec quelques variations' },
        { level: 3, name: 'Intermédiaire', desc: 'Parcours varié avec alternance de situations courantes' },
        { level: 4, name: 'Avancé', desc: 'Parcours complexe avec nombreuses situations' },
        { level: 5, name: 'Expert', desc: 'Parcours très exigeant avec situations multiples' }
    ],
    
    // Options GPS
    GPS_OPTIONS: {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
    }
};

/* ==================== BANQUE DE QUESTIONS ==================== */

const QUESTIONS = {
    agglomeration: [
        {
            question: "Vous entrez en agglomération, quelle est la vitesse maximale autorisée ?",
            answers: ["30 km/h", "50 km/h", "70 km/h", "90 km/h"],
            correct: 1
        },
        {
            question: "En agglomération, à quelle distance minimale devez-vous stationner d'un passage piéton ?",
            answers: ["3 mètres", "5 mètres", "10 mètres", "15 mètres"],
            correct: 1
        },
        {
            question: "En ville, vous devez particulièrement surveiller...",
            answers: ["Les piétons", "Les cyclistes", "Les deux-roues", "Tous ces usagers"],
            correct: 3
        }
    ],
    campagne: [
        {
            question: "Sur une route de campagne bidirectionnelle, quelle est la vitesse maximale ?",
            answers: ["70 km/h", "80 km/h", "90 km/h", "110 km/h"],
            correct: 1
        },
        {
            question: "En campagne, vous devez adapter votre vitesse selon...",
            answers: ["La visibilité", "L'état de la route", "Les conditions météo", "Tous ces éléments"],
            correct: 3
        },
        {
            question: "Sur route de campagne, la distance de sécurité recommandée est...",
            answers: ["Distance parcourue en 2 secondes", "50 mètres", "100 mètres", "Distance d'arrêt"],
            correct: 0
        }
    ],
    autoroute: [
        {
            question: "Sur autoroute, quelle est la vitesse minimale autorisée ?",
            answers: ["50 km/h", "60 km/h", "70 km/h", "80 km/h"],
            correct: 3
        },
        {
            question: "Sur autoroute par temps de pluie, la vitesse maximale est...",
            answers: ["100 km/h", "110 km/h", "120 km/h", "130 km/h"],
            correct: 1
        },
        {
            question: "Pour doubler sur autoroute, vous devez...",
            answers: ["Accélérer fortement", "Contrôler angles morts", "Klaxonner", "Mettre warnings"],
            correct: 1
        }
    ],
    roundabout: [
        {
            question: "À un rond-point, à qui devez-vous céder le passage ?",
            answers: ["Véhicules à droite", "Véhicules à gauche", "Véhicules déjà engagés", "Personne"],
            correct: 2
        },
        {
            question: "Pour sortir d'un rond-point, vous devez mettre le clignotant...",
            answers: ["À gauche", "À droite", "Pas de clignotant", "Les deux"],
            correct: 1
        },
        {
            question: "Dans un rond-point, vous devez...",
            answers: ["Accélérer", "Ralentir et observer", "Garder la même vitesse", "Klaxonner"],
            correct: 1
        }
    ],
    priority: [
        {
            question: "À une intersection sans signalisation, qui a la priorité ?",
            answers: ["Véhicules de gauche", "Véhicules de droite", "Le plus rapide", "Le premier arrivé"],
            correct: 1
        },
        {
            question: "Le panneau 'Cédez le passage' vous oblige à...",
            answers: ["Vous arrêter obligatoirement", "Ralentir et céder", "Accélérer", "Klaxonner"],
            correct: 1
        },
        {
            question: "À un feu orange, vous devez...",
            answers: ["Accélérer", "Vous arrêter si possible", "Toujours passer", "Klaxonner"],
            correct: 1
        }
    ],
    zone30: [
        {
            question: "Dans une zone 30, quelle est la vitesse maximale autorisée ?",
            answers: ["20 km/h", "30 km/h", "40 km/h", "50 km/h"],
            correct: 1
        },
        {
            question: "Une zone 30 est souvent mise en place...",
            answers: ["Près des écoles", "Zones résidentielles", "Pour protéger piétons", "Toutes ces réponses"],
            correct: 3
        },
        {
            question: "En zone 30, votre attention doit être maximale car...",
            answers: ["Piétons plus nombreux", "Enfants peuvent surgir", "Visibilité réduite", "Toutes ces raisons"],
            correct: 3
        }
    ]
};

/* ==================== ÉTAT DE L'APPLICATION ==================== */

const appState = {
    // Configuration du parcours
    selectedZones: [],
    selectedCategories: [],
    duration: 60, // minutes
    difficulty: 3,
    
    // État de navigation
    map: null,
    watchId: null,
    currentPosition: null,
    startPosition: null,
    startTime: null,
    
    // Données de parcours
    route: [],
    routePolyline: null,
    markers: [],
    currentWaypoint: 0,
    totalDistance: 0,
    distanceCovered: 0,
    
    // Questions
    questionsAsked: [],
    correctAnswers: 0,
    totalQuestions: 0,
    lastQuestionTime: 0,
    
    // UI
    currentSpeed: 0,
    soundEnabled: true,
    isTracking: false
};

/* ==================== APPLICATION PRINCIPALE ==================== */

const app = {
    
    init() {
        console.log('🚗 Drive Lyon - Initialisation...');
        this.setupEventListeners();
        this.initSelectionScreen();
        this.requestPermissions();
    },
    
    setupEventListeners() {
        // Gestion du redimensionnement
        window.addEventListener('resize', () => {
            if (appState.map) {
                appState.map.invalidateSize();
            }
        });
        
        // Empêcher la mise en veille
        this.preventSleep();
    },
    
    async requestPermissions() {
        // Demander la permission de géolocalisation
        if ('geolocation' in navigator) {
            try {
                await navigator.geolocation.getCurrentPosition(() => {
                    console.log('✓ GPS autorisé');
                }, () => {
                    console.warn('GPS non autorisé');
                });
            } catch (err) {
                console.error('Erreur GPS:', err);
            }
        }
        
        // Wake Lock
        if ('wakeLock' in navigator) {
            try {
                await navigator.wakeLock.request('screen');
                console.log('✓ Wake Lock activé');
            } catch (err) {
                console.warn('Wake Lock non disponible');
            }
        }
    },
    
    preventSleep() {
        // Empêcher la mise en veille pendant la conduite
        let wakeLock = null;
        
        const requestWakeLock = async () => {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
            } catch (err) {
                console.log('Wake Lock:', err);
            }
        };
        
        document.addEventListener('visibilitychange', () => {
            if (wakeLock && document.visibilityState === 'visible') {
                requestWakeLock();
            }
        });
    },
    
    /* ==================== NAVIGATION ==================== */
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            
            // Redimensionner la carte si on revient sur l'écran de conduite
            if (screenId === 'drivingScreen' && appState.map) {
                setTimeout(() => appState.map.invalidateSize(), 100);
            }
        }
    },
    
    /* ==================== ÉCRAN DE SÉLECTION ==================== */
    
    initSelectionScreen() {
        this.renderZones();
        this.renderCategories();
        this.setupSliders();
    },
    
    renderZones() {
        const container = document.getElementById('zonesContainer');
        container.innerHTML = '';
        
        CONFIG.ZONES.forEach(zone => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.textContent = zone;
            chip.addEventListener('click', () => this.toggleZone(chip, zone));
            container.appendChild(chip);
        });
    },
    
    renderCategories() {
        const container = document.getElementById('categoriesContainer');
        container.innerHTML = '';
        
        CONFIG.CATEGORIES.forEach(category => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.innerHTML = `<i class="fas ${category.icon}"></i> ${category.name}`;
            chip.dataset.categoryId = category.id;
            chip.addEventListener('click', () => this.toggleCategory(chip, category.id));
            container.appendChild(chip);
        });
    },
    
    toggleZone(element, zone) {
        element.classList.toggle('selected');
        const index = appState.selectedZones.indexOf(zone);
        
        if (index > -1) {
            appState.selectedZones.splice(index, 1);
        } else {
            appState.selectedZones.push(zone);
        }
    },
    
    toggleCategory(element, categoryId) {
        element.classList.toggle('selected');
        const index = appState.selectedCategories.indexOf(categoryId);
        
        if (index > -1) {
            appState.selectedCategories.splice(index, 1);
        } else {
            appState.selectedCategories.push(categoryId);
        }
    },
    
    setupSliders() {
        // Slider durée
        const durationSlider = document.getElementById('durationSlider');
        const durationValue = document.getElementById('durationValue');
        
        durationSlider.addEventListener('input', (e) => {
            appState.duration = parseInt(e.target.value);
            durationValue.textContent = `${appState.duration} minutes`;
        });
        
        // Slider difficulté
        const difficultySlider = document.getElementById('difficultySlider');
        const difficultyLabel = document.getElementById('difficultyLabel');
        const difficultyDesc = document.getElementById('difficultyDescription');
        
        this.updateDifficultyStars(3);
        
        difficultySlider.addEventListener('input', (e) => {
            appState.difficulty = parseInt(e.target.value);
            const info = CONFIG.DIFFICULTY_LABELS.find(d => d.level === appState.difficulty);
            difficultyLabel.textContent = info.name;
            difficultyDesc.textContent = info.desc;
            this.updateDifficultyStars(appState.difficulty);
        });
    },
    
    updateDifficultyStars(level) {
        const container = document.getElementById('difficultyStars');
        container.innerHTML = '';
        
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('i');
            star.className = `fas fa-star star ${i <= level ? 'active' : ''}`;
            container.appendChild(star);
        }
    },
    
    /* ==================== DÉMARRAGE DU PARCOURS ==================== */
    
    startDriving() {
        // Validation
        if (appState.selectedZones.length === 0) {
            alert('⚠️ Sélectionnez au moins une zone géographique');
            return;
        }
        
        if (appState.selectedCategories.length === 0) {
            alert('⚠️ Sélectionnez au moins un type de parcours');
            return;
        }
        
        // Réinitialisation
        this.resetDrivingState();
        
        // Afficher l'écran de conduite
        this.showScreen('drivingScreen');
        
        // Initialiser la carte et le GPS
        setTimeout(() => {
            this.initMap();
            this.startGPS();
        }, 300);
    },
    
    resetDrivingState() {
        appState.currentPosition = null;
        appState.startPosition = null;
        appState.startTime = null;
        appState.route = [];
        appState.currentWaypoint = 0;
        appState.totalDistance = 0;
        appState.distanceCovered = 0;
        appState.questionsAsked = [];
        appState.correctAnswers = 0;
        appState.totalQuestions = 0;
        appState.currentSpeed = 0;
        appState.lastQuestionTime = 0;
        appState.isTracking = true;
    },
    
    /* ==================== CARTE LEAFLET ==================== */
    
    initMap() {
        if (appState.map) {
            appState.map.remove();
        }
        
        // Créer la carte
        appState.map = L.map('map', {
            center: [CONFIG.LYON_CENTER.lat, CONFIG.LYON_CENTER.lng],
            zoom: 13,
            zoomControl: true,
            attributionControl: true
        });
        
        // Ajouter les tuiles OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(appState.map);
        
        // Style personnalisé pour le bouton de zoom
        setTimeout(() => {
            const zoomControl = document.querySelector('.leaflet-control-zoom');
            if (zoomControl) {
                zoomControl.style.border = 'none';
                zoomControl.style.borderRadius = '12px';
                zoomControl.style.overflow = 'hidden';
                zoomControl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }
        }, 100);
    },
    
    /* ==================== GPS ==================== */
    
    startGPS() {
        if (!navigator.geolocation) {
            alert('❌ GPS non disponible sur cet appareil');
            return;
        }
        
        appState.watchId = navigator.geolocation.watchPosition(
            (position) => this.onPositionUpdate(position),
            (error) => this.onPositionError(error),
            CONFIG.GPS_OPTIONS
        );
    },
    
    onPositionUpdate(position) {
        const { latitude, longitude, speed, heading } = position.coords;
        
        appState.currentPosition = { lat: latitude, lng: longitude };
        
        // Première position = point de départ
        if (!appState.startPosition) {
            appState.startPosition = { lat: latitude, lng: longitude };
            appState.startTime = Date.now();
            
            // Générer le parcours
            this.generateRoute();
            
            // Centrer la carte
            appState.map.setView([latitude, longitude], 15);
        }
        
        // Calcul de la vitesse
        if (speed !== null && speed >= 0) {
            appState.currentSpeed = Math.round(speed * 3.6); // m/s -> km/h
        } else {
            // Calcul manuel si speed non disponible
            if (appState.lastPosition && appState.lastPositionTime) {
                const distance = this.calculateDistance(appState.lastPosition, appState.currentPosition);
                const time = (Date.now() - appState.lastPositionTime) / 1000; // secondes
                if (time > 0) {
                    appState.currentSpeed = Math.round((distance / time) * 3.6);
                }
            }
        }
        
        appState.lastPosition = appState.currentPosition;
        appState.lastPositionTime = Date.now();
        
        // Mettre à jour l'UI
        this.updateUI();
        
        // Vérifier si on doit poser une question
        this.checkQuestion();
        
        // Mettre à jour la position sur la carte
        this.updateMapPosition(latitude, longitude, heading);
    },
    
    onPositionError(error) {
        console.error('Erreur GPS:', error);
        const statusEl = document.getElementById('gpsStatus');
        if (statusEl) {
            statusEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Erreur GPS</span>';
            statusEl.style.color = '#ef4444';
        }
    },
    
    updateMapPosition(lat, lng, heading) {
        // Supprimer l'ancien marqueur de position
        if (appState.userMarker) {
            appState.map.removeLayer(appState.userMarker);
        }
        
        // Icône personnalisée de position
        const userIcon = L.divIcon({
            className: 'user-position-marker',
            html: `<div style="width: 20px; height: 20px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: 4px solid white; border-radius: 50%; box-shadow: 0 4px 12px rgba(99,102,241,0.5);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        
        appState.userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(appState.map);
        
        // Centrer la carte sur la position (si le suivi est activé)
        if (appState.isTracking) {
            appState.map.setView([lat, lng], appState.map.getZoom(), { animate: true, duration: 0.5 });
        }
    },
    
    centerMap() {
        if (appState.currentPosition) {
            appState.isTracking = true;
            appState.map.setView([appState.currentPosition.lat, appState.currentPosition.lng], 15, {
                animate: true,
                duration: 0.5
            });
        }
    },
    
    /* ==================== GÉNÉRATION DE PARCOURS ==================== */
    
    generateRoute() {
        const durationMinutes = appState.duration;
        const avgSpeed = 40; // km/h moyen
        const totalDistanceKm = (durationMinutes / 60) * avgSpeed;
        appState.totalDistance = totalDistanceKm;
        
        // Nombre de waypoints selon difficulté
        const numWaypoints = 6 + (appState.difficulty * 2);
        
        const route = [];
        const start = appState.startPosition;
        
        // Rayon du parcours (en degrés)
        const baseRadius = totalDistanceKm / 80;
        const radius = baseRadius * (0.6 + appState.difficulty * 0.2);
        
        // Générer des points en boucle
        for (let i = 0; i < numWaypoints; i++) {
            const angle = (i / numWaypoints) * 2 * Math.PI;
            const distance = radius * (0.7 + Math.random() * 0.6);
            const randomOffset = (Math.random() - 0.5) * 0.3;
            
            // Catégorie aléatoire parmi celles sélectionnées
            const categoryId = appState.selectedCategories[
                Math.floor(Math.random() * appState.selectedCategories.length)
            ];
            
            const category = CONFIG.CATEGORIES.find(c => c.id === categoryId);
            
            const waypoint = {
                lat: start.lat + (distance * Math.cos(angle + randomOffset)),
                lng: start.lng + (distance * Math.sin(angle + randomOffset)),
                category: category,
                type: 'waypoint'
            };
            
            route.push(waypoint);
        }
        
        // Point final = retour au départ
        route.push({
            lat: start.lat,
            lng: start.lng,
            category: CONFIG.CATEGORIES.find(c => c.id === 'agglomeration'),
            type: 'end'
        });
        
        appState.route = route;
        
        // Dessiner le parcours
        this.drawRoute();
    },
    
    drawRoute() {
        // Supprimer l'ancien tracé
        if (appState.routePolyline) {
            appState.map.removeLayer(appState.routePolyline);
        }
        
        // Supprimer les anciens marqueurs
        appState.markers.forEach(marker => appState.map.removeLayer(marker));
        appState.markers = [];
        
        // Créer le tracé
        const latlngs = appState.route.map(point => [point.lat, point.lng]);
        
        appState.routePolyline = L.polyline(latlngs, {
            color: '#6366f1',
            weight: 5,
            opacity: 0.8,
            smoothFactor: 1,
            lineJoin: 'round'
        }).addTo(appState.map);
        
        // Ajouter les marqueurs
        appState.route.forEach((point, index) => {
            let markerColor = '#6366f1';
            let iconHtml = '<i class="fas fa-circle"></i>';
            
            if (point.type === 'end') {
                markerColor = '#ef4444';
                iconHtml = '<i class="fas fa-flag-checkered"></i>';
            } else if (index === 0) {
                markerColor = '#10b981';
                iconHtml = '<i class="fas fa-play"></i>';
            }
            
            const icon = L.divIcon({
                className: 'waypoint-marker',
                html: `<div style="color: ${markerColor}; font-size: 1.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${iconHtml}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            const marker = L.marker([point.lat, point.lng], { icon: icon })
                .bindPopup(`<b>${point.category.name}</b><br>Limite: ${point.category.speedLimit} km/h`)
                .addTo(appState.map);
            
            appState.markers.push(marker);
        });
        
        // Ajuster la vue pour voir tout le parcours
        const bounds = L.latLngBounds(latlngs);
        appState.map.fitBounds(bounds, { padding: [50, 50] });
    },
    
    /* ==================== MISE À JOUR UI ==================== */
    
    updateUI() {
        // Vitesse
        document.getElementById('speedValue').textContent = appState.currentSpeed;
        
        // Limite de vitesse du segment actuel
        if (appState.route.length > 0 && appState.currentWaypoint < appState.route.length) {
            const currentSegment = appState.route[appState.currentWaypoint];
            const speedLimitEl = document.getElementById('speedLimit');
            if (speedLimitEl) {
                const limitSpan = speedLimitEl.querySelector('span');
                if (limitSpan) {
                    limitSpan.textContent = currentSegment.category.speedLimit;
                }
                
                // Changer la couleur si vitesse dépassée
                if (appState.currentSpeed > currentSegment.category.speedLimit) {
                    speedLimitEl.style.borderColor = '#ef4444';
                    speedLimitEl.style.animation = 'pulse 0.5s ease-in-out infinite';
                } else {
                    speedLimitEl.style.borderColor = '#10b981';
                    speedLimitEl.style.animation = 'none';
                }
            }
        }
        
        // Temps écoulé et restant
        if (appState.startTime) {
            const elapsed = (Date.now() - appState.startTime) / 1000 / 60; // minutes
            const remaining = Math.max(0, appState.duration - elapsed);
            document.getElementById('timeValue').textContent = `${Math.round(remaining)} min`;
            
            // Progression
            const progress = Math.min(100, (elapsed / appState.duration) * 100);
            document.getElementById('progressBar').style.width = `${progress}%`;
            document.getElementById('progressPercent').textContent = `${Math.round(progress)}%`;
            
            // Distance restante (estimation)
            const distanceRemaining = appState.totalDistance * (1 - progress / 100);
            document.getElementById('distanceValue').textContent = `${distanceRemaining.toFixed(1)} km`;
            
            // Score questions
            document.getElementById('scoreValue').textContent = `${appState.correctAnswers}/${appState.totalQuestions}`;
            
            // Vérifier fin du parcours
            if (remaining <= 0 || progress >= 100) {
                this.finishDriving();
            }
        }
        
        // Distance au prochain waypoint
        if (appState.currentPosition && appState.route.length > 0 && appState.currentWaypoint < appState.route.length) {
            const nextPoint = appState.route[appState.currentWaypoint];
            const distance = this.calculateDistance(appState.currentPosition, nextPoint);
            const distanceMeters = Math.round(distance * 1000);
            
            document.getElementById('nextTurnDistance').textContent = distanceMeters > 1000 
                ? `${(distance).toFixed(1)} km`
                : `${distanceMeters} m`;
            
            document.getElementById('streetName').textContent = `Vers ${nextPoint.category.name}`;
            
            // Si proche du waypoint, passer au suivant
            if (distance < 0.05) { // 50 mètres
                appState.currentWaypoint++;
            }
        }
    },
    
    /* ==================== QUESTIONS PÉDAGOGIQUES ==================== */
    
    checkQuestion() {
        // Éviter de poser trop de questions
        const timeSinceLastQuestion = Date.now() - appState.lastQuestionTime;
        if (timeSinceLastQuestion < 60000) return; // Minimum 1 minute entre questions
        
        if (appState.totalQuestions >= 10) return; // Maximum 10 questions
        
        // 5% de chance à chaque update GPS
        if (Math.random() > 0.05) return;
        
        // Trouver la catégorie actuelle
        if (appState.route.length === 0 || appState.currentWaypoint >= appState.route.length) return;
        
        const currentSegment = appState.route[appState.currentWaypoint];
        const categoryId = currentSegment.category.id;
        
        if (QUESTIONS[categoryId]) {
            const questions = QUESTIONS[categoryId];
            const availableQuestions = questions.filter(q => 
                !appState.questionsAsked.includes(q.question)
            );
            
            if (availableQuestions.length > 0) {
                const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
                this.showQuestion(question);
                appState.lastQuestionTime = Date.now();
            }
        }
    },
    
    showQuestion(question) {
        appState.questionsAsked.push(question.question);
        appState.totalQuestions++;
        
        const modal = document.getElementById('questionModal');
        const questionText = document.getElementById('questionText');
        const answersContainer = document.getElementById('answersContainer');
        const continueBtn = document.getElementById('continueBtn');
        
        questionText.textContent = question.question;
        answersContainer.innerHTML = '';
        continueBtn.classList.remove('visible');
        
        question.answers.forEach((answer, index) => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.textContent = answer;
            btn.onclick = () => this.selectAnswer(btn, index, question.correct);
            answersContainer.appendChild(btn);
        });
        
        modal.classList.add('active');
    },
    
    selectAnswer(button, index, correctIndex) {
        // Désactiver tous les boutons
        const buttons = document.querySelectorAll('.answer-btn');
        buttons.forEach(btn => {
            btn.onclick = null;
            btn.classList.add('disabled');
        });
        
        // Marquer la réponse
        if (index === correctIndex) {
            button.classList.add('correct');
            appState.correctAnswers++;
        } else {
            button.classList.add('incorrect');
            buttons[correctIndex].classList.add('correct');
        }
        
        // Afficher le bouton continuer
        const continueBtn = document.getElementById('continueBtn');
        continueBtn.classList.add('visible');
        
        // Mettre à jour le score
        this.updateUI();
    },
    
    closeQuestion() {
        document.getElementById('questionModal').classList.remove('active');
    },
    
    /* ==================== FIN DU PARCOURS ==================== */
    
    stopDriving() {
        if (confirm('❓ Voulez-vous vraiment arrêter le parcours ?')) {
            this.finishDriving();
        }
    },
    
    finishDriving() {
        // Arrêter le GPS
        if (appState.watchId) {
            navigator.geolocation.clearWatch(appState.watchId);
            appState.watchId = null;
        }
        
        // Calculer les stats
        const totalTime = appState.startTime 
            ? Math.round((Date.now() - appState.startTime) / 1000 / 60)
            : 0;
        
        // Afficher la modal de fin
        document.getElementById('totalDistanceFinal').textContent = `${appState.totalDistance.toFixed(1)} km`;
        document.getElementById('totalTimeFinal').textContent = `${totalTime} min`;
        document.getElementById('correctAnswers').textContent = `${appState.correctAnswers}/${appState.totalQuestions}`;
        
        document.getElementById('finishModal').classList.add('active');
        
        // Nettoyer
        setTimeout(() => {
            document.getElementById('finishModal').classList.remove('active');
        }, 10000);
    },
    
    /* ==================== SON ==================== */
    
    toggleSound() {
        appState.soundEnabled = !appState.soundEnabled;
        const icon = document.getElementById('soundIcon');
        if (icon) {
            icon.className = appState.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        }
    },
    
    /* ==================== UTILITAIRES ==================== */
    
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
    
    toRad(degrees) {
        return degrees * Math.PI / 180;
    }
};

/* ==================== DÉMARRAGE ==================== */

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Exposer l'app globalement pour les onclick du HTML
window.app = app;