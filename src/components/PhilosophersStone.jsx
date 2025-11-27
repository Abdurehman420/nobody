import React, { useState, useEffect } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';
import SquishyButton from './SquishyButton';
import WobbleText from './WobbleText';

const PhilosophersStone = ({ gameState }) => {
    const [quote, setQuote] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 100, y: 400 });

    const GIBBERISH_QUOTES = [
        "Toaster dreams of bathtub.",
        "The color blue tastes like Tuesday.",
        "Silence is just loud nothing.",
        "If you close your eyes, the void blinks back.",
        "Bananas are just yellow boomerangs that don't come back.",
        "Gravity is a suggestion, not a law.",
        "Your cursor is haunting me.",
        "I am a rock. I am an island. I am confused.",
        "The pixels... they itch.",
        "Have you tried turning the universe off and on again?",
        "42 is the wrong answer. The question was wrong.",
        "Spoons are just bowls on sticks.",
        "Time is a flat circle. Like a pizza.",
        "I saw a cat once. It judged me."
    ];

    useEffect(() => {
        // Randomly appear
        const appearInterval = setInterval(() => {
            if (Math.random() < 0.05 && !isVisible) { // 5% chance every 10s
                setIsVisible(true);
                // Random position near bottom
                // Random position on the RIGHT side, avoiding bottom (Gary's area)
                setPosition({
                    x: window.innerWidth - 150, // Fixed on right
                    y: 100 + Math.random() * (window.innerHeight - 400) // Vertical range avoiding top/bottom
                });
                setQuote(GIBBERISH_QUOTES[Math.floor(Math.random() * GIBBERISH_QUOTES.length)]);
            }
        }, 10000);

        return () => clearInterval(appearInterval);
    }, [isVisible]);

    const [clickCount, setClickCount] = useState(0);

    const handleClick = () => {
        // New quote
        const newQuote = GIBBERISH_QUOTES[Math.floor(Math.random() * GIBBERISH_QUOTES.length)];
        setQuote(newQuote);

        // Gary reaction
        eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
            message: "Write that down. That's deep. Or stupid. Probably stupid."
        });

        // Audio: Whisper Network
        import('../systems/AudioSynthesizer').then(({ audioSynthesizer }) => {
            audioSynthesizer.playWhisperNetwork();
        });

        // Increment click count
        const newCount = clickCount + 1;
        setClickCount(newCount);

        // Disappear after 2 clicks
        if (newCount >= 2) {
            setIsVisible(false);
            setClickCount(0); // Reset for next appearance
        }
    };

    if (!isVisible) return null;

    return (
        <div
            onClick={handleClick}
            style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: '100px',
                height: '80px',
                cursor: 'pointer',
                zIndex: 50,
                userSelect: 'none',
                filter: 'drop-shadow(5px 5px 10px rgba(0,0,0,0.5))',
                transition: 'transform 0.2s',
            }}
            title="Philosopher's Stone"
        >
            {/* The Rock */}
            <img
                src="/assets/philosophers_stone.png"
                alt="Philosopher's Stone"
                style={{
                    width: '240px',
                    height: '240px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 10px rgba(255, 0, 0, 0.5))'
                }}
            />

            {/* Speech Bubble */}
            <div style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'white',
                color: 'black',
                padding: '10px',
                borderRadius: '10px',
                width: '150px',
                textAlign: 'center',
                fontSize: '12px',
                fontFamily: 'Comic Sans MS, cursive, sans-serif',
                border: '2px solid black',
                marginBottom: '10px',
                pointerEvents: 'none'
            }}>
                <WobbleText intensity={0.5} speed={0.002}>
                    "{quote}"
                </WobbleText>
                {/* Tail */}
                <div style={{
                    position: 'absolute',
                    bottom: '-10px',
                    left: '50%',
                    marginLeft: '-10px',
                    width: '0',
                    height: '0',
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderTop: '10px solid black'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: '50%',
                    marginLeft: '-8px',
                    width: '0',
                    height: '0',
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: '8px solid white'
                }} />
            </div>
        </div>
    );
};

export default PhilosophersStone;
