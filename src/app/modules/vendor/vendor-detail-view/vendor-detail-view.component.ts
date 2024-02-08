import {Component, Input, OnInit} from '@angular/core';
import {VendorMasterDto} from '../../../shared/dto/vendor/vendor-master-dto';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {VendorAdditionalFieldAttachments} from '../../../shared/dto/vendor/vendor-additional-field-attachments';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppConstant} from '../../../shared/utility/app-constant';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {VendorService} from '../../../shared/services/vendors/vendor.service';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {DetailViewService} from '../../../shared/helpers/detail-view.service';
import {DynamicDialogConfig} from 'primeng/dynamicdialog';

@Component({
  selector: 'app-vendor-detail-view',
  templateUrl: './vendor-detail-view.component.html',
  styleUrls: ['./vendor-detail-view.component.scss']
})
export class VendorDetailViewComponent implements OnInit {

  @Input() fromReadMore = false;
  @Input() venId: any;
  public vendor: VendorMasterDto = new VendorMasterDto();
  public additionalData: AdditionalFieldDetailDto[];
  public additionalDataBasicInfo: AdditionalFieldDetailDto[] = [];
  public additionalDataPostalAddress: AdditionalFieldDetailDto[] = [];
  public additionalDataRemitAddress: AdditionalFieldDetailDto[] = [];
  public additionalDataW9Info: AdditionalFieldDetailDto[] = [];
  public additionalDataPaymentInfo: AdditionalFieldDetailDto[] = [];
  public vendorAdditionalFieldAttachment: VendorAdditionalFieldAttachments [] = [];
  public vendorInformationForm: UntypedFormGroup;
  public commonUtil: CommonUtility = new CommonUtility();
  public appConstant = new AppConstant();
  public loading = false;
  public appAuthorities = AppAuthorities;
  public taxClassifications = [];
  public vendorClassifications = [];


  constructor(public vendorService: VendorService, public additionalFieldService: AdditionalFieldService,
              public notificationService: NotificationService, public formBuilder: UntypedFormBuilder,
              public privilegeService: PrivilegeService, public config: DynamicDialogConfig,
              public detailViewService: DetailViewService) {
  }

  ngOnInit(): void {
    if (this.config?.data) {
      this.venId = this.config.data.id;
    }
    this.vendorInformationForm = this.formBuilder.group({
      additionalDataBasicInfo: this.formBuilder.array([]),
      additionalDataPostalAddress: this.formBuilder.array([]),
      additionalDataRemitAddress: this.formBuilder.array([]),
      additionalDataW9Info: this.formBuilder.array([]),
      additionalDataPaymentInfo: this.formBuilder.array([]),
    });

    this.init();
  }

  async init(venId?) {
    if (venId) {
      this.venId = venId;
    } else if (this.fromReadMore) {
      return;
    }

    await this.getTaxClassifications();
    await this.getClassificationList();
    this.vendorService.getVendor(this.venId, true).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.getModuleReheatedAdditionalField(AppDocumentType.VENDOR, true).then(() => {
          this.resetFields();
          this.patchDropDownAdditionalData(res.body);
          this.vendor = res.body;
          const taxId = this.vendor.taxClassification;
          if (taxId) {
            this.vendor.taxClassification = this.taxClassifications.find((value) => value.id == taxId).name;
          }
          if (this.vendor.classificationIdList) {
            const tempArr = [];
            this.vendor.classificationIdList.forEach(val => {
              tempArr.push(this.vendorClassifications.find(r => r.id == val).name);
            });
            this.vendor.classificationIdList = tempArr;
          }
          this.vendorInformationForm.patchValue(this.vendor);
        });
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    });
  }

  resetFields() {
    this.vendor = new VendorMasterDto();
    this.vendorInformationForm.reset();
    this.vendorAdditionalDataArrayInBasicInformation.clear();
    this.vendorAdditionalDataArrayInPostalAddress.clear();
    this.vendorAdditionalDataArrayInRemitAddress.clear();
    this.vendorAdditionalDataArrayInW9Form.clear();
    this.vendorAdditionalDataArrayInPaymentInformation.clear();
    this.vendorInformationForm = this.formBuilder.group({
      additionalDataBasicInfo: this.formBuilder.array([]),
      additionalDataPostalAddress: this.formBuilder.array([]),
      additionalDataRemitAddress: this.formBuilder.array([]),
      additionalDataW9Info: this.formBuilder.array([]),
      additionalDataPaymentInfo: this.formBuilder.array([]),
    });

    this.additionalData = [];
    this.additionalDataBasicInfo = [];
    this.additionalDataPostalAddress = [];
    this.additionalDataRemitAddress = [];
    this.additionalDataW9Info = [];
    this.additionalDataPaymentInfo = [];
    this.vendorAdditionalFieldAttachment = [];
  }

  /**
   * This method use for get tax classification list for dropdown
   */
  getTaxClassifications() {
    return new Promise<void>(resolve => {
      this.vendorService.getTaxClassifications().subscribe((res) => {
        this.taxClassifications = (res.body);
        resolve();
      }, error => {
        resolve();
        this.notificationService.errorMessage(error);
      });
    });
  }


  /**
   * This method use for get vendor classification list for dropdown
   */
  getClassificationList() {
    return new Promise<void>(resolve => {
      this.vendorService.getClassificationList().subscribe((res) => {
        this.vendorClassifications = (res.body);
        resolve();
      }, error => {
        resolve();
        this.notificationService.errorMessage(error);
      });
    });
  }

  /**
   * this method can be used to patch additional field dropdown values
   * @param res to response body
   */
  patchDropDownAdditionalData(res) {
    res.additionalDataBasicInfo =
      this.commonUtil.alignHeadingAdditionalData(this.additionalDataBasicInfo, res.additionalDataBasicInfo);
    res.additionalDataPostalAddress =
      this.commonUtil.alignHeadingAdditionalData(this.additionalDataPostalAddress, res.additionalDataPostalAddress);
    res.additionalDataRemitAddress =
      this.commonUtil.alignHeadingAdditionalData(this.additionalDataRemitAddress, res.additionalDataRemitAddress);
    res.additionalDataW9Info =
      this.commonUtil.alignHeadingAdditionalData(this.additionalDataW9Info, res.additionalDataW9Info);
    res.additionalDataPaymentInfo =
      this.commonUtil.alignHeadingAdditionalData(this.additionalDataPaymentInfo, res.additionalDataPaymentInfo);

    res.additionalFieldAttachments?.forEach((value) => {
      this.addFilesToArray(value, null, null);
    });

    res.classificationAttachment?.forEach((value) => {
      this.addFilesToArray(value.id, value.fileName, this.appConstant.CLASSIFICATION_FIELD_NAME);
    });

    if (res.w9Attachment) {
      res.w9Attachment.forEach((value) => {
        this.addFilesToArray(value.id, value.fileName, this.appConstant.VENDOR_W9_FORM_STRING_NAME);
      });
    }
  }

  /**
   * Add all the files into single array
   */
  addFilesToArray(idOrObj, fileName, fieldName) {
    if (fileName) {
      const vpAttachment = new VendorAdditionalFieldAttachments();
      vpAttachment.id = idOrObj;
      vpAttachment.fileName = fileName;
      vpAttachment.fieldName = fieldName;
      this.vendorAdditionalFieldAttachment.push(vpAttachment);
    } else {
      this.vendorAdditionalFieldAttachment.push(idOrObj);
    }
  }

  /**
   * this method can be used to download attachment
   * @param val to attachment object
   */
  downloadVendorAttachment(val) {
    val.loading = true;
    if (val.fieldName === this.appConstant.CLASSIFICATION_FIELD_NAME) {
      this.downloadClassificationAttachment(val);
    } else if (val.fieldName === this.appConstant.VENDOR_W9_FORM_STRING_NAME) {
      this.downloadW9Form(val);
    } else {
      this.downloadAttachments(val);
    }
  }

  downloadClassificationAttachment(val: any) {
    this.vendorService.downloadClassification(val.id).subscribe((res: any) => {
      if (res.result.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      } else {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', val.fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
      }
      val.loading = false;
    }, error => {
      this.notificationService.errorMessage(error);
      val.loading = false;
    }, () => {
      val.loading = false;
    });
  }

  /**
   * this method can be used to download additional fields
   * @param val
   */
  downloadW9Form(val) {
    this.vendorService.downloadW9Form(val.id).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', val.fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
      val.loading = false;
    }, error => {
      val.loading = false;
      this.notificationService.errorMessage(error);
    }, () => {
      val.loading = false;
    });
  }

  /*
---------------------------------------------------ADDITIONAL ATTACHMENT SECTION-------------------------------------------------------->
 */
  downloadAttachments(val) {
    this.vendorService.downloadAdditionalAttachment(val.id).subscribe((res: any) => {
      if (res.result.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      } else {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', val.fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
      }
      val.loading = false;
    }, error => {
      val.loading = false;
      this.notificationService.errorMessage(error);
    }, () => {
      val.loading = false;
    });
  }


  /**
   * This method use for add additional fields to po creation
   */
  getModuleReheatedAdditionalField(id, isDetailView) {
    return new Promise<void>(resolve => {
      this.additionalFieldService.getAdditionalField(id, isDetailView, false).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.additionalData = res.body;
          this.additionalData.forEach(((field) => {
            this.commonUtil.manageDropDownData(field, isDetailView);
            if (field.sectionId === AppModuleSection.VENDOR_BASIC_INFO_SECTION && field.status !== AppConstant.STATUS_DELETE) {
              this.addAdditionalDataForBasicInfo(field);
            }
            if (field.sectionId === AppModuleSection.POSTAL_ADDRESS_SECTION && field.status !== AppConstant.STATUS_DELETE) {
              this.addAdditionalDataForPostalAddress(field);
            }
            if (field.sectionId === AppModuleSection.REMIT_ADDRESS_SECTION && field.status !== AppConstant.STATUS_DELETE) {
              this.addAdditionalDataForRemitAddress(field);
            }
            if (field.sectionId === AppModuleSection.W9_INFO_SECTION && field.status !== AppConstant.STATUS_DELETE) {
              this.addAdditionalDataForW9Info(field);
            }
            if (field.sectionId === AppModuleSection.VENDOR_PAYMENT_INFO_SECTION && field.status !== AppConstant.STATUS_DELETE) {
              this.addAdditionalDataForPaymentInfo(field);
            }
          }));
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        resolve();
      }, error => {
        resolve();
        this.notificationService.errorMessage(error);
      });
    });

  }

  /**
   * add fields to basic info section
   * @param field AdditionalFieldDetailDto
   */
  public addAdditionalDataForBasicInfo(field: AdditionalFieldDetailDto) {
    const fieldExists = this.additionalDataBasicInfo.some(existingField => {
      return existingField.id === field.id;
    });
    if (!fieldExists) {
      this.additionalDataBasicInfo.push(field);
    }
    this.vendorAdditionalDataArrayInBasicInformation.push(this.commonUtil.getAdditionalFieldValidations(field, false));
  }

  /**
   * add fields to postal address section
   * @param field AdditionalFieldDetailDto
   */
  public addAdditionalDataForPostalAddress(field: AdditionalFieldDetailDto) {
    this.additionalDataPostalAddress.push(field);
    this.vendorAdditionalDataArrayInPostalAddress.push(this.commonUtil.getAdditionalFieldValidations(field, false));
  }

  /**
   * add fields for remit address section
   * @param field AdditionalFieldDetailDto
   */
  public addAdditionalDataForRemitAddress(field: AdditionalFieldDetailDto) {
    this.additionalDataRemitAddress.push(field);
    this.vendorAdditionalDataArrayInRemitAddress.push(this.commonUtil.getAdditionalFieldValidations(field, false));
  }

  /**
   * add fields for w9 section
   * @param field AdditionalFieldDetailDto
   */
  public addAdditionalDataForW9Info(field: AdditionalFieldDetailDto) {
    this.additionalDataW9Info.push(field);
    this.vendorAdditionalDataArrayInW9Form.push(this.commonUtil.getAdditionalFieldValidations(field, false));
  }

  /**
   * add fields for payment section
   * @param field AdditionalFieldDetailDto
   */
  public addAdditionalDataForPaymentInfo(field: AdditionalFieldDetailDto) {
    this.additionalDataPaymentInfo.push(field);
    this.vendorAdditionalDataArrayInPaymentInformation.push(this.commonUtil.getAdditionalFieldValidations(field, false));
  }

  /**
   * return form array data
   */
  public get vendorAdditionalDataArrayInBasicInformation() {
    return this.vendorInformationForm.get(AppConstant.VENDOR_BASIC_INFO) as UntypedFormArray;
  }

  /**
   * return form array data
   */
  public get vendorAdditionalDataArrayInPaymentInformation() {
    return this.vendorInformationForm.get(AppConstant.VENDOR_PAYMENT_INFO) as UntypedFormArray;
  }

  /**
   * return form array data
   */
  public get vendorAdditionalDataArrayInPostalAddress() {
    return this.vendorInformationForm.get(AppConstant.VENDOR_POSTAL_ADDRESS) as UntypedFormArray;
  }

  /**
   * return form array data
   */
  public get vendorAdditionalDataArrayInRemitAddress() {
    return this.vendorInformationForm.get(AppConstant.VENDOR_REMIT_ADDRESS) as UntypedFormArray;
  }

  /**
   * return form array data
   */
  public get vendorAdditionalDataArrayInW9Form() {
    return this.vendorInformationForm.get(AppConstant.VENDOR_W9_INFO) as UntypedFormArray;
  }

  closeDrawer() {
    if (this.config?.data) {
      this.detailViewService.closeVendorDetailView();
      return;
    }
    // this.closeDrawerEmit.emit(false);
  }

  isRemitEmpty() {
    // if (this.additionalDataRemitAddress.length > 0) {
    //   return true
    // }

    if (!this.vendor.remitAddress) {
      return false;
    }
    return !!(this.vendor.remitAddress?.addressLine1 || this.vendor.remitAddress?.addressLine2 || this.vendor.remitAddress?.country
      || this.vendor.remitAddress?.zipcode || this.vendor.remitAddress?.city || this.vendor.remitAddress?.addressState);
  }
}
