/**
 * NEON MYCELIUM - Repair Bot
 * 
 * Auto-repair helper agent that fixes damaged nodes.
 */

import { eventBus, EVENT_TYPES } from '../systems/EventBus';

const BOT_STATES = {
    IDLE: 'IDLE',
    ALERT: 'ALERT',
    REPAIR: 'REPAIR',
};

const GRUMBLES = [
    "Ugh, again?",
    "I'm not paid enough",
    "Why me?",
    "This is fine",
    "Great. Just great.",
    "Oh wonderful",
    "Can't I just rest?",
    "Of course",
];

export class RepairBot {
    constructor(x, y) {
        this.id = `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.x = x;
        this.y = y;
        this.state = BOT_STATES.IDLE;
        this.targetNode = null;
        this.speed = 2;
        this.repairRate = 5; // HP per tick
        this.grumbleTimer = 0;
        this.size = 15;
        this.color = '#FFA500'; // Orange
    }

    update(deltaTime, nodes) {
        switch (this.state) {
            case BOT_STATES.IDLE:
                this.wander(deltaTime);
                break;

            case BOT_STATES.ALERT:
                if (this.targetNode) {
                    this.moveToTarget(deltaTime);
                } else {
                    this.state = BOT_STATES.IDLE;
                }
                break;

            case BOT_STATES.REPAIR:
                this.performRepair(deltaTime);
                break;
        }

        // Update grumble timer
        if (this.grumbleTimer > 0) {
            this.grumbleTimer -= deltaTime;
        }
    }

    wander(deltaTime) {
        // Random walk
        if (Math.random() < 0.02) {
            this.x += (Math.random() - 0.5) * this.speed * (deltaTime / 16);
            this.y += (Math.random() - 0.5) * this.speed * (deltaTime / 16);
        }
    }

    moveToTarget(deltaTime) {
        if (!this.targetNode) return;

        const dx = this.targetNode.x - this.x;
        const dy = this.targetNode.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 10) {
            // Arrived, start repairing
            this.state = BOT_STATES.REPAIR;
            this.emitGrumble();
        } else {
            // Move toward target
            this.x += (dx / dist) * this.speed * (deltaTime / 16);
            this.y += (dy / dist) * this.speed * (deltaTime / 16);
        }
    }

    performRepair(deltaTime) {
        if (!this.targetNode) {
            this.state = BOT_STATES.IDLE;
            return;
        }

        // Repair node (health restoration would be in game state)
        // For now, emit repair event
        eventBus.emit(EVENT_TYPES.NODE_REPAIRED, {
            nodeId: this.targetNode.id,
            amount: this.repairRate
        });

        // Check if done
        if (this.targetNode.health >= this.targetNode.maxHealth) {
            this.targetNode = null;
            this.state = BOT_STATES.IDLE;
        }
    }

    respondToLeak(node) {
        if (this.state === BOT_STATES.IDLE) {
            this.state = BOT_STATES.ALERT;
            this.targetNode = node;
            this.emitGrumble();
        }
    }

    emitGrumble() {
        if (this.grumbleTimer > 0) return; // Don't spam

        const grumble = GRUMBLES[Math.floor(Math.random() * GRUMBLES.length)];

        eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
            botId: this.id,
            x: this.x,
            y: this.y,
            text: grumble
        });

        this.grumbleTimer = 3000; // 3 second cooldown
    }

    toJSON() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            state: this.state,
            size: this.size,
            color: this.color,
        };
    }
}

/**
 * Repair Bot Manager
 */
export class RepairBotManager {
    constructor() {
        this.bots = [];
        this.maxBots = 3;
    }

    init() {
        // Listen for leak events
        eventBus.on(EVENT_TYPES.LEAK_DETECTED, (data) => {
            this.handleLeak(data);
        });

        eventBus.on(EVENT_TYPES.NODE_DAMAGED, (data) => {
            this.handleLeak(data);
        });
    }

    handleLeak(data) {
        const { node } = data;

        // Find idle bot or create new one
        let bot = this.bots.find(b => b.state === BOT_STATES.IDLE);

        if (!bot && this.bots.length < this.maxBots) {
            // Spawn new bot near the leak
            bot = new RepairBot(node.x + 100, node.y + 100);
            this.bots.push(bot);
        }

        if (bot) {
            bot.respondToLeak(node);
        }
    }

    update(deltaTime, nodes) {
        this.bots.forEach(bot => bot.update(deltaTime, nodes));
    }

    getBots() {
        return this.bots;
    }
}

export const repairBotManager = new RepairBotManager();
