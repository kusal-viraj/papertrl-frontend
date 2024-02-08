import {NgModule} from '@angular/core';
import {CommonModule, DecimalPipe} from '@angular/common';
import {ExpenseRoutingModule} from './expense-routing.module';
import {ExpenseHomeComponent} from './expense-home/expense-home.component';
import {ExpenseListComponent} from './expense-list/expense-list.component';
import {ExpenseCreateComponent} from './expense-create/expense-create.component';
import {ExpenseApproveComponent} from './expense-approve/expense-approve.component';
import {ExpensePdfViewComponent} from './expense-pdf-view/expense-pdf-view.component';
import {SidebarModule} from 'primeng/sidebar';
import {ButtonModule} from 'primeng/button';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CalendarModule} from 'primeng/calendar';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {TableModule} from 'primeng/table';
import {SplitterModule} from '@progress/kendo-angular-layout';
import {CheckboxModule} from 'primeng/checkbox';
import {FileUploadModule} from 'primeng/fileupload';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {InputNumberModule} from 'primeng/inputnumber';
import {MenuModule} from 'primeng/menu';
import {MultiSelectModule} from 'primeng/multiselect';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';
import {KeyFilterModule} from 'primeng/keyfilter';
import {CurrencyMaskModule} from 'ng2-currency-mask';
import {CommonImplModule} from '../common/common-impl.module';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {DialogModule} from 'primeng/dialog';
import {BillsModule} from '../bills/bills.module';
import {RadioButtonModule} from 'primeng/radiobutton';
import {ExpenseChangeAssigneeComponent} from './change-assignee/expense-change-assignee.component';
import {TooltipModule} from 'primeng/tooltip';
import {TabViewModule} from 'primeng/tabview';
import {InputMaskModule} from 'primeng/inputmask';
import {CreateCreditCardFormComponent} from './create-credit-card-form/create-credit-card-form.component';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {RippleModule} from 'primeng/ripple';
import {ReceiptListPopupComponent} from './receipt-list-popup/receipt-list-popup.component';
import {MissingReportFormComponent} from './missing-report-form/missing-report-form.component';
import {CreditCardChangeAssigneeComponent} from './credit-card-change-assignee/credit-card-change-assignee.component';
import {ReceiptUploadComponent} from './receipt-upload/receipt-upload.component';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {ReceiptPopupManageComponent} from './receipt-popup-manage/receipt-popup-manage.component';
import {CreditCardBillCreateComponent} from './credit-card-bill-create/credit-card-bill-create.component';
import {NgScrollbarModule} from 'ngx-scrollbar';
import {CreditCardBillCreateFormComponent} from './credit-card-bill-create-form/credit-card-bill-create-form.component';
import {CreditCardApprovedListComponent} from './credit-card-approved-list/credit-card-approved-list.component';
import {CreditCardProcessListComponent} from './credit-card-process-list/credit-card-process-list.component';
import {CreditCardProcessComponent} from './credit-card-process/credit-card-process.component';
import {CreditCardSubmitListComponent} from './credit-card-submit-list/credit-card-submit-list.component';
import {CreditCardListComponent} from './credit-card-list/credit-card-list.component';
import {ReceiptListComponent} from './receipt-list/receipt-list.component';
import {
  CreditCardCreateTransactionComponent
} from './credit-card-create-transaction/credit-card-create-transaction.component';
import {CreditCardEditEmployeeComponent} from './credit-card-edit-employee/credit-card-edit-employee.component';
import {CreditCardUploadedListComponent} from './credit-card-uploaded-list/credit-card-uploaded-list.component';
import {CreditCardUploadComponent} from './credit-card-upload/credit-card-upload.component';
import {AvailableDraftListComponent} from './available-draft-list/available-draft-list.component';
import {ExpenseDetailViewComponent} from './expense-detail-view/expense-detail-view.component';
import {ContextMenuModule} from 'primeng/contextmenu';
import {VCardListComponent} from './v-card-list/v-card-list.component';
import {VCardAuditTrailComponent} from './v-card-audit-trail/v-card-audit-trail.component';
import {TimelineModule} from 'primeng/timeline';
import {DataViewModule} from 'primeng/dataview';
import {ChipModule} from 'primeng/chip';
import { CreditCardTransactionSplitComponent } from './credit-card-transaction-split/credit-card-transaction-split.component';


@NgModule({
  declarations: [ExpenseHomeComponent, ExpenseListComponent, ExpenseCreateComponent, ExpenseApproveComponent,
    ExpensePdfViewComponent, ExpenseChangeAssigneeComponent,
    CreateCreditCardFormComponent,
    ReceiptListPopupComponent, MissingReportFormComponent,
    CreditCardChangeAssigneeComponent, ReceiptUploadComponent, ReceiptPopupManageComponent,
    CreditCardBillCreateComponent, CreditCardBillCreateFormComponent, CreditCardApprovedListComponent,
    CreditCardProcessListComponent, CreditCardProcessComponent, CreditCardSubmitListComponent, CreditCardListComponent,
    ReceiptListComponent, CreditCardCreateTransactionComponent, CreditCardEditEmployeeComponent,
    CreditCardUploadedListComponent, CreditCardUploadComponent, AvailableDraftListComponent, ExpenseDetailViewComponent,
    VCardListComponent, VCardAuditTrailComponent, CreditCardTransactionSplitComponent],
    exports: [
        ExpenseApproveComponent,
        ExpenseDetailViewComponent,
        VCardAuditTrailComponent,
    ],
    imports: [
        CommonModule,
        ExpenseRoutingModule,
        SidebarModule,
        ButtonModule,
        ReactiveFormsModule,
        CalendarModule,
        FormsModule,
        DropdownModule,
        InputTextModule,
        InputTextareaModule,
        TableModule,
        SplitterModule,
        CheckboxModule,
        FileUploadModule,
        NgxDropzoneModule,
        InputNumberModule,
        MenuModule,
        MultiSelectModule,
        OverlayPanelModule,
        SplitterModule,
        NgxExtendedPdfViewerModule,
        KeyFilterModule,
        CurrencyMaskModule,
        CommonImplModule,
        ConfirmDialogModule,
        DialogModule,
        BillsModule,
        RadioButtonModule,
        TooltipModule,
        TabViewModule,
        InputMaskModule,
        AutoCompleteModule,
        RippleModule,
        ProgressSpinnerModule,
        NgScrollbarModule,
        ContextMenuModule,
        TimelineModule,
        DataViewModule,
        ChipModule,
    ],
  providers: [DecimalPipe]
})
export class ExpenseModule {
}
