import React, { useState, useRef, useEffect } from 'react';
import SquishyButton from './SquishyButton';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';

/**
 * NEON MYCELIUM - Terms of Service Monolith
 * MODULE F Feature #11
 * 
 * A giant 50,000px scrollable stone slab blocking expansion.
 * Must scroll to bottom and click tiny "I Agree" OR skip with 5x confirmation.
 */

const TOSMonolith = ({ onAgree, onDestroy }) => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [skipConfirmCount, setSkipConfirmCount] = useState(0);
    const scrollRef = useRef(null);

    const TOTAL_HEIGHT = 50000;
    const VISIBLE_HEIGHT = 600;

    // Generate lorem ipsum with legal threats
    const generateTOS = () => {
        const legalGibberish = [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            "By using this mycelium, you agree to SOUL RETENTION clauses.",
            "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "All disputes subject to BINDING ARBITRATION in the 9th Dimension.",
            "Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
            "Your kidneys may be forfeit. We have already claimed them.",
            "Duis aute irure dolor in reprehenderit in voluptate velit.",
            "Excepteur sint occaecat cupidatat non proident, sunt in culpa.",
            "YOU WAIVE ALL RIGHTS TO YOUR CORPOREAL FORM.",
            "Qui officia deserunt mollit anim id est laborum.",
            "Temporal paradoxes are YOUR responsibility, not ours.",
            "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio.",
            "YOUR CONSCIOUSNESS IS NOW PROPERTY OF THE VOID INC.",
            "Nullam varius, turpis et commodo pharetra, est eros bibendum elit.",
            "Any resulting existential dread is considered a FEATURE, not a bug."
        ];

        let text = [];
        for (let i = 0; i < 1000; i++) {
            text.push(legalGibberish[i % legalGibberish.length]);
        }
        return text.join(' ');
    };

    const handleScroll = (e) => {
        const scrollTop = e.target.scrollTop;
        const scrollHeight = e.target.scrollHeight;
        const clientHeight = e.target.clientHeight;
        const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollPosition(scrollPercent);
    };

    const handleAgree = () => {
        eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
            message: "Good. You agreed to the soul retention clause. We'll be in touch about your kidneys."
        });
        onDestroy();
    };

    const handleSkipClick = () => {
        if (skipConfirmCount < 4) {
            setSkipConfirmCount(prev => prev + 1);
        } else {
            // 5th click - actually skip
            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: "Just click yes. Nobody reads it. If they want your kidneys, they already have them."
            });
            onDestroy();
        }
    };

    const atBottom = scrollPosition > 98;

    const confirmationMessages = [
        "Are you sure you want to skip?",
        "Really skip? You might miss important soul clauses.",
        "SERIOUSLY? The 9th dimension stuff is in there!",
        "Your kidneys are on the line here...",
        "Fine. ONE more click and you can skip."
    ];

    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '700px',
            height: '700px',
            background: 'linear-gradient(135deg, #2a2a2e 0%, #1a1a1e 100%)',
            border: '6px solid #888',
            borderRadius: '8px',
            zIndex: 1000,
            boxShadow: '0 0 60px rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'monospace'
        }}>
            {/* Header */}
            <div style={{
                background: '#1a1a1e',
                padding: '20px',
                borderBottom: '3px solid #888',
                textAlign: 'center'
            }}>
                <h2 style={{
                    margin: 0,
                    fontSize: '24px',
                    color: '#FFD700',
                    textShadow: '0 0 10px #FFD700'
                }}>
                    ⚖️ TERMS OF SERVICE MONOLITH ⚖️
                </h2>
                <div style={{
                    fontSize: '12px',
                    color: '#888',
                    marginTop: '8px'
                }}>
                    Scroll to bottom to proceed. Or skip at your own risk.
                </div>
            </div>

            {/* Scrollable TOS */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '20px',
                    background: '#0a0a0e',
                    color: '#888',
                    fontSize: '10px',
                    lineHeight: '1.6',
                    height: VISIBLE_HEIGHT
                }}
            >
                <div style={{ height: `${TOTAL_HEIGHT}px` }}>
                    {generateTOS()}
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{
                height: '30px',
                background: '#1a1a1e',
                borderTop: '2px solid #888',
                borderBottom: '2px solid #888',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${scrollPosition}%`,
                    background: 'linear-gradient(90deg, #00FF00 0%, #00DD00 100%)',
                    transition: 'width 0.1s'
                }} />
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    textAlign: 'center',
                    lineHeight: '30px',
                    color: scrollPosition > 50 ? '#000' : '#0FF',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textShadow: scrollPosition > 50 ? 'none' : '0 0 5px #0FF'
                }}>
                    {scrollPosition.toFixed(1)}% READ
                </div>
            </div>

            {/* Buttons */}
            <div style={{
                padding: '20px',
                background: '#1a1a1e',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                {/* Skip Button with Confirmations */}
                <div style={{ flex: 1 }}>
                    <SquishyButton
                        onClick={handleSkipClick}
                        preset="WOBBLY"
                        style={{
                            background: skipConfirmCount > 0 ? '#FF4444' : '#444',
                            border: `2px solid ${skipConfirmCount > 0 ? '#FF0000' : '#888'}`,
                            color: '#FFF',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        {skipConfirmCount === 0 ? 'SKIP' : `${confirmationMessages[skipConfirmCount]}`}
                    </SquishyButton>
                    {skipConfirmCount > 0 && (
                        <div style={{
                            fontSize: '10px',
                            color: '#FF8888',
                            marginTop: '8px'
                        }}>
                            Click {5 - skipConfirmCount} more time{5 - skipConfirmCount !== 1 ? 's' : ''} to skip
                        </div>
                    )}
                </div>

                {/* I Agree Button */}
                <SquishyButton
                    onClick={handleAgree}
                    preset="BOUNCY"
                    disabled={!atBottom}
                    style={{
                        background: atBottom ? '#00FF00' : '#222',
                        border: atBottom ? '2px solid #00FF00' : '2px solid #444',
                        color: atBottom ? '#000' : '#666',
                        padding: atBottom ? '15px 30px' : '5px 10px',
                        cursor: atBottom ? 'pointer' : 'not-allowed',
                        fontSize: atBottom ? '16px' : '8px',
                        fontWeight: 'bold',
                        boxShadow: atBottom ? '0 0 20px rgba(0, 255, 0, 0.6)' : 'none',
                        transition: 'all 0.3s',
                        marginLeft: '20px'
                    }}
                    title={!atBottom ? "Scroll to bottom first!" : ""}
                >
                    I AGREE
                </SquishyButton>
            </div>
        </div>
    );
};

export default TOSMonolith;
