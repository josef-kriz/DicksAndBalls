import { Component } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { SettingsService } from './settings.service'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  public cardBacks = ['1', '2', '3', '4', '5', '6']

  constructor(
    private modalController: ModalController,
    private settingsService: SettingsService,
  ) {
  }

  playerName = this.settingsService.getPlayerName()
  language = this.settingsService.getLanguage()
  sounds = this.settingsService.getSounds()
  popUps = this.settingsService.getPopUps()
  systemTheme = this.settingsService.getSystemTheme()
  darkTheme = this.settingsService.getDarkTheme()
  cardBack = this.settingsService.getCardBack()
  cardType = this.settingsService.getCardType()

  async setPlayerName(event: CustomEvent): Promise<void> {
    await this.settingsService.setPlayerName(event.detail.value)
  }

  async setLanguage(event: CustomEvent): Promise<void> {
    await this.settingsService.setLanguage(event.detail.value)
  }

  async setSounds(event: CustomEvent): Promise<void> {
    await this.settingsService.setSounds(event.detail.checked)
  }

  async setPopUps(event: CustomEvent): Promise<void> {
    await this.settingsService.setPopUps(event.detail.checked)
  }

  async setSystemTheme(event: CustomEvent): Promise<void> {
    // to update dark theme's disabled status (the next setting), update the promise which causes the view to update
    if (event.detail.checked !== null && event.detail.checked !== await this.systemTheme) {
      await this.settingsService.setSystemTheme(event.detail.checked)
      this.systemTheme = this.settingsService.getSystemTheme()
    }
  }

  async setDarkTheme(event: CustomEvent): Promise<void> {
    if (event.detail.checked !== null && !(await this.settingsService.getSystemTheme())) {
      await this.settingsService.setDarkTheme(event.detail.checked)
    }
  }

  async setCardBack(cardBack: string): Promise<void> {
    await this.settingsService.setCardBack(cardBack)
  }

  async closeModal(): Promise<void> {
    await this.modalController.dismiss()
  }

  async setCardType(event: CustomEvent): Promise<void> {
    if (event.detail.value !== null) {
      await this.settingsService.setCardType(event.detail.value)
    }
  }
}
