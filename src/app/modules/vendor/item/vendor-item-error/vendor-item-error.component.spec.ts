import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorItemErrorComponent } from './vendor-item-error.component';

describe('VendorItemErrorComponent', () => {
  let component: VendorItemErrorComponent;
  let fixture: ComponentFixture<VendorItemErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorItemErrorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorItemErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
