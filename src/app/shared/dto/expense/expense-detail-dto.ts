import {AdditionalFieldDetailDto} from '../additional-field/additional-field-detail-dto';

export class ExpenseDetailDto {
  public id: number;
  public receipt: File;
  public date: any;
  public expenseDate: any;
  public merchant: string;
  public projectTask: string;
  public expenseType: string;
  public amount: number;
  public accountId: any;
  public additionalData: AdditionalFieldDetailDto[] = new Array();
  projectCodeId: any;
}
