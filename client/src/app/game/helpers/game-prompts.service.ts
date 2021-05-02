import { Injectable } from '@angular/core'
import { SettingsService } from '../../settings/settings.service'
import { AlertController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { forkJoin } from 'rxjs'
import { DomService } from '../../services/dom.service'
import { FireworksComponent } from '../components/fireworks/fireworks.component'

@Injectable({
  providedIn: 'root',
})
export class GamePromptsService {

  constructor(private alertController: AlertController, private domService: DomService, private settingsService: SettingsService, private translateService: TranslateService) {
  }

  async handleWin(): Promise<void> {
    if (await this.settingsService.getPopUps()) {
      const [header, message, buttonText] = await forkJoin([
        this.translateService.get('Game.you_won_header'),
        this.translateService.get('Game.you_won_message'),
        this.translateService.get('Game.you_won_submit'),
      ]).toPromise()

      const alert = await this.alertController.create({
        header,
        message: `${message} <span role="img" aria-label="ta-da">🎉</span>\n`,
        buttons: [buttonText],
      })
      await alert.present()
    }

    if (await this.settingsService.getSounds()) {
      const audio = new Audio('assets/sounds/win31.mp3')
      await audio.play()
      const fireworks = new Audio('assets/sounds/fireworks.mp3')
      await fireworks.play()
    }

    this.domService.appendComponentToBody(FireworksComponent)
  }

  async handleLoss(): Promise<void> {
    if (await this.settingsService.getPopUps()) {
      const [header, message, buttonText] = await forkJoin([
        this.translateService.get('Game.you_lost_header'),
        this.translateService.get('Game.you_lost_message'),
        this.translateService.get('Game.you_lost_submit'),
      ]).toPromise()

      const alert = await this.alertController.create({
        header,
        message: `${message} <span role="img" aria-label="thumb-down">👎</span>`,
        buttons: [buttonText],
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
      const [header, message, buttonText] = await forkJoin([
        this.translateService.get('Game.brought_back_header'),
        this.translateService.get('Game.brought_back_message'),
        this.translateService.get('Game.brought_back_submit'),
      ]).toPromise()

      const alert = await this.alertController.create({
        header,
        message,
        buttons: [buttonText],
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
        audioFile = 'assets/sounds/tam_tam.mp3'
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
