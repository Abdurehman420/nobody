import React, { useState } from 'react';
import SquishyButton from './SquishyButton';

/**
 * NEON MYCELIUM - Cheat Cartridges
 * 
 * N64-style cheat menu with fun game modifiers.
 * Unlocked after Konami Code or first prestige.
 */

const CHEATS = [
    {
        id: 'big_head_mode',
        name: 'BIG HEAD MODE',
        desc: 'Nodes are 3x larger',
        icon: '🎈',
        color: '#FF6B6B'
    },
    {
        id: 'disco_floor',
        name: 'DISCO FLOOR',
        desc: 'Rainbow BPM color cycle',
        icon: '🪩',
        color: '#4ECDC4'
    },
    {
        id: 'turbo_dismount',
        name: 'TURBO DISMOUNT',
        desc: 'Gravity x10',
        icon: '⚡',
        color: '#FFE66D'
    }
];

const CheatCartridges = ({ gameState, dispatch }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Only show if Konami activated or prestige level > 0
    if (!gameState.konamiActivated && gameState.prestigeLevel === 0) {
        return null;
    }

    const toggleCheat = (cheatId) => {
        dispatch({ type: 'TOGGLE_CHEAT', payload: cheatId });
    };

    if (!isOpen) {
        return (
            <SquishyButton
                onClick={() => setIsOpen(true)}
                preset="BOUNCY"
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: '3px solid #FFD700',
                    color: '#FFF',
                    padding: '12px 16px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    zIndex: 99,
                    fontFamily: 'monospace',
                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)'
                }}
                title="Cheat Cartridges"
            >
                🎮 CHEATS
            </SquishyButton>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            background: 'linear-gradient(135deg, #2d3561 0%, #1f1f3a 100%)',
            border: '4px solid #FFD700',
            borderRadius: '16px',
            padding: '24px',
            color: '#FFD700',
            zIndex: 100,
            width: '320px',
            fontFamily: 'monospace',
            boxShadow: '0 0 40px rgba(255, 215, 0, 0.5), inset 0 0 30px rgba(255, 215, 0, 0.1)'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: '2px solid #FFD700',
                paddingBottom: '12px'
            }}>
                <div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>🎮 CHEAT CARTRIDGES</div>
                    <div style={{ fontSize: '10px', color: '#FFA500', marginTop: '4px' }}>
                        N64 STYLE
                    </div>
                </div>
                <SquishyButton
                    onClick={() => setIsOpen(false)}
                    preset="STIFF"
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#FFD700',
                        cursor: 'pointer',
                        fontSize: '18px'
                    }}
                >
                    [X]
                </SquishyButton>
            </div>

            {/* Cheat List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {CHEATS.map(cheat => {
                    const isActive = gameState.activeCheats?.[cheat.id] || false;

                    return (
                        <SquishyButton
                            key={cheat.id}
                            onClick={() => toggleCheat(cheat.id)}
                            preset="WOBBLY"
                            style={{
                                background: isActive
                                    ? `linear-gradient(135deg, ${cheat.color} 0%, ${cheat.color}88 100%)`
                                    : '#2a2a4a',
                                border: `3px solid ${isActive ? cheat.color : '#666'}`,
                                borderRadius: '12px',
                                padding: '16px',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'transform 0.2s',
                                boxShadow: isActive ? `0 0 20px ${cheat.color}66` : 'none'
                            }}
                        >
                            {/* Cartridge slot design */}
                            <div style={{
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                right: '0',
                                height: '6px',
                                background: isActive ? cheat.color : '#444',
                                borderBottom: '2px solid #000'
                            }} />

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginTop: '8px'
                            }}>
                                <span style={{ fontSize: '32px' }}>{cheat.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        color: isActive ? '#FFF' : '#FFD700',
                                        marginBottom: '4px'
                                    }}>
                                        {cheat.name}
                                    </div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: isActive ? '#FFF' : '#AAA'
                                    }}>
                                        {cheat.desc}
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '20px',
                                    color: isActive ? '#FFF' : '#666'
                                }}>
                                    {isActive ? '✓' : '○'}
                                </div>
                            </div>
                        </SquishyButton>
                    );
                })}
            </div>

            {/* Footer */}
            <div style={{
                marginTop: '16px',
                padding: '12px',
                background: 'rgba(255, 215, 0, 0.1)',
                borderRadius: '8px',
                fontSize: '10px',
                textAlign: 'center',
                color: '#FFA500'
            }}>
                ⚠️ CHEATS ACTIVE: {Object.keys(gameState.activeCheats || {}).filter(k => gameState.activeCheats[k]).length}/3
            </div>
        </div>
    );
};

export default CheatCartridges;
