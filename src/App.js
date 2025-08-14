import React, { useReducer, useEffect, useRef, useState } from 'react';
import Board from './components/Board';
import Dice from './components/Dice';
import './Ludo.css';
import { gameReducer, initialState } from './gameLogic/reducer';
import { playSound } from './utils/sounds';
import { getPiecePath, checkCapture, getAIMove } from './gameLogic/core';
import GameLog from './components/GameLog';
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
  const { pieces, diceValue, currentPlayer, isRolling, movablePieces, gameState, winner, playerConfig, lastMovedPiece, log } = state;
  const [animatingPiece, setAnimatingPiece] = useState(null);
  const prevState = usePrevious(state);

  const handleStartGame = (config) => {
    dispatch({ type: 'START_GAME', payload: { playerConfig: config } });
    setAppState('playing');
  };

  const handleDiceRoll = () => {
    if (isRolling || gameState !== 'roll' || animatingPiece) return;
    dispatch({ type: 'ROLL_DICE_START' });

    // Animate dice roll
    setTimeout(() => {
      const finalValue = Math.floor(Math.random() * 6) + 1;
      dispatch({ type: 'ROLL_DICE_COMPLETE', payload: { roll: finalValue } });
    }, 500);
  };

  const handlePieceClick = (color, pieceId) => {
    if (
      color !== currentPlayer ||
      gameState !== 'move' ||
      !movablePieces.includes(pieceId) ||
      animatingPiece
    ) {
      return;
    }

    const piece = pieces[color].find(p => p.id === pieceId);
    const path = getPiecePath(piece.position, diceValue, color);
    const willCapture = checkCapture(pieces, color, pieceId, diceValue);

    setAnimatingPiece({
      color,
      id: pieceId,
      path,
      willCapture,
      startPosition: piece.position,
    });
  };

  const handleAnimationComplete = () => {
    if (!animatingPiece) return;
    dispatch({ type: 'MOVE_PIECE', payload: { pieceId: animatingPiece.id } });
    setAnimatingPiece(null);
  };

  const handleRestart = () => {
    setAppState('setup');
    setAnimatingPiece(null);
    dispatch({ type: 'RESTART_GAME' });
  }

  useEffect(() => {
    if (!prevState || !log) return;

    // Play sounds based on the last log entry
    if (log.length > prevState.log.length) {
      const lastLog = log[log.length - 1];
      if (lastLog.type === 'roll') playSound('roll');
      // Move and capture sounds are handled by the animation effect for better timing
      if (lastLog.type === 'win') playSound('win');
    }
  }, [log, prevState]);

  // Effect for handling AI turns
  useEffect(() => {
    const isAITurn = playerConfig[currentPlayer]?.type === 'ai';
    if (!isAITurn || winner || animatingPiece) {
      return;
    }

    if (gameState === 'roll') {
      const timer = setTimeout(() => {
        handleDiceRoll();
      }, 1000); // Delay for AI "thinking" before rolling
      return () => clearTimeout(timer);
    }

    if (gameState === 'move') {
      const timer = setTimeout(() => {
        const bestMoveId = getAIMove(pieces, currentPlayer, movablePieces, diceValue);
        if (bestMoveId !== null) {
          handlePieceClick(currentPlayer, bestMoveId);
        }
      }, 1200); // Delay for AI "thinking" before moving
      return () => clearTimeout(timer);
    }
  }, [gameState, currentPlayer, winner, animatingPiece, pieces, movablePieces, diceValue, playerConfig, handleDiceRoll]);

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
          playerConfig={playerConfig}
          lastMovedPiece={lastMovedPiece}
          animatingPiece={animatingPiece}
          onAnimationComplete={handleAnimationComplete}
          diceValue={diceValue}
          isRolling={isRolling}
          handleDiceRoll={handleDiceRoll}
          gameState={gameState}
        />
        <div className="side-panel">
          <div className="controls">
            <h2>Current Player: <span style={{ color: `var(--${currentPlayer})` }}>
              {playerConfig[currentPlayer]?.name.toUpperCase() || currentPlayer.toUpperCase()}
            </span></h2>
          </div>
          <GameLog logs={log} />
        </div>
      </div>
    </div>
  );
}

export default App;