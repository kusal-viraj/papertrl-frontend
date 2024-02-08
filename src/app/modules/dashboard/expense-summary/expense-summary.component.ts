import {Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import {TableSupportBase} from "../../../shared/utility/table-support-base";
import {ButtonPropertiesDto} from "../../../shared/dto/common/Buttons/button-properties-dto";
import {AuditTrialDto} from "../../../shared/dto/common/audit-trial/audit-trial-dto";
import {ExpenseMasterDto} from "../../../shared/dto/expense/expense-master-dto";
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {AppTableKeysData} from "../../../shared/enums/app-table-keys-data";
import {AppActionLabel} from "../../../shared/enums/app-action-label";
import {AppIcons} from "../../../shared/enums/app-icons";
import {ExpenseTableDto} from "../../../shared/dto/expense/expense-table-dto";
import {Table} from "primeng/table";
import {ExpenseService} from "../../../shared/services/expense/expense.service";
import {GridService} from "../../../shared/services/common/table/grid.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {ConfirmationService, LazyLoadEvent} from "primeng/api";
import {BulkNotificationDialogService} from "../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {AppWindowResolution} from "../../../shared/enums/app-window-resolution";
import {AppConstant} from "../../../shared/utility/app-constant";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {AppBulkButton} from "../../../shared/enums/app-bulk-button";
import {BulkNotificationsComponent} from "../../common/bulk-notifications/bulk-notifications.component";
import {AppTableHeaderActions} from "../../../shared/enums/app-table-header-actions";
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-expense-summary',
  templateUrl: './expense-summary.component.html',
  styleUrls: ['./expense-summary.component.scss']
})
export class ExpenseSummaryComponent implements OnInit {

  public tableSupportBase = new TableSupportBase();

  public bulkButtonList: ButtonPropertiesDto[] = [];
  public auditTrial: AuditTrialDto[] = [];
  public expenseMasterDto: ExpenseMasterDto = new ExpenseMasterDto();
  public bulkButtonListResponsive: any;
  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public tableKeyEnum = AppTableKeysData;
  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
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
  public appConstant: AppConstant = new AppConstant();

  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];


  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);

  }

  @Output() updateCards = new EventEmitter();


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

  constructor(private expenseService: ExpenseService, public gridService: GridService, public notificationService: NotificationService,
              public confirmationService: ConfirmationService, public bulkNotificationDialogService: BulkNotificationDialogService,
              public privilegeService: PrivilegeService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.EXPENSE_TABLE_KEY);
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }


  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.EXPENSE_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_DASHBOARD_EXPENSE_LIST;
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

    this.loadBulkButtonData();
    this.actionButtonInit();
    this.actionData();
    this.loadTableData();
  }

  /**
   * Loads Table Data (Settings)
   */
    loadTableData() {
    this.selectedColumns = [];
    this.onTableResize();
    sessionStorage.removeItem(AppTableKeysData.EXPENSE_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_DASHBOARD_EXPENSE_LIST).subscribe((res: any) => {
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
          this.expenseID = this.activeAction.id;
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
          this.expenseID = this.activeAction.id;
          this.approveExpenseView = false;
          this.detailView = true;
          this.editExpense = false;
        }
      },
    ];
  }

  /**
   * Change action button array list according to status
   * @param status status
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
      return ((element.status === status || element.status === common)) && element.authCode && (!element.isApproveAction || isAccessible);
    };
  }

  /**
   * this method can used to get actions
   */

  actionData() {
    this.downloadActions = [
      {
        label: this.actionLabelEnum.ACTION_DOWNLOAD_SELECTED,
        icon: this.iconEnum.ICON_DOWNLOAD_BILL_FONT_AWESOME,
        command: () => {
          this.bulkDownloadSelected();
        }
      },
      {
        label: this.actionLabelEnum.ACTION_DOWNLOAD_All,
        icon: this.iconEnum.ICON_DOWNLOAD_BILL_FONT_AWESOME,
        command: () => {
          this.bulkDownloadAll();
        }
      },
    ];

    this.downloadActionsOne = [
      {
        label: this.actionLabelEnum.ACTION_DOWNLOAD_All,
        icon: this.iconEnum.ICON_DOWNLOAD_BILL_FONT_AWESOME,
        command: () => {
          this.bulkDownloadAll();
        }
      },
    ];

    this.exportActions = [
      {
        label: this.actionLabelEnum.ACTION_EXPORT_SELECTED,
        icon: this.iconEnum.ICON_EXPORT,
        command: () => {
          this.bulkExportSelected();
        }
      },
      {
        label: this.actionLabelEnum.ACTION_EXPORT_All,
        icon: this.iconEnum.ICON_EXPORT,
        command: () => {
          this.bulkExportAll();
        }
      },
    ];
    this.exportActionsOne = [
      {
        label: this.actionLabelEnum.ACTION_EXPORT_All,
        icon: this.iconEnum.ICON_EXPORT,
        command: () => {
          this.bulkExportAll();
        }
      },
    ];
  }

  /**
   * Download Bulk Selections
   */
  bulkDownloadSelected() {
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
          link.setAttribute('download', 'Receipts');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.notificationService.successMessage(HttpResponseMessage.SELECTED_EXPENSE_DOWNLOADED_SUCCESSFULLY);
        } else {
          this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  /**
   * Download Bulk All
   */
  bulkDownloadAll() {
    this.expenseService.bulkDownloadAll(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Receipts');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notificationService.successMessage(HttpResponseMessage.ALL_EXPENSES_DOWNLOADED_SUCCESSFULLY);
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
  bulkExportSelected() {
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
          link.setAttribute('download', 'Receipts.csv');
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
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * Export Bulk Data
   */
  bulkExportAll() {
    this.expenseService.bulkExportAll(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Receipts.csv');
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
    }, error => {
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
    this.expenseService.getDashboardExpenseTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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

  loadBulkButtonData() {
    this.expenseService.getExpenseBulkActionData().subscribe((res: any) => {
      if (res.status === AppResponseStatus.STATUS_SUCCESS) {
        const arr = [];
        for (const property of res.body) {
          const val: ButtonPropertiesDto = property;
          arr.push(
            {
              label: val.label, action: val.action, authCode: val.authCode, disabled: !val.active, icon: val.icon, command: (event) => {
                this.bulkButtonAction(event.item.action);
              }
            }
          );
        }
        this.bulkButtonListResponsive = arr;
        this.bulkButtonList = res.body;
      }
    });
  }

  /**
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: ExpenseTableDto) {
    this.activeAction = val;
    this.expenseID = val.expenseId;
  }

  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_REJECT:
        this.bulkReject();
        break;
      case  AppBulkButton.BUTTON_QUICK_APPROVE:
        this.bulkApprove();
        break;
      case AppBulkButton.BUTTON_DELETE:
        this.deleteExpenseList();
        break;
    }
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
      key: 'expense',
      message: 'You want to delete this Expense',
      accept: () => {
        this.expenseService.deleteExpense(id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.loadData(this.tableSupportBase.searchFilterDto);
            this.notificationService.successMessage(HttpResponseMessage.EXPENSE_DELETED_SUCCESSFULLY);
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
        message: 'You want to delete the selected Expense(s)',
        key: 'expense',
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
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
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
          this.notificationService.errorMessage(res.body.message);
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
   * Is the field is has data to show in overlay
   * @param field
   */
  isClassHover(field) {
    switch (field) {
      case 'expense.reportName':
        return !!this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_DETAIL_VIEW);
    }
  }

  /**
   * A Single value clicked from table
   * @param field to filed
   * @param obj to customer obj
   */
  tdClick(field, obj: any, event) {
    if (field === 'expense.reportName' && this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_DETAIL_VIEW)) {
      this.activeAction = obj;
      this.detailView = true;
      this.expenseID = obj.id;
    }
  }


}
