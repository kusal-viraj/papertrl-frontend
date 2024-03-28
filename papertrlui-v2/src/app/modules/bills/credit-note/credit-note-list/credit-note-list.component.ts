import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UntypedFormBuilder} from '@angular/forms';
import {TableSupportBase} from '../../../../shared/utility/table-support-base';
import {AppEnumConstants} from '../../../../shared/enums/app-enum-constants';
import {AppAuthorities} from '../../../../shared/enums/app-authorities';
import {AppTableKeysData} from '../../../../shared/enums/app-table-keys-data';
import {ButtonPropertiesDto} from '../../../../shared/dto/common/Buttons/button-properties-dto';
import {DropdownDto} from '../../../../shared/dto/common/dropDown/dropdown-dto';
import {GridService} from '../../../../shared/services/common/table/grid.service';
import {CreditNoteService} from '../../../../shared/services/credit-note/credit-note.service';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {PrivilegeService} from '../../../../shared/services/privilege.service';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {AppActionLabel} from '../../../../shared/enums/app-action-label';
import {AppIcons} from '../../../../shared/enums/app-icons';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {AppWindowResolution} from '../../../../shared/enums/app-window-resolution';
import {AppResponseStatus} from '../../../../shared/enums/app-response-status';
import {AppBulkButton} from '../../../../shared/enums/app-bulk-button';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {Table} from 'primeng/table';
import {DetailViewService} from '../../../../shared/helpers/detail-view.service';
import {OverlayPanel} from 'primeng/overlaypanel';
import {Subscription} from 'rxjs';
import {AppTableHeaderActions} from '../../../../shared/enums/app-table-header-actions';
import {BillsService} from '../../../../shared/services/bills/bills.service';
import {Menu} from "primeng/menu";
import {GoogleAnalyticsService} from "../../../../shared/services/google-analytics/google-analytics.service";
import {AppAnalyticsConstants} from "../../../../shared/enums/app-analytics-constants";


@Component({
  selector: 'app-credit-note-list',
  templateUrl: './credit-note-list.component.html',
  styleUrls: ['./credit-note-list.component.scss']
})
export class CreditNoteListComponent implements OnInit, OnDestroy {

  public activeAction: any;
  public creditNoteId: any;
  public isEditView = false;
  public isDetailView = false;
  public isApplyToBill = false;
  public btnLoading = false;
  public isViewAttachedBillDetail = false;
  public overlayId: any;

  public tableSupportBase = new TableSupportBase();
  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public tableKeyEnum = AppTableKeysData;
  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any[] = [];
  public allVendorList: DropdownDto = new DropdownDto();
  public poList: DropdownDto = new DropdownDto();
  public tableUpdateSubscription = new Subscription();
  public isCreateCreditNote = false;
  public selectedIndex: any;
  public AppAnalyticsConstants = AppAnalyticsConstants;

  public appConstant: AppConstant = new AppConstant();

  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public isExporting = false;


  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);

  }

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  @ViewChild('vendorOverlay') vendorOverlay: OverlayPanel;
  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: Table;
  @ViewChild('menu') menu: Menu;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }


  constructor(public gridService: GridService, public notificationService: NotificationService,
              public creditNoteService: CreditNoteService, public privilegeService: PrivilegeService,
              public confirmationService: ConfirmationService, public formBuilder: UntypedFormBuilder,
              public detailViewService: DetailViewService, public billsService: BillsService, public gaService: GoogleAnalyticsService) {
  }

  ngOnDestroy(): void {
    this.tableUpdateSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    if (this.privilegeService.isAuthorized(AppAuthorities.CREDIT_NOTE_EXPORT)) {
      this.availableHeaderActions.push(AppTableHeaderActions.EXPORT);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.tableUpdateSubscription = this.creditNoteService.updateTableData.subscribe(() => {
      if (this.tableSupportBase.searchFilterDto?.filters) {
        this.loadData(this.tableSupportBase.searchFilterDto);
      }
    });
    this.actionButtonInit();
    this.getAllVendorList();
    this.getPoList();
  }

  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableSupportBase.tableActionList = [
      {
        label: AppActionLabel.ACTION_LABEL_EDIT,
        icon: AppIcons.ICON_EDIT,
        status: this.enums.STATUS_COMMON,
        isApplyToBill: false,
        submittedByVendor: false,
        isViewBill: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_NOTE_EDIT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_CREDIT_NOTE,
            AppActionLabel.ACTION_LABEL_EDIT);
          this.creditNoteId = this.activeAction.id;
          this.checkCreditNoteAttachedToBill();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_EXPORT,
        icon: AppIcons.ICON_EXPORT,
        status: this.enums.STATUS_COMMON,
        isApplyToBill: false,
        submittedByVendor: true,
        isViewBill: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_NOTE_EXPORT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_EXPORT,
            AppAnalyticsConstants.MODULE_NAME_CREDIT_NOTE,
            AppActionLabel.ACTION_LABEL_EXPORT,
            );
          const id = this.activeAction.id;
          this.export(id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_DELETE,
        isApplyToBill: false,
        isViewBill: false,
        submittedByVendor: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_NOTE_DELETE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DELETE,
            AppAnalyticsConstants.MODULE_NAME_CREDIT_NOTE,
            AppActionLabel.ACTION_LABEL_DELETE,
            );
          this.deleteCreditNote();
          this.isEditView = false;
          this.isDetailView = false;
          this.isViewAttachedBillDetail = false;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_EDIT,
        icon: AppIcons.ICON_EDIT,
        status: this.enums.STATUS_DRAFT,
        isApplyToBill: false,
        submittedByVendor: false,
        isViewBill: false,
        authCode: true,
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_CREDIT_NOTE,
            AppActionLabel.ACTION_LABEL_EDIT,
            );
          this.creditNoteId = this.activeAction.id;
          this.checkCreditNoteAttachedToBill();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_DRAFT,
        icon: AppIcons.ICON_DELETE,
        isApplyToBill: false,
        isViewBill: false,
        submittedByVendor: false,
        authCode: true,
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DELETE,
            AppAnalyticsConstants.MODULE_NAME_CREDIT_NOTE,
            AppActionLabel.ACTION_LABEL_DELETE);
          this.deleteCreditNote();
          this.isEditView = false;
          this.isDetailView = false;
          this.isViewAttachedBillDetail = false;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
        icon: AppIcons.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        isApplyToBill: false,
        submittedByVendor: true,
        isViewBill: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_NOTE_DETAIL_VIEW),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
            AppAnalyticsConstants.MODULE_NAME_CREDIT_NOTE,
            AppActionLabel.ACTION_LABEL_DETAIL_VIEW);
          this.creditNoteId = this.activeAction.id;
          this.isEditView = false;
          this.isDetailView = true;
          this.isViewAttachedBillDetail = false;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_APPLY_TO_BILL,
        icon: AppIcons.ICON_EXPORT,
        status: this.enums.STATUS_ACTIVE,
        isApplyToBill: true,
        isViewBill: false,
        submittedByVendor: true,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_NOTE_APPLY_TO_BILL),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_APPLY_TO_BILL,
            AppAnalyticsConstants.MODULE_NAME_CREDIT_NOTE,
            AppActionLabel.ACTION_LABEL_APPLY_TO_BILL,);
          this.creditNoteId = this.activeAction.id;
          this.isEditView = false;
          this.isDetailView = false;
          this.isApplyToBill = true;
          this.isViewAttachedBillDetail = false;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_VIEW_APPLIED_BILL,
        icon: AppIcons.ICON_VIEW_ATTACHED_BILL,
        status: this.enums.STATUS_ACTIVE,
        isApplyToBill: false,
        isViewBill: true,
        submittedByVendor: true,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_NOTE_VIEW_ATTACHED_BILL),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_VIEW_APPLIED_BILL,
            AppAnalyticsConstants.MODULE_NAME_CREDIT_NOTE,
            AppActionLabel.ACTION_LABEL_VIEW_APPLIED_BILL);
          this.creditNoteId = this.activeAction.id;
          this.isEditView = false;
          this.isDetailView = false;
          this.isApplyToBill = false;
          this.canViewBillDetail();
        }
      }
    ];
  }

  /**
   * A Single value hover from table
   * @param field to filed
   * @param obj to customer obj
   * @param event to click event
   */
  tdHover(field, obj: any, event) {
    if (field === 'creditNote.vendorId' && this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW)) {
      this.overlayId = obj.vendorId;
      showOverlay(this.vendorOverlay);
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
   */
  isClassHover(field) {
    switch (field) {
      case 'creditNote.vendorId':
        return !!this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW);
    }
  }

  /**
   * A Single value clicked from table
   * @param field to filed
   * @param obj to customer obj
   */
  tdClick(field, obj: any, event) {
    if (field === 'creditNote.vendorId' && this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW)) {
      this.detailViewService.openVendorDetailView(obj.vendorId);
    }
  }

  /**
   * Hide Overlays if Visible
   */
  hideOverlays() {
    if (this.vendorOverlay.overlayVisible) {
      this.vendorOverlay.hide();
    }
  }

  /**
   * get action list
   */
  actionButtonList(creditCard) {
    return this.tableSupportBase.tableActionList.filter(this.isActionMatch(creditCard));
  }

  /**
   * match auth codes
   */
  isActionMatch(creditCard) {
    return function f(element) {
      return (element.authCode && (!element.isApplyToBill || parseInt(creditCard['creditNote.creditBalance']) > 0)
        && (!element.isViewBill ||
          (parseInt(creditCard['creditNote.creditBalance']) !== parseInt(creditCard['creditNote.creditTotal']))) &&
        (creditCard['submittedByVendor'] ? (element.submittedByVendor && creditCard['submittedByVendor'] == true) : true)
        && ((element.status === creditCard['creditNote.status'] || (element.status === AppEnumConstants.STATUS_COMMON &&
          creditCard['creditNote.status'] !== AppEnumConstants.STATUS_DRAFT))));
    };
  }

  /**
   * Set Values when action button clicked
   * @param val object
   * @param i to index
   */
  actionButtonClick(val, i) {
    this.activeAction = val;
    this.selectedIndex = i;
  }

  /**
   * Loads Table Data (Settings)
   */
  loadTableData() {
    this.selectedColumns = [];
    // Check for Responsiveness
    this.onTableResize();
    // Removes table Storage on load if present
    sessionStorage.removeItem(AppTableKeysData.CREDIT_NOTE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_CREDIT_NOTE_LIST).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.CREDIT_NOTE_KEY, this.columnSelect);
    });
  }

  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.CREDIT_NOTE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_CREDIT_NOTE_LIST;
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
    this.creditNoteService.getCreditCardTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      this.tableSupportBase.dataSource = res.body.data;
      if (this.selectedIndex) {
        this.creditNoteService.updatedCreditBalance.next(res.body.data[this.selectedIndex]['creditNote.creditBalance']);
      }
      this.tableSupportBase.totalRecords = res.body.totalRecords;
      if (this.tableSupportBase.totalRecords === AppConstant.ZERO) {
        this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('{first}', '0');
      } else {
        this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('0', '{first}');
      }
    });
  }

  /**
   * this method can be used to load bulk button data
   */
  loadBulkButtonData() {
    this.creditNoteService.getCreditNoteBulkActionData().subscribe((res: any) => {
      if (res.status === AppResponseStatus.STATUS_SUCCESS) {
        const arr = [];
        for (const property of res.body) {
          const val: ButtonPropertiesDto = property;
          arr.push(
            {
              label: val.label,
              action: val.action,
              authCode: val.authCode,
              disabled: !val.active,
              icon: val.icon,
              command: (event) => {
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
   * this method can be used to get vendor related po list
   */
  getPoList() {
    this.creditNoteService.getTablePoList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.poList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * get dropdown for filters
   * @param col to row object
   */
  getDropDown(col: any) {
    switch (col.field) {
      case 'creditNote.vendorId':
        return this.allVendorList.data;
      case 'creditNote.poId':
        return this.poList.data;
      case 'creditNote.status':
        return col.dropdownValues;

    }
  }

  /**
   * this method can be used to delete credit note
   */
  deleteCreditNote() {
    let statusDraft: boolean = this.activeAction['creditNote.status'] === AppEnumConstants.STATUS_DRAFT;
    this.confirmationService.confirm({
      key: statusDraft ? 'creditNoteDraftDeleteKey' : 'creditNoteDeleteKey',
      message: statusDraft ? 'You want to delete this Draft' : 'You want to delete this Credit Note',
      accept: () => {
        this.creditNoteService.deleteCreditNote(this.activeAction.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            if (this.activeAction['creditNote.status'] === AppEnumConstants.STATUS_DRAFT) {
              this.notificationService.successMessage(HttpResponseMessage.DRAFT_DISCARDED_SUCCESSFULLY);
            } else {
              this.notificationService.successMessage(HttpResponseMessage.CREDIT_NOTE_DELETED_SUCCESSFULLY);
            }
            this.tableSupportBase.rows = [];
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
   * trigger when click create credit note
   */
  createCreditNote() {
    this.isCreateCreditNote = true;
  }

  /**
   * thia method validate credit note search privileges
   */
  isAccessForCreditNoteSearch() {
    return this.privilegeService.isAuthorizedMultiple([
      AppAuthorities.CREDIT_NOTE_EDIT, AppAuthorities.CREDIT_NOTE_DELETE, AppAuthorities.CREDIT_NOTE_APPLY_TO_BILL,
      AppAuthorities.CREDIT_NOTE_DETAIL_VIEW, AppAuthorities.CREDIT_NOTE_SEARCH]);
  }

  /**
   * check credit note has bill(s)
   */
  checkCreditNoteAttachedToBill() {
    this.creditNoteService.canEdit(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.isEditView = true;
        this.isDetailView = false;
      } else {
        this.isEditView = false;
        this.isDetailView = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * check credit note has bill(s)
   */
  canViewBillDetail() {
    this.creditNoteService.canEdit(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.isViewAttachedBillDetail = false;
        this.notificationService.infoMessage(HttpResponseMessage.NO_ATTACHED_BILL);
      } else {
        this.isViewAttachedBillDetail = true;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * CSV export credit notes
   */
  bulkExportAll() {
    if (this.tableSupportBase.rows.length !== 0) {
      this.bulkExportSelected();
      return;
    }
    this.creditNoteService.bulkExportAll(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'credit_note.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.notificationService.successMessage(HttpResponseMessage.ALL_CREDIT_NOTE_EXPORTED_SUCCESSFULLY);
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
   * Export Bulk Data
   */
  bulkExportSelected() {
    if (this.isSelectOnlyDraft(this.tableSupportBase.rows, 'creditNote.status')) {
      this.notificationService.infoMessage(HttpResponseMessage.DRAFTED_CREDIT_NOTE_CANNOT_BE_EXPORTED);
      this.isExporting = false;
      return;
    }
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.creditNoteService.bulkExportSelected(ids).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'credit_note.csv');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.loadData(this.tableSupportBase.searchFilterDto);
          this.notificationService.successMessage(HttpResponseMessage.SELECTED_CREDIT_NOTE_EXPORTED_SUCCESSFULLY);
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
   * export single data
   * @param id to id
   */
  export(id) {
    if (!id) {
      return;
    }
    const tempArray = new Array();
    tempArray.push(id);
    this.creditNoteService.bulkExportSelected(tempArray).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'credit_note.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.notificationService.successMessage(HttpResponseMessage.SINGLE_CREDIT_NOTE_EXPORTED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to check all selected items are draft
   * @param selectedItems to selected rows array
   * @param statusProperty is table status
   */
  isSelectOnlyDraft(selectedItems: any [], statusProperty) {
    return selectedItems.every(tableData => tableData[statusProperty] === AppEnumConstants.STATUS_DRAFT);
  }


}
