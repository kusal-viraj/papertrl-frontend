import {Component, HostListener, Input, OnDestroy, OnInit, Output, EventEmitter, ViewChild} from '@angular/core';
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
import {UserService} from '../../../shared/services/user/user.service';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {PoTableDto} from '../../../shared/dto/po/po-table-dto';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {PoMasterDto} from '../../../shared/dto/po/po-master-dto';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppAutomationEvent} from '../../../shared/enums/app-automation-event';
import {AppHttpResponseMessage} from '../../../shared/enums/app-http-response-message';
import {AppMessageService} from '../../../shared/enums/app-message-service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {EventEmitterService} from '../../../shared/services/common/event-emitter/event-emitter.service';
import {OverlayPanel} from 'primeng/overlaypanel';
import {DetailViewService} from '../../../shared/helpers/detail-view.service';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-po-summary',
  templateUrl: './po-summary.component.html',
  styleUrls: ['./po-summary.component.scss']
})
export class PoSummaryComponent implements OnInit, OnDestroy {

  public sessionUser: UserMasterDto = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));
  public poId:number;
  public approvePoView = false;
  public createPo = false;
  public viewChangeAssignee = false;

  public tableSupportBase = new TableSupportBase();

  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public tableKeyEnum = AppTableKeysData;
  public activeAction;
  public auditTrialPanel: boolean;
  public auditTrial: AuditTrialDto[];

  public isDetailView = false;
  public isEditView = false;
  public detailView = false;
  public tableActionList: any [] = [];
  public poNumber: string;
  public creator: string;
  public overlayId: any;
  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();
  @Output() isCloseApproveView = new EventEmitter();
  public fromPoNoClick = false;


  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);

  }

  @Output() updateCards = new EventEmitter();

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  @ViewChild('vendorOverlay') vendorOverlay: OverlayPanel;
  @ViewChild('projectOverlay') projectOverlay: OverlayPanel;

  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: Table;
  @ViewChild('menu') menu: Menu;
  isValidTaxAmount = false;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  constructor(public poService: PoService, public messageService: MessageService, public confirmationService: ConfirmationService,
              public bulkNotificationDialogService: BulkNotificationDialogService, public roleService: RoleService, public billsService: BillsService,
              public notificationService: NotificationService, public gridService: GridService, public privilegeService: PrivilegeService,
              public userService: UserService, public detailViewService: DetailViewService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.PO_TABLE_KEY);
    this.detailViewService.closePrjDetailView();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.PO_TABLE_KEY);
    promise.then(result => {
        this.tableSupportBase.tableDataOptions = result;
        this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_DASHBOARD_PO_LIST;
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

    this.loadTableData();
    this.actionButtonInit();
  }



  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableActionList = [
      {
        label: AppActionLabel.ACTION_LABEL_APPROVE_REJECT,
        status: this.enums.ST_PENDING,
        vendorStatus: false,
        isApproveAction: true,
        icon: AppIcons.ICON_APPROVE,
        authCode: this.privilegeService.isAuthorizedMultiple([AppAuthorities.PURCHASE_ORDER_APPROVE, AppAuthorities.PURCHASE_ORDER_REJECT,
          AppAuthorities.PURCHASE_ORDER_OVERRIDE_APPROVAL]),
        command: () => {
          this.poId = this.activeAction.id;
          this.approvePoView = true;
          this.detailView = false;
          this.isEditView = false;
          this.createPo = false;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
        icon: AppIcons.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        vendorStatus: false,
        isApproveAction: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW),
        command: () => {
          this.poId = this.activeAction.id;
          this.approvePoView = false;
          this.detailView = true;
          this.fromPoNoClick = true;
          this.isEditView = false;
          this.createPo = false;
        }
      },
    ];
  }

  /**
   * Change action button array list according to status
   * @param status statua
   */
  actionButtonList(status, poObj, vendorStatus) {
    return this.tableActionList.filter(this.isActionMatch(status, AppEnumConstants.STATUS_COMMON, this.isValidApproveAccess(poObj), vendorStatus));
  }

  /**
   * This method use for filter table action match by element status
   * @param status string
   */
  isActionMatch(status, common, isAccessible, vendorStatus) {
    return function f(element) {
      return (element.status === status || element.status === common) && element.authCode && (!element.isApproveAction || isAccessible) &&
        (!element.vendorStatus || vendorStatus === AppEnumConstants.STATUS_NOT_ASSIGNED);
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

    this.gridService.getTableStructure(this.appConstant.GRID_DASHBOARD_PO_LIST).subscribe((res: any) => {
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
    this.poService.getDashboardPOTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_REJECT:
        this.bulkReject();
        break;
      case AppBulkButton.BUTTON_QUICK_APPROVE:
        this.bulkQuickApprove();
        break;
      case AppBulkButton.BUTTON_DELETE:
        this.bulkDelete();
        break;
    }
  }

  /**
   * this method can be used to create po
   */

  createPurchase() {
    this.createPo = true;
    this.isEditView = false;
    this.isValidTaxAmount = false;
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
  skipApproval(id) {
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
  sendToVendorApproval(id) {
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
  refreshGridAfterChangedAssignee() {
    this.viewChangeAssignee = false;
    this.loadData(this.tableSupportBase.searchFilterDto);
  }

  /**
   * This method use for close approval screen and refresh table
   */
  closePOApproval() {
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

  bulkExportAll() {
    this.poService.bulkExportAll(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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

  bulkReject() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.confirmationService.confirm({
        message: 'You want to reject the selected Purchase Order(s)',
        key: 'poLR',
        accept: () => {
          this.poService.bulkReject(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.loadData(this.tableSupportBase.searchFilterDto);
                this.tableSupportBase.rows = [];
              } else {
                this.notificationService.successMessage(HttpResponseMessage.PO_REJECT_SUCCESSFULLY);
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
        message: 'You want to approve the selected Purchase Order(s)',
        key: 'poLA',
        accept: () => {
          this.poService.bulkApprove(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.loadData(this.tableSupportBase.searchFilterDto);
                this.tableSupportBase.rows = [];
              } else {
                this.notificationService.successMessage(HttpResponseMessage.PO_APPROVED_SUCCESSFULLY);
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
        message: 'You want to delete the selected Purchase Order(s)',
        key: 'poL',
        accept: () => {
          this.poService.bulkDelete(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.loadData(this.tableSupportBase.searchFilterDto);
                this.tableSupportBase.rows = [];
              } else {
                this.notificationService.successMessage(HttpResponseMessage.PO_DELETED_SUCCESSFULLY);
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
      message: 'You want to delete this Purchase Order',
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

  viewReport(id) {
    if (id != null) {
      this.poService.viewReport(id).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          console.log('start download:', res);
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'Purchase Order');
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
   * Is User Authorized to approve
   */
  isValidApproveAccess(poObj) {

    const user = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));

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
    if (field === 'po.vendorId' && this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW)) {
      this.overlayId = obj.vendorId;
      showOverlay(this.vendorOverlay);
    }

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
      case 'po.vendorId':
        return !!this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW);
      case 'po.projectCodeId':
        return !!this.privilegeService.isAuthorized(AppAuthorities.PROJECT_CODES_DETAIL_VIEW);
      case 'po.poNumber':
        return !!this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW);
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
    if (field === 'po.vendorId' && this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW)) {
      this.detailViewService.openVendorDetailView(obj.vendorId);
    }
    if (field === 'po.poNumber' && this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW)) {
      this.activeAction = obj;
      this.fromPoNoClick = true;
      this.detailView = true;
      this.poId = obj.id;
    }
  }

  /**
   * Hide Overlays if Visible
   */
  hideOverlays() {
    if (this.vendorOverlay.overlayVisible) {
      this.vendorOverlay.hide();
    }
    if (this.projectOverlay.overlayVisible) {
      this.projectOverlay.hide();
    }
  }
}
