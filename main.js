/* ═══════════════════════════════════════════════════
   Swiss Portfolio — Interactions & Animations
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initNavigation();
    initStatCounters();
    initSmoothScroll();
    initCertModal();
    initCertFilters();
});

/* ── Scroll-Triggered Animations ───────────────── */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.anim-fade-up, .anim-slide-right');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: '0px 0px -60px 0px',
        }
    );

    animatedElements.forEach((el) => observer.observe(el));
}

/* ── Navigation ────────────────────────────────── */
function initNavigation() {
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navAnchors = document.querySelectorAll('[data-nav]');
    const sections = document.querySelectorAll('.section, .hero');

    // Scroll detection for nav background
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        if (scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        lastScroll = scrollY;
    }, { passive: true });

    // Mobile toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('open');
        navLinks.classList.toggle('open');
    });

    // Close mobile menu on link click
    navAnchors.forEach((anchor) => {
        anchor.addEventListener('click', () => {
            navToggle.classList.remove('open');
            navLinks.classList.remove('open');
        });
    });

    // Active section highlighting
    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navAnchors.forEach((a) => {
                        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
                    });
                }
            });
        },
        {
            threshold: 0.3,
            rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 64}px 0px -40% 0px`,
        }
    );

    sections.forEach((section) => {
        if (section.id) sectionObserver.observe(section);
    });
}

/* ── Animated Stat Counters ────────────────────── */
function initStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    let animated = false;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !animated) {
                    animated = true;
                    statNumbers.forEach((el) => animateCounter(el));
                }
            });
        },
        { threshold: 0.3 }
    );

    const statsGrid = document.querySelector('.hero-stats-grid');
    if (statsGrid) observer.observe(statsGrid);
}

function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const startTime = performance.now();

    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutExpo(progress);
        const current = Math.round(easedProgress * target);

        el.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/* ── Smooth Scrolling ──────────────────────────── */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            const targetEl = document.querySelector(targetId);

            if (targetEl) {
                const navHeight = parseInt(
                    getComputedStyle(document.documentElement).getPropertyValue('--nav-height')
                ) || 64;

                const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth',
                });
            }
        });
    });
}

/* ── Certificate Lightbox Modal ────────────────── */
function initCertModal() {
    const modal = document.getElementById('certModal');
    if (!modal) return;

    const modalImg = document.getElementById('certModalImg');
    const modalTitle = document.getElementById('certModalTitle');
    const closeBtn = document.getElementById('certModalClose');

    function openModal(imgSrc, title) {
        if (!modalImg || !modalTitle) return;
        modalImg.src = imgSrc;
        modalImg.alt = title;
        modalTitle.textContent = title;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        if (modalImg) {
            modalImg.src = '';
            modalImg.alt = '';
        }
    }

    document.querySelectorAll('[data-cert-img]').forEach((el) => {
        el.addEventListener('click', (e) => {
            // If it's an anchor or button inside with its own action, allow standard behavior if requested
            if (e.target.closest('.cert-link-verify')) return;
            e.preventDefault();
            const src = el.getAttribute('data-cert-img');
            const title = el.getAttribute('data-cert-title') || 'Certificate Preview';
            if (src) {
                openModal(src, title);
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/* ── Certificate Filtering ─────────────────────── */
function initCertFilters() {
    const filterBtns = document.querySelectorAll('.cert-filter-btn');
    const certCards = document.querySelectorAll('.cert-card[data-category]');
    if (!filterBtns.length || !certCards.length) return;

    filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            filterBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');

            certCards.forEach((card) => {
                const categories = (card.getAttribute('data-category') || '').split(' ');
                if (filter === 'all' || categories.includes(filter)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}
