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

// ------------------------- Client -------------------------

export interface JoinTableMessage extends Message {
    type: 'join_table'
    id: string
}

export interface AddPlayerMessage extends Message {
    type: 'add_player'
    player: string
}

export interface RemovePlayerMessage extends Message {
    type: 'remove_player'
    tableId: string
}

export interface ChangeGameStateMessage extends Message {
    type: 'change_game'
    active: boolean
}

export interface PlayersTurnMessage extends Message {
    type: 'players_turn'
    action: PlayerAction
}

export type ClientMessage =
  ErrorMessage |
  JoinTableMessage |
  AddPlayerMessage |
  RemovePlayerMessage |
  ChangeGameStateMessage |
  PlayersTurnMessage

// ------------------------- Server -------------------------

export interface GameStateMessage extends Message {
    type: 'game_state'
    active: boolean
    players: Opponent[]
}

export interface GameUpdateMessage extends Message {
    type: 'game_update'
    deckTop: Card[]
    message: string[]
    cardsInDeck: string
    playerOnTurn?: string
    colorChangedTo?: Suit
    skippingNextPlayer: boolean
    broughtBackToGame?: string
    drewCards: number
    shouldDraw: number
}

export interface PlayerUpdateMessage extends Message {
    type: 'player_update'
    cards: Card[]
    place: number
    loser: boolean
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

// ------------------------- Tables -------------------------

export interface TableInfo {
    id: string
    name: string
    playersCount: number
}

export interface TableUpdateMessage extends Message {
    type: 'table_update'
    tables: TableInfo[]
}

export function isTableUpdateMessage(message: Message): message is TableUpdateMessage {
    return message.type === 'table_update'
}

