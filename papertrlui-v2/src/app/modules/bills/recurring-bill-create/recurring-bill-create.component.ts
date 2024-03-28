import {
  ChangeDetectorRef,
  Component, ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {BillMasterDto} from '../../../shared/dto/bill/bill-master-dto';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {AppConstant} from '../../../shared/utility/app-constant';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {BillSubmitService} from '../../../shared/services/bills/bill-submit.service';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {BillApprovalsService} from '../../../shared/services/bills/bill-approvals.service';
import {PoService} from '../../../shared/services/po/po.service';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {PoNumberConfigureService} from '../../../shared/services/po-number-configuration/po-number-configure.service';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {OverlayPanel} from 'primeng/overlaypanel';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {Router} from '@angular/router';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {MemoriseItemAcc} from '../../common/memorise-item-acc';
import {ConfirmationService} from 'primeng/api';
import {BillUtility} from '../bill-utility';
import {PaymentsService} from '../../../shared/services/vendor-community/payments.service';
import {BillPaymentService} from '../../../shared/services/bill-payment-service/bill-payment.service';
import {CreditNoteService} from '../../../shared/services/credit-note/credit-note.service';
import {DomSanitizer} from '@angular/platform-browser';
import {ManageDrawerService} from '../../../shared/services/common/manage-drawer-status/manage-drawer.service';
import {MandatoryFields} from '../../../shared/utility/mandatory-fields';
import {ManageFeatureService} from '../../../shared/services/settings/manage-feature/manage-feature.service';
import {GoogleAnalyticsService} from '../../../shared/services/google-analytics/google-analytics.service';
import {AppAnalyticsConstants} from '../../../shared/enums/app-analytics-constants';
import {AccountNumberPopulationLineLevel} from '../../../shared/utility/account-number-population-line-level';
import {CustomLineItemGrid} from '../../../shared/utility/custom-line-item-grid';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';

@Component({
  selector: 'app-recurring-bill-create',
  templateUrl: './recurring-bill-create.component.html',
  styleUrls: ['./recurring-bill-create.component.scss']
})
export class RecurringBillCreateComponent extends MandatoryFields implements OnInit {
  @Output() isClickCloseButton = new EventEmitter<boolean>();
  @Output() editButtonEmitter = new EventEmitter<any>();
  @Output() editSuccessEmitter = new EventEmitter<any>();
  @Input() templateId;
  @Input() detailView = false;
  @Input() editView = false;
  @Input() billStatus: any;
  @ViewChild('overlayPanel') public overlayPanel: OverlayPanel;
  @ViewChild('scheduleName') public scheduleName: ElementRef;

  public createEInvoiceForm: UntypedFormGroup;

  public billMasterDto: BillMasterDto = new BillMasterDto();
  public vendorsList: DropdownDto = new DropdownDto();
  public termList: DropdownDto = new DropdownDto();
  public approvalUserList: DropdownDto = new DropdownDto();
  public approvalGroupList: DropdownDto = new DropdownDto();
  public itemList: DropdownDto = new DropdownDto();
  public uomList: DropdownDto = new DropdownDto();
  public projectCodeList: DropdownDto = new DropdownDto();
  public accountList: DropdownDto = new DropdownDto();
  public department: DropdownDto = new DropdownDto();
  public vendorRelevantItemList: DropdownDto = new DropdownDto();
  public skuDropDownList: DropdownDto [] = [];
  public ruleDetails: any [] = [];
  public adHocWorkflowDetail: any [] = [];
  public previousAdHocWorkflowDetails: any [] = [];
  public dueDate: any;

  public headerAdditionalFieldDetails: AdditionalFieldDetailDto[] = [];
  public additionalFieldForExpenseCostDistributions: AdditionalFieldDetailDto[] = [];
  public additionalFieldForItemCostDistributions: AdditionalFieldDetailDto[] = [];
  public appFieldType = AppFieldType;


  public interval: DropdownDto = new DropdownDto();
  public customIntervals: DropdownDto = new DropdownDto();
  public days: DropdownDto = new DropdownDto();
  public months: DropdownDto = new DropdownDto();
  public weeks: DropdownDto = new DropdownDto();
  public recurringGeneration: DropdownDto = new DropdownDto();
  public recurringOccurrence: DropdownDto = new DropdownDto();
  public removeSpace: RemoveSpace = new RemoveSpace();
  public appAuthorities = AppAuthorities;
  public appFormConstants = AppFormConstants;
  public appConstant: AppConstant = new AppConstant();
  public commonUtil = new CommonUtility();
  public ruleListForItem: DropdownDto [] = [];
  public ruleListForExpense: DropdownDto [] = [];
  public billUtility: BillUtility = new BillUtility(this.billPaymentService, this.notificationService,
    this.privilegeService, this.creditNoteService, this.billsService, this.sanitizer, this.drawerService);

  public accountNumPopulationLines: AccountNumberPopulationLineLevel = new AccountNumberPopulationLineLevel(
    this.billsService, this.notificationService
  );

  public attachments: File[] = [];
  public addNewVendor: boolean;
  public isAddVendor = false;
  public isEnabledSubmitForApprovalButton = false;

  public existingAttachments = [];

  public adHocIndex: number;
  public isLoading = false;
  public isValidDiscountDate = false;
  public addNewItemOverlay: boolean;
  public isLoadingSaveAsApproved = false;
  public isAddNewAccount = false;
  public isAddNewProjectCodes = false;
  public departmentPanel: boolean;
  public addNewUOM = false;
  public separatorList: DropdownDto = new DropdownDto();
  public separatorsMap = new Map();
  public today = new Date();
  public addNewDropDown = false;
  public selectedAdditionalField: AdditionalFieldDetailDto;
  public additionalFieldResponse: AdditionalFieldDetailDto[];
  public selectedVendorId: any;
  public sectionId: any;
  public lineItemIndex: any;
  public isAddRue = false;
  public enums = AppEnumConstants;
  public memoriseItemAcc: MemoriseItemAcc;
  public appModuleSection = AppModuleSection;
  public customLineItemGrid = new CustomLineItemGrid(this.gridService);
  public tableKeyEnum = AppTableKeysData;
  public previousDepartmentId;
  public previousProjectCodeId;

  constructor(public billSubmitService: BillSubmitService, public formBuilder: UntypedFormBuilder, public billsService: BillsService,
              public notificationService: NotificationService, public changeRef: ChangeDetectorRef, public manageFeatureService: ManageFeatureService,
              public billPaymentService: BillPaymentService, public creditNoteService: CreditNoteService,
              public billApprovalsService: BillApprovalsService, public poService: PoService, private automationService: AutomationService,
              public poNumberConfigureService: PoNumberConfigureService, public additionalFieldService: AdditionalFieldService,
              public privilegeService: PrivilegeService, public router: Router, public formGuardService: FormGuardService, private gaService: GoogleAnalyticsService,
              public confirmationService: ConfirmationService, public sanitizer: DomSanitizer, public drawerService: ManageDrawerService,
              private gridService: GridService) {
    super(additionalFieldService, notificationService);
  }

  ngOnInit(): void {
    this.createEInvoiceForm = this.formBuilder.group({
      id: [null],
      vendorId: [{value: null, disabled: this.detailView}, Validators.required],
      type: [{value: null, disabled: this.detailView}],
      scheduleName: [{
        value: null,
        disabled: this.detailView
      }, Validators.compose([Validators.required, Validators.maxLength(50)])],
      billDate: [{value: null, disabled: this.detailView}],
      term: [{value: null, disabled: this.detailView}, Validators.required],
      occurrenceFrequent: [{value: null, disabled: this.detailView}],
      recurringMonth: [{value: null, disabled: this.detailView}],
      intervalValue: [{value: null, disabled: this.detailView}],
      recurringOccurrence: [{value: null, disabled: this.detailView}],
      frequencyEvery: [{value: null, disabled: this.detailView}],
      unit: [{value: null, disabled: this.detailView}],
      recurringDay: [{value: null, disabled: this.detailView}],
      recurringDayOfWeek: [{value: null, disabled: this.detailView}],
      recurringEndDate: [{value: null, disabled: this.detailView}],
      generationFrequent: [{value: null, disabled: this.detailView}],
      generationFrequentStatus: [{value: null, disabled: this.detailView}],
      recurringStartDate: [{value: null, disabled: this.detailView}],
      billAmount: [{value: 0.00, disabled: this.detailView}],
      tax: [{value: null, disabled: this.detailView}],
      attachments: [{value: null, disabled: this.detailView}],
      occurrenceFrequentStatus: [{value: null, disabled: this.detailView}],
      grossAmount: [{value: null, disabled: this.detailView}],
      existingAttachments: [{value: null, disabled: this.detailView}],
      departmentId: [{value: null, disabled: this.detailView}],
      prefixes: [{value: null, disabled: this.detailView}],
      netDaysDue: [{value: null, disabled: this.detailView}],
      discountPercentage: [{value: null, disabled: this.detailView}],
      discountDaysDue: [{value: null, disabled: this.detailView}],
      customIntervalValue: [{value: null, disabled: this.detailView}],
      separatorSymbolId: [{value: null, disabled: this.detailView}],
      saveAsApproved: [{value: false, disabled: this.detailView}],
      projectCodeId: [{value: null, disabled: this.detailView}],
      termManuallyChanged: [false],
      runningNo: [{
        value: null,
        disabled: this.detailView
      }, Validators.compose([Validators.required, Validators.maxLength(10), Validators.pattern('^[0-9]*$')])],
      billNoPattern: [{value: null, disabled: this.detailView}],
      suffixes: [{value: null, disabled: this.detailView}],
      additionalNotes: [{value: null, disabled: this.detailView}],
      adHocWorkflowDetails: this.formBuilder.array([]),
      recurringBillExpenseCostDistributions: this.formBuilder.array([]),
      recurringBillItemCostDistributions: this.formBuilder.array([]),
      additionalData: this.formBuilder.array([]),
      expenseCostDistributionCostTotal: [{value: null, disabled: this.detailView}],
      itemCostDistributionCostTotal: [{value: null, disabled: this.detailView}]
    });
    this.getRequiredFields(this.createEInvoiceForm, AppDocumentType.BILL);
    this.createEInvoiceForm.get(AppFormConstants.INTERVAL_VALUE).valueChanges.subscribe(() => this.intervalChanged());
    this.createEInvoiceForm.get(AppFormConstants.OCCURRENCE_FREQUENT_STATUS).valueChanges.subscribe(() => this.occurrenceFrequentStatus());
    this.createEInvoiceForm.get(AppFormConstants.GENERATION_FREQUENT_STATUS).valueChanges.subscribe(() => this.generationFrequentChanged());
    this.createEInvoiceForm.get(AppFormConstants.CUSTOM_INTERVAL_VALUE).valueChanges.subscribe(() => this.customIntervalChanged());
    this.createEInvoiceForm.get(AppFormConstants.VENDOR_ID).valueChanges.subscribe(data => this.vendorChanged(data));

    this.createEInvoiceForm.get(AppFormConstants.PREFIXES).valueChanges.subscribe(() => this.getNumberPattern());
    this.createEInvoiceForm.get(AppFormConstants.SEPARATOR_SYMBOL_ID).valueChanges.subscribe(() => this.getNumberPattern());
    this.createEInvoiceForm.get(AppFormConstants.RUNNING_NO).valueChanges.subscribe(() => this.getNumberPattern());
    this.createEInvoiceForm.get(AppFormConstants.SUFFIXES).valueChanges.subscribe(() => this.getNumberPattern());
    this.createEInvoiceForm.get(AppFormConstants.TERM).valueChanges.subscribe(() => this.termChanged());
    const date = new Date();
    this.today.setDate(date.getDate());


    // Get Drop down data then patch data if detail view or edit
    this.getDropdown().then(() => {
      this.getTemplateData(this.templateId);
    });
    this.memoriseItemAcc = new MemoriseItemAcc(this.manageFeatureService, this.createEInvoiceForm,
      this.billsService, this.expenseCostDistributionForms, this.itemCostDistributionForms);


    this.createEInvoiceForm.get(AppFormConstants.DEPARTMENT_ID).valueChanges.subscribe((value) => {
      if (value !== this.previousDepartmentId) {
        this.previousDepartmentId = this.createEInvoiceForm.get(AppFormConstants.DEPARTMENT_ID).value;
      }
    });

    this.createEInvoiceForm.get(AppFormConstants.PROJECT_CODE_ID).valueChanges.subscribe((value) => {
      if (value !== this.previousProjectCodeId) {
        this.previousProjectCodeId = this.createEInvoiceForm.get(AppFormConstants.PROJECT_CODE_ID).value;
      }
    });


  }

  /*
  Get all the dropdowns related to Recurring bill template creation
   */
  async getDropdown() {
    if ((!this.editView && !this.detailView)) {
      this.initExpenseCostDistributionRecords();
      this.initItemCostDistributionRecords();
      this.initApprover();
      this.getModuleReheatedAdditionalField(AppDocumentType.BILL, this.detailView);
    }

    this.getUomList();
    this.getProjectTaskList();
    this.getAccounts();
    this.getVendorList();
    this.getApprovalGroupList();
    this.getDepartment();
    this.getTerms();

    // Get Intervals DropDown
    await this.billsService.getIntervalList().then((res) => {
      this.interval.data = res.body;
      this.createEInvoiceForm.get(AppFormConstants.INTERVAL_VALUE).patchValue(this.appConstant.DAILY);
    }).catch((e) => this.notificationService.errorMessage(e));

    // Get Weeks DropDown
    await this.billsService.getWeeks().then((res) => {
      this.weeks.data = res.body;
    }).catch((e) => this.notificationService.errorMessage(e));

    // Get Days DropDown
    await this.billsService.getDays().then((res) => {
      this.days.data = res.body;
    }).catch((e) => this.notificationService.errorMessage(e));

    // Get Custom Intervals DropDown
    await this.billsService.getCustomIntervals().then((res) => {
      this.customIntervals.data = res.body;
    }).catch((e) => this.notificationService.errorMessage(e));

    // Get Months DropDown
    await this.billsService.getMonths().then((res) => {
      this.months.data = res.body;
    }).catch((e) => this.notificationService.errorMessage(e));

    // Get Recurring Generation DropDown
    await this.billsService.getRecurringGeneration().then((res) => {
      this.recurringGeneration.data = res.body;
    }).catch((e) => this.notificationService.errorMessage(e));

    // Get Recurring Occurrence DropDown
    await this.billsService.getRecurringOccurrence().then((res) => {
      this.recurringOccurrence.data = res.body;
    }).catch((e) => this.notificationService.errorMessage(e));

    // Get Separator list to bill number configuration
    await this.poNumberConfigureService.getSeparatorList().then((res) => {
      this.separatorList.data = res.body;
      this.separatorList.data.forEach(value => {
        this.separatorsMap.set(value.id, value.name);
      });
    }).catch((e) => this.notificationService.errorMessage(e));
  }


  getVendorList() {
    this.billsService.getVendorList(!this.editView).subscribe((res: any) => {
      this.vendorsList.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getApprovalGroupList() {
    this.billsService.getApprovalGroupList(!this.editView).subscribe((res: any) => {
      this.approvalGroupList.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getUomList() {
    this.billsService.getUom().subscribe((res: any) => {
      this.uomList.data = res.body;
      this.uomList.addNew();
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getProjectTaskList() {
    this.billsService.getProjectTaskUserWise(AppConstant.PROJECT_CODE_CATEGORY_ID, !this.editView, this.templateId).subscribe((res: any) => {
      this.projectCodeList.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getAccounts() {
    this.billsService.getAccountList(!this.editView).subscribe((res: any) => {
      this.accountList.data = res;
      if (this.privilegeService.isAuthorized(AppAuthorities.ACCOUNTS_CREATE)) {
        this.accountList.addNew();
      }
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

  getTerms() {
    this.billsService.getTermsList().subscribe((res: any) => {
      this.termList.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  intervalChanged() {
    this.createEInvoiceForm.get(AppFormConstants.RECURRING_OCCURRENCE).reset();
    this.createEInvoiceForm.get(AppFormConstants.GENERATION_FREQUENT_STATUS).reset();
    this.createEInvoiceForm.get(AppFormConstants.RECURRING_DAY).reset();
    this.createEInvoiceForm.get(AppFormConstants.RECURRING_DAY_OF_WEEK).reset();
    this.createEInvoiceForm.get(AppFormConstants.RECURRING_MONTH).reset();
    this.createEInvoiceForm.get(AppFormConstants.GENERATION_FREQUENT).reset();
    this.createEInvoiceForm.get(AppFormConstants.CUSTOM_INTERVAL_VALUE).reset();

    this.createEInvoiceForm.get(AppFormConstants.RECURRING_START_DATE).reset();
    this.createEInvoiceForm.get(AppFormConstants.OCCURRENCE_FREQUENT_STATUS).reset();
    this.createEInvoiceForm.get(AppFormConstants.RECURRING_END_DAY).reset();
    this.createEInvoiceForm.get(AppFormConstants.OCCURRENCE_FREQUENT).reset();
  }

  occurrenceFrequentStatus() {
    this.createEInvoiceForm.get(AppFormConstants.OCCURRENCE_FREQUENT).reset();
    this.createEInvoiceForm.get(AppFormConstants.RECURRING_END_DAY).reset();
  }

  generationFrequentChanged() {
    this.createEInvoiceForm.get(AppFormConstants.RECURRING_DAY).reset();
    this.createEInvoiceForm.get(AppFormConstants.RECURRING_DAY_OF_WEEK).reset();
  }

  customIntervalChanged() {
    this.createEInvoiceForm.get(AppFormConstants.RECURRING_DAY).reset();
    this.createEInvoiceForm.get(AppFormConstants.RECURRING_DAY_OF_WEEK).reset();
    this.createEInvoiceForm.get(AppFormConstants.RECURRING_MONTH).reset();
  }

  /**
   * Triggers on a value change of vendor Id
   */
  vendorChanged(id) {
    this.getVendorRelatedTerms(id);
  }

  /**
   * This method can be used to get item name
   * @param id to selected item id
   *  @param index to formGroup index
   */
  getItemName(id, index) {
    if (!id) {
      return;
    } else {
      if (this.itemCostDistributionForms.controls[index].get('itemId').value === AppConstant.NULL_VALUE) {
        this.itemCostDistributionForms.controls[index].get('itemName').reset();
        this.itemCostDistributionForms.controls[index].get('itemNumber').reset();
        this.itemCostDistributionForms.controls[index].get('vendorItemNumber').reset();
        return;
      } else {
        if (id !== AppConstant.ZERO && this.itemCostDistributionForms.controls[index].get('itemId').value) {
          this.getItemRelatedSku(this.selectedVendorId, id, index);
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
        }
      }
    }
  }

  /**
   * this method can be used to get account name
   * @param id to account id
   * @param i to index number
   */
  getAccountName(id, i) {
    if (!id) {
      return;
    } else {
      this.billApprovalsService.getAccountName(id).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.expenseCostDistributionForms.controls[i].get('accountName').patchValue(res.body.name);
          this.expenseCostDistributionForms.controls[i].get('accountNumber').patchValue(res.body.number);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  /**
   * Change Department
   * @param event any
   */
  changedDepartment(event: any, dpNameDepartment) {
    if (event.value === 0) {
      this.departmentPanel = true;
      this.createEInvoiceForm.get(AppFormConstants.DEPARTMENT_ID).reset();
    }
    this.commonUtil.patchHeaderLevelDepartmentAndProjectCodeLineLevel(AppFormConstants.DEPARTMENT_ID,
      dpNameDepartment.selectedOption.id, this.expenseCostDistributionForms.controls, dpNameDepartment);
  }

  /**
   * Change Department from item Table
   * @param event drop down
   * @param index
   */
  changedDepartmentItem(event, index) {
    if (event.value === 0) {
      this.departmentPanel = true;
      this.itemCostDistributionForms.controls[index].get(AppFormConstants.DEPARTMENT_ID).reset();
    }
  }

  /**
   * Change Department from account Table
   * @param event drop down
   * @param index
   */
  changedDepartmentAccount(event, index) {
    if (event.value === 0) {
      this.departmentPanel = true;
      this.expenseCostDistributionForms.controls[index].get(AppFormConstants.DEPARTMENT_ID).reset();
    }
  }


  getTemplateData(templateId) {
    if ((!this.editView && !this.detailView)) {
      return;
    }
    this.billsService.getRecurringBillTemplateData(templateId).then(async (res: any) => {
      this.adHocWorkflowDetail = res.body.adHocWorkflowDetails;
      this.commonUtil.isDepartmentAvailable = res.body.departmentAvailable;
      this.commonUtil.isProjectCodeAvailable = res.body.projectCodeAvailable;
      this.billMasterDto = res.body;
      this.selectedVendorId = res.body.vendorId;
      this.getApprovalUserList(res.body.vendorId);
      this.getVendorItemList(res.body.vendorId);
      if (this.editView || this.detailView) {
        await this.getModuleReheatedAdditionalField(AppDocumentType.BILL, this.detailView);
      }

      this.existingAttachments = res.body.existingAttachments;
      res.body.additionalFieldAttachments.forEach((value) => {
        this.existingAttachments.push(value);
      });

      res.body.additionalData = this.commonUtil.patchDropDownAdditionalData(res.body.additionalData);
      res.body.recurringBillExpenseCostDistributions = this.commonUtil.patchDropDownAdditionalLineItemData(res.body.recurringBillExpenseCostDistributions);
      res.body.recurringBillItemCostDistributions = this.commonUtil.patchDropDownAdditionalLineItemData(res.body.recurringBillItemCostDistributions);
      res.body.additionalData = this.commonUtil.alignHeadingAdditionalData(this.headerAdditionalFieldDetails, res.body.additionalData);
      this.commonUtil.alignLineAdditionalData(res.body.recurringBillExpenseCostDistributions, this.additionalFieldForExpenseCostDistributions);
      this.commonUtil.alignLineAdditionalData(res.body.recurringBillItemCostDistributions, this.additionalFieldForItemCostDistributions);


      if (res.body.recurringBillExpenseCostDistributions.length > 0) {
        res.body.recurringBillExpenseCostDistributions.forEach((value, index) => {
          this.addExpenseFieldOnClick();
          this.getAccountName(value.accountId, index);
        });
      } else if (!this.detailView) {
        this.addExpenseFieldOnClick();
      }

      if (res.body.recurringBillItemCostDistributions.length > 0) {
        res.body.recurringBillItemCostDistributions.forEach((value, index) => {
          this.addItemOnClick();
          this.getItemName(value.itemId, index);
        });
      } else if (!this.detailView) {
        this.addItemOnClick();
      }

      if (res.body.previousAdHocWorkflowDetails) {
        this.previousAdHocWorkflowDetails = res.body.previousAdHocWorkflowDetails;
      }

      if (res.body.adHocWorkflowDetails.length > 0) {
        res.body.adHocWorkflowDetails.forEach((value, index) => {
          this.addAdHocWorkflowDetail();
        });
      } else if (!this.detailView) {
        this.initApprover();
      }

      if (res.body.actualRecurringStartDate) {
        res.body.actualRecurringStartDate = new Date(res.body.actualRecurringStartDate);
        res.body.recurringStartDate = res.body.actualRecurringStartDate;
      }
      if (res.body.actualRecurringEndDate) {
        res.body.recurringEndDate = res.body.actualRecurringEndDate;
      }

      this.createEInvoiceForm.patchValue(res.body);
      this.validateButtonOnChangeAddOption();
      if (res.body.actualRecurringStartDate) {
        this.createEInvoiceForm.get(AppFormConstants.RECURRING_START_DATE).patchValue(res.body.actualRecurringStartDate);
      }
      if (res.body.actualRecurringEndDate) {
        this.createEInvoiceForm.get(AppFormConstants.RECURRING_END_DAY).patchValue(res.body.actualRecurringEndDate);
      }

      if (res.body?.recurringBillItemCostDistributions?.length > 0) {
        res.body.recurringBillItemCostDistributions.forEach((value, index) => {
          this.getItemRelatedSku(this.selectedVendorId, value.itemId, index);
        });
      }

      this.getTotalCostDistribution();

    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  getTotalCostDistribution() {

    let expenseCostDistributionAmount = 0.00;
    let itemCostDistributionAmount = 0.00;
    let billAmount = 0.0;


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
   * this method can be used to closed the e invoice screen
   */
  closeEInvoiceCreateMode() {
    this.isClickCloseButton.emit(false);
  }

  /**
   * this method can be used to create template
   */
  createUpdateTemplate(type) {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.CREATE_SCHEDULE,
      AppAnalyticsConstants.MODULE_NAME_RECURRING_BILLS,
      AppAnalyticsConstants.CREATE_SCHEDULE,
      AppAnalyticsConstants.CONFIGURE_RECURRING_BILL
    );
    this.createEInvoiceForm.get('attachments').patchValue(this.attachments);

    if (this.editView) {
      this.commonUtil.validateFileInput(this.createEInvoiceForm.get('additionalData'), this.existingAttachments);
    }

    if (!this.createEInvoiceForm.valid) {
      new CommonUtility().validateForm(this.createEInvoiceForm);
      return;
    }

    try {
      let date = this.createEInvoiceForm.get('recurringStartDate').value;
      if (date) {
        date = date.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
        this.createEInvoiceForm.get('recurringStartDate').patchValue(date);
      }
    } catch (e) {
    }

    try {
      let date = this.createEInvoiceForm.get('recurringEndDate').value;
      if (date) {
        date = date.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
        if (date) {
          this.createEInvoiceForm.get('recurringEndDate').patchValue(date);
        }
      }
    } catch (e) {
    }

    this.isLoading = true;

    if (this.createEInvoiceForm.get('saveAsApproved').value) {
      this.adHocWorkflowDetails.clear();
    }
    const recurringBillObj = this.createEInvoiceForm.getRawValue();

    // this.formatMultisetValue(recurringBillObj);
    recurringBillObj.additionalData = this.commonUtil.formatMultisetValues(recurringBillObj.additionalData);
    recurringBillObj.recurringBillItemCostDistributions = this.commonUtil.formatMultisetLineValues(recurringBillObj.recurringBillItemCostDistributions);
    recurringBillObj.recurringBillExpenseCostDistributions = this.commonUtil.formatMultisetLineValues(recurringBillObj.recurringBillExpenseCostDistributions);

    if (type === 'C') {
      this.billsService.createTemplate(recurringBillObj).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.RECURRING_BILL_CREATED_SUCCESSFULLY);
          this.isLoading = false;
          this.isClickCloseButton.emit(false);
        } else {
          this.isLoading = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.isLoading = false;
        this.notificationService.errorMessage(error);
      });
    } else {
      this.createEInvoiceForm.get('existingAttachments').patchValue(this.existingAttachments);

      const existingAttachments = [];
      const additionalFieldAttachments = [];
      this.existingAttachments.forEach(value => {
        if (value.fieldId) {
          additionalFieldAttachments.push(value);
        } else {
          existingAttachments.push(value);
        }
      });

      recurringBillObj.existingAttachments = existingAttachments;
      recurringBillObj.additionalFieldAttachments = additionalFieldAttachments;

      this.billsService.updateRecurringTemplate(recurringBillObj).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.RECURRING_BILL_UPDATED_SUCCESSFULLY);
          this.isLoading = false;
          this.isClickCloseButton.emit(false);
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
   * this method can be used to reset e invoice form
   */
  async resetEInvoiceForm() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.MODULE_NAME_RECURRING_BILLS,
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.CONFIGURE_RECURRING_BILL
    );
    this.createEInvoiceForm.reset();
    this.headingSectionArray.clear();
    this.expenseCostDistributionForms.clear();
    this.itemCostDistributionForms.clear();
    this.adHocWorkflowDetails.clear();
    this.headingSectionArray.controls = [];
    this.vendorRelevantItemList.data = [];
    this.headerAdditionalFieldDetails = [];
    this.commonUtil.projectCodeChanges = [];
    this.commonUtil.departmentChanges = [];
    this.additionalFieldForExpenseCostDistributions = [];
    this.additionalFieldForItemCostDistributions = [];
    this.attachments = [];

    if (!this.editView) {
      this.createEInvoiceForm.get(AppFormConstants.INTERVAL_VALUE).patchValue(this.appConstant.DAILY);
      this.createEInvoiceForm.get(AppFormConstants.BILL_AMOUNT).patchValue(0.00);
    }
    if ((!this.editView && !this.detailView)) {
      await this.getModuleReheatedAdditionalField(AppDocumentType.BILL, this.detailView);
      this.initExpenseCostDistributionRecords();
      this.initItemCostDistributionRecords();
      this.initApprover();
    }
    this.getTemplateData(this.templateId);
  }

  /**
   * This method can be used to remove items
   */
  removeItem(itemIndex) {
    this.itemCostDistributionForms.removeAt(itemIndex);
  }

  /**
   * This method can be used to remove selected file
   * @param event to remove event
   */
  onRemove(event) {
    this.attachments.splice(this.attachments.indexOf(event), 1);
  }


  /**
   * This method add item to array
   */
  addItemCostDistributionField() {
    const itemCostDistributionForms = this.formBuilder.group({
      itemId: [{value: null, disabled: this.detailView}],
      itemName: [{value: null, disabled: this.detailView}],
      vendorItemNumber: [{value: null, disabled: this.detailView}],
      description: [{value: null, disabled: this.detailView}],
      accountId: [{value: null, disabled: this.detailView}],
      accountNumber: [{value: null, disabled: this.detailView}],
      qty: null,
      rate: null,
      accountChanged: [false],
      amount: null,
      billable: [false],
      taxable: [false],
      hideAccountNumberInput: [false],
      departmentId: [{value: null, disabled: this.detailView}],
      projectId: [{value: null, disabled: this.detailView}],
      itemNumber: [{value: null, disabled: this.detailView}],
      additionalData: this.formBuilder.array([])
    });
    const obj: DropdownDto = new DropdownDto();
    this.skuDropDownList.push(obj);
    const itemRuleList: DropdownDto = new DropdownDto();
    this.ruleListForItem.push(itemRuleList);
    this.billUtility.addEmptyDropDownReferenceForAccountField();
    this.itemCostDistributionForms.push(itemCostDistributionForms);
  }

  /**
   * This method add account to array
   */
  addExpenseCostDistributionField() {
    const expenseInfo = this.formBuilder.group({
      accountId: [{value: null, disabled: this.detailView}],
      accountName: [{value: null, disabled: this.detailView}],
      accountNumber: [{value: null, disabled: this.detailView}],
      departmentId: [{value: null, disabled: this.detailView}],
      description: [{value: null, disabled: this.detailView}],
      amount: null,
      billable: [false],
      accountChanged: [false],
      taxable: [false],
      projectId: [{value: null, disabled: this.detailView}],
      hideAccountNumberInput: [false],
      additionalData: this.formBuilder.array([])
    });
    const expenseRuleList: DropdownDto = new DropdownDto();
    this.ruleListForExpense.push(expenseRuleList);
    this.billUtility.addEmptyDropDownReferenceForAccountField();
    this.expenseCostDistributionForms.push(expenseInfo);
  }

  /**
   * This method add item to array with additional field
   */
  addItemOnClick() {
    const itemInfo = this.formBuilder.group({
      itemId: [{value: null, disabled: this.detailView}],
      itemName: [{value: null, disabled: this.detailView}],
      vendorItemNumber: [{value: null, disabled: this.detailView}],
      description: [{value: null, disabled: this.detailView}],
      accountId: [{value: null, disabled: this.detailView}],
      accountNumber: [{value: null, disabled: this.detailView}],
      qty: null,
      rate: null,
      amount: null,
      billable: [false],
      taxable: [false],
      accountChanged: [false],
      hideAccountNumberInput: [false],
      departmentId: [{value: null, disabled: this.detailView}],
      projectId: [{value: null, disabled: this.detailView}],
      itemNumber: [{value: null, disabled: this.detailView}],
      additionalData: this.formBuilder.array([])
    });
    this.itemCostDistributionForms.push(itemInfo);
    const obj: DropdownDto = new DropdownDto();
    this.skuDropDownList.push(obj);
    const itemRuleList: DropdownDto = new DropdownDto();
    this.ruleListForItem.push(itemRuleList);
    this.billUtility.addEmptyDropDownReferenceForAccountField();
    const lastIndex = (this.itemCostDistributionForms.length - 2);
    this.addAdditionalLineItems(lastIndex);
  }

  /**
   * This method add account to array with additional field
   */
  addExpenseFieldOnClick() {
    const itemInfo = this.formBuilder.group({
      accountId: [{value: null, disabled: this.detailView}],
      accountName: [{value: null, disabled: this.detailView}],
      accountNumber: [{value: null, disabled: this.detailView}],
      departmentId: [{value: null, disabled: this.detailView}],
      description: [{value: null, disabled: this.detailView}],
      amount: null,
      billable: [false],
      accountChanged: [false],
      taxable: [false],
      hideAccountNumberInput: [false],
      projectId: [{value: null, disabled: this.detailView}],
      additionalData: this.formBuilder.array([])
    });
    const expenseRuleList: DropdownDto = new DropdownDto();
    this.ruleListForExpense.push(expenseRuleList);
    this.billUtility.addEmptyDropDownReferenceForAccountField();
    this.expenseCostDistributionForms.push(itemInfo);
    const len = (this.expenseCostDistributionForms.length - 2);
    this.addExpenseFields(len);
  }

  /**
   * Add new approver
   */
  addAdHocWorkflowDetail() {
    const addHocWorkflowDetail = this.formBuilder.group({
      approvalOrder: [{value: null, disabled: this.detailView}],
      approvalGroup: [{value: null, disabled: this.detailView}],
      approvalUser: [{value: null, disabled: this.detailView}],
      id: [null],
      completed: [false],
    });
    this.adHocWorkflowDetails.push(addHocWorkflowDetail);
    const adHocWorkFlowOrderNumber = this.adHocWorkflowDetails.length;
    this.adHocWorkflowDetails.controls[adHocWorkFlowOrderNumber - 1].get('approvalOrder').patchValue(adHocWorkFlowOrderNumber);
    this.validateButtonOnChangeAddOption();
  }


  /*
  APPROVER FORM ARRAY DETAILS------------------------------------------------------------------------------------------------->
 */

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
    if (this.detailView) {
      return;
    }
    const lastIndexNumber = (this.itemCostDistributionForms.length) - 1;
    if (lastIndexNumber === index) {
      this.addItemCostDistributionField();
      this.addAdditionalLineItems(lastIndexNumber);
    }
  }


  /**
   * this method can be used to on line item click
   * @param clickIndex to index
   */

  onExpenseCostDistributionClick(clickIndex) {
    if (this.detailView) {
      return;
    }
    const lastIndexNumber = (this.expenseCostDistributionForms.length) - 1;
    if (lastIndexNumber === clickIndex) {
      this.addExpenseCostDistributionField();
      this.addExpenseFields(lastIndexNumber);
    }
  }

  /*
  Calculate Total -------------------------------------------------------------------------------------------------->
   */

  navigate(e, name: string, i: any) {
    switch (e.key) {
      case 'ArrowDown':
        if ((this.itemCostDistributionForms.length) - 2 === i) {
          this.addItemCostDistributionField();
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
      this.addNewItemOverlay = true;
    } else {
      if (this.itemCostDistributionForms.controls[i].get('itemId').value) {
        this.itemCostDistributionForms.controls[i].get('vendorItemNumber').reset();
        this.getItemRelatedSku(this.selectedVendorId, selectedId, i);
      }
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

  /*
Form Arrays -------------------------------------------------------------------------------------------------------------->
*/

  /**
   * This method can use for get controllers in form array
   */
  public get itemCostDistributionForms() {
    return this.createEInvoiceForm.get('recurringBillItemCostDistributions') as UntypedFormArray;
  }

  /**
   * This method can use for get controllers in form array
   */
  public get expenseCostDistributionForms() {
    return this.createEInvoiceForm.get('recurringBillExpenseCostDistributions') as UntypedFormArray;
  }


  /**
   * This method use for add new form group in expense table
   */
  addExpenseCostDistributionFieldOnClick() {
    this.addExpenseCostDistributionField();
  }

  /**
   * this method can be used to init approver dropdown
   */
  initExpenseCostDistributionRecords() {
    for (let i = 0; i < 10; i++) {
      this.addExpenseCostDistributionField();
    }
  }

  get bill() {
    return this.createEInvoiceForm.controls;
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
   * This method returns the line item section additional detail controllers as an array
   */
  public expenseCostDistributionAdditionalFields(index) {
    return this.expenseCostDistributionForms.controls[index].get('additionalData') as UntypedFormArray;
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
    if (multiSelect.allChecked) {
      multiSelect._options.forEach((value) => {
        value.isChecked = true;
      });
    } else {
      const allChecked: boolean = multiSelect._options.every(function(item: any) {
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
   * this method can be used to add new line additional field item
   * @param index to index
   */
  addAdditionalLineItems(index) {
    this.additionalFieldForItemCostDistributions.forEach((value) => {
      this.itemDetailsAdditionalFields(index + 1).push(this.commonUtil.getAdditionalFieldValidations(value, this.detailView));
      // this.itemDetailsAdditionalFields(index + 1).push(this.getAdditionalFieldValidations(value));
    });
  }

  /**
   * This method use for add additional fields to po creation
   */
  getModuleReheatedAdditionalField(id, isDetailView) {
    return new Promise<void>((resolve, reject) => {
      this.additionalFieldService.getAdditionalFieldToRecurringBill(id, isDetailView, !this.editView).then((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {

          this.additionalFieldResponse = res.body;
          this.scheduleName.nativeElement.focus();

          this.additionalFieldResponse.forEach(((field) => {
            this.commonUtil.manageDropDownData(field, this.detailView);

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
        this.customLineItemGrid.initCreateRecurringBillExpTable(this.additionalFieldForExpenseCostDistributions);
        this.customLineItemGrid.initCreateRecurringBillItmTable(this.additionalFieldForItemCostDistributions);
        resolve();
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
    this.headingSectionArray.push(this.commonUtil.getAdditionalFieldValidations(field, this.detailView));
  }

  /**
   * This method use for add line item data additional field and field validations
   * @param field to additional field dto
   */
  public addAdditionalFieldForItemDetailTable(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.billMasterDto.recurringBillItemCostDistributions, field, this.detailView, !this.editView && !this.detailView)) {

      return;
    }
    if (this.detailView || this.editView) {
      if (field.docStatus !== AppEnumConstants.STATUS_APPROVED) {
        return;
      }
    }
    this.additionalFieldForItemCostDistributions.push(field);
    this.itemCostDistributionForms.controls.forEach((value, index) => {
      this.itemDetailsAdditionalFields(index).push(this.commonUtil.getAdditionalFieldValidations(field, this.detailView));
    });
  }

  /**
   * This method use for add line item data additional field and field validations
   */
  public addAdditionalFieldForExpenseCostDistributionTable(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.billMasterDto.recurringBillExpenseCostDistributions, field, this.detailView, !this.editView && !this.detailView)) {
      return;
    }
    if (this.detailView || this.editView) {
      if (field.docStatus !== AppEnumConstants.STATUS_APPROVED) {
        return;
      }
    }
    this.additionalFieldForExpenseCostDistributions.push(field);
    this.expenseCostDistributionForms.controls.forEach((value, index) => {
      this.expenseCostDistributionAdditionalFields(index).push(this.commonUtil.getAdditionalFieldValidations(field, this.detailView));
    });
  }

  /**
   * this method can be used to add new line additional field item
   * @param index to index
   */
  addExpenseFields(index) {
    this.additionalFieldForExpenseCostDistributions.forEach((value) => {
      this.expenseCostDistributionAdditionalFields(index + 1).push(this.commonUtil.getAdditionalFieldValidations(value, this.detailView));
    });
  }

  formatDateSection(event, index, field) {
    if (!event) {
      return;
    }
    field.value.fieldValue = event.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
  }


  /**
   * navigate among fields
   * @param e to event
   * @param name to element name
   * @param i to index
   */
  navigateInExpenseCostDistributionTable(e, name: string, i: any) {
    switch (e.key) {
      case 'ArrowDown':
        if ((this.expenseCostDistributionForms.length) - 2 === i) {
          this.addExpenseCostDistributionFieldOnClick();
        }
        if ((this.expenseCostDistributionForms.length) - 1 !== i) {
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
   * this method can be used to add new
   */
  changeList(selectionName, selectedId, index) {
    if (selectionName === 'Account' && selectedId === 0) {
      this.isAddNewAccount = true;
      this.addNewItemOverlay = false;
      this.isAddNewProjectCodes = false;
      setTimeout(() => {
        this.expenseCostDistributionForms.controls[index].get('accountId').reset();
      }, 100);
    } else if (selectionName === 'Account' && selectedId !== 0) {
      this.expenseCostDistributionForms.controls[index].get(AppFormConstants.ACCOUNT_CHANGED).patchValue(true);
    }
    if (selectionName === 'Item' && selectedId === 0) {
      this.isAddNewAccount = false;
      this.addNewItemOverlay = true;
      this.isAddNewProjectCodes = false;
      setTimeout(() => {
        this.itemCostDistributionForms.controls[index].get('itemId').reset();
      }, 100);
    }
    if (selectionName === 'ProjectCodesInExpense' && selectedId === 0) {
      this.expenseCostDistributionForms.controls[index].get('projectId').reset();
      this.isAddNewAccount = false;
      this.addNewItemOverlay = false;
      this.isAddNewProjectCodes = true;
    }
    if (selectionName === 'ProjectCodesInHeader' && selectedId === 0) {
      this.createEInvoiceForm.get('projectCodeId').reset();
      this.isAddNewAccount = false;
      this.addNewItemOverlay = false;
      this.isAddNewProjectCodes = true;
    }
    if (selectionName === 'ProjectCodesInItem' && selectedId === 0) {
      this.itemCostDistributionForms.controls[index].get('projectId').reset();
      this.isAddNewAccount = false;
      this.addNewItemOverlay = false;
      this.isAddNewProjectCodes = true;
    }
  }

  /**
   * this method can be used to get account name
   * @param id to account id
   * @param i to index number
   */
  getAccountNameForExpenseContributionTable(id, i, isItemCostDistribution?) {
    if (!isItemCostDistribution) {
      this.expenseCostDistributionForms.controls[i].get('accountNumber').reset();
      this.expenseCostDistributionForms.controls[i].get('accountName').reset();
    } else {
      this.itemCostDistributionForms.controls[i].get('accountNumber').reset();
    }
    if (id !== null && id !== 0) {
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
    }
  }

  /**
   * Convert Date object to string
   */
  validateEndDate(value) {
    try {
      if (this.createEInvoiceForm.get('recurringEndDate').value < value) {
        this.createEInvoiceForm.get('recurringEndDate').reset();
      }
    } catch (e) {
    }

  }


  deleteAttachmentOnEdit(i: any) {
    this.existingAttachments.splice(i, 1);
  }

  downloadAttachment(val) {
    if (val.fieldId) {
      this.downloadAdditionalFieldAttachments(val);
    } else {
      this.downloadAdditionalAttachment(val);
    }
  }

  downloadAdditionalAttachment(val: any) {
    this.billsService.downloadRecurringAttachment(val.id).subscribe((res: any) => {
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

  downloadAdditionalFieldAttachments(val) {
    this.billsService.downloadRecurringAdditionalFieldAttachments(val.id).subscribe((res: any) => {
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


  getNumberPattern() {
    this.createEInvoiceForm.get('billNoPattern').patchValue((this.createEInvoiceForm.get('prefixes').value ? this.createEInvoiceForm.get('prefixes').value : '') +
      ((this.createEInvoiceForm.get('separatorSymbolId').value && this.createEInvoiceForm.get('prefixes').value) ?
        this.separatorsMap.get(this.createEInvoiceForm.get('separatorSymbolId').value) : '') +
      ((this.createEInvoiceForm.get('runningNo').value && this.createEInvoiceForm.get('runningNo').valid) ? this.createEInvoiceForm.get('runningNo').value : '') +
      ((this.createEInvoiceForm.get('separatorSymbolId').value && this.createEInvoiceForm.get('suffixes').value) ?
        this.separatorsMap.get(this.createEInvoiceForm.get('separatorSymbolId').value) : '') +
      (this.createEInvoiceForm.get('suffixes').value ? this.createEInvoiceForm.get('suffixes').value : ''));
  }

  getMinDate(): Date {
    if (this.createEInvoiceForm.get('recurringStartDate').value) {
      return (this.createEInvoiceForm.get('recurringStartDate').value);
    } else {
      return this.today;
    }
  }

  isFieldHidden(value: any, docStatus: string) {
    if (docStatus === 'I') {
      return null;
    }
    if (docStatus === 'A' && value) {
      return value;
    } else if (docStatus === 'A' && !value && this.detailView) {
      return null;
    }
    if (docStatus === 'A') {
      return true;
    }
  }

  /**
   * this method trigger on change the dropdown
   * @param event to change event
   */
  changeVendorDropDownList(event) {
    if (!event.value && event.value === AppConstant.ZERO) {
      return;
    }
    this.selectedVendorId = event.value;
    if (event.value === AppConstant.NULL_VALUE || event.value === AppConstant.UNDEFINED_VALUE) {
      this.approvalUserList.data = [];
      this.adHocWorkflowDetails.controls = [];
      this.addAdHocWorkflowDetail();
    } else {
      this.approvalUserList.data = [];
      this.adHocWorkflowDetails.controls = [];
      this.initApprover();
      this.getApprovalUserList(event.value);
      this.clearItemDetailTableData();
      if (this.createEInvoiceForm.get(AppFormConstants.PROJECT_CODE_ID).value) {
        this.itemCostDistributionForms.controls[0].get('projectId').patchValue(this.previousProjectCodeId);
      }
      if (this.createEInvoiceForm.get(AppFormConstants.DEPARTMENT_ID).value) {
        this.itemCostDistributionForms.controls[0].get(this.appFormConstants.DEPARTMENT_ID).patchValue(this.previousDepartmentId);
      }
    }
  }

  /**
   * this method can be use to get approval user list
   */
  getApprovalUserList(venId) {
    const authorities = [AppAuthorities.BILL_APPROVE, AppAuthorities.BILL_REJECT,
      AppAuthorities.BILL_OVERRIDE_APPROVAL];
    this.billsService.getApprovalUserListAccordingToVendorSelection(this.billMasterDto.createdBy, authorities, venId, !this.editView)
      .subscribe((res: any) => {
        this.approvalUserList.data = res.body;
      }, error => {
        this.notificationService.errorMessage(error);
      });
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
   * this method trigger change the vendor dropdown
   */
  clearItemDetailTableData() {
    const tempLineItemAdditionalData = this.additionalFieldForItemCostDistributions;
    this.additionalFieldForItemCostDistributions = [];
    while (this.itemCostDistributionForms.length !== 0) {
      this.itemCostDistributionForms.removeAt(0);
    }
    this.additionalFieldForItemCostDistributions = tempLineItemAdditionalData;
    for (let i = 0; i < 10; i++) {
      this.addItemOnClick();
    }
    this.getVendorItemList(this.selectedVendorId);
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
    if (this.sectionId === AppModuleSection.ITEM_COST_DISTRIBUTION_SECTION_ID) {
      rule.description = this.itemCostDistributionForms.controls[this.lineItemIndex].get('description').value;
      rule.dropDownSelectionId = this.itemCostDistributionForms.controls[this.lineItemIndex].get('itemId').value;
    }
    this.automationService.automationRule.next(rule);
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
    if (!this.editView) {
      return;
    } else {
      this.isEnabledSubmitForApprovalButton = this.adHocWorkflowDetails.controls.filter(x =>
        ((x.get('approvalUser').value != null) || (x.get('approvalGroup').value != null)) &&
        x.get('completed').value === false).length > AppConstant.ZERO;
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

      if (section === AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID) {
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
    const expenseTableLength: number = this.expenseCostDistributionForms.length;
    while (this.expenseCostDistributionForms.length !== AppConstant.ZERO) {
      this.expenseCostDistributionForms.removeAt(AppConstant.ZERO);
    }
    for (let i = AppConstant.ZERO; i < expenseTableLength; i++) {
      this.addExpenseFieldOnClick();
    }
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
  }

  /**
   * this method can be used to delete recurring bill
   */
  deleteBill() {
    if (!this.templateId) {
      return;
    } else {
      this.confirmationService.confirm({
        key: 'recurringBillDeleteFromDetailView',
        message: 'You want to delete this Recurring Template',
        accept: () => {
          const tempArray = [];
          tempArray.push(this.templateId);
          this.billsService.bulkDeleteRecurringBill(tempArray).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.notificationService.successMessage(HttpResponseMessage.RECURRING_BILL_DELETED_SUCCESSFULLY);
              this.closeEInvoiceCreateMode();
            } else {
              this.notificationService.infoMessage(res.body.message);
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        }
      });
    }
  }

  /**
   * this method can be used to trigger emitter of edit action
   */
  editBill() {
    this.editButtonEmitter.emit();
  }

  termChanged() {
    if (this.createEInvoiceForm.get(AppFormConstants.TERM).value === 10) {
      this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).setValidators([Validators.required]);
      this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).updateValueAndValidity();
    } else {
      this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).clearValidators();
      this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).updateValueAndValidity();
    }
  }

  /**
   * Detect Change of the term from dropdown
   */
  termManuallyChanged() {
    this.createEInvoiceForm.get('termManuallyChanged').patchValue(true);
  }

  /**
   * Get Vendor Related Term List
   * @param id vendorId
   */
  getVendorRelatedTerms(id) {
    return new Promise(resolve => {
      if (this.createEInvoiceForm.get('termManuallyChanged').value || this.editView || !id) {
        resolve(true);
        return;
      }

      this.billsService.getVendorRelatedTerms(id).subscribe({
        next: (res: any) => {
          if (!res.body) {
            resolve(true);
            return;
          }
          this.createEInvoiceForm.get(AppFormConstants.TERM).patchValue(res.body?.id);

          if (res.body?.visibilityStatus === AppEnumConstants.STATUS_LETTER_INACTIVE) {
            this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).patchValue(res.body?.netDaysDue);
            this.createEInvoiceForm.get(AppFormConstants.DISCOUNT_PERCENTAGE).patchValue(res.body?.discountPercentage);
            this.createEInvoiceForm.get(AppFormConstants.DISCOUNT_DAYS_DUE).patchValue(res.body?.discountDaysDue);
          }

          resolve(true);
        }, error: (err) => {
          resolve(true);
        }
      });
    });
  }

  /**
   * This method use for view additional option input drawer when user click footer add new button
   * @param additionalFieldDetailDto AdditionalFieldDetailDto
   */
  setSelectedAdditionalField(additionalFieldDetailDto: AdditionalFieldDetailDto) {
    this.selectedAdditionalField = additionalFieldDetailDto;
  }

  updateAdditionalFieldDropDowns(data?) {
    if (data) {
      this.selectedAdditionalField = data;
    }
    this.commonUtil.updateAdditionalFiledDropdowns(this.headerAdditionalFieldDetails, this.selectedAdditionalField);
    this.commonUtil.updateAdditionalFiledDropdowns(this.additionalFieldForExpenseCostDistributions, this.selectedAdditionalField);
    this.commonUtil.updateAdditionalFiledDropdowns(this.additionalFieldForItemCostDistributions, this.selectedAdditionalField);
  }

  changeProjectCode(dpNameProjectTask) {
    this.commonUtil.patchHeaderLevelDepartmentAndProjectCodeLineLevel(AppFormConstants.PROJECT_CODE_ID, dpNameProjectTask.selectedOption.id,
      this.expenseCostDistributionForms.controls, dpNameProjectTask);
  }

  showExpenseTableLoader() {
    if (!this.customLineItemGrid.expenseTableHeaders.headers.length) {
      return true;
    }
    return this.detailView && this.expenseCostDistributionForms.controls.length === 0;
  }

  showItemTableLoader() {
    if (!this.customLineItemGrid.itemTableHeaders.headers.length) {
      return true;
    }
    return this.detailView && this.itemCostDistributionForms.controls.length === 0;
  }

  showExpenseNoDataFound() {
    if (this.expenseCostDistributionForms.controls.length === 0 && this.customLineItemGrid.expenseTableHeaders.headers.length){
      return true;
    }
  }

  showItemNoDataFound() {
    if (this.itemCostDistributionForms.controls.length === 0 && this.customLineItemGrid.itemTableHeaders.headers.length){
      return true;
    }
  }
}
