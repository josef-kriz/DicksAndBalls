import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { GamePageRoutingModule } from './game-routing.module'
import { GamePage } from './game.page'
import { SocketIoModule } from 'ngx-socket-io'
import { GameSocket } from './helpers/socket/game.socket'
import { GameService } from './game.service'
import { PlayersComponent } from './components/players/players.component'
import { TableComponent } from './components/table/table.component'
import { DeckCardComponent } from './components/table/deck-card/deck-card.component'
import { CardsComponent } from './components/table/cards/cards.component'
import { SelectSuitComponent } from './components/table/select-suit/select-suit.component'
import { GameButtonComponent } from './components/game-button/game-button.component'

@NgModule({
  declarations: [
    GamePage,
    PlayersComponent,
    TableComponent,
    DeckCardComponent,
    CardsComponent,
    SelectSuitComponent,
    GameButtonComponent,
  ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        GamePageRoutingModule,
        SocketIoModule,
    ],
    providers: [
        GameSocket,
        GameService,
    ]
})
export class GamePageModule {
}
