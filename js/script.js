/* ============================================================
   ISH PRODUCTION — CINEMATIC PORTFOLIO
   JavaScript Engine
   ============================================================ */

(function () {
    'use strict';

    // ---- CONFIGURATION ----
    const TOTAL_FRAMES = 184;
    const FRAME_PATH = 'images/frames/ezgif-frame-';
    const FRAME_EXT = '.jpg';
    const PRELOAD_FPS = 60;
    const HERO_ANIM_FPS = 24;

    // ---- DOM CACHE ----
    const dom = {
        videoIntro: document.getElementById('video-intro'),
        videoPlayer: document.getElementById('video-intro-player'),
        videoSkip: document.getElementById('video-intro-skip'),
        videoProgressBar: document.getElementById('video-intro-progress-bar'),
        preloader: document.getElementById('preloader'),
        progressBar: document.getElementById('preloader-progress-bar'),
        progressText: document.getElementById('preloader-text'),
        heroCanvas: document.getElementById('hero-canvas'),
        particleCanvas: document.getElementById('particle-canvas'),
        navbar: document.getElementById('navbar'),
        navToggle: document.getElementById('nav-toggle'),
        navLinks: document.getElementById('nav-links'),
        //galleryGrid: document.getElementById('gallery-grid'),
        filterBtns: document.querySelectorAll('.gallery-filter-btn'),
        lightbox: document.getElementById('lightbox'),
        lightboxImg: document.getElementById('lightbox-img'),
        lightboxClose: document.getElementById('lightbox-close'),
        showreelCanvas: document.getElementById('showreel-canvas'),
    };

    // ---- STATE ----
    const frames = [];
    let heroCtx, showreelCtx, particleCtx;
    let currentHeroFrame = 0;
    let heroAnimId;
    let lastFrameTime = 0;

    // ---- UTILITY ----
    function padNumber(n, width) {
        return String(n).padStart(width, '0');
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    // ---- FRAME PRELOADER ----
    function preloadFrames() {
        return new Promise((resolve) => {
            let loaded = 0;

            for (let i = 1; i <= TOTAL_FRAMES; i++) {
                const img = new Image();
                img.src = `${FRAME_PATH}${padNumber(i, 3)}${FRAME_EXT}`;
                img.onload = img.onerror = () => {
                    loaded++;
                    const pct = Math.round((loaded / TOTAL_FRAMES) * 100);
                    if (dom.progressBar) dom.progressBar.style.width = pct + '%';
                    if (dom.progressText) dom.progressText.textContent = `Loading cinematic experience — ${pct}%`;
                    if (loaded === TOTAL_FRAMES) resolve();
                };
                frames.push(img);
            }
        });
    }

    // ---- HERO CANVAS ANIMATION ----
    function initHeroCanvas() {
        if (!dom.heroCanvas) return;
        heroCtx = dom.heroCanvas.getContext('2d');
        resizeCanvas(dom.heroCanvas);
        drawFrame(heroCtx, dom.heroCanvas, 0);
        animateHero();
    }

    function resizeCanvas(canvas) {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }

    function drawFrame(ctx, canvas, frameIndex) {
        const img = frames[frameIndex];
        if (!img || !img.naturalWidth) return;

        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.naturalWidth / img.naturalHeight;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgRatio > canvasRatio) {
            drawHeight = canvas.height;
            drawWidth = drawHeight * imgRatio;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        } else {
            drawWidth = canvas.width;
            drawHeight = drawWidth / imgRatio;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }

    function animateHero(timestamp) {
        heroAnimId = requestAnimationFrame(animateHero);

        if (!lastFrameTime) lastFrameTime = timestamp;
        const elapsed = timestamp - lastFrameTime;
        const frameInterval = 1000 / HERO_ANIM_FPS;

        if (elapsed >= frameInterval) {
            lastFrameTime = timestamp - (elapsed % frameInterval);
            currentHeroFrame = (currentHeroFrame + 1) % TOTAL_FRAMES;
            drawFrame(heroCtx, dom.heroCanvas, currentHeroFrame);
        }
    }

    // ---- SHOWREEL CANVAS ----
    function initShowreelCanvas() {
        if (!dom.showreelCanvas) return;
        showreelCtx = dom.showreelCanvas.getContext('2d');

        function resizeShowreel() {
            dom.showreelCanvas.width = dom.showreelCanvas.parentElement.offsetWidth;
            dom.showreelCanvas.height = dom.showreelCanvas.parentElement.offsetHeight;
        }
        resizeShowreel();
        window.addEventListener('resize', resizeShowreel);

        let showreelFrame = 0;
        let showreelLast = 0;

        function animShowreel(ts) {
            requestAnimationFrame(animShowreel);
            if (!showreelLast) showreelLast = ts;
            if (ts - showreelLast >= 1000 / 12) {
                showreelLast = ts;
                showreelFrame = (showreelFrame + 1) % TOTAL_FRAMES;
                drawFrame(showreelCtx, dom.showreelCanvas, showreelFrame);
            }
        }

        // Intersection observer — only animate when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(animShowreel);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        observer.observe(dom.showreelCanvas);
    }

    // ---- PARTICLE SYSTEM ----
    function initParticles() {
        if (!dom.particleCanvas) return;
        particleCtx = dom.particleCanvas.getContext('2d');

        function resize() {
            dom.particleCanvas.width = window.innerWidth;
            dom.particleCanvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        const particles = [];
        const PARTICLE_COUNT = 60;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                radius: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.25 - 0.15,
                opacity: Math.random() * 0.4 + 0.1,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.015 + 0.005,
            });
        }

        function animateParticles() {
            requestAnimationFrame(animateParticles);
            particleCtx.clearRect(0, 0, dom.particleCanvas.width, dom.particleCanvas.height);

            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                p.pulse += p.pulseSpeed;

                const currentOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));

                if (p.x < 0) p.x = dom.particleCanvas.width;
                if (p.x > dom.particleCanvas.width) p.x = 0;
                if (p.y < 0) p.y = dom.particleCanvas.height;
                if (p.y > dom.particleCanvas.height) p.y = 0;

                // Glow
                const gradient = particleCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
                gradient.addColorStop(0, `rgba(95, 168, 255, ${currentOpacity})`);
                gradient.addColorStop(1, 'rgba(95, 168, 255, 0)');

                particleCtx.beginPath();
                particleCtx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
                particleCtx.fillStyle = gradient;
                particleCtx.fill();

                // Core
                particleCtx.beginPath();
                particleCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                particleCtx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.8})`;
                particleCtx.fill();
            });
        }

        animateParticles();
    }

    // ---- NAVBAR ----
    function initNavbar() {
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;

            if (scrollY > 60) {
                dom.navbar.classList.add('scrolled');
            } else {
                dom.navbar.classList.remove('scrolled');
            }

            lastScroll = scrollY;
        });

        // Mobile toggle
        if (dom.navToggle) {
            dom.navToggle.addEventListener('click', () => {
                dom.navToggle.classList.toggle('active');
                dom.navLinks.classList.toggle('mobile-open');
            });
        }

        // Smooth scroll navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Close mobile menu
                    dom.navToggle?.classList.remove('active');
                    dom.navLinks?.classList.remove('mobile-open');
                }
            });
        });

        // Active link highlighting
        const sections = document.querySelectorAll('.section[id]');
        window.addEventListener('scroll', () => {
            const scrollPos = window.scrollY + 200;
            sections.forEach(section => {
                const top = section.offsetTop;
                const height = section.offsetHeight;
                const id = section.getAttribute('id');
                const link = document.querySelector(`.nav-links a[href="#${id}"]`);
                if (link) {
                    if (scrollPos >= top && scrollPos < top + height) {
                        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
                        link.classList.add('active');
                    }
                }
            });
        });
    }

    // ---- GALLERY ----
    //function initGallery() {
    //    // Filter
    //    dom.filterBtns.forEach(btn => {
    //        btn.addEventListener('click', () => {
    //            dom.filterBtns.forEach(b => b.classList.remove('active'));
    //            btn.classList.add('active');

    //            const filter = btn.dataset.filter;
    //            const items = dom.galleryGrid.querySelectorAll('.gallery-item');

    //            items.forEach((item, i) => {
    //                const show = filter === 'all' || item.dataset.category === filter;
    //                item.style.transition = `opacity 0.4s ease ${i * 0.04}s, transform 0.4s ease ${i * 0.04}s`;
    //                if (show) {
    //                    item.style.display = '';
    //                    requestAnimationFrame(() => {
    //                        item.style.opacity = '1';
    //                        item.style.transform = 'scale(1)';
    //                    });
    //                } else {
    //                    item.style.opacity = '0';
    //                    item.style.transform = 'scale(0.95)';
    //                    setTimeout(() => { item.style.display = 'none'; }, 400 + i * 40);
    //                }
    //            });
    //        });
    //    });

    //    // Lightbox
    //    dom.galleryGrid.addEventListener('click', (e) => {
    //        const item = e.target.closest('.gallery-item');
    //        if (!item) return;
    //        const img = item.querySelector('img');
    //        if (!img) return;
    //        dom.lightboxImg.src = img.src;
    //        dom.lightbox.classList.add('active');
    //        document.body.style.overflow = 'hidden';
    //    });

    //    dom.lightboxClose?.addEventListener('click', closeLightbox);
    //    dom.lightbox?.addEventListener('click', (e) => {
    //        if (e.target === dom.lightbox) closeLightbox();
    //    });

    //    document.addEventListener('keydown', (e) => {
    //        if (e.key === 'Escape') closeLightbox();
    //    });

    //    function closeLightbox() {
    //        dom.lightbox.classList.remove('active');
    //        document.body.style.overflow = '';
    //    }
    //}






    // ---- SCROLL REVEAL ----
    function initScrollReveal() {
        const reveals = document.querySelectorAll('.reveal');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -60px 0px'
        });

        reveals.forEach(el => observer.observe(el));
    }

    // ---- COUNTER ANIMATION ----
    function initCounters() {
        const counters = document.querySelectorAll('.stat-number');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.count, 10);
                    const suffix = el.dataset.suffix || '';
                    animateCounter(el, 0, target, 2000, suffix);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(c => observer.observe(c));
    }

    function animateCounter(el, start, end, duration, suffix) {
        const startTime = performance.now();

        function update(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out quart
            const eased = 1 - Math.pow(1 - progress, 4);
            const current = Math.round(start + (end - start) * eased);
            el.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }

    // ---- MAGNETIC CURSOR EFFECT ON BUTTONS ----
    function initMagneticButtons() {
        document.querySelectorAll('.btn, .nav-cta, .play-icon').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
                btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
                setTimeout(() => { btn.style.transition = ''; }, 400);
            });
        });
    }

    // ---- TESTIMONIAL CAROUSEL (mobile) ----
    function initTestimonialCarousel() {
        const cards = document.querySelectorAll('.testimonial-card');
        if (window.innerWidth > 768 || cards.length === 0) return;
        // Simple auto-fade for mobile
        let current = 0;
        cards.forEach((c, i) => {
            c.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            if (i !== 0) {
                c.style.opacity = '0';
                c.style.position = 'absolute';
                c.style.top = '0';
                c.style.left = '0';
                c.style.right = '0';
            }
        });
    }






    // ---- SMOOTH PARALLAX FOR ABOUT IMAGE ----
    function initParallax() {
        const aboutImg = document.querySelector('.about-image-wrapper');
        if (!aboutImg) return;

        window.addEventListener('scroll', () => {
            const rect = aboutImg.getBoundingClientRect();
            const viewH = window.innerHeight;
            if (rect.top < viewH && rect.bottom > 0) {
                const progress = (viewH - rect.top) / (viewH + rect.height);
                const translateY = (progress - 0.5) * 40;
                aboutImg.style.transform = `translateY(${translateY}px)`;
            }
        });
    }

    // ---- VIDEO SOURCE BY DEVICE ----
    function applyVideoSourceByDevice() {
        if (!dom.videoPlayer) return;
        const isMobile = window.innerWidth <= 768;
        const source = dom.videoPlayer.querySelector('source');
        if (!source) return;

        const mobileSrc = 'Video/ISHmobileview.mp4';
        const desktopSrc = 'Video/ISHTitleCardlandscape.mp4';
        const desiredSrc = isMobile ? mobileSrc : desktopSrc;

        if (source.src && source.src.endsWith(desiredSrc.split('/').pop())) return;

        source.src = desiredSrc;
        dom.videoPlayer.load();
    }

    // ---- VIDEO INTRO ----
    const VIDEO_DURATION = 10; // seconds

    function initVideoIntro() {
        applyVideoSourceByDevice();
        return new Promise((resolve) => {
            if (!dom.videoIntro || !dom.videoPlayer) {
                resolve();
                return;
            }

            let videoEnded = false;
            let progressInterval = null;
            let fallbackTried = false;

            function dismissVideo() {
                if (videoEnded) return;
                videoEnded = true;

                if (progressInterval) clearInterval(progressInterval);

                try { dom.videoPlayer.pause(); } catch (e) { }

                dom.videoIntro.classList.add('hidden');

                setTimeout(() => {
                    dom.videoIntro.style.display = 'none';
                    resolve();
                }, 1000);
            }

            function tryPlay() {
                const playPromise = dom.videoPlayer.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            startProgress();
                        })
                        .catch(() => {
                            if (!fallbackTried) {
                                fallbackTried = true;
                                const source = dom.videoPlayer.querySelector('source');
                                if (source && dom.videoPlayer.querySelector('source').src.includes('ISHmobileview.mp4')) {
                                    source.src = 'Video/ISHTitleCardlandscape.mp4';
                                    dom.videoPlayer.load();
                                    tryPlay();
                                } else {
                                    dismissVideo();
                                }
                            } else {
                                dismissVideo();
                            }
                        });
                } else {
                    startProgress();
                }
            }

            if (dom.videoSkip) {
                dom.videoSkip.addEventListener('click', dismissVideo);
            }

            dom.videoPlayer.addEventListener('error', () => {
                if (!fallbackTried) {
                    fallbackTried = true;
                    const source = dom.videoPlayer.querySelector('source');
                    if (source && source.src.includes('ISHmobileview.mp4')) {
                        source.src = 'Video/ISHTitleCardlandscape.mp4';
                        dom.videoPlayer.load();
                        tryPlay();
                    } else {
                        dismissVideo();
                    }
                } else {
                    dismissVideo();
                }
            });

            function startProgress() {
                const startTime = Date.now();

                progressInterval = setInterval(() => {
                    const elapsed = (Date.now() - startTime) / 1000;
                    const pct = Math.min((elapsed / VIDEO_DURATION) * 100, 100);

                    if (dom.videoProgressBar) {
                        dom.videoProgressBar.style.width = pct + '%';
                    }

                    if (elapsed >= VIDEO_DURATION) {
                        clearInterval(progressInterval);
                        dismissVideo();
                    }
                }, 50);
            }

            tryPlay();

            dom.videoPlayer.addEventListener('ended', dismissVideo);
        });
    }

    // ---- INIT SEQUENCE ----
    async function init() {
        // Phase 1: Play the video intro for 10 seconds
        await initVideoIntro();

        // Phase 2: Preload frames in background, then init site
        await preloadFrames();

        document.body.style.overflow = '';

        // Init all modules
        //initHeroCanvas();
        initShowreelCanvas();
        initParticles();
        initNavbar();
        //initGallery();
        initScrollReveal();
        initCounters();
        initMagneticButtons();
        initTestimonialCarousel();
        initParallax();
    }

    // ---- RESIZE HANDLER ----
    window.addEventListener('resize', () => {
        if (dom.heroCanvas) resizeCanvas(dom.heroCanvas);
    });

    // ---- START ----
    document.addEventListener('DOMContentLoaded', () => {
        document.body.style.overflow = 'hidden';
        init();
    });

})();



const projectData = {

    branding: {
        title: "Branding",
        text: "Crafting complete brand identities from logo design to motion, stationery, and 3D execution.",
        items: [
            "Logo Design",
            "Logo Animation",
            "Brand Identity",
            "Visual Assets"
            // side by side
        ]
    },

    resorts: {
        title: "Resorts",
        text: "Bringing destination stays to life with cinematic storytelling, premium visuals, and hospitality-focused content.",
        items: [
            "Brand Films",
            "Social Media Content",
            "Photography",
            "Promotional Campaigns"
        ]
    },

    hotels: {
        title: "Hotels",
        text: "Turning hospitality spaces into premium visual experiences through cinematic storytelling and strategic content.",
        items: [
            "Hotel Walkthroughs",
            "Room Showcases",
            "Promotional Reels",
            "Digital Marketing Content"
        ]
    },

    events: {
        title: "Events & Stays",
        text: "Creating memorable experiences that inspire celebrations.",
        items: [
            "Banquet Halls",
            "Suites",
            "Event Venues",
            "Wedding Promotions"
        ]
    },

    restaurants: {
        title: "Restaurants",
        text: "Turning dining experiences into visual stories.",
        items: [
            "Food Photography",
            "Restaurant Reels",
            "Menu Promotions",
            "Brand Campaigns"
        ]
    },

    travel: {
        title: "Travel",
        text: "Bringing destinations and journeys to life.",
        items: [
            "Travel Films",
            "Destination Marketing",
            "Tourism Content",
            "Experience Showcases"
        ]
    },

    automobile: {
        title: "Automobile",
        text: "Driven by performance, powered by creativity.",
        items: [
            "Vehicle Shoots",
            "Promotional Videos",
            "Launch Campaigns",
            "Brand Content"
        ]
    },

    clothing: {
        title: "Clothing",
        text: "Fashion presented with style and impact.",
        items: [
            "Lookbooks",
            "Product Shoots",
            "Fashion Reels",
            "Brand Campaigns"
        ]
    },

    interior: {
        title: "Interiors",
        text: "Highlighting spaces through design-focused visuals.",
        items: [
            "Interior Walkthroughs",
            "Design Showcases",
            "Real Estate Content",
            "Reels"
        ]
    },

    exterior: {
        title: "Exteriors",
        text: "Presenting architecture from the outside in.",
        items: [
            "Property Showcases",
            "Architectural Films",
            "Drone Footage",
            "Promotional Content"
        ]
    },

    furniture: {
        title: "Furniture",
        text: "Showcasing craftsmanship, comfort, and design.",
        items: [
            "Product Photography",
            "Catalog Content",
            "Lifestyle Shoots",
            "Marketing Creatives"
        ]
    },

    party: {
        title: "Party Spaces",
        text: "Where every celebration becomes a story.",
        items: [
            "Birthday Venues",
            "Private Events",
            "Entertainment Spaces",
            "Promotional Campaigns"
        ]
    }

};

function openProject(name) {

    const p = projectData[name];

    let html = `
        <div class="project-details">

            <h1 class="project-title">${p.title}</h1>

            <p class="project-description">
                ${p.text}
            </p>

            <div class="project-services-grid">
    `;

    p.items.forEach(item => {
        html += `<div class="project-service-card"><span class="project-service-icon">▹</span>${item}</div>`;
    });

    html += `
            </div>
        </div>
    `;

    document.getElementById("projectContent").innerHTML = html;

    document.getElementById("projectPage").style.display = "block";

    document.body.style.overflow = "hidden";
}
function closeProject() {

    document.getElementById("projectPage").style.display = "none";

    document.body.style.overflow = "auto";

}