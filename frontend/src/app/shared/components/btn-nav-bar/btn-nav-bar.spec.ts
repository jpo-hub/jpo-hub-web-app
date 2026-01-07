import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnNavBar } from './btn-nav-bar';

describe('BtnNavBar', () => {
  let component: BtnNavBar;
  let fixture: ComponentFixture<BtnNavBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtnNavBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtnNavBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
