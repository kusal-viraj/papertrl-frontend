import {
  Component, ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import {
  AbstractControl, FormArray,
  FormGroup,
  UntypedFormArray,
  UntypedFormBuilder,
  Validators
} from '@angular/forms';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {DataFormat} from '../../../shared/utility/data-format';
import {BillSubmitInvoiceListDto} from '../../../shared/dto/bill/bill-submit-invoice-list-dto';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {BillMasterDto} from '../../../shared/dto/bill/bill-master-dto';
import {OverlayPanel} from 'primeng/overlaypanel';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {BillUtility} from '../bill-utility';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PoApprovalDto} from '../../../shared/dto/po/po-approval-dto';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {Subscription} from 'rxjs';
import {MemoriseItemAcc} from '../../common/memorise-item-acc';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {Router} from '@angular/router';
import {BillSubmitService} from '../../../shared/services/bills/bill-submit.service';
import {BillApprovalsService} from '../../../shared/services/bills/bill-approvals.service';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {ConfirmationService} from 'primeng/api';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {BillPaymentService} from '../../../shared/services/bill-payment-service/bill-payment.service';
import {CreditNoteService} from '../../../shared/services/credit-note/credit-note.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {DomSanitizer} from '@angular/platform-browser';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {PoService} from '../../../shared/services/po/po.service';
import {BillSocketService} from '../../../shared/services/bills/bill-socket.service';
import {ManageDrawerService} from '../../../shared/services/common/manage-drawer-status/manage-drawer.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppDocuments} from '../../../shared/enums/app-documents';
import {AppInvoiceColors} from '../../../shared/enums/app-invoice-colors';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';
import {AppMessageService} from '../../../shared/enums/app-message-service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {BillLineLevelPoReceiptDto} from '../../../shared/dto/bill/bill-line-level-po-receipt-dto';
import {Dropdown} from 'primeng/dropdown';
import {ManageFeatureService} from '../../../shared/services/settings/manage-feature/manage-feature.service';
import {MandatoryFields} from '../../../shared/utility/mandatory-fields';
import {SetFieldValueDto} from '../../../shared/dto/automation/set-field-value-dto';
import {CustomLineItemGrid} from '../../../shared/utility/custom-line-item-grid';
import {GridService} from "../../../shared/services/common/table/grid.service";
import {AppTableKeysData} from "../../../shared/enums/app-table-keys-data";
import {AccountNumberPopulationLineLevel} from "../../../shared/utility/account-number-population-line-level";

@Component({
  selector: 'app-edit-process-bill',
  templateUrl: './edit-process-bill.component.html',
  styleUrls: ['./edit-process-bill.component.scss']
})
export class EditProcessBillComponent extends MandatoryFields implements OnInit, OnDestroy {
  reviewBillDetailsForm: FormGroup;
  public smallHorSplitter = false;
  public isEditDraft = false;
  public screenSize: any;
  public responsiveSize;
  public vendorList: DropdownDto = new DropdownDto();
  public poList: DropdownDto = new DropdownDto();
  public templateList: DropdownDto = new DropdownDto();
  public termList: DropdownDto = new DropdownDto();
  public customerInvoiceList: DropdownDto = new DropdownDto();
  public dateFormat = new DataFormat();
  public dateFormatList: DropdownDto = new DropdownDto();
  public approveUsersList: DropdownDto = new DropdownDto();
  public approvalGroupList: DropdownDto = new DropdownDto();
  public itemList: DropdownDto = new DropdownDto();
  public projectCodeList: DropdownDto = new DropdownDto();
  public accountList: DropdownDto = new DropdownDto();
  public vendorRelevantItemList: DropdownDto = new DropdownDto();
  public itemRelatedVendorItems: DropdownDto = new DropdownDto();
  public billList: BillSubmitInvoiceListDto[] = [];
  public billListCopy: BillSubmitInvoiceListDto[] = [];
  public removeSpace: RemoveSpace = new RemoveSpace();
  public enums = AppEnumConstants;
  public appFieldType = AppFieldType;
  public billDetail: BillMasterDto = new BillMasterDto();
  public document = document;

  @Output() navigateToList = new EventEmitter();
  @Output() isCloseSubmissionView = new EventEmitter();
  @Output() isShowSubmissionView = new EventEmitter();
  @Output() isSuccessEditAction = new EventEmitter();
  @Input() isEditBill = false;
  @Input() isDraft = false;
  @Input() billIdFromList: any;
  @ViewChild('overlayPanel') public overlayPanel: OverlayPanel;
  @ViewChild('selectedVendorName') public selectedVendorName: Dropdown;

  public additionalFieldResponse: AdditionalFieldDetailDto[] = [];
  public headerAdditionalFieldDetails: AdditionalFieldDetailDto[] = [];
  public additionalFieldForExpenseCostDistributions: AdditionalFieldDetailDto[] = [];
  public additionalFieldForItemCostDistributions: AdditionalFieldDetailDto[] = [];
  public billAttachments: any [] = [];
  public skuDropDownList: DropdownDto [] = [];
  public selectedAdditionalField: AdditionalFieldDetailDto;
  public addNewDropDown = false;
  public isAvailableAwaitingApproval = false;
  public appConstant: AppConstant = new AppConstant();
  public ruleListForItem: DropdownDto [] = [];
  public ruleListForExpense: DropdownDto [] = [];
  public ruleDetails: any [] = [];
  public previousAdHocWorkflowDetails: any [] = [];
  public matchingTableValues: any [] = [];
  public itemPoReceiptIdList: any = [0];
  public matchingTableRowValue: any = {};
  public billUtility: BillUtility = new BillUtility(this.billPaymentService, this.notificationService,
    this.privilegeService, this.creditNoteService, this.billsService, this.sanitizer, this.drawerService);

  public accountNumPopulationLines: AccountNumberPopulationLineLevel = new AccountNumberPopulationLineLevel(
    this.billsService, this.notificationService
  );

  public isSubmissionWorkFlow = false;
  public isSaveAsApprovedWorkFlow = false;
  public isWorkflowConfigAvailable = false;
  public disabledButton = false;

  public poNumber: any;
  public poStatus: any;
  public fileName: any;
  public currentIndex = 0;
  public currentIndexHover: any;
  public addNewVendor: boolean;
  public addNewTemplate = false;
  public templateDetailView = false;
  public billUrl: any;
  public originalFileName: string;
  public isLoading: boolean;
  public isValidDate = true;
  public billMasterDto: BillMasterDto = new BillMasterDto();
  public receiptList: DropdownDto = new DropdownDto();
  public vendorId: number;
  public templateId: number;
  public isViewOtherTermFields: boolean;
  public dueDate: any;
  public createdBy: string;
  public attachmentId: string;
  public billId: any;
  public isBill = false;
  public isValidDiscountDate = false;
  public isAddNewAccount = false;
  public isAddNewProjectCodes = false;
  public isAddNewItem = false;
  public isAddNewUser = false;
  public matchingAutomation: any;
  public addNewItemOverlay: boolean;
  public isLoadingSaveAsApproved: boolean;
  public isSaveLoading: boolean;
  public appAuthorities = AppAuthorities;
  public updatedProjectCodeList: DropdownDto = new DropdownDto();
  public isPoAttachmentShown = false;
  public poUrl: any;
  public showPoLineItemsByDefault;
  public showPoLineItems = false;
  public poDetail = new PoApprovalDto();
  public selectedPoLineItems = [];
  public selectedPoAccountDetails = [];
  public commonUtil = new CommonUtility();
  public appFormConstants = AppFormConstants;
  public departmentPanel: boolean;
  public department: DropdownDto = new DropdownDto();
  public isProgressEnabled: boolean;
  public isDataFetching = false;
  public subscription: Subscription = new Subscription();
  public fieldSubscription: Subscription = new Subscription();
  public selectedVendorId: any;
  public sectionId: any;
  public lineItemIndex: any;
  public isAddRue = false;
  public isVisibleNotificationContent = null;
  public billStatus: any;
  public isEnabledSubmitForApprovalButton = false;
  public isSubmitted = false;
  public poReceiptUrl: any;
  public poReceiptNumber: any;
  public isViewMatchingTable = false;
  public isProgressViewReceipt = false;
  public dataFetching = false;
  public memoriseItemAcc: MemoriseItemAcc;
  public appModuleSection = AppModuleSection;
  public isUploadScreen = false;
  public isLoadingBillAttachment = false;
  public activeClassOfAttachmentDiv = false;
  public isCreateInvoice = false;
  previousDepartmentId;
  previousProjectCodeId;
  departmentChangeFromAutomation = false;
  projectCodeChangeFromAutomation = false;


  // bill draft changes
  public isSaveAsDraft: boolean;
  public isOverrideData: boolean;
  public isClosedPoInDraft: boolean;
  public hasVerticalScrollbar = false;
  public isViewReceiptView = false;
  public isClickOnBill = false;
  public receiptAttachments: any [] = [];
  public setFieldValueDto: SetFieldValueDto = new SetFieldValueDto();
  public customLineItemGrid = new CustomLineItemGrid(this.gridService);
  public tableKeyEnum = AppTableKeysData;
  constructor(public router: Router, public formBuilder: UntypedFormBuilder, public billSubmitService: BillSubmitService,
              public billApprovalsService: BillApprovalsService, public additionalFieldService: AdditionalFieldService,
              public confirmationService: ConfirmationService, public notificationService: NotificationService,
              public automationService: AutomationService, public billPaymentService: BillPaymentService,
              public creditNoteService: CreditNoteService, public manageFeatureService: ManageFeatureService,
              public privilegeService: PrivilegeService, public sanitizer: DomSanitizer, public billsService: BillsService,
              public poService: PoService, private billSocketService: BillSocketService, public drawerService: ManageDrawerService,
              private renderer: Renderer2, private el: ElementRef, private gridService: GridService) {
    super(additionalFieldService, notificationService);
    this.billsService.getDefaultPoDrawerState(AppConstant.BILL_PO_LIST_MODAL).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.showPoLineItemsByDefault = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  ngOnDestroy(): void {
    setTimeout(() => {
      this.subscription.unsubscribe();
      this.fieldSubscription.unsubscribe();
      this.automationService.cleanupListeners();
      this.billSocketService.configBillWebSocketConnection(false);
      this.billSocketService.disconnect();
    }, 2000);
  }

  clearAutomation() {
    this.matchingAutomation = null;
    this.isSubmissionWorkFlow = false;
    this.isSaveAsApprovedWorkFlow = false;
    this.isWorkflowConfigAvailable = false;
  }

  setDocumentEvent() {
    let event = AppDocuments.DOCUMENT_EVENT_SUBMITTED;
    if (this.isEditBill && this.reviewBillDetailsForm.get('status').value !== this.enums.STATUS_DRAFT) {
      event = AppDocuments.DOCUMENT_EVENT_EDIT;
    }
    if (this.reviewBillDetailsForm.get('status').value === this.enums.STATUS_REJECT) {
      event = AppDocuments.DOCUMENT_EVENT_EDIT_RESUBMIT;
    }
    this.reviewBillDetailsForm.get('event').patchValue(event);
    this.reviewBillDetailsForm.get(AppFormConstants.PATCH_SET_FIELD_FULL_OBJECT).patchValue(true);
    this.reviewBillDetailsForm.get('fromProcessBill').setValue(true);
  }

  ngOnInit(): void {
    if (window.innerWidth < 991) {
      this.responsiveSize = '90%';
    } else if (window.innerWidth === 1366) {
      this.responsiveSize = '62%';
    } else {
      this.responsiveSize = '60%';
    }
    this.reviewBillDetailsForm = this.formBuilder.group({
      vendorId: [null, Validators.required],
      templateId: [],
      poId: [],
      receiptId: [null],
      billNo: [null, Validators.compose([Validators.required, Validators.maxLength(50)])],
      billDateFormat: [null, Validators.required],
      billDateStr: [null, Validators.required],
      billAmount: [null, Validators.required],
      term: [null, Validators.required],
      dueDate: [],
      remark: [],
      netDaysDue: [null],
      discountPercentage: [],
      discountDaysDue: [],
      id: [],
      departmentId: [null],
      payWhenCustomerPay: [null],
      customerInvoiceId: [null],
      billAttachmentId: [],
      remainingCeling: [],
      remainingPoCeiling: [null],
      status: [null],
      remainingVariance: [null],
      poPriceVariance: [],
      dueDateStr: [],
      focusListener: [],
      accountPeriodMonth: [null],
      accountPeriodYear: [null],
      closePo: [false],
      patchSetFieldFullObject: [false],
      isSelectedBill: [null],
      billExpenseCostDistributions: this.formBuilder.array([]),
      billItemCostDistributions: this.formBuilder.array([]),
      adHocWorkflowDetails: this.formBuilder.array([]),
      event: [],
      billAttachmentName: [],
      attachment: [],
      distributionCostTotal: [null],
      projectCodeId: [null],
      additionalData: this.formBuilder.array([]),
      fromProcessBill: [true]
    });
    this.reviewBillDetailsForm.get(AppFormConstants.PO_ID).valueChanges.subscribe(() => this.poChanged());
    this.reviewBillDetailsForm.get(AppFormConstants.BILL_DATE_STR).valueChanges.subscribe(data => this.getDueDate(data, false, false, false));
    this.reviewBillDetailsForm.get(AppFormConstants.TERM).valueChanges.subscribe(data => this.getDueDate(data, true, false, false));
    // this.reviewBillDetailsForm.get(AppFormConstants.NET_DAYS_DUE).valueChanges.subscribe(data => this.getDueDate(data, false));
    this.memoriseItemAcc = new MemoriseItemAcc(this.manageFeatureService, this.reviewBillDetailsForm, this.billsService, this.expenseFields, this.itemForm);
    this.getProjectTaskList(this.projectCodeList);
    this.getAccounts(this.accountList);
    this.resetReviewBillDetailsForm(false);
    this.getVendorList();
    this.getPaymentTerms();
    this.getDateFormats();
    this.getApprovalGroupList();
    this.getDepartment();
    this.getCustomerInvoiceList();
    this.templateList.addNew();
    this.getRequiredFields(this.reviewBillDetailsForm, AppDocumentType.BILL);
    this.subscription = this.billSocketService.behaviorSubject.subscribe(
      (val: any) => {
        this.checkOcrStatus(val);
      },
      err => console.error('Socket Error' + err)
    );

    this.reviewBillDetailsForm.get(AppFormConstants.DEPARTMENT_ID).valueChanges.subscribe((value) => {
      if (value !== this.previousDepartmentId) {
        if (value && this.departmentChangeFromAutomation){
          this.commonUtil.patchHeaderLevelDepartmentAndProjectCodeLineLevel(AppFormConstants.DEPARTMENT_ID, value);
        }
        this.previousDepartmentId = this.reviewBillDetailsForm.get(AppFormConstants.DEPARTMENT_ID).value;
      }
    });

    this.reviewBillDetailsForm.get(AppFormConstants.PROJECT_CODE_ID).valueChanges.subscribe((value) => {
      if (value !== this.previousProjectCodeId) {
        if (value && this.projectCodeChangeFromAutomation){
          this.commonUtil.patchHeaderLevelDepartmentAndProjectCodeLineLevel(AppFormConstants.PROJECT_CODE_ID, value);
        }
        this.previousProjectCodeId = this.reviewBillDetailsForm.get(AppFormConstants.PROJECT_CODE_ID).value;
      }
    });

    this.fieldSubscription = this.automationService.updateFocusListeners.subscribe(value => {
      if (value === AppFormConstants.FOCUS_LISTENER) {
        this.departmentChangeFromAutomation = true;
        this.projectCodeChangeFromAutomation = true;
      }
      if (value && value.automationMst){
        this.matchingAutomation = value.automationMst.automationWorkflowConfigs;
        this.isSubmissionWorkFlow = !value.automationMst.saveAsApprovedEnabled;
        this.isSaveAsApprovedWorkFlow = value.automationMst.saveAsApprovedEnabled;
        this.isWorkflowConfigAvailable = value.automationMst.workflowConfigAvailable;
      } else if (value !== AppFormConstants.FOCUS_LISTENER){
        this.clearAutomation();
      }
    });

  }

  getIsAvailableScrollInAttachment() {
    if (window.innerWidth <= 1366) {
      this.billList.length >= 5 ? this.activeClassOfAttachmentDiv = true : this.activeClassOfAttachmentDiv = false;
    } else {
      this.billList.length >= 7 ? this.activeClassOfAttachmentDiv = true : this.activeClassOfAttachmentDiv = false;
    }
  }

  /**
   * Check Ocr Status from Socket
   * to update the status of bill list
   * @param billList from socket
   */
  checkOcrStatus(billList) {
    this.billList.forEach(value => {
      billList.forEach((value1) => {
        if (value.id === value1.id) {
          value.ocrRunningStatus = value1.ocrrunningStatus;
          if (value1.detectionLevel) {
            value.status = value1.detectionLevel;
          }
          if (this.billId === value.id && this.isDataFetching) {
            this.isDataFetching = false;
            this.billSelected(value);
          }
        }
      });
    });
  }

  /**
   * this method can be used to get invoice pdf color
   * @param status to detection status
   * @param bill to un submitted bill list object
   */
  invoiceColors(status, bill) {
    if (bill.ocrRunningStatus === AppEnumConstants.STATUS_NOT_PROCESSED) {
      return AppInvoiceColors.NO_MATCH;
    }
    switch (status) {
      case 'F':
        return AppInvoiceColors.FULL_MATCH;
      case 'P':
        return AppInvoiceColors.HALF_MATCH;
      case 'N':
        return AppInvoiceColors.NO_MATCH;
    }
  }

  getDepartment() {
    this.billsService.getDepartment().subscribe((res: any) => {
      this.department.data = res.body;
    });
  }

  /**
   * this method can be used to get default bill date format
   */
  getDefaultBillDateFormat() {
    this.billSubmitService.getDefaultDateFormat().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        if (!this.reviewBillDetailsForm.get('billDateFormat').value) {
          this.reviewBillDetailsForm.get('billDateFormat').patchValue(res.body.message);
        }
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error1 => {
      this.notificationService.errorMessage(error1);
    });
  }

  /**
   * this method can be used to  when close modal refresh the component
   */

  refreshComponent() {
    this.navigateToList.emit();
    this.getIsAvailableScrollInAttachment();
  }

  /**
   * This method use to get vendor's bills
   * @param event any
   */
  changedDepartment(event: any, dpNameDepartment) {
    this.commonUtil.isPressEnterInsideDropdown(dpNameDepartment);
    this.automationService.setAutomationData(this.reviewBillDetailsForm, AppFormConstants.DEPARTMENT_ID);
    if (event.value === 0) {
      this.departmentPanel = true;
      this.reviewBillDetailsForm.get('departmentId').reset();
    }
  }

  /**
   * Close Drawer
   */
  close() {
    this.refreshComponent();
  }

  /**
   * Is Splitter Resized End
   */
  splitterResized(event) {
    this.screenSize = window.innerWidth;
    const size = event.split('px');
    return this.smallHorSplitter = !((this.screenSize / 2) > parseInt(size[0]));
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenSize = window.innerWidth;
    if (window.innerWidth < 991) {
      this.responsiveSize = '90%';
    } else {
      this.responsiveSize = '60%';
    }
  }

  @HostListener('window:DOMContentLoaded', ['$event'])
  updatedDOM() {
    const div = document.getElementById('attachment-section-wrapper');
    this.hasVerticalScrollbar = div.scrollHeight > div.clientHeight;
  }

  /**
   * remove added approver
   * @param i to index
   */
  removeApprover(i: number) {
    this.adHocWorkflowDetails.removeAt(i);
    this.validateButtonOnChangeAddOption();
  }

  /**
   * Reset bill submit form
   * @param fromSelectBill recognize emit from bill select function
   */
  resetReviewBillDetailsForm(fromSelectBill) {
    return new Promise<void>(async resolve => {
      this.reviewBillDetailsForm.reset();
      this.additionalFieldForExpenseCostDistributions = [];
      this.additionalFieldForItemCostDistributions = [];
      this.headerAdditionalFieldDetails = [];
      this.vendorRelevantItemList.data = [];
      this.billUtility.matchingTableValues = [];
      this.billUtility.isViewMatchingTable = false;
      this.templateList.data = [];
      this.poList.data = [];
      this.commonUtil.projectCodeChanges = [];
      this.commonUtil.departmentChanges = [];
      this.receiptList.data = [];
      this.headingSectionArray.controls = [];
      this.itemForm.controls = [];
      this.expenseFields.controls = [];
      this.clearAutomation();
      this.automationService.resetSetFieldValueData();
      this.departmentChangeFromAutomation = false;
      this.projectCodeChangeFromAutomation = false;
      if (!fromSelectBill) {
        this.getBillDetailsForEdit();
      } else {
        if (this.billStatus === this.enums.STATUS_DRAFT) {
          this.changeVendorList(this.billDetail.vendorId, false, true);
        }
        this.adHocWorkflowDetails.controls = [];
        if (this.billDetail.adHocWorkflowDetails.length > AppConstant.ZERO) {
          this.billDetail.adHocWorkflowDetails.forEach(() => {
            this.addAdHocWorkflowDetail();
          });
        } else {
          this.addAdHocWorkflowDetail();
        }
        await this.getModuleReheatedAdditionalField(AppDocumentType.BILL, false);
        this.isValidDate = true;
        this.isViewOtherTermFields = false;
      }
      resolve();
    });
  }

  /**
   * This method use for calculate total of cost distributions
   */
  getTotalCostDistribution() {
    let invoiceCostDistributionAmount = 0.00;

    for (const expenseCost of this.expenseFields.controls) {
      if (expenseCost.value.amount) {
        const amt = this.commonUtil.roundNum(expenseCost.value.amount);
        invoiceCostDistributionAmount += amt;
      }
    }
    for (const itemCost of this.itemForm.controls) {
      if (itemCost.value.qty && itemCost.value.rate) {
        let amt = itemCost.value.qty * itemCost.value.rate;
        amt = this.commonUtil.roundNum(amt);
        invoiceCostDistributionAmount += amt;
      }
    }
    this.reviewBillDetailsForm.get('distributionCostTotal').patchValue(invoiceCostDistributionAmount);
    // this.distributionCostTotal = invoiceCostDistributionAmount;
  }

  /**
   * this method can be used to get selected bill data
   * @param bill
   */
  async billSelected(bill) {
    if (this.dataFetching) {
      return;
    }
    const id = bill.id;
    if (this.isDataFetching) {
      if (this.billId !== id) {
        this.isDataFetching = false;
      }
    }
    if (bill?.ocrRunningStatus === this.enums.STATUS_PENDING) {
      this.isDataFetching = true;
    }
    this.dataFetching = true;
    this.billDetail = new BillMasterDto();
    await this.resetReviewBillDetailsForm(true);
    // this.billList[this.currentIndex].status = this.billListCopy[this.currentIndex].status;
    this.billSubmitService.getBillDetail(id, false).then((res: any) => {
      this.dataFetching = false;
      this.billDetail = res.body;
      this.billStatus = res.body.status;
      this.isOverrideData = this.billStatus === AppEnumConstants.STATUS_DRAFT;
      if (res.body.actualBillDateStr) {
        res.body.billDateStr = res.body.actualBillDateStr;
      } else {
        res.body.bilDlate = new Date(res.body.billDate);
      }

      this.itemForm.controls = [];
      this.expenseFields.controls = [];
      this.initItemAccountDetail(res.body.billItemCostDistributions, res.body.billExpenseCostDistributions);

      this.adHocWorkflowDetails.controls = [];
      if (res.body.adHocWorkflowDetails.length > AppConstant.ZERO) {
        res.body.adHocWorkflowDetails.forEach(() => {
          this.addAdHocWorkflowDetail();
        });
      } else {
        this.addAdHocWorkflowDetail();
      }
      this.getDefaultBillDateFormat();
      this.additionalFiledAlign();
      this.clearAutomation();
      this.changeVendorList(res.body.vendorId, false, true);
      this.billUtility.isCheckedPayWhenCustomerPay = this.billDetail.payWhenCustomerPay;
      this.reviewBillDetailsForm.patchValue(this.billDetail);
      this.setDocumentEvent();

      this.billUtility.getMatchingTableData(this.reviewBillDetailsForm, this.expenseFields, this.itemForm);
      this.getRemainingCeiling(res.body.poId, res.body.poNumber);
      if (res.body.deletectionLevel) {
        this.billList[this.currentIndex].status = res.body.deletectionLevel;
      }
      this.getTotalCostDistribution();
      this.getTableRowValues();
      this.validateButtonOnChangeAddOption();
      this.reviewBillDetailsForm.get('dueDate').patchValue(res.body.dueDateStr);
      this.reviewBillDetailsForm.get('id').patchValue(id);
      this.attachmentId = this.reviewBillDetailsForm.get('billAttachmentId').value;
      this.generateBillUrl(false, this.attachmentId);
      if (res.body.templateId) {
        this.getTemplateDetectData(this.billId, res.body.templateId);
      }
      setTimeout(() => {
        this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
      }, 500);
    }).catch(() => this.dataFetching = false);
  }

  /**
   * this method init item account details
   * @param itemDetails to item details
   * @param accountDetails to account details
   */
  async initItemAccountDetail(itemDetails: any [], accountDetails: any []) {
    if (isNotNullOrUndefined(itemDetails) && itemDetails.length > 10) {
      for (let i = AppConstant.ZERO; i < itemDetails.length; i++) {
        this.addItemFieldOnClick();
      }
    } else {
      this.initAddItems();
    }

    if (isNotNullOrUndefined(accountDetails) && accountDetails.length > 10) {
      for (let i = AppConstant.ZERO; i < accountDetails.length; i++) {
        this.addExpenseFieldOnClick();
      }
    } else {
      this.initExpense();
    }
  }

  /**
   * this method can be used to change vendor list
   */
  changeVendorList(id, fromDropDown, fromSelectBill, selectedVendorName?) {
    if (fromDropDown){
      this.commonUtil.isPressEnterInsideDropdown(selectedVendorName);
      this.automationService.setAutomationData(this.reviewBillDetailsForm, AppFormConstants.VENDOR_ID);
    }
    this.selectedVendorId = id;
    try {
      if (id === 0) {
        this.addNewVendor = true;
        setTimeout(() => {
          this.reviewBillDetailsForm.controls.vendorId.reset();
        }, 100);
      } else if (id != null) {
        if (this.reviewBillDetailsForm.get(AppFormConstants.TEMPLATE_ID).value) {
          if (fromDropDown) {
            this.reviewBillDetailsForm.get(AppFormConstants.TEMPLATE_ID).reset();
            this.reviewBillDetailsForm.get(AppFormConstants.PO_ID).reset();
            this.reviewBillDetailsForm.get(AppFormConstants.REMAINING_CELING).reset();
            this.reviewBillDetailsForm.get(AppFormConstants.PO_RECEIPT_ID).reset();
            this.reviewBillDetailsForm.get(AppFormConstants.BILL_NO).reset();
            this.reviewBillDetailsForm.get(AppFormConstants.BILL_DATE_FORMAT).reset();
            this.reviewBillDetailsForm.get(AppFormConstants.BILL_DATE_STR).reset();
            this.reviewBillDetailsForm.get(AppFormConstants.BILL_AMOUNT).reset();
            this.reviewBillDetailsForm.get(AppFormConstants.TERM).reset();
          }
        }
        if (!fromSelectBill) {
          this.clearItemDetailTableData();
        }
        this.getVendorRealtedItems(id);
      }
      if (id === AppConstant.NULL_VALUE || id === AppConstant.UNDEFINED_VALUE || id === 0) {
        this.approveUsersList.data = [];
        this.clearItemDetailTableData();
        this.adHocWorkflowDetails.controls = [];
        this.addAdHocWorkflowDetail();
      }

    } catch (error) {
    }
  }

  getVendorRealtedItems(vendorId) {
    this.selectedVendorId = vendorId;
    this.getVendorRelatedTemplateList(vendorId);
    this.getVendorRelatedPoList(vendorId);
    this.getVendorItemList(vendorId);
    this.approveUsersList.data = [];
    this.getApprovalUserListAccordingToVendorSelection(this.approveUsersList, vendorId);
  }

  /**
   * this method trigger change the vendor dropdown
   */
  clearItemDetailTableData() {
    const tempLineItemAdditionalData = this.additionalFieldForItemCostDistributions;
    this.itemForm.clear();
    this.additionalFieldForItemCostDistributions = [];
    this.vendorRelevantItemList = new DropdownDto();
    this.additionalFieldForItemCostDistributions = tempLineItemAdditionalData;
    this.initAddItems();
    this.getVendorItemList(this.selectedVendorId);

    if (this.reviewBillDetailsForm.get(AppFormConstants.PROJECT_CODE_ID).value){
      this.itemForm.controls[0].get('projectId').patchValue(this.previousProjectCodeId);
    }

    if(this.reviewBillDetailsForm.get(AppFormConstants.DEPARTMENT_ID).value){
      this.itemForm.controls[0].get(this.appFormConstants.DEPARTMENT_ID).patchValue(this.previousDepartmentId);
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

  /**
   * This method use for get vendor list for dropdown
   */
  getVendorList() {
    this.billsService.getVendorList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.vendorList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /*
get pending bill list------------------------------------------------------------------------------------------------------>
 */


  /**
   * get pending bill list
   */
  getPendingBillList() {
    this.billSubmitService.getSubmitPendingInvoices().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.billList = res.body;
        this.getIsAvailableScrollInAttachment();
        this.billList.forEach((value: any) => {
          if (value.base64Image) {
            value.base64Image = ('data:image/jpg;base64,' + value.base64Image);
          }
          if (value.ocrRunningStatus === this.enums.STATUS_FAILED) {
            value.ocrRunningStatus = this.enums.STATUS_NOT_PROCESSED;
          }
        });
        this.createdBy = res.body.createdBy;
        if (this.billStatus === this.enums.STATUS_DRAFT && !this.isClickOnBill) {
          this.currentIndex = this.billList.findIndex(bill => bill.id === this.billId);
        } else if (this.billStatus !== this.enums.STATUS_DRAFT) {
          this.billSelected(this.billList[0]);
        }
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error1 => {
      this.notificationService.errorMessage(error1);
    });
  }

  /**
   * get excluded bill list
   */
  getExcludedBillList() {
    const existIds: any [] = [];
    this.billList.forEach(value => {
      existIds.push(value.id);
    });
    this.billSubmitService.getExcluedBillList(existIds).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        res.body.forEach(value => {
          if (value.base64Image) {
            value.base64Image = ('data:image/jpg;base64,' + value.base64Image);
          }
          this.billList.push(value);
          this.getIsAvailableScrollInAttachment();
        });
        this.isUploadScreen = false;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error1 => {
      this.notificationService.errorMessage(error1);
    });
  }

  /*
   ------------------------------------------------------------------------------------------------------>
   */

  /**
   * this method can be used to get emitted value
   * @param event to emitted value
   */
  getEmitValue(event) {
    this.getExcludedBillList();
  }

  /**
   * This method use for generate po receipt attachment url
   * @param isDownload boolean
   * * @param id to id
   */
  generateBillUrl(isDownload: boolean, id) {
    if (!id) {
      return;
    } else {
      this.billSubmitService.getBillAttachment(id).subscribe(res => {
        this.isBill = true;
        const url = window.URL.createObjectURL(res.data);
        if (isDownload) {
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', this.originalFileName);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          this.getSafeUrl(url, 'bill');
        }
      }, error => {
        this.notificationService.errorMessage({
          severity: AppMessageService.SUMMARY_ERROR,
          summary: AppMessageService.SUMMARY_ERROR,
          detail: error.message
        });
      });
    }
  }

  /*
  get vendor related data------------------------------------------------------------------------------------------------------>
   */

  /**
   * this method can be used to get vendor related template list
   */

  getVendorRelatedTemplateList(vendorId) {
    if (isNotNullOrUndefined(vendorId)) {
      this.billSubmitService.getTemplateListByVendorId(vendorId).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.templateList.data = res.body;
          this.templateList.addNew();
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to get vendor related po list
   */

  getVendorRelatedPoList(vendorId) {
    if (!isNotNullOrUndefined(vendorId)) {
      return;
    }
    const poId = this.reviewBillDetailsForm.get('poId').value;
    this.reviewBillDetailsForm.get('poId').reset();
    if (this.billDetail.poId) {
      this.getPoListByVendorAndPoId(vendorId, this.billDetail.poId);
      return;
    }
    this.billsService.getPoList(vendorId).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.poList.data = res.body;
        this.poList.data.forEach(value => {
          if (value.id === poId) {
            this.reviewBillDetailsForm.get('poId').patchValue(poId);
            return;
          }
        });
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getPoListByVendorAndPoId(vendorId, poId) {
    if (!isNotNullOrUndefined(vendorId)) {
      return;
    }
    this.billSubmitService.getPoListByVendorAndPoId(vendorId, poId).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.poList.data = res.body;
        this.poList.data.forEach(value => {
          if (value.id === poId) {
            this.reviewBillDetailsForm.get('poId').patchValue(poId);
            return;
          }
        });
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
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
   * this method can be used to get date formats
   */
  getDateFormats() {
    this.billSubmitService.getDateFormats().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.dateFormatList.data = res.body;
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
  getApprovalUserListAccordingToVendorSelection(listInstance: DropdownDto, vendorId) {
    if (!isNotNullOrUndefined(vendorId)) {
      return;
    }
    const authorities = [AppAuthorities.BILL_APPROVE, AppAuthorities.BILL_REJECT,
      AppAuthorities.BILL_OVERRIDE_APPROVAL];
    this.billsService.getApprovalUserListAccordingToVendorSelection(this.billMasterDto.createdBy, authorities, vendorId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        listInstance.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get date formats
   */
  getApprovalGroupList() {
    this.billsService.getApprovalGroupList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.approvalGroupList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * this method can be used to submit billMasterDto
   * @param action to action type
   * @param editOnly
   * @param isSubmit
   */
  submitBill(action, editOnly, isSubmit) {
    const billMasterDto = this.reviewBillDetailsForm.getRawValue();
    billMasterDto.expenseAccountIdList = billMasterDto.billExpenseCostDistributions?.map(r => r.accountId)?.filter(x => x);
    billMasterDto.itemIdList = billMasterDto.billItemCostDistributions?.map(r => r.itemId)?.filter(x => x);
    billMasterDto.projectCodeIdList = billMasterDto.billExpenseCostDistributions?.map(r => r.projectId)?.filter(x => x);
    billMasterDto.projectCodeIdList = billMasterDto.projectCodeIdList.concat(billMasterDto.billItemCostDistributions?.map(r => r.projectId)?.filter(x => x));

    this.isSubmitted = isSubmit;
    this.formatData(billMasterDto);
    if (this.reviewBillDetailsForm.valid) {
      if (action === 'SUBMIT_FOR_APPROVED') {
        if (this.billStatus === AppEnumConstants.STATUS_DRAFT && isSubmit) {
          editOnly = false;
        } else if (this.billStatus === AppEnumConstants.STATUS_DRAFT && !isSubmit) {
          editOnly = true;
        } else {
          editOnly = !(this.billStatus === this.enums.STATUS_REJECT && !isSubmit);
        }
        this.editBill(billMasterDto, editOnly);
      } else if (action === 'SAVE_AS_APPROVED') {
        this.saveBillAsApproved(billMasterDto);
      }
      if (AppConstant.DISCOUNT_TERM_OTHER === billMasterDto.term) {
        this.getPaymentTerms();
      }
    } else {
      this.isLoading = false;
      this.isSaveLoading = false;
      this.isLoadingSaveAsApproved = false;
      return new CommonUtility().validateForm(this.reviewBillDetailsForm);
    }
  }

  /**
   * this method can be used to format master object values
   * @param billMasterDto to bill master dto
   */
  formatData(billMasterDto) {
    billMasterDto.additionalData = this.commonUtil.formatMultisetValues(billMasterDto.additionalData);
    billMasterDto.billItemCostDistributions = this.commonUtil.formatMultisetLineValues(billMasterDto.billItemCostDistributions);
    billMasterDto.billExpenseCostDistributions = this.commonUtil.formatMultisetLineValues(billMasterDto.billExpenseCostDistributions);

    billMasterDto.dueDate = this.reviewBillDetailsForm.get('dueDateStr').value;

    const existingAttachments = [];
    const existingAdditionalFieldAttachments = [];
    this.billAttachments?.forEach(value => {
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
    new CommonUtility().validateFileInput(this.reviewBillDetailsForm.get('additionalData'), this.billAttachments);
  }


  /**
   * this method can be used to bill for approval
   * @param billMasterDto to bill master object
   */
  submitBillForApproval(billMasterDto) {
    this.billSubmitService.submitBill(billMasterDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.SUBMITTED_SUCCESSFULLY);
        this.reviewBillDetailsForm.reset();
        this.billList.splice(this.currentIndex, AppConstant.ONE);
        this.automaticallySelectBillAfterTriggerEvent();
        this.isLoading = false;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.isLoading = false;
    }, error => {
      this.notificationService.errorMessage(error);
      this.isLoading = false;
    });
  }

  /**
   * this method can be used for after successfully completed event automatically select bill and remve from list
   */
  automaticallySelectBillAfterTriggerEvent() {
    if (this.billList.length === AppConstant.ZERO) {
      this.refreshComponent();
    } else {
      if (this.currentIndex === this.billList.length) {
        this.currentIndex--;
      }
      this.billSelected(this.billList[this.currentIndex]);
    }
  }

  /**
   * this method can be used to save bill as approved
   * @param billMasterDto to bill master object
   */
  saveBillAsApproved(billMasterDto) {
    this.billSubmitService.saveBillAsApproved(billMasterDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.BILL_SAVE_AS_APPROVED_SUCCESSFULLY);
        this.reviewBillDetailsForm.reset();
        this.billList.splice(this.currentIndex, AppConstant.ONE);
        this.automaticallySelectBillAfterTriggerEvent();
      } else {
        this.isLoadingSaveAsApproved = false;
        this.notificationService.infoMessage(res.body.message);
      }
      this.isLoadingSaveAsApproved = false;
    }, error => {
      this.isLoadingSaveAsApproved = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to edit bill details
   */
  editBill(billMasterDto, editOnly) {
    this.billSubmitService.editBill(billMasterDto, editOnly).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.billStatus === this.enums.STATUS_APPROVED && this.isSubmitted ?
          this.notificationService.successMessage(HttpResponseMessage.SUBMITTED_SUCCESSFULLY) :
          this.notificationService.successMessage(HttpResponseMessage.BILL_UPDATED_SUCCESSFULLY);
        this.automaticallySelectBillAfterTriggerEvent();
      } else {
        this.isLoading = false;
        this.isSaveLoading = false;
        this.isLoadingSaveAsApproved = false;
        this.notificationService.infoMessage(res.body.message);
      }
      this.isLoading = false;
      this.isSaveLoading = false;
    }, error => {
      this.isLoading = false;
      this.isSaveLoading = false;
      this.isLoadingSaveAsApproved = false;
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * This method can use for get controllers in form array
   */
  public get adHocWorkflowDetails() {
    return this.reviewBillDetailsForm.get('adHocWorkflowDetails') as UntypedFormArray;
  }


  /**
   * this method can be used to add AddHocWorkflow to addHocWorkflow Array
   */
  addAdHocWorkflowDetail() {
    const addHocWorkflowDetail = this.formBuilder.group({
      id: [null],
      approvalGroup: [null],
      approvalUser: [null],
      approvalOrder: [null],
      completed: [false]
    });
    this.adHocWorkflowDetails.push(addHocWorkflowDetail);

    const adHocWorkFlowOrderNumber = this.adHocWorkflowDetails.length;
    this.adHocWorkflowDetails.controls[adHocWorkFlowOrderNumber - 1].get('approvalOrder').patchValue(adHocWorkFlowOrderNumber);
    this.validateButtonOnChangeAddOption();
  }


  /**
   * this method can be used to validate billMasterDto date according to date format
   */

  /**
   * This method can used to validate billMasterDto date
   */
  validateDate() {
    const billDate = this.reviewBillDetailsForm.get('billDateStr').value;
    if (!billDate) {
      return;
    }
    const billDateFormat = this.reviewBillDetailsForm.get('billDateFormat').value;
    if (!billDateFormat) {
      return;
    }
    this.billSubmitService.validWithFormat(billDate, billDateFormat).subscribe((res: any) => {
      this.isValidDate = res.body;
      this.getDueDate(res.body, false, false, false);
    });
  }

  /**
   * this method can be used to get due date
   */
  getDueDate(data, fromTerm, fromNet, fromDue) {
    const dateFormat = this.reviewBillDetailsForm.get(AppFormConstants.BILL_DATE_FORMAT).value;
    const billDate = this.reviewBillDetailsForm.get(AppFormConstants.BILL_DATE_STR).value;
    let netDays = this.reviewBillDetailsForm.get(AppFormConstants.NET_DAYS_DUE).value;
    const term = this.reviewBillDetailsForm.get(AppFormConstants.TERM).value;
    let dueDate = this.reviewBillDetailsForm.get(AppFormConstants.DUE_DATE_STR).value;
    this.isViewOtherTermFields = (term === 10);

    if (term == AppConstant.DISCOUNT_TERM_OTHER && fromTerm) {
      this.reviewBillDetailsForm.get(AppFormConstants.NET_DAYS_DUE).setValidators(Validators.compose([Validators.required, Validators.min(0)]));
      this.reviewBillDetailsForm.get(AppFormConstants.NET_DAYS_DUE).updateValueAndValidity();
    } else if (fromTerm) {
      this.reviewBillDetailsForm.get(AppFormConstants.NET_DAYS_DUE).clearValidators();
      this.reviewBillDetailsForm.get(AppFormConstants.NET_DAYS_DUE).updateValueAndValidity();
    }
    if (term !== AppConstant.DISCOUNT_TERM_OTHER && fromTerm){
      this.reviewBillDetailsForm.get(AppFormConstants.NET_DAYS_DUE).patchValue(null);
    }
    if (!data || !term || !dateFormat || !billDate || !this.isValidDate) {
      this.reviewBillDetailsForm.get(AppFormConstants.DUE_DATE_STR).reset();
      return;
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
      if (res.body.message === AppConstant.INVALID_DATE_FORMAT_MSG) {
        this.isValidDate = false;
        this.reviewBillDetailsForm.get(AppFormConstants.DUE_DATE_STR).reset();
      } else {
        if (res.body.dueDate) {
          this.reviewBillDetailsForm.get(AppFormConstants.DUE_DATE_STR).patchValue(res.body.dueDate);
        }
        if (res.body.netDaysDue !== null) {
          this.reviewBillDetailsForm.get(AppFormConstants.NET_DAYS_DUE).patchValue(res.body.netDaysDue);
          this.reviewBillDetailsForm.get(AppFormConstants.NET_DAYS_DUE).markAsDirty();
          if (fromDue){
            this.automationService.triggerFocusListeners(AppFormConstants.NET_DAYS_DUE);
          }
        }
      }
    });
  }


  /**
   * this method can be used to deleteExpense the bill
   */

  deleteBill(bill, index) {
    this.confirmationService.confirm({
      message: 'You want to delete this Bill',
      accept: () => {
        this.billSubmitService.deleteBill(bill.id, false).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.BILL_DELETED_SUCCESSFULLY);
            this.getIsAvailableScrollInAttachment();
            this.billList.splice(index, 1);
            if (this.billList.length === 0) {
              this.refreshComponent();
            } else {
              if (this.currentIndex == index) {
                this.currentIndex = 0;
                this.billSelected(this.billList[this.currentIndex]);
                return;
              }
              if (index < this.currentIndex) {
                this.currentIndex--;
              }
            }
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
   * this method can be used to validate add new
   */
  changeDropDownList(dropDownName, id) {
    if (dropDownName === 'Template' && id === 0) {
      this.addNewTemplate = true;
      this.isBill = false;
      setTimeout(() => {
        this.reviewBillDetailsForm.controls.templateId.reset();
      });
    }
  }

  /**
   * This method use to get vendor's bills
   * @param event any
   * @param index
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
   * @param index
   */
  changedDepartmentAccount(event, index) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    if (event.value === 0) {
      this.departmentPanel = true;
      this.expenseFields.controls[index].get('departmentId').reset();
    }
  }

  /**
   * Change Pdf Viewer According to purchase order
   */
  poChanged() {
    this.reviewBillDetailsForm.get(AppFormConstants.RECEIPT_ID).reset();
    this.billUtility.ifClearHeaderLevelReceiptCLearLineLevelReceiptValue(this.reviewBillDetailsForm.get('receiptId').value,
      this.expenseFields, this.itemForm);
    const poId = this.reviewBillDetailsForm.get(AppFormConstants.PO_ID).value;
    if (poId) {
      if (this.showPoLineItemsByDefault) {
        this.getPoDetails();
      }
      this.poUrl = null;
      this.getPoRelatedReceiptList(poId);
      this.generatePoUrl(false, poId);
      this.isPoAttachmentShown = true;
    } else {
      this.isClosedPoInDraft = false;
      this.billUtility.isViewThreeWayMatchingTable = false;
      this.isPoAttachmentShown = false;
    }
  }

  getPoRelatedReceiptList(poId) {
    if (poId) {
      this.poService.getReceipts(poId, this.itemPoReceiptIdList).subscribe((res: any) => {
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
   * This method use for generate po receipt attachment url
   * @param isDownload boolean
   * * @param id to id
   */
  generatePoUrl(isDownload: boolean, id) {
    this.billSubmitService.getPoAttachment(id).subscribe(res => {
      const url = window.URL.createObjectURL(res.data);
      if (isDownload) {
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'name');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        this.getSafeUrl(url, 'po');
      }
    }, error => {
      this.notificationService.errorMessage({
        severity: AppMessageService.SUMMARY_ERROR,
        summary: AppMessageService.SUMMARY_ERROR,
        detail: error.message
      });
    });
  }

  /**
   * Security Bypass for PDF Url
   */
  getSafeUrl(url, file) {
    switch (file) {
      case 'po': {
        this.poUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url + '#zoom=70');
        break;
      }
      case 'bill': {
        this.billUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url + '#zoom=70');
        break;
      }
      case 'poReceipt': {
        this.poReceiptUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url + '#zoom=70');
        break;
      }
    }
  }

  /**
   * this method can be used to get remaining ceiling
   */
  getRemainingCeiling(poId, poNumber) {
    if (null == poId) {
      return;
    }
    this.reviewBillDetailsForm.get(AppFormConstants.REMAINING_PO_CEILING).reset();
    this.poNumber = poNumber;
    const obj = {
      poId,
      billId: this.reviewBillDetailsForm.get(AppFormConstants.ID).value,
    };
    this.billSubmitService.getPoCeiling(obj).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body?.remainingPoCeiling !== null) {
            this.reviewBillDetailsForm.get(AppFormConstants.REMAINING_PO_CEILING).patchValue((res.body.remainingPoCeiling));
          }
          this.poStatus = res.body?.poStatus;
          this.isClosedPoInDraft = (this.poStatus === AppEnumConstants.STATUS_CLOSED && this.billStatus === AppEnumConstants.STATUS_DRAFT);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      },
      error => {
        this.notificationService.errorMessage(error);
      });
  }

  /**
   *this method can be used to validate when select other option in payment terms
   */
  validateOtherSelectionField() {
    const netDaysDue = this.reviewBillDetailsForm.get('netDaysDue');
    const discountPercentage = this.reviewBillDetailsForm.get('discountPercentage');
    const discountDaysDue = this.reviewBillDetailsForm.get('discountDaysDue');
    netDaysDue.reset();
    discountPercentage.reset();
    discountDaysDue.reset();

    if (this.reviewBillDetailsForm.get('term').value !== 10) {
      netDaysDue.clearValidators();
    } else {
      this.isValidDiscountDate = false;
      netDaysDue.setValidators(Validators.required);
    }
    netDaysDue.updateValueAndValidity();
  }


  /**
   * This method will get trigger when on key up discount days field
   */
  onKeyUpDiscountDaysDue() {
    this.isValidDiscountDate = false;
    const netDaysDue = this.reviewBillDetailsForm.get('netDaysDue').value;
    const discountDaysDue = this.reviewBillDetailsForm.get('discountDaysDue').value;

    if (netDaysDue !== null && discountDaysDue != null) {
      if (netDaysDue < discountDaysDue) {
        this.isValidDiscountDate = true;
      } else {
        this.isValidDiscountDate = false;
        this.reviewBillDetailsForm.get('discountDaysDue').clearValidators();
      }
    } else {
      return;
    }
    this.reviewBillDetailsForm.get('discountDaysDue').updateValueAndValidity();
    this.reviewBillDetailsForm.get('netDaysDue').updateValueAndValidity();
  }

  /**
   * this method can be use to patch value to the form
   * @param event to emitted values from bill submit drawer upload component
   */

  getTemplateRelatedValues(event) {
    this.reviewBillDetailsForm.patchValue(event);
  }

  /**
   * this method can be use to get template detected data
   */
  getTemplateDetectData(billId, templateId) {
    if (templateId != null && billId != null && templateId !== 0 && this.reviewBillDetailsForm.get('templateId').value !== null) {
      this.billSubmitService.getTemplateDetectData(templateId, billId).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          // this.reviewBillDetailsForm.get(AppFormConstants.VENDOR_ID).reset();
          this.reviewBillDetailsForm.get(AppFormConstants.PO_ID).reset();
          this.reviewBillDetailsForm.get(AppFormConstants.REMAINING_CELING).reset();
          this.reviewBillDetailsForm.get(AppFormConstants.PO_RECEIPT_ID).reset();
          this.reviewBillDetailsForm.get(AppFormConstants.BILL_NO).reset();
          this.reviewBillDetailsForm.get(AppFormConstants.BILL_DATE_FORMAT).reset();
          this.reviewBillDetailsForm.get(AppFormConstants.BILL_DATE_STR).reset();
          this.reviewBillDetailsForm.get(AppFormConstants.BILL_AMOUNT).reset();
          this.reviewBillDetailsForm.get(AppFormConstants.TERM).reset();
          this.reviewBillDetailsForm.patchValue(res.body);
          setTimeout(() => {
            this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
          }, 500);
          this.billList[this.currentIndex].status = res.body.deletectionLevel;

        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /*
  Form Arrays -------------------------------------------------------------------------------------------------------------->
*/

  /**
   * This method can use for get controllers in form array
   */
  public get itemForm() {
    return this.reviewBillDetailsForm.get('billItemCostDistributions') as UntypedFormArray;
  }

  /**
   * this method can be used to init approver dropdown
   */
  initExpense() {
    for (let i = 0; i < 10; i++) {
      this.addExpenseFieldOnClick();
    }
  }


  addItem() {
    const itemForm = this.formBuilder.group({
      itemId: [null],
      itemName: [],
      accountId: [null],
      accountChanged: [false],
      accountNumber: [null],
      vendorItemNumber: [null],
      description: [],
      qty: [''],
      rate: [null],
      amount: [null],
      departmentId: [null],
      projectId: [null],
      itemNumber: [''],
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
    this.itemForm.push(itemForm);
  }

  /**
   * This method use for add new form controller group for automation condition
   */
  addExpense() {
    const itemInfo = this.formBuilder.group({
      accountId: [null],
      accountName: [null],
      accountChanged: [false],
      accountNumber: [null],
      departmentId: [null],
      description: [null],
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
    this.billUtility.expensePoReceiptLineLevelAttachments.push(expenseLevelAttachment);
    this.billUtility.addEmptyDropDownReferenceForAccountField();
    this.expenseFields.push(itemInfo);
  }


  removeItem(i: number) {
    this.itemForm.removeAt(i);
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
  }

  removeExpense(i) {
    this.expenseFields.removeAt(i);
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
  }


  /**
   * This method can use for get controllers in form array
   */
  public get expenseFields() {
    return this.reviewBillDetailsForm.get('billExpenseCostDistributions') as UntypedFormArray;
  }

  /**
   * this method can be used to init add items
   */

  initAddItems() {
    for (let i = 0; i < 10; i++) {
      this.addItemFieldOnClick();
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
    if (selectionName === 'ProjectCodesHeader' && selectedId === 0) {
      this.reviewBillDetailsForm.get('projectCodeId').reset();
      this.isAddNewAccount = false;
      this.isAddNewItem = false;
      this.isAddNewProjectCodes = true;
    }
    if (selectionName === 'User' && selectedId === 0) {
      this.reviewBillDetailsForm.get('approvalUser').reset();
      this.isAddNewUser = true;
      this.isAddNewAccount = false;
      this.isAddNewItem = false;
      this.isAddNewProjectCodes = false;
    }
  }

  /*
 -------------------------------------------------------------------------------------------------------------->
  */

  navigate(e, name: string, i: any) {

    switch (e.key) {
      case 'ArrowDown':
        if ((this.expenseFields.length) - 2 === i) {
          // if (this.isDetailView) {
          //   this.addExpense();
          // }
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
          // if (this.isDetailView) {
          //   this.addItem();
          // }
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

  /*
  DROPDOWN DADA----------------------------------------------------------------------------------------------------->
   */

  /**
   * get project code list
   * @param listInstance to dropdown instance
   */
  getProjectTaskList(listInstance: DropdownDto) {
    this.billsService.getProjectTaskUserWise(AppConstant.PROJECT_CODE_CATEGORY_ID, true, this.billId).subscribe((res: any) => {
      listInstance.data = res.body;
      this.updatedProjectCodeList = res.body;
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
      this.updatedProjectCodeList = res;
      if (this.privilegeService.isAuthorized(AppAuthorities.ACCOUNTS_CREATE)) {
        listInstance.addNew();
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * get item list
   */

  getItems() {
    this.getVendorItemList(this.selectedVendorId);
  }

  /**
   * this method can be used to get item name
   * @param id to selected item id
   * @param index to formGroup index
   * */
  getItemName(id, index) {
    if (id !== AppConstant.ZERO && this.itemForm.controls[index].get('itemId').value) {
      this.getItemRelatedSku(this.selectedVendorId, id, index);
    }
    if (!this.itemForm.controls[index].get('itemId').value) {
      this.itemForm.controls[index].get('itemName').reset();
      this.itemForm.controls[index].get('vendorItemNumber').reset();
      this.itemForm.controls[index].get('itemNumber').reset();
      return;
    } else {
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

  /**
   * this method can be used to get account name
   * @param id to account id
   * @param i to index number
   */
  getAccountName(id, i, isItemCostDistribution?) {
    if (!isItemCostDistribution){
      this.expenseFields.controls[i].get('accountNumber').reset();
      this.expenseFields.controls[i].get('accountName').reset();
    }else{
      this.itemForm.controls[i].get('accountNumber').reset();
    }

    if (!id) {
      return;
    } else {
      this.billApprovalsService.getAccountName(id).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (!isItemCostDistribution) {
            this.expenseFields.controls[i].get('accountNumber').patchValue(res.body.number);
            this.expenseFields.controls[i].get('accountName').patchValue(res.body.name);
          }else{
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


  calculateItemLineAmount(i) {
    let amount = this.itemForm.controls[i].value.qty * this.itemForm.controls[i].value.rate;
    amount = this.commonUtil.roundNum(amount);
    this.itemForm.controls[i].get('amount').patchValue(amount);
    return amount;
  }


  get bill() {
    return this.reviewBillDetailsForm.controls;
  }

  /*
------------------------------ADDITIONAL FIELD RELATED FUNCTIONS------------------------------------------------------------------------->
*/

  /**
   * This method use for add additional fields to po creation
   */
  getModuleReheatedAdditionalField(id, isDetailView) {
    return new Promise<void>(resolve => {
      this.additionalFieldService.getAdditionalField(id, isDetailView, !this.isEditBill).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.additionalFieldResponse = res.body;
          this.selectedVendorName.focus();

          this.additionalFieldResponse.forEach(((field) => {
            this.commonUtil.manageDropDownData(field, isDetailView);

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
          this.additionalFiledAlign();
          this.customLineItemGrid.initCreateBillExpTable(this.additionalFieldForExpenseCostDistributions);
          this.customLineItemGrid.initCreateBillItmTable(this.additionalFieldForItemCostDistributions);
          // draft related changes---
          if (this.billStatus === this.enums.STATUS_DRAFT) {
            this.getPendingBillList();
            this.isEditDraft = true;
          }
          this.billUtility.isCheckedPayWhenCustomerPay = this.billDetail.payWhenCustomerPay;
          if (this.isEditBill || this.billStatus === this.enums.STATUS_DRAFT) {
            this.reviewBillDetailsForm.patchValue(this.billDetail);
            this.setDocumentEvent();
            this.isOverrideData = this.billStatus === AppEnumConstants.STATUS_DRAFT;
            this.validateButtonOnChangeAddOption();
            const isItemCostGreaterThanZero: boolean =
              this.billDetail.billExpenseCostDistributions.some(x => Number(x.amount) > AppConstant.ZERO);
            const isExpenseCostGreaterThanZero: boolean =
              this.billDetail.billItemCostDistributions.some(x => Number(x.amount) > AppConstant.ZERO);
            const isTotalAmountGreaterThanZero: boolean = (isItemCostGreaterThanZero || isExpenseCostGreaterThanZero);
            this.billUtility.getMatchingTableData(this.reviewBillDetailsForm, this.expenseFields, this.itemForm);
            this.billDetail.linkedWithCostDistribution && isTotalAmountGreaterThanZero ?
              this.getTotalCostDistribution() :
              this.reviewBillDetailsForm.get('distributionCostTotal').patchValue(AppConstant.ZERO);
            this.getRemainingCeiling(this.billDetail.poId, this.billDetail.poNumber);

            // draft related changes--
          }
          this.getTableRowValues();
          setTimeout(() => {
            this.automationService.setUpFocusListeners(this.reviewBillDetailsForm, this.renderer, this.el, this.setFieldValueDto, AppDocumentType.BILL, this.automationService.billInputFieldsForAutomation);
          }, 400);
          setTimeout(() => {
            this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
          }, 500);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        resolve();
      }, error => {
        this.notificationService.errorMessage(error);
        resolve();
      });
    });
  }


  /**
   * Align additional field with response id and structure id
   */
  additionalFiledAlign() {
    this.billDetail.additionalData = this.commonUtil.patchDropDownAdditionalData(this.billDetail.additionalData);
    this.billDetail.billExpenseCostDistributions = this.commonUtil.patchDropDownAdditionalLineItemData(this.billDetail.billExpenseCostDistributions);
    this.billDetail.billItemCostDistributions = this.commonUtil.patchDropDownAdditionalLineItemData(this.billDetail.billItemCostDistributions);

    this.billDetail.additionalData = this.commonUtil.alignHeadingAdditionalData(this.headerAdditionalFieldDetails, this.billDetail.additionalData);
    this.commonUtil.alignLineAdditionalData(this.billDetail.billExpenseCostDistributions, this.additionalFieldForExpenseCostDistributions);
    this.commonUtil.alignLineAdditionalData(this.billDetail.billItemCostDistributions, this.additionalFieldForItemCostDistributions);
  }

  /**
   * This method use for add line item data additional field and field validations
   * @param field
   * @private
   */
  public addLineFieldForItem(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.billDetail.billItemCostDistributions, field, false, false)) {
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
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.billDetail.billExpenseCostDistributions, field, false, false)) {
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
   * return form array data
   */
  public get headingSectionArray() {
    return this.reviewBillDetailsForm.get('additionalData') as FormArray;
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
   * This method use for view additional option input drawer
   * @param event to change event
   * @param additionalFieldDetailDto AdditionalFieldDetailDto
   * @param additionalField to AdditionalFieldDetailDto
   * @param multiSelect to multiSelect dropdown
   */
  addNewAdditionalDropDownOption(event: any, additionalFieldDetailDto: AdditionalFieldDetailDto, additionalField: AbstractControl,
                                 multiSelect) {
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
      const allChecked: boolean = multiSelect._options.every(function(item: any) {
        return item.isChecked === false;
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
   * @param i
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
      accountId: [null],
      accountName: [null],
      accountChanged: [false],
      description: [null],
      amount: [null],
      accountNumber: [null],
      departmentId: [null],
      projectId: [null],
      poReceiptId: [null],
      billable: [false],
      poReceiptIdList: [null],
      taxable: [false],
      hideAccountNumberInput: [false],
      additionalData: this.formBuilder.array([])
    });
    const expenseRuleList: DropdownDto = new DropdownDto();
    this.ruleListForExpense.push(expenseRuleList);
    const expenseLevelAttachment: BillLineLevelPoReceiptDto = new BillLineLevelPoReceiptDto();
    this.billUtility.expensePoReceiptLineLevelAttachments.push(expenseLevelAttachment);
    this.billUtility.addEmptyDropDownReferenceForAccountField();
    this.expenseFields.push(itemInfo);
    const len = (this.expenseFields.length - 2);
    this.addExpenseFields(len);
  }

  addItemFieldOnClick() {
    const itemForm = this.formBuilder.group({
      itemId: [null],
      itemName: [],
      vendorItemNumber: [null],
      accountChanged: [false],
      accountId: [null],
      accountNumber: [null],
      description: [],
      qty: [''],
      rate: [null],
      amount: [null],
      departmentId: [null],
      projectId: [null],
      itemNumber: [null],
      poReceiptId: [null],
      poReceiptIdList: [null],
      billable: [false],
      taxable: [false],
      hideAccountNumberInput: [false],
      additionalData: this.formBuilder.array([])
    });
    this.itemForm.push(itemForm);
    const obj: DropdownDto = new DropdownDto();
    this.skuDropDownList.push(obj);
    const itemRuleList: DropdownDto = new DropdownDto();
    this.ruleListForItem.push(itemRuleList);
    this.billUtility.addEmptyDropDownReferenceForAccountField();
    const itemLevelAttachment: BillLineLevelPoReceiptDto = new BillLineLevelPoReceiptDto();
    this.billUtility.itemPoReceiptLineLevelAttachments.push(itemLevelAttachment);
    const len = (this.itemForm.length - 2);
    this.addItemField(len);
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
   * this method can be used to get bill details for edit
   */
  getBillDetailsForEdit() {
    this.billApprovalsService.getBillDetail(this.billIdFromList, false).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.commonUtil.isDepartmentAvailable = res.body.isDepartmentAvailable;
        this.commonUtil.isProjectCodeAvailable = res.body.isProjectCodeAvailable;
        this.billDetail = res.body;
        this.billStatus = res.body.status;
        this.billAttachments = res.body.additionalFieldAttachments;
        this.adHocWorkflowDetails.controls = [];
        const itemPoReceiptSet = new Set();
        this.billAttachments.forEach((value, index) => {
          if (value.id === res.body.billAttachmentId) {
            this.billAttachments.splice(index, 1);
          }
        });
        if (res.body.billExpenseCostDistributions.length > 0) {
          for (let i = 0; i < res.body.billExpenseCostDistributions.length; i++) {
            if (res.body.billExpenseCostDistributions[i].poReceiptIdList?.length > 0) {
              res.body.billExpenseCostDistributions[i].poReceiptIdList?.forEach((accountReceiptId) => {
                if (accountReceiptId) {
                  itemPoReceiptSet.add(accountReceiptId);
                }
              });
            }
            this.addExpenseFieldOnClick();
          }
        } else {
          this.addExpenseFieldOnClick();
        }

        if (res.body.billItemCostDistributions.length > 0) {
          for (let i = 0; i < res.body.billItemCostDistributions.length; i++) {
            if (res.body.billItemCostDistributions[i].poReceiptIdList?.length > 0) {
              res.body.billItemCostDistributions[i].poReceiptIdList?.forEach((itemReceiptId) => {
                if (itemReceiptId) {
                  itemPoReceiptSet.add(itemReceiptId);
                }
              });
            }
            this.addItemFieldOnClick();
          }
        } else {
          this.addItemFieldOnClick();
        }
        this.itemPoReceiptIdList = Array.from(itemPoReceiptSet);
        if (res.body.receiptId) {
          this.itemPoReceiptIdList.push(res.body.receiptId);
        } else if (this.itemPoReceiptIdList.length === 0) {
          this.itemPoReceiptIdList.push(0);
        }
        this.billDetail.billDateStr = res.body.actualBillDateStr;
        this.getVendorRealtedItems(res.body.vendorId);
        this.generateBillUrl(false, this.billDetail.billAttachmentId);
        this.getModuleReheatedAdditionalField(AppDocumentType.BILL, false).then(r => r);
        this.billId = res.body.id;
        if (res.body.previousAdHocWorkflowDetails) {
          this.previousAdHocWorkflowDetails = res.body.previousAdHocWorkflowDetails;
        }
        if (res.body.adHocWorkflowDetails.length > 0) {
          res.body.adHocWorkflowDetails.filter(x => x.completed === false).length !== 0 ?
            this.isAvailableAwaitingApproval = true : this.isAvailableAwaitingApproval = false;
          res.body.adHocWorkflowDetails.filter(x => x.completed === false).length === 0 ? this.addAdHocWorkflowDetail() : null;
          res.body.adHocWorkflowDetails = res.body.adHocWorkflowDetails.sort((ap1, ap2) =>
            (ap2.approvalOrder > ap1.approvalOrder) ? -1 : ((ap2.approvalOrder > ap1.approvalOrder) ? 1 : 0));
          res.body.adHocWorkflowDetails.forEach(() => {
            this.addAdHocWorkflowDetail();
          });
        } else if (res.body.status !== AppConstant.STATUS_PENDING) {
          this.addAdHocWorkflowDetail();
        }
        if (this.reviewBillDetailsForm.get('term').value === 10) {
          this.isViewOtherTermFields = true;
        }
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * this method can be used to get bill attachment
   * @param event to change event
   */
  onBillAttachmentChange(event) {
    if (event.target.files[0]) {
      const targetFile = event.target.files[0];
      this.reviewBillDetailsForm.patchValue({
        attachment: targetFile
      });
      this.billUrl = window.URL.createObjectURL(targetFile);
      this.getSafeUrl(window.URL.createObjectURL(targetFile), 'bill');
    }
  }


  /**
   * this method can be used to get selected item/account names
   */
  getTableRowValues() {
    if (this.billDetail.billExpenseCostDistributions.length > 0) {
      this.billDetail.billExpenseCostDistributions.forEach((value, index) => {
        if (value.accountId) {
          this.getAccountName(value.accountId, index);
        }
      });
    }
    if (this.billDetail.billItemCostDistributions.length > 0) {
      this.billDetail.billItemCostDistributions.forEach((value, index) => {
        if (value.itemId) {
          this.getItemName(value.itemId, index);
        }
      });
    }
  }


  ////////////////////////////////////////// Purchase Order Details Table/////////////////////////////////////
  /**
   * get po details from to popup from when po changed
   */
  async getPoDetails() {
    this.selectedPoLineItems = [];
    this.selectedPoAccountDetails = [];
    if (!this.reviewBillDetailsForm.get(AppFormConstants.PO_ID).value) {
      return;
    }
    await this.poService.getPoLineItemData(this.reviewBillDetailsForm.get(AppFormConstants.PO_ID).value).then((res: any) => {
      this.poDetail.purchaseOrderDetails = res.body;
    }).catch((e) => this.notificationService.errorMessage(e));
    if (!this.reviewBillDetailsForm.get(AppFormConstants.PO_ID).value) {
      return;
    }
    await this.poService.getPoLineAccountData(this.reviewBillDetailsForm.get(AppFormConstants.PO_ID).value).then((res: any) => {
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
      this.billUtility.getMatchingTableData(this.reviewBillDetailsForm, this.expenseFields, this.itemForm);
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
    while (this.itemForm.length !== AppConstant.ZERO) {
      this.itemForm.removeAt(AppConstant.ZERO);
    }
    for (let i = AppConstant.ZERO; i < 10; i++) {
      this.addItemFieldOnClick();
    }
    this.itemForm.patchValue(itemCostData);

    this.selectedPoLineItems.forEach((value, index) => {
      if (value.productId) {
        if (this.itemForm.controls.length === (1 + index)) {
          this.addItemFieldOnClick();
        }
        this.itemForm.controls[length].get('itemId').patchValue(value.productId);
        this.getItemName(value.productId, length);
        this.itemForm.controls[length].get('vendorItemNumber').patchValue(value.vendorItemNumber);
        this.itemForm.controls[length].get('description').patchValue(value.description);
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
    const accountInfo = [];
    let length = accountInfo.length;
    while (this.expenseFields.length !== AppConstant.ZERO) {
      this.expenseFields.removeAt(AppConstant.ZERO);
    }
    for (let i = AppConstant.ZERO; i < 10; i++) {
      this.addExpenseFieldOnClick();
    }
    this.expenseFields.patchValue(accountInfo);
    this.selectedPoAccountDetails.forEach((value, index) => {
      if (this.expenseFields.controls.length === (1 + index)) {
        this.addExpenseFieldOnClick();
      }
      if (value.accountId) {
        this.expenseFields.controls[length].get('accountId').patchValue(value.accountId);
        this.getAccountName(value.accountId, length);
      } else {
        this.expenseFields.controls[length].get('description').patchValue(value.accountName);
      }
      this.expenseFields.controls[length].get('departmentId').patchValue(value.departmentId);
      if (value.departmentId){
        this.expenseFields.controls[length].get('departmentId').markAsDirty();
      }
      this.expenseFields.controls[length].get('amount').patchValue(value.amount);
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

  viewSelectedTemplate(data: any) {
    this.templateId = data.id;
    this.templateDetailView = true;
    this.addNewTemplate = true;
  }

  updateAdditionalFieldDropDowns(data?) {
    if (data){
      this.selectedAdditionalField = data;
    }
    this.commonUtil.updateAdditionalFiledDropdowns(this.headerAdditionalFieldDetails, this.selectedAdditionalField);
    this.commonUtil.updateAdditionalFiledDropdowns(this.additionalFieldForExpenseCostDistributions, this.selectedAdditionalField);
    this.commonUtil.updateAdditionalFiledDropdowns(this.additionalFieldForItemCostDistributions, this.selectedAdditionalField);
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
    this.billAttachments.splice(index, AppConstant.ONE);
  }

  /**
   * This method use for  download attachment
   */
  downloadAttachment() {
    this.billSubmitService.getBillAttachment(this.attachmentId).subscribe(res => {
      const url = window.URL.createObjectURL(res.data);
      window.open(url, '_blank');
    }, error => {
      this.notificationService.errorMessage(error);
    }, () => {
      // this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
    });
  }

  /**
   * Detect Bill From OCR
   * @param bill
   */
  detectBill(bill: BillSubmitInvoiceListDto) {
    // If already bill is status done or in pending
    if (bill.ocrRunningStatus == this.enums.STATUS_DONE || bill.ocrRunningStatus == this.enums.STATUS_PENDING) {
      return;
    }
    // If current Bill Id == to selected bill id then disable the form
    if (this.billId === bill.id) {
      this.isDataFetching = true;
    }
    // Change the Status of selected bill to Pending
    bill.ocrRunningStatus = this.enums.STATUS_PENDING;
    this.billSubmitService.detectBill(bill.id).then(() => {
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Read all bill from OCR
   */
  readAllBillFromOcr() {
    this.billSubmitService.detectAllBills().then(() => {
      this.billList.forEach(value => {
        if (!(value.ocrRunningStatus == this.enums.STATUS_DONE || value.ocrRunningStatus == this.enums.STATUS_PENDING)) {
          value.ocrRunningStatus = this.enums.STATUS_PENDING;
          if (value.id === this.billId) {
            this.isDataFetching = true;
          }
        }
      });
    }, error => {
      this.isDataFetching = false;
      this.notificationService.errorMessage(error);
      this.billList.forEach(value => {
        if (value.ocrRunningStatus == this.enums.STATUS_PENDING) {
          value.ocrRunningStatus = this.enums.STATUS_NOT_PROCESSED;
          this.isDataFetching = false;
        }
      });
    });
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
    const rule: any = {};
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
    const poId = this.reviewBillDetailsForm.get(AppFormConstants.PO_ID).value;
    const remainingCeiling = this.reviewBillDetailsForm.get(AppFormConstants.REMAINING_PO_CEILING).value;
    const amount = this.reviewBillDetailsForm.get(AppFormConstants.BILL_AMOUNT).value;

    if (this.isVisibleNotificationContent === false || !poId) {
      return false;
    }

    if (remainingCeiling === 0 || remainingCeiling < amount) {
      this.isVisibleNotificationContent = true;
      return true;
    }
  }

  /**
   * This method can be used to validate from events
   */

  validateButtonOnChangeAddOption() {
    if (!(this.isEditBill || this.isOverrideData)) {
      return;
    } else {
      this.isEnabledSubmitForApprovalButton = this.adHocWorkflowDetails.controls.filter(x =>
        ((x.get('approvalUser').value != null) || (x.get('approvalGroup').value != null)) &&
        x.get('completed').value === false).length > AppConstant.ZERO;
    }
  }

  receiptToLineItem() {
    if (this.reviewBillDetailsForm.get('receiptId').value) {
      this.billUtility.headerPORecipeSelectionValueToLineLevel(this.reviewBillDetailsForm.get('receiptId').value,
        this.expenseFields, this.itemForm);
    }
  }

  getDescriptionWiseAccItem(i: any, section) {
    this.memoriseItemAcc.getDescriptionWiseAccItem(i, section, this.expenseFields,
      this.itemForm, 'BILL').then((value: any) => {
      if (!value) {
        return;
      }
      if (this.itemForm.controls[i].get(AppFormConstants.ACCOUNT_CHANGED).value) {
        return;
      }

      if (section === AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID) {
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

  // Changes with bill draft

  /**
   * this method check condition of show bill save as approved button
   */
  isViewSaveAsButton(): boolean {
    return (this.privilegeService.isAuthorized(this.appAuthorities.BILL_SAVE_AS_APPROVED) || this.isSaveAsApprovedWorkFlow)
      && !this.isSubmissionWorkFlow && (this.billStatus === this.enums.STATUS_REJECT ||
        this.billStatus === AppEnumConstants.STATUS_DRAFT || this.billStatus === this.enums.STATUS_SUCCESS) ||
      (this.billStatus === this.enums.STATUS_PENDING && !this.isEnabledSubmitForApprovalButton);
  }

  /**
   * this method check condition of show submit for approval button
   */
  isViewSubmitForApprovalButton(): boolean {
    return (this.privilegeService.isAuthorized(this.appAuthorities.BILL_CREATE) || this.isSubmissionWorkFlow)
      && !this.isSaveAsApprovedWorkFlow && ((this.billStatus === this.enums.STATUS_APPROVED &&
          this.isEnabledSubmitForApprovalButton) || this.billStatus === AppEnumConstants.STATUS_DRAFT
        || this.billStatus === this.enums.STATUS_SUCCESS);
  }

  /**
   * this method check condition of show save / resubmit buttons
   */
  isViewSaveOrResubmitButton() {
    return ((this.billStatus === this.enums.STATUS_PENDING && this.isEnabledSubmitForApprovalButton) ||
        (this.billStatus === this.enums.STATUS_APPROVED && !this.isEnabledSubmitForApprovalButton)) ||
      this.billStatus === this.enums.STATUS_REJECT;
  }

  /**
   * this method return loading button status
   */
  isLoadingInProgress() {
    return (this.isLoadingSaveAsApproved || this.isDataFetching || this.isLoading || this.isSaveLoading || this.isSaveAsDraft);
  }

  /**
   * this method check condition of show save bill as draft button
   */
  isSaveAsDraftEnabled() {
    return (this.billStatus === this.enums.STATUS_DRAFT || this.billStatus === this.enums.STATUS_SUCCESS) || !(this.billStatus);
  }


  /**
   * This method can be used to save document as draft
   * @param value to expense form value
   */
  saveAsDraft(value) {
    this.isSaveAsDraft = true;
    if (!this.reviewBillDetailsForm.get('vendorId').value || !this.reviewBillDetailsForm.get('billNo').value) {
      if (!this.reviewBillDetailsForm.get('vendorId').value) {
        this.reviewBillDetailsForm.get('vendorId').markAsDirty();
      }
      if (!this.reviewBillDetailsForm.get('billNo').value) {
        this.reviewBillDetailsForm.get('billNo').markAsDirty();
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
    billMst = this.reviewBillDetailsForm.getRawValue();
    this.formatData(billMst);
    this.billsService.billSubmitSaveBillAsDraft(billMst).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        (this.enums.STATUS_DRAFT) ? this.notificationService.successMessage(HttpResponseMessage.DRAFT_UPDATED_SUCCESSFULLY) :
          this.notificationService.successMessage(HttpResponseMessage.DRAFT_SAVED_SUCCESSFULLY);
        this.isSaveAsDraft = false;
        this.automaticallySelectBillAfterTriggerEvent();
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
   * this method return notification message
   */
  showMessage() {
    if (this.isClosedPoInDraft) {
      return HttpResponseMessage.CLOSED_SELECTED_PO;
    } else {
      return this.appConstant.EXCEED_BIlL_AMOUNT;
    }
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
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
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
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
  }

  /**
   * this method can be used to view receipt modal as conditionally
   * @param value to po receipt ids
   */
  viewPoReceiptAttachment(value) {
    this.receiptAttachments = [];
    if (this.reviewBillDetailsForm.get('receiptId').value) {
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
      this.reviewBillDetailsForm.get('customerInvoiceId').reset();
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

  changeHeaderProjectCode(dpNameProjectTask: Dropdown) {
    this.automationService.setAutomationData(this.reviewBillDetailsForm, AppFormConstants.PROJECT_CODE_ID);
    this.changeList('ProjectCodesHeader', dpNameProjectTask.selectedOption.id, null);
    this.billUtility.patchProjectTaskToLine(this.expenseFields, this.itemForm, dpNameProjectTask.selectedOption.id);
    this.billUtility.loadAccountsAccordingToTheProjectTaskId(this.reviewBillDetailsForm.get('projectCodeId').value, null, false, this.billId);
    this.billUtility.clearAccountWhenClearHeaderProjectTask(this.expenseFields);
    this.commonUtil.patchHeaderDepartmentToLineLevel(this.reviewBillDetailsForm, -1, this.isEditBill, null, true, true);
    this.commonUtil.isPressEnterInsideDropdown(dpNameProjectTask);
  }

  changePo(selectedPoName: Dropdown) {
    this.isVisibleNotificationContent = null;
    this.getRemainingCeiling(selectedPoName.selectedOption.id, selectedPoName.selectedOption.name); this.reviewBillDetailsForm.get('closePo').patchValue(false);
    this.billUtility.getMatchingTableData(this.reviewBillDetailsForm, this.expenseFields, this.itemForm);
    this.commonUtil.isPressEnterInsideDropdown(selectedPoName);
    this.billUtility.getProjectCodeByPo(this.reviewBillDetailsForm.get(AppFormConstants.PO_ID).value, this.reviewBillDetailsForm).then(() => {
      this.automationService.setAutomationData(this.reviewBillDetailsForm, null, [AppFormConstants.PO_ID, AppFormConstants.PROJECT_CODE_ID]);
    });

  }

  changeHeaderPoReceipt(headerReceipt: Dropdown) {
    this.automationService.setAutomationData(this.reviewBillDetailsForm, AppFormConstants.PO_RECEIPT_ID);
    this.billUtility.getPoReceiptNumberById(this.reviewBillDetailsForm.get('receiptId').value, null, false, this.expenseFields, this.itemForm);
    this.billUtility.ifClearHeaderLevelReceiptCLearLineLevelReceiptValue(this.reviewBillDetailsForm.get('receiptId').value, this.expenseFields, this.itemForm);
    this.billUtility.getMatchingTableData(this.reviewBillDetailsForm, this.expenseFields, this.itemForm);
    this.commonUtil.isPressEnterInsideDropdown(headerReceipt);
  }

  termChanged(termName: Dropdown) {
    this.automationService.setAutomationData(this.reviewBillDetailsForm, AppFormConstants.TERM);
    this.validateOtherSelectionField();
    this.commonUtil.isPressEnterInsideDropdown(termName);
  }

  accountChangedItm($event: any, i: any) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    this.getAccountName($event.value, i, true);
  }
}
