import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {VendorInvitationMasterDto} from '../../../shared/dto/vendor/vendor-invitation-master-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {VendorBillTableDto} from '../../../shared/dto/vendor/vendor-bill-table-dto';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppConstant} from '../../../shared/utility/app-constant';
import {Table} from 'primeng/table';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {InvitationService} from '../../../shared/services/vendors/invitation.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {VendorService} from '../../../shared/services/vendors/vendor.service';
import {BulkNotificationDialogService} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {Subscription} from 'rxjs';
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-vendor-group',
  templateUrl: './vendor-group.component.html',
  styleUrls: ['./vendor-group.component.scss']
})
export class VendorGroupComponent implements OnInit, OnDestroy {

  public tableSupportBase = new TableSupportBase();
  public bulkButtonList: ButtonPropertiesDto[] = [];
  public vendorInvitationRequestDto: VendorInvitationMasterDto = new VendorInvitationMasterDto();


  public enums = AppEnumConstants;
  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
  public tableKeyEnum = AppTableKeysData;

  public activeAction: VendorBillTableDto; // Selected Action Button
  public tableActionList: any [] = [];  // Action Button List

  public buttonValueInVendorTabResponsive: any;
  public bulkButtonListResponsive: any;
  public appAuthorities = AppAuthorities;

  public showFilter = false;
  public showFilterColumns = false;
  public editView = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();
  public subscription: Subscription = new Subscription();
  public createGroupPanel = false;


  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);
  }

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  @ViewChild('dt') table: Table;
  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('menu') menu: Menu;
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }


  constructor(public confirmationService: ConfirmationService, public notificationService: NotificationService,
              public vendorService: VendorService, public privilegeService: PrivilegeService,
              public gridService: GridService, public messageService: MessageService,
              public bulkNotificationDialogService: BulkNotificationDialogService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.VENDOR_GROUP_TABLE_KEY);
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    if (this.privilegeService.isAuthorized(AppAuthorities.VENDOR_GROUP_ACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.ACTIVE);
    }

    if (this.privilegeService.isAuthorized(AppAuthorities.VENDOR_GROUP_INACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.INACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.VENDOR_GROUP_DELETE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.actionButtonInit();
    this.subscription = this.vendorService.groupSubject.subscribe(
      (val: any) => {
        this.getDataFromBackend();
      },
    );
  }

  /**
   * Loads Table Data (Settings)
   */
    loadTableData() {
    this.selectedColumns = [];
    // Check for Responsiveness
    this.onTableResize();
    // Removes table Storage on load if present
    sessionStorage.removeItem(AppTableKeysData.VENDOR_GROUP_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_VENDOR_VENDOR_GROUP_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.VENDOR_GROUP_TABLE_KEY, this.columnSelect);
        } else {
          this.notificationService.infoMessage(res.body.message);
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

  getDataFromBackend() {
    if (!this.tableSupportBase.searchFilterDto?.filters) {
      return;
    }
    this.vendorService.getVendorGroupTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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


  actionButtonInit() {
    this.tableSupportBase.tableActionList = [
      {
        label: this.actionLabelEnum.ACTION_LABEL_ACTIVATE,
        status: this.enums.STATUS_INACTIVE,
        icon: this.iconEnum.ICON_ACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDOR_GROUP_ACTIVATE),
        command: () => {
          this.activateGroup();
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_INACTIVATE,
        status: this.enums.STATUS_ACTIVE,
        icon: this.iconEnum.ICON_INACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDOR_GROUP_INACTIVATE),
        command: () => {
          this.inactiveGroup();
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_EDIT,
        status: this.enums.STATUS_ACTIVE,
        icon: this.iconEnum.ICON_EDIT,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDOR_GROUP_EDIT),
        command: () => {
          const id = this.activeAction.id;
          this.editView = true;
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_DELETE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDOR_GROUP_DELETE),
        command: () => {
          const id = this.activeAction.id;
          this.deleteVendorGroup(id);
        }
      },
    ];
  }

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.VENDOR_GROUP_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_VENDOR_VENDOR_GROUP_LIST;
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
  actionButtonClick(val: VendorBillTableDto) {
    this.activeAction = val;
  }

  public deleteVendorGroup(id: any) {
    const tempArray = [];
    tempArray.push(id);
    this.confirmationService.confirm({
      message: 'You want to delete this Vendor Group',
      key: 'v-invitaion',
      accept: () => {
        this.vendorService.deleteVendorGroup(tempArray).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.getDataFromBackend();
            this.tableSupportBase.rows = [];
            this.vendorService.groupSubject.next(true);
            this.notificationService.successMessage(HttpResponseMessage.VENDOR_GROUP_DELETED_SUCCESSFULLY);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  public deleteVendorGroupList() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }

      this.confirmationService.confirm({
        message: 'You want to delete these Selected Vendor groups',
        key: 'v-invitaion',
        accept: () => {
          this.vendorService.deleteBulkVendorGroups(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
              } else {
                this.notificationService.successMessage(HttpResponseMessage.VENDOR_GROUPS_DELETED_SUCCESSFULLY);
              }
              this.loadData(this.tableSupportBase.searchFilterDto);
              this.tableSupportBase.rows = [];
              this.vendorService.groupSubject.next(true);
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        }
      });
    }
  }

  getDropDown(col: any) {
    switch (col.field) {
      case 'vpInv.status':
        return col.dropdownValues;
      case 'vpInv.invitedBy':
        return col.dropdownValues;
    }
  }

  /**
   * inactive group
   */
  inactiveGroup() {
    this.vendorService.inactivateVendorGroup(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.VENDOR_GROUP_INACTIVATED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.tableSupportBase.rows = [];
        this.vendorService.groupSubject.next(true);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * activate group
   */
  activateGroup() {
    this.vendorService.activateVendorGroup(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.VENDOR_GROUP_ACTIVATED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.tableSupportBase.rows = [];
        this.vendorService.groupSubject.next(true);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * this method can be used to inactive bulk list
   */
  inactiveGroupList() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.vendorService.inactivateBulkVendorGroups(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.VENDOR_GROUPS_INACTIVATED_SUCCESSFULLY);
          }
          this.loadData(this.tableSupportBase.searchFilterDto);
          this.tableSupportBase.rows = [];
          this.vendorService.groupSubject.next(true);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to active bulk list
   */
  activeGroupList() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.vendorService.activateBulkVendorGroups(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.VENDOR_GROUPS_ACTIVATED_SUCCESSFULLY);
          }
          this.loadData(this.tableSupportBase.searchFilterDto);
          this.tableSupportBase.rows = [];
          this.vendorService.groupSubject.next(true);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }
}

