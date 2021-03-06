import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'
import { TranslateService } from '@ngx-translate/core'
import { map } from 'rxjs/operators'

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable()
export class LeaveGameGuard implements CanDeactivate<ComponentCanDeactivate> {
  constructor(private translateService: TranslateService) {
  }

  canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
    return this.translateService.get('Game.leave_warning').pipe(
      map((message) => {
        return component.canDeactivate() ?
          true :
          // NOTE: this warning message will only be shown when navigating elsewhere within your angular app;
          // when navigating away from your angular app, the browser will show a generic warning message
          // see http://stackoverflow.com/a/42207299/7307355
          confirm(message);
      })
    )
  }
}
