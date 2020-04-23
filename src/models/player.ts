import { Card } from './card'

export interface Player {
    id: string
    name: string
    cards: Card[]
    place: number
    canBeBroughtBack: boolean
    loser: boolean
}

export interface Opponent {
    name: string
    cards: number
    place: number
    loser: boolean
}
