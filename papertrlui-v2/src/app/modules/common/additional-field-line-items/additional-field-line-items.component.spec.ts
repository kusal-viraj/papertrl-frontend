import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalFieldLineItemsComponent } from './additional-field-line-items.component';

describe('AdditionalFieldLineItemsComponent', () => {
  let component: AdditionalFieldLineItemsComponent;
  let fixture: ComponentFixture<AdditionalFieldLineItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdditionalFieldLineItemsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdditionalFieldLineItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
