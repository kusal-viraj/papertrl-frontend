import {Component, Input, OnInit} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {BillApprovalsService} from '../../../shared/services/bills/bill-approvals.service';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {ExpenseService} from '../../../shared/services/expense/expense.service';

@Component({
  selector: 'app-table-expense-overlay',
  templateUrl: './table-expense-overlay.component.html',
  styleUrls: ['./table-expense-overlay.component.scss']
})
export class TableExpenseOverlayComponent implements OnInit {

  public expenseDto: any;
  public tableSupportBase = new TableSupportBase();
  public commonUtil = new CommonUtility();

  @Input() expenseId;

  constructor(public expenseService: ExpenseService) {
  }

  ngOnInit(): void {
    if (!this.expenseId){
      return;
    }else {
      this.expenseService.getExpenseSummaryDetails(this.expenseId).subscribe((res) => {
        this.expenseDto = res.body;
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
