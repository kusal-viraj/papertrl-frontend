import {DropdownDto} from '../common/dropDown/dropdown-dto';
import {EInvoiceDet} from './e-invoice-det';
import {DiscountTermDto} from './discount-term-dto';
import {VendorMasterDto} from '../vendor/vendor-master-dto';
import {VendorInvoiceApproveDetail} from './vendor-invoice-approve-detail';
import {InvoiceDiamentionDto} from './invoice-diamention-dto';
import {AdHocWorkflowDetailConfig} from '../automation/adHoc-workflow-detail-config';
import {PoDetailDto} from '../po/po-detail-dto';
import {EBillItemDetailsDto} from './e-bill-item-details-dto';
import {AdditionalFieldDetailDto} from '../additional-field/additional-field-detail-dto';
import {BillAdditionalAttachment} from './bill-additional-attachment';
import {PoAccountDetailDto} from '../po/po-account-detail-dto';

export class BillMasterDto {
  public id: number;
  public billId: number;
  public submittedBy: string;
  public billAttachmentId: string;
  public submittedOn: Date;
  public attachmentId: string;
  public approvedBy: string;
  public poStatus: string;
  public approverName: string;
  public billNo: string;
  public termId: string;
  public vendorId: number;
  public vendorName: number;
  public distributionCostTotal: number;
  public vendor: VendorMasterDto = new VendorMasterDto();
  public billDate: any;
  public approvedDate: Date;
  public billDateStr: string;
  public actualBillDateStr:any;
  public approvedCode: string;
  public enteredToGcsOn: string;
  public billAmount: number;
  public poTotal: number;
  public balanceAmount: number;
  public discountAmount: number;
  public applicableDiscountAmount: number;
  public paymentStatus: string;
  public approvalStatus: string;
  public paymentNo;
  public billType;
  public paymentDate: Date;
  public closePo = false;
  public linkedWithCostDistribution =false;
  public invoiceDateFrom: Date;
  public invoiceDateTo: Date;
  public approvedDateFrom: Date;
  public approvedDateTo: Date;
  public discountApplicableDate: Date;
  public deletectionLevel: string;
  public createdBy: string;
  public finalApproval: string;
  public rejectDueTo: string;
  public remark: string;
  public originalFileName: string;
  public invoiceDateFormat: string;
  public templateName: string;
  public templateId: number;
  public poId: number;
  public remainingCeling: number;
  public invoiceType: string;
  public firstLevelApprover: string;
  public workflowId: number;
  public workflowLevel: number;
  public noOfLevels: number;
  public codeEntryLevel: number;
  public exportStatus: string;
  public billDateFormat: string;
  public customerInvoiceId: any;
  public payWhenCustomerPay: boolean;
  public customerInvoiceNumber: any;
  public billItemCostDistributions = [];
  public billExpenseCostDistributions = [];
  public recurringBillItemCostDistributions = [];
  public recurringBillExpenseCostDistributions = [];

  public enteredToTheSystem: string;
  public approvalCode: string;
  public poNumber: string;
  public invoiceDateRange: any;
  public approvedDateRange: any;
  public invoiceAmountFrom: number;
  public invoiceAmountTo: number;
  public submittedByVendor: boolean;
  public projectCodeId: number;
  public receiptId: any;

  public netDaysDue: number;
  public discountPercentage: number;
  public discountDaysDue: number;

  public invoiceNumberDiamention: InvoiceDiamentionDto;
  public invoiceDateDiamention: InvoiceDiamentionDto;
  public invoiceAmountDiamention: InvoiceDiamentionDto;
  public downloadUrl: string;

  public vendorList: DropdownDto = new DropdownDto();
  public userList: DropdownDto = new DropdownDto();

  public vendorInvApprodetails: VendorInvoiceApproveDetail[] = new Array();
  public adHocWorkflowDetails: AdHocWorkflowDetailConfig[] = [];
  public billItemDetails: EBillItemDetailsDto[] = [];
  public additionalFieldAttachments: BillAdditionalAttachment[] = [];
  public purchaseOrderDetails: PoDetailDto[] = new Array();
  public purchaseOrderAccountDetails: PoAccountDetailDto [] = new Array();

  public dueDate: Date;
  public tax: number;
  public additionalNotes: string;
  public detail: EInvoiceDet[] = new Array();
  public term: number;
  public approvalGroupName: string;
  public poGenerated = false;
  public totalPaid: number;
  public attachments: File [] = new Array();
  public existingAttachments: File [] = new Array();
  public existingAdditionalFieldAttachments: File [] = new Array();
  public uuid: any;

  public documentTypeId: number;
  public eventId: number;
  public remarks: string;

  public additionalData: AdditionalFieldDetailDto [] = new Array();
  public vendorRecurringAdditionalData: AdditionalFieldDetailDto [] = new Array();

  public export = false;
  approvalGroup: any;
  approvalUser: any;
  automationId: any;
  public existingVpPaymentTransaction: any[] = [];
  creditCardTransactionList: any[] = [];

}
