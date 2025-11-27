import { useEffect, useRef } from 'react';

export const useGameLoop = (callback, paused = false) => {
    const requestRef = useRef();
    const previousTimeRef = useRef();

    const animate = time => {
        if (previousTimeRef.current != undefined) {
            const deltaTime = time - previousTimeRef.current;
            // We can't access state here easily to check for 'time_dilation'.
            // But the callback (tick) has access to state.
            // So we should pass raw deltaTime and let tick handle it?
            // Or we can accept a 'speed' prop.
            // Let's just pass raw deltaTime.
            callback(deltaTime);
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
    }, [paused, callback]);
};
