import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDetailViewComponent } from './account-detail-view.component';

describe('AccountDetailViewComponent', () => {
  let component: AccountDetailViewComponent;
  let fixture: ComponentFixture<AccountDetailViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountDetailViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
