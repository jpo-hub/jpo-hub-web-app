import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUpdateAtelier } from './modal-update-atelier';

describe('ModalUpdateAtelier', () => {
  let component: ModalUpdateAtelier;
  let fixture: ComponentFixture<ModalUpdateAtelier>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalUpdateAtelier]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalUpdateAtelier);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
