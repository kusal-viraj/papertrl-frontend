export class CommonAutomationEmailConfigDto {

  public id: number;
  public emailAddress: string[];
  public emailSubject: string;
  public emailContent: string;
  public actionId: number;
  public automationId: number;

  constructor() {
  }
}
