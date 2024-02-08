import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {Table} from 'primeng/table';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {UserApprovalGroupService} from '../../../shared/services/approvalGroup/user-approval-group.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {UntypedFormBuilder} from '@angular/forms';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ApprovalGroupMasterDto} from '../../../shared/dto/approval group/approval-group-master-dto';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppConstant} from '../../../shared/utility/app-constant';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {BulkNotificationDialogService} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {ApprovalGroupCreateComponent} from "../../common/approval-group-create/approval-group-create.component";
import {FormGuardService} from "../../../shared/guards/form-guard.service";
import {Subscription} from "rxjs";
import {AppTableHeaderActions} from "../../../shared/enums/app-table-header-actions";
import {BillsService} from '../../../shared/services/bills/bills.service';
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-approval-group-list',
  templateUrl: './approval-group-list.component.html',
  styleUrls: ['./approval-group-list.component.scss']
})
export class ApprovalGroupListComponent implements OnInit, OnDestroy {

  public tableSupportBase = new TableSupportBase();

  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any;

  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public tableKeyEnum = AppTableKeysData;
  public subscription = new Subscription();

  public activeAction: ApprovalGroupMasterDto;

  public editApprovalGroup = false;
  public approvalGroupId;

  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();



  @ViewChild('approvalGroupCreateComponent') public approvalGroupCreateComponent: ApprovalGroupCreateComponent;

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

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  constructor(public formBuilder: UntypedFormBuilder, public approvalGroupService: UserApprovalGroupService, public gridService: GridService,
              public confirmationService: ConfirmationService, public messageService: MessageService,
              public formGuardService: FormGuardService, public billsService: BillsService,
              public privilegeService: PrivilegeService, public notificationService: NotificationService,
              public bulkNotificationDialogService: BulkNotificationDialogService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.APPROVAL_GROUP_TABLE_KEY);
    this.subscription.unsubscribe();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    if (this.privilegeService.isAuthorized(AppAuthorities.APPROVAL_GROUPS_INACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.INACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.APPROVAL_GROUPS_ACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.ACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.APPROVAL_GROUPS_DELETE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.loadBulkButtonData();
    this.actionButtonInit();
    this.subscription = this.approvalGroupService.updateTableData.subscribe(() => {
      if (this.tableSupportBase.searchFilterDto?.filters) {
        this.loadData(this.tableSupportBase.searchFilterDto);
      }
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
        authCode: this.privilegeService.isAuthorized(AppAuthorities.APPROVAL_GROUPS_EDIT),
        command: () => {
          this.editApprovalGroup = true;
          this.approvalGroupId = this.activeAction.id;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_DELETE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.APPROVAL_GROUPS_DELETE),
        command: () => {
          this.deleteApprovalGroup();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_INACTIVATE,
        status: this.enums.STATUS_ACTIVE,
        icon: AppIcons.ICON_INACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.APPROVAL_GROUPS_INACTIVATE),
        command: () => {
          this.inActiveApprovalGroup(this.activeAction.id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_ACTIVATE,
        status: this.enums.STATUS_INACTIVE,
        icon: AppIcons.ICON_ACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.APPROVAL_GROUPS_ACTIVATE),
        command: () => {
          this.activeApprovalGroup(this.activeAction.id);
        }
      },
    ];
  }

  /**
   * this method send changes to backend
   */

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.APPROVAL_GROUP_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_APPROVAL_GROUP;
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
   * Loads Table grid
   */
    loadTableData() {
    this.selectedColumns = [];
    this.onTableResize();
    sessionStorage.removeItem(AppTableKeysData.APPROVAL_GROUP_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_APPROVAL_GROUP).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.APPROVAL_GROUP_TABLE_KEY, this.columnSelect);
    });
  }

  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.approvalGroupService.getApprovalGroupTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
   * This method use for get bulk button list data
   */
  loadBulkButtonData() {
    this.approvalGroupService.getApprovalGroupListBulkActionData().subscribe((res: any) => {
      if (res.status === AppResponseStatus.STATUS_SUCCESS) {
        const arr = [];
        for (const property of res.body) {
          const val: ButtonPropertiesDto = property;
          arr.push(
            {
              label: val.label, action: val.action, authCode: val.authCode, disabled: !val.active, icon: val.icon, command: (event) => {
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
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: ApprovalGroupMasterDto) {
    this.activeAction = val;
  }

  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_ACTIVATE:
        this.activeApprovalGroupList();
        break;
      case  AppBulkButton.BUTTON_INACTIVATE:
        this.inactiveApprovalGroupList();
        break;
      case AppBulkButton.BUTTON_DELETE:
        this.deleteApprovalGroupList();
        break;
    }
  }

  /**
   * This method use for deleteExpense approval group
   */
  deleteApprovalGroup() {
    this.confirmationService.confirm({
      message: 'You want to delete this Approval Group',
      key: 'ag',
      accept: () => {
        this.approvalGroupService.deleteApprovalGroup(this.activeAction.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.APPROVAL_GROUP_DELETED_SUCCESSFULLY);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
          this.loadData(this.tableSupportBase.searchFilterDto);
          this.tableSupportBase.rows = [];
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  /**
   * active approval group
   * @param id to row id
   */
  activeApprovalGroup(id) {
    this.approvalGroupService.activeSingalApprovalGroup(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.APPROVAL_GROUP_ACTIVATED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.loadData(this.tableSupportBase.searchFilterDto);
      this.tableSupportBase.rows = [];
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * active approval group
   * @param id to row id
   */
  inActiveApprovalGroup(id) {
    this.approvalGroupService.inactiveSingalApprovalGroup(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.APPORVAL_GROUP_INACTIVATED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.loadData(this.tableSupportBase.searchFilterDto);
      this.tableSupportBase.rows = [];
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to deleteExpense approval groups bulk
   */
  deleteApprovalGroupList() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        if (this.tableSupportBase.rows[i].id !== 1 && this.tableSupportBase.rows[i].id !== 3) {
          ids.push(this.tableSupportBase.rows[i].id);
        }
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.confirmationService.confirm({
        message: 'You want to delete the selected Approval Group(s)',
        key: 'ag',
        accept: () => {
          this.approvalGroupService.deleteApprovalGroupList(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
              } else {
                this.notificationService.successMessage(HttpResponseMessage.APPROVAL_GROUPS_DELETED_SUCCESSFULLY);
              }
              this.loadData(this.tableSupportBase.searchFilterDto);
              this.tableSupportBase.rows = [];
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        }
      });
    }
  }

  /**
   * this method can be used to inactive approval groups bulk
   */
  inactiveApprovalGroupList() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        if (this.tableSupportBase.rows[i].id !== 1 && this.tableSupportBase.rows[i].id !== 3) {
          ids.push(this.tableSupportBase.rows[i].id);
        }

      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.approvalGroupService.inactiveApprovalGroupList(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.APPROVAL_GROUPS_INACTIVATED_SUCCESSFULLY);
          }
          this.loadData(this.tableSupportBase.searchFilterDto);
          this.tableSupportBase.rows = [];
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to active approval groups bulk
   */
  activeApprovalGroupList() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.approvalGroupService.activeApprovalGroupList(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.APPROVAL_GROUPS_ACTIVATED_SUCCESSFULLY);
          }
          this.loadData(this.tableSupportBase.searchFilterDto);
          this.tableSupportBase.rows = [];
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * update table data
   */
  updateApprovalGroupTable() {
    this.approvalGroupService.updateTableData.next(true);
  }
}
