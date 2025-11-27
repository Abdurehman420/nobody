import React, { useEffect, useRef } from 'react';
import '../styles/app-juice.css';

/**
 * Smart Cursor - "Lazy Eye"
 * 
 * Biological eyeball cursor with magnetism to nodes.
 */
export default function SmartCursor({ mousePos, nodes, canvasRef }) {
    const cursorRef = useRef(null);
    const [nearestNode, setNearestNode] = React.useState(null);
    const [isLocked, setIsLocked] = React.useState(false);

    const MAGNETISM_THRESHOLD = 80;

    useEffect(() => {
        if (!mousePos || !nodes) return;

        // Find nearest node
        let nearest = null;
        let minDist = Infinity;

        nodes.forEach(node => {
            const dx = node.x - mousePos.x;
            const dy = node.y - mousePos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < minDist) {
                minDist = dist;
                nearest = { node, distance: dist };
            }
        });

        if (nearest && nearest.distance < MAGNETISM_THRESHOLD) {
            setNearestNode(nearest.node);
            setIsLocked(true);
        } else {
            setNearestNode(null);
            setIsLocked(false);
        }
    }, [mousePos, nodes]);

    useEffect(() => {
        if (!cursorRef.current) return;

        const cursor = cursorRef.current;
        const pupil = cursor.querySelector('.cursor__pupil');

        if (!pupil) return;

        if (nearestNode) {
            // Calculate pupil offset toward nearest node
            const dx = nearestNode.x - mousePos.x;
            const dy = nearestNode.y - mousePos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
                const maxOffset = 6;
                const offsetX = (dx / dist) * maxOffset;
                const offsetY = (dy / dist) * maxOffset;

                pupil.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${isLocked ? 1.5 : 1.0})`;
            }
        } else {
            pupil.style.transform = 'translate(0, 0) scale(1.0)';
        }
    }, [nearestNode, isLocked, mousePos]);

    if (!mousePos) return null;

    return (
        <div
            ref={cursorRef}
            className="cursor__eyeball"
            style={{
                left: mousePos.x,
                top: mousePos.y,
                pointerEvents: 'none'
            }}
        >
            <div className="cursor__iris">
                <div className="cursor__pupil"></div>
            </div>
        </div>
    );
}
