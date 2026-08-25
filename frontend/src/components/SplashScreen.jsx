import React, { useEffect, useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
    const [exit, setExit] = useState(false);

    useEffect(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
            onComplete();
            return;
        }

        const timer = setTimeout(() => setExit(true), 2200);
        const completeTimer = setTimeout(() => onComplete(), 3300);

        return () => {
            clearTimeout(timer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div className={`splash-screen ${exit ? 'exit' : ''}`}>
            <button
                onClick={onComplete}
                aria-label="Skip splash screen"
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    zIndex: 10,
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
            >
                Skip
            </button>
            <div className="splash-logo-container">
                <div className="logo-3d-block">
                    <UtensilsCrossed size={36} className="logo-icon-3d" />
                </div>
            </div>
            <div className="splash-content">
                <h1 className="splash-text">CAMPUS BITES</h1>
            </div>
            <div className="splash-tagline-wrapper">
                <p className="splash-tagline">Satisfy your hunger, faster.</p>
            </div>
        </div>
    );
};

export default SplashScreen;
