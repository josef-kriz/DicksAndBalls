import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage'
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AboutComponent } from './about/about.component'
import { RulesComponent } from './rules/rules.component'
import { SettingsComponent } from './settings/settings.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment'
import { MainSocket } from './sockets/main.socket'
import { SocketIoModule } from 'ngx-socket-io'
import { ChatComponent } from './chat/chat.component'
import { FormsModule } from '@angular/forms'
import { NgxLinkifyjsModule } from 'ngx-linkifyjs'

@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    AboutComponent,
    RulesComponent,
    ChatComponent,
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    FormsModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWithDelay:5000'
    }), // TODO register via observable
    SocketIoModule,
    NgxLinkifyjsModule.forRoot(),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    MainSocket,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
