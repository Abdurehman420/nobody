import React, { useState, useEffect } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';
import SquishyButton from './SquishyButton';

const PaidPromotionBlimp = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState(-300); // Start off-screen left

    useEffect(() => {
        // Randomly appear
        const appearInterval = setInterval(() => {
            if (Math.random() < 0.05 && !isVisible) { // 5% chance every 15s
                setIsVisible(true);
                setPosition(-300);

                // Gary comment
                if (Math.random() < 0.5) {
                    eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                        message: "We lost the contact form for that ad space. Shame."
                    });
                }
            }
        }, 15000);

        return () => clearInterval(appearInterval);
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible) return;

        const moveInterval = setInterval(() => {
            setPosition(prev => {
                const newPos = prev + 1; // Move right
                if (newPos > window.innerWidth + 100) {
                    setIsVisible(false);
                    return -300;
                }
                return newPos;
            });
        }, 20); // 50fps

        return () => clearInterval(moveInterval);
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '50px',
                left: `${position}px`,
                zIndex: 5, // Behind UI but in front of background
                pointerEvents: 'none', // Don't block clicks
                filter: 'drop-shadow(0 20px 10px rgba(0,0,0,0.3))'
            }}
        >
            {/* Blimp Image */}
            <img
                src="/assets/blimp_schleichwerbung.png"
                alt="Schleichwerbung Blimp"
                style={{
                    width: '400px', // Increased size for visibility
                    height: 'auto',
                    objectFit: 'contain'
                }}
            />
        </div>
    );
};

export default PaidPromotionBlimp;
