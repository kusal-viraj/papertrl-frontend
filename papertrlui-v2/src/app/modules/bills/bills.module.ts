import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BillsRoutingModule} from './bills-routing.module';
import {BillHomeComponent} from './bill-home/bill-home.component';
import {CreateEBillComponent} from './create-e-bill/create-e-bill.component';
import {BillListComponent} from './bill-list/bill-list.component';
import {TabViewModule} from 'primeng/tabview';
import {ButtonModule} from 'primeng/button';
import {SidebarModule} from 'primeng/sidebar';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextModule} from 'primeng/inputtext';
import {CalendarModule} from 'primeng/calendar';
import {InputSwitchModule} from 'primeng/inputswitch';
import {TableModule} from 'primeng/table';
import {CurrencyMaskModule} from 'ng2-currency-mask';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {KeyFilterModule} from 'primeng/keyfilter';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {MultiSelectModule} from 'primeng/multiselect';
import {MenuModule} from 'primeng/menu';
import {DividerModule} from 'primeng/divider';
import {BillApproveMainComponent} from './bill-approve-main/bill-approve-main.component';
import {BillApproveFormComponent} from './bill-approve-form/bill-approve-form.component';
import {BillAttachmentApproveComponent} from './bill-attachment-approve/bill-attachment-approve.component';
import {BillPaymentCreateComponent} from './bill-payment-create/bill-payment-create.component';
import {NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';
import {BillSubmitDrawerUploadComponent} from './bill-submit-drawer-upload/bill-submit-drawer-upload.component';
import {BillPaymentDetailsComponent} from './bill-payment-details/bill-payment-details.component';
import {BillPaymentBaseComponent} from './bill-payment-base/bill-payment-base.component';
import {CommonImplModule} from '../common/common-impl.module';
import {ToastModule} from 'primeng/toast';
import {MarkAsMailedDrawerComponent} from './mark-as-mailed-drawer/mark-as-mailed-drawer.component';
import {ChangeBillDrawerComponent} from './change-bill-drawer/change-bill-drawer.component';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {TooltipModule} from 'primeng/tooltip';
import {ProgressBarModule} from 'primeng/progressbar';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {BillAuditTrialComponent} from './bill-audit-trial/bill-audit-trial.component';
import {TimelineModule} from 'primeng/timeline';
import {ChipsModule} from 'primeng/chips';
import {BlockUIModule} from 'primeng/blockui';
import {PanelModule} from 'primeng/panel';
import {NgCircleProgressModule} from 'ng-circle-progress';
import {RadioButtonModule} from 'primeng/radiobutton';
import {BillChangeAssigneeComponent} from './bill-change-assignee/bill-change-assignee.component';
import {NumberDirective} from './number-only';
import {DialogModule} from 'primeng/dialog';
import {CheckboxModule} from 'primeng/checkbox';
import {PoDetailsComponent} from './po-details/po-details.component';
import {OcrTemplateListComponent} from './ocr-template-list/ocr-template-list.component';
import {RecurringBillListComponent} from './recurring-bill-list/recurring-bill-list.component';
import {RecurringBillCreateComponent} from './recurring-bill-create/recurring-bill-create.component';
import {InputNumberModule} from 'primeng/inputnumber';
import {BillDetailViewComponent} from './bill-detail-view/bill-detail-view.component';
import {AutomationModule} from '../automation/automation.module';
import {MessagesModule} from 'primeng/messages';
import {ApplyCreditNoteComponent} from './credit-note/apply-credit-note/apply-credit-note.component';
import {ApplyToBillComponent} from './credit-note/apply-to-bill/apply-to-bill.component';
import {CreditNoteCreateComponent} from './credit-note/credit-note-create/credit-note-create.component';
import {CreditNoteDetailViewComponent} from './credit-note/credit-note-detail-view/credit-note-detail-view.component';
import {CreditNoteListComponent} from './credit-note/credit-note-list/credit-note-list.component';
import {DecimalNumberDirective} from './decimal-number.directive';
import {AttachedBillDetailComponent} from './credit-note/attached-bill-detail/attached-bill-detail.component';
import {
  ApplyCreditNoteAsBulkComponent
} from './credit-note/apply-credit-note-as-bulk/apply-credit-note-as-bulk.component';
import {ThreeWayMatchingTableComponent} from './three-way-matching-table/three-way-matching-table.component';
import {LineLevelPoReceiptViewerComponent} from './line-level-po-receipt-viewer/line-level-po-receipt-viewer.component';
import {AvilableBillDraftListComponent} from './avilable-bill-draft-list/avilable-bill-draft-list.component';
import {
  AvailableCreditNoteDraftListComponent
} from './credit-note/available-credit-note-draft-list/available-credit-note-draft-list.component';
import {BillProcessComponent} from './bill-process/bill-process.component';
import {AngularSplitModule} from 'angular-split';
import {PoReceiptsViewComponent} from './po-receipts-view/po-receipts-view.component';
import {EditProcessBillComponent} from './edit-process-bill/edit-process-bill.component';
import {ContextMenuModule} from 'primeng/contextmenu';
import {GtagModule} from 'angular-gtag';
import {CustomerInvoiceModule} from '../customer-invoice/customer-invoice.module';
import {ListboxModule} from 'primeng/listbox';

@NgModule({
  declarations: [BillHomeComponent, CreateEBillComponent, BillListComponent, NumberDirective, PoDetailsComponent,
    BillApproveMainComponent, BillPaymentCreateComponent, OcrTemplateListComponent,
    BillApproveFormComponent, BillAttachmentApproveComponent, BillSubmitDrawerUploadComponent,
    BillPaymentDetailsComponent, BillPaymentBaseComponent, MarkAsMailedDrawerComponent,
    ChangeBillDrawerComponent, BillAuditTrialComponent, BillChangeAssigneeComponent, RecurringBillListComponent,
    RecurringBillCreateComponent, BillDetailViewComponent,
    ApplyToBillComponent, CreditNoteCreateComponent, CreditNoteDetailViewComponent, CreditNoteListComponent,
    DecimalNumberDirective, ApplyCreditNoteComponent,
    AttachedBillDetailComponent,
    ApplyCreditNoteAsBulkComponent,
    ThreeWayMatchingTableComponent,
    LineLevelPoReceiptViewerComponent,
    AvilableBillDraftListComponent,
    AvailableCreditNoteDraftListComponent,
    BillProcessComponent,
    PoReceiptsViewComponent,
    EditProcessBillComponent],
  imports: [
    CommonModule,
    BillsRoutingModule,
    TabViewModule,
    ButtonModule,
    SidebarModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    CalendarModule,
    InputSwitchModule,
    FormsModule,
    TableModule,
    CurrencyMaskModule,
    NgxDropzoneModule,
    KeyFilterModule,
    InputTextareaModule,
    OverlayPanelModule,
    MultiSelectModule,
    MenuModule,
    DividerModule,
    NgxExtendedPdfViewerModule,
    CommonImplModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    TimelineModule,
    ChipsModule,
    BlockUIModule,
    PanelModule,
    NgCircleProgressModule,
    RadioButtonModule,
    DialogModule,
    CheckboxModule,
    InputNumberModule,
    AutomationModule,
    MessagesModule,
    AngularSplitModule,
    ContextMenuModule,
    GtagModule,
    CustomerInvoiceModule,
    ListboxModule,
  ],
  exports: [
    BillApproveMainComponent,
    CreateEBillComponent,
    BillAuditTrialComponent,
    MarkAsMailedDrawerComponent,
    ChangeBillDrawerComponent,
    BillPaymentDetailsComponent,
    NumberDirective,
    BillPaymentCreateComponent,
    ApplyCreditNoteComponent,
    AttachedBillDetailComponent,
    CreditNoteCreateComponent,
    ThreeWayMatchingTableComponent,
    LineLevelPoReceiptViewerComponent,
    PoDetailsComponent,
    PoReceiptsViewComponent,
  ],
  providers: []
})
export class BillsModule {
}
