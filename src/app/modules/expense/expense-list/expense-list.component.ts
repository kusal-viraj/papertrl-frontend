import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppIcons} from '../../../shared/enums/app-icons';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {Table} from 'primeng/table';
import {ExpenseService} from '../../../shared/services/expense/expense.service';
import {ExpenseTableDto} from '../../../shared/dto/expense/expense-table-dto';
import {AuditTrialDto} from '../../../shared/dto/common/audit-trial/audit-trial-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {BulkNotificationDialogService} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {ExpenseUtility} from '../expense-utility';
import {ExpenseMasterDto} from '../../../shared/dto/expense/expense-master-dto';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {ManageDrawerService} from '../../../shared/services/common/manage-drawer-status/manage-drawer.service';
import {Subscription} from 'rxjs';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {Menu} from 'primeng/menu';
import {GoogleAnalyticsService} from '../../../shared/services/google-analytics/google-analytics.service';
import {AppAnalyticsConstants} from '../../../shared/enums/app-analytics-constants';
import {OverlayPanel} from 'primeng/overlaypanel';
import {AppDocumentType} from '../../../shared/enums/app-document-type';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit, OnDestroy {
  public tableSupportBase = new TableSupportBase();

  public bulkButtonList: ButtonPropertiesDto[] = [];
  public auditTrial: AuditTrialDto[] = [];
  public expenseMasterDto: ExpenseMasterDto = new ExpenseMasterDto();
  public bulkButtonListResponsive: any;
  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public tableKeyEnum = AppTableKeysData;
  public actionLabelEnum = AppActionLabel;
  public bulkButton = AppBulkButton;
  public iconEnum = AppIcons;
  public attachmentId: number;
  public expenseUtility: ExpenseUtility = new ExpenseUtility(this.expenseService,
    this.notificationService, this.privilegeService, this.drawerService, this.billsService);
  public activeAction: ExpenseTableDto = new ExpenseTableDto();

  public multiselectValues: any;

  public isDetailView = false;
  public isEditView = false;
  public detailView = false;
  public approveExpenseView = false;
  public expenseID: any;
  public editExpense = false;
  public auditTrialPanel: boolean;
  public originalFileName: string;
  public downloadActions: any [] = [];
  public downloadActionsOne: any [] = [];
  public exportActionsOne: any [] = [];
  public exportActions: any [] = [];
  public tableActionList: any [] = [];
  public isChangeAssignee = false;
  public expenseName: any;
  public reportName: any;
  public subscription = new Subscription();
  public commonUtil = new CommonUtility();
  public appEnumConstants = AppEnumConstants;

  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();


  public isDownloading = false;
  public isExporting = false;
  private overlayId: any;
  private documentType: any;
  fromExpenseNoClick = false;

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
  @ViewChild('paymentOverlay') paymentOverlay: OverlayPanel;
  @ViewChild('menu') menu: Menu;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  constructor(private expenseService: ExpenseService, public gridService: GridService, public notificationService: NotificationService,
              public confirmationService: ConfirmationService, public bulkNotificationDialogService: BulkNotificationDialogService,
              public gaService: GoogleAnalyticsService,
              public privilegeService: PrivilegeService, public drawerService: ManageDrawerService, public billsService: BillsService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.EXPENSE_TABLE_KEY);
    this.subscription.unsubscribe();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }


  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.EXPENSE_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_EXPENSE_LIST;
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
    if (this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_QUICK_APPROVE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.QUICK_APPROVE);
    }
    if (this.privilegeService.isAuthorizedMultiple([AppAuthorities.EXPENSES_REJECT,
      AppAuthorities.EXPENSES_OVERRIDE_APPROVAL])) {
      this.availableHeaderActions.push(AppTableHeaderActions.REJECT);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_DELETE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_DOWNLOAD_REPORT)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DOWNLOAD);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_CSV_EXPORT)) {
      this.availableHeaderActions.push(AppTableHeaderActions.EXPORT);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.actionButtonInit();
    this.loadTableData();
    this.subscription = this.expenseService.updateTableData.subscribe(() => {
      if (this.tableSupportBase.searchFilterDto?.filters) {
        this.loadData(this.tableSupportBase.searchFilterDto);
      }
    });
  }

  /**
   * Loads Table Data (Settings)
   */
    loadTableData() {
    this.selectedColumns = [];
    this.onTableResize();
    sessionStorage.removeItem(AppTableKeysData.EXPENSE_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_EXPENSE_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.EXPENSE_TABLE_KEY, this.columnSelect);
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
    this.tableActionList = [
      {
        label: AppActionLabel.ACTION_LABEL_APPROVE_REJECT,
        status: this.enums.STATUS_PENDING,
        icon: AppIcons.ICON_APPROVE,
        isApproveAction: true,
        authCode: this.privilegeService.isAuthorizedMultiple([AppAuthorities.EXPENSES_APPROVE, AppAuthorities.EXPENSES_REJECT,
          AppAuthorities.EXPENSES_OVERRIDE_APPROVAL]),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_APPROVE_REJECT,
            AppAnalyticsConstants.MODULE_NAME_EXPENSES,
            AppActionLabel.ACTION_LABEL_APPROVE_REJECT
          );
          this.reportName = JSON.parse(JSON.stringify(this.activeAction))['expense.reportName'];
          this.expenseID = this.activeAction.id;
          this.attachmentId = this.activeAction.attachmentId;
          this.approveExpenseView = true;
          this.detailView = false;
          this.editExpense = false;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
        icon: AppIcons.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        isApproveAction: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_DETAIL_VIEW),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
            AppAnalyticsConstants.MODULE_NAME_EXPENSES,
            AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
          );
          this.expenseID = this.activeAction.id;
          this.fromExpenseNoClick = true;
          this.approveExpenseView = false;
          this.detailView = true;
          this.editExpense = false;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_VIEW_REPORT,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_VIEW_REPORT,
        isApproveAction: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_DOWNLOAD_REPORT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_VIEW_REPORT,
            AppAnalyticsConstants.MODULE_NAME_EXPENSES,
            AppActionLabel.ACTION_LABEL_VIEW_REPORT,
          );
          this.reportName = JSON.parse(JSON.stringify(this.activeAction))['expense.reportName'];
          this.viewExpenseReport(this.activeAction.attachmentId, this.reportName);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_EDIT_RESUBMIT,
        icon: AppIcons.ICON_EDIT,
        status: this.enums.STATUS_REJECT,
        isApproveAction: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_EDIT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_EDIT_RESUBMIT,
            AppAnalyticsConstants.MODULE_NAME_EXPENSES,
            AppActionLabel.ACTION_LABEL_EDIT_RESUBMIT,
          );
          this.edit();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_EDIT,
        icon: AppIcons.ICON_EDIT,
        status: this.enums.STATUS_PENDING,
        isApproveAction: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_EDIT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_EXPENSES,
            AppActionLabel.ACTION_LABEL_EDIT,
          );
          this.edit();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_EDIT,
        icon: AppIcons.ICON_EDIT,
        status: this.enums.STATUS_APPROVED,
        isApproveAction: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_EDIT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_EXPENSES,
            AppActionLabel.ACTION_LABEL_EDIT,
          );
          this.edit();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_EDIT,
        icon: AppIcons.ICON_EDIT,
        status: this.enums.STATUS_DRAFT,
        isApproveAction: false,
        authCode: true,
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_EXPENSES,
            AppActionLabel.ACTION_LABEL_EDIT,
          );
          this.edit();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        icon: AppIcons.ICON_DELETE,
        status: this.enums.STATUS_DRAFT,
        isApproveAction: false,
        authCode: true,
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DELETE,
            AppAnalyticsConstants.MODULE_NAME_EXPENSES,
            AppActionLabel.ACTION_LABEL_DELETE,
          );
          this.discardDraft(this.activeAction.id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_UNDO_APPROVAL,
        icon: AppIcons.ICON_UNDO_STATUS,
        status: this.enums.STATUS_COMMON,
        isApproveAction: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_UNDO),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_UNDO_APPROVAL,
            AppAnalyticsConstants.MODULE_NAME_EXPENSES,
            AppActionLabel.ACTION_LABEL_UNDO_APPROVAL,
          );
          this.undoExpense();
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_EXPORT,
        status: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_EXPORT,
        isApproveAction: false,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_CSV_EXPORT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_EXPORT,
            AppAnalyticsConstants.MODULE_NAME_EXPENSES,
            this.actionLabelEnum.ACTION_LABEL_EXPORT,
          );
          const id = this.activeAction.id;
          this.export(id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_DELETE,
        isApproveAction: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_DELETE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DELETE,
            AppAnalyticsConstants.MODULE_NAME_EXPENSES,
            AppActionLabel.ACTION_LABEL_DELETE,
          );
          this.expenseID = this.activeAction.id;
          this.deleteExpense(this.expenseID);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_AUDIT_TRAIL,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_AUDIT_TRAIL,
        isApproveAction: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_VIEW_AUDIT_TRAIL),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_AUDIT_TRAIL,
            AppAnalyticsConstants.MODULE_NAME_EXPENSES,
            AppActionLabel.ACTION_LABEL_AUDIT_TRAIL,
          );
          this.expenseService.getAuditTrial(this.activeAction.id).subscribe((res: any) => {
            this.auditTrial = res.body;
            this.auditTrialPanel = true;
          });
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_SKIP_APPROVAL,
        status: this.enums.STATUS_PENDING,
        icon: this.iconEnum.ICON_SKIP_APPROVAL,
        isApproveAction: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_SKIP_APPROVAL),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_SKIP_APPROVAL,
            AppAnalyticsConstants.MODULE_NAME_EXPENSES,
            this.actionLabelEnum.ACTION_LABEL_SKIP_APPROVAL,
          );
          const id = this.activeAction.id;
          this.skipApproval(id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_CHANGE_ASSIGNEE,
        status: this.enums.STATUS_PENDING,
        icon: this.iconEnum.ICON_CHANGE_ASSIGNEE,
        isApproveAction: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_CHANGE_ASSIGNEE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_CHANGE_ASSIGNEE,
            AppAnalyticsConstants.MODULE_NAME_EXPENSES,
            this.actionLabelEnum.ACTION_LABEL_CHANGE_ASSIGNEE,
          );
          this.expenseName = JSON.parse(JSON.stringify(this.activeAction))['expense.reportName'];
          this.expenseID = this.activeAction.id;
          this.isChangeAssignee = true;
        }
      },
    ];
  }



  /**
   * Change action button array list according to status
   * @param status statua
   */
  actionButtonList(status, expObj) {
    return this.tableActionList.filter(this.isActionMatch(status, AppEnumConstants.STATUS_COMMON, this.isValidApproveAccess(expObj)));
  }

  /**
   * This method use for filter table action match by element status
   * @param status string
   */
  isActionMatch(status, common, isAccessible) {
    return function f(element) {
      return ((element.status === status || (element.status === common && status != AppEnumConstants.STATUS_DRAFT)))
        && element.authCode && (!element.isApproveAction || isAccessible);
    };
  }

  /**
   * Download Bulk Selections
   */
  bulkDownloadSelected() {
    if (this.commonUtil.isSelectOnlyDraft(this.tableSupportBase.rows, 'expense.status')){
      this.notificationService.infoMessage(HttpResponseMessage.DRAFTED_EXPENSE_CANNOT_BE_DOWNLOAD);
      this.isDownloading = false;
      return;
    }
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.expenseService.bulkDownloadSelected(ids).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'Expense_list');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.notificationService.successMessage(HttpResponseMessage.SELECTED_EXPENSE_DOWNLOADED_SUCCESSFULLY);
        } else {
          this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
        }
        this.isDownloading = false;
      }, error => {
        this.isDownloading = false;
        this.notificationService.errorMessage(error);
      });
    }
  }


  /**
   * Download Bulk All
   */
  bulkDownloadAll() {
    if (this.tableSupportBase.rows.length !== 0){
      this.bulkDownloadSelected();
      return;
    }
    this.expenseService.bulkDownloadAll(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Expense_list');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notificationService.successMessage(HttpResponseMessage.ALL_EXPENSES_DOWNLOADED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
      this.isDownloading = false;
    }, error => {
      this.isDownloading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Export Bulk Data
   */
  bulkExportSelected() {
    if (this.commonUtil.isSelectOnlyDraft(this.tableSupportBase.rows, 'expense.status')){
      this.notificationService.infoMessage(HttpResponseMessage.DRAFTED_EXPENSE_CANNOT_BE_DOWNLOAD);
      this.isExporting = false;
      return;
    }
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.expenseService.bulkExportSelected(ids).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'Expenses.csv');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.getDataFromBackend();
          this.tableSupportBase.rows = [];
          this.notificationService.successMessage(HttpResponseMessage.SELECTED_EXPENSE_EXPORTED_SUCCESSFULLY);
        } else {
          this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
        }
        this.isExporting = false;
      }, error => {
        this.isExporting = false;
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * export single data
   * @param id to id
   */
  export(id) {
    const tempArray = [];
    tempArray.push(id);
    this.expenseService.bulkExportSelected(tempArray).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.notificationService.successMessage(HttpResponseMessage.SINGEL_EXPENSE_EXPORTED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Export Bulk Data
   */
  bulkExportAll() {
    if (this.tableSupportBase.rows.length !== 0){
      this.bulkExportSelected();
      return;
    }
    this.expenseService.bulkExportAll(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Expenses.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.getDataFromBackend();
        this.tableSupportBase.rows = [];
        this.notificationService.successMessage(HttpResponseMessage.ALL_EXPENSES_EXPORTED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
      this.isExporting = false;
    }, error => {
      this.isExporting = false;
      this.notificationService.errorMessage(error);
    });
  }

  /*
------------------------------------------SEARCH TABLE---------------------------------------------------------------------------->
 */


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
    this.expenseService.getExpenseTableData(this.tableSupportBase.searchFilterDto).subscribe(async (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.dataSource = await res.body.data;
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
    this.expenseID = val.expenseId;
  }

  /*
  ------------------------------------------SELECTED ACTION---------------------------------------------------------------------------->
   */
  /**
   * Download Expense
   */
  viewExpenseReport(attachmentId, fileName) {
    if (attachmentId != null) {
      this.expenseService.downloadAttachment(attachmentId).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          console.log('start download:', res);
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', fileName);
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
  }

  /**
   * Delete Expense
   */
  deleteExpense(id) {
    this.confirmationService.confirm({
      key: 'expenseList',
      message: 'You want to delete this Expense',
      accept: () => {
        this.expenseService.deleteExpense(id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.EXPENSE_DELETED_SUCCESSFULLY);
            this.loadTableDataRelatedMethod();
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
   * This method use for call after delete from list and detail view screens
   */
  loadTableDataRelatedMethod(){
    this.loadData(this.tableSupportBase.searchFilterDto);
    this.getDataFromBackend();
    this.tableSupportBase.rows = [];
  }

  /**
   * Skip Approval
   */
  skipApproval(id) {
    this.expenseMasterDto.id = id;
    this.expenseService.skipApproval(this.expenseMasterDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.getDataFromBackend();
        this.notificationService.successMessage(HttpResponseMessage.EXPENSE_SKIPPED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /*
  -------------------Bulk Actions-------------------------------------------------------------------------------------------------------->
   */

  /**
   * Delete Expense list
   */
  deleteExpenseList() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.confirmationService.confirm({
        message: 'You want to delete the selected record(s)',
        key: 'expenseList',
        accept: () => {
          this.expenseService.bulkDelete(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
              } else {
                this.notificationService.successMessage(HttpResponseMessage.EXPENSES_DELETED_SUCCESSFULLY);
                this.getDataFromBackend();
                this.tableSupportBase.rows = [];
              }
            } else {
              this.notificationService.errorMessage(res.body.message);
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        }
      });
    }
  }


  /**
   * bulk reject
   */
  bulkReject() {
    this.confirmationService.confirm({
      key: 'expReject',
      message: 'You want to reject the selected Expense(s)',
      accept: () => {
        if (this.tableSupportBase.rows.length > 0) {
          const ids: any[] = [];
          for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
            ids.push(this.tableSupportBase.rows[i].id);
          }
          this.expenseService.bulkReject(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
              } else {
                this.notificationService.successMessage(HttpResponseMessage.EXPENSES_REJECTED_SUCCESSFULLY);
                this.getDataFromBackend();
                this.tableSupportBase.rows = [];
              }
            } else {
              this.notificationService.infoMessage(res.body.message);
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        }
      }
    });
  }

  /**
   * bulk approve
   */
  bulkApprove() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.expenseService.bulkApprove(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.EXPENSES_APPROVED_SUCCESSFULLY);
            this.getDataFromBackend();
            this.tableSupportBase.rows = [];
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  /**
   * Is User Authorized to approve
   */
  isValidApproveAccess(expObj) {

    const user = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));

    if (this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_OVERRIDE_APPROVAL)) {
      return true;
    }

    return this.isApprovalGroupExist(user.approvalGroups, expObj) || this.isApprovalGroupUserExist(user.username, expObj);

  }

  /**
   * Approval Group equals to logged user
   */
  isApprovalGroupExist(approvalGroup, expObj) {
    if (!expObj.approvalGroup) {
      return false;
    }

    return approvalGroup.includes(expObj.approvalGroup);
  }

  /**
   * User equals to logged user
   */
  isApprovalGroupUserExist(approvalUser, expObj) {
    if (!expObj.approvalUser) {
      return false;
    }

    return approvalUser === expObj.approvalUser;
  }

  /**
   * Undo Expense
   * @private
   */
  private undoExpense() {
    this.confirmationService.confirm({
      key: 'exUA',
      message: 'You want to undo your last action',
      accept: () => {
        this.expenseService.undoExpense(this.activeAction.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.EXPENSE_UNDO_APPROVAL_SUCCESSFULLY);
            this.getDataFromBackend();
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
   * Is Expense can be Editable
   * @private
   */
  private edit() {
    this.expenseService.canEdit(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.expenseID = this.activeAction.id;
        this.editExpense = true;
        this.detailView = false;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
      this.expenseID = this.activeAction.id;
      this.editExpense = true;
      this.detailView = false;
    });
  }

  /**
   * this method can be used to discard draft record
   * @param id to draft id
   */
  discardDraft(id) {
    this.confirmationService.confirm({
      key: 'draftDiscard',
      message: 'You want to delete this Draft',
      accept: () => {
        if (!id) {
          return;
        } else {
          this.expenseService.discardDraft(id).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.notificationService.successMessage(HttpResponseMessage.DRAFT_DISCARDED_SUCCESSFULLY);
              this.getDataFromBackend();
            } else {
              this.notificationService.infoMessage(res.body.message);
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        }
      }
    });
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
      case AppEnumConstants.EXPORT_STATUS_EXPORT: {
        return AppEnumConstants.EXPORT_LABEL_EXPORT;
      }
      case AppEnumConstants.EXPORT_STATUS_NOT_EXPORT: {
        return AppEnumConstants.EXPORT_LABEL_NOT_EXPORT;
      }
      case AppEnumConstants.PAYMENT_STATUS_PROCESSING: {
        return AppEnumConstants.PAYMENT_LABEL_PROCESSING;
      }
    }
  }

  /**
   * Is the field is has data to show in overlay
   * @param field
   */
  isClassHover(field) {
    switch (field) {
      case 'expense.reportName':
          return !!this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_DETAIL_VIEW);
      case 'expense.paidAmount':
          return !!this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_DETAIL_VIEW);
    }
  }

  /**
   * A Single value clicked from table
   * @param field to filed
   * @param obj to customer obj
   */
  tdClick(field, obj: any) {
    if (obj['expense.status'] === AppEnumConstants.STATUS_DRAFT){
      this.activeAction = obj;
      this.edit();
      return ;
    }
    if (field === 'expense.reportName' && this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_DETAIL_VIEW)) {
      this.activeAction = obj;
      this.fromExpenseNoClick = true;
      this.detailView = true;
      this.expenseID = obj.id;
    }
  }

  tdHover(field: any, customer: any, event) {
    if (field === 'expense.paidAmount' && this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_DETAIL_VIEW)) {
      this.overlayId = customer.id;
      this.documentType = AppDocumentType.EXPENSE;
      showOverlay(this.paymentOverlay);
    }
    function showOverlay(overlay) {
      if (overlay.target === null || overlay.target === undefined) {
        overlay.show(event);
      }
    }
  }

  hideOverlays() {
    if (this.paymentOverlay.overlayVisible) {
      this.paymentOverlay.hide();
    }
  }


}
