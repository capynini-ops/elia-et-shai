/* ============================================================
   WEDDING SITE — script.js
   SPA Navigation, URL Permissions, Countdown, RSVP Form
   ============================================================ */

(function () {
    'use strict';

    // =====================================================
    // CONFIG — À MODIFIER
    // =====================================================
    // Date du mariage (mois 0-indexé : 6 = juillet)
    const WEDDING_DATE = new Date(2026, 6, 29, 18, 30, 0);

    // URL du Google Apps Script déployé (remplace par ton URL)
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/XXXXXXXXXX/exec';

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

        // Navigation
        document.querySelectorAll('.nav-mairie').forEach(el => {
            el.style.display = showMairie ? '' : 'none';
        });
        document.querySelectorAll('.nav-chabat').forEach(el => {
            el.style.display = showChabat ? '' : 'none';
        });

        // Champs RSVP conditionnels
        document.querySelectorAll('.rsvp-field-mairie').forEach(el => {
            el.style.display = showMairie ? '' : 'none';
        });
        document.querySelectorAll('.rsvp-field-chabat').forEach(el => {
            el.style.display = showChabat ? '' : 'none';
        });
    }

    // =====================================================
    // SPA NAVIGATION
    // =====================================================
    const navLinks = document.querySelectorAll('[data-section]');
    const sections = document.querySelectorAll('.page-section');

    function navigateTo(sectionId) {
        const level = getInviteLevel();

        // Vérifier que la section est accessible
        if (sectionId === 'mairie' && level !== 'classico' && level !== 'latotale') {
            sectionId = 'accueil';
        }
        if (sectionId === 'chabat' && level !== 'latotale') {
            sectionId = 'accueil';
        }

        // Masquer toutes les sections
        sections.forEach(sec => {
            sec.classList.remove('active', 'visible');
        });

        // Afficher la section cible
        const target = document.getElementById(sectionId);
        if (target) {
            target.classList.add('active');
            // Petit délai pour déclencher la transition CSS
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    target.classList.add('visible');
                });
            });
        }

        // Mettre à jour les liens actifs
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });

        // Fermer le menu mobile
        const navCollapse = document.getElementById('navMenu');
        const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
        if (bsCollapse) bsCollapse.hide();

        // Scroll en haut
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Navbar : masquer sur accueil
        updateNavbarVisibility(sectionId);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            navigateTo(section);
        });
    });

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
    // NAVBAR : masquer sur accueil, afficher sur les autres
    // =====================================================
    const mainNav = document.getElementById('mainNav');

    function updateNavbarVisibility(sectionId) {
        if (sectionId === 'accueil') {
            mainNav.classList.add('nav-hidden');
        } else {
            mainNav.classList.remove('nav-hidden');
        }
    }

    // =====================================================
    // NAVBAR SCROLL EFFECT
    // =====================================================
    window.addEventListener('scroll', function () {
        const nav = document.getElementById('mainNav');
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // =====================================================
    // RSVP FORM
    // =====================================================
    const form = document.getElementById('rsvpForm');
    const formCard = document.getElementById('rsvpFormCard');
    const successCard = document.getElementById('rsvpSuccess');
    const btnSubmit = document.getElementById('btnSubmit');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Validation simple
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        // Collecter les données
        const level = getInviteLevel();
        const data = {
            nom: form.nom.value.trim(),
            email: form.email.value.trim(),
            telephone: form.telephone.value.trim(),
            nbInvites: form.nbInvites.value,
            presenceCocktail: form.presenceCocktail?.value || '',
            presenceMairie: (level === 'classico' || level === 'latotale') ? (form.presenceMairie?.value || '') : 'Non invité',
            presenceChabat: level === 'latotale' ? (form.presenceChabat?.value || '') : 'Non invité',
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

    // Masquer la navbar fixe sur l'accueil (le menu est dans le hero)
    updateNavbarVisibility('accueil');

    // Afficher la section Accueil avec animation
    const accueil = document.getElementById('accueil');
    if (accueil) {
        accueil.classList.add('active');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                accueil.classList.add('visible');
            });
        });
    }

})();
