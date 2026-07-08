import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUpdate } from './modal-update';

describe('ModalUpdate', () => {
  let component: ModalUpdate;
  let fixture: ComponentFixture<ModalUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalUpdate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
