import * as Tone from 'tone';
import useGameStore from '../store/gameStore';

class AudioSystem {
    constructor() {
        this.oscillators = new Map(); // edgeId -> Oscillator
        this.initialized = false;
        this.reverb = null;
    }

    async init() {
        if (this.initialized) return;
        await Tone.start();

        // Setup Master Effects
        this.reverb = new Tone.Reverb(3).toDestination();
        this.reverb.wet.value = 0.5;

        this.initialized = true;
        console.log("Audio System Initialized");
    }

    update() {
        if (!this.initialized) return;

        const edges = useGameStore.getState().edges;

        // Clean up removed edges
        // (Not implemented for MVP as we only add edges)

        edges.forEach(edge => {
            let osc = this.oscillators.get(edge.id);

            // Create oscillator if needed
            if (!osc) {
                // Use a different frequency based on edge length or ID
                const freq = 200 + (parseInt(edge.id.slice(0, 4), 16) % 400);
                osc = new Tone.Oscillator(freq, "sine").connect(this.reverb);
                osc.volume.value = -Infinity; // Start silent
                osc.start();
                this.oscillators.set(edge.id, osc);
            }

            // Update volume based on flow
            const flow = Math.abs(edge.flow);

            // Threshold for sound
            if (flow < 0.01) {
                osc.volume.rampTo(-Infinity, 0.1);
            } else {
                // Map flow to volume: 0.01 -> -40dB, 1.0 -> -10dB
                const targetVol = -40 + (Math.min(flow, 1.0) * 30);
                osc.volume.rampTo(targetVol, 0.1);

                // Modulate frequency slightly with pressure?
                // osc.frequency.rampTo(baseFreq + flow * 100, 0.1);
            }
        });
    }
}

export const audioSystem = new AudioSystem();
