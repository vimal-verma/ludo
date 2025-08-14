# Ludo Game Application

This project is a fully-featured digital version of the classic board game Ludo, built with React. It supports 2-4 players, including challenging AI opponents, and implements the complete ruleset with a modern, interactive UI.

## Features

- **Dynamic Player Setup**: Configure games for 2, 3, or 4 players.
- **Human & AI Players**: Each player can be set as 'Human' or 'AI'.
- **Custom Player Names**: Assign custom names to each player for a personalized experience.
- **Interactive UI & UX**:
  - Dice controls are intuitively placed within each active player's base area.
  - Smooth, step-by-step piece animations provide clear visual feedback on every move.
  - Sound effects for key events like dice rolls, piece movement, captures, and winning.
  - Visual indicators for movable pieces, the last-moved piece, and safe zones.
- **Complete Ludo Ruleset**:
  - Dice rolling and piece movement.
  - Capturing opponent pieces.
  - Safe zones (starred squares) where pieces cannot be captured.
  - Blockades (two of a player's pieces on the same square) to block opponents.
  - Exact roll required to move a piece into the home triangle.
  - Win condition detection when a player gets all four pieces home.
- **Strategic AI**: The AI uses a sophisticated scoring system to make intelligent decisions about which piece to move, weighing options like capturing, moving home, and forming blockades.

## Project Structure

The project is organized to separate UI components from the core game logic, making it easier to maintain and debug.

```txt
src/
├── components/       # Reusable React components for the UI
│   ├── Board.js
│   ├── Dice.js
│   ├── GameSetup.js
│   ├── Piece.js
│   └── WinnerDisplay.js
│
├── gameLogic/        # Core game state and rules, decoupled from the UI
│   ├── core.js       # Pure functions defining all game rules and AI logic
│   ├── path.js       # Defines the board layout and piece coordinates
│   └── reducer.js    # State management logic using useReducer
│
├── utils/            # Utility functions
│   └── sounds.js     # Helper for playing sound effects
│
├── App.js            # Main application component, orchestrating state and UI
└── Ludo.css          # All application styles
```

## Core Game Logic (`src/gameLogic/core.js`)

This file is the heart of the application and contains all the rules.

- **Constants**: Defines key game parameters like `START_POSITIONS`, `HOME_ENTRANCES`, `SAFE_ZONES`, and `TOTAL_TRACK_SQUARES`.
- **`calculateNewPosition(currentPos, roll, color)`**: A pure function that takes a piece's current position and a dice roll and returns its new position, handling home path entry and overshooting.
- **`getMovablePieces(pieces, player, roll)`**: Determines which of a player's pieces can legally move based on the dice roll, checking for blockades and other restrictions.
- **`movePiece(pieces, player, pieceId, roll)`**: Returns a new `pieces` state object after a move is performed, handling captures.
- **`getAIMove(pieces, player, movablePieces, diceValue)`**: The AI's "brain." It scores each possible move based on a set of strategic priorities (e.g., capturing, forming blockades, getting home) and returns the ID of the best piece to move.
- **`getPiecePath(startPos, roll, color)`**: Calculates the step-by-step path a piece will take, which is used to drive the hopping animation.

## State Management (`src/gameLogic/reducer.js`)

The game uses React's `useReducer` hook for robust and predictable state management.

- **`initialState`**: Defines the shape of the entire game state, including `pieces`, `currentPlayer`, `gameState`, `log`, etc.
- **`gameReducer(state, action)`**: A pure function that takes the current state and an action (e.g., `{ type: 'ROLL_DICE_COMPLETE', payload: { roll: 6 } }`) and returns the new state. This is the only place where the game's state is modified, ensuring a clear and traceable data flow.

## Animation Flow

Piece movement animations are orchestrated in `App.js` and visually executed in `Board.js`.

1.  A human or AI player clicks a movable piece (`handlePieceClick` in `App.js`).
2.  `App.js` calculates the animation path using `getPiecePath` and sets an `animatingPiece` state object.
3.  This state is passed as a prop to `Board.js`.
4.  A `useEffect` hook in `Board.js` detects the `animatingPiece` prop and begins a step-by-step visual animation, updating a local `animatedPieceState` to move a temporary piece across the board.
5.  Once the visual animation is complete, `Board.js` calls the `onAnimationComplete` callback function.
6.  `App.js` receives this callback and dispatches the `MOVE_PIECE` action to the reducer, which formally updates the game state.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
