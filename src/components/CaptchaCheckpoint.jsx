import React, { useState, useEffect } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';
import SquishyButton from './SquishyButton';

const CaptchaCheckpoint = ({ gameState }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Randomly appear
        const appearInterval = setInterval(() => {
            if (Math.random() < 0.01 && !isVisible) { // 1% chance every 30s
                setIsVisible(true);
                eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                    message: "Please prove you are not a simulation."
                });
            }
        }, 30000);

        return () => clearInterval(appearInterval);
    }, [isVisible]);

    const handleClick = (isCorrect) => {
        if (isCorrect) {
            setIsVisible(false);
            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: "Acceptable. You may exist."
            });
        } else {
            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: "Wrong. That is clearly a toaster, not dread."
            });
        }
    };

    if (!isVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: '#FFF',
                padding: '20px',
                borderRadius: '5px',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                zIndex: 2000,
                color: '#000',
                width: '300px'
            }}
        >
            <div style={{ background: '#4285F4', color: '#FFF', padding: '10px', marginBottom: '10px', fontWeight: 'bold' }}>
                reCAPTCHA
            </div>
            <p style={{ margin: '0 0 10px' }}>Select all images containing <strong>EXISTENTIAL DREAD</strong></p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                <div
                    onClick={() => handleClick(false)}
                    style={{ height: '80px', background: '#EEE', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                    Toaster
                </div>
                <div
                    onClick={() => handleClick(true)}
                    style={{ height: '80px', background: '#333', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                    The Void
                </div>
                <div
                    onClick={() => handleClick(false)}
                    style={{ height: '80px', background: '#EEE', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                    Cat
                </div>
                <div
                    onClick={() => handleClick(true)}
                    style={{ height: '80px', background: '#000', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                    Entropy
                </div>
            </div>

            <div style={{ marginTop: '10px', textAlign: 'right' }}>
                <SquishyButton onClick={() => handleClick(false)} preset="GENTLE" style={{ fontSize: '10px' }}>
                    Verify
                </SquishyButton>
            </div>
        </div>
    );
};

export default CaptchaCheckpoint;
