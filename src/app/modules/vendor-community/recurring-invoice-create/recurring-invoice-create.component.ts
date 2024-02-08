import {ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {BillMasterDto} from "../../../shared/dto/bill/bill-master-dto";
import {DropdownDto} from "../../../shared/dto/common/dropDown/dropdown-dto";
import {AdditionalFieldDetailDto} from "../../../shared/dto/additional-field/additional-field-detail-dto";
import {AppFieldType} from "../../../shared/enums/app-field-type";
import {RemoveSpace} from "../../../shared/helpers/remove-space";
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {AppFormConstants} from "../../../shared/enums/app-form-constants";
import {AppConstant} from "../../../shared/utility/app-constant";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {BillSubmitService} from "../../../shared/services/bills/bill-submit.service";
import {BillsService} from "../../../shared/services/bills/bills.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {AdditionalFieldService} from "../../../shared/services/additional-field-service/additional-field-service.";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {AppDocumentType} from "../../../shared/enums/app-document-type";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {AppModuleSection} from "../../../shared/enums/app-module-section";
import {VendorInvoiceService} from "../../../shared/services/vendor-community/vendor-invoice.service";
import {FormGuardService} from "../../../shared/guards/form-guard.service";

@Component({
  selector: 'app-recurring-invoice-create',
  templateUrl: './recurring-invoice-create.component.html',
  styleUrls: ['./recurring-invoice-create.component.scss']
})
export class RecurringInvoiceCreateComponent implements OnInit {

  @Output() isClickCloseButton = new EventEmitter<boolean>();
  @Input() templateId;
  @Input() detailView = false;
  @Input() editView = false;
  @Input() tenantIdToEdit;

  public createEInvoiceForm: UntypedFormGroup;

  public billMasterDto: BillMasterDto = new BillMasterDto();
  public customerList: DropdownDto = new DropdownDto();
  public termList: DropdownDto = new DropdownDto();
  public approvalUserList: DropdownDto = new DropdownDto();
  public approvalGroupList: DropdownDto = new DropdownDto();
  public itemList: DropdownDto = new DropdownDto();
  public uomList: DropdownDto = new DropdownDto();
  public projectCodeList: DropdownDto = new DropdownDto();
  public accountList: DropdownDto = new DropdownDto();
  public department: DropdownDto = new DropdownDto();
  public dueDate: any;

  public headerAdditionalFieldDetails: AdditionalFieldDetailDto[] = [];
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

  public attachments: File[] = [];

  public existingAttachments = [];

  public adHocIndex: number;
  public isLoading = false;
  public isValidDiscountDate = false;
  public addNewItemOverlay: boolean;
  public isLoadingSaveAsApproved = false;
  public separatorList: DropdownDto = new DropdownDto();
  public separatorsMap = new Map();
  public today = new Date();
  public addNewDropDown = false;
  public selectedAdditionalField: AdditionalFieldDetailDto;
  public additionalFieldResponse: AdditionalFieldDetailDto[];
  public previousCustomerIdBeforeChange: any;
  public isAvailableValueApprovalUser = false;
  public isAvailableValueApprovalGroup = false;

  constructor(public billSubmitService: BillSubmitService, public formBuilder: UntypedFormBuilder, public billsService: BillsService,
              public notificationService: NotificationService, public vendorInvoiceService: VendorInvoiceService,
              public additionalFieldService: AdditionalFieldService, public privilegeService: PrivilegeService,
              public formGuardService: FormGuardService) {
  }

  ngOnInit(): void {
    this.createEInvoiceForm = this.formBuilder.group({
      id: [null],
      tenantId: [{value: null, disabled: this.detailView}, Validators.required],
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
      existingRecurringInvoiceAttachments: [{value: null, disabled: this.detailView}],
      departmentId: [{value: null, disabled: this.detailView}],
      prefixes: [{value: null, disabled: this.detailView}],
      netDaysDue: [{value: null, disabled: this.detailView}],
      discountPercentage: [{value: null, disabled: this.detailView}],
      discountDaysDue: [{value: null, disabled: this.detailView}],
      customIntervalValue: [{value: null, disabled: this.detailView}],
      separatorSymbolId: [{value: null, disabled: this.detailView}],
      saveAsApproved: [{value: false, disabled: this.detailView}],
      termName: [{value: false, disabled: this.detailView}],
      runningNo: [{
        value: null,
        disabled: this.detailView
      }, Validators.compose([Validators.required, Validators.maxLength(10), Validators.pattern('^[0-9]*$')])],
      billNoPattern: [{value: null, disabled: this.detailView}],
      suffixes: [{value: null, disabled: this.detailView}],
      additionalNotes: [{value: null, disabled: this.detailView}],
      vendorRecurringTemplateAdHocWorkflowDetailConfigList: this.formBuilder.array([]),
      recurringInvoiceItemDetails: this.formBuilder.array([]),
      vendorRecurringAdditionalData: this.formBuilder.array([]),
      vendorRecurringAdditionalFieldAttachments: [null],
    });
    this.createEInvoiceForm.get(AppFormConstants.INTERVAL_VALUE).valueChanges.subscribe(() => this.intervalChanged());
    this.createEInvoiceForm.get(AppFormConstants.OCCURRENCE_FREQUENT_STATUS).valueChanges.subscribe(() => this.occurrenceFrequentStatus());
    this.createEInvoiceForm.get(AppFormConstants.GENERATION_FREQUENT_STATUS).valueChanges.subscribe(() => this.generationFrequentChanged());
    this.createEInvoiceForm.get(AppFormConstants.CUSTOM_INTERVAL_VALUE).valueChanges.subscribe(() => this.customIntervalChanged());
    this.createEInvoiceForm.get(AppFormConstants.TENANT_ID).valueChanges.subscribe(() => this.getCustomerRelatedData());

    this.createEInvoiceForm.get(AppFormConstants.PREFIXES).valueChanges.subscribe(() => this.getNumberPattern());
    this.createEInvoiceForm.get(AppFormConstants.SEPARATOR_SYMBOL_ID).valueChanges.subscribe(() => this.getNumberPattern());
    this.createEInvoiceForm.get(AppFormConstants.RUNNING_NO).valueChanges.subscribe(() => this.getNumberPattern());
    this.createEInvoiceForm.get(AppFormConstants.SUFFIXES).valueChanges.subscribe(() => this.getNumberPattern());
    this.createEInvoiceForm.get(AppFormConstants.TERM).valueChanges.subscribe(data => this.termChanged(data));


    const date = new Date();
    this.today.setDate(date.getDate());
    this.getDropdown();
    this.initApprover();

    if ((!this.editView && !this.detailView)) {
      this.initItemDetails();
    } else {
      this.createEInvoiceForm.get(AppFormConstants.TENANT_ID).patchValue(this.tenantIdToEdit)
    }
  }

  getCustomerList() {
    return new Promise<void>(resolve => {
      this.vendorInvoiceService.getCustomerList().subscribe((res: any) => {
        this.customerList.data = res.body;
        resolve();
      }, error => {
        this.notificationService.errorMessage(error);
      });
    })
  }

  async getCustomerRelatedData() {
    const tenantId = this.createEInvoiceForm.get(AppFormConstants.TENANT_ID).value;
    if (tenantId) {
      if (tenantId !== this.previousCustomerIdBeforeChange && this.previousCustomerIdBeforeChange) {
        const scheduleName = this.createEInvoiceForm.get('scheduleName').value;
        this.resetEInvoiceForm(tenantId, false);
        this.createEInvoiceForm.get('scheduleName').patchValue(scheduleName);
        return;
      }
      // Get Data if edit and get additional data inside it
      if (this.editView || this.detailView) {
        await this.getTemplateData();
      } else {
        this.getModuleReheatedAdditionalField(AppDocumentType.BILL, this.detailView, tenantId, null);
      }

      this.previousCustomerIdBeforeChange = tenantId;

      this.getApprovalUserList(tenantId);
      this.getApprovalGroupList(tenantId);
      this.getUomList(tenantId);
      this.getPaymentTerms(tenantId);
    }
  }

  /**
   * Triggers when po id or term changed
   * @param value data
   */
  termChanged(value) {
    if (!value) {
      this.createEInvoiceForm.get(AppFormConstants.TERM_NAME).reset();
    }
    this.termList.data.forEach(val => {
      if (value === val.id) {
        this.createEInvoiceForm.get(AppFormConstants.TERM_NAME).patchValue(val.name);
      }
    });
  }

  /*
  Get all the dropdowns related to Recurring bill template creation
   */
  async getDropdown() {

    this.getCustomerList();

    // Get Intervals DropDown
    await this.vendorInvoiceService.getIntervalList().then((res) => {
      this.interval.data = res.body;
      this.createEInvoiceForm.get(AppFormConstants.INTERVAL_VALUE).patchValue(this.appConstant.DAILY)
    }).catch((e) => this.notificationService.errorMessage(e));

    // Get Weeks DropDown
    await this.vendorInvoiceService.getWeeks().then((res) => {
      this.weeks.data = res.body;
    }).catch((e) => this.notificationService.errorMessage(e));

    // Get Days DropDown
    await this.vendorInvoiceService.getDays().then((res) => {
      this.days.data = res.body;
    }).catch((e) => this.notificationService.errorMessage(e));

    // Get Custom Intervals DropDown
    await this.vendorInvoiceService.getCustomIntervals().then((res) => {
      this.customIntervals.data = res.body;
    }).catch((e) => this.notificationService.errorMessage(e));

    // Get Months DropDown
    await this.vendorInvoiceService.getMonths().then((res) => {
      this.months.data = res.body;
    }).catch((e) => this.notificationService.errorMessage(e));

    // Get Recurring Generation DropDown
    await this.vendorInvoiceService.getRecurringGeneration().then((res) => {
      this.recurringGeneration.data = res.body;
    }).catch((e) => this.notificationService.errorMessage(e));

    // Get Recurring Occurrence DropDown
    await this.vendorInvoiceService.getRecurringOccurrence().then((res) => {
      this.recurringOccurrence.data = res.body;
    }).catch((e) => this.notificationService.errorMessage(e));

    // Get Separator list to bill number configuration
    await this.vendorInvoiceService.getSeparatorList().then((res) => {
      this.separatorList.data = res.body;
      this.separatorList.data.forEach(value => {
        this.separatorsMap.set(value.id, value.name);
      });
    }).catch((e) => this.notificationService.errorMessage(e));
  }


  /**
   * this method can be used to get date formats
   */
  getApprovalUserList(tenantId) {
    this.vendorInvoiceService.getApprovalUserList(tenantId, !this.editView).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.approvalUserList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get approval group list
   */
  getApprovalGroupList(tenantId) {
    this.vendorInvoiceService.getApprovalGroupList(tenantId, !this.editView).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.approvalGroupList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getUomList(tenantId) {
    this.vendorInvoiceService.getUom(tenantId).subscribe((res: any) => {
      this.uomList.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get payment terms
   */
  getPaymentTerms(tenantId) {
    this.vendorInvoiceService.getTermsList(tenantId).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.termList.data = res.body;
      }
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


  getTemplateData() {
    this.vendorInvoiceService.getRecurringBillTemplateData(this.templateId).subscribe(async (res: any) => {

      this.existingAttachments = res.body.existingRecurringInvoiceAttachments;
      res.body.vendorRecurringAdditionalFieldAttachments.forEach((value) => {
        this.existingAttachments.push(value);
      })

      if (res.body.recurringInvoiceItemDetails.length > 0) {
        res.body.recurringInvoiceItemDetails.forEach((value, index) => {
          this.addItemOnClick();
        });
      } else if (!this.detailView) {
        this.addItemOnClick();
      }

      if (res.body.actualRecurringStartDate) {
        res.body.actualRecurringStartDate = new Date(res.body.actualRecurringStartDate);
        res.body.recurringStartDate = res.body.actualRecurringStartDate;
      }
      if (res.body.actualRecurringEndDate) {
        res.body.recurringEndDate = res.body.actualRecurringEndDate
      }

      await this.getModuleReheatedAdditionalField(AppDocumentType.BILL, this.detailView, this.createEInvoiceForm.get(AppFormConstants.TENANT_ID).value, res.body);

      res.body.vendorRecurringAdditionalData = this.commonUtil.patchDropDownAdditionalData(res.body.vendorRecurringAdditionalData);
      res.body.vendorRecurringAdditionalData = this.commonUtil.alignHeadingAdditionalData(this.headerAdditionalFieldDetails, res.body.vendorRecurringAdditionalData);

      delete res.body.tenantId;
      this.createEInvoiceForm.patchValue(res.body);

      if (res.body.actualRecurringStartDate) {
        this.createEInvoiceForm.get(AppFormConstants.RECURRING_START_DATE).patchValue(res.body.actualRecurringStartDate);
      }
      if (res.body.actualRecurringEndDate) {
        this.createEInvoiceForm.get(AppFormConstants.RECURRING_END_DAY).patchValue(res.body.actualRecurringEndDate);
      }

      this.calculateTotal();

    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  calculateTotal() {
    let netAmount: number;
    let taxAmount: number;
    let grossAmount = 0.0;

    this.itemFields.controls.forEach((itemCost, index) => {
      if (itemCost.value.qty && itemCost.value.unitPrice) {
        const sum = itemCost.value.qty * itemCost.value.unitPrice;
        grossAmount += sum;
        this.itemFields.controls[index].get('amount').patchValue(sum);
      }
    });

    this.createEInvoiceForm.get(AppFormConstants.GROSS_AMOUNT).patchValue(grossAmount);
    taxAmount = this.createEInvoiceForm.get(AppFormConstants.TAX).value;
    netAmount = grossAmount + taxAmount;
    this.createEInvoiceForm.get(AppFormConstants.BILL_AMOUNT).patchValue(netAmount);
  }


  /**
   * this method can be used to closed the e invoice screen
   */
  closeEInvoiceCreateMode() {
    this.isClickCloseButton.emit(false);
  }

  // /**
  //  * validate empty space
  //  */
  // removeSpace(fieldName) {
  //   if (fieldName?.value[0] === AppConstant.EMPTY_SPACE) {
  //     fieldName.patchValue(AppConstant.EMPTY_STRING);
  //   }
  // }


  /**
   * this method can be used to create template
   */
  createUpdateTemplate(type) {
    this.isLoading = true;
    this.createEInvoiceForm.get('attachments').patchValue(this.attachments);

    if (!this.createEInvoiceForm.valid) {
      new CommonUtility().validateForm(this.createEInvoiceForm);
      this.isLoading = false;
      return;
    }

    try {
      let date = this.createEInvoiceForm.get('recurringStartDate').value
      if (date) {
        date = date.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
        this.createEInvoiceForm.get('recurringStartDate').patchValue(date)
      }
    } catch (e) {
    }

    try {
      let date = this.createEInvoiceForm.get('recurringEndDate').value
      if (date) {
        date = date.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
        if (date) this.createEInvoiceForm.get('recurringEndDate').patchValue(date)
      }
    } catch (e) {
    }

    if (this.createEInvoiceForm.get('saveAsApproved').value) {
      this.vendorRecurringTemplateAdHocWorkflowDetailConfigList.clear();
    }


    let existingRecurringInvoiceAttachments = [];
    let vendorRecurringAdditionalFieldAttachments = [];
    this.existingAttachments.forEach(value => {
      if (value.fieldId) {
        vendorRecurringAdditionalFieldAttachments.push(value);
      } else {
        existingRecurringInvoiceAttachments.push(value);
      }
    });
    this.createEInvoiceForm.get('existingRecurringInvoiceAttachments').patchValue(existingRecurringInvoiceAttachments);
    this.createEInvoiceForm.get('vendorRecurringAdditionalFieldAttachments').patchValue(vendorRecurringAdditionalFieldAttachments);

    let recurringBillObj = this.createEInvoiceForm.value
    recurringBillObj.vendorRecurringAdditionalData = this.commonUtil.formatMultisetValues(recurringBillObj.vendorRecurringAdditionalData);

    if (type === 'C') {
      this.vendorInvoiceService.createTemplate(recurringBillObj).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.RECURRING_INVOICE_CREATED_SUCCESSFULLY);
          this.createEInvoiceForm.reset();
          this.closeEInvoiceCreateMode();
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        this.isLoading = false;
      }, error => {
        this.isLoading = false;
        this.notificationService.errorMessage(error);
      });
    } else {

      this.vendorInvoiceService.updateRecurringTemplate(recurringBillObj).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.RECURRING_INVOICE_UPDATED_SUCCESSFULLY);
          this.createEInvoiceForm.reset();
          this.closeEInvoiceCreateMode();
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        this.isLoading = false;
      }, error => {
        this.isLoading = false;
        this.notificationService.errorMessage(error);
      });
    }

  }

  /**
   * this method can be used to reset e invoice form
   */
  async resetEInvoiceForm(tenantId, isReset) {
    if (!tenantId) {
      tenantId = this.createEInvoiceForm.get(AppFormConstants.TENANT_ID).value;
    }
    this.previousCustomerIdBeforeChange = tenantId;
    this.createEInvoiceForm.reset();
    this.headingSectionArray.clear();
    this.itemFields.clear();
    this.vendorRecurringTemplateAdHocWorkflowDetailConfigList.clear();
    this.initApprover();

    this.headerAdditionalFieldDetails = [];
    this.attachments = [];

    if (!this.editView) {
      this.createEInvoiceForm.get(AppFormConstants.INTERVAL_VALUE).patchValue(this.appConstant.DAILY)
      this.createEInvoiceForm.get(AppFormConstants.BILL_AMOUNT).patchValue(0.00)
    }
    if ((!this.editView && !this.detailView)) {
      this.initItemDetails();
    }

    if (!isReset || this.editView) {
      this.createEInvoiceForm.get(AppFormConstants.TENANT_ID).patchValue(tenantId);
    }

    // await this.getModuleReheatedAdditionalField(AppDocumentType.BILL, this.detailView);

    // this.getTemplateData();
  }

  /**
   * This method can be used to remove items
   */
  removeItem(itemIndex) {
    this.itemFields.removeAt(itemIndex);
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
      id: [null],
      productId: [null],
      itemName: [null],
      qty: [null],
      uomId: [null],
      description: [null],
      unitPrice: [null],
      discountAmount: [0.0],
      itemNumber: [''],
      amount: [{value: null, disabled: true}],
    });
    this.itemFields.push(itemCostDistributionForms);
  }


  /**
   * This method add item to array with additional field
   */
  addItemOnClick() {
    const itemInfo = this.formBuilder.group({
      id: [null],
      productId: [null],
      itemName: [null],
      qty: [null],
      uomId: [null],
      description: [null],
      unitPrice: [null],
      discountAmount: [0.0],
      itemNumber: [''],
      amount: [{value: null, disabled: true}],
    });
    this.itemFields.push(itemInfo);
    const lastIndex = (this.itemFields.length - 2);
  }


  /**
   * Add new approver
   */
  addAdHocWorkflowDetail() {
    const addHocWorkflowDetail = this.formBuilder.group({
      approvalOrder: [{value: null, disabled: this.detailView}],
      approvalGroup: [{value: null, disabled: this.detailView}],
      approvalUser: [{value: null, disabled: this.detailView}],
    });
    this.vendorRecurringTemplateAdHocWorkflowDetailConfigList.push(addHocWorkflowDetail);
    const adHocWorkFlowOrderNumber = this.vendorRecurringTemplateAdHocWorkflowDetailConfigList.length;
    this.vendorRecurringTemplateAdHocWorkflowDetailConfigList.controls[adHocWorkFlowOrderNumber - 1].get('approvalOrder').patchValue(adHocWorkFlowOrderNumber);
  }


  /*
  APPROVER FORM ARRAY DETAILS------------------------------------------------------------------------------------------------->
 */

  /**
   * This method can use for get controllers in form array
   */
  public get vendorRecurringTemplateAdHocWorkflowDetailConfigList() {
    return this.createEInvoiceForm.get('vendorRecurringTemplateAdHocWorkflowDetailConfigList') as UntypedFormArray;
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
    this.vendorRecurringTemplateAdHocWorkflowDetailConfigList.removeAt(index);
  }


  /*
 Validations ---------------------------------------------------------------------------------------------------------------------->
   */

  /**
   * this method can be used to on line item click
   * @param index to index
   */

  onLItemClick(index) {
    if (this.detailView) return;
    const lastIndexNumber = (this.itemFields.length) - 1;
    if (lastIndexNumber === index) {
      this.addItemCostDistributionField();
    }
  }


  /*
  Calculate Total -------------------------------------------------------------------------------------------------->
   */

  navigate(e, name: string, i: any) {
    switch (e.key) {
      case 'ArrowDown':
        if ((this.itemFields.length) - 2 === i) {
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
  public get itemFields() {
    return this.createEInvoiceForm.get('recurringInvoiceItemDetails') as UntypedFormArray;
  }


  /**
   * this method can be used to init add items
   */
  initItemDetails() {
    for (let i = 0; i < 5; i++) {
      this.addItemCostDistributionField();
    }
  }


  /**
   * return form array data
   */
  public get headingSectionArray() {
    return this.createEInvoiceForm.get('vendorRecurringAdditionalData') as UntypedFormArray;
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
   * this method can be used to get file name
   * @param fileUpload string
   * @param i
   */
  fileUploadClick(fileUpload, i: number) {
    document.getElementById(fileUpload + i).click();
  }

  /**
   * This method use for choose file for upload
   * @param event any
   * @param additionalField to index array instance
   */
  changeFileInput(event: any, additionalField) {
    if (event.target.files[0]) {
      const targetFile = event.target.files[0];
      additionalField.patchValue({
        attachment: targetFile
      });
    }
  }


  /**
   * This method use for add additional fields to po creation
   */
  getModuleReheatedAdditionalField(id, isDetailView, tenantId, result) {
    return new Promise<void>(resolve => {
      this.vendorInvoiceService.getAdditionalField(id, isDetailView, tenantId, !this.editView).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.additionalFieldResponse = res.body;
          this.additionalFieldResponse.forEach(((field) => {
            this.commonUtil.manageDropDownData(field, isDetailView);
            if (field.sectionId === AppModuleSection.MASTER_DATA_INPUT_SECTION_ID) {
              this.addHeadingField(field);
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
    this.headingSectionArray.push(this.commonUtil.getAdditionalFieldValidations(field, this.detailView));
  }


  formatDateSection(event, index, field) {
    if (!event) {
      return;
    }
    field.value.fieldValue = event.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
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
      this.downloadAdditionalFieldAttachments(val)
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
      (this.createEInvoiceForm.get('suffixes').value ? this.createEInvoiceForm.get('suffixes').value : ''))
  }

  getMinDate(): Date {
    if (this.createEInvoiceForm.get('recurringStartDate').value) {
      return (this.createEInvoiceForm.get('recurringStartDate').value);
    } else {
      return this.today;
    }
  }

  /**
   * validate dropdown value
   * @param value to form control value
   * @param approvalData to approvalData
   */
  validateDropDownValue(value, approvalData) {
    if (value && approvalData.value.approvalUser) {
      approvalData.value.approvalGroup = null;
      this.isAvailableValueApprovalGroup = true;
      this.isAvailableValueApprovalUser = false;
    } else if (value && approvalData.value.approvalGroup) {
      approvalData.value.approvalUser = null;
      this.isAvailableValueApprovalGroup = false;
      this.isAvailableValueApprovalUser = true;
    } else {
      this.isAvailableValueApprovalGroup = false;
      this.isAvailableValueApprovalUser = false;
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
      return true
    }
  }
}
