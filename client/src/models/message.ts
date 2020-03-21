import { Card, Suit } from './card'
import { Opponent } from './opponent'
import { PlayerAction } from './playerAction'

interface Message {
    readonly type: string
}

export interface ErrorMessage extends Message {
    type: 'error'
    message: string
}

export function isErrorMessage(message: Message): message is ErrorMessage {
    return message.type === 'error'
}

export interface AddPlayerMessage extends Message {
    type: 'add_player'
    player: string
}

export interface RemovePlayerMessage extends Message {
    type: 'remove_player'
}

export interface ChangeGameStateMessage extends Message {
    type: 'change_game'
    active: boolean
}

export interface PlayersTurnMessage extends Message {
    type: 'players_turn'
    action: PlayerAction
}

export type ClientMessage = ErrorMessage | AddPlayerMessage | RemovePlayerMessage | ChangeGameStateMessage | PlayersTurnMessage

export function isAddPlayerMessage(message: ClientMessage): message is AddPlayerMessage {
    return message.type === 'add_player'
}

export function isRemovePlayerMessage(message: ClientMessage): message is RemovePlayerMessage {
    return message.type === 'remove_player'
}

export function isChangeGameMessage(message: ClientMessage): message is ChangeGameStateMessage {
    return message.type === 'change_game'
}

export function isPlayersTurnMessage(message: ClientMessage): message is PlayersTurnMessage {
    return message.type === 'players_turn'
}

export interface GameStateMessage extends Message {
    type: 'game_state'
    active: boolean
    players: Opponent[]
}

export interface GameUpdateMessage extends Message {
    type: 'game_update'
    players: Opponent[]
    deckTop: Card
    message: string
    playerOnTurn?: string
    changeColorTo?: Suit
}

export interface PlayerUpdateMessage extends Message {
    type: 'player_update'
    cards: Card[]
    winner: boolean
}

export type ServerMessage = ErrorMessage | GameStateMessage | GameUpdateMessage | PlayerUpdateMessage

export function isGameStateMessage(message: ServerMessage): message is GameStateMessage {
    return message.type === 'game_state'
}

export function isGameUpdateMessage(message: ServerMessage): message is GameUpdateMessage {
    return message.type === 'game_update'
}

export function isPlayerUpdateMessage(message: ServerMessage): message is PlayerUpdateMessage {
    return message.type === 'player_update'
}
