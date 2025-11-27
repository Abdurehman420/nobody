import React, { useState } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';
import SquishyButton from './SquishyButton';

const NFTCollection = ({ gameState, dispatch }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [owned, setOwned] = useState(false);

    // Trigger visibility randomly or based on wealth
    React.useEffect(() => {
        if (gameState.resources.flux > 500000 && !isVisible && !owned) {
            const interval = setInterval(() => {
                if (Math.random() < 0.1) {
                    setIsVisible(true);
                    eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                        message: "Exclusive investment opportunity detected. Don't think, just buy."
                    });
                }
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [gameState.resources.flux, isVisible, owned]);

    const handleBuy = () => {
        if (gameState.resources.flux >= 1000000) {
            dispatch({ type: 'SPEND_RESOURCE', payload: { resource: 'flux', amount: 1000000 } });
            setOwned(true);
            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: "You bought the jpeg. It does nothing. You can't sell it. Congratulations."
            });
        } else {
            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: "You're too poor for this art. It's a metaphor for society."
            });
        }
    };

    const handleRightClick = (e) => {
        e.preventDefault();
        eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
            message: "Right-click save? That's theft. I'm calling the cyber-police."
        });
    };

    if (!isVisible && !owned) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '100px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.9)',
                border: '2px solid #FFD700',
                padding: '20px',
                borderRadius: '10px',
                zIndex: 100,
                textAlign: 'center',
                boxShadow: '0 0 50px rgba(255, 215, 0, 0.3)'
            }}
        >
            <h3 style={{ color: '#FFD700', marginTop: 0 }}>BORED GARY YACHT CLUB #1</h3>

            {/* The NFT */}
            <div
                onContextMenu={handleRightClick}
                style={{
                    width: '200px',
                    height: '200px',
                    background: '#333',
                    margin: '0 auto 15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #555'
                }}
            >
                {/* Pixelated Monkey/Gary SVG */}
                <svg width="160" height="160" viewBox="0 0 16 16" shapeRendering="crispEdges">
                    {/* Background */}
                    <rect width="16" height="16" fill="#444" />
                    {/* Face */}
                    <rect x="4" y="4" width="8" height="8" fill="#E8A2C8" />
                    {/* Eyes */}
                    <rect x="5" y="6" width="2" height="2" fill="white" />
                    <rect x="6" y="6" width="1" height="1" fill="black" />
                    <rect x="9" y="6" width="2" height="2" fill="white" />
                    <rect x="9" y="6" width="1" height="1" fill="black" />
                    {/* Mouth */}
                    <rect x="6" y="10" width="4" height="1" fill="black" />
                    {/* Hat */}
                    <rect x="4" y="2" width="8" height="2" fill="#FFD700" />
                </svg>
            </div>

            {!owned ? (
                <>
                    <div style={{ color: '#00FFFF', marginBottom: '10px' }}>Price: 1,000,000 Flux</div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <SquishyButton onClick={handleBuy} preset="BOUNCY">
                            MINT NOW
                        </SquishyButton>
                        <SquishyButton onClick={() => setIsVisible(false)} preset="STIFF">
                            PASS
                        </SquishyButton>
                    </div>
                </>
            ) : (
                <>
                    <div style={{ color: '#00FF00', marginBottom: '10px' }}>OWNED (1/1)</div>
                    <SquishyButton
                        disabled
                        style={{ opacity: 0.5, cursor: 'not-allowed' }}
                        preset="STIFF"
                    >
                        SAVE AS... (DISABLED)
                    </SquishyButton>
                    <div style={{ marginTop: '10px' }}>
                        <SquishyButton onClick={() => setIsVisible(false)} preset="GENTLE">
                            CLOSE
                        </SquishyButton>
                    </div>
                </>
            )}
        </div>
    );
};

export default NFTCollection;
