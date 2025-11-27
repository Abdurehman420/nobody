/**
 * NEON MYCELIUM - Wet Floor Zone
 * MODULE F Feature #16
 * 
 * A holographic "Caution: Wet Floor" sign in deep space.
 * Friction = 0, particles slide uncontrollably.
 */

export class WetFloorZone {
    constructor(centerX, centerY) {
        this.id = `wetfloor-${Date.now()}`;
        this.x = centerX;
        this.y = centerY;
        this.radius = 150;
        this.active = true;
    }

    affectsParticle(particle) {
        const dx = particle.x - this.x;
        const dy = particle.y - this.y;
        const distSq = dx * dx + dy * dy;
        return distSq < (this.radius * this.radius);
    }

    applyEffect(particle) {
        if (this.affectsParticle(particle)) {
            // Zero friction - particles slide
            // Add some random bounce for chaos
            if (Math.random() < 0.1) {
                particle.vx += (Math.random() - 0.5) * 2;
                particle.vy += (Math.random() - 0.5) * 2;
            }
            // Don't apply normal friction
            return { skipFriction: true };
        }
        return null;
    }
}

export function spawnWetFloorZone(x, y) {
    return new WetFloorZone(x, y);
}
