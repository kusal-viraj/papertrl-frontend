import {Component, OnInit, Output, EventEmitter, Input, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AppConstant} from '../../../shared/utility/app-constant';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {BillSubmitService} from '../../../shared/services/bills/bill-submit.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {TemplateMstDto} from '../../../shared/dto/bill/template-mst-dto';
import {BillDiamentionDto} from '../../../shared/dto/bill/bill-template-diamention-dto';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {CommonMessage} from '../../../shared/utility/common-message';
import {DomSanitizer} from '@angular/platform-browser';
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {VendorInvoiceService} from '../../../shared/services/vendor-community/vendor-invoice.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {ConfirmationService} from 'primeng/api';
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";

@Component({
  selector: 'app-add-template',
  templateUrl: './add-template.component.html',
  styleUrls: ['./add-template.component.scss']
})
export class AddTemplateComponent implements OnInit {

  public templateCreationForm: UntypedFormGroup;
  public termList: DropdownDto = new DropdownDto();
  public billTemplateMaster: TemplateMstDto = new TemplateMstDto();
  public appFormConstants = AppFormConstants;
  public dateFormatList: DropdownDto = new DropdownDto();
  public removeSpace: RemoveSpace = new RemoveSpace();
  public appAuthorities = AppAuthorities;
  public vendorOtherEmails: any [] = [];
  @Output() closeTemplateCreateView = new EventEmitter();
  @Output() editSuccessEmitter = new EventEmitter();
  @Output() deletedSuccessEmitter = new EventEmitter();
  @Output() clickEditActionEmitter = new EventEmitter();
  @Output() deleteSuccessEmitter = new EventEmitter();
  @Input() attachmentId: any;
  @Input() billId: any;
  @Input() id: any;
  @Input() detailView = false;
  @Input() editView = false;
  @Input() fromTemplateManagement = false;
  @Input() vendorId: any;
  @Input() tenantId: any;
  @Input() billTemplateStatus: any;

  public leaveField: string;
  public originalFileName: string;
  public billUrl;
  public vendorList: DropdownDto = new DropdownDto();
  public addNewVendor = false;
  public isValidDate = true;

  public index0 = false;
  public index1 = false;
  public index2 = false;
  public index3 = false;
  public btnLoading = false;
  public isValidEmail = true;
  public fromVendor = false;
  simpleTemplate = 'bill';
  camelTemplate = 'Bill';


  public isFloating = false;

  @ViewChild('fileInput1') attachment;
  public isValidDiscountDate = false;


  constructor(public formBuilder: UntypedFormBuilder, public billSubmitService: BillSubmitService, public sanitizer: DomSanitizer,
              public notificationService: NotificationService, public billsService: BillsService, public formGuardService: FormGuardService,
              public privilegeService: PrivilegeService, public vendorInvoiceService: VendorInvoiceService,
              public confirmationService: ConfirmationService,  private gaService: GoogleAnalyticsService) {
    this.fromVendor = this.privilegeService.isVendor();
    if (this.fromVendor) {
      this.simpleTemplate = 'invoice';
      this.camelTemplate = 'Invoice';
    }
  }

  ngOnInit() {
    this.templateCreationForm = this.formBuilder.group({
      id: [AppConstant.NULL_VALUE],
      attachment: [{
        value: AppConstant.NULL_VALUE,
        disabled: this.detailView
      }, this.fromTemplateManagement ? Validators.required : null],
      templateName: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}, Validators.required],
      tenantId: [AppConstant.NULL_VALUE],
      vendorId: [{
        value: AppConstant.NULL_VALUE,
        disabled: this.detailView
      }, this.fromVendor ? null : Validators.required],
      attachmentId: [AppConstant.NULL_VALUE],
      poNumber: [{value: AppConstant.NULL_VALUE, disabled: this.detailView},],
      billDateFormat: [{value: AppConstant.NULL_VALUE, disabled: this.detailView},],
      billAmount: [{value: AppConstant.NULL_VALUE, disabled: this.detailView},],
      term: [{value: AppConstant.NULL_VALUE, disabled: this.detailView},],
      billNo: [{value: AppConstant.NULL_VALUE, disabled: this.detailView},],
      billDateStr: [{value: AppConstant.NULL_VALUE, disabled: this.detailView},],
      attachmentUpdated: [{value: AppConstant.NULL_VALUE, disabled: this.detailView},],
      netDaysDue: [{value: AppConstant.NULL_VALUE, disabled: this.detailView},],
      discountPercentage: [{value: AppConstant.NULL_VALUE, disabled: this.detailView},],
      discountDaysDue: [{value: AppConstant.NULL_VALUE, disabled: this.detailView},],
    });

    this.templateCreationForm.get(AppFormConstants.TERM).valueChanges.subscribe((data) => this.termChanged(data));

    this.getTermList();
    this.getDateFormats();

    this.billTemplateMaster.billId = this.billId;
    if (!this.fromVendor) {
      this.getVendorList();
    }
    this.getTemplateData();
  }

  /**
   * Get template data for edit or detail view
   */
  getTemplateData() {
    if (this.fromVendor) {
      this.templateCreationForm.get('tenantId').patchValue(this.tenantId);
    } else {
      this.templateCreationForm.get('vendorId').patchValue(this.vendorId);
    }
    if (this.attachmentId) {
      this.templateCreationForm.get('attachmentId').patchValue(this.attachmentId);
    }
    this.generateBillUrl(false);
    if (!(this.detailView || this.editView)) {
      return;
    }
    this.templateCreationForm.get('attachmentUpdated').patchValue(false);
    this.billsService.getTemplateData(this.id).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.templateCreationForm.patchValue(res.body);
        this.billTemplateMaster = res.body;
        if (res.body.otherEmails) {
          this.vendorOtherEmails = res.body.otherEmails;
          if (res.body.otherEmails.length > 0) {
            this.isFloating = true;
          }
        }
        if (this.attachmentId) {
          this.templateCreationForm.get(AppFormConstants.ATTACHMENT).patchValue(res.body.templateName + '.pdf');
        }
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get term list
   */
  getTermList() {
    this.billsService.getTermsList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.termList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for get vendor list for dropdown
   */
  getVendorList() {
    this.billsService.getVendorList(!this.editView).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.vendorList.data = res.body;
        if (this.privilegeService.isAuthorized(AppAuthorities.VENDORS_CREATE)) {
          this.vendorList.addNew();
        }
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to change vendor list
   */
  changeVendorList(id) {
    try {
      if (id === 0) {
        this.addNewVendor = true;
        setTimeout(() => {
          this.templateCreationForm.controls.vendorId.reset();
        }, 100);
      } else if (id != null) {
      }
    } catch (error) {
    }
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
   * this method emit close event
   */

  closeSideDrawer() {
    this.closeTemplateCreateView.emit(true);
  }

  /**
   * this method can be used to create new template
   */
  createBillTemplate() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.CREATE_BILL_TEMPLATE,
      AppAnalyticsConstants.MODULE_NAME_BILL_TEMPLATES ,
      AppAnalyticsConstants.CREATE_BILL_TEMPLATE,
      AppAnalyticsConstants.CREATE_SCREEN
    );
    this.btnLoading = true;
    this.billTemplateMaster.otherEmails = this.vendorOtherEmails;
    this.billTemplateMaster = Object.assign(this.billTemplateMaster, this.templateCreationForm.value);
    if (!this.templateCreationForm.valid || !this.isValidDate) {
      this.btnLoading = false;
      new CommonUtility().validateForm(this.templateCreationForm);
      return;
    }

    if (this.editView) {
      this.updateTemplate();
      return;
    }
    if (!this.isValidEmail) {
      this.btnLoading = false;
      return;
    }
    this.templateCreationForm.get('attachmentUpdated').patchValue(null);
    if (this.fromTemplateManagement) {
      this.createBillTemplateFromManagement();
    } else {
      this.createTemplateFromBill();
    }

  }

  /**
   * Create template if this screen is opened from ocr template screen
   */
  createBillTemplateFromManagement() {
    this.billSubmitService.createBillTemplateFromManagement(this.billTemplateMaster).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_CREATED === res.status) {
        this.notificationService.successMessage(HttpResponseMessage.BILL_TEMPLATE_CREATED_SUCCESSFULLY);
        this.templateCreationForm.reset();
        this.closeSideDrawer();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.btnLoading = false;
    }, error => {
      this.btnLoading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Create a template if this screen is opened from bill process
   */
  createTemplateFromBill() {
    this.billSubmitService.createBillTemplate(this.billTemplateMaster).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_CREATED === res.status) {
        this.notificationService.successMessage(HttpResponseMessage.BILL_TEMPLATE_CREATED_SUCCESSFULLY);
        this.templateCreationForm.reset();
        this.closeSideDrawer();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.btnLoading = false;
    }, error => {
      this.btnLoading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Update template
   */
  updateTemplate() {
    if (!this.billTemplateMaster.attachmentUpdated) {
      this.billTemplateMaster.attachment = null;
    }
    this.billTemplateMaster.updateOn = null;
    this.billTemplateMaster.createdOn = null;
    this.billTemplateMaster.createdBy = null;
    this.billTemplateMaster.updateBy = null;
    this.billSubmitService.updateBillTemplate(this.billTemplateMaster).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
        this.editSuccessEmitter.emit();
        this.notificationService.successMessage(HttpResponseMessage.BILL_TEMPLATE_UPDATED_SUCCESSFULLY);
        this.templateCreationForm.reset();
        this.closeSideDrawer();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.btnLoading = false;
    }, error => {
      this.notificationService.errorMessage(error);
      this.btnLoading = false;
    });
  }

  /**
   * This method use for generate po receipt attachemnt url
   * @param isDownload boolean
   * * @param id to id
   */
  generateBillUrl(isDownload: boolean) {
    if ((this.fromTemplateManagement || this.detailView) && this.id !== null) {
      this.getAttachment(isDownload, this.id);
    } else if (this.attachmentId !== null) {
      this.getAttachmentFromBill(isDownload, this.attachmentId);
    }
  }

  getAttachment(isDownload, id) {
    if (!id){
      id = AppConstant.ZERO;
    }
    this.billSubmitService.getOCRTemplateAttachment(id).subscribe(res => {
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
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  getAttachmentFromBill(isDownload, id) {
    let tenantId;
    if (this.tenantId) {
      tenantId = this.tenantId;
    } else {
      const sessionUser = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));
      tenantId = sessionUser.tenantId;
    }
    this.billSubmitService.getOCRTemplateAttachmentFromBillInvoice(id, tenantId).subscribe(res => {
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
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  changeFileInput(event: any, field, fileTypes) {
    field.get(AppConstant.ATTACHMENT).reset();
    let isAllowedToUpload = false;
    if (!event.target.files[0]) {
      this.clearFieldsAndValues();
      this.billUrl = null;
      return;
    } else {
      const changeFileTypes: string [] = event.target.files[0].type.split(AppConstant.FORWARD_SLASH_STRING);
      const fileTypesArray: string [] = fileTypes.split(AppConstant.COMMA_STRING);

      for (let i = 0; i < fileTypesArray.length; i++) {
        const slittedSlash = fileTypesArray[i].split(AppConstant.FORWARD_SLASH_STRING);
        if (fileTypesArray[i] === event.target.files[0].type) {
          isAllowedToUpload = true;
          break;
        } else if (slittedSlash[0] === changeFileTypes[0]) {
          if (slittedSlash[1] === AppConstant.STAR_STRING) {
            isAllowedToUpload = true;
            break;
          }
        }
      }

      if (isAllowedToUpload) {
        const targetFile = event.target.files[0];

        if ((event.target.files[0].size / 1024 / 1024) > AppConstant.COMMON_FILE_SIZE) {
          setTimeout(() => {
            this.clearFieldsAndValues();
            this.billUrl = null;
            field.get(AppConstant.ATTACHMENT).reset();
          }, 100);
          return this.notificationService.infoMessage(CommonMessage.INVALID_FILE_SIZE);
        }

        field.patchValue({
          attachment: targetFile
        });
        this.billUrl = null;
        this.generateAttachment(event.target.files[0]);
      } else {
        setTimeout(() => {
          this.clearFieldsAndValues();
          this.billUrl = null;
          field.get(AppConstant.ATTACHMENT).reset();
        }, 100);
        return this.notificationService.infoMessage(CommonMessage.ADDITIONAL_FIELD_INVALID_FILE_TYPE);
      }
    }
  }

  generateAttachment(file) {
    this.templateCreationForm.get('attachmentUpdated').patchValue(true);
    this.clearFieldsAndValues();
    this.billUrl = window.URL.createObjectURL(file);
  }

  /**
   * Clear fields and data on attachment change
   */
  clearFieldsAndValues() {
    const billId = this.billTemplateMaster.billId;
    this.billTemplateMaster = new TemplateMstDto();
    this.billTemplateMaster.billId = billId;
    this.templateCreationForm.get(AppFormConstants.PO_NUMBER).reset();
    this.templateCreationForm.get(AppFormConstants.BILL_NO).reset();
    this.templateCreationForm.get(AppFormConstants.BILL_AMOUNT).reset();
    this.templateCreationForm.get(AppFormConstants.BILL_DATE_STR).reset();
    this.templateCreationForm.get(AppFormConstants.BILL_DATE_FORMAT).reset();
    this.isValidDate = true;
  }

  /**
   * this method can be used to get file name
   * @param fileUpload string
   * @param i
   */
  fileUploadClick(fileUpload) {
    document.getElementById(fileUpload).click();
  }

  /**
   * This method will get trigger when a user leave a template field
   * @param fieldName that leave
   */
  public onFieldBlur(fieldName) {
    this.leaveField = fieldName;
  }

  copyValuesFromInvoice() {

    if (AppFormConstants.PO_NUMBER !== this.leaveField && AppFormConstants.BILL_NO !== this.leaveField
      && AppFormConstants.BILL_DATE_STR !== this.leaveField && AppFormConstants.BILL_AMOUNT !== this.leaveField) {
      return;
    }

    let selectedVal = window.getSelection().toString().trim();

    if (AppFormConstants.PO_NUMBER === this.leaveField) {
      this.templateCreationForm.get(AppFormConstants.PO_NUMBER).patchValue(selectedVal);
      this.index0 = true;

    } else if (AppFormConstants.BILL_NO === this.leaveField) {
      this.templateCreationForm.get(AppFormConstants.BILL_NO).patchValue(selectedVal);
      this.index1 = true;

    } else if (AppFormConstants.BILL_DATE_STR === this.leaveField) {
      this.templateCreationForm.get(AppFormConstants.BILL_DATE_STR).patchValue(selectedVal);
      this.index2 = true;

    } else {
      selectedVal = selectedVal.replace(AppConstant.COMMA_STRING, AppConstant.EMPTY_STRING);
      selectedVal = selectedVal.replace(AppConstant.COMMA_STRING, AppConstant.EMPTY_STRING);
      selectedVal = selectedVal.replace(AppConstant.COMMA_STRING, AppConstant.EMPTY_STRING);
      if (isNaN(parseFloat(selectedVal.replace(AppConstant.COMMA_STRING, AppConstant.EMPTY_STRING))) ||
        isNaN(Number(selectedVal.replace(AppConstant.COMMA_STRING, AppConstant.EMPTY_STRING)))) {
        return;
      }
      this.templateCreationForm.get(AppFormConstants.BILL_AMOUNT).patchValue(selectedVal.replace(AppConstant.COMMA_STRING, AppConstant.EMPTY_STRING));
      this.index3 = true;
    }

    const element = document.createElement('span');
    window.getSelection().getRangeAt(0).cloneRange().insertNode(element);

    const textLayer = document.getElementsByClassName('textLayer');
    let page = 0;

    for (const index in textLayer) {
      if (textLayer[index].contains(element)) {
        page = Number(index);
        element.remove();
        break;
      }
    }

    let x = window.getSelection().getRangeAt(0).getClientRects()[0].left - textLayer[0].getBoundingClientRect().left;
    let y = window.getSelection().getRangeAt(0).getClientRects()[0].top - textLayer[0].getBoundingClientRect().top;

    x = (x / 5) * 3;
    y = (y / 5) * 3;

    let height = window.getSelection().getRangeAt(0).cloneRange().getBoundingClientRect().height;
    let width = window.getSelection().getRangeAt(0).cloneRange().getBoundingClientRect().width;

    height = (height / 5) * 3;
    width = (width / 5) * 3;

    if (AppFormConstants.PO_NUMBER === this.leaveField) {
      this.billTemplateMaster.poNumberDimension = new BillDiamentionDto('PO_NUMBER', page, x - 4, y, width, height);
    } else if (AppFormConstants.BILL_NO === this.leaveField) {
      this.billTemplateMaster.billNumberDimension = new BillDiamentionDto('NO', page, x - 4, y, width, height);
    } else if (AppFormConstants.BILL_DATE_STR === this.leaveField) {
      this.billTemplateMaster.billDateDimension = new BillDiamentionDto('DATE', page, x - 4, y, (width + 2), height);
    } else {
      this.billTemplateMaster.billAmountDimension = new BillDiamentionDto('AMOUNT', page, x - 4, y, width, height);
    }
  }

  /**
   * This method can used to validate the date against the date format
   */
  validateDate() {
    const billDate = this.templateCreationForm.get(AppFormConstants.BILL_DATE_STR).value;
    if (!billDate) {
      return;
    }
    const billDateFormat = this.templateCreationForm.get(AppFormConstants.BILL_DATE_FORMAT).value;
    if (!billDateFormat) {
      return;
    }
    this.billSubmitService.validWithFormat(billDate, billDateFormat).subscribe((res: any) => {
      this.isValidDate = res.body;
    });
  }

  /**
   * Reset form
   */
  reset() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.MODULE_NAME_BILL_TEMPLATES ,
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.CREATE_SCREEN
    );
    this.templateCreationForm.reset();
    this.billTemplateMaster.otherEmails = [];
    this.vendorOtherEmails = [];
    this.isValidEmail = true;
    this.isValidDate = true;
    this.billUrl = false;
    try {
      this.attachment.nativeElement.value = '';
    } catch (e) {
    }
    this.getTemplateData();
  }

  /**
   * Clear Field in edit View with dimensions
   * @param formName
   */
  clearField(formName) {
    switch (formName) {
      case AppFormConstants.PO_NUMBER: {
        this.templateCreationForm.get(formName).reset();
        this.billTemplateMaster.poNumberDimension = null;
        break;
      }
      case AppFormConstants.BILL_NO: {
        this.templateCreationForm.get(formName).reset();
        this.billTemplateMaster.billNumberDimension = null;
        break;
      }
      case AppFormConstants.BILL_DATE_STR: {
        this.templateCreationForm.get(formName).reset();
        this.billTemplateMaster.billDateDimension = null;
        break;
      }
      case AppFormConstants.BILL_AMOUNT: {
        this.templateCreationForm.get(formName).reset();
        this.billTemplateMaster.billAmountDimension = null;
        break;
      }
    }

  }

  attachmentClearBtn() {
    try {
      this.attachment.nativeElement.value = '';
    } catch (e) {
    }
    this.billUrl = null;
    this.templateCreationForm.get(AppFormConstants.ATTACHMENT).reset();
    this.clearFieldsAndValues();
  }

  /**
   *this method can be used to validate email address
   **/
  validateEmail(emails: any[]) {
    emails.length === 0 ? this.isValidEmail = false : this.isValidEmail = true;
    if (emails) {
      emails.forEach(email => {
        this.isValidEmailAddress(email);
      });
    }
  }

  /**
   * this method validate email address
   * @param email to entered email
   */
  isValidEmailAddress(email) {
    const emailPattern = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    this.isValidEmail = emailPattern.test(String(email).toLowerCase());
    return this.isValidEmail;
  }

  private termChanged(data) {
    const netDays = this.templateCreationForm.get(AppFormConstants.NET_DAYS_DUE);
    if (data !== 10) {
      netDays.clearValidators();
      this.templateCreationForm.get(AppFormConstants.NET_DAYS_DUE).reset();
      this.templateCreationForm.get(AppFormConstants.DISCOUNT_PERCENTAGE).reset();
      this.templateCreationForm.get(AppFormConstants.DISCOUNT_DAYS_DUE).reset();
    } else if (data === 10) {
      netDays.clearValidators();
      netDays.reset();
      netDays.setValidators(Validators.required);
    }
  }

  /**
   * this method can be used to delete template
   */
  deleteOcr() {
    if (!this.id) {
      return;
    } else {
      this.confirmationService.confirm({
        key: 'deleteTemplateFromDetailView',
        message: 'You want to delete this template',
        accept: () => {
          this.billsService.deleteOcr(this.id).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.notificationService.successMessage(HttpResponseMessage.TEMPLATE_DELETED_SUCCESSFULLY);
              this.closeSideDrawer();
              this.deleteSuccessEmitter.emit();
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
   * this method can be used to show edit view from detail view
   */
  editTemplate() {
    this.clickEditActionEmitter.emit();
  }
}

