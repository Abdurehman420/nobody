import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';

const CREDITS = [
    "EXECUTIVE PRODUCER: Gary",
    "LEAD DEVELOPER: The Void",
    "ART DIRECTOR: Glitch in the Matrix",
    "QA TESTER: You (Unpaid)",
    "COFFEE LOGISTICS: 404 Not Found",
    "PHYSICS ENGINE: Maybe",
    "SOUND DESIGN: Screaming into a pillow",
    "SPECIAL THANKS: The number 4",
    "NO THANKS: Entropy",
    "MADE WITH: Spite and React",
    "COPYRIGHT: 20XX Galactic Federation",
    "TOASTER: Brave Little",
    "HOTEL: Trivago",
    "EXISTENTIAL DREAD: Provided by Universe",
    "LOADING: ...",
    "BUFFERING: ...",
    "ARE YOU STILL READING?",
    "GO CLICK SOMETHING",
    "SERIOUSLY",
    "FINE, HERE'S A SECRET CODE: 80085",
    "END OF LINE"
];

const CreditsHallucination = () => {
    const { state } = useGame();
    const [offset, setOffset] = useState(window.innerHeight);

    if (!state.creditsActive) return null;

    useEffect(() => {
        const interval = setInterval(() => {
            setOffset(prev => {
                if (prev < -1000) return window.innerHeight; // Loop
                return prev - 1;
            });
        }, 20);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none', // Game playable underneath
            zIndex: 9000,
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
        }}>
            <div style={{
                transform: `translateY(${offset}px)`,
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.5)',
                fontFamily: 'monospace',
                fontSize: '24px',
                textShadow: '0 0 5px black',
                display: 'flex',
                flexDirection: 'column',
                gap: '50px'
            }}>
                <h1 style={{ color: 'rgba(0, 255, 255, 0.8)' }}>CREDITS</h1>
                {CREDITS.map((line, i) => (
                    <div key={i}>{line}</div>
                ))}
            </div>
        </div>
    );
};

export default CreditsHallucination;
