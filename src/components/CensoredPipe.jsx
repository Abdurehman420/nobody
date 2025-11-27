import React, { useState, useEffect } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';

const CensoredPipe = ({ gameState }) => {
    const [position, setPosition] = useState(null);

    useEffect(() => {
        // Randomly appear
        const appearInterval = setInterval(() => {
            if (Math.random() < 0.05 && !position) { // 5% chance every 15s
                // Pick a random spot
                setPosition({
                    x: Math.random() * (window.innerWidth - 200) + 100,
                    y: Math.random() * (window.innerHeight - 200) + 100,
                    rotation: Math.random() * 360
                });

                eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                    message: "That pipe segment was too explicit. We had to blur it."
                });

                // Disappear after 10s
                setTimeout(() => setPosition(null), 10000);
            }
        }, 15000);

        return () => clearInterval(appearInterval);
    }, [position]);

    if (!position) return null;

    return (
        <div
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                width: '100px',
                height: '30px',
                transform: `rotate(${position.rotation}deg)`,
                background: 'repeating-linear-gradient(45deg, #000, #000 5px, #333 5px, #333 10px)',
                zIndex: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontSize: '10px',
                fontWeight: 'bold',
                border: '2px solid #FFF',
                filter: 'blur(1px)'
            }}
        >
            [CENSORED]
        </div>
    );
};

export default CensoredPipe;
