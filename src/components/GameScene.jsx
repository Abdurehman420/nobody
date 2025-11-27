import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree, createPortal } from '@react-three/fiber';
import { useFBO } from '@react-three/drei';
import * as THREE from 'three';
import { SimulationShader, RenderShader } from '../shaders/GrayScottShader';
import NetworkLayer from './NetworkLayer';
import PostProcessing from './PostProcessing';
import InteractionManager from './InteractionManager';
import FloatingOrigin from './FloatingOrigin';

const GameScene = () => {
    const { size, gl, viewport } = useThree();

    // Create FBOs for ping-pong
    const fboA = useFBO(size.width, size.height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
    });
    const fboB = useFBO(size.width, size.height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
    });

    // Refs for swapping
    const fboRef = useRef({ read: fboA, write: fboB });

    // Simulation Scene Setup
    const simScene = useMemo(() => new THREE.Scene(), []);
    const simCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
    const simMesh = useRef();

    // Initial Seed
    useEffect(() => {
        // We could render noise here to init, but for now let's just rely on the shader handling empty state 
        // or add a "seed" uniform later. 
        // Actually, Gray-Scott needs a seed. Let's add a simple noise seed in the shader or JS.
        // For now, we'll assume the shader starts empty and we "draw" into it, or we init with noise.
        // Let's modify the shader later to include noise, or just draw a circle in the center.
    }, []);

    useFrame((state) => {
        if (!simMesh.current) return;

        const { read, write } = fboRef.current;

        // 1. Simulation Pass
        simMesh.current.material.uniforms.uTexture.value = read.texture;
        simMesh.current.material.uniforms.uResolution.value.set(size.width, size.height);
        // Mouse interaction could go here

        gl.setRenderTarget(write);
        gl.render(simScene, simCamera);
        gl.setRenderTarget(null);

        // 2. Swap
        fboRef.current.read = write;
        fboRef.current.write = read;
    });

    // Uniforms for Simulation
    const simUniforms = useMemo(() => ({
        uTexture: { value: null },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
        uFeed: { value: 0.029 }, // "Mazes" / "Worms"
        uKill: { value: 0.057 },
        uDelta: { value: 1.0 },
        uScale: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
    }), [size]);

    useFrame((state) => {
        simUniforms.uTime.value = state.clock.elapsedTime;
    });

    // Uniforms for Rendering
    const renderUniforms = useMemo(() => ({
        uTexture: { value: null },
        uColor1: { value: new THREE.Color('#0b0c10') }, // Dark Space
        uColor2: { value: new THREE.Color('#bfff00') }, // Portal Green
        uColor3: { value: new THREE.Color('#00f7ff') }, // Electric Blue
    }), []);

    // Update render uniform every frame to point to the latest "read" texture
    useFrame(() => {
        renderUniforms.uTexture.value = fboRef.current.read.texture;
    });

    return (
        <>
            {/* Simulation Portal (Off-screen) */}
            {createPortal(
                <mesh ref={simMesh}>
                    <planeGeometry args={[2, 2]} />
                    <shaderMaterial
                        vertexShader={SimulationShader.vertexShader}
                        fragmentShader={SimulationShader.fragmentShader}
                        uniforms={simUniforms}
                    />
                </mesh>,
                simScene
            )}

            {/* Visualization (On-screen) */}
            <mesh>
                <planeGeometry args={[viewport.width, viewport.height]} />
                <shaderMaterial
                    vertexShader={RenderShader.vertexShader}
                    fragmentShader={RenderShader.fragmentShader}
                    uniforms={renderUniforms}
                />
            </mesh>

            {/* Network Layer */}
            <NetworkLayer />

            {/* Post Processing */}
            <PostProcessing />

            {/* Interactions */}
            <InteractionManager />
            <FloatingOrigin />
        </>
    );
};

export default GameScene;
