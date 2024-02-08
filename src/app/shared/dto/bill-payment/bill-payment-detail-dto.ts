export class BillPaymentDetailDto {

  public vendorName: string;
  public billNo: string;
  public billAmount: number;
  public billDate: Date;
  public paymentReference: string;
  public paymentDate: Date;
  public paymentAmount: number;
  public discountAmount: number;
  public paymentMethod: string;

  constructor() {
  }


}
