import { PLAYERS, getMovablePieces, movePiece, checkWin } from './core';

export const generateInitialPieces = () => {
    const pieces = {};
    PLAYERS.forEach(color => {
        pieces[color] = Array(4).fill(null).map((_, i) => ({ id: i, position: 'base' }));
    });
    return pieces;
};

export const initialState = {
    pieces: generateInitialPieces(),
    diceValue: 1,
    currentPlayer: PLAYERS[0],
    isRolling: false,
    movablePieces: [],
    gameState: 'roll', // 'roll', 'move', 'gameover'
    winner: null,
};

export function gameReducer(state, action) {
    switch (action.type) {
        case 'ROLL_DICE_START':
            return { ...state, isRolling: true };

        case 'ROLL_DICE_COMPLETE': {
            const { roll } = action.payload;
            const movables = getMovablePieces(state.pieces, state.currentPlayer, roll);

            if (movables.length > 0) {
                return {
                    ...state,
                    diceValue: roll,
                    isRolling: false,
                    movablePieces: movables,
                    gameState: 'move',
                };
            }

            // No moves possible, switch player unless it's a 6
            const nextPlayerIndex = (PLAYERS.indexOf(state.currentPlayer) + 1) % PLAYERS.length;
            return {
                ...state,
                diceValue: roll,
                isRolling: false,
                gameState: 'roll',
                currentPlayer: roll === 6 ? state.currentPlayer : PLAYERS[nextPlayerIndex],
            };
        }
        
        case 'MOVE_PIECE': {
            const { pieceId } = action.payload;
            const { pieces: newPieces, capture } = movePiece(state.pieces, state.currentPlayer, pieceId, state.diceValue);
            
            if (checkWin(newPieces, state.currentPlayer)) {
                return {
                    ...state,
                    pieces: newPieces,
                    gameState: 'gameover',
                    winner: state.currentPlayer,
                    movablePieces: [],
                };
            }

            // Player gets another turn on a 6 or a capture. Otherwise, switch player.
            const getsAnotherTurn = state.diceValue === 6 || capture;
            const nextPlayerIndex = (PLAYERS.indexOf(state.currentPlayer) + 1) % PLAYERS.length;
            return {
                ...state,
                pieces: newPieces,
                currentPlayer: getsAnotherTurn ? state.currentPlayer : PLAYERS[nextPlayerIndex],
                gameState: 'roll',
                movablePieces: [],
            };
        }

        case 'RESTART_GAME':
            return initialState;

        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}