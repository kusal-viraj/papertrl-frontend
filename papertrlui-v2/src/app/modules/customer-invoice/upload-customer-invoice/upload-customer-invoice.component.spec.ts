import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadCustomerInvoiceComponent } from './upload-customer-invoice.component';

describe('UploadCustomerInvoiceComponent', () => {
  let component: UploadCustomerInvoiceComponent;
  let fixture: ComponentFixture<UploadCustomerInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadCustomerInvoiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadCustomerInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
