import React, { useState, useRef, useEffect } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';

/**
 * NEON MYCELIUM - Banana for Scale
 * MODULE F Feature #31
 * 
 * A photorealistic yellow banana that floats around.
 * Click to dismiss, returns after 3-20 minutes.
 * Changes node measurements to Bananas³.
 */

const BananaForScale = ({ gameState, dispatch }) => {
    const [measurements, setMeasurements] = useState([]);
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [velocity, setVelocity] = useState({ x: 1, y: 1 });
    const [rotation, setRotation] = useState(0);
    const animationRef = useRef(null);
    const lastMeasuredRef = useRef(0);

    // Helper: Convert World to Screen
    const toScreen = (x, y) => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        return {
            x: (x - gameState.worldOffset.x) * gameState.zoom + centerX,
            y: (y - gameState.worldOffset.y) * gameState.zoom + centerY
        };
    };

    // Floating animation & Measurement Logic
    useEffect(() => {
        const animate = () => {
            setPosition(prev => {
                let newX = prev.x + velocity.x;
                let newY = prev.y + velocity.y;
                let newVelX = velocity.x;
                let newVelY = velocity.y;

                // Bounce off edges
                if (newX < 0 || newX > window.innerWidth - 120) {
                    newVelX = -velocity.x;
                    newX = Math.max(0, Math.min(window.innerWidth - 120, newX));
                }
                if (newY < 0 || newY > window.innerHeight - 100) {
                    newVelY = -velocity.y;
                    newY = Math.max(0, Math.min(window.innerHeight - 100, newY));
                }

                setVelocity({ x: newVelX, y: newVelY });

                // MEASUREMENT LOGIC (Throttle to every 100ms to save perf)
                const now = Date.now();
                if (now - lastMeasuredRef.current > 100) {
                    lastMeasuredRef.current = now;

                    // Banana center (approx)
                    const bx = newX + 60;
                    const by = newY + 20;
                    const bananaRadius = 30;

                    const checkCollision = (entity, type, radius = 20) => {
                        const screenPos = toScreen(entity.x, entity.y);
                        const dx = screenPos.x - bx;
                        const dy = screenPos.y - by;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < (radius * gameState.zoom + bananaRadius)) {
                            // Overlap!
                            const id = entity.id || `${type}-${entity.x}-${entity.y}`;

                            setMeasurements(prev => {
                                // Don't add if already exists and not expired
                                if (prev.find(m => m.id === id && m.expiresAt > now)) return prev;

                                // Calculate size in bananas (1 Banana = 20 world units approx?)
                                // Let's say standard node (30px) is 1.5 bananas. So 1 banana = 20px.
                                let sizeInBananas;
                                if (gameState.bananaScientificAccuracy) {
                                    // Scientific: 5 decimal places + random noise
                                    sizeInBananas = (radius * 2 / 20 * (0.99 + Math.random() * 0.02)).toFixed(5);
                                } else {
                                    // Simple: 1 decimal place
                                    sizeInBananas = (radius * 2 / 20).toFixed(1);
                                }

                                return [
                                    ...prev,
                                    {
                                        id,
                                        text: `${type}: ${sizeInBananas} BANANAS`,
                                        x: screenPos.x,
                                        y: screenPos.y,
                                        expiresAt: now + 5000
                                    }
                                ];
                            });
                        }
                    };

                    // Check all entities
                    if (gameState.nodes) gameState.nodes.forEach(n => checkCollision(n, n.name || 'NODE', 30));
                    if (gameState.enemies) gameState.enemies.forEach(e => checkCollision(e, 'ENEMY', e.radius));
                    if (gameState.obstacles) gameState.obstacles.forEach(o => checkCollision(o, 'OBSTACLE', o.radius));
                    if (gameState.genericNPCs) gameState.genericNPCs.forEach(n => checkCollision(n, 'NPC', 20));
                    if (gameState.fakeNodes) gameState.fakeNodes.forEach(n => checkCollision(n, 'FAKE NODE', 25));
                }

                return { x: newX, y: newY };
            });

            // Gentle rotation wobble
            setRotation(prev => -15 + Math.sin(Date.now() / 1000) * 10);

            // Cleanup expired measurements
            setMeasurements(prev => {
                const now = Date.now();
                if (prev.some(m => m.expiresAt < now)) {
                    return prev.filter(m => m.expiresAt > now);
                }
                return prev;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [velocity, gameState.nodes, gameState.enemies, gameState.obstacles, gameState.genericNPCs, gameState.fakeNodes, gameState.worldOffset, gameState.zoom, gameState.bananaScientificAccuracy]);

    const handleClick = (e) => {
        e.stopPropagation(); // Don't trigger canvas click

        // First pickup dialogue
        if (!gameState.bananaPickedUp) {
            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: "That's a banana. For scale. Real science. Don't eat it. It's load-bearing."
            });
            dispatch({ type: 'BANANA_PICKED_UP' });
        }

        // Gary dialogue on dismiss
        eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
            message: "You dismissed the banana. For scale. It'll be back. They always come back. Between 3 and 20 minutes. Real science."
        });

        // Hide banana
        dispatch({ type: 'HIDE_BANANA' });

        // Return after 3-20 minutes
        const returnTime = (3 + Math.random() * 17) * 60 * 1000;
        setTimeout(() => {
            dispatch({ type: 'SHOW_BANANA' });
            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: "The banana has returned. For scale. Told you."
            });
        }, returnTime);
    };

    return (
        <>
            {/* The Banana */}
            <div
                onClick={handleClick}
                style={{
                    position: 'fixed',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    width: '120px',
                    height: '40px',
                    cursor: 'pointer',
                    zIndex: 1000,
                    transform: `rotate(${rotation}deg)`,
                    transition: 'transform 0.2s',
                    userSelect: 'none',
                    filter: 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.3))',
                    pointerEvents: 'all'
                }}
                title="Banana for Scale - Click to dismiss"
            >
                {/* Photorealistic Banana Image */}
                <img
                    src="/assets/banana_real.png"
                    alt="Banana for Scale"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.3))'
                    }}
                />
            </div>

            {/* Measurement Labels */}
            {measurements.map(m => (
                <div
                    key={m.id}
                    style={{
                        position: 'fixed',
                        left: `${m.x}px`,
                        top: `${m.y - 20}px`, // Slightly above
                        transform: 'translate(-50%, -100%)',
                        color: '#FFD700',
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        textShadow: '0 0 2px #000',
                        pointerEvents: 'none',
                        zIndex: 1001,
                        whiteSpace: 'nowrap'
                    }}
                >
                    {m.text}
                </div>
            ))}
        </>
    );
};

export default BananaForScale;
