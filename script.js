/* ============================================================
   WEDDING SITE — script.js
   Enveloppe intro, URL Permissions, Countdown, RSVP Form, Musique
   ============================================================ */

(function () {
    'use strict';

    // =====================================================
    // CONFIG — À MODIFIER
    // =====================================================
    // Date du mariage (mois 0-indexé : 6 = juillet)
    const WEDDING_DATE = new Date(2026, 6, 29, 17, 30, 0);

    // URL du Google Apps Script déployé (remplace par ton URL)
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyzuTKCTphiEIBc6t1fSQqgRrzwh1gJUFA5BFjafW3I1K4m1xTVf6tV6PdrFke-Zr6b/exec';

    // Clé de session pour mémoriser l'ouverture de l'enveloppe
    const ENVELOPE_KEY = 'envelopeOpened';

    // =====================================================
    // OVERLAY ENVELOPPE (intro)
    // =====================================================
    const envelopeOverlay = document.getElementById('envelopeOverlay');
    const envelope = document.getElementById('envelope');

    // Si déjà ouvert dans cette session, on masque tout de suite
    if (envelopeOverlay && sessionStorage.getItem(ENVELOPE_KEY) === 'true') {
        envelopeOverlay.style.display = 'none';
    } else if (envelopeOverlay) {
        // Empêcher le scroll du body tant que l'overlay est actif
        document.body.classList.add('envelope-open');
    }

    function openEnvelope() {
        if (!envelopeOverlay) return;

        // Marque comme ouvert dans cette session
        try { sessionStorage.setItem(ENVELOPE_KEY, 'true'); } catch (e) { /* silencieux */ }

        // Déclenche l'animation d'ouverture
        envelopeOverlay.classList.add('is-opening');
        document.body.classList.remove('envelope-open');

        // Tente de lancer la musique (le clic sur l'enveloppe EST l'interaction utilisateur)
        const audio = document.getElementById('bgMusic');
        const btn = document.getElementById('btnMusic');
        if (audio && btn) {
            audio.volume = 0.4;
            audio.play()
                .then(() => {
                    btn.classList.add('is-playing');
                    btn.setAttribute('aria-pressed', 'true');
                    btn.setAttribute('aria-label', 'Couper la musique');
                })
                .catch(() => { /* silencieux : l'utilisateur pourra cliquer sur le bouton */ });
        }

        // Retire complètement l'overlay du DOM après l'animation
        setTimeout(() => {
            envelopeOverlay.style.display = 'none';
        }, 800);
    }

    if (envelope) {
        envelope.addEventListener('click', openEnvelope);
        // Support clavier (accessibilité)
        envelope.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openEnvelope();
            }
        });
    }

    // =====================================================
    // PERMISSIONS PAR PARAMÈTRE URL
    // =====================================================
    function getInviteLevel() {
        const search = window.location.search.toLowerCase();
        // ?latotale → accès total (mairie + cocktail + chabat)
        if (search.includes('latotale')) return 'latotale';
        // ?classico → mairie + cocktail
        if (search.includes('classico')) return 'classico';
        // ?labase (ou par défaut) → cocktail uniquement
        return 'labase';
    }

    function applyPermissions() {
        const level = getInviteLevel();

        // Définir la visibilité selon le niveau
        const showMairie = level === 'classico' || level === 'latotale';
        const showChabat = level === 'latotale';

        // Masquer/afficher les SECTIONS entières via la classe .section-hidden
        document.querySelectorAll('.nav-mairie').forEach(el => {
            el.classList.toggle('section-hidden', !showMairie);
        });
        document.querySelectorAll('.nav-chabat').forEach(el => {
            el.classList.toggle('section-hidden', !showChabat);
        });

        // Champs RSVP conditionnels (inchangé — toujours en display inline)
        document.querySelectorAll('.rsvp-field-mairie').forEach(el => {
            el.style.display = showMairie ? '' : 'none';
        });
        document.querySelectorAll('.rsvp-field-chabat').forEach(el => {
            el.style.display = showChabat ? '' : 'none';
        });
    }

    // =====================================================
    // COUNTDOWN (avec mois)
    // =====================================================
    function updateCountdown() {
        const now = new Date();

        if (WEDDING_DATE <= now) {
            document.getElementById('cd-months').textContent = '0';
            document.getElementById('cd-days').textContent = '0';
            document.getElementById('cd-hours').textContent = '0';
            document.getElementById('cd-mins').textContent = '0';
            document.getElementById('cd-secs').textContent = '0';
            return;
        }

        // Calcul des mois complets restants
        let months = (WEDDING_DATE.getFullYear() - now.getFullYear()) * 12
                   + (WEDDING_DATE.getMonth() - now.getMonth());
        // Date fictive = maintenant + ces mois
        const tempDate = new Date(now);
        tempDate.setMonth(tempDate.getMonth() + months);
        // Si on a dépassé la date cible, on retire un mois
        if (tempDate > WEDDING_DATE) {
            months--;
            tempDate.setMonth(tempDate.getMonth() - 1);
        }

        const diff = WEDDING_DATE - tempDate;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        document.getElementById('cd-months').textContent = months;
        document.getElementById('cd-days').textContent = days;
        document.getElementById('cd-hours').textContent = hours;
        document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
        document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // =====================================================
    // NAVBAR — scroll effect + fermeture menu après clic sur un lien
    // =====================================================
    const mainNav = document.getElementById('mainNav');

    if (mainNav) {
        // Effet "scrolled" qui densifie la navbar après 50px de scroll
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                mainNav.classList.add('scrolled');
            } else {
                mainNav.classList.remove('scrolled');
            }
        }, { passive: true });

        // Fermer le menu hamburger après un clic sur un lien (UX mobile)
        document.querySelectorAll('#navMenu .nav-link').forEach(link => {
            link.addEventListener('click', () => {
                const navCollapse = document.getElementById('navMenu');
                if (navCollapse && navCollapse.classList.contains('show')) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navCollapse)
                                     || new bootstrap.Collapse(navCollapse, { toggle: false });
                    bsCollapse.hide();
                }
            });
        });
    }

    // =====================================================
    // RSVP FORM
    // =====================================================
    const form = document.getElementById('rsvpForm');
    const formCard = document.getElementById('rsvpFormCard');
    const successCard = document.getElementById('rsvpSuccess');
    const btnSubmit = document.getElementById('btnSubmit');

    // ----- Affichage conditionnel des "nombre de personnes" selon Oui/Non -----
    // Paires : [nom du groupe radio, id du wrapper du select nb personnes]
    const presenceToggles = [
        { radioName: 'presenceMairie',   wrapId: 'nbMairieWrap' },
        { radioName: 'presenceCocktail', wrapId: 'nbCocktailWrap' },
        { radioName: 'presenceChabat',   wrapId: 'nbChabatWrap' }
    ];

    // Fonction qui met à jour la visibilité d'un wrapper selon l'état des radios
    function syncNbWrap(radioName, wrap) {
        const checked = form.querySelector(`input[name="${radioName}"]:checked`);
        wrap.style.display = (checked && checked.value === 'Oui') ? '' : 'none';
    }

    presenceToggles.forEach(({ radioName, wrapId }) => {
        const radios = form.querySelectorAll(`input[name="${radioName}"]`);
        const wrap = document.getElementById(wrapId);
        if (!wrap) return;

        // Synchro initiale (utile si le navigateur pré-remplit le formulaire au rechargement)
        syncNbWrap(radioName, wrap);

        // Synchro à chaque changement de radio
        radios.forEach(radio => {
            radio.addEventListener('change', () => syncNbWrap(radioName, wrap));
        });
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Validation simple
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        // Helper : si la personne dit Oui, prend la valeur du select ; sinon 0
        // Si l'événement n'est pas disponible pour son niveau d'invitation : vide
        const getNbPersonnes = (presenceValue, selectEl, isInvited) => {
            if (!isInvited) return '';
            if (presenceValue === 'Oui') return selectEl?.value || '1';
            return '0';
        };

        // Collecter les données
        const level = getInviteLevel();
        const isMairieInvited  = (level === 'classico' || level === 'latotale');
        const isChabatInvited  = (level === 'latotale');

        const presenceMairie   = isMairieInvited ? (form.presenceMairie?.value   || '') : 'Non invité';
        const presenceCocktail = form.presenceCocktail?.value || '';
        const presenceChabat   = isChabatInvited ? (form.presenceChabat?.value   || '') : 'Non invité';

        const data = {
            nom: form.nom.value.trim(),
            email: form.email.value.trim(),
            telephone: form.telephone.value.trim(),
            presenceMairie:   presenceMairie,
            nbMairie:   getNbPersonnes(presenceMairie,   form.nbMairie,   isMairieInvited),
            presenceCocktail: presenceCocktail,
            nbCocktail: getNbPersonnes(presenceCocktail, form.nbCocktail, true),
            presenceChabat:   presenceChabat,
            nbChabat:   getNbPersonnes(presenceChabat,   form.nbChabat,   isChabatInvited),
            message: form.message.value.trim(),
            inviteLevel: level,
            date: new Date().toLocaleString('fr-FR')
        };

        // UI : loading
        btnSubmit.disabled = true;
        btnSubmit.querySelector('.btn-text').classList.add('d-none');
        btnSubmit.querySelector('.btn-loader').classList.remove('d-none');

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Google Apps Script nécessite no-cors
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            // Avec no-cors, on n'a pas accès au body de la réponse
            // mais la requête est bien envoyée
            showSuccess();
        } catch (error) {
            console.error('Erreur RSVP:', error);
            alert('Une erreur est survenue. Veuillez réessayer ou contacter les mariés directement.');
            btnSubmit.disabled = false;
            btnSubmit.querySelector('.btn-text').classList.remove('d-none');
            btnSubmit.querySelector('.btn-loader').classList.add('d-none');
        }
    });

    function showSuccess() {
        formCard.style.display = 'none';
        successCard.classList.remove('d-none');
    }

    // =====================================================
    // INITIALISATION
    // =====================================================
    applyPermissions();

    // =====================================================
    // MUSIQUE DE FOND
    // =====================================================
    const bgMusic = document.getElementById('bgMusic');
    const btnMusic = document.getElementById('btnMusic');

    if (bgMusic && btnMusic) {
        // État initial
        let userPausedManually = false;
        bgMusic.volume = 0.4; // Volume raisonnable : ni trop fort, ni trop faible

        // Tenter de démarrer la musique dès la première interaction utilisateur.
        // Les navigateurs bloquent l'autoplay sans interaction, donc on attend
        // n'importe quel clic, touche clavier ou toucher d'écran pour lancer.
        function tryAutoStart() {
            if (userPausedManually) return; // Si déjà coupé par l'utilisateur, ne rien faire
            bgMusic.play()
                .then(() => {
                    btnMusic.classList.add('is-playing');
                    btnMusic.setAttribute('aria-pressed', 'true');
                    btnMusic.setAttribute('aria-label', 'Couper la musique');
                })
                .catch(() => {
                    // Silencieusement ignoré : l'utilisateur pourra cliquer sur le bouton
                });
        }

        // Première interaction utilisateur = premier déclenchement
        // Les navigateurs n'acceptent que certains événements comme "interaction utilisateur"
        // pour débloquer l'audio : click, touchstart, keydown, pointerdown, wheel sont OK.
        // Le scroll pur ne suffit PAS (il peut être involontaire via touchpad).
        // On retente donc à chaque événement tant que la musique n'est pas lancée.
        const triggerEvents = ['click', 'touchstart', 'touchend', 'keydown', 'pointerdown', 'wheel', 'scroll'];

        function handleFirstInteraction() {
            tryAutoStart();
            // Si la musique a bien démarré, on peut retirer tous les listeners
            if (!bgMusic.paused) {
                triggerEvents.forEach(evt => {
                    document.removeEventListener(evt, handleFirstInteraction);
                });
            }
        }

        triggerEvents.forEach(evt => {
            document.addEventListener(evt, handleFirstInteraction, { passive: true });
        });

        // Toggle manuel via le bouton
        btnMusic.addEventListener('click', function (e) {
            e.stopPropagation();
            if (bgMusic.paused) {
                bgMusic.play()
                    .then(() => {
                        userPausedManually = false;
                        btnMusic.classList.add('is-playing');
                        btnMusic.setAttribute('aria-pressed', 'true');
                        btnMusic.setAttribute('aria-label', 'Couper la musique');
                    })
                    .catch(err => console.warn('Lecture bloquée :', err));
            } else {
                bgMusic.pause();
                userPausedManually = true;
                btnMusic.classList.remove('is-playing');
                btnMusic.setAttribute('aria-pressed', 'false');
                btnMusic.setAttribute('aria-label', 'Activer la musique');
            }
        });
    }

})();
