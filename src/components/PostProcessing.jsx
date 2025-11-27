import React from 'react';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { ChromaticAberrationEffect } from './effects/ChromaticAberration';
import { ToonEffect } from './effects/ToonEffect';
import useGameStore from '../store/gameStore';
import { useFrame } from '@react-three/fiber';

const PostProcessing = () => {
    const resources = useGameStore(state => state.resources);
    const caRef = React.useRef();

    useFrame(() => {
        if (caRef.current) {
            // Modulate aberration based on Flux (energy)
            // More flux = more distortion
            const intensity = 0.002 + (resources.flux * 0.0001);
            caRef.current.uniforms.get('offset').value = Math.min(intensity, 0.05);
        }
    });

    return (
        <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} height={300} intensity={0.5} />
            <ToonEffect thickness={2.0} />
            <Vignette eskil={false} offset={0.1} darkness={0.8} />
            <ChromaticAberrationEffect ref={caRef} offset={0.002} />
        </EffectComposer>
    );
};

export default PostProcessing;
