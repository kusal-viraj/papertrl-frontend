export class NotificationDto {

  constructor() {
  }

  public id: number;
  public title: string;
  public description: string;
  public referenceNo: string;
  public referenceStatus: string;
  public clickable: boolean;
  public toUser: string;
  public notificationTypeId: number;
  public tenantId: string;
  public status: string;
}
