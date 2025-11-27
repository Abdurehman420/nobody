import React, { useState, useEffect } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';

const CensoredPipe = ({ gameState }) => {
    const [targetEdge, setTargetEdge] = useState(null);

    useEffect(() => {
        // Randomly appear
        const appearInterval = setInterval(() => {
            if (Math.random() < 0.05 && !targetEdge && gameState.edges.length > 0) { // 5% chance every 15s
                // Pick a random edge
                const randomEdge = gameState.edges[Math.floor(Math.random() * gameState.edges.length)];
                setTargetEdge(randomEdge);

                eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                    message: "That pipe segment was too explicit. We had to blur it."
                });

                // Disappear after 10s
                setTimeout(() => setTargetEdge(null), 10000);
            }
        }, 15000);

        return () => clearInterval(appearInterval);
    }, [targetEdge, gameState.edges]);

    if (!targetEdge) return null;

    // Find node positions
    const source = gameState.nodes.find(n => n.id === targetEdge.source);
    const target = gameState.nodes.find(n => n.id === targetEdge.target);

    if (!source || !target) return null;

    // Calculate World Midpoint
    const midX = (source.x + target.x) / 2;
    const midY = (source.y + target.y) / 2;

    // Convert to Screen Space
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const screenX = (midX - gameState.worldOffset.x) * gameState.zoom + centerX;
    const screenY = (midY - gameState.worldOffset.y) * gameState.zoom + centerY;

    // Calculate Angle
    const angle = Math.atan2(target.y - source.y, target.x - source.x) * (180 / Math.PI);

    return (
        <div
            style={{
                position: 'fixed',
                left: screenX,
                top: screenY,
                width: '100px',
                height: '30px',
                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                background: 'repeating-linear-gradient(45deg, #000, #000 5px, #333 5px, #333 10px)',
                zIndex: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontSize: '10px',
                fontWeight: 'bold',
                border: '2px solid #FFF',
                filter: 'blur(1px)',
                pointerEvents: 'none' // Don't block clicks
            }}
        >
            [CENSORED]
        </div>
    );
};

export default CensoredPipe;
