import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UserMasterDto} from '../../../shared/dto/user/user-master-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {AuditTrialDto} from '../../../shared/dto/common/audit-trial/audit-trial-dto';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {Table} from 'primeng/table';
import {PoService} from '../../../shared/services/po/po.service';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {BulkNotificationDialogService} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {RoleService} from '../../../shared/services/roles/role.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {PoTableDto} from '../../../shared/dto/po/po-table-dto';

import {AppMessageService} from '../../../shared/enums/app-message-service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {PurchaseOrdersService} from '../../../shared/services/vendor-community/purchase-orders.service';
import {VendorInvoiceService} from "../../../shared/services/vendor-community/vendor-invoice.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AppTableHeaderActions} from "../../../shared/enums/app-table-header-actions";
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-purchase-orders',
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.scss']
})
export class PurchaseOrdersComponent implements OnInit, OnDestroy {


  public sessionUser: UserMasterDto = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));


  public poId: number;
  public approvePoView = false;
  public detailView = false;

  public tableSupportBase = new TableSupportBase();

  public bulkButtonListResponsive: any;

  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public tableKeyEnum = AppTableKeysData;
  public activeAction;
  public auditTrialPanel: boolean;
  public auditTrial: AuditTrialDto[];

  public tableActionList: any [] = [];

  public customers: DropdownDto = new DropdownDto();
  public projectTasks: DropdownDto = new DropdownDto();

  public downloadActionsOne: any [] = [];
  public isUnderDiscussion = false;
  public tenantId: any;

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
  isValidTaxAmount = false;
  isCreateEInvoiceButton = false;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  constructor(public poService: PoService, public messageService: MessageService, public confirmationService: ConfirmationService,
              public bulkNotificationDialogService: BulkNotificationDialogService, public roleService: RoleService,
              public purchaseOrdersService: PurchaseOrdersService, public vendorInvoiceService: VendorInvoiceService,
              public notificationService: NotificationService, public gridService: GridService, public privilegeService: PrivilegeService,
              public router: Router, public route: ActivatedRoute,) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.PO_TABLE_KEY);
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.PO_TABLE_KEY);
    promise.then(result => {
        this.tableSupportBase.tableDataOptions = result;
        this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_VENDOR_COMMUNITY_PO_LIST;
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
      }
    );
  }

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);


    this.route.params.subscribe(params => {
      if (params.id && params.status && params.tenantId) {
        this.openScreens(params)
      }
    });
    this.loadTableData();
    this.getCustomerList();
    this.actionButtonInit();
  }

  openScreens(params) {
    if (params.status === AppEnumConstants.STATUS_PENDING) {
      this.poId = parseInt(params.id);
      this.tenantId = params.tenantId;
      this.detailView = false;
      this.approvePoView = true;
      return;
    }

    if (params.status === AppEnumConstants.STATUS_DELETED) {
      this.detailView = false;
      this.approvePoView = false;
      this.isUnderDiscussion = false;
      this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        this.router.navigate([AppEnumConstants.VENDOR_PURCHASE_ORDER_URL]).then(r => {
          this.notificationService.infoMessage(HttpResponseMessage.PO_DELETED_ALREADY)
        }); // navigate to same route
      });
      return;
    }

    if (params.status === AppEnumConstants.STATUS_UNDER_DISCUSSION) {
      this.poId = parseInt(params.id);
      this.tenantId = params.tenantId;
      this.detailView = false;
      this.approvePoView = true;
      this.isUnderDiscussion = true;
      return;
    }

    if (params.status === AppEnumConstants.STATUS_REJECT || params.status === AppEnumConstants.STATUS_APPROVED) {
      this.poId = parseInt(params.id);
      this.tenantId = params.tenantId;
      this.detailView = true;
      this.approvePoView = true;
      return;
    }
  }

  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableSupportBase.tableActionList = [
      {
        label: AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
        icon: AppIcons.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PO_DETAIL_VIEW),
        command: () => {
          this.isCheckTenantActive(this.activeAction.tenantId).then(value => {
            if (value){
              this.poId = this.activeAction.id;
              this.tenantId = this.activeAction.tenantId;
              this.approvePoView = true;
              this.detailView = true;
              this.isUnderDiscussion = false;
            }
          });
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_APPROVE_REJECT,
        icon: AppIcons.ICON_APPROVE_REJECT,
        status: this.enums.STATUS_PENDING,
        authCode: this.privilegeService.isAuthorizedMultiple([AppAuthorities.PO_REJECT,
          AppAuthorities.PO_APPROVE, AppAuthorities.PO_UNDER_DISCUSSION, AppAuthorities.PO_OVERRIDE_APPROVAL]),
        command: () => {
          this.isCheckTenantActive(this.activeAction.tenantId).then(value => {
            if (value){
              this.poId = this.activeAction.id;
              this.tenantId = this.activeAction.tenantId;
              this.approvePoView = true;
              this.detailView = false;
              this.isUnderDiscussion = false;
            }
          });
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_APPROVE_REJECT,
        icon: AppIcons.ICON_APPROVE_REJECT,
        status: this.enums.STATUS_UNDER_DISCUSSION,
        authCode: this.privilegeService.isAuthorizedMultiple([AppAuthorities.PO_REJECT,
          AppAuthorities.PO_APPROVE, AppAuthorities.PO_UNDER_DISCUSSION, AppAuthorities.PO_OVERRIDE_APPROVAL]),
        command: () => {
          this.isCheckTenantActive(this.activeAction.tenantId).then(value => {
            if (value){
              this.poId = this.activeAction.id;
              this.tenantId = this.activeAction.tenantId;
              this.approvePoView = true;
              this.detailView = false;
              this.isUnderDiscussion = true;
            }
          });
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_CREATE_INVOICE,
        icon: AppIcons.ICON_ADD_TO_LOCAL,
        status: this.enums.STATUS_APPROVED,
        authCode: this.privilegeService.isAuthorizedMultiple([AppAuthorities.PO_INVOICE_CREATE]),
        command: () => {
          this.isCheckTenantActive(this.activeAction.tenantId).then(value => {
            if (value){
              this.poId = this.activeAction.id;
              this.tenantId = this.activeAction.tenantId;
              this.approvePoView = false;
              this.detailView = false;
              this.isUnderDiscussion = false;
              this.isCreateEInvoiceButton = true;
            }
          });
        }
      },

    ];
  }

  /**
   * Change action button array list according to status
   * @param status statua
   */
  actionButtonList(status) {
    return this.tableActionList.filter(this.isActionMatch(status, AppEnumConstants.STATUS_COMMON));
  }

  getCustomerList() {
    this.vendorInvoiceService.getCustomerList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.customers.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for filter table action match by element status
   * @param status string
   */
  isActionMatch(status, common) {
    return function f(element) {
      return ((element.status === status || element.status === common) && element.authCode);
    };
  }

  /**
   * Loads Table Data (Settings)
   */
    loadTableData() {
    this.selectedColumns = [];
    // Check for Responsiveness
    this.onTableResize();
    // Removes table Storage on load if present
    sessionStorage.removeItem(AppTableKeysData.PO_TABLE_KEY);

    this.gridService.getTableStructure(this.appConstant.GRID_VENDOR_COMMUNITY_PO_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.PO_TABLE_KEY, this.columnSelect);
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
    this.purchaseOrdersService.getPOTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
  actionButtonClick(val: PoTableDto) {
    this.activeAction = val;
  }


  /**
   * This method use for close approval screen and refresh table
   */
  public closePOApproval() {
    this.approvePoView = false;
    this.loadData(this.tableSupportBase.searchFilterDto);
  }

  /**
   * get emit value
   * @param event to emitted value
   */

  closePOCreateAndEdit(event) {
    this.approvePoView = false;
    this.loadData(this.tableSupportBase.searchFilterDto);
  }



  bulkDownloadAll() {
    this.poService.bulkDownloadAll(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', res.filename);
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

  bulkDownloadSelected() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.poService.bulkDownloadSelected(ids).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', res.filename);
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


  viewReport(id) {
    if (id != null) {
      this.poService.viewReport(id).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          console.log('start download:', res);
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'PO-Receipt');
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
   * This method is used to check whether the specified tenant is active or not
   *
   * @param tenantId
   */
  isCheckTenantActive(tenantId) {
    return new Promise(resolve => {
      this.poService.isTenantActive(tenantId).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          resolve(true);
        } else {
          this.notificationService.infoMessage(res.body.message);
          resolve(false);
        }
      }, error => {
        resolve(false);
        this.notificationService.errorMessage(error);
      });
    });
  }
}
