import { useEffect, useRef } from 'react';

export const useGameLoop = (callback, paused = false) => {
    const requestRef = useRef();
    const previousTimeRef = useRef();

    const savedCallback = useRef();

    // Remember the latest callback
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    const animate = time => {
        if (previousTimeRef.current != undefined) {
            const deltaTime = time - previousTimeRef.current;
            if (savedCallback.current) {
                savedCallback.current(deltaTime);
            }
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (!paused) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(requestRef.current);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [paused]); // Remove callback from dependencies
};
