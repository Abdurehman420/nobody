/**
 * NEON MYCELIUM - useSpring Hook
 * 
 * React hook for physics-based animations using SpringSolver.
 * Automatically handles RAF updates and cleanup.
 */

import { useState, useEffect, useRef } from 'react';
import SpringSolver from '../utils/SpringSolver';

/**
 * Hook for single-value spring animations
 * 
 * @param {number} targetValue - The target value to animate towards
 * @param {Object} config - Spring configuration (mass, stiffness, damping) or preset name
 * @returns {number} Current animated value
 */
export function useSpring(targetValue, config = { preset: 'WOBBLY' }) {
    const [value, setValue] = useState(targetValue);
    const springRef = useRef(null);
    const rafRef = useRef(null);
    const lastTimeRef = useRef(null);

    // Initialize spring
    useEffect(() => {
        springRef.current = new SpringSolver({
            ...config,
            initialValue: targetValue,
            targetValue: targetValue
        });
        lastTimeRef.current = performance.now();
    }, []);

    // Update target when it changes
    useEffect(() => {
        if (springRef.current) {
            springRef.current.setTarget(targetValue);
        }
    }, [targetValue]);

    // Animation loop
    useEffect(() => {
        const animate = (currentTime) => {
            if (!lastTimeRef.current) {
                lastTimeRef.current = currentTime;
            }

            const deltaTime = (currentTime - lastTimeRef.current) / 1000; // Convert to seconds
            lastTimeRef.current = currentTime;

            if (springRef.current) {
                const newValue = springRef.current.update(deltaTime);
                setValue(newValue);

                // Continue animation if not settled
                if (!springRef.current.isSettled()) {
                    rafRef.current = requestAnimationFrame(animate);
                }
            }
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [targetValue, config]);

    return value;
}

/**
 * Hook for 2D vector spring animations (useful for positions, scales, etc.)
 * 
 * @param {Object} target - Target {x, y} coordinates
 * @param {Object} config - Spring configuration
 * @returns {Object} Current animated {x, y} values
 */
export function useSpring2D(target, config = { preset: 'WOBBLY' }) {
    const [value, setValue] = useState(target);
    const springRef = useRef(null);
    const rafRef = useRef(null);
    const lastTimeRef = useRef(null);

    // Initialize spring
    useEffect(() => {
        const { SpringVector2D } = require('../utils/SpringSolver');
        springRef.current = new SpringVector2D({
            ...config,
            initialX: target.x,
            initialY: target.y,
            targetX: target.x,
            targetY: target.y
        });
        lastTimeRef.current = performance.now();
    }, []);

    // Update target when it changes
    useEffect(() => {
        if (springRef.current) {
            springRef.current.setTarget(target.x, target.y);
        }
    }, [target.x, target.y]);

    // Animation loop
    useEffect(() => {
        const animate = (currentTime) => {
            if (!lastTimeRef.current) {
                lastTimeRef.current = currentTime;
            }

            const deltaTime = (currentTime - lastTimeRef.current) / 1000;
            lastTimeRef.current = currentTime;

            if (springRef.current) {
                const newValue = springRef.current.update(deltaTime);
                setValue(newValue);

                if (!springRef.current.isSettled()) {
                    rafRef.current = requestAnimationFrame(animate);
                }
            }
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [target, config]);

    return value;
}

/**
 * Hook for spring-based scale animations (button squish)
 * Returns scale value and mouse handlers
 * 
 * @param {Object} config - Spring configuration
 * @returns {Object} { scale, onMouseDown, onMouseUp, onMouseLeave }
 */
export function useSquishButton(config = { preset: 'BOUNCY' }) {
    const [targetScale, setTargetScale] = useState(1);
    const scale = useSpring(targetScale, config);

    const handleMouseDown = () => setTargetScale(0.9);
    const handleMouseUp = () => setTargetScale(1.1);
    const handleMouseLeave = () => setTargetScale(1.0);

    // Return to 1.0 after overshoot
    useEffect(() => {
        if (targetScale === 1.1) {
            const timeout = setTimeout(() => setTargetScale(1.0), 100);
            return () => clearTimeout(timeout);
        }
    }, [targetScale]);

    return {
        scale,
        onMouseDown: handleMouseDown,
        onMouseUp: handleMouseUp,
        onMouseLeave: handleMouseLeave
    };
}
