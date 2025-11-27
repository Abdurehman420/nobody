/**
 * NEON MYCELIUM - Procedural Generation Engine
 * 
 * Handles infinite world generation and floating origin.
 */

// Simple pseudo-random noise (not true Perlin, but deterministic enough for now)
const noise = (x, y) => {
    const sin = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
    return sin - Math.floor(sin);
};

export const generateChunk = (chunkX, chunkY) => {
    const objects = [];
    const chunkSize = 1000;

    // Generate Prisms based on noise
    const density = noise(chunkX, chunkY);

    if (density > 0.5) {
        const count = Math.floor(density * 5);
        for (let i = 0; i < count; i++) {
            objects.push({
                id: `prism-${chunkX}-${chunkY}-${i}`,
                type: 'ISOTOPE-322',
                x: chunkX * chunkSize + noise(i, chunkY) * chunkSize,
                y: chunkY * chunkSize + noise(chunkX, i) * chunkSize,
                value: 100 + Math.random() * 200,
            });
        }
    }

    // Generate Rocks (Obstacles)
    const rockDensity = noise(chunkX + 100, chunkY + 100);
    if (rockDensity > 0.6) {
        const count = Math.floor(rockDensity * 3);
        for (let i = 0; i < count; i++) {
            objects.push({
                id: `rock-${chunkX}-${chunkY}-${i}`,
                type: 'OBSTACLE',
                x: chunkX * chunkSize + noise(i + 50, chunkY) * chunkSize,
                y: chunkY * chunkSize + noise(chunkX, i + 50) * chunkSize,
                radius: 40 + Math.random() * 40,
            });
        }
    }

    // Generate Enemies
    const enemyDensity = noise(chunkX - 100, chunkY - 100);
    if (enemyDensity > 0.7) {
        const count = Math.floor(enemyDensity * 2);
        for (let i = 0; i < count; i++) {
            objects.push({
                id: `enemy-${chunkX}-${chunkY}-${i}`,
                type: 'ENEMY',
                x: chunkX * chunkSize + noise(i + 20, chunkY) * chunkSize,
                y: chunkY * chunkSize + noise(chunkX, i + 20) * chunkSize,
                radius: 20,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
            });
        }
    }

    // Generate Bureaucrat Desks (Rare)
    const deskDensity = noise(chunkX * 0.5, chunkY * 0.5); // Lower frequency
    if (deskDensity > 0.8) { // Rare
        objects.push({
            id: `desk-${chunkX}-${chunkY}`,
            type: 'DESK',
            department: ['solid_waste', 'high_voltage', 'existential_compliance'][Math.floor(Math.random() * 3)],
            x: chunkX * chunkSize + 500, // Center-ish
            y: chunkY * chunkSize + 500,
            width: 60,
            height: 40,
        });
    }

    return objects;
};

export const updateFloatingOrigin = (state) => {
    const { nodes, edges, prisms, worldOffset } = state;
    const threshold = 5000;

    // If camera (worldOffset) is too far, shift everything
    if (Math.abs(worldOffset.x) > threshold || Math.abs(worldOffset.y) > threshold) {
        const shiftX = worldOffset.x;
        const shiftY = worldOffset.y;

        const newNodes = nodes.map(n => ({
            ...n,
            x: n.x - shiftX,
            y: n.y - shiftY
        }));

        const newPrisms = prisms.map(p => ({
            ...p,
            x: p.x - shiftX,
            y: p.y - shiftY
        }));

        const newObstacles = (state.obstacles || []).map(o => ({
            ...o,
            x: o.x - shiftX,
            y: o.y - shiftY
        }));

        const newEnemies = (state.enemies || []).map(e => ({
            ...e,
            x: e.x - shiftX,
            y: e.y - shiftY
        }));

        const newDesks = (state.desks || []).map(d => ({
            ...d,
            x: d.x - shiftX,
            y: d.y - shiftY
        }));

        // Edges don't have coordinates, they reference nodes

        return {
            ...state,
            nodes: newNodes,
            prisms: newPrisms,
            obstacles: newObstacles,
            enemies: newEnemies,
            desks: newDesks,
            worldOffset: { x: 0, y: 0 }, // Reset offset
            // We might need to track "Global Offset" if we want to know absolute position for generation
            globalOffset: {
                x: (state.globalOffset?.x || 0) + shiftX,
                y: (state.globalOffset?.y || 0) + shiftY
            }
        };
    }

    return state;
};
