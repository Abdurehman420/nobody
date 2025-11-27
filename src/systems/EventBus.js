/**
 * NEON MYCELIUM - Event Bus
 * 
 * Centralized Pub/Sub system for decoupling game events from reactions.
 */

export const EVENT_TYPES = {
    // Node Events
    NODE_CONNECTED: 'NODE_CONNECTED',
    NODE_DESTROYED: 'NODE_DESTROYED',
    NODE_BUILT: 'NODE_BUILT',
    NODE_UPGRADED: 'NODE_UPGRADED',

    // Resource Events
    RESOURCE_GAINED: 'RESOURCE_GAINED',
    RESOURCE_SPENT: 'RESOURCE_SPENT',

    // Upgrade Events
    UPGRADE_UNLOCK: 'UPGRADE_UNLOCK',
    UPGRADE_PURCHASE: 'UPGRADE_PURCHASE',

    // Combat Events
    ENEMY_SPAWN: 'ENEMY_SPAWN',
    ENEMY_DEFEATED: 'ENEMY_DEFEATED',
    LEAK_DETECTED: 'LEAK_DETECTED',
    NODE_DAMAGED: 'NODE_DAMAGED',

    // Environmental Events
    OBSTACLE_DESTROYED: 'OBSTACLE_DESTROYED',
    PRISM_COLLECTED: 'PRISM_COLLECTED',
    TERRITORY_EXPANDED: 'TERRITORY_EXPANDED',

    // Game State Events
    FEVER_MODE_START: 'FEVER_MODE_START',
    FEVER_MODE_END: 'FEVER_MODE_END',
    COMBO_INCREMENT: 'COMBO_INCREMENT',
    COMBO_RESET: 'COMBO_RESET',
    PLAYER_IDLE: 'PLAYER_IDLE',

    // Civilization Events
    CIVILIZATION_CONTACT: 'CIVILIZATION_CONTACT',
    CIVILIZATION_ANGRY: 'CIVILIZATION_ANGRY',
    VASSAL_CREATED: 'VASSAL_CREATED',
    CIVILIZATION_DESTROYED: 'CIVILIZATION_DESTROYED',

    // Comet Events
    COMET_CLICKED: 'COMET_CLICKED',

    // Bot Events
    NODE_REPAIRED: 'NODE_REPAIRED',
    BOT_GRUMBLE: 'BOT_GRUMBLE',
};

class EventBus {
    constructor() {
        this.listeners = new Map(); // event -> Set of callbacks
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event type from EVENT_TYPES
     * @param {Function} callback - Function to call when event is emitted
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event type
     * @param {Function} callback - The callback to remove
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    /**
     * Emit an event with optional data
     * @param {string} event - Event type
     * @param {*} data - Data to pass to listeners
     */
    emit(event, data = {}) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`EventBus error in ${event}:`, error);
                }
            });
        }
    }

    /**
     * Clear all listeners (useful for cleanup)
     */
    clear() {
        this.listeners.clear();
    }

    /**
     * Get count of listeners for an event (debugging)
     */
    getListenerCount(event) {
        return this.listeners.has(event) ? this.listeners.get(event).size : 0;
    }
}

// Singleton instance
export const eventBus = new EventBus();
