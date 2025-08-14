import React from 'react';

const Piece = ({ color, onClick, isMovable, isLastMoved }) => {
  const pieceClasses = `piece ${color} ${isMovable ? 'movable' : ''} ${isLastMoved ? 'last-moved' : ''}`;
  return (
    <div className={pieceClasses} onClick={onClick}>
      <div className="piece-inner"></div>
    </div>
  );
};

export default Piece;