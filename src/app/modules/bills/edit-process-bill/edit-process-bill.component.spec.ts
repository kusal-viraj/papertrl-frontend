import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProcessBillComponent } from './edit-process-bill.component';

describe('EditProcessBillComponent', () => {
  let component: EditProcessBillComponent;
  let fixture: ComponentFixture<EditProcessBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditProcessBillComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProcessBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
