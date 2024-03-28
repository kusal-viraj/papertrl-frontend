import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Table} from 'primeng/table';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {Subscription} from 'rxjs';
import {AuditTrialDto} from '../../../shared/dto/common/audit-trial/audit-trial-dto';
import {UserMasterDto} from '../../../shared/dto/user/user-master-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {PoTableDto} from '../../../shared/dto/po/po-table-dto';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {PoService} from '../../../shared/services/po/po.service';
import {RoleService} from '../../../shared/services/roles/role.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {PoMasterDto} from '../../../shared/dto/po/po-master-dto';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppAutomationEvent} from '../../../shared/enums/app-automation-event';
import {AppMessageService} from '../../../shared/enums/app-message-service';
import {AppHttpResponseMessage} from '../../../shared/enums/app-http-response-message';
import {
  BulkNotificationDialogService
} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {OverlayPanel} from "primeng/overlaypanel";
import {DetailViewService} from "../../../shared/helpers/detail-view.service";
import {AppTableHeaderActions} from "../../../shared/enums/app-table-header-actions";
import {BillsService} from '../../../shared/services/bills/bills.service';
import {Menu} from "primeng/menu";


@Component({
  selector: 'app-vendor-po',
  templateUrl: './vendor-po.component.html',
  styleUrls: ['./vendor-po.component.scss']
})
export class VendorPoComponent implements OnInit, OnDestroy {
  public sessionUser: UserMasterDto = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));

  @Output() updatePReceiptSearchTable = new EventEmitter();
  @Input() fromVendor: boolean;
  @Input() vendorId: any;
  public poId: number;
  public approvePoView = false;
  public createPo = false;
  public viewChangeAssignee = false;

  public tableSupportBase = new TableSupportBase();

  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any;

  public enums = AppEnumConstants;
  public tableKeyEnum = AppTableKeysData;
  public activeAction: PoTableDto;
  public auditTrialPanel: boolean;
  public auditTrial: AuditTrialDto[];

  public isDetailView = false;
  public isEditView = false;
  public detailView = false;
  public tableActionList: any [] = [];
  public poNumber: string;
  public creator: string;
  public appAuthorities = AppAuthorities;

  public billAssign = false;
  public subscription: Subscription;

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

  @ViewChild('projectOverlay') projectOverlay: OverlayPanel;
  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: Table;
  @ViewChild('menu') menu: Menu;
  isValidTaxAmount = false;
  public overlayId: any;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  constructor(public poService: PoService, public messageService: MessageService, public confirmationService: ConfirmationService,
              public bulkNotificationDialogService: BulkNotificationDialogService, public roleService: RoleService,
              public notificationService: NotificationService, public gridService: GridService, public billsService: BillsService,
              public privilegeService: PrivilegeService, public detailViewService: DetailViewService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.Item_TABLE_KEY);
    this.detailViewService.closePrjDetailView();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.PO_TABLE_KEY);
    promise.then(result => {
        this.tableSupportBase.tableDataOptions = result;
        this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_VENDOR_PURCHASE_ORDER_LIST;
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
    if (this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_QUICK_APPROVE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.QUICK_APPROVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.PO_RE_OPEN)) {
      this.availableHeaderActions.push(AppTableHeaderActions.RE_OPEN);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.PO_CLOSE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.CLOSE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DELETE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }
    if (this.privilegeService.isAuthorizedMultiple([AppAuthorities.PURCHASE_ORDER_REJECT,
      AppAuthorities.PURCHASE_ORDER_OVERRIDE_APPROVAL])) {
      this.availableHeaderActions.push(AppTableHeaderActions.REJECT);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DOWNLOAD_REPORT)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DOWNLOAD);
    }

    if (this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_CSV_EXPORT)) {
      this.availableHeaderActions.push(AppTableHeaderActions.EXPORT);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.actionButtonInit();
  }

  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableActionList = [
      {
        label: AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
        icon: AppIcons.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW),
        command: () => {
          this.poId = this.activeAction.id;
          this.approvePoView = false;
          this.detailView = true;
          this.isEditView = false;
          this.createPo = false;
        }
      },
      // {
      //   label: AppActionLabel.ACTION_LABEL_APPROVE_REJECT,
      //   status: this.enums.STATUS_PENDING,
      //   icon: AppIcons.ICON_APPROVE,
      //   authCode: this.privilegeService.isAuthorizedMultiple([AppAuthorities.PURCHASE_ORDER_APPROVE, AppAuthorities.PURCHASE_ORDER_REJECT,
      //     AppAuthorities.PURCHASE_ORDER_OVERRIDE_APPROVAL]),
      //   command: () => {
      //     this.poId = this.activeAction.id;
      //     this.approvePoView = true;
      //     this.detailView = false;
      //     this.isEditView = false;
      //     this.createPo = false;
      //   }
      // },
      // {
      //   label: AppActionLabel.ACTION_LABEL_APPROVE_REJECT,
      //   status: this.enums.LABEL_DELETION_PENDING,
      //   icon: AppIcons.ICON_APPROVE,
      //   authCode: this.privilegeService.isAuthorizedMultiple([AppAuthorities.PURCHASE_ORDER_APPROVE, AppAuthorities.PURCHASE_ORDER_REJECT,
      //     AppAuthorities.PURCHASE_ORDER_OVERRIDE_APPROVAL]),
      //   command: () => {
      //     this.poId = this.activeAction.id;
      //     this.approvePoView = true;
      //     this.detailView = false;
      //     this.isEditView = false;
      //     this.createPo = false;
      //   }
      // },
      // {
      //   label: AppActionLabel.ACTION_LABEL_VIEW_REPORT,
      //   status: this.enums.STATUS_COMMON,
      //   icon: AppIcons.ICON_VIEW_REPORT,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DOWNLOAD_REPORT),
      //   command: () => {
      //   }
      // },
      // {
      //   label: AppActionLabel.ACTION_LABEL_EDIT_RESUBMIT,
      //   icon: AppIcons.ICON_EDIT,
      //   status: this.enums.STATUS_REJECT,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_EDIT),
      //   command: () => {
      //     this.poId = this.activeAction.id;
      //     this.detailView = false;
      //     this.isEditView = true;
      //     this.createPo = true;
      //   }
      // },
      // {
      //   label: AppActionLabel.ACTION_LABEL_SKIP_APPROVAL,
      //   status: this.enums.STATUS_PENDING,
      //   icon: AppIcons.ICON_SKIP_APPROVAL,
      //   authCode: this.privilegeService.isAuthorizedMultiple([AppAuthorities.PURCHASE_ORDER_SKIP_APPROVAL,
      //     AppAuthorities.PURCHASE_ORDER_OVERRIDE_APPROVAL]),
      //   command: () => {
      //     const id = this.activeAction.id;
      //     this.skipApproval(id);
      //   }
      // },
      // {
      //   label: AppActionLabel.ACTION_CREATE_BILL,
      //   icon: AppIcons.ICON_ADD_TO_LOCAL,
      //   status: this.enums.STATUS_APPROVED,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_CREATE),
      //   command: () => {
      //     this.poId = this.activeAction.id;
      //     this.billAssign = true;
      //   }
      // },
      // {
      //   label: AppActionLabel.ACTION_LABEL_CHANGE_ASSIGNEE,
      //   status: this.enums.STATUS_PENDING,
      //   icon: AppIcons.ICON_CHANGE_ASSIGNEE,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_CHANGE_ASSIGNEE),
      //   command: () => {
      //     this.poId = this.activeAction.id;
      //     this.viewChangeAssignee = true;
      //   }
      // },
      // {
      //   label: AppActionLabel.ACTION_LABEL_DELETE,
      //   status: this.enums.STATUS_REJECT,
      //   icon: AppIcons.ICON_DELETE,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DELETE),
      //   command: () => {
      //     const id = this.activeAction.id;
      //     this.delete(id);
      //   }
      // },
      // {
      //   label: AppActionLabel.ACTION_LABEL_AUDIT_TRAIL,
      //   status: this.enums.STATUS_COMMON,
      //   icon: AppIcons.ICON_AUDIT_TRAIL,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_VIEW_AUDIT_TRAIL),
      //   command: () => {
      //     this.viewAuditTrail();
      //   }
      // },
      // {
      //   label: AppActionLabel.ACTION_LABEL_SEND_TO_VENDOR_APPROVAL,
      //   status: this.enums.STATUS_APPROVED,
      //   icon: AppIcons.ICON_SEND_APPROVAL,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_SEND_VENDOR_APPROVAL),
      //   command: () => {
      //     const id = this.activeAction.id;
      //     this.sendToVendorApproval(id);
      //   }
      // }
    ];
  }

  /**
   * Change action button array list according to status
   * @param status statua
   */
  actionButtonList(status, poObj) {
    return this.tableActionList.filter(this.isActionMatch(status, AppEnumConstants.STATUS_COMMON, this.isValidApproveAccess(poObj)));
  }

  /**
   * This method use for filter table action match by element status
   * @param status string
   */
  isActionMatch(status, common, isAccessible) {
    return function f(element) {
      return ((element.status === status || element.status === common)) && element.authCode && (!element.isApproveAction || isAccessible);
    };
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
      sessionStorage.removeItem(AppTableKeysData.PO_TABLE_KEY);

      this.gridService.getTableStructure(this.appConstant.GRID_VENDOR_PURCHASE_ORDER_LIST).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.PO_TABLE_KEY, this.columnSelect);
          } else {
            this.notificationService.errorMessage(res.body.message);
          }
          resolve(true);
        }, (error => {
          this.notificationService.errorMessage(error);
        })
      );
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
    this.poService.getVendorPOTableData(this.tableSupportBase.searchFilterDto, this.vendorId).subscribe((res: any) => {
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
    this.poNumber = JSON.parse(JSON.stringify(val))['po.poNumber'];
  }

  /**
   * This method use for view audit trial
   */
  viewAuditTrail() {
    this.poService.getAuditTrial(this.activeAction.id).subscribe((res: any) => {
      this.auditTrial = res.body;
      this.auditTrialPanel = true;
    });
  }


  /**
   * This method use for skip approval
   */
  public skipApproval(id) {
    const poMasterDto = new PoMasterDto();
    poMasterDto.id = this.activeAction.id;
    poMasterDto.documentTypeId = AppDocumentType.PURCHASE_ORDER;
    poMasterDto.eventId = AppAutomationEvent.DELETED;
    this.poService.skipApproval(id).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.notificationService.successMessage(AppHttpResponseMessage.PO_SKIP_APPROVAL_SUCCESSFULLY);
        // NEED TO REFRESH TABLE
        this.loadData(this.tableSupportBase.searchFilterDto);

      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for send to vendor approval
   */
  public sendToVendorApproval(id) {
    this.poService.sendToVendorApproval(id).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.messageService.add({
          severity: AppMessageService.SEVERITIES_SUCCESS, summary: AppMessageService.SUMMARY_SUCCESS,
          detail: AppHttpResponseMessage.PO_SEND_TO_VENDOR_SUCCESSFULLY
        });
        // NEED TO REFRESH TABLE
        this.loadData(this.tableSupportBase.searchFilterDto);

      } else {
        this.messageService.add({
          severity: AppMessageService.SEVERITIES_INFO, summary: AppMessageService.SUMMARY_INFO, detail: res.body.message
        });
      }
    }, error => {
      this.messageService.add({
        severity: AppMessageService.SUMMARY_ERROR,
        summary: AppMessageService.SUMMARY_ERROR,
        detail: error
      });
    });

  }

  /**
   * This method use for close change assignee drawer and refresh table
   */
  public refreshGridAfterChangedAssignee() {
    this.viewChangeAssignee = false;
    this.loadData(this.tableSupportBase.searchFilterDto);
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
    this.createPo = false;
    this.loadData(this.tableSupportBase.searchFilterDto);
  }

  /**
   * Close PO Receipt
   */
  openPoList() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.poService.openPoList(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
            this.loadData(this.tableSupportBase.searchFilterDto);
            this.updatePReceiptSearchTable.emit();
            this.tableSupportBase.rows = [];
          } else {
            this.notificationService.successMessage(HttpResponseMessage.POS_OPEN_SUCCESSFULLY);
            this.loadData(this.tableSupportBase.searchFilterDto);
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
  closePoList() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.poService.closePoList(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
            this.loadData(this.tableSupportBase.searchFilterDto);
            this.updatePReceiptSearchTable.emit();
            this.tableSupportBase.rows = [];
          } else {
            this.notificationService.successMessage(HttpResponseMessage.POS_CLOSED_SUCCESSFULLY);
            this.loadData(this.tableSupportBase.searchFilterDto);
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

  bulkExportAll() {
    if (this.tableSupportBase.rows.length !== 0) {
      this.bulkExportSelected();
      return;
    }
    this.poService.vendorPoBulkExportAll(this.tableSupportBase.searchFilterDto, this.vendorId).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
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

  bulkExportSelected() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.poService.bulkExportSelected(ids).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
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

  bulkDownloadAll() {
    if (this.tableSupportBase.rows.length !== 0) {
      this.bulkDownloadSelected();
      return;
    }
    this.poService.vendorPoBulkDownloadAll(this.tableSupportBase.searchFilterDto, this.vendorId).subscribe((res: any) => {
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

  bulkReject() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.confirmationService.confirm({
        message: 'You want to reject the selected Receipt(s)!',
        key: 'poLR',
        accept: () => {
          this.poService.bulkReject(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.loadData(this.tableSupportBase.searchFilterDto);
                this.tableSupportBase.rows = [];
              } else {
                this.notificationService.successMessage(HttpResponseMessage.PO_RECEIPTS_CLOSED_SUCCESSFULLY);
                this.loadData(this.tableSupportBase.searchFilterDto);
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

  bulkQuickApprove() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.confirmationService.confirm({
        message: 'You want to approve the selected Purchase Order(s)!',
        key: 'poLA',
        accept: () => {
          this.poService.bulkApprove(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.loadData(this.tableSupportBase.searchFilterDto);
                this.tableSupportBase.rows = [];
              } else {
                this.notificationService.successMessage(HttpResponseMessage.PO_RECEIPTS_CLOSED_SUCCESSFULLY);
                this.loadData(this.tableSupportBase.searchFilterDto);
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

  bulkDelete() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.confirmationService.confirm({
        message: 'You want to delete the selected Purchase Order(s)!',
        key: 'poL',
        accept: () => {
          this.poService.bulkDelete(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.loadData(this.tableSupportBase.searchFilterDto);
                this.tableSupportBase.rows = [];
              } else {
                this.notificationService.successMessage(HttpResponseMessage.PO_RECEIPTS_CLOSED_SUCCESSFULLY);
                this.loadData(this.tableSupportBase.searchFilterDto);
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

  delete(id) {
    this.confirmationService.confirm({
      key: 'poL',
      message: 'You want to delete this Purchase Order!',
      accept: () => {
        this.poService.deletePurchaseOrder(id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.loadData(this.tableSupportBase.searchFilterDto);
            this.tableSupportBase.rows = [];
            this.notificationService.successMessage(AppHttpResponseMessage.RECORD_DELETED_SUCCESSFULLY);
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
   * Is User Authorized to approve
   */
  isValidApproveAccess(poObj) {

    const user = JSON.parse(localStorage.getItem('user'));

    if (this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_OVERRIDE_APPROVAL)) {
      return true;
    }

    return this.isApprovalGroupExist(user.approvalGroups, poObj) || this.isApprovalGroupUserExist(user.username, poObj);

  }

  /**
   * Approval Group equals to logged user
   */
  isApprovalGroupExist(approvalGroup, poObj) {
    if (!poObj.approvalGroup) {
      return false;
    }

    return approvalGroup.includes(poObj.approvalGroup);
  }

  /**
   * User equals to logged user
   */
  isApprovalGroupUserExist(approvalUser, poObj) {
    if (!poObj.approvalUser) {
      return false;
    }

    return approvalUser === poObj.approvalUser;
  }

  /**
   * A Single value hover from table
   * @param field to filed
   * @param obj to customer obj
   * @param event to click event
   */
  tdHover(field, obj: any, event) {
    if (field === 'po.projectCodeId' && this.privilegeService.isAuthorized(AppAuthorities.PROJECT_CODES_DETAIL_VIEW)) {
      this.overlayId = obj.projectCodeId;
      showOverlay(this.projectOverlay);
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
      case 'po.projectCodeId':
        return !!this.privilegeService.isAuthorized(AppAuthorities.PROJECT_CODES_DETAIL_VIEW);
    }
  }

  /**
   * A Single value clicked from table
   * @param field to filed
   * @param obj to customer obj
   */
  tdClick(field, obj: any, event) {
    if (field === 'po.projectCodeId' && this.privilegeService.isAuthorized(AppAuthorities.PROJECT_CODES_DETAIL_VIEW)) {
      this.detailViewService.openProjectCodeDetailView(obj.projectCodeId);
    }
  }

  /**
   * Hide Overlays if Visible
   */
  hideOverlays() {
    if (this.projectOverlay.overlayVisible) {
      this.projectOverlay.hide();
    }
  }
}
