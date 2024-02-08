export class TaskSettingsDto {
  id: number;
  title: string;
  description: string;
  status: string;
  commonUrlId: number;
  tenantId: string;
  createdBy: string;
  createdOn: Date;
  url: string;

  constructor() {
  }
}
