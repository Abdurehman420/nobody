/**
 * NEON MYCELIUM - Audio Engine
 * 
 * Synthesized organic sounds with harmonic scales and spatial effects.
 */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.droneOsc = null;
        this.droneGain = null;
        this.isInitialized = false;

        // Pentatonic Scale (C Minor Pentatonic: C, Eb, F, G, Bb)
        this.scale = [261.63, 311.13, 349.23, 392.00, 466.16, 523.25, 622.25, 698.46, 783.99, 932.33];
        this.noteIndex = 0;
    }

    init() {
        if (this.isInitialized) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        // Create Master Compressor/Limiter
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5;
        this.compressor = this.ctx.createDynamicsCompressor();

        // Create Analyser
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;

        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);

        // Create Drone (Deep, evolving pad)
        this.droneOsc = this.ctx.createOscillator();
        this.droneOsc.type = 'sawtooth';
        this.droneOsc.frequency.value = 55; // Low A

        // Drone Filter (Lowpass with LFO modulation)
        this.droneFilter = this.ctx.createBiquadFilter();
        this.droneFilter.type = 'lowpass';
        this.droneFilter.frequency.value = 200;
        this.droneFilter.Q.value = 5;

        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.value = 0.1;

        this.droneOsc.connect(this.droneFilter);
        this.droneFilter.connect(this.droneGain);
        this.droneGain.connect(this.masterGain);

        this.droneOsc.start();
        this.isInitialized = true;
        this.volume = 0.5; // Initialize volume
    }

    setVolume(value) {
        // ROOT CAUSE FIX: This is the rogue audio!
        // audio.js has its own drone that wasn't being muted
        this.volume = Math.max(0, Math.min(1, value));

        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
        }

        // ROOT CAUSE FIX: Mute the drone completely at volume 0
        if (this.droneGain) {
            if (this.volume === 0) {
                this.droneGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
            } else {
                // Normal drone volume
                this.droneGain.gain.setTargetAtTime(0.1 * this.volume, this.ctx.currentTime, 0.1);
            }
        }
    }

    getNote(offset = 0) {
        // Pick a note from the scale, cycling through
        const note = this.scale[(this.noteIndex + offset) % this.scale.length];
        this.noteIndex = (this.noteIndex + 1) % this.scale.length;
        return note;
    }

    playTone(freq, type = 'sine', duration = 0.5, vol = 0.3) {
        if (!this.isInitialized) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);

        // Envelope
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(t + duration);
    }

    playBuild() {
        // "Pluck" sound
        const note = this.getNote();
        this.playTone(note, 'triangle', 0.5, 0.3);
        this.playTone(note * 2, 'sine', 0.5, 0.1); // Octave up harmonic
    }

    playConnect() {
        // "Zap" sound (Slide)
        if (!this.isInitialized) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const note = this.getNote(2); // Offset note

        osc.frequency.setValueAtTime(note, t);
        osc.frequency.exponentialRampToValueAtTime(note * 2, t + 0.2); // Slide up

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(t + 0.3);
    }

    playUpgrade() {
        // "Chord" swell
        const root = this.getNote();
        this.playTone(root, 'sine', 2.0, 0.2);
        setTimeout(() => this.playTone(this.scale[(this.noteIndex + 2) % this.scale.length], 'sine', 2.0, 0.2), 100);
        setTimeout(() => this.playTone(this.scale[(this.noteIndex + 4) % this.scale.length], 'sine', 2.0, 0.2), 200);
    }

    playSquish() {
        // Short percussive noise
        if (!this.isInitialized) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(10, t + 0.1);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(t + 0.1);
    }

    playSound(name) {
        if (!this.isInitialized) return;

        if (name === 'ui_click') {
            this.playTone(800, 'sine', 0.1, 0.1);
        } else if (name === 'cash_register') {
            // Cha-ching!
            this.playTone(1200, 'square', 0.1, 0.1);
            setTimeout(() => this.playTone(1600, 'square', 0.4, 0.1), 100);
        } else if (name === 'notification') {
            // Simple ping
            this.playTone(800, 'sine', 0.1, 0.1);
            setTimeout(() => this.playTone(1200, 'sine', 0.2, 0.1), 50);
        }
    }

    updateDrone(intensity, nodeCount) {
        if (!this.isInitialized) return;

        // Evolve drone
        const targetFreq = 55 + (nodeCount % 5) * 5; // Subtle shift based on nodes
        const targetFilter = 200 + intensity * 500; // Open filter with flux

        this.droneOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 2.0);
        this.droneFilter.frequency.setTargetAtTime(targetFilter, this.ctx.currentTime, 0.5);
        this.droneGain.gain.setTargetAtTime(0.1 + intensity * 0.1, this.ctx.currentTime, 0.5);
    }
}

export const audioManager = new AudioManager();
