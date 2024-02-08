import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {Table} from 'primeng/table';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {
  BulkNotificationDialogService
} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';

import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {ActivatedRoute, Router} from '@angular/router';
import {PurchaseOrdersService} from '../../../shared/services/vendor-community/purchase-orders.service';
import {VendorInvoiceService} from '../../../shared/services/vendor-community/vendor-invoice.service';
import {PoService} from '../../../shared/services/po/po.service';
import {RoleService} from '../../../shared/services/roles/role.service';
import {AuditTrialDto} from '../../../shared/dto/common/audit-trial/audit-trial-dto';
import {UserMasterDto} from '../../../shared/dto/user/user-master-dto';
import {AppIcons} from '../../../shared/enums/app-icons';
import {VpPaymentBillWiseCache} from '../../../shared/dto/payment/VpPaymentBillWiseCache';
import {PaymentService} from '../../../shared/services/payments/payment.service';
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit, OnDestroy {
  public sessionUser: UserMasterDto = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));

  @Input() fromDashboard = false;

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
  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: Table;
  @ViewChild('menu') menu: Menu;

  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
  private isPayNow: boolean;
  private isSubmitForApproval: boolean;
  private isDetailView: boolean;
  private billList: any[];
  private activeActionRowData: any;
  private utility: any;

  constructor(public poService: PoService, public messageService: MessageService, public confirmationService: ConfirmationService,
              public bulkNotificationDialogService: BulkNotificationDialogService, public roleService: RoleService,
              public paymentService: PaymentService, public vendorInvoiceService: VendorInvoiceService,
              public notificationService: NotificationService, public gridService: GridService, public privilegeService: PrivilegeService,
              public router: Router, public route: ActivatedRoute) {
  }

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.Item_TABLE_KEY);
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.PAYMENT_TABLE_KEY);
    promise.then(result => {
        this.tableSupportBase.tableDataOptions = result;
        this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_VENDOR_COMMUNITY_PAYMENT_LIST;
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
        this.openScreens(params);
      }
    });
    this.loadTableData();
    this.getCustomerList();
    this.actionButtonInit();
  }

  openScreens(params) {
    if (params.status === AppEnumConstants.STATUS_PENDING) {
      // tslint:disable-next-line:radix
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
          this.notificationService.infoMessage(HttpResponseMessage.PO_DELETED_ALREADY);
        }); // navigate to same route
      });
      return;
    }

    if (params.status === AppEnumConstants.STATUS_UNDER_DISCUSSION) {
      // tslint:disable-next-line:radix
      this.poId = parseInt(params.id);
      this.tenantId = params.tenantId;
      this.detailView = false;
      this.approvePoView = true;
      this.isUnderDiscussion = true;
      return;
    }

    if (params.status === AppEnumConstants.STATUS_REJECT || params.status === AppEnumConstants.STATUS_APPROVED) {
      // tslint:disable-next-line:radix
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
        label: this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_DETAIL_VIEW,
        appStatus: this.enums.STATUS_COMMON,
        canPay: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_DETAIL_VIEW),
        command: () => {
          this.isPayNow = false;
          this.isSubmitForApproval = false;
          this.isDetailView = true;
        }
      }
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
    sessionStorage.removeItem(AppTableKeysData.PAYMENT_TABLE_KEY);

    this.gridService.getTableStructure(this.appConstant.GRID_VENDOR_COMMUNITY_PAYMENT_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.PAYMENT_TABLE_KEY, this.columnSelect);
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
    this.paymentService.getVendorPaymentData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
  actionButtonClick(val: any) {
    this.activeAction = val;
  }

  /**
   * this method can be used to get label according to status
   * @param status to payment status
   */
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
      case AppEnumConstants.PAYMENT_STATUS_PROCESSING: {
        return AppEnumConstants.PAYMENT_LABEL_PROCESSING;
      }

      case AppEnumConstants.STATUS_TRANSACTION_PENDING: {
        return AppEnumConstants.LABEL_TRANSACTION_PENDING;
      }

      case AppEnumConstants.STATUS_TRANSACTION_SUCCESS: {
        return AppEnumConstants.LABEL_TRANSACTION_SUCCESS;
      }

      case AppEnumConstants.STATUS_TRANSACTION_FAILED: {
        return AppEnumConstants.LABEL_TRANSACTION_FAILED;
      }

      case AppEnumConstants.STATUS_TRANSACTION_SUBMITTED: {
        return AppEnumConstants.LABEL_TRANSACTION_SUBMITTED;
      }

      case AppEnumConstants.STATUS_TRANSACTION_UNPROCESSED: {
        return AppEnumConstants.LABEL_UNPROCESSED;
      }

      case AppEnumConstants.ST_APPROVED: {
        return AppEnumConstants.LABEL_APPROVED;
      }

      case AppEnumConstants.ST_PENDING: {
        return AppEnumConstants.LABEL_PENDING;
      }

      case AppEnumConstants.ST_REJECTED: {
        return AppEnumConstants.LABEL_REJECT;
      }
    }
  }

}
