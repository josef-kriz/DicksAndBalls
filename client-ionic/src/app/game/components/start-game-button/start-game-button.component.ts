import { Component, Input } from '@angular/core'
import { ChangeGameStateMessage } from '../../models/message'
import { GameService } from '../../game.service'
import { Opponent } from '../../models/opponent'

@Component({
  selector: 'app-start-game-button',
  templateUrl: './start-game-button.component.html',
  styleUrls: ['./start-game-button.component.scss'],
})
export class StartGameButtonComponent {
  @Input() readonly participating?: boolean
  @Input() readonly gameActive?: boolean
  @Input() readonly players?: Opponent[]

  constructor(private gameService: GameService) { }

  startGame(): void {
    this.changeGameState(true)
  }

  stopGame(): void {
    this.changeGameState(false)
  }

  private changeGameState(active: boolean): void {
    const message: ChangeGameStateMessage = {
      type: 'change_game',
      active,
    }
    this.gameService.sendMessage(message)
  }
}
