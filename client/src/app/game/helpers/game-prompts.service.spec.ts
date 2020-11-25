import { TestBed } from '@angular/core/testing';

import { GamePromptsService } from './game-prompts.service';

describe('GamePromptsService', () => {
  let service: GamePromptsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GamePromptsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
