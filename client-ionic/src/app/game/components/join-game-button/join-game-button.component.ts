import { Component, EventEmitter, Input, Output } from '@angular/core'
import { GameService } from '../../game.service'
import { AddPlayerMessage, RemovePlayerMessage } from '../../models/message'
import { AlertController } from '@ionic/angular'

@Component({
  selector: 'app-join-game-button',
  templateUrl: './join-game-button.component.html',
  styleUrls: ['./join-game-button.component.scss'],
})
export class JoinGameButtonComponent {
  @Input() readonly participating?: boolean
  @Input() readonly gameActive?: boolean
  @Input() readonly isWinner?: boolean
  @Output() playerName: EventEmitter<string | undefined> = new EventEmitter()

  constructor(
    private alertController: AlertController,
    private gameService: GameService,
  ) {
  }

  async joinGame(): Promise<void> {
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

  leaveGame(): void {
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
