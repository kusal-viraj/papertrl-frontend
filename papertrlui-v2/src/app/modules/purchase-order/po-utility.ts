import {PoService} from '../../shared/services/po/po.service';
import {DropdownDto} from '../../shared/dto/common/dropDown/dropdown-dto';
import {AppMessageService} from '../../shared/enums/app-message-service';
import {MessageService} from 'primeng/api';
import {AppConstant} from '../../shared/utility/app-constant';
import {RoleService} from '../../shared/services/roles/role.service';
import {AppDocumentType} from '../../shared/enums/app-document-type';
import {AppResponseStatus} from '../../shared/enums/app-response-status';
import {AppAuthorities} from "../../shared/enums/app-authorities";
import {PrivilegeService} from "../../shared/services/privilege.service";
import {NotificationService} from "../../shared/services/notification/notification.service";
import {ManageDrawerService} from "../../shared/services/common/manage-drawer-status/manage-drawer.service";
import {BillsService} from '../../shared/services/bills/bills.service';
import {FormArray} from "@angular/forms";

export class PoUtility {


  public uom: DropdownDto = new DropdownDto();
  public items: DropdownDto = new DropdownDto();
  public attachments: DropdownDto = new DropdownDto();
  public poDisplayableOptionalFields: string[] = [];
  public showPoDraftListByDefault = false;
  public showPoReceiptDraftListByDefault = false;

  constructor(public poService: PoService, public roleService: RoleService, public messageService: MessageService,
              public privilegeService: PrivilegeService, public notificationService: NotificationService,
              public drawerService: ManageDrawerService, public billsService: BillsService) {
    this.getUom(this.uom);
    this.getDisplayableOptionalFields();
  }

  getUom(listInstance: DropdownDto) {
    this.poService.getUom().subscribe((res: any) => {
      listInstance.data = res.body;
    });
  }

  getDisplayableOptionalFields() {
    this.roleService.getDisplayableOptionalFields(AppDocumentType.PURCHASE_ORDER).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS) {
        this.poDisplayableOptionalFields = res.body;
      } else {

        this.poDisplayableOptionalFields = [];

        this.messageService.add({
          severity: AppMessageService.SEVERITIES_INFO,
          summary: AppMessageService.SUMMARY_INFO, detail: res.body.status
        });
      }
    }, error => {
      this.messageService.add({severity: AppMessageService.SUMMARY_ERROR, summary: AppMessageService.SUMMARY_ERROR, detail: error});
    });
  }

  //Po draft related function

  /**
   * Function used to get user's po draft list
   * Call from create expense constructor()
   */
  getPoDraftListState(){
    this.drawerService.getDefaultDrawerState(AppConstant.PO_DRAFT_LIST_MODAL).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.showPoDraftListByDefault = res.body;
      }else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error =>{
      this.notificationService.errorMessage(error);
    });
  }

  //PO receipt draft related function

  /**
   * Function used to get user's po receipt draft list
   * Call from create expense constructor()
   */
  getPoReceiptDraftListState(){
    this.drawerService.getDefaultDrawerState(AppConstant.PO_RECEIPT_DRAFT_LIST_MODAL).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.showPoReceiptDraftListByDefault = res.body;
      }else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error =>{
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to reset line account which was loaded according to the header project code selection
   * @param accountLineTableFormArray to account line table array
   * @param accountDetails
   */
  async clearAccountWhenClearHeaderProjectTask(accountLineTableFormArray: FormArray , accountDetails: FormArray ) {
    if (!accountLineTableFormArray || !accountDetails) {
      return;
    }

    await accountLineTableFormArray.controls.forEach(accountLineTableFormGroup => {
      if (!accountLineTableFormGroup.value.projectId) {
        accountLineTableFormGroup.get('accountId').reset();
        accountLineTableFormGroup.get('accountNumber').reset();
      }
    });

    await accountDetails.controls.forEach(accountDetailsFormGroup => {
      if (!accountDetailsFormGroup.value.projectId) {
        accountDetailsFormGroup.get('accountId').reset();
        accountDetailsFormGroup.get('accountName').reset();
        accountDetailsFormGroup.get('accountNumber').reset();
      }
    });

  }


}
