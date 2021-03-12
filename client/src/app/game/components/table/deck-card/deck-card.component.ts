import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { Card, getCardsAssetNumber, Suit } from '../../../../models/card'
import { DomSanitizer, SafeStyle } from '@angular/platform-browser'
import { SettingsService } from '../../../../settings/settings.service'
import { animate, style, transition, trigger } from '@angular/animations'

@Component({
  selector: 'app-deck-card',
  templateUrl: './deck-card.component.html',
  styleUrls: ['./deck-card.component.scss'],
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [
        style({opacity: 0, transform: 'rotate(0)'}),
        animate('300ms ease-out', style({opacity: 1, transform: '{{randomShift}}'})),
      ]),
    ]),
  ],
})
export class DeckCardComponent implements OnInit, OnChanges {
  @Input() readonly card?: Card
  @Input() readonly noTransform?: boolean
  @Input() readonly colorChangedTo?: Suit

  randomShift: string | null = null
  cardType = 'single-headed'
  cardBackground?: SafeStyle

  constructor(
    private sanitizer: DomSanitizer,
    private settingsService: SettingsService,
  ) {
    this.settingsService.getCardType().subscribe(type => {
      this.cardType = type
      if (this.card) this.cardBackground = this.getCardUrl(this.card)
    })
  }

  ngOnInit(): void {
    this.randomShift = this.getRandomShift()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.card
      && (changes.card.previousValue?.suit !== changes.card.currentValue?.suit
        || changes.card.previousValue?.value !== changes.card.currentValue?.value)
    ) {
      this.cardBackground = this.getCardUrl(changes.card.currentValue)
    }
  }

  getCardUrl(card: Card): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(`url("assets/cards/${this.cardType}/${getCardsAssetNumber(card)}.png")`)
  }

  /**
   * This function employs the Box–Muller transform to give a normal distribution between 0 and 1 inclusive.
   */
  private random_normal(): number {
    let u = 0, v = 0
    while (u === 0) {
      u = Math.random()
    } // Converting [0,1) to (0,1)
    while (v === 0) {
      v = Math.random()
    }
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    num = num / 10.0 + 0.5 // Translate to 0 -> 1
    if (num > 1 || num < 0) {
      return this.random_normal()
    } // resample between 0 and 1
    return num
  }

  private getRandomShift(): string | null {
    if (this.noTransform) {
      return null
    }

    const getRandomArbitrary = (min: number, max: number) => {
      const random = this.random_normal() * Math.floor(max - min) + min
      return Math.floor(random * 1.8) // flattens the curve
    }

    return `translateX(${getRandomArbitrary(-16, 40)}px) \
            translateY(${getRandomArbitrary(-24, 24)}px) \
            rotate(${getRandomArbitrary(-180, 180)}deg)`
  }
}
