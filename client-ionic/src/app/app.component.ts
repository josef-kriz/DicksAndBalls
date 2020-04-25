import { Component, OnInit } from '@angular/core';

import { ModalController, Platform } from '@ionic/angular'
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AboutComponent } from './about/about.component'
import { RulesComponent } from './rules/rules.component'
import { SettingsComponent } from './settings/settings.component'
import { SettingsService } from './settings/settings.service'

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public selectedIndex = 0;
  public tables = [
    {
      title: 'Main',
      url: '/table/main',
      icon: 'easel',
    },
    {
      title: 'Custom',
      url: '/table/custom',
      icon: 'beer',
    },
  ];

  constructor(
    private modalController: ModalController,
    private platform: Platform,
    private settingsService: SettingsService,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp(): void {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  async ngOnInit(): Promise<void> {
    const path = window.location.pathname.split('table/')[1];
    if (path !== undefined) {
      this.selectedIndex = this.tables.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
    // if user wants to use system's theme, update it (and register a listener)
    if (await this.settingsService.getSystemTheme()) {
      await this.settingsService.setSystemTheme(prefersDark.matches)
    } else {
      await this.settingsService.setDarkTheme(await this.settingsService.getDarkTheme())
    }
    prefersDark.addEventListener('change', async (mediaQuery) => {
      if (await this.settingsService.getSystemTheme()) {
        await this.settingsService.setDarkTheme(mediaQuery.matches)
      }
    })
  }

  async openSettings(): Promise<void> {
    const modal = await this.modalController.create({
      component: SettingsComponent,
    });
    await modal.present();
  }

  async openRules(): Promise<void> {
    const modal = await this.modalController.create({
      component: RulesComponent,
    });
    await modal.present();
  }

  async openAbout(): Promise<void> {
    const modal = await this.modalController.create({
      component: AboutComponent,
    });
    await modal.present();
  }
}
