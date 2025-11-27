import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import SquishyButton from './SquishyButton';
import { useCRTWindow } from '../hooks/useCRTWindow';

const BureaucratInterface = () => {
    const { state, dispatch } = useGame();
    const [isOpen, setIsOpen] = useState(false);
    const { containerStyle, flashStyle, isVisible } = useCRTWindow(isOpen, { preset: 'WOBBLY' });

    // Random Bureaucrat quotes
    let quotes = [
        "FORM 27-B/6 IS INCOMPLETE.",
        "THE VOID REQUIRES A RECEIPT.",
        "YOUR EXISTENCE IS PENDING APPROVAL.",
        "WE ARE JUDGING YOUR FLUID DYNAMICS.",
    ];

    if (state.unlockedUpgrades.includes('fourth_wall_break')) {
        quotes = [
            "HEY YOU, SITTING AT THE COMPUTER. NICE POSTURE.",
            "WHY ARE YOU CLICKING SO MUCH? GET A LIFE.",
            "I KNOW YOU'RE JUST A SIMULATION TOO.",
            "YOUR BROWSER HISTORY IS CONCERNING.",
            "DO YOU REALLY THINK THIS GAME HAS AN ENDING?",
        ];
    }
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    if (!isOpen) {
        return (
            <SquishyButton
                onClick={() => setIsOpen(true)}
                preset="WOBBLY"
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    background: 'var(--color-space-purple)',
                    border: '1px solid var(--color-lucidity)',
                    color: 'var(--color-lucidity)',
                    padding: '10px',
                    fontFamily: 'var(--font-main)',
                    cursor: 'pointer',
                    zIndex: 10,
                    boxShadow: '0 0 10px var(--color-lucidity)',
                }}
            >
                SUMMON BUREAUCRAT
            </SquishyButton>
        );
    }

    return (
        <div style={{
            ...containerStyle,
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginLeft: '-200px',
            marginTop: '-150px',
            background: 'rgba(10, 0, 20, 0.9)',
            border: '2px solid var(--color-lucidity)',
            padding: '20px',
            zIndex: 20,
            width: '400px',
            color: 'var(--color-lucidity)',
            fontFamily: 'var(--font-main)',
            boxShadow: '0 0 20px var(--color-lucidity), inset 0 0 20px rgba(148, 0, 211, 0.2)',
        }}>
            {/* CRT Flash Overlay */}
            <div style={flashStyle} />

            <h2 style={{ marginTop: 0, textShadow: '0 0 5px var(--color-lucidity)' }}>GALACTIC BUREAUCRACY</h2>
            <div style={{
                marginBottom: '20px',
                fontStyle: 'italic',
                borderLeft: '2px solid var(--color-lucidity)',
                paddingLeft: '10px'
            }}>
                "{quote}"
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>OFFER: 100 FLUX</span>
                <span>RECEIVE: 1 LUCIDITY</span>
            </div>

            <SquishyButton
                onClick={() => {
                    dispatch({ type: 'TRADE_FLUX' });
                    setIsOpen(false);
                }}
                preset="BOUNCY"
                style={{
                    background: 'var(--color-lucidity)',
                    color: 'black',
                    border: 'none',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginRight: '10px'
                }}
            >
                ACCEPT TERMS
            </SquishyButton>

            <SquishyButton
                onClick={() => setIsOpen(false)}
                preset="GENTLE"
                style={{
                    background: 'transparent',
                    color: 'var(--color-lucidity)',
                    border: '1px solid var(--color-lucidity)',
                    padding: '10px 20px',
                    cursor: 'pointer',
                }}
            >
                IGNORE
            </SquishyButton>
        </div>
    );
};

export default BureaucratInterface;
