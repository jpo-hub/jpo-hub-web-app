import { TestBed } from '@angular/core/testing';

import { Atelier } from './atelier';

describe('Atelier', () => {
  let service: Atelier;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Atelier);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
