import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardAtelier } from './card-atelier';

describe('CardAtelier', () => {
  let component: CardAtelier;
  let fixture: ComponentFixture<CardAtelier>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardAtelier]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardAtelier);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
