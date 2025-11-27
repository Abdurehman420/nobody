import * as Tone from 'tone';
import useGameStore from '../store/gameStore';

class AudioSystem {
    constructor() {
        this.oscillators = new Map(); // edgeId -> Oscillator
        this.initialized = false;
        this.reverb = null;
    }

    async init() {
        console.log("🔇 Legacy AudioSystem disabled. Using AudioSynthesizer v3.0 instead.");
        this.initialized = true;
    }

    update() {
        // No-op
    }
}

export const audioSystem = new AudioSystem();
