import { Component } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { SettingsService } from './settings.service'
import { Language } from '../models/language'
import { TranslateService } from '@ngx-translate/core'
import { OnTurnTitleService } from '../game/helpers/on-turn-title.service'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  cardBacks = ['1', '2', '3', '4', '5', '6']
  availableLanguages: Language[]

  constructor(
    private onTurnTitleService: OnTurnTitleService,
    private modalController: ModalController,
    private settingsService: SettingsService,
    private translateService: TranslateService,
  ) {
    this.availableLanguages = this.settingsService.getAvailableLanguages()
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
    if (event.detail.value !== null) {
      // remove old *ON TURN* translation (if present)
      this.onTurnTitleService.removeText()

      await this.settingsService.setLanguage(event.detail.value)
      if (event.detail.value === 'default') {
        const browserLang = this.translateService.getBrowserLang()
        if (this.translateService.getLangs().includes(browserLang)) this.translateService.use(browserLang)
        else this.translateService.use('en')
      }
      else this.translateService.use(event.detail.value)
    }
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
