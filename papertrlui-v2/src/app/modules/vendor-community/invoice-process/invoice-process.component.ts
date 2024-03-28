import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {DataFormat} from '../../../shared/utility/data-format';
import {BillSubmitInvoiceListDto} from '../../../shared/dto/bill/bill-submit-invoice-list-dto';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {BillMasterDto} from '../../../shared/dto/bill/bill-master-dto';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {Router} from '@angular/router';
import {ConfirmationService} from 'primeng/api';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppInvoiceColors} from '../../../shared/enums/app-invoice-colors';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppMessageService} from '../../../shared/enums/app-message-service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {DomSanitizer} from '@angular/platform-browser';
import {VendorInvoiceService} from '../../../shared/services/vendor-community/vendor-invoice.service';
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {FormGuardService} from "../../../shared/guards/form-guard.service";
import {RemoveSpace} from "../../../shared/helpers/remove-space";

@Component({
  selector: 'app-invoice-process',
  templateUrl: './invoice-process.component.html',
  styleUrls: ['./invoice-process.component.scss']
})
export class InvoiceProcessComponent implements OnInit {
  reviewBillDetailsForm: UntypedFormGroup;
  public smallHorSplitter = false;
  public screenSize: any;
  public responsiveSize;
  public customerList: DropdownDto = new DropdownDto();
  public poList: DropdownDto = new DropdownDto();
  public templateList: DropdownDto = new DropdownDto();
  public termList: DropdownDto = new DropdownDto();
  public dateFormat = new DataFormat();
  public dateFormatList: DropdownDto = new DropdownDto();
  public approveUsersList: DropdownDto = new DropdownDto();
  public itemList: DropdownDto = new DropdownDto();
  public projectCodeList: DropdownDto = new DropdownDto();
  public accountList: DropdownDto = new DropdownDto();
  public billList: BillSubmitInvoiceListDto[] = [];
  public appFieldType = AppFieldType;
  public billDetail: BillMasterDto = new BillMasterDto();
  public removeSpace: RemoveSpace = new RemoveSpace();

  @Output() navigateToList = new EventEmitter();
  @Output() closeButtonEmitToHome = new EventEmitter();
  @Input() isEditBill = false;
  @Input() isDetailViewBill = false;
  @Input() billIdFromList: any;
  @Input() tenantIdToEdit: any;
  @Input() tenantID: any;
  @Input() isEInvoiceType: boolean;
  @Input() fromNotification: boolean;

  public commonUtil = new CommonUtility();
  public additionalFieldResponse: AdditionalFieldDetailDto[];
  public headerAdditionalFieldDetails: AdditionalFieldDetailDto[] = [];
  public selectedAdditionalField: AdditionalFieldDetailDto;
  public addNewDropDown = false;
  public appConstant: AppConstant = new AppConstant();
  public approvalGroupList: DropdownDto = new DropdownDto();
  public isAvailableValueApprovalUser = false;
  public isAvailableValueApprovalGroup = false;


  public currentIndex = 0;
  public currentIndexHover: any;
  public addNewVendor: boolean;
  public addNewTemplate = false;
  public billUrl: any;
  public originalFileName: string;
  public isLoading: boolean;
  public isValidDate = true;
  public billMasterDto: BillMasterDto = new BillMasterDto();
  public tenantId: number;
  public templateId: number;
  public dueDate: any;
  public createdBy: string;
  public attachmentId: string;
  public billId: any;
  public isBill = false;
  public isValidDiscountDate = false;
  public isAddNewUser = false;
  public matchingAutomation: any;
  public isWorkflowConfigAvailable = false;
  public isLoadingSaveAsApproved: boolean;
  public appAuthorities = AppAuthorities;
  public previousCustomerIdBeforeChange: any;
  public templateDetailView = false;
  public showIframeHider = false;
  public appFormConstants = AppFormConstants;

  constructor(public router: Router, public formBuilder: UntypedFormBuilder, public sanitizer: DomSanitizer,
              public vendorInvoiceService: VendorInvoiceService, public privilegeService: PrivilegeService,
              public formGuardService: FormGuardService,
              public confirmationService: ConfirmationService, public notificationService: NotificationService,
  ) {
    this.reviewBillDetailsForm = this.formBuilder.group({
      tenantId: [null, Validators.required],
      templateId: [],
      poId: [],
      poReceipt: [],
      billNo: [null, Validators.required],
      billDateFormat: [null, Validators.required],
      billDateStr: [null, Validators.required],
      billAmount: [null, Validators.required],
      term: [null, Validators.required],
      dueDate: [],
      remark: [],
      uomId: [],
      netDaysDue: [null],
      discountPercentage: [],
      discountDaysDue: [],
      id: [],
      billAttachmentId: [],
      remainingCeling: [],
      additionalNotes: [],
      dueDateStr: [],
      billExpenseCostDistributions: this.formBuilder.array([]),
      billItemCostDistributions: this.formBuilder.array([]),
      adHocWorkflowDetails: this.formBuilder.array([]),
      billItemDetails: this.formBuilder.array([]),
      additionalData: this.formBuilder.array([]),
      event: [],
      tax: [],
      billAttachment: [],
      poNumber: [null],
      grossAmount: [null],
      termName: [null],
      attachment: [],
      distributionCostTotal: [null],
    });
    this.reviewBillDetailsForm.get(AppFormConstants.BILL_NO).valueChanges.subscribe(data => this.valueChanged(data));
    this.reviewBillDetailsForm.get(AppFormConstants.BILL_AMOUNT).valueChanges.subscribe(data => this.valueChanged(data));
    this.reviewBillDetailsForm.get(AppFormConstants.TENANT_ID).valueChanges.subscribe(data => this.valueChanged(data));
    this.reviewBillDetailsForm.get(AppFormConstants.PO_ID).valueChanges.subscribe(data => this.valueChanged(data));
    this.reviewBillDetailsForm.get(AppFormConstants.PO_RECEIPT).valueChanges.subscribe(data => this.valueChanged(data));
    this.reviewBillDetailsForm.get(AppFormConstants.BILL_DATE_STR).valueChanges.subscribe(data => this.valueChanged(data));
    this.reviewBillDetailsForm.get(AppFormConstants.TERM).valueChanges.subscribe(data => this.valueChanged(data));
    this.reviewBillDetailsForm.get(AppFormConstants.DUE_DATE).valueChanges.subscribe(data => this.valueChanged(data));

    this.reviewBillDetailsForm.get(AppFormConstants.TENANT_ID).valueChanges.subscribe(() => this.customerChanged());

    this.reviewBillDetailsForm.get(AppFormConstants.PO_ID).valueChanges.subscribe(() => this.getRemainingCeiling());

    this.reviewBillDetailsForm.get(AppFormConstants.TERM).valueChanges.subscribe((data) => this.getDueDate(data, true, false, false));
    this.reviewBillDetailsForm.get(AppFormConstants.BILL_DATE_STR).valueChanges.subscribe((data) => this.getDueDate(data, false, false, false));

    this.reviewBillDetailsForm.get(AppFormConstants.BILL_DATE_STR).valueChanges.subscribe(() => this.validateDate());
    this.reviewBillDetailsForm.get(AppFormConstants.BILL_DATE_FORMAT).valueChanges.subscribe(() => this.validateDate());

    this.reviewBillDetailsForm.get(AppFormConstants.PO_ID).valueChanges.subscribe(data => this.poAndTermChanged(data, 'PO'));
    this.reviewBillDetailsForm.get(AppFormConstants.TERM).valueChanges.subscribe(data => this.poAndTermChanged(data, 'TERM'));
  }

  /**
   * Triggers when po id or term changed
   * @param value data
   * @param name identifier
   */
  poAndTermChanged(value, name) {
    switch (name) {
      case 'PO': {
        if (!value) {
          this.reviewBillDetailsForm.get(AppFormConstants.PO_NUMBER).reset();
        }
        this.poList.data.forEach((value1) => {
          if (value === value1.id) {
            this.reviewBillDetailsForm.get(AppFormConstants.PO_NUMBER).patchValue(value1.name);
          }
        });
        break;
      }
      case 'TERM': {
        if (!value) {
          this.reviewBillDetailsForm.get(AppFormConstants.TERM_NAME).reset();
        }
        this.termList.data.forEach((value1) => {
          if (value === value1.id) {
            this.reviewBillDetailsForm.get(AppFormConstants.TERM_NAME).patchValue(value1.name);
          }
        });
        break;
      }
    }
  }

  /**
   * Triggers when a form value change for automation
   */
  valueChanged(data) {
    // if (data && this.reviewBillDetailsForm.get(AppFormConstants.TENANT_ID).value) {
    //   setTimeout(() => {
    //     this.reviewBillDetailsForm.get(AppFormConstants.EVENT).patchValue(AppDocuments.DOCUMENT_EVENT_SUBMITTED);
    //     const invoice = JSON.parse(JSON.stringify(this.reviewBillDetailsForm.value));
    //     invoice.additionalData = [];
    //     invoice.billItemDetails = [];
    //     this.vendorInvoiceService.valuesChanged(invoice, this.reviewBillDetailsForm.get(AppFormConstants.TENANT_ID).value).subscribe((res: any) => {
    //       if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
    //         if (res.body) {
    //           this.matchingAutomation = res.body.automationWorkflowConfigs;
    //           this.isWorkflowConfigAvailable = res.body.workflowConfigAvailable;
    //         } else {
    //           this.matchingAutomation = null;
    //           this.isWorkflowConfigAvailable = false;
    //         }
    //       }
    //     });
    //   }, 100);
    // }
  }


  ngOnInit(): void {
    if (window.innerWidth < 991) {
      this.responsiveSize = '90%';
    } else {
      this.responsiveSize = '60%';
    }
    this.getTemplateList();
    this.getCustomerList();
    this.getDateFormats();
    if (this.isEditBill || this.isDetailViewBill) {
      this.reviewBillDetailsForm.get(AppFormConstants.TENANT_ID).patchValue(this.tenantIdToEdit);
    } else {
      this.getPendingBillList();
    }
  }

  /**
   * this method can be used to get invoice pdf color
   * @param status to detection status
   */
  invoiceColors(status) {
    switch (status) {
      case 'F':
        return AppInvoiceColors.FULL_MATCH;
      case 'P':
        return AppInvoiceColors.HALF_MATCH;
      case 'N':
        return AppInvoiceColors.NO_MATCH;
    }
  }

  /**
   * this method can be used to  when close modal refresh the component
   */

  refreshComponent() {
    if (this.fromNotification) {
      this.closeButtonEmitToHome.emit();
      this.router.navigate([AppEnumConstants.VENDOR_INVOICE_URL]); // navigate to same route
      return;
    }
    // save current route first
    const currentRoute = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate([currentRoute]); // navigate to same route
    });
  }

  /**
   * Is Splitter Resized End
   */
  splitterResized(event) {
    this.screenSize = window.innerWidth;
    const size = event.split('px');
    // tslint:disable-next-line:radix
    this.smallHorSplitter = !((this.screenSize / 2) > parseInt(size[0]));
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

  /**
   * remove added approve
   * @param i to index
   */
  removeApprove(i: number) {
    this.adHocWorkflowDetails.removeAt(i);
  }

  /**
   * reset form
   */
  resetReviewBillDetailsForm(tenantId) {
    if (!tenantId) {
      tenantId = this.reviewBillDetailsForm.get(AppFormConstants.TENANT_ID).value;
    }
    this.previousCustomerIdBeforeChange = tenantId;
    this.reviewBillDetailsForm.reset();
    this.adHocWorkflowDetails.controls = [];
    this.additionalFieldResponse = [];
    this.poList.data = [];
    this.termList.data = [];
    this.approveUsersList.data = [];
    this.headerAdditionalFieldDetails = [];
    this.headingSectionArray.controls = [];
    this.addAdHocWorkflowDetail();
    this.reviewBillDetailsForm.get(AppFormConstants.TENANT_ID).patchValue(tenantId);
    if (!this.isEditBill || this.isDetailViewBill) {
      this.matchingAutomation = null;
      this.isValidDate = true;
      this.reviewBillDetailsForm.patchValue(this.billDetail);
    }
  }


  /**
   * this method can be used to get selected bill data
   * @param id to selected bill id
   * @param tenantId tenant id
   */
  billSelected(id, tenantId) {
    this.vendorInvoiceService.getBillDetail(id, tenantId, false).then((res: any) => {
      this.resetReviewBillDetailsForm(tenantId);
      this.previousCustomerIdBeforeChange = tenantId;
      res.body.billDate = new Date(res.body.billDate);
      res.body.billDateStr = res.body.actualBillDateStr;
      this.billDetail = res.body;
      this.billId = res.body.id;
      this.reviewBillDetailsForm.patchValue(this.billDetail);

      this.reviewBillDetailsForm.get(AppFormConstants.DUE_DATE).patchValue(res.body.dueDateStr);
      this.reviewBillDetailsForm.get(AppFormConstants.ID).patchValue(id);
      this.attachmentId = this.reviewBillDetailsForm.get(AppFormConstants.BILL_ATTACHMENT_ID).value;
      this.billId = id;
      this.generateBillUrl(false, this.attachmentId, this.reviewBillDetailsForm.get(AppFormConstants.TENANT_ID).value);
    });
    if (!this.isEditBill) {
      this.adHocWorkflowDetails.controls.length = 0;
      this.addAdHocWorkflowDetail();
    }
  }

  /**
   * This method use for get vendor list for dropdown
   */
  getCustomerList() {
    this.vendorInvoiceService.getCustomerList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.customerList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get template list
   */
  getTemplateList() {
    this.vendorInvoiceService.getTemplateList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.templateList.data = res.body;
        this.templateList.addNew();
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to change vendor list
   */
  async customerChanged() {
    const tenantId = this.reviewBillDetailsForm.get(AppFormConstants.TENANT_ID).value;
    if (tenantId) {
      if (tenantId !== this.previousCustomerIdBeforeChange && this.previousCustomerIdBeforeChange) {
        this.resetReviewBillDetailsForm(tenantId);
        return;
      }
      this.previousCustomerIdBeforeChange = tenantId;
      // Get Data if edit and get additional data inside it
      if (this.isEditBill || this.isDetailViewBill) {
        await this.getBillDetailsForEdit();
      } else {
        this.getModuleReheatedAdditionalField(AppDocumentType.BILL, this.isDetailViewBill, tenantId, null);
      }
      this.getCustomerRelatedPoList(tenantId);
      this.getPaymentTerms(tenantId);
      this.getApprovalUserList(tenantId);
      this.getApprovalGroupList(tenantId);
    }
  }


  /**
   * this method can be used to get customer related po list
   */
  getCustomerRelatedPoList(tenantId) {
    this.reviewBillDetailsForm.get(AppFormConstants.PO_ID).reset();
    this.vendorInvoiceService.getPoList(tenantId, this.billDetail.poId ? this.billDetail.poId : 0).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.poList.data = res.body;
      }
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


  /**
   * this method can be used to get date formats
   */
  getApprovalUserList(tenantId) {
    this.vendorInvoiceService.getApprovalUserList(tenantId, !this.isEditBill).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.approveUsersList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get approval group list
   */
  getApprovalGroupList(tenantId) {
    this.vendorInvoiceService.getApprovalGroupList(tenantId, !this.isEditBill).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.approvalGroupList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * this method can be used to get date formats
   */
  getDateFormats() {
    this.vendorInvoiceService.getDateFormats().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.dateFormatList.data = res.body;
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
    this.vendorInvoiceService.getSubmitPendingInvoices().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.billList = res.body;
        this.createdBy = res.body.createdBy;
        this.billSelected(this.billList[0].id, this.billList[0].tenantId);
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
    this.vendorInvoiceService.getExcluedBillList(existIds).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        res.body.forEach(value => {
          this.billList.push(value);
        });
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
   * @param id to id
   * @param tenantId customer id
   */
  generateBillUrl(isDownload: boolean, id, tenantId) {
    this.vendorInvoiceService.getBillAttachment(id, tenantId).subscribe(res => {
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
        this.billUrl = url;
        this.getSafeUrl(url);
      }
    }, error => {
      this.notificationService.errorMessage({
        severity: AppMessageService.SUMMARY_ERROR,
        summary: AppMessageService.SUMMARY_ERROR,
        detail: error.message
      });
    });

  }

  /*
  get vendor related data------------------------------------------------------------------------------------------------------>
   */
  /**
   * this method can be used to submit billMasterDto
   */
  submitBill() {
    this.billMasterDto = this.reviewBillDetailsForm.value;
    this.billMasterDto.dueDate = this.reviewBillDetailsForm.get(AppFormConstants.DUE_DATE_STR).value;
    if (this.reviewBillDetailsForm.valid) {
      this.submitBillForApproval(this.billMasterDto);
    } else {
      this.isLoading = false;
      this.isLoadingSaveAsApproved = false;
      new CommonUtility().validateForm(this.reviewBillDetailsForm);
    }
  }

  /**
   * this method can be used to bill for approval
   * @param billMasterDto to bill master object
   */
  submitBillForApproval(billMasterDto) {
    billMasterDto.additionalData.forEach(value => {
      if (value.fieldTypeId === AppFieldType.DROP_DOWN_FIELD && value.multiple === AppEnumConstants.STATUS_APPROVED &&
        value.fieldValue !== null) {
        value.fieldValue = value.fieldValue.toString();
      }
    });
    this.vendorInvoiceService.submitBill(billMasterDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.SUBMITTED_SUCCESSFULLY);
        this.isLoading = false;
        this.reviewBillDetailsForm.reset();
        this.billList.splice(this.currentIndex, 1);
        if (this.billList.length === 0) {
          this.refreshComponent();
        } else {
          this.billSelected(this.billList[this.currentIndex].id, this.billList[this.currentIndex].tenantId);
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

  /**
   * This method can use for get controllers in form array
   */
  public get adHocWorkflowDetails() {
    return this.reviewBillDetailsForm.get(AppFormConstants.AD_HOCK_WORKFLOW_DETAILS) as UntypedFormArray;
  }


  /**
   * this method can be used to add AddHocWorkflow to addHocWorkflow Array
   */
  addAdHocWorkflowDetail() {
    const addHocWorkflowDetail = this.formBuilder.group({
      approvalGroup: [null],
      approvalUser: [null],
      approvalOrder: [null]
    });
    this.adHocWorkflowDetails.push(addHocWorkflowDetail);

    const adHocWorkFlowOrderNumber = this.adHocWorkflowDetails.length;
    this.adHocWorkflowDetails.controls[adHocWorkFlowOrderNumber - 1].get(
      AppFormConstants.APPROVAL_ORDER).patchValue(adHocWorkFlowOrderNumber);
  }

  /**
   * This method can used to validate billMasterDto date
   */
  validateDate() {
    const billDate = this.reviewBillDetailsForm.get(AppFormConstants.BILL_DATE_STR).value;
    if (!billDate) {
      return;
    }
    const billDateFormat = this.reviewBillDetailsForm.get(AppFormConstants.BILL_DATE_FORMAT).value;
    if (!billDateFormat) {
      return;
    }
    this.vendorInvoiceService.validWithFormat(billDate, billDateFormat).subscribe((res: any) => {
      this.isValidDate = res.body;
    });
  }

  getDueDate(data, fromTerm, fromNet, fromDue) {
    const dateFormat = this.reviewBillDetailsForm.get(AppFormConstants.BILL_DATE_FORMAT).value;
    const billDate = this.reviewBillDetailsForm.get(AppFormConstants.BILL_DATE_STR).value;
    let netDays = this.reviewBillDetailsForm.get(AppFormConstants.NET_DAYS_DUE).value;
    const term = this.reviewBillDetailsForm.get(AppFormConstants.TERM).value;
    let dueDate = this.reviewBillDetailsForm.get(AppFormConstants.DUE_DATE_STR).value;
    let tenantId = this.reviewBillDetailsForm.get(AppFormConstants.TENANT_ID).value;

    if (term == AppConstant.DISCOUNT_TERM_OTHER && fromTerm) {
      this.reviewBillDetailsForm.get(AppFormConstants.NET_DAYS_DUE).setValidators( Validators.compose([Validators.min(0)]));
      this.reviewBillDetailsForm.get(AppFormConstants.NET_DAYS_DUE).updateValueAndValidity();
    } else if (fromTerm) {
      this.reviewBillDetailsForm.get(AppFormConstants.NET_DAYS_DUE).clearValidators();
      this.reviewBillDetailsForm.get(AppFormConstants.NET_DAYS_DUE).updateValueAndValidity();
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
    this.vendorInvoiceService.getDueDate(billDate, dateFormat, term, netDays, dueDate, tenantId).subscribe((res: any) => {
      if (res.body?.message === AppConstant.INVALID_DATE_FORMAT_MSG) {
        this.isValidDate = false;
        this.reviewBillDetailsForm.get(AppFormConstants.DUE_DATE_STR).reset();
      } else {
        if (res.body.dueDate) this.reviewBillDetailsForm.get(AppFormConstants.DUE_DATE_STR).patchValue(res.body.dueDate);
        if (res.body.netDaysDue) {
          this.reviewBillDetailsForm.get(AppFormConstants.NET_DAYS_DUE).patchValue(res.body.netDaysDue);
          this.reviewBillDetailsForm.get(AppFormConstants.NET_DAYS_DUE).markAsDirty();
        }
      }
    });
  }

  /**
   * this method can be used to deleteExpense the bill
   */

  deleteBill(tenantId) {
    this.confirmationService.confirm({
      message: 'You want to delete this Invoice!',
      accept: () => {
        this.vendorInvoiceService.deleteBill(this.billList[this.currentIndex].id, tenantId).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.INVOICE_DELETED_SUCCESSFULLY);
            this.billList.splice(this.currentIndex, 1);
            if (this.billList.length === 0) {
              this.refreshComponent();
            } else {
              this.billSelected(this.billList[0].id, this.billList[0].tenantId);
              this.currentIndex = 0;
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
      this.templateDetailView = false;
      this.billId = this.reviewBillDetailsForm.get(AppFormConstants.ID).value;
      this.addNewTemplate = true;
      this.isBill = false;
      setTimeout(() => {
        this.reviewBillDetailsForm.controls.templateId.reset();
      });
    }
  }

  /**
   * Security Bypass for PDF Url
   */
  getSafeUrl(url) {
    this.billUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url + '#zoom=70');
  }

  /**
   * this method can be used to get remaining ceiling
   */
  getRemainingCeiling() {
    if (!this.reviewBillDetailsForm.get(AppFormConstants.PO_ID).value) {
      return;
    }
    const poId = this.reviewBillDetailsForm.get(AppFormConstants.PO_ID).value;
    this.vendorInvoiceService.getPoCeling(poId, this.reviewBillDetailsForm.get(AppFormConstants.TENANT_ID).value).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.reviewBillDetailsForm.get(AppFormConstants.REMAINING_CELING).patchValue((res.body).toString());
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      },
      error => {
        this.notificationService.errorMessage(error);
      });
  }

  /**
   * This method can be used to validate when select other option in payment terms
   */
  validateOtherSelectionField() {
    const netDaysDue = this.reviewBillDetailsForm.get(AppFormConstants.NET_DAYS_DUE);
    const discountPercentage = this.reviewBillDetailsForm.get(AppFormConstants.DISCOUNT_PERCENTAGE);
    const discountDaysDue = this.reviewBillDetailsForm.get(AppFormConstants.DISCOUNT_DAYS_DUE);
    netDaysDue.reset();
    discountPercentage.reset();
    discountDaysDue.reset();

    if (this.reviewBillDetailsForm.get(AppFormConstants.TERM).value !== 10) {
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
    const netDaysDue = this.reviewBillDetailsForm.get(AppFormConstants.NET_DAYS_DUE).value;
    const discountDaysDue = this.reviewBillDetailsForm.get(AppFormConstants.DISCOUNT_DAYS_DUE).value;

    if (netDaysDue !== null && discountDaysDue != null) {
      if (netDaysDue < discountDaysDue) {
        this.isValidDiscountDate = true;
      } else {
        this.isValidDiscountDate = false;
        this.reviewBillDetailsForm.get(AppFormConstants.DISCOUNT_DAYS_DUE).clearValidators();
      }
    } else {
      return;
    }
    this.reviewBillDetailsForm.get(AppFormConstants.DISCOUNT_DAYS_DUE).updateValueAndValidity();
    this.reviewBillDetailsForm.get(AppFormConstants.NET_DAYS_DUE).updateValueAndValidity();
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
    if (templateId && billId && templateId !== 0 && this.reviewBillDetailsForm.get(AppFormConstants.TEMPLATE_ID).value) {
      this.vendorInvoiceService.getTemplateDetectData(templateId, billId,
        this.reviewBillDetailsForm.get(AppFormConstants.TENANT_ID).value).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.reviewBillDetailsForm.patchValue(res.body);
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });

    }
  }


  /**
   * this method can be used to add new
   */
  changeList(selectionName, selectedId) {
    if (selectionName === 'User' && selectedId === 0) {
      this.reviewBillDetailsForm.get(AppFormConstants.APPROVAL_USER).reset();
      this.isAddNewUser = true;
    }
  }

  /**
   * This method use for add additional fields to po creation
   */
  getModuleReheatedAdditionalField(id, isDetailView, tenantId, result) {
    this.vendorInvoiceService.getAdditionalField(id, isDetailView, tenantId, !this.isEditBill).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {

        this.additionalFieldResponse = res.body;

        this.additionalFieldResponse.forEach(((field) => {
          this.commonUtil.manageDropDownData(field, isDetailView);

          if (field.sectionId === AppModuleSection.MASTER_DATA_INPUT_SECTION_ID) {
            this.addHeadingField(field);
          }
        }));

        // Patch Data When edit or detail view after additional fields init
        if (this.isEditBill || this.isDetailViewBill) {
          this.billId = result.body.id;
          this.adHocWorkflowDetails.controls.length = 0;
          this.addAdHocWorkflowDetail();
          this.billDetail.additionalData = this.commonUtil.patchDropDownAdditionalData(this.billDetail.additionalData);
          this.billDetail.additionalData = this.commonUtil.alignHeadingAdditionalData(this.headerAdditionalFieldDetails, this.billDetail.additionalData);


          this.reviewBillDetailsForm.patchValue(this.billDetail);
          const tax = this.reviewBillDetailsForm.get(AppFormConstants.TAX).value;
          const totalAmount = this.reviewBillDetailsForm.get(AppFormConstants.BILL_AMOUNT).value;
          this.reviewBillDetailsForm.get(AppFormConstants.GROSS_AMOUNT).patchValue(totalAmount - tax)
        }
      } else {
        this.notificationService.infoMessage(res.body.message);
      }

    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * This method use for add master data additional field and field validations
   * @param field AdditionalFieldDetailDto
   */
  public addHeadingField(field: AdditionalFieldDetailDto) {
    this.headerAdditionalFieldDetails.push(field);
    this.headingSectionArray.push(this.commonUtil.getAdditionalFieldValidations(field, this.isDetailViewBill));
  }

  /**
   * return form array data
   */
  public get headingSectionArray() {
    return this.reviewBillDetailsForm.get(AppFormConstants.ADDITIONAL_DATA) as UntypedFormArray;
  }


  /**
   * This method can be used to valid empty spaces in the form
   * @param controlName to form control name
   */
  removeFieldSpace(controlName: AbstractControl) {
    if (controlName && controlName.value && !controlName.value.replace(/\s/g, '').length) {
      controlName.setValue('');
    }
  }

  /**
   * This method use for view additional option input drawer
   * @param event
   * @param additionalFieldDetailDto AdditionalFieldDetailDto
   * @param additionalField
   */
  addNewAdditionalDropDownOption(event: any, additionalFieldDetailDto: AdditionalFieldDetailDto, additionalField: AbstractControl) {
    if (event.itemValue === 0 || event.value === 0) {
      additionalField.get(AppFormConstants.FIELD_VALUE).reset();
      this.addNewDropDown = true;
      this.selectedAdditionalField = additionalFieldDetailDto;
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
    this.headingSectionArray.controls[index].get(AppFormConstants.FIELD_VALUE).patchValue(event.toLocaleDateString());
  }

  /**
   * this method can be used to get bill details for edit
   */
  getBillDetailsForEdit() {
    return new Promise<void>(resolve => {
      this.vendorInvoiceService.getBillDetail(this.billIdFromList, this.tenantIdToEdit, false).then((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.isEInvoiceType = res.body.billType === AppEnumConstants.INVOICE_TYPE_E || res.body.billType === AppEnumConstants.INVOICE_TYPE_R;
          this.billDetail = res.body;
          if (res.body.billItemDetails) {
            res.body.billItemDetails.forEach((value) => {
              if (value.uomId) {
                value.uomId = value.uomId.unit
              }
              this.addItem();
            });
          }
          res.body.billDateStr = res.body.actualBillDateStr;
          this.generateBillUrl(false, res.body.billAttachmentId, this.reviewBillDetailsForm.get(AppFormConstants.TENANT_ID).value);
          this.getModuleReheatedAdditionalField(AppDocumentType.BILL,
            this.isDetailViewBill, this.reviewBillDetailsForm.get(AppFormConstants.TENANT_ID).value, res);
          resolve();
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    })
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
      this.getSafeUrl(window.URL.createObjectURL(targetFile));
    }
  }

  /**
   * this method can be used to edit bill details
   */
  editBill() {
    if (this.reviewBillDetailsForm.valid) {
      const billMasterDto = this.billMasterDto = this.reviewBillDetailsForm.value;
      this.billMasterDto.dueDate = this.reviewBillDetailsForm.get(AppFormConstants.DUE_DATE_STR).value;
      billMasterDto.billAttachment = null;
      billMasterDto.additionalData.forEach(value => {
        if (value.fieldTypeId === AppFieldType.DROP_DOWN_FIELD && value.multiple === AppEnumConstants.STATUS_APPROVED &&
          value.fieldValue !== null) {
          value.fieldValue = value.fieldValue.toString();
        }
      });
      this.vendorInvoiceService.editBill(billMasterDto,
        this.reviewBillDetailsForm.get(AppFormConstants.TENANT_ID).value).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.INVOICE_RESUBMITTED_SUCCESSFULLY);
          this.isLoading = false;
          this.refreshComponent();
        } else {
          this.notificationService.infoMessage(res.body.message);
          this.isLoading = false;
        }
      }, error => {
        this.notificationService.errorMessage(error);
        this.isLoading = false;
      });
    } else {
      new CommonUtility().validateForm(this.reviewBillDetailsForm);
      this.isLoading = false;
    }
  }

  /**
   * This method can use for get controllers in form array
   */
  public get itemFields() {
    return this.reviewBillDetailsForm.get(AppFormConstants.BILL_ITEM_DETAILS) as UntypedFormArray;
  }


  /**
   * This method use for add new form controller group for automation condition
   */
  addItem() {
    const itemInfo = this.formBuilder.group({
      productId: [null],
      itemName: [null],
      qty: [null],
      uomId: [null],
      uom: [null],
      unitPrice: [null],
      discountAmount: [0.0],
      itemNumber: [''],
      amount: [{value: null, disabled: true}],
      additionalData: this.formBuilder.array([])
    });
    this.itemFields.push(itemInfo);
  }

  /**
   * This method can be used to remove items
   */
  removeItem(itemIndex) {
    this.itemFields.removeAt(itemIndex);
  }


  navigate(e, name: string, i: any) {
    if (this.isDetailViewBill) {
      return;
    }
    switch (e.key) {
      case AppConstant.ARROW_DOWN:
        if ((this.itemFields.length) - 2 === i) {
          this.addItem();
        }
        e.preventDefault();
        document.getElementById(name + (i + 1)).focus();
        break;
      case AppConstant.ARROW_UP:
        e.preventDefault();
        if (i !== 0) {
          document.getElementById(name + (i - 1)).focus();
        }
        break;
    }
  }

  /**
   * calculate amount
   * @param index to item detail index number
   */
  calculateAmount(index) {
    if (this.itemFields.controls[index].value.unitPrice === null || this.itemFields.controls[index].value.unitPrice === null) {
      return;
    }

    if (this.isDetailViewBill) {
      return;
    }
    const purchasingPrice: number = (!this.itemFields.controls[index].value.unitPrice) ? 0.00 :
      this.itemFields.controls[index].value.unitPrice;

    const qty: number = (!this.itemFields.controls[index].value.qty) ? 0.00 :
      this.itemFields.controls[index].value.qty;

    const discount: number = (!this.itemFields.controls[index].value.discountAmount) ? 0.00 :
      this.itemFields.controls[index].value.discountAmount;

    const total: number = parseFloat((qty * purchasingPrice) + AppConstant.EMPTY_STRING);

    this.itemFields.controls[index].value.amount = total;
    this.itemFields.controls[index].value.amount = parseFloat((total - discount) + AppConstant.EMPTY_STRING);
    this.itemFields.controls[index].value.discountAmount = parseFloat(discount + AppConstant.EMPTY_STRING);

    this.calculateTotal();
  }

  calculateTotal() {
    let netAmount: number;
    let taxAmount: number;
    let grossAmount = 0.0;

    this.itemFields.value.forEach((value) => {
      if (value.amount != null) {
        parseFloat(value.amount);
        grossAmount += value.amount;
        this.reviewBillDetailsForm.get(AppFormConstants.GROSS_AMOUNT).patchValue(grossAmount);
      }
    });

    taxAmount = this.reviewBillDetailsForm.get(AppFormConstants.TAX).value;
    netAmount = grossAmount + taxAmount;
    this.reviewBillDetailsForm.get(AppFormConstants.BILL_AMOUNT).patchValue(netAmount);
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

  /**
   * Download bill additional attachment
   */
  downloadAdditionalAttachments(attachment) {
    if (attachment.id != null) {
      this.vendorInvoiceService.downloadBillAdditionalAttachment(attachment.id, this.tenantID).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', attachment.fileName);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
        } else {
          this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  viewSelectedTemplate(data: any) {
    this.templateId = data.id;
    this.templateDetailView = true;
    this.addNewTemplate = true;
  }
}
