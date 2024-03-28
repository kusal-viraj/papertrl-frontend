import {PoReceiptDetailsDto} from './po-receipt-details-dto';
import {ExpenseAdditionalAttachmentsDto} from '../expense/expense-additional-attachments-dto';
import {PoReceiptAdditionalAttachment} from './po-receipt-additional-attachment';
export class PoReceiptMasterDto {
  poReceipt: string;
  poReceiptDate: Date;
  vendor: string;
  poNumber: string;
  poDate: Date;
  receivedBy: string;
  notes: string;
  netAmount: number;
  public poReceiptLineItems = new PoReceiptDetailsDto();
  public additionalAttachments: ExpenseAdditionalAttachmentsDto;
  public poAdditionalAttachments: PoReceiptAdditionalAttachment[];
}
