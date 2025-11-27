/**
 * NEON MYCELIUM - Prestige Engine
 * 
 * Handles Sporulation (Soft Reset) and Dimensional Shifts (Hard Reset).
 */

import { INITIAL_STATE } from './gameState';

export const triggerSporulation = (state) => {
    // Soft Reset: Keep Crystals, Reset Nodes/Resources
    const crystals = (state.resources.crystals || 0) + 1;

    return {
        ...INITIAL_STATE,
        resources: {
            ...INITIAL_STATE.resources,
            crystals: crystals,
        },
        dimension: state.dimension || 1, // Keep dimension
        // Visual effect flag
        sporulating: true,
    };
};

export const triggerDimensionalShift = (state) => {
    // Hard Reset: New Dimension, New Physics
    const nextDimension = (state.dimension || 1) + 1;

    return {
        ...INITIAL_STATE,
        dimension: nextDimension,
        // Keep Unlocked Upgrades? 
        // Design doc says "Infinite Prestige". Usually this means keeping some progress.
        // Let's keep upgrades for now, but maybe lock some high-tier ones if we had tiers.
        unlockedUpgrades: state.unlockedUpgrades,
        // Keep Permits?
        permits: state.permits,
        // Visual effect flag
        shifting: true,
        // Ensure worldOffset is a fresh object to avoid reference pollution
        worldOffset: { x: 0, y: 0 },
        zoom: 1.0,
    };
};

export const getDimensionPhysics = (dimension) => {
    switch (dimension) {
        case 2: // The Fluid Verse
            return { resistanceInverted: true };
        case 3: // The Mirror Realm
            return { controlsReversed: true, productionMultiplier: 2 };
        case 4: // The Butt World
            return { frictionHigh: true };
        default: // C-137
            return {};
    }
};
