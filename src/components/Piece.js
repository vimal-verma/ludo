import React from 'react';
import styles from './Piece.module.css';

const Piece = ({ color, onClick, isMovable, isLastMoved, isHome }) => {
  const pieceClasses = [
    styles.piece,
    styles[color],
    isMovable ? styles.movable : '',
    isLastMoved ? styles.lastMoved : '',
    isHome ? styles.homePiece : ''
  ].join(' ');

  return (
    <div className={pieceClasses} onClick={onClick}>
    </div>
  );
};

export default Piece;