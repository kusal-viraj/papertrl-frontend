import {Component, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../../shared/utility/table-support-base';
import {AppEnumConstants} from '../../../../shared/enums/app-enum-constants';
import {AppAuthorities} from '../../../../shared/enums/app-authorities';
import {AppTableKeysData} from '../../../../shared/enums/app-table-keys-data';
import {ButtonPropertiesDto} from '../../../../shared/dto/common/Buttons/button-properties-dto';
import {DropdownDto} from '../../../../shared/dto/common/dropDown/dropdown-dto';
import {Table} from 'primeng/table';
import {GridService} from '../../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {CreditNoteService} from '../../../../shared/services/credit-note/credit-note.service';
import {PrivilegeService} from '../../../../shared/services/privilege.service';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {UntypedFormBuilder} from '@angular/forms';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {AppWindowResolution} from '../../../../shared/enums/app-window-resolution';
import {AppBulkButton} from '../../../../shared/enums/app-bulk-button';
import {AppActionLabel} from '../../../../shared/enums/app-action-label';
import {AppIcons} from '../../../../shared/enums/app-icons';
import {AppResponseStatus} from '../../../../shared/enums/app-response-status';
import {VendorInvoiceService} from '../../../../shared/services/vendor-community/vendor-invoice.service';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {FormGuardService} from '../../../../shared/guards/form-guard.service';
import {AppTableHeaderActions} from '../../../../shared/enums/app-table-header-actions';

@Component({
  selector: 'app-credit-note-list-from-vendor',
  templateUrl: './credit-note-list-from-vendor.component.html',
  styleUrls: ['./credit-note-list-from-vendor.component.scss']
})
export class CreditNoteListFromVendorComponent implements OnInit {

  public activeAction: any;
  public creditNoteId: any;
  public isEditCreditNote = false;
  public isCreateCreditNote = false;
  public creditNoteCreateEditScreen = false;
  public isDetailView = false;
  public isViewAttachedBillDetail = false;
  public deleteKey: string;


  public tableSupportBase = new TableSupportBase();
  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public tableKeyEnum = AppTableKeysData;
  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any[] = [];
  public allVendorList: DropdownDto = new DropdownDto();
  public poList: DropdownDto = new DropdownDto();
  public customerList: DropdownDto = new DropdownDto();

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
  CreateCreditNoteFromVendorComponent;
  @ViewChild('dt') table: Table;


  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }


  constructor(public gridService: GridService, public notificationService: NotificationService,
              public creditNoteService: CreditNoteService, public privilegeService: PrivilegeService,
              public vendorInvoiceService: VendorInvoiceService, public formGuardService: FormGuardService,
              public confirmationService: ConfirmationService, public formBuilder: UntypedFormBuilder) {
  }

  ngOnInit(): void {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.actionButtonInit();
    this.getCustomerList();
    this.getVendorRelatedPOList();
  }

  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableSupportBase.tableActionList = [
      {
        label: AppActionLabel.ACTION_LABEL_EDIT,
        icon: AppIcons.ICON_EDIT,
        status: this.enums.STATUS_DRAFT,
        isViewBill: false,
        isEdit: true,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDOR_CREDIT_NOTE_EDIT),
        command: () => {
          this.isCheckTenantActive(this.activeAction.tenantId).then(value => {
            if (value){
              this.checkCreditNoteAttachedToBillFromVendor();
            }
          });
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_DELETE,
        isViewBill: false,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDOR_CREDIT_NOTE_DELETE),
        command: () => {
          this.isCheckTenantActive(this.activeAction.tenantId).then(value => {
            if (value){
              this.creditNoteCreateEditScreen = false;
              this.isEditCreditNote = false;
              this.isDetailView = false;
              this.deleteCreditNoteFromVendor();
            }
          });
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
        icon: AppIcons.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        isViewBill: false,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDOR_CREDIT_NOTE_DETAIL_VIEW),
        command: () => {
          this.isCheckTenantActive(this.activeAction.tenantId).then(value => {
            if (value){
              this.creditNoteCreateEditScreen = false;
              this.isEditCreditNote = false;
              this.isDetailView = true;
            }
          });
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_CANCEL,
        status: this.enums.STATUS_ACTIVE,
        icon: AppIcons.ICON_CANCEL,
        isViewBill: false,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDOR_CREDIT_NOTE_CANCEL),
        command: () => {
          this.isCheckTenantActive(this.activeAction.tenantId).then(value => {
            if (value){
              this.creditNoteCreateEditScreen = false;
              this.isEditCreditNote = false;
              this.isDetailView = false;
              this.cancelCreditNoteFromVendor();
            }
          });
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_VIEW_APPLIED_BILL,
        icon: AppIcons.ICON_VIEW_ATTACHED_BILL,
        status: this.enums.STATUS_ACTIVE,
        isViewBill: true,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VENDOR_CREDIT_NOTE_VIEW_ATTACHED_BILLS),
        command: () => {
          this.isCheckTenantActive(this.activeAction.tenantId).then(value => {
            if (value){
              this.creditNoteCreateEditScreen = false;
              this.isEditCreditNote = false;
              this.isDetailView = false;
              this.isViewAttachedBillDetail = true;
            }
          });
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_SEND_TO_CUSTOMER,
        icon: AppIcons.SEND_ICON,
        status: this.enums.STATUS_DRAFT,
        isViewBill: false,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_NOTE_SEND_TO_CUSTOMER),
        command: () => {
          this.isCheckTenantActive(this.activeAction.tenantId).then(value => {
            if (value){
              this.sendToCustomer();
              this.creditNoteCreateEditScreen = false;
              this.isEditCreditNote = false;
              this.isDetailView = false;
              this.isViewAttachedBillDetail = false;
            }
          });
        }
      }
    ];
  }

  /**
   * get action list
   */
  actionButtonList(status, activeAction) {
    return this.tableSupportBase.tableActionList.filter(this.isActionMatch(status, activeAction));
  }

  /**
   * match auth codes
   */
  isActionMatch(status, activeAction) {
    return function f(element) {
      return ((element.status === status || element.status === AppEnumConstants.STATUS_COMMON) && element.authCode &&
        (!element.isViewBill || (parseInt(activeAction['creditNote.creditBalance']) !== parseInt(activeAction['creditNote.creditTotal']))) &&
        (!element.isEdit || (activeAction['creditNote.status'] !== AppEnumConstants.STATUS_CANCELED)));
    };
  }

  /**
   * Set Values when action button clicked
   * @param val object
   * @param i to index
   */
  actionButtonClick(val, i) {
    this.activeAction = val;
  }

  /**
   * check credit note has bill(s)
   */
  checkCreditNoteAttachedToBillFromVendor() {
    if (!this.activeAction['creditNoteId'] && !this.activeAction['tenantId']) {
      return;
    } else {
      this.creditNoteService.canEditInVendor(this.activeAction['creditNoteId'],
        this.activeAction['tenantId']).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.creditNoteCreateEditScreen = true;
          this.isCreateCreditNote = false;
          this.isEditCreditNote = true;
          this.isDetailView = false;
        } else {
          this.creditNoteCreateEditScreen = false;
          this.isCreateCreditNote = false;
          this.isEditCreditNote = false;
          this.isDetailView = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * Loads Table Data (Settings)
   */
  loadTableData() {
    this.selectedColumns = [];
    // Check for Responsiveness
    this.onTableResize();
    // Removes table Storage on load if present
    sessionStorage.removeItem(AppTableKeysData.CREDIT_NOTE_KEY_VENDOR);
    this.gridService.getTableStructure(this.appConstant.VENDOR_CREDIT_NOTE_LIST).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.CREDIT_NOTE_KEY_VENDOR, this.columnSelect);
    });
  }

  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.CREDIT_NOTE_KEY_VENDOR);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.VENDOR_CREDIT_NOTE_LIST;
      this.gridService.updateTableState(this.tableSupportBase.tableDataOptions).subscribe((res: any) => {
        if (event === true) {
          this.loadTableData();
        }
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    });
  }

  /**
   * change table column
   */
  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.creditNoteService.getCreditNoteTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      this.tableSupportBase.dataSource = res.body.data;
      this.tableSupportBase.totalRecords = res.body.totalRecords;
      if (this.tableSupportBase.totalRecords === AppConstant.ZERO) {
        this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('{first}', '0');
      } else {
        this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('0', '{first}');
      }
    });
  }


  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_DELETE:
        break;
    }
  }

  /**
   * get dropdown for filters
   * @param col to row object
   */
  getDropDown(col: any) {
    switch (col.field) {
      case 'creditNote.tenantId':
        return this.customerList.data;
      case 'creditNote.poId':
        return this.poList.data;
      case 'creditNote.status':
        return col.dropdownValues;
    }
  }

  /**
   * this method can be used for load create popup
   */
  createCreditNote() {
    this.creditNoteCreateEditScreen = true;
    this.isEditCreditNote = false;
    this.isCreateCreditNote = true;
  }

  /**
   * this method can be used for get customer list
   */
  getCustomerList() {
    this.vendorInvoiceService.getCustomerList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.customerList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used for get customer list
   */
  getVendorRelatedPOList() {
    this.creditNoteService.getVendorPoList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.poList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method used for delete credit note
   */
  deleteCreditNoteFromVendor() {
    let isDraft = (this.activeAction['creditNote.status'] === this.enums.STATUS_DRAFT);
    this.confirmationService.confirm({
      key: 'KeyCreditNote',
      message: isDraft ? 'You want to delete this Draft' : 'You want to delete this Credit Note',
      accept: () => {
        let id = this.activeAction['id'];
        this.creditNoteService.deleteCreditNoteFromVendor(id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            isDraft ? this.notificationService.successMessage(HttpResponseMessage.DRAFT_DISCARDED_SUCCESSFULLY) :
              this.notificationService.successMessage(HttpResponseMessage.CREDIT_NOTE_DELETED_SUCCESSFULLY);
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
   * this method used for cancel credit note
   */
  cancelCreditNoteFromVendor() {
    let id = this.activeAction['id'];
    this.creditNoteService.cancelCreditNoteFromVendor(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.CREDIT_NOTE_CANCELED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method check privileges of vendor
   */
  isMangeCreditNote() {
    if (this.isEditCreditNote) {
      return this.privilegeService.isAuthorizedMultiple([AppAuthorities.CREDIT_NOTE_SAVE_AS_DRAFT, AppAuthorities.CREDIT_NOTE_SEND_TO_CUSTOMER,
        AppAuthorities.VENDOR_CREDIT_NOTE_EDIT]);
    } else {
      return this.privilegeService.isAuthorizedMultiple([AppAuthorities.CREDIT_NOTE_SAVE_AS_DRAFT, AppAuthorities.CREDIT_NOTE_SEND_TO_CUSTOMER]);
    }
  }

  /**
   * this method check privileges of vendor
   */
  isSearchCreditNote() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.VENDOR_CREDIT_NOTE_SEARCH, AppAuthorities.VENDOR_CREDIT_NOTE_EDIT,
      AppAuthorities.VENDOR_CREDIT_NOTE_DELETE, AppAuthorities.VENDOR_CREDIT_NOTE_DETAIL_VIEW, AppAuthorities.VENDOR_CREDIT_NOTE_DELETE,
      AppAuthorities.VENDOR_CREDIT_NOTE_VIEW_ATTACHED_BILLS]);
  }

  /**
   * this method can be used for get bill details for vendor
   */

  sendToCustomer() {
    let id = this.activeAction['id'];
    if (!id) {
      return;
    } else {
      this.creditNoteService.sendCreditNoteToCustomerAsActionButtonOption(id).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.CREDIT_NOTE_SEND_TO_CUSTOMER_SUCCESSFULLY);
          this.loadData(this.tableSupportBase.searchFilterDto);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * This method is used to check whether the specified tenant is active or not
   *
   * @param tenantId
   */
  isCheckTenantActive(tenantId) {
    return new Promise(resolve => {
      this.vendorInvoiceService.isTenantActive(tenantId).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          resolve(true);
        } else {
          this.notificationService.infoMessage(res.body.message);
          resolve(false);
        }
      }, error => {
        resolve(false);
        this.notificationService.errorMessage(error);
      });
    });
  }
}
