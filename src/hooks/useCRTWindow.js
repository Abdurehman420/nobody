/**
 * NEON MYCELIUM - CRT Window Animation Hook
 * 
 * Replaces display:none with spring-based scale(0) → scale(1) animations.
 * Adds CRT power-on flash effect for "Cosmic Garbage Sci-Fi" feel.
 */

import { useEffect, useState } from 'react';
import { useSpring } from './useSpring';

/**
 * Hook for CRT-style window animations
 * 
 * @param {boolean} isOpen - Whether window should be open
 * @param {Object} config - Spring configuration for animation
 * @returns {Object} - { scale, isVisible, flashOpacity, onTransitionEnd }
 */
export function useCRTWindow(isOpen, config = { preset: 'WOBBLY' }) {
    const [isVisible, setIsVisible] = useState(isOpen);
    const [flashOpacity, setFlashOpacity] = useState(0);

    const targetScale = isOpen ? 1 : 0;
    const scale = useSpring(targetScale, config);

    // Manage visibility (don't unmount immediately on close)
    useEffect(() => {
        if (isOpen) {
            if (!isVisible) setIsVisible(true);
            // Trigger flash effect
            setFlashOpacity(1);
            setTimeout(() => setFlashOpacity(0), 150); // Flash duration
        } else if (!isOpen && scale < 0.01) {
            // Hide after animation completes
            if (isVisible) setIsVisible(false);
        }
    }, [isOpen, scale, isVisible]);

    return {
        scale,
        isVisible,
        flashOpacity,
        // Inline style object for easy application
        containerStyle: {
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            opacity: scale < 0.01 ? 0 : 1,
            pointerEvents: scale < 0.8 ? 'none' : 'auto',
            display: isVisible ? 'block' : 'none'
        },
        flashStyle: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.2)',
            opacity: flashOpacity,
            transition: 'opacity 0.15s ease-out',
            pointerEvents: 'none',
            zIndex: 9999
        }
    };
}

/**
 * Hook for windows with draggable content (inertia lag)
 * Content lags behind frame position with lerp factor 0.2
 * 
 * @param {Object} framePosition - { x, y } position of window frame
 * @returns {Object} - { contentPosition, contentStyle }
 */
export function useDragInertia(framePosition) {
    const [contentPosition, setContentPosition] = useState(framePosition);

    useEffect(() => {
        // Lerp content towards frame position
        const interval = setInterval(() => {
            setContentPosition(prev => ({
                x: prev.x + (framePosition.x - prev.x) * 0.2,
                y: prev.y + (framePosition.y - prev.y) * 0.2
            }));
        }, 16); // ~60fps

        return () => clearInterval(interval);
    }, [framePosition.x, framePosition.y]);

    return {
        contentPosition,
        contentStyle: {
            transform: `translate(${contentPosition.x}px, ${contentPosition.y}px)`,
            transition: 'transform 0.016s linear'
        }
    };
}

export default useCRTWindow;
