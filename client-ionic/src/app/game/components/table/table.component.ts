import { Component, Input } from '@angular/core'
import { Card, Suit } from '../../models/card'

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent {
  @Input() readonly gameActive?: boolean
  @Input() readonly playerName?: string
  @Input() readonly participating?: boolean
  @Input() readonly deckTop?: Card[]
  @Input() readonly playerOnTurn?: string
  @Input() readonly cards?: Card[]
  @Input() readonly colorChangedTo?: Suit
  @Input() readonly isSkippingTurn?: boolean
  @Input() readonly shouldDraw?: number
  @Input() readonly cardsInDeck?: string

  constructor() { }

  handleDeckClick(event: MouseEvent): void {
    console.log(event)
  }
}
