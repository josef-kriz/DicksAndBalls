import { Component, Input, OnInit } from '@angular/core'
import { Opponent } from '../../../models/opponent'
import { SettingsService } from '../../../settings/settings.service'

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.scss'],
})
export class PlayersComponent implements OnInit {
  @Input() readonly players?: Opponent[]
  @Input() readonly gameActive?: boolean
  @Input() readonly playerOnTurn?: string
  @Input() readonly playerName?: string
  @Input() readonly participating?: boolean

  cardBack = '1'

  constructor(private settingsService: SettingsService) { }

  ngOnInit(): void {
    this.settingsService.getCardBack().subscribe(back => this.cardBack = back)
  }

  trackByPlayerName(_: number, player: Opponent): string {
    return player.name
  }
}
