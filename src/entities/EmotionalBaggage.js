import { audioManager } from '../engine/audio';

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
        // Play sigh sound
        try {
            if (!audioManager.ctx) return;

            // Simple sigh sound (descending tone)
            const audioContext = audioManager.ctx;
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();

            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);

            // ROOT CAUSE FIX: Scale volume by masterVolume
            const vol = 0.1 * masterVolume;
            gain.gain.setValueAtTime(vol, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.connect(gain);
            gain.connect(audioManager.masterGain); // Connect to master gain

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Sigh sound failed:', e);
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
