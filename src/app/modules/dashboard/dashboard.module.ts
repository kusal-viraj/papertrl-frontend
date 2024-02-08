import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FooterComponent} from './footer/footer.component';
import {MenuComponent} from './menu/menu.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {TopBarComponent} from './top-bar/top-bar.component';
import {AppMainComponent} from './app.main.component';
import {MenuModule} from 'primeng/menu';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonModule} from 'primeng/button';
import {ChartModule} from 'primeng/chart';
import {InputSwitchModule} from 'primeng/inputswitch';
import {RadioButtonModule} from 'primeng/radiobutton';
import {RippleModule} from 'primeng/ripple';
import {InputTextModule} from 'primeng/inputtext';
import {TableModule} from 'primeng/table';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ProductService} from '../../shared/services/demo/productservice';
import {AppMenuitemComponent} from './menu/app.menuitem.component';
import {DialogService} from 'primeng/dynamicdialog';
import {MessageService} from 'primeng/api';
import {CarouselModule} from 'primeng/carousel';
import {BreadcrumbModule} from 'primeng/breadcrumb';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {DialogModule} from 'primeng/dialog';
import {TabViewModule} from 'primeng/tabview';
import {PasswordModule} from 'primeng/password';
import {ToastModule} from 'primeng/toast';
import {ApprovalTableComponent} from './approval-table/approval-table.component';
import {MultiSelectModule} from 'primeng/multiselect';
import {CalendarModule} from 'primeng/calendar';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {KeyFilterModule} from 'primeng/keyfilter';
import {DiscountTableComponent} from './discount-table/discount-table.component';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {SidebarModule} from 'primeng/sidebar';
import {BillsModule} from '../bills/bills.module';
import {NotificationTableComponent} from './notification-table/notification-table.component';
import {TreeTableModule} from "primeng/treetable";
import {BillSummaryComponent} from './bill-summary/bill-summary.component';
import {PoSummaryComponent} from './po-summary/po-summary.component';
import {PurchaseOrderModule} from "../purchase-order/purchase-order.module";
import {ExpenseSummaryComponent} from './expense-summary/expense-summary.component';
import {ExpenseModule} from "../expense/expense.module";
import {CommonImplModule} from "../common/common-impl.module";
import {NotificationComponent} from './notification/notification.component';
import {NgScrollbarModule} from "ngx-scrollbar";
import {PersonalizeComponent} from './personalize/personalize.component';
import {PasswordResetComponent} from './password-reset/password-reset.component';
import {ProfileEditComponent} from './profile-edit/profile-edit.component';
import {TooltipModule} from "primeng/tooltip";
import {CurrencyMaskModule} from "ng2-currency-mask";
import {DashboardRoutingModule} from "./dashboard-routing.module";
import {BadgeModule} from "primeng/badge";
import {SupportTicketCreateComponent} from './support-ticket-create/support-ticket-create.component';
import {InputTextareaModule} from "primeng/inputtextarea";
import {NgxDropzoneModule} from "ngx-dropzone";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {ContextMenuModule} from "primeng/contextmenu";


@NgModule({
    declarations: [
        FooterComponent,
        MenuComponent,
        DashboardComponent,
        TopBarComponent,
        AppMainComponent,
        AppMenuitemComponent,
        ApprovalTableComponent,
        DiscountTableComponent,
        NotificationTableComponent,
        BillSummaryComponent,
        PoSummaryComponent,
        ExpenseSummaryComponent,
        NotificationComponent,
        PersonalizeComponent,
        PasswordResetComponent,
        ProfileEditComponent,
        SupportTicketCreateComponent,
    ],
    imports: [
        CommonModule,
        DashboardRoutingModule,
        MenuModule,
        DropdownModule,
        ButtonModule,
        ChartModule,
        InputSwitchModule,
        RadioButtonModule,
        RippleModule,
        BadgeModule,
        InputTextModule,
        TableModule,
        FormsModule,
        CarouselModule,
        BreadcrumbModule,
        ScrollPanelModule,
        DialogModule,
        TabViewModule,
        ReactiveFormsModule,
        PasswordModule,
        ToastModule,
        MultiSelectModule,
        CalendarModule,
        OverlayPanelModule,
        KeyFilterModule,
        AutoCompleteModule,
        ConfirmDialogModule,
        SidebarModule,
        BillsModule,
        TreeTableModule,
        PurchaseOrderModule,
        ExpenseModule,
        CommonImplModule,
        NgScrollbarModule,
        TooltipModule,
        CurrencyMaskModule,
        InputTextareaModule,
        NgxDropzoneModule,
        ScrollingModule,
        ContextMenuModule,
    ],
    providers: [ProductService, DialogService, MessageService]
})
export class DashboardModule {
}
