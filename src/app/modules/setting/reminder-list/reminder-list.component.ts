import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AuditTrialDto} from '../../../shared/dto/common/audit-trial/audit-trial-dto';
import {ExpenseMasterDto} from '../../../shared/dto/expense/expense-master-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {Subscription} from 'rxjs';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {CreateCreditCardFormComponent} from '../../expense/create-credit-card-form/create-credit-card-form.component';
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
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {BillSubmitService} from '../../../shared/services/bills/bill-submit.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppConstant} from '../../../shared/utility/app-constant';
import {ExpenseTableDto} from '../../../shared/dto/expense/expense-table-dto';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {ManageFeatureService} from '../../../shared/services/settings/manage-feature/manage-feature.service';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-reminder-list',
  templateUrl: './reminder-list.component.html',
  styleUrls: ['./reminder-list.component.scss']
})
export class ReminderListComponent implements OnInit, OnDestroy {
  public activeAction: any;

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
  public multiselectValues: any;
  public commonUtil = new CommonUtility();
  public appEnumConstants = AppEnumConstants;
  public editView = false;
  public detailView = false;
  public subscription = new Subscription();
  public vendorList: DropdownDto = new DropdownDto();
  public documentTypeList: DropdownDto = new DropdownDto();
  public eventTypeList: DropdownDto = new DropdownDto();

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

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('createCreditCardFormComponent') createCreditCardFormComponent: CreateCreditCardFormComponent;
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
    sessionStorage.removeItem(AppTableKeysData.REMINDER_TABLE_KEY);
    this.subscription.unsubscribe();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }


  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService,
              public expenseService: ExpenseService, public billsService: BillsService,
              public bulkNotificationDialogService: BulkNotificationDialogService,
              public privilegeService: PrivilegeService, public gridService: GridService,
              public confirmationService: ConfirmationService, public formGuardService: FormGuardService,
              public billSubmitService: BillSubmitService, public manageFeatureService: ManageFeatureService) {
  }

  ngOnInit(): void {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    this.availableHeaderActions.push(AppTableHeaderActions.INACTIVE);
    this.availableHeaderActions.push(AppTableHeaderActions.ACTIVE);
    this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.actionButtonInit();
    this.loadTableData();
    this.getDocumentTypes();
    this.getEventTypes();
    this.subscription = this.expenseService.cardListSubject.subscribe(() => {
      if (this.tableSupportBase.searchFilterDto?.filters) {
        this.getDataFromBackend();
      }
    });
  }

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.REMINDER_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_REMINDER_LIST;
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


  getDocumentTypes() {
    this.manageFeatureService.getDocumentTypes().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.documentTypeList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getEventTypes() {
    this.manageFeatureService.getAllEventTypes().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.eventTypeList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Loads Table Data (Settings)
   */
    loadTableData() {
    this.selectedColumns = [];
    this.onTableResize();
    sessionStorage.removeItem(AppTableKeysData.REMINDER_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_REMINDER_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.REMINDER_TABLE_KEY, this.columnSelect);
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
        status: this.enums.STATUS_ACTIVE,
        authCode: true,
        command: () => {
          this.detailView = false;
          this.editView = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
        icon: AppIcons.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        authCode: true,
        command: () => {
          this.editView = false;
          this.detailView = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_DELETE,
        authCode: true,
        command: () => {
          this.deleteCard(this.activeAction.id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_INACTIVATE,
        status: this.enums.STATUS_ACTIVE,
        icon: AppIcons.ICON_INACTIVATE,
        authCode: true,
        command: () => {
          this.inactivate(this.activeAction.id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_ACTIVATE,
        status: this.enums.STATUS_INACTIVE,
        icon: AppIcons.ICON_ACTIVATE,
        authCode: true,
        command: () => {
          this.activate(this.activeAction.id);
        }
      },
    ];
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
    this.manageFeatureService.getReminderTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
      key: 'deleteReminder',
      message: 'You want to delete this Reminder',
      accept: () => {
        this.manageFeatureService.deleteReminder(id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.loadData(this.tableSupportBase.searchFilterDto);
            this.notificationService.successMessage(HttpResponseMessage.REMINDER_DELETED_SUCCESSFULLY);
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

  inactivate(id) {
    this.manageFeatureService.inactivateReminder(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.notificationService.successMessage(HttpResponseMessage.REMINDER_INACTIVATED_SUCCESSFULLY);
        this.getDataFromBackend();
        this.tableSupportBase.rows = [];
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  activate(id) {
    this.manageFeatureService.activateReminder(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.notificationService.successMessage(HttpResponseMessage.REMINDER_ACTIVATED_SUCCESSFULLY);
        this.getDataFromBackend();
        this.tableSupportBase.rows = [];
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  deleteBulk() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.confirmationService.confirm({
        message: 'You want to delete the selected Reminder(s)',
        key: 'deleteReminder',
        accept: () => {
          this.manageFeatureService.bulkReminderDelete(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
              } else {
                this.notificationService.successMessage(HttpResponseMessage.REMINDER_BULK_DELETED_SUCCESSFULLY);
              }
              this.getDataFromBackend();
              this.tableSupportBase.rows = [];
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

  inactivateBulk() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.manageFeatureService.bulkReminderInactivate(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.REMINDER_BULK_INACTIVATED_SUCCESSFULLY);
          }
          this.getDataFromBackend();
          this.tableSupportBase.rows = [];
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  activateBulk() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.manageFeatureService.bulkReminderActivate(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.REMINDER_BULK_ACTIVATED_SUCCESSFULLY);
          }
          this.getDataFromBackend();
          this.tableSupportBase.rows = [];
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  getDropdownData(col: any) {
    switch (col.field) {
      case 'reminder.documentTypeId':
        return this.documentTypeList.data;
      case 'reminder.eventId':
        return this.eventTypeList.data;
      case 'reminder.status':
        return col.dropdownValues;
    }

  }
}
