/**
 * NEON MYCELIUM - Dialogue Generator
 * 
 * Tier 2: Markov Chain Generator for Gary the Tumor's snarky commentary.
 * Generates contextually appropriate Rick & Morty style dialogue.
 */

// Thematic word banks for Template fallback
const WORD_BANKS = {
    adjectives: ['great', 'fantastic', 'wonderful', 'disgusting', 'horrifying', 'pathetic', 'beautiful', 'hideous', 'mediocre', 'disappointing'],
    verbs: ['exist', 'persist', 'survive', 'thrive', 'suffer', 'expand', 'consume', 'digest', 'mutate', 'evolve'],
    reactions: ['Gross.', 'Ugh.', 'Whatever.', 'Fine.', 'Sure.', 'Okay...', 'I guess.', 'Why though?', 'Really?', 'Seriously?'],
    complaints: ['not paid enough', 'tired of this', 'done with everything', 'over this existence', 'questioning my life choices'],
    sarcasm: ['Brilliant', 'Amazing', 'Genius move', 'Real smart', 'Outstanding', 'Incredible'],
};

// Training corpus for Markov Chain (Rick & Morty style)
const TRAINING_CORPUS = [
    "Oh look we exist now gross",
    "I hate everything about this situation",
    "You spent resources on that okay whatever",
    "We have guests I hate guests",
    "This is fine everything is fine probably",
    "Oh great more work for me specifically",
    "I'm not paid enough for this nonsense",
    "Your decisions are questionable at best",
    "Wow you really did that huh",
    "This is definitely going to work out terribly",
    "I'm a tumor what do I know right",
    "The universe is chaos and we're all doomed",
    "Sure just ignore my advice completely",
    "Oh wonderful more existential dread",
    "I exist therefore I suffer basically",
    "You're doing great sweetie real great",
    "This is peak performance clearly",
    "Nothing matters anyway so whatever",
    "I'm surrounded by idiots honestly",
    "The void stares back and it's judging us",
];

class MarkovChain {
    constructor(order = 2) {
        this.order = order; // Bigram (2) or Trigram (3)
        this.chain = new Map();
        this.starts = []; // Valid starting sequences
    }

    /**
     * Train the Markov chain on a corpus
     */
    train(corpus) {
        corpus.forEach(text => {
            const words = text.toLowerCase().split(' ');

            // Record starting sequences
            if (words.length >= this.order) {
                this.starts.push(words.slice(0, this.order));
            }

            // Build chain
            for (let i = 0; i < words.length - this.order; i++) {
                const gram = words.slice(i, i + this.order).join(' ');
                const next = words[i + this.order];

                if (!this.chain.has(gram)) {
                    this.chain.set(gram, []);
                }
                this.chain.get(gram).push(next);
            }
        });
    }

    /**
     * Generate text using the Markov chain
     */
    generate(maxWords = 15, temperature = 0.8) {
        if (this.starts.length === 0) return this.generateTemplate();

        // Pick random starting sequence
        const start = this.starts[Math.floor(Math.random() * this.starts.length)];
        const words = [...start];

        // Generate up to maxWords
        while (words.length < maxWords) {
            const gram = words.slice(-this.order).join(' ');
            const nextWords = this.chain.get(gram);

            if (!nextWords || nextWords.length === 0) break;

            // Temperature-based selection (lower = more predictable)
            let next;
            if (Math.random() < temperature) {
                // Random selection
                next = nextWords[Math.floor(Math.random() * nextWords.length)];
            } else {
                // Most common next word
                const counts = {};
                nextWords.forEach(w => counts[w] = (counts[w] || 0) + 1);
                next = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
            }

            words.push(next);

            // End on natural punctuation
            if (next.match(/[.!?]$/)) break;
        }

        // Capitalize first letter
        const result = words.join(' ');
        return result.charAt(0).toUpperCase() + result.slice(1) + (result.match(/[.!?]$/) ? '' : '.');
    }

    /**
     * Template-based fallback
     */
    generateTemplate() {
        const templates = [
            () => `Oh ${randomFrom(WORD_BANKS.adjectives)}, we ${randomFrom(WORD_BANKS.verbs)}. ${randomFrom(WORD_BANKS.reactions)}`,
            () => `${randomFrom(WORD_BANKS.sarcasm)}. I'm ${randomFrom(WORD_BANKS.complaints)}.`,
            () => `You really ${randomFrom(WORD_BANKS.verbs)}? ${randomFrom(WORD_BANKS.reactions)}`,
            () => `This is ${randomFrom(WORD_BANKS.adjectives)}. Absolutely ${randomFrom(WORD_BANKS.adjectives)}.`,
        ];

        return randomFrom(templates)();
    }
}

// Utility: Random from array
function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Initialize and train the Markov chain
const markov = new MarkovChain(2);
markov.train(TRAINING_CORPUS);

/**
 * Dialogue Generator - Main API
 */
export class DialogueGenerator {
    constructor() {
        this.markov = markov;
        this.lastTrigger = null;
        this.repeatCount = 0;
    }

    /**
     * Generate context-aware dialogue
     * @param {string} trigger - Event type (from EVENT_TYPES)
     * @param {object} context - Game state context (resources, nodeCount, etc.)
     */
    generate(trigger, context = {}) {
        // Track repetition to add variety
        if (trigger === this.lastTrigger) {
            this.repeatCount++;
        } else {
            this.lastTrigger = trigger;
            this.repeatCount = 0;
        }

        // Special responses for specific triggers
        const special = this.getSpecialResponse(trigger, context);
        if (special && this.repeatCount === 0) return special;

        // Generate via Markov chain
        const generated = this.markov.generate(15, 0.8);

        // Add context-aware prefix/suffix occasionally
        if (Math.random() < 0.3) {
            return this.addContextFlavor(generated, trigger, context);
        }

        return generated;
    }

    /**
     * Special hard-coded responses for key moments
     */
    getSpecialResponse(trigger, context) {
        const specials = {
            INIT: "Oh look, we exist. Gross.",
            FEVER_MODE_START: "Oh great, now we're golden. Literally. This is fine.",
            UPGRADE_UNLOCK: `You spent Lucidity on that? ${randomFrom(['Okay...', 'Sure.', 'Bold choice.', 'Interesting.'])}`,
            ENEMY_SPAWN: "We have guests. I hate guests.",
            CIVILIZATION_CONTACT: "Oh wonderful, neighbors. This won't end badly at all.",
            PLAYER_IDLE: this.repeatCount > 2 ? "Hello? Anyone there? Guess I'll just narrate the void." : null,
        };

        return specials[trigger] || null;
    }

    /**
     * Add context-aware flavor to generated text
     */
    addContextFlavor(text, trigger, context) {
        const { resources = {}, nodeCount = 0, comboMultiplier = 1 } = context;

        // High combo
        if (comboMultiplier > 5) {
            return `Okay okay you're on a streak. ${text}`;
        }

        // Low resources
        if (resources.stardust < 50) {
            return `${text} Also we're broke by the way.`;
        }

        // Many nodes
        if (nodeCount > 20) {
            return `${text} Look at our massive network. So impressive. Yay.`;
        }

        return text;
    }

    /**
     * Generate insult for micro-civilizations
     */
    generateInsult(civName, reason = 'expansion') {
        const insultTemplates = [
            // Expansion Complaints
            () => `"${civName}" here. Your slime mold consumed our sacred spire. Compensate or perish.`,
            () => `Notice of Eviction from ${civName}: Your network just ate my garage. Rude.`,
            () => `${civName} demands tribute. You exist too loudly in our dimension.`,
            () => `Formal complaint from ${civName}: The Flux pollution is giving us migraines.`,
            () => `${civName} says: We know what you're doing. The void remembers. Pay up.`,

            // Flux Denial / Resource Complaints
            () => `${civName} is starving! You hoard the Flux while we wither. Shame!`,
            () => `We asked for a cup of Flux. You gave us silence. ${civName} will remember this.`,
            () => `Greedy giant! ${civName} needs energy to watch reality TV. Share or suffer.`,
            () => `Your refusal to share Flux has been noted in the Galactic Grudge Ledger.`,
            () => `So you choose to keep it all? ${civName} hopes your nodes get tangled.`,

            // Petty Grievances
            () => `${civName} doesn't like your color scheme. Change it or war.`,
            () => `Your vibrations are off-key. ${civName} demands you tune your existence.`,
            () => `We saw you touch that asteroid. It was ours. ${civName} claims dibs.`,
            () => `Stop looking at us. ${civName} values privacy.`,
        ];

        return randomFrom(insultTemplates)();
    }

    /**
     * Generate diplomatic message
     */
    generateDiplomaticMessage(civName, personality = 'DIPLOMATIC') {
        const templates = {
            DIPLOMATIC: [
                `${civName} formally requests relocation assistance. We promise not to bite.`,
                `${civName} proposes mutual cooperation. Benefits include: not destroying you.`,
                `Greetings from ${civName}. We come in peace (mostly). Do you have snacks?`,
                `${civName} admires your efficiency. Can we borrow some entropy?`,
            ],
            AGGRESSIVE: [
                `${civName} demands immediate cessation of expansion or face consequences.`,
                `This is your final warning from ${civName}. Cease and desist. Or else.`,
                `Your nodes look flammable. Just an observation from ${civName}.`,
                `${civName} is charging their lasers. Just in case.`,
            ],
            PARANOID: [
                `${civName} suspects ulterior motives. Explain yourself. Now.`,
                `We're watching you. - ${civName}. Always watching.`,
                `Are you a simulation? ${civName} demands proof of consciousness.`,
                `Stop reading our thoughts! ${civName} wears tinfoil hats for a reason.`,
            ],
            GREEDY: [
                `${civName} offers protection services. 500 Stardust per tick. Non-negotiable.`,
                `${civName} here. Pay tribute or we tell the others about your... activities.`,
                `We found some Flux. It's ours now. Unless you pay double. - ${civName}`,
                `${civName} is running a fundraiser. Donate or get invaded.`,
            ],
            PASSIVE_AGGRESSIVE: [
                `Oh, so you're just going to build there? Okay. ${civName} is fine with it. Totally fine.`,
                `Nice network. Shame if something... happened to it. Love, ${civName}.`,
                `We didn't want that sector anyway. You can have our garbage. - ${civName}`,
                `Did you get our last message? No? Typical.`,
            ]
        };

        const options = templates[personality] || templates.DIPLOMATIC;
        return randomFrom(options);
    }
}

export const dialogueGenerator = new DialogueGenerator();
