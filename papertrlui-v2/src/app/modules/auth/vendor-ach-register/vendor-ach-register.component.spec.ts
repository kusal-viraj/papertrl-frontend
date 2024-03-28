import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorAchRegisterComponent } from './vendor-ach-register.component';

describe('VendorAchDetailsComponent', () => {
  let component: VendorAchRegisterComponent;
  let fixture: ComponentFixture<VendorAchRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorAchRegisterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorAchRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
