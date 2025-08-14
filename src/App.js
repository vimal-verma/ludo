import React, { useReducer, useEffect, useRef, useState, useCallback } from 'react';
import Board from './components/Board';
import './Ludo.css';
import styles from './App.module.css';
import { gameReducer, initialState } from './gameLogic/reducer';
import { playSound } from './utils/sounds';
import { getPiecePath, checkCapture, getAIMove } from './gameLogic/core';
import GameSetup from './components/GameSetup';
import SidePanel from './components/SidePanel';

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
  const { pieces, diceValue, currentPlayer, isRolling, movablePieces, gameState, winner, playerConfig, lastMovedPiece } = state;
  const [animatingPiece, setAnimatingPiece] = useState(null);
  const prevState = usePrevious(state);

  const handleStartGame = (config) => {
    dispatch({ type: 'START_GAME', payload: { playerConfig: config } });
    setAppState('playing');
  };

  const handleDiceRoll = useCallback(() => {
    if (isRolling || gameState !== 'roll' || animatingPiece) return;
    playSound('roll');
    dispatch({ type: 'ROLL_DICE_START' });

    // Animate dice roll
    setTimeout(() => {
      const finalValue = Math.floor(Math.random() * 6) + 1;
      dispatch({ type: 'ROLL_DICE_COMPLETE', payload: { roll: finalValue } });
    }, 500);
  }, [isRolling, gameState, animatingPiece]);

  const handlePieceClick = useCallback((color, pieceId) => {
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
  }, [currentPlayer, gameState, movablePieces, animatingPiece, pieces, diceValue]);

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
    // Play win sound when a winner is declared
    if (winner && (!prevState || !prevState.winner)) {
      playSound('win');
    }
  }, [winner, prevState]);

  // Effect for AI dice rolling
  useEffect(() => {
    const isAITurn = playerConfig[currentPlayer]?.type === 'ai';
    if (!isAITurn || gameState !== 'roll' || winner || animatingPiece) {
      return;
    }

    const timer = setTimeout(() => {
      handleDiceRoll();
    }, 1000); // Delay for AI "thinking" before rolling
    return () => clearTimeout(timer);
  }, [gameState, currentPlayer, winner, animatingPiece, playerConfig, handleDiceRoll]);

  // Effect for AI piece moving
  useEffect(() => {
    const isAITurn = playerConfig[currentPlayer]?.type === 'ai';
    if (!isAITurn || gameState !== 'move' || winner || animatingPiece) {
      return;
    }

    const timer = setTimeout(() => {
      const bestMoveId = getAIMove(pieces, currentPlayer, movablePieces, diceValue);
      if (bestMoveId !== null) {
        handlePieceClick(currentPlayer, bestMoveId);
      }
    }, 1200); // Delay for AI "thinking" before moving
    return () => clearTimeout(timer);
  }, [gameState, currentPlayer, winner, animatingPiece, pieces, movablePieces, diceValue, playerConfig, handlePieceClick]);

  if (appState === 'setup') {
    return <GameSetup onStartGame={handleStartGame} />;
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Ludo Game</h1>
      </header>
      <div className={styles.gameContainer}>
        <Board
          pieces={pieces}
          onPieceClick={handlePieceClick}
          movablePieces={movablePieces}
          currentPlayer={currentPlayer}
          lastMovedPiece={lastMovedPiece}
          animatingPiece={animatingPiece}
          onAnimationComplete={handleAnimationComplete}
          winner={winner}
          onRestart={handleRestart}
          playerConfig={playerConfig}
        />
        <SidePanel
          playerConfig={playerConfig}
          currentPlayer={currentPlayer}
          diceValue={diceValue}
          isRolling={isRolling}
          handleDiceRoll={handleDiceRoll}
          gameState={gameState}
          winner={winner}
          onRestart={handleRestart}
        />
      </div>
    </div>
  );
}

export default App;