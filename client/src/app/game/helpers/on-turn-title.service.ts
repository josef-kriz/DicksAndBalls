import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core'
import { Title } from '@angular/platform-browser'

@Injectable({
  providedIn: 'root'
})
export class OnTurnTitleService {
  // memorize to prevent errors when changing languages
  private onTurnTextPresent = false
  private onTurnTextLength = 0

  constructor(private titleService: Title, private translateService: TranslateService) { }

  async addText(): Promise<void> {
    const onTurnText = `*${await this.translateService.get('Game.on_turn').toPromise()}*`
    this.onTurnTextPresent = true
    this.onTurnTextLength = onTurnText.length

    this.titleService.setTitle(`${onTurnText} ${this.titleService.getTitle()}`)
  }

  removeText(): void {
    if (!this.onTurnTextPresent) return

    this.onTurnTextPresent = false
    this.titleService.setTitle(this.titleService.getTitle().slice(this.onTurnTextLength + 1))
  }
}
