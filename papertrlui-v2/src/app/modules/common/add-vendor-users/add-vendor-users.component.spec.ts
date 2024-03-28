import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVendorUsersComponent } from './add-vendor-users.component';

describe('AddVendorUsersComponent', () => {
  let component: AddVendorUsersComponent;
  let fixture: ComponentFixture<AddVendorUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddVendorUsersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddVendorUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
