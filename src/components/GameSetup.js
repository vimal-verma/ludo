import React, { useState } from 'react';
import { ALL_PLAYERS } from '../gameLogic/core';

const GameSetup = ({ onStartGame }) => {
  const [playerConfig, setPlayerConfig] = useState(
    ALL_PLAYERS.reduce((acc, color) => {
      acc[color] = { isActive: true, name: color.charAt(0).toUpperCase() + color.slice(1) };
      return acc;
    }, {})
  );

  const handleTogglePlayer = (color) => {
    setPlayerConfig(prev => ({
      ...prev,
      [color]: { ...prev[color], isActive: !prev[color].isActive }
    }));
  };

  const handleNameChange = (color, name) => {
    setPlayerConfig(prev => ({
      ...prev,
      [color]: { ...prev[color], name }
    }));
  };

  const handleStart = () => {
    const activePlayers = Object.values(playerConfig).filter(config => config.isActive);
    if (activePlayers.length < 2) {
      alert('You need at least 2 players to start the game.');
      return;
    }
    onStartGame(playerConfig);
  };

  return (
    <div className="game-setup">
      <h2>Game Setup</h2>
      <p>Configure players and names. You need at least 2 players.</p>
      <div className="player-config-list">
        {ALL_PLAYERS.map(color => (
          <div key={color} className={`player-config-item ${color}`}>
            <label>
              <input
                type="checkbox"
                checked={playerConfig[color].isActive}
                onChange={() => handleTogglePlayer(color)}
              />
              <span className="player-color-box"></span>
            </label>
            <input
              type="text"
              value={playerConfig[color].name}
              onChange={(e) => handleNameChange(color, e.target.value)}
              disabled={!playerConfig[color].isActive}
              placeholder="Enter name"
            />
          </div>
        ))}
      </div>
      <button onClick={handleStart} className="start-game-button">Start Game</button>
    </div>
  );
};

export default GameSetup;