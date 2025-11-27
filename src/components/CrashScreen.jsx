import React from 'react';
import SquishyButton from './SquishyButton';

const CrashScreen = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: '#0000AA', // BSOD Blue
            color: '#FFF',
            fontFamily: 'monospace',
            zIndex: 9999,
            padding: '50px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start'
        }}>
            <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>:(</h1>
            <p style={{ fontSize: '24px' }}>
                Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.
            </p>
            <p style={{ fontSize: '18px', marginTop: '20px' }}>
                0% complete
            </p>
            <div style={{ marginTop: '50px', fontSize: '14px' }}>
                <p>Stop code: CRITICAL_PROCESS_DIED</p>
                <p>What failed: NEON_MYCELIUM.SYS</p>
            </div>

            <SquishyButton
                onClick={() => window.location.reload()}
                preset="BOUNCY"
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    fontSize: '16px',
                    background: '#ff0066',
                    color: 'white',
                    border: '2px solid white',
                    cursor: 'pointer'
                }}
            >
                RELOAD SIMULATION
            </SquishyButton>
        </div>
    );
};

export default CrashScreen;
