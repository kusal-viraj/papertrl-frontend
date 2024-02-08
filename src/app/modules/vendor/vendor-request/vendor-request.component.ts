import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Table} from 'primeng/table';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {VendorRequestService} from '../../../shared/services/vendors/vendor-request.service';
import {TableSearchFilterDataDto} from '../../../shared/dto/table/table-search-filter-data-dto';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {VendorRequestTable} from '../../../shared/dto/vendor/vendor-request-table';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {BulkNotificationDialogService} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {VendorHomeComponent} from "../vendor-home/vendor-home.component";
import {AppTableHeaderActions} from "../../../shared/enums/app-table-header-actions";
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-vendor-request',
  templateUrl: './vendor-request.component.html',
  styleUrls: ['./vendor-request.component.scss']
})
export class VendorRequestComponent implements OnInit, OnDestroy {

  public tableSupportBase = new TableSupportBase();
  public searchFilterDto: TableSearchFilterDataDto = new TableSearchFilterDataDto();
  public bulkButtonList: ButtonPropertiesDto[] = [];

  public enums = AppEnumConstants;
  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
  public tableKeyEnum = AppTableKeysData;

  public activeAction: VendorRequestTable; // Selected Action Button
  public tableActionList: any [] = [];  // Action Button List
  public bulkButtonListResponsive: any;

  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();

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

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }


  constructor(public confirmationService: ConfirmationService, public notificationService: NotificationService,
              public gridService: GridService, public messageService: MessageService, public vendorHome: VendorHomeComponent,
              public vendorRequestService: VendorRequestService, public privilegeService: PrivilegeService,
              public bulkNotificationDialogService: BulkNotificationDialogService) {
    this.isRowSelectable = this.isRowSelectable.bind(this)
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.VENDOR_REQUEST_TABLE_KEY);
  }

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    if (this.privilegeService.isAuthorized(AppAuthorities.VENDORS_APPROVE_VENDOR_REQUEST)) {
      this.availableHeaderActions.push(AppTableHeaderActions.QUICK_APPROVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.VENDORS_REJECT_VENDOR_REQUEST)) {
      this.availableHeaderActions.push(AppTableHeaderActions.REJECT);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DELETE_VENDOR_REQUEST)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.actionButtonInit();
   }

  /**
   * Loads Table Data (Settings)
   */
    loadTableData() {
    this.selectedColumns = [];
    // Check for Responsiveness
    this.onTableResize();
    // Removes table Storage on load if present
    sessionStorage.removeItem(AppTableKeysData.VENDOR_REQUEST_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_VENDOR_REQUEST_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.VENDOR_REQUEST_TABLE_KEY, this.columnSelect);
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
        label: this.actionLabelEnum.ACTION_LABEL_APPROVE,
        status: this.enums.STATUS_PENDING,
        icon: this.iconEnum.ICON_APPROVE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDORS_APPROVE_VENDOR_REQUEST),
        command: () => {
          const id = this.activeAction.id;
          this.approveRequest(id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_REJECT,
        status: this.enums.STATUS_PENDING,
        icon: this.iconEnum.ICON_REJECT,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDORS_REJECT_VENDOR_REQUEST),
        command: () => {
          const id = this.activeAction.id;
          this.rejectRequest(id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_REJECT,
        icon: this.iconEnum.ICON_DELETE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DELETE_VENDOR_REQUEST),
        command: () => {
          const id = this.activeAction.id;
          this.deleteRequest(id);
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

  getDataFromBackend() {
    this.vendorRequestService.getVendorRequestTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.dataSource = res.body.data;
          this.tableSupportBase.totalRecords = res.body.totalRecords;
          if (this.tableSupportBase.totalRecords === 0) {
            this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('{first}', '0');
          } else {
            this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('0', '{first}');
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }

  rowSelected() {

  }

  isRowSelectable(data) {
    return !this.isDisabled(data.data);
  }

  isDisabled(data) {
    return data['req.status'] == AppEnumConstants.STATUS_APPROVED;
  }

  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
this.tableSupportBase.columnChange(val);
  }

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.VENDOR_REQUEST_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_VENDOR_REQUEST_LIST;
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

  /**
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: VendorRequestTable) {
    this.activeAction = val;
  }


  /**
   * This method use for handle bulk action events
   * @param action to button type
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_APPROVE:
        this.requestsBulkApprove();
        break;
      case AppBulkButton.BUTTON_REJECT:
        this.requestsBulkReject();
        break;
      case AppBulkButton.BUTTON_DELETE:
        this.requestsBulkDelete();
        break;
    }
  }


  public approveRequest(id: any) {
    this.vendorRequestService.approveRequest(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.vendorHome.refreshVendorList();
        this.getDataFromBackend();
        this.tableSupportBase.rows = [];
        this.notificationService.successMessage(HttpResponseMessage.VEN_REQUEST_SUCCESSFULLY_APPROVED);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  public rejectRequest(id: any) {
    this.vendorRequestService.rejectRequest(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.getDataFromBackend();
        this.tableSupportBase.rows = [];
        this.notificationService.successMessage(HttpResponseMessage.VEN_REQUEST_SUCCESSFULLY_REJECTED);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  public deleteRequest(id: any) {
    this.confirmationService.confirm({
      message: 'You want to delete this Request',
      key: 'v-request',
      accept: () => {
        this.vendorRequestService.deleteRequest(id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.getDataFromBackend();
            this.tableSupportBase.rows = [];
            this.notificationService.successMessage(HttpResponseMessage.VEN_REQUEST_SUCCESSFULLY_DELETED);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  requestsBulkApprove() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.vendorRequestService.bulkRequestApprove(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.vendorHome.refreshVendorList();
            this.tableSupportBase.rows = [];
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
            this.getDataFromBackend();
          } else {
            this.tableSupportBase.rows = [];
            this.notificationService.successMessage(HttpResponseMessage.VEN_REQUESTS_SUCCESSFULLY_APPROVED);
            this.getDataFromBackend();
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  requestsBulkReject() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.vendorRequestService.bulkRequestReject(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.tableSupportBase.rows = [];
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
            this.getDataFromBackend();
          } else {
            this.tableSupportBase.rows = [];
            this.notificationService.successMessage(HttpResponseMessage.VEN_REQUESTS_SUCCESSFULLY_REJECTED);
            this.getDataFromBackend();
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  requestsBulkDelete() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }

      this.confirmationService.confirm({
        message: 'You want to delete these Selected Request(s)',
        key: 'v-request',
        accept: () => {
          this.vendorRequestService.bulkRequestDelete(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.tableSupportBase.rows = [];
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.getDataFromBackend();
              } else {
                this.tableSupportBase.rows = [];
                this.notificationService.successMessage(HttpResponseMessage.VEN_REQUESTS_SUCCESSFULLY_DELETED);
                this.getDataFromBackend();
              }
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
}

