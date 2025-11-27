import React, { useState, useEffect } from 'react';
import './index.css';
import './styles/app-juice.css';
import { GameProvider, useGame } from './context/GameContext';
import CanvasLayer from './components/CanvasLayer';
import ShaderBackground from './components/ShaderBackground';
import BureaucratInterface from './components/BureaucratInterface';
import StarMap from './components/StarMap';
import WinampVisualizer from './components/WinampVisualizer';
import PinealGland from './components/PinealGland';
import SettingsMenu from './components/SettingsMenu';
import PermitOffice from './components/PermitOffice';
import DebugOverlay from './components/DebugOverlay';
import CrashScreen from './components/CrashScreen';

// Juice & Charisma Components
import GaryTheTumor from './components/GaryTheTumor';
import HateMail from './components/HateMail';
import ComboCounter from './components/ComboCounter';
import SmartCursor from './components/SmartCursor';
import RadioWidget from './components/RadioWidget';
import KeyboardHints from './components/KeyboardHints';
import CheatCartridges from './components/CheatCartridges';
import SuggestionBox from './components/SuggestionBox';
import FloobleClank from './components/FloobleClank';
import TOSMonolith from './components/TOSMonolith';
import SunkCostPit from './components/SunkCostPit';
import BananaForScale from './components/BananaForScale';
import PhilosophersStone from './components/PhilosophersStone';
import SchrodingersCatbox from './components/SchrodingersCatbox';
import PaidPromotionBlimp from './components/PaidPromotionBlimp';
import NFTCollection from './components/NFTCollection';
import MicroTransactionPopup from './components/MicroTransactionPopup';
import CopyrightStrike from './components/CopyrightStrike';
import DevConsoleMockery from './components/DevConsoleMockery';
import HeatDeathCountdown from './components/HeatDeathCountdown';
import SentientMoldNeighbor from './components/SentientMoldNeighbor';
import BackseatGamer from './components/BackseatGamer';
import InterdimensionalCustoms from './components/InterdimensionalCustoms';
import CaptchaCheckpoint from './components/CaptchaCheckpoint';
import CouncilOfGarys from './components/CouncilOfGarys';
import ReplyAllDisaster from './components/ReplyAllDisaster';
import CensoredPipe from './components/CensoredPipe';
import RecursiveReviewModal from './components/RecursiveReviewModal';
import CreditsHallucination from './components/CreditsHallucination';

// Import juice integration
import { juiceIntegration } from './systems/JuiceIntegration';

import ReadmeModal from './components/ReadmeModal';
import { eventBus } from './systems/EventBus';

const GameContent = () => {
  const { state, dispatch } = useGame();
  const [showReadme, setShowReadme] = useState(false);

  // Listen for manual open request
  useEffect(() => {
    const handleOpenReadme = () => setShowReadme(true);
    eventBus.on('OPEN_README', handleOpenReadme);
    return () => eventBus.off('OPEN_README', handleOpenReadme);
  }, []);

  // Initialize juice systems
  useEffect(() => {
    juiceIntegration.init();

    // Resume audio on first interaction
    const handleInteraction = () => {
      juiceIntegration.resumeAudio();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  if (state.crashed) {
    return <CrashScreen />;
  }

  return (
    <div className="game-container">
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        textAlign: 'right',
        color: 'var(--color-stardust)',
        fontFamily: 'monospace',
        zIndex: 10,
        pointerEvents: 'none',
        textShadow: '0 0 5px black'
      }}>
        <div style={{ color: '#32CD32' }}>STARDUST: {Math.floor(state.resources.stardust)}</div>
        <div style={{ color: '#00FFFF' }}>FLUX: {Math.floor(state.resources.flux)}</div>
        <div style={{ color: '#9400D3' }}>LUCIDITY: {Math.floor(state.resources.lucidity)}</div>
      </div>
      <DebugOverlay />
      <CanvasLayer />
      <ShaderBackground
        flux={state.resources.flux}
        nodeCount={state.nodes.length}
        stockPhotoInvasionActive={state.stockPhotoInvasionActive}
      />
      <BureaucratInterface />
      <WinampVisualizer />
      <StarMap />
      <SettingsMenu />

      {/* Juice & Charisma Layer */}
      <GaryTheTumor gameState={state} />
      <RadioWidget />
      {/* Stacked on right side: HateMail, then PermitOffice, then PinealGland */}
      <HateMail gameState={state} dispatch={dispatch} />
      <PermitOffice />
      <PinealGland />
      <ComboCounter gameState={state} />
      <SmartCursor gameState={state} />
      <KeyboardHints />
      <CheatCartridges gameState={state} dispatch={dispatch} />

      {/* MODULE F Components */}
      <SuggestionBox gameState={state} dispatch={dispatch} />
      <FloobleClank gameState={state} dispatch={dispatch} />
      <SunkCostPit gameState={state} dispatch={dispatch} />
      {state.bananaVisible && (
        <BananaForScale gameState={state} dispatch={dispatch} />
      )}
      <PhilosophersStone gameState={state} />
      {/* Schrödinger's Catboxes */}
      {state.schrodingerBoxes && state.schrodingerBoxes.map(box => (
        <SchrodingersCatbox
          key={box.id}
          position={{ x: box.x, y: box.y }}
          onResolve={(result) => dispatch({ type: 'RESOLVE_CATBOX', payload: { boxId: box.id, ...result } })}
        />
      ))}
      <PaidPromotionBlimp />
      <NFTCollection gameState={state} dispatch={dispatch} />
      <MicroTransactionPopup gameState={state} />
      <CopyrightStrike />
      <DevConsoleMockery />
      <HeatDeathCountdown gameState={state} />
      <SentientMoldNeighbor gameState={state} dispatch={dispatch} />
      <BackseatGamer />
      <InterdimensionalCustoms gameState={state} dispatch={dispatch} />
      <CaptchaCheckpoint gameState={state} />
      <CouncilOfGarys gameState={state} />
      <ReplyAllDisaster gameState={state} />
      <CensoredPipe gameState={state} />

      {/* TOS Monolith Modal */}
      {state.tosMonolithActive && (
        <TOSMonolith
          onAgree={() => dispatch({ type: 'DESTROY_TOS_MONOLITH' })}
          onDestroy={() => dispatch({ type: 'DESTROY_TOS_MONOLITH' })}
        />
      )}

      {/* Recursive Review Loop */}
      <RecursiveReviewModal />

      {/* Credits Hallucination */}
      <CreditsHallucination />

      {/* In-Game Manual (README) */}
      <ReadmeModal forceOpen={showReadme} onClose={() => setShowReadme(false)} />
    </div>
  );
};

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <GameContent />
      </GameProvider>
    </ErrorBoundary>
  );
}

export default App;
