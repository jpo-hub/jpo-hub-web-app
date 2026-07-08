import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatsStat } from './candidats-stat';

describe('CandidatsStat', () => {
  let component: CandidatsStat;
  let fixture: ComponentFixture<CandidatsStat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidatsStat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidatsStat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
