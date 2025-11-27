import React, { useState, useEffect, useRef } from 'react';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';

const DevConsoleMockery = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([
        "Neon Mycelium DevTools [Version 1.0.0-beta]",
        "(c) Galactic Federation. All rights reserved.",
        "Type 'help' for a list of commands."
    ]);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F12' || e.key === '`' || e.key === '~') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleCommand = (cmd) => {
        const lowerCmd = cmd.toLowerCase().trim();
        let response = "";

        if (lowerCmd === 'help') {
            response = "Available commands: give, godmode, noclip, kill, help";
        } else if (lowerCmd.startsWith('give')) {
            response = "Error: User is too lazy. Try 'working' instead.";
            eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                message: "Cheating in an idle game? That's a new low, even for you."
            });
        } else if (lowerCmd === 'godmode') {
            response = "God Mode enabled. Just kidding. You're mortal.";
        } else if (lowerCmd === 'noclip') {
            response = "Noclip failed. Physics is mandatory.";
        } else if (lowerCmd === 'kill') {
            response = "Suicide is not the answer. Try 'restart'.";
        } else if (lowerCmd === 'sudo') {
            response = "Nice try. You have no power here.";
        } else {
            response = `Command '${cmd}' not found. Are you just mashing keys?`;
        }

        setHistory(prev => [...prev, `> ${cmd}`, response]);
        setInput('');
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCommand(input);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '300px',
                background: 'rgba(0, 0, 0, 0.9)',
                color: '#00FF00',
                fontFamily: 'monospace',
                fontSize: '14px',
                zIndex: 9999,
                padding: '10px',
                overflowY: 'auto',
                borderBottom: '2px solid #00FF00',
                boxShadow: '0 10px 30px rgba(0, 255, 0, 0.2)'
            }}
            onClick={() => inputRef.current?.focus()}
        >
            {history.map((line, i) => (
                <div key={i} style={{ marginBottom: '5px' }}>{line}</div>
            ))}
            <div style={{ display: 'flex' }}>
                <span style={{ marginRight: '10px' }}>{'>'}</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#00FF00',
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        flex: 1,
                        outline: 'none'
                    }}
                />
            </div>
        </div>
    );
};

export default DevConsoleMockery;
