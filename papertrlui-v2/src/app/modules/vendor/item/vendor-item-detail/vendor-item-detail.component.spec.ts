import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorItemDetailComponent } from './vendor-item-detail.component';

describe('VendorItemDetailComponent', () => {
  let component: VendorItemDetailComponent;
  let fixture: ComponentFixture<VendorItemDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorItemDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorItemDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
