import { TestBed } from '@angular/core/testing';

import { CustomerInvoiceService } from './customer-invoice.service';

describe('CustomerInvoiceService', () => {
  let service: CustomerInvoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerInvoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
