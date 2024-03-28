import {Component, OnInit, ViewChild} from '@angular/core';
import {ExpenseBillableTransactionDto} from "../../../../shared/dto/report/expense-billable-transaction-dto";
import {AppConstant} from "../../../../shared/utility/app-constant";
import {ReportMasterService} from "../../../../shared/services/reports/report-master.service";
import {NotificationService} from "../../../../shared/services/notification/notification.service";
import {ReportUtility} from "../../report-utility/report-utility";
import {PrivilegeService} from "../../../../shared/services/privilege.service";
import {AppAuthorities} from "../../../../shared/enums/app-authorities";
import {OverlayPanel} from "primeng/overlaypanel";
import {DetailViewService} from "../../../../shared/helpers/detail-view.service";
import {BillsService} from '../../../../shared/services/bills/bills.service';
import {AutomationService} from "../../../../shared/services/automation-service/automation.service";

@Component({
  selector: 'app-expense-billable-transaction-table',
  templateUrl: './expense-billable-transaction-table.component.html',
  styleUrls: ['./expense-billable-transaction-table.component.scss']
})
export class ExpenseBillableTransactionTableComponent implements OnInit {

  @ViewChild('accountOverlay') accountOverlay: OverlayPanel;

  public appAuthorities = AppAuthorities;
  public reportUtility: ReportUtility = new ReportUtility(this.reportMasterService, this.notificationService,
    this.privilegeService, this.detailViewService, this.billsService, this.automationService);
  public isOnlyExpenseTable = false;

  constructor(public reportMasterService: ReportMasterService, public notificationService: NotificationService,
              public privilegeService: PrivilegeService, public detailViewService: DetailViewService
              , public billsService: BillsService,  public automationService: AutomationService) {
  }

  ngOnInit(): void {
    this.reportMasterService.transactionTypes.subscribe((types: any []) => {
      if (types) {
        if (types.length > AppConstant.ZERO) {
          if (types.includes(AppConstant.TRANSACTION_TYPE_EXPENSE)) {
            this.loadExpenseBillableTableData()
          } else {
            this.reportUtility.expenseBillableDetails = [];
          }

          if(types.length === 1 && types.includes(AppConstant.TRANSACTION_TYPE_EXPENSE)){
            this.reportUtility.innerHeightOfExpenseBillableTransactionTable = 670;
            this.isOnlyExpenseTable = true;
          }else {
            this.isOnlyExpenseTable = false;
          }

          if(types.length === 2 && types.includes(AppConstant.TRANSACTION_TYPE_EXPENSE)){
            this.reportUtility.innerHeightOfExpenseBillableTransactionTable = 300;
          }

          if(types.length === 3 && types.includes(AppConstant.TRANSACTION_TYPE_EXPENSE)){
            this.reportUtility.innerHeightOfExpenseBillableTransactionTable = 170;
          }

        } else if (types.length === AppConstant.ZERO) {
          this.loadExpenseBillableTableData();
          this.reportUtility.setTableHeight();
        }
      } else {
        this.loadExpenseBillableTableData();
        return;
      }
    });
  }

  /**
   * this method load expense- billable transaction details
   */
  loadExpenseBillableTableData() {
    this.reportMasterService.getExpenseBillableTableData().subscribe(async (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.reportUtility.expenseBillableDetails = await (res.body);
          this.reportMasterService.expenseBillableTransActionListLength.next(this.reportUtility.expenseBillableDetails.length);
          this.reportMasterService.isProgressExpense.next(false);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }

      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }

}
