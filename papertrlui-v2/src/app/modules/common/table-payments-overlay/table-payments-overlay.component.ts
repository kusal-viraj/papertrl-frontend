import {Component, Input, OnInit} from '@angular/core';
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";
import {TableSupportBase} from "../../../shared/utility/table-support-base";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {VendorService} from "../../../shared/services/vendors/vendor.service";
import {BillsService} from "../../../shared/services/bills/bills.service";
import {BillApprovalsService} from "../../../shared/services/bills/bill-approvals.service";
import {AppConstant} from "../../../shared/utility/app-constant";

@Component({
  selector: 'app-table-payments-overlay',
  templateUrl: './table-payments-overlay.component.html',
  styleUrls: ['./table-payments-overlay.component.scss']
})
export class TablePaymentsOverlayComponent implements OnInit {

  public payments: any[] = [];
  public enums = AppEnumConstants;
  public tableSupportBase = new TableSupportBase();
  public commonUtil = new CommonUtility();
  public appConstant = new AppConstant();
  public appEnumConstants =  AppEnumConstants;
  @Input() id;
  @Input() docType;

  constructor(public billApproveService: BillApprovalsService) {
  }

  ngOnInit(): void {
    this.billApproveService.getBillPaymentSummaryDetail(this.id, this.docType).subscribe((res: any) => {
      this.payments = res.body?.length === 0 ? [1] : res.body;
    });
  }

  /**
   *
   * @param status
   * @param type
   */
  getStatus(status: string): string {
    switch (status) {
      case this.appConstant.TRANSACTION_SUBMITTED:
        return this.appEnumConstants.LABEL_TRANSACTION_SUBMITTED;
      case this.appConstant.TRANSACTION_PENDING:
        return this.appEnumConstants.LABEL_TRANSACTION_PENDING;
      case this.appConstant.TRANSACTION_SUCCESS:
        return this.appEnumConstants.LABEL_TRANSACTION_SUCCESS;
      case this.appConstant.TRANSACTION_FAILED:
        return this.appEnumConstants.LABEL_TRANSACTION_FAILED;
      case this.appConstant.TRANSACTION_IN_PROGRESS:
        return this.appEnumConstants.LABEL_JIRA_IN_PROGRESS;
      case this.appConstant.TRANSACTION_UNPROCESSED:
        return this.appEnumConstants.LABEL_UNPROCESSED;
      case this.appConstant.TRANSACTION_CANCELED:
        return this.appEnumConstants.LABEL_TRANSACTION_CANCELED;
      case this.appConstant.TRANSACTION_CREATED:
        return this.appEnumConstants.LABEL_TRANSACTION_CREATED;
      case this.appConstant.TRANSACTION_ON_HOLD:
        return this.appEnumConstants.LABEL_TRANSACTION_ON_HOLD;
      default:
        return '-';
    }
  }
}
