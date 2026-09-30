/**
 * DEKROYSHOP - Master JavaScript & 3D Interaction Engine
 * Ultra-Lightweight | requestAnimationFrame Throttling | 60 FPS | Zero External Dependencies
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ==========================================================
    // 1. MOBILE DRAWER NAVIGATION
    // ==========================================================
    const menuToggle = document.getElementById('mobileMenuToggle');
    const mobileDrawer = document.getElementById('mobileDrawer');

    if (menuToggle && mobileDrawer) {
        menuToggle.addEventListener('click', () => {
            const isOpen = mobileDrawer.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close when clicking any nav link
        mobileDrawer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileDrawer.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // ==========================================================
    // 2. 3D CARD TILT ENGINE (PERFORMANCE OPTIMIZED)
    // ==========================================================
    if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
        const tiltCards = document.querySelectorAll('.item-card, .hero-3d-card');

        tiltCards.forEach(card => {
            let rafId = null;

            card.addEventListener('mousemove', (e) => {
                if (rafId) cancelAnimationFrame(rafId);

                rafId = requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    // Compute tilt angle (-8deg to 8deg)
                    const rotateX = ((y - centerY) / centerY) * -8;
                    const rotateY = ((x - centerX) / centerX) * 8;

                    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translate3d(0, -6px, 12px)`;
                });
            });

            card.addEventListener('mouseleave', () => {
                if (rafId) cancelAnimationFrame(rafId);
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)';
            });
        });
    }

    // ==========================================================
    // 3. HERO MOUSE PARALLAX (LIGHTWEIGHT)
    // ==========================================================
    const heroSection = document.querySelector('.hero-section');
    const heroStage = document.querySelector('.hero-stage');
    const heroGrid = document.querySelector('.hero-grid-bg');

    if (!prefersReducedMotion && heroSection && heroStage && window.matchMedia('(pointer: fine)').matches) {
        let heroRaf = null;

        heroSection.addEventListener('mousemove', (e) => {
            if (heroRaf) cancelAnimationFrame(heroRaf);

            heroRaf = requestAnimationFrame(() => {
                const rect = heroSection.getBoundingClientRect();
                const normX = (e.clientX - rect.left) / rect.width - 0.5;
                const normY = (e.clientY - rect.top) / rect.height - 0.5;

                // Move stage slightly in opposite direction
                heroStage.style.transform = `translate3d(${(-normX * 16).toFixed(1)}px, ${(-normY * 16).toFixed(1)}px, 0)`;
                if (heroGrid) {
                    heroGrid.style.transform = `translate3d(${(normX * 8).toFixed(1)}px, ${(normY * 8).toFixed(1)}px, 0)`;
                }
            });
        });

        heroSection.addEventListener('mouseleave', () => {
            if (heroRaf) cancelAnimationFrame(heroRaf);
            heroStage.style.transform = 'translate3d(0, 0, 0)';
            if (heroGrid) heroGrid.style.transform = 'translate3d(0, 0, 0)';
        });
    }

    // ==========================================================
    // 4. TOAST NOTIFICATION HELPER
    // ==========================================================
    window.showToast = function (message, duration = 3500) {
        let toast = document.getElementById('globalToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'globalToast';
            toast.className = 'toast-notice';
            document.body.appendChild(toast);
        }

        toast.innerHTML = `<span>⚡</span> <div>${message}</div>`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    };

    // Auto-show flash messages if rendered in page
    const flashAlert = document.querySelector('[data-flash-message]');
    if (flashAlert) {
        const msg = flashAlert.getAttribute('data-flash-message');
        if (msg) window.showToast(msg);
    }
});
