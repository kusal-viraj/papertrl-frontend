import {ExpenseDetailDto} from './expense-detail-dto';
import {ExpenseAdditionalAttachmentsDto} from './expense-additional-attachments-dto';
import {AdHocWorkflowDetailConfig} from '../automation/adHoc-workflow-detail-config';
import {AdditionalFieldDetailDto} from '../additional-field/additional-field-detail-dto';

export class ExpenseMasterDto {
  public id: number;
  public reportName: string;
  public approvalUser: any;
  public businessPurpose: string;
  public notes: string;
  public totalAmount: number;
  public approver: string;
  approvalGroup: any;
  public createdBy: string;
  public exportStatus: string;
  public startFrom: any;
  public endDate: any;
  public uuid: string;
  public remarks: string;
  public workflowLevel: number;
  public noOfLevels: number;
  public createdOn: Date;
  public status: string;
  public automationId: number;
  public attachmentId: string;
  public documentTypeId: number;
  public eventId: number;
  public expenseDetails: ExpenseDetailDto[] = [];
  public additionalData: AdditionalFieldDetailDto [] = [];
  public additionAttachments: ExpenseAdditionalAttachmentsDto[] = [];
  public adHocWorkflowDetails: AdHocWorkflowDetailConfig[] = [];
  expenseAccountIdList = [];
  projectCodeIdList: any[] = [];
}
