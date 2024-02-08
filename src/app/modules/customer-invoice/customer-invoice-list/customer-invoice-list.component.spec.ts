import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerInvoiceListComponent } from './customer-invoice-list.component';

describe('CustomerInvoiceListComponent', () => {
  let component: CustomerInvoiceListComponent;
  let fixture: ComponentFixture<CustomerInvoiceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerInvoiceListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerInvoiceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
