import { Injectable } from '@angular/core';
import { Subject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  menuEnabled = new Subject<boolean>()

  constructor() { }
}
