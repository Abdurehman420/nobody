export const GAME_CONFIG = {
    RESOURCES: {
        INITIAL_STARDUST: 100,
        COST_NODE: 50,
        COST_EDGE: 20,
        COST_FLUX_TRADE: 100,
    },
    PHYSICS: {
        PRESSURE_SOURCE: 100,
        PRESSURE_DECAY: 0.98,
        PRESSURE_DECAY_UPGRADED: 0.99,
        ETHER_DRAG: 0.1,
        FLUX_GENERATION_THRESHOLD: 0.1,
        FLUX_GENERATION_THRESHOLD_UPGRADED: 0.05,
    },
    ECONOMY: {
        PRISM_SPAWN_RATE: 0.01,
        PRISM_MAX_COUNT: 10,
        PRISM_BASE_VALUE: 100,
        PRISM_VALUE_VARIANCE: 500,
        DIGESTION_RADIUS: 50,
        DIGESTION_MULTIPLIER: 1.5,
    },
    VISUALS: {
        NODE_RADIUS: 20,
        NODE_HIT_RADIUS: 30,
        PRISM_HIT_RADIUS: 20,
        COLORS: {
            NODE_CORE: '#00FFFF', // Cyan
            NODE_RING_1: 'rgba(0, 255, 255, 0.3)',
            NODE_RING_2: 'rgba(255, 0, 255, 0.3)',
            CONNECTION_FLOW: '#00FF00',
            CONNECTION_STAGNANT: '#004400',
        },
        FOG_RADIUS: 500, // Base visibility radius around nodes
        FOG_RADIUS_UPGRADED: 800, // Bio-luminescence radius
    }
};
