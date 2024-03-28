import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalCardsComponent } from './digital-cards.component';

describe('DigitalCardsComponent', () => {
  let component: DigitalCardsComponent;
  let fixture: ComponentFixture<DigitalCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DigitalCardsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DigitalCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
