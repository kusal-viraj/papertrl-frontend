import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
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
import {ExpenseService} from '../../../shared/services/expense/expense.service';
import {PoService} from '../../../shared/services/po/po.service';
import {ExpenseUtility} from '../expense-utility';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {ExpenseMasterDto} from '../../../shared/dto/expense/expense-master-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppIcons} from '../../../shared/enums/app-icons';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {AppDocuments} from '../../../shared/enums/app-documents';
import {ConfirmationService} from 'primeng/api';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';
import {AvailableDraft} from '../../../shared/dto/expense/available-draft';
import {MileageRateService} from '../../../shared/services/settings/mileage-rate/mileage-rate.service';
import {DataFormatToISODate} from '../../../shared/utility/data-format-toISODate';
import {ManageDrawerService} from '../../../shared/services/common/manage-drawer-status/manage-drawer.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {MandatoryFields} from '../../../shared/utility/mandatory-fields';
import {DecimalPipe} from '@angular/common';
import {ManageFeatureService} from '../../../shared/services/settings/manage-feature/manage-feature.service';
import {AppFeatureId} from '../../../shared/enums/app-feature-id';
import {GoogleAnalyticsService} from '../../../shared/services/google-analytics/google-analytics.service';
import {AppAnalyticsConstants} from '../../../shared/enums/app-analytics-constants';
import {Dropdown} from 'primeng/dropdown';
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {Subscription} from 'rxjs';
import {SetFieldValueDto} from '../../../shared/dto/automation/set-field-value-dto';

@Component({
  selector: 'app-expense-create',
  templateUrl: './expense-create.component.html',
  styleUrls: ['./expense-create.component.scss']
})
export class ExpenseCreateComponent extends MandatoryFields implements OnInit, OnDestroy {
  createExpenseForm: UntypedFormGroup;
  public expenseUtility: ExpenseUtility;
  public removeSpace: RemoveSpace = new RemoveSpace();
  public projectTaskList: DropdownDto = new DropdownDto();
  @Input() detailView = false;
  @Input() expenseStatusFromList: string;
  @Input() editView = false;
  @Input() isFromDraft = false;
  @Input() isEditAndResubmit = false;
  @Input() expenseID: any;
  @Output() isSuccessSaveAsApproved = new EventEmitter();
  @Output() closeExpense = new EventEmitter();
  @Output() emitAfterSuccess = new EventEmitter();

  @ViewChild('reportNameInput') public reportNameInput: ElementRef;
  @ViewChild('dpNameDepartment') public dpNameDepartment: ElementRef;

  public matchingAutomation: any;
  public isSubmissionWorkFlow = false;
  public isSaveAsApprovedWorkFlow = false;
  public isWorkflowConfigAvailable = false;
  public appFieldType = AppFieldType;
  public additionalFieldResponse: AdditionalFieldDetailDto[];
  public headerAdditionalFieldDetails: AdditionalFieldDetailDto[] = new Array();
  public lineItemAdditionalFieldDetails: AdditionalFieldDetailDto[] = new Array();
  public appConstant: AppConstant = new AppConstant();
  public expenseResponseData: ExpenseMasterDto = new ExpenseMasterDto();
  public expenseAccountListForEdit: DropdownDto = new DropdownDto();
  public selectedAdditionalField: AdditionalFieldDetailDto;
  public department: DropdownDto = new DropdownDto();
  public addNewDropDown = false;
  public appAuthorities = AppAuthorities;
  public isAddNewProjectCodes = false;
  public isAddNewAccount = false;
  public expenseTypePanel = false;
  public addVendorPanel: boolean;
  public isSaveAsDraft = false;
  public isShowDraftListPopUp = false;
  public isClickedEditButtonFromDraftList = false;
  public approvalGroupList: DropdownDto = new DropdownDto();
  public createdBy: string;
  public enums = AppEnumConstants;
  public appFormConstants = AppFormConstants;
  netAmount: number;
  isLoading = false;
  isSubmission = false;
  isMarkAsApproved = false;
  expenseAdditionalAttachments: any [] = [];
  additionalFieldAttachments: any [] = [];
  previousAdHocWorkflowDetails: any [] = [];
  workflowDetails: any [] = [];
  public userAvailableDraftList: AvailableDraft [] = [];
  public commonUtil = new CommonUtility();
  public expenseStatus: any;
  public iconEnum = AppIcons;
  public filteredWorkflowList: any[];
  public isEnabledSubmitForApprovalButton = false;
  public isSubmitted = false;
  public isAvailableAwaitingApproval = false;
  public isDraftNameAvailable = false;
  public isOverrideData = false;
  public draftId: any;
  public merchantResults: any;
  public approvalUserList: DropdownDto = new DropdownDto();
  public vendors: DropdownDto = new DropdownDto();
  public featureIdEnum = AppFeatureId;
  public featureIdList: any [] = [];
  public memorizationMerchant: boolean;
  public departmentPanel: boolean;
  public fieldSubscription: Subscription = new Subscription();
  setFieldValueDto: SetFieldValueDto = new SetFieldValueDto();
  previousDepartmentId;
  previousProjectCodeId;
  departmentChangeFromAutomation = false;
  departmentTimeout;

  constructor(public formBuilder: UntypedFormBuilder, public expenseService: ExpenseService, public poService: PoService,
              public privilegeService: PrivilegeService, public formGuardService: FormGuardService,
              public manageFeatureService: ManageFeatureService, public gaService: GoogleAnalyticsService,
              public notificationService: NotificationService, public additionalFieldService: AdditionalFieldService,
              public confirmationService: ConfirmationService, public billsService: BillsService, public decimalPipe: DecimalPipe,
              public mileageRateService: MileageRateService, public drawerService: ManageDrawerService,
              public automationService: AutomationService, private renderer: Renderer2, private el: ElementRef) {
    super(additionalFieldService, notificationService);
    this.getMemoristionfeature();
  }

  /**
   * this method can be used to get expense data
   */
  getExpenseData() {
    this.adHocWorkflowDetails.controls = [];
    this.expenseService.getExpenseDetails(this.expenseID, false).subscribe((res: any) => {
      this.departmentChangeFromAutomation = false;
      this.commonUtil.isDepartmentAvailable = res.body.isDepartmentAvailable;
      if (res.body.endDate) {
        res.body.endDate = new Date(res.body.endDate);
      }
      if (res.body.startFrom) {
        res.body.startFrom = new Date(res.body.startFrom);
      }
      this.changedVendorSelection(res.body.vendorId);
      this.expenseStatus = res.body.status;
      this.expenseResponseData = res.body;
      if (res.body.expenseDetails.length > AppConstant.ZERO) {
        res.body.expenseDetails.forEach((value, index) => {
          this.addExpenseRecords();

          if (value.receiptId) {
            value.prevReceiptId = value.receiptId;
          }
          if (value.expenseDate) {
            value.expenseDate = new Date(value.expenseDate);
            this.expenseDetails.controls[index].get('expenseDate').patchValue(value.expenseDate);
          }
          if (value.mileage) {
            value.mileageAmount = value.mileage * value.mileageRate;
          }
        });
      } else {
        this.addExpenseRecords();
      }
      if (res.body.previousAdHocWorkflowDetails) {
        this.previousAdHocWorkflowDetails = res.body.previousAdHocWorkflowDetails;
      }
      this.adHocWorkflowDetails.controls = [];
      if (res.body.adHocWorkflowDetails.length > AppConstant.ZERO) {
        res.body.adHocWorkflowDetails.filter(x => x.completed === false).length !== 0 ? this.isAvailableAwaitingApproval = true : this.isAvailableAwaitingApproval = false;
        res.body.adHocWorkflowDetails.filter(x => x.completed === false).length === 0 ? this.initApprover() : null;
        this.workflowDetails = res.body.adHocWorkflowDetails;
        res.body.adHocWorkflowDetails = res.body.adHocWorkflowDetails.sort((ap1, ap2) =>
            (ap2.approvalOrder > ap1.approvalOrder) ? -1 : ((ap2.approvalOrder > ap1.approvalOrder) ? 1 : 0));
        res.body.adHocWorkflowDetails.forEach((value) => {
          this.addAdHocWorkflowDetail();
        });
      } else if (res.body.status !== AppConstant.STATUS_PENDING) {
        this.initApprover();
      }

      if (res.body.expenseAttachments) {
        this.expenseAdditionalAttachments = res.body.expenseAttachments;
      }
      if (res.body.additionalFieldAttachments) {
        this.additionalFieldAttachments = res.body.additionalFieldAttachments;
      }

      this.expenseAdditionalAttachments.forEach((value, index) => {
        if (value.id === res.body.attachmentId) {
          this.expenseAdditionalAttachments.splice(index, 1);
        }
      });
      this.filteredWorkflowList = this.workflowDetails.filter(x => x.completed === false);
      res.body.expenseAttachments = [];
      this.getModuleReheatedAdditionalField(AppDocumentType.EXPENSE, false);

    });
  }

  ngOnInit() {
    this.expenseUtility = new ExpenseUtility(this.expenseService,
      this.notificationService, this.privilegeService, this.drawerService, this.billsService);
    if (!this.editView) {
      this.showAvailableDraftListPopUp();
    }
    this.initForm();
    this.getRequiredFields(this.createExpenseForm, AppDocumentType.EXPENSE);
    this.initAttachmentRecords();
    this.setDocumentEvent();
    if (this.editView) {
      this.getExpenseData();
      this.getAccountsForEdit(this.expenseAccountListForEdit);
    } else {
      this.initExpenseRecords();
      this.initApprover();
      this.getModuleReheatedAdditionalField(AppDocumentType.EXPENSE, false);
      this.getApprovalUserListVendor(null);
      this.automationService.setUpFocusListeners(this.createExpenseForm, this.renderer, this.el, this.setFieldValueDto, AppDocumentType.EXPENSE, this.automationService.expenseInputFieldsForAutomation);
    }

    this.fieldSubscription = this.automationService.updateFocusListeners.subscribe(value => {
      if (value === AppFormConstants.FOCUS_LISTENER) {
        this.departmentChangeFromAutomation = true;
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
    this.getProjectCodeList();
    this.getVendors();
    this.getDepartment();
    this.getApprovalGroupList();
    this.focusFirstElementAfterTabChange();
  }

  /**
   * get vendor list
   * @param listInstance to dropdown dto
   */
  getVendors() {
    this.billsService.getVendorList(!this.editView).subscribe((res: any) => {
      this.vendors.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * get project code list
   * @param listInstance to dropdown instance
   */
  getApprovalGroupList() {
    this.billsService.getApprovalGroupList(!this.editView).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.approvalGroupList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * get project code list
   * @param listInstance to dropdown instance
   */
  getProjectCodeList() {
    this.billsService.getProjectTask(AppConstant.PROJECT_CODE_CATEGORY_ID, !this.editView).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.projectTaskList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * get account list for edit screen
   * @param listInstance to dropdown dto
   */
  getAccountsForEdit(listInstance: DropdownDto) {
    this.expenseService.getExpenseAccountListForEdit().subscribe((res: any) => {
      listInstance.data = res;
      if (this.privilegeService.isAuthorized(AppAuthorities.ACCOUNTS_CREATE)) {
        listInstance.addNew();
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  initForm() {
    this.createExpenseForm = this.formBuilder.group({
      reportName: [null, Validators.compose([Validators.required, Validators.maxLength(50)])],
      id: [],
      businessPurpose: [null, Validators.compose([Validators.maxLength(50)])],
      notes: [],
      totalAmount: [0, Validators.min(0.001)],
      startFrom: [],
      endDate: [],
      uuid: [],
      receiptController: [],
      attachmentId: [],
      event: [],
      status: [],
      vendorId: [],
      departmentId: [],
      expenseAdditionalAttachmentIds: [],
      totalMileageAmount: [],
      totalMilesDriven: [],
      focusListener: [],
      patchSetFieldFullObject: [false],
      expenseDetails: this.formBuilder.array([]),
      expenseAttachments: this.formBuilder.array([]),
      adHocWorkflowDetails: this.formBuilder.array([]),
      additionalData: this.formBuilder.array([])
    });

    this.createExpenseForm.get(AppFormConstants.DEPARTMENT_ID).valueChanges.subscribe((value) => {
      if (value){
        this.commonUtil.patchHeaderDepartmentToLineLevel(this.createExpenseForm, -1, this.editView, null, true, true);
      }
      if (value !== this.previousDepartmentId) {
        if (value && ((this.departmentChangeFromAutomation && this.editView) || !this.editView)){
          this.commonUtil.patchHeaderLevelDepartmentAndProjectCodeLineLevel(AppFormConstants.DEPARTMENT_ID, value);
        }
        this.previousDepartmentId = this.createExpenseForm.get(AppFormConstants.DEPARTMENT_ID).value;
      }
    });
  }

  setDocumentEvent() {
    let event = AppDocuments.DOCUMENT_EVENT_SUBMITTED;
    if (this.editView && this.createExpenseForm.get('status').value !== this.enums.STATUS_DRAFT) {
      event = AppDocuments.DOCUMENT_EVENT_EDIT;
    }
    if (this.createExpenseForm.get('status').value === this.enums.STATUS_REJECT) {
      event = AppDocuments.DOCUMENT_EVENT_EDIT_RESUBMIT;
    }
    this.createExpenseForm.get('event').patchValue(event);
    this.createExpenseForm.get(AppFormConstants.PATCH_SET_FIELD_FULL_OBJECT).patchValue(
      (this.createExpenseForm.get('status').value === this.enums.STATUS_DRAFT || this.editView));
  }

  /**
   * this method can be used to create expense
   * @param editOnly
   * @param isSubmit
   * @param type to action type
   */
  createExpense(editOnly, isSubmit, type, lable) {

    let eventLabel = '';

    switch (lable) {
      case AppAnalyticsConstants.SUBMIT_FOR_APPROVED:
        eventLabel = AppAnalyticsConstants.SUBMIT_FOR_APPROVED;
        break;
      case AppAnalyticsConstants.SAVE_AS_APPROVED:
        eventLabel = AppAnalyticsConstants.SAVE_AS_APPROVED;
        break;
      case AppAnalyticsConstants.RESUBMIT:
        eventLabel = AppAnalyticsConstants.RESUBMIT;
        break;
      case AppAnalyticsConstants.SAVE:
        eventLabel = AppAnalyticsConstants.SAVE;
        break;
      default:
        // Handle default case here
        break;
    }

    if (eventLabel !== '') {
      this.gaService.trackScreenButtonEvent(
        eventLabel,
        AppAnalyticsConstants.MODULE_NAME_EXPENSES,
        eventLabel,
        AppAnalyticsConstants.CREATE_SCREEN
      );
    }

    this.isSubmitted = isSubmit;

    if (this.editView) {
      this.commonUtil.validateFileInput(this.createExpenseForm.get('additionalData'), this.additionalFieldAttachments);
    }

    if (this.createExpenseForm.valid) {

      this.createExpenseForm.value.additionalData = this.commonUtil.formatMultisetValues(this.createExpenseForm.value.additionalData);
      this.createExpenseForm.value.expenseDetails = this.commonUtil.formatMultisetLineValues(this.createExpenseForm.value.expenseDetails);

      if (this.editView || this.isOverrideData) {
        editOnly = !(this.expenseStatus == this.enums.STATUS_REJECT && !isSubmit);

        this.updateExpenseService(editOnly, type);
      } else {
        this.createExpenseService();
      }
    } else {
      this.isLoading = false;
      this.isSubmission = false;
      this.isMarkAsApproved = false;
      new CommonUtility().validateForm(this.createExpenseForm);
    }
  }

  /**
   * this method can be used to reset po form
   */
  resetExpenseForm() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.MODULE_NAME_EXPENSES,
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.CREATE_SCREEN
    );
    this.departmentChangeFromAutomation = false;
    this.automationService.resetSetFieldValueData();
    this.resetComponent();
    this.setDocumentEvent();
    this.commonUtil.departmentChanges = [];
    this.isOverrideData = false;
    this.isDraftNameAvailable = false;
    if (this.editView) {
      this.adHocWorkflowDetails.controls = [];
      this.getExpenseData();
    } else {
      this.initExpenseRecords();
      this.getModuleReheatedAdditionalField(AppDocumentType.EXPENSE, false);
    }
  }


  getDepartment() {
    this.billsService.getDepartment(!this.editView).subscribe((res: any) => {
      this.department.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * reset component data
   */
  resetComponent() {
    this.createExpenseForm.reset();
    this.clearAutomation();
    this.expenseDetails.controls.length = 0;
    this.lineItemAdditionalFieldDetails = [];
    this.headerAdditionalFieldDetails = [];
    this.headingSectionArray.controls = [];
    this.additionalAttachments.controls = [];
    this.adHocWorkflowDetails.controls = [];
    this.initAttachmentRecords();
    this.initApprover();
  }

  /**
   * close side drower
   */
  close() {
    this.closeExpense.emit(false);
  }

  onClickReceipt(receiptID: string, i: number) {
    document.getElementById(receiptID + i).click();
  }

  /*
    GRID VIEW CHANGES ------------------------------------------------------------------------------------------------>
   */


  navigate(e, name: string, i: any) {
    switch (e.key) {
      case 'ArrowDown':
        if ((this.expenseDetails.length) - 2 === i) {
          this.addExpenseRecords();
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


  /*
  ----------------CREATE/EDIT FUNCTION---------------------------------------------------------------------------------->
   */

  createExpenseService() {
    let expenseDate;

    this.expenseDetails.controls.forEach((formGroupInstance => {
      try {
        if (formGroupInstance.value.expenseDate) {
          expenseDate = formGroupInstance.value.expenseDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
          formGroupInstance.get('expenseDate').patchValue(expenseDate);
        }
      } catch (e) {
      }
    }));

    const obj = this.createExpenseForm.value;

    try {
      obj.startFrom = (this.createExpenseForm.get('startFrom').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
    } catch (e) {
    }

    try {
      obj.endDate = (this.createExpenseForm.get('endDate').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
    } catch (e) {
    }
    obj.expenseAccountIdList = obj.expenseDetails?.map(r => r.accountId)?.filter(x => x);
    obj.projectCodeIdList = obj.expenseDetails?.map(r => r.projectCodeId)?.filter(x => x);
    this.expenseService.createExpense(obj).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.EXPENSE_CREATED_SUCCESSFULLY);
        this.resetExpenseForm();
        this.emitAfterSuccess.emit();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.isLoading = false;
      this.isSubmission = false;
      this.isSaveAsDraft = false;
    }, error => {
      this.isLoading = false;
      this.isSubmission = false;
      this.isSaveAsDraft = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method used for create/edit draft
   */
  createDraft() {
    if (this.editView) {
      this.commonUtil.validateFileInput(this.createExpenseForm.get('additionalData'), this.additionalFieldAttachments);
    }
    this.createExpenseForm.value.additionalData = this.commonUtil.formatMultisetValues(this.createExpenseForm.value.additionalData);
    this.createExpenseForm.value.expenseDetails = this.commonUtil.formatMultisetLineValues(this.createExpenseForm.value.expenseDetails);

    let expenseDate;

    this.expenseDetails.controls.forEach((formGroupInstance => {
      try {
        if (formGroupInstance.value.expenseDate) {
          expenseDate = formGroupInstance.value.expenseDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
          formGroupInstance.get('expenseDate').patchValue(expenseDate);
        }
      } catch (e) {
      }
    }));

    const obj = this.createExpenseForm.value;

    try {
      obj.startFrom = (this.createExpenseForm.get('startFrom').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
    } catch (e) {
    }

    try {
      obj.endDate = (this.createExpenseForm.get('endDate').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
    } catch (e) {
    }

    // Current attachment id list
    obj.expenseAdditionalAttachmentIds = [];
    this.expenseAdditionalAttachments.forEach((val) => {
      obj.expenseAdditionalAttachmentIds.push(val.id);
    });

    this.expenseService.createExpenseDraft(obj, this.editView, this.isOverrideData).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.editView ? this.notificationService.successMessage(HttpResponseMessage.DRAFT_UPDATED_SUCCESSFULLY) :
          this.notificationService.successMessage(HttpResponseMessage.DRAFT_SAVED_SUCCESSFULLY);
        this.resetExpenseForm();
        this.closeExpense.emit();
        this.emitAfterSuccess.emit();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.isLoading = false;
      this.isSubmission = false;
      this.isSaveAsDraft = false;
    }, error => {
      this.isLoading = false;
      this.isSubmission = false;
      this.isSaveAsDraft = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to update expense
   */

  updateExpenseService(editOnly, type) {
    let expenseDate;

    if (this.editView) {
      this.commonUtil.validateFileInput(this.createExpenseForm.get('additionalData'), this.additionalFieldAttachments);
    }

    this.createExpenseForm.value.additionalData = this.commonUtil.formatMultisetValues(this.createExpenseForm.value.additionalData);
    this.createExpenseForm.value.expenseDetails = this.commonUtil.formatMultisetLineValues(this.createExpenseForm.value.expenseDetails);

    this.expenseDetails.controls.forEach((formGroupInstance => {
      try {
        if (formGroupInstance.value.expenseDate) {
          expenseDate = formGroupInstance.value.expenseDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
          formGroupInstance.get('expenseDate').patchValue(expenseDate);
        }
      } catch (e) {
      }
    }));

    const obj = this.createExpenseForm.value;

    try {
      obj.startFrom = (this.createExpenseForm.get('startFrom').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
    } catch (e) {
    }

    try {
      obj.endDate = (this.createExpenseForm.get('endDate').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
    } catch (e) {
    }

    // Current attachment id list
    obj.expenseAdditionalAttachmentIds = [];
    this.expenseAdditionalAttachments.forEach((val) => {
      obj.expenseAdditionalAttachmentIds.push(val.id);
    });
    obj.expenseAccountIdList = obj.expenseDetails?.map(r => r.accountId)?.filter(x => x);
    obj.projectCodeIdList = obj.expenseDetails?.map(r => r.projectCodeId)?.filter(x => x);

    this.expenseService.editExpense(obj, editOnly).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        if ((this.isOverrideData || this.expenseStatus === AppEnumConstants.STATUS_DRAFT) && type === 'save_as_approved') {
          this.notificationService.successMessage(HttpResponseMessage.EXPENSE_SAVE_AS_APPROVED_SUCCESSFULLY);
        } else if ((this.isOverrideData || this.expenseStatus === AppEnumConstants.STATUS_DRAFT) && type === 'submit') {
          this.notificationService.successMessage(HttpResponseMessage.EXPENSES_SUBMITTED_SUCCESSFULLY);
        } else {
          this.expenseStatus == this.enums.STATUS_APPROVED && this.isSubmitted ?
            this.notificationService.successMessage(HttpResponseMessage.EXPENSES_SUBMITTED_SUCCESSFULLY)
            : this.notificationService.successMessage(HttpResponseMessage.EXPENSE_UPDATED_SUCCESSFULLY);
        }
        this.closeExpense.emit();
        this.emitAfterSuccess.emit();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.isLoading = false;
      this.isSubmission = false;
      this.isMarkAsApproved = false;
    }, error => {
      this.isLoading = false;
      this.isMarkAsApproved = false;
      this.isSubmission = false;
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * This method can use for get controllers in form array
   */
  public get expenseDetails() {
    return this.createExpenseForm.get('expenseDetails') as UntypedFormArray;
  }

  /**
   * This method can use for get controllers in form array
   */
  public get additionalAttachments() {
    return this.createExpenseForm.get('expenseAttachments') as UntypedFormArray;
  }

  /**
   * This method can use for get controllers in form array
   */
  public get adHocWorkflowDetails() {
    return this.createExpenseForm.get('adHocWorkflowDetails') as UntypedFormArray;
  }

  /*
APPROVE FORM ARRAY DETAILS------------------------------------------------------------------------------------------------->
*/

  /**
   * this method can be used to init approver dropdown
   */
  initApprover() {
    this.addAdHocWorkflowDetail();
  }

  /**
   * add new approver
   */
  addAdHocWorkflowDetail() {
    const addHocWorkflowDetail = this.formBuilder.group({
      id: [null],
      approvalOrder: [null],
      approvalGroup: [null],
      approvalUser: [null],
      completed: [false],
    });
    this.adHocWorkflowDetails.push(addHocWorkflowDetail);
    const adHocWorkFlowOrderNumber = this.adHocWorkflowDetails.length;
    this.adHocWorkflowDetails.controls[adHocWorkFlowOrderNumber - 1].get('approvalOrder').patchValue(adHocWorkFlowOrderNumber);
    this.validateButtonOnChangeAddOption();
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
  EXPENSE FORM ARRAY--------------------------------------------------------------------------------------------------->
   */

  /**
   * add expense records
   */

  initExpenseRecords() {
    for (let i = 0; i < 10; i++) {
      this.addExpenseRecords();
    }
  }


  /**
   * This method can be used to remove items
   */
  removeItem(i) {
    this.expenseDetails.removeAt(i);
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
  }


  /*
ADDITIONAL ATTACHMENTS FORM ARRAY-------------------------------------------------------------------------------------->
 */

  initAttachmentRecords() {
    this.addAttachmentRecords();
  }

  /**
   * init expense detail data
   */
  addAttachmentRecords() {
    const attachmentForm = this.formBuilder.group({
      attachmentController: [],
      description: [],
      file: [],
      id: [],
      additionalData: this.formBuilder.array([])
    });
    this.additionalAttachments.push(attachmentForm);
  }


  /**
   * Remove expense detail
   * @param attachmentIndex to index
   */

  removeAttachmentField(attachmentIndex) {
    this.additionalAttachments.removeAt(attachmentIndex);
  }


  /*
  CALCULATION EXPENSE NET AMOUNT---------------------------------------------------------------------------------------->
   */

  /**
   * This method can use for calculate expense Total
   */
  calculateExpenseTotal() {
    let totalAmount = 0.0;
    this.expenseDetails.controls.forEach(value => {
      const amount: number = value.get('amount').value;
      if (amount != null) {
        totalAmount = totalAmount += amount;
      }
    });
    this.createExpenseForm.get('totalAmount').patchValue(totalAmount);
  }

  /*
  -------PATCH FILE TO FORM ARRAY------------------------------------------------------------------------------------------>
   */

  /**
   * this method can be use to change file receipt
   * @param event to event to change event
   * @param i to event to change event
   */
  changeReceipt(event, i) {
    if (this.expenseUtility.validateExpenseAttachments(event.target.files[0])) {
      const targetFile = event.target.files[0];
      this.expenseDetails.controls[i].patchValue({
        receipt: targetFile
      });
    }
  }

  /**
   * this method can be used to patch row file to list
   * @param event to event to change event
   * @param attachmentIndex to index
   */
  changeAdditionalAttachment(event, attachmentIndex) {
    if (this.expenseUtility.validateExpenseAttachments(event.target.files[0])) {
      const targetFile = event.target.files[0];
      this.additionalAttachments.controls[attachmentIndex].patchValue({
        file: targetFile
      });
    }
  }

  /*
--------------------------------------------------------------------------------------------------------------------------------->
 */

  /**
   * this method can be used to get formatted date
   * @param i to index
   */
  getDate(i) {
    this.expenseDetails.controls[i].get('expenseDate').patchValue(this.expenseDetails.controls[i].value.expenseDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
  }

  /*
  --------------------------------DOWNLOAD ATTACHMENTS---------------------------------------------------------------------------------->
   */

  /**
   * this method can be used to download method
   * @param attachment to attachment
   */
  downloadAttachment(attachment) {
    if (attachment.fieldId) {
      this.expenseUtility.downloadAdditionalAttachment(attachment.id);
    } else {
      this.expenseUtility.commonDownloadAttachment(attachment);
    }
  }

  /**
   * this method can be used to clear additional attachment
   */
  deleteAttachment(attachment, i) {
    if (attachment) {
      this.expenseAdditionalAttachments.splice(i, 1);
    }
  }

  /**
   * this method can be used to download method
   * @param receiptIndex to index
   */
  downloadReceipt(receiptIndex) {
    const attachmentId = this.expenseDetails.controls[receiptIndex].get('receiptAttachment').value;
    this.expenseUtility.commonDownloadAttachment(attachmentId);
  }

  /*
--------------------------------------------------------------------------------------------------------------------------->
 */


  deleteAdditionalFieldAttachment(attachment, i) {
    this.confirmationService.confirm({
      key: 'expenseAdditionalFieldAttachment',
      message: 'You want to delete this Attachment!',
      accept: () => {
        this.expenseService.deleteAdditionalFieldAttachment(attachment.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.EXPENSE_ATTACHMENT_DELETED_SUCCESSFULLY);
            this.additionalFieldAttachments.splice(i, 1);
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
   * this method can be used to clear receipt
   * @param i to index
   */
  clearReceipt(i) {
    this.expenseDetails.controls[i].get('receiptAttachment').reset();
    this.expenseDetails.controls[i].get('attachmentId').reset();
    this.expenseDetails.controls[i].get('receipt').reset();
  }

  /*
---------------------------------------------------------------------------------------------------------------------------->
 */

  /**
   * this method can be used to create expense as approved
   */
  createExpenseAsApproved() {
    if (this.createExpenseForm.valid) {
      let expenseDate;

      this.expenseDetails.controls.forEach((formGroupInstance => {
        try {
          if (formGroupInstance.value.expenseDate) {
            expenseDate = formGroupInstance.value.expenseDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
            formGroupInstance.get('expenseDate').patchValue(expenseDate);
          }
        } catch (e) {
        }
      }));

      const obj = this.createExpenseForm.value;

      try {
        obj.startFrom = (this.createExpenseForm.get('startFrom').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
      } catch (e) {
      }

      try {
        obj.endDate = (this.createExpenseForm.get('endDate').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
      } catch (e) {
      }

      obj.expenseAdditionalAttachmentIds = [];
      this.expenseAdditionalAttachments.forEach((val) => {
        obj.expenseAdditionalAttachmentIds.push(val.id);
      });


      // this.formatMultisetValue(obj);
      obj.additionalData = this.commonUtil.formatMultisetValues(obj.additionalData);
      obj.expenseDetails = this.commonUtil.formatMultisetLineValues(obj.expenseDetails);
      obj.expenseAccountIdList = obj.expenseDetails?.map(r => r.accountId)?.filter(x => x);
      obj.projectCodeIdList = obj.expenseDetails?.map(r => r.projectCodeId)?.filter(x => x);

      this.expenseService.createExpenseAsApproved(obj).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.EXPENSE_SAVE_AS_APPROVED_SUCCESSFULLY);
          this.createExpenseForm.reset();
          this.isSuccessSaveAsApproved.emit();
          this.emitAfterSuccess.emit(true);
          this.emitAfterSuccess.emit();
          this.close();
          this.isMarkAsApproved = false;
        } else {
          this.isMarkAsApproved = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.isMarkAsApproved = false;
        this.notificationService.errorMessage(error);
      });
    } else {
      this.isMarkAsApproved = false;
      new CommonUtility().validateForm(this.createExpenseForm);
    }
  }


  /*
   -------------------------------MANAGE ADDITIONAL FIELD ------------------------------------------------------------------------------>
   */

  /**
   * This method use for add additional fields to expense approval
   */
  getModuleReheatedAdditionalField(id, isDetailView) {
    this.additionalFieldService.getAdditionalField(id, isDetailView, !this.editView).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.additionalFieldResponse = res.body;
        this.reportNameInput.nativeElement.focus();
        this.additionalFieldResponse.forEach(((field) => {
          this.commonUtil.manageDropDownData(field, isDetailView);

          if (field.sectionId === AppModuleSection.MASTER_DATA_INPUT_SECTION_ID) {
            this.addHeadingField(field);
          }

          if (field.sectionId === AppModuleSection.LINE_ITEM_SECTION_ID) {
            this.addLineField(field);
          }
        }));

        if (this.editView || this.isOverrideData) {
          this.manageResponseData();
        }

      } else {
        this.notificationService.infoMessage(res.body.message);
      }

    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used for format additional data and patch values to the form
   */
  manageResponseData() {
    this.expenseResponseData.additionalData = this.commonUtil.patchDropDownAdditionalData(this.expenseResponseData.additionalData);
    this.expenseResponseData.expenseDetails = this.commonUtil.patchDropDownAdditionalLineItemData(this.expenseResponseData.expenseDetails);
    this.expenseResponseData.additionalData = this.commonUtil.alignHeadingAdditionalData(this.headerAdditionalFieldDetails, this.expenseResponseData.additionalData);
    this.commonUtil.alignLineAdditionalData(this.expenseResponseData.expenseDetails, this.lineItemAdditionalFieldDetails);
    this.createExpenseForm.patchValue(this.expenseResponseData);

    this.setDocumentEvent();
    this.automationService.setUpFocusListeners(this.createExpenseForm, this.renderer, this.el, this.setFieldValueDto, AppDocumentType.EXPENSE, this.automationService.expenseInputFieldsForAutomation);
    setTimeout(() => {
      this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    }, 500);
    this.isDraftNameAvailable = false;
    this.validateButtonOnChangeAddOption();
    if (this.isClickedEditButtonFromDraftList) {
      this.expenseService.isProcessingPatchingDataFromDraft.next({
        isProgress: false,
        index: this.userAvailableDraftList.findIndex(x => x.id === this.draftId)
      });
      this.isShowDraftListPopUp = false;
    }
  }


  /*
----------------------------------------DATA MAPPING----------------------------------------------------------------------------->
 */
  /**
   * This method use for add line item data additional field and field validations
   * @param field
   * @private
   */
  public addLineField(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.expenseResponseData.expenseDetails, field, this.detailView, !this.editView)) {
      return;
    }
    this.lineItemAdditionalFieldDetails.push(field);
    this.expenseDetails.controls.forEach((value, index) => {
      this.lineItemAdditionalField(index).push(this.commonUtil.getAdditionalFieldValidations(field, this.detailView));
    });
  }

  /**
   * This method use for add master data additional field and field validations
   * @param field AdditionalFieldDetailDto
   */
  public addHeadingField(field: AdditionalFieldDetailDto) {
    this.headerAdditionalFieldDetails.push(field);
    this.headingSectionArray.push(this.commonUtil.getAdditionalFieldValidations(field, this.detailView));
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
        if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
          value.disabled = true;
        }
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
          idArray.splice(idArray.findIndex(x => x === AppConstant.ZERO), 1);
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
  changeFileInput(event: any, additionalField, indexNumber) {
    if (event.target.files[0]) {
      if (event.target.files[0]) {
        const targetFile = event.target.files[0];
        additionalField.patchValue({
          attachment: targetFile
        });
      }
    }
  }


  /**
   * return form array data
   */
  public get headingSectionArray() {
    return this.createExpenseForm.get('additionalData') as UntypedFormArray;
  }

  /**
   * This method returns the line item section additional detail controllers as an array
   */
  public lineItemAdditionalField(index) {
    return this.expenseDetails.controls[index].get('additionalData') as UntypedFormArray;
  }


  formatDateSection(event, field) {
    if (!event) {
      return;
    }
    field.value.fieldValue = event.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
  }

  /**
   * this method can be used to get file name
   * @param fileUpload string
   * @param i
   */
  fileUploadClickOnReceipt(fileUpload, i: number) {
    document.getElementById(fileUpload + i).click();
  }

  /**
   * init expense detail data
   */
  addExpenseRecordsOnClick() {
    const expenseForm = this.formBuilder.group({
      expenseDate: [],
      merchant: [],
      projectCodeId: [],
      receiptAttachment: [],
      expenseType: [],
      accountId: [],
      amount: [null],
      receipt: [],
      receiptController: [],
      attachmentId: [],
      departmentId: [],
      id: [],
      billable: [false],
      accountChanged: [false],
      taxable: [false],
      mileage: [],
      mileageRate: [],
      mileageAmount: [],
      receiptFileName: [],
      receiptId: [],
      prevReceiptId: [],
      additionalData: this.formBuilder.array([])
    });
    this.expenseDetails.push(expenseForm);
    const len = (this.expenseDetails.length - 2);
    this.addExpenseFields(len);
  }

  /**
   * this method can be used to on line item click
   * @param index to index
   * @param expenseRow to row formGroup object
   */

  onLItemClick(index, expenseRow: UntypedFormGroup) {
    const len = (this.expenseDetails.length) - 1;
    if (len === index) {
      this.addExpenseRecords();
      this.addExpenseFields(len);
    }
  }

  /**
   * this method can be used to add new line additional field item
   * @param index to index
   */
  addExpenseFields(index) {
    this.lineItemAdditionalFieldDetails.forEach((value) => {
      this.lineItemAdditionalField(index + 1).push(this.commonUtil.getAdditionalFieldValidations(value, this.detailView));
    });
  }

  /**
   * init expense detail data
   */
  addExpenseRecords() {
    const expenseForm = this.formBuilder.group({
      expenseDate: [],
      merchant: [],
      projectCodeId: [],
      receiptAttachment: [],
      receiptId: [],
      expenseType: [],
      accountId: [],
      amount: [null],
      receipt: [],
      receiptFileName: [],
      prevReceiptId: [],
      departmentId: [],
      receiptController: [],
      attachmentId: [],
      billable: [false],
      taxable: [false],
      accountChanged: [false],
      id: [],
      mileage: [],
      mileageRate: [],
      mileageAmount: [AppConstant.ZERO],
      additionalData: this.formBuilder.array([])
    });
    this.expenseDetails.push(expenseForm);
  }

  /**
   * this method can be used to get file name
   * @param fileUpload string
   * @param i
   */
  fileUploadClick(fileUpload, i: number) {
    document.getElementById(fileUpload + i).click();
  }

  clearAutomation() {
    this.matchingAutomation = null;
    this.isSubmissionWorkFlow = false;
    this.isSaveAsApprovedWorkFlow = false;
    this.isWorkflowConfigAvailable = false;
  }

  /**
   * Date Validation for Start and End Date
   */
  fromDateChanged(val) {
    if (this.createExpenseForm.get('endDate').value < val) {
      this.createExpenseForm.get('endDate').reset();
    }
  }


  /**
   * this method can be used to add new
   */
  changeList(selectionName, selectedId, i) {
    if (selectionName === 'Project' && selectedId === 0) {
      this.expenseDetails.controls[i].get('projectCodeId').reset();
      this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
      this.isAddNewProjectCodes = true;
    }
    if (selectionName === 'Project') {
      this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    }
    if (selectionName === 'Type' && selectedId === 0) {
      this.expenseDetails.controls[i].get('expenseType').reset();
      this.expenseTypePanel = true;
    }
    if (selectionName === 'Type' ) {
      this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    }
  }


  addNewExpenseAccount(inputId, i) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    if (inputId === 0) {
      this.isAddNewAccount = true;
      this.expenseDetails.controls[i].get('accountId').reset();
    } else {
      this.expenseDetails.controls[i].get('accountChanged').patchValue(true);
    }
  }

  /**
   * this method can be used to download additional attachment
   * @param val to attachment
   */
  downloadAdditionalFieldAttachment(val) {
    this.expenseService.downloadAdditionalFieldAttachment(val.id).subscribe((res: any) => {
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

  updateAdditionalFieldDropDowns() {
    this.commonUtil.updateAdditionalFiledDropdowns(this.headerAdditionalFieldDetails, this.selectedAdditionalField);
    this.commonUtil.updateAdditionalFiledDropdowns(this.lineItemAdditionalFieldDetails, this.selectedAdditionalField);
  }

  /**
   * Refresh Vendor list after creating a vendor
   */
  vendorAddedSuccessfully() {
    this.getVendors();
  }

  /**
   * This method use to get vendor's expense
   * @param venId vendor id
   * @param fromDropdown
   * @param dpNameVendor
   */
  changedVendorSelection(venId: any, fromDropdown?, dpNameVendor?) {
    if (fromDropdown) {
      this.commonUtil.isPressEnterInsideDropdown(dpNameVendor);
      this.automationService.setAutomationData(this.createExpenseForm, AppFormConstants.VENDOR_ID);
    }
    if (venId === 0) {
      this.addVendorPanel = true;
      this.createExpenseForm.controls.vendorId.reset();
    }
    if (venId === AppConstant.NULL_VALUE || venId === AppConstant.UNDEFINED_VALUE) {
      this.getApprovalUserList(this.approvalUserList);
    }
    if (venId !== AppConstant.ZERO && venId) {
      this.approvalUserList.data = [];
      this.adHocWorkflowDetails.controls = [];
      this.initApprover();
      this.getApprovalUserListVendor(venId);
    }
  }

  /**
   * This method can be used to get if Vendor is confidential get relevant approval user list
   */
  getApprovalUserListVendor(venId) {
    this.getApprovalUserListAccordingToVendor(this.approvalUserList, venId);
  }

  /**
   * get project code list
   * @param listInstance to dropdown instance
   */
  getApprovalUserList(listInstance: DropdownDto) {
    const authorities = [AppAuthorities.EXPENSES_APPROVE, AppAuthorities.EXPENSES_REJECT,
      AppAuthorities.EXPENSES_OVERRIDE_APPROVAL];
    this.billsService.getApprovalUserList(null, authorities, !this.editView).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        listInstance.data = res.body;
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
  getApprovalUserListAccordingToVendor(listInstance: DropdownDto, vendorId) {
    if (vendorId) {
      const authorities = [AppAuthorities.EXPENSES_APPROVE, AppAuthorities.EXPENSES_REJECT,
        AppAuthorities.EXPENSES_OVERRIDE_APPROVAL];
      this.billsService.getApprovalUserListAccordingToVendorSelection(null, authorities, vendorId, !this.editView).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          listInstance.data = res.body;
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    } else {
      this.getApprovalUserList(listInstance);
    }
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

  /**
   * this method can be used to save document as draft
   * @param value to expense form value
   */
  saveAsDraft(value) {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.SAVE_AS_DRAFT,
      AppAnalyticsConstants.MODULE_NAME_EXPENSES,
      AppAnalyticsConstants.SAVE_AS_DRAFT,
      AppAnalyticsConstants.CREATE_SCREEN
    );
    this.isSaveAsDraft = true;
    if (!this.createExpenseForm.get('reportName').value) {
      this.createExpenseForm.get('reportName').markAsDirty();
      this.isSaveAsDraft = false;
      return;
    } else {
      this.createDraft();
    }
  }

  /**
   * is save as approved button available
   */
  isSaveAsApprovedAllows() {
    return (this.privilegeService.isAuthorized(this.appAuthorities.EXPENSE_SAVE_AS_APPROVED) || this.isSaveAsApprovedWorkFlow)
      && !this.isSubmissionWorkFlow && (this.expenseStatus == this.enums.STATUS_REJECT || !this.editView) ||
      (this.expenseStatus == this.enums.STATUS_PENDING && this.editView && !this.isEnabledSubmitForApprovalButton);
  }

  /**
   * is edit / resubmit buttons available
   */
  isEdit() {
    return this.editView && ((this.expenseStatus == this.enums.STATUS_PENDING && this.isEnabledSubmitForApprovalButton) ||
      (this.expenseStatus == this.enums.STATUS_APPROVED && !this.isEnabledSubmitForApprovalButton)) || this.expenseStatus == this.enums.STATUS_REJECT;
  }

  /**
   * is submit for approval button available
   */

  isSubmitForApprovalAllows() {
    return (this.privilegeService.isAuthorized(this.appAuthorities.EXPENSES_CREATE) || this.isSubmissionWorkFlow)
      && !this.isSaveAsApprovedWorkFlow && ((this.expenseStatus == this.enums.STATUS_APPROVED && this.isEnabledSubmitForApprovalButton) || !this.editView);
  }

  /**
   * is save as approved button available
   */
  isSaveAsApprovedAllowsForDraft() {
    return (this.privilegeService.isAuthorized(this.appAuthorities.EXPENSE_SAVE_AS_APPROVED) || this.isSaveAsApprovedWorkFlow)
      && !this.isSubmissionWorkFlow && (this.expenseStatus == this.enums.STATUS_DRAFT && this.editView) && !this.isEnabledSubmitForApprovalButton;
  }

  /**
   * is submit for approval button available
   */

  isSubmitForApprovalAllowsForDraft() {
    return (this.privilegeService.isAuthorized(this.appAuthorities.EXPENSES_CREATE) || this.isSubmissionWorkFlow)
      && !this.isSaveAsApprovedWorkFlow && ((this.expenseStatus == this.enums.STATUS_DRAFT) && this.editView);
  }

  /**
   * is save as draft button available
   */
  isSaveAsDraftEnabled() {
    return (this.expenseStatus === this.enums.STATUS_DRAFT && this.editView) || !(this.expenseStatus && this.editView);
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
        key: 'overrideForm',
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
    this.resetComponent();
    this.expenseID = this.draftId;
    this.getExpenseData();
  }

  /**
   * This method can be used to get available draft id
   * @param reportName to report name
   */
  getAvailableDraftId(reportName) {
    if (!reportName || this.editView) {
      return;
    } else {
      this.expenseService.getAvailableDraftIdByName(reportName).subscribe(async (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.isDraftNameAvailable = (res.body) && (this.expenseStatusFromList !== this.enums.STATUS_DRAFT || this.isOverrideData);
          this.draftId = await (res.body);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to get user available draft list
   * this function call from onInit() method
   */
  getAvailableDraftList() {
    if (this.editView) {
      return;
    }
    this.expenseService.getUserAvailableDraftList().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.userAvailableDraftList = res.body;
        this.isShowDraftListPopUp = (this.userAvailableDraftList.length > this.appConstant.ZERO
          && this.expenseUtility.showExpenseDraftListByDefault &&
          (this.expenseStatusFromList !== this.enums.STATUS_DRAFT));
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
   * calculate mileageRate
   * @param index to account detail index number
   */
  calculateMileageRate(index) {
    const mileageRate: number = (!this.expenseDetails.controls[index].value.mileageRate) ? 0.00 :
      this.expenseDetails.controls[index].value.mileageRate;

    const mileageQty: number = (!this.expenseDetails.controls[index].value.mileage) ? 0.00 :
      this.expenseDetails.controls[index].value.mileage;

    let lineAmount = parseFloat((mileageQty * mileageRate) + AppConstant.EMPTY_STRING);

    lineAmount = parseFloat(lineAmount.toFixed(2));

    this.expenseDetails.controls[index].get('amount').patchValue(lineAmount);

    this.expenseDetails.controls[index].get('mileageAmount').patchValue(lineAmount);

    this.calculateTableTotalMileageRate();
    this.calculateExpenseTotal();
  }

  /**
   * This method use for calculate total
   */
  calculateTableTotalMileageRate() {
    let mileageLineAmount = 0.0;
    this.expenseDetails.value.forEach((value) => {
      if (value.mileageAmount) {
        mileageLineAmount += value.mileageAmount;
      }
    });
    this.createExpenseForm.get('totalMileageAmount').patchValue(mileageLineAmount);
  }

  /**
   * This method can be used to get configured mileage rate
   */
  getConfigureMileageRate(date, i) {
    if (!this.expenseDetails.controls[i].get('mileage').value) {
      this.expenseDetails.controls[i].get('mileageRate').patchValue(null);
      return;
    } else {
      if (!date) {
        if (this.editView && this.expenseDetails.controls[i].get('mileageRate').value > AppConstant.ZERO) {
          this.calculateMileageRate(i);
          return;
        }
        date = new Date();
        date = date.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
      } else {
        const formatDate = DataFormatToISODate.convert(date);
        date = formatDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
      }
      this.mileageRateService.getMileageRate(date).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.expenseDetails.controls[i].get('mileageRate').patchValue(res.body.mileageRate);
          this.calculateMileageRate(i);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method used for calculate total miles driven
   */
  calculateTotalMilesDriven() {
    let totalMilesDriven = 0.0;
    this.expenseDetails.value.forEach((value) => {
      const mileageDrivenCount = Number(value.mileage);
      if (mileageDrivenCount && !isNaN(mileageDrivenCount)) {
        totalMilesDriven += mileageDrivenCount;
      }
    });
    this.createExpenseForm.get('totalMilesDriven').patchValue(totalMilesDriven);
  }

  /** Search for Merchants on type
   * minimum 2 letters are required
   * @param event
   * @param i Index
   * @param onComplete event of selecting the value from suggestion list
   */
  searchMerchants(event: any, i, onComplete) {
    let text = '';
    if (!onComplete) {
      text = event.query;
      this.expenseService.searchMerchants(event.query).subscribe(res => {
        this.merchantResults = res.body;
      });
    } else {
      text = event;
    }

    if (this.expenseDetails.controls[i].get('accountChanged').value) {
      return;
    }
    if (!this.memorizationMerchant) {
      return;
    } else {
      this.expenseService.searchMerchantWiseAcc(text).subscribe(res => {
        this.expenseDetails.controls[i].get('accountId').patchValue(res.body);
      });
    }
  }


  /**
   * this method used for manage condition of view draft list popup
   */
  showAvailableDraftListPopUp() {
    this.expenseUtility.getExpenseDraftListState();
    setTimeout(() => {
      this.getAvailableDraftList();
    }, 1000);
  }

  /**
   * this method can be used to clear expense lines
   */
  clearExpenseLines() {
    const expenseTableLength: number = this.expenseDetails.length;
    while (this.expenseDetails.length !== AppConstant.ZERO) {
      this.expenseDetails.removeAt(AppConstant.ZERO);
    }
    for (let i = AppConstant.ZERO; i < expenseTableLength; i++) {
      this.addExpenseRecordsOnClick();
    }
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
  }

  // This method is used to get all controllers from the expense create form
  get expenseFormControllers() {
    return this.createExpenseForm.controls;
  }

  getMemoristionfeature() {
    this.manageFeatureService.getFeatureList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.featureIdList = res.body;
        for (const feature of this.featureIdList) {
          if (feature.featureId === this.featureIdEnum.MEMORIZE_ACCOUNT_BY_MERCHANT) {
            this.memorizationMerchant = feature.status;
          }
        }
      }
    });
  }


  updateSelectedReceipt(receipt: any, i: number) {
    if (!receipt) {
      return;
    }
    this.expenseDetails.controls[i].get('receiptId').patchValue(receipt.receiptId);
    this.expenseDetails.controls[i].get('receiptFileName').patchValue(receipt.receiptFileName);
    // this.expenseDetails.controls[i].get('receipt').value
  }

  changedDepartment(event: any, dpNameDepartment) {
    this.automationService.setAutomationData(this.createExpenseForm, AppFormConstants.DEPARTMENT_ID);
    this.commonUtil.isPressEnterInsideDropdown(dpNameDepartment);
    if (event.value === 0) {
      this.departmentPanel = true;
      this.createExpenseForm.get('departmentId').reset();
    }
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
  }


  changedDepartmentAccount(event: any, i: any) {
    if (event.value === 0) {
      this.departmentPanel = true;
      this.expenseDetails.controls[i].get('departmentId').reset();
    } else {
      const departmentId = event.value;
      this.expenseDetails.controls[i].get('departmentId').patchValue(departmentId);
    }
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
  }

  /**
   * This method use for view additional option input drawer when user click footer add new button
   * @param additionalFieldDetailDto AdditionalFieldDetailDto
   */
  setSelectedAdditionalField(additionalFieldDetailDto: AdditionalFieldDetailDto) {
    this.selectedAdditionalField = additionalFieldDetailDto;
  }

  /**
   * This method can be used focus the first element after user go to another tab and come again
   */

  focusFirstElementAfterTabChange() {
    this.expenseService.changeMainTabSet.subscribe(x => {
      if (x && x === AppAnalyticsConstants.CREATE_EXPENSES) {
        setTimeout(() => {
          this.reportNameInput.nativeElement.focus();
        }, 0);
      }
    });
  }


  ngOnDestroy(): void {
    this.fieldSubscription.unsubscribe();
    this.automationService.cleanupListeners();
  }

  amountChanged() {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
  }

  merchantChanged() {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
  }

  changeReportName() {
    clearTimeout(this.departmentTimeout); // Clear previous timeout
    this.departmentTimeout = setTimeout(() => {
      this.automationService.setAutomationData(this.createExpenseForm, AppFormConstants.EXPENSE_HEADER_REPORT_NAME);
    }, 1000);
  }
}
