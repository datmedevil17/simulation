import React, { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSimCityProgram } from '../../hooks/use-simcity-program';
import { Button } from '../ui/button';
import personIcon from '/icons/person.png';

export default function TitleBar({ money, cityName, simTime, population, onExit, style }) {
  const date = new Date('1/1/2023');
  date.setDate(date.getDate() + simTime);
  const dateString = date.toLocaleDateString('en-GB');

  const {
    cityAccount,
    delegationStatus,
    checkDelegation,
    createSession,
    sessionToken,
    isSessionLoading,
    delegate,
    commit,
    undelegate,
    isLoading,
    isDelegating,
    initializeCity
  } = useSimCityProgram();

  const handleAction = async (action, actionName) => {
    try {
        await action();
        console.log(`${actionName} successful`);
        checkDelegation();
    } catch (err) {
        console.error(`${actionName} failed:`, err);
    }
  };

  return (
    <div id="title-bar" style={style}>
      <div className="title-bar-left-items title-bar-items">
        ${money}
      </div>
      <div className="title-bar-center-items title-bar-items">
        <span id="city-name">{cityName}</span>
        <span>&nbsp;-&nbsp;</span>
        <span id="sim-time">{dateString}</span>
      </div>
      <div className="title-bar-right-items title-bar-items" style={{ gap: '10px' }}>
        <img id="population-icon" src={personIcon} alt="Population" />
        <span id="population-counter">{population}</span>
        
        {/* Solana Actions */}
        <div className="flex items-center gap-2 ml-4">
            {delegationStatus === 'undelegated' || delegationStatus === 'checking' ? (
                <Button 
                    size="sm" 
                    className="bg-indigo-600 hover:bg-indigo-700 h-9 font-bold"
                    onClick={() => handleAction(delegate, "Delegate")}
                    disabled={isLoading || delegationStatus === 'checking'}
                >
                    {isDelegating ? "Delegating..." : "Delegate"}
                </Button>
            ) : !sessionToken ? (
                <Button 
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 h-9 font-bold"
                    onClick={() => handleAction(createSession, "Create Session")} 
                    disabled={isSessionLoading}
                >
                    {isSessionLoading ? "Creating..." : "Create Session Key"}
                </Button>
            ) : (
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs bg-green-900/80 px-3 py-1.5 rounded border border-green-500/50 text-green-400 font-bold tracking-wide shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
                        ACTIVE SESSION
                    </span>
                    
                    <Button 
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 h-9 font-bold"
                        onClick={async () => {
                            await handleAction(undelegate, "Undelegate");
                            if (onExit) onExit();
                        }} 
                        disabled={isLoading}
                    >
                        Exit
                    </Button>
                </div>
            )}
        </div>

        <div style={{ marginLeft: '10px' }}>
            <WalletMultiButton style={{ 
                height: '36px', 
                backgroundColor: '#3a3f50d3',
                fontFamily: 'inherit',
                fontSize: '0.8em'
            }} />
        </div>
      </div>
    </div>
  );
}
