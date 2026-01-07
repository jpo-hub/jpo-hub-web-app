import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputForm } from './input-form';

describe('InputForm', () => {
  let component: InputForm;
  let fixture: ComponentFixture<InputForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
