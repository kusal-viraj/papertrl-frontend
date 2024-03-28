import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldValidationComponent } from './field-validation.component';

describe('FieldValidationComponent', () => {
  let component: FieldValidationComponent;
  let fixture: ComponentFixture<FieldValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FieldValidationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
