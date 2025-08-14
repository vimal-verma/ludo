import React from 'react';
import styles from './WinnerDisplay.module.css';

const WinnerDisplay = ({ winner, onRestart, playerConfig }) => {
  if (!winner) return null;

  const winnerName = playerConfig[winner]?.name || winner;

  return (
    <div className={styles.winnerOverlay}>
      <div className={styles.winnerBox}>
        <h2>Game Over!</h2>
        <p>
          <span className={`${styles.winnerName} ${styles[winner]}`}>{winnerName}</span> wins!
        </p>
        <button onClick={onRestart} className={styles.restartButton}>Play Again</button>
      </div>
    </div>
  );
};

export default WinnerDisplay;