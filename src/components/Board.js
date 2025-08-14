import React, { useState, useEffect } from 'react';
import Piece from './Piece';
import Dice from './Dice';
import styles from './Board.module.css';
import { PATH_COORDINATES } from '../gameLogic/path';
import { SAFE_ZONES } from '../gameLogic/core';
import WinnerDisplay from './WinnerDisplay';
import { playSound } from '../utils/sounds';

const Board = ({
  pieces,
  onPieceClick,
  movablePieces,
  currentPlayer,
  winner,
  onRestart,
  playerConfig,
  lastMovedPiece,
  animatingPiece,
  onAnimationComplete,
  diceValue,
  isRolling,
  handleDiceRoll,
  gameState,
}) => {
  const [animatedPieceState, setAnimatedPieceState] = useState(null);

  useEffect(() => {
    if (!animatingPiece) {
      setAnimatedPieceState(null);
      return;
    }

    const animate = async () => {
      const { path, color, id, willCapture, startPosition } = animatingPiece;

      // The visual path includes the starting square unless coming from base
      const visualPath = startPosition === 'base' ? path : [startPosition, ...path];

      for (let i = 0; i < visualPath.length; i++) {
        const step = visualPath[i];
        const isFirstStep = i === 0;

        setAnimatedPieceState({
          color,
          id,
          ...PATH_COORDINATES[step],
          isAnimating: !isFirstStep, // Add class for CSS transition
        });

        // Play sound on each hop, except the very first placement
        if (!isFirstStep || startPosition === 'base') {
          playSound('move');
        }

        // Wait for the hop
        await new Promise(res => setTimeout(res, isFirstStep ? 50 : 200));
      }

      if (willCapture) playSound('capture');

      onAnimationComplete();
    };

    animate();
  }, [animatingPiece, onAnimationComplete]);

  const renderBasePieces = (color) => {
    if (!pieces[color]) return null;

    const basePieces = pieces[color].filter(p => p.position === 'base');
    const spots = Array(4).fill(null); // Create 4 spots

    return spots.map((_, index) => {
      const piece = basePieces[index];
      const isLastMoved = piece && lastMovedPiece && lastMovedPiece.color === color && lastMovedPiece.id === piece.id;
      return (
        <div key={index} className={styles.baseSpot}>
          {piece && (
            <Piece
              color={color}
              id={piece.id}
              isMovable={movablePieces.includes(piece.id)}
              onClick={() => onPieceClick(color, piece.id)}
              isLastMoved={isLastMoved}
            />
          )}
        </div>
      );
    });
  };

  const renderTrackPieces = () => {
    const piecesByPosition = {};

    // Group pieces by their position on the track
    Object.keys(pieces).forEach(color => {
      pieces[color].forEach(piece => {
        // Hide the original piece while its animated copy is moving
        if (animatingPiece && piece.color === animatingPiece.color && piece.id === animatingPiece.id) {
          return;
        }

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
        <div key={`track-pos-${position}`} className={styles.trackPieceContainer} style={positionStyle}>
          {piecesOnSquare.map((piece) => {
            const isLastMoved = lastMovedPiece && lastMovedPiece.color === piece.color && lastMovedPiece.id === piece.id;
            return (
            <div
              key={`${piece.color}-${piece.id}`}
              className={`${styles.trackPiece} ${isBlockade ? styles.inBlockade : ''}`}
            >
              <Piece
                color={piece.color}
                id={piece.id}
                isMovable={movablePieces.includes(piece.id) && piece.color === currentPlayer}
                onClick={() => onPieceClick(piece.color, piece.id)}
                isLastMoved={isLastMoved}
              />
            </div>
            );
          })}
        </div>
      );
    });
  };

  const renderSafeZones = () => {
    return SAFE_ZONES.map(zoneIndex => (
      <div
        key={`safezone-${zoneIndex}`}
        className={styles.safeZoneMarker}
        style={PATH_COORDINATES[zoneIndex]}
      />
    ));
  };

  const renderAnimatingPiece = () => {
    if (!animatedPieceState) return null;

    const animationClass = animatedPieceState.isAnimating ? styles.animatingPiece : '';

    return (
      <div
        className={`${styles.trackPieceContainer} ${animationClass}`}
        style={{ top: animatedPieceState.top, left: animatedPieceState.left }}
      >
        <div className={styles.trackPiece}>
          <Piece color={animatedPieceState.color} />
        </div>
      </div>
    );
  };

  const renderPlayerControls = (color) => {
    // Only show controls for the current player
    if (color !== currentPlayer || winner || animatingPiece) {
      return null;
    }

    const isHuman = playerConfig[color]?.type === 'human';
    const canRoll = gameState === 'roll';

    return (
      <div className={styles.playerControls}>
        <Dice
          diceValue={diceValue}
          isRolling={isRolling}
          onDiceRoll={handleDiceRoll}
          // Disable for AI, or if it's not the roll phase for humans
          disabled={!isHuman || !canRoll}
        />
      </div>
    );
  };

  return (
    <div className={styles.boardContainer}>
      <div className={styles.board}>
        {winner && <WinnerDisplay winner={winner} onRestart={onRestart} playerConfig={playerConfig} />}
        {renderSafeZones()}
        {renderTrackPieces()}
        {renderAnimatingPiece()}
        <div className={`${styles.playerArea} ${styles.greenArea}`}>
          <div className={styles.base}>{renderBasePieces('green')}</div>
          {renderPlayerControls('green')}
        </div>
        <div className={`${styles.pathArm} ${styles.topArm}`}></div>
        <div className={`${styles.playerArea} ${styles.yellowArea}`}>
          <div className={styles.base}>{renderBasePieces('yellow')}</div>
          {renderPlayerControls('yellow')}
        </div>
        <div className={`${styles.pathArm} ${styles.leftArm}`}></div>
        <div className={styles.centerHome}><div className={`${styles.homeTriangle} ${styles.homeTriangleGreen}`}></div><div className={`${styles.homeTriangle} ${styles.homeTriangleYellow}`}></div><div className={`${styles.homeTriangle} ${styles.homeTriangleBlue}`}></div><div className={`${styles.homeTriangle} ${styles.homeTriangleRed}`}></div></div>
        <div className={`${styles.pathArm} ${styles.rightArm}`}></div>
        <div className={`${styles.playerArea} ${styles.redArea}`}>
          <div className={styles.base}>{renderBasePieces('red')}</div>
          {renderPlayerControls('red')}
        </div>
        <div className={`${styles.pathArm} ${styles.bottomArm}`}></div>
        <div className={`${styles.playerArea} ${styles.blueArea}`}>
          <div className={styles.base}>{renderBasePieces('blue')}</div>
          {renderPlayerControls('blue')}
        </div>
      </div>
    </div>
  );
};

export default Board;