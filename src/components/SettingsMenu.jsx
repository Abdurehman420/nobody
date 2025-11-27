import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
// audioManager removed
// import { audioManager } from '../engine/audio';
import { audioSynthesizer } from '../systems/AudioSynthesizer';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';
import SquishyButton from './SquishyButton';
import { useCRTWindow } from '../hooks/useCRTWindow';
import { PersistenceSystem } from '../systems/PersistenceSystem';

const SettingsMenu = () => {
    const { state, dispatch } = useGame();
    const [isOpen, setIsOpen] = useState(false);
    // Use global volume from state, default to 0.5 if undefined
    const volume = state.masterVolume !== undefined ? state.masterVolume : 0.5;
    const { containerStyle, flashStyle } = useCRTWindow(isOpen, { preset: 'STIFF' });

    // Passive-Aggressive Valve Logic
    const lastInteractionRef = useRef(Date.now());
    const [valveRotation, setValveRotation] = useState(0);
    const [eyebrowOffset, setEyebrowOffset] = useState(0);

    // Auto-close after 5 minutes of idle
    useEffect(() => {
        const checkIdle = setInterval(() => {
            if (isOpen && Date.now() - lastInteractionRef.current > 5 * 60 * 1000) {
                setIsOpen(false);
                eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                    message: "Closing settings. You clearly weren't using them."
                });
            }
        }, 1000);
        return () => clearInterval(checkIdle);
    }, [isOpen]);

    const handleVolumeChange = (e) => {
        lastInteractionRef.current = Date.now();
        const val = parseFloat(e.target.value);
        // Dispatch to global state
        dispatch({ type: 'SET_MASTER_VOLUME', payload: val });

        // Update audio systems directly for immediate feedback
        // audioManager.setVolume(val); // Removed
        audioSynthesizer.setMasterVolume(val);
    };

    const handleValveClick = () => {
        // Single click just annoys it
        setValveRotation(prev => prev + 15);
        setEyebrowOffset(prev => (prev === 0 ? -2 : 0)); // Furrow brows
        setTimeout(() => setEyebrowOffset(0), 500);
    };

    const handleValveDoubleClick = () => {
        setIsOpen(true);
        lastInteractionRef.current = Date.now();
        eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
            message: "Oh, so NOW you need me?"
        });
    };

    if (!isOpen) {
        return (
            <div
                onDoubleClick={handleValveDoubleClick}
                onClick={handleValveClick}
                title="Settings Valve (Double-click to open)"
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    width: '50px',
                    height: '50px',
                    cursor: 'pointer',
                    zIndex: 10000, // High z-index to be above Gary
                    transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
            >
                {/* Valve Wheel */}
                <img
                    src="/assets/settings_valve.png"
                    alt="Settings Valve"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        transform: `rotate(${valveRotation}deg)`,
                        transition: 'transform 0.2s ease-out',
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
                    }}
                />

                {/* Tooltip hint */}
                <div style={{
                    position: 'absolute',
                    bottom: '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '10px',
                    color: '#666',
                    whiteSpace: 'nowrap',
                    opacity: 0.7
                }}>
                    (Double-click)
                </div>
            </div>
        );
    }

    return (
        <div style={{
            ...containerStyle,
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.95)',
            border: '2px solid #00FFCC',
            padding: '20px',
            color: '#FFFFFF',
            zIndex: 10000,
            minWidth: '250px',
            fontFamily: 'monospace',
            borderRadius: '8px',
            pointerEvents: 'auto',
            touchAction: 'none' // Prevent scrolling while interacting
        }}>
            {/* CRT Flash */}
            <div style={flashStyle} />

            <div style={{ marginBottom: '15px', fontWeight: 'bold', fontSize: '14px' }}>⚙️ SETTINGS</div>

            {/* Master Volume */}
            <div style={{ marginBottom: '15px' }}>
                <div style={{ marginBottom: '8px', color: '#00FFCC' }}>
                    MASTER VOLUME: {Math.round(volume * 100)}%
                </div>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    style={{
                        width: '100%',
                        cursor: 'pointer',
                        height: '24px',
                        accentColor: '#00FFCC',
                        pointerEvents: 'auto',
                        zIndex: 10001,
                        touchAction: 'none' // Critical for mobile sliders
                    }}
                />
                {/* Schrodinger's Mute Button */}
                <div style={{ marginTop: '5px', display: 'flex', justifyContent: 'flex-end' }}>
                    <SquishyButton
                        onClick={() => {
                            // 50% chance to actually work
                            if (Math.random() < 0.5) {
                                const newVol = volume > 0 ? 0 : 0.5;
                                dispatch({ type: 'SET_MASTER_VOLUME', payload: newVol });
                                // audioManager.setVolume(newVol); // Removed
                                audioSynthesizer.setMasterVolume(newVol);
                                eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                                    message: newVol === 0 ? "Did you hear that? Neither did I." : "Noise restored. Unfortunately."
                                });
                            } else {
                                // Fake toggle (visual only, maybe flicker)
                                eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                                    message: "The button exists in a superposition of working and not working."
                                });
                            }
                        }}
                        preset="BOUNCY"
                        style={{
                            fontSize: '10px',
                            padding: '2px 8px',
                            background: '#333',
                            border: '1px solid #00FFCC',
                            color: '#00FFCC',
                            opacity: Math.random() > 0.9 ? 0.5 : 1, // Flickering visual
                            animation: 'flicker 0.1s infinite'
                        }}
                    >
                        {volume > 0 ? "🔊 / 🔇 ?" : "🔇 / 🔊 ?"}
                    </SquishyButton>
                </div>
            </div>

            {/* Gluten-Free Toggle */}
            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ color: '#00FFCC', fontSize: '12px' }}>GLUTEN-FREE MODE</div>
                <div
                    onClick={() => {
                        const newValue = !state.glutenFreeMode;
                        dispatch({ type: 'TOGGLE_GLUTEN_FREE', payload: newValue });
                        if (newValue) {
                            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                                message: "Safe from bread that isn't there. You're welcome."
                            });
                        }
                    }}
                    style={{
                        width: '40px',
                        height: '20px',
                        background: state.glutenFreeMode ? '#00FFCC' : '#333',
                        borderRadius: '10px',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background 0.3s'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: '2px',
                        left: state.glutenFreeMode ? '22px' : '2px',
                        width: '16px',
                        height: '16px',
                        background: '#FFF',
                        borderRadius: '50%',
                        transition: 'left 0.3s'
                    }} />
                </div>
            </div>

            {/* Connection Noises Toggle */}
            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ color: '#00FFCC', fontSize: '12px' }}>CONNECTION NOISES</div>
                <div
                    onClick={() => {
                        const newValue = !state.connectionSoundsEnabled;
                        dispatch({ type: 'TOGGLE_CONNECTION_SOUNDS', payload: newValue });
                        // Update audio system directly
                        import('../systems/AudioSynthesizer').then(({ audioSynthesizer }) => {
                            audioSynthesizer.setConnectionSoundsEnabled(newValue);
                        });

                        if (!newValue) {
                            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                                message: "Silence is golden. Or at least, less annoying."
                            });
                        }
                    }}
                    style={{
                        width: '40px',
                        height: '20px',
                        background: state.connectionSoundsEnabled ? '#00FFCC' : '#333',
                        borderRadius: '10px',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background 0.3s'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: '2px',
                        left: state.connectionSoundsEnabled ? '22px' : '2px',
                        width: '16px',
                        height: '16px',
                        background: '#FFF',
                        borderRadius: '50%',
                        transition: 'left 0.3s'
                    }} />
                </div>
            </div>

            {/* Banana Accuracy Toggle */}
            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ color: '#FFE135', fontSize: '12px' }}>BANANA SCIENTIFIC ACCURACY</div>
                <div
                    onClick={() => {
                        const newValue = !state.bananaScientificAccuracy;
                        dispatch({ type: 'TOGGLE_BANANA_ACCURACY', payload: newValue });
                    }}
                    style={{
                        width: '40px',
                        height: '20px',
                        background: state.bananaScientificAccuracy ? '#FFE135' : '#333',
                        borderRadius: '10px',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background 0.3s'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: '2px',
                        left: state.bananaScientificAccuracy ? '22px' : '2px',
                        width: '16px',
                        height: '16px',
                        background: '#FFF',
                        borderRadius: '50%',
                        transition: 'left 0.3s'
                    }} />
                </div>
            </div>

            {/* Free Will Slider */}
            <div style={{ marginBottom: '15px' }}>
                <div style={{ marginBottom: '8px', color: '#00FFCC', display: 'flex', justifyContent: 'space-between' }}>
                    <span>FREE WILL</span>
                    <span style={{ fontSize: '10px', color: '#888' }}>
                        {state.freeWillValue < 0.5 ? "DETERMINISM" : "CHAOS"}
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={state.freeWillValue !== undefined ? state.freeWillValue : 0.5}
                    onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        dispatch({ type: 'SET_FREE_WILL', payload: val });
                    }}
                    onMouseUp={() => {
                        // Snap back to reality
                        setTimeout(() => {
                            dispatch({ type: 'SET_FREE_WILL', payload: 0.5 });
                            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                                message: "You thought you had control? Cute."
                            });
                        }, 200);
                    }}
                    onTouchEnd={() => {
                        // Snap back to reality (Mobile)
                        setTimeout(() => {
                            dispatch({ type: 'SET_FREE_WILL', payload: 0.5 });
                            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                                message: "You thought you had control? Cute."
                            });
                        }, 200);
                    }}
                    style={{
                        width: '100%',
                        cursor: 'pointer',
                        height: '24px',
                        accentColor: '#FF00FF',
                        pointerEvents: 'auto',
                        zIndex: 10001,
                        transition: 'value 0.2s ease'
                    }}
                />
            </div>

            {/* Close Button - Re-added as it was removed by the snippet */}
            <SquishyButton
                onClick={() => setIsOpen(false)}
                preset="STIFF"
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(255,0,0,0.3)',
                    border: 'none',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    color: '#fff',
                    zIndex: 10002 // Ensure it's above other elements
                }}
            >
                X
            </SquishyButton>



            {/* SAVE MANAGEMENT */}
            <div style={{ marginBottom: '15px', borderTop: '1px solid #333', paddingTop: '10px' }}>
                <div style={{ color: '#00FFCC', fontSize: '12px', marginBottom: '8px' }}>CHRONOS PROTOCOL</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                    <SquishyButton
                        onClick={() => {
                            const str = PersistenceSystem.exportToString(state);
                            navigator.clipboard.writeText(str);
                            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                                message: "Save copied to clipboard. Don't lose it."
                            });
                        }}
                        preset="BOUNCY"
                        style={{ fontSize: '10px', background: '#333', color: '#FFF' }}
                    >
                        COPY STRING
                    </SquishyButton>

                    <SquishyButton
                        onClick={() => PersistenceSystem.downloadFile(state)}
                        preset="BOUNCY"
                        style={{ fontSize: '10px', background: '#333', color: '#FFF' }}
                    >
                        DOWNLOAD .VOID
                    </SquishyButton>
                </div>

                <div style={{ marginTop: '5px' }}>
                    <input
                        type="file"
                        accept=".void,.json"
                        style={{ display: 'none' }}
                        id="save-file-upload"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            const reader = new FileReader();
                            reader.onload = (event) => {
                                const content = event.target.result;
                                const newState = PersistenceSystem.importFromJSON(content);
                                if (newState) {
                                    dispatch({ type: 'IMPORT_SAVE', payload: newState });
                                    eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                                        message: "File loaded. Welcome back to the past."
                                    });
                                } else {
                                    alert("Invalid save file!");
                                }
                            };
                            reader.readAsText(file);
                        }}
                    />
                    <SquishyButton
                        onClick={() => document.getElementById('save-file-upload').click()}
                        preset="BOUNCY"
                        style={{ width: '100%', fontSize: '10px', background: '#333', color: '#00FFCC', border: '1px dashed #00FFCC' }}
                    >
                        UPLOAD .VOID FILE
                    </SquishyButton>
                </div>

                <div style={{ marginTop: '5px' }}>
                    <SquishyButton
                        onClick={() => {
                            const str = prompt("Paste your save string here:");
                            if (str) {
                                const newState = PersistenceSystem.importFromString(str);
                                if (newState) {
                                    dispatch({ type: 'IMPORT_SAVE', payload: newState });
                                    eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                                        message: "Timeline shifted. Hope you know what you're doing."
                                    });
                                } else {
                                    alert("Invalid save string!");
                                }
                            }
                        }}
                        preset="BOUNCY"
                        style={{ width: '100%', fontSize: '10px', background: '#333', color: '#00FFCC', border: '1px dashed #00FFCC' }}
                    >
                        IMPORT SAVE
                    </SquishyButton>
                </div>

                <div style={{ marginTop: '5px' }}>
                    <SquishyButton
                        onClick={() => {
                            if (confirm("Are you sure? This will wipe your local save.")) {
                                PersistenceSystem.clear();
                                window.location.reload();
                            }
                        }}
                        preset="STIFF"
                        style={{ width: '100%', fontSize: '10px', background: '#300', color: '#F00' }}
                    >
                        HARD RESET (CLEAR SAVE)
                    </SquishyButton>
                </div>
            </div>

            {/* MANUAL / README */}
            <div style={{ marginBottom: '15px', borderTop: '1px solid #333', paddingTop: '10px' }}>
                <SquishyButton
                    onClick={() => {
                        eventBus.emit('OPEN_README');
                        setIsOpen(false); // Close settings to show manual
                    }}
                    preset="BOUNCY"
                    style={{ width: '100%', fontSize: '12px', background: '#222', color: '#00FFFF', border: '1px solid #00FFFF' }}
                >
                    OPEN MANUAL.MD
                </SquishyButton>
            </div>

            {/* Version Info - Re-added as it was removed by the snippet */}
            <div style={{ fontSize: '10px', color: '#666', marginTop: '10px', borderTop: '1px solid #333', paddingTop: '5px' }}>
                VERSION: 0.9.1(BETA)
                <br />
                BUILD: {new Date().toLocaleDateString()}
            </div>
        </div>
    );
};

export default SettingsMenu;
