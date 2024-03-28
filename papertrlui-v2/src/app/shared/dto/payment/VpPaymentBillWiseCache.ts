export class VpPaymentBillWiseCache {
  id: number;
  billId: number;
  billNo: string;
  txnRef: string;
  comment: string;
  txnType: number;
  billAmount: number;
  balanceAmount: number;
  billDate: Date;
  dueDate: Date;
  txnAmount: number;
  txnDiscount: number;
  vendorId: number;

  constructor(obj: any, util) {
    this.billId = obj.id;
    this.balanceAmount = parseFloat(obj['bill.balanceAmount']);
    this.billAmount = parseFloat(obj['bill.billAmount']);
    this.billDate = new Date(obj['bill.billDate']);
    this.billNo = obj['bill.billNo'];
    this.dueDate = new Date(obj['bill.dueDate']);
    this.vendorId = parseFloat(obj['vendor.id']);
    this.txnType =  obj.paymentTypeId ?  obj.paymentTypeId : obj.paymentType;
    this.txnDiscount = parseFloat(obj.txnDiscount);
    this.txnRef = obj.referenceNo;
    this.comment = obj.comment;
    this.txnAmount = parseFloat(util.amountFormatter(obj['bill.paymentAmount']));
  }
}
