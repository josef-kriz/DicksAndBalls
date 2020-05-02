import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { GamePageRoutingModule } from './game-routing.module'
import { GamePage } from './game.page'
import { GameService } from './game.service'
import { PlayersComponent } from './components/players/players.component'
import { TableComponent } from './components/table/table.component'
import { DeckCardComponent } from './components/table/deck-card/deck-card.component'
import { CardsComponent } from './components/table/cards/cards.component'
import { SelectSuitComponent } from './components/table/select-suit/select-suit.component'
import { GameButtonComponent } from './components/game-button/game-button.component'
import { LeaveGameGuard } from './helpers/leaveGameGuard'
import { ChatComponent } from './components/chat/chat.component'

@NgModule({
  declarations: [
    GamePage,
    PlayersComponent,
    TableComponent,
    DeckCardComponent,
    CardsComponent,
    SelectSuitComponent,
    GameButtonComponent,
    ChatComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GamePageRoutingModule,
  ],
  providers: [
    GameService,
    LeaveGameGuard,
  ]
})
export class GamePageModule {
}
