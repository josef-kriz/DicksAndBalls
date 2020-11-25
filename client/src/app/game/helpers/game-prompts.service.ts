import { Injectable } from '@angular/core';
import { SettingsService } from '../../settings/settings.service'
import { AlertController } from '@ionic/angular'

@Injectable({
  providedIn: 'root'
})
export class GamePromptsService {

  constructor(private alertController: AlertController, private settingsService: SettingsService) { }

  async handleWin(): Promise<void> {
    if (await this.settingsService.getPopUps()) {
      const alert = await this.alertController.create({
        header: 'You won!',
        message: 'You\'re a winner! <span role="img" aria-label="ta-da">🎉</span>\n',
        buttons: ['I\'m awesome!']
      })
      await alert.present()
    }

    if (await this.settingsService.getSounds()) {
      const audio = new Audio('assets/sounds/win31.mp3')
      await audio.play()
    }
  }

  async handleLoss(): Promise<void> {
    if (await this.settingsService.getPopUps()) {
      const alert = await this.alertController.create({
        header: 'You lost!',
        message: 'You\'re a loser! <span role="img" aria-label="thumb-down">👎</span>',
        buttons: ['I suck']
      })
      await alert.present()
    }

    if (await this.settingsService.getSounds()) {
      const audio = new Audio('assets/sounds/sadTrombone.mp3')
      await audio.play()
    }
  }

  async handleBroughtBackToGame(me: boolean = false): Promise<void> {
    if (await this.settingsService.getSounds()) {
      const audio = new Audio('assets/sounds/airHorn.mp3')
      await audio.play()
    }

    if (me && await this.settingsService.getPopUps()) {
      const alert = await this.alertController.create({
        header: 'You\'ve been brought back to the game!',
        message: 'Another player has brought you back to the game with the 7 of Hearts!',
        buttons: ['Back to Game']
      })

      await alert.present()
    }
  }

  async playDrawCardSound(cards: number): Promise<void> {
    if (!await this.settingsService.getSounds()) return

    let audioFile: string
    switch (cards) {
      case 4:
        audioFile = 'assets/sounds/crack_the_whip.mp3'
        break
      case 6:
        audioFile = 'assets/sounds/drama.mp3'
        break
      case 8:
        audioFile = 'assets/sounds/holy_shit.mp3'
        break
      default:
        return
    }
    const audio = new Audio(audioFile)
    await audio.play()
  }
}
