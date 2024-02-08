import { Component, OnInit } from '@angular/core';
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {ManageFeatureService} from "../../../shared/services/settings/manage-feature/manage-feature.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {AppConstant} from "../../../shared/utility/app-constant";

@Component({
  selector: 'app-manage-feature',
  templateUrl: './manage-feature.component.html',
  styleUrls: ['./manage-feature.component.scss']
})
export class ManageFeatureComponent implements OnInit {
  public featureList: any [] = [];
  public isConfirmation = false;
  public position: any;
  public selectedFeature: any;
  public selectedFeatureName: any;
  public appConstant = AppConstant;
  public proceedBtn = false;

  constructor(public manageFeatureService: ManageFeatureService, public notificationService: NotificationService) { }

  ngOnInit(): void {
    this.getAvailableFeatureList();
  }

  /**
   * this method execute when change the feature
   * @param feature to feature object
   * @param isActive to toggle status
   */
  changeFeatureToggle(feature, isActive) {
    const featureId = feature.id;
    const isActiveFeature = isActive;
    this.manageFeatureService.updateFeatureStatus(featureId, isActiveFeature).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS !== res.status) {
        this.notificationService.infoMessage(res.body.message);
      }else {
        if(feature.name === AppConstant.CONFIDENTIAL_DOC_LABEL){
          this.manageFeatureService.serveToggleStatus.next(isActive);
        }
      }
    }, (error) => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used for get system available feature list
   */
  getAvailableFeatureList(){
    this.manageFeatureService.getFeatureList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.featureList = res.body;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Sets the position and confirmation status for a feature.
   *
   * @param  position - The position of the p-dialog box.
   * @param  b - A boolean value indicating confirmation.
   */
  conformationInFeature( b: boolean) {
    this.isConfirmation = true;
    this.proceedBtn = b;
  }

  /**
   * Selects a feature and updates the selected feature's name and reference.
   * @param  feature - The feature to be selected.
   */
  selectFeature(feature: any) {
    this.selectedFeatureName = feature.name;
    this.selectedFeature = feature;
  }

}
