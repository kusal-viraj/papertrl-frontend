import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {TableSupportBase} from "../../../shared/utility/table-support-base";
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {AppActionLabel} from "../../../shared/enums/app-action-label";
import {AppIcons} from "../../../shared/enums/app-icons";
import {AppTableKeysData} from "../../../shared/enums/app-table-keys-data";
import {VendorBillTableDto} from "../../../shared/dto/vendor/vendor-bill-table-dto";
import {BillMasterDto} from "../../../shared/dto/bill/bill-master-dto";
import {Subscription} from "rxjs";
import {AuditTrialDto} from "../../../shared/dto/common/audit-trial/audit-trial-dto";
import {DropdownDto} from "../../../shared/dto/common/dropDown/dropdown-dto";
import {Table} from "primeng/table";
import {OverlayPanel} from "primeng/overlaypanel";
import {AppWindowResolution} from "../../../shared/enums/app-window-resolution";
import {BillsService} from "../../../shared/services/bills/bills.service";
import {GridService} from "../../../shared/services/common/table/grid.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {ConfirmationService, LazyLoadEvent} from "primeng/api";
import {
  BulkNotificationDialogService
} from "../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service";
import {Router} from "@angular/router";
import {PoService} from "../../../shared/services/po/po.service";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {AppConstant} from "../../../shared/utility/app-constant";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {BulkNotificationsComponent} from "../../common/bulk-notifications/bulk-notifications.component";
import {DetailViewService} from "../../../shared/helpers/detail-view.service";
import {RecurringBillCreateComponent} from "../recurring-bill-create/recurring-bill-create.component";
import {AppTableHeaderActions} from "../../../shared/enums/app-table-header-actions";
import {Menu} from "primeng/menu";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";

@Component({
  selector: 'app-recurring-bill-list',
  templateUrl: './recurring-bill-list.component.html',
  styleUrls: ['./recurring-bill-list.component.scss']
})
export class RecurringBillListComponent implements OnInit, OnDestroy {
  public poId: any;
  public vendorId: any;

  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);

  }

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  public tableSupportBase = new TableSupportBase();

  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
  public tableKeyEnum = AppTableKeysData;

  public activeAction: VendorBillTableDto; // Selected Action Button
  public billMasterDto: BillMasterDto = new BillMasterDto();
  public tableActionList: any [] = [];  // Action Button List
  public subscription: Subscription;
  public tableUpdateSubscription = new Subscription();

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

  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();


  public billNo: string;

  public allVendorList: DropdownDto = new DropdownDto();

  public intervals: DropdownDto = new DropdownDto();
  public termList: DropdownDto = new DropdownDto();

  public reSubmit = false;
  public recurringTemplateView = false;
  public recurringTemplateId = false;
  public recurringTemplateDetailView = false;
  public recurringTemplateEditView = false;
  public recurringTemplateEditViewFromDetailView = false;

  public viewCreateEbill = false;
  public overlayId: any;

  @Output() isViewContent = new EventEmitter();
  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: Table;
  @ViewChild('vendorOverlay') vendorOverlay: OverlayPanel;
  @ViewChild('recurringBillCreateComponent') recurringBillCreateComponent: RecurringBillCreateComponent;
  @ViewChild('menu') menu: Menu;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  constructor(public billsService: BillsService, public gridService: GridService, public notificationService: NotificationService,
              public confirmationService: ConfirmationService, public bulkNotificationDialogService: BulkNotificationDialogService,
              public router: Router, public poService: PoService, public detailViewService: DetailViewService,
              public privilegeService: PrivilegeService, private gaService: GoogleAnalyticsService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.GRID_NAME_RECURRING_Bill_TABLE_KEY);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.tableUpdateSubscription.unsubscribe();
  }

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    if (this.privilegeService.isAuthorized(AppAuthorities.RECURRING_BILLS_INACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.INACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.RECURRING_BILLS_ACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.ACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.RECURRING_BILLS_DELETE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.tableUpdateSubscription = this.billsService.updateTableData.subscribe(() => {
      if (this.tableSupportBase.searchFilterDto?.filters) {
        this.loadData(this.tableSupportBase.searchFilterDto);
      }
    });
    this.actionButtonInit();
    this.getPaymentTerms();
    this.getIntervalList();
  }


  /**
   * this method can be used to get payment terms
   */
  getPaymentTerms() {
    this.billsService.getTermsList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.termList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * this method can be used to get vendor related po list
   */
  getIntervalList() {
    this.billsService.getIntervalList().then((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.intervals.data = res.body;
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
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_RECURRING_Bill_LIST).subscribe((res: any) => {
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
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableSupportBase.tableActionList = [
      {
        label: AppActionLabel.ACTION_CREATE_BILL,
        icon: AppIcons.ICON_ADD_TO_LOCAL,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.RECURRING_BILLS_CREATE_BILL),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_CREATE_BILL,
            AppAnalyticsConstants.MODULE_NAME_RECURRING_BILLS,
            AppActionLabel.ACTION_CREATE_BILL);
          this.recurringTemplateId = this.activeAction.id;
          this.viewCreateEbill = true;
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW,
        icon: this.iconEnum.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.RECURRING_BILLS_DETAIL_VIEW),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW,
            AppAnalyticsConstants.MODULE_NAME_RECURRING_BILLS,
            this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW);
          this.recurringTemplateId = this.activeAction.id;
          this.recurringTemplateView = true;
          this.recurringTemplateEditView = false;
          this.recurringTemplateDetailView = true;
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_ACTIVATE,
        icon: this.iconEnum.ICON_ACTIVATE,
        status: this.enums.STATUS_INACTIVE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.RECURRING_BILLS_ACTIVATE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_ACTIVATE,
            AppAnalyticsConstants.MODULE_NAME_RECURRING_BILLS,
            this.actionLabelEnum.ACTION_LABEL_ACTIVATE
          );
          const id = this.activeAction.id;
          this.activate(id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_INACTIVATE,
        icon: this.iconEnum.ICON_INACTIVATE,
        status: this.enums.STATUS_ACTIVE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.RECURRING_BILLS_INACTIVATE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_ACTIVATE,
            AppAnalyticsConstants.MODULE_NAME_RECURRING_BILLS,
            this.actionLabelEnum.ACTION_LABEL_ACTIVATE);
          const id = this.activeAction.id;
          this.inactivate(id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_EDIT,
        icon: this.iconEnum.ICON_EDIT,
        status: this.enums.STATUS_ACTIVE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.RECURRING_BILLS_EDIT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_RECURRING_BILLS,
            this.actionLabelEnum.ACTION_LABEL_EDIT);
          this.recurringTemplateId = this.activeAction.id;
          this.recurringTemplateView = true;
          this.recurringTemplateDetailView = false;
          this.recurringTemplateEditView = true;
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DELETE,
        icon: this.iconEnum.ICON_DELETE,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.RECURRING_BILLS_DELETE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_DELETE,
            AppAnalyticsConstants.MODULE_NAME_RECURRING_BILLS,
            this.actionLabelEnum.ACTION_LABEL_DELETE);
          const id = this.activeAction.id;
          this.delete(id);
        }
      }
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
    this.billsService.getRecurringBillTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_RECURRING_Bill_LIST;
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
            this.notificationService.successMessage(HttpResponseMessage.RECURRING_BILL_DELETED_SUCCESSFULLY);
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
        this.notificationService.successMessage(HttpResponseMessage.RECURRING_BILL_INACTIVATED_SUCCESSFULLY);
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
        this.notificationService.successMessage(HttpResponseMessage.RECURRING_BILL_ACTIVATED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
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
                this.notificationService.successMessage(HttpResponseMessage.RECURRING_BILLS_DELETED_SUCCESSFULLY);
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
          this.notificationService.successMessage(HttpResponseMessage.RECURRING_BILLS_INACTIVATED_SUCCESSFULLY);
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
          this.notificationService.successMessage(HttpResponseMessage.RECURRING_BILLS_ACTIVATED_SUCCESSFULLY);
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


  /**
   * A Single value hover from table
   * @param field to filed
   * @param obj to customer obj
   * @param event to click event
   */
  tdHover(field, obj: any, event) {
    if (field === 'vendor.id' && this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW)) {
      this.overlayId = obj.vendorId;
      showOverlay(this.vendorOverlay);
    }

    function showOverlay(overlay) {
      if (overlay.target === null || overlay.target === undefined) {
        overlay.show(event);
      }
    }
  }

  /**
   * Is the field is has data to show in overlay
   * @param field
   */
  isClassHover(field) {
    switch (field) {
      case 'vendor.id':
        return !!this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW);
    }
  }

  /**
   * A Single value clicked from table
   * @param field to filed
   * @param obj to customer obj
   */
  tdClick(field, obj: any, event) {
    if (field === 'vendor.id' && this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW)) {
      this.detailViewService.openVendorDetailView(obj.vendorId);
    }
  }

  /**
   * Hide Overlays if Visible
   */
  hideOverlays() {
    if (this.vendorOverlay.overlayVisible) {
      this.vendorOverlay.hide();
    }
  }


}
