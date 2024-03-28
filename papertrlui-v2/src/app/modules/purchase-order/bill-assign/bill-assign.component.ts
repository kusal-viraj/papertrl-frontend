import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2
} from '@angular/core';
import {BillMasterDto} from '../../../shared/dto/bill/bill-master-dto';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {DataFormat} from '../../../shared/utility/data-format';
import {BillSubmitService} from '../../../shared/services/bills/bill-submit.service';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {PoReceiptService} from '../../../shared/services/po-receipts/po-receipt.service';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {AppDocuments} from '../../../shared/enums/app-documents';
import {PoApprovalDto} from '../../../shared/dto/po/po-approval-dto';
import {BillApprovalsService} from '../../../shared/services/bills/bill-approvals.service';
import {PoService} from '../../../shared/services/po/po.service';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {DomSanitizer} from '@angular/platform-browser';
import {BillLineLevelPoReceiptDto} from '../../../shared/dto/bill/bill-line-level-po-receipt-dto';
import {BillUtility} from '../../bills/bill-utility';
import {BillPaymentService} from '../../../shared/services/bill-payment-service/bill-payment.service';
import {CreditNoteService} from '../../../shared/services/credit-note/credit-note.service';
import {ManageDrawerService} from '../../../shared/services/common/manage-drawer-status/manage-drawer.service';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {MandatoryFields} from "../../../shared/utility/mandatory-fields";
import {Dropdown} from "primeng/dropdown";
import {AutomationService} from "../../../shared/services/automation-service/automation.service";
import {Subscription} from "rxjs";
import {SetFieldValueDto} from "../../../shared/dto/automation/set-field-value-dto";
import {AccountNumberPopulationLineLevel} from "../../../shared/utility/account-number-population-line-level";

@Component({
  selector: 'app-bill-assign',
  templateUrl: './bill-assign.component.html',
  styleUrls: ['./bill-assign.component.scss']
})
export class BillAssignComponent extends MandatoryFields implements OnInit, OnDestroy {

  @Output() closePoReceipt = new EventEmitter<boolean>();
  @Input() fromPo = false;
  @Input() fromPoReceipt = false;
  @Input() poReceiptID: any;
  @Input() poId: any;

  public createEInvoiceForm: UntypedFormGroup;

  public billMasterDto: BillMasterDto = new BillMasterDto();
  public vendorsList: DropdownDto = new DropdownDto();
  public poList: DropdownDto = new DropdownDto();
  public termList: DropdownDto = new DropdownDto();
  public approvalUserList: DropdownDto = new DropdownDto();
  public approvalGroupList: DropdownDto = new DropdownDto();
  public itemList: DropdownDto = new DropdownDto();
  public projectCodeList: DropdownDto = new DropdownDto();
  public accountList: DropdownDto = new DropdownDto();
  public department: DropdownDto = new DropdownDto();
  public receiptList: DropdownDto = new DropdownDto();
  public customerInvoiceList: DropdownDto = new DropdownDto();
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public isAddNewAccount = false;
  public isVisibleNotificationContent = null;
  public isViewMatchingTable = false;

  public additionalFieldResponse: AdditionalFieldDetailDto[];
  public headerAdditionalFieldDetails: AdditionalFieldDetailDto[] = [];
  public additionalFieldForExpenseCostDistributions: AdditionalFieldDetailDto[] = [];
  public additionalFieldLineItemDetails: AdditionalFieldDetailDto[] = [];
  public itemPoReceiptIdList: any = [AppConstant.ZERO];
  public billUtility: BillUtility = new BillUtility(this.billPaymentService, this.notificationService,
    this.privilegeService, this.creditNoteService, this.billsService, this.sanitizer, this.drawerService);
  public accountNumPopulationLines: AccountNumberPopulationLineLevel = new AccountNumberPopulationLineLevel(
    this.billsService, this.notificationService
  );
  public selectedAdditionalField: AdditionalFieldDetailDto;
  public appAuthorities = AppAuthorities;
  public appFormConstants = AppFormConstants;
  public appConstant: AppConstant = new AppConstant();
  public commonUtil = new CommonUtility();
  public dateFormat = new DataFormat();
  public poDetail = new PoApprovalDto();
  public appFieldType = AppFieldType;

  public addNewDropDown = false;

  public attachments: File[] = [];
  public selectedId: any;
  public adHocIndex: number;
  public isLoading = false;
  public isValidDiscountDate = false;
  public isLoadingSaveAsApproved = false;
  public isAddNewProjectCodes = false;
  public departmentPanel: boolean;

  public matchingAutomation: any;
  public isSubmissionWorkFlow = false;
  public isSaveAsApprovedWorkFlow = false;
  public isWorkflowConfigAvailable = false;
  public poStatus: any;
  public isProgressViewReceipt = false;
  public poReceiptUrl: any;
  public poReceiptNumber: any;
  public isViewReceiptView = false;
  public receiptAttachments: any [] = [];
  public isCreateInvoice = false;
  public fieldSubscription: Subscription = new Subscription();
  setFieldValueDto: SetFieldValueDto = new SetFieldValueDto();
  previousDepartmentId;
  previousProjectCodeId;
  departmentChangeFromAutomation = false;
  projectCodeChangeFromAutomation = false;


  constructor(public billSubmitService: BillSubmitService, public formBuilder: UntypedFormBuilder, public billsService: BillsService,
              public notificationService: NotificationService, public changeRef: ChangeDetectorRef,
              public billApprovalsService: BillApprovalsService, public poService: PoService, public poReceiptService: PoReceiptService,
              public additionalFieldService: AdditionalFieldService, public privilegeService: PrivilegeService,
              public sanitizer: DomSanitizer, public billPaymentService: BillPaymentService, public creditNoteService: CreditNoteService,
              public drawerService: ManageDrawerService, public automationService: AutomationService,
              private renderer: Renderer2, private el: ElementRef) {
    super(additionalFieldService, notificationService);
  }

  ngOnInit(): void {
    this.getAccounts(this.accountList);
    this.createEInvoiceForm = this.formBuilder.group({
      vendorId: [{value: AppConstant.NULL_VALUE, disabled: true}, Validators.required],
      poId: [{value: AppConstant.NULL_VALUE, disabled: true}],
      id: [AppConstant.NULL_VALUE],
      billNo: [AppConstant.NULL_VALUE, Validators.compose([Validators.required, Validators.maxLength(50)])],
      billDate: [AppConstant.NULL_VALUE, Validators.required],
      term: [AppConstant.NULL_VALUE, Validators.required],
      dueDate: [null],
      remainingCeling: [null],
      netDaysDue: [null],
      discountPercentage: [null],
      discountDaysDue: [null],
      frequencyEvery: [AppConstant.NULL_VALUE],
      unit: [],
      endDate: [],
      receiptId: [{value: AppConstant.NULL_VALUE, disabled: this.fromPoReceipt}],
      event: [],
      billAmount: [null],
      termManuallyChanged: [null],
      closePo: [false],
      patchSetFieldFullObject: [true],
      tax: [],
      focusListener: [],
      accountPeriodMonth: [null],
      accountPeriodYear: [null],
      grossAmount: [null],
      remainingPoCeiling: [null],
      remainingVariance: [null],
      departmentId: [null],
      payWhenCustomerPay: [null],
      customerInvoiceId: [null],
      additionalNotes: [],
      adHocWorkflowDetails: this.formBuilder.array([]),
      additionalData: this.formBuilder.array([]),
      billExpenseCostDistributions: this.formBuilder.array([]),
      billItemCostDistributions: this.formBuilder.array([]),
      expenseCostDistributionCostTotal: [null],
      itemCostDistributionCostTotal: [null],
      projectCodeId: [null]
    });
    this.getModuleReheatedAdditionalField(AppDocumentType.BILL, false);
    this.initApprover();
    this.getVendorList();
    this.getPaymentTerms();
    this.getApprovalUserList();
    this.getApprovalGroupList();
    this.getProjectTaskList();
    this.getDepartment();
    this.getCustomerInvoiceList();
    this.getRequiredFields(this.createEInvoiceForm, AppDocumentType.BILL);

    this.createEInvoiceForm.get(AppFormConstants.BILL_DATE).valueChanges.subscribe(data => this.getDueDate(data, false, false, false));
    this.createEInvoiceForm.get(AppFormConstants.TERM).valueChanges.subscribe(data => this.getDueDate(data, true, false, false));
    // this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).valueChanges.subscribe(() => this.getDueDate(true, false));

    this.createEInvoiceForm.get(AppFormConstants.PO_ID).valueChanges.subscribe(data => this.poChanged(data));

    this.createEInvoiceForm.get(AppFormConstants.VENDOR_ID).valueChanges.subscribe(data => this.vendorChanged(data));

    this.createEInvoiceForm.get(AppFormConstants.DEPARTMENT_ID).valueChanges.subscribe((value) => {
      if (value){
        this.commonUtil.patchHeaderDepartmentToLineLevel(this.createEInvoiceForm, -1, false, null, true, true);
      }
      if (value !== this.previousDepartmentId) {
        if (value && this.departmentChangeFromAutomation){
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
        if (value && this.projectCodeChangeFromAutomation){
          this.commonUtil.patchHeaderLevelDepartmentAndProjectCodeLineLevel(AppFormConstants.PROJECT_CODE_ID, value);
        }
        this.previousProjectCodeId = this.createEInvoiceForm.get(AppFormConstants.PROJECT_CODE_ID).value;
      }
    });

    if (this.fromPo) {
      this.getPoData();
    }
    if (this.fromPoReceipt) {
      this.getPoReceiptData();
    }
    this.setDocumentEvent();
    this.automationService.setUpFocusListeners(this.createEInvoiceForm, this.renderer, this.el, this.setFieldValueDto, AppDocumentType.BILL, this.automationService.billInputFieldsForAutomation);
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
      } else {
        this.clearAutomation();
      }
    });
  }

  setDocumentEvent() {
    this.createEInvoiceForm.get('event').patchValue(AppDocuments.DOCUMENT_EVENT_SUBMITTED);
  }

  /**
   * this method can be used to get po receipt data
   */
  getPoReceiptData() {
    this.poReceiptService.getPoReceiptData(this.poReceiptID).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {

        if (res.body.poReceiptDetails) {
          res.body.poReceiptDetails.forEach((value) => {
            if (value.receivedQty) {
              this.addItemCostDistributionField();
            }
          });
        }

        if (res.body.purchaseOrderReceiptAccountDetails) {
          res.body.purchaseOrderReceiptAccountDetails.forEach((value, i) => {
            if (value.isSelectAccount) {
              this.addExpenseCostDistributionField();
            }
          });
        }

        this.createEInvoiceForm.get(AppFormConstants.VENDOR_ID).patchValue(res.body.vendorId);
        this.createEInvoiceForm.get(AppFormConstants.RECEIPT_ID).patchValue(res.body.id);
        this.createEInvoiceForm.get(AppFormConstants.PO_ID).patchValue(res.body.poId);
        this.createEInvoiceForm.get(AppFormConstants.PROJECT_CODE_ID).patchValue(res.body.projectCodeId);
        res.body.poReceiptDetails.forEach(value => {
          value.itemId = value.productId;
          value.qty = value.receivedQty;
          value.rate = value.unitPrice;
        });

        let index = res.body.purchaseOrderReceiptAccountDetails.length - 1;
        while (index >= 0) {
          if (!res.body.purchaseOrderReceiptAccountDetails[index].isSelectAccount) {
            res.body.purchaseOrderReceiptAccountDetails.splice(index, 1);
          }
          index -= 1;
        }

        this.createEInvoiceForm.get('billItemCostDistributions').patchValue(res.body.poReceiptDetails);
        this.createEInvoiceForm.get('billExpenseCostDistributions').patchValue(res.body.purchaseOrderReceiptAccountDetails);
        this.getTotalCostDistribution();
        this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
        this.billUtility.getMatchingTableData(this.createEInvoiceForm, this.expenseCostDistributionForms, this.itemCostDistributionForms);
        this.billUtility.headerPORecipeSelectionValueToLineLevel(this.createEInvoiceForm.get('receiptId').getRawValue(),
          this.expenseCostDistributionForms, this.itemCostDistributionForms);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, (error => {
      this.notificationService.errorMessage(error);
    }));
  }

  /**
   * This method can be used to get po data
   */
  getPoData() {
    this.poService.getPoData(this.poId, false).subscribe((res: any) => {
      this.createEInvoiceForm.get(AppFormConstants.VENDOR_ID).patchValue(res.body.vendorId);
      this.createEInvoiceForm.get(AppFormConstants.PO_ID).patchValue(res.body.id);
      this.createEInvoiceForm.get(AppFormConstants.PROJECT_CODE_ID).patchValue(res.body.projectCodeId);
      this.createEInvoiceForm.get(AppFormConstants.DEPARTMENT_ID).patchValue(res.body.departmentId);
      const tempArray: any [] = [];
      this.commonUtil.isDepartmentAvailable = res.body.isDepartmentAvailable;
      this.commonUtil.isProjectCodeAvailable = res.body.isProjectCodeAvailable;
      res.body.purchaseOrderDetails.forEach((value, i) => {
        value.itemId = value.productId;
        value.rate = value.unitPrice;
        if (!value.itemId) {
          res.body.purchaseOrderAccountDetails.push({
            departmentId: value.departmentId,
            amount: value.rate * value.qty,
            description: value.itemName,
          });
        } else {
          tempArray.push(value);
        }
      });
      res.body.purchaseOrderDetails = [...tempArray];
      res.body.purchaseOrderDetails.forEach((value, index) => {
        this.addItemCostDistributionField();
      });

      res.body.purchaseOrderAccountDetails.forEach((value, i) => {
        this.addExpenseCostDistributionField();
      });
      this.createEInvoiceForm.get('billItemCostDistributions').patchValue(res.body.purchaseOrderDetails);
      this.createEInvoiceForm.get('billExpenseCostDistributions').patchValue(res.body.purchaseOrderAccountDetails);
      this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
      if (res.body.purchaseOrderAccountDetails.length > 0) {
        res.body.purchaseOrderAccountDetails.forEach((value, index) => {
          if (value.accountId) {
            this.getAccountName(value.accountId, index);
          }
        });
      }
      this.getTotalCostDistribution();
      this.billUtility.getMatchingTableData(this.createEInvoiceForm, this.expenseCostDistributionForms, this.itemCostDistributionForms);
    });
  }

  getVendorList() {
    this.billsService.getVendorList(true).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.vendorsList.data = res.body;
        this.vendorsList.addNew();
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
    this.billsService.getApprovalUserList(this.billMasterDto.createdBy, authorities).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.approvalUserList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getApprovalGroupList() {
    this.billsService.getApprovalGroupList(true).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.approvalGroupList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getProjectTaskList() {
    this.billsService.getProjectTaskUserWise(AppConstant.PROJECT_CODE_CATEGORY_ID, false).subscribe((res: any) => {
      this.projectCodeList.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getDepartment() {
    this.billsService.getDepartment().subscribe((res: any) => {
      this.department.data = res.body;
      if (this.fromPoReceipt) {
        this.department.addNew();
      }
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
    this.createEInvoiceForm.get('remainingPoCeiling').reset();
    const obj = {
      poId: poId,
      billId: null,
    };
    this.billSubmitService.getPoCeiling(obj).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body?.remainingPoCeiling !== null) {
            this.createEInvoiceForm.get(AppFormConstants.REMAINING_PO_CEILING).patchValue((res.body.remainingPoCeiling));
          }
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
    const term = this.createEInvoiceForm.get(AppFormConstants.TERM).value;
    let dueDate = this.createEInvoiceForm.get(AppFormConstants.DUE_DATE).value;

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
    this.billsService.getPoList(vendorId).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.poList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method can be used to get item name
   * @param id to selected item id
   *  @param index to formGroup index
   */
  getItemName(id, index) {
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
    if (!poId) {
      return;
    }
    this.createEInvoiceForm.get('closePo').patchValue(false);
    this.getRemainingCeiling(poId);
    this.getPoRelatedReceiptList(poId);
  }

  /**
   * Triggers on a value change of vendor Id
   */
  async vendorChanged(id) {
    if (!id) {
      return;
    }
    await this.getVendorRelatedTerms(id);
    this.getVendorRelatedPoList(id);
  }

  termManuallyChanged() {
    this.automationService.setAutomationData(this.createEInvoiceForm, AppFormConstants.TERM)
    this.createEInvoiceForm.get('termManuallyChanged').patchValue(true);
  }

  getVendorRelatedTerms(id) {
    return new Promise(resolve => {
      if (this.createEInvoiceForm.get('termManuallyChanged').value) {
        resolve(true);
        return;
      }

      this.billsService.getVendorRelatedTerms(id).subscribe({
        next: (res: any) => {
          if (!res?.body) {
            resolve(true);
            return;
          }
          if (res.body?.visibilityStatus === AppEnumConstants.STATUS_LETTER_INACTIVE) {
            this.createEInvoiceForm.get(AppFormConstants.TERM).patchValue(res.body.id);
            this.createEInvoiceForm.get(AppFormConstants.NET_DAYS_DUE).patchValue(res.body.netDaysDue);
            this.createEInvoiceForm.get(AppFormConstants.DISCOUNT_PERCENTAGE).patchValue(res.body.discountPercentage);
            this.createEInvoiceForm.get(AppFormConstants.DISCOUNT_DAYS_DUE).patchValue(res.body.discountDaysDue);
          } else {
            this.createEInvoiceForm.get(AppFormConstants.TERM).patchValue(res.body.id);
          }
          resolve(true);
        }, error: (err) => {
          resolve(true);
        }
      });
    });
  }

  /**
   * Change Department
   * @param event any
   * @param dpNameDepartment
   */
  changedDepartment(event: any,dpNameDepartment) {
    this.automationService.setAutomationData(this.createEInvoiceForm, AppFormConstants.DEPARTMENT_ID);
    this.commonUtil.patchHeaderDepartmentToLineLevel(this.createEInvoiceForm, -1, false, null, true, true);
    if (event.value === 0) {
      this.departmentPanel = true;
      this.createEInvoiceForm.get('departmentId').reset();
    }
  }

  /**
   * Change Department from item Table
   * @param event drop down
   * @param index
   */
  changedDepartmentItem(event, index) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    if (event.value === 0) {
      this.departmentPanel = true;
      this.itemCostDistributionForms.controls[index].get('departmentId').reset();
    }
  }

  /**
   * Change Department from account Table
   * @param event drop down
   * @param index
   */
  changedDepartmentAccount(event, index) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    if (event.value === 0) {
      this.departmentPanel = true;
      this.expenseCostDistributionForms.controls[index].get('departmentId').reset();
    }
  }

  /**
   * this method can be used to closed the e invoice screen
   */
  closeEInvoiceCreateMode() {
    this.closePoReceipt.emit();
  }

  /**
   * this method can be used to create e invoice
   * @param action to submit type
   */
  createEInvoice(action) {
    let billDate: any;
    const billMasterDto = Object.assign(this.billMasterDto, this.createEInvoiceForm.getRawValue());
    billMasterDto.additionalData = this.commonUtil.formatMultisetValues(billMasterDto.additionalData);
    billMasterDto.billItemCostDistributions = this.commonUtil.formatMultisetLineValues(billMasterDto.billItemCostDistributions);
    billMasterDto.billExpenseCostDistributions = this.commonUtil.formatMultisetLineValues(billMasterDto.billExpenseCostDistributions);
    billMasterDto.expenseAccountIdList = billMasterDto.billExpenseCostDistributions?.map(r => r.accountId)?.filter(x => x);
    billMasterDto.itemIdList = billMasterDto.billItemCostDistributions?.map(r => r.itemId)?.filter(x => x);
    billMasterDto.projectCodeIdList = billMasterDto.billExpenseCostDistributions?.map(r => r.projectId)?.filter(x => x);
    billMasterDto.projectCodeIdList = billMasterDto.projectCodeIdList.concat(billMasterDto.billItemCostDistributions?.map(r => r.projectId)?.filter(x => x));
    billDate = this.createEInvoiceForm.get('billDate').value;
    if (billDate) {
      billMasterDto.billDate = billDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    }
    billMasterDto.attachments = this.attachments;
    if (this.createEInvoiceForm.valid) {
      if (action === 'SUBMIT_FOR_APPROVED') {
        this.createBill(billMasterDto);

      } else if (action === 'SAVE_AS_APPROVED') {
        this.createBillSaveAsApproved(billMasterDto);
      }
    } else {
      this.isLoading = false;
      this.isLoadingSaveAsApproved = false;
      new CommonUtility().validateForm(this.createEInvoiceForm);
    }
  }

  /**
   * this method can be used to bill submit for approved
   */
  createBill(billMasterDto) {
    this.isLoading = true;
    this.billsService.createEInvoice(billMasterDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.SUBMITTED_SUCCESSFULLY);
        this.isLoading = false;
        this.closeEInvoiceCreateMode();
      } else {
        this.isLoading = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error1 => {
      this.isLoading = false;
      this.notificationService.errorMessage(error1);
    });
  }

  /**
   * this method can be used for bill save as approved
   * @param billMasterDto to bill master dto
   */
  createBillSaveAsApproved(billMasterDto) {
    this.isLoadingSaveAsApproved = true;
    this.billsService.createBillAsApproved(billMasterDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.BILL_SAVE_AS_APPROVED_SUCCESSFULLY);
        this.isLoadingSaveAsApproved = false;
        this.closeEInvoiceCreateMode();
      } else {
        this.isLoadingSaveAsApproved = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error2 => {
      this.isLoadingSaveAsApproved = false;
      this.notificationService.errorMessage(error2);
    });
  }

  /**
   * this method can be used to reset e invoice form
   */
  resetEInvoiceForm() {
    this.createEInvoiceForm.reset();
    this.headingSectionArray.clear();
    this.expenseCostDistributionForms.clear();
    this.itemCostDistributionForms.clear();
    this.adHocWorkflowDetails.clear();
    this.billUtility.matchingTableValues = [];
    this.billUtility.isViewMatchingTable = false;
    this.headerAdditionalFieldDetails = [];
    this.additionalFieldForExpenseCostDistributions = [];
    this.additionalFieldLineItemDetails = [];
    this.departmentChangeFromAutomation = false;
    this.projectCodeChangeFromAutomation = false;
    this.commonUtil.projectCodeChanges = [];
    this.commonUtil.departmentChanges = [];
    this.attachments = [];
    this.clearAutomation();
    this.setDocumentEvent();
    this.automationService.resetSetFieldValueData();
    this.createEInvoiceForm.get(AppFormConstants.PATCH_SET_FIELD_FULL_OBJECT).patchValue(true);
    this.getModuleReheatedAdditionalField(AppDocumentType.BILL, false);
    this.initApprover();
    if (this.fromPo) {
      this.getPoData();
    }
    if (this.fromPoReceipt) {
      this.getPoReceiptData();
    }
  }

  get bill() {
    return this.createEInvoiceForm.controls;
  }

  changeList(selectionName, selectedId, index) {
    if (selectionName === 'ProjectCodesInExpense' && selectedId === 0) {
      this.expenseCostDistributionForms.controls[index].get('projectId').reset();
      this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
      this.isAddNewProjectCodes = true;
    }
    if (selectionName === 'ProjectCodesInExpense') {
      this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    }
    if (selectionName === 'ProjectCodesInItem' && selectedId === 0) {
      this.itemCostDistributionForms.controls[index].get('projectId').reset();
      this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
      this.isAddNewProjectCodes = true;
    }
    if (selectionName === 'ProjectCodesInItem') {
      this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    }
    if (selectionName === 'Account' && selectedId === 0) {
      setTimeout(() => {
        this.expenseCostDistributionForms.controls[index].get('accountId').reset();
      }, 100);
      this.isAddNewAccount = true;
      this.isAddNewProjectCodes = false;
    }
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
   * This method add item to array
   */
  addItemCostDistributionField() {
    const itemCostDistributionForms = this.formBuilder.group({
      itemId: [null],
      itemName: [],
      description: [],
      accountId: [null],
      accountNumber: [null],
      vendorItemNumber: [null],
      qty: [''],
      rate: [''],
      amount: [null],
      discountAmount: [null],
      departmentId: [null],
      projectId: [null],
      itemNumber: [],
      poReceiptId: [null],
      poReceiptIdList: [null],
      billable: [false],
      taxable: [false],
      hideAccountNumberInput: [false],
      additionalData: this.formBuilder.array([])
    });
    const itemLevelAttachment: BillLineLevelPoReceiptDto = new BillLineLevelPoReceiptDto();
    this.billUtility.itemPoReceiptLineLevelAttachments.push(itemLevelAttachment);
    this.itemCostDistributionForms.push(itemCostDistributionForms);
    this.billUtility.addEmptyDropDownReferenceForAccountField();
    const lastIndex = (this.itemCostDistributionForms.length - 2);
    this.addAdditionalLineItems(lastIndex);
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
      billable: [false],
      taxable: [false],
      hideAccountNumberInput: [false],
      additionalData: this.formBuilder.array([])
    });
    const expenseLevelAttachment: BillLineLevelPoReceiptDto = new BillLineLevelPoReceiptDto();
    this.billUtility.expensePoReceiptLineLevelAttachments.push(expenseLevelAttachment);
    this.billUtility.addEmptyDropDownReferenceForAccountField();
    this.expenseCostDistributionForms.push(expenseInfo);
    const lastIndex = (this.expenseCostDistributionForms.length - 2);
    this.addAdditionalExpenseCostDistributionRecords(lastIndex);
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

  /**
   * Add new approver
   */
  addAdHocWorkflowDetail() {
    const addHocWorkflowDetail = this.formBuilder.group({
      approvalOrder: [null],
      approvalGroup: [null],
      approvalUser: [null],
    });
    this.adHocWorkflowDetails.push(addHocWorkflowDetail);
    const adHocWorkFlowOrderNumber = this.adHocWorkflowDetails.length;
    this.adHocWorkflowDetails.controls[adHocWorkFlowOrderNumber - 1].get('approvalOrder').patchValue(adHocWorkFlowOrderNumber);
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
      this.additionalFieldService.getAdditionalField(id, isDetailView, true).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {

          this.additionalFieldResponse = res.body;

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
   * This method use for add line item data additional field and field validations
   */
  public addAdditionalFieldForExpenseCostDistributionTable(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.billMasterDto.billExpenseCostDistributions, field, false, true)) {
      return;
    }
    this.additionalFieldForExpenseCostDistributions.push(field);
    this.expenseCostDistributionForms.controls.forEach((value, index) => {
      this.expenseCostDistributionAdditionalFields(index).push(this.commonUtil.getAdditionalFieldValidations(field, false));
    });
  }

  /**
   * This method use for add line item data additional field and field validations
   * @param field to additional field dto
   */
  public addAdditionalFieldForItemDetailTable(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.billMasterDto.billItemCostDistributions, field, false, true)) {
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
  public expenseCostDistributionAdditionalFields(index) {
    return this.expenseCostDistributionForms.controls[index].get('additionalData') as UntypedFormArray;
  }

  /**
   * This method returns the line item section additional detail controllers as an array
   */
  public itemDetailsAdditionalFields(index) {
    return this.itemCostDistributionForms.controls[index].get('additionalData') as UntypedFormArray;
  }

  /**
   * This method use for calculate total of cost distributions
   */
  getTotalCostDistribution() {

    let expenseCostDistributionAmount = 0.00;
    let itemCostDistributionAmount = 0.00;
    let billAmount = 0.0;


    for (const expenseCost of this.expenseCostDistributionForms.controls) {
      if (expenseCost.value.amount) {
        expenseCostDistributionAmount += expenseCost.value.amount;
      }
    }

    this.itemCostDistributionForms.controls.forEach((itemCost, index) => {

      const discount = undefined === itemCost.value.discountAmount ? 0 : itemCost.value.discountAmount;

      if (itemCost.value.qty && itemCost.value.rate) {
        let sum = itemCost.value.qty * itemCost.value.rate;
        sum = sum - discount;
        itemCostDistributionAmount += sum;
        this.itemCostDistributionForms.controls[index].get('amount').patchValue(sum);
      }
    });

    billAmount = expenseCostDistributionAmount + itemCostDistributionAmount;
    this.createEInvoiceForm.get('expenseCostDistributionCostTotal').patchValue(expenseCostDistributionAmount);
    this.createEInvoiceForm.get('itemCostDistributionCostTotal').patchValue(itemCostDistributionAmount);
    this.createEInvoiceForm.get('billAmount').patchValue(billAmount);
  }

  /**
   * get account list
   * @param listInstance to dropdown dto
   */
  getAccounts(listInstance: DropdownDto) {
    this.billsService.getAccountList(true).subscribe((res: any) => {
      listInstance.data = res;
      listInstance.addNew();
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get account name
   * @param id to account id
   * @param i to index number
   */
  getAccountName(id, i, isItemCostDistribution?) {
    if (id === 0) {
      return;
    } else {
      this.billApprovalsService.getAccountName(id).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (!isItemCostDistribution) {
            this.expenseCostDistributionForms.controls[i].get('accountName').patchValue(null);
            this.expenseCostDistributionForms.controls[i].get('accountNumber').patchValue(res.body.number);
          } else {
            this.itemCostDistributionForms.controls[i].get('accountNumber').patchValue(res.body.number);
          }

          if (res.body.name) {
            this.expenseCostDistributionForms.controls[i].get('accountName').patchValue(res.body.name);
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
   * Check the Remaining Ceiling with and bill amount
   * Then Returns the boolean to show or hide the warning message
   */
  showPopUp(): boolean {
    const poId = this.createEInvoiceForm.get(AppFormConstants.PO_ID).getRawValue();
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
   * this method can be used to view receipt modal as conditionally
   * @param value to po receipt ids
   */
  viewPoReceiptAttachment(value) {
    this.receiptAttachments = [];
    if (this.createEInvoiceForm.get('receiptId').getRawValue()) {
      this.receiptAttachments.push(value);
    } else {
      this.receiptAttachments = value;
    }
    this.isViewReceiptView = value.length > AppConstant.ZERO;
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
      this.createEInvoiceForm.get('customerInvoiceId').reset();
    } else {
      this.isCreateInvoice = false;
    }
  }

  ngOnDestroy(): void {
    this.automationService.cleanupListeners();
  }

  changeProjectCodeHeader(dpNameProjectTask) {
    this.automationService.setAutomationData(this.createEInvoiceForm, AppFormConstants.PROJECT_CODE_ID);
    this.billUtility.patchProjectTaskToLine(this.expenseCostDistributionForms, this.itemCostDistributionForms, dpNameProjectTask.selectedOption.id);
  }

  changePo() {
    this.billUtility.getProjectCodeByPo(this.createEInvoiceForm.get(AppFormConstants.PO_ID).value, this.createEInvoiceForm).then(() => {
      this.automationService.setAutomationData(this.createEInvoiceForm, null, [AppFormConstants.PO_ID, AppFormConstants.PROJECT_CODE_ID]);
    });
  }

  changeHeaderPoReceipt() {
    this.automationService.setAutomationData(this.createEInvoiceForm, AppFormConstants.PO_RECEIPT_ID);
    this.billUtility.getPoReceiptNumberById(this.createEInvoiceForm.get('receiptId').getRawValue(), null, false, this.expenseCostDistributionForms, this.itemCostDistributionForms);
    this.billUtility.getMatchingTableData(this.createEInvoiceForm, this.expenseCostDistributionForms, this.itemCostDistributionForms);
    this.billUtility.ifClearHeaderLevelReceiptCLearLineLevelReceiptValue(this.createEInvoiceForm.get('receiptId').getRawValue(), this.expenseCostDistributionForms, this.itemCostDistributionForms)
  }

  changeBillDate() {
    this.automationService.setAutomationData(this.createEInvoiceForm, AppFormConstants.BILL_DATE);
  }

  changedAccountItm(selectAccountLabel: Dropdown, i: any) {
    this.automationService.triggerFocusListeners(AppFormConstants.FOCUS_LISTENER);
    this.getAccountName(selectAccountLabel.selectedOption.id, i, true);
  }
}

