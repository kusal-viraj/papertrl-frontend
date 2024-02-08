import {PaymentTypeDto} from './Payment-type-dto';

export class PaymentProviderMst {
  id: number;
  paymentProvider: number;
  status: string;
  description: string;
  name: string;
  logoUrl: any;
  daysForCancel: number;
  hoursForCancel: number;
  minutesForCancel: number;
  defaultProvider = false;
  notConfigured = false;
  connected = false;
  isProgressSendConfigurationAction = false;
  paymentTypeList: PaymentTypeDto [] = [];
  supportedTypeList: any [] = [];
}
