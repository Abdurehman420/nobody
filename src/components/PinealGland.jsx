import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import SquishyButton from './SquishyButton';
import { useCRTWindow } from '../hooks/useCRTWindow';

const PinealGland = () => {
    const { state, dispatch } = useGame();
    const [isOpen, setIsOpen] = useState(false);
    const { containerStyle, flashStyle } = useCRTWindow(isOpen, { preset: 'WOBBLY' });

    // Only show if Lucidity is high enough or already prestiged
    if (state.resources.lucidity < 50 && state.dimension === 1) return null;

    const handleShift = () => {
        if (window.confirm("Are you sure? This will RESET your world but shift you to the next Dimension.")) {
            dispatch({ type: 'SHIFT_DIMENSION' });
        }
    };

    return (
        <div style={{
            position: 'absolute',
            top: '280px',
            right: '20px',
            zIndex: 100,
            textAlign: 'right'
        }}>
            <SquishyButton
                onClick={() => setIsOpen(!isOpen)}
                preset="WOBBLY"
                style={{
                    background: 'transparent',
                    border: '2px solid #FF00FF',
                    color: '#FF00FF',
                    padding: '10px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 0 10px #FF00FF',
                    fontFamily: 'monospace'
                }}
            >
                👁️ PINEAL GLAND
            </SquishyButton>

            {isOpen && (
                <div style={{
                    ...containerStyle,
                    marginTop: '10px',
                    background: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid #FF00FF',
                    padding: '20px',
                    width: '250px',
                    color: '#FFF',
                    position: 'relative'
                }}>
                    {/* CRT Flash */}
                    <div style={flashStyle} />
                    <h3 style={{ margin: '0 0 10px 0', color: '#00FFFF' }}>Dimension {state.dimension}</h3>
                    <p style={{ fontSize: '12px', color: '#AAA' }}>
                        Current Reality Stability: {Math.max(0, 100 - state.resources.flux / 100).toFixed(1)}%
                    </p>

                    <div style={{ margin: '20px 0', borderTop: '1px solid #333', paddingTop: '10px' }}>
                        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>DIMENSIONAL SHIFT</div>
                        <p style={{ fontSize: '10px', marginBottom: '10px' }}>
                            Abandon this reality. Enter the next dimension with altered physics.
                            <br /><br />
                            <span style={{ color: '#FF0000' }}>WARNING: RESETS WORLD</span>
                        </p>
                        <SquishyButton
                            onClick={handleShift}
                            disabled={state.resources.lucidity < 100}
                            preset="BOUNCY"
                            style={{
                                width: '100%',
                                padding: '10px',
                                background: state.resources.lucidity >= 100 ? '#FF00FF' : '#333',
                                color: '#FFF',
                                border: 'none',
                                cursor: state.resources.lucidity >= 100 ? 'pointer' : 'not-allowed'
                            }}
                        >
                            {state.resources.lucidity >= 100 ? 'INITIATE SHIFT' : 'NEED 100 LUCIDITY'}
                        </SquishyButton>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PinealGland;
