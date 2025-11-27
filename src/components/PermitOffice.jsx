import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import SquishyButton from './SquishyButton';
import { useCRTWindow } from '../hooks/useCRTWindow';

const PermitOffice = () => {
    const { state } = useGame();
    const [isOpen, setIsOpen] = useState(false);
    const { containerStyle, flashStyle } = useCRTWindow(isOpen, { preset: 'STIFF' });

    // Only show if we have discovered at least one desk or have permits
    const hasDiscoveredBureaucracy = (state.desks && state.desks.length > 0) ||
        (state.permits && Object.values(state.permits).some(v => v > 0));

    if (!hasDiscoveredBureaucracy) return null;

    const permits = state.permits || {};
    const permitTypes = [
        { id: 'solid_waste', name: 'Solid Waste', icon: '🗑️' },
        { id: 'high_voltage', name: 'High Voltage', icon: '⚡' },
        { id: 'existential_compliance', name: 'Existential', icon: '👁️' }
    ];

    if (!isOpen) {
        return (
            <SquishyButton
                onClick={() => setIsOpen(true)}
                preset="WOBBLY"
                style={{
                    position: 'absolute',
                    top: '220px',
                    right: '20px',
                    background: '#4B0082',
                    border: '1px solid #DA70D6',
                    color: '#FFF',
                    padding: '10px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    zIndex: 10,
                    boxShadow: '0 0 10px #4B0082',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}
            >
                <span>📜</span> PERMITS
            </SquishyButton>
        );
    }

    return (
        <div style={{
            ...containerStyle,
            position: 'absolute',
            top: '150px',
            left: '20px',
            background: 'rgba(20, 0, 40, 0.95)',
            border: '2px solid #DA70D6',
            padding: '15px',
            color: '#FFF',
            fontFamily: 'monospace',
            zIndex: 100,
            width: '250px',
            boxShadow: '0 0 20px rgba(75, 0, 130, 0.5)'
        }}>
            {/* CRT Flash */}
            <div style={flashStyle} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #DA70D6', paddingBottom: '5px' }}>
                <span style={{ fontWeight: 'bold', color: '#DA70D6' }}>PERMIT OFFICE</span>
                <SquishyButton
                    onClick={() => setIsOpen(false)}
                    preset="STIFF"
                    style={{ background: 'none', border: 'none', color: '#DA70D6', cursor: 'pointer' }}
                >
                    [X]
                </SquishyButton>
            </div>

            <div style={{ fontSize: '12px', marginBottom: '15px', color: '#AAA' }}>
                "Compliance is mandatory. Happiness is optional."
            </div>

            {permitTypes.map(type => (
                <div key={type.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '5px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>{type.icon}</span>
                        <span>{type.name}</span>
                    </div>
                    <div style={{ fontWeight: 'bold', color: permits[type.id] > 0 ? '#32CD32' : '#555' }}>
                        {permits[type.id] || 0}
                    </div>
                </div>
            ))}

            <div style={{ fontSize: '10px', color: '#666', marginTop: '10px', borderTop: '1px solid #333', paddingTop: '5px' }}>
                Find Bureaucrat Desks in the world to bribe them for more permits.
            </div>
        </div>
    );
};

export default PermitOffice;
