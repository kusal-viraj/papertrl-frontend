import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {DataTableImportMst} from '../../../../shared/dto/data-table-import-mst/data-table-import-mst';
import {ItemService} from '../../../../shared/services/items/item.service';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {CommonUtility} from '../../../../shared/utility/common-utility';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {CommonMessage} from '../../../../shared/utility/common-message';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {VendorItemPopupService} from '../../../../shared/services/vendors/vendor-item-popup.service';
import {VendorItemDetailComponent} from '../vendor-item-detail/vendor-item-detail.component';
import {DropdownDto} from '../../../../shared/dto/common/dropDown/dropdown-dto';
import {VendorItemListComponent} from '../vendor-item-list/vendor-item-list.component';
import {isNotNullOrUndefined} from 'codelyzer/util/isNotNullOrUndefined';


@Component({
  selector: 'app-vendor-item-upload',
  templateUrl: './vendor-item-upload.component.html',
  styleUrls: ['./vendor-item-upload.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class VendorItemUploadComponent implements OnInit, OnDestroy {

  public uploadVendorItemForm: UntypedFormGroup;
  public dataTableImportMst: DataTableImportMst = new DataTableImportMst();
  public files: any[] = [];
  uuid: any;
  timeInterval: any;
  responsePercentage: any;
  loading: false;
  isViewErrorContent = false;

  public isDisabled = false;
  @Output() successEmitter = new EventEmitter();
  @Input() vendorId: any;
  @Input() vendorName: any;
  @ViewChild('vendorItemDetailComponent') vendorItemDetailComponent: VendorItemDetailComponent;
  @ViewChild('vendorItemList') vendorItemList: VendorItemListComponent;
  public response: any;
  public itemTypeId: any;
  public itemTypePreviousId: any;
  public tempUploadResponse: any;
  public viewItemDetailPopUp = false;
  public itemTypeList = new DropdownDto();

  constructor(public formBuilder: UntypedFormBuilder, public itemService: ItemService, public notificationService: NotificationService,
              public messageService: MessageService, public vendorItemPopupService: VendorItemPopupService,
              public confirmationService: ConfirmationService) {
    this.uploadVendorItemForm = this.formBuilder.group({
      itemListController: [null, Validators.required],
      file: [],
      itemTypeId: [1, Validators.required],
      vendorId: [null]
    });
    this.itemTypeId = 1;
  }


  ngOnInit(): void {
    this.getItemTypes();
  }

  /**
   * This method can be used to upload vendor Item list
   */
  uploadItemList() {
    this.isDisabled = true;
    this.responsePercentage = null;
    this.uploadVendorItemForm.get('vendorId').patchValue(this.vendorId);
    if (this.uploadVendorItemForm.valid) {
      this.itemService.uploadVendorItemItemList(this.uploadVendorItemForm.value).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.dataTableImportMst = res.body;
          this.uuid = res.body.uuid;
          this.timeInterval = setInterval(() => {
            this.getUploadedPercentage();
          }, 1000);
          this.uploadVendorItemForm.reset();
        } else {
          this.isDisabled = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.isDisabled = false;
        this.notificationService.errorMessage(error);
      });
    } else {
      this.isDisabled = false;
      new CommonUtility().validateForm(this.uploadVendorItemForm);
    }
  }

  /**
   * this method can be used to download item template
   */
  downloadItemUploadTemplate() {
    this.itemService.downloadVendorItemFileFormat().subscribe(res => {
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'paperTrl_vendor_item_upload_template');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    }, error => {
      this.notificationService.errorMessage(error);
    }, () => {
      this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
    });
  }

  /**
   * this method can be used to get uploaded percentage
   */
  getUploadedPercentage() {
    this.itemService.getUploadedPercentage(this.uuid).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.responsePercentage = res.body;
        this.responsePercentage = Math.floor(this.responsePercentage);
        if (this.responsePercentage === 100.0) {
          clearInterval(this.timeInterval);
          setTimeout(() => {
            this.getUploadIssues();
          }, 1000);
        }
      } else {
        clearInterval(this.timeInterval);
        this.isDisabled = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      clearInterval(this.timeInterval);
      this.isDisabled = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get upload issues
   */
  getUploadIssues() {
    this.itemService.getUploadedFileIssue(this.uuid).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.isDisabled = false;
        this.responsePercentage = 0;
        if (res.body) {
          this.response = {};
          res.body.itemVendorWiseList = res.body?.notMappedVendorItems;
          this.tempUploadResponse = JSON.stringify(res.body);
          this.response = res.body;
          this.itemTypeId = this.itemTypePreviousId || 1;
          this.uploadVendorItemForm.get('itemTypeId').patchValue(this.itemTypeId);
        }
      } else {
        this.isDisabled = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.isDisabled = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * when leave component clear time interval
   */
  ngOnDestroy() {
    clearInterval(this.timeInterval);
  }

  /**
   * This method can be used to patched file to form controller
   * @param event to files array
   */
  changeFileList(event) {
    if (!event.target.files[0]) {
      new CommonUtility().validateForm(this.uploadVendorItemForm);
      return;
    }

    if ((event.target.files[0].size / 1024 / 1024) > AppConstant.COMMON_FILE_SIZE) {
      setTimeout(() => {
        this.uploadVendorItemForm.reset();
      }, 100);
      return this.notificationService.infoMessage(CommonMessage.INVALID_FILE_SIZE);
    }

    const targetFile = event.target.files[0];
    this.uploadVendorItemForm.patchValue({
      file: targetFile
    });
  }


  /**
   * get item types
   */
  getItemTypes() {
    this.itemService.getItemType().subscribe((res: any) => {
      this.itemTypeList.data = (res);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method can be used to patch type id to itemTypeId
   * @param id to itemTypeId
   */
  itemTypeChange(id) {
    this.itemTypePreviousId = id;
    this.changeItemType(id);
  }

  /**
   * This method can be used to refresh vendor list
   */
  refreshList() {
    this.itemService.successfullyMappedVendorItem.next(true);
  }

  /**'
   * this method can be used to validate unsaved changes
   */
  changeItemType(id) {
    if (isNotNullOrUndefined(this.response) && this.response.itemVendorWiseList?.length > 0) {
      this.confirmationService.confirm({
        message: 'Please note that any unsaved changes will be lost if you change Item Types.',
        key: 'itemTypeChangeKey',
        accept: () => {
          this.response = null;
          this.uploadVendorItemForm.get('itemTypeId').patchValue(id);
          this.itemTypeId = id;
        },
        reject: () => {
          this.uploadVendorItemForm.get('itemTypeId').patchValue(this.itemTypeId);
        }
      });
    }
  }
}
