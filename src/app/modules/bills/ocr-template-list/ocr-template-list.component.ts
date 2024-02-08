import {Component, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from "../../../shared/utility/table-support-base";
import {ButtonPropertiesDto} from "../../../shared/dto/common/Buttons/button-properties-dto";
import {VendorPaymentTableDto} from "../../../shared/dto/vendor/vendor-payment-table-dto";
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {AppActionLabel} from "../../../shared/enums/app-action-label";
import {AppIcons} from "../../../shared/enums/app-icons";
import {AppTableKeysData} from "../../../shared/enums/app-table-keys-data";
import {DropdownDto} from "../../../shared/dto/common/dropDown/dropdown-dto";
import {Table} from "primeng/table";
import {OverlayPanel} from "primeng/overlaypanel";
import {BillPaymentDetailsComponent} from "../bill-payment-details/bill-payment-details.component";
import {ConfirmationService, LazyLoadEvent, MessageService} from "primeng/api";
import {BillPaymentService} from "../../../shared/services/bill-payment-service/bill-payment.service";
import {GridService} from "../../../shared/services/common/table/grid.service";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {BulkNotificationDialogService} from "../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service";
import {AppWindowResolution} from "../../../shared/enums/app-window-resolution";
import {AppConstant} from "../../../shared/utility/app-constant";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {BillsService} from "../../../shared/services/bills/bills.service";
import {AppBulkButton} from "../../../shared/enums/app-bulk-button";
import {BulkNotificationsComponent} from "../../common/bulk-notifications/bulk-notifications.component";
import {DetailViewService} from "../../../shared/helpers/detail-view.service";
import {Subscription} from "rxjs";
import {AddTemplateComponent} from "../../common/add-template/add-template.component";
import {AppTableHeaderActions} from "../../../shared/enums/app-table-header-actions";
import {Menu} from "primeng/menu";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";

@Component({
  selector: 'app-ocr-template-list',
  templateUrl: './ocr-template-list.component.html',
  styleUrls: ['./ocr-template-list.component.scss']
})
export class OcrTemplateListComponent implements OnInit {

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
  public templateEditViewFromDetailView = false;
  public isEditOcr = false;
  public attachmentId;
  public templateId;
  public emailList: DropdownDto = new DropdownDto();
  public tableUpdateSubscription = new Subscription();
  public overlayId: any;

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

  @ViewChild('columnSelect')
  public columnSelect: any;
  @ViewChild('dt')
  public table: Table;
  @ViewChild('vendorOverlay') vendorOverlay: OverlayPanel;
  @ViewChild('addTemplateComponent') addTemplateComponent: AddTemplateComponent;
  @ViewChild('billPaymentDetailComponent')
  public billPaymentDetailComponent: BillPaymentDetailsComponent;
  @ViewChild('menu') menu: Menu;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }


  constructor(public messageService: MessageService, public billPaymentService: BillPaymentService, public billService: BillsService,
              public gridService: GridService, public confirmationService: ConfirmationService, public privilegeService: PrivilegeService,
              public notificationService: NotificationService, public bulkNotificationDialogService: BulkNotificationDialogService,
              public detailViewService: DetailViewService, private gaService: GoogleAnalyticsService,) {
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.OCR_TABLE_KEY);
    this.tableUpdateSubscription.unsubscribe();
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
    this.tableUpdateSubscription = this.billService.updateTableData.subscribe(() => {
      if (this.tableSupportBase.searchFilterDto?.filters) {
        this.loadData(this.tableSupportBase.searchFilterDto);
      }
    });
    this.actionButtonInit();
    this.getAllVendorList();
    this.getPoList();
    this.getEmailList();
  }

  getEmailList() {
    this.billService.getOcrEmailList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.emailList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.billService.getOcrTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
    this.gridService.getTableStructure(this.appConstant.GRID_OCR_TEMPLATE_LIST).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS){
        this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.OCR_TABLE_KEY, this.columnSelect);
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
        label: AppActionLabel.ACTION_LABEL_EDIT,
        icon: AppIcons.ICON_EDIT,
        status: this.enums.STATUS_ACTIVE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_TEMPLATES_EDIT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_BILL_TEMPLATES,
            AppActionLabel.ACTION_LABEL_EDIT);
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
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DELETE,
            AppAnalyticsConstants.MODULE_NAME_BILL_TEMPLATES,
            AppActionLabel.ACTION_LABEL_DELETE
          );
          this.deleteOcr();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_INACTIVATE,
        status: this.enums.STATUS_ACTIVE,
        icon: AppIcons.ICON_INACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_TEMPLATES_INACTIVATE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_INACTIVATE,
            AppAnalyticsConstants.MODULE_NAME_BILL_TEMPLATES,
            AppActionLabel.ACTION_LABEL_INACTIVATE);
          this.inactiveOcr();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_ACTIVATE,
        status: this.enums.STATUS_INACTIVE,
        icon: AppIcons.ICON_ACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_TEMPLATES_ACTIVATE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_ACTIVATE,
            AppAnalyticsConstants.MODULE_NAME_BILL_TEMPLATES,
            AppActionLabel.ACTION_LABEL_ACTIVATE);
          this.activateOcr();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
        icon: AppIcons.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_TEMPLATES_DETAIL_VIEW),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
            AppAnalyticsConstants.MODULE_NAME_BILL_TEMPLATES,
            AppActionLabel.ACTION_LABEL_DETAIL_VIEW);
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
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_DOWNLOAD_ATTACHMENT,
            AppAnalyticsConstants.MODULE_NAME_BILL_TEMPLATES,
            this.actionLabelEnum.ACTION_LABEL_DOWNLOAD_ATTACHMENT);
          const id = this.activeAction.attachmentId;
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
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_OCR_TEMPLATE_LIST;
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
   * A Single value hover from table
   * @param field to filed
   * @param obj to customer obj
   * @param event to click event
   */
  tdHover(field, obj: any, event) {
    if (field === 'vendor.id' && this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW)) {
      this.overlayId = obj['temp.vendorId'];
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

  /**
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: VendorPaymentTableDto) {
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
   * get refreshTable data
   * @param value to emitted value
   */
  isRefreshTable(value) {
    if (value === 'PAYMENT_UPDATE') {
      this.loadData(this.tableSupportBase.searchFilterDto);
      this.actionButtonInit();
    }
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


  /**
   * This method use for get vendor list for dropdown
   */
  getAllVendorList() {
    this.billService.getVendorList(!this.isEditOcr).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.allVendorList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get vendor related po list
   */
  getPoList() {
    this.billService.getTablePoList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.poList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method can be use for get dropdown value
   * @param col col name
   */
  getDropdownData(col: any) {
    switch (col.field) {
      case 'vendor.id':
        return this.allVendorList.data;

      case 'temp.status':
        return col.dropdownValues;

      case 'tmpemail.email':
        return this.emailList.data;
    }
  }


  downloadAttachment(id) {
    if (id != null) {
      this.billService.downloadBill(id).subscribe((res: any) => {
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

  private deleteOcr() {
    this.confirmationService.confirm({
      message: 'You want to delete this template',
      accept: () => {
        this.billService.deleteOcr(this.activeAction.id).subscribe((res: any) => {
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
    this.billService.inactivateOcr(this.activeAction.id).subscribe((res: any) => {
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
    this.billService.activateOcr(this.activeAction.id).subscribe((res: any) => {
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
          this.billService.bulkDeleteOcr(ids).subscribe((res: any) => {
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
      this.billService.bulkInactivateOcr(ids).subscribe((res: any) => {
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
      this.billService.bulkActivateOcr(ids).subscribe((res: any) => {
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
}
