import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillProcessComponent } from './bill-process.component';

describe('BillProcessComponent', () => {
  let component: BillProcessComponent;
  let fixture: ComponentFixture<BillProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillProcessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
