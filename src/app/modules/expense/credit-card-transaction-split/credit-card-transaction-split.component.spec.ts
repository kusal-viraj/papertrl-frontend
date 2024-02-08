import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditCardTransactionSplitComponent } from './credit-card-transaction-split.component';

describe('CreditCardTransactionSplitComponent', () => {
  let component: CreditCardTransactionSplitComponent;
  let fixture: ComponentFixture<CreditCardTransactionSplitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreditCardTransactionSplitComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditCardTransactionSplitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
