import { Component, EventEmitter, Input, Output } from '@angular/core'
import { AlertController } from '@ionic/angular'
import { GameService } from '../../game.service'
import { AddPlayerMessage, ChangeGameStateMessage, RemovePlayerMessage } from '../../models/message'

@Component({
  selector: 'app-game-button',
  templateUrl: './game-button.component.html',
  styleUrls: ['./game-button.component.scss'],
})
export class GameButtonComponent {
  @Input() readonly participating?: boolean
  @Input() readonly gameActive?: boolean
  @Input() readonly isWinner?: boolean
  @Output() playerName: EventEmitter<string | undefined> = new EventEmitter()

  constructor(
    private alertController: AlertController,
    private gameService: GameService,
  ) {
  }

  getButtonText(): string {
    if (this.participating) {
      if (this.gameActive && !this.isWinner) {
        return 'End Game'
      } else {
        return 'Leave Game'
      }
    } else {
      return 'Join Game'
    }
  }

  async handleClick(): Promise<void> {
    if (this.participating) {
      if (this.gameActive && !this.isWinner) {
        this.stopGame()
      } else {
        this.leaveGame()
      }
    } else {
      await this.joinGame()
    }
  }

  private stopGame(): void {
    const message: ChangeGameStateMessage = {
      type: 'change_game',
      active: false,
    }
    this.gameService.sendMessage(message)
  }

  private async joinGame(): Promise<void> {
    try {
      const playerName = await this.askForName()
      const message: AddPlayerMessage = {
        type: 'add_player',
        player: playerName,
      }

      this.gameService.sendMessage(message, (result: string) => {
        if (result !== 'success') {
          this.showErrorAlert(result)
        } else {
          this.playerName.emit(playerName)
        }
      })
    } catch (e) {
    }
  }

  private leaveGame(): void {
    const message: RemovePlayerMessage = {
      type: 'remove_player',
    }
    this.gameService.sendMessage(message)
    this.playerName.emit(undefined)
  }

  private async askForName(): Promise<string> {
    const alert = await this.alertController.create({
      header: 'Choose a Name',
      message: 'Insert a name that will be seen by your opponents.',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Put your name here',
        },
      ],
      buttons: [
        {
          text: 'Join Game',
          role: 'submit',
        },
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alertCancelButton',
        }
      ]
    })

    await alert.present()

    // manually set focus and key press handler to the input element
    const alertInput: HTMLInputElement | null = document.querySelector('ion-alert input')
    if (alertInput) {
      alertInput.focus()
      alertInput.onkeyup = (event) => {
        if (event.key === 'Enter') {
          alert.dismiss({values: {name: alertInput.value}}, 'submit')
        }
      }
    }

    const dismiss = await alert.onWillDismiss()

    if (
      dismiss &&
      dismiss.role === 'submit' &&
      dismiss.data &&
      dismiss.data.values
    ) {
      return dismiss.data.values.name
    } else {
      throw new Error('No name given')
    }
  }

  private async showErrorAlert(message = 'The server rejected your username'): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Invalid Name',
      message,
      buttons: [
        {
          text: 'OK',
        },
      ]
    })

    await alert.present()
  }
}
