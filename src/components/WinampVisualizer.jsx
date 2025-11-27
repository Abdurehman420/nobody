import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { audioSynthesizer } from '../systems/AudioSynthesizer';

const WinampVisualizer = () => {
    const canvasRef = useRef(null);
    const { state } = useGame();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const render = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = 100;

            const width = canvas.width;
            const height = canvas.height;
            const ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, width, height);

            // Background
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);

            // Grid
            ctx.strokeStyle = '#003300';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < width; i += 20) {
                ctx.moveTo(i, 0);
                ctx.lineTo(i, height);
            }
            for (let i = 0; i < height; i += 20) {
                ctx.moveTo(0, i);
                ctx.lineTo(width, i);
            }
            ctx.stroke();

            // Real Audio Data
            if (audioSynthesizer.analyser) {
                const bufferLength = audioSynthesizer.analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                audioSynthesizer.analyser.getByteTimeDomainData(dataArray);

                ctx.lineWidth = 2;
                ctx.strokeStyle = '#00FF00';
                ctx.shadowBlur = 5;
                ctx.shadowColor = '#00FF00';
                ctx.beginPath();

                const sliceWidth = width * 1.0 / bufferLength;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    const v = dataArray[i] / 128.0;
                    const y = v * height / 2;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }

                    x += sliceWidth;
                }

                ctx.lineTo(canvas.width, canvas.height / 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
            } else {
                // Fallback if audio not initialized (silent line)
                ctx.beginPath();
                ctx.strokeStyle = '#003300';
                ctx.moveTo(0, height / 2);
                ctx.lineTo(width, height / 2);
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, [state.tick, state.resources.flux]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '100px',
                zIndex: 15, // Behind UI but above background? Or on top? Doc says "The bottom of the screen is..."
                pointerEvents: 'none',
                opacity: 0.8,
                borderTop: '2px solid #00FF00'
            }}
        />
    );
};

export default WinampVisualizer;
