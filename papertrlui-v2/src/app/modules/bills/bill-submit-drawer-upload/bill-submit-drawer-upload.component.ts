import {Component, OnInit, EventEmitter, Output, Input} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {BillSubmitService} from '../../../shared/services/bills/bill-submit.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {BillMasterDto} from '../../../shared/dto/bill/bill-master-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';

@Component({
  selector: 'app-bill-submit-drawer-upload',
  templateUrl: './bill-submit-drawer-upload.component.html',
  styleUrls: ['./bill-submit-drawer-upload.component.scss']
})
export class BillSubmitDrawerUploadComponent implements OnInit {
  public submitBillForm: UntypedFormGroup;
  public vendors: DropdownDto = new DropdownDto();
  public templateList: DropdownDto = new DropdownDto();
  public billMasterDto: BillMasterDto = new BillMasterDto();
  @Output() public eventEmitter = new EventEmitter();
  @Output() public emitTemplateRelatedValues = new EventEmitter();
  @Output() isClickBackButton = new EventEmitter<boolean>();
  @Output() isUploadSuccess = new EventEmitter<boolean>();
  @Input() billId: any;
  @Input() fromProcess: boolean;
  public files: any [] = [];
  public addNewVendor: boolean;
  public addNewTemplate = false;
  public loading = false;
  public appAuthorities = AppAuthorities;

  constructor(public formBuilder: UntypedFormBuilder, public billSubmitService: BillSubmitService,
              public notificationService: NotificationService, public billsService: BillsService, public privilegeService: PrivilegeService) {
  }

  ngOnInit(): void {
    this.submitBillForm = this.formBuilder.group({
      vendorId: [],
      templateId: [],
      files: []
    });
    this.getVendorList();
  }

  /**
   * this method can be used to get vendors
   */

  /**
   * This method use for get vendor list for dropdown
   */
  getVendorList() {
    this.billsService.getVendorList(true).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.vendors.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * This method can be used to remove selected file
   * @param event to remove event
   */
  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  changeFileList(event) {
    this.loading = true;
    this.files.push(...event.addedFiles);
    const vendorId = this.submitBillForm.get('vendorId').value;
    const template = this.submitBillForm.get('templateId').value;
    if (this.files.length === 0) {
      this.notificationService.infoMessage(HttpResponseMessage.FILE_UPLOAD_VALID);
      this.loading = false;
      return;
    }
    this.billsService.uploadBills(this.files, vendorId, template).subscribe((res: any) => {
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

  /*
  <------------------------------Vendor related functions ----------------------------->
   */

  /**
   * This method can used to load template select by vendor id
   */
  onVendorSelect(venId) {
    this.billMasterDto = this.submitBillForm.value;
    if (this.billMasterDto.vendorId) {
      this.getVendorRelatedTemplateList(venId);
      this.billMasterDto.poId = undefined;
    }
  }

  /**
   * this method can be used to get vendor related template list
   */

  getVendorRelatedTemplateList(venId) {
    if (venId != null) {
      this.billSubmitService.getTemplateListByVendorId(venId, true).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.templateList.data = res.body;
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  /*
  <------------------------------Add new functions ----------------------------->
   */

  /**
   * this method can be used to vendor list changes
   */
  changeVendorList(id) {
    try {
      if (id === 0) {
        this.addNewTemplate = false;
        this.addNewVendor = true;
        setTimeout(() => {
          this.submitBillForm.controls.vendorId.reset();
        }, 100);
      }
    } catch (error) {
    }

    if (this.submitBillForm.get('vendorId').value === null) {
      this.submitBillForm.get('templateId').reset();
      this.templateList.data = [];
    }
  }

  /**
   * this method execute change template list
   */

  changeTemplateList(id) {
    try {
      if (id === 0) {
        this.addNewTemplate = true;
        this.addNewVendor = false;
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
