import {Component, OnInit, ViewChild} from '@angular/core';
import {ReportMasterService} from '../../../shared/services/reports/report-master.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {ReportGroupDto} from '../../../shared/dto/report/report-group-dto';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {ReportMainFormComponent} from '../report-main-form/report-main-form.component';
import {ReportFilterDto} from '../../../shared/dto/report/report-filter-dto';

@Component({
  selector: 'app-main-reports-page',
  templateUrl: './main-reports-page.component.html',
  styleUrls: ['./main-reports-page.component.scss']
})
export class MainReportsPageComponent implements OnInit {

  reportGroups: ReportGroupDto[] = [];
  filterIds: any [] = [];
  public appConstant = new AppConstant();

  reportId: any;
  reportName: string;

  public originalFileName: string;
  public reportUrl: string;

  public btnDisable = false;
  public isExportLoading = false;
  public isViewLoading = false;
  public viewBillBillableTransactionTable = false;
  public viewPoBillableTransactionTable = false;
  public viewExpenseBillableTransactionTable = false;

  @ViewChild('reportMainFormComponent')
  public reportMainFormComponent: ReportMainFormComponent;

  constructor(public reportMasterService: ReportMasterService, public notificationService: NotificationService) {
  }

  ngOnInit() {
    this.getBillableTransactionTableShowHideStatus();
    this.getReportCategory();
  }

  /**
   * this method can be used to get report name list
   */
  getReportCategory() {
    this.reportMasterService.getReportTypes().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.reportGroups = res.body;
      }
    }, error => {
      this.notificationService.infoMessage(error);
    });
  }

  /**
   * This method use for get report wise filters
   * @param event list event
   */
  loadReportFilters(event: any) {
    this.resetFilterAndPreview();
    this.reportName = event.option.name;
    this.reportId = event.value;
    if (!event.value) {
      return;
    } else {
      this.reportMasterService.getReportFilters(event.value).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.filterIds = res.body;
          this.reportMainFormComponent.showReport();
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  /**
   * This method use for reset filter component and preview
   */
  resetFilterAndPreview() {
    this.reportName = AppConstant.EMPTY_STRING;
    this.reportId = undefined;

    this.reportMainFormComponent.reportMainForm.reset();
  }

  /**
   * This method use for view report
   * @param reportUrl string
   * @param reportFilterDto ReportFilterDto
   */
  viewReport(reportUrl, reportFilterDto: ReportFilterDto) {
    this.reportMasterService.viewReport(reportUrl, reportFilterDto).subscribe(res => {
      const url = window.URL.createObjectURL(res.data);
      this.reportUrl = url;
      this.btnDisable = false;
      this.isViewLoading = false;
    }, error => {
      this.notificationService.errorMessage(error);
    });

  }

  /**
   * This method use for export report to csv
   * @param exportUrl string
   * @param reportFilterDto ReportFilterDto
   */
  exportReport(exportUrl, reportFilterDto: ReportFilterDto) {
    this.reportMasterService.exportReport(exportUrl, reportFilterDto).subscribe((res: any) => {
      this.btnDisable = false;
      this.isExportLoading = false;
      const element = document.createElement('a');
      element.style.display = 'none';
      element.href = window.URL.createObjectURL(res.data);
      element.download = 'export_file.xlsx';
      document.body.appendChild(element);
      element.click();
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * get show hide status of transactions tables
   */
  getBillableTransactionTableShowHideStatus() {
    this.reportMasterService.poBillableTransActionListLength.subscribe(poListLength => {
      this.viewPoBillableTransactionTable = poListLength > AppConstant.ZERO;
    });
    this.reportMasterService.billBillableTransActionListLength.subscribe(billListLength => {
      this.viewBillBillableTransactionTable = billListLength > AppConstant.ZERO;
    });
    this.reportMasterService.expenseBillableTransActionListLength.subscribe(expenseListLength => {
      this.viewExpenseBillableTransactionTable = expenseListLength > AppConstant.ZERO;
    });
  }
}
