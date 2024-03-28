import {AuditTrialStatus} from './audit-trial-status';

export class AuditTrialDto {
  public id: number;
  public actionDate: Date;
  public userId: string;
  public userName: string;
  public comment: string;
  public purchaseOrderMstId: number;
  public statusId: AuditTrialStatus = new AuditTrialStatus();
  public undoAction: any;
  public automationName: any;
  public undoStatus: boolean;
  public header: any;
}
