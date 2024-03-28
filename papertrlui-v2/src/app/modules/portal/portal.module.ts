import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortalRoutingModule } from './portal-routing.module';
import { PortalRoleHomeComponent } from './role-home/portal-role-home.component';
import { PortalRoleCreateComponent } from '../common/portal-role-create/portal-role-create.component';
import { PortalRoleListComponent } from './portal-role-list/portal-role-list.component';
import {ButtonModule} from 'primeng/button';
import {SidebarModule} from 'primeng/sidebar';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {TableModule} from 'primeng/table';
import {MenuModule} from 'primeng/menu';
import {CalendarModule} from 'primeng/calendar';
import {DropdownModule} from 'primeng/dropdown';
import {MultiSelectModule} from 'primeng/multiselect';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {TreeModule} from 'primeng/tree';
import {FieldsetModule} from 'primeng/fieldset';
import {AccordionModule} from 'primeng/accordion';
import { PortalDashboardComponent } from './portal-dashboard/portal-dashboard.component';
import { BillSummaryTableComponent } from './bill-summary-table/bill-summary-table.component';
import {KeyFilterModule} from 'primeng/keyfilter';
import { BillPaymentSummaryTableComponent } from './bill-payment-summary-table/bill-payment-summary-table.component';
import { PoSummaryTableComponent } from './po-summary-table/po-summary-table.component';
import { ExpenseSummaryTableComponent } from './expense-summary-table/expense-summary-table.component';
import {CurrencyMaskModule} from 'ng2-currency-mask';
import {NumberDirective} from './number-only';
import {CommonImplModule} from '../common/common-impl.module';
import {ContextMenuModule} from "primeng/contextmenu";


@NgModule({
  declarations: [PortalRoleHomeComponent, PortalRoleListComponent, PortalDashboardComponent,
    BillSummaryTableComponent, BillPaymentSummaryTableComponent, PoSummaryTableComponent, ExpenseSummaryTableComponent, NumberDirective],
  exports: [
    PortalRoleListComponent
  ],
    imports: [
        CommonModule,
        PortalRoutingModule,
        ButtonModule,
        SidebarModule,
        ConfirmDialogModule,
        TableModule,
        MenuModule,
        CalendarModule,
        DropdownModule,
        MultiSelectModule,
        FormsModule,
        InputTextModule,
        TreeModule,
        FieldsetModule,
        ReactiveFormsModule,
        AccordionModule,
        KeyFilterModule,
        CurrencyMaskModule,
        CommonImplModule,
        ContextMenuModule,
    ]
})
export class PortalModule { }
