import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxForm } from './checkbox-form';

describe('CheckboxForm', () => {
  let component: CheckboxForm;
  let fixture: ComponentFixture<CheckboxForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckboxForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
