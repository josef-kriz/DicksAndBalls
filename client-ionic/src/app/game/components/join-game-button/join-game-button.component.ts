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
  @Output() playerName: EventEmitter<string> = new EventEmitter()

  constructor(
    private alertController: AlertController,
    private gameService: GameService,
  ) {
  }

  private async joinGame(): Promise<void> {
    try {
      const playerName = await this.askForName()
      const message: AddPlayerMessage = {
        type: 'add_player',
        player: playerName,
      }
      // TODO callback should contain the reason of failure
      this.gameService.sendMessage(message, (success: boolean) => {
        if (!success) {
          // TODO open modal
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
      dismiss.data.values &&
      dismiss.data.values.name
    ) {
      return dismiss.data.values.name
    } else {
      throw new Error('No name given')
    }
  }
}
