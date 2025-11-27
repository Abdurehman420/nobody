/**
 * NEON MYCELIUM - Spring Physics Solver
 * 
 * Mass-Spring-Damper physics engine for organic, bouncy UI animations.
 * Replaces all linear CSS transitions with physics-based motion.
 */

export const SPRING_PRESETS = {
    BOUNCY: { mass: 0.8, stiffness: 180, damping: 12 },
    WOBBLY: { mass: 1, stiffness: 170, damping: 26 },
    STIFF: { mass: 1, stiffness: 300, damping: 30 },
    LIQUID: { mass: 2, stiffness: 120, damping: 14 },
    GENTLE: { mass: 1, stiffness: 100, damping: 20 }
};

export class SpringSolver {
    constructor(config = {}) {
        const preset = (config.preset && SPRING_PRESETS[config.preset]) ? SPRING_PRESETS[config.preset] : SPRING_PRESETS.WOBBLY;

        this.mass = config.mass ?? preset.mass;
        this.stiffness = config.stiffness ?? preset.stiffness;
        this.damping = config.damping ?? preset.damping;

        this.value = config.initialValue ?? 0;
        this.target = config.targetValue ?? 0;
        this.velocity = 0;

        this.threshold = 0.001; // Settling threshold
    }

    /**
     * Update spring physics (call this every frame with deltaTime in seconds)
     */
    update(deltaTime = 0.016) {
        // Spring force: F = -k * x
        const displacement = this.value - this.target;
        const springForce = -this.stiffness * displacement;

        // Damping force: F = -c * v
        const dampingForce = -this.damping * this.velocity;

        // Total force
        const force = springForce + dampingForce;

        // Acceleration: F = ma, so a = F/m
        const acceleration = force / this.mass;

        // Euler integration
        this.velocity += acceleration * deltaTime;
        this.value += this.velocity * deltaTime;

        return this.value;
    }

    /**
     * Set new target value
     */
    setTarget(newTarget) {
        this.target = newTarget;
    }

    /**
     * Check if spring has settled
     */
    isSettled() {
        const atRest = Math.abs(this.velocity) < this.threshold;
        const atTarget = Math.abs(this.value - this.target) < this.threshold;
        return atRest && atTarget;
    }

    /**
     * Instantly snap to target (useful for initialization)
     */
    snapTo(value) {
        this.value = value;
        this.target = value;
        this.velocity = 0;
    }

    /**
     * Add impulse (instant velocity change)
     */
    addImpulse(impulse) {
        this.velocity += impulse;
    }

    /**
     * Get current value
     */
    getValue() {
        return this.value;
    }

    /**
     * Get current velocity
     */
    getVelocity() {
        return this.velocity;
    }
}

/**
 * Multi-dimensional spring (for 2D/3D positions)
 */
export class SpringVector2D {
    constructor(config = {}) {
        this.x = new SpringSolver({ ...config, initialValue: config.initialX ?? 0, targetValue: config.targetX ?? 0 });
        this.y = new SpringSolver({ ...config, initialValue: config.initialY ?? 0, targetValue: config.targetY ?? 0 });
    }

    update(deltaTime) {
        return {
            x: this.x.update(deltaTime),
            y: this.y.update(deltaTime)
        };
    }

    setTarget(x, y) {
        this.x.setTarget(x);
        this.y.setTarget(y);
    }

    isSettled() {
        return this.x.isSettled() && this.y.isSettled();
    }

    getValue() {
        return {
            x: this.x.getValue(),
            y: this.y.getValue()
        };
    }
}

export default SpringSolver;
