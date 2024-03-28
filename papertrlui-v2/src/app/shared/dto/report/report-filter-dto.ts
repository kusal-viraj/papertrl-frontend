export class ReportFilterDto {

  public approvedBy: number;
  public vendor: number;
  public vendorEmail: string;
  public vendorCode: string;
  public country: number;
  public state: string;
  public city: string;
  public contactNumber: string;
  public aging: string;
  public billDateRange: string[] = [];
  public dueDateRange: string[] = [];
  public transactionTypes:any [] = [];

  constructor() {
  }

}
