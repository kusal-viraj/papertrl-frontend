export class BatchTransaction {
  billNo: string;
  txnRef: string;
  txnType: number;
  txnAmount: number;
  txnDiscount: number;
  billId: number;
  vendorId: number;
  comment: string;

  constructor(obj: any, util) {
    this.billNo = obj['txn.billNo'];
    this.txnRef = obj['txn.txnRef'];
    this.txnType = obj['txn.paymentType'];
    this.txnAmount = parseFloat(util.amountFormatter(obj['txn.paymentAmount']));
    this.txnDiscount = parseFloat(util.amountFormatter(obj['txn.appliedDiscount']));
    this.comment = obj['txn.comment'];
    this.vendorId = obj.vendorId;
    this.billId = obj.id;
  }
}
