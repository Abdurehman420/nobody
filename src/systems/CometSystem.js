/**
 * NEON MYCELIUM - Comet System
 * 
 * Clickable lootbox comets that spawn resources.
 */

import { eventBus, EVENT_TYPES } from './EventBus';

class Comet {
    constructor(canvasWidth, canvasHeight) {
        this.id = `comet-${Date.now()}`;

        // Random starting position (off-screen)
        const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left

        switch (side) {
            case 0: // Top
                this.x = Math.random() * canvasWidth;
                this.y = -50;
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = Math.random() * 2 + 1;
                break;
            case 1: // Right
                this.x = canvasWidth + 50;
                this.y = Math.random() * canvasHeight;
                this.vx = -(Math.random() * 2 + 1);
                this.vy = (Math.random() - 0.5) * 2;
                break;
            case 2: // Bottom
                this.x = Math.random() * canvasWidth;
                this.y = canvasHeight + 50;
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = -(Math.random() * 2 + 1);
                break;
            case 3: // Left
                this.x = -50;
                this.y = Math.random() * canvasHeight;
                this.vx = Math.random() * 2 + 1;
                this.vy = (Math.random() - 0.5) * 2;
                break;
        }

        this.size = 30;
        this.color = ['#FFD700', '#FFA500', '#FF69B4', '#00FFFF'][Math.floor(Math.random() * 4)];
        this.tail = [];
        this.life = 1.0;

        // Audio properties for Doppler effect
        this.initialFreq = 800;
        this.finalFreq = 200;
    }

    update(deltaTime) {
        this.x += this.vx * (deltaTime / 16);
        this.y += this.vy * (deltaTime / 16);

        // Add tail particle
        if (Math.random() < 0.5) {
            this.tail.push({
                x: this.x,
                y: this.y,
                life: 1.0
            });
        }

        // Update tail
        this.tail = this.tail.map(p => ({
            ...p,
            life: p.life - 0.05
        })).filter(p => p.life > 0);

        // Decay life (for off-screen check)
        this.life -= 0.001;
    }

    isOffScreen(canvasWidth, canvasHeight) {
        return this.x < -100 || this.x > canvasWidth + 100 ||
            this.y < -100 || this.y > canvasHeight + 100 ||
            this.life <= 0;
    }
}

export class CometSystem {
    constructor() {
        this.comets = [];
        this.lastSpawnTime = Date.now(); // Use real timestamps
        this.SPAWN_INTERVAL = 180000; // 180 seconds = 3 minutes in milliseconds
    }

    update(deltaTime, canvasWidth, canvasHeight) {
        const now = Date.now();

        // Spawn new comet if enough time has passed
        const timeSinceLastSpawn = now - this.lastSpawnTime;
        if (timeSinceLastSpawn >= this.SPAWN_INTERVAL) {
            this.spawnComet(canvasWidth, canvasHeight);
            this.lastSpawnTime = now;
            console.log(`☄️ Comet spawned (${(timeSinceLastSpawn / 1000).toFixed(0)}s since last, real time)`);
        }

        // Update comets
        this.comets.forEach(comet => comet.update(deltaTime));

        // Remove off-screen comets
        this.comets = this.comets.filter(comet => !comet.isOffScreen(canvasWidth, canvasHeight));
    }

    spawnComet(canvasWidth, canvasHeight) {
        const comet = new Comet(canvasWidth, canvasHeight);
        this.comets.push(comet);
    }

    handleClick(mouseX, mouseY, worldOffset) {
        const clickedComet = this.comets.find(comet => {
            const dx = comet.x - (mouseX + worldOffset.x);
            const dy = comet.y - (mouseY + worldOffset.y);
            const dist = Math.sqrt(dx * dx + dy * dy);
            return dist < comet.size;
        });

        if (clickedComet) {
            // Emit event for crater node creation
            eventBus.emit(EVENT_TYPES.COMET_CLICKED, {
                x: clickedComet.x,
                y: clickedComet.y,
                comet: clickedComet
            });

            // Remove comet
            this.comets = this.comets.filter(c => c.id !== clickedComet.id);

            return true;
        }

        return false;
    }

    getComets() {
        return this.comets;
    }
}

export const cometSystem = new CometSystem();
