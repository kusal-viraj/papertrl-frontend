import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryCodeValidationComponent } from './country-code-validation.component';

describe('CountryCodeValidationComponent', () => {
  let component: CountryCodeValidationComponent;
  let fixture: ComponentFixture<CountryCodeValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CountryCodeValidationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountryCodeValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
