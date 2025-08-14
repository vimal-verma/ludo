import React, { useReducer, useEffect, useRef, useState } from 'react';
import Board from './components/Board';
import Dice from './components/Dice';
import './Ludo.css';
import { gameReducer, initialState } from './gameLogic/reducer';
import { playSound } from './utils/sounds';
import GameSetup from './components/GameSetup';

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function App() {
  const [appState, setAppState] = useState('setup'); // 'setup', 'playing'
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { pieces, diceValue, currentPlayer, isRolling, movablePieces, gameState, winner, playerConfig } = state;
  const prevState = usePrevious(state);

  const handleStartGame = (config) => {
    dispatch({ type: 'START_GAME', payload: { playerConfig: config } });
    setAppState('playing');
  };

  const handleDiceRoll = () => {
    if (isRolling || gameState !== 'roll') return;
    playSound('roll');
    dispatch({ type: 'ROLL_DICE_START' });

    // Animate dice roll
    setTimeout(() => {
      const finalValue = Math.floor(Math.random() * 6) + 1;
      dispatch({ type: 'ROLL_DICE_COMPLETE', payload: { roll: finalValue } });
    }, 500);
  };

  const handlePieceClick = (color, pieceId) => {
    if (color !== currentPlayer || gameState !== 'move' || !movablePieces.includes(pieceId)) {
      return;
    }
    dispatch({ type: 'MOVE_PIECE', payload: { pieceId } });
  };

  const handleRestart = () => {
    setAppState('setup');
    dispatch({ type: 'RESTART_GAME' });
  }

  useEffect(() => {
    if (!prevState) return; // Don't run on initial render

    // --- Sound Effect Logic ---

    // 1. Check for a win
    if (winner && !prevState.winner) {
      playSound('win');
      return; // Game over, no other sounds needed
    }

    // 2. Check if a move was just completed (state changed from 'move' to 'roll')
    if (prevState.gameState === 'move' && gameState === 'roll') {
      let captureOccurred = false;
      // Check if an opponent's piece was sent to base by the player who just moved
      for (const color of Object.keys(pieces)) {
        // Only check opponent players that are actually in the game
        if (color !== prevState.currentPlayer && prevState.pieces[color] && pieces[color]) {
          const prevBaseCount = prevState.pieces[color].filter(p => p.position === 'base').length;
          const newBaseCount = pieces[color].filter(p => p.position === 'base').length;
          if (newBaseCount > prevBaseCount) {
            captureOccurred = true;
            break;
          }
        }
      }
      playSound(captureOccurred ? 'capture' : 'move');
    }
  }, [state, prevState, pieces, gameState, winner]);

  if (appState === 'setup') {
    return <GameSetup onStartGame={handleStartGame} />;
  }

  return (
    <div className="app">
      <h1>Ludo Game</h1>
      <div className="game-container">
        <Board
          pieces={pieces}
          onPieceClick={handlePieceClick}
          movablePieces={movablePieces}
          currentPlayer={currentPlayer}
          winner={winner}
          onRestart={handleRestart}
          diceValue={diceValue}
          isRolling={isRolling}
          handleDiceRoll={handleDiceRoll}
          gameState={gameState}
          playerConfig={playerConfig}
        />
        <div className="controls">
          <h2>Current Player: <span style={{ color: `var(--${currentPlayer})` }}>
            {playerConfig[currentPlayer]?.name.toUpperCase() || currentPlayer.toUpperCase()}
          </span></h2>
        </div>
      </div>
    </div>
  );
}

export default App;