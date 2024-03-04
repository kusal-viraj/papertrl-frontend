import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PaymentHomeComponent} from './payment-home/payment-home.component';
import {PaymentRoutingModule} from './payment-routing.module';
import {TabViewModule} from 'primeng/tabview';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {MultiSelectModule} from 'primeng/multiselect';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextModule} from 'primeng/inputtext';
import {CalendarModule} from 'primeng/calendar';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SidebarModule} from 'primeng/sidebar';
import {InputSwitchModule} from 'primeng/inputswitch';
import {DialogModule} from 'primeng/dialog';
import {CurrencyMaskModule} from 'ng2-currency-mask';
import {MenuModule} from 'primeng/menu';
import {RippleModule} from 'primeng/ripple';
import {AccordionModule} from 'primeng/accordion';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {DecimalNumberDirective} from './decimal-number.directive';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {NumberDirective} from './number-only';
import {CountdownModule} from 'ngx-countdown';
import {BillsModule} from '../bills/bills.module';
import {CommonImplModule} from '../common/common-impl.module';
import {RadioButtonModule} from 'primeng/radiobutton';
import {KeyFilterModule} from 'primeng/keyfilter';
import {NgCircleProgressModule} from 'ng-circle-progress';
import {BlockUIModule} from 'primeng/blockui';
import {PanelModule} from 'primeng/panel';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {ToastModule} from 'primeng/toast';
import {TooltipModule} from 'primeng/tooltip';
import {CheckboxModule} from 'primeng/checkbox';
import { TransactionListComponent } from './transaction-list/transaction-list.component';
import { CreatePaymentComponent } from './create-payment/create-payment.component';
import { PaymentApproveComponent } from './payment-approve/payment-approve.component';
import {PaymentOfflineUploadComponent} from './payment-offline-upload/payment-offline-upload.component';
import { ChangeExpenseDrawerComponent } from './change-expense-drawer/change-expense-drawer.component';
import {ContextMenuModule} from 'primeng/contextmenu';
import { PaymentSummaryComponent } from './payment-summary/payment-summary.component';
import {ProgressBarModule} from 'primeng/progressbar';
import { PaymentUploadFormComponent } from './payment-upload-form/payment-upload-form.component';
import {NgxDropzoneModule} from "ngx-dropzone";
import { ProcessPaymentRequestComponent } from './process-payment-request/process-payment-request.component';
import {NgxIntlTelInputModule} from 'ngx-intl-tel-input';
import { ErpConfigurationComponent } from './erp-configuration/erp-configuration.component';



@NgModule({
    declarations: [PaymentHomeComponent, DecimalNumberDirective, NumberDirective, TransactionListComponent, CreatePaymentComponent,
        PaymentApproveComponent, PaymentOfflineUploadComponent, ChangeExpenseDrawerComponent, PaymentSummaryComponent, PaymentUploadFormComponent, ProcessPaymentRequestComponent, ErpConfigurationComponent],
  imports: [
    CommonModule,
    PaymentRoutingModule,
    TabViewModule,
    TableModule,
    ButtonModule,
    MultiSelectModule,
    DropdownModule,
    InputTextModule,
    CalendarModule,
    FormsModule,
    ReactiveFormsModule,
    SidebarModule,
    InputSwitchModule,
    DialogModule,
    CurrencyMaskModule,
    MenuModule,
    RippleModule,
    AccordionModule,
    InputTextareaModule,
    ConfirmDialogModule,
    CountdownModule,
    BillsModule,
    CommonImplModule,
    RadioButtonModule,
    KeyFilterModule,
    NgCircleProgressModule,
    BlockUIModule,
    PanelModule,
    OverlayPanelModule,
    ToastModule,
    TooltipModule,
    CheckboxModule,
    ContextMenuModule,
    ProgressBarModule,
    NgxDropzoneModule,
    NgxIntlTelInputModule,

  ],
    exports: [
        ChangeExpenseDrawerComponent
    ]
})
export class PaymentModule {
}
