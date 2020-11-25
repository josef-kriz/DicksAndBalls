import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core'
import { GameService } from '../../game.service'
import { ChangeGameStateMessage, RemovePlayerMessage } from '../../../models/message'

@Component({
  selector: 'app-game-button',
  templateUrl: './game-button.component.html',
  styleUrls: ['./game-button.component.scss'],
})
export class GameButtonComponent implements OnChanges {
  @Input() readonly tableId?: string
  @Input() readonly gameActive?: boolean
  @Input() readonly isWinner?: boolean
  @Input() readonly cardsCount?: number
  @Output() playerName: EventEmitter<undefined> = new EventEmitter()

  canEndGame = true

  constructor(
    private gameService: GameService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const gameActive = changes.gameActive?.currentValue || this.gameActive
    const isWinner = changes.isWinner?.currentValue || this.isWinner
    const cardsCount = changes.cardsCount?.currentValue || this.cardsCount
    this.canEndGame = !!gameActive && !isWinner && !!cardsCount && cardsCount > 0
  }

  stopGame(): void {
    const message: ChangeGameStateMessage = {
      type: 'change_game',
      active: false,
    }
    this.gameService.sendMessage(message)
  }

  leaveGame(): void {
    const message: RemovePlayerMessage = {
      type: 'remove_player',
      tableId: this.tableId || 'main',
    }
    this.gameService.sendMessage(message)
    this.playerName.emit(undefined)
  }
}
