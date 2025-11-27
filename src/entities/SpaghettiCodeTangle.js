/**
 * NEON MYCELIUM - Spaghetti Code Tangle
 * MODULE F Feature #30
 * 
 * Chaotic knot of glitching neon wireframe.
 * Resources entering are randomized - can exit as different type or even the number '4'.
 */

export class SpaghettiCodeTangle {
    constructor(centerX, centerY) {
        this.id = `spaghetti-${Date.now()}`;
        this.x = centerX;
        this.y = centerY;
        this.radius = 100;
        this.glitchIntensity = 1.0;
    }

    affectsParticle(particle) {
        const dx = particle.x - this.x;
        const dy = particle.y - this.y;
        const distSq = dx * dx + dy * dy;
        return distSq < (this.radius * this.radius);
    }

    processParticle(particle) {
        if (!this.affectsParticle(particle)) return particle;

        // Particle is in spaghetti - randomize it!
        const outcome = Math.random();

        if (outcome < 0.3) {
            // Convert to different resource type
            particle.type = Math.random() < 0.5 ? 'STARDUST' : 'FLUX';
            particle.color = particle.type === 'STARDUST' ? '#32CD32' : '#00FFFF';

            // Audio: Granular Piano
            import('../systems/AudioSynthesizer').then(({ audioSynthesizer }) => {
                audioSynthesizer.playGranularPiano();
            });
        } else if (outcome < 0.35) {
            // Convert to the number 4
            particle.type = 'NUMBER_4';
            particle.color = '#FF00FF';
            particle.value = 4;

            // Audio: Granular Piano
            import('../systems/AudioSynthesizer').then(({ audioSynthesizer }) => {
                audioSynthesizer.playGranularPiano();
            });
        } else if (outcome < 0.5) {
            // Disappear entirely
            return null;
        }

        // Make particle loop in circles for 2-4 seconds
        if (!particle.spaghettiTime) {
            particle.spaghettiTime = Date.now();
            particle.spaghettiDuration = 2000 + Math.random() * 2000;
            particle.spaghettiAngle = Math.random() * Math.PI * 2;
        }

        const elapsed = Date.now() - particle.spaghettiTime;
        if (elapsed < particle.spaghettiDuration) {
            // Loop around center
            particle.spaghettiAngle += 0.1;
            particle.x = this.x + Math.cos(particle.spaghettiAngle) * 50;
            particle.y = this.y + Math.sin(particle.spaghettiAngle) * 50;
        } else {
            // Exit the tangle
            delete particle.spaghettiTime;
            delete particle.spaghettiDuration;
            delete particle.spaghettiAngle;
        }

        return particle;
    }
}

export function spawnSpaghettiCodeTangle(x, y) {
    return new SpaghettiCodeTangle(x, y);
}

// Static function for plain objects
export function processParticleInTangle(tangle, particle) {
    const dx = particle.x - tangle.x;
    const dy = particle.y - tangle.y;
    const distSq = dx * dx + dy * dy;

    // Check if inside radius
    if (distSq >= (tangle.radius * tangle.radius)) return particle;

    // Particle is in spaghetti - randomize it!
    const outcome = Math.random();

    if (outcome < 0.3) {
        // Convert to different resource type
        particle.type = Math.random() < 0.5 ? 'STARDUST' : 'FLUX';
        particle.color = particle.type === 'STARDUST' ? '#32CD32' : '#00FFFF';

        // Audio: Granular Piano
        import('../systems/AudioSynthesizer').then(({ audioSynthesizer }) => {
            audioSynthesizer.playGranularPiano();
        });
    } else if (outcome < 0.35) {
        // Convert to the number 4
        particle.type = 'NUMBER_4';
        particle.color = '#FF00FF';
        particle.value = 4;

        // Audio: Granular Piano
        import('../systems/AudioSynthesizer').then(({ audioSynthesizer }) => {
            audioSynthesizer.playGranularPiano();
        });
    } else if (outcome < 0.5) {
        // Disappear entirely
        return null;
    }

    // Make particle loop in circles for 2-4 seconds
    if (!particle.spaghettiTime) {
        particle.spaghettiTime = Date.now();
        particle.spaghettiDuration = 2000 + Math.random() * 2000;
        particle.spaghettiAngle = Math.random() * Math.PI * 2;
    }

    const elapsed = Date.now() - particle.spaghettiTime;
    if (elapsed < particle.spaghettiDuration) {
        // Loop around center
        particle.spaghettiAngle += 0.1;
        particle.x = tangle.x + Math.cos(particle.spaghettiAngle) * 50;
        particle.y = tangle.y + Math.sin(particle.spaghettiAngle) * 50;
    } else {
        // Exit the tangle
        delete particle.spaghettiTime;
        delete particle.spaghettiDuration;
        delete particle.spaghettiAngle;
    }

    return particle;
}
