import {PaymentTypeDetailsDto} from './payment-type-details-dto';
import {Configuration} from './configuration';

export class PaymentTypeDto {
  public id: number;
  public paymentTypeId: number;
  public name: string;
  configurations: Configuration [] = [];
  configurationValue: any = {};
}
