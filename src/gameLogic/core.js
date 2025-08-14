export const ALL_PLAYERS = ['red', 'green', 'yellow', 'blue'];

// Correct, standard starting positions and game constants
export const START_POSITIONS = { red: 0, green: 13, yellow: 26, blue: 39 };
export const HOME_ENTRANCES = { red: 51, green: 12, yellow: 25, blue: 38 };
export const HOME_PATH_START_INDEX = 52;
export const TOTAL_TRACK_SQUARES = 52;
export const SAFE_ZONES = [0, 8, 13, 21, 26, 34, 39, 47];

/**
 * Calculates the next position for a piece.
 * @returns {number | 'home' | null} The new position, 'home', or null if the move is invalid (overshot).
 */
function calculateNewPosition(currentPos, roll, color) {
    const homeEntrance = HOME_ENTRANCES[color];
    const homePathBase = HOME_PATH_START_INDEX + (ALL_PLAYERS.indexOf(color) * 6);
    const homePathEnd = homePathBase + 5;

    let newPos = currentPos;
    let onHomePath = currentPos >= HOME_PATH_START_INDEX;

    for (let i = 0; i < roll; i++) {
        if (!onHomePath && newPos === homeEntrance) {
            onHomePath = true;
            newPos = homePathBase;
        } else if (onHomePath) {
            newPos++;
        } else {
            newPos = (newPos + 1) % TOTAL_TRACK_SQUARES;
        }
    }

    if (onHomePath && newPos > homePathEnd) {
        return null; // Overshot home, invalid move
    }

    if (onHomePath && newPos === homePathEnd) {
        return 'home';
    }

    return newPos;
}

/**
 * Checks if a square is blocked by an opponent's pieces.
 * Blockades on safe zones are not effective.
 */
function isOpponentBlockade(pieces, position, currentPlayer) {
    // A blockade is not effective on a safe zone
    if (SAFE_ZONES.includes(position)) return false;

    for (const color of Object.keys(pieces)) {
        if (color !== currentPlayer) {
            if (pieces[color].filter(p => p.position === position).length >= 2) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Finds which pieces are able to move for a given player and roll.
 */
export function getMovablePieces(pieces, player, roll) {
    const playerPieces = pieces[player];
    const movables = [];

    playerPieces.forEach(piece => {
        if (piece.position === 'home') return;

        if (piece.position === 'base') {
            if (roll === 6) {
                const startPos = START_POSITIONS[player];
                // You can't start if you already have a blockade on your start square.
                const ownPiecesOnStart = playerPieces.filter(p => p.position === startPos).length;
                if (ownPiecesOnStart < 2) {
                    movables.push(piece.id);
                }
            }
        } else {
            const finalPos = calculateNewPosition(piece.position, roll, player);
            if (finalPos === null) return; // Invalid move (overshot)

            // Check for blockades on the path, including destination
            let pathIsClear = true;
            let tempPos = piece.position;

            for (let i = 0; i < roll; i++) {
                tempPos = calculateNewPosition(piece.position, i + 1, player);
                if (isOpponentBlockade(pieces, tempPos, player)) {
                    pathIsClear = false;
                    break;
                }
            }

            if (pathIsClear) {
                movables.push(piece.id);
            }
        }
    });
    return movables;
}

/**
 * Calculates the full path a piece will take for a given roll.
 * @returns {number[]} An array of position indices for each step.
 */
export function getPiecePath(startPos, roll, color) {
    if (startPos === 'base') {
        // A piece coming out of base just lands on the start square.
        return [START_POSITIONS[color]];
    }

    const path = [];
    let currentPos = startPos;
    for (let i = 0; i < roll; i++) {
        const nextPos = calculateNewPosition(currentPos, 1, color);
        path.push(nextPos);
        currentPos = nextPos;
    }
    return path;
}

/**
 * Checks if a move will result in a capture without actually performing it.
 */
export function checkCapture(pieces, player, pieceId, roll) {
    const pieceToMove = pieces[player].find(p => p.id === pieceId);
    const newPosition = calculateNewPosition(pieceToMove.position, roll, player);

    if (typeof newPosition === 'number' && !SAFE_ZONES.includes(newPosition)) {
        return Object.keys(pieces).some(color => color !== player && pieces[color] && pieces[color].some(p => p.position === newPosition));
    }
    return false;
}

/**
 * Determines the best move for an AI player based on a simple scoring system.
 */
export function getAIMove(pieces, player, movablePieces, diceValue) {
    if (!movablePieces || movablePieces.length === 0) {
        return null;
    }

    const playerPieces = pieces[player];
    let bestMove = { id: null, score: -1 };

    for (const pieceId of movablePieces) {
        const piece = playerPieces.find(p => p.id === pieceId);
        let score = 0;

        const finalPos = calculateNewPosition(piece.position, diceValue, player);

        // 1. Highest priority: getting a piece home
        if (finalPos === 'home') {
            score = 100;
        }

        // 2. High priority: capturing an opponent
        if (score < 90 && typeof finalPos === 'number' && !SAFE_ZONES.includes(finalPos)) {
            const willCapture = Object.keys(pieces).some(color => {
                if (color === player || !pieces[color]) return false;
                // Can only capture a single piece, not a blockade
                return pieces[color].filter(p => p.position === finalPos).length === 1;
            });
            if (willCapture) {
                score = 90;
            }
        }

        // 3. Good priority: getting a piece out of base
        if (score < 80 && piece.position === 'base') {
            score = 80;
        }

        // 4. Medium priority: moving to a safe zone
        if (score < 50 && typeof finalPos === 'number' && SAFE_ZONES.includes(finalPos)) {
            score = 50;
        }

        // 5. Base score for advancing on the track
        if (typeof piece.position === 'number') {
            score += (piece.position / TOTAL_TRACK_SQUARES) * 20;
        }

        if (score > bestMove.score) {
            bestMove = { id: pieceId, score };
        }
    }

    // If all moves have a score of 0, just pick the first one. Otherwise, pick the best.
    return bestMove.id !== null ? bestMove.id : movablePieces[0];
}

/**
 * Moves a piece and handles captures.
 * @returns {{pieces: object, capture: boolean}} The new pieces state and whether a capture occurred.
 */
export function movePiece(pieces, player, pieceId, roll) {
    const newPieces = JSON.parse(JSON.stringify(pieces));
    const pieceToMove = newPieces[player].find(p => p.id === pieceId);
    let capture = false;

    const newPosition = (pieceToMove.position === 'base' && roll === 6)
        ? START_POSITIONS[player]
        : calculateNewPosition(pieceToMove.position, roll, player);

    // Capture logic: check for opponents on the new square if it's not a safe zone
    if (typeof newPosition === 'number' && !SAFE_ZONES.includes(newPosition)) {
        Object.keys(pieces).forEach(color => {
            if (color !== player) {
                const opponentPieces = newPieces[color].filter(p => p.position === newPosition);
                // Can only capture if it's a single piece, not a blockade
                if (opponentPieces.length === 1) {
                    opponentPieces[0].position = 'base';
                    capture = true;
                }
            }
        });
    }

    pieceToMove.position = newPosition;
    return { pieces: newPieces, capture };
}

/**
 * Checks if a player has won the game.
 */
export function checkWin(pieces, player) {
    return pieces[player].every(p => p.position === 'home');
}