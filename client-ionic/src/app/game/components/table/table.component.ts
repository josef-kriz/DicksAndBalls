import { Component, Input, OnChanges } from '@angular/core'
import { Card, Suit } from '../../models/card'
import { Draw, PlayerAction, SkippingTurn } from '../../models/playerAction'
import { PlayersTurnMessage } from '../../models/message'
import { GameService } from '../../game.service'

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnChanges {
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
  reversedDeck?: Card[]

  constructor(private gameService: GameService) { }

  ngOnChanges(): void {
    this.reversedDeck = this.deckTop && [...this.deckTop].reverse()
  }

  handleDeckClick(): void {
    if (!this.participating) { return }

    if (this.isSkippingTurn) {
      this.skipATurn()
    } else {
      this.drawCard()
    }
  }

  /**
   * Helps Angular decide whether to update a card in the deck by giving each card a unique key
   * @param index not used
   * @param card combines the value and suit to create a unique key
   */
  trackByCard(index: number, card: Card): string {
    return `${card.value}${card.suit}`
  }

  private drawCard(): void {
    const action: Draw = {
      action: 'draw',
    }
    this.sendPlayerAction(action)
  }

  private skipATurn(): void {
    const action: SkippingTurn = {
      action: 'skipping_turn',
    }
    this.sendPlayerAction(action)
  }

  private sendPlayerAction(action: PlayerAction): void {
    const message: PlayersTurnMessage = {
      type: 'players_turn',
      action,
    }
    this.gameService.sendMessage(message)
  }
}
