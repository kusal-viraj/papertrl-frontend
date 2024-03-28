import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalFieldHeaderItemsComponent } from './additional-field-header-items.component';

describe('AdditionalFieldHeaderItemsComponent', () => {
  let component: AdditionalFieldHeaderItemsComponent;
  let fixture: ComponentFixture<AdditionalFieldHeaderItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdditionalFieldHeaderItemsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdditionalFieldHeaderItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
