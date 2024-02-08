import {Component, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from "../../../shared/utility/table-support-base";
import {ButtonPropertiesDto} from "../../../shared/dto/common/Buttons/button-properties-dto";
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {AppActionLabel} from "../../../shared/enums/app-action-label";
import {AppIcons} from "../../../shared/enums/app-icons";
import {AppTableKeysData} from "../../../shared/enums/app-table-keys-data";
import {DropdownDto} from "../../../shared/dto/common/dropDown/dropdown-dto";
import {Table} from "primeng/table";
import {AppWindowResolution} from "../../../shared/enums/app-window-resolution";
import {VendorInvoiceService} from "../../../shared/services/vendor-community/vendor-invoice.service";
import {GridService} from "../../../shared/services/common/table/grid.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {ConfirmationService, LazyLoadEvent, MessageService} from "primeng/api";
import {
  BulkNotificationDialogService
} from "../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {AppConstant} from "../../../shared/utility/app-constant";
import {AppBulkButton} from "../../../shared/enums/app-bulk-button";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {BulkNotificationsComponent} from "../../common/bulk-notifications/bulk-notifications.component";
import {OverlayPanel} from "primeng/overlaypanel";
import {BillPaymentDetailsComponent} from "../../bills/bill-payment-details/bill-payment-details.component";
import {BillsService} from "../../../shared/services/bills/bills.service";
import {BillSubmitService} from "../../../shared/services/bills/bill-submit.service";
import {AppTableHeaderActions} from "../../../shared/enums/app-table-header-actions";
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-invoice-template-list',
  templateUrl: './invoice-template-list.component.html',
  styleUrls: ['./invoice-template-list.component.scss']
})
export class InvoiceTemplateListComponent implements OnInit {

  public tableSupportBase = new TableSupportBase();
  public bulkButtonList: ButtonPropertiesDto[] = [];
  public activeAction; // Selected Action Button
  public tableActionList: any [] = [];  // Action Button List
  public downloadActions: any [] = [];
  public downloadActionsOne: any [] = [];
  public exportActionsOne: any [] = [];
  public exportActions: any [] = [];

  public bulkButtonListResponsive: any;
  public billId: any;
  public billPanel: boolean;

  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
  public tableKeyEnum = AppTableKeysData;


  public paymentPanel: boolean;
  public label: any;
  public ids: number [] = [];

  public allVendorList: DropdownDto = new DropdownDto();
  public poList: DropdownDto = new DropdownDto();
  public templateView = false;
  public isEditOcr = false;
  public attachmentId;
  public templateId;
  public emailList: DropdownDto = new DropdownDto();

  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();
  @ViewChild('columnSelect')
  public columnSelect: any;
  @ViewChild('dt')

  public table: Table;
  @ViewChild('billOverlay')
  public billOverlay: OverlayPanel;
  @ViewChild('billPaymentDetailComponent')
  public billPaymentDetailComponent: BillPaymentDetailsComponent;

  constructor(public messageService: MessageService, public billService: BillsService, public billSubmitService: BillSubmitService,
              public gridService: GridService, public confirmationService: ConfirmationService, public privilegeService: PrivilegeService,
              public notificationService: NotificationService, public bulkNotificationDialogService: BulkNotificationDialogService,
              private vendorInvoiceService: VendorInvoiceService) {
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
    sessionStorage.removeItem(AppTableKeysData.OCR_TABLE_KEY);
  }

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_TEMPLATES_INACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.INACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_TEMPLATES_ACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.ACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_TEMPLATES_DELETE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.actionButtonInit();
  }


  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.vendorInvoiceService.getOcrTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
   * Loads Table Data (Settings)
   */
    loadTableData() {
    this.selectedColumns = [];
    // Check for Responsiveness
    this.onTableResize();
    // Removes table Storage on load if present
    sessionStorage.removeItem(AppTableKeysData.OCR_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_VENDOR_INVOICE_TEMPLATE).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.OCR_TABLE_KEY, this.columnSelect);
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
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_TEMPLATES_EDIT),
        command: () => {
          this.attachmentId = this.activeAction.attachmentId;
          this.templateId = this.activeAction.id;
          this.isEditOcr = true;
          this.templateView = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_DELETE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_TEMPLATES_DELETE),
        command: () => {
          this.deleteOcr();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_INACTIVATE,
        status: this.enums.STATUS_ACTIVE,
        icon: AppIcons.ICON_INACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_TEMPLATES_INACTIVATE),
        command: () => {
          this.inactiveOcr();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_ACTIVATE,
        status: this.enums.STATUS_INACTIVE,
        icon: AppIcons.ICON_ACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_TEMPLATES_ACTIVATE),
        command: () => {
          this.activateOcr();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
        icon: AppIcons.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_TEMPLATES_DETAIL_VIEW),
        command: () => {
          this.attachmentId = this.activeAction.attachmentId;
          this.templateId = this.activeAction.id;
          this.isEditOcr = false;
          this.templateView = true;
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DOWNLOAD_ATTACHMENT,
        status: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_DOWNLOAD_BILL_FONT_AWESOME,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_TEMPLATES_DOWNLOAD),
        command: () => {
          const id = this.activeAction.id;
          this.downloadAttachment(id);
        }
      },

    ];
  }


  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.OCR_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_VENDOR_INVOICE_TEMPLATE;
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


  /**
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val) {
    this.activeAction = val;
  }


  /**
   * Change action button array list according to status
   * @param status statua
   * @param isReceiptInList to receipt name
   */
  actionButtonList(status, receiptFileName) {
    return this.tableActionList.filter(this.isActionMatch(status, AppEnumConstants.STATUS_COMMON, receiptFileName));
  }

  /**
   * This method use for filter table action match by element status
   * @param status string
   * @param common to common status
   * @param isReceiptInList to receipt name
   */
  isActionMatch(status, common, receiptFileName) {
    return function f(element) {
      return ((element.status === status || element.status === common) || (element.status === 'receipt' && receiptFileName !== undefined))
        && element.authCode;
    };
  }


  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_ACTIVATE:
        this.bulkActivate();
        break;
      case  AppBulkButton.BUTTON_INACTIVATE:
        this.bulkInactive();
        break;
      case AppBulkButton.BUTTON_DELETE:
        this.bulkDelete();
        break;
    }
  }


  downloadAttachment(id) {
    if (id != null) {
      this.billSubmitService.getBillAttachment(id).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          console.log('start download:', res);
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', JSON.parse(JSON.stringify(this.activeAction))['temp.templateName']);
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

  public bulkDelete() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.confirmationService.confirm({
        message: 'You want to delete the selected templates(s)',
        accept: () => {
          this.vendorInvoiceService.bulkDeleteOcr(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.loadData(this.tableSupportBase.searchFilterDto);
                this.tableSupportBase.rows = [];
              } else {
                this.notificationService.successMessage(HttpResponseMessage.TEMPLATES_DELETED_SUCCESSFULLY);
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

  public bulkInactive() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.vendorInvoiceService.bulkInactivateOcr(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
            this.loadData(this.tableSupportBase.searchFilterDto);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.TEMPLATES_INACTIVATED_SUCCESSFULLY);
            this.loadData(this.tableSupportBase.searchFilterDto);
          }
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  public bulkActivate() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.vendorInvoiceService.bulkActivateOcr(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
            this.loadData(this.tableSupportBase.searchFilterDto);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.TEMPLATES_ACTIVATED_SUCCESSFULLY);
            this.loadData(this.tableSupportBase.searchFilterDto);
          }
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  private deleteOcr() {
    this.confirmationService.confirm({
      message: 'You want to delete this template',
      accept: () => {
        this.vendorInvoiceService.deleteOcr(this.activeAction.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.TEMPLATE_DELETED_SUCCESSFULLY);
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

  private inactiveOcr() {
    this.vendorInvoiceService.inactivateOcr(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.TEMPLATE_INACTIVATED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  private activateOcr() {
    this.vendorInvoiceService.activateOcr(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.TEMPLATE_ACTIVATED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }
}
