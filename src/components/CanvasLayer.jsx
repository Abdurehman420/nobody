import React, { useRef, useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { spawnGenericNPC, isPointInsideNPC } from '../entities/GenericNPC';
import { renderGame } from '../engine/renderer';
import BureaucracyModal from './BureaucracyModal';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';
import { juiceIntegration } from '../systems/JuiceIntegration';
import TentacleAssist from '../systems/TentacleAssist';
import { GAME_CONFIG } from '../engine/config';

const CanvasLayer = () => {
    const canvasRef = useRef(null);
    const { state, dispatch } = useGame();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [selectedNode, setSelectedNode] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [selectedDesk, setSelectedDesk] = useState(null);
    const tentacleAssist = useRef(null);

    // Initialize TentacleAssist
    if (!tentacleAssist.current) {
        tentacleAssist.current = new TentacleAssist();
    }

    // RE-WRITING THE WHOLE EFFECT TO BE CLEANER
    const hasMoved = useRef(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });

            // Record input for idle detection
            juiceIntegration.recordInput();

            // Update tentacle assist raycasting
            const rect = canvasRef.current?.getBoundingClientRect();

            // Calculate world coordinates (needed for multiple checks)
            let worldX = 0;
            let worldY = 0;
            if (rect) {
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                worldX = (e.clientX - rect.left - centerX) / state.zoom + state.worldOffset.x;
                worldY = (e.clientY - rect.top - centerY) / state.zoom + state.worldOffset.y;
            }

            if (rect && tentacleAssist.current && !isDragging) {
                tentacleAssist.current.update({ x: worldX, y: worldY }, state.nodes);
            }

            // Check Wet Floor Zone (Audio Effect)
            if (state.wetFloorZones) {
                const inZone = state.wetFloorZones.some(zone => {
                    const dx = worldX - zone.x;
                    const dy = worldY - zone.y;
                    return (dx * dx + dy * dy) < (zone.radius * zone.radius);
                });

                // Only update audio if state changed
                if (canvasRef.current.lastInZone !== inZone) {
                    canvasRef.current.lastInZone = inZone;
                    import('../systems/AudioSynthesizer').then(({ audioSynthesizer }) => {
                        audioSynthesizer.setUnderwaterMode(inZone);
                    });
                }
            }

            if (isDragging) {
                hasMoved.current = true;

                if (selectedNode) {
                    // Dragging connection - just visual
                } else {
                    // Panning
                    const dx = e.clientX - dragStart.x;
                    const dy = e.clientY - dragStart.y;

                    // Dimension 3: The Mirror Realm (Reversed Controls)
                    const multiplier = state.dimension === 3 ? -1 : 1;

                    dispatch({ type: 'PAN_CAMERA', payload: { dx: dx * multiplier, dy: dy * multiplier } });
                    setDragStart({ x: e.clientX, y: e.clientY });
                }
            }
        };

        const handleMouseDown = (e) => {
            // Ignore if clicking UI
            if (e.target !== canvasRef.current) return;

            // Record input for idle detection
            juiceIntegration.recordInput();

            hasMoved.current = false;
            setIsDragging(true);
            setDragStart({ x: e.clientX, y: e.clientY });

            const rect = canvasRef.current.getBoundingClientRect();
            // Apply Zoom to coordinate conversion
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const worldX = (e.clientX - rect.left - centerX) / state.zoom + state.worldOffset.x;
            const worldY = (e.clientY - rect.top - centerY) / state.zoom + state.worldOffset.y;

            // Check if tentacle is snapping to a node
            const snappedNode = tentacleAssist.current?.getSnappedNode();

            if (snappedNode) {
                // Click-through to snapped node
                setSelectedNode(snappedNode.id);
            } else {
                // Normal click detection
                const clickedNode = state.nodes.find(n => {
                    const dx = n.x - worldX;
                    const dy = n.y - worldY;
                    return (dx * dx + dy * dy) < (30 * 30); // Hit radius
                });

                if (clickedNode) {
                    setSelectedNode(clickedNode.id);
                } else {
                    setSelectedNode(null);
                }
            }
        };

        const handleMouseUp = (e) => {
            setIsDragging(false);

            if (e.target !== canvasRef.current && !isDragging) return;

            const rect = canvasRef.current.getBoundingClientRect();
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const worldX = (e.clientX - rect.left - centerX) / state.zoom + state.worldOffset.x;
            const worldY = (e.clientY - rect.top - centerY) / state.zoom + state.worldOffset.y;

            if (!hasMoved.current) {
                // CLICK LOGIC
                if (e.target !== canvasRef.current) return;

                // Track clicks for Credits Hallucination
                dispatch({ type: 'INCREMENT_CLICK_COUNT' });

                // Check for Generic NPC clicks (MODULE F)
                if (state.genericNPCs) {
                    for (const npc of state.genericNPCs) {
                        if (isPointInsideNPC(npc, worldX, worldY)) {
                            dispatch({ type: 'CLICK_NPC', payload: { id: npc.id } });
                            return; // Handled click
                        }
                    }
                }

                // Check for Schrödinger's Catbox clicks (MODULE F)
                if (state.schrodingerBoxes) {
                    for (const box of state.schrodingerBoxes) {
                        if (!box.observed) {
                            const dist = Math.sqrt((worldX - box.x) ** 2 + (worldY - box.y) ** 2);
                            if (dist < 20) {
                                // Clicked the box!
                                const outcome = Math.random() < 0.5 ? 'EXPLODE' : 'INFINITE';
                                dispatch({
                                    type: 'RESOLVE_CATBOX',
                                    payload: {
                                        boxId: box.id,
                                        type: outcome,
                                        position: { x: box.x, y: box.y },
                                        duration: 10000
                                    }
                                });
                                return; // Handled click
                            }
                        }
                    }
                }

                // Shift+Click to Spawn Node (Debug / Fallback)
                if (e.shiftKey) {
                    dispatch({
                        type: 'ADD_NODE',
                        payload: { x: worldX, y: worldY, free: false }
                    });
                    return;
                }

                // Check Desk Click
                if (state.desks) {
                    const clickedDesk = state.desks.find(d =>
                        worldX >= d.x - d.width / 2 &&
                        worldX <= d.x + d.width / 2 &&
                        worldY >= d.y - d.height / 2 &&
                        worldY <= d.y + d.height / 2
                    );

                    if (clickedDesk) {
                        if (!clickedDesk.compliant) {
                            setSelectedDesk(clickedDesk);
                        }
                        return; // Stop other interactions if a desk was clicked
                    }
                }

                if (selectedNode) {
                    // Node clicked
                } else {
                    // Background clicked
                    const clickedPrism = (state.prisms && Array.isArray(state.prisms)) ? state.prisms.find(p => {
                        const dx = p.x - worldX;
                        const dy = p.y - worldY;
                        return (dx * dx + dy * dy) < (20 * 20);
                    }) : null;

                    if (clickedPrism) {
                        dispatch({ type: 'COLLECT_PRISM', payload: clickedPrism.id });
                    } else {
                        // Clicked Empty Space -> Spawn Node (if affordable)
                        // We check affordability in reducer, but let's try to spawn.
                        // Only spawn if NOT holding Shift (Shift is debug force spawn)
                        // Actually, let's just use the same action.
                        // But we want to avoid accidental spawns when dragging?
                        // hasMoved check handles that.

                        // Check if we clicked on an obstacle?
                        // Obstacle logic is handled in reducer (collision).

                        dispatch({
                            type: 'ADD_NODE',
                            payload: { x: worldX, y: worldY, free: false }
                        });
                    }
                    // Generic click effect
                    dispatch({
                        type: 'SPAWN_PARTICLES',
                        payload: { x: worldX, y: worldY, color: '#FFFFFF', count: 5 }
                    });

                    // Check comet clicks first (before other interactions)
                    if (state.comets && state.comets.length > 0) {
                        const clickedComet = state.comets.find(comet => {
                            const dx = comet.x - worldX;
                            const dy = comet.y - worldY;
                            return (dx * dx + dy * dy) < (comet.size * comet.size);
                        });

                        if (clickedComet) {
                            // Emit comet click event
                            eventBus.emit(EVENT_TYPES.COMET_CLICKED, {
                                x: clickedComet.x,
                                y: clickedComet.y,
                                comet: clickedComet
                            });

                            // Reward resources
                            dispatch({
                                type: 'SPAWN_PARTICLES',
                                payload: { x: worldX, y: worldY, color: '#FFD700', count: 50 }
                            });

                            return; // Don't process other clicks
                        }
                    }

                    // Upgrade: Karma Farming (Click nothing -> Flux)
                    if (state.unlockedUpgrades.includes('karma_farming')) {
                        dispatch({ type: 'KARMA_GAIN' });
                    }

                    // Upgrade: Universal Solvent (Destroy Obstacles)
                    if (state.unlockedUpgrades.includes('universal_solvent')) {
                        const clickedRock = state.obstacles.find(o => {
                            const dx = o.x - worldX;
                            const dy = o.y - worldY;
                            return (dx * dx + dy * dy) < (o.radius + 10) * (o.radius + 10);
                        });
                        if (clickedRock) {
                            dispatch({ type: 'DESTROY_OBSTACLE', payload: clickedRock.id });
                        }
                    }

                    // Upgrade: Polymorph (Enemies -> Wisps)
                    if (state.unlockedUpgrades.includes('polymorph')) {
                        const clickedEnemy = state.enemies.find(e => {
                            const dx = e.x - worldX;
                            const dy = e.y - worldY;
                            return (dx * dx + dy * dy) < (e.radius + 20) * (e.radius + 20);
                        });
                        if (clickedEnemy) {
                            dispatch({ type: 'POLYMORPH_ENEMY', payload: clickedEnemy.id });
                        }
                    }
                }
            } else {
                // DRAG RELEASE LOGIC
                if (selectedNode) {
                    const targetNode = state.nodes.find(n => {
                        const dx = n.x - worldX;
                        const dy = n.y - worldY;
                        return (dx * dx + dy * dy) < (30 * 30);
                    });

                    if (targetNode && targetNode.id !== selectedNode) {
                        // Check Max Length
                        const sourceNode = state.nodes.find(n => n.id === selectedNode);
                        if (sourceNode) {
                            const dx = targetNode.x - sourceNode.x;
                            const dy = targetNode.y - sourceNode.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            let maxLength = 500; // Increased base max length
                            if (state.unlockedUpgrades.includes('duct_tape')) maxLength *= 1.15;
                            if (state.unlockedUpgrades.includes('infinite_duct_tape')) maxLength *= 1.5;

                            if (dist <= maxLength) {
                                dispatch({ type: 'ADD_EDGE', payload: { sourceId: selectedNode, targetId: targetNode.id } });
                                setSelectedNode(null); // Deselect after connecting
                            }
                        }
                    } else if (!targetNode) {
                        // Dragged to empty space -> Build Node
                        let buildX = worldX;
                        let buildY = worldY;

                        // Upgrade: Hyper-Tesselation (Hex Grid Snapping)
                        if (state.unlockedUpgrades.includes('hyper_tesselation')) {
                            const hexSize = 100;
                            const q = (Math.sqrt(3) / 3 * buildX - 1 / 3 * buildY) / hexSize;
                            const r = (2 / 3 * buildY) / hexSize;

                            let rx = Math.round(q);
                            let ry = Math.round(r);
                            let rz = Math.round(-q - r);

                            const x_diff = Math.abs(rx - q);
                            const y_diff = Math.abs(ry - r);
                            const z_diff = Math.abs(rz - (-q - r));

                            if (x_diff > y_diff && x_diff > z_diff) {
                                rx = -ry - rz;
                            } else if (y_diff > z_diff) {
                                ry = -rx - rz;
                            } else {
                                rz = -rx - ry;
                            }

                            buildX = hexSize * Math.sqrt(3) * (rx + ry / 2);
                            buildY = hexSize * 3 / 2 * ry;
                        }

                        // Check distance from source
                        const sourceNode = state.nodes.find(n => n.id === selectedNode);
                        if (sourceNode) {
                            const dx = buildX - sourceNode.x;
                            const dy = buildY - sourceNode.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            let maxLength = 500;
                            if (state.unlockedUpgrades.includes('duct_tape')) maxLength *= 1.15;
                            if (state.unlockedUpgrades.includes('infinite_duct_tape')) maxLength *= 1.5;
                            if (state.unlockedUpgrades.includes('void_anchors')) maxLength *= 2.0; // Double length

                            if (dist <= maxLength) {
                                dispatch({
                                    type: 'BUILD_AND_CONNECT',
                                    payload: { x: buildX, y: buildY, sourceId: selectedNode }
                                });
                                setSelectedNode(null); // Deselect after building
                            }
                        }
                    }
                }
            }
        };



        // Mobile Touch Handlers
        const handleTouchMove = (e) => {
            if (e.touches && e.touches[0]) {
                e.preventDefault();
                handleMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
            }
        };
        const handleTouchStart = (e) => {
            if (e.touches && e.touches[0]) {
                // e.preventDefault(); // Allow click emulation if needed, but we handle logic here
                handleMouseDown({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY, target: e.target });
            }
        };
        const handleTouchEnd = (e) => {
            if (e.changedTouches && e.changedTouches[0]) {
                handleMouseUp({ clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        // Add Touch Listeners
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);

            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [state, selectedNode, isDragging, dragStart, dispatch]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        let animationFrameId;

        const render = () => {
            // Apply Infinite Zoom modifiers if active
            let renderState = state;
            if (state.juiceState?.isZooming && state.nodes.length > 0) {
                // Override zoom and world offset for infinite zoom effect
                const sourceNode = state.nodes[0]; // Zoom toward first node (SourceNode)
                renderState = {
                    ...state,
                    zoom: state.zoom * state.juiceState.zoomLevel,
                    worldOffset: {
                        x: sourceNode.x,
                        y: sourceNode.y
                    }
                };
            }

            renderGame(
                ctx,
                renderState,
                mousePos,
                canvas.width,
                canvas.height,
                selectedNode,
                state.screenShake,
                tentacleAssist.current?.getTentacle() // Add tentacle data
            );

            // Draw Drag Line & Feedback
            if (isDragging && selectedNode) {
                const sourceNode = state.nodes.find(n => n.id === selectedNode);
                if (sourceNode) {
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;

                    // Project source node to screen
                    const sx = (sourceNode.x - renderState.worldOffset.x) * renderState.zoom + centerX;
                    const sy = (sourceNode.y - renderState.worldOffset.y) * renderState.zoom + centerY;

                    // Calculate World Mouse Pos for logic checks
                    const worldMouseX = (mousePos.x - centerX) / renderState.zoom + renderState.worldOffset.x;
                    const worldMouseY = (mousePos.y - centerY) / renderState.zoom + renderState.worldOffset.y;

                    // Check Max Length
                    const dx = worldMouseX - sourceNode.x;
                    const dy = worldMouseY - sourceNode.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    let maxLength = 500;
                    if (state.unlockedUpgrades.includes('duct_tape')) maxLength *= 1.15;
                    if (state.unlockedUpgrades.includes('infinite_duct_tape')) maxLength *= 1.5;
                    if (state.unlockedUpgrades.includes('void_anchors')) maxLength *= 2.0;

                    // Check Target Node
                    // We can use tentacle assist or simple distance check
                    const targetNode = state.nodes.find(n => {
                        const ndx = n.x - worldMouseX;
                        const ndy = n.y - worldMouseY;
                        return (ndx * ndx + ndy * ndy) < (30 * 30);
                    });

                    let lineColor = 'rgba(255, 255, 255, 0.5)';
                    let statusText = '';
                    let isDash = true;

                    if (targetNode && targetNode.id !== sourceNode.id) {
                        // Hovering over another node
                        isDash = false;

                        // Check if connection exists
                        const exists = state.edges.some(e =>
                            (e.source === sourceNode.id && e.target === targetNode.id) ||
                            (e.source === targetNode.id && e.target === sourceNode.id) // Fixed typo
                        );
                        // Double check the exists logic: (A->B) or (B->A)
                        const reallyExists = state.edges.some(e =>
                            (e.source === sourceNode.id && e.target === targetNode.id) ||
                            (e.source === targetNode.id && e.target === sourceNode.id)
                        );

                        if (reallyExists) {
                            lineColor = '#FF0000'; // Red
                            statusText = "ALREADY CONNECTED";
                        } else if (dist > maxLength) {
                            lineColor = '#FF0000'; // Red
                            statusText = "TOO FAR";
                        } else {
                            // Check Cost
                            let edgeCost = GAME_CONFIG.RESOURCES.COST_EDGE;
                            if (state.unlockedUpgrades.includes('efficient_hyphae')) edgeCost *= 0.5;

                            if (state.resources.stardust < edgeCost && !state.activeEffects.god_mode) {
                                lineColor = '#FF0000';
                                statusText = `NEED ${edgeCost} STARDUST`;
                            } else {
                                lineColor = '#00FF00'; // Green
                                statusText = "CONNECT";
                            }
                        }
                    } else if (dist > maxLength) {
                        lineColor = '#FF4444'; // Reddish
                        statusText = "TOO FAR";
                    } else {
                        // Dragging to empty space -> Build Node
                        let nodeCost = GAME_CONFIG.RESOURCES.COST_NODE;
                        let edgeCost = GAME_CONFIG.RESOURCES.COST_EDGE;
                        if (state.unlockedUpgrades.includes('rapid_expansion')) nodeCost *= 0.8;
                        if (state.unlockedUpgrades.includes('efficient_hyphae')) edgeCost *= 0.5;

                        // Mitosis Lottery check (approximate visual)
                        if (state.unlockedUpgrades.includes('mitosis_lottery')) nodeCost = 0; // Optimistic visual

                        const totalCost = nodeCost + edgeCost;

                        if (state.resources.stardust < totalCost && !state.activeEffects.god_mode) {
                            statusText = `NEED ${totalCost} STARDUST`;
                            lineColor = '#FF4444';
                        } else {
                            statusText = "BUILD NODE";
                        }
                    }

                    ctx.beginPath();
                    ctx.moveTo(sx, sy);
                    ctx.lineTo(mousePos.x, mousePos.y);
                    ctx.strokeStyle = lineColor;
                    ctx.lineWidth = 2;
                    if (isDash) ctx.setLineDash([5, 5]);
                    else ctx.setLineDash([]);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Draw Status Text
                    if (statusText) {
                        ctx.font = 'bold 12px monospace';
                        ctx.fillStyle = lineColor;
                        ctx.textAlign = 'center';
                        ctx.fillText(statusText, mousePos.x, mousePos.y - 20);
                    }
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render(); // Start the animation loop

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId); // Cleanup on unmount
        };
    }, [state, mousePos, selectedNode, isDragging]);

    return (
        <>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 1,
                }}
            />
            {selectedDesk && (
                <BureaucracyModal
                    desk={selectedDesk}
                    onClose={() => setSelectedDesk(null)}
                />
            )}
        </>
    );
};

export default CanvasLayer;
