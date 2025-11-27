import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import useGameStore from '../store/gameStore';
import * as THREE from 'three';

const FloatingOrigin = () => {
    const { camera, controls } = useThree();
    const setWorldOffset = useGameStore(state => state.setWorldOffset);
    const threshold = 100; // Shift when 100 units away

    useFrame(() => {
        if (camera.position.length() > threshold) {
            // Calculate shift
            const shift = {
                x: camera.position.x,
                y: camera.position.y
            };

            // Update Store (Global Offset)
            setWorldOffset(shift);

            // Reset Camera
            camera.position.x -= shift.x;
            camera.position.y -= shift.y;

            // Reset Controls Target (if using Orbit/MapControls)
            if (controls) {
                controls.target.x -= shift.x;
                controls.target.y -= shift.y;
                controls.update();
            }

            console.log("Floating Origin Shift:", shift);
        }
    });

    return null;
};

export default FloatingOrigin;
