export const INITIAL_STATE = {
    resources: {
        stardust: 100,
        flux: 0,
        lucidity: 0,
    },
    nodes: [
        {
            id: 'source-1',
            type: 'SOURCE',
            x: 0, // Relative to world center
            y: 0,
            level: 1,
            pressure: 0,
        }
    ],
    edges: [],
    prisms: [], // Floating space trash to digest
    worldOffset: { x: 0, y: 0 }, // For floating origin
    tick: 0,
    unlockedUpgrades: ['mycelial_network'], // Start with root unlocked
    particles: [], // Visual effects
    obstacles: [], // Rocks/Walls
    enemies: [], // Hostile entities
    desks: [], // Bureaucrat Desks
    permits: {
        solid_waste: 0,
        high_voltage: 0,
        existential_compliance: 0
    },
    activeEffects: {
        god_mode: false,
        frozen: false
    },
    backupResources: null, // For God Mode revert
    cooldowns: {}, // Map of skillId -> expiryTick
    dimension: 1, // Current Dimension
    crashed: false,
    fourthWallBroken: false, // Easter egg: set to true when player reaches 1M flux
    konamiActivated: false, // Easter egg: Konami Code unlocks ASCII mode
    activeCheats: {}, // Cheat cartridge states
    prestigeLevel: 0, // Multiplier
    screenShake: 0, // Shake intensity (decays over time)

    // MODULE F: Trolling features state
    fakeNodes: [], // Real Fake Nodes
    emotionalBaggage: [], // Sad suitcase particles
    baggageRepressed: false, // Flooble Crank repression active
    tosMonolithActive: false, // Terms of Service blocking
    schrodingerBoxes: [], // Quantum catboxes
    genericNPCs: [], // T-posing wanderers
    infiniteResourcesUntil: 0, // Timestamp for infinite resources from catbox
    wetFloorZones: [], // Zero friction hazards
    spaghettiTangles: [], // Code knots that randomize particles
    sunkCostInvested: 0, // Total Flux thrown into pit
    bananaVisible: true, // Banana for Scale feature  
    bananaPickedUp: false, // Has user interacted with banana
    bananaScientificAccuracy: true, // 5 decimal places for banana (Default on)
    connectionSoundsEnabled: true, // Toggle for annoying noises
    timeTravelerRegrets: [], // Backwards-moving particles
    stockPhotoInvasionActive: false,
    stockPhotoInvasionEndTime: null,
    glutenFreeMode: false,
    freeWillValue: 0.5, // 0 = Determinism, 1 = Chaos
    recursiveReviewActive: false,
    clickCount: 0,
    creditsActive: false,
    trollEvents: {
        activeEvents: [],
        cooldowns: {}
    }
};
