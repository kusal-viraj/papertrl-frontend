import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../../shared/enums/app-enum-constants';
import {AppTableKeysData} from '../../../../shared/enums/app-table-keys-data';
import {Table} from 'primeng/table';
import {GridService} from '../../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {AppWindowResolution} from '../../../../shared/enums/app-window-resolution';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {AppActionLabel} from '../../../../shared/enums/app-action-label';
import {AppIcons} from '../../../../shared/enums/app-icons';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {EmailService} from '../../../../shared/services/support/email.service';
import {DropdownDto} from '../../../../shared/dto/common/dropDown/dropdown-dto';
import {AppTableHeaderActions} from "../../../../shared/enums/app-table-header-actions";
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-email-list',
  templateUrl: './email-list.component.html',
  styleUrls: ['./email-list.component.scss']
})
export class EmailListComponent implements OnInit, OnDestroy {
  public tableSupportBase = new TableSupportBase();

  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any;
  public enums = AppEnumConstants;
  public tableKeyEnum = AppTableKeysData;

  public activeAction: any;
  public id: any;
  public userActivityLogs = false;

  public tenantIdList: DropdownDto = new DropdownDto();
  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();

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
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  constructor(public gridService: GridService, public notificationService: NotificationService,
              public emailService: EmailService, public confirmationService: ConfirmationService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.EMAIL_TABLE_KEY);
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }


  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.EMAIL_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_EMAIL_LIST;
            this.gridService.updateTableState(this.tableSupportBase.tableDataOptions).subscribe((res: any) => {
        if (event === true){
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
    this.getTenants();
  }

  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableSupportBase.tableActionList = [
      {
        label: AppActionLabel.ACTION_LABEL_RESEND_EMAIL,
        icon: AppIcons.ICON_RESEND_INVITATION,
        status: this.enums.STATUS_COMMON,
        authCode: true,
        command: () => {
          const id = this.activeAction.id;
          const tenantId = this.activeAction.tenantId;
          this.resendInvitation(id, tenantId);
        }
      }
    ];

  }

  getTenants() {
    this.emailService.getTenantIdList().subscribe((res: any) => {
        this.tenantIdList.data = res;
      },
      error => {
        this.notificationService.errorMessage(error);
      });
  }

  /**
   * Loads Table Data (Settings)
   */
    loadTableData() {
    this.selectedColumns = [];
    // Check for Responsiveness
    this.onTableResize();
    // Removes table Storage on load if present
    sessionStorage.removeItem(AppTableKeysData.EMAIL_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_EMAIL_LIST).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.EMAIL_TABLE_KEY, this.columnSelect);
    });
  }


  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.emailService.getEmailTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
  actionButtonClick(val) {
    this.activeAction = val;
    this.id = val;
  }


  resendInvitation(id, tenantId) {
    this.emailService.resendEmail(id, tenantId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.notificationService.successMessage(HttpResponseMessage.EMAIL_SENT_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getDropDowns(col: any) {
    switch (col.field) {
      case 'email.status': {
        return col.dropdownValues;
      }
      case 'tenantId': {
        return this.tenantIdList.data;
      }
    }
  }
}
