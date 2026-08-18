import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilieresAdmin } from './filieres';

describe('FilieresAdmin', () => {
  let component: FilieresAdmin;
  let fixture: ComponentFixture<FilieresAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilieresAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilieresAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
