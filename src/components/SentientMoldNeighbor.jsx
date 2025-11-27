import React, { useState, useEffect } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';
import SquishyButton from './SquishyButton';

const SentientMoldNeighbor = ({ gameState, dispatch }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState("Hey neighbor, got any spare Flux?");

    useEffect(() => {
        // Randomly appear
        const appearInterval = setInterval(() => {
            if (Math.random() < 0.03 && !isVisible) { // 3% chance every 25s
                setIsVisible(true);
                setMessage("Hey neighbor, got any spare Flux? I'm good for it.");
            }
        }, 25000);

        return () => clearInterval(appearInterval);
    }, [isVisible]);

    const handleGive = () => {
        if (gameState.resources.flux >= 100) {
            dispatch({ type: 'SPEND_RESOURCE', payload: { resource: 'flux', amount: 100 } });
            setMessage("Thanks! I'll pay you back... eventually.");
            setTimeout(() => setIsVisible(false), 2000);

            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: "You know you're never seeing that Flux again, right?"
            });
        } else {
            setMessage("You're broke? Gross.");
            setTimeout(() => setIsVisible(false), 2000);
        }
    };

    const handleDeny = () => {
        setMessage("Wow. Rude. Leaving a 1-star review on GalaxyYelp.");
        setTimeout(() => setIsVisible(false), 2000);

        // Trigger review bomb
        eventBus.emit('YELP_REVIEW_BOMB');

        eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
            message: "Great, now our property value is going down."
        });
    };

    if (!isVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '200px',
                right: '0',
                width: '150px',
                background: '#2E8B57',
                border: '4px solid #006400',
                borderRight: 'none',
                borderRadius: '10px 0 0 10px',
                padding: '10px',
                zIndex: 900,
                color: '#FFF',
                boxShadow: '-5px 5px 15px rgba(0,0,0,0.5)',
                transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.5s ease-out'
            }}
        >
            {/* Mold Face */}
            <div style={{
                width: '60px',
                height: '60px',
                background: '#90EE90',
                borderRadius: '50%',
                margin: '0 auto 10px',
                position: 'relative',
                border: '2px solid #006400'
            }}>
                <div style={{ position: 'absolute', top: '20px', left: '15px', width: '8px', height: '8px', background: 'black', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', top: '20px', right: '15px', width: '8px', height: '8px', background: 'black', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '15px', left: '20px', width: '20px', height: '4px', background: 'black', borderRadius: '2px' }} />
            </div>

            <div style={{ fontSize: '12px', marginBottom: '10px', textAlign: 'center' }}>
                {message}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <SquishyButton onClick={handleGive} preset="GENTLE" style={{ fontSize: '10px' }}>
                    Give 100 Flux
                </SquishyButton>
                <SquishyButton onClick={handleDeny} preset="STIFF" style={{ fontSize: '10px', background: '#FF4444' }}>
                    Get Lost
                </SquishyButton>
            </div>
        </div>
    );
};

export default SentientMoldNeighbor;
