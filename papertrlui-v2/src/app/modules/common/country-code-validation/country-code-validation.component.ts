import {Component, Input, OnInit} from '@angular/core';
import {SearchCountryField, CountryISO, PhoneNumberFormat} from 'ngx-intl-tel-input';
import {AbstractControl} from '@angular/forms';


@Component({
  selector: 'app-country-code-validation',
  templateUrl: './country-code-validation.component.html',
  styleUrls: ['./country-code-validation.component.scss']
})
export class CountryCodeValidationComponent implements OnInit {

  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates];
  @Input() telephoneFormControl: AbstractControl | any;

  constructor() {
  }

  ngOnInit(): void {

  }

  onCountryChange(event) {
    try {
      this.telephoneFormControl.reset();
    } catch (e) {

    }
  }
}
