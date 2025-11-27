/**
 * NEON MYCELIUM - Fake Node Spawner
 * MODULE F: "Nobody exists on purpose"
 * 
 * Spawns "Real Fake Nodes" - massive gold prisms that are too good to be true.
 * When touched, they reveal a brick wall and vanish.
 */

export class FakeNodeSpawner {
    constructor() {
        this.activeFakeNodes = [];
        this.cooldown = 0;
        this.spawnChance = 0.05; // 5% per check
        this.checkInterval = 60000; // Check every minute
        this.lastCheck = Date.now();
    }

    update(state, deltaTime) {
        const now = Date.now();

        // Check if it's time to potentially spawn
        if (now - this.lastCheck >= this.checkInterval) {
            this.lastCheck = now;

            if (Math.random() < this.spawnChance && this.activeFakeNodes.length === 0) {
                return this.spawnFakeNode(state);
            }
        }

        return null;
    }

    spawnFakeNode(state) {
        // Spawn far away in the fog
        const angle = Math.random() * Math.PI * 2;
        const fogRadius = state.unlockedUpgrades?.includes('bio_luminescence') ? 800 : 400;
        const spawnDistance = fogRadius * 2.5; // Far away

        const fakeNode = {
            id: `fake-node-${Date.now()}`,
            type: 'FAKE_PRISM',
            x: Math.cos(angle) * spawnDistance,
            y: Math.sin(angle) * spawnDistance,
            value: 99999,
            isFake: true,
            revealed: false,
            sprite: 'MASSIVE_GOLD',
            pulseIntensity: 2.0 // Extra shiny
        };

        this.activeFakeNodes.push(fakeNode);
        return fakeNode;
    }

    onNodeTouch(fakeNodeId, gameState) {
        const fakeNode = this.activeFakeNodes.find(n => n.id === fakeNodeId);
        if (!fakeNode || fakeNode.revealed) return null;

        fakeNode.revealed = true;

        return {
            type: 'FAKE_NODE_REVEAL',
            nodeId: fakeNodeId,
            brickWallDuration: 2000,
            garyDialogue: "Real Fake Nodes! Come on down! Don't even hesitate, don't even worry, don't even... give it a second thought!"
        };
    }

    removeFakeNode(nodeId) {
        this.activeFakeNodes = this.activeFakeNodes.filter(n => n.id !== nodeId);
    }

    getFakeNodes() {
        return this.activeFakeNodes;
    }
}

export const fakeNodeSpawner = new FakeNodeSpawner();
