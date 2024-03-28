import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentApproveComponent } from './payment-approve.component';

describe('PaymentApproveComponent', () => {
  let component: PaymentApproveComponent;
  let fixture: ComponentFixture<PaymentApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentApproveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
