import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {VendorRoutingModule} from './vendor-routing.module';
import {VendorHomeComponent} from './vendor-home/vendor-home.component';
import {VendorInvoiceComponent} from './vendor-invoice/vendor-invoice.component';
import {CustomerService} from '../../shared/services/demo/customerservice';
import {TableModule} from 'primeng/table';
import {InputTextModule} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {MultiSelectModule} from 'primeng/multiselect';
import {CalendarModule} from 'primeng/calendar';
import {SliderModule} from 'primeng/slider';
import {ToastModule} from 'primeng/toast';
import {ProgressBarModule} from 'primeng/progressbar';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {DialogModule} from 'primeng/dialog';
import {ContextMenuModule} from 'primeng/contextmenu';
import {TabMenuModule} from 'primeng/tabmenu';
import {TabViewModule} from 'primeng/tabview';
import {VendorRequestComponent} from './vendor-request/vendor-request.component';
import {CardModule} from 'primeng/card';
import {SplitButtonModule} from 'primeng/splitbutton';
import {CreateVendorComponent} from './create-vendor/create-vendor.component';
import {InputSwitchModule} from 'primeng/inputswitch';
import {FileUploadModule} from 'primeng/fileupload';
import {VendorInvitationComponent} from './vendor-invitation/vendor-invitation.component';
import {VendorGrnComponent} from './vendor-grn/vendor-grn.component';
import {VendorPoComponent} from './vendor-po/vendor-po.component';
import {VendorUploadComponent} from './vendor-upload/vendor-upload.component';
import {VendorPaymentComponent} from './vendor-payment/vendor-payment.component';
import {ListboxModule} from 'primeng/listbox';
import {VirtualScrollerModule} from 'primeng/virtualscroller';
import {PickListModule} from 'primeng/picklist';
import {MenuModule} from 'primeng/menu';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {InputNumberModule} from 'primeng/inputnumber';
import {KeyFilterModule} from 'primeng/keyfilter';
import {SidebarModule} from 'primeng/sidebar';
import {TooltipModule} from 'primeng/tooltip';
import {VendorInvitationFormComponent} from './vendor-invitation-form/vendor-invitation-form.component';
import {CommonImplModule} from '../common/common-impl.module';
import {BillsModule} from '../bills/bills.module';
import {PurchaseOrderModule} from '../purchase-order/purchase-order.module';
import {VendorTableComponent} from './vendor-table/vendor-table.component';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {InputMaskModule} from 'primeng/inputmask';
import {BlockUIModule} from 'primeng/blockui';
import {PanelModule} from 'primeng/panel';
import {NgCircleProgressModule} from 'ng-circle-progress';
import {CurrencyMaskModule} from 'ng2-currency-mask';
import {VendorDetailDrawerComponent} from './vendor-detail-drawer/vendor-detail-drawer.component';
import {CheckboxModule} from 'primeng/checkbox';
import {RadioButtonModule} from "primeng/radiobutton";
import { VendorDetailViewComponent } from './vendor-detail-view/vendor-detail-view.component';
import { VendorGroupComponent } from './vendor-group/vendor-group.component';
import {ChipsModule} from 'primeng/chips';
import {PaymentModule} from '../payment/payment.module';
import { VendorItemUploadComponent } from './item/vendor-item-upload/vendor-item-upload.component';
import { VendorItemListComponent } from './item/vendor-item-list/vendor-item-list.component';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import { VendorItemDetailComponent } from './item/vendor-item-detail/vendor-item-detail.component';
import { VendorItemErrorComponent } from './item/vendor-item-error/vendor-item-error.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {AccordionModule} from "primeng/accordion";

@NgModule({
  declarations: [VendorHomeComponent, VendorInvoiceComponent, VendorRequestComponent, CreateVendorComponent,
    VendorInvitationComponent, VendorGrnComponent, VendorPoComponent, VendorUploadComponent, VendorPaymentComponent,
    VendorInvitationFormComponent, VendorTableComponent, VendorDetailDrawerComponent, VendorDetailViewComponent,
    VendorGroupComponent, VendorItemUploadComponent, VendorItemListComponent,
    VendorItemDetailComponent, VendorItemErrorComponent],
  imports: [
    CommonModule,
    VendorRoutingModule,
    TableModule,
    CalendarModule,
    SliderModule,
    DialogModule,
    MultiSelectModule,
    ContextMenuModule,
    DropdownModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    ProgressBarModule,
    FormsModule,
    VendorRoutingModule,
    TabMenuModule,
    TabViewModule,
    CardModule,
    SplitButtonModule,
    ReactiveFormsModule,
    InputSwitchModule,
    FileUploadModule,
    SplitButtonModule,
    ListboxModule,
    VirtualScrollerModule,
    PickListModule,
    MenuModule,
    OverlayPanelModule,
    InputNumberModule,
    KeyFilterModule,
    SidebarModule,
    TooltipModule,
    CommonImplModule,
    BillsModule,
    PurchaseOrderModule,
    InputTextareaModule,
    AutoCompleteModule,
    ConfirmDialogModule,
    InputMaskModule,
    BlockUIModule,
    PanelModule,
    NgCircleProgressModule,
    CurrencyMaskModule,
    CheckboxModule,
    RadioButtonModule,
    ChipsModule,
    PaymentModule,
    NgxDropzoneModule,
    ProgressSpinnerModule,
    ScrollingModule,
    AccordionModule,
  ],
    exports: [
        VendorDetailDrawerComponent
    ],
  providers: [CustomerService, VendorHomeComponent, VendorInvoiceComponent]
})
export class VendorModule {
}
