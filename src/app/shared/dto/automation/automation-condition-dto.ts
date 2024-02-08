export class AutomationConditionDto {

  public id: number;
  public automationId: number;
  public fieldId: number;
  public conditionId: number;
  public conditionOrder: number;
  public adjointCondition: string;
  public firstValue: any;
  public secondValue: any;
  public hasDropDownValue: boolean;
  public hasSecondValue: boolean;
  public fieldDataType: string;

  constructor() {
  }
}
