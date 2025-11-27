/**
 * NEON MYCELIUM - Fever Mode System
 * 
 * "Golden Trip" - Special game state when flux is maxed out.
 */

import { eventBus, EVENT_TYPES } from './EventBus';

class FeverMode {
    constructor() {
        this.isActive = false;
        this.activationTime = 0;
        this.fluxMaxDuration = 0; // How long flux has been at max
        this.ACTIVATION_THRESHOLD = 60000; // 60 seconds at max
    }

    /**
     * Update (called each tick)
     */
    update(gameState, deltaTime) {
        const { flux, maxFlux } = gameState.resources;
        const isAtMax = flux >= (maxFlux || 1000);

        if (isAtMax) {
            this.fluxMaxDuration += deltaTime;

            if (!this.isActive && this.fluxMaxDuration >= this.ACTIVATION_THRESHOLD) {
                this.activate();
            }
        } else {
            if (this.isActive) {
                this.deactivate();
            }
            this.fluxMaxDuration = 0;
        }
    }

    /**
     * Activate Fever Mode
     */
    activate() {
        this.isActive = true;
        this.activationTime = Date.now();

        // Override CSS variables for golden theme
        document.documentElement.style.setProperty('--color-portal-green', '#FFD700');
        document.documentElement.style.setProperty('--color-neon-green', '#FFD700');
        document.documentElement.style.setProperty('--fever-mode-active', '1');

        // Emit event
        eventBus.emit(EVENT_TYPES.FEVER_MODE_START, {
            timestamp: this.activationTime
        });

        console.log('🌟 FEVER MODE ACTIVATED! Golden Trip begins...');
    }

    /**
     * Deactivate Fever Mode
     */
    deactivate() {
        this.isActive = false;

        // Restore original colors
        document.documentElement.style.setProperty('--color-portal-green', '#32CD32');
        document.documentElement.style.setProperty('--color-neon-green', '#32CD32');
        document.documentElement.style.setProperty('--fever-mode-active', '0');

        // Emit event
        eventBus.emit(EVENT_TYPES.FEVER_MODE_END, {
            duration: Date.now() - this.activationTime
        });

        console.log('✨ Fever Mode ended');
    }

    /**
     * Get game rule modifiers
     */
    getModifiers() {
        if (!this.isActive) {
            return {
                buildCost: 1.0,
                flowSpeed: 1.0,
            };
        }

        return {
            buildCost: 0.0,       // Free building!
            flowSpeed: 2.0,       // Double flow (not infinite, for balance)
        };
    }

    /**
     * Should spawn confetti particle?
     */
    shouldSpawnConfetti() {
        return this.isActive && Math.random() < 0.3; // 30% chance per tick
    }

    /**
     * Generate confetti particle data
     */
    createConfettiParticle(x, y) {
        const colors = ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#00FFFF', '#00FF00'];

        return {
            x,
            y,
            vx: (Math.random() - 0.5) * 5,
            vy: -Math.random() * 5 - 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 4 + 2,
            life: 1.0,
            decay: 0.02,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
        };
    }
}

export const feverMode = new FeverMode();
