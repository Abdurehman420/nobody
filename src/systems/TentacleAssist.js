/**
 * NEON MYCELIUM - Tentacle Assist System
 * 
 * Raycasting assist for clicking nodes. Makes small targets easier to click.
 * When cursor is within 50px of a node, renders a wiggling tentacle connection.
 * Clicking while tentacle is active triggers interaction on the nearest node.
 */

export class TentacleAssist {
    constructor() {
        this.nearestNode = null;
        this.distance = Infinity;
        this.SNAP_RADIUS = 50; // pixels
        this.tentaclePoints = [];
        this.wigglePhase = 0;
    }

    /**
     * Update raycasting - find nearest node within snap radius
     * @param {Object} cursor - {x, y} in world space
     * @param {Array} nodes - Array of node objects with x, y positions
     */
    update(cursor, nodes) {
        this.nearestNode = null;
        this.distance = Infinity;

        for (const node of nodes) {
            const dx = node.x - cursor.x;
            const dy = node.y - cursor.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.SNAP_RADIUS && dist < this.distance) {
                this.distance = dist;
                this.nearestNode = node;
            }
        }

        // Generate tentacle curve if we have a target
        if (this.nearestNode) {
            this.generateTentaclePath(cursor, this.nearestNode);
        }

        // Update wiggle animation
        this.wigglePhase += 0.1;
    }

    /**
     * Generate bezier curve path for tentacle with wiggle
     */
    generateTentaclePath(start, end) {
        const segments = 3;
        this.tentaclePoints = [];

        // Calculate control points for bezier curve
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        // Perpendicular direction for wiggle
        const perpX = -dy / length;
        const perpY = dx / length;

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;

            // Bezier interpolation
            const x = start.x + dx * t;
            const y = start.y + dy * t;

            // Add sinusoidal wiggle
            const wiggleAmount = Math.sin(this.wigglePhase + i * 0.5) * 3;
            const wx = x + perpX * wiggleAmount;
            const wy = y + perpY * wiggleAmount;

            this.tentaclePoints.push({ x: wx, y: wy });
        }
    }

    /**
     * Get nearest node if one is snapped
     */
    getSnappedNode() {
        return this.nearestNode;
    }

    /**
     * Check if a node is currently being snapped to
     */
    isSnapping() {
        return this.nearestNode !== null;
    }

    /**
     * Get tentacle points for rendering
     */
    getTentacle() {
        return {
            points: this.tentaclePoints,
            isActive: this.isSnapping()
        };
    }

    /**
     * Reset tentacle (e.g., on click)
     */
    reset() {
        this.nearestNode = null;
        this.distance = Infinity;
        this.tentaclePoints = [];
    }
}

export default TentacleAssist;
