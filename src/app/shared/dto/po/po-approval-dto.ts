import {PoDetailDto} from './po-detail-dto';
import {AdHocWorkflowDetailConfig} from '../automation/adHoc-workflow-detail-config';
import {AdditionalFieldDetailDto} from '../additional-field/additional-field-detail-dto';
import {ExpenseAdditionalAttachmentsDto} from '../expense/expense-additional-attachments-dto';
import {VpPoAdditionalfieldAttachments} from './vp-po-additionalfield-attachments';

export class PoApprovalDto {

  public id: number;
  public poNumber: string;
  public poDate: Date;
  public vendorId: number;
  public projectTask: number;
  public deliveryDate: Date;
  public notes: string;
  public grossAmount: number;
  public taxAmount: number;
  public discountAmount: number;
  public netAmount: number;
  public automationId: number;
  public attachments: File [] = new Array();

  public purchaseOrderDetails: PoDetailDto[] = [];
  public purchasingAccountDetails = [];
  public adHocWorkflowDetails: AdHocWorkflowDetailConfig[] = [];
  public additionalData: AdditionalFieldDetailDto [] = [];
  public additionalFieldAttachments: VpPoAdditionalfieldAttachments [] = [];

  public documentTypeId: number;
  public eventId: number;

  public projectNo: string;


  public internalApprovalStatus: string;

}
