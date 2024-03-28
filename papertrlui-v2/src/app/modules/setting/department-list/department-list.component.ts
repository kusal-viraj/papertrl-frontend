import {Component, HostListener, Input, EventEmitter, OnInit, Output, ViewChild, OnDestroy} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {Table} from 'primeng/table';
import {UntypedFormBuilder} from '@angular/forms';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {BulkNotificationDialogService} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {DepartmentService} from '../../../shared/services/department/department.service';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {Menu} from "primeng/menu";
import {DepartmentDetailViewComponent} from "../department-detail-view/department-detail-view.component";

@Component({
  selector: 'app-department-list',
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss']
})
export class DepartmentListComponent implements OnInit, OnDestroy {

  public tableSupportBase = new TableSupportBase();

  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any;

  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public tableKeyEnum = AppTableKeysData;

  public activeAction: any;

  public editDepartment = false;
  public departmentId;

  public appConstant: AppConstant = new AppConstant();
  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public departmentPanel: boolean;
  public isDetailView = false;
  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);
  }

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  @Output() departmentAdded = new EventEmitter();

  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: Table;
  @ViewChild('menu') menu: Menu;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  constructor(public formBuilder: UntypedFormBuilder, public gridService: GridService, private departmentService: DepartmentService,
              public confirmationService: ConfirmationService, public messageService: MessageService,
              public privilegeService: PrivilegeService, public notificationService: NotificationService,
              public bulkNotificationDialogService: BulkNotificationDialogService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.DEPARTMENT_TABLE_KEY);
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    if (this.privilegeService.isAuthorized(AppAuthorities.DEPARTMENT_INACTIVE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.INACTIVE);
    }

    if (this.privilegeService.isAuthorized(AppAuthorities.DEPARTMENT_ACTIVE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.ACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.DEPARTMENT_DELETE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
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
    this.tableSupportBase.tableActionList = [
      {
        label: AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
        icon: AppIcons.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.DEPARTMENT_EDIT),
        command: () => {
          this.isDetailView = true;
          this.departmentId = this.activeAction.id;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_EDIT,
        icon: AppIcons.ICON_EDIT,
        status: this.enums.STATUS_ACTIVE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.DEPARTMENT_EDIT),
        command: () => {
          this.editDepartment = true;
          this.departmentId = this.activeAction.id;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_DELETE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.DEPARTMENT_DELETE),
        command: () => {
          this.deleteDepartment();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_INACTIVATE,
        status: this.enums.STATUS_ACTIVE,
        icon: AppIcons.ICON_INACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.DEPARTMENT_INACTIVE),
        command: () => {
          this.inactiveDepartment(this.activeAction.id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_ACTIVATE,
        status: this.enums.STATUS_INACTIVE,
        icon: AppIcons.ICON_ACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.DEPARTMENT_ACTIVE),
        command: () => {
          this.activeDepartment(this.activeAction.id);
        }
      },
    ];
  }

  /**
   * this method send changes to backend
   */

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.DEPARTMENT_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_DEPARTMENT;
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
    sessionStorage.removeItem(AppTableKeysData.DEPARTMENT_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_DEPARTMENT).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.DEPARTMENT_TABLE_KEY, this.columnSelect);
    });
  }

  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.departmentService.getDepartmentTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
  actionButtonClick(val: any) {
    this.activeAction = val;
  }

  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_ACTIVATE:
        this.activeBulkDepartments();
        break;
      case  AppBulkButton.BUTTON_INACTIVATE:
        this.inactiveBulkDepartments();
        break;
      case AppBulkButton.BUTTON_DELETE:
        this.deleteBulkDepartments();
        break;
    }
  }

  /**
   * This method use for delete single department
   */
  deleteDepartment() {
    this.confirmationService.confirm({
      message: 'You want to delete this Department',
      key: 'dep',
      accept: () => {
        this.departmentService.deleteDepartment(this.activeAction.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.DEPARTMENT_DELETED_SUCCESSFULLY);
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
   * active department
   * @param id to row id
   */
  activeDepartment(id) {
    this.departmentService.activeDepartment(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.DEPARTMENT_ACTIVATED_SUCCESSFULLY);
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
   * inactive department
   * @param id to row id
   */
  inactiveDepartment(id) {
    this.departmentService.inactiveDepartment(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.DEPARTMENT_INACTIVATED_SUCCESSFULLY);
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
   * this method can be used to delete bulk departments
   */
  deleteBulkDepartments() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.confirmationService.confirm({
        message: 'You want to delete the selected Departments(s)',
        key: 'dep',
        accept: () => {
          this.departmentService.deleteBulkDepartments(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
              } else {
                this.notificationService.successMessage(HttpResponseMessage.DEPARTMENTS_DELETED_SUCCESSFULLY);
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
   * this method can be used to inactive bulk departments
   */
  inactiveBulkDepartments() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.departmentService.inactiveBulkDepartments(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.DEPARTMENTS_INACTIVATED_SUCCESSFULLY);
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
   * this method can be used to active bulk departments
   */
  activeBulkDepartments() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.departmentService.activeBulkDepartments(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.DEPARTMENTS_ACTIVATED_SUCCESSFULLY);
          }
          this.loadData(this.tableSupportBase.searchFilterDto);
          this.tableSupportBase.rows = [];
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

}
