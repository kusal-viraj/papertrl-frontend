import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerInvoiceRoutingModule } from './customer-invoice-routing.module';
import { CustomerInvoiceComponent } from './customer-invoice.component';
import { CreateCustomerInvoiceComponent } from './create-customer-invoice/create-customer-invoice.component';
import { CustomerInvoiceListComponent } from './customer-invoice-list/customer-invoice-list.component';
import { CustomerInvoiceHomeComponent } from './customer-invoice-home/customer-invoice-home.component';
import {ButtonModule} from "primeng/button";
import { UploadCustomerInvoiceComponent } from './upload-customer-invoice/upload-customer-invoice.component';
import {TableModule} from "primeng/table";
import {ContextMenuModule} from "primeng/contextmenu";
import {CommonImplModule} from "../common/common-impl.module";
import {MenuModule} from "primeng/menu";
import {SidebarModule} from "primeng/sidebar";
import {ReactiveFormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {CalendarModule} from "primeng/calendar";
import {InputTextareaModule} from "primeng/inputtextarea";
import {CurrencyMaskModule} from "ng2-currency-mask";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import { CustomerInvoiceAuditTrialComponent } from './customer-invoice-audit-trial/customer-invoice-audit-trial.component';
import {TimelineModule} from "primeng/timeline";
import {CardModule} from "primeng/card";
import {BlockUIModule} from "primeng/blockui";
import {NgCircleProgressModule} from "ng-circle-progress";
import {PanelModule} from "primeng/panel";


@NgModule({
    declarations: [
        CustomerInvoiceComponent,
        CreateCustomerInvoiceComponent,
        CustomerInvoiceListComponent,
        CustomerInvoiceHomeComponent,
        UploadCustomerInvoiceComponent,
        CustomerInvoiceAuditTrialComponent
    ],
  exports: [
    CreateCustomerInvoiceComponent,
    CreateCustomerInvoiceComponent
  ],
    imports: [
        CommonModule,
        CustomerInvoiceRoutingModule,
        ButtonModule,
        TableModule,
        ContextMenuModule,
        CommonImplModule,
        MenuModule,
        SidebarModule,
        ReactiveFormsModule,
        InputTextModule,
        CalendarModule,
        InputTextareaModule,
        CurrencyMaskModule,
        ConfirmDialogModule,
        TimelineModule,
        CardModule,
        BlockUIModule,
        NgCircleProgressModule,
        PanelModule
    ]
})
export class CustomerInvoiceModule { }
