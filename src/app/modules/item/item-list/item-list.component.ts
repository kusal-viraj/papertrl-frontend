import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Table} from 'primeng/table';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {ItemService} from '../../../shared/services/items/item.service';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {ItemTableDto} from '../../../shared/dto/item/item-table-dto';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {ItemUtility} from '../item-utility';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {BulkNotificationDialogService} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {Subscription} from 'rxjs';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {Menu} from 'primeng/menu';
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit, OnDestroy {

  public tableSupportBase = new TableSupportBase();

  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any;

  public enums = AppEnumConstants;
  public tableKeyEnum = AppTableKeysData;
  public itemUtility: ItemUtility = new ItemUtility(this.privilegeService, this.itemService, this.messageService, this.notificationService, this.billsService);

  public activeAction: ItemTableDto;

  public isDetailView = false;
  public isEditView = false;
  public itemID: any;
  public subscription = new Subscription();

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

  constructor(public itemService: ItemService, public messageService: MessageService, public gridService: GridService,
              public confirmationService: ConfirmationService, public gaService: GoogleAnalyticsService,
              public notificationService: NotificationService, public billsService: BillsService,
              public bulkNotificationDialogService: BulkNotificationDialogService, public privilegeService: PrivilegeService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.Item_TABLE_KEY);
    this.subscription.unsubscribe();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.Item_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_ITEM_LIST;
      this.gridService.updateTableState(this.tableSupportBase.tableDataOptions).subscribe((res: any) => {
        if (event === true){
          this.loadTableData();
        }
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    });
  }

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    if (this.privilegeService.isAuthorized(AppAuthorities.ITEMS_INACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.INACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.ITEMS_ACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.ACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.ITEMS_DELETE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);



    this.loadTableData();
    this.actionButtonInit();
    this.itemUtility.getItemTypes(this.itemUtility.itemTypes, false);
    this.itemUtility.getCategory(this.itemUtility.category, false);
    this.subscription = this.itemService.updateTableData.subscribe(() => {
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
        label: AppActionLabel.ACTION_LABEL_EDIT,
        icon: AppIcons.ICON_EDIT,
        status: this.enums.STATUS_ACTIVE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.ITEMS_EDIT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_ITEM,
            AppActionLabel.ACTION_LABEL_EDIT,
          );
          this.itemID = this.activeAction.id;
          this.isDetailView = false;
          this.isEditView = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_DELETE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.ITEMS_DELETE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DELETE,
            AppAnalyticsConstants.MODULE_NAME_ITEM,
            AppActionLabel.ACTION_LABEL_DELETE,
          );
          this.deleteItem();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_INACTIVATE,
        status: this.enums.STATUS_ACTIVE,
        icon: AppIcons.ICON_INACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.ITEMS_INACTIVATE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_INACTIVATE,
            AppAnalyticsConstants.MODULE_NAME_ITEM,
            AppActionLabel.ACTION_LABEL_INACTIVATE,
          );
          this.inactiveItem();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_ACTIVATE,
        status: this.enums.STATUS_INACTIVE,
        icon: AppIcons.ICON_ACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.ITEMS_ACTIVATE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_ACTIVATE,
            AppAnalyticsConstants.MODULE_NAME_ITEM,
            AppActionLabel.ACTION_LABEL_ACTIVATE,
          );
          this.activeItem();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
        icon: AppIcons.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.ITEMS_DETAIL_VIEW),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
            AppAnalyticsConstants.MODULE_NAME_ITEM,
            AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
          );
          this.itemID = this.activeAction.id;
          this.isDetailView = true;
          this.isEditView = false;
        }
      }
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
    sessionStorage.removeItem(AppTableKeysData.Item_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_ITEM_LIST).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.Item_TABLE_KEY, this.columnSelect);
    });
  }


  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.itemService.getItemTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
  actionButtonClick(val: ItemTableDto) {
    this.activeAction = val;
    this.itemID = val.id;
  }

  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_ACTIVATE:
        this.activeItemList();
        break;
      case  AppBulkButton.BUTTON_INACTIVATE:
        this.inactiveItemList();
        break;
      case AppBulkButton.BUTTON_DELETE:
        this.deleteItemList();
        break;
    }
  }

  /**
   * inactive item
   */
  inactiveItem() {
    this.itemService.inactiveItem(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.ITEM_INACTIVATED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * inactive  item
   */
  activeItem() {
    this.itemService.activeItem(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.ITEM_ACTIVATED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * deleteExpense item
   */
  deleteItem() {
    this.confirmationService.confirm({
      key: 'itemDelete',
      message: 'You want to delete this Item <br><br> ' +
        'If you perform this action, any associated items will be deleted as well',
      accept: () => {
        this.itemService.deleteItem(this.activeAction.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.ITEM_DELETED_SUCCESSFULLY);
            this.tableSupportBase.rows = [];
            this.loadData(this.tableSupportBase.searchFilterDto);
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
   * this method can be used to active account bulk
   */
  activeItemList() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.itemService.activeItemList(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
            this.loadData(this.tableSupportBase.searchFilterDto);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.ITEMS_ACTIVATED_SUCCESSFULLY);
            this.loadData(this.tableSupportBase.searchFilterDto);
          }
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to inactive account bulk
   */
  inactiveItemList() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.itemService.inactiveItemList(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
            this.loadData(this.tableSupportBase.searchFilterDto);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.ITEMS_INACTIVATED_SUCCESSFULLY);
            this.loadData(this.tableSupportBase.searchFilterDto);
          }
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to deleteExpense account bulk
   */
  deleteItemList() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.confirmationService.confirm({
        key: 'itemDelete',
        message: 'You want to delete the selected Item(s) <br><br>' +
          'If you perform this action, any associated items will be deleted as well',
        accept: () => {
          this.itemService.deleteItemList(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.loadData(this.tableSupportBase.searchFilterDto);
                this.tableSupportBase.rows = [];
              } else {
                this.notificationService.successMessage(HttpResponseMessage.ITEMS_DELETED_SUCCESSFULLY);
                this.tableSupportBase.rows = [];
                this.loadData(this.tableSupportBase.searchFilterDto);
              }
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        }
      });
    }
  }

  /**
   * get refreshTable data
   * @param value to emitted value
   */
  isRefreshTable(value) {
    if (value === 'ITEM_UPDATED') {
      this.loadData(this.tableSupportBase.searchFilterDto);
    }
  }
}
