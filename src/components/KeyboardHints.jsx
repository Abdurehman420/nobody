import React from 'react';

/**
 * NEON MYCELIUM - Keyboard Hints Overlay
 * 
 * Shows available keyboard shortcuts to users.
 */

const KeyboardHints = () => {
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === '?' || (e.shiftKey && e.key === '/')) {
                e.preventDefault();
                setIsVisible(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    if (!isVisible) {
        return (
            <div style={{
                position: 'fixed',
                top: '20px',
                left: '80px', // Moved right to avoid Valve overlap
                background: 'rgba(0, 0, 0, 0.7)',
                color: '#00ff00',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace',
                zIndex: 999,
                border: '1px solid #00ff00'
            }}>
                <strong>?</strong> for shortcuts
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '3px solid #00ff00',
            borderRadius: '12px',
            padding: '30px',
            color: '#00ff00',
            fontFamily: 'monospace',
            fontSize: '14px',
            zIndex: 1000,
            maxWidth: '600px',
            boxShadow: '0 0 50px rgba(0, 255, 0, 0.4)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: '2px solid #00ff00',
                paddingBottom: '10px'
            }}>
                <h2 style={{ margin: 0, fontSize: '20px' }}>⌨️ KEYBOARD SHORTCUTS</h2>
                <button
                    onClick={() => setIsVisible(false)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#00ff00',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    [X]
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Building */}
                <div>
                    <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>🔨 Building</h3>
                    <ShortcutRow keys="Space / B" desc="Build Node" />
                </div>

                {/* Camera */}
                <div>
                    <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>📷 Camera</h3>
                    <ShortcutRow keys="W A S D" desc="Pan" />
                    <ShortcutRow keys="+ / -" desc="Zoom" />
                    <ShortcutRow keys="0" desc="Reset Zoom" />
                </div>

                {/* UI */}
                <div>
                    <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>🎛️ UI</h3>
                    <ShortcutRow keys="Esc" desc="Close Modals" />
                    <ShortcutRow keys="Tab" desc="Settings" />
                    <ShortcutRow keys="M" desc="Star Map" />
                </div>

                {/* Systems */}
                <div>
                    <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>⚙️ Systems</h3>
                    <ShortcutRow keys="I" desc="Bureaucrat" />
                    <ShortcutRow keys="P" desc="Permit Office" />
                    <ShortcutRow keys="G" desc="Pineal Gland" />
                </div>

                {/* Secret Codes */}
                <div style={{ gridColumn: '1 / -1' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '10px', marginTop: '10px' }}>🎮 Secret Codes</h3>
                    <ShortcutRow keys="↑↑↓↓←→←→BA" desc="Konami Code (Unlock Cheats)" />
                    <ShortcutRow keys="1M Flux" desc="Fourth Wall Break" />
                </div>
            </div>

            <div style={{
                marginTop: '20px',
                padding: '10px',
                background: 'rgba(0, 255, 0, 0.1)',
                borderRadius: '4px',
                fontSize: '12px',
                textAlign: 'center'
            }}>
                Press <strong>?</strong> again to hide
            </div>
        </div>
    );
};

const ShortcutRow = ({ keys, desc }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '6px',
        fontSize: '12px'
    }}>
        <span style={{
            background: '#003300',
            padding: '2px 6px',
            borderRadius: '3px',
            fontWeight: 'bold'
        }}>
            {keys}
        </span>
        <span style={{ color: '#00dd00' }}>{desc}</span>
    </div>
);

export default KeyboardHints;
