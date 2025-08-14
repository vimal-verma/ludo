import React from 'react';
import styles from './Piece.module.css';

const Piece = ({ color, onClick, isMovable, isLastMoved }) => {
  const pieceClasses = [
    styles.piece,
    styles[color],
    isMovable ? styles.movable : '',
    isLastMoved ? styles.lastMoved : ''
  ].join(' ');

  return (
    <div className={pieceClasses} onClick={onClick}>
      <div className={styles.pieceInner}></div>
    </div>
  );
};

export default Piece;