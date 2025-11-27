import React, { useState, useEffect } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';
import { audioSynthesizer } from '../systems/AudioSynthesizer';

const CopyrightStrike = () => {
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        // Randomly trigger
        const triggerInterval = setInterval(() => {
            if (Math.random() < 0.02 && !isActive) { // 2% chance every 30s
                triggerStrike();
            }
        }, 30000);

        return () => clearInterval(triggerInterval);
    }, [isActive]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        endStrike();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isActive, timeLeft]);

    const triggerStrike = () => {
        setIsActive(true);
        setTimeLeft(30);

        // Mute audio
        // We can emit an event that RadioWidget listens to, or try to mute globally
        // For now, let's emit an event
        eventBus.emit('COPYRIGHT_STRIKE_START');

        // Gary comment
        eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
            message: "Great. The algorithm found us. Enjoy the silence."
        });
    };

    const endStrike = () => {
        setIsActive(false);
        eventBus.emit('COPYRIGHT_STRIKE_END');
    };

    if (!isActive) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '100px',
                right: '20px',
                width: '300px',
                background: '#222',
                border: '2px solid #FF4444',
                borderRadius: '5px',
                padding: '15px',
                zIndex: 1000,
                color: '#FFF',
                fontFamily: 'Arial, sans-serif',
                boxShadow: '0 0 20px rgba(255, 0, 0, 0.5)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ fontSize: '24px' }}>🔇</div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#FF4444' }}>COPYRIGHT CLAIM</h3>
            </div>

            <p style={{ fontSize: '12px', color: '#AAA', margin: '0 0 10px' }}>
                Audio has been muted due to a claim by <strong>Galactic Federation Records</strong>.
            </p>

            <div style={{ fontSize: '12px', color: '#888' }}>
                Dispute expires in: <span style={{ color: '#FFF' }}>{timeLeft}s</span>
            </div>

            <div style={{
                marginTop: '10px',
                fontSize: '10px',
                color: '#666',
                fontStyle: 'italic'
            }}>
                "Silence is intellectual property."
            </div>
        </div>
    );
};

export default CopyrightStrike;
