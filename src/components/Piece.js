import React from 'react';

const Piece = ({ color, onClick, isMovable }) => {
  const pieceClasses = `piece ${color} ${isMovable ? 'movable' : ''}`;
  return (
    <div className={pieceClasses} onClick={onClick}>
      <div className="piece-inner"></div>
    </div>
  );
};

export default Piece;