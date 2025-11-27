import React, { useState, useEffect } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';

const ReplyAllDisaster = ({ gameState }) => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        // Randomly trigger
        const triggerInterval = setInterval(() => {
            if (Math.random() < 0.02) { // 2% chance every 20s
                triggerDisaster();
            }
        }, 20000);

        return () => clearInterval(triggerInterval);
    }, []);

    const triggerDisaster = () => {
        eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
            message: "Who hit 'Reply All'? Oh god, here they come."
        });

        const newParticles = [];
        for (let i = 0; i < 50; i++) {
            newParticles.push({
                id: Date.now() + i,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5
            });
        }
        setParticles(newParticles);

        // Clear after 5s
        setTimeout(() => setParticles([]), 5000);
    };

    useEffect(() => {
        if (particles.length > 0) {
            const moveInterval = setInterval(() => {
                setParticles(prev => prev.map(p => ({
                    ...p,
                    x: p.x + p.vx,
                    y: p.y + p.vy
                })));
            }, 50);
            return () => clearInterval(moveInterval);
        }
    }, [particles]);

    if (particles.length === 0) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 500 }}>
            {particles.map(p => (
                <div
                    key={p.id}
                    style={{
                        position: 'absolute',
                        left: p.x,
                        top: p.y,
                        color: '#FF0000',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        fontFamily: 'Arial'
                    }}
                >
                    Re: Re: Fwd:
                </div>
            ))}
        </div>
    );
};

export default ReplyAllDisaster;
