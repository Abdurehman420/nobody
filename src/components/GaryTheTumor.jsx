import React, { useState, useEffect, useRef } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';
import { dialogueGenerator } from '../utils/DialogueGenerator';
import WobbleText from './WobbleText';
import '../styles/app-juice.css';

/**
 * Gary the Tumor - Snarky Companion Narrator
 * 
 * Displays contextual commentary using Markov chain dialogue generation.
 */
export default function GaryTheTumor({ gameState }) {
    const [dialogue, setDialogue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [displayText, setDisplayText] = useState('');
    const [squishScale, setSquishScale] = useState(1.0);
    const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
    const [isBlinking, setIsBlinking] = useState(false);
    const garyRef = useRef(null);
    const blinkIntervalRef = useRef(null);

    // Blink animation - periodic random blinks
    useEffect(() => {
        const startBlinking = () => {
            // Random blink interval between 2-5 seconds
            const nextBlinkDelay = 2000 + Math.random() * 3000;

            blinkIntervalRef.current = setTimeout(() => {
                setIsBlinking(true);
                // Blink duration: 150ms
                setTimeout(() => {
                    setIsBlinking(false);
                    startBlinking(); // Schedule next blink
                }, 150);
            }, nextBlinkDelay);
        };

        startBlinking();

        return () => {
            if (blinkIntervalRef.current) {
                clearTimeout(blinkIntervalRef.current);
            }
        };
    }, []);

    // Eye tracking - follow cursor
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!garyRef.current) return;

            const rect = garyRef.current.getBoundingClientRect();
            const garyX = rect.left + rect.width / 2;
            const garyY = rect.top + rect.height / 2;

            const dx = e.clientX - garyX;
            const dy = e.clientY - garyY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Limit eye movement range
            const maxDistance = 8;
            const cappedDistance = Math.min(distance, 100);
            const ratio = cappedDistance / 100;

            const eyeX = (dx / distance) * maxDistance * ratio;
            const eyeY = (dy / distance) * maxDistance * ratio;

            setEyePosition({ x: eyeX, y: eyeY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        // Listen to all relevant events
        const eventHandlers = [
            { event: EVENT_TYPES.NODE_CONNECTED, handler: () => generateDialogue(EVENT_TYPES.NODE_CONNECTED) },
            { event: EVENT_TYPES.NODE_BUILT, handler: () => generateDialogue(EVENT_TYPES.NODE_BUILT) },
            { event: EVENT_TYPES.UPGRADE_UNLOCK, handler: () => generateDialogue(EVENT_TYPES.UPGRADE_UNLOCK) },
            { event: EVENT_TYPES.ENEMY_SPAWN, handler: () => generateDialogue(EVENT_TYPES.ENEMY_SPAWN) },
            { event: EVENT_TYPES.FEVER_MODE_START, handler: () => generateDialogue(EVENT_TYPES.FEVER_MODE_START) },
            { event: EVENT_TYPES.CIVILIZATION_CONTACT, handler: () => generateDialogue(EVENT_TYPES.CIVILIZATION_CONTACT) },
            { event: EVENT_TYPES.PLAYER_IDLE, handler: () => generateDialogue(EVENT_TYPES.PLAYER_IDLE) },
        ];

        eventHandlers.forEach(({ event, handler }) => {
            eventBus.on(event, handler);
        });

        // Specific handler for BOT_GRUMBLE, which provides its own message
        const botGrumbleHandler = (data) => {
            if (data.message) {
                displayMessage(data.message);
            }
        };
        eventBus.on(EVENT_TYPES.BOT_GRUMBLE, botGrumbleHandler);

        // Initial greeting
        setTimeout(() => {
            generateDialogue('INIT');
        }, 1000);

        return () => {
            eventHandlers.forEach(({ event, handler }) => {
                eventBus.off(event, handler);
            });
        };
    }, []);

    const displayMessage = (message) => {
        setDialogue(message);
        setDisplayText('');
        setIsTyping(true);

        // Reactive squish when dialogue changes
        setSquishScale(1.2); // Expand
        setTimeout(() => setSquishScale(0.9), 100); // Contract
        setTimeout(() => setSquishScale(1.05), 200); // Bounce back
        setTimeout(() => setSquishScale(1.0), 300); // Settle
    };

    const generateDialogue = (trigger) => {
        const context = {
            resources: gameState?.resources || {},
            nodeCount: gameState?.nodes?.length || 0,
            comboMultiplier: gameState?.comboMultiplier || 1,
        };

        const newDialogue = dialogueGenerator.generate(trigger, context);
        setDialogue(newDialogue);
        setDisplayText('');
        setIsTyping(true);

        // Reactive squish when dialogue changes
        setSquishScale(1.2); // Expand
        setTimeout(() => setSquishScale(0.9), 100); // Contract
        setTimeout(() => setSquishScale(1.05), 200); // Bounce back
        setTimeout(() => setSquishScale(1.0), 300); // Settle
    };

    // Typing effect
    useEffect(() => {
        if (!isTyping || dialogue === '') return;

        let currentIndex = 0;
        const typingSpeed = 20; // ms per character (Faster)

        const interval = setInterval(() => {
            if (currentIndex < dialogue.length) {
                setDisplayText(dialogue.slice(0, currentIndex + 1));
                currentIndex++;

                // Squish animation while typing
                if (currentIndex % 3 === 0) {
                    animateSquish();
                }
            } else {
                setIsTyping(false);
                clearInterval(interval);
            }
        }, typingSpeed);

        return () => clearInterval(interval);
    }, [dialogue, isTyping]);

    const animateSquish = () => {
        // Squish/stretch animation
        setSquishScale(1.15);
        setTimeout(() => setSquishScale(0.95), 50);
        setTimeout(() => setSquishScale(1.05), 100);
        setTimeout(() => setSquishScale(1.0), 150);
    };

    if (displayText === '') return null;

    return (
        <aside
            ref={garyRef}
            className="narrator"
            style={{
                transform: `scale(${squishScale})`,
                zIndex: 99999 // Ensure Gary is always on top
            }}
        >
            <div className="narrator__container">
                {/* Gary's face with tracking eyes */}
                <div className="narrator__face" style={{ position: 'relative', width: '120px', height: '120px' }}>
                    {/* Custom Gary Sprite */}
                    <img
                        src="/assets/gary_sprite.png"
                        alt="Gary"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 0 10px rgba(148, 0, 211, 0.5))'
                        }}
                    />

                    {/* Tracking eyes overlay - Adjusted for the new sprite */}
                    <div style={{
                        position: 'absolute',
                        top: '40%', // Moved up slightly to match the sprite's likely eye position
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        gap: '25px', // Wider gap for the larger sprite
                        marginTop: '10px'
                    }}>
                        {/* Left eye */}
                        <div style={{
                            width: '10px',
                            height: isBlinking ? '2px' : '10px',
                            borderRadius: '50%',
                            background: '#FF0000',
                            boxShadow: isBlinking ? 'none' : '0 0 5px #FF0000',
                            transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
                            transition: 'transform 0.1s ease-out, height 0.05s ease-out, box-shadow 0.05s ease-out',
                            opacity: isBlinking ? 0.3 : 0.8
                        }} />
                        {/* Right eye */}
                        <div style={{
                            width: '10px',
                            height: isBlinking ? '2px' : '10px',
                            borderRadius: '50%',
                            background: '#FF0000',
                            boxShadow: isBlinking ? 'none' : '0 0 5px #FF0000',
                            transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
                            transition: 'transform 0.1s ease-out, height 0.05s ease-out, box-shadow 0.05s ease-out',
                            opacity: isBlinking ? 0.3 : 0.8
                        }} />
                    </div>
                </div>
            </div>
            <div className="narrator__bubble">
                <p className="narrator__text">
                    <WobbleText intensity={0.2} speed={0.001}>
                        {displayText}
                    </WobbleText>
                </p>
                <div className="narrator__tail"></div>
            </div>
        </aside>
    );
}
