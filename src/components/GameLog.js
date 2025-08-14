import React, { useEffect, useRef } from 'react';

const GameLog = ({ logs }) => {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="game-log-container">
      <h3 className="game-log-title">Game Log</h3>
      <ul className="game-log-list">
        {(logs || []).map((log, index) => (
          <li key={index} className={`log-entry log-${log.type}`}>
            {log.message}
          </li>
        ))}
        <div ref={logEndRef} />
      </ul>
    </div>
  );
};

export default GameLog;