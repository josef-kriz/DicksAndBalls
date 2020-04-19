import { Component, Input } from '@angular/core'
import { GameService } from '../../game.service'
import { AddPlayerMessage, RemovePlayerMessage } from '../../models/message'

@Component({
  selector: 'app-join-game-button',
  templateUrl: './join-game-button.component.html',
  styleUrls: ['./join-game-button.component.scss'],
})
export class JoinGameButtonComponent {
  @Input() participating: boolean
  @Input() gameActive: boolean
  @Input() isWinner: boolean

  constructor(private gameService: GameService) { }

  private joinGame(): void {
    const message: AddPlayerMessage = {
      type: 'add_player',
      player: 'playerName',
    }
    // TODO callback should contain the reason of failure
    this.gameService.sendMessage(message, (success: boolean) => {
      this.participating = success
      if (!success) { } // TODO open modal
    })
  }

  private leaveGame(): void {
    const message: RemovePlayerMessage = {
      type: 'remove_player',
    }
    this.gameService.sendMessage(message)
    this.participating = false
  }
}
