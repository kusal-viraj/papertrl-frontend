import {ExpenseApproveListDto} from './expense-approve-list-dto';

export class ExpenseApproveDto {
  reportName: string;
  createdOn: string;
  createdBy: string;
  totalAmount: string;
  status: string;
  public workflowLevel: number;
  public noOfLevels: number;
  expenses: ExpenseApproveListDto[];
}
