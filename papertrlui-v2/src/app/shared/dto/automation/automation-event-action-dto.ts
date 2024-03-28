export class AutomationEventActionDto {

  public documentTypeId: number;
  public ruleAutomation: boolean;
  public eventIdList: number[] = [];

  constructor(documentTypeId: number, eventIdList: number[], ruleAutomation: boolean) {
    this.documentTypeId = documentTypeId;
    this.eventIdList = eventIdList;
    this.ruleAutomation = ruleAutomation;
  }
}
