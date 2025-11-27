/**
 * NEON MYCELIUM - Enhanced Audio Synthesizer
 * 
 * Psychedelic, harmonious audio synthesis with spatial effects.
 * Extends the existing audio.js system with richer soundscapes.
 */

import { eventBus, EVENT_TYPES } from './EventBus';

class AudioSynthesizer {
    constructor() {
        this.ctx = null;
        this.isInitialized = false;

        // Master chain
        this.masterGain = null;
        this.compressor = null;
        this.masterReverb = null;
        this.connectionSoundsEnabled = true; // Default to enabled
        this.masterDelay = null;

        // Drone (continuous background)
        this.droneOsc = null;
        this.droneFilter = null;
        this.droneGain = null;

        // Scales (Retuned to A=432Hz Solfeggio Standard)
        // C4=256.87, Eb4=305.47, F4=342.88, G4=384.87, Bb4=457.68
        this.pentatonicScale = [256.87, 305.47, 342.88, 384.87, 457.68, 513.74, 610.94, 685.76, 769.74, 915.36];
        this.noteIndex = 0;

        // Chord types (intervals in semitones from root)
        this.chordTypes = {
            MAJOR: [0, 4, 7],
            MINOR: [0, 3, 7],
            SEVENTH: [0, 4, 7, 10],
            SUS4: [0, 5, 7],
        };
    }

    async init() {
        if (this.isInitialized) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        // Master Gain
        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;

        // --- CORE DSP UPGRADES (v3.0) ---

        // 1. Warmth Filter (Tube Saturation) - REDUCED INTENSITY
        // Adds even-order harmonics for analog feel
        this.warmthFilter = this.ctx.createWaveShaper();
        this.warmthFilter.curve = this.makeDistortionCurve(20); // Reduced from 400 to 20 for subtle warmth
        this.warmthFilter.oversample = '4x';

        // 2. Pink Noise Bed (-60dB "Acoustic Blanket")
        // Fills silence with warm texture
        this.pinkNoiseNode = this.createPinkNoise(0.0005); // Reduced from 0.001
        this.pinkNoiseNode.connect(this.masterGain);

        // Compressor
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -24;
        this.compressor.knee.value = 30;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.25;

        // Master Reverb (long, psychedelic)
        this.masterReverb = this.ctx.createConvolver();
        await this.createReverbImpulse(3.0); // Reduced from 5.0s to 3.0s for clarity

        this.reverbGain = this.ctx.createGain();
        this.reverbGain.gain.value = 0.3; // Reduced wet mix

        // Master Delay
        this.masterDelay = this.createDelayFX(0.375, 0.3, 0.3);

        // Chain: masterGain -> warmth -> compressor -> destination
        //       warmth -> delay -> reverb -> compressor

        // Global Low-Pass Filter ("Dump" Sound)
        this.globalLowPass = this.ctx.createBiquadFilter();
        this.globalLowPass.type = 'lowpass';
        this.globalLowPass.frequency.value = 800; // Cut everything above 800Hz for that "dump" sound
        this.globalLowPass.Q.value = 0.5; // Soft roll-off

        this.compressor.connect(this.ctx.destination);

        // Chain: masterGain -> warmth -> globalLowPass -> compressor -> destination
        //       warmth -> delay -> reverb -> globalLowPass

        this.masterGain.connect(this.warmthFilter);

        // Dry path (Warmed)
        this.warmthFilter.connect(this.globalLowPass);

        // Wet path (Effects)
        this.warmthFilter.connect(this.masterDelay.input);
        this.masterDelay.output.connect(this.reverbGain);
        this.reverbGain.connect(this.masterReverb);
        this.masterReverb.connect(this.globalLowPass);

        this.globalLowPass.connect(this.compressor);

        // Create evolving drone
        this.createDrone();

        this.isInitialized = true;
        console.log('🎵 Sonic Mycelium Engine v3.0 initialized (432Hz | Tube Saturation)');

        // Listen to EventBus
        this.setupEventListeners();
    }

    /**
     * Create soft clipping distortion curve for tube warmth
     */
    makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = i * 2 / n_samples - 1;
            // Sigmoid function for soft clipping
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    /**
     * Create Pink Noise Generator (Buffer Source)
     * Replaces ScriptProcessor for better stability
     */
    createPinkNoise(volume = 0.001) {
        if (!this.ctx) return null;

        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);

        // Pink noise generation
        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11; // (roughly) compensate for gain
            b6 = white * 0.115926;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const gain = this.ctx.createGain();
        gain.gain.value = volume;

        noise.connect(gain);
        noise.start(0);

        return gain;
    }

    /**
     * Set master volume (controlled by Settings slider)
     * This affects ALL sounds including drone and arpeggios
     * ROOT CAUSE FIX: Stop oscillators at volume 0, restart when volume > 0
     */
    setMasterVolume(volume) {
        const clampedVolume = Math.max(0, Math.min(1, volume));

        if (this.masterGain) {
            this.masterGain.gain.value = clampedVolume;
        }

        // Handle drone - stop at volume 0, restart when volume > 0
        if (this.droneGain) {
            if (clampedVolume === 0) {
                // Mute drone completely
                this.droneGain.gain.value = 0;
                // Stop arpeggio interval
                if (this.arpeggioInterval) {
                    clearInterval(this.arpeggioInterval);
                    this.arpeggioInterval = null;
                }
                // Mute pink noise
                if (this.pinkNoiseNode) {
                    this.pinkNoiseNode.gain.value = 0;
                }
            } else {
                // Set drone volume
                this.droneGain.gain.value = 0.08 * clampedVolume;
                // Restore pink noise
                if (this.pinkNoiseNode) {
                    this.pinkNoiseNode.gain.value = 0.001;
                }
                // Restart arpeggio if it was stopped
                if (!this.arpeggioInterval && this.ctx && this.isInitialized) {
                    this.startArpeggio();
                }
            }
        }
    }

    /**
     * Start ambient arpeggio sequence
     */
    startArpeggio() {
        // Clear existing interval if any
        if (this.arpeggioInterval) {
            clearInterval(this.arpeggioInterval);
        }

        // Ambient arpeggio (plays pentatonic notes occasionally)
        this.arpeggioInterval = setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance per 2 seconds
                const note = this.getNote();
                this.playChord(note, 'MINOR', 1.5);

                // Randomize timing slightly
                setTimeout(() => {
                    const note2 = this.getNote(2);
                    this.playChord(note2, 'SUS4', 1.0);
                }, 500 + Math.random() * 500);
            }
        }, 2000);
    }

    /**
     * Create reverb impulse response
     */
    async createReverbImpulse(duration) {
        const sampleRate = this.ctx.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.ctx.createBuffer(2, length, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                // Exponential decay with noise
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
            }
        }

        this.masterReverb.buffer = impulse;
    }

    /**
     * Create delay effect
     */
    createDelayFX(time = 0.375, feedback = 0.3, wetness = 0.3) {
        const delay = this.ctx.createDelay(5.0);
        delay.delayTime.value = time;

        const feedbackGain = this.ctx.createGain();
        feedbackGain.gain.value = feedback;

        const wetGain = this.ctx.createGain();
        wetGain.gain.value = wetness;

        const dryGain = this.ctx.createGain();
        dryGain.gain.value = 1.0 - wetness;

        // Create input/output nodes
        const input = this.ctx.createGain();
        const output = this.ctx.createGain();

        // Routing
        input.connect(dryGain);
        dryGain.connect(output);

        input.connect(delay);
        delay.connect(wetGain);
        delay.connect(feedbackGain);
        feedbackGain.connect(delay);
        wetGain.connect(output);

        return { input, output, delay, feedbackGain, wetGain };
    }

    /**
     * Resume AudioContext on user interaction
     */
    async resumeContext() {
        if (this.ctx && this.ctx.state === 'suspended') {
            await this.ctx.resume();
            console.log('🎵 AudioContext resumed');

            // Restart drone if it should be playing
            if (this.masterGain && this.masterGain.gain.value > 0 && !this.droneIsPlaying) {
                this.createDrone();
            }
        }
    }

    /**
     * Create evolving drone pad
     */
    createDrone() {
        // If drone already exists and is playing, stop it first to recreate
        if (this.droneOsc && this.droneIsPlaying) {
            try {
                this.droneOsc.stop();
                this.droneOsc.disconnect();
                this.droneFilter.disconnect();
                this.droneGain.disconnect();
            } catch (e) {
                // Ignore stop errors
            }
        }

        // CLEAR THE INTERVAL TO PREVENT MEMORY LEAKS
        if (this.droneInterval) {
            clearInterval(this.droneInterval);
            this.droneInterval = null;
        }

        this.droneOsc = this.ctx.createOscillator();
        this.droneOsc.type = 'sawtooth';
        this.droneOsc.frequency.value = 60;

        // Filter
        this.droneFilter = this.ctx.createBiquadFilter();
        this.droneFilter.type = 'lowpass';
        this.droneFilter.frequency.value = 300;
        this.droneFilter.Q.value = 10;

        this.droneGain = this.ctx.createGain();
        // Start at 0 if master volume is 0, otherwise use master volume
        this.droneGain.gain.value = this.masterGain ? (0.08 * this.masterGain.gain.value) : 0;

        this.droneOsc.connect(this.droneFilter);
        this.droneFilter.connect(this.droneGain);
        this.droneGain.connect(this.masterGain);

        // Start drone - suppress autoplay warning (it will resume on user gesture)
        this.droneIsPlaying = false;

        // Only start if context is running, otherwise wait for resumeContext
        if (this.ctx.state === 'running' && this.masterGain && this.masterGain.gain.value > 0) {
            try {
                this.droneOsc.start();
                this.droneIsPlaying = true;
            } catch (e) {
                console.warn('Audio start failed:', e);
            }
        }

        // Slowly evolve filter cutoff
        this.droneInterval = setInterval(() => {
            if (this.droneFilter && this.ctx && this.droneIsPlaying) {
                const now = this.ctx.currentTime;
                const targetFreq = 300 + Math.sin(now * 0.1) * 200; // Oscillate between 100 and 500
                this.droneFilter.frequency.setTargetAtTime(targetFreq, now, 5);
            }
        }, 1000);
    }

    /**
     * Get next note from pentatonic scale
     */
    getNote(offset = 0) {
        const note = this.pentatonicScale[(this.noteIndex + offset) % this.pentatonicScale.length];
        this.noteIndex = (this.noteIndex + 1) % this.pentatonicScale.length;
        return note;
    }

    /**
     * Play a single tone
     */
    playTone(freq, type = 'sine', duration = 0.5, vol = 0.2) {
        if (!this.isInitialized) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);

        // ADSR envelope
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.05); // Attack
        gain.gain.linearRampToValueAtTime(vol * 0.7, t + 0.1); // Decay
        gain.gain.setValueAtTime(vol * 0.7, t + duration - 0.1); // Sustain
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration); // Release

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + duration);
    }

    /**
     * Play chord with harmonic overtones
     */
    playChord(rootFreq, chordType = 'MAJOR', duration = 2.0, vol = 0.15) {
        if (!this.isInitialized) return;

        const intervals = this.chordTypes[chordType] || this.chordTypes.MAJOR;

        intervals.forEach((semitones, i) => {
            const freq = rootFreq * Math.pow(2, semitones / 12);

            // Layer with harmonic overtones (1x, 2x, 3x)
            this.playTone(freq, 'sine', duration, vol);
            this.playTone(freq * 2, 'sine', duration, vol * 0.3); // Octave
            this.playTone(freq * 3, 'sine', duration, vol * 0.15); // Fifth above octave
        });
    }

    /**
     * Create lush detuned pad
     */
    createPad(freq, detuneAmount = 10, voices = 5, duration = 3.0) {
        if (!this.isInitialized) return;

        const t = this.ctx.currentTime;

        for (let i = 0; i < voices; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);

            // Detune each voice slightly
            const detune = (Math.random() - 0.5) * detuneAmount * 2;
            osc.detune.setValueAtTime(detune, t);

            // Soft envelope
            const vol = 0.08 / voices;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(vol, t + 0.3);
            gain.gain.setValueAtTime(vol, t + duration - 0.5);
            gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(t);
            osc.stop(t + duration);
        }
    }

    /**
     * Play arpeggio pattern
     */
    playArpeggio(freqs, bpm, direction = 'UP', bars = 2) {
        const beatDuration = (60 / bpm) * 1000; // ms per beat
        const totalBeats = freqs.length * bars;

        // Clear any existing arpeggio
        this.stopArpeggio();

        let beatIndex = 0;
        this.arpeggioInterval = setInterval(() => {
            const noteIndex = direction === 'UP'
                ? beatIndex % freqs.length
                : (freqs.length - 1) - (beatIndex % freqs.length);

            this.playTone(freqs[noteIndex], 'sine', beatDuration / 1000, 0.08);
            beatIndex++;

            if (beatIndex >= totalBeats) {
                beatIndex = 0; // Loop
            }
        }, beatDuration);
    }

    /**
     * Stop arpeggio playback
     */
    stopArpeggio() {
        if (this.arpeggioInterval) {
            clearInterval(this.arpeggioInterval);
            this.arpeggioInterval = null;
        }
    }

    /**
     * Spatial audio - position sound in 3D space
     */
    spatialPlay(x, y, freq, type = 'sine', duration = 0.5, vol = 0.2) {
        if (!this.isInitialized) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const panner = this.ctx.createPanner();

        // Panner config
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1;
        panner.maxDistance = 1000;
        panner.rolloffFactor = 1;

        // Position (normalize to listener space)
        panner.setPosition(x / 100, y / 100, -1);

        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + duration);
    }

    /**
     * Update drone based on game state
     */
    updateDrone(intensity, nodeCount) {
        if (!this.isInitialized) return;

        const targetFreq = 55 + (nodeCount % 5) * 5;
        const targetFilter = 200 + intensity * 800; // More dramatic

        this.droneOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 2.0);
        this.droneFilter.frequency.setTargetAtTime(targetFilter, this.ctx.currentTime, 0.5);
        this.droneGain.gain.setTargetAtTime(0.08 + intensity * 0.08, this.ctx.currentTime, 0.5);
    }

    /**
     * Setup EventBus listeners
     */
    setupEventListeners() {
        eventBus.on(EVENT_TYPES.NODE_CONNECTED, (data) => {
            const note = this.getNote();
            // Lower pitch, warmer sound (sine)
            this.playChord(note / 2, 'MAJOR', 1.5, 0.12);
        });

        eventBus.on(EVENT_TYPES.PLAYER_IDLE, () => {
            // Start a pleasant jazz arpeggio for idle listening
            // Transposed down one octave
            const jazzScale = [130.81, 164.81, 196.00, 246.94, 261.63]; // C3-E3-G3-B3-C4
            this.playArpeggio(jazzScale, 80, 'UP', 4);
            console.log('🎵 Jazz mode activated for idle listening');
        });

        eventBus.on(EVENT_TYPES.NODE_BUILT, (data) => {
            const note = this.getNote(2);
            // Lower pitch, softer wave
            this.playTone(note / 2, 'sine', 0.3, 0.08);
            this.playTone(note, 'sine', 0.3, 0.03);
        });

        eventBus.on(EVENT_TYPES.UPGRADE_UNLOCK, () => {
            // Slower, lower arpeggio
            this.playArpeggio(this.pentatonicScale.map(n => n / 2), 180, 'UP', 0.5);
            this.createPad(this.getNote() / 2, 15, 6, 3.0);
        });

        eventBus.on(EVENT_TYPES.FEVER_MODE_START, () => {
            // Epic swell - lower pitch
            this.playArpeggio(this.pentatonicScale.map(n => n / 2), 240, 'RANDOM', 2);
            this.createPad(130.81, 20, 8, 5.0); // C3
        });

        eventBus.on(EVENT_TYPES.COMBO_INCREMENT, (data) => {
            const note = this.pentatonicScale[data.combo % this.pentatonicScale.length];
            // Switch from square (harsh) to triangle (softer) and lower pitch
            this.playTone(note / 2, 'triangle', 0.2, 0.3);
        });

        eventBus.on(EVENT_TYPES.CIVILIZATION_CONTACT, () => {
            // Mysterious, paranoid chord
            this.playChord(this.getNote(-2), 'SUS4', 2.0, 0.1);
        });

        // Gary's DJ Persona: Auto-Ducking
        eventBus.on(EVENT_TYPES.BOT_GRUMBLE, () => {
            this.duckAudio();
        });
    }

    /**
     * Auto-Ducking: Lowers volume when Gary speaks
     */
    duckAudio() {
        if (!this.masterGain) return;

        const t = this.ctx.currentTime;
        // Duck down to 30% volume
        this.masterGain.gain.cancelScheduledValues(t);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, t);
        this.masterGain.gain.linearRampToValueAtTime(0.1, t + 0.1);

        // Restore after 3 seconds (approx reading time)
        this.masterGain.gain.linearRampToValueAtTime(0.3, t + 3.0);
    }
    setConnectionSoundsEnabled(enabled) {
        this.connectionSoundsEnabled = enabled;
        // If disabled, silence existing flows
        if (!enabled && this.flowNodes) {
            this.flowNodes.forEach(node => {
                try {
                    node.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
                } catch (e) { }
            });
        }
    }

    /**
     * ASMR: Hydro-Acoustic Flow Modeling
     * Replaces "buzz" with filtered noise (trickle vs river)
     */
    playHydroFlow(intensity, edgeId) {
        if (!this.isInitialized) return;
        if (this.connectionSoundsEnabled === false) return; // Respect setting (default true if undefined)

        // Initialize flowNodes map if needed
        if (!this.flowNodes) {
            this.flowNodes = new Map();
        }

        let node = this.flowNodes.get(edgeId);
        const t = this.ctx.currentTime;

        if (!node) {
            // Create new flow voice using BufferSource (Efficient)
            const bufferSize = this.ctx.sampleRate * 2;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            let lastOut = 0;

            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                data[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            noise.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';

            const gain = this.ctx.createGain();
            gain.gain.value = 0;

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            noise.start(0);

            node = { noise, filter, gain, lastIntensity: 0 };
            this.flowNodes.set(edgeId, node);
        }

        // Update parameters based on intensity (0.0 to 1.0)
        const targetFreq = 200 + (intensity * 800); // 200Hz to 1000Hz
        const targetVol = intensity * 0.15; // Max 0.15 volume

        node.filter.frequency.setTargetAtTime(targetFreq, t, 0.1);
        node.gain.gain.setTargetAtTime(targetVol, t, 0.1);

        // Cleanup if intensity is near zero for a while?
        // For now, we rely on the caller to manage edge lifecycles, 
        // but we should probably have a cleanup method.
    }

    /**
     * Cleanup flow nodes for removed edges
     */
    removeHydroFlow(edgeId) {
        if (this.flowNodes && this.flowNodes.has(edgeId)) {
            const node = this.flowNodes.get(edgeId);
            try {
                node.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
                setTimeout(() => {
                    node.noise.stop();
                    node.noise.disconnect();
                    node.filter.disconnect();
                    node.gain.disconnect();
                }, 200);
            } catch (e) {
                // Ignore
            }
            this.flowNodes.delete(edgeId);
        }
    }

    /**
     * ASMR: Mechanical Switch Click
     * High-quality tactile feedback
     */
    playMechanicalClick() {
        if (!this.isInitialized) return;
        const t = this.ctx.currentTime;

        // 1. The "Click" (High freq transient)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(2000, t);
        osc.frequency.exponentialRampToValueAtTime(1000, t + 0.05);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.05);
        osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
        };

        // 2. The "Thud" (Low freq body)
        const thud = this.ctx.createOscillator();
        const thudGain = this.ctx.createGain();

        thud.frequency.setValueAtTime(150, t);
        thud.frequency.exponentialRampToValueAtTime(50, t + 0.1);

        thudGain.gain.setValueAtTime(0.2, t);
        thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        thud.connect(thudGain);
        thudGain.connect(this.masterGain);
        thud.start(t);
        thud.stop(t + 0.1);
        thud.onended = () => {
            thud.disconnect();
            thudGain.disconnect();
        };
    }

    /**
     * ASMR: Fabric Rustle / Intake of Breath
     * For hover effects
     */
    playFabricRustle() {
        if (!this.isInitialized) return;
        const t = this.ctx.currentTime;

        // Filtered white noise
        const bufferSize = this.ctx.sampleRate * 0.1; // 100ms
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 1;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 0.02);
        gain.gain.linearRampToValueAtTime(0, t + 0.1);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(t);
    }
    /**
     * VOID-FI RADIO: Play station with procedural effects
     * Chain: Oscillator -> Bandpass -> Delay (Wow/Flutter) -> Gain
     */
    playRadioStation(stationConfig, volume) {
        if (!this.isInitialized) return null;
        const t = this.ctx.currentTime;

        // 1. Source (Oscillator for now, could be buffer)
        const osc = this.ctx.createOscillator();
        osc.type = stationConfig.type;
        osc.frequency.value = stationConfig.freq;
        osc.detune.value = stationConfig.detune;

        // 2. Bandpass Filter (Telephone Effect)
        // Restricts audio to 400Hz-3kHz
        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 1000;
        bandpass.Q.value = 1.0;

        // 3. Wow & Flutter (Tape wobble)
        // Modulated delay line
        const delay = this.ctx.createDelay(1.0);
        delay.delayTime.value = 0.05;

        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.5 + Math.random() * 2; // 0.5 - 2.5Hz wobble

        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 0.002; // Depth of wobble

        lfo.connect(lfoGain);
        lfoGain.connect(delay.delayTime);
        lfo.start(t);

        // 4. Gain (Volume)
        const gain = this.ctx.createGain();
        gain.gain.value = volume * 0.3; // Keep radio quieter

        // Routing
        osc.connect(bandpass);
        bandpass.connect(delay);
        delay.connect(gain);
        // ROOT CAUSE FIX: Connect to compressor to bypass Master Volume but keep dynamics
        gain.connect(this.compressor);

        osc.start(t);

        // Return nodes for control/cleanup
        return {
            osc,
            lfo,
            gain,
            stop: () => {
                const now = this.ctx.currentTime;
                osc.stop(now);
                lfo.stop(now);
                // Disconnect after short fade out?
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                setTimeout(() => {
                    osc.disconnect();
                    bandpass.disconnect();
                    delay.disconnect();
                    gain.disconnect();
                    lfo.disconnect();
                    lfoGain.disconnect();
                }, 200);
            },
            setVolume: (v) => {
                gain.gain.setTargetAtTime(v * 0.3, this.ctx.currentTime, 0.1);
            }
        };
    }
    /**
     * PSYCHOACOUSTIC: Orbiting Sound (Binaural Panning)
     * sound orbits the listener's head
     */
    playOrbitingSound(freq, duration = 3.0) {
        if (!this.isInitialized) return;
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const panner = this.ctx.createPanner();
        const gain = this.ctx.createGain();

        // HRTF for realistic 3D audio
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';

        osc.frequency.value = freq;
        osc.type = 'sine';

        // Envelope
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.5);
        gain.gain.linearRampToValueAtTime(0.2, t + duration - 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + duration);

        // Animate orbit
        const startTime = t;
        const radius = 2;
        const speed = 2; // Radians per second

        const interval = setInterval(() => {
            const now = this.ctx.currentTime;
            if (now > t + duration) {
                clearInterval(interval);
                return;
            }
            const elapsed = now - startTime;
            const angle = elapsed * speed;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius; // Z is depth (front/back)

            // Set position
            panner.setPosition(x, 0, z);
        }, 50); // 20fps update for audio positioning is usually fine
    }

    /**
     * FEATURE: Harmonic Choir (Screaming Sun)
     * Time-stretched, autotuned major chord
     */
    playHarmonicChoir() {
        if (!this.isInitialized) return;
        // A Major Chord (A2, C#3, E3) - Transposed down one octave
        const freqs = [110, 138.59, 164.81, 220];

        freqs.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle'; // Changed from sawtooth to triangle for softer sound
            osc.frequency.value = f;

            // Slow attack/release (Choir-like)
            const t = this.ctx.currentTime;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.05, t + 2.0); // Slow swell
            gain.gain.linearRampToValueAtTime(0.05, t + 4.0); // Sustain
            gain.gain.exponentialRampToValueAtTime(0.001, t + 8.0); // Long release

            // Lowpass filter to remove harshness (make it "Ooh" sound)
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400; // Lowered from 800 for "dump" sound

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterReverb); // Send to reverb for "Cathedral" sound
            this.masterReverb.connect(this.masterGain);

            osc.start(t);
            osc.stop(t + 8.0);
        });
    }

    /**
     * FEATURE: Underwater Filter (Wet Floor Zone)
     * Low-pass filter everything
     */
    setUnderwaterMode(enabled) {
        if (!this.isInitialized || !this.warmthFilter) return;

        // We can insert a filter after the warmth filter?
        // Or just modify the drone filter?
        // Let's modify the master drone filter for now as a proxy, 
        // or better, create a master filter node if we had one.
        // Since we don't have a dedicated master filter, let's use the drone filter
        // to simulate the environment change.

        if (this.droneFilter) {
            const t = this.ctx.currentTime;
            if (enabled) {
                this.droneFilter.frequency.setTargetAtTime(200, t, 0.5); // Muffled
                this.droneFilter.Q.setTargetAtTime(1, t, 0.5);
            } else {
                this.droneFilter.frequency.setTargetAtTime(300, t, 0.5); // Normal
                this.droneFilter.Q.setTargetAtTime(10, t, 0.5);
            }
        }
    }

    /**
     * FEATURE: Granular Piano (Spaghetti Code)
     * Randomized pentatonic sine/triangle waves
     */
    playGranularPiano() {
        if (!this.isInitialized) return;
        const note = this.getNote();
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Warmer waves, lower pitch
        osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
        // Changed from * 2 or * 4 to * 0.5 or * 1 (Lower octaves)
        osc.frequency.value = note * (Math.random() > 0.5 ? 0.5 : 1.0);

        // Short, pluck-like envelope
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

        osc.connect(gain);
        gain.connect(this.masterDelay.input); // Send to delay for "cloud" effect

        osc.start(t);
        osc.stop(t + 0.5);
    }

    /**
     * FEATURE: Tape Stop (Lag Generator)
     * Simulates power down
     */
    playTapeStop() {
        if (!this.isInitialized || !this.droneOsc) return;
        const t = this.ctx.currentTime;

        // Pitch drop on drone
        this.droneOsc.frequency.cancelScheduledValues(t);
        this.droneOsc.frequency.setValueAtTime(this.droneOsc.frequency.value, t);
        this.droneOsc.frequency.exponentialRampToValueAtTime(10, t + 2.0); // Drop to 10Hz

        // Volume drop
        this.droneGain.gain.cancelScheduledValues(t);
        this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, t);
        this.droneGain.gain.linearRampToValueAtTime(0, t + 2.0);

        // Restore after effect?
        setTimeout(() => {
            this.createDrone(); // Reset drone
        }, 2500);
    }

    /**
     * FEATURE: Whisper Network (Philosopher's Stone)
     * 3 voices panned L/C/R
     */
    playWhisperNetwork() {
        if (!this.isInitialized) return;

        // Simulated whispers using filtered noise bursts
        [-1, 0, 1].forEach((pan, i) => {
            setTimeout(() => {
                const t = this.ctx.currentTime;
                const noise = this.createPinkNoise(0.05);
                const panner = this.ctx.createPanner();
                panner.setPosition(pan, 0, -1);

                const filter = this.ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 1000 + Math.random() * 500;
                filter.Q.value = 2;

                noise.connect(filter);
                filter.connect(panner);
                panner.connect(this.masterGain);

                // Envelope
                // Access the gain node inside the pink noise generator?
                // createPinkNoise returns a GainNode.
                noise.gain.setValueAtTime(0, t);
                noise.gain.linearRampToValueAtTime(0.05, t + 0.1);
                noise.gain.linearRampToValueAtTime(0, t + 0.3);

                // Cleanup
                setTimeout(() => {
                    noise.disconnect();
                    filter.disconnect();
                    panner.disconnect();
                }, 500);
            }, i * 150); // Staggered
        });
    }
}

export const audioSynthesizer = new AudioSynthesizer();
