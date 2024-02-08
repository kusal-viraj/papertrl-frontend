import {Component, OnInit, ViewChild} from '@angular/core';
import {AppConstant} from "../../../../shared/utility/app-constant";
import {ReportMasterService} from "../../../../shared/services/reports/report-master.service";
import {NotificationService} from "../../../../shared/services/notification/notification.service";
import {PrivilegeService} from "../../../../shared/services/privilege.service";
import {ReportUtility} from "../../report-utility/report-utility";
import {AppAuthorities} from "../../../../shared/enums/app-authorities";
import {Table} from "primeng/table";
import {OverlayPanel} from "primeng/overlaypanel";
import {DetailViewService} from "../../../../shared/helpers/detail-view.service";
import {BillsService} from '../../../../shared/services/bills/bills.service';
import {DropdownDto} from '../../../../shared/dto/common/dropDown/dropdown-dto';
import {AppResponseStatus} from '../../../../shared/enums/app-response-status';
import {AutomationService} from "../../../../shared/services/automation-service/automation.service";

@Component({
  selector: 'app-bill-billable-transaction-table',
  templateUrl: './bill-billable-transaction-table.component.html',
  styleUrls: ['./bill-billable-transaction-table.component.scss']
})
export class BillBillableTransactionTableComponent implements OnInit {

  @ViewChild('billBillableTransactionTable') billBillableTransactionTable: Table;
  @ViewChild('billDetailTable') billDetailTable: Table;
  @ViewChild('billOverlay') billOverlay: OverlayPanel;
  @ViewChild('poOverlay') poOverlay: OverlayPanel;
  @ViewChild('itemOverlay') itemOverlay: OverlayPanel;
  @ViewChild('accountOverlay') accountOverlay: OverlayPanel;


  public reportUtility: ReportUtility = new ReportUtility(this.reportMasterService,
    this.notificationService, this.privilegeService, this.detailViewService, this.billsService, this.automationService);
  public appAuthorities = AppAuthorities;
  public vendorList: DropdownDto = new DropdownDto();

  constructor(public reportService: ReportMasterService, public notificationService: NotificationService,
              public privilegeService: PrivilegeService, public reportMasterService: ReportMasterService,
              public detailViewService: DetailViewService, public billsService: BillsService, public automationService: AutomationService) {
  }

  ngOnInit(): void {
    this.reportMasterService.transactionTypes.subscribe((types: any []) => {
      if (types) {
        if (types.length > AppConstant.ZERO) {
          if (types.includes(AppConstant.TRANSACTION_TYPE_BILL)) {
            this.loadBillBillableTableData();
          } else {
            this.reportUtility.billBillableList = [];
          }
          if (types.length === 1 && types.includes(AppConstant.TRANSACTION_TYPE_BILL) &&
            this.reportUtility.billBillableList.length > AppConstant.ZERO) {
            this.reportUtility.innerHeightOfBillBillableTransactionTable = 621;
          }

          if (types.length === 2 && types.includes(AppConstant.TRANSACTION_TYPE_BILL) &&
            this.reportUtility.billBillableList.length > AppConstant.ZERO) {
            this.reportUtility.innerHeightOfBillBillableTransactionTable = 261;
          }

          if (types.length === 3 && types.includes(AppConstant.TRANSACTION_TYPE_BILL) &&
            this.reportUtility.billBillableList.length > AppConstant.ZERO) {
            this.reportUtility.innerHeightOfBillBillableTransactionTable = 131;
          }

        } else if (types.length === AppConstant.ZERO) {
          this.loadBillBillableTableData();
          this.reportUtility.setTableHeight();
        }
      } else {
        this.loadBillBillableTableData();
        return;
      }
    });
    this.getVendorList();
  }

  /**
   * This method use for get vendor list for dropdown
   */
  getVendorList() {
    this.billsService.getVendorList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.vendorList.data = res.body;
        if (this.privilegeService.isAuthorized(AppAuthorities.VENDORS_CREATE)) {
          this.vendorList.addNew();
        }
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method load bill- billable transaction details
   */
  loadBillBillableTableData() {
    this.reportService.getBillBillableTableData().subscribe(async (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.reportUtility.billBillableList = await (res.body);
          this.reportService.billBillableTransActionListLength.next(this.reportUtility.billBillableList.length);
          this.reportMasterService.isProgressBill.next(false);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }
}
