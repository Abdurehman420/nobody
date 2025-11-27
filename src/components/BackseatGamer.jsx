import React, { useState, useEffect } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';
import { audioManager } from '../engine/audio';

const BackseatGamer = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: -50, y: -50 });
    const [pingPos, setPingPos] = useState(null);

    useEffect(() => {
        // Randomly appear
        const appearInterval = setInterval(() => {
            if (Math.random() < 0.05 && !isVisible) { // 5% chance every 20s
                setIsVisible(true);
                startBackseating();
            }
        }, 20000);

        return () => clearInterval(appearInterval);
    }, [isVisible]);

    const startBackseating = () => {
        // Move cursor around for a bit
        let moves = 0;
        const moveInterval = setInterval(() => {
            setCursorPos({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight
            });
            moves++;

            // Random ping
            if (Math.random() < 0.3) {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;
                setPingPos({ x, y });
                audioManager.playSound('ui_click'); // Placeholder for ping sound

                setTimeout(() => setPingPos(null), 1000);
            }

            if (moves > 10) {
                clearInterval(moveInterval);
                setIsVisible(false);
                setCursorPos({ x: -50, y: -50 });

                eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                    message: "You missed a spot. My cousin from Beta says your APM is low."
                });
            }
        }, 500);
    };

    if (!isVisible) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>
            {/* Ghost Cursor */}
            <div
                style={{
                    position: 'absolute',
                    left: cursorPos.x,
                    top: cursorPos.y,
                    width: '20px',
                    height: '20px',
                    transition: 'all 0.5s ease',
                    opacity: 0.7
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00FF00" strokeWidth="2">
                    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                </svg>
                <div style={{ color: '#00FF00', fontSize: '10px', marginLeft: '15px' }}>xX_Gary_Xx</div>
            </div>

            {/* Ping */}
            {pingPos && (
                <div
                    style={{
                        position: 'absolute',
                        left: pingPos.x - 20,
                        top: pingPos.y - 20,
                        width: '40px',
                        height: '40px',
                        border: '2px solid #00FF00',
                        borderRadius: '50%',
                        animation: 'ping 1s infinite'
                    }}
                >
                    <style>
                        {`
                            @keyframes ping {
                                0% { transform: scale(0.5); opacity: 1; }
                                100% { transform: scale(2); opacity: 0; }
                            }
                        `}
                    </style>
                </div>
            )}
        </div>
    );
};

export default BackseatGamer;
