import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableColumnToggleComponent } from './table-column-toggle.component';

describe('TableColumnToggleComponent', () => {
  let component: TableColumnToggleComponent;
  let fixture: ComponentFixture<TableColumnToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableColumnToggleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableColumnToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
