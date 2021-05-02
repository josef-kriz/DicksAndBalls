import { Component, Input, OnInit } from '@angular/core'
import { Opponent } from '../../../models/opponent'
import { SettingsService } from '../../../settings/settings.service'
import { animate, animateChild, query, stagger, style, transition, trigger } from '@angular/animations'

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.scss'],
  animations: [
    trigger('cardAnimations', [
      transition(':enter', [
        query('@enterLeaveAnimation', [
          stagger(250, animateChild()),
        ]),
      ]),
    ]),
    trigger('enterLeaveAnimation', [
      transition(':enter', [
        style({transform: 'scale(0)'}),
        animate('250ms', style({transform: 'scale(1)'})),
      ]),
      transition(':leave', [
        animate('300ms', style({transform: 'scale(0)'})),
      ]),
    ]),
  ],
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
