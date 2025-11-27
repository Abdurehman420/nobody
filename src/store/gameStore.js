import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

const useGameStore = create((set, get) => ({
    resources: {
        stardust: 100,
        flux: 0,
        lucidity: 0,
    },
    nodes: [], // { id, x, y, type, pressure, capacity }
    edges: [], // { id, source, target, resistance, flow }

    // Costs
    costs: {
        node: 50,
        edge: 10,
    },

    // Actions
    addNode: (x, y, type = 'standard') => set((state) => {
        const cost = state.costs.node;
        if (state.resources.stardust < cost && type !== 'source') return state;

        return {
            resources: {
                ...state.resources,
                stardust: state.resources.stardust - (type !== 'source' ? cost : 0)
            },
            nodes: [...state.nodes, {
                id: uuidv4(),
                x, y,
                type,
                pressure: 0,
                capacity: 100
            }]
        };
    }),

    addEdge: (sourceId, targetId) => set((state) => {
        // Check if edge already exists
        const exists = state.edges.find(e =>
            (e.source === sourceId && e.target === targetId) ||
            (e.source === targetId && e.target === sourceId)
        );
        if (exists) return state;

        const cost = state.costs.edge;
        if (state.resources.stardust < cost) return state;

        return {
            resources: {
                ...state.resources,
                stardust: state.resources.stardust - cost
            },
            edges: [...state.edges, {
                id: uuidv4(),
                source: sourceId,
                target: targetId,
                resistance: 1.0,
                flow: 0
            }]
        };
    }),

    transmute: () => set((state) => {
        // Elder God Trade: Flux -> Lucidity
        if (state.resources.flux >= 100) {
            return {
                resources: {
                    ...state.resources,
                    flux: state.resources.flux - 100,
                    lucidity: state.resources.lucidity + 1
                }
            };
        }
        return state;
    }),

    // Simulation Tick
    tick: (dt) => set((state) => {
        // Deep clone for immutability (could be optimized with Immer)
        const newNodes = state.nodes.map(n => ({ ...n }));
        const newEdges = state.edges.map(e => ({ ...e }));
        const nodeMap = new Map(newNodes.map(n => [n.id, n]));

        let totalFluxGenerated = 0;

        // 1. Calculate Flow
        newEdges.forEach(edge => {
            const source = nodeMap.get(edge.source);
            const target = nodeMap.get(edge.target);
            if (!source || !target) return;

            const pressureDelta = source.pressure - target.pressure;
            const etherDrag = 0.1; // Viscous Ether

            // Velocity = (PressureDelta / Resistance) * (1.0 - EtherDrag)
            let velocity = (pressureDelta / edge.resistance) * (1.0 - etherDrag);

            // Flow Amount = Velocity * dt
            let amount = velocity * dt * 5.0; // Multiplier for speed

            // Constraints
            if (amount > 0) {
                if (source.pressure < amount) amount = source.pressure;
                if (target.pressure + amount > target.capacity) amount = target.capacity - target.pressure;
            } else {
                if (target.pressure < -amount) amount = -target.pressure;
                if (source.pressure - amount > source.capacity) amount = -(source.capacity - source.pressure);
            }

            // Apply Flow
            if (Math.abs(amount) > 0.001) {
                source.pressure -= amount;
                target.pressure += amount;
                edge.flow = amount;

                // Friction generates Flux
                // "Flowing Stardust quickly through narrow pipes generates Friction, which converts to Flux."
                // Flux = |Flow| * FrictionCoefficient
                totalFluxGenerated += Math.abs(amount) * 0.1;
            } else {
                edge.flow = 0;
            }
        });

        // 2. Node Logic
        newNodes.forEach(node => {
            if (node.type === 'source') {
                node.pressure += 20 * dt; // Source generation
                if (node.pressure > node.capacity) node.pressure = node.capacity;
            }
            // Leak / Consumption
            // node.pressure *= 0.999; 
        });

        // Passive Stardust Generation (Prisms)
        // For now, just trickle stardust so player doesn't get stuck
        const stardustGen = 0.1;

        return {
            nodes: newNodes,
            edges: newEdges,
            resources: {
                ...state.resources,
                flux: state.resources.flux + totalFluxGenerated,
                stardust: state.resources.stardust + stardustGen
            }
        };
    }),
}));

export default useGameStore;
