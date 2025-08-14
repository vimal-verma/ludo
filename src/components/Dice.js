import React from 'react';

const Dice = ({ value, isRolling }) => {
  const diceClass = `dice dice-${value} ${isRolling ? 'rolling' : ''}`;
  return (
    <div className={diceClass}>
      {/* Render dots based on the dice value */}
      {Array(value).fill(0).map((_, i) => <span key={i} className="dot"></span>)}
    </div>
  );
};

export default Dice;