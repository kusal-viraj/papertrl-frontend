import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {Table} from 'primeng/table';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {AdditionalFieldTableDto} from '../../../shared/dto/additional-field/additional-field-table-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AdditionalFieldUtility} from '../additional-field-utility';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {Subscription} from 'rxjs';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-additional-field-list',
  templateUrl: './additional-field-list.component.html',
  styleUrls: ['./additional-field-list.component.scss']
})
export class AdditionalFieldListComponent implements OnInit, OnDestroy {
  public tableSupportBase = new TableSupportBase();
  public bulkButtonList: ButtonPropertiesDto[] = [];
  public enums = AppEnumConstants;
  public tableKeyEnum = AppTableKeysData;
  public activeAction: AdditionalFieldTableDto;
  public tableUpdateSubscription = new Subscription();

  public openEditMode = false;
  public additionalFieldId: number;
  public isEditView: boolean;

  public additionalFieldUtility: AdditionalFieldUtility = new AdditionalFieldUtility(this.automationService, this.additionalFieldService);
  public buttonResponsive: any[];

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

  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: Table;
  @ViewChild('menu') menu: Menu;
  attachToDoc: any;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  constructor(public automationService: AutomationService, private additionalFieldService: AdditionalFieldService,
              public gridService: GridService, public messageService: MessageService, public privilegeService: PrivilegeService,
              public confirmationService: ConfirmationService, public notificationService: NotificationService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.ADDITIONAL_FIELD_TABLE_KEY);
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.ADDITIONAL_FIELD_TABLE_KEY);
    promise.then(result => {
        this.tableSupportBase.tableDataOptions = result;
        this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_ADDITIONAL_FIELD_LIST;
              this.gridService.updateTableState(this.tableSupportBase.tableDataOptions).subscribe((res: any) => {
        if (event === true){
          this.loadTableData();
        }
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          } else {
            this.messageService.add({key: 'bc', severity: 'error', summary: 'Error', detail: res.body.message});
          }
        }, error => {
          this.messageService.add({key: 'bc', severity: 'error', summary: 'Error', detail: error});
        });
      }
    );
  }

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    this.availableHeaderActions.push(AppTableHeaderActions.INACTIVE);
    this.availableHeaderActions.push(AppTableHeaderActions.ACTIVE);
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.tableUpdateSubscription = this.additionalFieldService.updateTableData.subscribe(() => {
      if (this.tableSupportBase.searchFilterDto?.filters) {
        this.loadData(this.tableSupportBase.searchFilterDto);
      }
    });
    this.actionButtonInit();
    this.additionalFieldUtility.getAllSectionList();
  }

  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableSupportBase.tableActionList = [
      {
        label: AppActionLabel.ACTION_LABEL_ATTACH_TO_DOCUMENT,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_ATTACH_TO_DOCUMENT,
        authCode: true,
        command: () => {
          this.additionalFieldId = this.activeAction.id;
          this.attachToDoc = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_EDIT,
        icon: AppIcons.ICON_EDIT,
        status: this.enums.STATUS_ACTIVE,
        authCode: true,
        command: () => {
          this.additionalFieldId = this.activeAction.id;
          this.openEditMode = true;
          this.isEditView = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_ACTIVATE,
        status: AppEnumConstants.STATUS_INACTIVE,
        icon: AppIcons.ICON_ACTIVATE,
        authCode: true,
        command: () => {
          this.activateInactivate(this.activeAction.id, true);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_INACTIVATE,
        status: AppEnumConstants.STATUS_ACTIVE,
        icon: AppIcons.ICON_INACTIVATE,
        authCode: true,
        command: () => {
          this.activateInactivate(this.activeAction.id, false);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_DELETE,
        authCode: true,
        command: () => {
          this.deleteAdditionalField();
        }
      }
    ];
  }

  /**
   * deleteExpense user method
   */
  deleteAdditionalField() {
    this.confirmationService.confirm({
      message: 'You want to delete this Additional Field',
      key: 'additionalFieldKey',
      accept: () => {
        this.additionalFieldService.removeAdditionalField(this.activeAction.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.ADDITIONAL_FIELD_DELETED_SUCCESSFULLY);
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
   * Loads Table Data (Settings)
   */
    loadTableData() {
    this.selectedColumns = [];
    // Check for Responsiveness
    this.onTableResize();
    // Removes table Storage on load if present
    sessionStorage.removeItem(AppTableKeysData.ADDITIONAL_FIELD_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_ADDITIONAL_FIELD_LIST).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.ADDITIONAL_FIELD_TABLE_KEY, this.columnSelect);
    });
  }


  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.additionalFieldService.getAdditionalFieldTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
  actionButtonClick(val: AdditionalFieldTableDto) {
    this.activeAction = val;
    this.additionalFieldId = val.id;
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
      case AppEnumConstants.STATUS_VOID: {
        return AppEnumConstants.LABEL_VOID;
      }
      case AppEnumConstants.STATUS_REJECT: {
        return AppEnumConstants.LABEL_REJECT;
      }
      case AppEnumConstants.STATUS_REQUIRED: {
        return AppEnumConstants.LABEL_REQUIRED;
      }
      case AppEnumConstants.STATUS_OPTIONAL: {
        return AppEnumConstants.LABEL_OPTIONAL;
      }
      case AppEnumConstants.PO_ACCOUNT_STATUS_YES: {
        return AppEnumConstants.PO_LABEL_PO_ACCOUNT_STATUS_YES;
      }
      case AppEnumConstants.PO_ACCOUNT_STATUS_NO: {
        return AppEnumConstants.PO_LABEL_PO_ACCOUNT_STATUS_NO;
      }
    }
  }

  getData(field: any, col) {
    switch (field) {
      case 'dc.moduleId' : {
        return this.additionalFieldUtility.documentType;
        break;
      }
      case 'field.fieldTypeId' : {
        return this.additionalFieldUtility.fieldType;
        break;
      }
      case 'field.required' : {
        return col.dropdownValues;
        break;
      }
      case 'field.status' : {
        return col.dropdownValues;
        break;
      }
      case 'field.sectionId' : {
        return this.additionalFieldUtility.allSections;
        break;
      }
      default : {
        return undefined;
      }
    }
  }

  activateInactivate(id, isActive) {
    const ids: any[] = [];
    ids.push(id);
    this.additionalFieldService.activateInactivateField(ids, isActive).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        if (isActive) {
          this.notificationService.successMessage(HttpResponseMessage.FIELD_ACTIVATED_SUCCESSFULLY);
        } else {
          this.notificationService.successMessage(HttpResponseMessage.FIELD_INACTIVATED_SUCCESSFULLY);
        }
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.loadData(this.tableSupportBase.searchFilterDto);
      this.tableSupportBase.rows = [];
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  bulkActivateInactivate(isActive) {
    const ids: any[] = [];
    for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
      ids.push(this.tableSupportBase.rows[i].id);
    }
    this.additionalFieldService.activateInactivateField(ids, isActive).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        if (isActive) {
          this.notificationService.successMessage(HttpResponseMessage.BULK_FIELD_ACTIVATED_SUCCESSFULLY);
        } else {
          this.notificationService.successMessage(HttpResponseMessage.BULK_FIELD_INACTIVATED_SUCCESSFULLY);
        }
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.loadData(this.tableSupportBase.searchFilterDto);
      this.tableSupportBase.rows = [];
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }
}
