import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundingAccountHomeComponent } from './funding-account-home.component';

describe('FundingAccountHomeComponent', () => {
  let component: FundingAccountHomeComponent;
  let fixture: ComponentFixture<FundingAccountHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FundingAccountHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FundingAccountHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
