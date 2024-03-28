import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorGroupComponent } from './vendor-group.component';

describe('VendorGroupComponent', () => {
  let component: VendorGroupComponent;
  let fixture: ComponentFixture<VendorGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorGroupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
