import {Component, OnInit} from '@angular/core';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {FieldConfigurationService} from '../../../shared/services/settings/field-configuration.service';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppConstant} from '../../../shared/utility/app-constant';
import {Message} from 'primeng/api';
import {ManageFeatureService} from "../../../shared/services/settings/manage-feature/manage-feature.service";
import {BillsService} from '../../../shared/services/bills/bills.service';

@Component({
  selector: 'app-show-hide-fields',
  templateUrl: './show-hide-fields.component.html',
  styleUrls: ['./show-hide-fields.component.scss']
})
export class ShowHideFieldsComponent implements OnInit {

  public fieldForm: UntypedFormGroup;

  public vendors: any = [];
  public documents = [];
  public configurations;
  public message: Message[];


  constructor(public notificationService: NotificationService, public fieldConfigurationService: FieldConfigurationService,
              public formBuilder: UntypedFormBuilder, public manageFeatureService: ManageFeatureService, public billsService: BillsService) {
  }

  ngOnInit(): void {
    this.billsService.getVendorList().subscribe((res: any) => {
      this.vendors = res.body;
    });

    this.fieldConfigurationService.getDocuments().subscribe((res: any) => {
      this.documents = res.body;
    });

    this.fieldForm = this.formBuilder.group({
      document: [],
      vendorIdList: [],
      id: []
    });
    this.fieldForm.get('vendorIdList').patchValue([]);

    this.message = [
      {severity: 'warn', summary: 'Note', detail: 'To Override Single Field Configuration, Click Save Button'},
    ];
    this.getFeatureStatus();
  }

  /**
   * Triggers When Vendor List changed
   */
  changeVendorList(e: any) {
    if (!e.value) {
      return;
    }
    if (e.value.length !== 0) {
      this.getConfigurations();
    } else {
      this.configurations = [];
    }
  }

  /**
   * Triggers When Document type changed
   */
  changeDocuments(e: any) {
    if (!e.value) {
      return;
    }
    this.getConfigurations();
  }

  /**
   * Get all configuration according to vendor list and document
   */
  getConfigurations() {
    if (this.fieldForm.get('vendorIdList').value.length !== 0 && this.fieldForm.get('document').value) {
      const obj = {documentType: undefined, vendorIdList: undefined};
      obj.documentType = this.fieldForm.get('document').value;
      obj.vendorIdList = this.fieldForm.get('vendorIdList').value;
      this.fieldConfigurationService.getFieldConfiguration(obj).subscribe((res: any) => {
        this.configurations = res.body;
      });
    }
  }

  /**
   * Triggers When Configurations changed on single field
   */
  configChanged(data: any) {
    const prevValue = !data.showEnable;
    const obj = {vpVendorFieldConfigs: undefined, vendorIdList: undefined};
    obj.vpVendorFieldConfigs = this.configurations;
    obj.vendorIdList = this.fieldForm.get('vendorIdList').value;
    this.fieldConfigurationService.updateConfigurations(obj).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS !== res.status) {
        this.notificationService.infoMessage(res.body.message);
        data.showEnable = prevValue;
      }
    }, (error) => {
      this.notificationService.errorMessage(error);
      data.showEnable = prevValue;
    });
  }

  /**
   * Update Configurations on Save Button Clicked
   */
  updateConfigs() {
    const obj = {vpVendorFieldConfigs: undefined, vendorIdList: undefined};
    obj.vpVendorFieldConfigs = this.configurations;
    obj.vendorIdList = this.fieldForm.get('vendorIdList').value;
    this.fieldConfigurationService.updateConfigurations(obj).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
        this.notificationService.successMessage(HttpResponseMessage.CONFIGURATIONS_UPDATED);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, (error) => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get feature status
   */
  getFeatureStatus() {
    this.manageFeatureService.serveToggleStatus.subscribe(featureStatus =>{
      if(featureStatus !== null){
        this.billsService.getVendorList().subscribe((res: any) => {
          this.vendors = res.body;
        });
      }
    })
  }
}
