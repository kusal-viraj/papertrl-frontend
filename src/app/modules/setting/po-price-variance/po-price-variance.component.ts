import {Component, Input, OnInit, Output, EventEmitter, HostListener} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {DropdownDto} from "../../../shared/dto/common/dropDown/dropdown-dto";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {PoService} from "../../../shared/services/po/po.service";
import {PoPriceVarianceService} from "../../../shared/services/settings/po-price-variance/po-price-variance.service";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {AppConstant} from "../../../shared/utility/app-constant";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {ConfirmationService} from "primeng/api";
import {ManageFeatureService} from "../../../shared/services/settings/manage-feature/manage-feature.service";
import {BillsService} from '../../../shared/services/bills/bills.service';

@Component({
  selector: 'app-po-price-variance',
  templateUrl: './po-price-variance.component.html',
  styleUrls: ['./po-price-variance.component.scss']
})
export class PoPriceVarianceComponent implements OnInit {

  public poPriceConfigurationForm: UntypedFormGroup;
  public vendorList: DropdownDto = new DropdownDto();
  public criteriaList: DropdownDto = new DropdownDto();
  public appConstant = new AppConstant();

  isLoading = false;
  isUpdating = false;
  isVendorExist = false;
  percentage: any;
  addVendorPanel = false;
  inputNumber: any;

  @Input() isEditPoNumberPriceConfiguration = false;
  @Input() poVendorPriceId: any;
  @Output() refreshTable = new EventEmitter();

  @Input() panel: boolean;


  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService, public manageFeatureService: ManageFeatureService,
              public poService: PoService, public poPriceVariance: PoPriceVarianceService, public confirmationService: ConfirmationService,
              public billsService: BillsService) {
  }

  ngOnInit(): void {
    this.initializeFormGroup();
    this.getVendorList();
    this.getFeatureStatus();
    this.criteriaList.data = [
      {name: AppConstant.FIXED_AMOUNT_STR, percentage: false},
      {name: AppConstant.PERCENTAGE_STR, percentage: true}
    ];

    if (this.isEditPoNumberPriceConfiguration) {
      this.getPoPriceVarianceDetail();
    }
  }

  /**
   * this method can be used to initialize form group
   */
  initializeFormGroup(){
    this.poPriceConfigurationForm = this.formBuilder.group({
      id: [AppConstant.NULL_VALUE],
      vendorId: [AppConstant.NULL_VALUE, Validators.required],
      percentage: [AppConstant.NULL_VALUE, Validators.required],
      priceVariance: [AppConstant.NULL_VALUE, Validators.required],
    });
  }

  /**
   * This method use for get vendor list for dropdown
   */
  getVendorList() {
    this.billsService.getVendorList(!this.isEditPoNumberPriceConfiguration).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.vendorList.data = res.body;
        this.vendorList.addAll();
        this.vendorList.addNewWithAddAll();
      }
      if (this.isEditPoNumberPriceConfiguration) {
        return;
      } else {
        setTimeout(() => {
          this.checkVendorIsExist(this.vendorList.data[AppConstant.ONE].id);
          this.poPriceConfigurationForm.get(AppConstant.VENDOR_ID_CONTROLLER).patchValue(this.vendorList.data[AppConstant.ONE].id);
        }, AppConstant.DATA_PATCH_TIME_OUT);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can used before trigger create po price variance check vendor has a configuration an
   * pop up to user to override configuration
   */
  checkWhetherVendorHasConfiguration() {
    if (!this.poPriceConfigurationForm.valid) {
      new CommonUtility().validateForm(this.poPriceConfigurationForm);
    } else {
      if (this.isVendorExist) {
        this.confirmationService.confirm({
          message: 'There is a variance allowance already configured.<br> <br>' +
            'Saving will override the existing configuration.',
          key: AppConstant.PO_PRICE_VARIANCE_KEY_FOR_CHECK_EXIST,
          accept: () => {
            this.createPoPriceVariance();
          }
        });
      } else {
        this.createPoPriceVariance();
      }
    }
  }


  /**
   * this method can be used for create po price variance
   */
  createPoPriceVariance() {
    this.isLoading = true;
    this.poPriceVariance.createPoPriceVariance(this.poPriceConfigurationForm.value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.PO_PRICE_VARIANCE_SAVED_SUCCESSFULLY);
        this.isLoading = false;
        this.resetPoPriceVarianceForm();
        this.refreshTable.emit();
      } else {
        this.isLoading = false;
        this.notificationService.infoMessage(res.body.message);
      }

    }, error => {
      this.isLoading = false;
      this.notificationService.errorMessage(error);
    });

  }

  /**
   * this method can be used for create po price variance
   */
  updatePoPriceVariance() {
    this.isUpdating = true;
    if (this.poPriceConfigurationForm.valid) {

      this.poPriceVariance.updatePoPriceVariance(this.poPriceConfigurationForm.value).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.isUpdating = false;
          this.notificationService.successMessage(HttpResponseMessage.PO_PRICE_VARIANCE_UPDATED_SUCCESSFULLY);
          this.refreshTable.emit();
        } else {
          this.isUpdating = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.isUpdating = false;
        this.notificationService.errorMessage(error);
      });

    } else {
      this.isUpdating = false;
      new CommonUtility().validateForm(this.poPriceConfigurationForm);
    }
  }

  /**
   * this method can be used for validate field according to the type selection
   */
  validateField() {
    this.poPriceConfigurationForm.get(AppConstant.PO_PRICE_VARIANCE_CONTROLLER).reset();
    this.poPriceConfigurationForm.get(AppConstant.PO_PRICE_VARIANCE_CONTROLLER).updateValueAndValidity();
  }

  /**
   * this method can be used to get po price variance details
   */
  getPoPriceVarianceDetail() {
    this.poPriceVariance.getPoPriceVariance(this.poVendorPriceId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.poPriceConfigurationForm.patchValue(res.body);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to reset po variance form
   */
  resetPoPriceVarianceForm() {
    if (this.isEditPoNumberPriceConfiguration) {
      this.poPriceConfigurationForm.reset();
      this.getPoPriceVarianceDetail();
    } else {
      this.poPriceConfigurationForm.reset();
      this.patchVendorListDefaultValue();
    }
  }

  /**
   * this method can be used to patch default vendor value
   */
  patchVendorListDefaultValue() {
    setTimeout(() => {
      this.checkVendorIsExist(this.vendorList.data[AppConstant.ONE].id);
      this.poPriceConfigurationForm.get(AppConstant.VENDOR_ID_CONTROLLER).patchValue(this.vendorList.data[AppConstant.ONE].id);
    }, AppConstant.DATA_PATCH_TIME_OUT);
  }

  /**
   * this method can be used to check already vendor has an configuration
   * @param event to change event
   */
  vendorChange(event: any) {
    if (event.value === -1) {
      this.addVendorPanel = true;
      this.poPriceConfigurationForm.get(AppConstant.VENDOR_ID_CONTROLLER).reset();
      return;
    }
    if (this.isEditPoNumberPriceConfiguration) {
      return;
    }
    if (event.value) {
      this.checkVendorIsExist(event.value);
    } else {
      this.isVendorExist = false;
    }
  }

  /**
   * this method can be used to check already vendor has an configuration
   * @param vendorId to selected vendor id
   */
  checkVendorIsExist(vendorId) {
    this.poPriceVariance.isVendorExists(vendorId).then((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.isVendorExist = res.body;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }).catch((error) => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get feature status
   */
  getFeatureStatus() {
    this.manageFeatureService.serveToggleStatus.subscribe(featureStatus => {
      if (featureStatus !== null) {
        this.getVendorList();
      }
    });
  }
}
