import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AvailableDraft} from "../../../shared/dto/expense/available-draft";
import {PoUtility} from "../po-utility";
import {PoService} from "../../../shared/services/po/po.service";
import {RoleService} from "../../../shared/services/roles/role.service";
import {MessageService} from "primeng/api";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {ManageDrawerService} from "../../../shared/services/common/manage-drawer-status/manage-drawer.service";
import {AppConstant} from "../../../shared/utility/app-constant";
import {PoReceiptService} from "../../../shared/services/po-receipts/po-receipt.service";
import {BillsService} from '../../../shared/services/bills/bills.service';

@Component({
  selector: 'app-available-po-receipt-draft-list',
  templateUrl: './available-po-receipt-draft-list.component.html',
  styleUrls: ['./available-po-receipt-draft-list.component.scss']
})
export class AvailablePoReceiptDraftListComponent implements OnInit {

  @Input() availableDraftList: AvailableDraft [];
  @Output() emitClickEvent = new EventEmitter();
  @Input() public isChecked = false;

  public isProgressDataPatching = false;

  public poUtility: PoUtility = new PoUtility(this.poService, this.roleService, this.messageService,
    this.privilegeService, this.notificationService, this.drawerService, this.billsService);

  constructor(public poService: PoService, public roleService: RoleService, public messageService: MessageService,
              public privilegeService: PrivilegeService, public notificationService: NotificationService,
              public drawerService: ManageDrawerService, public poReceiptService: PoReceiptService, public billsService: BillsService) {
  }

  ngOnInit(): void {
    this.getDataPatchingStatusFromDraft();
  }

  /**
   * Po details show hide check box
   */
  changeStateOfExpenseDraftList() {
    this.drawerService.changeDefaultDrawerState(AppConstant.PO_RECEIPT_DRAFT_LIST_MODAL)
      .subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.poUtility.showPoReceiptDraftListByDefault = !this.poUtility.showPoReceiptDraftListByDefault;
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
  }

  /**
   * Function used to get status of patch data from draft
   */
  getDataPatchingStatusFromDraft() {
    this.poReceiptService.isProcessingPatchingDataFromPoReceiptDraft.subscribe(draftStatus => {
      if (draftStatus) {
        this.availableDraftList[draftStatus.index].isProgress = draftStatus.isProgress;
        this.isProgressDataPatching = draftStatus.isProgress;
      }
    });
  }


}
