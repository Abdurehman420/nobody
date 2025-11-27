/**
 * NEON MYCELIUM - Micro Civilization
 * 
 * Sentient micro-civilizations that can become vassals or enemies.
 */

export const PERSONALITY_TYPES = {
    DIPLOMATIC: 'DIPLOMATIC',
    AGGRESSIVE: 'AGGRESSIVE',
    PARANOID: 'PARANOID',
    GREEDY: 'GREEDY',
    PASSIVE: 'PASSIVE',
};

// Name generation components
const NAME_PREFIXES = [
    'The', 'Collective', 'United', 'Free', 'Grand', 'Sacred',
    'Ancient', 'Neon', 'Phosphorescent', 'Glowing', 'Crystalline'
];

const NAME_NOUNS = [
    'Bureaucrats', 'Accountants', 'Gnats', 'Motes', 'Spores',
    'Wisps', 'Echoes', 'Remnants', 'Fragments', 'Particles',
    'Neurons', 'Synapses', 'Dendrites', 'Microbes', 'Plankton'
];

const NAME_SUFFIXES = [
    'Coalition', 'Collective', 'Federation', 'Empire', 'Consortium',
    'Assembly', 'Council', 'Tribe', 'Swarm', 'Network'
];

/**
 * Generate a procedural civilization name
 */
function generateName() {
    const usePrefix = Math.random() > 0.5;
    const useSuffix = Math.random() > 0.6;

    let name = '';
    if (usePrefix) {
        name += randomFrom(NAME_PREFIXES) + ' ';
    }
    name += randomFrom(NAME_NOUNS);
    if (useSuffix) {
        name += ' ' + randomFrom(NAME_SUFFIXES);
    }

    return name;
}

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * MicroCivilization Entity
 */
export class MicroCivilization {
    constructor(x, y) {
        this.id = `civ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.name = generateName();
        this.x = x;
        this.y = y;

        // Personality
        this.personality = randomFrom(Object.values(PERSONALITY_TYPES));

        // Relationship (-100 to +100)
        this.relationship = this.personality === PERSONALITY_TYPES.DIPLOMATIC ? 20 : 0;

        // Vassal status
        this.isVassal = false;
        this.vassalSince = null;
        this.tributeRate = 0; // Stardust per tick
        this.fluxRate = 0; // Flux per tick

        // Demands/Favors
        this.demandCooldown = 0;
        this.lastDemand = null;

        // Stats
        this.population = Math.floor(Math.random() * 1000) + 100;
        this.wealth = Math.floor(Math.random() * 500);

        // Visual
        this.color = this.generateColor();
    }

    /**
     * Generate color based on personality
     */
    generateColor() {
        const colors = {
            DIPLOMATIC: '#00CCFF', // Cyan
            AGGRESSIVE: '#FF4444', // Red
            PARANOID: '#AA00FF',   // Purple
            GREEDY: '#FFD700',     // Gold
            PASSIVE: '#88FF88',    // Green
        };
        return colors[this.personality] || '#FFFFFF';
    }

    /**
     * Make this civilization a vassal
     */
    becomeVassal(lucidityInvestment) {
        this.isVassal = true;
        this.vassalSince = Date.now();
        this.relationship = Math.min(100, this.relationship + 50);

        // Calculate tribute rates based on investment and population
        this.tributeRate = Math.floor((lucidityInvestment / 10) * (this.population / 100));
        this.fluxRate = Math.floor(lucidityInvestment / 20);

        return {
            tributeRate: this.tributeRate,
            fluxRate: this.fluxRate
        };
    }

    /**
     * Calculate resources gained from destroying
     */
    getDestructionRewards() {
        const stardust = this.wealth + Math.floor(this.population / 2);
        const lucidity = Math.floor(this.population / 50);

        return { stardust, lucidity };
    }

    /**
     * Modify relationship
     */
    modifyRelationship(delta) {
        this.relationship = Math.max(-100, Math.min(100, this.relationship + delta));
    }

    /**
     * Generate a demand (only if vassal)
     */
    generateDemand() {
        if (!this.isVassal || this.demandCooldown > 0) return null;

        const demands = [
            { type: 'TRIBUTE', amount: Math.floor(this.tributeRate * 2), resource: 'stardust' },
            { type: 'SKIP_EXPANSION', turns: 5, reason: 'sacred grounds' },
            { type: 'GIFT', amount: 50, resource: 'flux', reason: 'ceremony' },
        ];

        const demand = randomFrom(demands);
        this.demandCooldown = 100; // ticks until next demand
        this.lastDemand = demand;

        return demand;
    }

    /**
     * Update (called each tick)
     */
    update() {
        if (this.demandCooldown > 0) {
            this.demandCooldown--;
        }

        // Relationship slowly decays toward neutral
        if (this.relationship > 0) {
            this.relationship = Math.max(0, this.relationship - 0.01);
        } else if (this.relationship < 0) {
            this.relationship = Math.min(0, this.relationship + 0.01);
        }
    }

    /**
     * Serialize for state
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            x: this.x,
            y: this.y,
            personality: this.personality,
            relationship: this.relationship,
            isVassal: this.isVassal,
            vassalSince: this.vassalSince,
            tributeRate: this.tributeRate,
            fluxRate: this.fluxRate,
            demandCooldown: this.demandCooldown,
            population: this.population,
            wealth: this.wealth,
            color: this.color,
        };
    }

    /**
     * Deserialize from state
     */
    static fromJSON(data) {
        const civ = new MicroCivilization(data.x, data.y);
        Object.assign(civ, data);
        return civ;
    }
}

/**
 * Calculate Federation bonus for multiple vassals
 */
export function calculateFederationBonus(vassals) {
    if (vassals.length < 2) return 1.0;

    // 10% bonus per vassal beyond first, up to 50%
    const bonus = Math.min(0.5, (vassals.length - 1) * 0.1);
    return 1.0 + bonus;
}
