import {CommonModule, DatePipe} from '@angular/common';

import {VendorCommunityRoutingModule} from './vendor-community-routing.module';
import {VendorDashboardComponent} from './vendor-dashboard/vendor-dashboard.component';
import {VendorProfileComponent} from './vendor-profile/vendor-profile.component';
import {VendorBillsTableComponent} from './vendor-bills-table/vendor-bills-table.component';
import {TableModule} from 'primeng/table';
import {MultiSelectModule} from 'primeng/multiselect';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MenuModule} from 'primeng/menu';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {DropdownModule} from 'primeng/dropdown';
import {VendorModule} from '../vendor/vendor.module';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {InputSwitchModule} from 'primeng/inputswitch';
import {InputMaskModule} from 'primeng/inputmask';
import {MessagesModule} from 'primeng/messages';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {KeyFilterModule} from 'primeng/keyfilter';
import {InvoiceHomeComponent} from './invoice-home/invoice-home.component';
import {PaymentsComponent} from './payments/payments.component';
import {TabViewModule} from 'primeng/tabview';
import {InvoiceListComponent} from './invoice-list/invoice-list.component';
import {InvoiceCreateComponent} from './invoice-create/invoice-create.component';
import {InvoiceProcessComponent} from './invoice-process/invoice-process.component';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {SidebarModule} from 'primeng/sidebar';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {CurrencyMaskModule} from 'ng2-currency-mask';
import {RadioButtonModule} from 'primeng/radiobutton';
import {CalendarModule} from 'primeng/calendar';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';
import {SplitterModule} from '@progress/kendo-angular-layout';
import {TooltipModule} from 'primeng/tooltip';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {CustomerComponent} from './customer/customer.component';
import {ToastModule} from 'primeng/toast';
import {PurchaseOrdersComponent} from './purchase-orders/purchase-orders.component';
import {PurchaseOrdersApproveComponent} from './purchase-orders-approve/purchase-orders-approve.component';
import {AutomationModule} from '../automation/automation.module';
import {BillsModule} from '../bills/bills.module';
import {CommonImplModule} from '../common/common-impl.module';
import {InvoiceUploadComponent} from './invoice-upload/invoice-upload.component';
import {DividerModule} from 'primeng/divider';
import {AddPaymentNoteComponent} from './add-payment-note/add-payment-note.component';
import {AddInvoiceNoteComponent} from './add-invoice-note/add-invoice-note.component';
import {DashboardPoTableComponent} from './dashboard-po-table/dashboard-po-table.component';
import {CheckboxModule} from 'primeng/checkbox';
import {DashboardModule} from '../dashboard/dashboard.module';
import {InvoiceTemplateListComponent} from './invoice-template-list/invoice-template-list.component';
import {InputNumberModule} from 'primeng/inputnumber';
import {RecurringInvoiceCreateComponent} from './recurring-invoice-create/recurring-invoice-create.component';
import {RecurringInvoiceListComponent} from './recurring-invoice-list/recurring-invoice-list.component';
import {CreateCreditNoteFromVendorComponent} from './credit-note/create-credit-note-from-vendor/create-credit-note-from-vendor.component';
import {
  CreditNoteDetailViewFromVendorComponent
} from './credit-note/credit-note-detail-view-from-vendor/credit-note-detail-view-from-vendor.component';
import {CreditNoteListFromVendorComponent} from './credit-note/credit-note-list-from-vendor/credit-note-list-from-vendor.component';
import {DialogModule} from 'primeng/dialog';
import {NgModule} from '@angular/core';
import {ContextMenuModule} from "primeng/contextmenu";
import { DigitalCardsComponent } from './digital-cards/digital-cards.component';
import {ExpenseModule} from "../expense/expense.module";


@NgModule({
  declarations: [VendorDashboardComponent, VendorProfileComponent, VendorBillsTableComponent, PurchaseOrdersComponent,
    AddPaymentNoteComponent, AddInvoiceNoteComponent, InvoiceHomeComponent, PaymentsComponent, InvoiceListComponent,
    InvoiceCreateComponent, InvoiceProcessComponent, CustomerComponent, PurchaseOrdersApproveComponent, InvoiceUploadComponent,
    DashboardPoTableComponent, InvoiceTemplateListComponent, RecurringInvoiceCreateComponent, CreditNoteListFromVendorComponent,
    RecurringInvoiceListComponent, CreateCreditNoteFromVendorComponent, CreditNoteDetailViewFromVendorComponent, DigitalCardsComponent],
    imports: [
        CommonModule,
        VendorCommunityRoutingModule,
        TableModule,
        MultiSelectModule,
        FormsModule,
        MenuModule,
        OverlayPanelModule,
        DropdownModule,
        VendorModule,
        ReactiveFormsModule,
        AutoCompleteModule,
        InputSwitchModule,
        InputTextareaModule,
        InputMaskModule,
        MessagesModule,
        ButtonModule,
        InputTextModule,
        KeyFilterModule,
        TabViewModule,
        ConfirmDialogModule,
        SidebarModule,
        NgxDropzoneModule,
        CurrencyMaskModule,
        RadioButtonModule,
        CalendarModule,
        InputTextareaModule,
        NgxExtendedPdfViewerModule,
        SplitterModule,
        TooltipModule,
        ProgressSpinnerModule,
        ToastModule,
        AutomationModule,
        BillsModule,
        CommonImplModule,
        DividerModule,
        CheckboxModule,
        DashboardModule,
        InputNumberModule,
        DialogModule,
        ContextMenuModule,
        ExpenseModule
    ], providers: [DatePipe]
})
export class VendorCommunityModule {
}
