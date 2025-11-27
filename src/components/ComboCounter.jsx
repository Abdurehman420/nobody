import React, { useState, useEffect } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';
import '../styles/app-juice.css';

/**
 * Combo Counter - Build Streak Tracker
 * 
 * Displays and animates build combos with punch effect.
 */
export default function ComboCounter({ gameState }) {
    const [comboMultiplier, setComboMultiplier] = useState(1);
    const [punchScale, setPunchScale] = useState(1.0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleComboIncrement = (data) => {
            setComboMultiplier(data.combo || 1);
            setIsVisible(true);
            animatePunch();

            // Hide after 3 seconds of no new combos
            setTimeout(() => {
                if (data.combo === comboMultiplier) {
                    setIsVisible(false);
                }
            }, 3000);
        };

        const handleComboReset = () => {
            setComboMultiplier(1);
            setIsVisible(false);
        };

        eventBus.on(EVENT_TYPES.COMBO_INCREMENT, handleComboIncrement);
        eventBus.on(EVENT_TYPES.COMBO_RESET, handleComboReset);

        return () => {
            eventBus.off(EVENT_TYPES.COMBO_INCREMENT, handleComboIncrement);
            eventBus.off(EVENT_TYPES.COMBO_RESET, handleComboReset);
        };
    }, [comboMultiplier]);

    const animatePunch = () => {
        setPunchScale(1.5);
        setTimeout(() => setPunchScale(1.2), 50);
        setTimeout(() => setPunchScale(1.0), 150);
    };

    if (!isVisible || comboMultiplier <= 1) return null;

    return (
        <div className="hud-combo">
            <div
                className="hud-combo__counter"
                style={{
                    transform: `scale(${punchScale})`,
                    transition: 'transform 0.1s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                }}
            >
                <div className="hud-combo__text">FLOW STREAK</div>
                <div className="hud-combo__number">x{comboMultiplier}!</div>
            </div>
        </div>
    );
}
