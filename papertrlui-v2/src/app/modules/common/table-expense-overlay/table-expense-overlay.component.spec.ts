import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableExpenseOverlayComponent } from './table-expense-overlay.component';

describe('TableExpenseOverlayComponent', () => {
  let component: TableExpenseOverlayComponent;
  let fixture: ComponentFixture<TableExpenseOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableExpenseOverlayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableExpenseOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
