import React, { useReducer } from 'react';
import Board from './components/Board';
import Dice from './components/Dice';
import './Ludo.css';
import { gameReducer, initialState } from './gameLogic/reducer';

function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { pieces, diceValue, currentPlayer, isRolling, movablePieces, gameState, winner } = state;

  const handleDiceRoll = () => {
    if (isRolling || gameState !== 'roll') return;
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
    dispatch({ type: 'RESTART_GAME' });
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
        />
        <div className="controls">
          <h2>Current Player: <span style={{ color: `var(--${currentPlayer})` }}>{currentPlayer.toUpperCase()}</span></h2>
        </div>
      </div>
    </div>
  );
}

export default App;