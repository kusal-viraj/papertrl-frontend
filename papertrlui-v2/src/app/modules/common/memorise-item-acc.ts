import {AppFormConstants} from "../../shared/enums/app-form-constants";
import {AppModuleSection} from "../../shared/enums/app-module-section";
import {AppConstant} from "../../shared/utility/app-constant";
import {AppResponseStatus} from "../../shared/enums/app-response-status";
import {AbstractControl, UntypedFormArray, UntypedFormGroup} from "@angular/forms";
import {BillsService} from "../../shared/services/bills/bills.service";
import {A} from "@angular/cdk/keycodes";
import {ManageFeatureService} from "../../shared/services/settings/manage-feature/manage-feature.service";
import {AppFeatureId} from "../../shared/enums/app-feature-id";

export class MemoriseItemAcc {

  public memorizationItem: boolean;
  public memorizationAccount: boolean;
  public featureIdList: any [] = [];
  public featureIdEnum = AppFeatureId;


  constructor(public manageFeatureService: ManageFeatureService, public formGroup: UntypedFormGroup, public billService: BillsService, public accountForm: UntypedFormArray, public itemForm: UntypedFormArray) {
    this.getAvailableFeatureList();
  }

  getDescriptionWiseAccItem(i, sectionId, expenseCostDistributionForms: UntypedFormArray, itemCostDistributionForms: UntypedFormArray, doc: string) {
    return new Promise(resolve => {
      let description;
      let vendorId = this.formGroup.get(AppFormConstants.VENDOR_ID).value;
      if (sectionId == AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID) {
        if (this.accountForm.controls[i].get(AppFormConstants.ACCOUNT_CHANGED).value || !this.memorizationAccount) {
          return;
        }
        description = this.accountForm.controls[i].get(AppConstant.DESCRIPTION_CONTROLLER).value;
      } else {
        if (this.itemForm.controls[i].get(AppFormConstants.ACCOUNT_CHANGED).value || !vendorId || !this.memorizationItem) {
          return;
        }
        description = this.itemForm.controls[i].get(AppConstant.DESCRIPTION_CONTROLLER).value;
      }

        this.billService.getDescriptionWiseAccItem(sectionId, description ? description : ' ', vendorId).then(async (res: any) => {
          await res;
          if (AppResponseStatus.STATUS_SUCCESS !== res.status) {
            resolve(null);
            return;
          }
          //Clear Account information
          if (sectionId === AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID) {
            // Patch account information
            if(res.body !== null) {
              expenseCostDistributionForms.controls[i].get(AppFormConstants.ACCOUNT_ID).patchValue(res.body.id);
              expenseCostDistributionForms.controls[i].get(AppFormConstants.ACCOUNT_NUMBER).patchValue(res.body.number);
              expenseCostDistributionForms.controls[i].get(AppFormConstants.ACCOUNT_NAME).patchValue(res.body.name);
              resolve(res.body);
            }
            return;
          }
          //Clear Item Information
          if (!res.body && !itemCostDistributionForms.controls[i].get(AppFormConstants.ACCOUNT_CHANGED).value) {
            if (doc == 'PO') {
              itemCostDistributionForms.controls[i].get(AppFormConstants.PRODUCT_ID).reset();
              itemCostDistributionForms.controls[i].get(AppFormConstants.UOM_ID).reset();
              itemCostDistributionForms.controls[i].get(AppFormConstants.ITEM_NAME).reset();
            } else {
              itemCostDistributionForms.controls[i].get(AppFormConstants.ITEM_NAME).reset();
              itemCostDistributionForms.controls[i].get(AppFormConstants.ITEM_ID).reset();
            }
            itemCostDistributionForms.controls[i].get(AppFormConstants.ITEM_NUMBER).reset();
            itemCostDistributionForms.controls[i].get(AppFormConstants.VENDOR_ITEM_NUMBER).reset();
            resolve(null);
            return;
          }
          // Patch item information related to specific documents
          if (doc == 'PO') {
            itemCostDistributionForms.controls[i].get(AppFormConstants.PRODUCT_ID).patchValue(res.body.id);
            itemCostDistributionForms.controls[i].get(AppFormConstants.ITEM_NAME).patchValue(res.body.name);
            itemCostDistributionForms.controls[i].get(AppFormConstants.UOM_ID).patchValue(res.body.uomId);
          } else {
            itemCostDistributionForms.controls[i].get(AppFormConstants.ITEM_ID).patchValue(res.body.id);
            itemCostDistributionForms.controls[i].get(AppFormConstants.ITEM_NAME).patchValue(res.body.name);
          }
          itemCostDistributionForms.controls[i].get(AppFormConstants.ITEM_NUMBER).patchValue(res.body.number);
          itemCostDistributionForms.controls[i].get(AppFormConstants.VENDOR_ITEM_NUMBER).patchValue(res.body.sku?.name);
          resolve(res.body);
        });

    });
  }

  accountChanged(abstractControl: AbstractControl) {
    if (!abstractControl.get(AppFormConstants.ACCOUNT_CHANGED).value) {
      abstractControl.get(AppFormConstants.ACCOUNT_CHANGED).patchValue(true);
    }
  }
  /**
   * this method can be used for get system available feature list
   */
  getAvailableFeatureList(){
    this.manageFeatureService.getFeatureList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.featureIdList = res.body;
        for (const feature of this.featureIdList) {
          if (feature.featureId === this.featureIdEnum.MEMORIZE_ACCOUNT_BY_DESCRIPTION) {
            this.memorizationAccount = feature.status;
          } else if (feature.featureId === this.featureIdEnum.MEMORIZE_ITEM_BY_DESCRIPTION) {
            this.memorizationItem = feature.status;
          }
        }
      }
    });
  }

}
