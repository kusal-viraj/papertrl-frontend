import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorItemUploadComponent } from './vendor-item-upload.component';

describe('VendorItemUploadComponent', () => {
  let component: VendorItemUploadComponent;
  let fixture: ComponentFixture<VendorItemUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorItemUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorItemUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
