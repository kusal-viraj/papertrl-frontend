export class VendorPaymentTableDto {
  id: number;
  paymentRef: string;
  paymentAmount: number;
  discountAmount: number;
  paymentDate: Date;
  billNo: string;
  billAmount: number;
  vendor: string;
  billDate: Date;
  billDueDate: Date;
  poNo: string;
  status: string;
  billId: any;
  receiptFileName: string;
}
