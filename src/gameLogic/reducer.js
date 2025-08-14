import { ALL_PLAYERS, getMovablePieces, movePiece, checkWin } from './core';

export const generateInitialPieces = (playerConfig) => {
    const pieces = {};
    ALL_PLAYERS.forEach(color => {
        if (playerConfig[color]?.isActive) {
            pieces[color] = Array(4).fill(null).map((_, i) => ({ id: i, position: 'base' }));
        }
    });
    return pieces;
};

export const initialState = {
    pieces: {},
    playerConfig: {},
    diceValue: 1,
    currentPlayer: null,
    isRolling: false,
    movablePieces: [],
    gameState: 'setup', // 'setup', 'roll', 'move', 'gameover'
    winner: null,
    log: [],
    lastMovedPiece: null,
};

export function gameReducer(state, action) {
    switch (action.type) {
        case 'START_GAME': {
            const { playerConfig } = action.payload;
            const pieces = generateInitialPieces(playerConfig);
            const activePlayers = Object.keys(pieces);
            return {
                ...initialState,
                pieces,
                playerConfig,
                currentPlayer: activePlayers[0],
                gameState: 'roll',
                log: [{ message: 'Game started!', type: 'info' }],
                lastMovedPiece: null,
            };
        }

        case 'ROLL_DICE_START':
            return { ...state, isRolling: true };

        case 'ROLL_DICE_COMPLETE': {
            const { roll } = action.payload;
            const playerName = state.playerConfig[state.currentPlayer]?.name || state.currentPlayer;
            const movables = getMovablePieces(state.pieces, state.currentPlayer, roll);

            if (movables.length > 0) {
                return {
                    ...state,
                    diceValue: roll,
                    isRolling: false,
                    movablePieces: movables,
                    gameState: 'move',
                    log: [...state.log, { message: `${playerName} rolled a ${roll}.`, type: 'roll' }],
                };
            }

            // No moves possible, switch player unless it's a 6
            const activePlayers = Object.keys(state.pieces);
            const currentPlayerIndex = activePlayers.indexOf(state.currentPlayer);
            const nextPlayerIndex = (currentPlayerIndex + 1) % activePlayers.length;
            return {
                ...state,
                diceValue: roll,
                isRolling: false,
                gameState: 'roll',
                currentPlayer: roll === 6 ? state.currentPlayer : activePlayers[nextPlayerIndex],
                log: [...state.log, { message: `${playerName} rolled a ${roll}, but has no moves.`, type: 'roll' }],
            };
        }
        
        case 'MOVE_PIECE': {
            const { pieceId } = action.payload;
            const playerName = state.playerConfig[state.currentPlayer]?.name || state.currentPlayer;
            const { pieces: newPieces, capture } = movePiece(state.pieces, state.currentPlayer, pieceId, state.diceValue);
            const newPieceState = newPieces[state.currentPlayer].find(p => p.id === pieceId);

            let logEntry = { type: 'move', message: `${playerName} moved a piece.` };
            if (capture) {
                logEntry = { type: 'capture', message: `${playerName} captured an opponent's piece!` };
            } else if (newPieceState.position === 'home') {
                logEntry = { type: 'move', message: `${playerName} brought a piece home!` };
            }

            const newLog = [...state.log, logEntry];
            
            if (checkWin(newPieces, state.currentPlayer)) {
                return {
                    ...state,
                    pieces: newPieces,
                    gameState: 'gameover',
                    winner: state.currentPlayer,
                    movablePieces: [],
                    log: [...newLog, { message: `${playerName} wins the game!`, type: 'win' }],
                    lastMovedPiece: { color: state.currentPlayer, id: pieceId },
                };
            }

            // Player gets another turn on a 6 or a capture. Otherwise, switch player.
            const getsAnotherTurn = state.diceValue === 6 || capture;
            const activePlayers = Object.keys(state.pieces);
            const currentPlayerIndex = activePlayers.indexOf(state.currentPlayer);
            const nextPlayerIndex = (currentPlayerIndex + 1) % activePlayers.length;
            return {
                ...state,
                pieces: newPieces,
                currentPlayer: getsAnotherTurn ? state.currentPlayer : activePlayers[nextPlayerIndex],
                gameState: 'roll',
                movablePieces: [],
                log: newLog,
                lastMovedPiece: { color: state.currentPlayer, id: pieceId },
            };
        }

        case 'RESTART_GAME':
            return initialState;

        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}