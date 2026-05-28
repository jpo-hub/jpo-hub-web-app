import { TestBed } from '@angular/core/testing';

import { Ateliers } from './ateliers';

describe('Ateliers', () => {
  let service: Ateliers;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Ateliers);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
