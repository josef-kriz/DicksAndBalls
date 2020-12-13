import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { GamePageModule } from './game/game.module'

const routes: Routes = [
  {
    path: '',
    redirectTo: 'table/main',
    pathMatch: 'full',
  },
  {
    path: 'table/:tableId',
    loadChildren: (): Promise<GamePageModule> => import('./game/game.module').then(m => m.GamePageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
