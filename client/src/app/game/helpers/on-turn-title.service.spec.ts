import { TestBed } from '@angular/core/testing';

import { OnTurnTitleService } from './on-turn-title.service';

describe('OnTurnTitleService', () => {
  let service: OnTurnTitleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnTurnTitleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
