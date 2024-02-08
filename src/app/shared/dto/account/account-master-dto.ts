export class AccountMasterDto {
  public id: number;
  public number: string;
  public name: string;
  public description: string;
  public parentAccount: number;
  public asAtDate: Date;
  public isPurchaseAccount: boolean;

  public asAtDateBalance: number;
  public currentBalance: number;
  public currentBalanceWithSubAccounts: number;
  public status: string;
  public classification: string;
  public createdBy: string;
  public createdDate: Date;
  public updatedBy: string;
  public updatedDate: Date;
  public accountDetailType: number;
  public accountType: number;

  public accountTypeName: string;
  public accountDetailTypeName: string;
  public parentName: string;

}
