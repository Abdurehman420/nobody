import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import SquishyButton from './SquishyButton';

const DebugOverlay = () => {
    const { state, dispatch } = useGame();
    const [consoleOpen, setConsoleOpen] = useState(false);
    const [command, setCommand] = useState('');
    const [logs, setLogs] = useState([
        "NEON_OS v9.0.1 booting...",
        "Connecting to Mycelial Network...",
        "Connection established.",
        "WARNING: Unsanctioned access detected."
    ]);
    const inputRef = useRef(null);
    const logEndRef = useRef(null);

    useEffect(() => {
        if (consoleOpen && inputRef.current) {
            inputRef.current.focus();
        }
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [consoleOpen, logs]);

    const addLog = (text) => {
        setLogs(prev => [...prev, `> ${text}`]);
    };

    const handleCommand = (e) => {
        e.preventDefault();
        const cmd = command.trim().toLowerCase();
        addLog(command);

        if (cmd === 'help') {
            addLog("AVAILABLE COMMANDS:");
            addLog("  inject_funding   - Acquire assets");
            addLog("  unlock_matrix    - Bypass security");
            addLog("  sudo             - Admin access");
            addLog("  rm -rf /         - System cleanup");
            addLog("  whoami           - User identity");
        } else if (cmd === 'inject_funding') {
            addLog("Injecting foreign capital...");
            addLog("Transaction approved by The Board.");
            dispatch({ type: 'CHEAT_RESOURCES' });
        } else if (cmd === 'unlock_matrix') {
            addLog("Bypassing mainframe security...");
            addLog("Firewall disabled.");
            addLog("All upgrades unlocked.");
            dispatch({ type: 'CHEAT_UNLOCK_ALL' });
        } else if (cmd === 'sudo') {
            addLog("User is not in the sudoers file.");
            addLog("This incident will be reported to the Bureaucrats.");
        } else if (cmd === 'rm -rf /') {
            addLog("Nice try.");
            addLog("System protected by Plot Armor.");
        } else if (cmd === 'whoami') {
            addLog("You are the Ghost in the Machine.");
        } else if (cmd === 'clear') {
            setLogs([]);
        } else if (cmd !== '') {
            addLog(`Command not found: ${cmd}`);
        }

        setCommand('');
    };

    if (!state.unlockedUpgrades.includes('dev_console')) {
        // Hidden until unlocked
        return null;
    }

    return (
        <>
            {/* Minimal HUD when closed */}
            {!consoleOpen && (
                <div style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    color: '#0F0',
                    fontFamily: 'monospace',
                    textAlign: 'right',
                    zIndex: 20,
                    textShadow: '0 0 5px #0F0'
                }}>
                    <div style={{ opacity: 0.7 }}>Tick: {state.tick}</div>
                    <div style={{ opacity: 0.7 }}>FPS: {Math.round(60)}</div>
                    <SquishyButton
                        onClick={() => setConsoleOpen(true)}
                        preset="WOBBLY"
                        style={{
                            background: 'black',
                            color: '#0F0',
                            border: '1px solid #0F0',
                            marginTop: '5px',
                            cursor: 'pointer',
                            fontFamily: 'monospace',
                            boxShadow: '0 0 5px #0F0'
                        }}
                    >
                        [OPEN TERMINAL]
                    </SquishyButton>
                </div>
            )}

            {/* Full Terminal Overlay */}
            {consoleOpen && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '400px',
                    background: 'rgba(0, 10, 0, 0.95)',
                    border: '2px solid #0F0',
                    boxShadow: '0 0 20px #0F0, inset 0 0 50px rgba(0, 50, 0, 0.5)',
                    color: '#0F0',
                    fontFamily: 'monospace',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '10px',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{ borderBottom: '1px solid #0F0', paddingBottom: '5px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>NEON_OS TERMINAL</span>
                        <SquishyButton
                            onClick={() => setConsoleOpen(false)}
                            preset="STIFF"
                            style={{ background: 'none', border: 'none', color: '#0F0', cursor: 'pointer' }}
                        >
                            [X]
                        </SquishyButton>
                    </div>

                    {/* Logs */}
                    <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px', whiteSpace: 'pre-wrap' }}>
                        {logs.map((log, i) => (
                            <div key={i}>{log}</div>
                        ))}
                        <div ref={logEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleCommand} style={{ display: 'flex' }}>
                        <span style={{ marginRight: '5px' }}>{'>'}</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={command}
                            onChange={(e) => setCommand(e.target.value)}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                color: '#0F0',
                                fontFamily: 'monospace',
                                outline: 'none'
                            }}
                            autoFocus
                        />
                    </form>
                </div>
            )}
        </>
    );
};

export default DebugOverlay;
