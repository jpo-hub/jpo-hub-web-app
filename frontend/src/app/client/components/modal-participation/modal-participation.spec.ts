import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalParticipation } from './modal-participation';

describe('ModalParticipation', () => {
  let component: ModalParticipation;
  let fixture: ComponentFixture<ModalParticipation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalParticipation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalParticipation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
