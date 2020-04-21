import { Component, Input, OnInit } from '@angular/core'
import { Card, getCardsAssetNumber, Suit } from '../../../models/card'
import { DomSanitizer, SafeStyle } from '@angular/platform-browser'

@Component({
  selector: 'app-deck-card',
  templateUrl: './deck-card.component.html',
  styleUrls: ['./deck-card.component.scss'],
})
export class DeckCardComponent implements OnInit {
  @Input() readonly card?: Card
  @Input() readonly noTransform?: boolean
  @Input() readonly colorChangedTo?: Suit
  randomShift: string | null = null

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.randomShift = this.getRandomShift()
  }

  getCardUrl(card: Card): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(`url("assets/cards/${getCardsAssetNumber(card)}.png")`)
  }

  private getRandomShift(): string | null {
    if (this.noTransform) { return null }

    const getRandomArbitrary = (min: number, max: number) => {
      return Math.floor(Math.random() * Math.floor(max - min)) + min
    }

    return `translateX(${getRandomArbitrary(-10, 11)}px) \
            translateY(${getRandomArbitrary(-5, 5)}px) \
            rotate(${getRandomArbitrary(-60, 61)}deg)`
  }
}
