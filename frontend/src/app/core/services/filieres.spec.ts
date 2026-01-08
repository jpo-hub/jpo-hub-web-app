import { TestBed } from '@angular/core/testing';

import { Filieres } from './filieres';

describe('Filieres', () => {
  let service: Filieres;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Filieres);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
