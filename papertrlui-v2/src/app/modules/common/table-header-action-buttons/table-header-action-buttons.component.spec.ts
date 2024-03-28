import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableHeaderActionButtonsComponent } from './table-header-action-buttons.component';

describe('TableHeaderActionButtonsComponent', () => {
  let component: TableHeaderActionButtonsComponent;
  let fixture: ComponentFixture<TableHeaderActionButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableHeaderActionButtonsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableHeaderActionButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
