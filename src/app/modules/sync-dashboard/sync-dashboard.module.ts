import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SyncDashboardRoutingModule } from './sync-dashboard-routing.module';
import { SyncDashboardHomeComponent } from './sync-dashboard-home/sync-dashboard-home.component';
import {TabViewModule} from 'primeng/tabview';
import { AccountingHomeComponent } from './accounting-home/accounting-home.component';
import { AccountPendingComponent } from './account-pending/account-pending.component';
import { AccountProcessingComponent } from './account-processing/account-processing.component';
import { AccountCompletedComponent } from './account-completed/account-completed.component';
import { AccountFailedComponent } from './account-failed/account-failed.component';
import {ToggleButtonModule} from 'primeng/togglebutton';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MessagesModule} from 'primeng/messages';
import {ButtonModule} from 'primeng/button';
import {MenuModule} from 'primeng/menu';
import {TableModule} from 'primeng/table';
import {CalendarModule} from 'primeng/calendar';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextModule} from 'primeng/inputtext';
import {MultiSelectModule} from 'primeng/multiselect';
import {SidebarModule} from 'primeng/sidebar';
import {FieldsetModule} from 'primeng/fieldset';
import {InputSwitchModule} from 'primeng/inputswitch';
import {PasswordModule} from "primeng/password";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {CurrencyMaskModule} from "ng2-currency-mask";
import {KeyFilterModule} from "primeng/keyfilter";
import { QbConfigurationsComponent } from './qb-configurations/qb-configurations.component';
import { BcConfigurationsComponent } from './bc-configurations/bc-configurations.component';
import {AccordionModule} from "primeng/accordion";
import { BbConfigurationComponent } from './bb-configuration/bb-configuration.component';
import { DnoConfigurationsComponent } from './dno-configurations/dno-configurations.component';
import { BccConfigurationsComponent } from './bcc-configurations/bcc-configurations.component';
import { AccountCompletedPullComponent } from './account-completed-pull/account-completed-pull.component';
import { AccountFailedPullComponent } from './account-failed-pull/account-failed-pull.component';
import {CommonImplModule} from "../common/common-impl.module";


@NgModule({
  declarations: [SyncDashboardHomeComponent, AccountingHomeComponent, AccountPendingComponent, AccountProcessingComponent, AccountCompletedComponent, AccountFailedComponent, QbConfigurationsComponent, BcConfigurationsComponent, BbConfigurationComponent, DnoConfigurationsComponent, BccConfigurationsComponent, AccountCompletedPullComponent, AccountFailedPullComponent],
    imports: [
        CommonModule,
        SyncDashboardRoutingModule,
        TabViewModule,
        ToggleButtonModule,
        FormsModule,
        MessagesModule,
        ButtonModule,
        MenuModule,
        TableModule,
        CalendarModule,
        DropdownModule,
        InputTextModule,
        MultiSelectModule,
        SidebarModule,
        FieldsetModule,
        InputSwitchModule,
        ReactiveFormsModule,
        PasswordModule,
        OverlayPanelModule,
        CurrencyMaskModule,
        KeyFilterModule,
        AccordionModule,
        CommonImplModule
    ]
})
export class SyncDashboardModule { }
