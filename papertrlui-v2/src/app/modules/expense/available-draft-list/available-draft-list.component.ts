import {Component, Input, OnInit, EventEmitter, Output} from '@angular/core';
import {AvailableDraft} from "../../../shared/dto/expense/available-draft";
import {AppConstant} from "../../../shared/utility/app-constant";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {ExpenseService} from "../../../shared/services/expense/expense.service";
import {ExpenseUtility} from "../expense-utility";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {ManageDrawerService} from "../../../shared/services/common/manage-drawer-status/manage-drawer.service";
import {BillsService} from '../../../shared/services/bills/bills.service';

@Component({
  selector: 'app-available-draft-list',
  templateUrl: './available-draft-list.component.html',
  styleUrls: ['./available-draft-list.component.scss']
})
export class AvailableDraftListComponent implements OnInit {
  @Input() availableDraftList: AvailableDraft [];
  @Output() emitClickEvent = new EventEmitter();
  @Input() public isChecked = false;

  public isProgressDataPatching = false;

  public expenseUtility: ExpenseUtility = new ExpenseUtility(this.expenseService,
    this.notificationService, this.privilegeService, this.drawerService, this.billsService);

  constructor(public expenseService: ExpenseService, public notificationService: NotificationService, public billsService: BillsService,
              public privilegeService: PrivilegeService, public drawerService: ManageDrawerService) {
  }

  ngOnInit(): void {
    this.getDataPatchingStatusFromDraft();
  }

  /**
   * Po details show hide check box
   */
  changeStateOfExpenseDraftList() {
    this.drawerService.changeDefaultDrawerState(AppConstant.EXPENSE_DRAFT_LIST_MODAL)
      .subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.expenseUtility.showExpenseDraftListByDefault = !this.expenseUtility.showExpenseDraftListByDefault;
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
  getDataPatchingStatusFromDraft(){
    this.expenseService.isProcessingPatchingDataFromDraft.subscribe(draftStatus => {
      if(draftStatus){
        this.availableDraftList[draftStatus.index].isProgress = draftStatus.isProgress;
        this.isProgressDataPatching = draftStatus.isProgress;
      }
    });
  }
}
