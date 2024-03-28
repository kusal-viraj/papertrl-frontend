import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PurchaseOrderRoutingModule} from './purchase-order-routing.module';
import {PoHomeComponent} from './po-home/po-home.component';
import {PoCreateComponent} from './po-create/po-create.component';
import {PoApproveComponent} from './po-approve/po-approve.component';
import {PoListComponent} from './po-list/po-list.component';
import {SidebarModule} from 'primeng/sidebar';
import {ButtonModule} from 'primeng/button';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {TableModule} from 'primeng/table';
import {CalendarModule} from 'primeng/calendar';
import {CheckboxModule} from 'primeng/checkbox';
import {PoApprovalButtonsComponent} from './po-approval-buttons/po-approval-buttons.component';
import {PoApprovalInvoiceViewComponent} from './po-approval-invoice-view/po-approval-invoice-view.component';
import {FileUploadModule} from 'primeng/fileupload';
import {InputNumberModule} from 'primeng/inputnumber';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {MenuModule} from 'primeng/menu';
import {MultiSelectModule} from 'primeng/multiselect';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';
import {KeyFilterModule} from 'primeng/keyfilter';
import {CurrencyMaskModule} from 'ng2-currency-mask';
import {TabViewModule} from 'primeng/tabview';
import {PoReceiptListComponent} from './po-receipt-list/po-receipt-list.component';
import {PoReceiptCreateComponent} from './po-receipt-create/po-receipt-create.component';
import {CommonImplModule} from '../common/common-impl.module';
import {ToastModule} from 'primeng/toast';
import {DecimalNumberDirective} from './decimal-number.directive';
import {ChangeAssigneeComponent} from './change-assignee/change-assignee.component';
import {RadioButtonModule} from 'primeng/radiobutton';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {BillAssignComponent} from './bill-assign/bill-assign.component';
import {NumberDirective} from './number-only';
import {DialogModule} from 'primeng/dialog';
import {TooltipModule} from 'primeng/tooltip';
import {BillsModule} from '../bills/bills.module';
import {AttachedCreditNoteDetailComponent} from './attached-credit-note-detail/attached-credit-note-detail.component';
import { AvailablePoDraftListComponent } from './available-po-draft-list/available-po-draft-list.component';
import { AvailablePoReceiptDraftListComponent } from './available-po-receipt-draft-list/available-po-receipt-draft-list.component';
import { PoDetailViewComponent } from './po-detail-view/po-detail-view.component';
import {ContextMenuModule} from 'primeng/contextmenu';
import {CustomerInvoiceModule} from '../customer-invoice/customer-invoice.module';
import {AngularSplitModule} from 'angular-split';


@NgModule({
  declarations: [PoHomeComponent,
    PoCreateComponent, PoApproveComponent, PoListComponent, NumberDirective,
    PoApprovalButtonsComponent, PoApprovalInvoiceViewComponent, PoReceiptListComponent, PoReceiptCreateComponent, DecimalNumberDirective,
    ChangeAssigneeComponent, BillAssignComponent, AttachedCreditNoteDetailComponent, AvailablePoDraftListComponent,
    AvailablePoReceiptDraftListComponent, PoDetailViewComponent],
    exports: [
        PoReceiptCreateComponent,
        PoCreateComponent,
        DecimalNumberDirective,
        PoListComponent,
        ChangeAssigneeComponent,
        PoApproveComponent,
        ChangeAssigneeComponent,
        BillAssignComponent,
        NumberDirective,
        PoDetailViewComponent
    ],
    imports: [
        CommonModule,
        PurchaseOrderRoutingModule,
        SidebarModule,
        ButtonModule,
        ReactiveFormsModule,
        CalendarModule,
        FormsModule,
        DropdownModule,
        InputTextModule,
        InputTextareaModule,
        TableModule,
        CheckboxModule,
        FileUploadModule,
        NgxDropzoneModule,
        InputNumberModule,
        MenuModule,
        MultiSelectModule,
        OverlayPanelModule,
        NgxExtendedPdfViewerModule,
        KeyFilterModule,
        CurrencyMaskModule,
        TabViewModule,
        CommonImplModule,
        ToastModule,
        RadioButtonModule,
        ConfirmDialogModule,
        DialogModule,
        TooltipModule,
        BillsModule,
        ContextMenuModule,
        CustomerInvoiceModule,
        AngularSplitModule,
    ]
})
export class PurchaseOrderModule {
}
