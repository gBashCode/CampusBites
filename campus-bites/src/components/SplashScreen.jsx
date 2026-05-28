import React, { useEffect, useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
    const [exit, setExit] = useState(false);

    useEffect(() => {
        // Trigger exit animation
        const timer = setTimeout(() => {
            setExit(true);
        }, 2200); // Display for 2.2 seconds

        // Notify parent after exit animation finishes
        const completeTimer = setTimeout(() => {
            onComplete();
        }, 3300); // 2200ms + 1000ms transition time + 100ms buffer

        return () => {
            clearTimeout(timer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div className={`splash-screen ${exit ? 'exit' : ''}`}>
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
