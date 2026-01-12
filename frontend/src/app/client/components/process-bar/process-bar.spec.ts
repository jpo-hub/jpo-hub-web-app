import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessBar } from './process-bar';

describe('ProcessBar', () => {
  let component: ProcessBar;
  let fixture: ComponentFixture<ProcessBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
