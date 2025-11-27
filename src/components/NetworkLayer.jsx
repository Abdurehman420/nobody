import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Line, Circle } from '@react-three/drei';
import * as THREE from 'three';
import useGameStore from '../store/gameStore';
import { NodeShader } from '../shaders/NodeShader';

const NetworkLayer = () => {
    const nodes = useGameStore(state => state.nodes);
    const edges = useGameStore(state => state.edges);
    const tick = useGameStore(state => state.tick);

    // Initialize Audio
    useEffect(() => {
        // Audio is now initialized by the first user interaction via AudioSynthesizer
    }, []);

    // Simulation Loop
    useFrame((state, delta) => {
        tick(delta);

        // Update Hydro-Acoustic Audio
        // We do this here to sync with the visual flow
        const edges = useGameStore.getState().edges;
        edges.forEach(edge => {
            // Only play if flow is significant to save performance
            const flow = Math.abs(edge.flow);
            if (flow > 0.01) {
                // We need to import it dynamically or assume it's available globally? 
                // Better to import at top, but let's use the singleton.
                // Actually, let's just do it.
                import('../systems/AudioSynthesizer').then(({ audioSynthesizer }) => {
                    audioSynthesizer.playHydroFlow(Math.min(flow, 1.0), edge.id);
                });
            }
        });
    });

    return (
        <group>
            {edges.map(edge => (
                <EdgeRenderer key={edge.id} edgeId={edge.id} />
            ))}
            {nodes.map(node => (
                <NodeRenderer key={node.id} nodeId={node.id} />
            ))}
        </group>
    );
};

const NodeRenderer = ({ nodeId }) => {
    const mesh = useRef();

    const { clock } = useThree();

    useFrame(() => {
        const node = useGameStore.getState().nodes.find(n => n.id === nodeId);
        const worldOffset = useGameStore.getState().worldOffset;

        if (node && mesh.current) {
            // Position (Floating Origin)
            mesh.current.position.set(node.x - worldOffset.x, node.y - worldOffset.y, 0.1);

            // Scale based on pressure
            const s = 0.3 + (node.pressure / node.capacity) * 0.3;
            mesh.current.scale.set(s, s, s);

            // Color
            if (node.type === 'source') {
                mesh.current.material.uniforms.uColor.value.set('#ff0099'); // Goo Pink Source
                mesh.current.material.uniforms.uIntensity.value = 2.0;
            } else {
                mesh.current.material.uniforms.uColor.value.set('#9900ff'); // Purple Standard
                mesh.current.material.uniforms.uIntensity.value = 1.0 + (node.pressure / node.capacity);
            }

            // Animation
            mesh.current.material.uniforms.uTime.value = clock.elapsedTime;
        }
    });

    return (
        <mesh ref={mesh}>
            <planeGeometry args={[1.5, 1.5]} />
            <shaderMaterial
                vertexShader={NodeShader.vertexShader}
                fragmentShader={NodeShader.fragmentShader}
                uniforms={{
                    uColor: { value: new THREE.Color('#ffffff') },
                    uIntensity: { value: 1.0 },
                    uTime: { value: 0 },
                    uSeed: { value: Math.random() }
                }}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
};

const EdgeRenderer = ({ edgeId }) => {
    const line = useRef();
    const points = useRef([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)]);

    useFrame(() => {
        const edge = useGameStore.getState().edges.find(e => e.id === edgeId);
        if (!edge) return;

        const source = useGameStore.getState().nodes.find(n => n.id === edge.source);
        const target = useGameStore.getState().nodes.find(n => n.id === edge.target);

        if (source && target && line.current) {
            // Update points
            // We can't easily update points of Line component declaratively without re-render
            // But Line from drei accepts points prop.
            // To avoid re-render, we might need a custom line mesh or update the geometry directly.
            // Drei Line uses Line2 (fat lines).

            // For now, let's just use the props and rely on React reconciliation or use a lower level approach if slow.
            // Actually, passing new points array will trigger update.
            // But nodes don't move (yet). So points are static!
            // Only color/width changes.
        }

        if (line.current) {
            const flow = Math.abs(edge.flow);
            line.current.material.linewidth = 1 + flow * 5.0;
            line.current.material.opacity = 0.2 + flow * 2.0;
            line.current.material.color.lerpColors(
                new THREE.Color('#00ffcc'),
                new THREE.Color('#ff00ff'),
                Math.min(flow * 5, 1)
            );
        }
    });

    // Get initial positions
    const edge = useGameStore.getState().edges.find(e => e.id === edgeId);
    const source = useGameStore.getState().nodes.find(n => n.id === edge.source);
    const target = useGameStore.getState().nodes.find(n => n.id === edge.target);
    const worldOffset = useGameStore.getState().worldOffset;

    if (!source || !target) return null;

    return (
        <Line
            ref={line}
            points={[
                [source.x - worldOffset.x, source.y - worldOffset.y, 0],
                [target.x - worldOffset.x, target.y - worldOffset.y, 0]
            ]}
            color="#00ffcc"
            lineWidth={1}
            transparent
            opacity={0.5}
            position={[0, 0, 0.05]} // Between bg and nodes
        />
    );
};

export default NetworkLayer;
