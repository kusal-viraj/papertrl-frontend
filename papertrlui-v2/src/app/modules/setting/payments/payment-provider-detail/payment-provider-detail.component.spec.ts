import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentProviderDetailComponent } from './payment-provider-detail.component';

describe('PaymentProviderDetailComponent', () => {
  let component: PaymentProviderDetailComponent;
  let fixture: ComponentFixture<PaymentProviderDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentProviderDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentProviderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
