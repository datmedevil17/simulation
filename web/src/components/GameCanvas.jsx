import React, { useEffect, useRef, useState } from 'react';
import { Game } from '../scripts/game';

export default function GameCanvas({ onGameLoad }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Game
    const cityData = null; // Or load from save
    gameRef.current = new Game(containerRef.current, cityData, () => {
        if (onGameLoad) onGameLoad(gameRef.current);
    });

    return () => {
      // Cleanup
      if (gameRef.current) {
        gameRef.current.dispose();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []); // Empty dependency array means run once on mount

  return (
    <div 
      ref={containerRef} 
      id="render-target" 
      style={{ width: '100%', height: '100%' }}
    />
  );
}
