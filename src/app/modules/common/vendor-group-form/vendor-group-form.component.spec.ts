import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorGroupFormComponent } from './vendor-group-form.component';

describe('VendorGroupFormComponent', () => {
  let component: VendorGroupFormComponent;
  let fixture: ComponentFixture<VendorGroupFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorGroupFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorGroupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
