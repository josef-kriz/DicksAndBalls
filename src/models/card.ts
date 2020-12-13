export type Suit = 'Heart' | 'Green' | 'Dick' | 'Ball'
export type Value = '7' | '8' | '9' | '10' | 'Jack' | 'Queen' | 'King' | 'Ace'

export interface Card {
    suit: Suit
    value: Value
}

export function sameCards(cardA: Card, cardB: Card): boolean {
    return cardA.suit === cardB.suit && cardA.value === cardB.value
}

export const getUnshuffledDeck = (): Card[] => [
    {
        suit: 'Heart',
        value: '7',
    },
    {
        suit: 'Heart',
        value: '8',
    },
    {
        suit: 'Heart',
        value: '9',
    },
    {
        suit: 'Heart',
        value: '10',
    },
    {
        suit: 'Heart',
        value: 'Jack',
    },
    {
        suit: 'Heart',
        value: 'Queen',
    },
    {
        suit: 'Heart',
        value: 'King',
    },
    {
        suit: 'Heart',
        value: 'Ace',
    },
    {
        suit: 'Green',
        value: '7',
    },
    {
        suit: 'Green',
        value: '8',
    },
    {
        suit: 'Green',
        value: '9',
    },
    {
        suit: 'Green',
        value: '10',
    },
    {
        suit: 'Green',
        value: 'Jack',
    },
    {
        suit: 'Green',
        value: 'Queen',
    },
    {
        suit: 'Green',
        value: 'King',
    },
    {
        suit: 'Green',
        value: 'Ace',
    },
    {
        suit: 'Dick',
        value: '7',
    },
    {
        suit: 'Dick',
        value: '8',
    },
    {
        suit: 'Dick',
        value: '9',
    },
    {
        suit: 'Dick',
        value: '10',
    },
    {
        suit: 'Dick',
        value: 'Jack',
    },
    {
        suit: 'Dick',
        value: 'Queen',
    },
    {
        suit: 'Dick',
        value: 'King',
    },
    {
        suit: 'Dick',
        value: 'Ace',
    },
    {
        suit: 'Ball',
        value: '7',
    },
    {
        suit: 'Ball',
        value: '8',
    },
    {
        suit: 'Ball',
        value: '9',
    },
    {
        suit: 'Ball',
        value: '10',
    },
    {
        suit: 'Ball',
        value: 'Jack',
    },
    {
        suit: 'Ball',
        value: 'Queen',
    },
    {
        suit: 'Ball',
        value: 'King',
    },
    {
        suit: 'Ball',
        value: 'Ace',
    },
]
