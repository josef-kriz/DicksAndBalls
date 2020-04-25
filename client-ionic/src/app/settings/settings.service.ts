import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage'

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private storage: Storage) { }

  async setPlayerName(name: string): Promise<void> {
    await this.storage.ready()
    await this.storage.set('playerName', name)
  }

  async getPlayerName(): Promise<string | null> {
    await this.storage.ready()
    return this.storage.get('playerName')
  }

  async setLanguage(language: string): Promise<void> {
    await this.storage.ready()
    await this.storage.set('language', language)
  }

  async getLanguage(): Promise<string> {
    await this.storage.ready()
    const language = await this.storage.get('language')
    return language === null ? 'default' : language
  }

  async setSounds(sounds: boolean): Promise<void> {
    await this.storage.ready()
    await this.storage.set('sounds', sounds)
  }

  async getSounds(): Promise<boolean> {
    await this.storage.ready()
    const sounds = await this.storage.get('sounds')
    return sounds === null ? true : sounds
  }

  async setPopUps(popUps: boolean): Promise<void> {
    await this.storage.ready()
    await this.storage.set('popUps', popUps)
  }

  async getPopUps(): Promise<boolean> {
    await this.storage.ready()
    const sounds = await this.storage.get('popUps')
    return sounds === null ? true : sounds
  }

  async setSystemTheme(systemTheme: boolean): Promise<void> {
    await this.storage.ready()
    await this.storage.set('systemTheme', systemTheme)
    // if true, apply system's defaults. Else toggle depending on darkTheme variable
    if (systemTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
      document.body.classList.toggle('dark', prefersDark.matches)
    } else {
      document.body.classList.toggle('dark', await this.getDarkTheme())
    }
  }

  async getSystemTheme(): Promise<boolean> {
    await this.storage.ready()
    const systemTheme = await this.storage.get('systemTheme')
    return systemTheme === null ? true : systemTheme
  }

  async setDarkTheme(darkTheme: boolean): Promise<void> {
    await this.storage.ready()
    await this.storage.set('darkTheme', darkTheme)
    document.body.classList.toggle('dark', darkTheme)
  }

  async getDarkTheme(): Promise<boolean> {
    await this.storage.ready()
    const darkTheme = await this.storage.get('darkTheme')
    return darkTheme === null ? false : darkTheme
  }

  async setCardBack(cardBack: string): Promise<void> {
    await this.storage.ready()
    await this.storage.set('cardBack', cardBack)
  }

  async getCardBack(): Promise<string | null> {
    await this.storage.ready()
    return this.storage.get('cardBack')
  }

  async setCardType(cardType: string): Promise<void> {
    await this.storage.ready()
    await this.storage.set('cardType', cardType)
  }

  async getCardType(): Promise<string | null> {
    await this.storage.ready()
    return this.storage.get('cardType')
  }
}
