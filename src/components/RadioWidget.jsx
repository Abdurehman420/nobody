import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { eventBus } from '../systems/EventBus';
import { audioSynthesizer } from '../systems/AudioSynthesizer';
import SquishyButton from './SquishyButton';
import WobbleText from './WobbleText';

/**
 * NEON MYCELIUM - Interdimensional Radio Widget
 * 
 * Floating radio that "tunes" to different cosmic frequencies.
 * Station names are procedurally generated for "Cosmic Garbage" feel.
 */

const STATIONS = [
    // Original Synth Stations
    { freq: '108.7', name: 'VOID FM', vibe: 'Existential jazz for the damned', type: 'synth', config: { freq: 108.7, type: 'sine', detune: -100 } },
    { freq: '666.6', name: 'FLESH RADIO', vibe: 'Throbbing meat beats', type: 'synth', config: { freq: 666.6, type: 'sawtooth', detune: 50 } },
    { freq: '404.0', name: 'NOT FOUND', vibe: 'Static and regret', type: 'synth', config: { freq: 404.0, type: 'square', detune: 0 } },
    { freq: '∞', name: 'THE SPIRAL', vibe: 'Infinite descent muzak', type: 'synth', config: { freq: 440, type: 'triangle', detune: 200 } },
    { freq: '0.00', name: 'NULL WAVE', vibe: 'The sound of nothing happening', type: 'synth', config: { freq: 261.63, type: 'sine', detune: -50 } },
    { freq: 'π', name: 'IRRATIONAL PULSE', vibe: 'Numbers that never end', type: 'synth', config: { freq: 314.159, type: 'sawtooth', detune: 100 } },
    { freq: '13.13', name: 'BUREAUCRAT LOUNGE', vibe: 'Paperwork ambience', type: 'synth', config: { freq: 220, type: 'square', detune: -25 } },
    { freq: '99.9', name: 'FEVER DREAM', vibe: 'Your neurons are on fire', type: 'synth', config: { freq: 523.25, type: 'triangle', detune: 150 } },
    { freq: '42.0', name: 'GARY\'S MIXTAPE', vibe: 'Lo-Fi Hip Hop to study/exist to', type: 'synth', config: { freq: 150, type: 'sine', detune: 10 } },

    // Internet Radio Stations
    { freq: 'REAL', name: 'Real Radio?', vibe: 'Radio is a Foreign Country', type: 'stream', url: 'https://radio.garden/api/ara/content/listen/b35yEqjv/channel.mp3' },
    { freq: 'WEIRD', name: 'This is weird', vibe: 'Shirley & Spinoza', type: 'stream', url: 'https://radio.garden/api/ara/content/listen/BgoQjOjJ/channel.mp3' },
    { freq: 'BURN', name: 'Brennpunkt', vibe: 'Radio Brennpunkt', type: 'stream', url: 'https://radio.garden/api/ara/content/listen/E0dcOHH1/channel.mp3' },
    { freq: 'BIRD', name: 'Black Sparrow', vibe: 'Black Sparrow Radio', type: 'stream', url: 'https://radio.garden/api/ara/content/listen/2u7p_6ix/channel.mp3' },
    { freq: 'NZ', name: 'Morrinsville', vibe: 'Positively Morrinsville 87.7FM', type: 'stream', url: 'https://radio.garden/api/ara/content/listen/MsPLmr4Z/channel.mp3' },
    { freq: 'SPACE', name: 'Space?', vibe: 'SomaFM Space Station', type: 'stream', url: 'https://ice2.somafm.com/spacestation-128-mp3' },
    { freq: 'SEAL', name: 'SpinninSeal', vibe: 'Spinning Seal FM', type: 'stream', url: 'https://radio.garden/api/ara/content/listen/d7RMpZjk/channel.mp3' },
    { freq: 'DPRK', name: 'Literally North Korea', vibe: 'Pyongyang FM 105.2', type: 'stream', url: 'https://radio.garden/api/ara/content/listen/NPzavm5p/channel.mp3' },
    { freq: 'UFO', name: 'Taiwan?', vibe: 'UFO Network', type: 'stream', url: 'https://radio.garden/api/ara/content/listen/Azn7mp47/channel.mp3' },
    { freq: 'SUN', name: 'Babubasha', vibe: 'Sunshine FM 88.1', type: 'stream', url: 'https://radio.garden/api/ara/content/listen/GWApbiy1/channel.mp3' },
    { freq: 'OLD', name: 'Unbewaffnete Bürger', vibe: 'Ancient FM', type: 'stream', url: 'https://radio.garden/api/ara/content/listen/-KZR7rZZ/channel.mp3' },
];

const RadioWidget = () => {
    const { state } = useGame(); // Get global state
    const masterVolume = state.masterVolume !== undefined ? state.masterVolume : 0.5;

    const [isOpen, setIsOpen] = useState(false);
    const [currentStation, setCurrentStation] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5); // Local radio volume
    const [tuningAnimation, setTuningAnimation] = useState(false);
    const oscillatorRef = useRef(null);

    const station = STATIONS[currentStation];

    // Initialize Web Audio on mount
    useEffect(() => {
        return () => {
            stopMusic();
        };
    }, []);

    const stopMusic = () => {
        if (oscillatorRef.current) {
            if (typeof oscillatorRef.current.stop === 'function') {
                try {
                    oscillatorRef.current.stop();
                } catch (e) {
                    console.warn("Error stopping radio:", e);
                }
            }
            oscillatorRef.current = null;
        }
    };

    const playMusic = () => {
        stopMusic();

        if (!audioSynthesizer.isInitialized) audioSynthesizer.init();

        if (station.type === 'stream') {
            const radioNode = audioSynthesizer.playInternetRadio(station.url, volume);
            oscillatorRef.current = radioNode;
        } else {
            // Legacy Synth Station
            // If config is missing (legacy array), map it manually (fallback)
            let config = station.config;
            if (!config) {
                // Fallback for safety if I missed something, but I updated the array above
                config = { freq: 440, type: 'sine', detune: 0 };
            }
            const radioNode = audioSynthesizer.playRadioStation(config, volume);
            oscillatorRef.current = radioNode;
        }
    };

    // Handle Play/Stop and Station Change
    useEffect(() => {
        if (isPlaying) {
            playMusic();
        } else {
            stopMusic();
        }
    }, [isPlaying, currentStation]);

    // Handle Copyright Strikes
    useEffect(() => {
        const handleStrikeStart = () => {
            if (isPlaying) {
                setIsPlaying(false); // Update state to reflect stop
                stopMusic();
            }
        };

        eventBus.on('COPYRIGHT_STRIKE_START', handleStrikeStart);
        return () => {
            eventBus.off('COPYRIGHT_STRIKE_START', handleStrikeStart);
        };
    }, [isPlaying]);

    // Handle Volume Change separately
    useEffect(() => {
        if (oscillatorRef.current && typeof oscillatorRef.current.setVolume === 'function') {
            // Radio volume is independent of Master Volume (per user request)
            oscillatorRef.current.setVolume(volume);
        }
    }, [volume]);

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
                        RADIO
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
                        // useEffect will handle the actual volume setting
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

export default React.memo(RadioWidget);
