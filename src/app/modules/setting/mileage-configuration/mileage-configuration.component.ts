import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {RemoveSpace} from "../../../shared/helpers/remove-space";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {MileageRateService} from "../../../shared/services/settings/mileage-rate/mileage-rate.service";
import {AppConstant} from "../../../shared/utility/app-constant";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";

@Component({
  selector: 'app-mileage-configuration',
  templateUrl: './mileage-configuration.component.html',
  styleUrls: ['./mileage-configuration.component.scss']
})
export class MileageConfigurationComponent implements OnInit {

  public mileageRateConfigurationForm: UntypedFormGroup;
  public removeSpace: RemoveSpace = new RemoveSpace();
  public vpExpenseMileageRate: any = {};
  public loading = false;

  @Output() successfullyCreated = new EventEmitter();

  constructor(public formBuilder: UntypedFormBuilder, public mileageRateService: MileageRateService,
              public notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.initializeFormBuilder();
    this.getConfigureMileageRate();
  }

  /**
   * this method used for initialize form builder
   */
  initializeFormBuilder(){
    this.mileageRateConfigurationForm = this.formBuilder.group({
      id: [null],
      mileageRate: [null, Validators.compose([Validators.required, Validators.maxLength(20)])],
      updateBy: [null],
      updateOn: [null],
    });
  }

  /**
   * this method can be used for create a mileage rate
   */

  createMileageRate() {
    this.loading = true;
    if (this.mileageRateConfigurationForm.valid) {
      this.vpExpenseMileageRate.mileageRate = this.mileageRateConfigurationForm.get('mileageRate').value;
      this.vpExpenseMileageRate.id = null;
      this.mileageRateService.createMileageRate(this.vpExpenseMileageRate).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.MILEAGE_RATE_SAVED_SUCCESSFULLY);
          this.successfullyCreated.emit();
          this.resetForm();
          this.loading = false;
        } else {
          this.loading = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.loading = false;
        this.notificationService.errorMessage(error);
      });

    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.mileageRateConfigurationForm);
    }
  }

  /**
   * This method can be used to get configured mileage rate
   */
  getConfigureMileageRate() {
    let date: any = new Date();
    if (date) {
      date = date.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    }
    this.mileageRateService.getMileageRate(date).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.vpExpenseMileageRate = res.body;
        this.mileageRateConfigurationForm.get('mileageRate').patchValue(this.vpExpenseMileageRate.mileageRate);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * resetting the mileage rate configuration form
   */
  resetForm() {
    this.mileageRateConfigurationForm.reset();
    this.getConfigureMileageRate();
  }
}
