import { Injectable } from '@angular/core';
import { Subject } from 'rxjs'
import { MenuController } from '@ionic/angular'

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  menuEnabled = new Subject<boolean>()

  constructor(private menuController: MenuController) { }

  async showMenu(): Promise<void> {
    if (!await this.menuController.isEnabled('main-menu')) {
      await this.menuController.enable(true, 'main-menu')
      this.menuEnabled.next(true)
    }

    await this.menuController.open('main-menu')
  }
}
