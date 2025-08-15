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
    winners: [],
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
                log: [{ type: 'info', message: 'Game started!' }],
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
                    log: [...state.log, { type: 'roll', message: `${playerName} rolled a ${roll}.` }],
                };
            }

            // No moves possible, switch player unless it's a 6
            const activePlayers = Object.keys(state.pieces).filter(p => !state.winners.includes(p));
            const currentPlayerIndex = activePlayers.indexOf(state.currentPlayer);
            const nextPlayerIndex = (currentPlayerIndex + 1) % activePlayers.length;
            return {
                ...state,
                diceValue: roll,
                isRolling: false,
                gameState: 'roll',
                currentPlayer: roll === 6 ? state.currentPlayer : activePlayers[nextPlayerIndex],
                log: [...state.log, { type: 'roll', message: `${playerName} rolled a ${roll}, but has no moves.` }],
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
                const newWinners = [...state.winners, state.currentPlayer];
                const finalLog = [...newLog, { type: 'win', message: `${playerName} has finished in position ${newWinners.length}!` }];
                
                const activePlayers = Object.keys(state.pieces).filter(p => !newWinners.includes(p));

                if (activePlayers.length < 2) { // Game over if 0 or 1 players are left
                    const finalWinners = activePlayers.length === 1 ? [...newWinners, activePlayers[0]] : newWinners;
                    return {
                        ...state,
                        pieces: newPieces,
                        gameState: 'gameover',
                        winners: finalWinners,
                        movablePieces: [],
                        log: [...finalLog, { type: 'info', message: 'Game Over!' }],
                        lastMovedPiece: { color: state.currentPlayer, id: pieceId },
                    };
                }

                // Game continues. Find next player who hasn't won.
                // A player who just won does not get another turn, even on a 6 or capture.
                const allPlayersInOrder = Object.keys(state.pieces);
                let nextPlayer = state.currentPlayer;
                let currentIndex = allPlayersInOrder.indexOf(nextPlayer);
                do {
                    currentIndex = (currentIndex + 1) % allPlayersInOrder.length;
                    nextPlayer = allPlayersInOrder[currentIndex];
                } while (newWinners.includes(nextPlayer));

                return {
                    ...state,
                    pieces: newPieces,
                    winners: newWinners,
                    currentPlayer: nextPlayer,
                    gameState: 'roll',
                    movablePieces: [],
                    log: finalLog,
                    lastMovedPiece: { color: state.currentPlayer, id: pieceId },
                };
            }

            // Player gets another turn on a 6 or a capture. Otherwise, switch player.
            const getsAnotherTurn = state.diceValue === 6 || capture;
            const activePlayers = Object.keys(state.pieces).filter(p => !state.winners.includes(p));
            
            if (getsAnotherTurn) {
                return {
                    ...state,
                    pieces: newPieces,
                    currentPlayer: state.currentPlayer,
                    gameState: 'roll',
                    movablePieces: [],
                    log: newLog,
                    lastMovedPiece: { color: state.currentPlayer, id: pieceId },
                };
            }

            const currentPlayerIndex = activePlayers.indexOf(state.currentPlayer);
            const nextPlayerIndex = (currentPlayerIndex + 1) % activePlayers.length;
            return {
                ...state,
                pieces: newPieces,
                currentPlayer: activePlayers.length > 0 ? activePlayers[nextPlayerIndex] : state.currentPlayer,
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