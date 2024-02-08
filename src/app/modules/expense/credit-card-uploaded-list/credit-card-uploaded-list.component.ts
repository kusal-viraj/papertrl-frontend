import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AuditTrialDto} from '../../../shared/dto/common/audit-trial/audit-trial-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {Table} from 'primeng/table';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {UntypedFormBuilder} from '@angular/forms';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {ExpenseService} from '../../../shared/services/expense/expense.service';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {BulkNotificationDialogService} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppConstant} from '../../../shared/utility/app-constant';
import {ExpenseTableDto} from '../../../shared/dto/expense/expense-table-dto';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {Subscription} from "rxjs";
import {Menu} from "primeng/menu";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";

@Component({
  selector: 'app-credit-card-uploaded-list',
  templateUrl: './credit-card-uploaded-list.component.html',
  styleUrls: ['./credit-card-uploaded-list.component.scss']
})
export class CreditCardUploadedListComponent implements OnInit, OnDestroy {

  public activeAction: any;
  public tableSupportBase = new TableSupportBase();
  public bulkButtonList: ButtonPropertiesDto[] = [];
  public auditTrial: AuditTrialDto[] = [];
  public bulkButtonListResponsive: any;
  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public tableKeyEnum = AppTableKeysData;
  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
  public multiselectValues: any;
  public commonUtil = new CommonUtility();
  public appEnumConstants = AppEnumConstants;
  public edit: boolean;

  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();
  public subscription: Subscription;


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

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.UPLOAD_CARD_TABLE_KEY);
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }


  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService,
              public expenseService: ExpenseService, public billsService: BillsService,
              public bulkNotificationDialogService: BulkNotificationDialogService,
              public privilegeService: PrivilegeService, public gridService: GridService,
              public confirmationService: ConfirmationService, public gaService: GoogleAnalyticsService,) {
  }

  ngOnInit(): void {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.actionButtonInit();
    this.loadTableData();
    this.subscription = this.expenseService.uploadedTransactionSubject.subscribe(() => {
      if (this.tableSupportBase.searchFilterDto?.filters) {
        this.tableSupportBase.rows = [];
        this.getDataFromBackend();
      }
    });
  }

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.UPLOAD_CARD_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_UPLOAD_CARD_LIST;
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


  /**
   * Loads Table Data (Settings)
   */
    loadTableData() {
    this.selectedColumns = [];
    this.onTableResize();
    sessionStorage.removeItem(AppTableKeysData.UPLOAD_CARD_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_UPLOAD_CARD_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.UPLOAD_CARD_TABLE_KEY, this.columnSelect);
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }


  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableSupportBase.tableActionList = [
      {
        label: AppActionLabel.ACTION_LABEL_EDIT,
        icon: AppIcons.ICON_EDIT,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_UPLOAD_EDIT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_TRANSACTIONS,
            AppActionLabel.ACTION_LABEL_EDIT,
          );
          this.edit = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_DELETE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_DELETE_STATEMENT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DELETE,
            AppAnalyticsConstants.MODULE_NAME_TRANSACTIONS,
            AppActionLabel.ACTION_LABEL_DELETE,
          );
          this.deleteTransaction(this.activeAction.id);
        }
      },
    ];
  }

  deleteTransaction(id) {
    this.confirmationService.confirm({
      key: 'delete-state',
      message: 'You want to delete this Statement',
      accept: () => {
        this.expenseService.deleteStatement(id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_STATEMENT_DELETED_SUCCESSFULLY);
            this.getDataFromBackend();
            this.expenseService.processListSubject.next(true);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.getDataFromBackend();
  }

  /**
   * get search result
   */

  getDataFromBackend() {
    this.expenseService.getUploadCardTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.dataSource = res.body.data;
          this.tableSupportBase.totalRecords = res.body.totalRecords;
          if (this.tableSupportBase.totalRecords === 0) {
            this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('{first}', '0');
          } else {
            this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('0', '{first}');
          }
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }

  /**
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: ExpenseTableDto) {
    this.activeAction = val;
  }


  deleteCard(id) {
    this.confirmationService.confirm({
      key: 'delete',
      message: 'You want to delete this Credit card',
      accept: () => {
        this.expenseService.deleteCard(id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.loadData(this.tableSupportBase.searchFilterDto);
            this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_DELETED_SUCCESSFULLY);
            this.getDataFromBackend();
            this.tableSupportBase.rows = [];
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }


}
