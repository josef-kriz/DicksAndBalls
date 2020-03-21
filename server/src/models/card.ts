export type Suit = 'Heart' | 'Green' | 'Dick' | 'Ball'
export type Value = '7' | '8' | '9' | '10' | 'B' | 'T' | 'K' | 'A'

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
        value: 'B',
    },
    {
        suit: 'Heart',
        value: 'T',
    },
    {
        suit: 'Heart',
        value: 'K',
    },
    {
        suit: 'Heart',
        value: 'A',
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
        value: 'B',
    },
    {
        suit: 'Green',
        value: 'T',
    },
    {
        suit: 'Green',
        value: 'K',
    },
    {
        suit: 'Green',
        value: 'A',
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
        value: 'B',
    },
    {
        suit: 'Dick',
        value: 'T',
    },
    {
        suit: 'Dick',
        value: 'K',
    },
    {
        suit: 'Dick',
        value: 'A',
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
        value: 'B',
    },
    {
        suit: 'Ball',
        value: 'T',
    },
    {
        suit: 'Ball',
        value: 'K',
    },
    {
        suit: 'Ball',
        value: 'A',
    },
]
