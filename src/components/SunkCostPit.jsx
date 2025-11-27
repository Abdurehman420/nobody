import React, { useState } from 'react';
import SquishyButton from './SquishyButton';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';

/**
 * NEON MYCELIUM - Sunk Cost Fallacy Pit
 * MODULE F Feature #41
 * 
 * A literal bottomless pit with a coin slot.
 * You can throw Flux into it forever. There is NO reward.
 */

const SunkCostPit = ({ gameState, dispatch }) => {
    const [invested, setInvested] = useState(0);
    const [lastThrow, setLastThrow] = useState(0);

    const throwFlux = (amount) => {
        if (gameState.resources.flux < amount) {
            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: "You don't have enough Flux to throw away. Yet."
            });
            return;
        }

        dispatch({
            type: 'THROW_INTO_PIT',
            payload: { amount }
        });

        const newTotal = invested + amount;
        setInvested(newTotal);
        setLastThrow(Date.now());

        // Gary's escalating messages
        if (newTotal >= 10000) {
            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: "Keep going. I have a feeling the next one is the winner. (Narrator voice: It wasn't)."
            });
        } else if (newTotal >= 1000) {
            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: "Maybe the next coin will trigger the jackpot?"
            });
        } else if (newTotal >= 100) {
            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: "You've already invested so much..."
            });
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: '100px',
            left: '20px',
            width: '90px',
            background: 'linear-gradient(180deg, #1a1a1a 0%, #000 100%)',
            border: '3px solid #666',
            borderRadius: '8px',
            padding: '12px',
            zIndex: 100,
            fontFamily: 'monospace',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.9), inset 0 0 20px rgba(0, 0, 0, 0.5)'
        }}>
            {/* Title */}
            <div style={{
                fontSize: '10px',
                color: '#666',
                marginBottom: '8px',
                textAlign: 'center'
            }}>
                BOTTOMLESS PIT
            </div>

            {/* The Pit */}
            <div style={{
                width: '100%',
                height: '80px', // Increased height for image
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px',
                position: 'relative'
            }}>
                <img
                    src="/assets/bottomless_pit.png"
                    alt="Bottomless Pit"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.8))'
                    }}
                />
            </div>

            {/* Invested Counter */}
            <div style={{
                fontSize: '9px',
                color: '#FF6666',
                marginBottom: '8px',
                textAlign: 'center'
            }}>
                LOST: {invested}
            </div>

            {/* Throw Buttons */}
            <SquishyButton
                onClick={() => throwFlux(100)}
                preset="WOBBLY"
                style={{
                    width: '100%',
                    marginBottom: '4px',
                    background: '#1a1a1a',
                    border: '1px solid #666',
                    color: '#FF6666',
                    padding: '4px',
                    fontSize: '10px',
                    cursor: 'pointer'
                }}
            >
                Throw 100
            </SquishyButton>

            <SquishyButton
                onClick={() => throwFlux(1000)}
                preset="WOBBLY"
                style={{
                    width: '100%',
                    marginBottom: '4px',
                    background: '#1a1a1a',
                    border: '1px solid #666',
                    color: '#FF6666',
                    padding: '4px',
                    fontSize: '10px',
                    cursor: 'pointer'
                }}
            >
                Throw 1,000
            </SquishyButton>

            <SquishyButton
                onClick={() => throwFlux(10000)}
                preset="BOUNCY"
                style={{
                    width: '100%',
                    background: '#2a0000',
                    border: '1px solid #FF0000',
                    color: '#FF0000',
                    padding: '4px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
            >
                Throw 10,000
            </SquishyButton>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
};

export default SunkCostPit;
