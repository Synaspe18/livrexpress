/**
 * LIVREXPRESS - LUBUMBASHI
 * Interactions JavaScript & Simulateur de course en direct
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. GESTION DU MENU MOBILE (DRAWER)
    // =========================================================================
    const menuToggle = document.getElementById('menuToggle');
    const closeMenu = document.getElementById('closeMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const openDrawer = () => {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden'; // Empêcher le scroll d'arrière-plan
    };

    const closeDrawer = () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    };

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', openDrawer);
    }

    if (closeMenu) {
        closeMenu.addEventListener('click', closeDrawer);
    }

    // Fermer le drawer lors d'un clic sur un lien de navigation
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeDrawer);
    });

    // Fermer avec la touche Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            closeDrawer();
        }
    });

    // =========================================================================
    // 2. NAVBAR SCROLLED STATE & BOUTON RETOUR EN HAUT
    // =========================================================================
    const navbar = document.getElementById('navbar');
    const backToTopBtn = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;

        // Ombre sur la navbar
        if (navbar) {
            if (scrollPos > 30) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // Affichage du bouton de retour en haut
        if (backToTopBtn) {
            if (scrollPos > 400) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // =========================================================================
    // 3. SCROLLSPY (MISE EN ÉVIDENCE DU LIEN ACTIF DANS LE MENU)
    // =========================================================================
    const sections = document.querySelectorAll('section[id], footer[id]');
    const navItems = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.pageYOffset + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // =========================================================================
    // 4. SIMULATEUR DE TARIFS LUBUMBASHI (CDF & USD)
    // =========================================================================
    const communeDepart = document.getElementById('communeDepart');
    const communeArrivee = document.getElementById('communeArrivee');
    const packageType = document.getElementById('packageType');
    const calcPriceCdf = document.getElementById('calcPriceCdf');
    const calcPriceUsd = document.getElementById('calcPriceUsd');
    const calcTime = document.getElementById('calcTime');
    const btnOrderCalculated = document.getElementById('btnOrderCalculated');

    // Taux de conversion approximatif : 1 USD = 2 800 CDF
    const EXCHANGE_RATE = 2800;

    // Matrice de distances relatives entre zones de Lubumbashi (indices de base en CDF)
    // 0: Centre, 1: Golf, 2: Bel-Air, 3: Kampemba, 4: Kenya, 5: Katuba, 6: Ruashi, 7: Annexe
    const zoneWeights = {
        'centre': 1,
        'golf': 2,
        'belair': 2,
        'kampemba': 3,
        'kenya': 2,
        'katuba': 3,
        'ruashi': 4,
        'annexe': 4
    };

    const packageExtras = {
        'express': { extraCdf: 0, label: 'Pli Express / Documents (< 2kg)', timeOffset: 0 },
        'standard': { extraCdf: 3500, label: 'Colis E-commerce / Shopping (2 à 8kg)', timeOffset: 10 },
        'heavy': { extraCdf: 8000, label: 'Colis Volumineux / Carton (8 à 20kg)', timeOffset: 20 }
    };

    function calculateEstimatedPrice() {
        if (!communeDepart || !communeArrivee || !packageType) return;

        const dep = communeDepart.value;
        const arr = communeArrivee.value;
        const pType = packageType.value;

        let basePrice = 5000; // Tarif de base minimal pour Lubumbashi
        let estimatedMinutesMin = 20;
        let estimatedMinutesMax = 35;

        if (dep === arr) {
            // Même commune ou même zone
            basePrice = 4000;
            estimatedMinutesMin = 15;
            estimatedMinutesMax = 25;
        } else {
            const distanceFactor = Math.abs(zoneWeights[dep] - zoneWeights[arr]);
            if (distanceFactor === 0) {
                basePrice = 5500;
                estimatedMinutesMin = 20;
                estimatedMinutesMax = 30;
            } else if (distanceFactor === 1) {
                basePrice = 6500;
                estimatedMinutesMin = 25;
                estimatedMinutesMax = 40;
            } else if (distanceFactor === 2) {
                basePrice = 9000;
                estimatedMinutesMin = 35;
                estimatedMinutesMax = 50;
            } else {
                basePrice = 12000;
                estimatedMinutesMin = 45;
                estimatedMinutesMax = 65;
            }
        }

        // Ajout selon le type de colis
        const packageInfo = packageExtras[pType] || packageExtras['express'];
        const finalPriceCdf = basePrice + packageInfo.extraCdf;
        const finalPriceUsd = (finalPriceCdf / EXCHANGE_RATE).toFixed(2);

        const finalTimeMin = estimatedMinutesMin + packageInfo.timeOffset;
        const finalTimeMax = estimatedMinutesMax + packageInfo.timeOffset;

        // Mise à jour de l'affichage
        calcPriceCdf.textContent = `${finalPriceCdf.toLocaleString('fr-FR')} CDF`;
        calcPriceUsd.textContent = `(env. ${finalPriceUsd} $)`;
        calcTime.innerHTML = `<i class="fa-solid fa-clock"></i> Temps moyen estimé : <strong>${finalTimeMin} - ${finalTimeMax} min</strong>`;

        return {
            depText: communeDepart.options[communeDepart.selectedIndex].text,
            arrText: communeArrivee.options[communeArrivee.selectedIndex].text,
            packageText: packageInfo.label,
            priceCdf: finalPriceCdf,
            priceUsd: finalPriceUsd
        };
    }

    // Écouteurs de changement pour le simulateur
    if (communeDepart && communeArrivee && packageType) {
        communeDepart.addEventListener('change', calculateEstimatedPrice);
        communeArrivee.addEventListener('change', calculateEstimatedPrice);
        packageType.addEventListener('change', calculateEstimatedPrice);
        // Calcul initial
        calculateEstimatedPrice();
    }

    // Bouton de commande WhatsApp lié au simulateur
    if (btnOrderCalculated) {
        btnOrderCalculated.addEventListener('click', () => {
            const estimate = calculateEstimatedPrice();
            if (!estimate) return;

            const phoneNumber = '243848061886';
            const message = `Bonjour LivreXpress Lubumbashi !%0A` +
                `Je souhaite commander une course estimée via votre site :%0A` +
                ` *Départ* : ${encodeURIComponent(estimate.depText)}%0A` +
                ` *Arrivée* : ${encodeURIComponent(estimate.arrText)}%0A` +
                ` *Colis* : ${encodeURIComponent(estimate.packageText)}%0A` +
                ` *Tarif estimé* : ${estimate.priceCdf.toLocaleString('fr-FR')} CDF (~${estimate.priceUsd} $)%0A%0A` +
                `Merci de me confirmer la disponibilité d'un coursier.`;

            const waUrl = `https://wa.me/${phoneNumber}?text=${message}`;
            window.open(waUrl, '_blank');
        });
    }

    // =========================================================================
    // 5. FORMULAIRE DE CONTACT & RÉSERVATION DU FOOTER
    // =========================================================================
    const contactForm = document.getElementById('contactForm');
    const formSuccessToast = document.getElementById('formSuccessToast');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('clientName').value.trim();
            const phone = document.getElementById('clientPhone').value.trim();
            const route = document.getElementById('clientRoute').value.trim();
            const message = document.getElementById('clientMessage').value.trim();

            if (!name || !phone || !route) {
                alert('Veuillez remplir au moins votre nom, numéro et le trajet souhaité.');
                return;
            }

            // Bouton état de chargement
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Traitement en cours...`;

            setTimeout(() => {
                // Rétablir le bouton
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;

                // Afficher le toast de succès
                if (formSuccessToast) {
                    formSuccessToast.classList.remove('hidden');
                    
                    // Masquer après 6 secondes
                    setTimeout(() => {
                        formSuccessToast.classList.add('hidden');
                    }, 6000);
                }

                // Proposer l'ouverture immédiate sur WhatsApp pour confirmation directe
                const shouldOpenWhatsApp = confirm(
                    `Merci ${name} ! Votre demande a été enregistrée.\n\nSouhaitez-vous également l'envoyer directement sur notre WhatsApp pour une attribution de livreur en 3 minutes ?`
                );

                if (shouldOpenWhatsApp) {
                    const phoneNumber = '243848061886';
                    const waText = `Bonjour LivreXpress !%0A%0A` +
                        `Nouvelle commande express envoyée depuis le site :%0A` +
                        ` *Nom* : ${encodeURIComponent(name)}%0A` +
                        ` *Téléphone* : ${encodeURIComponent(phone)}%0A` +
                        ` *Trajet* : ${encodeURIComponent(route)}%0A` +
                        ` *Détails* : ${encodeURIComponent(message)}`;

                    window.open(`https://wa.me/${phoneNumber}?text=${waText}`, '_blank');
                }

                // Réinitialiser le formulaire
                contactForm.reset();
            }, 800);
        });
    }

    // =========================================================================
    // 6. ANIMATION DOUCE AU DÉFILEMENT (REVEAL ANIMATION)
    // =========================================================================
    const animatedCards = document.querySelectorAll('.step-card, .pricing-card, .testimonial-card, .trust-box');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    };

    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(24px)';
        card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        cardObserver.observe(card);
    });

    console.log('LivreXpress Lubumbashi - Plateforme prête et initialisée.');
});


