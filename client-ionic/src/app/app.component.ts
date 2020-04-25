import { Component, OnInit } from '@angular/core';

import { ModalController, Platform } from '@ionic/angular'
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AboutComponent } from './about/about.component'

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

  ngOnInit(): void {
    const path = window.location.pathname.split('table/')[1];
    if (path !== undefined) {
      this.selectedIndex = this.tables.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
    }
  }

  async openAbout(): Promise<void> {
    const modal = await this.modalController.create({
      component: AboutComponent
    });
    await modal.present();
  }
}
