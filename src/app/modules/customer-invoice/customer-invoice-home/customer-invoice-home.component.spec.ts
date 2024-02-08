import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerInvoiceHomeComponent } from './customer-invoice-home.component';

describe('CustomerInvoiceHomeComponent', () => {
  let component: CustomerInvoiceHomeComponent;
  let fixture: ComponentFixture<CustomerInvoiceHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerInvoiceHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerInvoiceHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
