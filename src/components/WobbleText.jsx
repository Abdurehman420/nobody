import React, { useEffect, useRef } from 'react';

/**
 * NEON MYCELIUM - Wobble Text Component
 * 
 * Applies sinusoidal distortion to text for "Cosmic Garbage" feel.
 * Each character wobbles independently using CSS transforms.
 */

const WobbleText = ({
    children,
    intensity = 2,
    speed = 0.003,
    className = '',
    style = {},
    ...props
}) => {
    const containerRef = useRef(null);
    const animationRef = useRef(null);
    const startTime = useRef(Date.now());

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Split text into individual character spans
        const text = container.textContent;
        container.innerHTML = '';

        text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.display = 'inline-block';
            span.style.position = 'relative';
            span.dataset.charIndex = index;

            // Preserve spaces
            if (char === ' ') {
                span.style.width = '0.25em';
            }

            container.appendChild(span);
        });

        // Animation loop
        const animate = () => {
            const elapsed = Date.now() - startTime.current;
            const chars = container.querySelectorAll('span');

            chars.forEach((char, index) => {
                const offset = index * 0.5; // Phase offset per character
                const wobbleY = Math.sin(elapsed * speed + offset) * intensity;
                const wobbleX = Math.cos(elapsed * speed * 0.7 + offset) * (intensity * 0.5);
                const wobbleRotate = Math.sin(elapsed * speed * 1.3 + offset) * (intensity * 0.3);

                char.style.transform = `translate(${wobbleX}px, ${wobbleY}px) rotate(${wobbleRotate}deg)`;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [intensity, speed, children]);

    return (
        <span
            ref={containerRef}
            className={className}
            style={{
                ...style,
                display: 'inline-block',
                whiteSpace: 'pre-wrap'
            }}
            {...props}
        >
            {children}
        </span>
    );
};

export default WobbleText;
