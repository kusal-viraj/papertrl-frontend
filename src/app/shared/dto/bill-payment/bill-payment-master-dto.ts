import {DropdownDto} from '../common/dropDown/dropdown-dto';
import {AdditionalFieldDetailDto} from '../additional-field/additional-field-detail-dto';
import {VpPoAdditionalfieldAttachments} from '../po/vp-po-additionalfield-attachments';

export class BillPaymentMasterDto {
  public id: number;
  public paymentReferanceNo: string = '';
  public paymentDate: any;
  public amount: number;
  public discountAmount: number;
  public mailedDate: Date;
  public paymentType: string;
  public billId: number;
  public billNo: string;
  public status: string;
  public paymentTypeDescription: string;
  public vendor: number;
  public vendorName: string;
  public invoiceDrop = new DropdownDto();
  public paymentTypeList = new DropdownDto();

  public paymentDateRange: any;
  public mailDateRange: any;

  public billAmount: number;
  public billDate: Date;
  public receiptFileName: string;
  public additionalData: AdditionalFieldDetailDto [] = [];
  public additionalFieldAttachments: VpPoAdditionalfieldAttachments [] = [];

  public receipt: File;

  constructor() {
  }

}
