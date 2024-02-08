import {PoBillableDetail} from "./po-billable-detail";
export class BillBillableTransactionDto{
  public vendorId ?: number;
  public poId ? : number;
  public noOfTransactions ? :number;
  public noOfProjects ? :number;
  public noOfPos ?:number;
  public totalAmount?: any;
  public vendorName ? :string;
  public billablePoDetailList : PoBillableDetail [] = [];
  public billId: number;
  public billNumber:string;
}
