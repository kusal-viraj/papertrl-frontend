import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {Table} from 'primeng/table';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {InvitationService} from '../../../shared/services/vendors/invitation.service';
import {VendorInvitationMasterDto} from '../../../shared/dto/vendor/vendor-invitation-master-dto';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {VendorBillTableDto} from '../../../shared/dto/vendor/vendor-bill-table-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-vendor-invitation',
  templateUrl: './vendor-invitation.component.html',
  styleUrls: ['./vendor-invitation.component.scss']
})
export class VendorInvitationComponent implements OnInit, OnDestroy {

  public tableSupportBase = new TableSupportBase();
  public bulkButtonList: ButtonPropertiesDto[] = [];
  public vendorInvitationRequestDto: VendorInvitationMasterDto = new VendorInvitationMasterDto();


  public enums = AppEnumConstants;
  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
  public tableKeyEnum = AppTableKeysData;

  public activeAction: VendorBillTableDto; // Selected Action Button
  public tableActionList: any [] = [];  // Action Button List

  public buttonValueInVendorTabResponsive: any;
  public bulkButtonListResponsive: any;
  public appAuthorities = AppAuthorities;

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

  @ViewChild('dt') table: Table;
  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('menu') menu: Menu;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }


  constructor(public confirmationService: ConfirmationService, public notificationService: NotificationService,
              public invitationService: InvitationService, public privilegeService: PrivilegeService,
              public gridService: GridService, public messageService: MessageService) {
    this.isRowSelectable = this.isRowSelectable.bind(this);
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.VENDOR_INVITATION_TABLE_KEY);
  }

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    if (this.privilegeService.isAuthorized(AppAuthorities.VENDORS_RESEND_VENDOR_INVITATION)) {
      this.availableHeaderActions.push(AppTableHeaderActions.VENDOR_SEND_INVITATION);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DELETE_VENDOR_INVITATION)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.actionButtonInit();
  }

  /**
   * Loads Table Data (Settings)
   */
    loadTableData() {
    this.selectedColumns = [];
    // Check for Responsiveness
    this.onTableResize();
    // Removes table Storage on load if present
    sessionStorage.removeItem(AppTableKeysData.VENDOR_INVITATION_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_VENDOR_INVITATION_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.VENDOR_INVITATION_TABLE_KEY, this.columnSelect);
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
    this.getDataFromBackend();
  }

  getDataFromBackend() {
    this.invitationService.getInvitationTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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


  actionButtonInit() {
    this.tableSupportBase.tableActionList = [
      {
        label: this.actionLabelEnum.ACTION_LABEL_RESEND_INVITATION,
        status: this.enums.STATUS_PENDING,
        icon: this.iconEnum.ICON_RESEND_INVITATION,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDORS_RESEND_VENDOR_INVITATION),
        command: () => {
          const id = this.activeAction.id;
          this.resendInvitation(id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_PENDING,
        icon: this.iconEnum.ICON_DELETE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DELETE_VENDOR_INVITATION),
        command: () => {
          const id = this.activeAction.id;
          this.deleteInvitation(id);
        }
      },
    ];
  }

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.VENDOR_INVITATION_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_VENDOR_INVITATION_LIST;
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
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_SEND_INVITATION:
        this.resendInvitationBulk();
        break;
      case AppBulkButton.BUTTON_DELETE:
        this.deleteInvitationBulk();
        break;
    }
  }


  /**
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: VendorBillTableDto) {
    this.activeAction = val;
  }

  isDisabled(data) {
    return data['vpInv.status'] == AppEnumConstants.STATUS_APPROVED;
  }

  isRowSelectable(data) {
    return !this.isDisabled(data.data);
  }

  public deleteInvitation(id: any) {
    const tempArray = new Array();
    tempArray.push(id);
    this.confirmationService.confirm({
      message: 'You want to delete this Invitation',
      key: 'v-invitaion',
      accept: () => {
        this.invitationService.deleteInvitationsList(tempArray).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.getDataFromBackend();
            this.tableSupportBase.rows = [];
            this.notificationService.successMessage(HttpResponseMessage.VENDOR_INVITATION_DELETED_SUCCESSFULLY);
          } else {
            this.notificationService.errorMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  public resendInvitation(id: any) {
    this.invitationService.resendInvitation(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.getDataFromBackend();
        this.tableSupportBase.rows = [];
        this.notificationService.successMessage(HttpResponseMessage.VENDOR_INVITATION_RESEND_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  public deleteInvitationBulk() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }

      this.confirmationService.confirm({
        message: 'You want to delete these Selected Invitations',
        key: 'v-invitaion',
        accept: () => {
          this.invitationService.deleteInvitationsList(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.getDataFromBackend();
              this.tableSupportBase.rows = [];
              this.notificationService.successMessage(HttpResponseMessage.VENDOR_INVITATIONS_DELETED_SUCCESSFULLY);
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

  public resendInvitationBulk() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.invitationService.resendInvitationsList(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.getDataFromBackend();
          this.tableSupportBase.rows = [];
          this.notificationService.successMessage(HttpResponseMessage.VENDOR_INVITATIONS_RESEND_SUCCESSFULLY);
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  getDropDown(col: any) {
    switch (col.field) {
      case 'vpInv.status':
        return col.dropdownValues;
      case 'vpInv.invitedBy':
        return col.dropdownValues;
    }
  }
}

