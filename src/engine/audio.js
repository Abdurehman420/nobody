/**
 * NEON MYCELIUM - Audio Engine
 * 
 * Synthesized organic sounds with harmonic scales and spatial effects.
 */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.isInitialized = false;
        this.analyser = null; // Keep null to prevent crashes, but Visualizer will need update
    }

    init() {
        console.log("🔇 Legacy AudioManager disabled. Using AudioSynthesizer v3.0 instead.");
        this.isInitialized = true;
    }

    setVolume(value) {
        // No-op
    }

    getNote(offset = 0) {
        return 440;
    }

    playTone(freq, type = 'sine', duration = 0.5, vol = 0.3) {
        // No-op
    }

    playBuild() { }
    playConnect() { }
    playUpgrade() { }
    playSquish() { }
    playSound(name) { }
    updateDrone(intensity, nodeCount) { }
}

export const audioManager = new AudioManager();
