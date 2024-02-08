import {AppConstant} from "./app-constant";
import {BillsService} from "../services/bills/bills.service";
import {NotificationService} from "../services/notification/notification.service";
import {FormArray, FormGroup, UntypedFormGroup} from "@angular/forms";

export class AccountNumberPopulationLineLevel {

  public  headerLevelProjectCode: any;

  constructor(public billsService: BillsService, public notificationService: NotificationService) {

  }


  checkAccountNumber(projectId: any, itemId: any, i?,  itemCostDistributionForms?: FormArray, headerLevelForm?: FormGroup) {
    let projectCode: any = 0;
    if(headerLevelForm){
      this.headerLevelProjectCode = headerLevelForm.get('projectCodeId').value;
    }
    if (projectId) {
      projectCode = projectId;
    } else if (this.headerLevelProjectCode) {
      projectCode = this.headerLevelProjectCode;
    }
    if (itemId) {
      this.billsService.checkAccountNumber(itemId, projectCode).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_WARNING) {
          this.notificationService.infoMessage(res.body.message);
          itemCostDistributionForms.controls[i].get('accountId').reset();
          itemCostDistributionForms.controls[i].get('accountNumber').reset();
        } else if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          itemCostDistributionForms.controls[i].get('accountId').patchValue(res.body.id);
          itemCostDistributionForms.controls[i].get('accountNumber').patchValue(res.body.name);
        }
      });
    }
  }

}
