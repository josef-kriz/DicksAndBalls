import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GamePage } from './game.page';
import { LeaveGameGuard } from './helpers/leaveGameGuard'

const routes: Routes = [
  {
    path: '',
    component: GamePage,
    canDeactivate: [
      LeaveGameGuard,
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GamePageRoutingModule {}
