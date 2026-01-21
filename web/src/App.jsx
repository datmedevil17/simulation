import React, { useState, useEffect } from 'react';
import { WalletProvider } from './providers/wallet-provider';
import { useSimCityProgram } from './hooks/use-simcity-program';
import { LandingPage } from './components/LandingPage';
import GameCanvas from './components/GameCanvas';
import TitleBar from './components/HUD/TitleBar';
import Toolbar from './components/HUD/Toolbar';
import InfoPanel from './components/HUD/InfoPanel';

function GameContent() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entered, setEntered] = useState(false);
  
  const simCity = useSimCityProgram();
  console.log("GameContent Render: successMessage =", simCity.successMessage);

  // Game State
  const [cityState, setCityState] = useState({
    name: 'My City',
    population: 0,
    simTime: 0
  });
  const [selectedObject, setSelectedObject] = useState(null);
  const [activeTool, setActiveTool] = useState('select');
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (game) {
      game.simCity = simCity;
      
      // Sync state immediately if available
      const account = simCity.erCityAccount || simCity.cityAccount;
      if (account) {
          game.updateFromSolana(account);
      }
    }
  }, [game, simCity, simCity.cityAccount, simCity.erCityAccount]);

  const handleGameLoad = (gameInstance) => {
    setGame(gameInstance);
    window.game = gameInstance;
    gameInstance.simCity = simCity;
    setLoading(false);
    
    // Initialize state from game
    setCityState({
      name: gameInstance.city.name,
      population: gameInstance.city.population,
      simTime: gameInstance.city.simTime
    });
    setActiveTool(gameInstance.activeToolId);
    setIsPaused(gameInstance.isPaused);

    // Bind callbacks
    gameInstance.onSimulationChanged = (city) => {
      setCityState({
        name: city.name,
        population: city.population,
        simTime: city.simTime
      });
    };

    gameInstance.onSelectedObjectChanged = (obj) => {
      setSelectedObject(obj);
    };
  };

  const handleToolSelect = (toolId) => {
    if (game) {
      game.activeToolId = toolId;
      setActiveTool(toolId);
    }
  };

  const handleTogglePause = () => {
    if (game) {
      game.isPaused = !game.isPaused;
      setIsPaused(game.isPaused);
    }
  };

  const handleExit = () => {
    setEntered(false);
    setGame(null); // Optional: clear game state if needed
  };

  if (!entered) {
    return <LandingPage onEnter={() => setEntered(true)} simCity={simCity} />;
  }

  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <GameCanvas onGameLoad={handleGameLoad} />
      
      {loading && (
        <div id="loading" className="text-overlay" style={{ visibility: 'visible' }}>
          <div>LOADING...</div>
        </div>
      )}

      {!loading && (
        <>
           {isPaused && (
            <div id="paused-text" className="text-overlay" style={{ visibility: 'visible' }}>
              <div>PAUSED</div>
            </div>
          )}

          <div id="ui" style={{ pointerEvents: 'none' }}>
            <TitleBar 
              money={simCity.cityAccount?.money ? simCity.cityAccount.money.toString() : 1000}
              cityName={cityState.name}
              simTime={cityState.simTime}
              population={simCity.cityAccount?.population ? simCity.cityAccount.population.toString() : cityState.population}
              onExit={handleExit}
              style={{ pointerEvents: 'auto' }}
            />
            
            <Toolbar 
              activeTool={activeTool}
              onToolSelect={handleToolSelect}
              isPaused={isPaused}
              onTogglePause={handleTogglePause}
              style={{ pointerEvents: 'auto' }}
            />
            
            <InfoPanel selectedObject={selectedObject} style={{ pointerEvents: 'auto' }} />

            {/* ERROR TOAST */}
            {simCity.error && (
                <div className="absolute top-32 left-1/2 transform -translate-x-1/2 p-4 bg-red-600/90 text-white rounded shadow-lg pointer-events-none z-[10000]">
                    <span className="font-bold">Error:</span> {simCity.error}
                </div>
            )}
            
            {/* SUCCESS TOAST */}
            {simCity.successMessage && (
                <div className="absolute top-32 left-1/2 transform -translate-x-1/2 p-4 bg-green-600/90 text-white rounded shadow-lg pointer-events-none z-[10000] transition-all duration-300">
                    <span className="font-bold">Success:</span> {simCity.successMessage}
                    {simCity.successTx && (
                        <div className="mt-1 text-xs">
                           <a 
                             href={`https://explorer.solana.com/tx/${simCity.successTx}?cluster=devnet`} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="underline hover:text-green-200 pointer-events-auto"
                           >
                             View Transaction
                           </a>
                        </div>
                    )}
                </div>
            )}
            
            {/* INFO TOAST */}
            {simCity.infoMessage && !simCity.successMessage && !simCity.error && (
                <div className="absolute top-32 left-1/2 transform -translate-x-1/2 p-4 bg-blue-600/90 text-white rounded shadow-lg pointer-events-none z-[10000] transition-all duration-300">
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>{simCity.infoMessage}</span>
                    </div>
                </div>
            )}

            <div id="instructions" style={{ pointerEvents: 'none' }}>
              INTERACT - Left Mouse<br/>
              ROTATE - Right Mouse<br/>
              PAN - Control + Right Mouse<br/>
              ZOOM - Scroll
            </div>
            <div id="version" style={{ pointerEvents: 'none' }}>
              v0.3.0
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <GameContent />
    </WalletProvider>
  );
}
