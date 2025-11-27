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
            {/* Blimp SVG */}
            <svg width="300" height="150" viewBox="0 0 300 150" style={{ overflow: 'visible' }}>
                {/* Balloon */}
                <ellipse cx="150" cy="60" rx="100" ry="40" fill="#8B4513" stroke="#5D4037" strokeWidth="2" />
                <path d="M 50 60 Q 150 20, 250 60" fill="none" stroke="#A0522D" strokeWidth="2" opacity="0.5" />
                <path d="M 50 60 Q 150 100, 250 60" fill="none" stroke="#A0522D" strokeWidth="2" opacity="0.5" />

                {/* Fins */}
                <path d="M 40 60 L 20 40 L 50 50 Z" fill="#5D4037" />
                <path d="M 40 60 L 20 80 L 50 70 Z" fill="#5D4037" />

                {/* Gondola */}
                <rect x="120" y="100" width="60" height="20" rx="5" fill="#5D4037" />
                <line x1="130" y1="90" x2="130" y2="100" stroke="black" />
                <line x1="170" y1="90" x2="170" y2="100" stroke="black" />

                {/* Banner */}
                <g transform="translate(150, 120)">
                    <rect x="-100" y="0" width="200" height="40" fill="#F5F5DC" stroke="#8B4513" />
                    <text
                        x="0"
                        y="25"
                        textAnchor="middle"
                        fontFamily="Courier New, monospace"
                        fontWeight="bold"
                        fontSize="14"
                        fill="#8B0000"
                    >
                        YOUR AD HERE - 555-VOID
                    </text>
                </g>
            </svg>
        </div>
    );
};

export default PaidPromotionBlimp;
