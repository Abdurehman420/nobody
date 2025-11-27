import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import SquishyButton from './SquishyButton';
import { UPGRADE_TREES } from '../engine/upgrades';

const StarMap = () => {
    const { state, dispatch } = useGame();
    const [isOpen, setIsOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    // Reset pan/zoom when opening
    useEffect(() => {
        if (isOpen) {
            setZoom(1);
            setPan({ x: 0, y: 0 });
        }
    }, [isOpen]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e) => {
        e.stopPropagation();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(z => Math.max(0.5, Math.min(3, z * delta)));
    };

    if (!isOpen) {
        return (
            <SquishyButton
                onClick={() => setIsOpen(true)}
                preset="WOBBLY"
                style={{
                    position: 'absolute',
                    top: '170px',
                    right: '20px',
                    background: 'rgba(0, 0, 50, 0.8)',
                    border: '1px solid cyan',
                    color: 'cyan',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    zIndex: 100
                }}
            >
                STAR MAP
            </SquishyButton>
        );
    }

    const renderNode = (node, treeColor) => {
        const isUnlocked = state.unlockedUpgrades.includes(node.id);
        const parentUnlocked = !node.parentId || state.unlockedUpgrades.includes(node.parentId);
        const canUnlock = !isUnlocked && parentUnlocked;

        // Check cost
        const canAfford = canUnlock && (
            (!node.cost.stardust || state.resources.stardust >= node.cost.stardust) &&
            (!node.cost.flux || state.resources.flux >= node.cost.flux) &&
            (!node.cost.lucidity || state.resources.lucidity >= node.cost.lucidity)
        );

        // Check Permit
        const hasPermit = !node.permit || (state.permits && state.permits[node.permit] > 0);
        const isPermitLocked = canUnlock && !hasPermit;

        return (
            <div
                key={node.id}
                onClick={(e) => {
                    e.stopPropagation();
                    if (canAfford && hasPermit) {
                        dispatch({ type: 'UNLOCK_UPGRADE', payload: node.id });
                    }
                }}
                title={`${node.name}\n${node.description}\nCost: ${JSON.stringify(node.cost)}${node.permit ? `\nRequires: ${node.permit}` : ''}`}
                style={{
                    position: 'absolute',
                    top: `${node.position.y * 10}px`, // Scale up positions
                    left: `${node.position.x * 10}px`,
                    transform: 'translate(-50%, -50%)',
                    border: `2px solid ${isUnlocked ? treeColor : (canUnlock && hasPermit ? '#FFFFFF' : '#555')}`,
                    background: isUnlocked ? treeColor : 'black',
                    color: isUnlocked ? 'black' : (canUnlock ? 'white' : '#555'),
                    padding: '10px',
                    borderRadius: '50%',
                    cursor: (canAfford && hasPermit) ? 'pointer' : 'default',
                    width: '100px',
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontSize: '10px',
                    boxShadow: isUnlocked ? `0 0 15px ${treeColor}` : 'none',
                    opacity: parentUnlocked ? 1 : 0.5,
                    transition: 'all 0.3s ease',
                    zIndex: 2,
                    userSelect: 'none'
                }}
            >
                <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{node.name}</div>
                    {isPermitLocked && <div style={{ color: 'red', fontSize: '8px' }}>MISSING PERMIT</div>}
                    {canUnlock && !canAfford && <div style={{ color: 'red', fontSize: '8px' }}>TOO EXPENSIVE</div>}
                    {state.cooldowns[node.id] > state.tick && (
                        <div style={{ color: 'orange', fontSize: '8px' }}>
                            COOLDOWN: {Math.ceil((state.cooldowns[node.id] - state.tick) / 60)}s
                        </div>
                    )}
                    {!isUnlocked && <div style={{ fontSize: '8px' }}>
                        {node.cost.lucidity ? `${node.cost.lucidity} LUC` : ''}
                        {node.cost.flux ? `${node.cost.flux} FLUX` : ''}
                    </div>}
                    {isUnlocked && node.description.startsWith('Active Skill:') && (
                        <button
                            style={{
                                marginTop: '5px',
                                fontSize: '8px',
                                background: state.cooldowns[node.id] > state.tick ? '#555' : 'white',
                                color: 'black',
                                border: 'none',
                                cursor: state.cooldowns[node.id] > state.tick ? 'default' : 'pointer'
                            }}
                            disabled={state.cooldowns[node.id] > state.tick}
                            onClick={(e) => {
                                e.stopPropagation();
                                dispatch({ type: 'ACTIVATE_SKILL', payload: node.id });
                            }}
                        >
                            {state.cooldowns[node.id] > state.tick ? 'WAIT' : 'ACTIVATE'}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderConnections = (tree, treeColor) => {
        return tree.nodes.map(node => {
            if (!node.parentId) return null;
            const parent = tree.nodes.find(n => n.id === node.parentId);
            if (!parent) return null;

            const isUnlocked = state.unlockedUpgrades.includes(node.id);
            const parentUnlocked = state.unlockedUpgrades.includes(parent.id);

            return (
                <line
                    key={`line-${node.id}`}
                    x1={`${parent.position.x * 10}`}
                    y1={`${parent.position.y * 10}`}
                    x2={`${node.position.x * 10}`}
                    y2={`${node.position.y * 10}`}
                    stroke={isUnlocked ? treeColor : (parentUnlocked ? '#FFFFFF' : '#555')}
                    strokeWidth="2"
                    strokeDasharray={isUnlocked ? "" : "5,5"}
                />
            );
        });
    };

    return (
        <div style={{
            position: 'absolute',
            top: '5%',
            left: '5%',
            width: '90%',
            height: '90%',
            background: 'rgba(0, 0, 0, 0.95)',
            border: '2px solid var(--color-stardust)',
            zIndex: 30,
            overflow: 'hidden',
            color: 'var(--color-stardust)',
            boxShadow: '0 0 50px rgba(0, 255, 255, 0.2)'
        }}>
            {/* Controls */}
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 31,
                display: 'flex',
                gap: '10px'
            }}>
                <SquishyButton onClick={() => setZoom(z => z * 1.2)} preset="STIFF" style={{ background: '#333', color: '#fff', border: '1px solid #fff' }}>[+]</SquishyButton>
                <SquishyButton onClick={() => setZoom(z => z / 1.2)} preset="STIFF" style={{ background: '#333', color: '#fff', border: '1px solid #fff' }}>[-]</SquishyButton>
                <SquishyButton onClick={() => setIsOpen(false)} preset="BOUNCY" style={{ background: '#333', color: '#f00', border: '1px solid #f00' }}>[X]</SquishyButton>
            </div>

            <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 31,
                pointerEvents: 'none'
            }}>
                <h2>EVOLUTIONARY TREE</h2>
                <div style={{ fontSize: '12px', color: '#888' }}>
                    Drag to Pan • Scroll to Zoom
                </div>
            </div>

            {/* Draggable Container */}
            <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                style={{
                    width: '100%',
                    height: '100%',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: 'center',
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '0',
                    height: '0'
                }}>
                    {/* Grid Background */}
                    <div style={{
                        position: 'absolute',
                        top: -2000,
                        left: -2000,
                        width: 4000,
                        height: 4000,
                        backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                        opacity: 0.2,
                        pointerEvents: 'none'
                    }} />

                    {Object.values(UPGRADE_TREES).map(tree => (
                        <React.Fragment key={tree.id}>
                            <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, pointerEvents: 'none', overflow: 'visible' }}>
                                {renderConnections(tree, tree.color)}
                            </svg>
                            {tree.nodes.map(node => renderNode(node, tree.color))}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Scanline Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                backgroundSize: '100% 2px, 3px 100%',
                pointerEvents: 'none',
                zIndex: 40
            }}></div>
        </div>
    );
};

export default StarMap;
