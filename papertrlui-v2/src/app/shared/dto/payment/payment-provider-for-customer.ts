export class PaymentProviderForCustomer {
  id: number;
  logoImage: File;
  status: string;
  paymentProvider: number;
  defaultProvider: boolean;
  tenantId: number;
  daysForCancel: number;
  hoursForCancel: number;
  minutesForCancel: number;
  createdBy: string;
  createdOn: string;
  updateBy: string;
  updateOn: string;
  deleteBy: string;
  deleteOn: string;
}
