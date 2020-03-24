import { Card } from './card'

export interface Player {
    id: string
    name: string
    cards: Card[]
    winner: boolean
    wonAtMove: number
    loser: boolean
}

export interface Opponent {
    name: string
    cards: number
    winner: boolean
    loser: boolean
}
