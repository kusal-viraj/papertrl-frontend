import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {GoogleAnalyticsService} from '../../../shared/services/google-analytics/google-analytics.service';

@Component({
  selector: 'app-table-header-action-buttons',
  templateUrl: './table-header-action-buttons.component.html',
  styleUrls: ['./table-header-action-buttons.component.scss']
})
export class TableHeaderActionButtonsComponent implements OnInit, OnDestroy {

  @Input() visibleActions: any;
  @Input() tableSupportBase;
  @Input() componentInstance: any;
  @Input() moduleName: any;
  @Output() refresh = new EventEmitter();
  @Output() showFilters = new EventEmitter();
  @Output() showColumns = new EventEmitter();
  @Output() voidList = new EventEmitter();
  @Output() export = new EventEmitter();
  @Output() delete = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() reject = new EventEmitter();
  @Output() quickApprove = new EventEmitter();
  @Output() sendToVendorApproval = new EventEmitter();
  @Output() emailToVendor = new EventEmitter();
  @Output() reOpen = new EventEmitter();
  @Output() close = new EventEmitter();
  @Output() download = new EventEmitter();
  @Output() applyCreditNote = new EventEmitter();
  @Output() downloadDetailedReports = new EventEmitter();
  @Output() paymentProcessing = new EventEmitter();
  @Output() paymentUnProcessing = new EventEmitter();
  @Output() inactive = new EventEmitter();
  @Output() active = new EventEmitter();
  @Output() processTransactionsExpense = new EventEmitter();
  @Output() expenseGenerateBill = new EventEmitter();
  @Output() vendorSendInvitation = new EventEmitter();
  @Output() vendorAddLocal = new EventEmitter();
  @Output() syncPendingPushBtn = new EventEmitter();
  @Output() reSyncFailed = new EventEmitter();
  @Output() reSentRequest = new EventEmitter();
  @Output() showUtilizationReport = new EventEmitter();

  public appTableHeaderActions = AppTableHeaderActions;
  public filteredMap = new Map<string, FilterMetadata>();
  public isFilterButtonShown = false;

  constructor(private gaService: GoogleAnalyticsService) {
  }

  ngOnInit(): void {
    // Listen for filters are triggered
    this.tableSupportBase.filterObserver.subscribe(() => {
      this.isFilterButtonShown = true;
    });
  }

  refreshClicked(name: string) {
    this.refresh.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  showFiltersClicked(name: string) {
    this.showFilters.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  showColumnsClicked(name: string) {
    this.showColumns.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  exportClicked(name: string) {
    this.export.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  deleteClicked(name: string) {
    this.delete.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  rejectClicked(name: string) {
    this.reject.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  quickApproveClicked(name: string) {
    this.quickApprove.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  sendToVendorApprovalClicked(name: string) {
    this.sendToVendorApproval.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  emailToVendorClicked(name: string) {
    this.emailToVendor.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  re_OpenClicked(name: string) {
    this.reOpen.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  closeClicked(name: string) {
    this.close.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  downloadClicked(name: string) {
    this.download.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  applyCreditNoteClicked(name: string) {
    this.applyCreditNote.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  downloadDetailedReportsClicked(name: string) {
    this.downloadDetailedReports.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  paymentProcessingClicked(name: string) {
    this.paymentProcessing.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  inactiveClicked(name: string) {
    this.inactive.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  activeClicked(name: string) {
    this.active.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  processTransactionsExpenseClicked(name: string) {
    this.processTransactionsExpense.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  expenseGenerateBillClicked(name: string) {
    this.expenseGenerateBill.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  vendorSendInvitationClicked(name: string) {
    this.vendorSendInvitation.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  vendorAddLocalClicked(name: string) {
    this.vendorAddLocal.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  syncPendingPushBtnClicked(name: string) {
    this.syncPendingPushBtn.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  reSyncFailedClicked(name: string) {
    this.reSyncFailed.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  cancelClicked(name: string) {
    this.cancel.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }


  reSentClick(name: string) {
    this.reSentRequest.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  showUtilizationReports(name: string) {
    this.showUtilizationReport.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  paymentUnProcessingClicked(name: string) {
    this.paymentUnProcessing.emit();
    this.gaService.trackTableHeaderActions(this.moduleName, name);
  }

  clearFilterClicked(hardReset?) {
    try {
      if (this.componentInstance?.table?.hasFilter()) {
        this.tableResetFunction();
      }
      if (hardReset && !this.componentInstance?.table?.hasFilter()) {
        this.tableResetFunction();
      }
    } catch (error) {
      console.error(error);
    }
  }

  tableResetFunction() {
    this.componentInstance.table.filters = Object.fromEntries(this.filteredMap);
    this.componentInstance?.table?.reset();
    this.componentInstance?.table?.columns.forEach((val) => {
      val.value = null;
      val.value2 = null;
    });
  }

  /**
   * Check if there are any filters in the table
   * If filters present enable the button else disable it
   */
  isResetButtonDisabled() {
    try {
      return !this.componentInstance?.table?.hasFilter();
    } catch (error) {
      return false;
    }
  }

  ngOnDestroy(): void {
    if (this.isFilterButtonShown) {
      this.tableSupportBase.filterSubject.unsubscribe();
      return;
    }
  }
}
