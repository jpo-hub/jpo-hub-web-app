import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatsInfoDashboard } from './candidats-info-dashboard';

describe('CandidatsInfoDashboard', () => {
  let component: CandidatsInfoDashboard;
  let fixture: ComponentFixture<CandidatsInfoDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidatsInfoDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidatsInfoDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
