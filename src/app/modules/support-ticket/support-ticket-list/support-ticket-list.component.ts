import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {AccountTableDto} from '../../../shared/dto/account/account-table-dto';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {Table} from 'primeng/table';
import {LazyLoadEvent, MessageService} from 'primeng/api';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {DashboardService} from '../../../shared/services/dashboard/dashboard.service';
import {Subscription} from 'rxjs';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-support-ticket-list',
  templateUrl: './support-ticket-list.component.html',
  styleUrls: ['./support-ticket-list.component.scss']
})
export class SupportTicketListComponent implements OnInit, OnDestroy {
  public tableSupportBase = new TableSupportBase();
  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any;

  public enums = AppEnumConstants;
  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
  public tableKeyEnum = AppTableKeysData;

  public activeAction: AccountTableDto; // Selected Action Button
  public parentAccounts: DropdownDto = new DropdownDto();
  public subscription = new Subscription();

  public appConstant: AppConstant = new AppConstant();
  public availableHeaderActions = [];
  public showFilter = false;
  public showFilterColumns = false;

  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);
  }

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: Table;
  @ViewChild('menu') menu: Menu;
  ticketManage: any;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  constructor(public messageService: MessageService, public gridService: GridService,
              public notificationService: NotificationService, public privilegeService: PrivilegeService,
              public dashboardService: DashboardService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.TICKET_TABLE_KEY);
    this.subscription.unsubscribe();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.TICKET_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_TICKET_LIST;
      this.gridService.updateTableState(this.tableSupportBase.tableDataOptions).subscribe((res: any) => {
        if (event === true) {
          this.loadTableData();
        }
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    });
  }

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.actionButtonInit();
    this.getParentAccount();
    this.subscription = this.dashboardService.supportTableList.subscribe(() => {
      if (this.tableSupportBase.searchFilterDto?.filters) {
        this.loadData(this.tableSupportBase.searchFilterDto);
      }
    });
  }

  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableSupportBase.tableActionList = [
      {
        label: this.actionLabelEnum.ACTION_LABEL_VIEW_COMMENTS,
        icon: this.iconEnum.ICON_COMMENT,
        status: this.enums.STATUS_COMMON,
        authCode: true,
        command: () => {
          this.manageTicket();
        }
      },
      // {
      //   label: this.actionLabelEnum.ACTION_LABEL_DOWNLOAD_ATTACHMENT,
      //   status: this.enums.STATUS_COMMON,
      //   icon: this.iconEnum.ICON_DOWNLOAD_BILL_FONT_AWESOME,
      //   authCode: true,
      //   command: () => {
      //     this.downloadAttachment();
      //   }
      // }
    ];
  }

  /**
   * Loads Table Data (Settings)
   */
  loadTableData() {
    this.selectedColumns = [];
    // Check for Responsiveness
    this.onTableResize();
    // Removes table Storage on load if present
    sessionStorage.removeItem(AppTableKeysData.TICKET_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_TICKET_LIST).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.TICKET_TABLE_KEY, this.columnSelect);
    });
  }


  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.dashboardService.getTicketGridData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      this.tableSupportBase.dataSource = res.body.data;
      this.tableSupportBase.totalRecords = res.body.totalRecords;
      if (this.tableSupportBase.totalRecords === 0) {
        this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('{first}', '0');
      } else {
        this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('0', '{first}');
      }
    });
  }

  /**
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: AccountTableDto) {
    this.activeAction = val;
  }


  manageTicket() {
    this.dashboardService.getTicketTimeLine(this.activeAction['sup.ticketId']).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.ticketManage = true;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    });
  }

  downloadAttachment() {
    this.dashboardService.downloadTicketAttachment(this.activeAction['sup.id']).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        console.log('start download:', res);
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'ticket-attachment(s)');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * this method can be used to get parent accounts for filters
   */
  getParentAccount() {
    // this.accountService.getParentAccountsForFilter().subscribe((res: any) => {
    //   this.parentAccounts = res.body;
    // });
  }

  getDropDowns(col: any) {
    switch (col.field) {
      case 'sup.status':
        return col.dropdownValues;
    }
  }
}
