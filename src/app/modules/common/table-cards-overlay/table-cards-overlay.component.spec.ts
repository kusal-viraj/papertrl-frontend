import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCardsOverlayComponent } from './table-cards-overlay.component';

describe('TableCardsOverlayComponent', () => {
  let component: TableCardsOverlayComponent;
  let fixture: ComponentFixture<TableCardsOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableCardsOverlayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableCardsOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
