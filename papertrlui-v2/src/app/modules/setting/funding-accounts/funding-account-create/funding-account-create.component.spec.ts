import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundingAccountCreateComponent } from './funding-account-create.component';

describe('FundingAccountCreateComponent', () => {
  let component: FundingAccountCreateComponent;
  let fixture: ComponentFixture<FundingAccountCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FundingAccountCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FundingAccountCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
