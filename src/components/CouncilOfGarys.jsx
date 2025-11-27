import React, { useState, useEffect } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';
import SquishyButton from './SquishyButton';

const CouncilOfGarys = ({ gameState }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Randomly appear
        const appearInterval = setInterval(() => {
            if (Math.random() < 0.005 && !isVisible) { // 0.5% chance every 40s
                setIsVisible(true);
                eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                    message: "Oh no. The Council is here. Look busy."
                });
            }
        }, 40000);

        return () => clearInterval(appearInterval);
    }, [isVisible]);

    const handleDismiss = () => {
        setIsVisible(false);
        eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
            message: "They voted 'Meh'. I'll take it."
        });
    };

    if (!isVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '20%',
                left: '20%',
                width: '60%',
                height: '60%',
                background: 'radial-gradient(circle, #4B0082, #000)',
                borderRadius: '50%',
                zIndex: 1500,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '5px solid #9400D3',
                boxShadow: '0 0 50px #9400D3'
            }}
        >
            <h2 style={{ color: '#FFF', marginBottom: '30px' }}>THE COUNCIL OF GARYS</h2>

            <div style={{ display: 'flex', gap: '40px', marginBottom: '30px' }}>
                {/* Gary 1: Eyepatch */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '40px' }}>🧐</div>
                    <div style={{ color: '#AAA' }}>Gary Prime</div>
                </div>
                {/* Gary 2: Hammer */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '40px' }}>🔨</div>
                    <div style={{ color: '#AAA' }}>Gary The Builder</div>
                </div>
                {/* Gary 3: Butt */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '40px' }}>🍑</div>
                    <div style={{ color: '#AAA' }}>Gary (Don't Ask)</div>
                </div>
            </div>

            <div style={{ color: '#FFF', fontSize: '18px', marginBottom: '20px', fontStyle: 'italic' }}>
                "Your node placement is... derivative."
            </div>

            <SquishyButton onClick={handleDismiss} preset="BOUNCY">
                ACCEPT JUDGMENT
            </SquishyButton>
        </div>
    );
};

export default CouncilOfGarys;
