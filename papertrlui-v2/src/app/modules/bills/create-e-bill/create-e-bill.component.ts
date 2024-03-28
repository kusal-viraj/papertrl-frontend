import {
  AfterContentChecked,
  AfterContentInit, AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component, ElementRef,
  EventEmitter, HostListener,
  Input, OnDestroy,
  OnInit,
  Output, Renderer2,
  ViewChild
} from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import {AppConstant} from '../../../shared/utility/app-constant';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {BillMasterDto} from '../../../shared/dto/bill/bill-master-dto';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {DataFormat} from '../../../shared/utility/data-format';
import {BillSubmitService} from '../../../shared/services/bills/bill-submit.service';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {AppDocuments} from '../../../shared/enums/app-documents';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {BillApprovalsService} from '../../../shared/services/bills/bill-approvals.service';
import {PoApprovalDto} from '../../../shared/dto/po/po-approval-dto';
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {PoService} from '../../../shared/services/po/po.service';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {OverlayPanel} from 'primeng/overlaypanel';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {Router} from '@angular/router';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppIcons} from '../../../shared/enums/app-icons';
import {ConfirmationService} from 'primeng/api';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {DomSanitizer} from '@angular/platform-browser';
import {BillLineLevelPoReceiptDto} from '../../../shared/dto/bill/bill-line-level-po-receipt-dto';
import {BillUtility} from '../bill-utility';
import {BillPaymentService} from '../../../shared/services/bill-payment-service/bill-payment.service';
import {CreditNoteService} from '../../../shared/services/credit-note/credit-note.service';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';
import {ManageDrawerService} from '../../../shared/services/common/manage-drawer-status/manage-drawer.service';
import {MemoriseItemAcc} from '../../common/memorise-item-acc';
import {MandatoryFields} from '../../../shared/utility/mandatory-fields';
import {Dropdown} from 'primeng/dropdown';
import {ManageFeatureService} from '../../../shared/services/settings/manage-feature/manage-feature.service';
import {GoogleAnalyticsService} from '../../../shared/services/google-analytics/google-analytics.service';
import {AppAnalyticsConstants} from '../../../shared/enums/app-analytics-constants';
import {MultiSelect} from 'primeng/multiselect';
import {Subscription} from 'rxjs';
import {SetFieldValueDto} from '../../../shared/dto/automation/set-field-value-dto';
import {Table} from 'primeng/table';
import {CustomLineItemGrid} from '../../../shared/utility/custom-line-item-grid';
import {TableSupportBase} from "../../../shared/utility/table-support-base";
import {AppTableKeysData} from "../../../shared/enums/app-table-keys-data";
import {GridService} from "../../../shared/services/common/table/grid.service";
import {AccountNumberPopulationLineLevel} from "../../../shared/utility/account-number-population-line-level";

@Component({
  selector: 'app-create-e-bill',
  templateUrl: './create-e-bill.component.html',
  styleUrls: ['./create-e-bill.component.scss']
})
export class CreateEBillComponent extends MandatoryFields implements OnInit, OnDestroy {
  @Output() isClickCloseButton = new EventEmitter<boolean>();
  @Output() isSuccessEditAction = new EventEmitter();
  @Input() fromRecurringBill = false;
  @Input() templateId;
  @Output() isBillList = new EventEmitter();
  @Input() editView = false;
  @Input() billId: any;
  @ViewChild('overlayPanel') public overlayPanel: OverlayPanel;
  @ViewChild('selectedVendorName') public selectedVendorName: Dropdown;
  @ViewChild('exptable') public expenseTable: Table;
  @ViewChild('multiSelect1') public multiselect: MultiSelect;


  public createEInvoiceForm: UntypedFormGroup;

  public billMasterDto: BillMasterDto = new BillMasterDto();
  public vendorsList: DropdownDto = new DropdownDto();
  public poList: DropdownDto = new DropdownDto();
  public termList: DropdownDto = new DropdownDto();
  public customerInvoiceList: DropdownDto = new DropdownDto();
  public approvalUserList: DropdownDto = new DropdownDto();
  public approvalGroupList: DropdownDto = new DropdownDto();
  public itemList: DropdownDto = new DropdownDto();
  public uomList: DropdownDto = new DropdownDto();
  public accountList: DropdownDto = new DropdownDto();
  public department: DropdownDto = new DropdownDto();
  public receiptList: DropdownDto = new DropdownDto();
  public tableSupportBase = new TableSupportBase();
  public projectTasks: DropdownDto = new DropdownDto();
  public vendorRelevantItemList: DropdownDto = new DropdownDto();
  public skuDropDownList: DropdownDto [] = [];
  public ruleDetails: any [] = [];
  public billUtility: BillUtility = new BillUtility(this.billPaymentService, this.notificationService,
    this.privilegeService, this.creditNoteService, this.billsService, this.sanitizer, this.drawerService);

  public accountNumPopulationLines: AccountNumberPopulationLineLevel = new AccountNumberPopulationLineLevel(
    this.billsService, this.notificationService
  );

  public poStatus: any;
  public poReceiptUrl: any;
  public poReceiptNumber: any;

  public additionalFieldResponse: AdditionalFieldDetailDto[];
  public headerAdditionalFieldDetails: AdditionalFieldDetailDto[] = [];
  public additionalFieldForExpenseCostDistributions: AdditionalFieldDetailDto[] = [];
  public additionalFieldLineItemDetails: AdditionalFieldDetailDto[] = [];
  public itemPoReceiptLineLevelAttachments: BillLineLevelPoReceiptDto [] = [];
  public expensePoReceiptLineLevelAttachments: BillLineLevelPoReceiptDto [] = [];
  public matchingTableValues: any [] = [];
  public selectedAdditionalField: AdditionalFieldDetailDto;
  public appAuthorities = AppAuthorities;
  public appFormConstants = AppFormConstants;
  public appConstant: AppConstant = new AppConstant();
  public appModuleSection = AppModuleSection;
  public commonUtil = new CommonUtility();
  public dateFormat = new DataFormat();
  public poDetail = new PoApprovalDto();
  public appFieldType = AppFieldType;
  public removeSpace: RemoveSpace = new RemoveSpace();
  public ruleListForItem: DropdownDto [] = [];
  public ruleListForExpense: DropdownDto [] = [];

  public addNewDropDown = false;
  public showPoLineItems = false;
  public isVisibleNotificationContent = false;
  public poNumber: any;
  public selectedPoLineItems = [];
  public selectedPoAccountDetails = [];
  public showPoLineItemsByDefault;

  public attachments: File[] = [];
  public existingAttachments: any[] = [];
  public previousAdHocWorkflowDetails: any [] = [];
  public itemPoReceiptIdList: any = [AppConstant.ZERO];

  public addNewVendor: boolean;
  public isAddVendor = false;
  public selectedId: any;
  public adHocIndex: number;
  public isLoading = false;
  public isSaveLoading = false;
  public isValidDiscountDate = false;
  public addNewItemOverlay: boolean;
  public isLoadingSaveAsApproved = false;
  public isAddNewAccount = false;
  public isAddNewProjectCodes = false;
  public departmentPanel: boolean;
  public addNewUOM = false;

  public matchingAutomation: any;
  public isSubmissionWorkFlow = false;
  public isSaveAsApprovedWorkFlow = false;
  public isWorkflowConfigAvailable = false;
  public selectedVendorId: any;
  public sectionId: any;
  public lineItemIndex: any;
  public isAddRue = false;
  public billStatus: any;
  public enums = AppEnumConstants;
  public iconEnum = AppIcons;
  public isClosedPO = false;
  public isEnabledSubmitForApprovalButton = false;
  public isSubmitted = false;
  public isAvailableAwaitingApproval = false;
  public isProgressViewReceipt = false;
  public isViewMatchingTable = false;
  public memoriseItemAcc: MemoriseItemAcc;

  // Variables with draft
  public isSaveAsDraft = false;
  public isOverrideData = false;
  public isDraftNameAvailable = false;
  public draftId: any;
  public isShowDraftListPopUp = false;
  public isClosedPoInDraft = false;
  public userAvailableDraftList: any [] = [];
  public isClickedEditButtonFromDraftList: boolean;
  public purchaseOrderStatus: any;
  public isViewReceiptView = false;
  public isCreateInvoice = false;
  public receiptAttachments: any [] = [];
  public fieldSubscription: Subscription = new Subscription();
  setFieldValueDto: SetFieldValueDto = new SetFieldValueDto();
  public customLineItemGrid = new CustomLineItemGrid(this.gridService);
  public tableKeyEnum = AppTableKeysData;
  previousDepartmentId;
  previousProjectCodeId;
  departmentChangeFromAutomation = false;
  projectCodeChangeFromAutomation = false;

  constructor(public billSubmitService: BillSubmitService, public formBuilder: UntypedFormBuilder, public billsService: BillsService,
              public notificationService: NotificationService, public manageFeatureService: ManageFeatureService,
              public billApprovalsService: BillApprovalsService, public poService: PoService, public router: Router,
              public additionalFieldService: AdditionalFieldService, public privilegeService: PrivilegeService,
              public sanitizer: DomSanitizer, public billPaymentService: BillPaymentService, public creditNoteService: CreditNoteService,
              public automationService: AutomationService, public confirmationService: ConfirmationService,
              public formGuardService: FormGuardService, public drawerService: ManageDrawerService, public gaService: GoogleAnalyticsService,
              private renderer: Renderer2, private el: ElementRef, private gridService: GridService) {
    super(additionalFieldService, notificationService);
  }

  ngOnInit(): void {
    this.billsService.getDefaultPoDrawerState(AppConstant.BILL_PO_LIST_MODAL).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.showPoLineItemsByDefault = res.body;
      }
    });
    if (!this.editView && !this.fromRecurringBill) {
      this.showAvailableDraftListPopUp();
    }
    this.initForm();
    this.setDocumentEvent();
    if (this.fromRecurringBill || this.editView) {
      this.getBillData(this.fromRecurringBill);
    } else {
      this.initExpenseCostDistributionRecords();
      this.initItemCostDistributionRecords();
      this.getModuleReheatedAdditionalField(AppDocumentType.BILL, false).then(async r => {
        this.initApprover();
        await this.customLineItemGrid.initCreateBillExpTable(this.additionalFieldForExpenseCostDistributions);
        await this.customLineItemGrid.initCreateBillItmTable(this.additionalFieldLineItemDetails);
      });
      this.automationService.setUpFocusListeners(this.createEInvoiceForm, this.renderer, this.el, this.setFieldValueDto, AppDocumentType.BILL, this.automationService.billInputFieldsForAutomation);
    }

    this.fieldSubscription = this.automationService.updateFocusListeners.subscribe(value => {
      if (value === AppFormConstants.FOCUS_LISTENER){
        this.departmentChangeFromAutomation = true;
        this.projectCodeChangeFromAutomation = true;
      }

      if (value && value.automationMst) {
        this.matchingAutomation = value.automationMst.automationWorkflowConfigs;
        this.isSubmissionWorkFlow = !value.automationMst.saveAsApprovedEnabled;
        this.isSaveAsApprovedWorkFlow = value.automationMst.saveAsApprovedEnabled;
        this.isWorkflowConfigAvailable = value.automationMst.workflowConfigAvailable;
      } else if (value !== AppFormConstants.FOCUS_LISTENER){
        this.clearAutomation();
      }
    });


    this.getAccounts();
    this.getVendorList();
    this.getPaymentTerms();
    this.getApprovalGroupList();
    this.getUomList();
    this.getDepartment();
    this.getProjectCodeList();
    this.getCustomerInvoiceList();
    this.pressEscKey();
    this.getRequiredFields(this.createEInvoiceForm, AppDocumentType.BILL);

    this.createEInvoiceForm.get(AppFormConstants.BILL_DATE).valueChanges.subscribe(data => this.getDueDate(data, false, false, false));
    this.createEInvoiceForm.get(AppFormConstants.TERM).valueChanges.subscribe(data => this.getDueDate(data, true, false, false));
    this.createEInvoiceForm.get(AppFormConstants.PO_ID).valueChanges.subscribe(data => this.poChanged(data));
    // this.createEInvoiceForm.get(AppFormConstants.VENDOR_ID).valueChanges.subscribe(data => this.vendorChanged(data, false));

    this.memoriseItemAcc = new MemoriseItemAcc(this.manageFeatureService, this.createEInvoiceForm, this.billsService,
      this.expenseCostDistributionForms, this.itemCostDistributionForms);
  }

  trackByFunction(index: number, item: any): any {
    // Use a unique property of item as a tracker
    // For example, assuming item has a unique id property:
    return item.id;
  }

  initForm() {
    this.createEInvoiceForm = this.formBuilder.group({
      vendorId: [AppConstant.NULL_VALUE, Validators.required],
      poId: [AppConstant.NULL_VALUE],
      billNo: [AppConstant.NULL_VALUE, Validators.compose([Validators.required, Validators.maxLength(50)])],
      billDate: [AppConstant.NULL_VALUE, Validators.required],
      term: [AppConstant.NULL_VALUE, Validators.required],
      dueDate: [null],
      remainingCeling: [null],
      remainingPoCeiling: [null],
      remainingVariance: [null],
      netDaysDue: [null],
      discountPercentage: [null],
      termManuallyChanged: [false],
      discountDaysDue: [null],
      status: [null],
      frequencyEvery: [AppConstant.NULL_VALUE],
      id: [],
      unit: [],
      billAttachmentId: [],
      endDate: [],
      receiptId: [],
      event: [],
      billAmount: [null],
      scheduleTemplateId: [null],
      tax: [],
      grossAmount: [null],
      departmentId: [null],
      payWhenCustomerPay: [null],
      customerInvoiceId: [null],
      additionalNotes: [],
      focusListener: [],
      closePo: [false],
      patchSetFieldFullObject: [false],
      projectCodeId: [null],
      accountPeriodMonth: [null],
      accountPeriodYear: [null],
      adHocWorkflowDetails: this.formBuilder.array([]),
      additionalData: this.formBuilder.array([]),
      billExpenseCostDistributions: this.formBuilder.array([]),
      billItemCostDistributions: this.formBuilder.array([]),
      expenseCostDistributionCostTotal: [null],
      itemCostDistributionCostTotal: [null],
    });

    this.createEInvoiceForm.get(AppFormConstants.DEPARTMENT_ID).valueChanges.subscribe((value) => {
      if (value){
        this.commonUtil.patchHeaderDepartmentToLineLevel(this.createEInvoiceForm, -1, this.editView, null, true, true);
      }
      if (value !== this.previousDepartmentId) {
        if (value && ((this.departmentChangeFromAutomation && this.editView) || !this.editView)){
          this.commonUtil.patchHeaderLevelDepartmentAndProjectCodeLineLevel(AppFormConstants.DEPARTMENT_ID, value);
        }
        this.previousDepartmentId = this.createEInvoiceForm.get(AppFormConstants.DEPARTMENT_ID).value;
      }
    });

    this.createEInvoiceForm.get(AppFormConstants.PROJECT_CODE_ID).valueChanges.subscribe((value) => {
      if (value){
        this.billUtility.patchProjectTaskToLine(this.expenseCostDistributionForms, this.itemCostDistributionForms, value);
      }
      if (value !== this.previousProjectCodeId) {
        if (value && ((this.projectCodeChangeFromAutomation && this.editView) || !this.editView)){
          this.commonUtil.patchHeaderLevelDepartmentAndProjectCodeLineLevel(AppFormConstants.PROJECT_CODE_ID, value);
        }
        this.previousProjectCodeId = this.createEInvoiceForm.get(AppFormConstants.PROJECT_CODE_ID).value;
      }
    });
  }

  setDocumentEvent() {
    let event = AppDocuments.DOCUMENT_EVENT_SUBMITTED;
    if (this.editView && this.createEInvoiceForm.get('status').value !== this.enums.STATUS_DRAFT) {
      event = AppDocuments.DOCUMENT_EVENT_EDIT;
    }
    if (this.createEInvoiceForm.get('status').value === this.enums.STATUS_REJECT) {
      event = AppDocuments.DOCUMENT_EVENT_EDIT_RESUBMIT;
    }

    this.createEInvoiceForm.get('event').patchValue(event);
    this.createEInvoiceForm.get(AppFormConstants.PATCH_SET_FIELD_FULL_OBJECT).patchValue(
      (this.createEInvoiceForm.get('status').value === this.enums.STATUS_DRAFT || this.editView || this.fromRecurringBill));
  }

  /**
   * this method used to get project code list
   */
  getProjectCodeList() {
    this.billsService.getProjectTaskUserWise(AppConstant.PROJECT_CODE_CATEGORY_ID, !this.editView, this.billId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.projectTasks.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Get Bill Data
   */
  async getBillData(fromRecurring) {
    let billResult;

    if (fromRecurring) {
      if (!this.templateId) {
        return;
      }
      await this.billsService.getRecurringBillTemplateData(this.templateId).then(async (res: any) => {
        billResult = res.body;
      }).catch((e) => this.notificationService.errorMessage(e));

      await this.billsService.getAutoGeneratedBillNumber(this.templateId).then((result: any) => {
        billResult.billNo = result.body.billNoPattern;
      }).catch((e) => this.notificationService.errorMessage(e));

      billResult.billItemCostDistributions = billResult.recurringBillItemCostDistributions;
      billResult.billExpenseCostDistributions = billResult.recurringBillExpenseCostDistributions;
    } else {

      await this.billSubmitService.getBillDetail(this.billId, false).then(async (res: any) => {

        // changes with bill draft
        this.billUtility.isCheckedPayWhenCustomerPay = res.body.payWhenCustomerPay;
        this.purchaseOrderStatus = res.body.poStatus;
        this.selectedVendorId = res.body.vendorId;
        this.isClosedPoInDraft = (this.purchaseOrderStatus ===
          AppEnumConstants.STATUS_CLOSED && res.body.status === AppEnumConstants.STATUS_DRAFT);
        this.isClosedPoInDraft = (this.purchaseOrderStatus === AppEnumConstants.STATUS_CLOSED && res.body.status === AppEnumConstants.STATUS_DRAFT);

        this.commonUtil.isDepartmentAvailable = res.body.isDepartmentAvailable;
        this.commonUtil.isProjectCodeAvailable = res.body.isProjectCodeAvailable;

        billResult = res.body;
        this.isClosedPO = res.body.closePo;
      }).catch((e) => this.notificationService.errorMessage(e));

      // bill draft related changes
      if (billResult.billDateStr) {
        billResult.billDate = new Date(billResult.billDateStr);
        billResult.dueDate = null;
        billResult.bilDlate = null;
      }
    }
    if (billResult.previousAdHocWorkflowDetails) {
      this.previousAdHocWorkflowDetails = billResult.previousAdHocWorkflowDetails;
    }
    this.billStatus = billResult.status;
    await this.vendorChanged(billResult.vendorId, false, billResult.poId);
    this.ifVendorIsConfidentialGetApprovalUserList(this.approvalUserList, billResult.vendorId);
    this.existingAttachments = billResult.existingAttachments;
    this.billMasterDto.additionalData = billResult.additionalData;
    this.getVendorItemList(billResult.vendorId);

    this.billMasterDto.billExpenseCostDistributions = billResult.billExpenseCostDistributions;
    this.billMasterDto.billItemCostDistributions = billResult.billItemCostDistributions;
    await this.getModuleReheatedAdditionalField(AppDocumentType.BILL, false);
    const itemPoReceiptSet = new Set();

    if (billResult.billExpenseCostDistributions.length > 0) {
      billResult.billExpenseCostDistributions.forEach((value, index) => {
        if (billResult.billExpenseCostDistributions[index].poReceiptIdList?.length > 0) {
          billResult.billExpenseCostDistributions[index].poReceiptIdList?.forEach((accountReceiptId) => {
            if (accountReceiptId) {
              itemPoReceiptSet.add(accountReceiptId);
            }
          });
        }
        this.addExpenseFieldOnClick();
        this.getAccountNameForExpenseContributionTable(value.accountId, index);
      });
    } else {
      this.addExpenseFieldOnClick();
    }
    if (billResult.billItemCostDistributions.length > 0) {
      billResult.billItemCostDistributions.forEach((value, i) => {
        if (billResult.billItemCostDistributions[i].poReceiptIdList?.length > 0) {
          billResult.billItemCostDistributions[i].poReceiptIdList?.forEach((itemReceiptId) => {
            if (itemReceiptId) {
              itemPoReceiptSet.add(itemReceiptId);
            }
          });
        }
        this.addItemOnClick();
      });
    } else {
      this.addItemOnClick();
    }
    await this.customLineItemGrid.initCreateBillExpTable(this.additionalFieldForExpenseCostDistributions);
    await this.customLineItemGrid.initCreateBillItmTable(this.additionalFieldLineItemDetails);
    this.itemPoReceiptIdList = Array.from(itemPoReceiptSet);
    if (billResult.receiptId) {
      this.itemPoReceiptIdList.push(billResult.receiptId);
    } else if (this.itemPoReceiptIdList.length === 0) {
      this.itemPoReceiptIdList.push(0);
    }
    if (billResult.adHocWorkflowDetails.length > 0) {
      billResult.adHocWorkflowDetails.filter(x => x.completed === false).length !== 0 ? this.isAvailableAwaitingApproval = true : this.isAvailableAwaitingApproval = false;
      billResult.adHocWorkflowDetails.filter(x => x.completed === false).length === 0 ? this.addAdHocWorkflowDetail() : null;
      billResult.adHocWorkflowDetails = billResult.adHocWorkflowDetails.sort((ap1, ap2) =>
      (ap2.approvalOrder > ap1.approvalOrder) ? -1 : ((ap2.approvalOrder > ap1.approvalOrder) ? 1 : 0));
      billResult.adHocWorkflowDetails.forEach(() => {
        this.addAdHocWorkflowDetail();
      });
    } else if (billResult.status !== AppConstant.STATUS_PENDING) {
      this.addAdHocWorkflowDetail();
    }
    billResult.additionalFieldAttachments.forEach((value) => {
      this.existingAttachments.push(value);
    });

    billResult.additionalData = this.commonUtil.patchDropDownAdditionalData(billResult.additionalData);
    billResult.billExpenseCostDistributions = this.commonUtil.patchDropDownAdditionalLineItemData(billResult.billExpenseCostDistributions);
    billResult.billItemCostDistributions = this.commonUtil.patchDropDownAdditionalLineItemData(billResult.billItemCostDistributions);
    billResult.additionalData = this.commonUtil.alignHeadingAdditionalData(this.headerAdditionalFieldDetails, billResult.additionalData);
    this.commonUtil.alignLineAdditionalData(billResult.billExpenseCostDistributions, this.additionalFieldForExpenseCostDistributions);
    this.commonUtil.alignLineAdditionalData(billResult.billItemCostDistributions, this.additionalFieldLineItemDetails);
    if (this.fromRecurringBill) {
      billResult.id = null;
    }
    this.departmentChangeFromAutomation = false;
    this.projectCodeChangeFromAutomation = false;
    this.createEInvoiceForm.patchValue(billResult);

    this.billUtility.getMatchingTableData(this.createEInvoiceForm, this.expenseCostDistributionForms, this.itemCostDistributionForms);
    this.validateButtonOnChangeAddOption();
    billResult.billItemCostDistributions.forEach((value, index) => {
      if (value.itemId) {
        this.getItemName(value.itemId, index);
      }
    });
    this.getTotalCostDistribution();
    // po draft related changes
    this.isDraftNameAvailable = false;
    if (this.isClickedEditButtonFromDraftList) {
      this.billsService.isProcessingPatchingDataFromBillDraft.next({
        isProgress: false,
        index: this.userAvailableDraftList.findIndex(x => x.id === this.draftId)
      });
      this.isShowDraftListPopUp = false;
    }
    this.setDocumentEvent();
    this.automationService.setUpFocusListeners(this.createEInvoiceForm, this.renderer, this.el, this.setFieldValueDto, AppDocumentType.BILL, this.automationService.billInputFieldsForAutomation);
    setTimeout(() => {
      if (billResult.receiptId) {
        this.createEInvoiceForm.get(AppFormConstants.RECEIPT_ID).patchValue(billResult.receiptId);
      }
      this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    }, 500);
  }


  getVendorList() {
    this.billsService.getVendorList(!this.editView).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.vendorsList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getPaymentTerms() {
    this.billsService.getTermsList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.termList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getApprovalUserList() {
    const authorities = [AppAuthorities.BILL_APPROVE, AppAuthorities.BILL_REJECT,
      AppAuthorities.BILL_OVERRIDE_APPROVAL];
    this.billsService.getApprovalUserList(this.billMasterDto.createdBy, authorities, !this.editView).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.approvalUserList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * get project code list to project code list
   * @param listInstance to dropdown instance
   * @param vendorId to vendor id
   */
  ifVendorIsConfidentialGetApprovalUserList(listInstance: DropdownDto, vendorId) {
    const authorities = [AppAuthorities.BILL_APPROVE, AppAuthorities.BILL_REJECT,
      AppAuthorities.BILL_OVERRIDE_APPROVAL];
    this.billsService.getApprovalUserListAccordingToVendorSelection(this.billMasterDto.createdBy, authorities, vendorId, !this.editView).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        listInstance.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getPoListByVendorAndPoId(vendorId, poId) {
    return new Promise<void>(resolve => {
      this.billSubmitService.getPoListByVendorAndPoId(vendorId, poId).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.poList.data = res.body;
        }
        resolve();
      }, error => {
        resolve();
        this.notificationService.errorMessage(error);
      });
    });

  }

  getApprovalGroupList() {
    this.billsService.getApprovalGroupList(!this.editView).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.approvalGroupList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getItemList() {
    this.getVendorItemList(this.selectedVendorId);
  }

  getUomList() {
    this.billsService.getUom().subscribe((res: any) => {
      this.uomList.data = res.body;
      this.uomList.addNew();
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getAccounts() {
    this.billsService.getAccountList(!this.editView).subscribe((res: any) => {
      this.accountList.data = res;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getDepartment() {
    this.billsService.getDepartment(!this.editView).subscribe((res: any) => {
      this.department.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Get po receipt list on po change
   * @param id
   */
  getPoRelatedReceiptList(id) {
    this.poService.getReceipts(id, this.itemPoReceiptIdList).subscribe((res: any) => {
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

  /**
   * this method can be used to get remaining ceiling
   */
  getRemainingCeiling(poId) {
    this.isVisibleNotificationContent = null;
    this.createEInvoiceForm.get('remainingPoCeiling').reset();
    const obj = {
      poId,
      billId: this.createEInvoiceForm.get(AppFormConstants.ID).value,
    };
    this.billSubmitService.getPoCeiling(obj).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body?.remainingPoCeiling !== null) {
            this.createEInvoiceForm.get(AppFormConstants.REMAINING_PO_CEILING).patchValue((res.body.remainingPoCeiling));
          }
          this.poStatus = res.body?.poStatus;
          this.isClosedPoInDraft = (res.body?.poStatus === AppEnumConstants.STATUS_CLOSED &&
            this.billStatus === AppEnumConstants.STATUS_DRAFT && this.createEInvoiceForm.get('poId').value);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      },
      error => {
        this.notificationService.errorMessage(error);
      });
  }

  /**
   * this method can be used to get due date
   */
  getDueDate(data, fromTerm, fromNet, fromDue) {
    const dateFormat = this.dateFormat.DATE_FORMAT;
    let billDate = this.createEInvoiceForm.get(AppFormConstants.BILL_DATE).value;
    let netDays = this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).value;
    let dueDate = this.createEInvoiceForm.get(AppFormConstants.DUE_DATE).value;
    const term = this.createEInvoiceForm.get(AppFormConstants.TERM).value;

    if (term == AppConstant.DISCOUNT_TERM_OTHER && fromTerm) {
      this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).setValidators(Validators.compose([Validators.min(0)]));
      this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).updateValueAndValidity();
    } else if (fromTerm) {
      this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).clearValidators();
      this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).updateValueAndValidity();
    }
    if (term !== AppConstant.DISCOUNT_TERM_OTHER && fromTerm) {
      this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).patchValue(null);
    }
    if (!data || !term || !billDate) {
      this.createEInvoiceForm.get(AppFormConstants.DUE_DATE).reset();
      return;
    }
    try {
      billDate = billDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    } catch (e) {
    }

    if (dueDate) {
      try {
        dueDate = dueDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
      } catch (e) {
      }
    }

    if (fromNet) {
      dueDate = null;
    }
    if (fromDue) {
      netDays = null;
    }

    if (!netDays) {
      netDays = 0;
    }

    this.billSubmitService.getDueDate(billDate, dateFormat, term, netDays, dueDate).subscribe((res: any) => {
      if (res.body.dueDate) {
        this.createEInvoiceForm.get(AppFormConstants.DUE_DATE).patchValue(res.body.dueDate);
      }
      if (res.body.netDaysDue !== null) {
        this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).patchValue(res.body.netDaysDue);
        this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).markAsDirty();
        if (fromDue) {
          this.automationService.triggerFocusListeners(AppFormConstants.NET_DAYS_DUE);
        }
      }
    });
  }

  /**
   * this method can be used to get vendor related po list
   */
  getVendorRelatedPoList(vendorId) {
    return new Promise<void>(resolve => {
      this.billsService.getPoList(vendorId).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.poList.data = res.body;
        }
        resolve();
      }, error => {
        resolve();
        this.notificationService.errorMessage(error);
      });
    });
  }

  /**
   * This method can be used to get item name
   * @param id to selected item id
   *  @param index to formGroup index
   */
  getItemName(id, index) {
    if (id !== AppConstant.ZERO && this.itemCostDistributionForms.controls[index].get('itemId').value) {
      this.getItemRelatedSku(this.createEInvoiceForm.get(AppFormConstants.VENDOR_ID).value, id, index);
    }
    if (!this.itemCostDistributionForms.controls[index].get('itemId').value) {
      this.itemCostDistributionForms.controls[index].get('itemName').reset();
      this.itemCostDistributionForms.controls[index].get('itemNumber').reset();
      this.itemCostDistributionForms.controls[index].get('vendorItemNumber').reset();
      return;
    } else {
      this.billApprovalsService.getItemName(id).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.itemCostDistributionForms.controls[index].get('itemName').patchValue(res.body.name);
          this.itemCostDistributionForms.controls[index].get('itemNumber').patchValue(res.body.itemNumber);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
      this.receiptToLineItem();

    }
  }


  clearAutomation() {
    this.matchingAutomation = null;
    this.isSubmissionWorkFlow = false;
    this.isSaveAsApprovedWorkFlow = false;
    this.isWorkflowConfigAvailable = false;
  }

  /**
   * Triggers on a value change of po Id
   */
  poChanged(poId) {
    this.createEInvoiceForm.get(AppFormConstants.RECEIPT_ID).reset();
    this.billUtility.ifClearHeaderLevelReceiptCLearLineLevelReceiptValue(this.createEInvoiceForm.get('receiptId').value,
      this.expenseCostDistributionForms, this.itemCostDistributionForms);
    this.createEInvoiceForm.get('closePo').patchValue(false);
    this.receiptList = new DropdownDto();
    if (!poId) {
      this.showPopUp();
      this.billUtility.isViewThreeWayMatchingTable = false;
      this.isClosedPoInDraft = false;
      return;
    }
    this.poNumber = this.poList.data.find(i => i.id == poId).name;
    if (this.showPoLineItemsByDefault) {
      this.getPoDetails();
    }
    this.getRemainingCeiling(poId);
    this.getPoRelatedReceiptList(poId);
  }

  /**
   * Triggers on a value change of vendor Id
   */
  async vendorChanged(id, fromDropDown, poId) {
    return new Promise<void>(async resolve => {
      if (fromDropDown) {
        this.createEInvoiceForm.get(AppFormConstants.PO_ID).reset();
      }

      this.poList = new DropdownDto();

      if (!id) {
        resolve();
        return;
      }
      await this.getVendorRelatedTerms(id);
      if (!poId) {
        await this.getVendorRelatedPoList(id);
      } else {
        await this.getPoListByVendorAndPoId(id, poId);
      }
      resolve();
    });
  }

  termManuallyChanged(fromDp?, selectedTermName?) {
    if (fromDp) {
      this.commonUtil.isPressEnterInsideDropdown(selectedTermName);
    }
    this.automationService.setAutomationData(this.createEInvoiceForm, AppFormConstants.TERM);
    this.createEInvoiceForm.get('termManuallyChanged').patchValue(true);
  }

  getVendorRelatedTerms(id) {
    return new Promise(resolve => {
      if (this.createEInvoiceForm.get('termManuallyChanged').value || this.editView) {
        resolve(true);
        return;
      }

      this.billsService.getVendorRelatedTerms(id).subscribe({
        next: (res: any) => {
          if (!res.body) {
            resolve(true);
            return;
          }
          if (res.body?.visibilityStatus === AppEnumConstants.STATUS_LETTER_INACTIVE) {
            this.createEInvoiceForm.get(AppFormConstants.TERM).patchValue(res.body.id);
            this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).patchValue(res.body.netDaysDue);
            this.createEInvoiceForm.get(AppFormConstants.DISCOUNT_PERCENTAGE).patchValue(res.body.discountPercentage);
            this.createEInvoiceForm.get(AppFormConstants.DISCOUNT_DAYS_DUE).patchValue(res.body.discountDaysDue);
          } else {
            this.createEInvoiceForm.get(AppFormConstants.TERM).patchValue(res.body?.id);
          }
          resolve(true);
        }, error: (err) => {
          resolve(true);
        }
      });
    });
  }

  /**
   * this method can be used to closed the e invoice screen
   */
  closeEInvoiceCreateMode() {
    this.isClickCloseButton.emit(false);
  }

  /**
   * this method can be used to create e invoice
   * @param action to submit type
   * @param editOnly
   * @param isSubmitted
   * @param type to action
   */
  createEInvoice(action, editOnly, isSubmitted, type) {
    this.isSubmitted = isSubmitted;
    const billMasterDto = this.createEInvoiceForm.getRawValue();
    this.isSaveLoading = true;
    billMasterDto.additionalData = this.commonUtil.formatMultisetValues(billMasterDto.additionalData);
    billMasterDto.billItemCostDistributions = this.commonUtil.formatMultisetLineValues(billMasterDto.billItemCostDistributions);
    billMasterDto.billExpenseCostDistributions = this.commonUtil.formatMultisetLineValues(billMasterDto.billExpenseCostDistributions);
    const billDate = this.createEInvoiceForm.get('billDate').value;
    if (billDate) {
      billMasterDto.billDate = billDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    }
    const existingAttachments = [];
    const existingAdditionalFieldAttachments = [];
    this.existingAttachments?.forEach(value => {
      if (value.fieldId) {
        existingAdditionalFieldAttachments.push(value);
      } else {
        existingAttachments.push(value);
      }
    });

    billMasterDto.existingAttachments = [];
    billMasterDto.existingAttachments = existingAttachments;

    billMasterDto.existingAdditionalFieldAttachments = [];
    billMasterDto.existingAdditionalFieldAttachments = existingAdditionalFieldAttachments;

    billMasterDto.attachments = this.attachments;

    billMasterDto.expenseAccountIdList = billMasterDto.billExpenseCostDistributions?.map(r => r.accountId)?.filter(x => x);
    billMasterDto.itemIdList = billMasterDto.billItemCostDistributions?.map(r => r.itemId)?.filter(x => x);
    billMasterDto.projectCodeIdList = billMasterDto.billExpenseCostDistributions?.map(r => r.projectId)?.filter(x => x);
    billMasterDto.projectCodeIdList = billMasterDto.projectCodeIdList.concat(billMasterDto.billItemCostDistributions?.map(r => r.projectId)?.filter(x => x));

    if (this.editView) {
      new CommonUtility().validateFileInput(this.createEInvoiceForm.get('additionalData'), this.existingAttachments);
    }

    if (this.createEInvoiceForm.valid) {
      if (action === 'SUBMIT_FOR_APPROVED') {
        this.gaService.trackScreenButtonEvent(
          AppAnalyticsConstants.SUBMIT_FOR_APPROVED,
          AppAnalyticsConstants.MODULE_NAME_BILL,
          AppAnalyticsConstants.SUBMIT_FOR_APPROVED,
          AppAnalyticsConstants.CREATE_SCREEN
        );
        if (this.editView) {
          if (this.billStatus !== AppEnumConstants.STATUS_DRAFT) {
            editOnly = !(this.billStatus == this.enums.STATUS_REJECT && !isSubmitted);
          } else if ((this.billStatus == AppEnumConstants.STATUS_DRAFT || this.isOverrideData) && isSubmitted) {
            editOnly = false;
          }
          this.editBill(billMasterDto, editOnly, type);

        } else {
          this.createBill(billMasterDto);
        }
      } else if (action === 'SAVE_AS_APPROVED') {
        this.gaService.trackScreenButtonEvent(
          AppAnalyticsConstants.SAVE_AS_APPROVED,
          AppAnalyticsConstants.MODULE_NAME_BILL,
          AppAnalyticsConstants.SAVE_AS_APPROVED,
          AppAnalyticsConstants.CREATE_SCREEN
        );
        this.createBillSaveAsApproved(billMasterDto);
      }
    } else {
      this.isSaveLoading = false;
      this.isLoading = false;
      this.isLoadingSaveAsApproved = false;
      return new CommonUtility().validateForm(this.createEInvoiceForm);
    }
  }

  /**
   * this method can be used to bill submit for approved
   */
  createBill(billMasterDto) {
    this.billsService.createEInvoice(billMasterDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.SUBMITTED_SUCCESSFULLY);
        this.createEInvoiceForm.reset();
        this.closeEInvoiceCreateMode();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.isSaveLoading = false;
      this.isLoading = false;
    }, error1 => {
      this.isLoading = false;
      this.isSaveLoading = false;
      this.notificationService.errorMessage(error1);
    });
  }

  /**
   * this method can be used to bill submit for approved
   */
  editBill(billMasterDto, editOnly, type) {
    this.billSubmitService.editBill(billMasterDto, editOnly).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        if ((this.isOverrideData || this.billStatus === AppEnumConstants.STATUS_DRAFT) && type === 'save_as_approved') {
          this.notificationService.successMessage(HttpResponseMessage.BILL_SAVE_AS_APPROVED_SUCCESSFULLY);
        } else {
          this.billStatus == this.enums.STATUS_APPROVED && this.isSubmitted ?
            this.notificationService.successMessage(HttpResponseMessage.SUBMITTED_SUCCESSFULLY) :
            this.notificationService.successMessage(HttpResponseMessage.BILL_UPDATED_SUCCESSFULLY);
        }
        this.createEInvoiceForm.reset();
        this.isSuccessEditAction.emit();
        this.closeEInvoiceCreateMode();
      } else {
        this.isSaveLoading = false;
        this.isLoading = false;
        this.notificationService.infoMessage(res.body.message);
      }
      this.isSaveLoading = false;
      this.isLoading = false;
      this.isLoadingSaveAsApproved = false;
    }, error1 => {
      this.isSaveLoading = false;
      this.isLoading = false;
      this.isLoadingSaveAsApproved = false;
      this.notificationService.errorMessage(error1);
    });
  }

  /**
   * this method can be used for bill save as approved
   * @param billMasterDto to bill master dto
   */
  createBillSaveAsApproved(billMasterDto) {
    this.billsService.createBillAsApproved(billMasterDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.BILL_SAVE_AS_APPROVED_SUCCESSFULLY);
        this.createEInvoiceForm.reset();
        this.closeEInvoiceCreateMode();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.isSaveLoading = false;
      this.isLoading = false;
      this.isLoadingSaveAsApproved = false;
    }, error2 => {
      this.isSaveLoading = false;
      this.isLoading = false;
      this.isLoadingSaveAsApproved = false;
      this.notificationService.errorMessage(error2);
    });
  }

  /**
   * this method can be used to reset e invoice form
   * @param isClickOnResetButton to cache reset button on click event
   */
  resetEInvoiceForm(isClickOnResetButton) {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.MODULE_NAME_BILL,
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.CREATE_SCREEN
    );
    this.commonUtil.projectCodeChanges = [];
    this.commonUtil.departmentChanges = [];
    this.createEInvoiceForm.reset();
    this.automationService.resetSetFieldValueData();
    this.setDocumentEvent();
    this.headingSectionArray.clear();
    this.expenseCostDistributionForms.clear();
    this.itemCostDistributionForms.clear();
    this.adHocWorkflowDetails.clear();
    this.additionalFieldLineItemDetails = [];
    this.headerAdditionalFieldDetails = [];
    this.billUtility.matchingTableValues = [];
    this.billUtility.isViewMatchingTable = false;
    this.adHocWorkflowDetails.controls = [];
    this.isDraftNameAvailable = false;
    this.attachments = [];
    this.vendorRelevantItemList.data = [];
    this.additionalFieldForExpenseCostDistributions = [];
    this.billUtility.isCheckedPayWhenCustomerPay = false;
    this.clearAutomation();

    this.initExpenseCostDistributionRecords();
    this.initItemCostDistributionRecords();
    if (this.fromRecurringBill || this.editView || (this.isOverrideData && !isClickOnResetButton)) {
      this.getBillData(this.fromRecurringBill);
      this.automationService.setUpFocusListeners(this.createEInvoiceForm, this.renderer, this.el, this.setFieldValueDto, AppDocumentType.BILL, this.automationService.billInputFieldsForAutomation);
    } else {
      this.initApprover();
      this.getModuleReheatedAdditionalField(AppDocumentType.BILL, false).then(async r => {
        await this.customLineItemGrid.initCreateBillExpTable(this.additionalFieldForExpenseCostDistributions);
        await this.customLineItemGrid.initCreateBillItmTable(this.additionalFieldLineItemDetails);
      });
    }
  }

  /**
   * This method can be used to remove items
   */
  removeItem(itemIndex) {
    this.itemCostDistributionForms.removeAt(itemIndex);
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
  }

  /**
   * This method can be used to remove selected file
   * @param event to remove event
   */
  onRemove(event) {
    this.attachments.splice(this.attachments.indexOf(event), 1);
  }

  /**
   * This method can be used to select file
   * @param event to change event
   */
  onSelect(event) {
    this.attachments.push(...event.addedFiles);
  }


  /*
    ITEM FORM ARRAY DETAILS-------------------------------------------------------------------------------------------->
   */


  /**
   * This method add item to array with additional field
   */
  addItemOnClick() {
    const itemInfo = this.formBuilder.group({
      itemId: [null],
      itemName: [],
      description: [],
      accountId: [null],
      accountNumber: [null],
      vendorItemNumber: [null],
      qty: [''],
      rate: [null],
      amount: [null],
      departmentId: [null],
      projectId: [null],
      itemNumber: [''],
      accountChanged: [false],
      poReceiptId: [null],
      poReceiptIdList: [null],
      billable: [false],
      taxable: [false],
      hideAccountNumberInput: [false],
      additionalData: this.formBuilder.array([])
    });
    this.itemCostDistributionForms.push(itemInfo);
    const obj: DropdownDto = new DropdownDto();
    this.skuDropDownList.push(obj);
    const itemRuleList: DropdownDto = new DropdownDto();
    this.ruleListForItem.push(itemRuleList);
    this.billUtility.addEmptyDropDownReferenceForAccountField();
    const itemLevelAttachment: BillLineLevelPoReceiptDto = new BillLineLevelPoReceiptDto();
    this.billUtility.itemPoReceiptLineLevelAttachments.push(itemLevelAttachment);
    const lastIndex = (this.itemCostDistributionForms.length - 2);
    this.addAdditionalLineItems(lastIndex);
  }

  /**
   * This method add account to array with additional field
   */
  addExpenseFieldOnClick() {
    const itemInfo = this.formBuilder.group({
      accountId: [null],
      accountName: [null],
      description: [null],
      amount: [null],
      accountNumber: [null],
      departmentId: [null],
      projectId: [null],
      poReceiptId: [null],
      poReceiptIdList: [null],
      accountChanged: [false],
      billable: [false],
      taxable: [false],
      hideAccountNumberInput: [false],
      additionalData: this.formBuilder.array([])
    });
    this.expenseCostDistributionForms.push(itemInfo);
    this.billUtility.addEmptyDropDownReferenceForAccountField();
    const expenseRuleList: DropdownDto = new DropdownDto();
    this.ruleListForExpense.push(expenseRuleList);
    const expenseLevelAttachment: BillLineLevelPoReceiptDto = new BillLineLevelPoReceiptDto();
    this.billUtility.expensePoReceiptLineLevelAttachments.push(expenseLevelAttachment);
    const len = (this.expenseCostDistributionForms.length - 2);
    this.addExpenseFields(len);
  }

  /**
   * This method add item to array
   */
  addItemCostDistributionField() {
    const itemCostDistributionForms = this.formBuilder.group({
      itemId: [null],
      itemName: [],
      description: [],
      vendorItemNumber: [null],
      qty: [''],
      accountId: [null],
      accountNumber: [null],
      rate: [null],
      amount: [null],
      departmentId: [null],
      projectId: [null],
      itemNumber: [''],
      accountChanged: [false],
      poReceiptId: [null],
      poReceiptIdList: [null],
      billable: [false],
      taxable: [false],
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
    this.itemCostDistributionForms.push(itemCostDistributionForms);
  }

  /**
   * This method add account to array
   */
  addExpenseCostDistributionField() {
    const expenseInfo = this.formBuilder.group({
      accountId: [null],
      accountName: [null],
      accountNumber: [null],
      departmentId: [null],
      description: [null],
      amount: [null],
      projectId: [null],
      poReceiptId: [null],
      poReceiptIdList: [null],
      accountChanged: [false],
      billable: [false],
      taxable: [false],
      hideAccountNumberInput: [false],
      additionalData: this.formBuilder.array([])
    });
    const expenseRuleList: DropdownDto = new DropdownDto();
    this.ruleListForExpense.push(expenseRuleList);
    this.billUtility.addEmptyDropDownReferenceForAccountField();
    const expenseLevelAttachment: BillLineLevelPoReceiptDto = new BillLineLevelPoReceiptDto();
    this.billUtility.expensePoReceiptLineLevelAttachments.push(expenseLevelAttachment);
    this.expenseCostDistributionForms.push(expenseInfo);
  }


  /**
   * Add new approver
   */
  addAdHocWorkflowDetail() {
    const addHocWorkflowDetail = this.formBuilder.group({
      id: [null],
      approvalOrder: [null],
      approvalGroup: [null],
      approvalUser: [null],
      completed: [false]
    });
    this.adHocWorkflowDetails.push(addHocWorkflowDetail);
    const adHocWorkFlowOrderNumber = this.adHocWorkflowDetails.length;
    this.adHocWorkflowDetails.controls[adHocWorkFlowOrderNumber - 1].get('approvalOrder').patchValue(adHocWorkFlowOrderNumber);
    this.validateButtonOnChangeAddOption();
  }


  /**
   * this method can be used to add new line additional field item
   * @param index to index
   */
  addExpenseFields(index) {
    this.additionalFieldForExpenseCostDistributions.forEach((value) => {
      this.expenseCostDistributionAdditionalFields(index + 1).push(this.commonUtil.getAdditionalFieldValidations(value, false));
    });
  }

  /**
   * This method can use for get controllers in form array
   */
  public get adHocWorkflowDetails() {
    return this.createEInvoiceForm.get('adHocWorkflowDetails') as UntypedFormArray;
  }

  /**
   * this method can be used to init approver dropdown
   */
  initApprover() {
    this.addAdHocWorkflowDetail();
  }


  /**
   * remove AddHocWorkflow
   * @param index number
   */
  removeAdHocWorkflow(index: number) {
    this.adHocWorkflowDetails.removeAt(index);
    this.validateButtonOnChangeAddOption();
  }


  /*
 Validations ---------------------------------------------------------------------------------------------------------------------->
   */

  /**
   * this method can be used to on line item click
   * @param index to index
   */

  onLItemClick(index) {
    const len = (this.itemCostDistributionForms.length) - 1;
    if (len === index) {
      this.addItemCostDistributionField();
      this.addAdditionalLineItems(len);
    }
  }

  /**
   * this method can be used to add new line additional field item
   * @param index to index
   */
  addAdditionalLineItems(index) {
    this.additionalFieldLineItemDetails.forEach((value) => {
      this.itemDetailsAdditionalFields(index + 1).push(this.commonUtil.getAdditionalFieldValidations(value, false));
    });
  }

  /*
  Calculate Total -------------------------------------------------------------------------------------------------->
   */

  navigate(e, name: string, i: any) {
    switch (e.key) {
      case 'ArrowDown':
        if ((this.itemCostDistributionForms.length) - 2 === i) {
          this.addItemOnClick();
        }
        e.preventDefault();
        document.getElementById(name + (i + 1)).focus();
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
   * this method can be used to get add new modal
   * @param selectedId to id
   * @param i to index
   */
  changeItemList(selectedId, i) {
    if (selectedId === 0) {
      this.itemCostDistributionForms.controls[i].get('itemId').reset();
      this.addNewItemOverlay = false;
    } else if (selectedId) {
      this.itemCostDistributionForms.controls[i].get(AppFormConstants.ACCOUNT_CHANGED).patchValue(true);
    }
  }


  /**
   * this method can be used to upload file list
   * @param event to event
   */
  changeFileList(event) {
    this.attachments.push(...event.addedFiles);
  }

  /**
   * This method will get trigger when on key up discount days field
   */
  onKeyUpDiscountDaysDue() {
    this.isValidDiscountDate = false;
    // tslint:disable-next-line:radix
    const netDaysDue = parseInt(this.createEInvoiceForm.get('netDaysDue').value);
    // tslint:disable-next-line:radix
    const discountDaysDue = parseInt(this.createEInvoiceForm.get('discountDaysDue').value);
    if (netDaysDue === null && discountDaysDue === null) {
      return;
    }
    if (netDaysDue < discountDaysDue) {
      this.isValidDiscountDate = true;
    } else {
      this.isValidDiscountDate = false;
      this.createEInvoiceForm.get('discountDaysDue').clearValidators();
    }
    this.createEInvoiceForm.get('discountDaysDue').updateValueAndValidity();
    this.createEInvoiceForm.get('netDaysDue').updateValueAndValidity();
  }

  /*
------------------------------ADDITIONAL FIELD RELATED FUNCTIONS------------------------------------------------------------------------->
*/

  /**
   * This method use for add additional fields to po creation
   */
  getModuleReheatedAdditionalField(id, isDetailView) {
    return new Promise<void>(resolve => {
      this.additionalFieldService.getAdditionalField(id, isDetailView, !this.editView).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {

          this.additionalFieldResponse = res.body;
          this.selectedVendorName.focus();

          this.additionalFieldResponse.forEach(((field) => {
            this.commonUtil.manageDropDownData(field, isDetailView);

            if (field.sectionId === AppModuleSection.MASTER_DATA_INPUT_SECTION_ID) {
              this.addHeadingField(field);
            }

            if (field.sectionId === AppModuleSection.ITEM_COST_DISTRIBUTION_SECTION_ID) {
              this.addAdditionalFieldForItemDetailTable(field);
            }

            if (field.sectionId === AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID) {
              this.addAdditionalFieldForExpenseCostDistributionTable(field);
            }
          }));
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        resolve();
      }, error => {
        resolve();
        this.notificationService.errorMessage(error);
      });
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
   * This method use for add line item data additional field and field validations
   * @param field to additional field dto
   */
  public addAdditionalFieldForItemDetailTable(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.billMasterDto.billItemCostDistributions, field, false, !this.editView)) {
      return;
    }
    this.additionalFieldLineItemDetails.push(field);
    this.itemCostDistributionForms.controls.forEach((value, index) => {
      this.itemDetailsAdditionalFields(index).push(this.commonUtil.getAdditionalFieldValidations(field, false));
    });
  }


  /**
   * return form array data
   */
  public get headingSectionArray() {
    return this.createEInvoiceForm.get('additionalData') as UntypedFormArray;
  }

  /**
   * This method returns the line item section additional detail controllers as an array
   */
  public itemDetailsAdditionalFields(index) {
    return this.itemCostDistributionForms.controls[index].get('additionalData') as UntypedFormArray;
  }

  /**
   * This method use for add line item data additional field and field validations
   */
  public addAdditionalFieldForExpenseCostDistributionTable(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.billMasterDto.billExpenseCostDistributions, field, false, !this.editView)) {
      return;
    }
    this.additionalFieldForExpenseCostDistributions.push(field);
    this.expenseCostDistributionForms.controls.forEach((value, index) => {
      this.expenseCostDistributionAdditionalFields(index).push(this.commonUtil.getAdditionalFieldValidations(field, false));
    });
  }


  /*
Form Arrays -------------------------------------------------------------------------------------------------------------->
*/

  /**
   * This method can use for get controllers in form array
   */
  public get itemCostDistributionForms() {
    return this.createEInvoiceForm.get('billItemCostDistributions') as UntypedFormArray;
  }

  /**
   * This method can use for get controllers in form array
   */
  public get expenseCostDistributionForms() {
    return this.createEInvoiceForm.get('billExpenseCostDistributions') as UntypedFormArray;
  }

  /**
   * This method returns the line item section additional detail controllers as an array
   */
  public itemCostDistributionAdditionalFields(index) {
    return this.itemCostDistributionForms.controls[index].get('additionalData') as UntypedFormArray;
  }

  /**
   * This method returns the line item section additional detail controllers as an array
   */
  public expenseCostDistributionAdditionalFields(index) {
    return this.expenseCostDistributionForms.controls[index].get('additionalData') as UntypedFormArray;
  }


  /**
   * This method use for add new form group in expense table
   */
  addExpenseCostDistributionFieldOnClick() {
    this.addExpenseCostDistributionField();
    const lastIndex = (this.expenseCostDistributionForms.length - 2);
    this.addAdditionalExpenseCostDistributionRecords(lastIndex);
  }

  /**
   * this method can be used to init approver dropdown
   */
  initExpenseCostDistributionRecords() {
    for (let i = 0; i < 10; i++) {
      this.addExpenseCostDistributionField();
    }
  }

  /**
   * this method can be used to init add items
   */

  initItemCostDistributionRecords() {
    for (let i = 0; i < 10; i++) {
      this.addItemCostDistributionField();
    }
  }

  removeExpenseCostDistributionRecord(i) {
    this.expenseCostDistributionForms.removeAt(i);
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
  }

  /**
   * This method use for calculate total of cost distributions
   */
  getTotalCostDistribution() {
    let expenseCostDistributionAmount = 0.00;
    let itemCostDistributionAmount = 0.00;
    let billAmount: number;


    for (const expenseCost of this.expenseCostDistributionForms.controls) {
      if (expenseCost.value.amount) {
        const amt = this.commonUtil.roundNum(expenseCost.value.amount);
        expenseCostDistributionAmount += amt;
      }
    }

    this.itemCostDistributionForms.controls.forEach((itemCost, index) => {
      const qty = itemCost.value.qty ? itemCost.value.qty : AppConstant.ZERO;
      const rate = itemCost.value.rate ? itemCost.value.rate : AppConstant.ZERO;
      let sum = qty * rate;
      sum = this.commonUtil.roundNum(sum);
      itemCostDistributionAmount += sum;
      if (qty === AppConstant.ZERO && rate === AppConstant.ZERO) {
        sum = null;
      }
      this.itemCostDistributionForms.controls[index].get('amount').patchValue(sum);
    });

    billAmount = expenseCostDistributionAmount + itemCostDistributionAmount;

    this.createEInvoiceForm.get('expenseCostDistributionCostTotal').patchValue(expenseCostDistributionAmount);
    this.createEInvoiceForm.get('itemCostDistributionCostTotal').patchValue(itemCostDistributionAmount);
    this.createEInvoiceForm.get('billAmount').patchValue(billAmount);
  }

  /**
   * this method can be used to get account name
   * @param id to account id
   * @param i to index number
   */
  getAccountNameForExpenseContributionTable(id, i, isItemCostDistribution?) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    if (!isItemCostDistribution) {
      this.expenseCostDistributionForms.controls[i].get('accountNumber').reset();
      this.expenseCostDistributionForms.controls[i].get('accountName').reset();
    } else {
      this.itemCostDistributionForms.controls[i].get('accountNumber').reset();
    }
    if (id !== null && id !== undefined && id !== 0) {
      this.billApprovalsService.getAccountName(id).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (!isItemCostDistribution) {
            this.expenseCostDistributionForms.controls[i].get('accountNumber').patchValue(res.body.number);
            this.expenseCostDistributionForms.controls[i].get('accountName').patchValue(res.body.name);
          } else {
            this.itemCostDistributionForms.controls[i].get('accountNumber').patchValue(res.body.number);
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
   * this method can be used to on line item click
   * @param clickIndex to index
   */

  onExpenseCostDistributionClick(clickIndex) {
    const lastIndexNumber = (this.expenseCostDistributionForms.length) - 1;
    if (lastIndexNumber === clickIndex) {
      this.addExpenseCostDistributionField();
      this.addAdditionalExpenseCostDistributionRecords(lastIndexNumber);
    }
  }

  /**
   * this method can be used to add new line additional field item
   * @param lastIndexNumber to index
   */
  addAdditionalExpenseCostDistributionRecords(lastIndexNumber) {
    this.additionalFieldForExpenseCostDistributions.forEach((value) => {
      this.expenseCostDistributionAdditionalFields(lastIndexNumber + 1).push(this.commonUtil.getAdditionalFieldValidations(value, false));
    });
  }

////////////////////////////////////////////////////////////////////////
  /**
   * get po details from to popup from when po changed
   */
  async getPoDetails() {
    this.selectedPoLineItems = [];
    this.selectedPoAccountDetails = [];

    if (!this.createEInvoiceForm.get(AppFormConstants.PO_ID).value) {
      return;
    }

    await this.poService.getPoLineItemData(this.createEInvoiceForm.get(AppFormConstants.PO_ID).value).then((res: any) => {
      this.poDetail.purchaseOrderDetails = res.body;
    }).catch((e) => this.notificationService.errorMessage(e));

    if (!this.createEInvoiceForm.get(AppFormConstants.PO_ID).value) {
      return;
    }

    await this.poService.getPoLineAccountData(this.createEInvoiceForm.get(AppFormConstants.PO_ID).value).then((res: any) => {
      this.poDetail.purchasingAccountDetails = res.body;
      this.showPoLineItems = true;
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
      this.billUtility.getMatchingTableData(this.createEInvoiceForm, this.expenseCostDistributionForms, this.itemCostDistributionForms);
    }
  }

  /**
   * add item info to item cost distribution from po popup
   */
  addLineItems() {
    if (this.selectedPoLineItems.length === 0) {
      return;
    }
    const itemCostData = [];
    let length = itemCostData.length;
    while (this.itemCostDistributionForms.length !== 0) {
      this.itemCostDistributionForms.removeAt(0);
    }
    for (let i = 0; i < 10; i++) {
      this.addItemOnClick();
    }
    this.itemCostDistributionForms.patchValue(itemCostData);
    this.selectedPoLineItems.forEach((value, index) => {
      if (value.productId) {
        if (this.itemCostDistributionForms.controls.length === (1 + index)) {
          this.addItemOnClick();
        }
        this.itemCostDistributionForms.controls[length].get('itemId').patchValue(value.productId);
        this.itemCostDistributionForms.controls[length].get('vendorItemNumber').patchValue(value.vendorItemNumber);
        this.getItemName(value.productId, length);
        this.itemCostDistributionForms.controls[length].get('description').patchValue(value.description);
        this.itemCostDistributionForms.controls[length].get('vendorItemNumber').patchValue(value.vendorItemNumber);
        this.itemCostDistributionForms.controls[length].get('rate').patchValue(value.unitPrice);
        this.itemCostDistributionForms.controls[length].get('qty').patchValue(value.qty);
        this.itemCostDistributionForms.controls[length].get('departmentId').patchValue(value.departmentId);
        if (value.departmentId) {
          this.itemCostDistributionForms.controls[length].get('departmentId').markAsDirty();
        }
        this.itemCostDistributionForms.controls[length].get('accountId').patchValue(value.accountId);
        this.getAccountNameForExpenseContributionTable(value.accountId, length, true);
        this.itemCostDistributionForms.controls[length].get('amount').patchValue(value.amount);
        length = length + 1;
      } else {
        this.selectedPoAccountDetails.push({
          accountName: value.itemName,
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
    const accountInfo: any = [];
    let length = accountInfo.length;
    while (this.expenseCostDistributionForms.length !== 0) {
      this.expenseCostDistributionForms.removeAt(0);
    }
    for (let i = 0; i < 10; i++) {
      this.addExpenseFieldOnClick();
    }
    this.expenseCostDistributionForms.patchValue(accountInfo);
    this.selectedPoAccountDetails.forEach((value, index) => {
      if (this.expenseCostDistributionForms.controls.length === (1 + index)) {
        this.addExpenseFieldOnClick();
      }
      if (value.accountId) {
        this.expenseCostDistributionForms.controls[length].get('accountId').patchValue(value.accountId);
        this.getAccountNameForExpenseContributionTable(value.accountId, length);
      } else {
        this.expenseCostDistributionForms.controls[length].get('description').patchValue(value.accountName);
      }
      this.expenseCostDistributionForms.controls[length].get('departmentId').patchValue(value.departmentId);
      if (value.departmentId) {
        this.expenseCostDistributionForms.controls[length].get('departmentId').markAsDirty();
      }
      this.expenseCostDistributionForms.controls[length].get('amount').patchValue(value.amount);
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

  //////////////////////////////////////////////////////////////////////////


  /**
   * this method can be used to delete attachment
   * @param val to attachment obj
   * @param index to index
   */
  deleteAdditionalAttachments(val: any, index: any) {
    this.confirmationService.confirm({
      key: 'bill-edit',
      message: 'You want to delete this Attachment!',
      accept: () => {
        if (!val.id) {
          return;
        } else {
          this.billApprovalsService.deleteBillAttachment(val).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.notificationService.successMessage(HttpResponseMessage.BILL_ATTACHMENT_DELETED_SUCCESSFULLY);
              this.existingAttachments.splice(index, AppConstant.ONE);
            } else {
              this.notificationService.infoMessage(res.body.message);
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        }
      }
    });
  }

  /**
   * remove bill attachment
   * @param i to index
   */
  deleteAttachmentOnEdit(i: any) {
    this.existingAttachments.splice(i, 1);
  }


  downloadAttachment(val) {
    if (this.fromRecurringBill) {
      if (val.fieldId) {
        this.downloadRecurringAdditionalFieldAttachments(val);
      } else {
        this.downloadRecurringAdditionalAttachment(val);
      }
    } else {
      if (val.fieldId) {
        this.downloadAdditionalFieldAttachments(val);
      } else {
        this.downloadAdditionalAttachment(val);
      }
    }
  }

  /**
   * Recurring Template Additional attached files
   * @param val
   */
  downloadRecurringAdditionalAttachment(val: any) {
    this.billsService.downloadRecurringAttachment(val.id).subscribe((res: any) => {
      this.downloadAttachmentFile(val, res);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * Recurring Template Additional field files
   * @param val
   */
  downloadRecurringAdditionalFieldAttachments(val) {
    this.billsService.downloadRecurringAdditionalFieldAttachments(val.id).subscribe((res: any) => {
      this.downloadAttachmentFile(val, res);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Bill Additional files
   * @param val
   */
  downloadAdditionalAttachment(val: any) {
    this.billSubmitService.getBillAttachment(val.id).subscribe((res: any) => {
      this.downloadAttachmentFile(val, res);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Bill Additional field files
   * @param val
   */
  downloadAdditionalFieldAttachments(val) {
    this.billApprovalsService.downloadBillAttachment(val.id).subscribe((res: any) => {
      this.downloadAttachmentFile(val, res);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  downloadAttachmentFile(val, res) {
    const url = window.URL.createObjectURL(res.data);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', val.fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
  }

  updateAdditionalFieldDropDowns(data?) {
    if (data) {
      this.selectedAdditionalField = data;
    }
    this.commonUtil.updateAdditionalFiledDropdowns(this.headerAdditionalFieldDetails, this.selectedAdditionalField);
    this.commonUtil.updateAdditionalFiledDropdowns(this.additionalFieldForExpenseCostDistributions, this.selectedAdditionalField);
    this.commonUtil.updateAdditionalFiledDropdowns(this.additionalFieldLineItemDetails, this.selectedAdditionalField);
  }

  /**
   * this method can be used to get if vendor is confidential get approval user list
   */
  changeVendorList(event, selectedVendorName) {
    this.getAvailableDraftId();
    this.commonUtil.isPressEnterInsideDropdown(selectedVendorName);
    this.automationService.setAutomationData(this.createEInvoiceForm, AppFormConstants.VENDOR_ID);
    this.selectedVendorId = event.value;
    if (event.value === AppConstant.NULL_VALUE || event.value === AppConstant.UNDEFINED_VALUE) {
      this.approvalUserList.data = [];
      this.clearItemDetailTableData();
      this.adHocWorkflowDetails.controls = [];
      this.addAdHocWorkflowDetail();
      if (this.createEInvoiceForm.get(AppFormConstants.PROJECT_CODE_ID).value){
        this.itemCostDistributionForms.controls[0].get('projectId').patchValue(this.previousProjectCodeId);
      }
    }
    if (event.value !== AppConstant.ZERO && event.value) {
      this.approvalUserList.data = [];
      this.adHocWorkflowDetails.controls = [];
      this.clearItemDetailTableData();
      this.initApprover();
      this.getVendorItemList(event.value);
      this.ifVendorIsConfidentialGetApprovalUserList(this.approvalUserList, event.value);
      if(this.createEInvoiceForm.get(AppFormConstants.PROJECT_CODE_ID).value){
        this.itemCostDistributionForms.controls[0].get('projectId').patchValue(this.previousProjectCodeId);
      }
    }
    this.vendorChanged(event.value, true, null);
  }

  /**
   * this method trigger change the vendor dropdown
   */
  clearItemDetailTableData() {
    this.itemCostDistributionForms.clear();
    const tempLineItemAdditionalData = this.additionalFieldLineItemDetails;
    this.additionalFieldLineItemDetails = [];
    this.vendorRelevantItemList = new DropdownDto();
    this.additionalFieldLineItemDetails = tempLineItemAdditionalData;
    for (let i = 0; i < 10; i++) {
      this.addItemOnClick();
    }
    this.getVendorItemList(this.selectedVendorId);
  }


  /**
   * this method used to get vendor related item list
   */
  getVendorItemList(selectedVendorId) {
    if (selectedVendorId) {
      this.billsService.getItemListByVendorId(selectedVendorId, !this.editView).subscribe((res: any) => {
        this.vendorRelevantItemList.data = res.body;
      });
    }
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
   * this method patch data to line items
   */
  applyRule(rule) {
    if (this.sectionId === AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID) {
      this.expenseCostDistributionForms.controls[this.lineItemIndex].get('accountId').patchValue(rule.id);
      this.expenseCostDistributionForms.controls[this.lineItemIndex].get(AppFormConstants.ACCOUNT_CHANGED).patchValue(true);
      this.getAccountNameForExpenseContributionTable(rule.id, this.lineItemIndex);
      this.overlayPanel.hide();
    }
  }

  /**
   * this method can be used to navigate automation creation
   */
  addNewRule() {
    const rule: any = {};
    this.isAddRue = true;
    rule.sectionId = this.sectionId;
    rule.isConfigureRule = true;
    this.sectionId === AppModuleSection.ITEM_COST_DISTRIBUTION_SECTION_ID ? rule.eventId = AppConstant.EVENT_ITEM_LINE_DESCRIPTION_ID : null;
    this.sectionId === AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID ? rule.eventId = AppConstant.EVENT_EXPENSE_LINE_DESCRIPTION_ID : null;
    if (this.sectionId === AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID) {
      rule.description = this.expenseCostDistributionForms.controls[this.lineItemIndex].get('description').value;
      rule.dropDownSelectionId = this.expenseCostDistributionForms.controls[this.lineItemIndex].get('accountId').value;
    }
    this.automationService.automationRule.next(rule);
  }

  /**
   * Check the Remaining Ceiling with and bill amount
   * Then Returns the boolean to show or hide the warning message
   */
  showPopUp(): boolean {
    const poId = this.createEInvoiceForm.get(AppFormConstants.PO_ID).value;
    const remainingCeiling = this.createEInvoiceForm.get(AppFormConstants.REMAINING_PO_CEILING).value;
    const amount = this.createEInvoiceForm.get(AppFormConstants.BILL_AMOUNT).value;

    if (this.isVisibleNotificationContent === false || !poId) {
      return false;
    }

    if (remainingCeiling === 0 || remainingCeiling < amount) {
      this.isVisibleNotificationContent = true;
      return true;
    }
  }

  /**
   * this message used for view message
   */
  showMsg() {
    if (this.isClosedPoInDraft) {
      return HttpResponseMessage.CLOSED_SELECTED_PO;
    } else {
      return this.appConstant.EXCEED_BIlL_AMOUNT;
    }
  }

  /**
   * This method can be used to validate from events
   * @param value to selected row value
   */
  validateButton(value) {
    return value != null || value != undefined ? this.isEnabledSubmitForApprovalButton = true : this.isEnabledSubmitForApprovalButton = false;
  }

  /**
   * This method can be used to validate from events
   */
  validateButtonOnChangeAddOption() {
    if (!(this.editView || this.isOverrideData)) {
      return;
    } else {
      this.isEnabledSubmitForApprovalButton = this.adHocWorkflowDetails.controls.filter(x =>
        ((x.get('approvalUser').value != null) || (x.get('approvalGroup').value != null)) &&
        x.get('completed').value === false).length > AppConstant.ZERO;
    }
  }

  // Changes with draft


  /**
   * Enabled button submit bill as approved
   */
  isSubmitForApprovedButtonEnabled() {
    return (this.privilegeService.isAuthorized(this.appAuthorities.BILL_CREATE) || this.isSubmissionWorkFlow)
      && !this.isSaveAsApprovedWorkFlow && ((this.billStatus == this.enums.STATUS_APPROVED &&
        this.isEnabledSubmitForApprovalButton) || !this.editView);
  }

  /**
   * Enabled button save bill as approved
   */
  isSaveAsApprovedButtonEnabled() {
    return (this.privilegeService.isAuthorized(this.appAuthorities.BILL_SAVE_AS_APPROVED) || this.isSaveAsApprovedWorkFlow)
      && !this.isSubmissionWorkFlow && (this.billStatus == this.enums.STATUS_REJECT || !this.editView) ||
      (this.billStatus == this.enums.STATUS_PENDING && this.editView && !this.isEnabledSubmitForApprovalButton);
  }

  /**
   * Enabled button save or resubmit
   */
  isSaveOrResubmitButtonEnabled() {
    return this.editView && ((this.billStatus == this.enums.STATUS_PENDING && this.isEnabledSubmitForApprovalButton) ||
        (this.billStatus == this.enums.STATUS_APPROVED && !this.isEnabledSubmitForApprovalButton)) ||
      this.billStatus == this.enums.STATUS_REJECT;
  }

  /**
   * this method can be used loading
   */
  loadingButton() {
    return (this.isLoading || this.isLoadingSaveAsApproved || this.isSaveLoading || this.isSaveAsDraft || this.isClosedPoInDraft);
  }

  /**
   * is save as draft button available
   */
  isSaveAsDraftEnabled() {
    return (this.billStatus === this.enums.STATUS_DRAFT && this.editView) || !(this.billStatus && this.editView) && !this.fromRecurringBill;
  }

  /**
   * is save as approved button available
   */
  isSaveAsApprovedAllowsForDraft() {
    return (this.privilegeService.isAuthorized(this.appAuthorities.BILL_SAVE_AS_APPROVED) || this.isSaveAsApprovedWorkFlow)
      && !this.isSubmissionWorkFlow && (this.billStatus == this.enums.STATUS_DRAFT && this.editView && !this.fromRecurringBill && !this.isEnabledSubmitForApprovalButton);
  }

  /**
   * is submit for approval button available
   */

  isSubmitForApprovalAllowsForDraft() {
    return (this.privilegeService.isAuthorized(this.appAuthorities.BILL_CREATE) || this.isSubmissionWorkFlow)
      && !this.isSaveAsApprovedWorkFlow && (this.billStatus == this.enums.STATUS_DRAFT && this.editView && !this.fromRecurringBill);
  }


  /**
   * This method can be used to save document as draft
   * @param value to expense form value
   */
  saveAsDraft(value) {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.SAVE_AS_DRAFT,
      AppAnalyticsConstants.MODULE_NAME_BILL,
      AppAnalyticsConstants.SAVE_AS_DRAFT,
      AppAnalyticsConstants.CREATE_SCREEN
    );
    this.isSaveAsDraft = true;
    if (!this.createEInvoiceForm.get('vendorId').value || !this.createEInvoiceForm.get('billNo').value) {
      if (!this.createEInvoiceForm.get('vendorId').value) {
        this.createEInvoiceForm.get('vendorId').markAsDirty();
      }
      if (!this.createEInvoiceForm.get('billNo').value) {
        this.createEInvoiceForm.get('billNo').markAsDirty();
      }
      this.isSaveAsDraft = false;
      return;
    } else {
      this.saveDraft();
    }
  }

  /**
   * This method used for save po as draft
   */
  saveDraft() {
    let billMst: BillMasterDto;
    billMst = this.createEInvoiceForm.getRawValue();
    billMst.additionalData = this.commonUtil.formatMultisetValues(billMst.additionalData);
    billMst.billItemCostDistributions = this.commonUtil.formatMultisetLineValues(billMst.billItemCostDistributions);
    billMst.billExpenseCostDistributions = this.commonUtil.formatMultisetLineValues(billMst.billExpenseCostDistributions);
    const billDate = this.createEInvoiceForm.get('billDate').value;
    if (billDate) {
      billMst.billDate = billDate.toLocaleDateString();
    }
    this.setAttachment(billMst);
    this.billsService.saveBillAsDraft(billMst, this.editView, this.isOverrideData).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.editView ? this.notificationService.successMessage(HttpResponseMessage.DRAFT_UPDATED_SUCCESSFULLY) :
          this.notificationService.successMessage(HttpResponseMessage.DRAFT_SAVED_SUCCESSFULLY);
        this.resetEInvoiceForm(false);
        this.closeEInvoiceCreateMode();
        this.isSaveAsDraft = false;
      } else {
        this.isSaveAsDraft = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.isSaveAsDraft = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used for set attachment to request object
   * @param billMasterDto to bill master object
   */
  setAttachment(billMasterDto) {
    const existingAttachments = [];
    const existingAdditionalFieldAttachments = [];
    this.existingAttachments?.forEach(value => {
      if (value.fieldId) {
        existingAdditionalFieldAttachments.push(value);
      } else {
        existingAttachments.push(value);
      }
    });

    billMasterDto.existingAttachments = [];
    billMasterDto.existingAttachments = existingAttachments;

    billMasterDto.existingAdditionalFieldAttachments = [];
    billMasterDto.existingAdditionalFieldAttachments = existingAdditionalFieldAttachments;

    billMasterDto.attachments = this.attachments;
  }

  /**
   * This method can be used to get available draft id
   */
  getAvailableDraftId() {
    const vendorId = this.createEInvoiceForm.get('vendorId').value;
    const billNumber = this.createEInvoiceForm.get('billNo').value;
    if (!(isNotNullOrUndefined(billNumber) && isNotNullOrUndefined(vendorId)) || this.editView || this.fromRecurringBill) {
      return;
    } else {
      this.billsService.getAvailableDraftIdByBillNumber(billNumber, vendorId).subscribe(async (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.isDraftNameAvailable = (isNotNullOrUndefined(res.body) && (this.billStatus !==
            this.enums.STATUS_DRAFT || this.isOverrideData));
          return this.draftId = res.body;
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to override values from created draft
   */
  overrideDraftValuesToForm() {
    if (!isNotNullOrUndefined(this.draftId)) {
      this.isOverrideData = false;
      return;
    } else {
      this.confirmationService.confirm({
        message: 'Your changes will not be saved',
        key: 'createBillDraftOverrideConfirmation',
        accept: () => {
          this.dtaOverrideFromDraft();
        }
      });
    }
  }

  /**
   * this method get draft related data and patch to the form
   */
  dtaOverrideFromDraft() {
    this.isOverrideData = true;
    this.billId = this.draftId;
    this.resetEInvoiceForm(false);
  }

  /**
   * this method can be used to get user available draft list
   * this function call from onInit() method
   */
  getAvailableDraftList() {
    if (this.editView) {
      return;
    }
    this.billsService.getUserAvailableDraftList().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.userAvailableDraftList = res.body;
        this.isShowDraftListPopUp = (this.userAvailableDraftList.length > this.appConstant.ZERO
          && this.billUtility.showBillDraftListByDefault &&
          (this.billStatus !== this.enums.STATUS_DRAFT));
      } else {
        this.isShowDraftListPopUp = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.isShowDraftListPopUp = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method used for manage condition of view draft list popup
   */
  showAvailableDraftListPopUp() {
    this.billUtility.getBillDraftListState();
    setTimeout(() => {
      this.getAvailableDraftList();
    }, 1000);
  }

  receiptToLineItem() {
    if (this.createEInvoiceForm.get('receiptId').value) {
      this.billUtility.headerPORecipeSelectionValueToLineLevel(this.createEInvoiceForm.get('receiptId').value,
        this.expenseCostDistributionForms, this.itemCostDistributionForms);
    }
  }


  getDescriptionWiseAccItem(i: any, section) {
    this.memoriseItemAcc.getDescriptionWiseAccItem(i, section, this.expenseCostDistributionForms,
      this.itemCostDistributionForms, 'BILL').then((value: any) => {
      if (!value) {
        return;
      }
      if (this.itemCostDistributionForms.controls[i].get(AppFormConstants.ACCOUNT_CHANGED).value) {
        return;
      }

      if (section == AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID) {
        this.receiptToLineItem();
      } else {
        if (!value.id) {
          return;
        }
        this.getItemRelatedSku(this.selectedVendorId, value.id, i);
        this.receiptToLineItem();
      }
    });
  }

  /**
   * This function execute when change the po
   * This function used for is
   * @param value to po id
   * @param selectedPoName
   */
  changePO(value, selectedPoName) {
    this.billUtility.getMatchingTableData(this.createEInvoiceForm, this.expenseCostDistributionForms, this.itemCostDistributionForms);
    this.commonUtil.isPressEnterInsideDropdown(selectedPoName);
    if (!isNotNullOrUndefined(value)) {
      this.isClosedPoInDraft = false;
    }
    this.billUtility.getProjectCodeByPo(value, this.createEInvoiceForm).then(() => {
      this.automationService.setAutomationData(this.createEInvoiceForm, null, [AppFormConstants.PO_ID, AppFormConstants.PROJECT_CODE_ID]);
    });
  }

  get bill() {
    return this.createEInvoiceForm.controls;
  }

  /**
   * this method can be used to clear expense lines
   */
  clearExpenseLines() {
    const expenseTableLength: number = this.expenseCostDistributionForms.length;
    while (this.expenseCostDistributionForms.length !== AppConstant.ZERO) {
      this.expenseCostDistributionForms.removeAt(AppConstant.ZERO);
    }
    for (let i = AppConstant.ZERO; i < expenseTableLength; i++) {
      this.addExpenseFieldOnClick();
    }
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER)
  }

  /**
   * this method can be used to clear item lines
   */
  clearItemLines() {
    const itemTableLength: number = this.itemCostDistributionForms.length;
    while (this.itemCostDistributionForms.length !== AppConstant.ZERO) {
      this.itemCostDistributionForms.removeAt(AppConstant.ZERO);
    }
    for (let i = AppConstant.ZERO; i < itemTableLength; i++) {
      this.addItemOnClick();
    }
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER)
  }

  /**
   * this method can be used to view receipt modal as conditionally
   * @param value to po receipt ids
   */
  viewPoReceiptAttachment(value) {
    this.receiptAttachments = [];
    if (this.createEInvoiceForm.get('receiptId').value) {
      this.receiptAttachments.push(value);
    } else {
      this.receiptAttachments = value;
    }
    this.isViewReceiptView = this.receiptAttachments.length > AppConstant.ZERO;
  }

  /**
   * this method can be used to get active customer invoice list
   */
  getCustomerInvoiceList() {
    this.billsService.getCustomerUserList().subscribe((res: any) => {
      this.customerInvoiceList.data = res.body;
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
      this.createEInvoiceForm.get('customerInvoiceId').reset();
    } else {
      this.isCreateInvoice = false;
    }
  }

  pressEscKey() {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.isBillList.emit();
      }
    });
  }

  ngOnDestroy(): void {
    this.fieldSubscription.unsubscribe();
    this.automationService.cleanupListeners();
  }

  changeHeaderProjectCode(dpNameProjectTask) {
    this.automationService.setAutomationData(this.createEInvoiceForm, AppFormConstants.PROJECT_CODE_ID);
    this.billUtility.patchProjectTaskToLine(this.expenseCostDistributionForms, this.itemCostDistributionForms, dpNameProjectTask.selectedOption.id);
    this.billUtility.loadAccountsAccordingToTheProjectTaskId(this.createEInvoiceForm.get('projectCodeId').value, null, !this.editView, this.billId, false, true);
    this.billUtility.clearAccountWhenClearHeaderProjectTask(this.expenseCostDistributionForms);
    this.commonUtil.isPressEnterInsideDropdown(dpNameProjectTask);
  }

  changeHeaderPoReceipt(selectedItemRef) {
    this.automationService.setAutomationData(this.createEInvoiceForm, AppFormConstants.PO_RECEIPT_ID);
    this.billUtility.getPoReceiptNumberById(this.createEInvoiceForm.get('receiptId').value,
      null, false, this.expenseCostDistributionForms, this.itemCostDistributionForms);
    this.billUtility.ifClearHeaderLevelReceiptCLearLineLevelReceiptValue(this.createEInvoiceForm.get('receiptId').value,
      this.expenseCostDistributionForms, this.itemCostDistributionForms);
    this.billUtility.getMatchingTableData(this.createEInvoiceForm,
      this.expenseCostDistributionForms, this.itemCostDistributionForms);
    this.commonUtil.isPressEnterInsideDropdown(selectedItemRef);
  }

  billDateChanged() {
    this.automationService.setAutomationData(this.createEInvoiceForm, AppFormConstants.BILL_DATE);
  }

  changeHeaderDepartment(dpNameDepartment: Dropdown) {
    this.automationService.setAutomationData(this.createEInvoiceForm, AppFormConstants.DEPARTMENT_ID);
    this.commonUtil.patchHeaderDepartmentToLineLevel(this.createEInvoiceForm, -1, this.editView, null, true, true);
    this.commonUtil.isPressEnterInsideDropdown(dpNameDepartment);
  }

  accountChangedExpTable(code: Dropdown, account: any, i) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    this.billUtility.loadAccountsAccordingToTheProjectTaskId(code.selectedOption.id, i, !this.editView, this.billId);
    this.billUtility.clearLineLevelAccountWhenClearProjectTask(account);
    this.commonUtil.isPressEnterInsideDropdown(code);
  }

  departmentChangedExp(dpNameDepartmentAccount: Dropdown) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    this.commonUtil.isPressEnterInsideDropdown(dpNameDepartmentAccount);
  }

  amountChanged() {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
  }

  itemChangedItm(dpNameProductId: Dropdown, i: any) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    this.commonUtil.patchSKU(this.itemCostDistributionForms.controls[i].get('vendorItemNumber'), this.itemCostDistributionForms.controls[i].get('rate'), dpNameProductId.selectedOption.sku, dpNameProductId.selectedOption.itemCost);
    this.getItemName(dpNameProductId.selectedOption.id, i);
    this.changeItemList(dpNameProductId.selectedOption.id, i);
    this.billUtility.getMatchingTableData(this.createEInvoiceForm, this.expenseCostDistributionForms, this.itemCostDistributionForms);
  }

  changedDepartment(dpNameDepartmentItem: Dropdown) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    this.commonUtil.isPressEnterInsideDropdown(dpNameDepartmentItem)
  }

  projectChangedItm(code: Dropdown) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    this.commonUtil.isPressEnterInsideDropdown(code);
  }

  getRuleConfiguration(i, type) {
    let description: any;
    this.lineItemIndex = null;
    this.lineItemIndex = i;
    if (type === AppConstant.EXPENSE_COST_DISTRIBUTION_STR) {
      description = this.expenseCostDistributionForms.controls[i].get(AppConstant.DESCRIPTION_CONTROLLER).value;
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
          this.overlayPanel.show(new MouseEvent('click'), document.getElementById('expenseDescription' + this.lineItemIndex));
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
}
