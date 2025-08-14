import React from 'react';
import styles from './Dice.module.css';

// This component shows the visual dice face
const DiceFace = ({ value }) => {
  return (
    <div className={`${styles.dice} ${styles[`dice-${value}`]}`}>
      {Array(value || 0).fill(0).map((_, i) => <span key={i} className={styles.dot}></span>)}
    </div>
  );
};

// This is the main component used in SidePanel
const Dice = ({ diceValue, isRolling, onDiceRoll, disabled }) => {
  // Show a rolling animation with a random face, or the final value
  const displayValue = isRolling ? Math.floor(Math.random() * 6) + 1 : diceValue;

  return (
    <div className={styles.diceContainer}>
      <div className={`${styles.diceWrapper} ${isRolling ? styles.rolling : ''}`}>
        <DiceFace value={displayValue || 1} />
      </div>
      <button
        onClick={onDiceRoll}
        disabled={disabled || isRolling}
        className={styles.rollButton}
      >
        {isRolling ? 'Rolling...' : 'Roll Dice'}
      </button>
    </div>
  );
};


export default Dice;