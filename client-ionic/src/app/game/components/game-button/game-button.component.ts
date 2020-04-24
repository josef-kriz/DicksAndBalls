import { Component, EventEmitter, Input, Output } from '@angular/core'
import { GameService } from '../../game.service'
import { ChangeGameStateMessage, RemovePlayerMessage } from '../../models/message'

@Component({
  selector: 'app-game-button',
  templateUrl: './game-button.component.html',
  styleUrls: ['./game-button.component.scss'],
})
export class GameButtonComponent {
  @Input() readonly gameActive?: boolean
  @Input() readonly isWinner?: boolean
  @Output() playerName: EventEmitter<undefined> = new EventEmitter()

  constructor(private gameService: GameService) {
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
    }
    this.gameService.sendMessage(message)
    this.playerName.emit(undefined)
  }
}
