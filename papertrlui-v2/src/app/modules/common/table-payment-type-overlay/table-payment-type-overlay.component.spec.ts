import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablePaymentTypeOverlayComponent } from './table-payment-type-overlay.component';

describe('TablePaymentTypeOverlayComponent', () => {
  let component: TablePaymentTypeOverlayComponent;
  let fixture: ComponentFixture<TablePaymentTypeOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TablePaymentTypeOverlayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablePaymentTypeOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
