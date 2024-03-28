import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {OverlayPanel} from 'primeng/overlaypanel';
import {VendorBillTableDto} from '../../../shared/dto/vendor/vendor-bill-table-dto';
import {Subscription} from 'rxjs';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {Table} from 'primeng/table';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {AuditTrialDto} from '../../../shared/dto/common/audit-trial/audit-trial-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {BillMasterDto} from '../../../shared/dto/bill/bill-master-dto';
import {
  BulkNotificationDialogService
} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {Router} from '@angular/router';
import {BillHomeComponent} from '../bill-home/bill-home.component';
import {PoService} from '../../../shared/services/po/po.service';
import {DetailViewService} from '../../../shared/helpers/detail-view.service';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {animate, group, state, style, transition, trigger} from '@angular/animations';
import {Menu} from 'primeng/menu';
import {GoogleAnalyticsService} from '../../../shared/services/google-analytics/google-analytics.service';
import {AppAnalyticsConstants} from '../../../shared/enums/app-analytics-constants';
import {AppDocumentType} from '../../../shared/enums/app-document-type';

@Component({
  selector: 'app-bill-list',
  templateUrl: './bill-list.component.html',
  styleUrls: ['./bill-list.component.scss']
})
export class BillListComponent implements OnInit, OnDestroy {
  public originalFileName: string;
  public overlayId: any;
  public documentType: any;
  public isAllowedToDownload = false;
  public isApplyCreditNote = false;
  public isApplyCreditNoteAsBulk = false;
  public warningForIgnoredBill: string;
  public billType: any;
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
  public commonUtil = new CommonUtility();
  public billPanel: boolean;
  public poPanel: boolean;
  public poReceiptPanel: boolean;
  public viewChangeAssignee: boolean;
  public bulkButtonListResponsive: any;
  public id: any;
  public detailView = false;
  public approveBillView: boolean;
  public auditTrialPanel: boolean;
  public auditTrial: AuditTrialDto[];
  public filteredBills: any [] = [];
  public billNo: string;
  public reSubmit = false;
  public eBillEdit = false;
  public isBillPayment = false;
  public tableActiveVendor;
  public tableActiveBillId;
  public isDownloading = false;
  public isDetailReportDownloading = false;
  public isExporting = false;
  public tableUpdateSubscription = new Subscription();
  @Output() isViewContent = new EventEmitter();
  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: Table;
  @ViewChild('poOverlay') poOverlay: OverlayPanel;
  @ViewChild('vendorOverlay') vendorOverlay: OverlayPanel;
  @ViewChild('paymentOverlay') paymentOverlay: OverlayPanel;
  @ViewChild('poReceiptOverlay') poReceiptOverlay: OverlayPanel;
  @ViewChild('menu') menu: Menu;

  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();

  constructor(public billsService: BillsService, public gridService: GridService, public notificationService: NotificationService,
              public confirmationService: ConfirmationService, public bulkNotificationDialogService: BulkNotificationDialogService,
              public router: Router, public billHome: BillHomeComponent, public poService: PoService,
              private gaService: GoogleAnalyticsService,
              public privilegeService: PrivilegeService, public detailViewService: DetailViewService) {
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
    sessionStorage.removeItem(AppTableKeysData.BILL_TABLE_KEY);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.tableUpdateSubscription.unsubscribe();
  }

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_QUICK_APPROVE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.QUICK_APPROVE);
    }
    if (this.privilegeService.isAuthorizedMultiple([AppAuthorities.BILL_REJECT, AppAuthorities.BILL_OVERRIDE_APPROVAL])) {
      this.availableHeaderActions.push(AppTableHeaderActions.REJECT);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_ACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.ACTIVE);
    }

    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_INACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.INACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_APPLY_CREDIT_NOTE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.APPLY_CREDIT_NOTE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_DELETE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_OFFLINE_PAYMENT_PROCESSING)) {
      this.availableHeaderActions.push(AppTableHeaderActions.PAYMENT_PROCESSING);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_OFFLINE_PAYMENT_PROCESSING)) {
      this.availableHeaderActions.push(AppTableHeaderActions.PAYMENT_UN_PROCESSING);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_CSV_EXPORT)) {
      this.availableHeaderActions.push(AppTableHeaderActions.EXPORT);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_DOWNLOAD_BILL)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DOWNLOAD_BILL_DETAILED_REPORTS);
    }

    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_DOWNLOAD_BILL)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DOWNLOAD);
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
    this.billHome.updateBillSearchGrid.subscribe(value => {
      if (value != null) {
        this.getDataFromBackend();
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
    sessionStorage.removeItem(AppTableKeysData.BILL_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_Bill_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.BILL_TABLE_KEY, this.columnSelect);
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
    this.tableActionList = [
      {
        label: this.actionLabelEnum.ACTION_LABEL_APPROVE_REJECT,
        status: this.enums.STATUS_PENDING,
        icon: this.iconEnum.ICON_APPROVE,
        isApproveAction: true,
        isApplyCreditNote: false,
        isEdit: false,
        authCode: this.privilegeService.isAuthorizedMultiple([AppAuthorities.BILL_APPROVE, AppAuthorities.BILL_REJECT,
          AppAuthorities.BILL_OVERRIDE_APPROVAL]),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_APPROVE_REJECT,
            'Bill',
            this.actionLabelEnum.ACTION_LABEL_APPROVE_REJECT);
          this.id = this.activeAction.id;
          this.detailView = false;
          this.approveBillView = true;
          this.auditTrialPanel = false;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_INACTIVATE,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_INACTIVATE,
        isApproveAction: false,
        isApplyCreditNote: false,
        inactivate: true,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_INACTIVATE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_INACTIVATE,
            AppAnalyticsConstants.MODULE_NAME_BILL,
            AppActionLabel.ACTION_LABEL_INACTIVATE);
          this.inactiveBill();
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_ACTIVATE,
        status: this.enums.STATUS_LETTER_INACTIVE,
        icon: this.iconEnum.ICON_ACTIVATE,
        isApproveAction: false,
        isApplyCreditNote: false,
        activate: true,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_ACTIVATE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_ACTIVATE,
            AppAnalyticsConstants.MODULE_NAME_BILL,
            this.actionLabelEnum.ACTION_LABEL_ACTIVATE);
          this.activeBill();
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_CHANGE_ASSIGNEE,
        status: this.enums.STATUS_PENDING,
        icon: this.iconEnum.ICON_CHANGE_ASSIGNEE,
        isApproveAction: false,
        isApplyCreditNote: false,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_CHANGE_ASSIGNEE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_CHANGE_ASSIGNEE,
            AppAnalyticsConstants.MODULE_NAME_BILL,
            this.actionLabelEnum.ACTION_LABEL_CHANGE_ASSIGNEE);
          this.canChangeAssignee();
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_UNDO_APPROVAL,
        status: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_UNDO_STATUS,
        isApproveAction: false,
        isApplyCreditNote: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_UNDO_ACTION),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_UNDO_APPROVAL,
            AppAnalyticsConstants.MODULE_NAME_BILL,
            this.actionLabelEnum.ACTION_LABEL_UNDO_APPROVAL);
          const id = this.activeAction.id;
          this.undoApproval(id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_SKIP_APPROVAL,
        status: this.enums.STATUS_PENDING,
        icon: this.iconEnum.ICON_SKIP_APPROVAL,
        isApproveAction: false,
        isApplyCreditNote: false,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_SKIP_APPROVAL),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_SKIP_APPROVAL,
            AppAnalyticsConstants.MODULE_NAME_BILL,
            this.actionLabelEnum.ACTION_LABEL_SKIP_APPROVAL);
          const id = this.activeAction.id;
          this.skipApproval(id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_EDIT_RESUBMIT,
        status: this.enums.STATUS_REJECT,
        icon: this.iconEnum.ICON_EDIT_RESUBMIT,
        isApproveAction: false,
        isApplyCreditNote: false,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_EDIT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_EDIT_RESUBMIT,
            AppAnalyticsConstants.MODULE_NAME_BILL,
            this.actionLabelEnum.ACTION_LABEL_EDIT_RESUBMIT);
          this.edit();
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_EDIT,
        status: this.enums.STATUS_PENDING,
        icon: this.iconEnum.ICON_EDIT_RESUBMIT,
        isApproveAction: false,
        isApplyCreditNote: false,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_EDIT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_BILL,
            this.actionLabelEnum.ACTION_LABEL_EDIT);
          this.edit();
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_EDIT,
        status: this.enums.STATUS_APPROVED,
        icon: this.iconEnum.ICON_EDIT_RESUBMIT,
        isApproveAction: false,
        isApplyCreditNote: false,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_EDIT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_BILL,
            this.actionLabelEnum.ACTION_LABEL_EDIT);
          this.edit();
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_EDIT,
        status: this.enums.STATUS_DRAFT,
        icon: this.iconEnum.ICON_EDIT_RESUBMIT,
        authCode: true,
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_BILL,
            this.actionLabelEnum.ACTION_LABEL_EDIT);
          this.edit();
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_DRAFT,
        icon: this.iconEnum.ICON_DELETE,
        authCode: true,
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_DELETE,
            AppAnalyticsConstants.MODULE_NAME_BILL,
            this.actionLabelEnum.ACTION_LABEL_DELETE);
          const id = this.activeAction.id;
          this.deleteBill(id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_DETAIL_VIEW,
        isApproveAction: false,
        isApplyCreditNote: false,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_DETAIL_VIEW),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW,
            AppAnalyticsConstants.MODULE_NAME_BILL,
            this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW);
          this.id = this.activeAction.id;
          this.detailView = true;
          this.approveBillView = true;
          this.auditTrialPanel = false;
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_AUDIT_TRAIL,
        status: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_AUDIT_TRAIL,
        isApproveAction: false,
        isApplyCreditNote: false,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_VIEW_AUDIT_TRAIL),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_AUDIT_TRAIL,
            AppAnalyticsConstants.MODULE_NAME_BILL,
            this.actionLabelEnum.ACTION_LABEL_AUDIT_TRAIL);
          this.billsService.getAuditTrial(this.activeAction.id).subscribe((res: any) => {
            this.billNo = JSON.parse(JSON.stringify(this.activeAction))['bill.billNo'];
            this.auditTrial = res.body;
            this.auditTrialPanel = true;
          });
        }
      },
      {
        label: this.actionLabelEnum.ACTION_GENERATE_DETAILED_REPORT,
        status: this.enums.STATUS_APPROVED,
        icon: this.iconEnum.ICON_DETAIL_REPORT,
        isApproveAction: false,
        isApplyCreditNote: false,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_DOWNLOAD_BILL),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_GENERATE_DETAILED_REPORT,
            AppAnalyticsConstants.MODULE_NAME_BILL,
            this.actionLabelEnum.ACTION_GENERATE_DETAILED_REPORT);
          const id = this.activeAction.id;
          const name = this.activeAction['vendor.id'] + '_' + this.activeAction['bill.billNo'];
          this.generateDetailReport(id, name);
        },
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DOWNLOAD_BILL,
        status: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_DOWNLOAD_BILL_FONT_AWESOME,
        isApproveAction: false,
        isApplyCreditNote: false,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_DOWNLOAD_BILL),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_DOWNLOAD_BILL,
            AppAnalyticsConstants.MODULE_NAME_BILL,
            this.actionLabelEnum.ACTION_LABEL_DOWNLOAD_BILL);
          const id = this.activeAction.attachmentId;
          this.downloadBill(id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_EXPORT,
        status: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_EXPORT,
        isApproveAction: false,
        isApplyCreditNote: false,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_CSV_EXPORT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_EXPORT,
            AppAnalyticsConstants.MODULE_NAME_BILL,
            this.actionLabelEnum.ACTION_LABEL_EXPORT);
          const id = this.activeAction.id;
          this.export(id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_DELETE,
        isApproveAction: false,
        isApplyCreditNote: false,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_DELETE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_DELETE,
            AppAnalyticsConstants.MODULE_NAME_BILL,
            this.actionLabelEnum.ACTION_LABEL_DELETE);
          const id = this.activeAction.id;
          this.deleteBill(id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_APPLIED_PAYMENTS,
        status: this.enums.STATUS_APPROVED,
        icon: this.iconEnum.ICON_APPLIED_PAYMENTS,
        isApproveAction: false,
        isApplyCreditNote: false,
        isEdit: false,
        isPay: true,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_APPLY_PAYMENT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_APPLIED_PAYMENTS,
            AppAnalyticsConstants.MODULE_NAME_BILL,
            this.actionLabelEnum.ACTION_LABEL_APPLIED_PAYMENTS);
          this.tableActiveBillId = this.activeAction.id;
          this.tableActiveVendor = this.activeAction.vendorId;
          this.checkWhetherCanProceedPayment(this.tableActiveBillId);
        }
      },
      {
        label: AppActionLabel.ACTION_APPLY_CREDIT_NOTE,
        icon: AppIcons.ICON_EXPORT,
        status: this.enums.STATUS_COMMON,
        isApplyCreditNote: true,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_APPLY_CREDIT_NOTE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_APPLY_CREDIT_NOTE,
            AppAnalyticsConstants.MODULE_NAME_BILL,
            AppActionLabel.ACTION_APPLY_CREDIT_NOTE);
          this.isApplyCreditNote = true;
        }
      },
      {
        label: AppActionLabel.PAYMENT_PROCESS,
        icon: AppIcons.ICON_PAYMENT_OFFLINE_PROCESS,
        status: this.enums.STATUS_APPROVED,
        paymentProcess: true,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_OFFLINE_PAYMENT_PROCESSING),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.PAYMENT_PROCESS,
            AppAnalyticsConstants.MODULE_NAME_BILL,
            AppActionLabel.PAYMENT_PROCESS);
          this.confirmationService.confirm({
            key: 'billPP',
            message: 'You want to mark offline payment processing to selected transaction(s)',
            accept: () => {
              const id = this.activeAction.id;
              this.paymentProcess(id);
            }
          });
        }
      },
      {
        label: AppActionLabel.PAYMENT_UNPROCESS,
        icon: AppIcons.ICON_PAYMENT_UNDO_OFFLINE_PROCESS,
        status: this.enums.STATUS_APPROVED,
        paymentUnProcess: true,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_OFFLINE_PAYMENT_PROCESSING),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.PAYMENT_UNPROCESS,
            AppAnalyticsConstants.MODULE_NAME_BILL,
            AppActionLabel.PAYMENT_UNPROCESS);
          this.confirmationService.confirm({
            key: 'billPU',
            message: 'You want to undo offline payment processing to selected transaction(s)',
            accept: () => {
              const id = this.activeAction.id;
              this.paymentUnProcess(id);
            }
          });
        }
      },
    ];
  }

  /**
   * Change action button array list according to status
   * @param billObject
   */
  actionButtonList(billObject) {
    return this.tableActionList.filter(this.isActionMatch(billObject['bill.status'], billObject.billType,
      AppEnumConstants.STATUS_COMMON, this.isValidApproveAccess(billObject), billObject.submittedByVendor, billObject['bill.paymentStatus']));
  }

  /**
   * inactive item
   */
  inactiveBill() {
    this.billsService.inactiveBill(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.BILL_INACTIVATED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.tableSupportBase.rows = [];
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * active item
   */
  activeBill() {
    this.billsService.activeBill(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.BILL_ACTIVATED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.tableSupportBase.rows = [];
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to inactive bulk list
   */
  inactiveBillList() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.billsService.inactiveBillList(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
            this.loadData(this.tableSupportBase.searchFilterDto);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.BILLS_INACTIVATED_SUCCESSFULLY);
            this.loadData(this.tableSupportBase.searchFilterDto);
            this.tableSupportBase.rows = [];
          }
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to active bulk list
   */
  activeBillList() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.billsService.activeBillList(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
            this.loadData(this.tableSupportBase.searchFilterDto);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.BILLS_ACTIVATED_SUCCESSFULLY);
            this.loadData(this.tableSupportBase.searchFilterDto);
            this.tableSupportBase.rows = [];
          }
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * This method use for filter table action match by element status
   * @param status string
   * @param billType
   * @param common
   * @param isAccessible
   * @param fromVendor
   * @param payStatus
   */
  isActionMatch(status, billType, common, isAccessible, fromVendor, payStatus) {
    return function f(element) {
      return ((element.status === status || (element.status === common && status !== AppEnumConstants.STATUS_DRAFT)) && element.authCode
        && (!element.isApproveAction || isAccessible)
        && (!element.inactivate || (status !== 'I' && element.inactivate))
        && (!element.activate || (status === 'I' && element.activate))
        && (!element.isEdit || ((billType === 'E' && status !== 'R') || billType === 'O') && !fromVendor)
        && (!element.isPay || payStatus !== 'Y')
        && (!element.isApplyCreditNote || (status === 'A' && payStatus !== 'Y'))
        && (!element.paymentProcess || element.paymentProcess && status === element.status && payStatus !== 'O')
        && (!element.paymentUnProcess || element.paymentUnProcess && payStatus === 'O')
      );
    };
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
    this.billsService.getBillTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.BILL_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_Bill_LIST;
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
   * A Single value hover from table
   * @param field to filed
   * @param obj to customer obj
   * @param event to click event
   */
  tdHover(field, obj: any, event) {
    if (field === 'po.id' && this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW)) {
      this.overlayId = obj.poId;
      this.documentType = AppDocumentType.BILL;
      showOverlay(this.poOverlay);
    }

    if (field === 'vendor.id' && this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW)) {
      this.overlayId = obj.vendorId;
      this.documentType = AppDocumentType.BILL;
      showOverlay(this.vendorOverlay);
    }

    if (field === 'bill.paidAmount' && this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_DETAIL_VIEW)) {
      this.overlayId = obj.id;
      this.documentType = AppDocumentType.BILL;
      showOverlay(this.paymentOverlay);
    }

    if (field === 'receipt.id' && this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_DETAIL_VIEW)) {
      this.overlayId = obj.poReceiptId;
      this.documentType = AppDocumentType.BILL;
      showOverlay(this.poReceiptOverlay);
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
      case 'po.id':
        return !!this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW);
      case 'vendor.id':
        return !!this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW);
      case 'bill.paidAmount':
        return !!this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_DETAIL_VIEW);
      case 'receipt.id':
        return !!this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_DETAIL_VIEW);
      case 'bill.billNo':
          return !!this.privilegeService.isAuthorized(AppAuthorities.BILL_DETAIL_VIEW);
    }
  }

  /**
   * A Single value clicked from table
   * @param field to filed
   * @param obj to customer obj
   */
  tdClick(field, obj: any, event) {
    if (obj['bill.status'] === AppEnumConstants.STATUS_DRAFT){
      this.activeAction = obj;
      this.edit();
      return;
    }
    if (field === 'vendor.id' && this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW)) {
      this.detailViewService.openVendorDetailView(obj.vendorId);
    } else if (field === 'bill.billNo' && this.privilegeService.isAuthorized(AppAuthorities.BILL_DETAIL_VIEW)) {
      this.activeAction = obj;
      this.detailView = true;
      this.approveBillView = true;
      this.id = obj.id;
    }
  }

  /**
   * Hide Overlays if Visible
   */
  hideOverlays() {
    if (this.poOverlay.overlayVisible) {
      this.poOverlay.hide();
    }
    if (this.vendorOverlay.overlayVisible) {
      this.vendorOverlay.hide();
    }
    if (this.paymentOverlay.overlayVisible) {
      this.paymentOverlay.hide();
    }
    if (this.poReceiptOverlay.overlayVisible) {
      this.poReceiptOverlay.hide();
    }
  }

  /**
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: VendorBillTableDto) {
    this.originalFileName = JSON.parse(JSON.stringify(val))['bill.billNo'];
    this.billType = JSON.parse(JSON.stringify(val)).billType;
    this.activeAction = val;
  }

  /**
   * Undo Approval
   */
  undoApproval(id) {
    this.confirmationService.confirm({
      key: 'poUA',
      message: 'You want to undo your last action',
      accept: () => {
        this.billsService.undoApprove(id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.getDataFromBackend();
            this.notificationService.successMessage(HttpResponseMessage.BILL_UNDO_APPROVAL_SUCCESSFULLY);
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
   * Skip Approval
   */
  skipApproval(id) {
    this.billsService.skipApproval(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.getDataFromBackend();
        this.notificationService.successMessage(HttpResponseMessage.BILLS_SKIPPED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Generate a Detail Report
   */
  generateDetailReport(id, name) {
    this.billsService.generateDetailReport(id).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        console.log('start download:', res);
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', name);
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
   * Download Bill
   */
  downloadBill(id) {
    if (id != null) {
      this.billsService.downloadBill(id).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          console.log('start download:', res);
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', this.originalFileName.replace('.', '_'));
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
   * export single data
   * @param id to id
   */
  export(id) {
    const tempArray = new Array();
    tempArray.push(id);
    this.billsService.exportBill(tempArray).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Bill');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.tableSupportBase.rows = [];
        this.notificationService.successMessage(HttpResponseMessage.SINGEL_BILL_EXPORTED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Delete
   */
  deleteBill(id) {
    const isDraft: boolean = (this.activeAction['bill.status'] === AppEnumConstants.STATUS_DRAFT);
    this.confirmationService.confirm({
      key: 'billDelete',
      message: isDraft ? 'You want to delete this Draft' : 'You want to delete this Bill',
      accept: () => {
        this.billsService.deleteBill(id, false).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            if (isDraft) {
              this.notificationService.successMessage(HttpResponseMessage.DRAFT_DISCARDED_SUCCESSFULLY);
            } else {
              this.notificationService.successMessage(HttpResponseMessage.BILL_DELETED_SUCCESSFULLY);
            }
            this.getDataFromBackend();
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  /*
  BULK ACTIONS ----------------------------------------------------------------------------------------------------------->
   */


  /**
   * Delete Bulk Data
   */
  bulkDelete() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.confirmationService.confirm({
        message: 'You want to delete the selected Bill(s)',
        key: 'billDelete',
        accept: () => {
          this.billsService.bulkDelete(ids, false).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.getDataFromBackend();
                this.tableSupportBase.rows = [];
              } else {
                this.notificationService.successMessage(HttpResponseMessage.BILLS_DELETED_SUCCESSFULLY);
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

  /**
   * Reject Bulk Data
   */
  bulkReject() {
    this.confirmationService.confirm({
      key: 'billReject',
      message: 'You want to reject the selected Bills(s)',
      accept: () => {
        if (this.tableSupportBase.rows.length > 0) {
          const ids: any[] = [];
          for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
            ids.push(this.tableSupportBase.rows[i].id);
          }
          this.billsService.bulkReject(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.getDataFromBackend();
                this.tableSupportBase.rows = [];
              } else {
                this.notificationService.successMessage(HttpResponseMessage.BILLS_REJECTED_SUCCESSFULLY);
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
      }
    });
  }


  /**
   * Download Bulk Selections
   */
  bulkDownloadSelected() {
    if (this.commonUtil.isSelectOnlyDraft(this.tableSupportBase.rows, 'bill.status')) {
      this.notificationService.infoMessage(HttpResponseMessage.DRAFTED_BILL_CANNOT_BE_DOWNLOADED);
      this.isDownloading = false;
      return;
    }
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.billsService.bulkDownloadSelected(ids).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'Bill_list');
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

  bulkDownloadAll() {
    if (this.tableSupportBase.rows.length !== 0) {
      this.bulkDownloadSelected();
      return;
    }
    this.billsService.bulkDownloadAll(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Bill_list');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notificationService.successMessage(HttpResponseMessage.ALL_BILLS_DOWNLODED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
      this.isDownloading = false;
    }, error => {
      this.isDownloading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * export single data
   * @param id to id
   */
  paymentProcess(id) {
    this.billsService.paymentProcess(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.BILL_PAYMENT_PROCESS_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  paymentUnProcess(id) {
    this.billsService.paymentUnProcess(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.BILL_PAYMENT_PROCESS_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Download select selected detail report
   */
  downloadSelectedDetailReport() {
    this.isDetailReportDownloading = true;
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.billsService.downloadSelectedDetailReport(ids).subscribe((res: any) => {
        const blob = new Blob([res.data], {
          type: 'application/zip'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('download', 'Bills');
        window.open(url);
        this.isDetailReportDownloading = false;
      }, error => {
        this.isDetailReportDownloading = false;
        this.notificationService.errorMessage(error);
      }, () => {
        this.isDetailReportDownloading = false;
        this.notificationService.successMessage(HttpResponseMessage.BILLS_DETAILED_REPORT_DOWNLOAD_SUCCESSFULLY);
      });
    }
  }

  /**
   * Approve Bulk Data
   */
  bulkQuickApprove() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.billsService.bulkApprove(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
            this.getDataFromBackend();
            this.tableSupportBase.rows = [];
          } else {
            this.notificationService.successMessage(HttpResponseMessage.BILLS_APPROVED_SUCCESSFULLY);
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
  }

  /**
   * Export Bulk Data
   */
  bulkExportSelected() {
    if (this.commonUtil.isSelectOnlyDraft(this.tableSupportBase.rows, 'bill.status')) {
      this.notificationService.infoMessage(HttpResponseMessage.DRAFTED_BILL_CANNOT_BE_EXPORTED);
      this.isExporting = false;
      return;
    }
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.billsService.bulkExportSelected(ids).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'bill');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.loadData(this.tableSupportBase.searchFilterDto);
          this.tableSupportBase.rows = [];
          this.notificationService.successMessage(HttpResponseMessage.BILLS_EXPORTED_SUCCESSFULLY);
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
    this.billsService.bulkExportAll(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'bill');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.tableSupportBase.rows = [];
        this.notificationService.successMessage(HttpResponseMessage.ALL_BILLS_EXPORTED_SUCCESSFULLY);
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
   * Approve Payment Process
   */
  bulkPaymentProcess() {
    this.confirmationService.confirm({
      key: 'billPP',
      message: 'You want to mark offline payment processing to selected transaction(s)',
      accept: () => {
        if (this.tableSupportBase.rows.length > 0) {
          const ids: any[] = [];
          for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
            ids.push(this.tableSupportBase.rows[i].id);
          }
          this.billsService.bulkPaymentProcess(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.getDataFromBackend();
                this.tableSupportBase.rows = [];
              } else {
                this.notificationService.successMessage(HttpResponseMessage.BILLS_PAYMENT_PROCESS_SUCCESSFULLY);
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
      }
    });
  }


  /**
   * Approve Payment Unprocessed
   */
  bulkPaymentUnProcess() {
    this.confirmationService.confirm({
      key: 'billPU',
      message: 'You want to undo offline payment processing to selected transaction(s)',
      accept: () => {
        if (this.tableSupportBase.rows.length > 0) {
          const ids: any[] = [];
          for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
            ids.push(this.tableSupportBase.rows[i].id);
          }
          this.billsService.bulkPaymentUnProcess(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.getDataFromBackend();
                this.tableSupportBase.rows = [];
              } else {
                this.notificationService.successMessage(HttpResponseMessage.BILLS_PAYMENT_PROCESS_SUCCESSFULLY);
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
      }
    });
  }

  /**
   * this method can be used to get label according to status
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
      case AppEnumConstants.EXPORT_STATUS_EXPORT: {
        return AppEnumConstants.EXPORT_LABEL_EXPORT;
      }
      case AppEnumConstants.EXPORT_STATUS_NOT_EXPORT: {
        return AppEnumConstants.EXPORT_LABEL_NOT_EXPORT;
      }
      case AppEnumConstants.PAYMENT_STATUS_PROCESSING: {
        return AppEnumConstants.PAYMENT_LABEL_PROCESSING;
      }
    }
  }

  /**
   * Is User Authorized to approve
   */
  isValidApproveAccess(billObj) {

    const user = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));

    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_OVERRIDE_APPROVAL)) {
      return true;
    }

    return this.isApprovalGroupExist(user.approvalGroups, billObj) || this.isApprovalGroupUserExist(user.username, billObj);

  }

  /**
   * Approval Group equals to logged user
   */
  isApprovalGroupExist(approvalGroup, billObj) {
    if (!billObj.approvalGroup) {
      return false;
    }

    return approvalGroup.includes(billObj.approvalGroup);
  }

  /**
   * User equals to logged user
   */
  isApprovalGroupUserExist(approvalUser, billObj) {
    if (!billObj.approvalUser) {
      return false;
    }

    return approvalUser === billObj.approvalUser;
  }

  /**
   * this method can be used to  when close modal refresh the component
   */

  refreshComponent() {
    // save current route first
    const currentRoute = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate([currentRoute]); // navigate to same route
    });
  }


  public edit() {
    this.id = this.activeAction.id;
    this.billsService.canEdit(this.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        if (this.activeAction.billType === 'E' || this.activeAction.billType === 'R' || this.activeAction.billType === 'C') {
          this.eBillEdit = true;
          this.detailView = false;
        } else {
          this.reSubmit = true;
          this.eBillEdit = false;
        }
        this.detailView = false;
        this.approveBillView = false;
        this.auditTrialPanel = false;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  public canChangeAssignee() {
    this.id = this.activeAction.id;
    this.billsService.canChangeAssignee(this.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.id = this.activeAction.id;
        this.viewChangeAssignee = true;
        this.detailView = false;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to validate download detail report button
   */
  isAllowedToDownloadDetailReport() {
    return this.tableSupportBase.rows.filter(x => x['bill.status'] === AppConstant.STATUS_APPROVED).length > AppConstant.ZERO ?
      this.isAllowedToDownload = true : this.isAllowedToDownload = false;
  }

  /**
   * this method can be used to check whether allowed view apply credit note view
   */
  checkAllowedToViewApplyCreditNote() {
    const creditNoteAllowedToApplyList: any [] = [];
    this.filteredBills = [];
    if (this.tableSupportBase.rows.length > AppConstant.ZERO) {
      for (let i = AppConstant.ZERO; i < this.tableSupportBase.rows.length; i++) {
        if (this.tableSupportBase.rows[i]['bill.status'] === 'A' &&
          this.tableSupportBase.rows[i]['bill.paymentStatus'] !== 'Y' &&
          parseInt(this.tableSupportBase.rows[i]['bill.balanceAmount']) > AppConstant.ZERO) {
          creditNoteAllowedToApplyList.push(this.tableSupportBase.rows[i]);
        }
      }
      this.filteredBills = creditNoteAllowedToApplyList;
      const ignoredCount = (this.tableSupportBase.rows.length - creditNoteAllowedToApplyList.length);
      const msg = 'This action only supports Approved and Not-paid bills.' +
        ' Therefore ' + ignoredCount + ' bill(s) will be ignored.';

      if (creditNoteAllowedToApplyList.length === AppConstant.ZERO) {
        this.notificationService.infoMessage(msg);
        return;
      }
      if (ignoredCount > AppConstant.ZERO) {
        this.warningForIgnoredBill = msg;
        this.isApplyCreditNoteAsBulk = true;
        return;
      }
      if (creditNoteAllowedToApplyList.length > AppConstant.ZERO && ignoredCount === AppConstant.ZERO) {
        this.warningForIgnoredBill = null;
        this.isApplyCreditNoteAsBulk = true;
      }
    }
  }

  multipleProjectsView(obj) {
    this.detailViewService.openBillDetailView(obj.id);
  }

  /**
   * Check payment can be proceeded
   * @param billId to bill id
   */
  checkWhetherCanProceedPayment(billId) {
    if (!billId) {
      return;
    }
    this.billsService.canPay(billId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.isBillPayment = true;
      } else {
        this.isBillPayment = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.isBillPayment = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * close approve view
   */
  closeApproveView() {
    this.loadData(this.tableSupportBase.searchFilterDto);
    this.approveBillView = false;
  }
}
