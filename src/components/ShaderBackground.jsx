import React, { useRef, useEffect } from 'react';
import portalFrag from '../shaders/portal.frag?raw';

const vertexShaderSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const ShaderBackground = ({ flux, nodeCount, stockPhotoInvasionActive }) => {
    const canvasRef = useRef(null);
    const propsRef = useRef({ flux, nodeCount, stockPhotoInvasionActive });
    const startTimeRef = useRef(Date.now());
    const requestRef = useRef(null);

    useEffect(() => {
        propsRef.current = { flux, nodeCount, stockPhotoInvasionActive };
    }, [flux, nodeCount, stockPhotoInvasionActive]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const gl = canvas.getContext('webgl');

        if (!gl) {
            console.error('WebGL not supported');
            return;
        }

        // Compile shaders
        const createShader = (gl, type, source) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, portalFrag);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program));
            return;
        }

        // Set up buffers
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0,
        ]), gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, 'position');
        const timeLocation = gl.getUniformLocation(program, 'u_time');
        const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
        const intensityLocation = gl.getUniformLocation(program, 'u_intensity'); // New uniform

        // Resize handler
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        window.addEventListener('resize', resize);
        resize();

        // Render loop
        const render = () => {
            gl.useProgram(program);
            gl.enableVertexAttribArray(positionLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            gl.uniform1f(timeLocation, (Date.now() - startTimeRef.current) * 0.001);
            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

            // Dynamic Intensity
            // ROOT CAUSE FIX: Drastically increased divisors for "way way way way less reactive" background
            const intensity = Math.min(propsRef.current.flux / 100000 + propsRef.current.nodeCount / 500, 5.0);

            gl.uniform1f(intensityLocation, intensity);

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            requestRef.current = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(requestRef.current);
        };
    }, []); // Run once, loop reads refs

    return (
        <>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: -1,
                    width: '100vw',
                    height: '100vh'
                }}
            />
            {/* Stock Photo Invasion Overlay */}
            {propsRef.current.stockPhotoInvasionActive && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: -1, // Same as canvas, but we'll use opacity or mix-blend-mode
                    backgroundImage: 'url(src/assets/stock_photo.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: 0.8,
                    mixBlendMode: 'hard-light', // Make it look like a weird projection
                    pointerEvents: 'none',
                    animation: 'pulse 2s infinite'
                }} />
            )}
        </>
    );
};

export default ShaderBackground;
