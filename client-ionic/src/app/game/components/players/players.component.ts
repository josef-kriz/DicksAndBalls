import { Component, Input } from '@angular/core'
import { Opponent } from '../../models/opponent'

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.scss'],
})
export class PlayersComponent {
  @Input() readonly players?: Opponent[]
  @Input() readonly gameActive?: boolean
  @Input() readonly playerOnTurn?: string
  @Input() readonly playerName?: string
  @Input() readonly participating?: boolean

  constructor() { }
}
