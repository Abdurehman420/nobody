/**
 * NEON MYCELIUM - Fluid Simulation Engine
 * 
 * Implements the "Zero-G" fluid dynamics with "Viscous Ether" drag.
 */
import { GAME_CONFIG } from './config';

export const calculateFluidSimulation = (state, deltaTime) => {
    const { nodes, edges, resources = { flux: 0 } } = state;

    // 1. Calculate Pressure for each node
    // Pressure = Fluid / Capacity (simplified)
    // For now, we'll assume nodes have infinite capacity but pressure builds up
    // Let's say pressure is just a property we update based on flow

    const newNodes = nodes.map(node => {
        let newPressure = Number.isFinite(node.pressure) ? node.pressure : 0;

        if (node.type && node.type.toUpperCase() === 'SOURCE') {
            // Source nodes generate infinite pressure
            newPressure = GAME_CONFIG.PHYSICS.PRESSURE_SOURCE;
            if (state.unlockedUpgrades.includes('high_pressure_pumps')) {
                newPressure *= 1.1; // +10%
            }
        } else {
            // Relay nodes consume/decay pressure to maintain flow gradient
            let decay = GAME_CONFIG.PHYSICS.PRESSURE_DECAY;
            if (state.unlockedUpgrades.includes('active_transport')) decay = GAME_CONFIG.PHYSICS.PRESSURE_DECAY_UPGRADED; // Slower decay

            newPressure *= decay;

            // Upgrade: Overclocked Hearts (Relays pump pressure)
            if (state.unlockedUpgrades.includes('overclocked_hearts')) {
                newPressure += 0.5; // Small active pump
            }
        }

        return { ...node, pressure: newPressure };
    });
    const newEdges = edges.map(edge => ({ ...edge }));

    // 2. Calculate Flow for each edge
    newEdges.forEach(edge => {
        const sourceNode = newNodes.find(n => n.id === edge.source);
        const targetNode = newNodes.find(n => n.id === edge.target);

        if (!sourceNode || !targetNode) return;

        const pressureDelta = sourceNode.pressure - targetNode.pressure;
        let resistance = edge.resistance || 1.0;
        let etherDrag = GAME_CONFIG.PHYSICS.ETHER_DRAG;

        // Upgrade: Greased Pipes (-5% drag)
        if (state.unlockedUpgrades.includes('greased_pipes')) {
            etherDrag *= 0.95;
        }
        // Upgrade: Mercury Blood (-10% viscosity/drag)
        if (state.unlockedUpgrades.includes('mercury_blood')) {
            etherDrag *= 0.90;
        }
        // Upgrade: Quantum Tunneling (Skip Nodes / Low Drag)
        if (state.unlockedUpgrades.includes('quantum_tunneling')) {
            etherDrag *= 0.5; // Massive drag reduction
        }

        // Upgrade: Super-Conductive Sap (Less resistance)
        if (state.unlockedUpgrades.includes('super_conductive_sap')) {
            resistance *= 0.8;
        }

        // Upgrade: Plumbus Coating (Reduced Friction/Drag)
        if (state.unlockedUpgrades.includes('plumbus_coating')) {
            etherDrag *= 0.8;
        }

        // Upgrade: Reverse Osmosis (Backward flow possible/easier?)
        // Actually, let's make it so flow against pressure is allowed or boosted?
        // Or maybe it just reduces resistance further?
        // Let's say it reduces resistance based on negative pressure delta?
        // For now, let's just give a flat flow boost.
        if (state.unlockedUpgrades.includes('reverse_osmosis')) {
            resistance *= 0.9;
        }

        // Dimensional Physics
        if (state.dimension === 2) {
            // Dimension 2: The Fluid Verse
            // Inverted Resistance: Long pipes are better (lower resistance)
            // Calculate length
            const dx = targetNode.x - sourceNode.x;
            const dy = targetNode.y - sourceNode.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            // Normal resistance is proportional to length (implicitly, though we use 1.0).
            // Here, let's say resistance decreases with length.
            resistance = 100 / Math.max(1, length);
        } else if (state.dimension === 4) {
            // Dimension 4: The Butt World
            // High Friction/Drag
            etherDrag *= 5.0; // Very viscous
        }

        // Velocity = (PressureDelta / Resistance) * (1.0 - EtherDrag)
        let velocity = (pressureDelta / Math.max(0.01, resistance)) * (1.0 - etherDrag);

        // Clamp velocity to prevent physics explosions
        velocity = Math.max(-1000, Math.min(1000, velocity));

        // Upgrade: Osmotic Surge (+5% flow)
        if (state.unlockedUpgrades.includes('osmotic_surge')) {
            velocity *= 1.05;
        }
        // Upgrade: Dark Matter Injection (+100% flow)
        if (state.unlockedUpgrades.includes('dark_matter_injection')) {
            velocity *= 2.0;
        }

        // Update flow on edge (visual only for now)
        edge.flow = Number.isFinite(velocity) ? velocity : 0;

        // Transfer pressure/fluid
        // This is a simplified model where pressure flows directly
        // ROOT CAUSE FIX: Increased transfer rate for better propagation
        const transfer = velocity * deltaTime * 2.0;

        // Safety check for NaN
        if (Number.isNaN(transfer)) return;

        sourceNode.pressure -= transfer;
        targetNode.pressure += transfer;

        // Clamp pressure to prevent infinite buildup
        sourceNode.pressure = Math.max(-10000, Math.min(10000, sourceNode.pressure));
        targetNode.pressure = Math.max(-10000, Math.min(10000, targetNode.pressure));

        // Upgrade: Sentient Fluid (Auto-Route / Balance)
        // If pressure difference is too high, equalize faster?
        if (state.unlockedUpgrades.includes('sentient_fluid')) {
            const diff = Math.abs(sourceNode.pressure - targetNode.pressure);
            if (diff > 50) {
                // Boost transfer to equalize
                const extraTransfer = transfer * 0.5;
                sourceNode.pressure -= extraTransfer;
                targetNode.pressure += extraTransfer;
            }
        }
    });

    // Upgrade: Interdimensional Plumbing (Screen Wrap / Wormholes)
    // Randomly transfer pressure between distant nodes
    if (state.unlockedUpgrades.includes('interdimensional_plumbing') && nodes.length > 2) {
        // Pick 2 random nodes
        const i1 = Math.floor(Math.random() * newNodes.length);
        const i2 = Math.floor(Math.random() * newNodes.length);
        if (i1 !== i2) {
            const n1 = newNodes[i1];
            const n2 = newNodes[i2];
            // Transfer pressure
            const transfer = (n1.pressure - n2.pressure) * 0.05; // 5% equalization
            if (!Number.isNaN(transfer)) {
                n1.pressure -= transfer;
                n2.pressure += transfer;
            }
        }
    }

    // 3. Generate Flux from High Pressure (Friction)
    let fluxGenerated = 0;
    let fluxThreshold = state.unlockedUpgrades.includes('flux_capacitor') ? GAME_CONFIG.PHYSICS.FLUX_GENERATION_THRESHOLD_UPGRADED : GAME_CONFIG.PHYSICS.FLUX_GENERATION_THRESHOLD;

    // Upgrade: Turbulent Flow (High pressure -> Extra Flux)
    if (state.unlockedUpgrades.includes('turbulent_flow')) {
        fluxThreshold *= 0.8; // Generate flux easier
    }

    newEdges.forEach(edge => {
        // Lower threshold for flux generation so it's easier to see
        if (Math.abs(edge.flow) > fluxThreshold) {
            // ROOT CAUSE FIX: Drastically reduced flux gain to prevent instant purple screen
            let fluxGain = Math.abs(edge.flow) * 0.005;

            // Cap per-edge gain
            fluxGain = Math.min(fluxGain, 0.5);

            // Upgrade: Alchemical Fire (Burning Stardust -> Flux Boost) - Not implemented yet as active skill
            // Upgrade: Turbulent Flow bonus
            if (state.unlockedUpgrades.includes('turbulent_flow')) {
                fluxGain *= 1.2;
            }
            fluxGenerated += fluxGain;
        }
    });

    // 4. Generate Flux from High Node Pressure (Accumulation)
    // This allows "dead end" nodes to produce flux if they are highly pressurized
    const pressureThreshold = 10; // Threshold to start generating flux
    newNodes.forEach(node => {
        if (node.type !== 'SOURCE' && node.pressure > pressureThreshold) {
            let pressureGain = (node.pressure - pressureThreshold) * 0.002;
            pressureGain = Math.min(pressureGain, 2.0); // Cap per-node gain
            fluxGenerated += pressureGain;
        }
    });

    // Clamp flux generated
    fluxGenerated = Math.min(fluxGenerated, 1000); // Max 1000 flux per tick

    return {
        ...state,
        nodes: newNodes,
        edges: newEdges,
        resources: {
            ...resources,
            flux: (resources.flux || 0) + fluxGenerated * (state.unlockedUpgrades.includes('pixel_interpolation') ? 1.1 : 1.0),
        }
    };
};
