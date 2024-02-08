import {Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {PoService} from '../../../shared/services/po/po.service';
import {RoleService} from '../../../shared/services/roles/role.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppAutomationEvent} from '../../../shared/enums/app-automation-event';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppHttpResponseMessage} from '../../../shared/enums/app-http-response-message';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {PatternValidator} from '../../../shared/helpers/pattern-validator';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {DataFormatToISODate} from '../../../shared/utility/data-format-toISODate';
import {PurchaseOrdersService} from '../../../shared/services/vendor-community/purchase-orders.service';
import {DatePipe} from '@angular/common';
import jspdf from 'jspdf';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {Router} from '@angular/router';
import {PoMasterDto} from '../../../shared/dto/po/po-master-dto';
import {BillApprovalsService} from '../../../shared/services/bills/bill-approvals.service';
import {FormGuardService} from "../../../shared/guards/form-guard.service";
import {Menu} from "primeng/menu";


@Component({
  selector: 'app-purchase-orders-approve',
  templateUrl: './purchase-orders-approve.component.html',
  styleUrls: ['./purchase-orders-approve.component.scss']
})
export class PurchaseOrdersApproveComponent implements OnInit {

  public createPurchaseOrderForm: UntypedFormGroup;
  public poRequestDto: any;
  public appConstant: AppConstant = new AppConstant();
  public selectedAdditionalField: AdditionalFieldDetailDto;
  public appFieldType = AppFieldType;
  public files: File[] = [];
  public actualAttachments: any [] = [];
  public additionalAttachments: any [] = [];
  public additionalFieldResponse: AdditionalFieldDetailDto[];
  public headerAdditionalFieldDetails: AdditionalFieldDetailDto[] = [];
  public lineItemAdditionalFieldDetails: AdditionalFieldDetailDto[] = [];
  public accountAdditionalFieldDetails: AdditionalFieldDetailDto[] = new Array();
  public commonUtil = new CommonUtility();

  statuses: any;
  public grossAmount: any;
  public rejectLoading = false;
  public underDiscussionLoading = false;
  public saveAsApprovedLoading = false;
  public btnLoading = false;
  public today = new Date();
  public addNewItemOverlay = false;
  public loading = false;
  public showHideRulesApplied = false;
  public poIdToDownload;

  @Input() detailView = false;
  @Input() tenantId;
  @Input() isUnderDiscussion = false;
  @Input() poID: any;
  @Output() closePo = new EventEmitter();
  @ViewChild('menu') menu: Menu;
  @Input() fromNotification: boolean;
  @Output() closeButtonEmitToHome = new EventEmitter();

  public isRejectError = false;
  public appAuthorities = AppAuthorities;


  constructor(public formBuilder: UntypedFormBuilder, public poService: PoService, public roleService: RoleService,
              public messageService: MessageService, public additionalFieldService: AdditionalFieldService,
              public purchaseOrdersService: PurchaseOrdersService, public datePipe: DatePipe,
              public confirmationService: ConfirmationService, public notificationService: NotificationService,
              public privilegeService: PrivilegeService, public router: Router, public billApprovalsService: BillApprovalsService,
              public formGuardService: FormGuardService) {
  }


  ngOnInit(): void {
    this.createPurchaseOrderForm = this.formBuilder.group({
      id: [null],
      poNumber: [null],
      poDate: [{value: null, disabled: true}],
      vendorId: [null],
      projectCodeId: [null],
      deliveryDate: [{value: null, disabled: true}],
      pocName: [null],
      pocPhone: [null],
      notes: [null],
      shippingAddress: [null],
      billingAddress: [null],
      automationId: [null],
      projectNo: [null],
      grossAmount: [null],
      taxAmount: [null],
      taxPercentageStr: [null],
      discountAmount: [null],
      attachmentId: [null],
      remarks: [null],
      netAmount: [null],
      tenantId: [null],
      workflow: [null],
      attachments: [null],
      createdUser: [null],
      eventId: [null],
      documentTypeId: [null],
      purchaseOrderDetails: this.formBuilder.array([]),
      adHocWorkflowDetails: this.formBuilder.array([]),
      additionalData: this.formBuilder.array([]),
      purchaseOrderAccountDetails: this.formBuilder.array([]),
      event: [],
      itemGrossAmount: [null],
      accountGrossAmount: [null],
    });

    const today = new Date();
    this.today.setDate(today.getDate());
    this.createPurchaseOrderForm.get(AppFormConstants.TENANT_ID).setValue(this.tenantId);
    this.loadExistingPoData(this.poID);
  }

  get po() {
    return this.createPurchaseOrderForm.controls;
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
   * This method use for add new form controller group for automation condition
   */
  addItem() {
    const itemInfo = this.formBuilder.group({
      id: [],
      productId: [null],
      itemName: [null],
      vendorItemNumber: [null],
      itemNumber: [null],
      qty: [null],
      uomId: [null],
      unitPrice: [null],
      description: [],
      discountAmount: [null],
      departmentId: [null],
      amount: [{value: null, disabled: true}],
      additionalData: this.formBuilder.array([])
    });
    this.lineItemMainTable.push(itemInfo);
  }

  /**
   * This method use for add new form controller group for automation condition
   */
  addAccount() {
    const accountInfo = this.formBuilder.group({
      description: [null],
      amount: [null],
      projectId: [null],
      additionalData: this.formBuilder.array([])
    });
    this.accountDetails.push(accountInfo);
  }

  /**
   * This method can be used to create new po
   */
  markAsUnderDiscussion() {
    this.submitButtonsDisableOnOff('discuss', true);

    this.poRequestDto = this.createPurchaseOrderForm.value;
    this.poRequestDto.documentTypeId = AppDocumentType.PURCHASE_ORDER;
    this.poRequestDto.eventId = AppAutomationEvent.SUBMITTED;

    this.purchaseOrdersService.purchaseOrderUnderDiscussion(this.poRequestDto, this.createPurchaseOrderForm.get('tenantId').value).subscribe((res: any) => {

      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.submitButtonsDisableOnOff('discuss', false);
        this.notificationService.successMessage(AppHttpResponseMessage.PO_MARKED_AS_IN_DISCUSSION_SUCCESSFULLY);
        this.close();

      } else {
        this.submitButtonsDisableOnOff('discuss', false);
        this.notificationService.infoMessage(res.body.message);
      }

    }, error => {
      this.submitButtonsDisableOnOff('discuss', false);
      this.notificationService.errorMessage(error.message);
    });
  }


  /**
   * This method can be used to create new po as approved
   */
  markAsApproved() {
    this.submitButtonsDisableOnOff('approved', true);
    this.poRequestDto.remarks = this.createPurchaseOrderForm.get('remarks').value;
    this.poRequestDto.remarks = this.createPurchaseOrderForm.get('remarks').value;
    this.purchaseOrdersService.purchaseOrderApprove(this.poRequestDto, this.createPurchaseOrderForm.get('tenantId').value).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.submitButtonsDisableOnOff('approved', false);
        this.notificationService.successMessage(AppHttpResponseMessage.PO_APPROVED_SUCCESSFULLY);
        this.close();

      } else {
        this.submitButtonsDisableOnOff('approved', false);
        this.notificationService.infoMessage(res.body.message);
      }

    }, error => {
      this.submitButtonsDisableOnOff('approved', false);
      this.notificationService.errorMessage(error.message);
    });
  }

  /**
   * This method can be used to update PO
   */
  markAsRejected() {
    if (this.createPurchaseOrderForm.get('remarks').value === '' || this.createPurchaseOrderForm.get('remarks').value === null) {
      this.isRejectError = true;
      return;
    }
    this.submitButtonsDisableOnOff('reject', true);

    this.poRequestDto = this.createPurchaseOrderForm.value;
    this.poRequestDto.documentTypeId = AppDocumentType.PURCHASE_ORDER;
    this.poRequestDto.eventId = AppAutomationEvent.EDIT_AND_RESUBMITTED;
    this.poRequestDto.remarks = this.createPurchaseOrderForm.get('remarks').value;
    this.purchaseOrdersService.purchaseOrderReject(this.poRequestDto, this.createPurchaseOrderForm.get('tenantId').value).subscribe((res: any) => {

      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.submitButtonsDisableOnOff('reject', false);
        this.notificationService.successMessage(AppHttpResponseMessage.PO_REJECT_SUCCESSFULLY);
        this.close();

      } else {
        this.submitButtonsDisableOnOff('reject', false);
        this.notificationService.infoMessage(res.body.message);
      }

    }, error => {
      this.submitButtonsDisableOnOff('reject', false);
      this.notificationService.errorMessage(error.message);
    });
  }


  /**
   * this method disables buttons and show loader on submit
   */
  submitButtonsDisableOnOff(name, bool) {
    switch (name) {
      case 'reject': {
        this.rejectLoading = bool;
        this.btnLoading = bool;
        break;
      }
      case 'approved': {
        this.saveAsApprovedLoading = bool;
        this.btnLoading = bool;
        break;
      }
      case 'discuss': {
        this.underDiscussionLoading = bool;
        this.btnLoading = bool;
        break;
      }
    }
  }


  /**
   * This method emit value close button click
   */
  close() {
    if (this.fromNotification) {
      this.closeButtonEmitToHome.emit();
      this.router.navigate([AppEnumConstants.VENDOR_PURCHASE_ORDER_URL]); // navigate to same route
      return;
    }

    const currentRoute = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate([currentRoute]); // navigate to same route
    });
  }


  downloadSystemAttachments(val: any) {
    this.loading = true;
    this.poService.downloadVendorPoAttachment(val.id, this.createPurchaseOrderForm.get(AppFormConstants.TENANT_ID).value).subscribe((res: any) => {
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

  downloadAdditionalAttachments(val) {
    this.loading = true;
    this.poService.vendorPoDownloadAdditionalAttachment(val.id, this.tenantId).subscribe((res: any) => {
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


  loadExistingPoData(poMstId: number) {
    this.purchaseOrdersService.getPoData(poMstId).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.poRequestDto = res.body;
        this.showHideRulesApplied = res.body.showHideRulesApplied;
        this.poIdToDownload = res.body.id;
        // Format DateStr in to ISO date format
        try {
          res.body.poDate = DataFormatToISODate.convert(res.body.poDate);
        } catch (e) {
        }
        try {
          res.body.deliveryDate = DataFormatToISODate.convert(res.body.deliveryDate);
        } catch (e) {
        }
        // Assign Actual Attachments
        this.actualAttachments = res.body.poAttachments;
        this.actualAttachments.forEach((value, index) => {
          if (value.id === res.body.attachmentId) {
            this.actualAttachments.splice(index, 1);
          }
        });
        res.body.additionalFieldAttachments.forEach((value) => {
          this.actualAttachments.push(value);
        });

        // PurchaseOrder Detail load section
        res.body.purchaseOrderDetails.forEach((value, index) => {
          this.addItem();
          if (value.uomId) {
            value.uomId = value.uomId.unit;
          }
        });
        res.body.purchaseOrderAccountDetails.forEach((value, index) => {
          this.addAccount();
        });
        // patch form data after additional fields init
        this.getModuleReheatedAdditionalField(AppDocumentType.PURCHASE_ORDER, true, res.body);

      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, (error => {
      this.notificationService.errorMessage(error);
    }));
  }


  /**
   * This method can use for get controllers in form array
   */
  public get lineItemMainTable() {
    return this.createPurchaseOrderForm.get('purchaseOrderDetails') as UntypedFormArray;
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

  downloadFromBackend() {
    this.poService.vendorViewReport(this.poID).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        console.log('start download:', res);
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Purchase Order');
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


  /*
------------------------------ADDITIONAL FIELD RELATED FUNCTIONS------------------------------------------------------------------------->
*/

  /**
   * This method use for add additional fields to po creation
   */
  getModuleReheatedAdditionalField(id, isDetailView, formData) {
    this.purchaseOrdersService.getAdditionalField(id, isDetailView, this.createPurchaseOrderForm.get('tenantId').value, false).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {

        this.additionalFieldResponse = res.body;

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
        // patch data after additional fields init

        formData.additionalData = this.commonUtil.patchDropDownAdditionalData(formData.additionalData);
        formData.purchaseOrderDetails = this.commonUtil.patchDropDownAdditionalLineItemData(formData.purchaseOrderDetails);
        formData.purchaseOrderAccountDetails = this.commonUtil.patchDropDownAdditionalLineItemData(formData.purchaseOrderAccountDetails);

        formData.additionalData = this.commonUtil.alignHeadingAdditionalData(this.headerAdditionalFieldDetails, formData.additionalData);
        this.commonUtil.alignLineAdditionalData(formData.purchaseOrderDetails, this.lineItemAdditionalFieldDetails);
        this.commonUtil.alignLineAdditionalData(formData.purchaseOrderAccountDetails, this.accountAdditionalFieldDetails);

        this.createPurchaseOrderForm.patchValue(formData);


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
    this.headingSectionArray.push(this.commonUtil.getAdditionalFieldValidations(field, true));
  }

  /**
   * return form array data
   */
  public get headingSectionArray() {
    return this.createPurchaseOrderForm.get('additionalData') as UntypedFormArray;
  }

  /**
   * This method use for add line item data additional field and field validations
   * @param field
   * @private
   */
  public addLineField(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.poRequestDto.purchaseOrderDetails, field, true, false)) {
      return;
    }
    this.lineItemAdditionalFieldDetails.push(field);
    this.lineItemMainTable.controls.forEach((value, index) => {
      this.lineItemAdditionalField(index).push(this.commonUtil.getAdditionalFieldValidations(field, true));
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

  /**
   * This method can use for get controllers in form array
   */
  public get accountDetails() {
    return this.createPurchaseOrderForm.get('purchaseOrderAccountDetails') as UntypedFormArray;
  }

  /**
   * This method use for add line item data additional field and field validations
   * @param field
   * @private
   */
  public addLineFieldForAccounts(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.poRequestDto.purchaseOrderAccountDetails, field, true, false)) {
      return;
    }
    this.accountAdditionalFieldDetails.push(field);
    this.accountDetails.controls.forEach((value, index) => {
      this.accountAdditionalField(index).push(this.commonUtil.getAdditionalFieldValidations(field, true));
    });
  }

}
