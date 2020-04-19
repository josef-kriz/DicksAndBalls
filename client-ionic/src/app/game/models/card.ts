export type Suit = 'Heart' | 'Green' | 'Dick' | 'Ball'
export type Value = '7' | '8' | '9' | '10' | 'B' | 'T' | 'K' | 'A'

export interface Card {
    suit: Suit
    value: Value
}

export function sameCards(cardA: Card, cardB: Card): boolean {
    return cardA.suit === cardB.suit && cardA.value === cardB.value
}

export function getCardsAssetNumber(card: Card) {
    switch (card.suit) {
        case 'Dick':
            switch (card.value) {
                case '7':
                    return '1'
                case '8':
                    return '2'
                case '9':
                    return '3'
                case '10':
                    return '4'
                case 'B':
                    return '5'
                case 'T':
                    return '6'
                case 'K':
                    return '7'
                case 'A':
                    return '8'
            }
            break
        case 'Ball':
            switch (card.value) {
                case '7':
                    return '9'
                case '8':
                    return '10'
                case '9':
                    return '11'
                case '10':
                    return '12'
                case 'B':
                    return '13'
                case 'T':
                    return '14'
                case 'K':
                    return '15'
                case 'A':
                    return '16'
            }
            break
        case 'Heart':
            switch (card.value) {
                case '7':
                    return '17'
                case '8':
                    return '18'
                case '9':
                    return '19'
                case '10':
                    return '20'
                case 'B':
                    return '21'
                case 'T':
                    return '22'
                case 'K':
                    return '23'
                case 'A':
                    return '24'
            }
            break
        case 'Green':
            switch (card.value) {
                case '7':
                    return '25'
                case '8':
                    return '26'
                case '9':
                    return '27'
                case '10':
                    return '28'
                case 'B':
                    return '29'
                case 'T':
                    return '30'
                case 'K':
                    return '31'
                case 'A':
                    return '32'
            }
    }
}
