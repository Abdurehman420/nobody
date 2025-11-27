import { audioSynthesizer } from '../systems/AudioSynthesizer';

/**
 * NEON MYCELIUM - Emotional Baggage Particle
 * MODULE F Feature #13
 * 
 * A heavy, gray suitcase with sad eyes.
 * Moves at 10% speed, slows other particles, sighs at nodes.
 * Worth 0 Stardust but must be processed to clear clogs.
 * 
 * Connected to Flooble Crank (#26) for repression mechanics.
 */

export class EmotionalBaggage {
    constructor(x, y) {
        this.id = `baggage-${Date.now()}-${Math.random()}`;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.type = 'EMOTIONAL_BAGGAGE';
        this.baseSpeed = 0.1; // 10% of normal
        this.currentSpeed = this.baseSpeed;
        this.value = 0;
        this.isRepressed = false;
        this.lastSigh = 0;
        this.sighInterval = 3000; // Sigh every 3 seconds
        this.color = '#888888';
        this.size = 4;
        this.sprite = '🧳😢';
    }

    update(deltaTime, repressionActive, masterVolume = 0.5) {
        this.isRepressed = repressionActive;

        if (this.isRepressed) {
            // Repressed: Neon pink, 200% speed, no sighing
            this.currentSpeed = 2.0;
            this.color = '#FF00FF';
        } else {
            // Normal: Gray, slow, sighs
            this.currentSpeed = this.baseSpeed;
            this.color = '#888888';

            // Sigh at intervals
            const now = Date.now();
            if (now - this.lastSigh >= this.sighInterval) {
                this.sigh(masterVolume);
                this.lastSigh = now;
            }
        }

        // Update position
        this.x += this.vx * this.currentSpeed;
        this.y += this.vy * this.currentSpeed;
    }

    sigh(masterVolume) {
        // Play sigh sound using AudioSynthesizer
        // Descending tone: 200Hz -> 100Hz
        // We can simulate this with playTone or add a specific method.
        // For now, let's use playTone with a short duration.
        // Or better, add playSigh to AudioSynthesizer if we want the pitch ramp.
        // But playTone doesn't support pitch ramp.
        // Let's just play a low tone for now.
        if (audioSynthesizer.isInitialized) {
            audioSynthesizer.playTone(150, 'sine', 0.5, 0.1 * masterVolume);
        }
    }

    // Slows down particles behind it
    affectsOtherParticles() {
        return !this.isRepressed;
    }
}

// Spawner utility
export function spawnEmotionalBaggage(x, y) {
    return new EmotionalBaggage(x, y);
}

// Static update function for plain objects (Persistence compatibility)
export function updateEmotionalBaggage(baggage, deltaTime, repressionActive, masterVolume = 0.5) {
    baggage.isRepressed = repressionActive;

    if (baggage.isRepressed) {
        // Repressed: Neon pink, 200% speed, no sighing
        baggage.currentSpeed = 2.0;
        baggage.color = '#FF00FF';
    } else {
        // Normal: Gray, slow, sighs
        baggage.currentSpeed = baggage.baseSpeed || 0.1;
        baggage.color = '#888888';

        // Sigh at intervals
        const now = Date.now();
        if (now - (baggage.lastSigh || 0) >= (baggage.sighInterval || 3000)) {
            playSigh(masterVolume);
            baggage.lastSigh = now;
        }
    }

    // Update position
    baggage.x += (baggage.vx || 0) * baggage.currentSpeed;
    baggage.y += (baggage.vy || 0) * baggage.currentSpeed;

    return baggage;
}

function playSigh(masterVolume) {
    if (audioSynthesizer.isInitialized) {
        audioSynthesizer.playTone(150, 'sine', 0.5, 0.1 * masterVolume);
    }
}
