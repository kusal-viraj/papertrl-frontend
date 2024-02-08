import {ZipCodeDto} from './zip-code-dto';
import {CountryDto} from './country-dto';

export class AddressDto {
  public id: bigint;
  public addressLine1: string;
  public addressLine2: string;
  public stateOther: string = '';
  public cityOther: string = '';
  public zipcodeOther: string = '';
  public type: string;
  public country: CountryDto = new CountryDto();
  public zipcode: ZipCodeDto = new ZipCodeDto();

  constructor() {
  }
}
