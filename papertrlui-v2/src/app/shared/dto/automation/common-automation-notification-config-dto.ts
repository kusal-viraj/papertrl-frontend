export class CommonAutomationNotificationConfigDto {

  public id: number;
  public notifiedUsers: string[] = [];
  public notificationUser: string;
  public notificationType: string;
  public notificationContent: string;
  public actionId: number;
  public automationId: number;

  constructor() {
  }
}
