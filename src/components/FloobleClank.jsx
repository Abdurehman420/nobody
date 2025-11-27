import React, { useState, useRef, useEffect } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';

/**
 * NEON MYCELIUM - Flooble Crank
 * MODULE F Feature #26
 * 
 * A fleshy, pink lever that represses emotional baggage.
 * Each rotation adds 1-3 minutes to repression timer.
 * While timer is active, Emotional Baggage turns neon and moves fast.
 */

const FloobleClank = ({ gameState, dispatch }) => {
    const [rotations, setRotations] = useState(0);
    const [repressionTime, setRepressionTime] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [rotation, setRotation] = useState(0);
    const startAngleRef = useRef(0);
    const lastRotationRef = useRef(0);
    const leverRef = useRef(null);

    // Count down repression timer
    useEffect(() => {
        if (repressionTime <= 0) return;

        const interval = setInterval(() => {
            setRepressionTime(prev => Math.max(0, prev - 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [repressionTime]);

    // Update global state with repression status
    useEffect(() => {
        dispatch({
            type: 'SET_BAGGAGE_REPRESSION',
            payload: repressionTime > 0
        });
    }, [repressionTime > 0]);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        startAngleRef.current = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !leverRef.current) return;

        const rect = leverRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

        let deltaAngle = currentAngle - startAngleRef.current;

        // Handle wrapping around -PI/PI
        if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
        if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

        const deltaDegrees = deltaAngle * 180 / Math.PI;

        setRotation(prev => {
            const newRotation = prev + deltaDegrees;

            // Check for full rotation
            // We use a threshold of 360 degrees relative to the last counted rotation
            if (Math.abs(newRotation - lastRotationRef.current) >= 360) {
                // We can't call handleFullRotation directly here because it updates state
                // and we are inside a state update function.
                // Instead, we'll trigger it via a side effect or just update the ref here
                // and use a useEffect to detect the change?
                // Actually, let's just update the ref and rely on the next render cycle or a separate check.
                // Better yet, let's just do the check outside the setRotation.
                return newRotation;
            }
            return newRotation;
        });

        // Perform the check with the calculated new rotation
        const newRotation = rotation + deltaDegrees;
        if (Math.abs(newRotation - lastRotationRef.current) >= 360) {
            handleFullRotation();
            lastRotationRef.current = newRotation;
        }

        startAngleRef.current = currentAngle;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleFullRotation = () => {
        // Add 1-3 minutes of repression
        const bonusTime = 60000 + Math.random() * 120000;
        setRepressionTime(prev => prev + bonusTime);
        setRotations(prev => prev + 1);

        // Gary dialogue
        // Gary dialogue
        const messages = [
            "Oh, you found the repression lever. Good. Keep cranking. If you stop, the feelings come back. And nobody wants to hear that suitcase cry.",
            "It Clanks Floobles."
        ];
        eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
            message: messages[Math.floor(Math.random() * messages.length)]
        });
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, rotation]);

    const minutes = Math.floor(repressionTime / 60000);
    const seconds = Math.floor((repressionTime % 60000) / 1000);

    return (
        <div style={{
            position: 'fixed',
            bottom: '350px',
            left: '20px',
            width: '100px',
            zIndex: 100,
            fontFamily: 'monospace'
        }}>
            {/* Curved Text Label */}
            <svg width="120" height="120" viewBox="0 0 120 120" style={{
                position: 'absolute',
                top: '-25px',
                left: '-10px',
                pointerEvents: 'none',
                zIndex: 10,
                overflow: 'visible'
            }}>
                <defs>
                    <path id="floobleCurve" d="M 15,60 A 45,45 0 0,1 105,60" />
                </defs>
                <text width="120">
                    <textPath href="#floobleCurve" startOffset="50%" textAnchor="middle" style={{
                        fill: '#FF6B9D',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        letterSpacing: '1px',
                        filter: 'drop-shadow(0 0 5px #FF6B9D)'
                    }}>
                        FLOOBLE CLANK
                    </textPath>
                </text>
            </svg>

            {/* Lever */}
            <div
                ref={leverRef}
                style={{
                    width: '100px',
                    height: '100px',
                    position: 'relative',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onMouseDown={handleMouseDown}
            >
                {/* Full Rotating Crank */}
                <img
                    src="/assets/crank_full.png"
                    alt="Flooble Crank"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        transform: `rotate(${rotation}deg)`,
                        transformOrigin: 'center',
                        filter: 'drop-shadow(0 4px 15px rgba(255, 107, 157, 0.5))',
                        pointerEvents: 'none' // Let clicks pass through to container
                    }}
                />
            </div>

            {/* Stats */}
            <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                width: '100%',
                marginTop: '10px',
                fontSize: '10px',
                color: '#FF6B9D',
                textAlign: 'center',
                pointerEvents: 'none'
            }}>
                <div>CRANKS: {rotations}</div>
                {repressionTime > 0 && (
                    <div style={{ color: '#00FF00', marginTop: '5px' }}>
                        REPRESSION: {minutes}:{seconds.toString().padStart(2, '0')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FloobleClank;
