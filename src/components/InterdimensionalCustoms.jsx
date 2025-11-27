import React, { useState, useEffect } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';
import SquishyButton from './SquishyButton';

const InterdimensionalCustoms = ({ gameState, dispatch }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Randomly appear
        const appearInterval = setInterval(() => {
            if (Math.random() < 0.01 && !isVisible) { // 1% chance every 30s
                setIsVisible(true);
                setStep(0);
                eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                    message: "Random security check. Please have your papers ready."
                });
            }
        }, 30000);

        return () => clearInterval(appearInterval);
    }, [isVisible]);

    const handleAnswer = (correct) => {
        if (correct) {
            if (step < 2) {
                setStep(prev => prev + 1);
            } else {
                setIsVisible(false);
                eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                    message: "You may proceed. For now."
                });
            }
        } else {
            // Punishment: Incinerate some resources
            dispatch({ type: 'SPEND_RESOURCE', payload: { resource: 'flux', amount: gameState.resources.flux * 0.1 } });
            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: "Incorrect. 10% Flux tax applied. Next time, study the manual."
            });
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.95)',
                zIndex: 2000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00FF00',
                fontFamily: 'monospace'
            }}
        >
            <h2 style={{ borderBottom: '2px solid #00FF00', paddingBottom: '10px' }}>
                INTERDIMENSIONAL CUSTOMS
            </h2>

            <div style={{ margin: '20px', textAlign: 'center', maxWidth: '500px' }}>
                {step === 0 && (
                    <>
                        <p>QUESTION 1: Are you a robot?</p>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                            <SquishyButton onClick={() => handleAnswer(false)} preset="STIFF">YES</SquishyButton>
                            <SquishyButton onClick={() => handleAnswer(true)} preset="BOUNCY">NO</SquishyButton>
                            <SquishyButton onClick={() => handleAnswer(false)} preset="WOBBLE">MAYBE</SquishyButton>
                        </div>
                    </>
                )}

                {step === 1 && (
                    <>
                        <p>QUESTION 2: Which of these is a valid fruit?</p>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                            <SquishyButton onClick={() => handleAnswer(false)} preset="STIFF">HAMMER</SquishyButton>
                            <SquishyButton onClick={() => handleAnswer(true)} preset="BOUNCY">BANANA</SquishyButton>
                            <SquishyButton onClick={() => handleAnswer(false)} preset="WOBBLE">THE VOID</SquishyButton>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <p>QUESTION 3: Do you declare any emotional baggage?</p>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                            <SquishyButton onClick={() => handleAnswer(true)} preset="STIFF">NOTHING TO DECLARE</SquishyButton>
                            <SquishyButton onClick={() => handleAnswer(false)} preset="BOUNCY">YES, LOTS</SquishyButton>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default InterdimensionalCustoms;
