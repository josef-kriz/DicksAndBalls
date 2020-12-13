import { Component, OnDestroy, OnInit } from '@angular/core'

import { MenuController, ModalController, Platform } from '@ionic/angular'
import { SplashScreen } from '@ionic-native/splash-screen/ngx'
import { StatusBar } from '@ionic-native/status-bar/ngx'
import { AboutComponent } from './about/about.component'
import { RulesComponent } from './rules/rules.component'
import { SettingsComponent } from './settings/settings.component'
import { SettingsService } from './settings/settings.service'
import { TableService } from './services/table.service'
import { isTableUpdateMessage, TableInfo, TableUpdateMessage } from './models/message'
import { Router } from '@angular/router'
import { MenuService } from './services/menu.service'
import { UpdateService } from './services/update.service'
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  selectedIndex = 0
  tables?: TableInfo[]

  isMenuEnabled$ = this.menuService.menuEnabled$
  updateAvailable$ = this.updateService.updateAvailable$

  private init: Promise<void>

  constructor(
    private menuController: MenuController,
    private menuService: MenuService,
    private modalController: ModalController,
    private platform: Platform,
    private router: Router,
    private settingsService: SettingsService,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private tableService: TableService,
    private translateService: TranslateService,
    private updateService: UpdateService,
  ) {
    this.init = this.initializeApp()
  }

  async initializeApp(): Promise<void> {
    await this.platform.ready()
    if (this.platform.is('hybrid')) {
      this.statusBar.styleDefault()
      this.splashScreen.hide()
    }
  }

  async ngOnInit(): Promise<void> {
    // subscribe to tables changes
    this.tableService.getTables().subscribe(this.handleTablesMessage) // TODO error handling

    const [isMenuEnabled] = await Promise.all([
      this.menuController.isEnabled('main-menu'),
      this.setLanguage(),
      this.setTheme(),
    ])

    this.isMenuEnabled$.next(isMenuEnabled)
  }

  ngOnDestroy(): void {
    this.tableService.dispose()
  }

  async openSettings(): Promise<void> {
    const modal = await this.modalController.create({
      component: SettingsComponent,
    })
    await modal.present()
  }

  async openRules(): Promise<void> {
    const modal = await this.modalController.create({
      component: RulesComponent,
    })
    await modal.present()
  }

  async openAbout(): Promise<void> {
    const modal = await this.modalController.create({
      component: AboutComponent,
    })
    await modal.present()
  }

  async hideMenu(): Promise<void> {
    await this.menuController.enable(false, 'main-menu')
    this.isMenuEnabled$.next(false)
  }

  async addTable(): Promise<void> {
    await this.tableService.addTable()
  }

  async showUpdateAlert(): Promise<void> {
    await this.updateService.showUpdateAlert()
  }

  private async setTheme(): Promise<void> {
    // if user wants to use system's theme, update it (and register a listener)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

    if (await this.settingsService.getSystemTheme()) {
      await this.settingsService.setDarkTheme(prefersDark.matches)
    } else {
      await this.settingsService.setDarkTheme(await this.settingsService.getDarkTheme())
    }
    prefersDark.addEventListener('change', async (mediaQuery) => {
      if (await this.settingsService.getSystemTheme()) {
        await this.settingsService.setDarkTheme(mediaQuery.matches)
      }
    })
  }

  private async setLanguage(): Promise<void> {
    const availableLanguages = this.settingsService.getAvailableLanguages().map(l => l.id)
    this.translateService.addLangs(availableLanguages)

    const preferred = await this.settingsService.getLanguage()
    if (!preferred || preferred === 'default') {
      const browserLang = this.translateService.getBrowserLang()
      if (this.translateService.getLangs().includes(browserLang)) this.translateService.use(browserLang)
      else this.translateService.use('en')
    } else this.translateService.use(preferred)
  }

  private handleTablesMessage = async (message: TableUpdateMessage): Promise<void> => {
    if (isTableUpdateMessage(message)) {
      this.tables = message.tables

      // set selected menu item
      const path = window.location.pathname.split('table/')[1]
      if (path !== undefined) {
        this.selectedIndex = this.tables.findIndex(table => table.id.toLowerCase() === path.toLowerCase())
        if (this.selectedIndex === -1) {
          await this.router.navigate(['table', 'main'])
        }
      }
    }
  }
}
