import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
import {OverlayPanel} from "primeng/overlaypanel";
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {BillMasterDto} from "../../../shared/dto/bill/bill-master-dto";
import {DropdownDto} from "../../../shared/dto/common/dropDown/dropdown-dto";
import {AdditionalFieldDetailDto} from "../../../shared/dto/additional-field/additional-field-detail-dto";
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {AppFormConstants} from "../../../shared/enums/app-form-constants";
import {AppConstant} from "../../../shared/utility/app-constant";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {DataFormat} from "../../../shared/utility/data-format";
import {AppFieldType} from "../../../shared/enums/app-field-type";
import {RemoveSpace} from "../../../shared/helpers/remove-space";
import {BillSubmitService} from "../../../shared/services/bills/bill-submit.service";
import {BillsService} from "../../../shared/services/bills/bills.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {BillApprovalsService} from "../../../shared/services/bills/bill-approvals.service";
import {PoService} from "../../../shared/services/po/po.service";
import {AdditionalFieldService} from "../../../shared/services/additional-field-service/additional-field-service.";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {AppModuleSection} from "../../../shared/enums/app-module-section";
import {ExpenseService} from "../../../shared/services/expense/expense.service";
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppDocumentType} from "../../../shared/enums/app-document-type";
import {MandatoryFields} from "../../../shared/utility/mandatory-fields";
import {BillUtility} from "../../bills/bill-utility";
import {BillPaymentService} from "../../../shared/services/bill-payment-service/bill-payment.service";
import {CreditNoteService} from "../../../shared/services/credit-note/credit-note.service";
import {DomSanitizer} from "@angular/platform-browser";
import {ManageDrawerService} from "../../../shared/services/common/manage-drawer-status/manage-drawer.service";
import {Subscription} from 'rxjs';
import {SetFieldValueDto} from '../../../shared/dto/automation/set-field-value-dto';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {AppDocuments} from '../../../shared/enums/app-documents';
import {AppAnalyticsConstants} from '../../../shared/enums/app-analytics-constants';


@Component({
  selector: 'app-credit-card-bill-create-form',
  templateUrl: './credit-card-bill-create-form.component.html',
  styleUrls: ['./credit-card-bill-create-form.component.scss']
})

export class CreditCardBillCreateFormComponent extends MandatoryFields implements OnInit, OnDestroy, AfterViewInit   {
  @Output() isClickCloseButton = new EventEmitter<boolean>();
  @Output() updateGrid = new EventEmitter();
  @Output() emitCountTotal = new EventEmitter();
  @Input() fromRecurringBill = false;
  @Input() templateId;
  @Input() vendorId;
  @Input() element;
  @Input() editView = false;
  @Input() billId = false;
  @ViewChild('overlayPanel') public overlayPanel: OverlayPanel;
  @Output() updatedProjectCodeList = new EventEmitter();
  @Output() updatedAccountList = new EventEmitter();


  public createEInvoiceForm: UntypedFormGroup;
  public matchingAutomation: any;
  public isSubmissionWorkFlow = false;
  public isSaveAsApprovedWorkFlow = false;
  public isWorkflowConfigAvailable = false;
  public billMasterDto: BillMasterDto = new BillMasterDto();
  public department: DropdownDto = new DropdownDto();
  public additionalFieldResponse: AdditionalFieldDetailDto[];
  public headerAdditionalFieldDetails: AdditionalFieldDetailDto[] = [];
  public additionalFieldForExpenseCostDistributions: AdditionalFieldDetailDto[] = [];
  public selectedAdditionalField: AdditionalFieldDetailDto;
  public appAuthorities = AppAuthorities;
  public appFormConstants = AppFormConstants;
  public appConstant: AppConstant = new AppConstant();
  public commonUtil = new CommonUtility();
  public enums = AppEnumConstants;
  public dateFormat = new DataFormat();
  public appFieldType = AppFieldType;
  public removeSpace: RemoveSpace = new RemoveSpace();
  public addNewDropDown = false;
  public attachments: File[] = [];
  public isAddVendor = false;
  public isLoadingSaveAsApproved = false;
  public isAddNewAccount = false;
  public isAccount: boolean;
  public isAddNewProjectCodes = false;
  public departmentPanel: boolean;
  public vendorsList: DropdownDto = new DropdownDto();
  public termList: DropdownDto = new DropdownDto();
  public projectTasks: DropdownDto = new DropdownDto();
  public customerInvoiceList: DropdownDto = new DropdownDto();
  public fieldSubscription: Subscription = new Subscription();
  setFieldValueDto: SetFieldValueDto = new SetFieldValueDto();
  public isLoading = false;
  public isSaveLoading = false;
  public billStatus: any;
  public isEnabledSubmitForApprovalButton = false;
  public approvalGroupList: DropdownDto = new DropdownDto();
  public isAvailableAwaitingApproval = false;
  public approvalUserList: DropdownDto = new DropdownDto();
  public adHocIndex: number;
  private automationServiceInstance: AutomationService = new AutomationService(this.automationService.httpClient);
  previousDepartmentId;
  previousProjectCodeId;
  departmentChangeFromAutomation = false;
  projectCodeChangeFromAutomation = false;

  public billUtility: BillUtility = new BillUtility(this.billPaymentService, this.notificationService,
    this.privilegeService, this.creditNoteService, this.billsService, this.sanitizer, this.drawerService);


  constructor(public billSubmitService: BillSubmitService, public formBuilder: UntypedFormBuilder, public billsService: BillsService,
              public notificationService: NotificationService, public expenseService: ExpenseService,
              public creditNoteService: CreditNoteService, public sanitizer: DomSanitizer, public drawerService: ManageDrawerService,
              public billApprovalsService: BillApprovalsService, public poService: PoService, public billPaymentService: BillPaymentService,
              public additionalFieldService: AdditionalFieldService, public privilegeService: PrivilegeService,
              public automationService: AutomationService, private renderer: Renderer2, private el: ElementRef) {
    super(additionalFieldService, notificationService);
  }

  ngOnInit(): void {
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
      discountDaysDue: [null],
      frequencyEvery: [AppConstant.NULL_VALUE],
      id: [],
      unit: [],
      billAttachmentId: [],
      endDate: [],
      receiptId: [],
      event: [],
      billAmount: [null],
      termManuallyChanged: [null],
      scheduleTemplateId: [null],
      tax: [],
      grossAmount: [null],
      departmentId: [null],
      additionalNotes: [],
      closePo: [false],
      projectCodeId: [null],
      payWhenCustomerPay: [null],
      customerInvoiceId: [null],
      accountPeriodMonth: [null],
      accountPeriodYear: [null],
      focusListener: [],
      patchSetFieldFullObject: [false],
      adHocWorkflowDetails: this.formBuilder.array([]),
      additionalData: this.formBuilder.array([]),
      creditCardTransactionList: this.formBuilder.array([]),
    });
    this.getRequiredFields(this.createEInvoiceForm, AppDocumentType.BILL);
    this.getVendorList();
    this.initApprover();
    this.getApprovalGroupList();
    this.getPaymentTerms();
    this.getProjectCodeList();
    this.getCustomerInvoiceList();
    this.createEInvoiceForm.get(AppFormConstants.BILL_DATE).valueChanges.subscribe(data => this.getDueDate(data, false, false, false));
    this.createEInvoiceForm.get(AppFormConstants.TERM).valueChanges.subscribe(data => this.getDueDate(data, true, false, false));
    this.createEInvoiceForm.get(AppFormConstants.VENDOR_ID).valueChanges.subscribe(data => this.getVendorRelatedTerms(data));
    // this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).valueChanges.subscribe(() => this.getDueDate(true, false));

    this.getData();
    this.getDepartment();

    this.fieldSubscription = this.automationServiceInstance.updateFocusListeners.subscribe(value => {
      if (value === AppFormConstants.FOCUS_LISTENER){
        this.departmentChangeFromAutomation = true;
        this.projectCodeChangeFromAutomation = true;
      }

      if (value && value.automationMst) {
        this.matchingAutomation = value.automationMst.automationWorkflowConfigs;
        this.isSubmissionWorkFlow = !value.automationMst.saveAsApprovedEnabled;
        this.isSaveAsApprovedWorkFlow = value.automationMst.saveAsApprovedEnabled;
        this.isWorkflowConfigAvailable = value.automationMst.workflowConfigAvailable;
      } else {
        this.clearAutomation();
      }
    });

    this.createEInvoiceForm.get('vendorId').valueChanges.subscribe((value) => {
      if (value) {
        this.ifVendorIsConfidentialGetApprovalUserList(this.approvalUserList, value);
        this.automationServiceInstance.setAutomationData(this.createEInvoiceForm, AppFormConstants.VENDOR_ID);
      }
    });
  }

  async getData(){
   await this.getModuleReheatedAdditionalField(AppDocumentType.BILL, false);

   this.setDocumentEvent();
   this.automationServiceInstance.setUpFocusListeners(this.createEInvoiceForm, this.renderer, this.el, this.setFieldValueDto,
        AppDocumentType.BILL, this.automationServiceInstance.billInputFieldsForAutomation);
    this.getTransactionData();


    this.createEInvoiceForm.get(AppFormConstants.PROJECT_CODE_ID).valueChanges.subscribe((value) => {
      if (value){
        this.billUtility.patchProjectTaskToLine(this.expenseCostDistributionForms, null, value);
      }
      if (value !== this.previousProjectCodeId) {
        if (value){
          this.commonUtil.patchHeaderLevelDepartmentAndProjectCodeLineLevel(AppFormConstants.PROJECT_CODE_ID, value);
        }
        this.previousProjectCodeId = this.createEInvoiceForm.get(AppFormConstants.PROJECT_CODE_ID).value;
      }
    });

    this.createEInvoiceForm.get(AppFormConstants.DEPARTMENT_ID).valueChanges.subscribe((value) => {
      if (value){
        this.commonUtil.patchHeaderDepartmentToLineLevel(this.createEInvoiceForm, -1, false, null, true, true);
      }
      if (value !== this.previousDepartmentId) {
        if (value){
          this.commonUtil.patchHeaderLevelDepartmentAndProjectCodeLineLevel(AppFormConstants.DEPARTMENT_ID, value);
        }
        this.previousDepartmentId = this.createEInvoiceForm.get(AppFormConstants.DEPARTMENT_ID).value;
      }
    });
  }

  get f() {
    return this.createEInvoiceForm.controls;
  }

  setDocumentEvent() {
    this.createEInvoiceForm.get('event').patchValue(AppDocuments.DOCUMENT_EVENT_SUBMITTED);
    this.createEInvoiceForm.get(AppFormConstants.PATCH_SET_FIELD_FULL_OBJECT).patchValue(true);
  }

  getTransactionData() {
    const vendorId = this.vendorId ? this.vendorId : 0;
    this.expenseService.getSelectedTransactionList(vendorId).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        const transactionList = res.body
        if (transactionList.length > 0) {
          transactionList.forEach((value, i) => {
            this.addExpenseFieldOnClick();
            value.cardNo = value.cardNoStr;
            if (value.departmentId){
              this.commonUtil.isDepartmentAvailable = true;
            }
            if (value.projectCodeId || value.projectId){
              this.commonUtil.isProjectCodeAvailable = true;
            }
            value.missingReceiptAvailabilityBln = value.missingReceiptAvailability == 'Y';
          });
          this.createEInvoiceForm.get('creditCardTransactionList').patchValue(transactionList);
          this.createEInvoiceForm.get(AppFormConstants.VENDOR_ID).patchValue(this.vendorId);
          this.getTotalCostDistribution();
        }
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getDepartment() {
    this.billsService.getDepartment(true).subscribe((res: any) => {
      this.department.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  termManuallyChanged() {
    this.createEInvoiceForm.get('termManuallyChanged').patchValue(true);
  }

  changeVendor(event){
    this.automationServiceInstance.setAutomationData(this.createEInvoiceForm, AppFormConstants.VENDOR_ID);
    if (event.value === AppConstant.NULL_VALUE || event.value === AppConstant.UNDEFINED_VALUE) {
      this.approvalUserList.data = [];
      this.adHocWorkflowDetails.controls = [];
      this.addAdHocWorkflowDetail();
    }
    if (event.value !== AppConstant.ZERO && event.value) {
      this.approvalUserList.data = [];
      this.adHocWorkflowDetails.controls = [];
      this.initApprover();
      this.ifVendorIsConfidentialGetApprovalUserList(this.approvalUserList, event.value);
    }
  }

  changeProjectCode(){
    this.automationServiceInstance.setAutomationData(this.createEInvoiceForm, AppFormConstants.PROJECT_CODE_ID);
  }

  changeDepartment(){
    this.automationServiceInstance.setAutomationData(this.createEInvoiceForm, AppFormConstants.DEPARTMENT_ID);
  }

  changePaymentTerm(){
    this.automationServiceInstance.setAutomationData(this.createEInvoiceForm, AppFormConstants.TERM);
  }

  changeBillDate(){
    this.automationServiceInstance.setAutomationData(this.createEInvoiceForm, AppFormConstants.BILL_DATE);
  }

  getVendorRelatedTerms(id) {
    return new Promise(resolve => {
      if (!id || this.createEInvoiceForm.get('termManuallyChanged').value) {
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
   * this method can be used to get due date
   */
  getDueDate(data, fromTerm, fromNet, fromDue) {
    const dateFormat = this.dateFormat.DATE_FORMAT;
    let billDate = this.createEInvoiceForm.get(AppFormConstants.BILL_DATE).value;
    let netDays = this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).value;
    const term = this.createEInvoiceForm.get(AppFormConstants.TERM).value;
    let dueDate = this.createEInvoiceForm.get(AppFormConstants.DUE_DATE).value;

    if (term == AppConstant.DISCOUNT_TERM_OTHER && fromTerm) {
      this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).setValidators(Validators.compose([Validators.min(0)]));
      this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).updateValueAndValidity();
    } else if (fromTerm) {
      this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).clearValidators();
      this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).updateValueAndValidity();
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
          this.automationServiceInstance.triggerFocusListeners(AppFormConstants.NET_DAYS_DUE);
        }
      }
    });
  }

  /**
   * this method can be used to init approver dropdown
   */
  initApprover() {
    this.addAdHocWorkflowDetail();
  }

  departmentChangedExp(){
    this.automationServiceInstance.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER, this.element);
  }

  /**
   * Change Department from account Table
   * @param event drop down
   * @param index
   */
  changedDepartmentAccount(event, index) {
    if (event.value === 0) {
      this.departmentPanel = true;
      this.expenseCostDistributionForms.controls[index].get('departmentId').reset();
    }
  }

  amountChanged(){
    this.automationServiceInstance.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER, this.element);
  }

  /**
   * This method can use for get controllers in form array
   */
  public get adHocWorkflowDetails() {
    return this.createEInvoiceForm.get('adHocWorkflowDetails') as UntypedFormArray;
  }

  /**
   * this method can be used loading
   */
  loadingButton() {
    return (this.isLoading || this.isLoadingSaveAsApproved || this.isSaveLoading);
  }

  /**
   * this method can be used to closed the e invoice screen
   */
  closeEInvoiceCreateMode() {
    this.isClickCloseButton.emit(false);
  }

  /**
   * this method can be used to create e invoice
   */
  createEInvoice(action) {
    const billMasterDto = this.createEInvoiceForm.value;
    billMasterDto.additionalData = this.commonUtil.formatMultisetValues(billMasterDto.additionalData);
    billMasterDto.creditCardTransactionList = this.commonUtil.formatMultisetLineValues(billMasterDto.creditCardTransactionList);

    let billDate = this.createEInvoiceForm.get('billDate').value;
    if (billDate) {
      billMasterDto.billDate = billDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    }

    billMasterDto.attachments = this.attachments;

    if (this.createEInvoiceForm.valid) {
      if (action === 'SUBMIT_FOR_APPROVED') {
        this.createBillSubmitForApproved(billMasterDto);
      } else if (action === 'SAVE_AS_APPROVED') {
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
   * this method can be used for bill save as approved
   * @param billMasterDto to bill master dto
   */
  createBillSaveAsApproved(billMasterDto) {
    this.expenseService.saveTransactionsAsBill(billMasterDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.BILL_SAVE_AS_APPROVED_SUCCESSFULLY);
        this.updateGrid.emit();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.isLoadingSaveAsApproved = false;
    }, error2 => {
      this.isLoadingSaveAsApproved = false;
      this.notificationService.errorMessage(error2);
    });
  }

  accountChangedExpTable(){
      console.log(document)
    this.automationServiceInstance.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER, this.element);
  }

  /**
   * this method can be used to bill submit for approved
   */
  createBillSubmitForApproved(billMasterDto) {
    this.expenseService.submitForTransactionsAsBill(billMasterDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.SUBMITTED_SUCCESSFULLY);
        this.updateGrid.emit();
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
   * This method can be used to validate from events
   */
  validateButtonOnChangeAddOption() {
    if (!(this.editView)) {
      return;
    } else {
      this.isEnabledSubmitForApprovalButton = this.adHocWorkflowDetails.controls.filter(x =>
        ((x.get('approvalUser').value != null) || (x.get('approvalGroup').value != null)) &&
        x.get('completed').value === false).length > AppConstant.ZERO;
    }
  }

  /**
   * remove AddHocWorkflow
   * @param index number
   */
  removeAdHocWorkflow(index: number) {
    this.adHocWorkflowDetails.removeAt(index);
    this.validateButtonOnChangeAddOption();
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


  getApprovalGroupList() {
    this.billsService.getApprovalGroupList(!this.editView).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.approvalGroupList.data = res.body;
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
    const authorities = [AppAuthorities.BILL_APPROVE, AppAuthorities.BILL_REJECT, AppAuthorities.BILL_OVERRIDE_APPROVAL];
    this.billsService.getApprovalUserListAccordingToVendorSelection(this.billMasterDto.createdBy, authorities, vendorId, !this.editView).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        listInstance.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * this method can be used to reset e invoice form
   */
  resetEInvoiceForm() {
    this.commonUtil.projectCodeChanges = [];
    this.commonUtil.departmentChanges = [];
    this.createEInvoiceForm.reset();
    this.automationServiceInstance.resetSetFieldValueData();
    this.setDocumentEvent();
    this.headingSectionArray.clear();
    this.expenseCostDistributionForms.clear();
    this.adHocWorkflowDetails.clear();
    this.additionalFieldForExpenseCostDistributions = [];
    this.headerAdditionalFieldDetails = [];
    this.billUtility.matchingTableValues = [];
    this.billUtility.isViewMatchingTable = false;
    this.departmentChangeFromAutomation = false;
    this.projectCodeChangeFromAutomation = false;
    this.adHocWorkflowDetails.controls = [];
    this.attachments = [];
    this.billUtility.isCheckedPayWhenCustomerPay = false;
    this.clearAutomation();
    this.getTransactionData();
    this.initApprover();
    this.getModuleReheatedAdditionalField(AppDocumentType.BILL, false);
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


  /**
   * This method add account to array with additional field
   */
  addExpenseFieldOnClick() {
    const itemInfo = this.formBuilder.group({
      id: [null],
      accountId: [null],
      accountNumber: [null],
      accountName: [null],
      description: [null],
      amount: [null],
      departmentId: [null],
      projectId: [null],
      projectCodeName: [null],
      billableBln: [null],
      taxableBln: [false],
      transactionId: [null],
      hideAccountNumberInput: [false],
      additionalData: this.formBuilder.array([])
    });
    this.expenseCostDistributionForms.push(itemInfo);
    const len = (this.expenseCostDistributionForms.length - 2);
    this.billUtility.addEmptyDropDownReferenceForAccountField();
    this.addExpenseFields(len);
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
   * this method can be used to upload file list
   * @param event to event
   */
  changeFileList(event) {
    this.attachments.push(...event.addedFiles);
  }

  getVendorList() {
    this.billsService.getVendorList().subscribe((res: any) => {
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

  /**
   * this method can be used to get if vendor is confidential get approval user list
   */
  changeVendorList(event) {
    if (event.value == AppConstant.ZERO) {
      this.isAddVendor = true;
      this.createEInvoiceForm.controls.vendorId.reset();
    }
  }

  clearAutomation() {
    this.matchingAutomation = null;
    this.isSubmissionWorkFlow = false;
    this.isSaveAsApprovedWorkFlow = false;
    this.isWorkflowConfigAvailable = false;
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

          this.additionalFieldResponse.forEach(((field) => {
            this.commonUtil.manageDropDownData(field, isDetailView);

            if (field.sectionId === AppModuleSection.MASTER_DATA_INPUT_SECTION_ID) {
              this.addHeadingField(field);
            }

            if (field.sectionId === AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID) {
              this.addAdditionalFieldForExpenseCostDistributionTable(field);
            }
          }));
          resolve();
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
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
   * return form array data
   */
  public get headingSectionArray() {
    return this.createEInvoiceForm.get('additionalData') as UntypedFormArray;
  }


  /**
   * This method use for add line item data additional field and field validations
   */
  public addAdditionalFieldForExpenseCostDistributionTable(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.billMasterDto.creditCardTransactionList, field, false, !this.editView)) {
      return;
    }
    this.additionalFieldForExpenseCostDistributions.push(field);
    this.expenseCostDistributionForms.controls.forEach((value, index) => {
      this.expenseCostDistributionAdditionalFields(index).push(this.commonUtil.getAdditionalFieldValidations(field, false));
    });
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
   * This method use for view additional option input drawer
   * @param event to change event
   * @param additionalFieldDetailDto AdditionalFieldDetailDto
   * @param additionalField to AdditionalFieldDetailDto
   * @param multiSelect to multiSelect dropdown
   */
  addNewAdditionalDropDownOption(event: any, additionalFieldDetailDto: AdditionalFieldDetailDto,
                                 additionalField: AbstractControl, multiSelect) {
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
   * This method use for choose file for upload
   * @param event any
   * @param additionalField to index array instance
   * @param indexNumber to index number
   */
  changeFileInput(event: any, additionalField, indexNumber) {
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
  fileUploadClick(fileUpload, i: any) {
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
   * This method can use for get controllers in form array
   */
  public get expenseCostDistributionForms() {
    return this.createEInvoiceForm.get('creditCardTransactionList') as UntypedFormArray;
  }

  /**
   * This method returns the line item section additional detail controllers as an array
   */
  public expenseCostDistributionAdditionalFields(index) {
    return this.expenseCostDistributionForms.controls[index].get('additionalData') as UntypedFormArray;
  }


  removeExpenseCostDistributionRecord(i) {
    this.expenseCostDistributionForms.removeAt(i);
    this.automationServiceInstance.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER, this.element);
  }

  /**
   * This method use for calculate total of cost distributions
   */
  getTotalCostDistribution() {
    let expenseCostDistributionAmount = 0.00;
    let count = 0;
    let billAmount: number;
    for (const expenseCost of this.expenseCostDistributionForms.controls) {
      count++;
      if (expenseCost.value.amount) {
        expenseCostDistributionAmount += expenseCost.value.amount;
      }
    }
    billAmount = expenseCostDistributionAmount;
    this.createEInvoiceForm.get('billAmount').patchValue(billAmount);
    this.emitCountTotal.emit({total: billAmount, count: count})
  }

  updateAdditionalFieldDropDowns(data?) {
    if (data) {
      this.selectedAdditionalField = data;
    }
    this.commonUtil.updateAdditionalFiledDropdowns(this.headerAdditionalFieldDetails, this.selectedAdditionalField);
    this.commonUtil.updateAdditionalFiledDropdowns(this.additionalFieldForExpenseCostDistributions, this.selectedAdditionalField);
  }

  /**
   * this method used to get project code list
   */
  getProjectCodeList() {
    this.billsService.getProjectTaskUserWise(AppConstant.PROJECT_CODE_CATEGORY_ID, false, this.billId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.projectTasks.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
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

  getAccountNameForExpenseContributionTable(id, i: any) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    this.expenseCostDistributionForms.controls[i].get('accountNumber').reset();
    this.expenseCostDistributionForms.controls[i].get('accountName').reset();
    if (id !== null && id !== 0) {
      this.billApprovalsService.getAccountName(id).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.expenseCostDistributionForms.controls[i].get('accountNumber').patchValue(res.body.number);
          this.expenseCostDistributionForms.controls[i].get('accountName').patchValue(res.body.name);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * This method use for view additional option input drawer when user click footer add new button
   * @param additionalFieldDetailDto AdditionalFieldDetailDto
   */
  setSelectedAdditionalField(additionalFieldDetailDto: AdditionalFieldDetailDto) {
    this.selectedAdditionalField = additionalFieldDetailDto;
  }

  ngAfterViewInit() {
    this.automationServiceInstance.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER, this.element);
  }

  ngOnDestroy(): void {
    this.fieldSubscription.unsubscribe();
    this.automationServiceInstance.cleanupListeners();
  }
}
