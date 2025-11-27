import React from 'react';
import useGameStore from '../store/gameStore';
import StarMap from './StarMap';

const UIOverlay = () => {
    const resources = useGameStore(state => state.resources);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
            <div className="panel" style={{ position: 'absolute', top: '20px', left: '20px' }}>
                <h1 className="neon-text-cyan" style={{ margin: 0, fontSize: '24px' }}>NEON MYCELIUM</h1>
                <p className="neon-text-lime" style={{ margin: 0, fontSize: '12px' }}>SYSTEM: ONLINE</p>

                <div style={{ marginTop: '10px' }}>
                    <p className="neon-text-cyan" style={{ margin: 0, fontSize: '14px' }}>STARDUST: {resources.stardust.toFixed(0)}</p>
                    <p className="neon-text-magenta" style={{ margin: 0, fontSize: '14px' }}>FLUX: {resources.flux.toFixed(1)}</p>
                    <p className="neon-text-lime" style={{ margin: 0, fontSize: '14px' }}>LUCIDITY: {resources.lucidity}</p>
                </div>
            </div>
            <StarMap />
        </div>
    );
};

export default UIOverlay;
