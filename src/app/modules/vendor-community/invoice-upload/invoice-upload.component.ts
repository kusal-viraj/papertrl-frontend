import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {BillMasterDto} from '../../../shared/dto/bill/bill-master-dto';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppConstant} from '../../../shared/utility/app-constant';
import {VendorInvoiceService} from '../../../shared/services/vendor-community/vendor-invoice.service';
import {CommonUtility} from '../../../shared/utility/common-utility';

@Component({
  selector: 'app-invoice-upload',
  templateUrl: './invoice-upload.component.html',
  styleUrls: ['./invoice-upload.component.scss']
})
export class InvoiceUploadComponent implements OnInit {
  public submitBillForm: UntypedFormGroup;
  public templateList: DropdownDto = new DropdownDto();
  public billMasterDto: BillMasterDto = new BillMasterDto();
  public files: any [] = [];
  public addNewTemplate: boolean;
  public loading = false;
  public customers: DropdownDto = new DropdownDto();

  @Output() public eventEmitter = new EventEmitter();
  @Output() public emitTemplateRelatedValues = new EventEmitter();
  @Input() billId: any;
  @Input() fromProcess: boolean;
  @Output() isClickBackButton = new EventEmitter<boolean>();
  @Output() isUploadSuccess = new EventEmitter<boolean>();

  constructor(public formBuilder: UntypedFormBuilder, public vendorInvoiceService: VendorInvoiceService,
              public notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.submitBillForm = this.formBuilder.group({
      tenantId: [AppConstant.NULL_VALUE, Validators.required],
      templateId: [],
      files: []
    });
    this.getTemplateList();
    this.getCustomerList();
    this.submitBillForm.get('tenantId').valueChanges.subscribe(data => this.changeCustomer());
  }

  /**
   * This method can be used to remove selected file
   * @param event to remove event
   */
  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  /**
   * Triggers when customer list changed and
   * check for are there any files uploaded
   */
  changeCustomer() {
    if (!this.submitBillForm.get('tenantId').value) {
      return;
    }
    if (this.files.length !== 0) {
      this.uploadFiles();
    }
  }

  /**
   * Triggers when file list changed and
   * check for is a customer is selected
   */
  changeFileList(event) {
    this.loading = true;
    this.files.push(...event.addedFiles);

    if (!this.submitBillForm.valid) {
      new CommonUtility().validateForm(this.submitBillForm);
      this.loading = false;
      return;
    }
    this.uploadFiles();
  }

  /**
   * Upload Files only if both cutomer and files are present
   */
  uploadFiles() {
    if (this.files.length === 0) {
      this.notificationService.infoMessage(HttpResponseMessage.FILE_UPLOAD_VALID);
      this.loading = false;
      return;
    } else {
      this.loading = true;
    }
    const tenantId = this.submitBillForm.get('tenantId').value;
    const template = this.submitBillForm.get('templateId').value;
    this.vendorInvoiceService.uploadInvoices(this.files, tenantId, template).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.FILE_UPLOADED_SUCCESSFULLY);
          this.submitBillForm.reset();
          this.loading = false;
          this.eventEmitter.emit(true);
          this.isUploadSuccess.emit(true);
          this.files = [];

        } else {
          this.notificationService.infoMessage(res.body.message);
          this.loading = false;
          this.files = [];
        }
      },
      error => {
        this.notificationService.errorMessage(error);
        this.loading = false;
        this.files = [];
      });
  }

  /**
   * Get Customer List
   */
  getCustomerList() {
    this.vendorInvoiceService.getCustomerList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.customers.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get vendor related template list
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
   * this method execute change template list
   */
  changeTemplateList(id) {
    try {
      if (id === 0) {
        this.addNewTemplate = true;
        setTimeout(() => {
          this.submitBillForm.controls.templateId.reset();
        }, 100);
      }
    } catch (error) {
    }
  }

  /**
   * back to list
   */
  backToList() {
    this.isClickBackButton.emit(true);
  }
}
