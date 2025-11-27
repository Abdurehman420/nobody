/**
 * NEON MYCELIUM - Spring Physics
 * 
 * Physics-based animation using spring dynamics (Euler integration).
 * Use for all UI animations instead of linear CSS transitions.
 */

/**
 * Spring physics simulation
 * @param {number} current - Current value
 * @param {number} target - Target value
 * @param {number} velocity - Current velocity
 * @param {number} stiffness - Spring stiffness (higher = snappier, typical: 100-300)
 * @param {number} damping - Damping coefficient (higher = less oscillation, typical: 10-30)
 * @param {number} deltaTime - Time step in seconds
 * @returns {{value: number, velocity: number}} - New value and velocity
 */
export function springTo(current, target, velocity, stiffness = 170, damping = 26, deltaTime = 0.016) {
    // Spring force: F = -k * x (Hooke's law)
    const springForce = -stiffness * (current - target);

    // Damping force: F = -c * v
    const dampingForce = -damping * velocity;

    // Total force
    const force = springForce + dampingForce;

    // Acceleration (assuming mass = 1)
    const acceleration = force;

    // Euler integration
    const newVelocity = velocity + acceleration * deltaTime;
    const newValue = current + newVelocity * deltaTime;

    return {
        value: newValue,
        velocity: newVelocity
    };
}

/**
 * Spring physics for 2D vectors
 */
export function spring2D(currentX, currentY, targetX, targetY, velocityX, velocityY, stiffness = 170, damping = 26, deltaTime = 0.016) {
    const x = springTo(currentX, targetX, velocityX, stiffness, damping, deltaTime);
    const y = springTo(currentY, targetY, velocityY, stiffness, damping, deltaTime);

    return {
        x: x.value,
        y: y.value,
        velocityX: x.velocity,
        velocityY: y.velocity
    };
}

/**
 * Check if spring has settled (for optimization)
 */
export function isSettled(current, target, velocity, threshold = 0.01) {
    const distance = Math.abs(current - target);
    const speed = Math.abs(velocity);
    return distance < threshold && speed < threshold;
}

/**
 * Wobbly window drag effect
 * Higher stiffness for dragged element, lower for trailing shadow
 */
export const SPRING_PRESETS = {
    STIFF: { stiffness: 300, damping: 30 },      // Fast, minimal wobble
    BOUNCY: { stiffness: 150, damping: 15 },     // Fun, juicy
    WOBBLY: { stiffness: 100, damping: 10 },     // Maximum wobble
    SLOW: { stiffness: 80, damping: 20 },        // Smooth, gentle
};
