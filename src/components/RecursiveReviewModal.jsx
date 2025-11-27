import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import SquishyButton from './SquishyButton';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';

const RecursiveReviewModal = () => {
    const { state, dispatch } = useGame();
    const [step, setStep] = useState(0);
    const [position, setPosition] = useState({ x: window.innerWidth / 2 - 150, y: window.innerHeight / 2 - 100 });

    if (!state.recursiveReviewActive) return null;

    const handleYes = () => {
        setStep(prev => prev + 1);
        // Move randomly to be annoying
        setPosition({
            x: Math.random() * (window.innerWidth - 300),
            y: Math.random() * (window.innerHeight - 200)
        });

        if (step > 2 && Math.random() < 0.3) {
            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: "Your feedback is very important to us. Please continue confirming."
            });
        }
    };

    const handleNo = () => {
        dispatch({ type: 'END_RECURSIVE_REVIEW' });
        eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
            message: "Feedback received: You hate fun. Noted."
        });
    };

    const getQuestion = () => {
        switch (step) {
            case 0: return "Are you enjoying Neon Mycelium?";
            case 1: return "Are you sure?";
            case 2: return "Really sure?";
            case 3: return "Like, 100% positive?";
            case 4: return "Would you bet your soul on it?";
            case 5: return "Is this a cry for help?";
            default: return `Confirmation level ${step}?`;
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: position.y,
            left: position.x,
            width: '300px',
            background: '#000',
            border: '2px solid #00FF00',
            padding: '20px',
            zIndex: 10000,
            fontFamily: 'monospace',
            color: '#00FF00',
            boxShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
        }}>
            <div style={{ textAlign: 'center', fontSize: '18px' }}>FEEDBACK LOOP</div>
            <div style={{ textAlign: 'center' }}>{getQuestion()}</div>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <SquishyButton onClick={handleYes} preset="BOUNCY" style={{ background: '#003300', color: '#00FF00', border: '1px solid #00FF00' }}>
                    YES
                </SquishyButton>
                <SquishyButton onClick={handleNo} preset="STIFF" style={{ background: '#330000', color: '#FF0000', border: '1px solid #FF0000' }}>
                    NO
                </SquishyButton>
            </div>
            <div style={{ fontSize: '10px', color: '#444', textAlign: 'center' }}>
                Step: {step + 1} / ∞
            </div>
        </div>
    );
};

export default RecursiveReviewModal;
