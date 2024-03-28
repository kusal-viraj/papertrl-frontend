import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentUploadFormComponent } from './payment-upload-form.component';

describe('PaymentUploadFormComponent', () => {
  let component: PaymentUploadFormComponent;
  let fixture: ComponentFixture<PaymentUploadFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentUploadFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentUploadFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
