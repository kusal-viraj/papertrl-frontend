import {Component, OnInit, ViewChild} from '@angular/core';
import {Table} from "primeng/table";
import {PoBillableTransactionDto} from "../../../../shared/dto/report/po-billable-transaction-dto";
import {ReportMasterService} from "../../../../shared/services/reports/report-master.service";
import {NotificationService} from "../../../../shared/services/notification/notification.service";
import {AppConstant} from "../../../../shared/utility/app-constant";
import {OverlayPanel} from "primeng/overlaypanel";
import {AppAuthorities} from "../../../../shared/enums/app-authorities";
import {PrivilegeService} from "../../../../shared/services/privilege.service";
import {ReportUtility} from "../../report-utility/report-utility";
import {DetailViewService} from "../../../../shared/helpers/detail-view.service";
import {BillsService} from '../../../../shared/services/bills/bills.service';
import {AutomationService} from "../../../../shared/services/automation-service/automation.service";

@Component({
  selector: 'app-po-billable-transaction-table',
  templateUrl: './po-billable-transaction-table.component.html',
  styleUrls: ['./po-billable-transaction-table.component.scss']
})
export class PoBillableTransactionTableComponent implements OnInit {

  @ViewChild('poBillableTransactionTable') poBillableTransactionTable: Table;
  @ViewChild('poDetailTable') poDetailTable: Table;
  @ViewChild('poOverlay') poOverlay: OverlayPanel;
  @ViewChild('itemOverlay') itemOverlay: OverlayPanel;
  @ViewChild('accountOverlay') accountOverlay: OverlayPanel;

  public reportUtility: ReportUtility = new ReportUtility(this.reportMasterService, this.notificationService,
    this.privilegeService, this.detailViewService, this.billsService, this.automationService);
  public appAuthorities = AppAuthorities;

  constructor(public reportService: ReportMasterService, public notificationService: NotificationService,
              public privilegeService: PrivilegeService, public reportMasterService: ReportMasterService,
              public detailViewService: DetailViewService, public billsService: BillsService,
              public automationService: AutomationService) {
  }

  ngOnInit(): void {
    this.reportMasterService.transactionTypes.subscribe((types: any []) => {
      if (types) {
        if (types.length > AppConstant.ZERO) {
          if (types.includes(AppConstant.TRANSACTION_TYPE_PO)) {
            this.loadPoBillableTableData()
          } else {
            this.reportUtility.poBillableList = [];
          }

          if (types.length === 1 && types.includes(AppConstant.TRANSACTION_TYPE_PO)) {
            this.reportUtility.innerHeightOfPOBillableTransactionTable = 621;
          }

          if (types.length === 2 && types.includes(AppConstant.TRANSACTION_TYPE_PO)) {
            this.reportUtility.innerHeightOfPOBillableTransactionTable = 261;
          }

          if (types.length === 3 && types.includes(AppConstant.TRANSACTION_TYPE_PO)) {
            this.reportUtility.innerHeightOfPOBillableTransactionTable = 131;
          }

        } else if (types.length === AppConstant.ZERO) {
          this.loadPoBillableTableData();
          this.reportUtility.setTableHeight();
        }
      } else {
        this.loadPoBillableTableData();
        return;
      }
    });
  }

  /**
   * this method used for load po-billable transaction details
   */
  loadPoBillableTableData() {
    this.reportService.getPoBillableTableData().subscribe(async (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.reportUtility.poBillableList = await (res.body);
          this.reportService.poBillableTransActionListLength.next(this.reportUtility.poBillableList.length);
          this.reportMasterService.isProgressPO.next(false);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }
}
