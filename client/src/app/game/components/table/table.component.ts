import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core'
import { Card, Suit } from '../../../models/card'
import { Draw, PlayerAction, SkippingTurn } from '../../../models/player-action'
import { ChangeGameStateMessage, PlayersTurnMessage } from '../../../models/message'
import { GameService } from '../../game.service'
import { SettingsService } from '../../../settings/settings.service'

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
  @Input() readonly isWinner?: boolean
  @Input() readonly isLoser?: boolean
  @Input() readonly shouldDraw?: number
  @Input() readonly cardsInDeck?: string
  @Input() readonly playersCount?: number
  @Output() nameChange: EventEmitter<string> = new EventEmitter()

  reversedDeck?: Card[]
  cardBack = this.settingsService.getCardBack()
  canShuffle = false

  constructor(
    private gameService: GameService,
    private settingsService: SettingsService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.deckTop?.currentValue) this.reversedDeck = [...changes.deckTop.currentValue].reverse()

    if (changes.gameActive || changes.participating || changes.playersCount) {
      this.canShuffle = !this.gameActive && !!this.participating && !!this.playersCount && this.playersCount >= 2
    }
  }

  handleDeckClick(): void {
    if (!this.participating) {
      return
    }

    if (!this.gameActive && this.participating && this.playersCount && this.playersCount >= 2) {
      const message: ChangeGameStateMessage = {
        type: 'change_game',
        active: true,
      }
      this.gameService.sendMessage(message)
      return
    }

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
