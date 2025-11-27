import React, { useState } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';

/**
 * NEON MYCELIUM - Suggestion Box
 * MODULE F Feature #12
 * 
 * A slot that glows invitingly. Click to spend 100 Flux and incinerate it.
 * Plays a satisfying "Ding!" sound. Gary approves.
 */

const SuggestionBox = ({ gameState, dispatch }) => {
    const [lastFeedback, setLastFeedback] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = () => {
        // Check if player has 100 flux
        if (gameState.resources.flux < 100) {
            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: "You need 100 Flux to submit a suggestion. Not that it matters. They all get incinerated anyway."
            });
            return;
        }

        // Deduct 100 flux
        dispatch({
            type: 'ADD_RESOURCES',
            stardust: 0,
            flux: -100,
            lucidity: 0
        });

        // Play sound effect
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        // ROOT CAUSE FIX: Scale volume by masterVolume
        const masterVolume = gameState.masterVolume !== undefined ? gameState.masterVolume : 0.5;
        const vol = 0.3 * masterVolume;

        gainNode.gain.setValueAtTime(vol, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);

        // Trigger animation
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);

        // Random feedback
        const feedbacks = [
            "Thank you for your input.",
            "Your suggestion has been noted.",
            "We value your feedback.",
            "This has been forwarded to management.",
            "Your concern is important to us."
        ];
        const feedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];
        setLastFeedback(feedback);

        // Gary's comment
        eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
            message: "The box creates heat. That's its only function. Your 100 Flux? Gone. Your suggestion? Also gone."
        });
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '200px',
            left: '20px',
            width: '100px',
            zIndex: 100,
            fontFamily: 'monospace'
        }}>
            {/* Suggestion Box */}
            <div
                onClick={handleClick}
                style={{
                    width: '100px',
                    height: '100px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: isAnimating ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.3s',
                    position: 'relative'
                }}
                title="Suggestion Box - Click to spend 100 Flux"
            >
                <img
                    src="/assets/suggestion_box.png"
                    alt="Suggestion Box"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: isAnimating
                            ? 'drop-shadow(0 0 15px rgba(255, 165, 0, 0.8))'
                            : 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5))'
                    }}
                />

                {/* Fire animation when clicked */}
                {isAnimating && (
                    <div style={{
                        position: 'absolute',
                        top: '30%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '24px',
                        pointerEvents: 'none'
                    }}>
                        🔥
                    </div>
                )}
            </div>

            {/* Cost display */}
            <div style={{
                marginTop: '8px',
                fontSize: '9px',
                color: '#0FF',
                textAlign: 'center'
            }}>
                Cost: 100 Flux
            </div>

            {/* Last feedback */}
            {lastFeedback && (
                <div style={{
                    marginTop: '8px',
                    fontSize: '8px',
                    color: '#888',
                    textAlign: 'center',
                    fontStyle: 'italic'
                }}>
                    "{lastFeedback}"
                </div>
            )}
        </div>
    );
};

export default SuggestionBox;
