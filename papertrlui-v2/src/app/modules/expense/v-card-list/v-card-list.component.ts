import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Menu} from 'primeng/menu';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {AccountTableDto} from '../../../shared/dto/account/account-table-dto';
import {Subscription} from 'rxjs';
import {AppConstant} from '../../../shared/utility/app-constant';
import {Table} from 'primeng/table';
import {PaymentService} from '../../../shared/services/payments/payment.service';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {
  BulkNotificationDialogService
} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {ConfirmDialog} from "primeng/confirmdialog";
import {DetailViewService} from "../../../shared/helpers/detail-view.service";
import {AppDocumentType} from "../../../shared/enums/app-document-type";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";

@Component({
  selector: 'app-v-card-list',
  templateUrl: './v-card-list.component.html',
  styleUrls: ['./v-card-list.component.scss']
})
export class VCardListComponent implements OnInit, OnDestroy {
  @ViewChild('vcardListComponent') vcardListComponent: VCardListComponent;
  @ViewChild('menu') menu: Menu;

  public tableSupportBase = new TableSupportBase();
  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any;

  public enums = AppEnumConstants;
  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
  public tableKeyEnum = AppTableKeysData;

  public activeAction: any; // Selected Action Button
  public detailView = false;
  public editVcard = false;
  public subscription = new Subscription();

  public showFilter = false;
  public showFilterColumns = false;
  public auditTrail: any;
  public auditTrailPanel = false;
  public availableHeaderActions = [];
  public cardRelatedData: any[] = [];
  public appConstant: AppConstant = new AppConstant();
  public formGroup: FormGroup;
  public cancelLoading = false;

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

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  constructor(private paymentService: PaymentService, public messageService: MessageService, public gridService: GridService,
              public confirmationService: ConfirmationService, public notificationService: NotificationService,
              public formGuardService: FormGuardService, public privilegeService: PrivilegeService,
              public gaService: GoogleAnalyticsService,
              public bulkNotificationDialogService: BulkNotificationDialogService, private formBuilder: FormBuilder,
              private detailViewService: DetailViewService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.VCARD_TABLE_KEY);
    this.subscription.unsubscribe();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.VCARD_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_VCARD_LIST;
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

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    // this.loadBulkButtonData();
    this.actionButtonInit();
    // this.subscription = this.paymentService.updateTableData.subscribe(() => {
    //   if (this.tableSupportBase.searchFilterDto?.filters) {
    //     this.loadData(this.tableSupportBase.searchFilterDto);
    //   }
    // });

    this.formGroup = this.formBuilder.group({
      cancelReason: [null, Validators.required]
    });
  }

  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableSupportBase.tableActionList = [
      {
        label: this.actionLabelEnum.ACTION_LABEL_CANCEL,
        status: this.enums.STATUS_ACTIVE,
        icon: this.iconEnum.ICON_CANCEL,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.V_CARD_CANCEL),
        cancelAction: true,
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_CANCEL,
            AppAnalyticsConstants.MODULE_NAME_VIRTUAL_DIGITAL_CARD,
            this.actionLabelEnum.ACTION_LABEL_CANCEL,
          );
          this.cardRelatedData = [];
          if (this.activeAction?.cardType === AppEnumConstants.CARD_TYPE_DIGITAL) {
            this.cancelVCard();
            return;
          }
          this.paymentService.getCardRelatedTransactions(this.activeAction.id).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body) {
                this.cardRelatedData = res.body;
              }
              this.cancelVCard();
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_ACTIVITY_LOG,
        status: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_AUDIT_TRAIL,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.V_CARD_ACTIVITY_LOG),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_ACTIVITY_LOG,
            AppAnalyticsConstants.MODULE_NAME_VIRTUAL_DIGITAL_CARD,
            this.actionLabelEnum.ACTION_LABEL_ACTIVITY_LOG,
          );
          this.auditTrailPanel = true;

          this.paymentService.getVCardAuditTrial(this.activeAction.id).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.auditTrail = res.body;
              this.auditTrailPanel = true;
            } else {
              this.notificationService.infoMessage(res.body.message);
            }
          });
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_EDIT,
        status: this.enums.STATUS_ACTIVE,
        icon: this.iconEnum.ICON_EDIT,
        editAction: true,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.V_CARD_EDIT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_VIRTUAL_DIGITAL_CARD,
            this.actionLabelEnum.ACTION_LABEL_EDIT,
          );
          this.editVcard = true;
          this.detailView = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_INACTIVATE,
        status: this.enums.STATUS_ACTIVE,
        icon: AppIcons.ICON_INACTIVATE,
        inactiveAction: true,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.V_CARD_INACTIVE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_INACTIVATE,
            AppAnalyticsConstants.MODULE_NAME_VIRTUAL_DIGITAL_CARD,
            AppActionLabel.ACTION_LABEL_INACTIVATE,
          );
          const id = this.activeAction.id;
          this.inactive(id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_ACTIVATE,
        status: this.enums.STATUS_INACTIVE,
        icon: AppIcons.ICON_ACTIVATE,
        activeAction: true,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.V_CARD_ACTIVE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_ACTIVATE,
            AppAnalyticsConstants.MODULE_NAME_VIRTUAL_DIGITAL_CARD,
            AppActionLabel.ACTION_LABEL_ACTIVATE,
          );
          const id = this.activeAction.id;
          this.active(id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW,
        icon: this.iconEnum.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.V_CARD_DETAIL_VIEW),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW,
            AppAnalyticsConstants.MODULE_NAME_VIRTUAL_DIGITAL_CARD,
            this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW,
          );
          this.editVcard = false;
          this.detailView = true;
        }
      }
    ];
  }

  /**
   * Change action button array list according to status
   */
  actionButtonList(obj) {
    return this.tableSupportBase.tableActionList.filter(this.isActionMatch(obj['vcard.status'],
      AppEnumConstants.STATUS_COMMON, obj.cardType));
  }

  /**
   * This method use for filter table action match by element status
   * @param status Card status
   * @param common a common status
   * @param cardType Caad type
   */
  isActionMatch(status, common, cardType) {
    return function f(element) {
      return element.authCode &&
        ((!element.activeAction || (element.activeAction && AppEnumConstants.CARD_TYPE_DIGITAL === cardType) && status === element.status) &&
        (!element.editAction || (element.editAction && status === element.status)) &&
        (!element.cancelAction || (element.cancelAction && status === element.status)) &&
        (!element.inactiveAction || (element.inactiveAction && AppEnumConstants.CARD_TYPE_DIGITAL === cardType) && status === element.status)
        || element.status === common);
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
    sessionStorage.removeItem(AppTableKeysData.VCARD_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_VCARD_LIST).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.VCARD_TABLE_KEY, this.columnSelect);
    });
  }


  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.paymentService.getVCardTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
  actionButtonClick(val: AccountTableDto) {
    this.activeAction = val;
  }

  /**
   * cancel card
   */
  cancelVCard() {
    this.confirmationService.confirm({
      message: `You want to cancel the selected card (${this.activeAction['vcard.nickName']})`,
    });
  }

  submitCancelVCard(cd: ConfirmDialog) {
    if (!this.formGroup.valid) {
      new CommonUtility().validateForm(this.formGroup);
      return;
    }
    this.cancelLoading = true;
    this.paymentService.cancelVCard(this.activeAction.id, this.formGroup.get('cancelReason').value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        if (res?.body?.message) {
          this.notificationService.infoMessage(res.body.message);
          return;
        }
        this.notificationService.successMessage(HttpResponseMessage.CARD_CANCELED_SUCCESSFULLY);
        this.tableSupportBase.rows = [];
        this.formGroup.reset();
        cd.hide();
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.cancelLoading = false;
    }, error => {
      this.cancelLoading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for active
   * @param id number
   */
  active(id: number) {
    this.paymentService.activeCard(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        if (res?.body?.message) {
          this.notificationService.infoMessage(res.body.message);
          return;
        }
        this.notificationService.successMessage(HttpResponseMessage.CARD_ACTIVATED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for inactive
   * @param id number
   */
  inactive(id: number) {
    this.paymentService.inactiveCard(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        if (res?.body?.message) {
          this.notificationService.infoMessage(res.body.message);
          return;
        }
        this.notificationService.successMessage(HttpResponseMessage.CARD_INACTIVATED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Is the field is has data to show in overlay
   * @param field
   */
  isClassHover(field) {
    switch (field) {
      case 'vcard.cardNumber':
        return !!this.privilegeService.isAuthorized(AppAuthorities.V_CARD_DETAIL_VIEW);
    }
  }

  /**
   * A Single value clicked from table
   * @param field to filed
   * @param obj to customer obj
   */
  tdClick(field, obj: any, event) {
    if (field === 'vcard.cardNumber' && this.privilegeService.isAuthorized(AppAuthorities.V_CARD_DETAIL_VIEW)) {
      this.detailViewService.openCardsDetailView(obj.id);
    }
  }
}
