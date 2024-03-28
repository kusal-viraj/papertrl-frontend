import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsRoutingModule } from './reports-routing.module';
import { MainReportsPageComponent } from './main-reports-page/main-reports-page.component';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DividerModule} from 'primeng/divider';
import {DropdownModule} from 'primeng/dropdown';
import {NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';
import { ReportMainFormComponent } from './report-main-form/report-main-form.component';
import {InputTextModule} from 'primeng/inputtext';
import {CalendarModule} from 'primeng/calendar';
import {FieldsetModule} from 'primeng/fieldset';
import {ListboxModule} from 'primeng/listbox';
import {MultiSelectModule} from "primeng/multiselect";
import { PoBillableTransactionTableComponent } from './billable-transaction/po-billable-trnsaction-table/po-billable-transaction-table.component';
import { BillBillableTransactionTableComponent } from './billable-transaction/bill-billable-transaction-table/bill-billable-transaction-table.component';
import { ExpenseBillableTransactionTableComponent } from './billable-transaction/expense-billable-transaction-table/expense-billable-transaction-table.component';
import {TableModule} from "primeng/table";
import {RippleModule} from "primeng/ripple";
import {CommonImplModule} from "../common/common-impl.module";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {SidebarModule} from "primeng/sidebar";
import {PurchaseOrderModule} from "../purchase-order/purchase-order.module";
import {DialogModule} from "primeng/dialog";
import {ItemModule} from "../item/item.module";
import {AccountModule} from "../account/account.module";
import {BadgeModule} from "primeng/badge";


@NgModule({
  declarations: [MainReportsPageComponent, ReportMainFormComponent, PoBillableTransactionTableComponent, BillBillableTransactionTableComponent, ExpenseBillableTransactionTableComponent],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    CardModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DividerModule,
    DropdownModule,
    NgxExtendedPdfViewerModule,
    InputTextModule,
    CalendarModule,
    FieldsetModule,
    ListboxModule,
    MultiSelectModule,
    TableModule,
    RippleModule,
    CommonImplModule,
    OverlayPanelModule,
    SidebarModule,
    PurchaseOrderModule,
    DialogModule,
    ItemModule,
    AccountModule,
    BadgeModule
  ]
})
export class ReportsModule { }
