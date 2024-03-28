import {AdditionalFieldDetailDto} from '../additional-field/additional-field-detail-dto';
import {VendorAdditionalFieldAttachments} from './vendor-additional-field-attachments';

export class VendorMasterDto {
  id ?: any;
  name ?: string;
  vendorCode ?: string;
  contactPerson ?: string;
  contactNumber ?: string;
  showRemit: boolean;
  remitEmailSwitchEnable: boolean;
  fax ?: string;
  email ?: string;
  ccEmail ?: string;
  remittanceEmail ?: string;
  permenantAddress ?: PermanentAddress = new PermanentAddress();
  remitAddress ?: RemitPermanentAddress = new RemitPermanentAddress();
  // acceptedPaymentType ?: AcceptedPaymentTypes = new AcceptedPaymentTypes();
  additionalData: AdditionalFieldDetailDto[] = new Array();
  additionalFieldAttachments: VendorAdditionalFieldAttachments[] = new Array();
  public additionalDataBasicInfo: AdditionalFieldDetailDto[] = new Array();
  public additionalDataPostalAddress: AdditionalFieldDetailDto[] = new Array();
  public additionalDataRemitAddress: AdditionalFieldDetailDto[] = new Array();
  public additionalDataW9Info: AdditionalFieldDetailDto[] = new Array();
  public additionalDataPaymentInfo: AdditionalFieldDetailDto[] = new Array();
  w9Form ?: File;
  socialSecNo ?: string;
  taxClassification?: any;
  empIdNo ?: string;
  exemptPayeeCode ?: string;
  fatcaReportingCode ?: string;
  sicCode ?: string;
  naicsCode ?: string;
  sicCodeName ?: string;
  naicsCodeName ?: string;
  webUrl ?: string;
  businessDescription ?: string;
  businessName ?: string;
  invitationUuid ?: string;
  w9AttachmentId ?: any; //
  w9Attachment: W9Attachment[];
  paymentOptionId: string;
  paymentTypeId: string;
  paymentDescription: string;
  paymentTypeName: string;
  classificationIdList: any;
  classificationRelationObj = [];
  diverseSupplier: any;
  classificationAttachmentList: any;
  classificationAttachment: any[];
  communityId: any;
  requestedTenantId: any;
  confidential = false;
  term?: number;
  netDaysDue?: number;
  discountPercentage?: number;
  discountDaysDue?: number;
  vendorGroupIdList?: any;
  termName?: any;
  vendorGroupNameList?: any;
  accountNumber: any;
  recipientType: any;
  mailOptionName?: string;
  accountType: any;
  accountRoutingNumber: any;
  companyName: any;
  // acceptedPaymentTypes: any = [];
  acceptedPaymentTypes: AcceptedPaymentTypes[] = [];
  preferredPaymentTypeId: any;
  acceptedPaymentTypesStr: string;
  preferredPaymentTypeStr: string;
  uuid: any;
  tenNinetyNine: any;
  w9AttachmentDownloading: any;

}

export class PermanentAddress {
  country ?: any;
  addressState ?: any;
  city ?: any;
  zipcode ?: any;
  addressLine1 ?: string;
  addressLine2 ?: string;
}

export class RemitPermanentAddress {
  country ?: any;
  addressState ?: any;
  city ?: any;
  zipcode ?: any;
  addressLine1 ?: string;
  addressLine2 ?: string;
}

export class W9Attachment {
  id: any;
  fileName: any;
  downloading?: any;
}


export class AcceptedPaymentTypes {
  selected ?: any;
  paymentTypeId ?: any;
  providerId ?: any;
  differentRemit ?: any;
  remittanceEmail ?: string;
  paymentProviderName ?: string;
  paymentTypeName ?: string;
}
