/**
 * This interface represents the game's response after a player makes his turn.
 * It contains all the necessary messages that need to be sent
 */
import { GameStateMessage, GameUpdateMessage, PlayerUpdateMessage } from './message'

export interface GameMessage {
    gameState: GameStateMessage
    gameUpdate: GameUpdateMessage
    players: {
        player: string
        playerUpdate: PlayerUpdateMessage
    }[]
}
