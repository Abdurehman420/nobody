import React, { useState, useEffect, useRef } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';
import SquishyButton from './SquishyButton';
import { audioManager } from '../engine/audio';

const MicroTransactionPopup = ({ gameState }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    useEffect(() => {
        // Randomly appear
        const appearInterval = setInterval(() => {
            if (Math.random() < 0.05 && !isVisible) { // 5% chance every 20s
                setIsVisible(true);
                setButtonPos({ x: 0, y: 0 });
            }
        }, 20000);

        return () => clearInterval(appearInterval);
    }, [isVisible]);

    const handleHoverBuy = (e) => {
        // Button runs away from cursor
        const x = (Math.random() - 0.5) * 300;
        const y = (Math.random() - 0.5) * 300;
        setButtonPos({ x, y });
    };

    const handleNoThanks = () => {
        setIsVisible(false);
        // Play cash register sound anyway
        audioManager.playSound('cash_register');

        eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
            message: "Your money is worthless here. But I'll take it in spirit."
        });
    };

    if (!isVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.8)',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div
                ref={containerRef}
                style={{
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    padding: '30px',
                    borderRadius: '20px',
                    border: '5px solid #FFF',
                    boxShadow: '0 0 50px #FFD700',
                    textAlign: 'center',
                    maxWidth: '400px',
                    color: '#000'
                }}
            >
                <h2 style={{ fontSize: '32px', margin: '0 0 20px', textTransform: 'uppercase' }}>
                    ⚠️ OXYGEN DEPLETED ⚠️
                </h2>
                <p style={{ fontSize: '18px', marginBottom: '30px' }}>
                    Your free trial of Oxygen has expired. Please upgrade to the Premium Life Package to continue breathing.
                </p>

                <div style={{ position: 'relative', height: '60px' }}>
                    <div
                        onMouseEnter={handleHoverBuy}
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '0',
                            transform: `translate(calc(-50% + ${buttonPos.x}px), ${buttonPos.y}px)`,
                            transition: 'transform 0.2s ease-out'
                        }}
                    >
                        <SquishyButton
                            preset="BOUNCY"
                            style={{
                                background: '#00FF00',
                                color: '#000',
                                fontSize: '20px',
                                padding: '15px 30px',
                                border: '3px solid #000'
                            }}
                        >
                            UNLOCK OXYGEN ($0.99)
                        </SquishyButton>
                    </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <SquishyButton
                        onClick={handleNoThanks}
                        preset="GENTLE"
                        style={{
                            background: 'transparent',
                            color: '#555',
                            textDecoration: 'underline',
                            fontSize: '12px'
                        }}
                    >
                        No thanks, I'll hold my breath
                    </SquishyButton>
                </div>
            </div>
        </div>
    );
};

export default MicroTransactionPopup;
