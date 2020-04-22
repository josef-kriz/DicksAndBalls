import { Card, Suit } from './card'
import { Opponent } from './player'
import { PlayerAction } from './playerAction'

interface Message {
    readonly type: string
}

export interface ErrorMessage extends Message {
    type: 'error'
    message: string
}

export interface AddPlayerMessage extends Message {
    type: 'add_player'
    player: string
}

export function isRemovePlayerMessage(message: ClientMessage): message is RemovePlayerMessage {
    return message.type === 'remove_player'
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

export function isAddPlayerMessage(message: Message): message is AddPlayerMessage {
    return message.type === 'add_player'
}

export function isChangeGameMessage(message: Message): message is ChangeGameStateMessage {
    return message.type === 'change_game'
}

export function isPlayersTurnMessage(message: Message): message is PlayersTurnMessage {
    return message.type === 'players_turn'
}

export interface GameStateMessage extends Message {
    type: 'game_state'
    active: boolean
    players: Opponent[]
}

export interface GameUpdateMessage extends Message {
    type: 'game_update'
    deckTop: Card[]
    message: string
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

