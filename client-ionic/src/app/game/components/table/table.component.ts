import { Component, Input } from '@angular/core'
import { Card, Suit } from '../../models/card'
import { Draw, PlayerAction, SkippingTurn } from '../../models/playerAction'
import { PlayersTurnMessage } from '../../models/message'
import { GameService } from '../../game.service'

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

  constructor(private gameService: GameService) { }

  handleDeckClick(): void {
    if (!this.participating) { return }

    if (this.isSkippingTurn) {
      this.skipATurn()
    } else {
      this.drawCard()
    }
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
