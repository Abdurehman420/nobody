/**
 * NEON MYCELIUM - Infinite Zoom Screensaver
 * 
 * Creates hypnotic zoom effect when player is idle.
 */

export class InfiniteZoom {
    constructor() {
        this.idleStartTime = null; // When idling started
        this.isActive = false;
        this.zoomLevel = 1.0;
        this.IDLE_THRESHOLD = 60000; // 60 seconds in milliseconds
        this.MAX_ZOOM = 1000;
        this.zoomSpeed = 1.01; // Multiplier per frame
        this.targetNodeId = null;
    }

    /**
     * Update (called each tick)
     */
    update(deltaTime, hasInput) {
        const now = Date.now();

        // Track idle time using real-world timestamps
        if (hasInput) {
            // Reset idle timer on ANY input
            if (this.idleStartTime !== null) {
                const idleTime = now - this.idleStartTime;
                if (idleTime > 5000) { // Only log if idle for more than 5 seconds
                    console.log(`⏱️ Idle timer reset (was at ${(idleTime / 1000).toFixed(1)}s)`);
                }
            }
            this.idleStartTime = null;
            if (this.isActive) {
                this.deactivate();
            }
        } else {
            // Start tracking idle time if not already
            if (this.idleStartTime === null) {
                this.idleStartTime = now;
                console.log(`🌀 Started idle tracking`);
            }

            // Calculate actual idle time
            const idleTime = now - this.idleStartTime;

            // Activate if idle long enough and not already active
            if (!this.isActive && idleTime >= this.IDLE_THRESHOLD) {
                this.activate(idleTime);
            }
        }

        // Continue zooming if active
        if (this.isActive) {
            this.zoomLevel *= this.zoomSpeed;

            // Fractal reset at max zoom
            if (this.zoomLevel >= this.MAX_ZOOM) {
                this.resetZoom();
            }
        }
    }

    /**
     * Activate infinite zoom
     */
    activate(idleTime) {
        this.isActive = true;
        this.zoomLevel = 1.0;
        console.log(`🌀 Infinite Zoom activated after ${(idleTime / 1000).toFixed(1)}s idle (real time)`);

        // Trigger Gary's snarky idle commentary
        const idleQuips = [
            "Oh great, you fell asleep. Classic.",
            "Hello? Anyone home? Just me and the void then.",
            "Wow, staring contest with infinity. You're losing.",
            "This is fine. I'm fine. Everything's fine. We're all gonna die.",
            "*sigh* Wake me when you decide to do literally anything.",
            "Infinite zoom baby! This is what peak performance looks like.",
            "I've seen heat death of universes less boring than this."
        ];
        const randomQuip = idleQuips[Math.floor(Math.random() * idleQuips.length)];

        // Import EventBus dynamically to avoid circular dependency
        import('./EventBus.js').then(({ eventBus, EVENT_TYPES }) => {
            eventBus.emit(EVENT_TYPES.PLAYER_IDLE, { idleTime });
            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: randomQuip,
                isGary: true
            });
        });
    }

    /**
     * Deactivate
     */
    deactivate() {
        this.isActive = false;
        this.zoomLevel = 1.0;
        console.log('🌀 Infinite Zoom deactivated (user input detected)');

        // Stop the jazz music
        import('./AudioSynthesizer.js').then(({ audioSynthesizer }) => {
            audioSynthesizer.stopArpeggio();
        });
    }

    /**
     * Reset zoom with fractal continuity
     */
    resetZoom() {
        // Seamlessly reset to zoom level 1
        // This creates the illusion of infinite depth
        this.zoomLevel = 1.0;

        // Could also shift world coordinates here for true fractal effect
        // For now, simple reset creates the loop effect
    }

    /**
     * Get camera modifiers
     */
    getCameraModifiers(sourceNode) {
        if (!this.isActive || !sourceNode) {
            return { scale: 1.0, targetX: 0, targetY: 0 };
        }

        return {
            scale: this.zoomLevel,
            targetX: sourceNode.x,
            targetY: sourceNode.y,
        };
    }
}

export const infiniteZoom = new InfiniteZoom();
