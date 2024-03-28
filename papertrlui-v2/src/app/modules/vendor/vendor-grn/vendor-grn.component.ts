import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Table} from 'primeng/table';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {Subscription} from 'rxjs';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ItemTableDto} from '../../../shared/dto/item/item-table-dto';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {PoReceiptService} from '../../../shared/services/po-receipts/po-receipt.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {
  BulkNotificationDialogService
} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {BillsService} from "../../../shared/services/bills/bills.service";
import {OverlayPanel} from "primeng/overlaypanel";
import {AppTableHeaderActions} from "../../../shared/enums/app-table-header-actions";
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-vendor-grn',
  templateUrl: './vendor-grn.component.html',
  styleUrls: ['./vendor-grn.component.scss']
})
export class VendorGrnComponent implements OnInit, OnDestroy {
  @Input() fromVendor: boolean;
  @Input() vendorId: any;
  public poReceiptID: any;
  public approvePoView = false;
  public createPoReceipt = false;
  public editPoReceipt = false;
  public billAssign = false;
  public overlayId: any;

  public tableSupportBase = new TableSupportBase();

  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any;

  public enums = AppEnumConstants;
  public tableKeyEnum = AppTableKeysData;

  public activeAction: ItemTableDto;

  public isDetailView = false;
  public isEditView = false;
  public detailView = false;
  public tableActionList: any [] = [];

  public exportActionsOne: any [] = [];
  public exportActions: any [] = [];
  public downloadActions: any [] = [];
  public downloadActionsOne: any [] = [];


  public vendorList: DropdownDto = new DropdownDto();
  public poList: DropdownDto = new DropdownDto();
  public appAuthorities = AppAuthorities;

  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();

  public subscription: Subscription;
  @ViewChild('poOverlay') poOverlay: OverlayPanel;

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

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  constructor(public poReceiptService: PoReceiptService, public notificationService: NotificationService,
              public gridService: GridService, public confirmationService: ConfirmationService,
              public bulkNotificationDialogService: BulkNotificationDialogService,
              public privilegeService: PrivilegeService, public billsService: BillsService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.PO_RECEIPT_TABLE_KEY);
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.PO_RECEIPT_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_VENDOR_PO_RECEIPTS;
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
    if (this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_RE_OPEN_PO_RECEIPT)) {
      this.availableHeaderActions.push(AppTableHeaderActions.RE_OPEN);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_CLOSE_PO_RECEIPT)) {
      this.availableHeaderActions.push(AppTableHeaderActions.CLOSE);
    }

    if (this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_DELETE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_CSV_EXPORT)) {
      this.availableHeaderActions.push(AppTableHeaderActions.EXPORT);
    }

    if (this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_DOWNLOAD_REPORT)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DOWNLOAD);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);



    this.loadTableData();
    this.actionButtonInit();
    this.getVendorList();
    this.getPoList();
  }

  /**
   * this method can be used to get vendor related po list
   */
  getPoList() {
    this.billsService.getTablePoList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.poList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * get emit value
   * @param event to emitted value
   */

  emitValue(event) {
    this.createPoReceipt = event;
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
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_DETAIL_VIEW),
        command: () => {
          this.poReceiptID = this.activeAction.id;
          this.detailView = true;
        }
      },
      // {
      //   label: AppActionLabel.ACTION_LABEL_EDIT_RESUBMIT,
      //   icon: AppIcons.ICON_EDIT_RESUBMIT,
      //   status: this.enums.STATUS_COMMON,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_EDIT),
      //   command: () => {
      //     this.poReceiptID = this.activeAction.id;
      //     this.editPoReceipt = true;
      //   }
      // },
      // {
      //   label: AppActionLabel.ACTION_CREATE_BILL,
      //   icon: AppIcons.ICON_ADD_TO_LOCAL,
      //   status: this.enums.STATUS_COMMON,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_CREATE_BILL),
      //   command: () => {
      //     this.poReceiptID = this.activeAction.id;
      //     this.billAssign = true;
      //   }
      // },
      // {
      //   label: AppActionLabel.ACTION_LABEL_DELETE,
      //   status: this.enums.STATUS_COMMON,
      //   icon: AppIcons.ICON_DELETE,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_DELETE),
      //   command: () => {
      //     const id = this.activeAction.id;
      //     this.deletePoReceipt(id);
      //   }
      // },
      // {
      //   label: AppActionLabel.ACTION_LABEL_RE_OPEN,
      //   status: this.enums.STATUS_CLOSE,
      //   icon: AppIcons.ICON_OPEN,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_RE_OPEN_PO_RECEIPT),
      //   command: () => {
      //     const id = this.activeAction.id;
      //     this.openPoReceipt(id);
      //   }
      // },
      // {
      //   label: AppActionLabel.ACTION_LABEL_CLOSE,
      //   status: this.enums.STATUS_ACTIVE,
      //   icon: AppIcons.ICON_CLOSE,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_CLOSE_PO_RECEIPT),
      //   command: () => {
      //     const id = this.activeAction.id;
      //     this.closePoReceipt(id);
      //   }
      // }
    ];


    this.downloadActions = [
      {
        label: AppActionLabel.ACTION_DOWNLOAD_SELECTED,
        icon: AppIcons.ICON_DOWNLOAD_BILL_FONT_AWESOME,
        command: () => {
          this.bulkDownloadSelected();
        }
      },
      {
        label: AppActionLabel.ACTION_DOWNLOAD_All,
        icon: AppIcons.ICON_DOWNLOAD_BILL_FONT_AWESOME,
        command: () => {
          this.bulkDownloadAll();
        }
      },
    ];

    this.downloadActionsOne = [
      {
        label: AppActionLabel.ACTION_DOWNLOAD_All,
        icon: AppIcons.ICON_DOWNLOAD_BILL_FONT_AWESOME,
        command: () => {
          this.bulkDownloadAll();
        }
      },
    ];


    this.exportActions = [
      {
        label: AppActionLabel.ACTION_EXPORT_SELECTED,
        icon: AppIcons.ICON_EXPORT,
        command: () => {
          this.bulkExportSelected();
        }
      },
      {
        label: AppActionLabel.ACTION_EXPORT_All,
        icon: AppIcons.ICON_EXPORT,
        command: () => {
          this.bulkExportAll();
        }
      },
    ];
    this.exportActionsOne = [
      {
        label: AppActionLabel.ACTION_EXPORT_All,
        icon: AppIcons.ICON_EXPORT,
        command: () => {
          this.bulkExportAll();
        }
      },
    ];
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

  /**
   * Loads Table Data (Settings)
   */
  loadTableData() {
    return new Promise(resolve => {
      this.selectedColumns = [];
      // Check for Responsiveness
      this.onTableResize();
      // Removes table Storage on load if present
      this.gridService.getTableStructure(this.appConstant.GRID_VENDOR_PO_RECEIPTS).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.PO_RECEIPT_TABLE_KEY, this.columnSelect);
          } else {
            this.notificationService.errorMessage(res.body.message);
          }
          resolve(true);
        }, (error => {
          this.notificationService.errorMessage(error);
        })
      );
    })

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
    this.poReceiptService.getVendorPOReceiptTableData(this.tableSupportBase.searchFilterDto, this.vendorId).subscribe((res: any) => {
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

  /**
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: ItemTableDto) {
    this.activeAction = val;
  }

  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_OPEN:
        this.openBulkPoReceipt();
        break;
      case AppBulkButton.BUTTON_CLOSE:
        this.bulkClosePoReceipt();
        break;
      case AppBulkButton.BUTTON_DELETE:
        this.bulkDelete();
        break;
    }
  }

  /**
   * this method can be used to create po
   */

  createPurchaseReceipt() {
    this.createPoReceipt = true;
  }


  /**
   * Close PO Receipt
   */
  closePoReceipt(id: any) {
    this.poReceiptService.closePoReceipt(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.getDataFromBackend();
        this.tableSupportBase.rows = [];
        this.notificationService.successMessage(HttpResponseMessage.PO_RECEIPT_CLOSED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Close PO Receipt
   */
  bulkClosePoReceipt() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.poReceiptService.closeBulkPoReceipt(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
            this.getDataFromBackend();
            this.tableSupportBase.rows = [];
          } else {
            this.notificationService.successMessage(HttpResponseMessage.PO_RECEIPTS_CLOSED_SUCCESSFULLY);
            this.getDataFromBackend();
            this.tableSupportBase.rows = [];
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * Close PO Receipt
   */
  openBulkPoReceipt() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.poReceiptService.openBulkPoReceipt(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
            this.getDataFromBackend();
            this.tableSupportBase.rows = [];
          } else {
            this.notificationService.successMessage(HttpResponseMessage.PO_RECEIPTS_OPEN_SUCCESSFULLY);
            this.getDataFromBackend();
            this.tableSupportBase.rows = [];
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * Open PO Receipt
   */
  openPoReceipt(id: any) {
    this.poReceiptService.openPoReceipt(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.getDataFromBackend();
        this.tableSupportBase.rows = [];
        this.notificationService.successMessage(HttpResponseMessage.PO_RECEIPT_OPEN_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Delete PO Receipt
   */
  deletePoReceipt(id: any) {
    this.confirmationService.confirm({
      key: 'poReceipt',
      message: 'You want to delete this Receipt!',
      accept: () => {
        this.poReceiptService.deleteReceipt(id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.getDataFromBackend();
            this.tableSupportBase.rows = [];
            this.notificationService.successMessage(HttpResponseMessage.PO_RECEIPT_DELETED_SUCCESSFULLY);
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
   * Delete Bulk PO Receipts
   */
  bulkDelete() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.confirmationService.confirm({
        message: 'You want to delete the selected Receipt(s)!',
        key: 'poReceipt',
        accept: () => {
          this.poReceiptService.bulkDelete(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.getDataFromBackend();
                this.tableSupportBase.rows = [];
              } else {
                this.notificationService.successMessage(HttpResponseMessage.PO_RECEIPTS_CLOSED_SUCCESSFULLY);
                this.getDataFromBackend();
                this.tableSupportBase.rows = [];
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
   * Export Bulk Data
   */
  bulkExportSelected() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.poReceiptService.bulkExportSelected(ids).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.getDataFromBackend();
          this.tableSupportBase.rows = [];
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'Receipts.csv');
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
   * Export Bulk Data
   */
  bulkExportAll() {
    if (this.tableSupportBase.rows.length !== 0) {
      this.bulkExportSelected();
      return;
    }
    this.poReceiptService.vendorReceiptBulkExportAll(this.tableSupportBase.searchFilterDto, this.vendorId).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.getDataFromBackend();
        this.tableSupportBase.rows = [];
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Receipts.csv');
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

  /**
   * Download Bulk Selections
   */
  bulkDownloadSelected() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.poReceiptService.bulkDownloadSelected(ids).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'Receipts');
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
   * Download Bulk All
   */
  bulkDownloadAll() {
    if (this.tableSupportBase.rows.length !== 0) {
      this.bulkDownloadSelected();
      return;
    }
    this.poReceiptService.vendorReceiptsBulkDownloadAll(this.tableSupportBase.searchFilterDto, this.vendorId).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Receipts');
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

  getDropDown(col: any) {
    switch (col.field) {
      case 'receipt.vendorId':
        return this.vendorList.data;
      case 'receipt.poId':
        return this.poList.data;
      default :
        return col.dropdownValues;
    }
  }

  /**
   * A Single value hover from table
   * @param field to filed
   * @param obj to customer obj
   * @param event to click event
   */
  tdHover(field, obj: any, event) {
    if (field === 'receipt.poId' && this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW)) {
      this.overlayId = obj.poId;
      showOverlay(this.poOverlay);
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
      case 'receipt.poId':
        return !!this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW);
    }
  }

  /**
   * A Single value clicked from table
   * @param field to filed
   * @param obj to customer obj
   */
  tdClick(field, obj: any, event) {
    // if (field === 'po.id') {
    //   this.detailViewService.openBillDetailView(obj.id);
    // }
  }

  /**
   * Hide Overlays if Visible
   */
  hideOverlays() {
    if (this.poOverlay.overlayVisible) {
      this.poOverlay.hide();
    }
  }
}
