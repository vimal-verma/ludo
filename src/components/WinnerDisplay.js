import React from 'react';

const WinnerDisplay = ({ winner, onRestart, playerConfig }) => {
  if (!winner) return null;

  const winnerName = playerConfig[winner]?.name || winner;

  return (
    <div className="winner-overlay">
      <div className="winner-box">
        <h2>Game Over!</h2>
        <p>
          <span className={`winner-name ${winner}`}>{winnerName}</span> wins!
        </p>
        <button onClick={onRestart}>Play Again</button>
      </div>
    </div>
  );
};

export default WinnerDisplay;