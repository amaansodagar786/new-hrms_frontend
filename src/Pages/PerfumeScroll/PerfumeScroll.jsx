import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import './PerfumeScroll.scss';

/* ── REALISTIC PERFUME BOX SVG ───────────────────────────────────────────────── */
const PerfumeBox = () => (
    <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="boxFrontGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a1a2e" />
                <stop offset="30%" stopColor="#1a1a3e" />
                <stop offset="70%" stopColor="#0f0f2a" />
                <stop offset="100%" stopColor="#0a0a1f" />
            </linearGradient>
            <linearGradient id="boxSideGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0a0a1f" />
                <stop offset="50%" stopColor="#151535" />
                <stop offset="100%" stopColor="#0a0a1f" />
            </linearGradient>
            <linearGradient id="goldFoil" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c9a96e" />
                <stop offset="25%" stopColor="#f0d090" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="75%" stopColor="#f0d090" />
                <stop offset="100%" stopColor="#c9a96e" />
            </linearGradient>
            <filter id="boxShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="12" stdDeviation="15" floodColor="#000" floodOpacity="0.8" />
            </filter>
        </defs>

        <g filter="url(#boxShadow)">
            {/* Box Front Face */}
            <rect x="50" y="60" width="200" height="200" rx="6" fill="url(#boxFrontGrad)" stroke="rgba(201,169,110,0.3)" strokeWidth="1.5" />

            {/* Box Top Face (depth) */}
            <path d="M50,60 L70,40 L270,40 L250,60 Z" fill="url(#boxSideGrad)" stroke="rgba(201,169,110,0.2)" strokeWidth="1" />

            {/* Box Right Face (depth) */}
            <path d="M250,60 L270,40 L270,240 L250,260 Z" fill="url(#boxSideGrad)" stroke="rgba(201,169,110,0.2)" strokeWidth="1" />

            {/* Gold border on front */}
            <rect x="55" y="65" width="190" height="190" rx="4" fill="none" stroke="url(#goldFoil)" strokeWidth="1.5" opacity="0.6" />

            {/* Embossed pattern on front */}
            <rect x="70" y="80" width="160" height="160" rx="3" fill="none" stroke="rgba(201,169,110,0.15)" strokeWidth="0.5" />
            <rect x="80" y="90" width="140" height="140" rx="2" fill="none" stroke="rgba(201,169,110,0.1)" strokeWidth="0.5" />

            {/* Brand text on box */}
            <text x="150" y="150" textAnchor="middle" fill="url(#goldFoil)" fontSize="16" fontFamily="serif" letterSpacing="8" fontWeight="300">LUMIÈRE</text>
            <text x="150" y="175" textAnchor="middle" fill="rgba(201,169,110,0.7)" fontSize="20" fontFamily="serif" fontStyle="italic" letterSpacing="3">Noir</text>
            <line x1="100" y1="190" x2="200" y2="190" stroke="rgba(201,169,110,0.3)" strokeWidth="0.5" />
            <text x="150" y="210" textAnchor="middle" fill="rgba(201,169,110,0.4)" fontSize="7" fontFamily="sans-serif" letterSpacing="4">EAU DE PARFUM</text>

            {/* Gold corner accents */}
            <path d="M55,65 L80,65 L55,90 Z" fill="url(#goldFoil)" opacity="0.4" />
            <path d="M245,65 L220,65 L245,90 Z" fill="url(#goldFoil)" opacity="0.4" />
            <path d="M55,255 L80,255 L55,230 Z" fill="url(#goldFoil)" opacity="0.4" />
            <path d="M245,255 L220,255 L245,230 Z" fill="url(#goldFoil)" opacity="0.4" />
        </g>
    </svg>
);

/* ── BOX FLAPS (open outward like real box) ── */
const BoxFlapTop = () => (
    <svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="flapTopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1a1a2e" />
                <stop offset="100%" stopColor="#0f0f2a" />
            </linearGradient>
        </defs>
        <rect x="50" y="10" width="200" height="50" rx="3" fill="url(#flapTopGrad)" stroke="rgba(201,169,110,0.2)" strokeWidth="1" />
        <rect x="50" y="58" width="200" height="2" fill="url(#goldFoil)" opacity="0.5" />
    </svg>
);

const BoxFlapBottom = () => (
    <svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="flapBottomGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0f0f2a" />
                <stop offset="100%" stopColor="#1a1a2e" />
            </linearGradient>
        </defs>
        <rect x="50" y="90" width="200" height="50" rx="3" fill="url(#flapBottomGrad)" stroke="rgba(201,169,110,0.2)" strokeWidth="1" />
        <rect x="50" y="90" width="200" height="2" fill="url(#goldFoil)" opacity="0.5" />
    </svg>
);

const BoxFlapLeft = () => (
    <svg viewBox="0 0 150 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="flapLeftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0a0a1f" />
                <stop offset="100%" stopColor="#151535" />
            </linearGradient>
        </defs>
        <rect x="10" y="50" width="50" height="200" rx="3" fill="url(#flapLeftGrad)" stroke="rgba(201,169,110,0.2)" strokeWidth="1" />
        <rect x="58" y="50" width="2" height="200" fill="url(#goldFoil)" opacity="0.5" />
    </svg>
);

const BoxFlapRight = () => (
    <svg viewBox="0 0 150 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="flapRightGrad" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#0a0a1f" />
                <stop offset="100%" stopColor="#151535" />
            </linearGradient>
        </defs>
        <rect x="90" y="50" width="50" height="200" rx="3" fill="url(#flapRightGrad)" stroke="rgba(201,169,110,0.2)" strokeWidth="1" />
        <rect x="90" y="50" width="2" height="200" fill="url(#goldFoil)" opacity="0.5" />
    </svg>
);

/* ── BOTTLE SVGs ───────────────────────────────────────────────── */
const BottleSVG = () => (
    <svg viewBox="0 0 160 320" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bG" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0d0d1a" />
                <stop offset="35%" stopColor="#1a1230" />
                <stop offset="65%" stopColor="#0d0d1a" />
                <stop offset="100%" stopColor="#060610" />
            </linearGradient>
            <linearGradient id="bS" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="28%" stopColor="rgba(255,255,255,0.12)" />
                <stop offset="40%" stopColor="rgba(255,255,255,0.22)" />
                <stop offset="55%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <linearGradient id="bAu" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#5a3e08" />
                <stop offset="25%" stopColor="#c9a96e" />
                <stop offset="50%" stopColor="#f0d090" />
                <stop offset="75%" stopColor="#c9a96e" />
                <stop offset="100%" stopColor="#5a3e08" />
            </linearGradient>
            <linearGradient id="bL" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(180,120,60,0.25)" />
                <stop offset="100%" stopColor="rgba(110,55,15,0.55)" />
            </linearGradient>
            <clipPath id="bC">
                <path d="M30,20 Q30,10 80,10 Q130,10 130,20 L140,60 L150,280 Q150,310 80,310 Q10,310 10,280 L20,60 Z" />
            </clipPath>
        </defs>
        <path d="M30,20 Q30,10 80,10 Q130,10 130,20 L140,60 L150,280 Q150,310 80,310 Q10,310 10,280 L20,60 Z" fill="url(#bG)" stroke="rgba(200,170,100,0.25)" strokeWidth="1" />
        <rect x="10" y="130" width="140" height="180" clipPath="url(#bC)" fill="url(#bL)" />
        <path d="M30,20 Q30,10 80,10 Q130,10 130,20 L140,60 L150,280 Q150,310 80,310 Q10,310 10,280 L20,60 Z" fill="url(#bS)" />
        <path d="M10,280 L20,60 L30,20 Q30,10 55,10 L55,310 Q10,310 10,280 Z" fill="rgba(0,0,0,0.35)" />
        <rect x="22" y="56" width="116" height="11" rx="2" fill="url(#bAu)" />
        <rect x="12" y="286" width="136" height="10" rx="3" fill="url(#bAu)" />
        <rect x="28" y="100" width="104" height="155" rx="3" fill="rgba(255,255,255,0.03)" stroke="rgba(200,170,100,0.2)" strokeWidth="0.5" />
        <text x="80" y="150" textAnchor="middle" fill="rgba(200,170,100,0.9)" fontSize="12" fontFamily="serif" letterSpacing="6">LUMIÈRE</text>
        <text x="80" y="173" textAnchor="middle" fill="rgba(200,170,100,0.65)" fontSize="22" fontFamily="serif" fontStyle="italic">Noir</text>
        <line x1="44" y1="182" x2="116" y2="182" stroke="rgba(200,170,100,0.25)" strokeWidth="0.5" />
        <text x="80" y="197" textAnchor="middle" fill="rgba(200,170,100,0.4)" fontSize="7" fontFamily="sans-serif" letterSpacing="3">EAU DE PARFUM</text>
        <ellipse cx="52" cy="165" rx="7" ry="58" fill="rgba(255,255,255,0.03)" />
    </svg>
);

const CapSVG = () => (
    <svg viewBox="0 0 80 70" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="cT" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c9a96e" />
                <stop offset="40%" stopColor="#f0d090" />
                <stop offset="100%" stopColor="#8b6914" />
            </linearGradient>
            <linearGradient id="cS" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#5a3e08" />
                <stop offset="30%" stopColor="#c9a96e" />
                <stop offset="70%" stopColor="#f0d090" />
                <stop offset="100%" stopColor="#5a3e08" />
            </linearGradient>
        </defs>
        <ellipse cx="40" cy="10" rx="36" ry="9" fill="url(#cT)" />
        <rect x="4" y="10" width="72" height="48" rx="4" fill="url(#cS)" />
        <rect x="14" y="14" width="8" height="38" rx="4" fill="rgba(255,255,255,0.12)" />
        <rect x="4" y="54" width="72" height="8" rx="2" fill="#4a3206" />
        <text x="40" y="42" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="18" fontFamily="serif" fontStyle="italic">L</text>
    </svg>
);

const NozzleSVG = () => (
    <svg viewBox="0 0 80 28" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="nG" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d4a843" />
                <stop offset="100%" stopColor="#8b6520" />
            </linearGradient>
        </defs>
        <rect x="20" y="7" width="42" height="13" rx="6.5" fill="url(#nG)" />
        <circle cx="18" cy="13.5" r="5" fill="#c49a30" />
        <circle cx="18" cy="13.5" r="2.5" fill="#8b6520" />
        <circle cx="18" cy="13.5" r="1" fill="#4a3000" />
    </svg>
);

/* ── MAIN COMPONENT ── */
export default function PerfumeScroll() {
    // Box refs
    const boxContainerRef = useRef(null);
    const boxBodyRef = useRef(null);
    const boxFlapTopRef = useRef(null);
    const boxFlapBottomRef = useRef(null);
    const boxFlapLeftRef = useRef(null);
    const boxFlapRightRef = useRef(null);

    // Bottle refs
    const bottleWrapRef = useRef(null);
    const capRef = useRef(null);
    const nozzleRef = useRef(null);
    const sprayZoneRef = useRef(null);

    // Info and CTA refs
    const infoLeftRef = useRef(null);
    const infoRightRef = useRef(null);
    const ctaRef = useRef(null);
    const pinTriggerRef = useRef(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        const masterTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: pinTriggerRef.current,
                start: "top top",
                end: "+=400%",
                scrub: 1.5,
                pin: pinTriggerRef.current,
                anticipatePin: 1,
                invalidateOnRefresh: true,
            }
        });

        // ============================================
        // SEQUENCE 1: BOX FLAPS OPEN (10% to 35%)
        // ============================================

        // Top flap opens UPWARD
        masterTimeline.to(boxFlapTopRef.current, {
            y: -120,
            rotateX: -160,
            opacity: 0.5,
            duration: 0.25,
            ease: "back.in(1.2)",
        }, 0.1);

        // Bottom flap opens DOWNWARD
        masterTimeline.to(boxFlapBottomRef.current, {
            y: 120,
            rotateX: 160,
            opacity: 0.5,
            duration: 0.25,
            ease: "back.in(1.2)",
        }, 0.1);

        // Left flap opens LEFT
        masterTimeline.to(boxFlapLeftRef.current, {
            x: -120,
            rotateY: 160,
            opacity: 0.5,
            duration: 0.25,
            ease: "back.in(1.2)",
        }, 0.1);

        // Right flap opens RIGHT
        masterTimeline.to(boxFlapRightRef.current, {
            x: 120,
            rotateY: -160,
            opacity: 0.5,
            duration: 0.25,
            ease: "back.in(1.2)",
        }, 0.1);

        // Box body fades out slightly
        masterTimeline.to(boxBodyRef.current, {
            opacity: 0,
            scale: 0.8,
            duration: 0.2,
        }, 0.25);

        // ============================================
        // SEQUENCE 2: BOTTLE RISES (35% to 50%)
        // ============================================
        masterTimeline.fromTo(bottleWrapRef.current,
            { y: 100, opacity: 0, scale: 0.3 },
            { y: 0, opacity: 1, scale: 1, duration: 0.2, ease: "back.out(0.7)" },
            0.35
        );

        // ============================================
        // SEQUENCE 3: CAP OPENS (50% to 65%)
        // ============================================
        masterTimeline.to(capRef.current, {
            y: -130,
            opacity: 0,
            duration: 0.2,
            ease: "back.in(1.2)",
        }, 0.5);

        masterTimeline.fromTo(nozzleRef.current,
            { opacity: 0, scale: 0.5 },
            { opacity: 1, scale: 1, duration: 0.1 },
            0.58
        );

        // ============================================
        // SEQUENCE 4: SIDE INFO PANELS (55% to 70%)
        // ============================================
        masterTimeline.fromTo(infoLeftRef.current,
            { x: -150, opacity: 0, autoAlpha: 0 },
            { x: 0, opacity: 1, autoAlpha: 1, duration: 0.15 },
            0.55
        );

        masterTimeline.fromTo(infoRightRef.current,
            { x: 150, opacity: 0, autoAlpha: 0 },
            { x: 0, opacity: 1, autoAlpha: 1, duration: 0.15 },
            0.55
        );

        // ============================================
        // SEQUENCE 5: SPRAY ACTIVATES (65% to 85%)
        // ============================================
        masterTimeline.fromTo(sprayZoneRef.current,
            { opacity: 0, scale: 0.3 },
            { opacity: 1, scale: 1, duration: 0.2 },
            0.65
        );

        // ============================================
        // SEQUENCE 6: CTA APPEARS (75% to 90%)
        // ============================================
        masterTimeline.fromTo(ctaRef.current,
            { y: 80, opacity: 0, autoAlpha: 0 },
            { y: 0, opacity: 1, autoAlpha: 1, duration: 0.15 },
            0.75
        );

        // ============================================
        // SEQUENCE 7: BOTTLE EXITS (85% to 100%)
        // ============================================
        masterTimeline.to(bottleWrapRef.current, {
            opacity: 0,
            y: -180,
            duration: 0.15,
            ease: "power1.in",
        }, 0.85);

        // Hide box container
        masterTimeline.to(boxContainerRef.current, {
            opacity: 0,
            visibility: "hidden",
            duration: 0.1,
        }, 0.9);

        return () => {
            masterTimeline.kill();
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            lenis.destroy();
        };
    }, []);

    // Generate spray particles
    const particles = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        delay: (i % 8) * 0.1,
    }));

    return (
        <div className="ps-page">
            {/* Ambient orbs */}
            <div className="ps-orb ps-orb-1"></div>
            <div className="ps-orb ps-orb-2"></div>
            <div className="ps-orb ps-orb-3"></div>

            {/* Hero Section */}
            <section className="ps-hero">
                <p className="ps-eyebrow">Scroll to Experience</p>
                <h1 className="ps-title">
                    <span>LUMIÈRE</span>
                    <em>Noir</em>
                </h1>
                <p className="ps-subtitle">Eau de Parfum · Limited Edition</p>
                <div className="ps-hint">
                    <div className="ps-hint-line" />
                    <span>scroll</span>
                </div>
            </section>

            {/* Sticky Scroll Zone */}
            <div ref={pinTriggerRef} className="ps-scroll-zone">
                <div className="ps-sticky-view">
                    <div className="ps-phase">Experience LUMIÈRE NOIR</div>

                    {/* BOX CONTAINER - NO FLOATING CARDS, NO VELVET TRAY */}
                    <div ref={boxContainerRef} className="ps-box-container">

                        {/* Main Box Body Only */}
                        <div ref={boxBodyRef} className="ps-box-body">
                            <PerfumeBox />
                        </div>
                    </div>

                    {/* BOTTLE ASSEMBLY */}
                    <div ref={bottleWrapRef} className="ps-bottle-wrap">
                        {/* Spray Zone */}
                        <div ref={sprayZoneRef} className="ps-spray-zone">
                            {particles.map(p => (
                                <div
                                    key={p.id}
                                    className="ps-particle"
                                    style={{
                                        width: `${3 + (p.id % 4) * 2}px`,
                                        height: `${3 + (p.id % 4) * 2}px`,
                                        left: '20px',
                                        top: '10px',
                                        animationDelay: `${p.delay}s`,
                                    }}
                                />
                            ))}
                            <div className="ps-mist" style={{ left: '-40px', top: '-10px' }}></div>
                            <div className="ps-mist" style={{ left: '-20px', top: '15px', animationDelay: '0.5s' }}></div>
                            <div className="ps-burst"></div>
                        </div>

                        {/* Cap */}
                        <div ref={capRef} className="ps-cap">
                            <CapSVG />
                        </div>

                        {/* Nozzle */}
                        <div ref={nozzleRef} className="ps-nozzle">
                            <NozzleSVG />
                        </div>

                        {/* Bottle Body */}
                        <div className="ps-body">
                            <BottleSVG />
                        </div>
                        <div className="ps-ground"></div>
                    </div>

                    {/* INFO PANELS - LEFT AND RIGHT (NOTES ARE HERE) */}
                    <div ref={infoLeftRef} className="ps-info ps-info-l">
                        <span className="ps-label">Top Notes</span>
                        <p>Bergamot · Black Pepper</p>
                        <span className="ps-label">Heart Notes</span>
                        <p>Oud · Rose Absolute</p>
                    </div>

                    <div ref={infoRightRef} className="ps-info ps-info-r">
                        <span className="ps-label">Base Notes</span>
                        <p>Amber · Sandalwood</p>
                        <span className="ps-label">Longevity</span>
                        <p>12–14 hours</p>
                    </div>

                    {/* CTA */}
                    <div ref={ctaRef} className="ps-cta">
                        <button className="ps-btn">Discover the Collection</button>
                        <span className="ps-price">₹12,500 · 50ml</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="ps-footer">
                <div className="ps-divider" />
                <p className="ps-quote">"A fragrance is a mood you wear."</p>
                <div className="ps-nav">
                    <span>Shop</span>
                    <span>About</span>
                    <span>Stores</span>
                    <span>Contact</span>
                </div>
            </footer>
        </div>
    );
}