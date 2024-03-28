import {
  Input,
  OnInit,
  Output,
  EventEmitter,
  Component,
  AfterViewInit,
  ViewChild,
  Renderer2,
  ElementRef,
  OnDestroy
} from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {PoService} from '../../../shared/services/po/po.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {PoMasterDto} from '../../../shared/dto/po/po-master-dto';
import {PoUtility} from '../po-utility';
import {PoDetailDto} from '../../../shared/dto/po/po-detail-dto';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {ConfirmationService, MessageService} from 'primeng/api';
import {AppMessageService} from '../../../shared/enums/app-message-service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppAutomationEvent} from '../../../shared/enums/app-automation-event';
import {AppHttpResponseMessage} from '../../../shared/enums/app-http-response-message';
import {DataFormatToISODate} from '../../../shared/utility/data-format-toISODate';
import {RoleService} from '../../../shared/services/roles/role.service';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppDocuments} from '../../../shared/enums/app-documents';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {PoNumberFormatDto} from '../../../shared/dto/po-number-configuration/po-number-format-dto';
import {VendorService} from '../../../shared/services/vendors/vendor.service';
import {BillApprovalsService} from '../../../shared/services/bills/bill-approvals.service';
import {CompanyProfileService} from '../../../shared/services/company-profile/company-profile.service';
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppIcons} from '../../../shared/enums/app-icons';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';
import {ManageDrawerService} from '../../../shared/services/common/manage-drawer-status/manage-drawer.service';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {MemoriseItemAcc} from '../../common/memorise-item-acc';
import {MandatoryFields} from '../../../shared/utility/mandatory-fields';
import {ManageFeatureService} from '../../../shared/services/settings/manage-feature/manage-feature.service';
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";
import {Dropdown} from "primeng/dropdown";
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {SetFieldValueDto} from '../../../shared/dto/automation/set-field-value-dto';
import {Subscription} from 'rxjs';
import {AccountNumberPopulationLineLevel} from "../../../shared/utility/account-number-population-line-level";
import {DepartmentService} from "../../../shared/services/department/department.service";


@Component({
  selector: 'app-po-create',
  templateUrl: './po-create.component.html',
  styleUrls: ['./po-create.component.scss']
})
export class PoCreateComponent extends MandatoryFields implements OnInit, OnDestroy {

  public createPurchaseOrderForm: UntypedFormGroup;
  public poUtility: PoUtility;
  public poRequestDto: PoMasterDto = new PoMasterDto();
  public appConstant: AppConstant = new AppConstant();
  public selectedAdditionalField: AdditionalFieldDetailDto;
  public AppAnalyticsConstants = AppAnalyticsConstants;
  public appFieldType = AppFieldType;
  public additionalFieldResponse: AdditionalFieldDetailDto[];
  public headerAdditionalFieldDetails: AdditionalFieldDetailDto[] = new Array();
  public lineItemAdditionalFieldDetails: AdditionalFieldDetailDto[] = new Array();
  public accountAdditionalFieldDetails: AdditionalFieldDetailDto[] = new Array();
  public vendorAdditionalAttachments: any [] = [];
  public poNumberFormatMst: PoNumberFormatDto = new PoNumberFormatDto();
  public projectCodeList: DropdownDto = new DropdownDto();
  public accountList: DropdownDto = new DropdownDto();
  public vendorRelevantItemList: DropdownDto = new DropdownDto();
  public files: File[] = [];
  public actualAttachments: any [] = [];
  public poAttachments: any [] = [];
  public skuDropDownList: DropdownDto [] = [];
  public options: any [] = [];
  public attachmentId;
  public projectBudget: number;
  public accountIndex: number;
  public selectedVendorId: any;
  public selectedItemIndex = null;
  public projectTasks: DropdownDto = new DropdownDto();
  public isTaxTypePercentage = false;
  public isTaxTypeFixedAmount = false;
  public department: DropdownDto = new DropdownDto();
  public departmentId;

  public accountNumPopulationLines: AccountNumberPopulationLineLevel = new AccountNumberPopulationLineLevel(
    this.billsService, this.notificationService
  );

  public isValidTaxAmountWithItemGrossAmount = false;
  public isPoNumberAvailable = false;
  public isAddNewAccount = false;
  public isAddNewProjectCodes = false;
  statuses: any;
  public addNewUOM = false;
  public grossAmount: any;
  public addVendorPanel: boolean;
  public addProjectCodePanel: boolean;
  public departmentPanel: boolean;
  public addNewDropDown = false;
  public saveLoading = false;
  public submitForApprovalLoading = false;
  public saveAsApprovedLoading = false;
  public btnLoading = false;
  public today = new Date();
  public addNewItemOverlay = false;
  public isOverride = true;
  public loading = false;
  public matchingAutomation: any;
  public appAuthorities = AppAuthorities;
  public appFormConstants = AppFormConstants;
  public commonUtil = new CommonUtility();
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public isSubmissionWorkFlow = false;
  public isSaveAsApprovedWorkFlow = false;
  public isWorkflowConfigAvailable = false;
  public poStatus;
  public enums = AppEnumConstants;
  public iconEnum = AppIcons;
  public isEnabledSubmitForApprovalButton = false;
  public isSubmitted = false;
  public isAvailableAwaitingApproval = false;
  public previousAdHocWorkflowDetails: any [] = [];
  public formArray: any [] = [];
  public appModuleSection = AppModuleSection;
  public vendors: DropdownDto = new DropdownDto();
  @Input() editView = false;
  @Input() poID: any;
  @Output() closePo = new EventEmitter();
  @Input() poStatusFromList: string;
  @Output() successUpdatePo = new EventEmitter();

  @ViewChild('dpNameDepartment') public dpNameDepartment: Dropdown;

  // Po draft related variables
  public isShowDraftListPopUp = false;
  public userAvailableDraftList: any [] = [];
  public categories: any = [
    {
      name: 'isFixedAmount',
      value: 'Amount'
    },
    {name: 'percentage', value: 'Percentage'},
  ];
  public isClickedEditButtonFromDraftList = false;
  public isSaveAsDraft = false;
  public isDraftNameAvailable = false;
  public isOverrideData = false;
  public draftId: any;
  public defaultTaxType: any;
  public taxAmount = 0;
  public memoriseItemAcc: MemoriseItemAcc;
  public approvalGroups: DropdownDto = new DropdownDto();
  public approvalUsers: DropdownDto = new DropdownDto();
  public fieldSubscription: Subscription = new Subscription();
  setFieldValueDto: SetFieldValueDto = new SetFieldValueDto();
  previousProjectCodeId;
  previousDepartmentId;
  departmentChangeFromAutomation = false;

  /*
DROPDOWN DADA----------------------------------------------------------------------------------------------------->
 */

  constructor(public formBuilder: UntypedFormBuilder, public poService: PoService, public roleService: RoleService,
              public vendorService: VendorService, public billApprovalsService: BillApprovalsService,
              public messageService: MessageService, public additionalFieldService: AdditionalFieldService,
              public confirmationService: ConfirmationService, public notificationService: NotificationService,
              public automationService: AutomationService, public privilegeService: PrivilegeService,
              public companyProfileService: CompanyProfileService, public gaService: GoogleAnalyticsService,
              public formGuardService: FormGuardService, public drawerService: ManageDrawerService,
              public manageFeatureService: ManageFeatureService,
              public billsService: BillsService, private renderer: Renderer2,
              private el: ElementRef, public departmentService: DepartmentService) {
    super(additionalFieldService, notificationService);
  }


  ngOnInit(): void {

    this.poUtility = new PoUtility(this.poService, this.roleService, this.messageService,
      this.privilegeService, this.notificationService, this.drawerService, this.billsService);
    if (!this.editView) {
      this.showAvailableDraftListPopUp();
    }
    this.initFormGroup();
    this.getRequiredFields(this.createPurchaseOrderForm, AppDocumentType.PURCHASE_ORDER);

    this.createPurchaseOrderForm.get('projectCodeId').valueChanges.subscribe((val) => {
      if (val !== this.previousProjectCodeId) {
        this.changedProjectCodeSelection();
        this.previousProjectCodeId = this.createPurchaseOrderForm.get('projectCodeId').value;
      }
    });

    this.createPurchaseOrderForm.get(AppFormConstants.DEPARTMENT_ID).valueChanges.subscribe((val) => {
      if (val !== this.previousDepartmentId) {
        if (val && ((this.departmentChangeFromAutomation && this.editView) || !this.editView)){
          this.commonUtil.patchHeaderLevelDepartmentAndProjectCodeLineLevel(AppFormConstants.DEPARTMENT_ID, val);
          this.patchDepartmentInformation(val);
        }
        this.getPoNumberFormatToDepartment();
        this.previousDepartmentId = this.createPurchaseOrderForm.get(AppFormConstants.DEPARTMENT_ID).value;
      }
      if (val === null || val === undefined) {
        this.getAddressInfo();
      }
    });


    const today = new Date();
    this.today.setDate(today.getDate());
    this.resetPOForm();
    this.memoriseItemAcc = new MemoriseItemAcc(this.manageFeatureService, this.createPurchaseOrderForm, this.billsService, this.accountDetails, this.lineItemMainTable);
    this.getProjectCodeList();
    this.getDepartment();
    this.getApprovalGroups();
    this.getVendors();
    this.loadAccountsToTheProjectTaskIdPo(this.createPurchaseOrderForm.get('projectCodeId').value, !this.editView, this.poID);
  }

  getAddressInfo() {
    this.companyProfileService.getTenantDetails().subscribe((res: any) => {
      this.po.shippingAddress.patchValue(res.body.businessAddress);
      this.po.billingAddress.patchValue(res.body.businessAddress);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getVendors() {
    this.billsService.getVendorList(!this.editView).subscribe((res: any) => {
      this.vendors.data = res.body;
    });
  }

  getApprovalGroups() {
    this.billsService.getApprovalGroupList(!this.editView).subscribe((res: any) => {
      this.approvalGroups.data = res.body;
    });
  }

  getDepartment() {
    this.billsService.getDepartment(!this.editView).subscribe((res: any) => {
      this.department.data = res.body;
    });
  }

  /**
   * get project code list
   * @param listInstance to dropdown instance
   */
  getProjectCodeList() {
    this.billsService.getProjectTask(AppConstant.PROJECT_CODE_CATEGORY_ID, !this.editView).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.projectTasks.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * initialize form create po form builder
   */
  initFormGroup() {
    this.createPurchaseOrderForm = this.formBuilder.group({
      id: [null],
      poNumber: [null, Validators.compose([Validators.required, Validators.maxLength(50)])],
      poDate: [null],
      vendorId: [null, Validators.required],
      projectCodeId: [null],
      deliveryDate: [null],
      pocName: [null, Validators.compose([Validators.maxLength(50)])],
      pocPhone: [null],
      notes: [null],
      shippingAddress: [null],
      billingAddress: [null],
      status: [null],
      automationId: [null],
      grossAmount: [null],
      itemGrossAmount: [null],
      departmentId: [null],
      accountGrossAmount: [null],
      taxAmount: [null],
      discountAmount: [null],
      focusListener: [],
      patchSetFieldFullObject: [false],
      attachmentId: [null],
      netAmount: [null],
      workflow: [null],
      attachments: [null],
      createdUser: [null],
      percentage: [null],
      taxOptions: [null],
      autoGeneratedPoNo: [false],
      purchaseOrderDetails: this.formBuilder.array([]),
      adHocWorkflowDetails: this.formBuilder.array([]),
      additionalData: this.formBuilder.array([]),
      vendorAdditionalData: this.formBuilder.array([]),
      event: [],
      purchaseOrderAccountDetails: this.formBuilder.array([]),
    });

    this.setDocumentEvent();
    this.automationService.setUpFocusListeners(this.createPurchaseOrderForm, this.renderer, this.el, this.setFieldValueDto, AppDocumentType.PURCHASE_ORDER,
        this.automationService.poInputFieldsForAutomation);
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
  }

  setDocumentEvent() {
    let event = AppDocuments.DOCUMENT_EVENT_SUBMITTED;
    if (this.editView && this.createPurchaseOrderForm.get('status').value !== this.enums.STATUS_DRAFT) {
      event = AppDocuments.DOCUMENT_EVENT_EDIT;
    }
    if (this.createPurchaseOrderForm.get('status').value === this.enums.STATUS_REJECT) {
      event = AppDocuments.DOCUMENT_EVENT_EDIT_RESUBMIT;
    }
    this.createPurchaseOrderForm.get('event').patchValue(event);
    this.createPurchaseOrderForm.get(AppFormConstants.PATCH_SET_FIELD_FULL_OBJECT).patchValue(
      (this.createPurchaseOrderForm.get('status').value === this.enums.STATUS_DRAFT || this.editView));
  }

  getProjectCodeBudget(data: any): void {
    if (!data) {
      this.projectBudget = null;
      return;
    }
    this.poService.getProjectBudget(data).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.projectBudget = res.body;
      } else {
        this.projectBudget = null;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  clearAutomation() {
    this.matchingAutomation = null;
    this.isSubmissionWorkFlow = false;
    this.isSaveAsApprovedWorkFlow = false;
    this.isWorkflowConfigAvailable = false;
  }

  /**
   * this method can be used to init add items
   */
  initAddItems() {
    for (let i = 0; i < 10; i++) {
      this.addItem();
    }
  }

  /**
   * this method can be used to init add items
   */
  initAccounts() {
    for (let i = 0; i < 10; i++) {
      this.addAccount();
    }
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
    for (let i = 0; i < this.adHocWorkflowDetails.length; i++) {
      this.adHocWorkflowDetails.controls[i].get('approvalOrder').patchValue(1 + i);
    }
    this.validateButtonOnChangeAddOption();
  }

  /**
   * This method use for add new form controller group for automation condition
   */
  addItem() {
    const itemInfo = this.formBuilder.group({
      id: [],
      productId: [null],
      vendorItemNumber: [null],
      itemName: [null],
      itemNumber: [null],
      qty: [null],
      uomId: [null],
      unitPrice: [null],
      accountNumber: [null],
      accountId: [null],
      description: [],
      accountChanged: [false],
      departmentId: [null],
      discountAmount: [null],
      amount: [null],
      billable: [false],
      taxable: [false],
      additionalData: this.formBuilder.array([])
    });
    const obj: DropdownDto = new DropdownDto();
    this.skuDropDownList.push(obj);
    this.lineItemMainTable.push(itemInfo);
  }

  /**
   * Submit po to update or create
   * @param editOnly to edit only action
   * @param buttonName to button name
   * @param isSubmit to submit action
   * @param type to action name
   */
  async submitPo(editOnly, buttonName, isSubmit, type, lable?) {
    this.trackingSubmitPoEvent(lable);
    this.isSubmitted = isSubmit;
    this.poRequestDto.pocPhone = this.commonUtil.getTelNo(this.createPurchaseOrderForm, 'pocPhone');
    if (this.editView) {
      this.commonUtil.validateFileInput(this.createPurchaseOrderForm.get('additionalData'), this.actualAttachments);
    }
    if (this.createPurchaseOrderForm.valid) {
      this.formatAndAssignValueToMstObject();
      this.poRequestDto.pocPhone = this.commonUtil.getTelNo(this.createPurchaseOrderForm, 'pocPhone');
      if (this.editView || this.isOverrideData) {
        editOnly = !(this.poStatus == this.enums.STATUS_REJECT && !isSubmit);
        this.poRequestDto.eventId = AppAutomationEvent.EDIT_AND_RESUBMITTED;
        this.editAndResubmitPO(editOnly, buttonName, type);
      } else {
        this.poRequestDto.eventId = AppAutomationEvent.SUBMITTED;
        this.createPurchaseOrder();
      }
    } else {
      this.saveAsApprovedLoading = false;
      this.submitForApprovalLoading = false;
      this.saveLoading = false;
      new CommonUtility().validateForm(this.createPurchaseOrderForm);
    }
  }

  /**
   * This method can be used to create new po
   */
  createPurchaseOrder() {
    this.submitButtonsDisableOnOff('approval', true);
    this.poService.createPurchaseOrder(this.poRequestDto).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.submitButtonsDisableOnOff('approval', false);
        res.body.data != null ?
          this.notificationService.successMessage(res.body.data) :
          this.notificationService.successMessage(AppHttpResponseMessage.PO_CREATED_SUCCESSFULLY);
        this.close();
      } else {
        this.submitButtonsDisableOnOff('approval', false);
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.submitButtonsDisableOnOff('approval', false);
      this.notificationService.errorMessage(error);
    });

  }

  /**
   * This method can be used to create new po as approved
   */
  createPurchaseOrderAsApproved() {
    this.submitButtonsDisableOnOff('approved', true);
    if (this.createPurchaseOrderForm.valid) {
      this.formatAndAssignValueToMstObject();
      this.poRequestDto.pocPhone = this.commonUtil.getTelNo(this.createPurchaseOrderForm, 'pocPhone');
      this.poRequestDto.eventId = AppAutomationEvent.SUBMITTED;
      this.poService.createPurchaseOrderAsApproved(this.poRequestDto).subscribe((res: any) => {

        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.submitButtonsDisableOnOff('approved', false);
          res.body.data != null ?
            this.notificationService.successMessage(res.body.data) :
            this.notificationService.successMessage(AppHttpResponseMessage.PO_SAVE_AS_APPROVED_SUCCESSFULLY);
          this.close();
        } else {
          this.submitButtonsDisableOnOff('approved', false);
          this.notificationService.infoMessage(res.body.message);
        }

      }, error => {
        this.submitButtonsDisableOnOff('approved', false);
        this.notificationService.errorMessage(error);
      });

    } else {
      this.submitButtonsDisableOnOff('approved', false);
      new CommonUtility().validateForm(this.createPurchaseOrderForm);

    }
  }

  /**
   * This method can be used to update PO
   */
  editAndResubmitPO(editOnly, buttonName, type) {
    this.submitButtonsDisableOnOff(buttonName, true);
    this.poService.editAndResubmit(this.poRequestDto, editOnly).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.submitButtonsDisableOnOff(buttonName, false);
        if ((this.isOverrideData || this.poStatusFromList === AppEnumConstants.STATUS_DRAFT) && type === 'save_as_approved') {
          this.notificationService.successMessage(AppHttpResponseMessage.PO_SAVE_AS_APPROVED_SUCCESSFULLY);
        } else {
          this.poStatus == this.enums.STATUS_APPROVED && this.isSubmitted ?
            this.notificationService.successMessage(AppHttpResponseMessage.PO_CREATED_SUCCESSFULLY) :
            this.notificationService.successMessage(AppHttpResponseMessage.PO_UPDATED_SUCCESSFULLY);
        }
        this.close();
        this.successUpdatePo.emit();
        this.saveAsApprovedLoading = false;
      } else {
        this.submitButtonsDisableOnOff(buttonName, false);
        this.saveAsApprovedLoading = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.saveAsApprovedLoading = false;
      this.submitButtonsDisableOnOff(buttonName, false);
      this.notificationService.errorMessage(error.message);
    });
  }

  /**
   * this method disables buttons and show loader on submit
   * @param name
   * @param bool
   */
  submitButtonsDisableOnOff(name, bool) {
    switch (name) {
      case 'save': {
        this.saveLoading = bool;
        this.btnLoading = bool;
        break;
      }
      case 'approved': {
        this.saveAsApprovedLoading = bool;
        this.btnLoading = bool;
        break;
      }
      case 'approval': {
        this.submitForApprovalLoading = bool;
        this.btnLoading = bool;
        break;
      }
    }
  }

  /**
   * This method can be used to remove items
   */
  removeItem(itemIndex) {
    this.lineItemMainTable.removeAt(itemIndex);
    this.calculateTotal();
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
  }

  /**
   * This method can be used to select file
   * @param event to change event
   */

  onSelect(event) {
    this.files.push(...event.addedFiles);
    this.createPurchaseOrderForm.patchValue({
      attachments: this.files
    });
  }

  /**
   * This method can be used to remove selected file
   * @param event to remove event
   */
  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  /**
   * This method emit value close button click
   */
  close() {
    this.closePo.emit(false);
  }

  get po() {
    return this.createPurchaseOrderForm.controls;
  }

  /*
  ----------------------------------------------------------------------------------------------------------------------------------->
   */
  /**
   * This method can use for get controllers in form array
   */
  public get adHocWorkflowDetails() {
    return this.createPurchaseOrderForm.get('adHocWorkflowDetails') as UntypedFormArray;
  }

  /**
   * This method can use for get controllers in form array
   */
  public get lineItemMainTable() {
    return this.createPurchaseOrderForm.get('purchaseOrderDetails') as UntypedFormArray;
  }

  /**
   * return form array data
   */
  public get headingSectionArray() {
    return this.createPurchaseOrderForm.get('additionalData') as UntypedFormArray;
  }

  /**
   * This method can use for get controllers in form array
   */
  public get accountDetails() {
    return this.createPurchaseOrderForm.get('purchaseOrderAccountDetails') as UntypedFormArray;
  }

  /**
   * calculate amount
   * @param index to item detail index number
   */
  calculateAmount(index) {
    this.accountIndex = index;
    const lineAmount: number = (!this.lineItemMainTable.controls[index].value.unitPrice) ? 0.00 :
      this.lineItemMainTable.controls[index].value.unitPrice;

    const qty: number = (!this.lineItemMainTable.controls[index].value.qty) ? 0.00 :
      this.lineItemMainTable.controls[index].value.qty;

    const discount: number = (!this.lineItemMainTable.controls[index].value.discountAmount) ? 0.00 :
      this.lineItemMainTable.controls[index].value.discountAmount;

    const total: number = parseFloat((qty * lineAmount) + AppConstant.EMPTY_STRING);

    this.lineItemMainTable.controls[index].get('amount').patchValue(total);
    this.lineItemMainTable.controls[index].get('amount').patchValue(parseFloat((total - discount) + AppConstant.EMPTY_STRING));
    this.lineItemMainTable.controls[index].get('discountAmount').patchValue(parseFloat(discount + AppConstant.EMPTY_STRING));

    this.calculateTotal();
  }

  /**
   * This method use for calculate total
   */
  calculateTotal() {
    let itemGrossAmount = 0.0;
    let accountGrossAmount = 0.0;
    let netAmount;
    let taxAmount = 0.0;
    let taxPercentage = 0.0;
    let discountAmount = 0.0;

    const itemDetails: PoDetailDto[] = this.lineItemMainTable.value;
    itemDetails.forEach((value) => {
      if (value.unitPrice !== undefined && value.qty !== undefined) {
        itemGrossAmount += value.unitPrice * value.qty;
      }
      if (value.discountAmount !== undefined) {
        discountAmount += value.discountAmount;
      }
    });

    this.accountDetails.value.forEach((value) => {
      accountGrossAmount += value.amount;
    });

    this.po.itemGrossAmount.patchValue(itemGrossAmount);
    this.po.accountGrossAmount.patchValue(accountGrossAmount);
    this.po.discountAmount.patchValue(discountAmount);

    if (this.isTaxTypePercentage) {
      taxPercentage = this.po.taxAmount.value;
      if ((taxPercentage !== null) && taxPercentage > AppConstant.ZERO && (taxPercentage !== undefined)) {
        taxAmount = (itemGrossAmount + accountGrossAmount) * (taxPercentage / 100);
      } else {
        netAmount = (itemGrossAmount + accountGrossAmount);
      }
    } else {
      taxAmount = this.po.taxAmount.value;
    }
    this.taxAmount = taxAmount;
    // netAmount = grossAmount - (discountAmount + taxAmount);
    itemGrossAmount = itemGrossAmount - discountAmount;
    netAmount = (itemGrossAmount + accountGrossAmount) + taxAmount;
    this.po.netAmount.patchValue(netAmount);
  }

  /**
   * This method use to get vendor's bills
   * @param event any
   */
  changedVendorSelection(event: any, dpNameVendor) {
    this.commonUtil.isPressEnterInsideDropdown(dpNameVendor);
    this.automationService.setAutomationData(this.createPurchaseOrderForm, AppFormConstants.VENDOR_ID);
    this.po.pocName.reset();
    this.po.pocPhone.reset();
    this.selectedVendorId = event.value;
    this.getVendorItemList(this.selectedVendorId);
    if (event.value === 0) {
      this.addVendorPanel = true;
      this.po.vendorId.reset();
    } else {
      this.patchVendorInformation(event.value);
    }
    if (event.value === AppConstant.NULL_VALUE || event.value === AppConstant.UNDEFINED_VALUE) {
      this.approvalUsers.data = [];
      this.adHocWorkflowDetails.controls = [];
      this.addAdHocWorkflowDetail();
      this.clearItemDetailTableData();
    }
    if (event.value !== AppConstant.ZERO && event.value) {
      this.approvalUsers.data = [];
      this.adHocWorkflowDetails.controls = [];
      this.addAdHocWorkflowDetail();
      this.clearItemDetailTableData();
      this.ifVendorIsConfidentialGetApprovalUserList(this.approvalUsers, this.po.createdUser.value, event.value);
    }
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
   * This method can be used to get if Vendor is confidential get relevant approval user list
   * @param approvalUsers to user list
   * @param createdBy to created by
   * @param vendorID to selected vendor id
   */
  ifVendorIsConfidentialGetApprovalUserList(approvalUsers, createdBy, vendorID) {
    this.getVendorRelatedApprovalUsers(approvalUsers, createdBy, vendorID);
  }

  getVendorRelatedApprovalUsers(listInstance: DropdownDto, createdUser: string, vendorId) {
    if (!vendorId) {
      return;
    } else {
      const authorities = [AppAuthorities.PURCHASE_ORDER_APPROVE, AppAuthorities.PURCHASE_ORDER_REJECT,
        AppAuthorities.PURCHASE_ORDER_OVERRIDE_APPROVAL];
      this.billsService.getApprovalUserListAccordingToVendorSelection(createdUser, authorities, vendorId, !this.editView)
        .subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            listInstance.data = res.body;
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
    }
  }

  /**
   * This method use to get vendor's bills
   */
  changedProjectCodeSelection() {
    this.loadAccountsToTheProjectTaskId();
    this.getProjectCodeBudget(this.createPurchaseOrderForm.get(AppFormConstants.PROJECT_CODE_ID).value);
  }

  changedProjectCodeSelectionFromDp(dpNameProjectTask?) {
    if (dpNameProjectTask) {
      this.commonUtil.isPressEnterInsideDropdown(dpNameProjectTask);
    }
    this.automationService.setAutomationData(this.createPurchaseOrderForm, AppFormConstants.PROJECT_CODE_ID);
  }

  /**
   * This method use to get vendor's bills
   * @param event any
   * @param dpNameDepartment
   */
  changedDepartment(event: any, dpNameDepartment) {
    this.automationService.setAutomationData(this.createPurchaseOrderForm, AppFormConstants.DEPARTMENT_ID);
    this.commonUtil.isPressEnterInsideDropdown(dpNameDepartment);
    if (event.value === 0) {
      this.departmentPanel = true;
      this.isOverride = true;
      this.createPurchaseOrderForm.get('poNumber').reset();
      this.createPurchaseOrderForm.get('departmentId').reset();
      return;
    }

    if (!event.value) {
      this.isOverride = true;
      return;
    }

    this.patchDepartmentInformation(event.value);
  }

  getPoNumberFormatToDepartment() {
    let changePONumber = true;
    if (this.departmentId === this.createPurchaseOrderForm.get(AppFormConstants.DEPARTMENT_ID).value) {
      changePONumber = false;
    }
    this.getPoNumberFormat(this.createPurchaseOrderForm.get(AppFormConstants.DEPARTMENT_ID).value, changePONumber);
    this.commonUtil.patchHeaderDepartmentToLineLevel(this.createPurchaseOrderForm, -1, this.editView, null, true, true);
  }

  /**
   * This method use to get vendor's bills
   * @param event any
   */
  changedDepartmentItem(event, index) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    if (event.value === 0) {
      this.departmentPanel = true;
      this.lineItemMainTable.controls[index].get('departmentId').reset();
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
      this.accountDetails.controls[index].get('departmentId').reset();
    }
  }

  /**
   * This method use for patch vendor information
   * @param vendorId number
   */
  patchVendorInformation(vendorId) {
    if (vendorId) {
      this.poService.getVendorDetail(vendorId).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.po.pocName.patchValue(res.body.contactPerson);
          this.po.pocPhone.patchValue(res.body.contactNumber);
          this.automationService.setAutomationData(this.createPurchaseOrderForm, AppFormConstants.PO_HEADER_CONTACT_NUMBER);
          this.vendorAdditionalAttachments = res.body.additionalFieldAttachments;
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);

      });
    } else {
      this.po.pocName.reset();
      this.po.pocPhone.reset();
    }
  }

  /**
   * This method use for get item name by item id
   * @param event to change event
   * @param index number to selected array row index number
   */
  patchItemName(event: any, index) {
    this.selectedItemIndex = index;
    this.lineItemMainTable.controls[index].get('itemNumber').reset();
    this.lineItemMainTable.controls[index].get('itemName').reset();
    this.lineItemMainTable.controls[index].get('unitPrice').reset();
    this.lineItemMainTable.controls[index].get('qty').reset();
    this.lineItemMainTable.controls[index].get('uomId').reset();
    this.lineItemMainTable.controls[index].get('departmentId').reset();
    this.lineItemMainTable.controls[index].get('discountAmount').reset();

    if (event.value !== 0 && event.value) {
      this.lineItemMainTable.controls[index].get('vendorItemNumber').reset();
      this.lineItemMainTable.controls[index].get(AppFormConstants.ACCOUNT_CHANGED).patchValue(true);
      this.getItemRelatedSku(this.selectedVendorId, event.value, index);
      this.poService.getItemName(event.value).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.lineItemMainTable.controls[index].get('itemNumber').patchValue(res.body.itemNumber);
          this.lineItemMainTable.controls[index].get('itemName').patchValue(res.body.name);
          // this.lineItemMainTable.controls[index].get('unitPrice').patchValue(res.body.salesPrice);
          this.lineItemMainTable.controls[index].get('uomId').patchValue(res.body.uomId);
        }
      }, error => {
        this.messageService.add({
          severity: AppMessageService.SUMMARY_ERROR,
          summary: AppMessageService.SUMMARY_ERROR,
          detail: error
        });
      });
    } else if (event.value === 0) {
      this.lineItemMainTable.controls[index].reset();
      this.addNewItemOverlay = true;
    } else {
      this.lineItemMainTable.controls[index].reset();
    }

  }

  /**
   * this method trigger change the vendor dropdown
   */
  clearItemDetailTableData() {
    const tempLineItemAdditionalData = this.lineItemAdditionalFieldDetails;
    this.lineItemAdditionalFieldDetails = [];
    while (this.lineItemMainTable.length !== 0) {
      this.lineItemMainTable.removeAt(0);
    }
    this.vendorRelevantItemList = new DropdownDto();
    this.lineItemAdditionalFieldDetails = tempLineItemAdditionalData;
    for (let i = 0; i < 10; i++) {
      this.addItemOnclickLink();
    }
    this.getVendorItemList(this.selectedVendorId);
    this.commonUtil.patchHeaderDepartmentToLineLevel(this.createPurchaseOrderForm, -1, this.editView, null, true, true);
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
   * This method use for close additional dropdown option create drawer
   */
  closeAdditionalDropdownCreateDrawer() {
    this.addNewDropDown = false;
    this.updateAdditionalFieldDropDowns();
  }

  /**
   * this method can be used to on line item click
   * @param index to index
   */

  onLItemClick(index) {
    const len = (this.lineItemMainTable.length) - 1;
    if (len === index) {
      this.addItem();
      const obj: DropdownDto = new DropdownDto();
      this.skuDropDownList.push(obj);
      this.addAdditionalLineItems(len);
    }
  }

  /**
   * this method can be used to add new line additional field item
   * @param index to index
   */
  addAdditionalLineItems(index) {
    this.lineItemAdditionalFieldDetails.forEach((value) => {
      this.lineItemAdditionalField(index + 1).push(this.commonUtil.getAdditionalFieldValidations(value, false));
    });
  }

  navigate(e, name: string, i: any) {
    switch (e.key) {
      case 'ArrowDown':
        if ((this.lineItemMainTable.length) - 2 === i) {
          this.addItemOnclickLink();
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
   * Refresh Vendor list after creating a vendor
   */
  vendorAddedSuccessfully() {
    this.getVendors();
  }

  /**
   * Refresh items list after creating a Item
   */
  itemAddedSuccessfully() {
    this.getVendorItemList(this.selectedVendorId);
  }

  refreshProjectTaskList() {
    this.getProjectCodeList();
  }

  refreshDepartmentList() {
    this.getDepartment();
  }

  /**
   * Decides Whether a additional attachment download or not
   */
  downloadAttachments(val) {
    if (val.fieldId) {
      this.downloadAdditionalAttachments(val);
    } else {
      this.downloadSystemAttachments(val);
    }
  }

  /*
---------------------------------------------------ADDITIONAL ATTACHMENT SECTION-------------------------------------------------------->
 */
  downloadAttachmentsForVendor(val) {
    document.getElementById('downloadAttachment').style.pointerEvents = 'none';
    this.vendorService.downloadAdditionalAttachment(val.id).subscribe((res: any) => {
      if (res.result.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        document.getElementById('downloadAttachment').style.pointerEvents = 'auto';
        this.notificationService.infoMessage(res.body.message);
      } else {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', val.fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.loading = false;
        document.getElementById('downloadAttachment').style.pointerEvents = 'auto';
        this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
      }
    }, error => {
      this.loading = false;
      document.getElementById('downloadAttachment').style.pointerEvents = 'auto';
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Decides Whether a additional attachment delete or not
   */
  deleteAttachments(val, index) {
    if (val.fieldId) {
      this.deleteAdditionalAttachments(val, index);
    } else {
      this.deleteSystemAttachments(val, index);
    }
  }

  downloadSystemAttachments(val: any) {
    this.loading = true;
    this.poService.downloadPoAttachment(val.id).subscribe((res: any) => {
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', val.fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.loading = false;
      this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
    }, error => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    });
  }


  /*
------------------------------ADDITIONAL FIELD RELATED FUNCTIONS------------------------------------------------------------------------->
 */

  deleteSystemAttachments(val: any, index: any) {
    this.confirmationService.confirm({
      key: 'poS',
      message: 'You want to delete this Attachment!',
      accept: () => {
        this.poService.deletePoAttachment(val.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.actualAttachments.splice(index, 1);
            this.notificationService.successMessage(HttpResponseMessage.PO_RECEIPT_ATTACHMENT_DELETED_SUCCESSFULLY);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  /*
  ---------------------------------------------------ADDITIONAL ATTACHMENT SECTION-------------------------------------------------------->
   */
  downloadAdditionalAttachments(val) {
    this.loading = true;
    this.poService.downloadAdditionalAttachment(val.id).subscribe((res: any) => {
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', val.fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.loading = false;
      this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
    }, error => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  deleteAdditionalAttachments(val: any, index: any) {
    this.confirmationService.confirm({
      key: 'poS',
      message: 'You want to delete this Attachment!',
      accept: () => {
        this.poService.deletePoAdditionalAttachment(val.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.PO_RECEIPT_ATTACHMENT_DELETED_SUCCESSFULLY);
            this.actualAttachments.splice(index, 1);
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
   * This method use for add additional fields to po creation
   */
  getModuleReheatedAdditionalField(id, isDetailView) {
    return new Promise<void>(resolve => {
      this.additionalFieldService.getAdditionalField(id, isDetailView, !this.editView).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {

          this.additionalFieldResponse = res.body;
          this.dpNameDepartment.focus();

          this.additionalFieldResponse.forEach(((field) => {
            this.commonUtil.manageDropDownData(field, isDetailView);

            if (field.sectionId === AppModuleSection.MASTER_DATA_INPUT_SECTION_ID) {
              this.addHeadingField(field);
            }

            if (field.sectionId === AppModuleSection.LINE_ITEM_SECTION_ID) {
              this.addLineField(field);
            }

            if (field.sectionId === AppModuleSection.PURCHASING_ACCOUNT_INFO) {
              this.addLineFieldForAccounts(field);
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
   * This method returns the line item section additional detail controllers as an array
   */
  public lineItemAdditionalField(index) {
    return this.lineItemMainTable.controls[index].get('additionalData') as UntypedFormArray;
  }

  /**
   * This method returns the line item section additional detail controllers as an array
   */
  public accountAdditionalField(index) {
    return this.accountDetails.controls[index].get('additionalData') as UntypedFormArray;
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
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.poRequestDto.purchaseOrderDetails, field, false, !this.editView)) {
      return;
    }
    this.lineItemAdditionalFieldDetails.push(field);
    this.lineItemMainTable.controls.forEach((value, index) => {
      this.lineItemAdditionalField(index).push(this.commonUtil.getAdditionalFieldValidations(field, false));
    });
  }

  /**
   * This method use for add line item data additional field and field validations
   * @param field
   * @private
   */
  public addLineFieldForAccounts(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.poRequestDto.purchaseOrderAccountDetails, field, false, !this.editView)) {
      return;
    }
    this.accountAdditionalFieldDetails.push(field);
    this.accountDetails.controls.forEach((value, index) => {
      this.accountAdditionalField(index).push(this.commonUtil.getAdditionalFieldValidations(field, false));
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
   * this method can be used to get file name
   * @param fileUpload string
   * @param i
   */
  fileUploadClick(fileUpload, i: number) {
    document.getElementById(fileUpload + i).click();
  }

  /**
   * this method can be used to add line item on click
   */
  addItemOnclickLink() {
    const itemInfo = this.formBuilder.group({
      id: [],
      productId: [null],
      vendorItemNumber: [null],
      itemName: [null],
      qty: [null],
      itemNumber: [null],
      uomId: [null],
      accountNumber: [null],
      accountId: [null],
      unitPrice: [null],
      departmentId: [],
      accountChanged: [false],
      description: [],
      discountAmount: [null],
      billable: [false],
      taxable: [false],
      amount: [null],
      additionalData: this.formBuilder.array([])
    });
    const obj: DropdownDto = new DropdownDto();
    this.skuDropDownList.push(obj);
    this.lineItemMainTable.push(itemInfo);
    const len = (this.lineItemMainTable.length) - 2;
    this.addAdditionalLineItems(len);

  }

  /**
   * this method can be used to reset po form
   */
  resetPOForm(fromButton?) {
    if (fromButton) {
      this.gaService.trackScreenButtonEvent(
        AppAnalyticsConstants.RESET_BUTTON,
        AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
        AppAnalyticsConstants.RESET_BUTTON,
        AppAnalyticsConstants.CREATE_SCREEN
      );
    }
    this.createPurchaseOrderForm.reset();
    this.setDocumentEvent();
    this.automationService.resetSetFieldValueData();
    this.lineItemAdditionalFieldDetails = [];
    this.headerAdditionalFieldDetails = [];
    this.commonUtil.departmentChanges = [];
    this.accountAdditionalFieldDetails = [];
    this.poAttachments = [];
    this.actualAttachments = [];
    this.vendorRelevantItemList.data = [];
    this.files = [];
    this.isDraftNameAvailable = false;
    this.clearAutomation();
    while (this.lineItemMainTable.length !== 0) {
      this.lineItemMainTable.removeAt(0);
    }

    while (this.accountDetails.length !== 0) {
      this.accountDetails.removeAt(0);
    }


    while (this.headingSectionArray.length !== 0) {
      this.headingSectionArray.removeAt(0);
    }

    while (this.adHocWorkflowDetails.length !== 0) {
      this.adHocWorkflowDetails.removeAt(0);
    }
    if (this.editView || this.isOverrideData) {
      this.loadExistingPoData(this.poID);
    } else {
      this.isTaxTypePercentage ? this.defaultTaxType = 'Percentage' : this.defaultTaxType = 'Fixed Amount';
      this.addAdHocWorkflowDetail();
      this.getModuleReheatedAdditionalField(AppDocumentType.PURCHASE_ORDER, false);
    }
    this.initAddItems();
    this.initAccounts();
    this.getAddressInfo();


    // if (!this.editView || !this.detailView) {
    //   this.getPoNumberFormat(this.createPurchaseOrderForm.get('departmentId'));
    // }

    this.calculateTotal();
  }

  loadExistingPoData(poMstId: number) {
    this.adHocWorkflowDetails.controls = [];
    this.poService.getPoData(poMstId, false).subscribe(async (res: any) => {
      this.departmentChangeFromAutomation = false;
      this.commonUtil.isDepartmentAvailable = res.body.isDepartmentAvailable;
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.poStatus = res.body.status;
        this.poRequestDto = res.body;
        this.selectedVendorId = res.body.vendorId;
        this.getVendorItemList(res.body.vendorId);

        if (res.body.previousAdHocWorkflowDetails) {
          this.previousAdHocWorkflowDetails = res.body.previousAdHocWorkflowDetails;
        }

        if (res.body.projectCodeId) {
          this.loadAccountsToTheProjectTaskIdPo(res.body.projectCodeId, !this.editView, this.poID);
        } else {
          res.body.projectCodeId = this.appConstant.ZERO;
        }


        this.ifVendorIsConfidentialGetApprovalUserList(this.approvalUsers, res.body.createdBy, res.body.vendorId);
        await this.getModuleReheatedAdditionalField(AppDocumentType.PURCHASE_ORDER, false);

        // Format DateStr in to ISO date format
        try {
          res.body.poDate = DataFormatToISODate.convert(res.body.poDate);
          res.body.deliveryDate = DataFormatToISODate.convert(res.body.deliveryDate);
        } catch (e) {
        }

        if (res.body.taxPercentage) {
          res.body.taxAmount = res.body.taxPercentage;
        }
        this.departmentId = res.body.departmentId;
        this.getPoNumberFormat(res.body.departmentId, false);


        this.attachmentId = res.body.attachmentId;
        // Assign Actual Attachments
        // this.actualAttachments = res.body.poAttachments;
        // Assign Additional Attachments
        this.poAttachments = res.body.poAttachments;
        this.poAttachments.forEach((value) => {
          this.actualAttachments.push(value);
        });

        if (res.body.additionalFieldAttachments.length > 0) {
          res.body.additionalFieldAttachments.forEach((value) => {
            this.actualAttachments.push(value);
          });
        }

        if ((this.poStatusFromList === AppEnumConstants.STATUS_DRAFT || this.isOverrideData) && this.attachmentId) {
          this.actualAttachments.splice(this.actualAttachments.findIndex(x => x.id === this.attachmentId),
            AppConstant.ONE);
        }

        while (this.lineItemMainTable.length !== 0) {
          this.lineItemMainTable.removeAt(0);
        }

        while (this.accountDetails.length !== 0) {
          this.accountDetails.removeAt(0);
        }


        // PurchaseOrder Detail load section
        if (res.body.purchaseOrderDetails.length !== 0) {
          res.body.purchaseOrderDetails.forEach((value, index) => {
            this.addItemOnclickLink();
            if (value.uomId) {
              value.uomId = value.uomId.id;
            }
            this.lineItemMainTable.controls[index].get('itemName').patchValue(value.description);
          });
        } else {
          this.addItemOnclickLink();
        }


        if (res.body.purchaseOrderAccountDetails.length !== 0) {
          res.body.purchaseOrderAccountDetails.forEach(() => {
            this.addAccountFieldOnClick();
          });
        } else {
          this.addAccountFieldOnClick();
        }

        if (res.body.previousAdHocWorkflowDetails) {
          this.previousAdHocWorkflowDetails = res.body.previousAdHocWorkflowDetails;
        }

        // Get adHoc workflow data
        this.adHocWorkflowDetails.controls = [];
        if (res.body.adHocWorkflowDetails.length !== 0) {
          res.body.adHocWorkflowDetails.filter(x => x.completed === false).length !== 0 ? this.isAvailableAwaitingApproval = true : this.isAvailableAwaitingApproval = false;
          res.body.adHocWorkflowDetails.filter(x => x.completed === false).length === 0 ? this.addAdHocWorkflowDetail() : null;
          res.body.adHocWorkflowDetails = res.body.adHocWorkflowDetails.sort((ap1, ap2) =>
          (ap2.approvalOrder > ap1.approvalOrder) ? -1 : ((ap2.approvalOrder > ap1.approvalOrder) ? 1 : 0));
          res.body.adHocWorkflowDetails.forEach((value) => {
            if (value.approvalGroup) {
              value.approvalGroup = Number(value.approvalGroup);
            }
            this.addAdHocWorkflowDetail();
          });
        } else if (res.body.status !== AppConstant.STATUS_PENDING) {
          this.addAdHocWorkflowDetail();
        }

        res.body.additionalData = this.commonUtil.patchDropDownAdditionalData(res.body.additionalData);
        res.body.purchaseOrderDetails = this.commonUtil.patchDropDownAdditionalLineItemData(res.body.purchaseOrderDetails);
        res.body.purchaseOrderAccountDetails = this.commonUtil.patchDropDownAdditionalLineItemData(res.body.purchaseOrderAccountDetails);

        res.body.additionalData = this.commonUtil.alignHeadingAdditionalData(this.headerAdditionalFieldDetails, res.body.additionalData);
        this.commonUtil.alignLineAdditionalData(res.body.purchaseOrderDetails, this.lineItemAdditionalFieldDetails);
        this.commonUtil.alignLineAdditionalData(res.body.purchaseOrderAccountDetails, this.accountAdditionalFieldDetails);
        this.getTableRowValues(res.body);
        this.createPurchaseOrderForm.patchValue(res.body);
        this.setDocumentEvent();

        this.isTaxTypePercentage = !!res.body.taxPercentage;
        this.isTaxTypePercentage ? this.defaultTaxType = 'Percentage' : this.defaultTaxType = 'Amount';
        this.createPurchaseOrderForm.get('percentage').patchValue(this.isTaxTypePercentage);

        setTimeout(() => {
          this.createPurchaseOrderForm.markAsDirty();
          this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
        }, 500);

        // po draft related changes
        this.isDraftNameAvailable = false;
        if (this.isClickedEditButtonFromDraftList) {
          this.poService.isProcessingPatchingDataFromPoDraft.next({
            isProgress: false,
            index: this.userAvailableDraftList.findIndex(x => x.id === this.draftId)
          });
          this.isShowDraftListPopUp = false;
        }

        this.validateButtonOnChangeAddOption();
        res.body.purchaseOrderDetails?.forEach((value, index) => {
          this.getItemRelatedSku(res.body.vendorId, value.productId, index);
        });
        this.calculateTotal();


      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, (error => {
      this.notificationService.errorMessage(error);
    }));
  }

  /**
   * this method can be used to get po number pattern
   */
  getPoNumberFormat(departmentId: any, changeNo: boolean) {
    if (!departmentId) {
      return;
    }
    this.poService.getPoNumberPattern(departmentId).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.poNumberFormatMst = res.body;
        if (this.poNumberFormatMst !== null) {
          this.poRequestDto.autoGeneratedPoNo = true;
          this.isOverride = (this.poNumberFormatMst.override === AppConstant.YES);
          if (changeNo && (!this.createPurchaseOrderForm.get(AppConstant.PO_NUMBER).value || !this.isOverride)) {
            this.createPurchaseOrderForm.get(AppConstant.PO_NUMBER).patchValue(this.poNumberFormatMst.poNoPattern);
            this.automationService.setAutomationData(this.createPurchaseOrderForm, AppConstant.PO_NUMBER);
          }
        } else {
          this.isOverride = true;
        }

      } else {
        this.notificationService.infoMessage(res.body.message);
      }

    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to add new
   */
  changeList(selectionName, event, index) {
    if (selectionName === 'Account' && event.value === 0) {
      this.accountDetails.controls[index].get('accountId').reset();
      this.isAddNewAccount = true;
      this.isAddNewProjectCodes = false;
    } else if (selectionName === 'Account' && event.value) {
      this.accountDetails.controls[index].get(AppFormConstants.ACCOUNT_CHANGED).patchValue(true);
    }
    if (selectionName === 'ProjectCodes' && event.value === 0) {
      this.accountDetails.controls[index].get('projectId').reset();
      this.isAddNewAccount = false;
      this.addProjectCodePanel = true;
    }
  }

  /**
   * this method can be used to get account name
   * @param id to account id
   * @param i to index number
   */
  getAccountName(id, i, isItemInfo?) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    if (!isItemInfo) {
      this.accountDetails.controls[i].get('accountName').reset();
    }
    if (!id) {
      return;
    } else {
      this.billApprovalsService.getAccountName(id).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (!isItemInfo) {
            this.accountDetails.controls[i].get('accountNumber').patchValue(res.body.number);
            this.accountDetails.controls[i].get('accountName').patchValue(res.body.name);
          } else {
            this.lineItemMainTable.controls[i].get('accountNumber').patchValue(res.body.number);
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  removeAccount(i) {
    this.accountDetails.removeAt(i);
    this.calculateTotal();
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
  }

  /**
   * This method use for add new form controller group for automation condition
   */
  addAccountFieldOnClick() {
    const accountInfo = this.formBuilder.group({
      accountId: [null],
      accountName: [null],
      description: [null],
      departmentId: [null],
      amount: [null],
      accountNumber: [null],
      accountChanged: [false],
      projectId: [null],
      billable: [false],
      taxable: [false],
      additionalData: this.formBuilder.array([])
    });
    this.accountDetails.push(accountInfo);
    const len = (this.accountDetails.length - 2);
    this.addAccountFields(len);
  }

  /**
   * this method can be used to add new line additional field item
   * @param index to index
   */
  addAccountFields(index) {
    this.accountAdditionalFieldDetails.forEach((value) => {
      this.accountAdditionalField(index + 1).push(this.commonUtil.getAdditionalFieldValidations(value, false));
    });
  }

  /**
   * This method use for add new form controller group for automation condition
   */
  addAccount() {
    const accountInfo = this.formBuilder.group({
      accountId: [null],
      accountName: [null],
      accountNumber: [null],
      departmentId: [null],
      accountChanged: [false],
      description: [null],
      amount: [null],
      projectId: [null],
      billable: [false],
      taxable: [false],
      additionalData: this.formBuilder.array([])
    });
    this.accountDetails.push(accountInfo);
  }

  /**
   * this method can be used to on line item click
   * @param index to index
   */

  onAccountOnClick(index) {
    const len = (this.accountDetails.length) - 1;
    if (len === index) {
      this.addAccount();
      this.addAccountFields(len);
    }
  }

  /**
   * this method can be used to get selected item/account names
   */
  getTableRowValues(poDetail) {
    if (poDetail.purchaseOrderAccountDetails.length > 0) {
      for (const value of poDetail.purchaseOrderAccountDetails) {
        const index = poDetail.purchaseOrderAccountDetails.indexOf(value);
        this.getAccountName(value.accountId, index);
      }
    }
  }

  updateAdditionalFieldDropDowns() {
    this.commonUtil.updateAdditionalFiledDropdowns(this.headerAdditionalFieldDetails, this.selectedAdditionalField);
    this.commonUtil.updateAdditionalFiledDropdowns(this.lineItemAdditionalFieldDetails, this.selectedAdditionalField);
    this.commonUtil.updateAdditionalFiledDropdowns(this.accountAdditionalFieldDetails, this.selectedAdditionalField);
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
   * this method check weather access available for po save as approved
   */
  isAvailableAccessForSaveAsApprovedPo() {
    return (this.privilegeService.isAuthorized(this.appAuthorities.PURCHASE_ORDER_SAVE_AS_APPROVED)
      || this.isSaveAsApprovedWorkFlow) && !this.isSubmissionWorkFlow && (this.poStatus == this.enums.STATUS_REJECT ||
      !this.editView) || (this.poStatus == this.enums.STATUS_PENDING && this.editView && !this.isEnabledSubmitForApprovalButton);
  }

  /**
   * this method check weather access available for po save / resubmit actions
   */
  isAvailableAccessForSavePoOrResubmitPo() {
    return this.editView && ((this.poStatus == this.enums.STATUS_PENDING && this.isEnabledSubmitForApprovalButton) ||
      (this.poStatus == this.enums.STATUS_APPROVED && !this.isEnabledSubmitForApprovalButton)) || this.poStatus == this.enums.STATUS_REJECT;
  }

  /**
   * this method check weather access available for po submit action
   */
  isAvailableAccessForSubmitPo() {
    return (this.privilegeService.isAuthorized(this.appAuthorities.PURCHASE_ORDER_CREATE)
      || this.isSubmissionWorkFlow) && !this.isSaveAsApprovedWorkFlow && ((this.poStatus == this.enums.STATUS_APPROVED &&
      this.isEnabledSubmitForApprovalButton) || !this.editView);
  }

  /**
   * is save as approved button available
   */
  isSaveAsApprovedAllowsForDraft() {
    return (this.privilegeService.isAuthorized(this.appAuthorities.PURCHASE_ORDER_SAVE_AS_APPROVED) || this.isSaveAsApprovedWorkFlow)
      && !this.isSubmissionWorkFlow && (this.poStatus == this.enums.STATUS_DRAFT && this.editView) && !this.isEnabledSubmitForApprovalButton;
  }

  /**
   * is submit for approval button available
   */

  isSubmitForApprovalAllowsForDraft() {
    return (this.privilegeService.isAuthorized(this.appAuthorities.PURCHASE_ORDER_CREATE) || this.isSubmissionWorkFlow)
      && !this.isSaveAsApprovedWorkFlow && ((this.poStatus == this.enums.STATUS_DRAFT) && this.editView);
  }

  /**
   * is save as draft button available
   */
  isSaveAsDraftEnabled() {
    return (this.poStatus === this.enums.STATUS_DRAFT && this.editView) || !(this.poStatus && this.editView);
  }

  /**
   * This method can be used to save document as draft
   * @param value to expense form value
   */
  saveAsDraft(value) {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.SAVE_AS_DRAFT,
      AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
      AppAnalyticsConstants.SAVE_AS_DRAFT,
      AppAnalyticsConstants.CREATE_SCREEN
    );
    this.isSaveAsDraft = true;
    if (!this.createPurchaseOrderForm.get('poNumber').value || !this.createPurchaseOrderForm.get('vendorId').value) {
      if (!this.createPurchaseOrderForm.get('poNumber').value) {
        this.createPurchaseOrderForm.get('poNumber').markAsDirty();
      }
      if (!this.createPurchaseOrderForm.get('vendorId').value) {
        this.createPurchaseOrderForm.get('vendorId').markAsDirty();
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
    this.formatAndAssignValueToMstObject();
    this.poRequestDto.pocPhone = this.commonUtil.getTelNo(this.createPurchaseOrderForm, 'pocPhone');
    this.poService.savePOAsDraft(this.poRequestDto, this.editView, this.isOverrideData).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.editView ? this.notificationService.successMessage(HttpResponseMessage.DRAFT_UPDATED_SUCCESSFULLY) :
          this.notificationService.successMessage(HttpResponseMessage.DRAFT_SAVED_SUCCESSFULLY);
        this.resetPOForm();
        this.close();
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
   * assign common required values for mst object and format additional field values
   */
  formatAndAssignValueToMstObject() {
    this.poRequestDto = this.createPurchaseOrderForm.value;
    this.poRequestDto.additionalData = this.commonUtil.formatMultisetValues(this.poRequestDto.additionalData);
    this.poRequestDto.purchaseOrderDetails = this.commonUtil.formatMultisetLineValues(this.poRequestDto.purchaseOrderDetails);
    this.poRequestDto.purchaseOrderAccountDetails = this.commonUtil.formatMultisetLineValues(this.poRequestDto.purchaseOrderAccountDetails);
    this.poRequestDto.expenseAccountIdList = this.poRequestDto.purchaseOrderAccountDetails?.map(r => r.accountId)?.filter(x => x);
    this.poRequestDto.itemIdList = this.poRequestDto.purchaseOrderDetails?.map(r => r.productId)?.filter(x => x);
    if (this.poNumberFormatMst) {
      this.poRequestDto.autoGeneratedPoNo = (this.poNumberFormatMst.poNoPattern === this.poRequestDto.poNumber);
    }
    this.poRequestDto.documentTypeId = AppDocumentType.PURCHASE_ORDER;
    if (this.poRequestDto.poDate && (this.poRequestDto.poDate instanceof Date)) {
      this.poRequestDto.poDate = this.poRequestDto.poDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    }
    if (this.poRequestDto.deliveryDate && (this.poRequestDto.deliveryDate instanceof Date)) {
      this.poRequestDto.deliveryDate = this.poRequestDto.deliveryDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    }
  }

  /**
   * This method can be used to get available draft id
   * @param poNumber to po number
   */
  getAvailableDraftId(poNumber) {
    if (!poNumber || this.editView) {
      return;
    } else {
      this.poService.getAvailableDraftIdByName(poNumber).subscribe(async (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.isDraftNameAvailable = (isNotNullOrUndefined(res.body) && (this.poStatusFromList !==
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
        key: 'poDraftOverrideConfirmation',
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
    this.poID = this.draftId;
    this.resetPOForm();
  }

  /**
   * this method can be used to get user available draft list
   * this function call from onInit() method
   */
  getAvailableDraftList() {
    if (this.editView) {
      return;
    }
    this.poService.getUserAvailableDraftList().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.userAvailableDraftList = res.body;
        this.isShowDraftListPopUp = (this.userAvailableDraftList.length > this.appConstant.ZERO
          && this.poUtility.showPoDraftListByDefault &&
          (this.poStatusFromList !== this.enums.STATUS_DRAFT));
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
   * this method can be used for submit expense for approval from draft edit
   * @param buttonName to button name
   */
  submitPoFromDraftEditMode(buttonName) {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.SUBMIT_FOR_APPROVED,
      AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
      AppAnalyticsConstants.SUBMIT_FOR_APPROVED,
      AppAnalyticsConstants.CREATE_SCREEN
    );
    if (this.editView) {
      this.commonUtil.validateFileInput(this.createPurchaseOrderForm.get('additionalData'), this.actualAttachments);
    }
    if (this.createPurchaseOrderForm.valid) {
      this.formatAndAssignValueToMstObject();
      this.poRequestDto.pocPhone = this.commonUtil.getTelNo(this.createPurchaseOrderForm, 'pocPhone'); // Add this line
      this.poService.editAndResubmit(this.poRequestDto, false).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(AppHttpResponseMessage.PO_CREATED_SUCCESSFULLY);
          this.resetPOForm();
          this.close();
          this.submitForApprovalLoading = false;
        } else {
          this.submitForApprovalLoading = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.submitForApprovalLoading = false;
        this.notificationService.errorMessage(error.message);
      });
    } else {
      this.submitForApprovalLoading = false;
      new CommonUtility().validateForm(this.createPurchaseOrderForm);
    }
  }

  /**
   * check loading status of footer buttons
   */
  isProgressButton() {
    return (this.btnLoading || this.saveLoading || this.submitForApprovalLoading || this.isSaveAsDraft);
  }

  /**
   * this method used for manage condition of view draft list popup
   */
  showAvailableDraftListPopUp() {
    this.poUtility.getPoDraftListState();
    setTimeout(() => {
      this.getAvailableDraftList();
    }, 1000);
  }


  getDescriptionWiseAccItem(i: any, section) {
    this.memoriseItemAcc.getDescriptionWiseAccItem(i, section, this.accountDetails,
      this.lineItemMainTable, 'PO').then((value: any) => {
      if (!value) {
        return;
      }
      if (this.lineItemMainTable.controls[i].get(AppFormConstants.ACCOUNT_CHANGED).value) {
        return;
      }

      if (section == AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID) {
      } else {
        if (!value.id) {
          return;
        }
        this.getItemRelatedSku(this.selectedVendorId, value.id, i);
      }
    });
  }


  /**
   * this method can be used to clear expense lines
   */
  clearExpenseLines() {
    const expenseTableLength: number = this.accountDetails.length;
    while (this.accountDetails.length !== AppConstant.ZERO) {
      this.accountDetails.removeAt(AppConstant.ZERO);
    }
    for (let i = AppConstant.ZERO; i < expenseTableLength; i++) {
      this.addAccountFieldOnClick();
    }
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER)
  }

  /**
   * this method can be used to clear item lines
   */
  clearItemLines() {
    const itemTableLength: number = this.lineItemMainTable.length;
    while (this.lineItemMainTable.length !== AppConstant.ZERO) {
      this.lineItemMainTable.removeAt(AppConstant.ZERO);
    }
    for (let i = AppConstant.ZERO; i < itemTableLength; i++) {
      this.addItemOnclickLink();
    }
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
  }

  /**
   * this method can be used to select tax type
   * @param event
   */
  getTaxType(event) {
    this.createPurchaseOrderForm.get('taxAmount').reset();
    if (event === 'Percentage') {
      this.isTaxTypePercentage = true;
    } else if (event === 'Amount') {
      this.isTaxTypePercentage = false;
    }
    this.createPurchaseOrderForm.get('percentage').patchValue(this.isTaxTypePercentage);
    this.calculateTotal();
  }

  addNewUOMList(event, index) {
    if (event.value === 0) {
      this.addNewUOM = true;
      this.lineItemMainTable.controls[index].get('uomId').reset();
    }
  }

  public trackingSubmitPoEvent(label) {
    const actions = [
      AppAnalyticsConstants.SAVE_AS_APPROVED,
      AppAnalyticsConstants.SAVE_FOR_APPROVED,
      AppAnalyticsConstants.SAVE,
      AppAnalyticsConstants.RESUBMIT
    ];

    if (actions.includes(label)) {
      this.gaService.trackScreenButtonEvent(
        label,
        AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
        label,
        AppAnalyticsConstants.CREATE_SCREEN
      );
    }

  }


  /**
   * This method use for view additional option input drawer when user click footer add new button
   * @param additionalFieldDetailDto AdditionalFieldDetailDto
   */
  setSelectedAdditionalField(additionalFieldDetailDto: AdditionalFieldDetailDto) {
    this.selectedAdditionalField = additionalFieldDetailDto;
  }

  loadAccountsToTheProjectTaskId() {
    const projectCodeControl = this.createPurchaseOrderForm.get('projectCodeId');
    if (projectCodeControl) {
      const projectCodeValue = projectCodeControl.value;
      this.loadAccountsToTheProjectTaskIdPo(projectCodeValue, !this.editView, this.poID);
    }
  }


  loadAccountsToTheProjectTaskIdPo(projectCodeId, isCreate, poId) {
    this.poService.loadAccountProjectCodeWiseInPo(projectCodeId, isCreate, poId).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.accountList.data = res.body;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  ngOnDestroy(): void {
    this.automationService.resetSetFieldValueData();
    this.fieldSubscription.unsubscribe();
    this.automationService.cleanupListeners();
  }

  changePoDate() {
    this.automationService.setAutomationData(this.createPurchaseOrderForm, AppFormConstants.PO_HEADER_SUBMIT_DATE);
  }

  changeDeliveryDate() {
    this.automationService.setAutomationData(this.createPurchaseOrderForm, AppFormConstants.PO_HEADER_DELIVERY_DATE);
  }

  amountChanged() {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
  }

  itemNumberChanged($event: any, i: any, itemNumber: Dropdown) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    this.patchItemName($event, i);
    if (itemNumber.selectedOption) {
      this.commonUtil.patchSKU(this.lineItemMainTable.controls[i].get('vendorItemNumber'), this.lineItemMainTable.controls[i].get('unitPrice'), itemNumber.selectedOption.sku, itemNumber.selectedOption.itemCost);
    }
    this.commonUtil.isPressEnterInsideDropdown(itemNumber);
    this.commonUtil.patchHeaderDepartmentToLineLevel(this.createPurchaseOrderForm, -1, this.editView, null, true, true);
  }

  accountChangedItmTable(value, i: any, selectAccountLabel: Dropdown) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    this.getAccountName(value, i, true);
    this.commonUtil.isPressEnterInsideDropdown(selectAccountLabel);
  }

  accountChangedExpTable($event: any, i: any, selectAccountLabel: Dropdown) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    this.changeList('Account', $event, i);
    this.getAccountName($event.value, i);
    this.commonUtil.isPressEnterInsideDropdown(selectAccountLabel);
  }

  taxChanged() {
    this.automationService.setAutomationData(this.createPurchaseOrderForm, AppFormConstants.TAX_AMOUNT);
  }

  /**
   * This method use for patch department information
   * @param departmentId number
   */
  patchDepartmentInformation(departmentId) {
      if (departmentId) {
        this.departmentService.getDepartment(departmentId).subscribe((res: any) => {
          if (res.body.useForPoCreation) {
            if (AppResponseStatus.STATUS_SUCCESS === res.status) {
              if (!res.body.billingAddressStr && !res.body.shippingAddressStr) {
                this.po.billingAddress.reset();
                this.po.shippingAddress.reset();
                return;
              }
              this.po.billingAddress.patchValue(res.body.billingAddressStr);
              this.po.shippingAddress.patchValue(res.body.shippingAddressStr);
            }
          } else {
            this.getAddressInfo();
          }
        });
      }
  }
}
