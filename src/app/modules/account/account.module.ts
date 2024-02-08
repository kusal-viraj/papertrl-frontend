import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { AccountHomeComponent } from './account-home/account-home.component';
import { AccountCreateComponent } from './account-create/account-create.component';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountUploadComponent } from './account-upload/account-upload.component';
import {SidebarModule} from 'primeng/sidebar';
import {TreeModule} from 'primeng/tree';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {PasswordModule} from 'primeng/password';
import {ButtonModule} from 'primeng/button';
import {TabViewModule} from 'primeng/tabview';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {TableModule} from 'primeng/table';
import {MenuModule} from 'primeng/menu';
import {CalendarModule} from 'primeng/calendar';
import {MultiSelectModule} from 'primeng/multiselect';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {KeyFilterModule} from "primeng/keyfilter";
import {ToastModule} from "primeng/toast";
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ProgressBarModule} from "primeng/progressbar";
import {BlockUIModule} from 'primeng/blockui';
import {NgCircleProgressModule} from 'ng-circle-progress';
import {PanelModule} from 'primeng/panel';
import {CurrencyMaskModule} from "ng2-currency-mask";
import {CheckboxModule} from 'primeng/checkbox';
import { AccountDetailViewComponent } from './account-detail-view/account-detail-view.component';
import {DialogModule} from "primeng/dialog";
import {CommonImplModule} from "../common/common-impl.module";
import {ContextMenuModule} from "primeng/contextmenu";


@NgModule({
  declarations: [AccountHomeComponent, AccountCreateComponent, AccountListComponent, AccountUploadComponent, AccountDetailViewComponent],
  exports: [
    AccountCreateComponent
  ],
    imports: [
        CommonModule,
        AccountRoutingModule,
        SidebarModule,
        TreeModule,
        ReactiveFormsModule,
        InputTextModule,
        DropdownModule,
        PasswordModule,
        ButtonModule,
        TabViewModule,
        InputTextareaModule,
        TableModule,
        MenuModule,
        FormsModule,
        CalendarModule,
        MultiSelectModule,
        OverlayPanelModule,
        KeyFilterModule,
        ToastModule,
        ConfirmDialogModule,
        ProgressBarModule,
        BlockUIModule,
        NgCircleProgressModule,
        PanelModule,
        CurrencyMaskModule,
        CheckboxModule,
        DialogModule,
        CommonImplModule,
        ContextMenuModule
    ]
})
export class AccountModule { }
