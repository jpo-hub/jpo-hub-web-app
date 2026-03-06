import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ateliers } from './ateliers';

describe('Ateliers', () => {
  let component: Ateliers;
  let fixture: ComponentFixture<Ateliers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ateliers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ateliers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
