import {
  ChangeDetectorRef,
  Component, ElementRef,
  EventEmitter,
  Input, OnDestroy,
  OnInit,
  Output, Renderer2,
  ViewChild
} from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AppIcons} from '../../../shared/enums/app-icons';
import {BillApprovalsService} from '../../../shared/services/bills/bill-approvals.service';
import {AuditTrialDto} from '../../../shared/dto/common/audit-trial/audit-trial-dto';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {BillMasterDto} from '../../../shared/dto/bill/bill-master-dto';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {BillSubmitService} from '../../../shared/services/bills/bill-submit.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppHttpResponseMessage} from '../../../shared/enums/app-http-response-message';
import {AppConstant} from '../../../shared/utility/app-constant';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {ConfirmationService} from 'primeng/api';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {PoApprovalDto} from '../../../shared/dto/po/po-approval-dto';
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {PoService} from '../../../shared/services/po/po.service';
import {AppDocuments} from "../../../shared/enums/app-documents";
import {RemoveSpace} from "../../../shared/helpers/remove-space";
import {AutomationService} from "../../../shared/services/automation-service/automation.service";
import {OverlayPanel} from "primeng/overlaypanel";
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";
import {DomSanitizer} from "@angular/platform-browser";
import {BillLineLevelPoReceiptDto} from "../../../shared/dto/bill/bill-line-level-po-receipt-dto";
import {BillUtility} from "../bill-utility";
import {BillPaymentService} from "../../../shared/services/bill-payment-service/bill-payment.service";
import {CreditNoteService} from "../../../shared/services/credit-note/credit-note.service";
import {ManageDrawerService} from "../../../shared/services/common/manage-drawer-status/manage-drawer.service";
import {MemoriseItemAcc} from "../../common/memorise-item-acc";
import {MandatoryFields} from "../../../shared/utility/mandatory-fields";
import {Dropdown} from "primeng/dropdown";
import {ManageFeatureService} from "../../../shared/services/settings/manage-feature/manage-feature.service";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";
import {Subscription} from "rxjs";
import {SetFieldValueDto} from "../../../shared/dto/automation/set-field-value-dto";
import {CustomLineItemGrid} from "../../../shared/utility/custom-line-item-grid";
import {GridService} from "../../../shared/services/common/table/grid.service";
import {AppTableKeysData} from "../../../shared/enums/app-table-keys-data";
import {AccountNumberPopulationLineLevel} from "../../../shared/utility/account-number-population-line-level";

@Component({
  selector: 'app-bill-approve-form',
  templateUrl: './bill-approve-form.component.html',
  styleUrls: ['./bill-approve-form.component.scss']
})
export class BillApproveFormComponent extends MandatoryFields implements OnInit, OnDestroy {


  @Input() billId;
  @Input() eBillEdit = false;
  @Input() attachmentId: any;
  @Input() isSplitterSmall;
  @Input() extraSmallHorSplitter;
  @Input() isApproveView = false;
  @Input() isResponseDataReceived = false;
  @Output() close = new EventEmitter();
  @Output() resetApproval = new EventEmitter();
  @Output() removeAdditionalFieldAttachment = new EventEmitter();
  @Output() poId = new EventEmitter();
  @Input() billDetails: BillMasterDto;
  @Input() fromNotification = false;
  @ViewChild('overlayPanel') public overlayPanel: OverlayPanel;

  public poList: DropdownDto = new DropdownDto();
  public receiptList: DropdownDto = new DropdownDto();
  public itemList: DropdownDto = new DropdownDto();
  public projectCodeList: DropdownDto = new DropdownDto();
  public accountList: DropdownDto = new DropdownDto();
  public approvalUserList: DropdownDto = new DropdownDto();
  public vendorRelevantItemList: DropdownDto = new DropdownDto();
  public customerInvoiceList: DropdownDto = new DropdownDto();
  public billUtility: BillUtility = new BillUtility(this.billPaymentService, this.notificationService,
    this.privilegeService, this.creditNoteService, this.billsService, this.sanitizer, this.drawerService);
  public accountNumPopulationLines: AccountNumberPopulationLineLevel = new AccountNumberPopulationLineLevel(
    this.billsService, this.notificationService
  );
  public skuDropDownList: DropdownDto [] = [];
  public ruleListForItem: DropdownDto [] = [];
  @Input() adHocWorkflowDetails: any[] = [];
  public ruleListForExpense: DropdownDto [] = [];

  public auditTrial: AuditTrialDto[];
  public billMasterDto: BillMasterDto = new BillMasterDto();
  public billApproveForm: UntypedFormGroup;
  public appIcons = AppIcons;
  public appEnum = AppEnumConstants;
  public distributionCostTotal: number;
  public appAuthorities = AppAuthorities;
  public addNewDropDown = false;
  public appConstant: AppConstant = new AppConstant();
  public selectedAdditionalField: AdditionalFieldDetailDto;

  public headerAdditionalFieldDetails: AdditionalFieldDetailDto[] = new Array();
  public appFieldType = AppFieldType;
  public additionalFieldResponse: AdditionalFieldDetailDto[];
  public additionalFieldForExpenseCostDistributions: AdditionalFieldDetailDto[] = new Array();
  public additionalFieldForItemCostDistributions: AdditionalFieldDetailDto[] = new Array();
  public accounts: any [] = [];
  public attachments: any [] = [];
  public auditTrialPanel: boolean;
  public isAddNewAccount = false;
  public isAddNewProjectCodes = false;
  public isAddNewItem = false;
  public isAddNewUser = false;
  public isVisibleNotificationContent = null;
  public billNo: any;
  public isSelectedApproval = false;
  public rejectComment = false;
  public isLoading = false;
  public isRejectLoading = false;
  public termList: DropdownDto = new DropdownDto();
  public commonUtil = new CommonUtility();
  public appFormConstants = AppFormConstants;
  public department: DropdownDto = new DropdownDto();
  public removeSpace: RemoveSpace = new RemoveSpace();
  public itemPoReceiptIdList: any = [AppConstant.ZERO];

  public showPoLineItemsByDefault;
  public showPoLineItems = false;
  public poDetail = new PoApprovalDto();
  public selectedPoLineItems = [];
  public selectedPoAccountDetails = [];
  public ruleDetails: any [] = [];
  public departmentPanel: boolean;
  public currentPoNetAmount;
  public poReceiptUrl: any;
  public poReceiptNumber: any;

  public matchingAutomation: any;
  public isSubmissionWorkFlow = false;
  public isSaveAsApprovedWorkFlow = false;
  public isWorkflowConfigAvailable = false;
  public submittedByVendor = false;
  public workflowLevel: number;
  public selectedVendorId: number;
  public sectionId: any;
  public lineItemIndex: any;
  public isAddRue = false;
  public poStatus: any;
  public isClosePO: any;
  public isProgressViewReceipt = false;
  public appModuleSection = AppModuleSection;
  public memoriseItemAcc: MemoriseItemAcc;
  public isViewReceiptView = false;
  public receiptAttachments: any [] = [];
  public isCreateInvoice = false;
  public fieldSubscription: Subscription = new Subscription();
  setFieldValueDto: SetFieldValueDto = new SetFieldValueDto();
  public customLineItemGrid = new CustomLineItemGrid(this.gridService);
  public tableKeyEnum = AppTableKeysData;
  public isInsertApproverChecked = false;
  previousDepartmentId;


  constructor(public formBuilder: UntypedFormBuilder, public billApprovalsService: BillApprovalsService, public privilegeService: PrivilegeService,
              public notificationService: NotificationService, public billSubmitService: BillSubmitService, public ref: ChangeDetectorRef,
              public confirmationService: ConfirmationService, public billsService: BillsService, public poService: PoService,
              public additionalFieldService: AdditionalFieldService, public automationService: AutomationService,
              public manageFeatureService: ManageFeatureService, public gaService: GoogleAnalyticsService,
              public sanitizer: DomSanitizer, public billPaymentService: BillPaymentService, public creditNoteService: CreditNoteService,
              public drawerService: ManageDrawerService, private renderer: Renderer2, private el: ElementRef, private gridService: GridService) {
    super(additionalFieldService, notificationService);

    this.billApproveForm = this.formBuilder.group({
      billNo: [{value: null, disabled: true}],
      billDate: [null],
      vendorId: [null],
      billAmount: [null],
      distributionCostTotal: [null],
      poId: [null],
      receiptId: [null],
      remainingCeling: [null],
      remainingPoCeiling: [{value: null, disabled: true}],
      remainingVariance: [null],
      remark: [null],
      additionalData: this.formBuilder.array([]),
      billExpenseCostDistributions: this.formBuilder.array([]),
      billItemCostDistributions: this.formBuilder.array([]),
      vendorName: [{value: null, disabled: true}],
      approvalUser: [AppConstant.NULL_VALUE, []],
      netDaysDue: [],
      focusListener: [],
      patchSetFieldFullObject: [true],
      discountPercentage: [],
      discountDaysDue: [],
      event: [],
      id: [],
      closePo: [false],
      departmentName: [null],
      departmentId: [null],
      isClosePo: [false],
      accountPeriodMonth: [null],
      accountPeriodYear: [null],
      approveComment: [],
      billAttachmentId: [],
      submittedOn: [],
      additionalNotes: [{value: null, disabled: true}],
      billDateStr: [{value: null, disabled: true}],
      dueDateStr: [{value: null, disabled: true}],
      term: [],
      projectCodeId: [null],
      payWhenCustomerPay: [null],
      customerInvoiceId: [null],
    });
    this.billApproveForm.get(AppFormConstants.PO_ID).valueChanges.subscribe(() => this.poChanged());

    this.billApproveForm.get(AppFormConstants.DEPARTMENT_ID).valueChanges.subscribe((value) => {
      this.commonUtil.patchHeaderDepartmentToLineLevel(this.billApproveForm, -1, false, true, true);
      if (value !== this.previousDepartmentId) {
        this.previousDepartmentId = this.billApproveForm.get(AppFormConstants.DEPARTMENT_ID).value;
      }
    });
  }

  /**
   * This method can use for get controllers in form array
   */
  public get itemFields() {
    return this.billApproveForm.get('createDetails') as UntypedFormArray;
  }

  /**
   * This method can use for get controllers in form array
   */
  public get itemForm() {
    return this.billApproveForm.get('billItemCostDistributions') as UntypedFormArray;
  }

  /**
   * This method can use for get controllers in form array
   */
  public get expenseFields() {
    return this.billApproveForm.get('billExpenseCostDistributions') as UntypedFormArray;
  }

  /**
   * return form array data
   */
  public get headingSectionArray() {
    return this.billApproveForm.get('additionalData') as UntypedFormArray;
  }

  get bill() {
    return this.billApproveForm.controls;
  }

  clearAutomation() {
    this.matchingAutomation = null;
    this.isSubmissionWorkFlow = false;
    this.isSaveAsApprovedWorkFlow = false;
    this.isWorkflowConfigAvailable = false;
  }

  ngOnInit(): void {
    this.adHocWorkflowDetails = this.adHocWorkflowDetails.sort((ap1, ap2) =>
      (ap2.approvalOrder > ap1.approvalOrder) ? -1 : ((ap2.approvalOrder > ap1.approvalOrder) ? 1 : 0));
    this.getRequiredFields(this.billApproveForm, AppDocumentType.BILL);
    if (!this.eBillEdit) {
      this.billsService.getDefaultPoDrawerState(AppConstant.BILL_PO_LIST_MODAL).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.showPoLineItemsByDefault = res.body;
        }
      });
    }
    this.billUtility.isCheckedPayWhenCustomerPay = this.billDetails.payWhenCustomerPay;
    this.getModuleReheatedAdditionalField(AppDocumentType.BILL, false);
    this.getCustomerInvoiceList();
    this.billMasterDto = this.billDetails;
    this.selectedVendorId = this.billMasterDto.vendorId;
    this.getVendorItemList(this.billDetails.vendorId);
    this.submittedByVendor = this.billDetails.submittedByVendor;
    this.workflowLevel = this.billDetails.workflowLevel;
    let itemPoReceiptSet = new Set();


    if (this.billDetails.billExpenseCostDistributions.length > 0) {
      for (let i = 0; i < this.billDetails.billExpenseCostDistributions.length; i++) {
        if (this.billDetails.billExpenseCostDistributions[i].poReceiptIdList?.length > 0) {
          this.billDetails.billExpenseCostDistributions[i].poReceiptIdList?.forEach((accountReceiptId) => {
            if (accountReceiptId) {
              itemPoReceiptSet.add(accountReceiptId);
            }
          });

        }
        this.addExpense();
      }

    } else {
      this.addExpense();
    }
    if (this.billDetails.billItemCostDistributions.length > 0) {
      this.billDetails.billItemCostDistributions.forEach((value, index) => {
        if (this.billDetails.billItemCostDistributions[index].poReceiptIdList?.length > 0) {
          this.billDetails.billItemCostDistributions[index].poReceiptIdList?.forEach((itemReceiptId) => {
            if (itemReceiptId) {
              itemPoReceiptSet.add(itemReceiptId);
            }
          });
        }
        this.addItem();
      });
    } else {
      this.addItem();
    }
    this.itemPoReceiptIdList = Array.from(itemPoReceiptSet);
    if (this.billDetails.receiptId) {
      this.itemPoReceiptIdList.push(this.billDetails.receiptId);
    } else if (this.itemPoReceiptIdList.length === 0) {
      this.itemPoReceiptIdList.push(0);
    }
    this.getDepartment();

    this.billDetails.billDate = new Date(this.billDetails.billDate);

    if (this.billDetails.poId) {
      this.getPoListByVendorAndPoId(this.billDetails.vendorId, this.billDetails.poId);
    } else {
      this.getVendorRelatedPoList(this.billDetails.vendorId);
    }
    this.getPoRelatedReceiptList(this.billDetails.poId, this.itemPoReceiptIdList);
    this.getPaymentTerms();
    this.getProjectTaskList(this.projectCodeList);
    this.getAccounts(this.accountList);
    this.getExtendedApprovalUserList(this.approvalUserList, this.billDetails.vendorId);

    this.billDetails.additionalFieldAttachments.forEach((value, index) => {
      if (value.id === this.billApproveForm.get('billAttachmentId').value) {
        this.billDetails.additionalFieldAttachments.splice(index, 1);
      }
    });
    this.memoriseItemAcc = new MemoriseItemAcc(this.manageFeatureService, this.billApproveForm, this.billsService, this.expenseFields, this.itemForm);
    this.automationService.setUpFocusListeners(this.billApproveForm, this.renderer, this.el, this.setFieldValueDto, AppDocumentType.BILL, this.automationService.billInputFieldsForAutomation);
    this.billApproveForm.get(AppFormConstants.PATCH_SET_FIELD_FULL_OBJECT).patchValue(true);

    this.setDocumentEvent();

    this.fieldSubscription = this.automationService.updateFocusListeners.subscribe(value => {
      if (value && value.automationMst) {
        this.matchingAutomation = value.automationMst.automationWorkflowConfigs;
        this.isSubmissionWorkFlow = !value.automationMst.saveAsApprovedEnabled;
        this.isSaveAsApprovedWorkFlow = value.automationMst.saveAsApprovedEnabled;
        this.isWorkflowConfigAvailable = value.automationMst.workflowConfigAvailable;
      } else {
        this.clearAutomation();
      }
    });
  }

  setDocumentEvent() {
    this.billApproveForm.get('event').patchValue(AppDocuments.DOCUMENT_EVENT_APPROVED);
  }

  /**
   * get item related sku
   * @param venId to vendor id
   * @param itemId to item master id
   * @param index to index number
   */
  getItemRelatedSku(venId, itemId, index) {
    if (venId != null && itemId != null) {
      this.poService.getItemRelatedSKU(venId, itemId).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.skuDropDownList[index].data = res.body;
        } else {
          this.notificationService.infoMessage(res.body.message);
        }

      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method used to get vendor related item list
   */
  getVendorItemList(selectedVendorId) {
    if (selectedVendorId) {
      this.billsService.getItemListByVendorId(selectedVendorId).subscribe((res: any) => {
        this.vendorRelevantItemList.data = res.body;
      });
    }
  }


  /*
  ITEM FORM ARRAY DETAILS-------------------------------------------------------------------------------------------->
 */

  /**
   * Change Pdf Viewer According to purchase order
   */
  poChanged() {
    this.billApproveForm.get('receiptId').reset();
    this.billApproveForm.get('closePo').patchValue(false);
    this.billApproveForm.get('remainingPoCeiling').reset();
    this.billUtility.ifClearHeaderLevelReceiptCLearLineLevelReceiptValue(this.billApproveForm.get('receiptId').value,
      this.expenseFields, this.itemForm);
    this.currentPoNetAmount = null;
    const poId = this.billApproveForm.get(AppFormConstants.PO_ID).value;
    if (poId) {
      this.poId.emit(poId);
      this.getPoRelatedRemainingCeiling(this.billApproveForm.get('poId').value);
      this.poService.getPoData(this.billApproveForm.get(AppFormConstants.PO_ID).value, false).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.currentPoNetAmount = res.body.netAmount;
          // this.getPoDetails(false);
        }
        if (this.showPoLineItemsByDefault) {
          this.getPoDetails(true);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    } else {
      this.billUtility.isViewThreeWayMatchingTable = false;
    }
  }

  getDepartment() {
    this.billsService.getDepartment().subscribe((res: any) => {
      this.department.data = res.body;
    });
  }

  /**
   * This method use to get vendor's bills
   * @param event any
   */
  changedDepartmentItem(event, index) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    if (event.value === 0) {
      this.departmentPanel = true;
      this.itemForm.controls[index].get('departmentId').reset();
    }
  }

  /**
   * This method use to get vendor's bills
   * @param event any
   */
  changedDepartmentAccount(event, index) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    if (event.value === 0) {
      this.departmentPanel = true;
      this.expenseFields.controls[index].get('departmentId').reset();
    }
  }

  /**
   * This method use to get vendor's bills
   * @param event any
   */
  changedDepartment(event: any) {
    if (event.value === 0) {
      this.departmentPanel = true;
      this.billApproveForm.get('departmentId').reset();
    }
  }

  addItem() {
    const itemForm = this.formBuilder.group({
      id: [null],
      itemId: [null],
      itemName: [],
      accountChanged: [false],
      vendorItemNumber: [null],
      description: [],
      departmentId: [null],
      poReceiptId: [null],
      poReceiptIdList: [null],
      accountId: [null],
      accountNumber: [null],
      billable: [false],
      taxable: [false],
      qty: [''],
      rate: [''],
      amount: [null],
      projectId: [null],
      itemNumber: [null],
      hideAccountNumberInput: [false],
      additionalData: this.formBuilder.array([])
    });
    const obj: DropdownDto = new DropdownDto();
    this.skuDropDownList.push(obj);
    const itemRuleList: DropdownDto = new DropdownDto();
    this.ruleListForItem.push(itemRuleList);
    this.billUtility.addEmptyDropDownReferenceForAccountField();
    const itemLevelAttachment: BillLineLevelPoReceiptDto = new BillLineLevelPoReceiptDto();
    this.billUtility.itemPoReceiptLineLevelAttachments.push(itemLevelAttachment);
    this.itemForm.push(itemForm);
  }

  /**
   * this method can be used to on line item click
   * @param index to index
   */

  onLItemClick(index) {
    const len = (this.itemForm.length) - 1;
    if (len === index) {
      this.addItem();
      this.addItemField(len);
    }
  }

  /**
   * this method can be used to add new line additional field item
   * @param index to index
   */
  addItemField(index) {
    this.additionalFieldForItemCostDistributions.forEach((value) => {
      this.itemAdditionalField(index + 1).push(this.commonUtil.getAdditionalFieldValidations(value, false));
    });
  }

  /**
   * this method can be used to on line item click
   * @param index to index
   */

  onExpenseClick(index) {
    const len = (this.expenseFields.length) - 1;
    if (len === index) {
      this.addExpense();
      this.addExpenseFields(len);
    }
  }

  /**
   * this method can be used to add new line additional field item
   * @param index to index
   */
  addExpenseFields(index) {
    this.additionalFieldForExpenseCostDistributions.forEach((value) => {
      this.expenseAdditionalField(index + 1).push(this.commonUtil.getAdditionalFieldValidations(value, false));
    });
  }

  /**
   * This method use for add new form controller group for automation condition
   */
  addExpense() {
    const itemInfo = this.formBuilder.group({
      id: [null],
      accountId: [null],
      accountName: [null],
      description: [null],
      accountChanged: [false],
      accountNumber: [null],
      departmentId: [null],
      amount: [null],
      projectId: [null],
      poReceiptId: [null],
      poReceiptIdList: [null],
      billable: [false],
      taxable: [false],
      hideAccountNumberInput: [false],
      additionalData: this.formBuilder.array([])
    });
    const expenseRuleList: DropdownDto = new DropdownDto();
    this.ruleListForExpense.push(expenseRuleList);
    const expenseLevelAttachment: BillLineLevelPoReceiptDto = new BillLineLevelPoReceiptDto();
    this.billUtility.addEmptyDropDownReferenceForAccountField();
    this.billUtility.expensePoReceiptLineLevelAttachments.push(expenseLevelAttachment);
    this.expenseFields.push(itemInfo);
  }

  /*
  -------------------------------------------------------------------------------------------------------------->
   */

  removeItem(i: number) {
    this.itemForm.removeAt(i);
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
  }

  removeExpense(i) {
    this.expenseFields.removeAt(i);
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
  }

  /*
  --------------------------------------------------------------------------------------------------------------------------------->
   */

  navigate(e, name: string, i: any) {
    switch (e.key) {
      case 'ArrowDown':
        if ((this.expenseFields.length) - 2 === i) {
          this.addExpense();
        }
        if ((this.expenseFields.length) - 1 !== i) {
          e.preventDefault();
          document.getElementById(name + (i + 1)).focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (i !== 0) {
          document.getElementById(name + (i - 1)).focus();
        }
        break;
    }
  }

  navigateInItemTable(e, name: string, i: any) {
    switch (e.key) {
      case 'ArrowDown':
        if ((this.itemForm.length) - 2 === i) {
          this.addItem();
        }
        if ((this.itemForm.length) - 1 !== i) {
          e.preventDefault();
          document.getElementById(name + (i + 1)).focus();
        }

        break;
      case 'ArrowUp':
        e.preventDefault();
        if (i !== 0) {
          document.getElementById(name + (i - 1)).focus();
        }
        break;
    }
  }

  /**
   * this method can be used to view audit trial
   */
  viewAuditTrial() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.VIEW_AUDIT_TRAIL,
      AppAnalyticsConstants.MODULE_NAME_BILL,
      AppAnalyticsConstants.VIEW_AUDIT_TRAIL,
      AppAnalyticsConstants.BILL_APPROVE_SCREEN,
    );
    this.billApprovalsService.getAuditTrial(this.billId).subscribe((res: any) => {
      this.auditTrial = res.body;
      this.billNo = this.billApproveForm.get(AppFormConstants.BILL_NO).value;
      this.auditTrialPanel = true;
    });
  }

  /**
   * This method use for reject bill
   */
  rejectBill() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.REJECT,
      AppAnalyticsConstants.MODULE_NAME_BILL,
      AppAnalyticsConstants.REJECT,
      AppAnalyticsConstants.BILL_APPROVE_SCREEN,
    );
    const billMasterDto = this.billMasterDto;
    billMasterDto.additionalData = [];
    billMasterDto.billExpenseCostDistributions = [];
    billMasterDto.billItemCostDistributions = [];
    billMasterDto.id = this.billApproveForm.get('id').value;
    billMasterDto.remark = this.billApproveForm.get('remark').value;
    if (this.billApproveForm.get('remark').value === null || this.billApproveForm.get('remark').value === '' ||
      this.billApproveForm.get('remark').value === undefined) {
      this.rejectComment = true;
      this.isRejectLoading = false;
    } else {
      this.billApprovalsService.rejectBill(billMasterDto).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.notificationService.successMessage(AppHttpResponseMessage.BILL_REJECT_SUCCESSFULLY);
          this.billApproveForm.reset();
          if (this.fromNotification) {
            this.close.emit();
          } else {
            this.resetApproval.emit();
          }
          this.isRejectLoading = false;
        } else {
          this.notificationService.infoMessage(res.body.message);
          this.isRejectLoading = false;
        }
      }, error => {
        this.notificationService.errorMessage(error);
        this.isRejectLoading = false;
      });
    }
  }

  /*
   Drop Down Data ------------------------------------------------------------------------------------------>
   */

  /**
   * this method can be used to approve bill
   */
  approveAndReassignBill(isInsertApprover: boolean) {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.APPROVE_REASSING,
      AppAnalyticsConstants.MODULE_NAME_BILL,
      AppAnalyticsConstants.APPROVE_REASSING,
      AppAnalyticsConstants.BILL_APPROVE_SCREEN,
    );
    this.commonUtil.validateFileInput(this.billApproveForm.get('additionalData'), this.billMasterDto.additionalFieldAttachments);
    if (this.billApproveForm.invalid) {
      this.isLoading = false;
      return new CommonUtility().validateForm(this.billApproveForm);
    } else {
      const billMasterDto = this.billApproveForm.getRawValue();
      billMasterDto.additionalData = this.commonUtil.formatMultisetValues(billMasterDto.additionalData);
      billMasterDto.billItemCostDistributions = this.commonUtil.formatMultisetLineValues(billMasterDto.billItemCostDistributions);
      billMasterDto.billExpenseCostDistributions = this.commonUtil.formatMultisetLineValues(billMasterDto.billExpenseCostDistributions);
      billMasterDto.expenseAccountIdList = billMasterDto.billExpenseCostDistributions?.map(r => r.accountId)?.filter(x => x);
      billMasterDto.itemIdList = billMasterDto.billItemCostDistributions?.map(r => r.itemId)?.filter(x => x);
      billMasterDto.projectCodeIdList = billMasterDto.billExpenseCostDistributions?.map(r => r.projectId)?.filter(x => x);
      billMasterDto.projectCodeIdList = billMasterDto.projectCodeIdList.concat(billMasterDto.billItemCostDistributions?.map(r => r.projectId)?.filter(x => x));

      const billDate = this.billApproveForm.getRawValue().billDateStr;
      try {
        billMasterDto.billDate = billDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
      } catch (e) {
        billMasterDto.billDate = billDate;
      }
      billMasterDto.billId = this.billId;
      billMasterDto.submittedOn = null;
      this.isLoading = true;
      this.billApprovalsService.approveAndReassignBill(billMasterDto, isInsertApprover).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          isInsertApprover ? this.notificationService.successMessage(AppHttpResponseMessage.BILL_INSERT_THE_APPROVER_SUCCESSFULLY) :
          this.notificationService.successMessage(AppHttpResponseMessage.BILL_APPROVED_SUCCESSFULLY);
          this.isLoading = false;
          if (this.fromNotification) {
            this.close.emit();
          } else {
            this.resetApproval.emit();
          }

        } else {
          this.isLoading = false;
          this.notificationService.infoMessage(res.body.message);
        }

      }, error => {
        this.isLoading = false;
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to finalize the bill
   */
  approveAndFinalize() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.APPROVE_FINALIZE,
      AppAnalyticsConstants.MODULE_NAME_BILL,
      AppAnalyticsConstants.APPROVE_FINALIZE,
      AppAnalyticsConstants.BILL_APPROVE_SCREEN
    );
    this.commonUtil.validateFileInput(this.billApproveForm.get('additionalData'), this.billMasterDto.additionalFieldAttachments);
    if (this.billApproveForm.invalid) {
      this.isLoading = false;
      return new CommonUtility().validateForm(this.billApproveForm);
    } else {
      if (!this.billApproveForm.getRawValue().billDate) {
        return;
      }
      const billMasterDto = this.billApproveForm.getRawValue();
      billMasterDto.additionalData = this.commonUtil.formatMultisetValues(billMasterDto.additionalData);
      billMasterDto.billItemCostDistributions = this.commonUtil.formatMultisetLineValues(billMasterDto.billItemCostDistributions);
      billMasterDto.billExpenseCostDistributions = this.commonUtil.formatMultisetLineValues(billMasterDto.billExpenseCostDistributions);
      billMasterDto.expenseAccountIdList = billMasterDto.billExpenseCostDistributions?.map(r => r.accountId)?.filter(x => x);
      billMasterDto.itemIdList = billMasterDto.billItemCostDistributions?.map(r => r.itemId)?.filter(x => x);
      billMasterDto.projectCodeIdList = billMasterDto.billExpenseCostDistributions?.map(r => r.projectId)?.filter(x => x);
      billMasterDto.projectCodeIdList = billMasterDto.projectCodeIdList.concat(billMasterDto.billItemCostDistributions?.map(r => r.projectId)?.filter(x => x));
      const billDate = this.billApproveForm.getRawValue().billDateStr;
      try {
        billMasterDto.billDate = billDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
      } catch (e) {
        billMasterDto.billDate = billDate;
      }
      billMasterDto.billId = this.billId;
      billMasterDto.submittedOn = null;
      this.isLoading = true;
      this.billApprovalsService.approveAndFinalize(billMasterDto).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.notificationService.successMessage(AppHttpResponseMessage.BILL_APPROVED_SUCCESSFULLY);
          this.isLoading = false;
          if (this.fromNotification) {
            this.close.emit();
          } else {
            this.resetApproval.emit();
          }

        } else {
          this.notificationService.infoMessage(res.body.message);
          this.isLoading = false;
        }

      }, error => {
        this.notificationService.errorMessage(error);
        this.isLoading = false;
      });
    }
  }

  /**
   * get item list
   * @param listInstance to dropdown instance
   */

  getItems(listInstance: DropdownDto) {
    if (!this.selectedVendorId) {
      return;
    } else {
      this.billsService.getItemListByVendorId(this.selectedVendorId).subscribe((res: any) => {
        listInstance.data = res.body;
        if (this.privilegeService.isAuthorized(AppAuthorities.ITEMS_CREATE)) {
          listInstance.addNew();
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to get payment terms
   */
  getPaymentTerms() {
    this.billsService.getTermsList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.termList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * get project code list
   * @param listInstance to dropdown instance
   */
  getProjectTaskList(listInstance: DropdownDto) {
    this.billsService.getProjectTaskUserWise(AppConstant.PROJECT_CODE_CATEGORY_ID, false, this.billId).subscribe((res: any) => {
      listInstance.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * get account list
   * @param listInstance to dropdown dto
   */
  getAccounts(listInstance: DropdownDto) {
    this.billsService.getAccountList().subscribe((res: any) => {
      listInstance.data = res;
      if (this.privilegeService.isAuthorized(AppAuthorities.ACCOUNTS_CREATE)) {
        this.accountList.addNew();
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get vendor related po list
   * @param vendorId to vendor id
   */

  getVendorRelatedPoList(vendorId) {
    this.billsService.getPoList(vendorId).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.poList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getPoListByVendorAndPoId(vendorId, poId) {
    this.billSubmitService.getPoListByVendorAndPoId(vendorId, poId).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.poList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /*
  ------------------------------------------------------------------------------------------------------------------------------------->
   */

  getPoRelatedReceiptList(poId, itemReceiptIdList) {
    if (poId) {
      this.poService.getReceipts(poId, itemReceiptIdList).subscribe((res: any) => {
        this.receiptList.data = res.body;
        if (this.receiptList.data.length > AppConstant.ZERO) {
          this.receiptList.data.forEach(value => {
            this.billUtility.poReceiptMap.set(value.id, value.name);
          });
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  /**
   * This method use for get all assignee list
   * @param listInstance DropdownDto
   * @param vendorId to selected vendor id
   */
  getExtendedApprovalUserList(listInstance: DropdownDto, vendorId) {
    if (!vendorId) {
      return;
    } else {
      const authorities = [AppAuthorities.BILL_APPROVE, AppAuthorities.BILL_REJECT,
        AppAuthorities.BILL_OVERRIDE_APPROVAL];
      this.billsService.getApprovalUserListAccordingToVendorSelection(this.billDetails.createdBy, authorities, vendorId, true)
        .subscribe((res: any) => {
          listInstance.data = res.body;
          listInstance.addNew();
        }, error => {
          this.notificationService.errorMessage(error);
        });
    }
  }

  /**
   * this method can be used to add new
   */
  changeList(selectionName, selectedId, index) {
    if (selectionName === 'Account' && selectedId === 0) {
      this.expenseFields.controls[index].get('accountId').reset();
      this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
      this.isAddNewAccount = true;
      this.isAddNewItem = false;
      this.isAddNewProjectCodes = false;
    } else if (selectionName === 'Account' && selectedId !== 0) {
      this.expenseFields.controls[index].get(AppFormConstants.ACCOUNT_CHANGED).patchValue(true);
      this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    }
    if (selectionName === 'Item' && selectedId === 0) {
      this.itemForm.controls[index].get('itemId').reset();
      this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
      this.isAddNewAccount = false;
      this.isAddNewItem = true;
      this.isAddNewProjectCodes = false;
    } else if (selectionName === 'Item' && selectedId !== 0) {
      this.itemForm.controls[index].get(AppFormConstants.ACCOUNT_CHANGED).patchValue(true);
      this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    }
    if (selectionName === 'ProjectCodesAccount' && selectedId === 0) {
      this.expenseFields.controls[index].get('projectId').reset();
      this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
      this.isAddNewAccount = false;
      this.isAddNewItem = false;
      this.isAddNewProjectCodes = true;
    }
    if (selectionName === 'ProjectCodesAccount') {
      this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    }
    if (selectionName === 'ProjectCodesItem' && selectedId === 0) {
      this.itemForm.controls[index].get('projectId').reset();
      this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
      this.isAddNewAccount = false;
      this.isAddNewItem = false;
      this.isAddNewProjectCodes = true;
    }
    if (selectionName === 'ProjectCodesItem') {
      this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    }
    if (selectionName === 'headerProjectCodes' && selectedId === 0) {
      this.billApproveForm.get('projectCodeId').reset();
      this.isAddNewAccount = false;
      this.isAddNewItem = false;
      this.isAddNewProjectCodes = true;
    }
    if (selectionName === 'User' && selectedId === 0) {
      this.billApproveForm.get('approvalUser').reset();
      this.isAddNewUser = true;
      this.isAddNewAccount = false;
      this.isAddNewItem = false;
      this.isAddNewProjectCodes = false;
    } else {
      this.isSelectedApproval = true;
    }
  }

  /**
   * This method use for calculate total of cost distributions
   */
  getTotalCostDistribution() {

    let invoiceCostDistributionAmount = 0.00;

    for (const expenseCost of this.expenseFields.controls) {
      if (expenseCost.value.amount) {
        let amt = this.commonUtil.roundNum(expenseCost.value.amount)
        invoiceCostDistributionAmount += amt;
      }
    }
    for (const itemCost of this.itemForm.controls) {
      if (itemCost.value.qty && itemCost.value.rate) {
        let amt = itemCost.value.qty * itemCost.value.rate
        amt = this.commonUtil.roundNum(amt)
        invoiceCostDistributionAmount += amt;
      }
    }
    this.billApproveForm.get('distributionCostTotal').patchValue(invoiceCostDistributionAmount);
  }

  /**
   * This method use for  download attachment
   */
  downloadAttachment() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.DOWNLOAD_ATTACHMENT,
      AppAnalyticsConstants.MODULE_NAME_BILL,
      AppAnalyticsConstants.DOWNLOAD_ATTACHMENT,
      AppAnalyticsConstants.BILL_APPROVE_SCREEN,
    );
    if (!this.attachmentId) {
      return;
    }
    this.billSubmitService.getBillAttachment(this.attachmentId).subscribe(res => {
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'bill_attachment');
      link.click();
    }, error => {
      this.notificationService.errorMessage(error);
    }, () => {
      this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
    });
  }

  /**
   * this method can be used to get item name
   * @param id to selected item id
   * * @param index to formGroup index
   */
  getItemName(id, index) {
    if (!id) {
      return;
    } else {
      this.getItemRelatedSku(this.selectedVendorId, id, index);
      this.billApprovalsService.getItemName(id).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.itemForm.controls[index].get('itemName').patchValue(res.body.name);
          this.itemForm.controls[index].get('itemNumber').patchValue(res.body.itemNumber);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
      this.receiptToLineItem();
    }
  }

  receiptToLineItem() {
    if (this.billApproveForm.get('receiptId').value) {
      this.billUtility.headerPORecipeSelectionValueToLineLevel(this.billApproveForm.get('receiptId').value,
        this.expenseFields, this.itemForm);
    }
  }

  /**
   * this method can be used to get account name
   * @param id to account id
   * @param i to index number
   * @param isItemCostDistribution
   */
  getAccountName(id, i, isItemCostDistribution?) {
    if (!id) {
      return;
    } else {
      this.billApprovalsService.getAccountName(id).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (!isItemCostDistribution) {
            this.expenseFields.controls[i].get('accountName').patchValue(res.body.name);
            this.expenseFields.controls[i].get('accountNumber').patchValue(res.body.number);
          } else {
            this.itemForm.controls[i].get('accountNumber').patchValue(res.body.number);
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
      this.receiptToLineItem();
    }
  }

  /**
   * Validate empty spaces on input fields
   * @param fieldName form control name
   */
  validateSpace(fieldName: any) {
    if (this.billApproveForm.get(fieldName).value) {
      if (this.billApproveForm.get(fieldName).value[1] === ' ') {
        this.billApproveForm.get(fieldName).patchValue('');
      } else if (fieldName === 'remark') {
        this.rejectComment = false;
      }
    }
  }

  calculateItemLineAmount(i) {
    let amount = this.itemForm.controls[i].value.qty * this.itemForm.controls[i].value.rate;
    amount = this.commonUtil.roundNum(amount);
    this.itemForm.controls[i].get('amount').patchValue(amount);
    return amount;
  }


  /*
------------------------------ADDITIONAL FIELD RELATED FUNCTIONS------------------------------------------------------------------------->
*/

  /**
   * this method can be used to get po related remaining ceiling
   */
  getPoRelatedRemainingCeiling(poId) {
    this.isVisibleNotificationContent = null;
    if (poId !== null && poId !== undefined) {
      this.getPoRelatedReceiptList(poId, this.itemPoReceiptIdList);
      this.billApproveForm.get('remainingPoCeiling').reset();
      const obj = {
        poId: poId,
        billId: this.billApproveForm.get(AppFormConstants.ID).value,
      }
      this.billSubmitService.getPoCeiling(obj).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            if (res.body?.remainingPoCeiling !== null) {
              this.billApproveForm.get(AppFormConstants.REMAINING_PO_CEILING).patchValue((res.body.remainingPoCeiling));
            }
            this.poStatus = res.body?.poStatus;
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        },
        error => {
          this.notificationService.errorMessage(error);
        });
    }
  }

  /**
   * this method can be used to get selected item/account names
   */
  getTableRowValues() {
    if (this.billDetails.billExpenseCostDistributions.length > 0) {
      this.billDetails.billExpenseCostDistributions.forEach((value, index) => {
        this.getAccountName(value.accountId, index);
      });
    }
    if (this.billDetails.billItemCostDistributions.length > 0) {
      this.billDetails.billItemCostDistributions.forEach((value, index) => {
        this.getItemName(value.itemId, index);
      });
    }
  }

  /**
   * This method use for add additional fields to po creation
   */
  getModuleReheatedAdditionalField(id, isDetailView) {
    this.additionalFieldService.getAdditionalField(id, isDetailView, this.eBillEdit).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {

        this.additionalFieldResponse = res.body;

        this.additionalFieldResponse.forEach(((field) => {
          this.commonUtil.manageDropDownData(field, false);

          if (field.sectionId === AppModuleSection.MASTER_DATA_INPUT_SECTION_ID) {
            this.addHeadingField(field);
          }

          if (field.sectionId === AppModuleSection.ITEM_COST_DISTRIBUTION_SECTION_ID) {
            this.addLineFieldForItem(field);
          }

          if (field.sectionId === AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID) {
            this.addLineFieldForExpense(field);
          }

        }));
        this.customLineItemGrid.initCreateBillExpTable(this.additionalFieldForExpenseCostDistributions);
        this.customLineItemGrid.initCreateBillItmTable(this.additionalFieldForItemCostDistributions);
        this.billDetails.additionalData = this.commonUtil.patchDropDownAdditionalData(this.billDetails.additionalData);
        this.billDetails.billExpenseCostDistributions = this.commonUtil.patchDropDownAdditionalLineItemData(this.billDetails.billExpenseCostDistributions);
        this.billDetails.billItemCostDistributions = this.commonUtil.patchDropDownAdditionalLineItemData(this.billDetails.billItemCostDistributions);

        this.billDetails.additionalData = this.commonUtil.alignHeadingAdditionalData(this.headerAdditionalFieldDetails, this.billDetails.additionalData);
        this.commonUtil.alignLineAdditionalData(this.billDetails.billExpenseCostDistributions, this.additionalFieldForExpenseCostDistributions);
        this.commonUtil.alignLineAdditionalData(this.billDetails.billItemCostDistributions, this.additionalFieldForItemCostDistributions);

        this.billApproveForm.patchValue(this.billDetails);
        this.setDocumentEvent();
        this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
        this.billUtility.getMatchingTableData(this.billApproveForm, this.expenseFields, this.itemForm);
        this.getTableRowValues();
        this.getTotalCostDistribution();

      } else {
        this.notificationService.infoMessage(res.body.message);
      }


    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for add line item data additional field and field validations
   * @param field
   * @private
   */
  public addLineFieldForItem(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.billDetails.billItemCostDistributions, field, false, false)) {
      return;
    }
    this.additionalFieldForItemCostDistributions.push(field);
    this.itemForm.controls.forEach((value, index) => {
      this.itemAdditionalField(index).push(this.commonUtil.getAdditionalFieldValidations(field, false));
    });
  }

  /**
   * This method use for add line item data additional field and field validations
   * @param field
   * @private
   */
  public addLineFieldForExpense(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.billDetails.billExpenseCostDistributions, field, false, false)) {
      return;
    }
    this.additionalFieldForExpenseCostDistributions.push(field);
    this.expenseFields.controls.forEach((value, index) => {
      this.expenseAdditionalField(index).push(this.commonUtil.getAdditionalFieldValidations(field, false));
    });
  }

  /**
   * This method use for add master data additional field and field validations
   * @param field AdditionalFieldDetailDto
   */
  public addHeadingField(field: AdditionalFieldDetailDto) {
    this.headerAdditionalFieldDetails.push(field);
    this.headingSectionArray.push(this.commonUtil.getAdditionalFieldValidations(field, false));
  }

  /**
   * This method use for view additional option input drawer
   * @param event to change event
   * @param additionalFieldDetailDto AdditionalFieldDetailDto
   * @param additionalField to AdditionalFieldDetailDto
   * @param multiSelect to multiSelect dropdown
   */
  addNewAdditionalDropDownOption(event: any, additionalFieldDetailDto: AdditionalFieldDetailDto, additionalField: AbstractControl, multiSelect) {
    if (event.itemValue === 0 || event.value === 0) {
      additionalField.get(AppConstant.FIELD_VALUE).reset();
      this.addNewDropDown = true;
      this.selectedAdditionalField = additionalFieldDetailDto;
    }
    if (multiSelect._options.length === AppConstant.ONE && additionalFieldDetailDto.createNew === AppConstant.STATUS_ACTIVE && additionalFieldDetailDto.multiple ===
      AppConstant.STATUS_ACTIVE) {
      additionalField.get(AppConstant.FIELD_VALUE).reset();
      this.addNewDropDown = true;
      this.selectedAdditionalField = additionalFieldDetailDto;
    }

    if (multiSelect.allChecked) {
      multiSelect._options.forEach((value) => {
        value.isChecked = true;
      });
    } else {
      const allChecked: boolean = multiSelect._options.every(function (item: any) {
        return item.isChecked == false;
      });

      if (allChecked) {
        multiSelect._options.forEach((value) => {
          if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
            value.disabled = false;
          }
        });
      } else {
        multiSelect._options.forEach((value) => {
          if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
            value.disabled = true;
          }
        });
      }
    }
    if (additionalFieldDetailDto.createNew === AppConstant.STATUS_ACTIVE && additionalFieldDetailDto.multiple ===
      AppConstant.STATUS_ACTIVE && multiSelect.allChecked) {

      let idArray: number [] = [];
      idArray = additionalField.get(AppConstant.FIELD_VALUE).value;
      idArray.forEach((value, index) => {
        if (idArray[0] === 0) {
          idArray.splice(index, 1);
        }
      });

      multiSelect._options.forEach((value) => {
        if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
          value.disabled = true;
        }
      });
    } else if (!multiSelect.allChecked) {
      multiSelect._options.forEach((value) => {
        if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
          value.disabled = false;
        }
      });
    }
  }

  /**
   * This method returns the line item section additional detail controllers as an array
   */
  public itemAdditionalField(index) {
    return this.itemForm.controls[index].get('additionalData') as UntypedFormArray;
  }

  /**
   * This method returns the line item section additional detail controllers as an array
   */
  public expenseAdditionalField(index) {
    return this.expenseFields.controls[index].get('additionalData') as UntypedFormArray;
  }

  /**
   * This method can be used to valid empty spaces in the form
   * @param controlName to form control name
   */
  removeFieldSpace(controlName: AbstractControl) {
    if (controlName?.value[0] === AppConstant.EMPTY_SPACE) {
      controlName.patchValue(AppConstant.EMPTY_STRING);
    }
  }

  /**
   * This method use for choose file for upload
   * @param event any
   * @param additionalField to index array instance
   * @param indexNumber to index number
   * @param sectionName to section name
   */
  changeFileInput(event: any, additionalField, indexNumber, sectionName) {
    if (event.target.files[0]) {
      const targetFile = event.target.files[0];
      additionalField.patchValue({
        attachment: targetFile
      });
    }
  }

  /**
   * this method can be used to get file name
   * @param fileUpload string
   * @param i to index number
   */
  fileUploadClick(fileUpload, i: number) {
    document.getElementById(fileUpload + i).click();
  }

  /**
   * format date
   */

  formatDateHeadingSection(event, index) {
    this.headingSectionArray.controls[index].get('fieldValue').patchValue(event.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
  }

  formatDateSection(event, index, field) {
    if (!event) {
      return;
    }
    field.value.fieldValue = event.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
  }

  /**
   * This method use for add new form controller group for automation condition
   */
  addExpenseFieldOnClick() {
    const itemInfo = this.formBuilder.group({
      id: [null],
      accountId: [null],
      accountName: [null],
      description: [null],
      accountChanged: [false],
      accountNumber: [null],
      departmentId: [null],
      amount: [null],
      poReceiptId: [null],
      poReceiptIdList: [null],
      billable: [false],
      taxable: [false],
      projectId: [null],
      hideAccountNumberInput: [false],
      additionalData: this.formBuilder.array([])
    });
    const expenseLevelAttachment: BillLineLevelPoReceiptDto = new BillLineLevelPoReceiptDto();
    this.billUtility.addEmptyDropDownReferenceForAccountField();
    this.billUtility.expensePoReceiptLineLevelAttachments.push(expenseLevelAttachment);
    this.expenseFields.push(itemInfo);
    const len = (this.expenseFields.length - 2);
    this.addExpenseFields(len);
  }

  addItemFieldOnClick() {
    const itemForm = this.formBuilder.group({
      id: [null],
      itemId: [null],
      itemName: [],
      accountChanged: [false],
      vendorItemNumber: [null],
      description: [],
      accountNumber: [null],
      accountId: [null],
      qty: [''],
      rate: [''],
      departmentId: [null],
      poReceiptId: [null],
      poReceiptIdList: [null],
      billable: [false],
      taxable: [false],
      amount: [null],
      projectId: [null],
      itemNumber: [null],
      hideAccountNumberInput: [false],
      additionalData: this.formBuilder.array([])
    });
    this.itemForm.push(itemForm);
    const obj: DropdownDto = new DropdownDto();
    this.skuDropDownList.push(obj);
    this.billUtility.addEmptyDropDownReferenceForAccountField();
    const itemLevelAttachment: BillLineLevelPoReceiptDto = new BillLineLevelPoReceiptDto();
    this.billUtility.itemPoReceiptLineLevelAttachments.push(itemLevelAttachment);
    const len = (this.itemForm.length - 2);
    this.addItemField(len);
  }

  /**
   * this method can be used to download attachment
   * @param attachment to attachment
   */
  downloadAttachments(attachment) {
    if (attachment.fieldId) {
      this.downloadAdditionalAttachments(attachment);
    } else {
      this.downloadAttachment();
    }

  }

  /**
   * this method can be used to delete attachments
   * @param attachment to attachment
   * @param index to index
   */
  deleteAttachments(attachment, index) {
    this.deleteAdditionalAttachments(attachment, index);
  }

  /**
   * this method can be used to download attachment
   * @param val to attachment obj
   */
  downloadAdditionalAttachments(val) {
    this.billApprovalsService.downloadBillAttachment(val.id).subscribe((res: any) => {
      console.log('start download:', res);
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', val.fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * this method can be used to delete attachment
   * @param val to attachment obj
   * @param index to index
   */
  deleteAdditionalAttachments(val: any, index: any) {
    this.confirmationService.confirm({
      key: 'bills',
      message: 'You want to delete this Attachment!',
      accept: () => {
        this.billApprovalsService.deleteBillAttachment(val.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.BILL_ATTACHMENT_DELETED_SUCCESSFULLY);
            this.removeAdditionalFieldAttachment.emit();
            this.billDetails.additionalFieldAttachments.splice(index, 1);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  /**
   * Is User Authorized to approve
   */
  isValidApproveAccess(approveOrReject) {

    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_OVERRIDE_APPROVAL)) {
      return true;
    }
    return this.privilegeService.isAuthorized(approveOrReject);
  }

  ////////////////////////////////////////// Purchase Order Details Table/////////////////////////////////////

  /**
   * get po details from to popup from when po changed
   */
  async getPoDetails(showLines) {
    this.selectedPoLineItems = [];
    this.selectedPoAccountDetails = [];

    if (!this.billApproveForm.get(AppFormConstants.PO_ID).value) {
      return;
    }

    await this.poService.getPoLineItemData(this.billApproveForm.get(AppFormConstants.PO_ID).value).then((res: any) => {
      this.poDetail.purchaseOrderDetails = res.body
    }).catch((e) => this.notificationService.errorMessage(e));

    if (!this.billApproveForm.get(AppFormConstants.PO_ID).value) {
      return;
    }

    await this.poService.getPoLineAccountData(this.billApproveForm.get(AppFormConstants.PO_ID).value).then((res: any) => {
      this.poDetail.purchasingAccountDetails = res.body;
      this.showPoLineItems = showLines;
      if (!showLines) {
        this.checkAmountAndData();
      }
    }).catch((e) => this.notificationService.errorMessage(e));

  }

  /**
   * Add Items to cost distribution table from po popup
   */
  addToItems(obj) {
    this.selectedPoLineItems = obj.selectedPoLineItems;
    this.selectedPoAccountDetails = obj.selectedPoAccountDetails;
    if (this.selectedPoLineItems.length === 0 && this.selectedPoAccountDetails.length === 0) {
      this.notificationService.infoMessage(HttpResponseMessage.ADD_TO_ITEM_FROM_PO);
    } else {
      this.addLineItems();
      this.addLineAccounts();
      this.getTotalCostDistribution();
      this.billUtility.getMatchingTableData(this.billApproveForm, this.expenseFields, this.itemForm);
    }
  }


  /**
   * add item info to item cost distribution from po popup
   */
  addLineItems() {
    if (this.selectedPoLineItems.length === 0) {
      return;
    }
    this.itemForm.reset();
    const itemCostData = [];
    this.billApproveForm.getRawValue().billItemCostDistributions.forEach((value, index) => {
      if (value.itemId) {
        itemCostData.push(value);
      }
    });

    let length = itemCostData.length;
    this.itemForm.patchValue(itemCostData);

    this.selectedPoLineItems.forEach((value, index) => {
      if (value.productId) {
        if (this.itemForm.controls.length === (1 + index)) {
          this.addItemFieldOnClick();
        }
        this.itemForm.controls[length].get('itemId').patchValue(value.productId);
        this.getItemName(value.productId, length);
        this.itemForm.controls[length].get('description').patchValue(value.description);
        this.itemForm.controls[length].get('vendorItemNumber').patchValue(value.vendorItemNumber);
        this.itemForm.controls[length].get('rate').patchValue(value.unitPrice);
        this.itemForm.controls[length].get('qty').patchValue(value.qty);
        this.itemForm.controls[length].get('departmentId').patchValue(value.departmentId);
        if (value.departmentId){
          this.itemForm.controls[length].get('departmentId').markAsDirty();
        }
        this.itemForm.controls[length].get('amount').patchValue(value.amount);
        length = length + 1;
      } else {
        this.selectedPoAccountDetails.push({
          description: value.itemName,
          departmentId: value.departmentId,
          amount: value.amount
        });
      }

    });
    this.selectedPoLineItems = [];
    this.showPoLineItems = false;
  }

  /**
   * add account info to account cost distribution from po popup
   */
  addLineAccounts() {
    if (this.selectedPoAccountDetails.length === 0) {
      return;
    }
    this.expenseFields.reset();
    const accountInfo = [];
    this.billApproveForm.getRawValue().billExpenseCostDistributions.forEach((value, index) => {
      if (value.accountId) {
        accountInfo.push(value);
      }
    });

    let length = accountInfo.length;
    this.selectedPoAccountDetails.forEach((value, index) => {
      accountInfo.push(value);
      this.expenseFields.patchValue(accountInfo);
      this.addExpenseFieldOnClick();
      if (value.accountId) {
        this.expenseFields.controls[length].get('accountId').patchValue(value.accountId);
        this.getAccountName(value.accountId, length);
      }
      length = length + 1;
    });
    this.selectedPoAccountDetails = [];
    this.showPoLineItems = false;
  }

  /**
   * Close Po details drawer
   */
  closePoDetailsDrawer() {
    this.selectedPoAccountDetails = [];
    this.selectedPoLineItems = [];
    this.showPoLineItems = false;
  }

  /**
   * Change Default Show Hide function of Po Drawer
   */
  defaultBehaviourChanged() {
    this.showPoLineItemsByDefault = !this.showPoLineItemsByDefault;
  }


  /**
   * check po amount and bill amount = to bill amount
   */
  checkAmountAndData() {
    if (this.currentPoNetAmount !== this.billApproveForm.get(AppFormConstants.BILL_AMOUNT).value) {
      return;
    }
    if (!this.isItemTableHasData() && !this.isExpenseTableHasData()) {
      this.addItemDataWhenAmountEquals();
      this.addAccountDataWhenAmountEquals();
    }
  }

  addItemDataWhenAmountEquals() {
    const itemCostData = [];
    this.billApproveForm.getRawValue().billItemCostDistributions.forEach((value, index) => {
      if (value.itemId) {
        itemCostData.push(value);
      }
    });

    let length = itemCostData.length;
    this.itemForm.reset();
    this.itemForm.patchValue(itemCostData);

    this.poDetail.purchaseOrderDetails.forEach((value, index) => {
      this.addItemFieldOnClick();
      this.itemForm.controls[length].get('itemId').patchValue(value.productId);
      this.itemForm.controls[length].get('qty').patchValue(value.qty);
      this.itemForm.controls[length].get('rate').patchValue(value.amount / value.qty);
      this.calculateItemLineAmount(length);

      this.getTotalCostDistribution();
      this.getItemName(value.productId, length);
      length = length + 1;
    });
  }

  addAccountDataWhenAmountEquals() {
    const accountInfo = [];
    this.billApproveForm.getRawValue().billExpenseCostDistributions.forEach((value, index) => {
      if (value.accountId) {
        accountInfo.push(value);
      }
    });

    let lengthAcc = accountInfo.length;
    this.expenseFields.reset();
    this.expenseFields.patchValue(accountInfo);

    this.poDetail.purchasingAccountDetails.forEach((value, index) => {
      this.addExpenseFieldOnClick();
      this.expenseFields.controls[lengthAcc].get('accountId').patchValue(value.accountId);
      this.expenseFields.controls[lengthAcc].get('amount').patchValue(value.amount);
      this.getTotalCostDistribution();
      this.getAccountName(value.accountId, lengthAcc);
      lengthAcc = lengthAcc + 1;
    });
  }

  isItemTableHasData() {
    let bool = false;
    this.itemForm.value.forEach(val => {
      Object.keys(val).some(k => {
        if (!Array.isArray(val[k]) && !!val[k]) {
          bool = true;
          return;
        }
      });
    });
    return bool;
  }

  isExpenseTableHasData() {
    let bool = false;
    this.expenseFields.value.forEach(val => {
      Object.keys(val).some(k => {
        if (!Array.isArray(val[k]) && !!val[k]) {
          bool = true;
          return;
        }
      });
    });
    return bool;
  }

  updateAdditionalFieldDropDowns(data?) {
    if (data) {
      this.selectedAdditionalField = data;
    }
    this.commonUtil.updateAdditionalFiledDropdowns(this.headerAdditionalFieldDetails, this.selectedAdditionalField);
    this.commonUtil.updateAdditionalFiledDropdowns(this.additionalFieldForExpenseCostDistributions, this.selectedAdditionalField);
    this.commonUtil.updateAdditionalFiledDropdowns(this.additionalFieldForItemCostDistributions, this.selectedAdditionalField);
  }

  /**
   * this method can be used to get available rule configurations
   */
  getRuleConfiguration(i, type) {
    let description: any;
    this.lineItemIndex = null;
    this.lineItemIndex = i;
    if (type === AppConstant.EXPENSE_COST_DISTRIBUTION_STR) {
      description = this.expenseFields.controls[i].get(AppConstant.DESCRIPTION_CONTROLLER).value;
      this.sectionId = AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID;
    }
    this.selectedVendorId === AppConstant.NULL_VALUE || this.selectedVendorId === AppConstant.UNDEFINED_VALUE ?
      this.selectedVendorId = AppConstant.ZERO : this.selectedVendorId;
    this.billsService.getConfiguredRule(this.sectionId, description, this.selectedVendorId).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        if (this.sectionId === AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID) {
          this.ruleDetails = [];
          this.ruleListForExpense[i].data = res.body;
          this.ruleDetails = this.ruleListForExpense[i].data;
        }
        if (this.sectionId === AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID) {
          this.overlayPanel.show(new MouseEvent('click'), document.getElementById('description_' + this.lineItemIndex));
        } else {
          this.overlayPanel.hide();
        }

      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method patch data to line items
   */
  applyRule(rule) {
    if (this.sectionId === AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID) {
      this.expenseFields.controls[this.lineItemIndex].get('accountId').patchValue(rule.id);
      this.expenseFields.controls[this.lineItemIndex].get(AppFormConstants.ACCOUNT_CHANGED).patchValue(true);
      this.getAccountName(rule.id, this.lineItemIndex);
      this.overlayPanel.hide();
    }
  }

  /**
   * this method can be used to navigate automation creation
   */
  addNewRule() {
    let rule: any = {};
    this.isAddRue = true;
    rule.sectionId = this.sectionId;
    rule.isConfigureRule = true;
    this.sectionId === AppModuleSection.ITEM_COST_DISTRIBUTION_SECTION_ID ? rule.eventId = AppConstant.EVENT_ITEM_LINE_DESCRIPTION_ID : null;
    this.sectionId === AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID ? rule.eventId = AppConstant.EVENT_EXPENSE_LINE_DESCRIPTION_ID : null;
    if (this.sectionId === AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID) {
      rule.description = this.expenseFields.controls[this.lineItemIndex].get('description').value;
      rule.dropDownSelectionId = this.expenseFields.controls[this.lineItemIndex].get('accountId').value;
    }
    if (this.sectionId === AppModuleSection.ITEM_COST_DISTRIBUTION_SECTION_ID) {
      rule.description = this.itemForm.controls[this.lineItemIndex].get('description').value;
      rule.dropDownSelectionId = this.itemForm.controls[this.lineItemIndex].get('itemId').value;
    }
    this.automationService.automationRule.next(rule);
  }

  /**
   * Check the Remaining Ceiling with and bill amount
   * Then Returns the boolean to show or hide the warning message
   */
  showPopUp(): boolean {
    const poId = this.billApproveForm.get(AppFormConstants.PO_ID).value;
    const remainingCeiling = this.billApproveForm.get(AppFormConstants.REMAINING_PO_CEILING).value;
    const amount = this.billApproveForm.get(AppFormConstants.BILL_AMOUNT).value;

    if (this.isVisibleNotificationContent === false || !poId) {
      return false;
    }

    if (remainingCeiling === 0 || remainingCeiling < amount) {
      this.isVisibleNotificationContent = true;
      return true;
    }
  }

  getDescriptionWiseAccItem(i: any, section) {
    this.memoriseItemAcc.getDescriptionWiseAccItem(i, section, this.expenseFields, this.itemForm, "BILL").then((value: any) => {
      if (!value) return;
      if (this.itemForm.controls[i].get(AppFormConstants.ACCOUNT_CHANGED).value) {
        return;
      }

      if (section === AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID) {
        this.receiptToLineItem();
      } else {
        if (!value.id) return;
        this.getItemRelatedSku(this.selectedVendorId, value.id, i);
        this.receiptToLineItem();
      }
    });
  }

  /**
   * this method can be used to clear expense lines
   */
  clearExpenseLines() {
    const expenseTableLength: number = this.expenseFields.length;
    while (this.expenseFields.length !== AppConstant.ZERO) {
      this.expenseFields.removeAt(AppConstant.ZERO);
    }
    for (let i = AppConstant.ZERO; i < expenseTableLength; i++) {
      this.addExpenseFieldOnClick();
    }
  }

  /**
   * this method can be used to clear item lines
   */
  clearItemLines() {
    const itemTableLength: number = this.itemForm.length;
    while (this.itemForm.length !== AppConstant.ZERO) {
      this.itemForm.removeAt(AppConstant.ZERO);
    }
    for (let i = AppConstant.ZERO; i < itemTableLength; i++) {
      this.addItemFieldOnClick();
    }
  }

  /**
   * this method can be used to view receipt modal as conditionally
   * @param value to po receipt ids
   */
  viewPoReceiptAttachment(value) {
    this.receiptAttachments = [];
    if (this.billApproveForm.get('receiptId').value) {
      this.receiptAttachments.push(value);
    } else {
      this.receiptAttachments = value;
    }
    this.isViewReceiptView = this.receiptAttachments.length > AppConstant.ZERO;
  }

  isDepartmentFieldRequired() {
    if (this.isAsteriskMarkShown(this.bill, this.appFormConstants.DEPARTMENT_ID)) {
      return false;
    }

    if (!this.submittedByVendor || (this.submittedByVendor && this.workflowLevel !== 1)) {
      return true;
    }
  }

  /**
   * this method can be used to get active customer invoice list
   */
  getCustomerInvoiceList() {
    this.billsService.getCustomerUserList().subscribe((res: any) => {
      this.customerInvoiceList.data = res.body;
      if (this.privilegeService.isAuthorized(AppAuthorities.CREATE_INVOICE)) {
        this.customerInvoiceList.addNew();
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get add new option selection in invoice list
   */
  changeCustomerInvoice(selectedInvoice: Dropdown) {
    if (selectedInvoice?.selectedOption.id === AppConstant.ZERO) {
      this.isCreateInvoice = true;
      this.billApproveForm.get('customerInvoiceId').reset();
    } else {
      this.isCreateInvoice = false;
    }
  }

  /**
   * This method use for view additional option input drawer when user click footer add new button
   * @param additionalFieldDetailDto AdditionalFieldDetailDto
   */
  setSelectedAdditionalField(additionalFieldDetailDto: AdditionalFieldDetailDto) {
    this.selectedAdditionalField = additionalFieldDetailDto;
  }

  ngOnDestroy(): void {
    this.automationService.cleanupListeners();
  }

  changedAccountItm(selectAccountLabel: Dropdown, i: any) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    this.getAccountName(selectAccountLabel.selectedOption.id, i, true);
  }


  /**
   * This method use for set isInsertApproverChecked to check box status and reset select approver dropdown in approve screen
   * @param event this parameter get checkbox status
   */
  isInsertApprover(event) {
    this.isInsertApproverChecked = event.checked;

    if (!(this.billMasterDto.noOfLevels === this.billMasterDto.workflowLevel && !this.matchingAutomation) &&
      !this.isInsertApproverChecked) {
      this.billApproveForm.get('approvalUser').reset();
    }
    this.commonUtil.setApprovalUserValidation(this.billApproveForm, this.isInsertApproverChecked);
  }
}
