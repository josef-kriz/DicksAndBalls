import { Component, Input } from '@angular/core'
import { Card, getCardsAssetNumber, Suit } from '../../../models/card'

@Component({
  selector: 'app-deck-card',
  templateUrl: './deck-card.component.html',
  styleUrls: ['./deck-card.component.scss'],
})
export class DeckCardComponent {
  @Input() readonly card?: Card
  @Input() readonly noTransform?: boolean
  @Input() readonly colorChangedTo?: Suit

  constructor() { }

  getCardsAssetNumber(card: Card): string {
    return getCardsAssetNumber(card)
  }

  getRandomShift(): string | null {
    if (this.noTransform) { return null }

    const getRandomArbitrary = (min: number, max: number) => {
      return Math.floor(Math.random() * Math.floor(max - min)) + min
    }

    return `translateX(${getRandomArbitrary(-10, 11)}px) \
            translateY(${getRandomArbitrary(-5, 5)}px) \
            rotate(${getRandomArbitrary(-60, 61)}deg)`
  }
}
