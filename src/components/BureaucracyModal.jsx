import React from 'react';
import { useGame } from '../context/GameContext';
import SquishyButton from './SquishyButton';
import { useCRTWindow } from '../hooks/useCRTWindow';

const BureaucracyModal = ({ desk, onClose }) => {
    const { state, dispatch } = useGame();
    const isOpen = Boolean(desk);
    const { containerStyle, flashStyle } = useCRTWindow(isOpen, { preset: 'BOUNCY' });

    if (!desk) return null;

    const departmentNames = {
        solid_waste: 'Dept. of Solid Waste',
        high_voltage: 'High Voltage Commission',
        existential_compliance: 'Bureau of Existential Compliance'
    };

    const costs = {
        solid_waste: { stardust: 500 },
        high_voltage: { flux: 200 },
        existential_compliance: { lucidity: 50 }
    };

    const cost = costs[desk.department];
    const canAfford =
        (state.resources.stardust >= (cost.stardust || 0)) &&
        (state.resources.flux >= (cost.flux || 0)) &&
        (state.resources.lucidity >= (cost.lucidity || 0));

    const handleBribe = () => {
        dispatch({ type: 'BRIBE_BUREAUCRAT', payload: desk.id });
        onClose();
    };

    return (
        <div style={{
            ...containerStyle,
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginLeft: '-150px',
            marginTop: '-150px',
            background: '#222',
            border: '2px solid #4B0082',
            padding: '20px',
            color: '#FFF',
            fontFamily: 'monospace',
            zIndex: 1000,
            width: '300px',
            boxShadow: '0 0 20px rgba(75, 0, 130, 0.5)'
        }}>
            {/* CRT Flash */}
            <div style={flashStyle} />

            <h2 style={{ marginTop: 0, color: '#DA70D6' }}>{departmentNames[desk.department]}</h2>
            <p>
                "Form 27B-6 is required for further expansion in this sector."
            </p>

            <div style={{ margin: '20px 0', padding: '10px', background: '#111' }}>
                <div><strong>Required Bribe:</strong></div>
                {cost.stardust && <div style={{ color: '#32CD32' }}>{cost.stardust} Stardust</div>}
                {cost.flux && <div style={{ color: '#00FFFF' }}>{cost.flux} Flux</div>}
                {cost.lucidity && <div style={{ color: '#FF00FF' }}>{cost.lucidity} Lucidity</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <SquishyButton
                    onClick={onClose}
                    preset="GENTLE"
                    style={{ background: '#444', border: 'none', color: '#FFF', padding: '10px', cursor: 'pointer' }}
                >
                    Ignore
                </SquishyButton>
                <SquishyButton
                    onClick={handleBribe}
                    disabled={!canAfford && !state.activeEffects.god_mode}
                    preset="BOUNCY"
                    style={{
                        background: canAfford || state.activeEffects.god_mode ? '#4B0082' : '#555',
                        border: 'none',
                        color: '#FFF',
                        padding: '10px',
                        cursor: canAfford || state.activeEffects.god_mode ? 'pointer' : 'not-allowed'
                    }}
                >
                    Bribe (+1 Permit)
                </SquishyButton>
            </div>
        </div>
    );
};

export default BureaucracyModal;
