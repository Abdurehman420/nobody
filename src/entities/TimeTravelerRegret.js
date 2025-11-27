/**
 * NEON MYCELIUM - Time-Traveler's Regret
 * MODULE F Feature #24
 * 
 * A particle that moves BACKWARDS through the network.
 * When it reaches the source, it SUBTRACTS resources instead of adding them.
 * Displays "Causality Error" notification.
 */

export class TimeTravelerRegret {
    constructor(x, y, targetNode) {
        this.id = `regret-${Date.now()}-${Math.random()}`;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.size = 4;
        this.color = '#FF00FF'; // Magenta for temporal anomaly
        this.life = 1.0;
        this.targetNode = targetNode;
        this.speed = -1.5; // Negative speed = backwards
        this.trail = [];
        this.maxTrailLength = 10;
    }

    update(nodes, deltaTime) {
        if (!this.targetNode) return 'remove';

        // Find target node
        const target = nodes.find(n => n.id === this.targetNode);
        if (!target) return 'remove';

        // Move BACKWARDS towards source
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
            // Reached the node - will trigger resource subtraction
            return 'regret';
        }

        // Move towards target (backwards in time)
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;

        this.x += this.vx;
        this.y += this.vy;

        // Add to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // Fade with age
        this.life -= 0.002;
        if (this.life <= 0) return 'remove';

        return null;
    }

    isPointInside(px, py) {
        const dist = Math.sqrt((px - this.x) ** 2 + (py - this.y) ** 2);
        return dist < this.size;
    }
}

export function spawnTimeTravelerRegret(x, y, targetNodeId) {
    return new TimeTravelerRegret(x, y, targetNodeId);
}
