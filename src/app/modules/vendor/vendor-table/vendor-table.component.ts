import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {RoleTableDto} from '../../../shared/dto/role/role-table-dto';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {Table} from 'primeng/table';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {VendorService} from '../../../shared/services/vendors/vendor.service';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {VendorHomeComponent} from "../vendor-home/vendor-home.component";
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {BulkNotificationsComponent} from "../../common/bulk-notifications/bulk-notifications.component";
import {BulkNotificationDialogService} from "../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service";
import {AppTableHeaderActions} from "../../../shared/enums/app-table-header-actions";
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-vendor-table',
  templateUrl: './vendor-table.component.html',
  styleUrls: ['./vendor-table.component.scss']
})
export class VendorTableComponent implements OnInit, OnDestroy {

  public tableSupportBase = new TableSupportBase();

  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any;
  public appAuthorities = AppAuthorities;
  public enums = AppEnumConstants;
  public activeAction: any;
  public tableKeyEnum = AppTableKeysData;

  public countries = [];


  public vendorId: any;
  public vendorDetail: boolean;

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

  constructor(private vendorService: VendorService, public messageService: MessageService, public notificationService: NotificationService,
              public gridService: GridService, public confirmationService: ConfirmationService, public vendorHome: VendorHomeComponent,
              public privilegeService: PrivilegeService, public bulkNotificationDialogService: BulkNotificationDialogService) {

  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.VENDOR_TABLE_KEY);
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.VENDOR_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_COMMUNITY_VENDOR_LIST;
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
    if (this.privilegeService.isAuthorized(AppAuthorities.VENDORS_ADD_TO_LOCAL_VENDOR_LIST)) {
      this.availableHeaderActions.push(AppTableHeaderActions.VENDOR_ADD_LOCAL);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadCountryList();
    this.loadTableData();
    this.actionButtonInit();
  }

  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableSupportBase.tableActionList = [

      {
        label: AppActionLabel.ACTION_ADD_TO_LOCAL,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_ADD_TO_LOCAL,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDORS_ADD_TO_LOCAL_VENDOR_LIST),
        command: () => {
          const id = this.activeAction.id;
          this.addToLocal(id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
        icon: AppIcons.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDOR_COMMUNITY_VENDORS_DETAIL_VIEW),
        command: () => {
          this.vendorId = this.activeAction.id;
          this.vendorDetail = true;
        }
      },
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
    sessionStorage.removeItem(AppTableKeysData.VENDOR_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_COMMUNITY_VENDOR_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.VENDOR_TABLE_KEY, this.columnSelect);
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }



  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.getDataFromBackend();

  }




  public getDataFromBackend() {
    this.vendorService.getCommunityVendorsTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
        if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
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


  /**
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: RoleTableDto) {
    this.vendorDetail = false;
    this.activeAction = val;
  }

  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_ADD:
        this.addBulkToLocal();
        break;
    }
  }

  addToLocal(id) {
    this.vendorService.addToLocal(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.getDataFromBackend();
        this.tableSupportBase.rows = [];
        this.vendorHome.refreshVendorList();
        this.notificationService.successMessage(HttpResponseMessage.VEN_ADDED_TO_LOCAL_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  addBulkToLocal() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.confirmationService.confirm({
        message: 'You want to add selected vendor(s) to local vendor list',
        key: 'vendorTable',
        accept: () => {
          this.vendorService.bulkAddToLocal(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.getDataFromBackend();
                this.tableSupportBase.rows = [];
                this.vendorHome.refreshVendorList();
              } else {
                this.notificationService.successMessage(HttpResponseMessage.VENS_ADDED_TO_LOCAL_SUCCESSFULLY);
                this.getDataFromBackend();
                this.tableSupportBase.rows = [];
                this.vendorHome.refreshVendorList();
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

  /**
   * This method can be use for load county list
   */
  loadCountryList() {
    this.vendorService.getCountries().subscribe((res) => {
      this.countries = (res.body);
    });
  }


  getDropDown(col: any) {
    switch (col.field) {
      case 'address.country':
        return this.countries;
    }
  }
}

