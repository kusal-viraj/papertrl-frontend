import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AvailableDraft} from "../../../../shared/dto/expense/available-draft";
import {BillUtility} from "../../bill-utility";
import {BillPaymentService} from "../../../../shared/services/bill-payment-service/bill-payment.service";
import {BillsService} from "../../../../shared/services/bills/bills.service";
import {PrivilegeService} from "../../../../shared/services/privilege.service";
import {NotificationService} from "../../../../shared/services/notification/notification.service";
import {DomSanitizer} from "@angular/platform-browser";
import {CreditNoteService} from "../../../../shared/services/credit-note/credit-note.service";
import {ManageDrawerService} from "../../../../shared/services/common/manage-drawer-status/manage-drawer.service";
import {AppConstant} from "../../../../shared/utility/app-constant";
import {isNotNullOrUndefined} from "codelyzer/util/isNotNullOrUndefined";

@Component({
  selector: 'app-available-credit-note-draft-list',
  templateUrl: './available-credit-note-draft-list.component.html',
  styleUrls: ['./available-credit-note-draft-list.component.scss']
})
export class AvailableCreditNoteDraftListComponent implements OnInit {

  @Input() availableDraftList: AvailableDraft [];
  @Output() emitClickEvent = new EventEmitter();
  @Input() public isChecked = false;
  @Output() public clickedIndex = new EventEmitter();

  public isProgressDataPatching = false;

  public billUtility: BillUtility = new BillUtility(this.billPaymentService, this.notificationService,
    this.privilegeService, this.creditNoteService, this.billsService, this.sanitizer, this.drawerService);

  constructor(public billPaymentService: BillPaymentService, public billsService: BillsService,
              public privilegeService: PrivilegeService, public notificationService: NotificationService,
              public sanitizer: DomSanitizer, public creditNoteService: CreditNoteService,
              public drawerService: ManageDrawerService) {
  }

  ngOnInit(): void {
    this.getDataPatchingStatusFromDraft();
  }

  /**
   * Po details show hide check box
   */
  changeStatus() {
    this.drawerService.changeDefaultDrawerState(AppConstant.CREDIT_NOTE_DRAFT_LIST_MODAL)
      .subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.billUtility.showBillDraftListByDefault = !this.billUtility.showBillDraftListByDefault;
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
    this.creditNoteService.isProcessingPatchingDataFromCreditNoteDraft.subscribe(draftStatus => {
      if (isNotNullOrUndefined(draftStatus.index)) {
        this.availableDraftList[draftStatus.index].isProgress = draftStatus.isProgress;
        this.isProgressDataPatching = draftStatus.isProgress;
      }
    });
  }
}
