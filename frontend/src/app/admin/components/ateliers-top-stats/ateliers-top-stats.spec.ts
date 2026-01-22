import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AteliersTopStats } from './ateliers-top-stats';

describe('AteliersTopStats', () => {
  let component: AteliersTopStats;
  let fixture: ComponentFixture<AteliersTopStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AteliersTopStats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AteliersTopStats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
