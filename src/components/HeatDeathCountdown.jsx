import React, { useState, useEffect } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';

const HeatDeathCountdown = ({ gameState }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState(BigInt("31536000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")); // ~10^100 years in seconds

    useEffect(() => {
        // Trigger at 1B Flux
        if (gameState.resources.flux >= 1000000000 && !isVisible) {
            setIsVisible(true);
            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: "Congratulations. You have enough energy to accelerate the heat death of the universe. No pressure."
            });
        }
    }, [gameState.resources.flux, isVisible]);

    useEffect(() => {
        if (isVisible) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1n);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#FF0000',
                fontFamily: 'monospace',
                fontSize: '12px',
                zIndex: 1000,
                textAlign: 'center',
                textShadow: '0 0 5px #FF0000',
                pointerEvents: 'none'
            }}
        >
            <div>TIME UNTIL HEAT DEATH:</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {timeLeft.toString()} SECONDS
            </div>
        </div>
    );
};

export default HeatDeathCountdown;
