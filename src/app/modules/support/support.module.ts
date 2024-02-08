import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SupportRoutingModule} from './support-routing.module';
import {ActiveLoginListComponent} from './active-logins/active-login-list/active-login-list.component';
import {ApprovePackageListComponent} from './approve-package/approve-package-list/approve-package-list.component';
import {ApproveTrialListComponent} from './approve-trial/approve-trial-list/approve-trial-list.component';
import {EmailListComponent} from './email/email-list/email-list.component';
import {PackageHomeComponent} from './package/package-home/package-home.component';
import {PackageListComponent} from './package/package-list/package-list.component';
import {PackageCreateComponent} from './package/package-create/package-create.component';
import {TaskHomeComponent} from './task/task-home/task-home.component';
import {TaskListComponent} from './task/task-list/task-list.component';
import {TaskCreateComponent} from './task/task-create/task-create.component';
import {TenantHomeComponent} from './tenant/tenant-home/tenant-home.component';
import {TenantListComponent} from './tenant/tenant-list/tenant-list.component';
import {TenantCreateComponent} from './tenant/tenant-create/tenant-create.component';
import {TrialConfigComponent} from './trial-config/trial-config.component';
import {SupportDashboardComponent} from './support-dashboard/support-dashboard.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextModule} from 'primeng/inputtext';
import {KeyFilterModule} from 'primeng/keyfilter';
import {ButtonModule} from 'primeng/button';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {TableModule} from 'primeng/table';
import {MultiSelectModule} from 'primeng/multiselect';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {CalendarModule} from 'primeng/calendar';
import {MenuModule} from 'primeng/menu';
import {PasswordModule} from 'primeng/password';
import {DialogModule} from 'primeng/dialog';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {IntegrationHomeComponent} from './integration/integration-home/integration-home.component';
import {TabViewModule} from 'primeng/tabview';
import {IntegrationSystemListComponent} from './integration/integration-system-list/integration-system-list.component';
import {IntegrationConfigurationListComponent} from './integration/integration-configuration-list/integration-configuration-list.component';
import {IntegrationConfigurationCreateComponent} from './integration/integration-configuration-create/integration-configuration-create.component';
import {IntegrationSystemCreateComponent} from './integration/integration-system-create/integration-system-create.component';
import {SidebarModule} from 'primeng/sidebar';
import { PayemntTypeHomeComponent } from './payment-types/payemnt-type-home/payemnt-type-home.component';
import { PaymentTypeListComponent } from './payment-types/payment-type-list/payment-type-list.component';
import { CreatePaymentTypeComponent } from './payment-types/create-payment-type/create-payment-type.component';
import { PaymentProviderHomeComponent } from './payment-providers/payment-provider-home/payment-provider-home.component';
import { PaymentProviderListComponent } from './payment-providers/payment-provider-list/payment-provider-list.component';
import { PaymentProviderCreateComponent } from './payment-providers/payment-provider-create/payment-provider-create.component';
import {CurrencyMaskModule} from "ng2-currency-mask";
import {DashboardModule} from "../dashboard/dashboard.module";
import {AutoCompleteModule} from "primeng/autocomplete";
import { UtilizationReportSideBarComponent } from './tenant/utilization-report-side-bar/utilization-report-side-bar.component';
import {CommonImplModule} from "../common/common-impl.module";
import {ContextMenuModule} from "primeng/contextmenu";



@NgModule({
  declarations: [ActiveLoginListComponent, ApprovePackageListComponent, ApproveTrialListComponent, EmailListComponent,
    PackageHomeComponent, PackageListComponent, PackageCreateComponent, TaskHomeComponent, TaskListComponent, TaskCreateComponent,
    TenantHomeComponent, TenantListComponent, TenantCreateComponent, TrialConfigComponent, SupportDashboardComponent,
    IntegrationHomeComponent, IntegrationSystemListComponent, IntegrationConfigurationListComponent,
    IntegrationConfigurationCreateComponent, IntegrationSystemCreateComponent, PayemntTypeHomeComponent, PaymentTypeListComponent, CreatePaymentTypeComponent, PaymentProviderHomeComponent, PaymentProviderListComponent, PaymentProviderCreateComponent, UtilizationReportSideBarComponent],
    imports: [
        CommonModule,
        SupportRoutingModule,
        ReactiveFormsModule,
        DropdownModule,
        InputTextModule,
        KeyFilterModule,
        ButtonModule,
        InputTextareaModule,
        TableModule,
        MultiSelectModule,
        OverlayPanelModule,
        CalendarModule,
        MenuModule,
        FormsModule,
        PasswordModule,
        DialogModule,
        ConfirmDialogModule,
        TabViewModule,
        SidebarModule,
        CurrencyMaskModule,
        DashboardModule,
        AutoCompleteModule,
        CommonImplModule,
        ContextMenuModule
    ]
})
export class SupportModule {
}
