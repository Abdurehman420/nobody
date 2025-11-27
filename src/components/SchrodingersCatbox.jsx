import React, { useState } from 'react';
import SquishyButton from './SquishyButton';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';

/**
 * NEON MYCELIUM - Schrödinger's Catbox
 * MODULE F Feature #19
 * 
 * A vibrating cardboard box that is simultaneously full AND empty.
 * 50% chance to explode (destroy pipe) or grant infinite resources (10s).
 */

const SchrodingersCatbox = ({ position, onResolve }) => {
    const [isObserved, setIsObserved] = useState(false);
    const vibrationPhase = Math.sin(Date.now() * 0.01) * 5;

    const handleClick = () => {
        if (isObserved) return;

        setIsObserved(true);

        // Collapse the wave function!
        const outcome = Math.random() < 0.5;

        if (outcome) {
            // EXPLODE
            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: "Don't look at it! If you look, you collapse the wave function! Oh, too late."
            });
            onResolve({ type: 'EXPLODE', position });
        } else {
            // INFINITE RESOURCES
            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: "The box was full! Enjoy your 10 seconds of infinite abundance."
            });
            onResolve({ type: 'INFINITE', position, duration: 10000 });
        }
    };

    return (
        <SquishyButton
            onClick={handleClick}
            preset="WOBBLY"
            style={{
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: `translate(-50%, -50%) rotate(${vibrationPhase}deg)`,
                fontSize: '40px',
                background: isObserved ? '#FF0000' : 'transparent',
                border: 'none',
                cursor: isObserved ? 'not-allowed' : 'pointer',
                filter: isObserved ? 'grayscale(1)' : 'none',
                transition: 'all 0.3s'
            }}
            title="Schrödinger's Catbox - Click to observe!"
        >
            📦
        </SquishyButton>
    );
};

export default SchrodingersCatbox;
