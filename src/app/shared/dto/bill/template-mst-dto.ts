import {BillDiamentionDto} from './bill-template-diamention-dto';

export class TemplateMstDto {

  public templateName: any;
  public billDateFormat: any;
  public billId: any;
  public vendorId: any;
  public poNumber: any;
  public billAmount: any;
  public term: any;
  public billNo: any;
  public billDateStr: any;
  public attachmentUpdated: any;
  public attachment: any;

  public poNumberDimension: BillDiamentionDto;
  public billNumberDimension: BillDiamentionDto;
  public billDateDimension: BillDiamentionDto;
  public billAmountDimension: BillDiamentionDto;

  public invoiceNumberDiamention: BillDiamentionDto;
  public invoiceDateDiamention: BillDiamentionDto;
  public invoiceAmountDiamention: BillDiamentionDto;
  public otherEmails: any [] = [];
  public updateOn: null;
  public updateBy: null;
  public createdOn: null;
  public createdBy: null;

}
