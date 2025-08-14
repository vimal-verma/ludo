import React from 'react';
import Dice from './Dice';
import WinnerDisplay from './WinnerDisplay';
import styles from './SidePanel.module.css';

const SidePanel = ({
  playerConfig,
  currentPlayer,
  diceValue,
  isRolling,
  handleDiceRoll,
  gameState,
  winner,
  onRestart,
}) => {
  const isHumanTurn = playerConfig[currentPlayer]?.type === 'human';
  const canRoll = isHumanTurn && gameState === 'roll' && !winner;

  return (
    <div className={styles.sidePanel}>
      {winner ? (
        <WinnerDisplay winner={winner} onRestart={onRestart} playerConfig={playerConfig} />
      ) : (
        <div className={styles.controls}>
          <h2>Current Player</h2>
          <div className={styles.playerTurn}>
            <span className={styles.playerName} style={{ color: `var(--${currentPlayer})`, borderColor: `var(--${currentPlayer})` }}>
              {playerConfig[currentPlayer]?.name.toUpperCase() || currentPlayer.toUpperCase()}
            </span>
          </div>
          <Dice
            diceValue={diceValue}
            isRolling={isRolling}
            onDiceRoll={handleDiceRoll}
            disabled={!canRoll}
          />
          <p className={styles.gameStatus}>
            {gameState === 'roll' ? 'Roll the dice!' : 'Move your piece!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SidePanel;