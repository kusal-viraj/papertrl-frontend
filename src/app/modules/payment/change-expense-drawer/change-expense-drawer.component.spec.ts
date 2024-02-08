import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeExpenseDrawerComponent } from './change-expense-drawer.component';

describe('ChangeExpenseDrawerComponent', () => {
  let component: ChangeExpenseDrawerComponent;
  let fixture: ComponentFixture<ChangeExpenseDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeExpenseDrawerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeExpenseDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
