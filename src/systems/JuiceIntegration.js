/**
 * NEON MYCELIUM - Juice Integration
 * 
 * Centralizes all "Juice & Charisma" system integrations for the game loop.
 */

import { eventBus, EVENT_TYPES } from '../systems/EventBus';
import { audioSynthesizer } from '../systems/AudioSynthesizer';
import { feverMode } from '../systems/FeverMode';
import { infiniteZoom } from '../systems/InfiniteZoom';
import { cometSystem } from '../systems/CometSystem';
import { repairBotManager } from '../entities/RepairBot';

class JuiceIntegration {
    constructor() {
        this.isInitialized = false;
        this.lastBuildTime = 0;
        this.comboMultiplier = 1;
        this.comboTimeout = null;
        this.lastInputTime = 0; // Will be set on init
        this.idleCheckInterval = 10000; // Check idle every 10s
        this.isIdle = false;
        this.wasFeverActive = false;
    }

    /**
     * Initialize all juice systems
     */
    async init() {
        if (this.isInitialized) return;

        // Initialize audio
        await audioSynthesizer.init();

        // Initialize repair bot manager
        repairBotManager.init();

        // Reset input timer to NOW (game just started)
        this.lastInputTime = Date.now();

        this.isInitialized = true;
        console.log('🎨 Juice & Charisma systems initialized');
    }

    /**
     * Resume audio context (call on user interaction)
     */
    resumeAudio() {
        if (this.isInitialized) {
            audioSynthesizer.resumeContext();
        }
    }

    /**
     * Update all juice systems state (called every tick in reducer)
     * MUST BE PURE - NO SIDE EFFECTS
     */
    updateState(gameState, deltaTime) {
        if (!this.isInitialized) return gameState;

        let newState = { ...gameState };

        // Update Fever Mode
        feverMode.update(gameState, deltaTime);
        const feverModifiers = feverMode.getModifiers();

        // Update Infinite Zoom (check for recent input)
        const timeSinceLastInput = Date.now() - this.lastInputTime;
        const hasRecentInput = timeSinceLastInput < 500; // Input in last 500ms
        infiniteZoom.update(deltaTime, hasRecentInput);

        // Update Comet System
        const canvasWidth = 1920; // TODO: Get from actual canvas
        const canvasHeight = 1080;
        cometSystem.update(deltaTime, canvasWidth, canvasHeight);

        // Update Repair Bots
        repairBotManager.update(deltaTime, gameState.nodes);

        // Spawn Confetti if in Fever Mode
        if (feverMode.shouldSpawnConfetti()) {
            // Spawn random confetti particle
            const x = (Math.random() - 0.5) * canvasWidth;
            const y = (Math.random() - 0.5) * canvasHeight;
            const confetti = feverMode.createConfettiParticle(x, y);
            newState.particles = [...newState.particles, confetti];
        }

        // Add civilizations array if not present
        if (!newState.civilizations) {
            newState.civilizations = [];
        }

        // Add repairBots to state for rendering
        newState.repairBots = repairBotManager.getBots().map(bot => bot.toJSON());

        // Add comets to state for rendering
        newState.comets = cometSystem.getComets();

        // Add juice metadata
        newState.juiceState = {
            feverModeActive: feverMode.isActive,
            feverModifiers,
            zoomLevel: infiniteZoom.zoomLevel,
            isZooming: infiniteZoom.isActive,
            comboMultiplier: this.comboMultiplier,
        };

        return newState;
    }

    /**
     * Perform side effects (Audio, Events, etc.)
     * Call this OUTSIDE the reducer (e.g. in useGameLoop or useEffect)
     */
    performSideEffects(gameState) {
        if (!this.isInitialized) return;

        // Update Audio Drone & Master Volume
        const fluxIntensity = Math.min(gameState.resources.flux / 1000, 1.0);
        const masterVolume = gameState.masterVolume !== undefined ? gameState.masterVolume : 0.5;

        // Ensure master gain is updated (controls Pink Noise, Arpeggios, etc.)
        audioSynthesizer.setMasterVolume(masterVolume);

        // Update Drone (specific modulation)
        audioSynthesizer.updateDrone(fluxIntensity, gameState.nodes.length, masterVolume);

        // Check for Idle
        this.checkIdle();

        // Handle Fever Mode Side Effects (Transition Logic)
        if (feverMode.isActive && !this.wasFeverActive) {
            feverMode.triggerActivationEffects();
        } else if (!feverMode.isActive && this.wasFeverActive) {
            feverMode.triggerDeactivationEffects();
        }
        this.wasFeverActive = feverMode.isActive;
    }

    /**
     * Handle game events and emit to EventBus
     */
    emitGameEvent(eventType, data = {}) {
        eventBus.emit(eventType, data);

        // Handle combo tracking for builds
        if (eventType === EVENT_TYPES.NODE_BUILT) {
            this.handleBuildCombo();
        }
    }

    /**
     * Handle build combo tracking
     */
    handleBuildCombo() {
        const now = Date.now();
        const timeSinceLastBuild = now - this.lastBuildTime;

        if (timeSinceLastBuild < 2000) {
            // Within combo window
            this.comboMultiplier++;
            eventBus.emit(EVENT_TYPES.COMBO_INCREMENT, { combo: this.comboMultiplier });
        } else {
            // Reset combo
            if (this.comboMultiplier > 1) {
                eventBus.emit(EVENT_TYPES.COMBO_RESET);
            }
            this.comboMultiplier = 1;
        }

        this.lastBuildTime = now;

        // Auto-reset combo after timeout
        if (this.comboTimeout) {
            clearTimeout(this.comboTimeout);
        }
        this.comboTimeout = setTimeout(() => {
            if (this.comboMultiplier > 1) {
                eventBus.emit(EVENT_TYPES.COMBO_RESET);
            }
            this.comboMultiplier = 1;
        }, 2000);
    }

    /**
     * Track user input (for idle detection)
     */
    recordInput() {
        this.lastInputTime = Date.now();
    }

    /**
     * Check for idle state
     */
    checkIdle() {
        const idleTime = Date.now() - this.lastInputTime;
        const isIdle = idleTime > 30000; // 30 seconds

        if (isIdle && !this.isIdle) {
            this.isIdle = true;
            eventBus.emit(EVENT_TYPES.PLAYER_IDLE, { idleTime });
        } else if (!isIdle && this.isIdle) {
            this.isIdle = false;
            // Optional: Emit PLAYER_ACTIVE
        }
    }

    /**
     * Handle comet click event
     */
    handleCometClick(mouseX, mouseY, worldOffset) {
        return cometSystem.handleClick(mouseX, mouseY, worldOffset);
    }

    /**
     * Apply fever mode modifiers to costs
     */
    applyFeverModifiers(cost) {
        const modifiers = feverMode.getModifiers();
        return cost * modifiers.buildCost;
    }
}

export const juiceIntegration = new JuiceIntegration();
