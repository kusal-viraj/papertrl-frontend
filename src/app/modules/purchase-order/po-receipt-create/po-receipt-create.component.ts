import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {PoReceiptService} from '../../../shared/services/po-receipts/po-receipt.service';
import {PoReceiptDetailsDto} from '../../../shared/dto/po-receipt/po-receipt-details-dto';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppConstant} from '../../../shared/utility/app-constant';
import {ConfirmationService, MessageService} from 'primeng/api';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {PoReceiptAdditionalAttachment} from '../../../shared/dto/po-receipt/po-receipt-additional-attachment';
import {PoReceiptAccountDetailDto} from '../../../shared/dto/po-receipt/po-receipt-account-detail-dto';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {PoUtility} from '../po-utility';
import {PoService} from '../../../shared/services/po/po.service';
import {RoleService} from '../../../shared/services/roles/role.service';
import {ManageDrawerService} from '../../../shared/services/common/manage-drawer-status/manage-drawer.service';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";

@Component({
  selector: 'app-po-receipt-create',
  templateUrl: './po-receipt-create.component.html',
  styleUrls: ['./po-receipt-create.component.scss']
})
export class PoReceiptCreateComponent implements OnInit {
  @Input() editView = false;
  @Input() detailView = false;
  @Input() poReceiptID: any;
  @Input() fromPo: any;
  @Input() poId: any;
  @Input() vendorId: any;
  @Input() poReceiptStatus: any;
  @Input() isClickDetailViewEdit = false;
  @Output() closePoReceipt = new EventEmitter();
  @Output() deletePoReceipt = new EventEmitter();
  @Output() clickEditActionEmitter = new EventEmitter();
  @Output() editSuccessEmitter = new EventEmitter();

  public createPurchaseOrderReceiptForm: UntypedFormGroup;
  public poReceiptLineData: PoReceiptDetailsDto[] = [];
  public poReceiptAccountDetails: PoReceiptAccountDetailDto [] = [];
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public enums = AppEnumConstants;
  public AppAnalyticsConstants = AppAnalyticsConstants;

  public vendors: DropdownDto = new DropdownDto();
  public files: any [] = [];
  public approveres: any [] = [];
  public poList: DropdownDto = new DropdownDto();
  public uom: DropdownDto = new DropdownDto();
  public addVendorPanel: boolean;
  public appConstant: AppConstant = new AppConstant();
  public appAuthorities = AppAuthorities;
  public loading = false;
  public netAmount = false;
  public totalAmount = 0.00;

  public headerAdditionalFieldDetails: AdditionalFieldDetailDto[] = new Array();
  public lineItemAdditionalFieldDetails: AdditionalFieldDetailDto[] = new Array();
  public accountAdditionalFieldDetails: AdditionalFieldDetailDto[] = new Array();
  public appFieldType = AppFieldType;
  public additionalFieldResponse: AdditionalFieldDetailDto[];
  public selectedAdditionalField: AdditionalFieldDetailDto;
  public addNewDropDown = false;
  public allPoReceiptAttachment: PoReceiptAdditionalAttachment [] = new Array();
  public commonUtil = new CommonUtility();
  public poUtility: PoUtility = new PoUtility(this.poService, this.roleService, this.messageService,
    this.privilegeService, this.notificationService, this.drawerService, this.billsService);
  public today = new Date();
  public isSelectAccount = false;

  // Po receipt draft related variable
  public isShowDraftListPopUp = false;
  public userAvailableDraftList: any [] = [];
  public isClickedEditButtonFromDraftList = false;
  public isSaveAsDraft = false;
  public isDraftNameAvailable = false;
  public isOverrideData = false;
  public draftId: any;
  public isVisibleNotificationContent = false;
  public purchaseOrderStatus: any;
  public isCLosePo = false;
  @Input() isAttachmentId: any;

  constructor(public formBuilder: UntypedFormBuilder, public poReceiptService: PoReceiptService,
              public notificationService: NotificationService, public confirmationService: ConfirmationService,
              public additionalFieldService: AdditionalFieldService, public billsService: BillsService,
              public privilegeService: PrivilegeService, public formGuardService: FormGuardService,
              public gaService: GoogleAnalyticsService,
              public poService: PoService, public roleService: RoleService, public messageService: MessageService,
              public drawerService: ManageDrawerService) {
  }

  ngOnInit(): void {
    if (!this.editView) {
      this.showAvailableDraftListPopUp();
    }
    this.initializePoReceiptFormGroup();
    this.billsService.getVendorList(!this.editView).subscribe((res: any) => {
      this.vendors.data = res.body;
      if (this.privilegeService.isAuthorized(AppAuthorities.VENDORS_CREATE)) {
        this.vendors.addNew();
      }
      if (this.fromPo) {
        this.createPurchaseOrderReceiptForm.get('vendorId').patchValue(this.vendorId);
        this.changedVendorSelection(this.vendorId);
      }
    });
    this.poReceiptService.getApprovers().subscribe((res) => {
      this.approveres = (res.body);
    });
    const today = new Date();
    this.today.setDate(today.getDate());
    this.resetPoReceiptForm();
  }

  /**
   * this method used for initialize po receipt form group
   */
  initializePoReceiptFormGroup() {
    this.createPurchaseOrderReceiptForm = this.formBuilder.group({
      receiptNumber: [{
        value: null,
        disabled: this.detailView
      }, Validators.compose([Validators.required, Validators.maxLength(50)])],
      receiptDate: [{value: null, disabled: this.detailView}, Validators.required],
      vendorId: [{value: null, disabled: this.detailView}, Validators.required],
      poId: [{value: null, disabled: this.detailView}, Validators.required],
      poDate: [{value: null, disabled: this.detailView}],
      receivedBy: [{value: null, disabled: this.detailView}],
      notes: [{value: null, disabled: this.detailView}],
      totalAmount: [{value: 0, disabled: this.detailView}, Validators.min(0.1)],
      poReceiptDetails: this.formBuilder.array([]),
      poReceiptAttachments: [null],
      attachmentId: [null],
      id: [null],
      additionalData: this.formBuilder.array([]),
      purchaseOrderReceiptAccountDetails: this.formBuilder.array([]),
    });
  }

  /**
   * close create po receipt dower
   */
  closePOReceiptCreateMode() {
    this.closePoReceipt.emit(false);
  }

  /*
  ITEM FORM ARRAY DETAILS----->
 */

  /**
   * This method can use for get controllers in form array
   */
  public get lineItemMainTable() {
    return this.createPurchaseOrderReceiptForm.get('poReceiptDetails') as UntypedFormArray;
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
   * This method use for add new form controller group for automation condition
   */
  addItem() {
    const itemInfo = this.formBuilder.group({
      itemNumber: [null],
      itemName: [null],
      uom: [null],
      receivedQty: [null],
      vendorItemNumber: [null],
      remainingQty: [0],
      unitPrice: [null],
      description: [null],
      amount: [null],
      discountAmount: [null],
      poDetailId: [null],
      productId: [null],
      additionalData: this.formBuilder.array([])
    });
    this.lineItemMainTable.push(itemInfo);
  }


  /**
   * This method use for add new form controller group for automation condition
   */
  addAccount() {
    const accountInfo = this.formBuilder.group({
      accountId: [null],
      accountName: [null],
      accountNumber: [null],
      description: [null],
      amount: [null],
      projectId: [null],
      additionalData: this.formBuilder.array([]),
      isSelectAccount: [{value: false, disabled: this.detailView}],
      accountDetailId: [null]
    });
    this.accountDetails.push(accountInfo);
  }


  /*
  Drop Zone Function----->
 */

  /**
   * This method can be used to select file
   * @param event to change event
   */

  onSelect(event) {
    this.files.push(...event.addedFiles);
    this.createPurchaseOrderReceiptForm.patchValue({
      poReceiptAttachments: this.files
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
   * this method can be used to get po details
   * @param value to po number
   */
  changePoNumber(value) {
    if (!isNotNullOrUndefined(value)) {
      this.createPurchaseOrderReceiptForm.get('poDate').reset();
      this.createPurchaseOrderReceiptForm.get('totalAmount').patchValue(AppConstant.ZERO);
      this.lineItemAdditionalFieldDetails = [];
      this.poReceiptAccountDetails = [];

      while (this.lineItemMainTable.length !== 0) {
        this.lineItemMainTable.removeAt(0);
      }

      while (this.accountDetails.length !== 0) {
        this.accountDetails.removeAt(0);
      }
      this.isVisibleNotificationContent = false;
      this.isCLosePo = false;
    } else {
      this.isCLosePo = this.isVisibleNotificationContent = this.isClosedSelectedPo(value);
      this.poReceiptService.getPoReceiptItemsData(value).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.accountDetails.controls = [];
          this.lineItemMainTable.controls = [];

          this.poReceiptLineData = res.body.poReceiptDetails;
          if (this.poReceiptLineData.length > AppConstant.ZERO) {
            this.poReceiptLineData.forEach((value1, i) => {
              this.addItem();
              this.lineItemAdditionalFieldDetails.forEach(value1 => {
                this.lineItemAdditionalField(i).push(this.commonUtil.getAdditionalFieldValidations(value1, this.detailView));
              });
            });
            this.lineItemMainTable.patchValue(this.poReceiptLineData);
          }

          this.poReceiptAccountDetails = res.body.purchaseOrderReceiptAccountDetails;
          if (this.poReceiptAccountDetails) {
            for (let i = 0; this.poReceiptAccountDetails.length > i; i++) {
              this.addAccount();
              this.accountAdditionalFieldDetails.forEach((receiptAccountDetail) => {
                this.accountAdditionalField(i).push(this.commonUtil.getAdditionalFieldValidations(receiptAccountDetail, this.detailView));
              });
            }
            this.accountDetails.patchValue(this.poReceiptAccountDetails);
            this.isNoDetailsForSelectedPO();
          }
          if (res.body.poDateStr) {
            this.createPurchaseOrderReceiptForm.get('poDate').patchValue(res.body.poDateStr);
          }
          // this.poReceiptLineData = res.body.poReceiptDetails;
          this.getTotalAmount();
        }
      });
    }
  }


  /**
   * This method use to get vendor's bills
   * @param event any
   */
  changedVendorSelection(event: any) {
    this.lineItemMainTable.controls = [];
    this.createPurchaseOrderReceiptForm.get('poId').reset();
    this.poList.data = [];
    if (event === 0) {
      this.addVendorPanel = true;
      this.createPurchaseOrderReceiptForm.get('vendorId').reset();
    } else {
      this.clearItemDetailTableData();
      if (!event) {
        this.accountDetails.controls = [];
        return;
      } else {
        this.poReceiptService.getVendorRelatedPoList(event).subscribe((res: any) => {
          this.poList.data = res.body;
          if (this.fromPo) {
            this.createPurchaseOrderReceiptForm.get('poId').patchValue(this.poId);
            this.changePoNumber(this.poId);
          }
        });
      }
    }
  }

  /**
   * this method trigger change the vendor dropdown
   */
  clearItemDetailTableData() {
    const lineItemAdditionalData = this.lineItemAdditionalFieldDetails;
    const lineAccountAdditionalData = this.accountAdditionalFieldDetails;
    this.lineItemMainTable.clear();
    this.accountDetails.clear();
    this.lineItemAdditionalFieldDetails = [];
    this.lineItemAdditionalFieldDetails = lineItemAdditionalData;
    this.accountAdditionalFieldDetails = lineAccountAdditionalData;
  }


  /**
   * This method use for calculate remaining qty
   * @param i to index
   */
  calculateRemaining(i) {
    let remainingQty = this.poReceiptLineData[i].remainingQty;

    if (remainingQty === undefined || remainingQty === null) {
      remainingQty = 0;
    }

    if (this.poReceiptLineData[i].receivedQty) {
      remainingQty = remainingQty + this.poReceiptLineData[i].receivedQty;
    }

    if (!this.lineItemMainTable.controls[i].get('receivedQty').value) {
      this.lineItemMainTable.controls[i].get('receivedQty').patchValue(0);
    }

    if (this.lineItemMainTable.controls[i].value.receivedQty >= remainingQty) {
      this.lineItemMainTable.controls[i].get('receivedQty').patchValue(remainingQty);
      this.lineItemMainTable.controls[i].get('remainingQty').patchValue(0);
    }

    this.poReceiptService.getLineCalculations(this.lineItemMainTable.controls[i].get('receivedQty').value,
      this.lineItemMainTable.controls[i].get('poDetailId').value).subscribe((res: any) => {
      this.lineItemMainTable.controls[i].get('discountAmount').patchValue(res.body.discountAmount);
      this.lineItemMainTable.controls[i].get('amount').patchValue(res.body.lineAmount);

      if (this.lineItemMainTable.controls[i].value.receivedQty >= remainingQty) {
        this.lineItemMainTable.controls[i].get('receivedQty').patchValue(remainingQty);
        this.lineItemMainTable.controls[i].get('remainingQty').patchValue(0);
      } else {
        this.lineItemMainTable.controls[i].value.remainingQty =
          Math.round((remainingQty - this.lineItemMainTable.controls[i].value.receivedQty) * 100) / 100;
        this.lineItemMainTable.controls[i].get('remainingQty').patchValue(this.lineItemMainTable.controls[i].value.remainingQty);
      }
      this.getTotalAmount();
    });
  }

  /**
   * This method can use for calculate total amount of po receipt
   */
  getTotalAmount() {
    let totalAmount = 0.00;
    if (this.lineItemMainTable.controls.length !== 0) {
      for (let i = 0; this.lineItemMainTable.controls.length > i; i++) {
        if (!isNaN(this.lineItemMainTable.controls[i].value.amount)) {
          totalAmount += this.lineItemMainTable.controls[i].value.amount;
        }
      }
    }
    if (this.accountDetails.controls.length !== 0) {
      this.accountDetails.value.forEach((value: any) => {
        if (value.isSelectAccount && !isNaN(value.amount)) {
          totalAmount += value.amount;
        }
      });
    }
    this.createPurchaseOrderReceiptForm.get('totalAmount').patchValue(totalAmount);
  }


  /**
   * submit po receipts
   */
  submitPoReceipt(label) {
    if (label === AppAnalyticsConstants.CREATE_PO_RECEIPT || label === AppAnalyticsConstants.SAVE) {
      this.gaService.trackScreenButtonEvent(
        label,
        AppAnalyticsConstants.MODULE_NAME_PO_RECEIPT,
        label,
        AppAnalyticsConstants.CREATE_SCREEN
      );
    }
    this.loading = true;
    this.formatFieldValue();
    this.formatNumberField();
    if (this.createPurchaseOrderReceiptForm.valid) {
      if (this.editView || this.poReceiptStatus === AppEnumConstants.STATUS_DRAFT || this.isOverrideData) {
        this.editPoReceipt();
      } else {
        this.createPoReceipt();
      }
    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.createPurchaseOrderReceiptForm);
    }
  }

  /**
   * this method can be used to format field values
   */
  formatFieldValue() {
    this.createPurchaseOrderReceiptForm.value.additionalData =
      this.commonUtil.formatMultisetValues(this.createPurchaseOrderReceiptForm.value.additionalData);

    this.createPurchaseOrderReceiptForm.value.poReceiptDetails =
      this.commonUtil.formatMultisetLineValues(this.createPurchaseOrderReceiptForm.value.poReceiptDetails);

    this.createPurchaseOrderReceiptForm.value.purchaseOrderReceiptAccountDetails =
      this.commonUtil.formatMultisetLineValues(this.createPurchaseOrderReceiptForm.value.purchaseOrderReceiptAccountDetails);

    if (this.editView) {
      this.commonUtil.validateFileInput(this.createPurchaseOrderReceiptForm.get('additionalData'), this.allPoReceiptAttachment);
    }
  }

  createPoReceipt() {
    try {
      this.createPurchaseOrderReceiptForm.get('receiptDate').patchValue
      (this.createPurchaseOrderReceiptForm.get('receiptDate').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
    } catch (e) {

    }

    try {
      this.createPurchaseOrderReceiptForm.get('poDate').patchValue
      (this.createPurchaseOrderReceiptForm.get('poDate').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
    } catch (e) {

    }
    this.poReceiptService.submitPoReceiptData(this.createPurchaseOrderReceiptForm.value).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.resetPoReceiptForm();
        this.closePOReceiptCreateMode();
        this.loading = false;
        this.notificationService.successMessage(HttpResponseMessage.PO_RECEIPT_CREATED_SUCCESSFULLY);
      } else {
        this.loading = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, (error => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    }));
  }

  editPoReceipt() {
    try {
      this.createPurchaseOrderReceiptForm.get('receiptDate').patchValue
      (this.createPurchaseOrderReceiptForm.get('receiptDate').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
    } catch (e) {

    }

    try {
      this.createPurchaseOrderReceiptForm.get('poDate').patchValue
      (this.createPurchaseOrderReceiptForm.get('poDate').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
    } catch (e) {

    }

    this.poReceiptService.editPoReceiptData(this.createPurchaseOrderReceiptForm.value).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.loading = false;
        if (!this.editView) {
          this.notificationService.successMessage(HttpResponseMessage.PO_RECEIPT_CREATED_SUCCESSFULLY);
        } else {
          this.notificationService.successMessage(HttpResponseMessage.PO_RECEIPT_UPDATED_SUCCESSFULLY);
        }
        if (!this.isClickDetailViewEdit) {
          this.closePOReceiptCreateMode();
        } else {
          this.editSuccessEmitter.emit();
        }
      } else {
        this.loading = false;
        this.isSaveAsDraft = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, (error => {
      this.loading = false;
      this.isSaveAsDraft = false;
      this.notificationService.errorMessage(error);
    }));
  }

  /**
   * Download Attachments
   */
  downloadAttachments(val) {
    if (val.fieldId) {
      this.downloadAdditionalAttachment(val);
    } else {
      this.downloadPoReceiptAttachment(val);
    }
  }

  deleteAttachments(val, index) {
    if (val.fieldId) {
      this.deleteAdditionalAttachments(val, index);
    } else {
      this.deletePoReceiptAttachments(val, index);
    }
  }


  downloadPoReceiptAttachment(val) {
    this.poReceiptService.downloadAttachment(val.id).subscribe((res: any) => {
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

  downloadAdditionalAttachment(val) {
    this.poReceiptService.downloadAdditionalAttachment(val.id).subscribe((res: any) => {
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

  deletePoReceiptAttachments(val, index) {
    this.confirmationService.confirm({
      key: 'poReceiptA',
      message: 'You want to delete this Attachment!',
      accept: () => {
        this.poReceiptService.deleteReceiptAttachment(val.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.allPoReceiptAttachment.splice(index, 1);
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

  deleteAdditionalAttachments(val, index) {
    this.confirmationService.confirm({
      key: 'poReceiptA',
      message: 'You want to delete this Attachment!',
      accept: () => {
        this.poReceiptService.deleteAddtionalAttachment(val.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.allPoReceiptAttachment.splice(index, 1);
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
   * Additional Field Info------------------------------------------------------------------------------------------------------------->
   */

  /**
   * This method use for add additional fields to po creation
   */
  getModuleReheatedAdditionalField(id, isDetailView, responseBody) {
    this.additionalFieldService.getAdditionalField(id, isDetailView, !this.editView).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {

        this.additionalFieldResponse = res.body;

        this.additionalFieldResponse.forEach(((field) => {
          this.commonUtil.manageDropDownData(field, isDetailView);

          if (field.sectionId === AppModuleSection.MASTER_DATA_INPUT_SECTION_ID) {
            this.addHeadingField(field);
          }

          if (field.sectionId === AppModuleSection.LINE_ITEM_SECTION_ID) {
            this.addLineField(responseBody, field);
          }

          if (field.sectionId === AppModuleSection.PURCHASING_ACCOUNT_INFO) {
            this.addLineFieldForAccounts(responseBody, field);
          }

        }));

        if (!responseBody) {
          return;
        }
        responseBody.additionalData = this.commonUtil.patchDropDownAdditionalData(responseBody.additionalData);
        responseBody.poReceiptDetails = this.commonUtil.patchDropDownAdditionalLineItemData(responseBody.poReceiptDetails);
        responseBody.purchaseOrderReceiptAccountDetails =
          this.commonUtil.patchDropDownAdditionalLineItemData(responseBody.purchaseOrderReceiptAccountDetails);
        responseBody.additionalData =
          this.commonUtil.alignHeadingAdditionalData(this.headerAdditionalFieldDetails, responseBody.additionalData);
        this.commonUtil.alignLineAdditionalData(responseBody.poReceiptDetails, this.lineItemAdditionalFieldDetails);
        this.commonUtil.alignLineAdditionalData(responseBody.purchaseOrderReceiptAccountDetails, this.accountAdditionalFieldDetails);
        this.createPurchaseOrderReceiptForm.patchValue(responseBody);


        // PO receipt draft related condition
        if (!this.detailView) {
          this.getTotalAmount();
        }

        this.isDraftNameAvailable = false;
        if (this.isClickedEditButtonFromDraftList) {
          this.poReceiptService.isProcessingPatchingDataFromPoReceiptDraft.next({
            isProgress: false,
            index: this.userAvailableDraftList.findIndex(x => x.id === this.draftId)
          });
          this.isShowDraftListPopUp = false;
        }
        this.isNoDetailsForSelectedPO();

      } else {
        this.notificationService.infoMessage(res.body.message);
      }

    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /*
----------------------------------------DATA MAPPING----------------------------------------------------------------------------->
 */

  /**
   * This method use for add line item data additional field and field validations
   * @param data
   * @param field
   * @private
   */
  public addLineField(data, field: AdditionalFieldDetailDto) {
    let poReceiptDetails = [];
    if (data) {
      poReceiptDetails = data.poReceiptDetails;
    }
    if (!this.commonUtil.checkUndefinedLineItemsValues(poReceiptDetails, field, this.detailView, !this.editView && !this.detailView)) {
      return;
    }
    this.lineItemAdditionalFieldDetails.push(field);
    this.lineItemMainTable.controls.forEach((value, index) => {
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
   * This method use for add line item data additional field and field validations
   * @param data
   * @param field
   * @private
   */
  public addLineFieldForAccounts(data, field: AdditionalFieldDetailDto) {
    let purchaseOrderReceiptAccountDetails = [];
    if (data) {
      purchaseOrderReceiptAccountDetails = data.purchaseOrderReceiptAccountDetails;
    }
    if (!this.commonUtil.checkUndefinedLineItemsValues(purchaseOrderReceiptAccountDetails, field, this.detailView,
      !this.editView && !this.detailView)) {
      return;
    }
    this.accountAdditionalFieldDetails.push(field);
    this.accountDetails.controls.forEach((value, index) => {
      this.accountAdditionalField(index).push(this.commonUtil.getAdditionalFieldValidations(field, this.detailView));
    });
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
    if (multiSelect._options.length === AppConstant.ONE && additionalFieldDetailDto.createNew
      === AppConstant.STATUS_ACTIVE && additionalFieldDetailDto.multiple ===
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
   * return form array data
   */
  public get headingSectionArray() {
    return this.createPurchaseOrderReceiptForm.get('additionalData') as UntypedFormArray;
  }

  /**
   * This method returns the line item section additional detail controllers as an array
   */
  public lineItemAdditionalField(index) {
    return this.lineItemMainTable.controls[index].get('additionalData') as UntypedFormArray;
  }

  /**
   * format date
   */

  formatDateHeadingSection(event, index) {
    this.headingSectionArray.controls[index].get('fieldValue').patchValue(event.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
  }


  formatDateLineItemSection(event, index, additionalLineItemField) {
    additionalLineItemField.get('fieldValue').patchValue(event.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
  }

  /**
   * This method use for choose file for upload
   * @param event any
   * @param additionalField to index array instance
   * @param indexNumber to index number
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
   * format date
   */
  formatDateSection(event, index, field) {
    if (!event) {
      return;
    }
    field.value.fieldValue = event.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
  }

  /**
   * this method can be used to get file name
   * @param fileUpload string
   * @param i to index
   */
  fileUploadClick(fileUpload, i: number) {
    document.getElementById(fileUpload + i).click();
  }


  /**
   * reset receipt form
   */
  resetPoReceiptForm() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.MODULE_NAME_PO_RECEIPT,
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.CREATE_SCREEN
    );
    this.createPurchaseOrderReceiptForm.reset();
    this.isVisibleNotificationContent = false;
    this.lineItemAdditionalFieldDetails = [];
    this.poReceiptAccountDetails = [];
    this.accountAdditionalFieldDetails = [];
    this.headerAdditionalFieldDetails = [];
    this.files = [];
    this.isDraftNameAvailable = false;

    while (this.headingSectionArray.length !== 0) {
      this.headingSectionArray.removeAt(0);
    }
    while (this.lineItemMainTable.length !== 0) {
      this.lineItemMainTable.removeAt(0);
    }

    while (this.accountDetails.length !== 0) {
      this.accountDetails.removeAt(0);
    }
    if (this.editView || this.detailView || this.isOverrideData) {
      this.loadExistingPoReceiptData();
    } else {
      this.getModuleReheatedAdditionalField(AppDocumentType.PURCHASE_ORDER_RECEIPT, false, null);

    }
  }

  /**
   * Load receipt details by receipt master id
   */
  loadExistingPoReceiptData() {
    this.poReceiptService.getPoReceiptData(this.poReceiptID).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        res.body.poDate = new Date(res.body.poDate);
        this.purchaseOrderStatus = res.body.poStatus;
        this.poId = res.body.poId;
        this.isCLosePo = this.isClosedSelectedPo(this.poId);
        this.getModuleReheatedAdditionalField(AppDocumentType.PURCHASE_ORDER_RECEIPT, this.detailView, res.body);
        res.body.poDate = res.body.poDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
        if (res.body.receiptDate) {
          res.body.receiptDate = new Date(res.body.receiptDate);
        }
        if (res.body.vendorId) {
          this.poReceiptService.getVendorRelatedPoListWithPoId(res.body.vendorId, res.body.poId).subscribe((res1: any) => {
            this.poList.data = res1.body;
          });
        }

        this.allPoReceiptAttachment = res.body.actualAttachments;

        if (res.body.additionalFieldAttachments.length > 0) {
          res.body.additionalFieldAttachments.forEach((value) => {
            this.allPoReceiptAttachment.push(value);
          });
        }

        if (this.poReceiptStatus === AppEnumConstants.STATUS_DRAFT || this.isOverrideData) {
          const attachments: any [] = res.body.actualAttachments;
          if (attachments) {
            attachments.splice(attachments.findIndex(x => x.id === res.body.attachmentId), AppConstant.ONE);
          }
        }

        if (this.detailView) {
          res.body.poReceiptDetails = res.body.poReceiptDetails.filter(x => x.receivedQty !== null && x.receivedQty !== undefined);
        }

        if (res.body.poReceiptDetails) {
          for (let i = 0; res.body.poReceiptDetails.length > i; i++) {

            // po receipt draft related changes
            if (this.poReceiptStatus === AppEnumConstants.STATUS_DRAFT) {
              let receivedQty: number;
              let amount: number;
              const actualRemainingQty: number = res.body.poReceiptDetails[i].actualRemainingQty;
              !res.body.poReceiptDetails[i].receivedQty ? receivedQty = AppConstant.ZERO : receivedQty =
                res.body.poReceiptDetails[i].receivedQty;
              const unitPrice = res.body.poReceiptDetails[i].unitPrice;
              if (isNotNullOrUndefined(actualRemainingQty) && isNotNullOrUndefined(actualRemainingQty)) {
                if (actualRemainingQty !== AppConstant.ZERO) {
                  if (receivedQty >= actualRemainingQty) {
                    res.body.poReceiptDetails[i].receivedQty = actualRemainingQty;
                    res.body.poReceiptDetails[i].remainingQty = AppConstant.ZERO;
                  } else {
                    res.body.poReceiptDetails[i].remainingQty = (actualRemainingQty - receivedQty);
                  }
                }
                amount = res.body.poReceiptDetails[i].receivedQty * unitPrice;
                res.body.poReceiptDetails[i].amount = amount;
              }
            }
            //

            this.addItem();
            this.lineItemAdditionalFieldDetails.forEach(reposeLineTableData => {
              this.lineItemAdditionalField(i).push(this.commonUtil.getAdditionalFieldValidations(reposeLineTableData, this.detailView));
            });
          }
        }
        this.poReceiptLineData = res.body.poReceiptDetails;

        this.poReceiptAccountDetails = res.body.purchaseOrderReceiptAccountDetails;
        if (this.poReceiptAccountDetails) {

          this.poReceiptAccountDetails.forEach((poReceiptAccount, i) => {
            if (poReceiptAccount.isSelectAccount && this.detailView) {
              this.addAccount();
            } else if (!this.detailView) {
              this.addAccount();
            }
            this.accountAdditionalFieldDetails.forEach(accountData => {
              this.accountAdditionalField(i).push(this.commonUtil.getAdditionalFieldValidations(accountData, this.detailView));
            });
          });

          this.accountDetails.patchValue(this.poReceiptAccountDetails);
        }
        this.poReceiptLineData = res.body.poReceiptDetails;

      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, (error => {
      this.notificationService.errorMessage(error);
    }));
  }

  /**
   * account information
   */


  /**
   * This method returns the line item section additional detail controllers as an array
   */
  public accountAdditionalField(index) {
    return this.accountDetails.controls[index].get('additionalData') as UntypedFormArray;
  }

  /**
   * This method can use for get controllers in form array
   */
  public get accountDetails() {
    return this.createPurchaseOrderReceiptForm.get('purchaseOrderReceiptAccountDetails') as UntypedFormArray;
  }

  updateAdditionalFieldDropDowns() {
    this.commonUtil.updateAdditionalFiledDropdowns(this.headerAdditionalFieldDetails, this.selectedAdditionalField);
    this.commonUtil.updateAdditionalFiledDropdowns(this.lineItemAdditionalFieldDetails, this.selectedAdditionalField);
    this.commonUtil.updateAdditionalFiledDropdowns(this.accountAdditionalFieldDetails, this.selectedAdditionalField);
  }

  // Po receipt draft related function

  /**
   * this method can be used to save po receipt draft
   * @param value to form value
   */
  checkSaveAsDraft(value) {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.SAVE_AS_DRAFT,
      AppAnalyticsConstants.MODULE_NAME_PO_RECEIPT,
      AppAnalyticsConstants.SAVE_AS_DRAFT,
      AppAnalyticsConstants.CREATE_SCREEN
    );
    this.isSaveAsDraft = true;
    const invalidForm = !this.createPurchaseOrderReceiptForm.get('receiptNumber').value ||
      !this.createPurchaseOrderReceiptForm.get('vendorId').value || !this.createPurchaseOrderReceiptForm.get('poId').value;

    if (invalidForm) {
      if (!this.createPurchaseOrderReceiptForm.get('receiptNumber').value) {
        this.createPurchaseOrderReceiptForm.get('receiptNumber').markAsDirty();
      }
      if (!this.createPurchaseOrderReceiptForm.get('vendorId').value) {
        this.createPurchaseOrderReceiptForm.get('vendorId').markAsDirty();
      }
      if (!this.createPurchaseOrderReceiptForm.get('poId').value) {
        this.createPurchaseOrderReceiptForm.get('poId').markAsDirty();
      }
      this.isSaveAsDraft = false;
      return;
    } else {
      this.saveDraft();
    }
  }

  /**
   * This method used for save po receipt as draft
   */
  saveDraft() {
    this.formatFieldValue();
    try {
      this.createPurchaseOrderReceiptForm.get('receiptDate').patchValue
      (this.createPurchaseOrderReceiptForm.get('receiptDate').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
    } catch (e) {

    }
    this.formatNumberField();
    const poRequestDto = this.createPurchaseOrderReceiptForm.value;
    this.poReceiptService.savePOReceiptAsDraft(poRequestDto, this.editView, this.isOverrideData).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.editView ? this.notificationService.successMessage(HttpResponseMessage.DRAFT_UPDATED_SUCCESSFULLY) :
          this.notificationService.successMessage(HttpResponseMessage.DRAFT_SAVED_SUCCESSFULLY);
        this.resetPoReceiptForm();
        this.closePOReceiptCreateMode();
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
   * this method can be used to format number
   */
  formatNumberField() {
    const totalAmount = this.createPurchaseOrderReceiptForm.get('totalAmount');
    if (isNaN(totalAmount.value)) {
      totalAmount.patchValue(AppConstant.ZERO);
    }
    const itemDetails: any [] = this.createPurchaseOrderReceiptForm.value.poReceiptDetails;
    const accountDetails: any [] = this.createPurchaseOrderReceiptForm.value.purchaseOrderReceiptAccountDetails;

    if (isNotNullOrUndefined(itemDetails) && itemDetails.length > AppConstant.ZERO) {
      itemDetails.forEach(item => {
        if (isNaN(item.amount)) {
          item.amount = AppConstant.ZERO;
        }
      });
    }
    if (isNotNullOrUndefined(accountDetails) && accountDetails.length > AppConstant.ZERO) {
      accountDetails.forEach(account => {
        if (isNaN(account.amount)) {
          account.amount = AppConstant.ZERO;
        }
      });
    }
  }

  /**
   * this method used for conditionally show hide reset button
   */
  isVisibleResetButton() {
    return !this.detailView;
  }

  /**
   * this method used for conditionally show hide create receipt button
   */
  isVisibleCreateReceiptButton() {
    return !this.detailView && (!this.editView || (this.editView && this.poReceiptStatus === this.enums.STATUS_DRAFT));
  }

  /**
   * this method used for conditionally show hide save as draft button
   */
  isVisibleSaveAsDraftButton() {
    return !this.detailView && (!this.poReceiptStatus ||
      (this.editView && this.poReceiptStatus === this.enums.STATUS_DRAFT));
  }

  /**
   * this method used for conditionally show hide save button
   */
  isVisibleSaveButton() {
    return this.editView && this.poReceiptStatus !== this.enums.STATUS_DRAFT;
  }

  /**
   * this method used for get submit action progress status
   */
  isFormSubmitActionProgress() {
    return (this.isSaveAsDraft || this.loading || this.isCLosePo);
  }

  /**
   * this method can be used to get user available draft list
   * this function call from onInit() method
   */
  getAvailableDraftList() {
    if (this.editView) {
      return;
    }
    this.poReceiptService.getUserAvailableDraftList().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.userAvailableDraftList = res.body;
        this.isShowDraftListPopUp = (this.userAvailableDraftList.length > this.appConstant.ZERO
          && this.poUtility.showPoReceiptDraftListByDefault &&
          (this.poReceiptStatus !== this.enums.STATUS_DRAFT)) && !this.detailView;
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
   * This method can be used to get available draft id
   */
  getAvailableDraftId() {
    const vendorId = this.createPurchaseOrderReceiptForm.get('vendorId').value;
    const poReceiptNumber = this.createPurchaseOrderReceiptForm.get('receiptNumber').value;
    if (!(isNotNullOrUndefined(poReceiptNumber) && isNotNullOrUndefined(vendorId)) || this.editView) {
      return;
    } else {
      this.poReceiptService.getAvailableDraftIdByName(poReceiptNumber, vendorId).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.isDraftNameAvailable = (isNotNullOrUndefined(res.body) && (this.poReceiptStatus !==
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
        key: 'poReceiptDraftOverrideConfirmation',
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
    this.poReceiptID = this.draftId;
    this.resetPoReceiptForm();
  }

  /**
   * Check the Remaining Ceiling with and bill amount
   * Then Returns the boolean to show or hide the warning message
   */
  showMsg(): any {
    if (this.purchaseOrderStatus === AppEnumConstants.STATUS_CLOSED) {
      return HttpResponseMessage.CLOSED_SELECTED_PO;
    }

    const isEmptyLineData =
      this.poReceiptLineData.length === AppConstant.ZERO && this.poReceiptAccountDetails.length === AppConstant.ZERO;

    if (isEmptyLineData) {
      return HttpResponseMessage.NO_REMAINING_DETAILS_FOR_SELECTED_PO;
    }
  }

  /**
   * return true if selected po is closed
   * @param poId to selected po id
   */
  isClosedSelectedPo(poId) {
    return (this.purchaseOrderStatus === AppEnumConstants.STATUS_CLOSED
      && (this.poReceiptStatus === AppEnumConstants.STATUS_DRAFT || this.isOverrideData) && (poId === this.poId));
  }

  /**
   * return true if empty line table data of selected po
   */
  isNoDetailsForSelectedPO() {
    const isEmptyLineData =
      this.poReceiptLineData.length === AppConstant.ZERO && this.poReceiptAccountDetails.length === AppConstant.ZERO;
    this.isVisibleNotificationContent = isEmptyLineData &&
      (this.poReceiptStatus === AppEnumConstants.STATUS_DRAFT || this.isOverrideData);
  }

  /**
   * this method used for manage condition of view draft list popup
   */
  showAvailableDraftListPopUp() {
    this.poUtility.getPoReceiptDraftListState();
    setTimeout(() => {
      this.getAvailableDraftList();
    }, 1000);
  }

  /**
   * this method can be used to delete po receipt
   * @param poReceiptID to po receipt id
   */
  deletePOReceipt(poReceiptID) {
    if (!poReceiptID) {
      return;
    } else {
      this.confirmationService.confirm({
        key: 'poReceiptDraftDeleteKeyOfDetailView',
        message: 'You want to delete this Receipt',
        accept: () => {
          this.poReceiptService.deleteReceipt(poReceiptID).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.notificationService.successMessage(HttpResponseMessage.PO_RECEIPT_DELETED_SUCCESSFULLY);
              this.deletePoReceipt.emit();
              this.closePoReceipt.emit();

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
   * this method can be used to edit  po receipt
   */
  editPOReceipt() {
    this.clickEditActionEmitter.emit();
  }
}
