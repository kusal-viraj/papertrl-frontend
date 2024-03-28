import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PoApprovalDto} from '../../../shared/dto/po/po-approval-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {BillApprovalsService} from '../../../shared/services/bills/bill-approvals.service';

@Component({
  selector: 'app-po-details',
  templateUrl: './po-details.component.html',
  styleUrls: ['./po-details.component.scss']
})
export class PoDetailsComponent implements OnInit {

  @Input() public showPoLineItems;
  @Input() public poDetail = new PoApprovalDto();
  @Input() public selectedPoLineItems = [];
  @Input() public selectedPoAccountDetails = [];
  @Input() public showPoLineItemsByDefault;
  @Input() public fromBillProcess;
  @Input() public poNumber;

  @Output() public closeDrawer = new EventEmitter();
  @Output() public changeDefaultBehaviour = new EventEmitter();
  @Output() public processData = new EventEmitter();


  constructor(public billsService: BillsService, public notificationService: NotificationService,
              public billApprovalsService: BillApprovalsService,) {
  }

  ngOnInit(): void {
  }

  /**
   * This method use for validate UOM
   * @param item response
   */
  getUOM(item: any) {
    return item.uomId === undefined ? AppConstant.EMPTY_STRING : item.uomId.description;
  }

  /**
   * Po details show hide check box
   */
  defaultCheckBoxChanged() {
    this.billsService.changeDefaultPoDrawerState(AppConstant.BILL_PO_LIST_MODAL)
      .subscribe((res: any) => {
        this.showPoLineItemsByDefault = !this.showPoLineItemsByDefault;
        this.changeDefaultBehaviour.emit();
      }, error => {
        this.notificationService.errorMessage(error);
      });
  }

  addLines(selectedPoAccountDetails, selectedPoLineItems) {
    const obj = {
      selectedPoAccountDetails: selectedPoAccountDetails,
      selectedPoLineItems: selectedPoLineItems,
    };
    this.processData.emit(obj);
  }
}
