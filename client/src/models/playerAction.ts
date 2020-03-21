import { Card, Suit } from './card'

interface Action {
    readonly action: string
}

export interface CardPlayed extends Action {
    action: 'card_played'
    card: Card
    changeColorTo?: Suit
}

export interface Draw extends Action {
    action: 'draw'
}

export interface SkippingTurn extends Action {
    action: 'skipping_turn'
}

export type PlayerAction = CardPlayed | Draw | SkippingTurn

export function isCardPlayedAction(action: PlayerAction): action is CardPlayed {
    return action.action === 'card_played'
}

export function isDrawAction(action: PlayerAction): action is Draw {
    return action.action === 'draw'
}

export function isSkippingTurnAction(action: PlayerAction): action is SkippingTurn {
    return action.action === 'skipping_turn'
}
