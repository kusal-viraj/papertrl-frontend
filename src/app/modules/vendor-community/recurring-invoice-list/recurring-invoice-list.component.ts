import {Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {Table} from 'primeng/table';
import {OverlayPanel} from 'primeng/overlaypanel';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {
  BulkNotificationDialogService
} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {VendorInvoiceService} from '../../../shared/services/vendor-community/vendor-invoice.service';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {VendorBillTableDto} from '../../../shared/dto/vendor/vendor-bill-table-dto';
import {BillMasterDto} from '../../../shared/dto/bill/bill-master-dto';
import {Subscription} from 'rxjs';
import {AuditTrialDto} from '../../../shared/dto/common/audit-trial/audit-trial-dto';
import {Router} from '@angular/router';
import {PoService} from '../../../shared/services/po/po.service';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {Menu} from 'primeng/menu';

@Component({
  selector: 'app-recurring-invoice-list',
  templateUrl: './recurring-invoice-list.component.html',
  styleUrls: ['./recurring-invoice-list.component.scss']
})
export class RecurringInvoiceListComponent implements OnInit {
  public poId: any;
  public vendorId: any;
  public tableSupportBase = new TableSupportBase();
  public bulkButtonList: ButtonPropertiesDto[] = [];
  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
  public tableKeyEnum = AppTableKeysData;
  public activeAction: any; // Selected Action Button
  public billMasterDto: BillMasterDto = new BillMasterDto();
  public tableActionList: any [] = [];  // Action Button List
  public subscription: Subscription;
  public billPanel: boolean;
  public viewChangeAssignee: boolean;
  public bulkButtonListResponsive: any;
  public id: any;
  public detailView = false;
  public approveBillView: boolean;
  public auditTrialPanel: boolean;
  public auditTrial: AuditTrialDto[];
  public downloadActions: any [] = [];
  public downloadActionsOne: any [] = [];
  public exportActionsOne: any [] = [];
  public exportActions: any [] = [];
  public billNo: string;
  public customerList: DropdownDto = new DropdownDto();
  public intervals: DropdownDto = new DropdownDto();
  public approvalGroupList: DropdownDto = new DropdownDto();
  public termList: DropdownDto = new DropdownDto();
  public departments: DropdownDto = new DropdownDto();
  public reSubmit = false;
  public recurringTemplateView = false;
  public recurringTemplateId = false;
  public recurringTemplateDetailView = false;
  public recurringTemplateEditView = false;
  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();
  public viewCreateEbill = false;
  public tenantId: any;
  @Output() isViewContent = new EventEmitter();
  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: Table;
  @ViewChild('poOverlay') poOverlay: OverlayPanel;
  @ViewChild('menu') menu: Menu;

  constructor(public vendorInvoiceService: VendorInvoiceService, public gridService: GridService, public notificationService: NotificationService,
              public confirmationService: ConfirmationService, public bulkNotificationDialogService: BulkNotificationDialogService,
              public router: Router, public poService: PoService, public billsService: BillsService,
              public privilegeService: PrivilegeService) {
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

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.GRID_NAME_RECURRING_Bill_TABLE_KEY);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    if (this.privilegeService.isAuthorized(AppAuthorities.RECURRING_INVOICES_INACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.INACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.RECURRING_INVOICES_ACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.ACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.RECURRING_INVOICES_DELETE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.loadBulkButtonData();
    this.actionButtonInit();
    this.getCustomerList();
    this.getIntervalList();
  }


  /**
   * this method can be used to get vendor related po list
   */
  getIntervalList() {
    this.vendorInvoiceService.getIntervalList().then((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.intervals.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * This method use for get vendor list for dropdown
   */
  getCustomerList() {
    this.vendorInvoiceService.getCustomerList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.customerList.data = res.body;
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
    // Check for Responsiveness
    this.onTableResize();
    // Removes table Storage on load if present
    sessionStorage.removeItem(AppTableKeysData.GRID_NAME_RECURRING_Bill_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_RECURRING_INVOICE_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.GRID_NAME_RECURRING_Bill_TABLE_KEY, this.columnSelect);
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }

  /**
   * This method use for get bulk button list data
   */
  loadBulkButtonData() {
    this.vendorInvoiceService.getRecurringBulkActionData().subscribe((res: any) => {
      if (res.status === AppResponseStatus.STATUS_SUCCESS) {
        const arr = [];
        for (const i of res.body) {
          let val: ButtonPropertiesDto = new ButtonPropertiesDto();
          val = i;
          arr.push(
            {
              label: val.label,
              action: val.action,
              authCode: val.authCode,
              disabled: !val.active,
              icon: val.icon,
              command: (event) => {
                this.bulkButtonAction(val.action);
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
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableSupportBase.tableActionList = [
      {
        label: AppActionLabel.ACTION_CREATE_INVOICE,
        icon: AppIcons.ICON_ADD_TO_LOCAL,
        status: this.enums.STATUS_ACTIVE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.INVOICE_CREATE),
        command: () => {
          this.isCheckTenantActive(this.activeAction.tenantId).then(value => {
            if (value) {
              this.recurringTemplateId = this.activeAction.id;
              this.tenantId = this.activeAction.tenantId;
              this.viewCreateEbill = true;
            }
          });
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW,
        icon: this.iconEnum.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.RECURRING_INVOICES_DETAIL_VIEW),
        command: () => {
          this.isCheckTenantActive(this.activeAction.tenantId).then(value => {
            if (value) {
              this.recurringTemplateId = this.activeAction.id;
              this.tenantId = this.activeAction.tenantId;
              this.recurringTemplateView = true;
              this.recurringTemplateEditView = false;
              this.recurringTemplateDetailView = true;
            }
          });
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_ACTIVATE,
        icon: this.iconEnum.ICON_ACTIVATE,
        status: this.enums.STATUS_INACTIVE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.RECURRING_INVOICES_ACTIVATE),
        command: () => {
          const id = this.activeAction.id;
          this.activate(id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_INACTIVATE,
        icon: this.iconEnum.ICON_INACTIVATE,
        status: this.enums.STATUS_ACTIVE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.RECURRING_INVOICES_INACTIVATE),
        command: () => {
          const id = this.activeAction.id;
          this.inactivate(id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_EDIT,
        icon: this.iconEnum.ICON_EDIT,
        status: this.enums.STATUS_ACTIVE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.RECURRING_INVOICES_EDIT),
        command: () => {
          this.isCheckTenantActive(this.activeAction.tenantId).then(value => {
            if (value) {
              this.recurringTemplateId = this.activeAction.id;
              this.tenantId = this.activeAction.tenantId;
              this.recurringTemplateView = true;
              this.recurringTemplateDetailView = false;
              this.recurringTemplateEditView = true;
            }
          });
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DELETE,
        icon: this.iconEnum.ICON_DELETE,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.RECURRING_INVOICES_DELETE),
        command: () => {
          const id = this.activeAction.id;
          this.delete(id);
        }
      }
    ];
  }

  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_DELETE:
        this.bulkDelete();
        break;
      case AppBulkButton.BUTTON_INACTIVATE:
        this.bulkInactivate();
        break;
      case AppBulkButton.BUTTON_ACTIVATE:
        this.bulkActivate();
        break;
    }
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
    this.vendorInvoiceService.getRecurringTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.GRID_NAME_RECURRING_Bill_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_RECURRING_INVOICE_LIST;
      this.gridService.updateTableState(this.tableSupportBase.tableDataOptions).subscribe((res: any) => {
        if (event === true) {
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
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: VendorBillTableDto) {
    this.activeAction = val;
  }

  public bulkDelete() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.confirmationService.confirm({
        message: 'You want to delete the selected Recurring Template(s)',
        key: 'recurringBillDelete',
        accept: () => {
          this.billsService.bulkDeleteRecurringBill(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.getDataFromBackend();
                this.tableSupportBase.rows = [];
              } else {
                this.notificationService.successMessage(HttpResponseMessage.RECURRING_INVOICES_DELETED_SUCCESSFULLY);
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

  public bulkInactivate() {
    if (this.tableSupportBase.rows.length === 0) {
      return;
    }
    const ids: any[] = [];
    for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
      ids.push(this.tableSupportBase.rows[i].id);
    }
    this.billsService.bulkInactivateRecurringBill(ids).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          this.getDataFromBackend();
          this.tableSupportBase.rows = [];
        } else {
          this.notificationService.successMessage(HttpResponseMessage.RECURRING_INVOICES_INACTIVATED_SUCCESSFULLY);
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

  public bulkActivate() {
    if (this.tableSupportBase.rows.length === 0) {
      return;
    }
    const ids: any[] = [];
    for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
      ids.push(this.tableSupportBase.rows[i].id);
    }
    this.billsService.bulkActivateRecurringBill(ids).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          this.getDataFromBackend();
          this.tableSupportBase.rows = [];
        } else {
          this.notificationService.successMessage(HttpResponseMessage.RECURRING_INVOICES_ACTIVATED_SUCCESSFULLY);
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

  getDropDowns(col: any) {
    switch (col.field) {
      case 'recInv.termName':
        return this.termList.data;
      case 'recInv.intervalValue':
        return this.intervals.data;
      case 'recInv.status':
        return col.dropdownValues;
    }
  }

  private delete(id) {
    this.confirmationService.confirm({
      key: 'recurringBillDelete',
      message: 'You want to delete this Recurring Template',
      accept: () => {
        const tempArray = [];
        tempArray.push(id);
        this.billsService.bulkDeleteRecurringBill(tempArray).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.getDataFromBackend();
            this.notificationService.successMessage(HttpResponseMessage.RECURRING_INVOICE_DELETED_SUCCESSFULLY);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  private inactivate(id: any) {
    const tempArray = [];
    tempArray.push(id);
    this.billsService.bulkInactivateRecurringBill(tempArray).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.RECURRING_INVOICE_INACTIVATED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  private activate(id: any) {
    const tempArray = [];
    tempArray.push(id);
    this.billsService.bulkActivateRecurringBill(tempArray).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.RECURRING_INVOICE_ACTIVATED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method is used to check whether the specified tenant is active or not
   *
   * @param tenantId
   */
  isCheckTenantActive(tenantId) {
    return new Promise(resolve => {
      this.vendorInvoiceService.isTenantActive(tenantId).subscribe((res: any) => {
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
