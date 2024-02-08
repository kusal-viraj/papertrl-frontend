import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {ItemTableDto} from '../../../shared/dto/item/item-table-dto';
import {Table} from 'primeng/table';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {PoReceiptService} from '../../../shared/services/po-receipts/po-receipt.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {
  BulkNotificationDialogService
} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {OverlayPanel} from 'primeng/overlaypanel';
import {DetailViewService} from '../../../shared/helpers/detail-view.service';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {PoReceiptCreateComponent} from '../po-receipt-create/po-receipt-create.component';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {Menu} from "primeng/menu";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";

@Component({
  selector: 'app-po-receipt-list',
  templateUrl: './po-receipt-list.component.html',
  styleUrls: ['./po-receipt-list.component.scss']
})
export class PoReceiptListComponent implements OnInit, OnDestroy {

  public poReceiptID: any;
  public approvePoView = false;
  public createPoReceipt = false;
  public editPoReceipt = false;
  public billAssign = false;

  public overlayId: any;
  public tableSupportBase = new TableSupportBase();
  public AppAnalyticsConstants = AppAnalyticsConstants;


  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any;

  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public tableKeyEnum = AppTableKeysData;

  public activeAction;

  public isDetailView = false;
  public isEditView = false;
  public detailView = false;
  public tableActionList: any [] = [];

  public exportActionsOne: any [] = [];
  public exportActions: any [] = [];
  public downloadActions: any [] = [];
  public downloadActionsOne: any [] = [];

  public allVendorList: DropdownDto = new DropdownDto();
  public poList: DropdownDto = new DropdownDto();
  public commonUtil = new CommonUtility();

  public appConstant: AppConstant = new AppConstant();


  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];


  isDownloading = false;
  isExporting = false;
  editPoReceiptFromDetailView = false;
  isClickedEditView = false;
  public isAttachmentId: any;


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
  @ViewChild('vendorOverlay') vendorOverlay: OverlayPanel;
  @ViewChild('poOverlay') poOverlay: OverlayPanel;
  @ViewChild('poReceiptCreateComponent') poReceiptCreateComponent: PoReceiptCreateComponent;
  @ViewChild('menu') menu: Menu;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  isPoReceiptTable() {
    return this.privilegeService.isAuthorizedMultiple([
      AppAuthorities.PO_RECEIPT_EDIT, AppAuthorities.PO_RECEIPT_DETAIL_VIEW, AppAuthorities.PO_RECEIPT_DELETE,
      AppAuthorities.PO_RECEIPT_ATTACH_TO_A_BILL, AppAuthorities.PO_RECEIPT_CLOSE_PO_RECEIPT, AppAuthorities.PO_RECEIPT_CSV_EXPORT,
      AppAuthorities.PO_RECEIPT_DOWNLOAD_REPORT, AppAuthorities.PO_RECEIPT_RE_OPEN_PO_RECEIPT, AppAuthorities.PO_RECEIPT_CREATE_BILL]);
  }

  constructor(public poReceiptService: PoReceiptService, public notificationService: NotificationService,
              public gridService: GridService, public confirmationService: ConfirmationService,
              public bulkNotificationDialogService: BulkNotificationDialogService, public gaService: GoogleAnalyticsService,
              public privilegeService: PrivilegeService, public billsService: BillsService,
              public detailViewService: DetailViewService) {
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
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_PO_RECEIPT_LIST;
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
    this.loadBulkButtonData();
    this.actionButtonInit();
    this.getAllVendorList();
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
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
            AppAnalyticsConstants.MODULE_NAME_PO_RECEIPT,
            AppActionLabel.ACTION_LABEL_DETAIL_VIEW);
          this.poReceiptID = this.activeAction.id;
          this.detailView = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_EDIT,
        icon: AppIcons.ICON_EDIT_RESUBMIT,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_EDIT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_PO_RECEIPT,
            AppActionLabel.ACTION_LABEL_EDIT);
          this.poReceiptID = this.activeAction.id;
          this.isAttachmentId = this.activeAction.attachmentId;
          this.canEditReceipt(this.poReceiptID);
        }
      },
      {
        label: AppActionLabel.ACTION_CREATE_BILL,
        icon: AppIcons.ICON_ADD_TO_LOCAL,
        status: this.enums.STATUS_ACTIVE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_CREATE_BILL),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_CREATE_BILL,
            AppAnalyticsConstants.MODULE_NAME_PO_RECEIPT,
            AppActionLabel.ACTION_CREATE_BILL);
          this.poReceiptID = this.activeAction.id;
          this.billAssign = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_DELETE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_DELETE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DELETE,
            AppAnalyticsConstants.MODULE_NAME_PO_RECEIPT,
            AppActionLabel.ACTION_LABEL_DELETE
          );
          const id = this.activeAction.id;
          this.deletePoReceipt(id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_EDIT,
        icon: AppIcons.ICON_EDIT_RESUBMIT,
        status: this.enums.STATUS_DRAFT,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_EDIT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_PO_RECEIPT,
            AppActionLabel.ACTION_LABEL_EDIT
          );
          this.poReceiptID = this.activeAction.id;
          this.editPoReceipt = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_DRAFT,
        icon: AppIcons.ICON_DELETE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_DELETE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DELETE,
            AppAnalyticsConstants.MODULE_NAME_PO_RECEIPT,
            AppActionLabel.ACTION_LABEL_DELETE
          );
          const id = this.activeAction.id;
          this.deleteDraft(id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_RE_OPEN,
        status: this.enums.STATUS_CLOSE,
        icon: AppIcons.ICON_OPEN,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_RE_OPEN_PO_RECEIPT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_RE_OPEN,
            AppAnalyticsConstants.MODULE_NAME_PO_RECEIPT,
            AppActionLabel.ACTION_LABEL_RE_OPEN,
          );
          const id = this.activeAction.id;
          this.openPoReceipt(id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_CLOSE,
        status: this.enums.STATUS_ACTIVE,
        icon: AppIcons.ICON_CLOSE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_CLOSE_PO_RECEIPT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_CLOSE,
            AppAnalyticsConstants.MODULE_NAME_PO_RECEIPT,
            AppActionLabel.ACTION_LABEL_CLOSE,
          );
          const id = this.activeAction.id;
          this.closePoReceipt(id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_EXPORT,
        status: this.enums.STATUS_COMMON,
        vendorStatus: false,
        icon: AppIcons.ICON_EXPORT,
        isApproveAction: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_CSV_EXPORT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_EXPORT,
            AppAnalyticsConstants.MODULE_NAME_PO_RECEIPT,
            AppActionLabel.ACTION_LABEL_EXPORT,
          );
          const id = this.activeAction.id;
          this.export(id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_VIEW_REPORT,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_VIEW_REPORT,
        vendorStatus: false,
        isApproveAction: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_DOWNLOAD_REPORT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_VIEW_REPORT,
            AppAnalyticsConstants.MODULE_NAME_PO_RECEIPT,
            AppActionLabel.ACTION_LABEL_VIEW_REPORT,
          );
          const attachmentId = this.activeAction.attachmentId;
          this.viewReport(attachmentId, this.getPoReceiptNumber(this.activeAction));
        }
      },
    ];
  }

  /**
   * Change action button array list according to status
   * @param status statua
   */
  actionButtonList(status) {
    return this.tableSupportBase.tableActionList.filter(this.isActionMatch(status, AppEnumConstants.STATUS_COMMON));
  }

  /**
   * This method use for filter table action match by element status
   * @param status string
   */
  isActionMatch(status, common) {
    return function f(element) {
      return (((element.status === status || (element.status === common && status !== AppEnumConstants.STATUS_DRAFT))) && element.authCode);
    };
  }

  /**
   * This method can be use for get po number form selected row
   * @param obj selected obj
   */
  getPoReceiptNumber(obj): string {
    try {
      return JSON.parse(JSON.stringify(obj))['receipt.receiptNumber'];
    } catch (e) {
      return '';
    }
  }

  /**
   * This method use for get vendor list for dropdown
   */
  getAllVendorList() {
    this.billsService.getVendorList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.allVendorList.data = res.body;
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
    this.gridService.getTableStructure(this.appConstant.GRID_PO_RECEIPT_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.PO_RECEIPT_TABLE_KEY, this.columnSelect);
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }

  loadBulkButtonData() {
    this.poReceiptService.getPOReceiptBulkActionData().subscribe((res: any) => {
      if (res.status === AppResponseStatus.STATUS_SUCCESS) {
        const arr = [];
        for (const property of res.body) {
          const val: ButtonPropertiesDto = property;
          arr.push(
            {
              label: val.label,
              action: val.action,
              authCode: val.authCode,
              disabled: !val.active,
              icon: val.icon,
              command: (event) => {
                this.bulkButtonAction(event.item.action);
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
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.getDataFromBackend();
  }

  getDataFromBackend() {
    this.poReceiptService.getPOReceiptTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
   * Download Generated Report File
   * @param id
   * @param number
   */
  viewReport(id, number) {
    if (id != null) {
      this.poReceiptService.viewReport(id).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          console.log('start download:', res);
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'Purchase Order Receipt (' + number + ')');
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


  export(id) {
    const tempArray = [];
    tempArray.push(id);
    this.poReceiptService.bulkExportSelected(tempArray).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.tableSupportBase.rows = [];
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Purchase Order Receipt.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notificationService.successMessage(HttpResponseMessage.SINGLE_RECEIPTS_EXPORTED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
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
      message: 'You want to delete this Receipt',
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
   * this method can be used to discard draft record
   * @param id to draft id
   */
  deleteDraft(id) {
    this.confirmationService.confirm({
      key: 'poReceiptDraftDeleteKey',
      message: 'You want to delete this Draft',
      accept: () => {
        this.poReceiptService.deleteReceipt(id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.getDataFromBackend();
            this.tableSupportBase.rows = [];
            this.notificationService.successMessage(HttpResponseMessage.DRAFT_DISCARDED_SUCCESSFULLY);
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
        message: 'You want to delete the selected Receipt(s)',
        key: 'poReceipt',
        accept: () => {
          this.poReceiptService.bulkDelete(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.getDataFromBackend();
                this.tableSupportBase.rows = [];
              } else {
                this.notificationService.successMessage(HttpResponseMessage.PO_RECEIPTS_DELETED_SUCCESSFULLY);
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
    if (this.commonUtil.isSelectOnlyDraft(this.tableSupportBase.rows, 'receipt.status')) {
      this.notificationService.infoMessage(HttpResponseMessage.DRAFTED_RECEIPT_CANNOT_BE_EXPORTED);
      this.isExporting = false;
      return;
    }
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.poReceiptService.bulkExportSelected(ids).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.loadData(this.tableSupportBase.searchFilterDto);
          this.tableSupportBase.rows = [];
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'Receipts.csv');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.notificationService.successMessage(HttpResponseMessage.SELECTED_PO_RECEIPTS_EXPORTED_SUCCESSFULLY);
        } else {
          this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
        }
        this.isExporting = false;
      }, error => {
        this.isExporting = false;
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

    this.poReceiptService.bulkExportAll(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.tableSupportBase.rows = [];
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Receipts.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notificationService.successMessage(HttpResponseMessage.ALL_PO_RECEIPTS_EXPORTED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
      this.isExporting = false;
    }, error => {
      this.isExporting = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Download Bulk Selections
   */
  bulkDownloadSelected() {
    if (this.commonUtil.isSelectOnlyDraft(this.tableSupportBase.rows, 'receipt.status')) {
      this.notificationService.infoMessage(HttpResponseMessage.DRAFTED_RECEIPT_CANNOT_BE_DOWNLOAD);
      this.isDownloading = false;
      return;
    }
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
          link.setAttribute('download', 'PO_Receipt_list');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
        } else {
          this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
        }
        this.isDownloading = false;
      }, error => {
        this.isDownloading = false;
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
    this.poReceiptService.bulkDownloadAll(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'PO_Receipt_list');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
      this.isDownloading = false;
    }, error => {
      this.isDownloading = false;
      this.notificationService.errorMessage(error);
    });
  }

  getDropDown(col: any) {
    switch (col.field) {
      case 'receipt.vendorId':
        return this.allVendorList.data;
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
    if (field === 'receipt.vendorId' && this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW)) {
      this.overlayId = obj.vendorId;
      showOverlay(this.vendorOverlay);
    }

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
      case 'receipt.vendorId':
        return !!this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW);
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
    if (field === 'receipt.vendorId' && this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW)) {
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
    if (this.poOverlay.overlayVisible) {
      this.poOverlay.hide();
    }
  }

  /**
   * This method can be used to check can be edit po receipt
   * @param poReceiptID to po receipt id
   */
  canEditReceipt(poReceiptID: any) {
    if (!poReceiptID) {
      return;
    }
    this.poReceiptService.poReceiptCanEdit(poReceiptID).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.editPoReceipt = true;
      } else {
        this.notificationService.infoMessage(res.body.message);
        this.editPoReceipt = false;
      }
    }, error => {
      this.editPoReceipt = true;
      this.notificationService.errorMessage(error);
    });
  }
}
