import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {RoleTableDto} from '../../../shared/dto/role/role-table-dto';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {Table} from 'primeng/table';
import {RoleService} from '../../../shared/services/roles/role.service';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {BulkNotificationDialogService} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {PortalRoleCreateComponent} from '../../common/portal-role-create/portal-role-create.component';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {Subscription} from "rxjs";
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-portal-role-list',
  templateUrl: './portal-role-list.component.html',
  styleUrls: ['./portal-role-list.component.scss']
})
export class PortalRoleListComponent implements OnInit, OnDestroy {

  public tableSupportBase = new TableSupportBase();

  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any;

  public enums = AppEnumConstants;
  public activeAction: RoleTableDto;
  public tableKeyEnum = AppTableKeysData;


  public roleId: any;
  public roleName: any;
  public editRole: boolean;
  public cloneRole: boolean;
  public viewRole: boolean;
  public appConstant: AppConstant = new AppConstant();
  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];

  public subscription = new Subscription();

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
  @ViewChild('menu') menu: Menu;
  @ViewChild('dt') table: Table;
  @ViewChild('portalRoleCreateComponent') portalRoleCreateComponent: PortalRoleCreateComponent;


  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  constructor(private roleService: RoleService, public messageService: MessageService, public privilegeService: PrivilegeService,
              public gridService: GridService, public notificationService: NotificationService,
              public confirmationService: ConfirmationService, public bulkNotificationDialogService: BulkNotificationDialogService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.ROLE_TABLE_KEY);
    this.subscription.unsubscribe();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.ROLE_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_ROLE_LIST;
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

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);

    if (this.privilegeService.isAuthorized(AppAuthorities.ROLES_DELETE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }

    if (this.privilegeService.isAuthorized(AppAuthorities.ROLES_INACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.INACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.ROLES_ACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.ACTIVE);
    }
    this.loadTableData();
    this.actionButtonInit();

    this.subscription = this.roleService.updatePortalTableData.subscribe(() => {
      if (this.tableSupportBase.searchFilterDto?.filters) {
        this.loadData(this.tableSupportBase.searchFilterDto);
      }
    });

    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);
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
        clone: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.ROLES_EDIT),
        command: () => {
          this.roleId = this.activeAction.id;
          this.roleName = this.activeAction.name;
          this.editRole = true;
          this.viewRole = false;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_DELETE,
        clone: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.ROLES_DELETE),
        command: () => {
          const id = this.activeAction.id;
          this.deleteRole(id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_INACTIVATE,
        status: this.enums.STATUS_ACTIVE,
        icon: AppIcons.ICON_INACTIVATE,
        clone: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.ROLES_INACTIVATE),
        command: () => {
          const id = this.activeAction.id;
          this.inactivateRole(id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_ACTIVATE,
        status: this.enums.STATUS_INACTIVE,
        icon: AppIcons.ICON_ACTIVATE,
        clone: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.ROLES_ACTIVATE),
        command: () => {
          const id = this.activeAction.id;
          this.activateRole(id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
        icon: AppIcons.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        clone: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.ROLES_DETAIL_VIEW),
        command: () => {
          this.roleId = this.activeAction.id;
          this.roleName = this.activeAction.name;
          this.editRole = false;
          this.viewRole = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_CLONE_ROLE,
        icon: AppIcons.ICON_CLONE,
        clone: true,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.ROLES_CLONE),
        command: () => {
          this.roleId = this.activeAction.id;
          this.editRole = false;
          this.cloneRole = true;
        }
      },
    ];
  }

  /**
   * Change action button array list according to status
   * @param status statua
   */
  actionButtonList(status, canClone) {
    return this.tableSupportBase.tableActionList.filter(this.isActionMatch(status, AppEnumConstants.STATUS_COMMON, canClone));
  }

  /**
   * This method use for filter table action match by element status
   * @param status string
   */
  isActionMatch(status, common, canClone) {
    return function f(element) {
      return (((element.status === status || element.status === common)) && element.authCode && (!element.clone || (element.clone && canClone)));
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
    sessionStorage.removeItem(AppTableKeysData.ROLE_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_ROLE_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.ROLE_TABLE_KEY, this.columnSelect);
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
    this.roleService.getRoleTableData(this.tableSupportBase.searchFilterDto).then(async (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.dataSource = await res.body.data;
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


  /**
   * A Single value clicked from table
   * @param field to filed
   * @param obj to customer obj
   */
  tdClick(field, obj: RoleTableDto) {
    if (field === 'rolem.name') {
      this.roleName = obj.name;
      this.roleId = obj.id;
      this.editRole = false;
      this.viewRole = false;
      setTimeout(() => {
        this.roleId = obj.id;
        this.editRole = false;
        this.viewRole = true;
      }, 500);
    }
  }


  /**
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val) {
    this.activeAction = val;
    this.editRole = false;
    this.viewRole = false;
  }

  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_ACTIVATE:
        this.activateRoleList();
        break;
      case  AppBulkButton.BUTTON_INACTIVATE:
        this.inActivateRoleList();
        break;
      case AppBulkButton.BUTTON_DELETE:
        this.deleteRoleList();
        break;
    }
  }

  /**
   * change status to full form
   * @param status status
   */
  getStatus(status: any) {
    switch (status) {
      case AppEnumConstants.STATUS_PENDING: {
        return AppEnumConstants.LABEL_PENDING;
      }
      case AppEnumConstants.STATUS_ACTIVE: {
        return AppEnumConstants.LABEL_ACTIVE;
      }
      case AppEnumConstants.STATUS_INACTIVE: {
        return AppEnumConstants.LABEL_INACTIVE;
      }
    }
  }

  tableRefresh() {
    this.tableSupportBase.rows = [];
    this.roleService.getRoleTableData(this.tableSupportBase.searchFilterDto).then(async (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.dataSource = await res.body.data;
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

  /**
   * active role method
   */
  activateRole(id) {
    this.roleService.activatePortalRole(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.ROLE_ACTIVATED_SUCCESSFULLY);
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
      this.tableRefresh();
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * inactive role method
   */
  inactivateRole(id) {
    this.roleService.inactivatePortalRole(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.ROLE_INACTIVATED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.tableRefresh();
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * deleteExpense role method
   */
  deleteRole(id) {
    this.confirmationService.confirm({
      message: 'You want to delete this Role!',
      accept: () => {
        this.roleService.deletePortalRole(id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.ROLE_DELETED_SUCCESSFULLY);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
          this.tableRefresh();
          this.tableSupportBase.rows = [];
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }


  /**
   * this method can be used to activate bulk
   */
  activateRoleList() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.roleService.activatePortalRoleList(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.ROLES_ACTIVATED_SUCCESSFULLY);
          }
          this.tableRefresh();
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to inactivate bulk
   */
  inActivateRoleList() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.roleService.inActivatePortalRoleList(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.ROLES_INACTIVATED_SUCCESSFULLY);
          }
          this.tableRefresh();
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to deleteExpense bulk
   */
  deleteRoleList() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }

      this.confirmationService.confirm({
        message: 'You want to delete the selected Role(s)!',
        accept: () => {
          this.roleService.deletePortalRoleList(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
              } else {
                this.notificationService.successMessage(HttpResponseMessage.ROLES_DELETED_SUCCESSFULLY);
              }
              this.tableRefresh();
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

  roleEdited() {
    this.editRole = false;
    this.viewRole = false;
    this.cloneRole = false;
    this.tableRefresh();
  }
}

