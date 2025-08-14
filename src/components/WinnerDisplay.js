import React from 'react';

const WinnerDisplay = ({ winner, onRestart }) => {
  if (!winner) return null;

  return (
    <div className="winner-overlay">
      <div className="winner-box">
        <h2>Game Over!</h2>
        <p>
          <span className={`winner-name ${winner}`}>{winner}</span> wins!
        </p>
        <button onClick={onRestart}>Play Again</button>
      </div>
    </div>
  );
};

export default WinnerDisplay;