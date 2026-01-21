import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiliereStat } from './filiere-stat';

describe('FiliereStat', () => {
  let component: FiliereStat;
  let fixture: ComponentFixture<FiliereStat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiliereStat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiliereStat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
