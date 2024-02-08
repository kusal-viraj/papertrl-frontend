import {BillApproveItemDetailsDto} from './bill-approve-item-details-dto';
import {BillApproveExpenseDetailsDto} from './bill-approve-expense-details-dto';

export class BillApproveDto {
  public id: any;
  public billNumber: any;
  public billDate: any;
  public vendor: any;
  public totalAmount: any;
  public costDistributionTotal: any;
  public poNumber: any;
  public receiptNumber: any;
  public remainingCeiling: any;
  public comment: any;
  public expenseCost: BillApproveExpenseDetailsDto[];
  public itemCost: BillApproveItemDetailsDto[];
  public approvers: any;
  public approveComment: any;
  public pdfUrl: any;
}
