import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessPaymentRequestComponent } from './process-payment-request.component';

describe('ProcessPaymentRequestComponent', () => {
  let component: ProcessPaymentRequestComponent;
  let fixture: ComponentFixture<ProcessPaymentRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessPaymentRequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessPaymentRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
