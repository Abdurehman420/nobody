/**
 * NEON MYCELIUM - Squishy Button Component
 * 
 * Demo button with spring physics "squish" on interaction.
 * All buttons should eventually use this pattern.
 */

import React from 'react';
import { useSquishButton } from '../hooks/useSpring';
import '../styles/app-juice.css';

export function SquishyButton({
    children,
    onClick,
    className = '',
    preset = 'BOUNCY',
    ...props
}) {
    const { scale, onMouseDown, onMouseUp, onMouseLeave } = useSquishButton({ preset });

    return (
        <button
            className={`squishy-button ${className}`}
            style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center',
            }}
            onMouseDown={(e) => {
                onMouseDown();
                import('../systems/AudioSynthesizer').then(({ audioSynthesizer }) => {
                    audioSynthesizer.playMechanicalClick();
                });
            }}
            onClick={(e) => {
                onClick?.(e);
            }}
            onMouseEnter={() => {
                import('../systems/AudioSynthesizer').then(({ audioSynthesizer }) => {
                    audioSynthesizer.playFabricRustle();
                });
            }}
            onMouseLeave={onMouseLeave}
            {...props}
        >
            {children}
        </button>
    );
}

export default SquishyButton;
