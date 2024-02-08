import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerInvoiceAuditTrialComponent } from './customer-invoice-audit-trial.component';

describe('CustomerInvoiceAuditTrialComponent', () => {
  let component: CustomerInvoiceAuditTrialComponent;
  let fixture: ComponentFixture<CustomerInvoiceAuditTrialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerInvoiceAuditTrialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerInvoiceAuditTrialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
