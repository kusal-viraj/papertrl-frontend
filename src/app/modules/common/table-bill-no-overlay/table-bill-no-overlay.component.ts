import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from "../../../shared/utility/table-support-base";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {BillApprovalsService} from "../../../shared/services/bills/bill-approvals.service";
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";
import {OverlayPanel} from 'primeng/overlaypanel';

@Component({
  selector: 'app-table-bill-no-overlay',
  templateUrl: './table-bill-no-overlay.component.html',
  styleUrls: ['./table-bill-no-overlay.component.scss']
})
export class TableBillNoOverlayComponent implements OnInit {

  public billDto: any;
  public tableSupportBase = new TableSupportBase();
  public commonUtil = new CommonUtility();

  @Input() billId;

  constructor(public billApprovalsService: BillApprovalsService) {
  }

  ngOnInit(): void {
    if(!this.billId){
      return;
    }else {
      this.billApprovalsService.getSummaryBillDetail(this.billId).subscribe((res) => {
        this.billDto = res.body;
      });
    }
  }


  getStatus(status) {
    switch (status) {
      case AppEnumConstants.PAYMENT_STATUS_PAID: {
        return AppEnumConstants.PAYMENT_LABEL_PAID;
      }
      case AppEnumConstants.PAYMENT_STATUS_NOT_PAID: {
        return AppEnumConstants.PAYMENT_LABEL_NOT_PAID;
      }
      case AppEnumConstants.PAYMENT_STATUS_PARTIALLY_PAID: {
        return AppEnumConstants.PAYMENT_LABEL_PARTIALLY_PAID;
      }
      case AppEnumConstants.PAYMENT_STATUS_PROCESSING: {
        return AppEnumConstants.PAYMENT_LABEL_PROCESSING;
      }
    }
  }
}
