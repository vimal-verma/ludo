import React from 'react';
import styles from './WinnerDisplay.module.css';

const WinnerDisplay = ({ winner, winners, onRestart, playerConfig }) => {
  if (!winner && (!winners || winners.length === 0)) return null;

  const winnerName = playerConfig[winner]?.name || winner;

  return (
    <div className={styles.winnerOverlay}>
      <div className={styles.winnerBox}>
        <h2>Game Over!</h2>
        <p>
          <span className={`${styles.winnerName} ${styles[winner]}`}>{winnerName}</span> wins!
        </p>
        {winners && winners.length > 1 && (
          <div className={styles.rankings}>
            <h3>Final Rankings:</h3>
            <ol>
              {winners.map((player) => (
                <li key={player}>
                  <span className={`${styles.winnerName} ${styles[player]}`}>
                    {playerConfig[player]?.name || player}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
        <button onClick={onRestart} className={styles.restartButton}>Play Again</button>
      </div>
    </div>
  );
};

export default WinnerDisplay;