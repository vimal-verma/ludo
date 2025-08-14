import React from 'react';
import Piece from './Piece';
import Dice from './Dice';
import { PATH_COORDINATES } from '../gameLogic/path';
import { SAFE_ZONES } from '../gameLogic/core';
import WinnerDisplay from './WinnerDisplay';

const Board = ({
  pieces,
  onPieceClick,
  movablePieces,
  currentPlayer,
  winner,
  onRestart,
  diceValue,
  isRolling,
  handleDiceRoll,
  gameState,
}) => {
  const renderBasePieces = (color) => {
    const basePieces = pieces[color].filter(p => p.position === 'base');
    const spots = Array(4).fill(null); // Create 4 spots

    return spots.map((_, index) => (
      <div key={index} className="base-spot">
        {basePieces[index] && (
          <Piece
            color={color}
            id={basePieces[index].id}
            isMovable={movablePieces.includes(basePieces[index].id)}
            onClick={() => onPieceClick(color, basePieces[index].id)}
          />
        )}
      </div>
    ));
  };

  const renderTrackPieces = () => {
    const piecesByPosition = {};

    // Group pieces by their position on the track
    Object.keys(pieces).forEach(color => {
      pieces[color].forEach(piece => {
        if (typeof piece.position === 'number') {
          if (!piecesByPosition[piece.position]) {
            piecesByPosition[piece.position] = [];
          }
          piecesByPosition[piece.position].push({ ...piece, color });
        }
      });
    });

    return Object.entries(piecesByPosition).map(([position, piecesOnSquare]) => {
      const positionStyle = PATH_COORDINATES[position];
      const isBlockade = piecesOnSquare.length > 1;

      return (
        <div key={`track-pos-${position}`} className="track-piece-container" style={positionStyle}>
          {piecesOnSquare.map((piece) => (
            <div
              key={`${piece.color}-${piece.id}`}
              className={`track-piece ${isBlockade ? 'in-blockade' : ''}`}
            >
              <Piece
                color={piece.color}
                id={piece.id}
                isMovable={movablePieces.includes(piece.id) && piece.color === currentPlayer}
                onClick={() => onPieceClick(piece.color, piece.id)}
              />
            </div>
          ))}
        </div>
      );
    });
  };

  const renderSafeZones = () => {
    return SAFE_ZONES.map(zoneIndex => (
      <div
        key={`safezone-${zoneIndex}`}
        className="safe-zone-marker"
        style={PATH_COORDINATES[zoneIndex]}
      />
    ));
  };

  const renderPlayerControls = (color) => {
    if (color !== currentPlayer || winner) return null;

    return (
      <div className="player-controls-active">
        <Dice value={diceValue} isRolling={isRolling} />
        <button onClick={handleDiceRoll} disabled={isRolling || gameState !== 'roll'}>
          {gameState === 'move' ? 'Select a piece' : isRolling ? 'Rolling...' : 'Roll Dice'}
        </button>
      </div>
    );
  };

  return (
    <div className="board-container">
      <div className="board">
        <WinnerDisplay winner={winner} onRestart={onRestart} />
        {renderSafeZones()}
        {renderTrackPieces()}
        <div className="player-area green-area">
          <div className="base">{renderBasePieces('green')}</div>
          {renderPlayerControls('green')}
        </div>
        <div className="path-arm top-arm"></div>
        <div className="player-area yellow-area">
          <div className="base">{renderBasePieces('yellow')}</div>
          {renderPlayerControls('yellow')}
        </div>
        <div className="path-arm left-arm"></div>
        <div className="center-home"><div className="home-triangle green"></div><div className="home-triangle yellow"></div><div className="home-triangle blue"></div><div className="home-triangle red"></div></div>
        <div className="path-arm right-arm"></div>
        <div className="player-area red-area">
          <div className="base">{renderBasePieces('red')}</div>
          {renderPlayerControls('red')}
        </div>
        <div className="path-arm bottom-arm"></div>
        <div className="player-area blue-area">
          <div className="base">{renderBasePieces('blue')}</div>
          {renderPlayerControls('blue')}
        </div>
      </div>
    </div>
  );
};

export default Board;