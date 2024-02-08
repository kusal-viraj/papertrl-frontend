import {Component, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from "../../../shared/utility/table-support-base";
import {ButtonPropertiesDto} from "../../../shared/dto/common/Buttons/button-properties-dto";
import {AuditTrialDto} from "../../../shared/dto/common/audit-trial/audit-trial-dto";
import {ExpenseMasterDto} from "../../../shared/dto/expense/expense-master-dto";
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {AppTableKeysData} from "../../../shared/enums/app-table-keys-data";
import {AppActionLabel} from "../../../shared/enums/app-action-label";
import {AppIcons} from "../../../shared/enums/app-icons";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {Subscription} from "rxjs";
import {Table} from "primeng/table";
import {AppWindowResolution} from "../../../shared/enums/app-window-resolution";
import {UntypedFormBuilder} from "@angular/forms";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {ExpenseService} from "../../../shared/services/expense/expense.service";
import {BillsService} from "../../../shared/services/bills/bills.service";
import {BulkNotificationDialogService} from "../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {GridService} from "../../../shared/services/common/table/grid.service";
import {ConfirmationService, LazyLoadEvent} from "primeng/api";
import {AppConstant} from "../../../shared/utility/app-constant";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {ExpenseTableDto} from "../../../shared/dto/expense/expense-table-dto";
import {AppBulkButton} from "../../../shared/enums/app-bulk-button";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {BulkNotificationsComponent} from "../../common/bulk-notifications/bulk-notifications.component";
import {CreateCreditCardFormComponent} from "../create-credit-card-form/create-credit-card-form.component";
import {FormGuardService} from "../../../shared/guards/form-guard.service";
import {BillSubmitService} from "../../../shared/services/bills/bill-submit.service";
import {DropdownDto} from "../../../shared/dto/common/dropDown/dropdown-dto";
import {AppTableHeaderActions} from "../../../shared/enums/app-table-header-actions";
import {Menu} from "primeng/menu";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";

@Component({
  selector: 'app-credit-card-list',
  templateUrl: './credit-card-list.component.html',
  styleUrls: ['./credit-card-list.component.scss']
})
export class CreditCardListComponent implements OnInit {

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
  public editView: boolean;
  public subscription = new Subscription();
  public vendorList: DropdownDto = new DropdownDto();
  public AppAnalyticsConstants = AppAnalyticsConstants;
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
    sessionStorage.removeItem(AppTableKeysData.ADD_CARD_TABLE_KEY);
    this.subscription.unsubscribe();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }


  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService,
              public expenseService: ExpenseService, public billsService: BillsService,
              public bulkNotificationDialogService: BulkNotificationDialogService,
              public privilegeService: PrivilegeService, public gridService: GridService,
              public gaService: GoogleAnalyticsService,
              public confirmationService: ConfirmationService, public formGuardService: FormGuardService,
              public billSubmitService: BillSubmitService) {
  }

  ngOnInit(): void {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    if (this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_INACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.INACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_ACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.ACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_DELETE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.actionButtonInit();
    this.getVendorList();
    this.loadTableData();
    this.subscription = this.expenseService.cardListSubject.subscribe(() => {
      if (this.tableSupportBase.searchFilterDto?.filters) {
        this.getDataFromBackend();
      }
    });
  }

  /**
   * This method use for get vendor list for dropdown
   */
  getVendorList() {
    this.billsService.getVendorList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.vendorList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.ADD_CARD_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_ADD_CARD_LIST;
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
    sessionStorage.removeItem(AppTableKeysData.ADD_CARD_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_ADD_CARD_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.ADD_CARD_TABLE_KEY, this.columnSelect);
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
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_EDIT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_CREDIT_CARD,
            AppActionLabel.ACTION_LABEL_EDIT,
          );
          this.editView = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_DELETE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_DELETE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DELETE,
            AppAnalyticsConstants.MODULE_NAME_CREDIT_CARD,
            AppActionLabel.ACTION_LABEL_DELETE,
          );
          this.deleteCard(this.activeAction.id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_INACTIVATE,
        status: this.enums.STATUS_ACTIVE,
        icon: AppIcons.ICON_INACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_INACTIVATE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_INACTIVATE,
            AppAnalyticsConstants.MODULE_NAME_CREDIT_CARD,
            AppActionLabel.ACTION_LABEL_INACTIVATE,
          );
          this.inactivateCard(this.activeAction.id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_ACTIVATE,
        status: this.enums.STATUS_INACTIVE,
        icon: AppIcons.ICON_ACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_ACTIVATE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_ACTIVATE,
            AppAnalyticsConstants.MODULE_NAME_CREDIT_CARD,
            AppActionLabel.ACTION_LABEL_ACTIVATE,
          );
          this.activateCard(this.activeAction.id);
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
    this.expenseService.getAddCardTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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

  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_ACTIVATE:
        this.activateBulkCards();
        break;
      case  AppBulkButton.BUTTON_INACTIVATE:
        this.inactivateBulkCards();
        break;
      case AppBulkButton.BUTTON_DELETE:
        this.deleteBulkCards();
        break;
    }
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

  inactivateCard(id) {
    this.expenseService.inactivateCard(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_INACTIVATED_SUCCESSFULLY);
        this.getDataFromBackend();
        this.tableSupportBase.rows = [];
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  activateCard(id) {
    this.expenseService.activateCard(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_ACTIVATED_SUCCESSFULLY);
        this.getDataFromBackend();
        this.tableSupportBase.rows = [];
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  deleteBulkCards() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.confirmationService.confirm({
        message: 'You want to delete the selected Credit card(s)',
        key: 'delete',
        accept: () => {
          this.expenseService.bulkCardDelete(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
              } else {
                this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_BULK_DELETED_SUCCESSFULLY);
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

  inactivateBulkCards() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.expenseService.bulkCardInactivate(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_BULK_INACTIVATED_SUCCESSFULLY);
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

  activateBulkCards() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.expenseService.bulkCardActivate(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_BULK_ACTIVATED_SUCCESSFULLY);
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
}
