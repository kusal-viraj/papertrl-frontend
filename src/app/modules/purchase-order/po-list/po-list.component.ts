import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {Table} from 'primeng/table';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {ConfirmationService, LazyLoadEvent, MenuItem, MessageService} from 'primeng/api';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {PoService} from '../../../shared/services/po/po.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AuditTrialDto} from '../../../shared/dto/common/audit-trial/audit-trial-dto';
import {PoTableDto} from '../../../shared/dto/po/po-table-dto';
import {PoMasterDto} from '../../../shared/dto/po/po-master-dto';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppAutomationEvent} from '../../../shared/enums/app-automation-event';
import {AppHttpResponseMessage} from '../../../shared/enums/app-http-response-message';
import {AppConstant} from '../../../shared/utility/app-constant';
import {UserMasterDto} from '../../../shared/dto/user/user-master-dto';
import {RoleService} from '../../../shared/services/roles/role.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {BulkNotificationDialogService} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {UserService} from '../../../shared/services/user/user.service';
import {PoReceiptService} from '../../../shared/services/po-receipts/po-receipt.service';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {PatternValidator} from '../../../shared/helpers/pattern-validator';
import {AppPatternValidations} from '../../../shared/enums/app-pattern-validations';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {OverlayPanel} from 'primeng/overlaypanel';
import {DetailViewService} from '../../../shared/helpers/detail-view.service';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {ContextMenu} from "primeng/contextmenu";
import {Menu} from "primeng/menu";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";

@Component({
  selector: 'app-po-list',
  templateUrl: './po-list.component.html',
  styleUrls: ['./po-list.component.scss']
})
export class PoListComponent implements OnInit, OnDestroy {

  public sessionUser: UserMasterDto = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));


  public poId: number;
  public vendorId: number;
  public approvePoView = false;
  public createPo = false;
  public viewChangeAssignee = false;
  public viewPoReceiptCreate = false;

  public tableSupportBase = new TableSupportBase();
  public sendPOAttachmentForm: UntypedFormGroup;

  public bulkButtonList: ButtonPropertiesDto[] = [];
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public poIds: any [] = [];
  public vendorIds: any [] = [];
  public bulkButtonListResponsive: any;
  public AppAnalyticsConstants = AppAnalyticsConstants;

  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public tableKeyEnum = AppTableKeysData;
  public activeAction;
  public auditTrialPanel: boolean;
  public auditTrial: AuditTrialDto[];
  public SendPoToVendorDto: any = new Object({});

  public isDetailView = false;
  public isEditView = false;
  public detailView = false;
  public tableActionList: any [] = [];
  public poNumber: string;
  public creator: string;
  public venId: any;

  public expression = new RegExp(AppPatternValidations.EMAIL_PATTERN);
  public commonUtil = new CommonUtility();
  public creditNote: any = {};

  public exportActionsOne: any [] = [];
  public exportActions: any [] = [];
  public downloadActions: any [] = [];
  public downloadActionsOne: any [] = [];
  public billAssign = false;
  public createCard = false;
  public isOpenSendPOAttachmentView = false;
  public email: any;
  public isBulkPOAttachmentSend = false;
  public vendorIdSet = new Set();
  public vendorIdMap = new Map();
  public vendorID: any;
  public overlayId: any;
  public poStatus: string;
  public id: any;
  public poDetailObj: any;


  public appConstant: AppConstant = new AppConstant();

  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];

  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);

  }

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  @Output() updatePReceiptSearchTable = new EventEmitter();
  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: Table;
  @ViewChild('projectOverlay') projectOverlay: OverlayPanel;
  @ViewChild('vendorOverlay') vendorOverlay: OverlayPanel;
  @ViewChild('menu') menu: Menu;
  isValidTaxAmount = false;
  isDownloading = false;
  isExporting = false;
  emailToSend: any;
  btnLoading = false;
  isViewAttachedCreditNote = false;
  isCreateCreditNote = false;
  isView: any;
  fromPoNoClick = false;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  constructor(public poService: PoService, public messageService: MessageService, public confirmationService: ConfirmationService,
              public bulkNotificationDialogService: BulkNotificationDialogService, public roleService: RoleService,
              public poReceiptService: PoReceiptService, public notificationService: NotificationService,
              public gaService: GoogleAnalyticsService,
              public gridService: GridService, public privilegeService: PrivilegeService, public billsService: BillsService,
              public userService: UserService, public formBuilder: UntypedFormBuilder, public detailViewService: DetailViewService) {
  }

  isPoTable() {
    return this.privilegeService.isAuthorizedMultiple([
      AppAuthorities.PURCHASE_ORDER_EDIT, AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW, AppAuthorities.PURCHASE_ORDER_DELETE,
      AppAuthorities.PURCHASE_ORDER_APPROVE, AppAuthorities.PURCHASE_ORDER_REJECT, AppAuthorities.PURCHASE_ORDER_VIEW_AUDIT_TRAIL,
      AppAuthorities.PURCHASE_ORDER_CSV_EXPORT, AppAuthorities.PURCHASE_ORDER_DOWNLOAD_REPORT, AppAuthorities.PURCHASE_ORDER_QUICK_APPROVE,
      AppAuthorities.PURCHASE_ORDER_CHANGE_ASSIGNEE, AppAuthorities.PURCHASE_ORDER_UNDO_ACTION, AppAuthorities.PO_RE_OPEN,
      AppAuthorities.PURCHASE_ORDER_OVERRIDE_APPROVAL, AppAuthorities.PURCHASE_ORDER_BILL_CREATE, AppAuthorities.PURCHASE_ORDER_SKIP_APPROVAL,
      AppAuthorities.PO_GENERATE_PO_RECEIPT]);
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
        this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_PO_LIST;
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
    if (this.privilegeService.isAuthorizedMultiple([AppAuthorities.PURCHASE_ORDER_REJECT,
      AppAuthorities.PURCHASE_ORDER_OVERRIDE_APPROVAL])) {
      this.availableHeaderActions.push(AppTableHeaderActions.REJECT);
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
    if (this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_SEND_ATTACHMENT)) {
      this.availableHeaderActions.push(AppTableHeaderActions.EMAIL_TO_VENDOR);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_SEND_VENDOR_APPROVAL)) {
      this.availableHeaderActions.push(AppTableHeaderActions.SEND_TO_VENDOR_APPROVAL);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_CSV_EXPORT)) {
      this.availableHeaderActions.push(AppTableHeaderActions.EXPORT);
    }

    if (this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DOWNLOAD_REPORT)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DOWNLOAD);
    }

    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);


    this.loadTableData();
    this.actionButtonInit();
    this.sendPOAttachmentForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.compose([
        PatternValidator.patternValidator(this.expression, {emailValidate: true})])]],
    });
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
        isAllowedToOpenClose: false,
        isViewCreditNote: false,
        isCreateCreditNote: false,
        icon: AppIcons.ICON_APPROVE,
        authCode: this.privilegeService.isAuthorizedMultiple([AppAuthorities.PURCHASE_ORDER_APPROVE, AppAuthorities.PURCHASE_ORDER_REJECT,
          AppAuthorities.PURCHASE_ORDER_OVERRIDE_APPROVAL]),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_APPROVE_REJECT,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_LABEL_APPROVE_REJECT);
          this.poId = this.activeAction.id;
          this.approvePoView = true;
          this.detailView = false;
          this.isEditView = false;
          this.createPo = false;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_VIEW_REPORT,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_VIEW_REPORT,
        vendorStatus: false,
        isApproveAction: false,
        isAllowedToOpenClose: false,
        isViewCreditNote: false,
        isCreateCreditNote: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DOWNLOAD_REPORT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_VIEW_REPORT,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_LABEL_VIEW_REPORT);
          const attachmentId = this.activeAction.attachmentId;
          this.viewReport(attachmentId, this.getPoNumber(this.activeAction));
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_CLOSE,
        status: this.enums.STATUS_OPEN,
        icon: AppIcons.ICON_CLOSE,
        isApproveAction: false,
        isAllowedToOpenClose: true,
        vendorStatus: false,
        isViewCreditNote: false,
        isCreateCreditNote: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PO_CLOSE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_CLOSE,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_LABEL_CLOSE);
          const id = this.activeAction.id;
          this.closePo(id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_RE_OPEN,
        status: this.enums.STATUS_CLOSE,
        icon: AppIcons.ICON_OPEN,
        isApproveAction: false,
        isAllowedToOpenClose: true,
        vendorStatus: false,
        isViewCreditNote: false,
        isCreateCreditNote: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PO_RE_OPEN),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_RE_OPEN,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_LABEL_RE_OPEN);
          const id = this.activeAction.id;
          this.reopenPo(id);
        }
      },
      {
        label: AppActionLabel.SEND_PO_ATTACHMENT,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.SEND_ICON,
        vendorStatus: false,
        isApproveAction: false,
        isAllowedToOpenClose: false,
        isViewCreditNote: false,
        isCreateCreditNote: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_SEND_ATTACHMENT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.SEND_PO_ATTACHMENT,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.SEND_PO_ATTACHMENT);
          const poId = this.activeAction.id;
          this.isOpenSendPOAttachmentView = true;
          this.isBulkPOAttachmentSend = false;
          this.poIds = [];
          this.poIds.push(poId);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
        icon: AppIcons.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        vendorStatus: false,
        isApproveAction: false,
        isAllowedToOpenClose: false,
        isViewCreditNote: false,
        isCreateCreditNote: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_LABEL_DETAIL_VIEW);
          this.poId = this.activeAction.id;
          this.detailView = true;
          this.isEditView = false;
          this.createPo = false;
          this.fromPoNoClick = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_EDIT_RESUBMIT,
        icon: AppIcons.ICON_EDIT,
        status: this.enums.ST_REJECTED,
        vendorStatus: false,
        isApproveAction: false,
        isAllowedToOpenClose: false,
        isCreateCreditNote: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_EDIT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_EDIT_RESUBMIT,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_LABEL_EDIT_RESUBMIT);
          this.edit();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_EDIT,
        icon: AppIcons.ICON_EDIT,
        status: this.enums.STATUS_OPEN,
        vendorStatus: false,
        isApproveAction: false,
        isAllowedToOpenClose: false,
        isViewCreditNote: false,
        isCreateCreditNote: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_EDIT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_LABEL_EDIT,);
          this.edit();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_EDIT,
        icon: AppIcons.ICON_EDIT,
        status: this.enums.ST_PENDING,
        vendorStatus: false,
        isApproveAction: false,
        isAllowedToOpenClose: false,
        isViewCreditNote: false,
        isCreateCreditNote: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_EDIT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_LABEL_EDIT);
          this.edit();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_SKIP_APPROVAL,
        status: this.enums.ST_PENDING,
        vendorStatus: false,
        isApproveAction: false,
        icon: AppIcons.ICON_SKIP_APPROVAL,
        isAllowedToOpenClose: false,
        isViewCreditNote: false,
        isCreateCreditNote: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_SKIP_APPROVAL),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_SKIP_APPROVAL,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_LABEL_SKIP_APPROVAL);
          const id = this.activeAction.id;
          console.log(this.activeAction.id);
          this.skipApproval(id);
        }
      },
      {
        label: AppActionLabel.ACTION_CREATE_BILL,
        icon: AppIcons.ICON_ADD_TO_LOCAL,
        status: this.enums.STATUS_OPEN,
        vendorStatus: false,
        isApproveAction: false,
        isAllowedToOpenClose: false,
        isViewCreditNote: false,
        isCreateCreditNote: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_BILL_CREATE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_CREATE_BILL,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_CREATE_BILL);
          this.poId = this.activeAction.id;
          this.billAssign = true;
        }
      },
      {
        label: AppActionLabel.ACTION_CREATE_DIGITAL_CARD,
        icon: AppIcons.ICON_ADD_TO_LOCAL,
        status: this.enums.STATUS_OPEN,
        vendorStatus: false,
        isApproveAction: false,
        isAllowedToOpenClose: false,
        isViewCreditNote: false,
        isCreateCreditNote: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_CREATE_DIGITAL_CARD),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_CREATE_DIGITAL_CARD,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_CREATE_DIGITAL_CARD);
          this.poId = this.activeAction.id;
          this.createCard = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_CHANGE_ASSIGNEE,
        status: this.enums.ST_PENDING,
        icon: AppIcons.ICON_CHANGE_ASSIGNEE,
        vendorStatus: false,
        isApproveAction: false,
        isAllowedToOpenClose: false,
        isViewCreditNote: false,
        isCreateCreditNote: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_CHANGE_ASSIGNEE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_CHANGE_ASSIGNEE,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_LABEL_CHANGE_ASSIGNEE);
          this.poId = this.activeAction.id;
          this.viewChangeAssignee = true;
        }
      },

      {
        label: AppActionLabel.ACTION_LABEL_EDIT,
        icon: AppIcons.ICON_EDIT,
        status: this.enums.STATUS_DRAFT,
        isApproveAction: false,
        vendorStatus: false,
        isAllowedToOpenClose: false,
        isViewCreditNote: false,
        isCreateCreditNote: false,
        authCode: true,
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_LABEL_EDIT);
          this.edit();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        icon: AppIcons.ICON_DELETE,
        status: this.enums.STATUS_DRAFT,
        isApproveAction: false,
        vendorStatus: false,
        isAllowedToOpenClose: false,
        isViewCreditNote: false,
        isCreateCreditNote: false,
        authCode: true,
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DELETE,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_LABEL_DELETE);
          this.deleteDraft(this.activeAction.id);
        }
      },

      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        vendorStatus: false,
        icon: AppIcons.ICON_DELETE,
        isApproveAction: false,
        isAllowedToOpenClose: false,
        isViewCreditNote: false,
        isCreateCreditNote: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DELETE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DELETE,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_LABEL_DELETE);
          const id = this.activeAction.id;
          this.delete(id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_AUDIT_TRAIL,
        status: this.enums.STATUS_COMMON,
        vendorStatus: false,
        icon: AppIcons.ICON_AUDIT_TRAIL,
        isApproveAction: false,
        isAllowedToOpenClose: false,
        isViewCreditNote: false,
        isCreateCreditNote: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_VIEW_AUDIT_TRAIL),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_AUDIT_TRAIL,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_LABEL_AUDIT_TRAIL);
          this.viewAuditTrail();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_GENERATE_RECEIPT,
        status: this.enums.STATUS_OPEN,
        vendorStatus: false,
        icon: AppIcons.PURCHASE_ORDER_RECEIPT_ICON,
        isApproveAction: false,
        isAllowedToOpenClose: false,
        isViewCreditNote: false,
        isCreateCreditNote: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PO_GENERATE_PO_RECEIPT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_GENERATE_RECEIPT,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_LABEL_GENERATE_RECEIPT);
          this.createPoReceipt();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_EXPORT,
        status: this.enums.STATUS_COMMON,
        vendorStatus: false,
        icon: AppIcons.ICON_EXPORT,
        isApproveAction: false,
        isAllowedToOpenClose: false,
        isCreateCreditNote: false,
        isViewCreditNote: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_CSV_EXPORT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_EXPORT,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_LABEL_EXPORT);
          const id = this.activeAction.id;
          this.export(id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_SEND_TO_VENDOR_APPROVAL,
        status: this.enums.STATUS_OPEN,
        icon: AppIcons.ICON_SEND_APPROVAL,
        vendorStatus: true,
        isApproveAction: false,
        isAllowedToOpenClose: false,
        isCreateCreditNote: false,
        isViewCreditNote: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_SEND_VENDOR_APPROVAL),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_SEND_TO_VENDOR_APPROVAL,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_LABEL_SEND_TO_VENDOR_APPROVAL);
          const id = this.activeAction.id;
          this.sendToVendorApproval(id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_UNDO_APPROVAL,
        icon: AppIcons.ICON_UNDO_STATUS,
        status: this.enums.STATUS_COMMON,
        isApproveAction: false,
        isAllowedToOpenClose: false,
        isCreateCreditNote: false,
        isViewCreditNote: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_UNDO_ACTION),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_UNDO_APPROVAL,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_LABEL_UNDO_APPROVAL);
          this.undoPo();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_VIEW_CREDIT_NOTE,
        icon: AppIcons.ICON_VIEW_ATTACHED_BILL,
        status: this.enums.STATUS_COMMON,
        isApproveAction: false,
        isAllowedToOpenClose: false,
        isViewCreditNote: true,
        isCreateCreditNote: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VIEW_ATTACHED_CREDIT_NOTES),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_VIEW_CREDIT_NOTE,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_LABEL_VIEW_CREDIT_NOTE);
          this.creditNote.netAmount = this.activeAction['po.netAmount'];
          this.creditNote.vendorName = this.activeAction['po.vendorId'];
          this.creditNote.poNumber = this.activeAction['po.poNumber'];
          this.getCreditNoteDetailsByPoId(this.activeAction.id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_CREATE_CREDIT_NOTE,
        icon: AppIcons.ICON_ADD_TO_LOCAL,
        status: this.enums.STATUS_OPEN,
        isApproveAction: false,
        isViewCreditNote: false,
        isCreateCreditNote: true,
        isAllowedToOpenClose: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PO_CREATE_CREDIT_NOTE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_CREATE_CREDIT_NOTE,
            AppAnalyticsConstants.MODULE_NAME_PURCHASE_ORDER,
            AppActionLabel.ACTION_LABEL_CREATE_CREDIT_NOTE);
          this.isCreateCreditNote = true;
        }
      },
    ];
  }

  /**
   * Change action button array list according to status
   * @param status to po status
   * @param poObj to line object
   * @param vendorStatus to vendor approval status
   * @param poStatus to open closed status
   * @param remainingCeiling to selected po remaining ceiling
   * @param remainingPriceVariance to selected po price variance
   */
  actionButtonList(status, poObj, vendorStatus, poStatus, remainingCeiling, remainingPriceVariance) {
    return this.tableActionList.filter(this.isActionMatch(status, AppEnumConstants.STATUS_COMMON,
      this.isValidApproveAccess(poObj), vendorStatus, poObj, poStatus, remainingCeiling, remainingPriceVariance));
  }

  /**
   * This method use for filter table action match by element status
   * @param status string to po status
   * @param common to common status
   * @param isAccessible to element boolean
   * @param vendorStatus to vendor status
   * @param poObj to selected line item object
   * @param poStatus to open closed status
   * @param remainingCeiling to selected po remaining ceiling
   * @param remainingPriceVariance to selected po price variance
   */
  isActionMatch(status, common, isAccessible, vendorStatus, poObj, poStatus, remainingCeiling, remainingPriceVariance) {
    return function f(element) {
      return (element.status === status || (element.status === common && poObj['po.status'] !== AppEnumConstants.STATUS_DRAFT)) &&
        (!element.isAllowedToOpenClose || (remainingCeiling > AppConstant.ZERO || remainingPriceVariance > AppConstant.ZERO)) &&
        element.authCode && (!element.isApproveAction || isAccessible) &&
        (!element.vendorStatus || vendorStatus === AppEnumConstants.STATUS_NOT_ASSIGNED) &&
        ((!element.isCreateCreditNote || (((poObj.creditAmount) !== parseFloat(poObj['po.netAmount'].replace(/,/g, '')))))) &&
        (!element.isViewCreditNote || (poObj.creditAmount ? parseInt(poObj.creditAmount) > AppConstant.ZERO : false));
    };
  }

  /**
   * Close PO Receipt
   */
  closePo(id: any) {
    this.poService.closePo(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.tableSupportBase.rows = [];
        this.notificationService.successMessage(HttpResponseMessage.PO_CLOSED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.updatePReceiptSearchTable.emit();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Open PO Receipt
   */
  reopenPo(id: any) {
    this.poService.reopenPo(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.tableSupportBase.rows = [];
        this.notificationService.successMessage(HttpResponseMessage.PO_OPEN_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.updatePReceiptSearchTable.emit();
      } else {
        this.notificationService.infoMessage(res.body.message);
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
    sessionStorage.removeItem(AppTableKeysData.PO_TABLE_KEY);

    this.gridService.getTableStructure(this.appConstant.GRID_PO_LIST).subscribe((res: any) => {
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
    this.poService.getPOTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
    this.poStatus = JSON.parse(JSON.stringify(val))['po.status'];
  }


  /**
   * patch email address to modal form
   */
  patchEmailAddressToModalSelect() {
    this.vendorIdSet.clear();
    for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
      this.vendorIdSet.add(this.tableSupportBase.rows[i].vendorId);
      this.vendorID = this.tableSupportBase.rows[i].vendorId;
      this.vendorIdMap.set(this.tableSupportBase.rows[i].vendorId, this.tableSupportBase.rows[i].vendorEmail);
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
        this.notificationService.successMessage(AppHttpResponseMessage.PO_SEND_TO_VENDOR_SUCCESSFULLY);
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
   * export all pos
   */
  bulkExportAll() {
    if (this.tableSupportBase.rows.length !== 0) {
      this.bulkExportSelected();
      return;
    }
    this.poService.bulkExportAll(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.tableSupportBase.rows = [];
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Purchase Orders.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notificationService.successMessage(HttpResponseMessage.ALL_PO_EXPORTED_SUCCESSFULLY);
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
   * export po list
   */
  bulkExportSelected() {
    if (this.commonUtil.isSelectOnlyDraft(this.tableSupportBase.rows, 'po.status')) {
      this.notificationService.infoMessage(HttpResponseMessage.DRAFTED_PO_CANNOT_BE_EXPORTED);
      this.isExporting = false;
      return;
    }
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.poService.bulkExportSelected(ids).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.loadData(this.tableSupportBase.searchFilterDto);
          this.tableSupportBase.rows = [];
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'Purchase Orders.csv');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.notificationService.successMessage(HttpResponseMessage.SELECTED_PO_EXPORTED_SUCCESSFULLY);
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
   * export po(s)
   * @param id to selected po id
   */
  export(id) {
    const tempArray = [];
    tempArray.push(id);
    this.poService.bulkExportSelected(tempArray).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.tableSupportBase.rows = [];
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Purchase Order.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notificationService.successMessage(HttpResponseMessage.SINGLE_PO_EXPORTED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * download po attachment list
   */
  bulkDownloadAll() {
    if (this.tableSupportBase.rows.length !== 0) {
      this.bulkDownloadSelected();
      return;
    }
    this.poService.bulkDownloadAll(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'PO_list');
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

  /**
   * download selected po attachment
   */
  bulkDownloadSelected() {
    if (this.commonUtil.isSelectOnlyDraft(this.tableSupportBase.rows, 'po.status')) {
      this.notificationService.infoMessage(HttpResponseMessage.DRAFTED_PO_CANNOT_BE_DOWNLOAD);
      this.isDownloading = false;
      return;
    }
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
          link.setAttribute('download', 'PO_list');
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
   * reject po list
   */
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

  /**
   * quick approve po list
   */
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

  /**
   * delete po list
   */
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

  /**
   * delete single po
   * @param id to po id
   */
  delete(id) {
    this.confirmationService.confirm({
      key: 'poL',
      message: 'You want to delete this Purchase Order',
      accept: () => {
        this.poService.deletePurchaseOrder(id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.loadData(this.tableSupportBase.searchFilterDto);
            this.tableSupportBase.rows = [];
            this.notificationService.successMessage(AppHttpResponseMessage.PO_ORDER_DELETED_SUCCESSFULLY);
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
   * view single report
   * @param id to selected id
   * @param poNumber to selected po number
   */
  viewReport(id, poNumber) {
    if (id != null) {
      this.poService.viewReport(id).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          console.log('start download:', res);
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'Purchase Order (' + poNumber + ')');
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
   * This method can be use for get po number form selected row
   * @param obj selected obj
   */
  getPoNumber(obj): string {
    try {
      return JSON.parse(JSON.stringify(obj))['po.poNumber'];
    } catch (e) {
      return '';
    }
  }

  /**
   * Create a Po Receipt from PO
   */
  public createPoReceipt() {
    this.poId = this.activeAction.id;
    this.vendorId = this.activeAction.vendorId;
    if (this.activeAction.receiptStatus === 'A') {
      this.viewPoReceiptCreate = true;
    } else {
      this.notificationService.infoMessage(HttpResponseMessage.NO_ITEMS_REMAINING_TO_GENERATE_PO_RECEIPT);
    }
  }

  /**
   * Send multiple po to vendor approval
   */
  public bulkSendVendor() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.poService.bulkSendToVendor(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.POS_SEND_TO_VENDOR_SUCCESSFULLY);
          }
          this.loadData(this.tableSupportBase.searchFilterDto);
          this.tableSupportBase.rows = [];
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to get checked po id list
   * @param event to table selection array
   */
  getSelection(event) {
    this.poIds = [];
    const tableDataList: any [] = event;
    tableDataList.forEach(po => {
      this.poIds.push(po.id);
    });
  }

  /**
   * this method can be used to reset po send attachment form
   */
  resetPOAttachmentForm() {
    this.sendPOAttachmentForm.reset();
    if (!this.isBulkPOAttachmentSend) {
      const vendorEmailAddress = this.activeAction.vendorEmail;
      this.sendPOAttachmentForm.get('email').patchValue(vendorEmailAddress);
      this.email = this.sendPOAttachmentForm.get('email').value;
    } else {
      if (this.vendorIdSet.size === AppConstant.ONE) {
        this.sendPOAttachmentForm.get('email').patchValue(this.vendorIdMap.get(this.vendorID));
        this.email = this.sendPOAttachmentForm.get('email').value;
      }
    }
  }

  /**
   * this method can be used to key up email address
   * @param value to value
   */
  keyUpValue(value) {
    this.email = value;
  }

  /**
   * this method can be used for send attachment to email
   */
  sendPOAttachment() {
    if (this.isBulkPOAttachmentSend) {
      this.sendPOAttachmentBulk();
    } else {
      this.singleAttachmentSend();
    }
  }

  /**
   * this method send single po attachment
   */
  singleAttachmentSend() {
    if (this.sendPOAttachmentForm.valid) {
      this.btnLoading = true;
      this.SendPoToVendorDto.emailToSend = this.email;
      this.SendPoToVendorDto.poIds = this.poIds;
      this.poService.bulkSendPoAttachment(this.SendPoToVendorDto).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.PO_ATTACHMENT_SEND_SUCCESSFULLY);
          this.isOpenSendPOAttachmentView = false;
          this.poIds = [];
          this.tableSupportBase.rows = [];
          this.btnLoading = false;
        } else {
          this.btnLoading = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.btnLoading = false;
        this.notificationService.errorMessage(error);
      });

    } else {
      this.btnLoading = false;
      new CommonUtility().validateForm(this.sendPOAttachmentForm);
    }
  }

  /**
   * this method can be used for send attachment to email
   */
  sendPOAttachmentBulk() {
    this.SendPoToVendorDto.emailToSend = this.email;
    this.SendPoToVendorDto.poIds = this.poIds;
    this.btnLoading = true;
    this.poService.bulkSendPoAttachment(this.SendPoToVendorDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
        } else {
          this.notificationService.successMessage(HttpResponseMessage.PO_ATTACHMENTS_SEND_SUCCESSFULLY);
        }
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.tableSupportBase.rows = [];
        this.isOpenSendPOAttachmentView = false;
        this.poIds = [];
        this.tableSupportBase.rows = [];
        this.btnLoading = false;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.btnLoading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Undo Expense
   * @private
   */
  public undoPo() {
    this.confirmationService.confirm({
      key: 'poUA',
      message: 'You want to undo your last action',
      accept: () => {
        this.poService.undoPo(this.activeAction.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.PO_UNDO_APPROVAL_SUCCESSFULLY);
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

  /**
   * Is Expense can be Editable
   * @private
   */
  public edit() {
    this.poService.canEdit(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.poId = this.activeAction.id;
        this.detailView = false;
        this.isEditView = true;
        this.createPo = true;
      } else {
        this.notificationService.infoMessage(res.body.message);
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
   * @param obj
   */
  isClassHover(field,obj:any) {
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
    if (obj['po.status'] === AppEnumConstants.STATUS_DRAFT){
      this.activeAction = obj;
      this.edit();
      return ;
    }
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

  /**
   * this method can be used for ger po related credit note details
   * @param poId to po id
   */
  getCreditNoteDetailsByPoId(poId) {
    if (!poId) {
      return;
    } else {
      this.poService.getPORelatedCreditNoteDetails(poId).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.isViewAttachedCreditNote = true;
          this.creditNote.creditNoteDetails = res.body;

        } else {
          this.isViewAttachedCreditNote = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.isViewAttachedCreditNote = false;
        this.notificationService.errorMessage(error);
      });
    }

  }

  /**
   * this method can be used to discard draft record
   * @param id to draft id
   */
  deleteDraft(id) {
    this.confirmationService.confirm({
      key: 'poDraftDeleteKey',
      message: 'You want to delete this Draft',
      accept: () => {
        if (!id) {
          return;
        } else {
          this.poService.deletePurchaseOrder(id).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.notificationService.successMessage(HttpResponseMessage.DRAFT_DISCARDED_SUCCESSFULLY);
              this.loadData(this.tableSupportBase.searchFilterDto);
            } else {
              this.notificationService.infoMessage(res.body.message);
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        }
      }
    });
  }


}
