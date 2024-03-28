import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableInlineColumnFiltersComponent } from './table-inline-column-filters.component';

describe('TableInlineColumnFiltersComponent', () => {
  let component: TableInlineColumnFiltersComponent;
  let fixture: ComponentFixture<TableInlineColumnFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableInlineColumnFiltersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableInlineColumnFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
