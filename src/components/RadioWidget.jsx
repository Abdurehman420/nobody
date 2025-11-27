import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext'; // Import useGame
import { eventBus } from '../systems/EventBus';
import { audioManager } from '../engine/audio'; // Import audioManager
import SquishyButton from './SquishyButton';
import WobbleText from './WobbleText';

/**
 * NEON MYCELIUM - Interdimensional Radio Widget
 * 
 * Floating radio that "tunes" to different cosmic frequencies.
 * Station names are procedurally generated for "Cosmic Garbage" feel.
 */

const STATIONS = [
    { freq: '108.7', name: 'VOID FM', vibe: 'Existential jazz for the damned' },
    { freq: '666.6', name: 'FLESH RADIO', vibe: 'Throbbing meat beats' },
    { freq: '404.0', name: 'NOT FOUND', vibe: 'Static and regret' },
    { freq: '∞', name: 'THE SPIRAL', vibe: 'Infinite descent muzak' },
    { freq: '0.00', name: 'NULL WAVE', vibe: 'The sound of nothing happening' },
    { freq: 'π', name: 'IRRATIONAL PULSE', vibe: 'Numbers that never end' },
    { freq: '13.13', name: 'BUREAUCRAT LOUNGE', vibe: 'Paperwork ambience' },
    { freq: '99.9', name: 'FEVER DREAM', vibe: 'Your neurons are on fire' },
    { freq: '42.0', name: 'GARY\'S MIXTAPE', vibe: 'Lo-Fi Hip Hop to study/exist to' },
];

const RadioWidget = () => {
    const { state } = useGame(); // Get global state
    const masterVolume = state.masterVolume !== undefined ? state.masterVolume : 0.5;

    const [isOpen, setIsOpen] = useState(false);
    const [currentStation, setCurrentStation] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5); // Local radio volume
    const [tuningAnimation, setTuningAnimation] = useState(false);
    // audioContextRef is no longer needed as we use audioManager.ctx
    const oscillatorRef = useRef(null);
    const gainNodeRef = useRef(null);

    const station = STATIONS[currentStation];

    // Initialize Web Audio on mount
    useEffect(() => {
        // The audio context and gain node are now initialized within playMusic
        // to handle potential user gesture requirements for audio playback.
        return () => {
            stopMusic();
            // Do NOT close the shared context!
        };
    }, []);

    const stopMusic = () => {
        if (oscillatorRef.current) {
            // Check if it's the new object with stop method
            if (typeof oscillatorRef.current.stop === 'function') {
                oscillatorRef.current.stop();
            } else {
                // Legacy fallback (shouldn't happen with new code)
                try { oscillatorRef.current.stop(); } catch (e) { }
            }
            oscillatorRef.current = null;
        }
    };

    const playMusic = () => {
        // Ensure audio manager is initialized
        if (!audioManager.ctx) {
            audioManager.init();
        }

        stopMusic();

        // Station-specific frequencies and waveforms
        const stationConfigs = {
            0: { freq: 108.7, type: 'sine', detune: -100 }, // VOID FM - ethereal
            1: { freq: 666.6, type: 'sawtooth', detune: 50 }, // FLESH RADIO - harsh
            2: { freq: 404.0, type: 'square', detune: 0 }, // NOT FOUND - digital
            3: { freq: 440, type: 'triangle', detune: 200 }, // THE SPIRAL - descending
            4: { freq: 261.63, type: 'sine', detune: -50 }, // NULL WAVE - nothing
            5: { freq: 314.159, type: 'sawtooth', detune: 100 }, // IRRATIONAL - chaotic
            6: { freq: 220, type: 'square', detune: -25 }, // BUREAUCRAT - monotone
            7: { freq: 523.25, type: 'triangle', detune: 150 }, // FEVER DREAM - high
            8: { freq: 150, type: 'sine', detune: 10 }, // GARY'S MIXTAPE - chill lo-fi
        };

        const config = stationConfigs[currentStation];

        // Use the new Void-Fi engine
        import('../systems/AudioSynthesizer').then(({ audioSynthesizer }) => {
            // Initialize if needed (though playRadioStation checks too)
            if (!audioSynthesizer.isInitialized) audioSynthesizer.init();

            // ROOT CAUSE FIX: Radio has independent volume regulator
            const radioNode = audioSynthesizer.playRadioStation(config, volume);
            oscillatorRef.current = radioNode; // Store the control object
        });
    };

    useEffect(() => {
        // Listen for copyright strikes
        const handleStrikeStart = () => {
            if (isPlaying) {
                stopMusic();
                // Force update UI to show muted state if needed, but stopMusic handles the audio
            }
        };

        const handleStrikeEnd = () => {
            // Optionally resume? Nah, let them click play again.
        };

        eventBus.on('COPYRIGHT_STRIKE_START', handleStrikeStart);
        eventBus.on('COPYRIGHT_STRIKE_END', handleStrikeEnd);

        return () => {
            eventBus.off('COPYRIGHT_STRIKE_START', handleStrikeStart);
            eventBus.off('COPYRIGHT_STRIKE_END', handleStrikeEnd);
        };
    }, [isPlaying]);

    useEffect(() => {
        if (isPlaying) {
            playMusic();
        } else {
            stopMusic();
        }
    }, [isPlaying, currentStation, volume]); // Removed masterVolume dependency

    const handleTune = (direction) => {
        setTuningAnimation(true);
        setTimeout(() => setTuningAnimation(false), 300);

        if (direction === 'next') {
            setCurrentStation((prev) => (prev + 1) % STATIONS.length);
        } else {
            setCurrentStation((prev) => (prev - 1 + STATIONS.length) % STATIONS.length);
        }
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    if (!isOpen) {
        return (
            <SquishyButton
                onClick={() => setIsOpen(true)}
                preset="WOBBLY"
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '100px',
                    background: '#1a1a2e',
                    border: '2px solid #00ff00',
                    color: '#00ff00',
                    padding: '10px',
                    fontSize: '20px',
                    cursor: 'pointer',
                    zIndex: 50,
                    boxShadow: '0 0 15px rgba(0, 255, 0, 0.3)',
                    fontFamily: 'monospace'
                }}
                title="Interdimensional Radio"
            >
                📻
            </SquishyButton>
        );
    }

    return (
        <div style={{
            position: 'absolute',
            bottom: '70px',
            right: '20px',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '3px solid #00ff00',
            borderRadius: '12px',
            padding: '20px',
            color: '#00ff00',
            zIndex: 100,
            width: '280px',
            fontFamily: 'monospace',
            boxShadow: '0 0 30px rgba(0, 255, 0, 0.4), inset 0 0 20px rgba(0, 255, 0, 0.1)',
            animation: tuningAnimation ? 'radioStatic 0.3s linear' : 'none'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
                borderBottom: '1px solid #00ff00',
                paddingBottom: '10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>📻</span>
                    <WobbleText intensity={1} speed={0.003}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>RADIO</span>
                    </WobbleText>
                </div>
                <SquishyButton
                    onClick={() => setIsOpen(false)}
                    preset="STIFF"
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#00ff00',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    [X]
                </SquishyButton>
            </div>

            {/* Frequency Display */}
            <div style={{
                background: '#0a0a15',
                border: '2px solid #003300',
                borderRadius: '4px',
                padding: '15px',
                marginBottom: '15px',
                textAlign: 'center',
                boxShadow: 'inset 0 0 10px rgba(0, 255, 0, 0.2)'
            }}>
                <div style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#00ff00',
                    textShadow: '0 0 10px #00ff00',
                    marginBottom: '5px',
                    filter: tuningAnimation ? 'blur(2px)' : 'none',
                    transition: 'filter 0.1s'
                }}>
                    {station.freq}
                </div>
                <div style={{
                    fontSize: '16px',
                    color: '#00dd00',
                    marginBottom: '8px'
                }}>
                    <WobbleText intensity={0.8} speed={0.002}>
                        {station.name}
                    </WobbleText>
                </div>
                <div style={{
                    fontSize: '10px',
                    color: '#007700',
                    fontStyle: 'italic'
                }}>
                    {station.vibe}
                </div>
            </div>

            {/* Controls */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
            }}>
                <SquishyButton
                    onClick={() => handleTune('prev')}
                    preset="BOUNCY"
                    style={{
                        background: '#003300',
                        border: '1px solid #00ff00',
                        color: '#00ff00',
                        padding: '8px 15px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    ◀
                </SquishyButton>

                <SquishyButton
                    onClick={togglePlay}
                    preset="WOBBLY"
                    style={{
                        background: isPlaying ? '#00ff00' : '#003300',
                        border: '2px solid #00ff00',
                        color: isPlaying ? '#000' : '#00ff00',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        boxShadow: isPlaying ? '0 0 15px rgba(0, 255, 0, 0.6)' : 'none'
                    }}
                >
                    {isPlaying ? '⏸' : '▶'}
                </SquishyButton>

                <SquishyButton
                    onClick={() => handleTune('next')}
                    preset="BOUNCY"
                    style={{
                        background: '#003300',
                        border: '1px solid #00ff00',
                        color: '#00ff00',
                        padding: '8px 15px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    ▶
                </SquishyButton>
            </div>

            {/* Volume Control */}
            <div style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '10px', display: 'block', marginBottom: '5px' }}>
                    VOLUME: {Math.round(volume * 100)}%
                </label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setVolume(v);
                        if (oscillatorRef.current && typeof oscillatorRef.current.setVolume === 'function') {
                            oscillatorRef.current.setVolume(v);
                        }
                    }}
                    style={{
                        width: '100%',
                        accentColor: '#00ff00'
                    }}
                />
            </div>

            {/* Playing Indicator */}
            {isPlaying && (
                <div style={{
                    marginTop: '12px',
                    fontSize: '10px',
                    color: '#007700',
                    textAlign: 'center',
                    animation: 'pulse 1.5s ease-in-out infinite'
                }}>
                    ♪ NOW BROADCASTING ♪
                </div>
            )}

            {/* Add CSS animation */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 1; }
                }
                @keyframes radioStatic {
                    0%, 100% { filter: brightness(1); }
                    50% { filter: brightness(1.5) contrast(1.2); }
                }
            `}</style>
        </div>
    );
};

export default RadioWidget;
