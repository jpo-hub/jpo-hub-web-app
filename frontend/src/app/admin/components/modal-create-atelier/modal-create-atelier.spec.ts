import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreateAtelier } from './modal-create-atelier';

describe('ModalCreateAtelier', () => {
  let component: ModalCreateAtelier;
  let fixture: ComponentFixture<ModalCreateAtelier>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCreateAtelier]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCreateAtelier);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
