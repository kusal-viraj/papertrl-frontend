import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AutomationRoutingModule} from './automation-routing.module';
import {AutomationHomeComponent} from './automation-home/automation-home.component';
import {TabViewModule} from 'primeng/tabview';
import {ButtonModule} from 'primeng/button';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {MenuModule} from 'primeng/menu';
import {TableModule} from 'primeng/table';
import {SidebarModule} from 'primeng/sidebar';
import {DropdownModule} from 'primeng/dropdown';
import {MultiSelectModule} from 'primeng/multiselect';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {CalendarModule} from 'primeng/calendar';
import {KeyFilterModule} from 'primeng/keyfilter';
import {AutomationCreateComponent} from './automation-create/automation-create.component';
import {AutomationListComponent} from './automation-list/automation-list.component';
import {CheckboxModule} from 'primeng/checkbox';
import {RippleModule} from 'primeng/ripple';
import {MessagesModule} from 'primeng/messages';
import {RadioButtonModule} from 'primeng/radiobutton';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {AutomationWorkflowConfigComponent} from './automation-workflow-config/automation-workflow-config.component';
import {AutomationEmailConfigComponent} from './automation-email-config/automation-email-config.component';
import {AutomationNotificationConfigComponent} from './automation-notification-config/automation-notification-config.component';
import {AutomationFieldConfigComponent} from './automation-field-config/automation-field-config.component';
import {AutomationSyncWithThirdPartyConfigComponent} from './automation-sync-with-third-party-config/automation-sync-with-third-party-config.component';
import {CurrencyMaskModule} from 'ng2-currency-mask';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {DecimalNumberDirective} from './decimal-number.directive';
import {CommonImplModule} from '../common/common-impl.module';
import {MessageModule} from 'primeng/message';
import {AutomationAssignToConfigComponent} from './automation-assign-to/automation-assign-to-component-config.component';
import { FinalApproverComponent } from './final-approver/final-approver.component';
import {NgCircleProgressModule} from "ng-circle-progress";
import {ContextMenuModule} from "primeng/contextmenu";


@NgModule({
  declarations: [AutomationHomeComponent, AutomationCreateComponent, AutomationListComponent,
    AutomationWorkflowConfigComponent, AutomationEmailConfigComponent, AutomationNotificationConfigComponent,
    AutomationFieldConfigComponent, AutomationSyncWithThirdPartyConfigComponent, DecimalNumberDirective, AutomationAssignToConfigComponent, FinalApproverComponent],
    exports: [
        DecimalNumberDirective,
        AutomationCreateComponent
    ],
    imports: [
        CommonModule,
        AutomationRoutingModule,
        TabViewModule,
        ButtonModule,
        ReactiveFormsModule,
        InputTextModule,
        MenuModule,
        TableModule,
        SidebarModule,
        DropdownModule,
        FormsModule,
        MultiSelectModule,
        OverlayPanelModule,
        CalendarModule,
        KeyFilterModule,
        CheckboxModule,
        RippleModule,
        MessagesModule,
        RadioButtonModule,
        InputTextareaModule,
        CurrencyMaskModule,
        ConfirmDialogModule,
        CommonImplModule,
        MessageModule,
        NgCircleProgressModule,
        ContextMenuModule
    ]
})
export class AutomationModule {
}
