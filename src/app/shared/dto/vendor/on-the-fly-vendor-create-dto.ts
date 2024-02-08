import {PermanentAddress} from './vendor-master-dto';

export class OnTheFlyVendorCreateDto {
  vendorName: any;
  vendorCode: any;
  contactName: any;
  contactNumber: any;
  faxNumber: any;
  email: any;
  ccEmail: any;
  permenantAddress ?: PermanentAddress = new PermanentAddress();
}
