import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AppConstant} from '../../../shared/utility/app-constant';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {Table} from 'primeng/table';
import {Menu} from 'primeng/menu';
import {LazyLoadEvent} from 'primeng/api';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {PoTableDto} from '../../../shared/dto/po/po-table-dto';
import {PaymentService} from '../../../shared/services/payments/payment.service';

@Component({
  selector: 'app-digital-cards',
  templateUrl: './digital-cards.component.html',
  styleUrls: ['./digital-cards.component.scss']
})
export class DigitalCardsComponent implements OnInit, OnDestroy {

  public poId: number;
  public detailView = false;
  public auditTrailPanel = false;

  public tableSupportBase = new TableSupportBase();
  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public tableKeyEnum = AppTableKeysData;
  public activeAction;
  public auditTrialPanel: boolean;
  public auditTrial: any = [];

  public tableActionList: any [] = [];

  public tenantId: any;

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

  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: Table;
  @ViewChild('menu') menu: Menu;


  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  constructor(public notificationService: NotificationService, public gridService: GridService,
              public privilegeService: PrivilegeService, public paymentService: PaymentService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.Item_TABLE_KEY);
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.V_D_CARDS_TABLE_KEY);
    promise.then(result => {
        this.tableSupportBase.tableDataOptions = result;
        this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_VENDOR_COMMUNITY_D_CARDS_LIST;
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
    this.tableSupportBase.tableActionList = [
      {
        label: AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
        icon: AppIcons.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.D_CARD_DETAIL_VIEW),
        command: () => {
          this.poId = this.activeAction.id;
          this.tenantId = this.activeAction.tenantId;
          this.detailView = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_ACTIVITY_LOG,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_AUDIT_TRAIL,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.D_CARD_ACTIVITY_LOG),
        command: () => {
          this.auditTrailPanel = false;
          this.paymentService.getVCardAuditTrial(this.activeAction.id).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.auditTrial = res.body;
              this.auditTrailPanel = true;
            } else {
              this.notificationService.infoMessage(res.body.message);
            }
          });
        }
      },
    ];
  }

  /**
   * Change action button array list according to status
   * @param status statua
   */
  actionButtonList(status) {
    return this.tableActionList.filter(this.isActionMatch(status, AppEnumConstants.STATUS_COMMON));
  }


  /**
   * This method use for filter table action match by element status
   * @param status string
   */
  isActionMatch(status, common) {
    return function f(element) {
      return ((element.status === status || element.status === common) && element.authCode);
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
    sessionStorage.removeItem(AppTableKeysData.V_D_CARDS_TABLE_KEY);

    this.gridService.getTableStructure(this.appConstant.GRID_VENDOR_COMMUNITY_D_CARDS_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.V_D_CARDS_TABLE_KEY, this.columnSelect);
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
    this.paymentService.getDigitalCardsGridDataVendorCommunity(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
  }


}
