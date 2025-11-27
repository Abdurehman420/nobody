/**
 * NEON MYCELIUM - Economy Engine
 * 
 * Handles resource transmutation and prism digestion.
 */

import { GAME_CONFIG } from './config';

export const processEconomy = (state) => {
    const { resources, prisms, nodes, tick } = state;
    let newResources = { ...resources };
    let newPrisms = [...prisms];

    // 1. Spawn Prisms (Randomly)
    let maxPrisms = GAME_CONFIG.ECONOMY.PRISM_MAX_COUNT;
    if (state.unlockedUpgrades && state.unlockedUpgrades.includes('the_big_gulp')) maxPrisms *= 2;

    if (Math.random() < GAME_CONFIG.ECONOMY.PRISM_SPAWN_RATE && newPrisms.length < maxPrisms) {
        let value = GAME_CONFIG.ECONOMY.PRISM_BASE_VALUE + Math.random() * GAME_CONFIG.ECONOMY.PRISM_VALUE_VARIANCE;
        let type = 'ISOTOPE-322';

        // Upgrade: Lucky Glitch (5% chance for 10x value)
        if (state.unlockedUpgrades && state.unlockedUpgrades.includes('lucky_glitch') && Math.random() < 0.05) {
            value *= 10;
            type = 'GLITCHED-PRISM';
        }

        newPrisms.push({
            id: `prism-${tick}`,
            x: (Math.random() - 0.5) * 1000,
            y: (Math.random() - 0.5) * 1000,
            value: value,
            type: type,
        });
    }

    // Upgrade: Schrodinger's Cat (Quantum Prisms)
    // Randomly change value of existing prisms
    if (state.unlockedUpgrades && state.unlockedUpgrades.includes('schrodingers_cat') && state.tick % 60 === 0) {
        newPrisms = newPrisms.map(p => {
            if (Math.random() < 0.2) { // 20% chance per second
                return {
                    ...p,
                    value: Math.random() * 100 + 10, // Reroll value
                    type: 'QUANTUM'
                };
            }
            return p;
        });
    }


    // If a prism is close to a node, it gets digested
    // For now, let's say if it's within range of a "Harvester" node (or any node for simplicity)
    // We'll implement "Connection" logic later. For now, auto-digest if close.

    // 2. Digest Prisms near Nodes
    let stardustGained = 0;
    const filteredPrisms = newPrisms.filter(prism => { // Filter from the potentially new list of prisms
        const isDigested = nodes.some(node => {
            const dx = node.x - prism.x;
            const dy = node.y - prism.y;
            return (dx * dx + dy * dy) < GAME_CONFIG.ECONOMY.DIGESTION_RADIUS * GAME_CONFIG.ECONOMY.DIGESTION_RADIUS; // Digestion radius
        });

        if (isDigested) {
            let value = prism.value;
            if (state.unlockedUpgrades && state.unlockedUpgrades.includes('digestive_enzymes')) value *= GAME_CONFIG.ECONOMY.DIGESTION_MULTIPLIER; // 50% more

            // Dimension 3: The Mirror Realm (2x Production)
            if (state.dimension === 3) value *= 2.0;

            stardustGained += value;
            return false; // Remove prism
        }
        return true; // Keep prism
    });

    // 3. Passive Lucidity (Very slow)
    newResources.lucidity += 0.001;

    // Spore Burst (Random free nodes) - handled in click interaction usually, 
    // but could be passive? Description said "Clicking empty space".
    // So we handle that in CanvasLayer.

    // Upgrade: Leak Plugging (Passive Efficiency)
    if (state.unlockedUpgrades && state.unlockedUpgrades.includes('leak_plugging')) {
        newResources.stardust += 0.01;
    }

    // Upgrade: Alchemical Fire (Burn Stardust -> Flux)
    if (state.unlockedUpgrades && state.unlockedUpgrades.includes('alchemical_fire')) {
        if (newResources.stardust > 500) {
            newResources.stardust -= 1;
            newResources.flux += 0.5;
        }
    }

    // Upgrade: Singularity Core (Passive Lucidity)
    if (state.unlockedUpgrades && state.unlockedUpgrades.includes('singularity_core')) {
        newResources.lucidity += 0.01;
    }

    // Upgrade: Neon Photosynthesis (Zoom -> Resources)
    if (state.unlockedUpgrades && state.unlockedUpgrades.includes('neon_photosynthesis')) {
        if (state.zoom < 1.0) {
            newResources.stardust += (1.0 - state.zoom) * 0.1;
        } else {
            newResources.flux += (state.zoom - 1.0) * 0.1;
        }
    }

    // Upgrade: Vampiric Draw (Drain Bureaucrats)
    if (state.unlockedUpgrades && state.unlockedUpgrades.includes('vampiric_draw')) {
        const compliantDesks = state.desks ? state.desks.filter(d => d.compliant).length : 0;
        newResources.flux += compliantDesks * 0.1;
    }

    return {
        ...state,
        prisms: filteredPrisms, // Use the filtered prisms
        resources: {
            ...state.resources,
            stardust: newResources.stardust + stardustGained * (state.unlockedUpgrades && state.unlockedUpgrades.includes('pixel_interpolation') ? 1.1 : 1.0),
            lucidity: newResources.lucidity,
            flux: newResources.flux,
        }
    };
};
