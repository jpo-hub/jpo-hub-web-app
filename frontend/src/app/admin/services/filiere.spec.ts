import { TestBed } from '@angular/core/testing';

import { FiliereService } from './filiere';

describe('FiliereService', () => {
  let service: FiliereService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FiliereService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
