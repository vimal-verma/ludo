import {
    TOTAL_TRACK_SQUARES,
    HOME_PATH_START_INDEX,
    ALL_PLAYERS,
    START_POSITIONS,
    HOME_ENTRANCES,
    SAFE_ZONES,
    calculateNewPosition,
} from './core';

/**
 * Calculates how many steps a piece is from getting home.
 * Lower is better.
 */
function getDistanceToHome(piece, color) {
    if (piece.position === 'home') return 0;
    if (piece.position === 'base') return TOTAL_TRACK_SQUARES + 6; // Furthest possible

    // On home path
    if (typeof piece.position === 'number' && piece.position >= HOME_PATH_START_INDEX) {
        const homePathBase = HOME_PATH_START_INDEX + (ALL_PLAYERS.indexOf(color) * 6);
        const homePathEnd = homePathBase + 5;
        return homePathEnd - piece.position;
    }

    // On main track
    const startPos = START_POSITIONS[color];
    const currentPos = piece.position;
    
    // Number of squares travelled from start
    const progress = (currentPos - startPos + TOTAL_TRACK_SQUARES) % TOTAL_TRACK_SQUARES;
    
    // Total squares on main track for a player is 51.
    const stepsLeftOnTrack = 51 - progress;

    return stepsLeftOnTrack + 6; // +6 for home path
}

/**
 * Checks if a position is threatened by an opponent.
 * A position is in danger if an opponent piece is 1-6 squares behind it on the main track.
 */
function isPositionInDanger(pieces, position, playerColor) {
    if (SAFE_ZONES.includes(position)) {
        return false;
    }

    for (const opponentColor of Object.keys(pieces)) {
        if (opponentColor === playerColor || !pieces[opponentColor]) continue;

        for (const opponentPiece of pieces[opponentColor]) {
            if (typeof opponentPiece.position === 'number') {
                // Calculate forward distance from opponent to the target position
                const distance = (position - opponentPiece.position + TOTAL_TRACK_SQUARES) % TOTAL_TRACK_SQUARES;

                if (distance > 0 && distance <= 6) {
                    // It's in range. Now check if the opponent would be forced to turn into their home path
                    // before reaching the target position.
                    const opponentHomeEntrance = HOME_ENTRANCES[opponentColor];
                    let isPathToHome = false;
                    let tempPos = opponentPiece.position;

                    for (let i = 0; i < distance; i++) {
                        if (tempPos === opponentHomeEntrance) {
                            isPathToHome = true;
                            break;
                        }
                        tempPos = (tempPos + 1) % TOTAL_TRACK_SQUARES;
                    }

                    if (!isPathToHome) {
                        return true; // An opponent can reach this square.
                    }
                }
            }
        }
    }
    return false;
}

/**
 * Determines the best move for an AI player based on a more strategic scoring system.
 */
export function getAIMove(pieces, player, movablePieces, diceValue) {
    if (!movablePieces || movablePieces.length === 0) {
        return null;
    }

    const playerPieces = pieces[player];
    let bestMove = { id: null, score: -Infinity };

    for (const pieceId of movablePieces) {
        const piece = playerPieces.find(p => p.id === pieceId);
        let score = 0;

        const finalPos = piece.position === 'base'
            ? START_POSITIONS[player]
            : calculateNewPosition(piece.position, diceValue, player);
        
        if (finalPos === null) continue; // Invalid move (overshot)

        // --- Positive Scores (Incentives) ---

        // 1. Ultimate Goal: Getting a piece home. This is the highest priority.
        if (finalPos === 'home') {
            score += 1000;
        }

        // 2. Capture an opponent. Score is higher if the captured piece was far along.
        let isCapture = false;
        if (typeof finalPos === 'number' && !SAFE_ZONES.includes(finalPos)) {
            for (const opponentColor of Object.keys(pieces)) {
                if (opponentColor === player || !pieces[opponentColor]) continue;
                
                const opponentsOnSquare = pieces[opponentColor].filter(p => p.position === finalPos);
                if (opponentsOnSquare.length === 1) { // Can only capture single pieces
                    isCapture = true;
                    const capturedPiece = opponentsOnSquare[0];
                    const opponentProgress = (TOTAL_TRACK_SQUARES + 6) - getDistanceToHome(capturedPiece, opponentColor);
                    score += 500 + (opponentProgress * 3); // Increased multiplier
                    break;
                }
            }
        }

        // 3. Get a piece out of base. Very important early-game move.
        if (piece.position === 'base') {
            score += 400;
        }

        // 4. Form a blockade. Lower priority to encourage more aggressive play.
        if (typeof finalPos === 'number' && !SAFE_ZONES.includes(finalPos)) {
            const ownPiecesOnSquare = playerPieces.filter(p => p.position === finalPos).length;
            if (ownPiecesOnSquare === 1) {
                score += 50; // Reduced score for forming a blockade
                // Extra bonus for blocking an opponent's start.
                for (const opponentColor in START_POSITIONS) {
                    if (opponentColor !== player && START_POSITIONS[opponentColor] === finalPos) {
                        score += 100; // This is still a powerful move.
                        break;
                    }
                }
            }
        }

        // 5. Land on a safe zone. Always a good defensive move.
        if (typeof finalPos === 'number' && SAFE_ZONES.includes(finalPos)) {
            score += 120;
        }

        // 6. General progress score based on distance to home.
        if (typeof piece.position === 'number') {
            const progressScore = (TOTAL_TRACK_SQUARES + 6) - getDistanceToHome(piece, player);
            score += progressScore * 5; // Reduced multiplier to not overweight simple moves
        }
        
        // --- Negative Scores (Risks/Penalties) ---

        // 7. Risk of being captured. High penalty, scaled by the piece's own progress.
        if (typeof finalPos === 'number' && isPositionInDanger(pieces, finalPos, player)) {
            // Don't be too afraid if it's the only piece out and has to move.
            const piecesOut = playerPieces.filter(p => typeof p.position === 'number').length;
            if (piecesOut > 1 || piece.position === 'base') {
                const selfProgress = (TOTAL_TRACK_SQUARES + 6) - getDistanceToHome(piece, player);
                score -= (300 + selfProgress * 5); // Penalty increases the more valuable the piece is
            }
        }

        // 8. Penalty for breaking up a blockade. Reduced to allow for more aggressive play.
        if (typeof piece.position === 'number' && finalPos !== 'home' && !isCapture) {
            const ownPiecesOnCurrentPos = playerPieces.filter(p => p.position === piece.position).length;
            if (ownPiecesOnCurrentPos >= 2) {
                score -= 150; // Reduced penalty
            }
        }
        
        // 9. Penalty for moving off a safe zone unless for a high-value reason.
        if (SAFE_ZONES.includes(piece.position)) {
            const isGoingHome = finalPos === 'home';
            const isLandingOnSafeZone = typeof finalPos === 'number' && SAFE_ZONES.includes(finalPos);
            if (!isGoingHome && !isCapture && !isLandingOnSafeZone) {
                score -= 500; // Heavy penalty for leaving a safe spot without a good reason.
            }
        }
        
        // 10. Small bonus for moving the piece that is furthest behind to encourage spreading out.
        const piecesOnTrack = playerPieces.filter(p => typeof p.position === 'number');
        if (piecesOnTrack.length > 1) {
            const distances = piecesOnTrack.map(p => getDistanceToHome(p, player));
            if (getDistanceToHome(piece, player) === Math.max(...distances)) {
                score += 50;
            }
        }

        if (score > bestMove.score) {
            bestMove = { id: pieceId, score };
        }
    }

    // If no move has been selected (all scores are -Infinity), pick the first available one as a fallback.
    return bestMove.id !== null ? bestMove.id : movablePieces[0];
}