import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {ProjectCodeService} from '../../../shared/services/project-code/project-code.service';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {Table} from 'primeng/table';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {AppConstant} from '../../../shared/utility/app-constant';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {DynamicDialogConfig} from 'primeng/dynamicdialog';
import {DetailViewService} from '../../../shared/helpers/detail-view.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';

@Component({
  selector: 'app-project-detail-view',
  templateUrl: './project-detail-view.component.html',
  styleUrls: ['./project-detail-view.component.scss']
})
export class ProjectDetailViewComponent implements OnInit, OnDestroy {

  public projectCodeForm: UntypedFormGroup;
  public tableSupportBase = new TableSupportBase();

  public enums = AppEnumConstants;
  public tableKeyEnum = AppTableKeysData;
  public appAuthorities = AppAuthorities;

  public allVendorList: DropdownDto = new DropdownDto();
  public commonUtil = new CommonUtility();
  public billId: any;
  public billDetailView = false;
  public isEditView = false;


  @Input() projectCodeID: any;
  @Input() projectCodeStatus: any;

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  @Output() closeDrawerEmit = new EventEmitter();
  @Output() isDeleteEmitter = new EventEmitter();
  @Output() editProjectCodeEmitter = new EventEmitter();

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

  @ViewChild('dt') table: Table;
  @ViewChild('columnSelect') columnSelect: any;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  constructor(public formBuilder: UntypedFormBuilder, public projectCodeService: ProjectCodeService, public privilegeService: PrivilegeService,
              public gridService: GridService, public notificationService: NotificationService, public billsService: BillsService,
              public config: DynamicDialogConfig, public detailViewService: DetailViewService,
              public confirmationService: ConfirmationService) {
  }

  ngOnInit(): void {
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    if (this.config?.data) {
      this.projectCodeID = this.config.data.id;
    }
    this.projectCodeForm = this.formBuilder.group({
      name: [null],
      parentId: [null],
      description: [null],
      contractValue: [null],
      projectBudget: [null],
      tpCompanyId: [null],
      tpCompanyName: [null],
      createdDateStr: [null],
      parentProjectName: [null],
      remainingAmount: [null],
      amountInvoiced: [null],
      createdUsername: [null],
      startDate: [null],
      endDateStr: [null],
      startDateStr: [null],
      endDate: [null],
      id: [null],
      userNamesStr: [null],
      accountNosStr: [null]
    });

    this.getAllVendorList();
    this.getProjectCodeData();
    this.loadTableData();
  }

  get f() {
    return this.projectCodeForm.controls;
  }

  /**
   * This method can be used to get project code data
   */
  getProjectCodeData() {
    if (!this.projectCodeID) {
      return;
    } else {
      this.projectCodeService.getProjectDetails(this.projectCodeID).subscribe((res: any) => {
        this.projectCodeForm.patchValue(res.body);
      });
    }
  }


  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.projectCodeService.getProjectBillTableData(this.tableSupportBase.searchFilterDto, this.projectCodeID).subscribe((res: any) => {
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
    sessionStorage.removeItem(AppTableKeysData.PROJECT_BILL);
    this.gridService.getTableStructure(this.appConstant.GRID_PROJECT_CODE_BILLS).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.PROJECT_BILL, this.columnSelect);
    });
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.PROJECT_BILL);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_PROJECT_CODE_BILLS;
            this.gridService.updateTableState(this.tableSupportBase.tableDataOptions).subscribe((res: any) => {
        if (event === true){
          this.loadTableData();
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    });
  }

  getDropDowns(col: any) {
    switch (col.field) {
      case 'vendor.id':
        return this.allVendorList.data;
      default:
        return [];
    }
  }

  /**
   * This method use for get vendor list for dropdown
   */
  getAllVendorList() {
    this.billsService.getVendorList(!this.isEditView).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.allVendorList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * A Single value clicked from table
   * @param field to filed
   * @param obj
   */
  tdClick(field, obj: any) {
    if (field === 'bill.billNo') {
      this.billId = JSON.parse(JSON.stringify(obj))['exp.billId'];
      this.detailViewService.openBillDetailView(this.billId);
      this.billDetailView = true;
    }
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.PROJECT_BILL);
    this.detailViewService.closeBillDetailView();
  }

  closeDrawer() {
    if (this.config?.data) {
      this.detailViewService.closePrjDetailView();
      return;
    }
    this.closeDrawerEmit.emit(false);
  }

  /**
   * this method can be used to edit project code
   */
  editProjectCode() {
    this.isEditView = true;
  }

  /**
   * this method can be used to delete project code
   */
  /**
   * delete user method
   */
  deleteProjectCode() {
    if (!this.projectCodeID) {
      return;
    } else {
      this.confirmationService.confirm({
        message: 'You want to delete the selected Project code <br> <br>' +
          'If you perform this action, any associated project codes will be deleted as well',
        key: 'projectCodeDelete',
        accept: () => {
          this.projectCodeService.deleteProjectCode(this.projectCodeID).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.notificationService.successMessage(HttpResponseMessage.CODE_DELETED_SUCCESSFULLY);
              this.closeDrawer();
              this.isDeleteEmitter.emit();
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
}
