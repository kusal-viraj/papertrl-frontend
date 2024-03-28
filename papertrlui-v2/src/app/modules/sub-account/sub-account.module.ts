import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubAccountRoutingModule } from './sub-account-routing.module';
import { SubAccountHomeComponent } from './sub-account-home/sub-account-home.component';
import { CreateSubAccountComponent } from './create-sub-account/create-sub-account.component';
import { SubAccountListComponent } from './sub-account-list/sub-account-list.component';
import {ButtonModule} from 'primeng/button';
import {MenuModule} from 'primeng/menu';
import {TableModule} from 'primeng/table';
import {MultiSelectModule} from 'primeng/multiselect';
import {CalendarModule} from 'primeng/calendar';
import {DropdownModule} from 'primeng/dropdown';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {SidebarModule} from 'primeng/sidebar';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {KeyFilterModule} from 'primeng/keyfilter';
import {ToastModule} from 'primeng/toast';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {CurrencyMaskModule} from "ng2-currency-mask";
import {AutoCompleteModule} from "primeng/autocomplete";
import {CommonImplModule} from '../common/common-impl.module';
import {ContextMenuModule} from "primeng/contextmenu";


@NgModule({
  declarations: [SubAccountHomeComponent, CreateSubAccountComponent, SubAccountListComponent],
    imports: [
        CommonModule,
        SubAccountRoutingModule,
        ButtonModule,
        MenuModule,
        TableModule,
        MultiSelectModule,
        CalendarModule,
        DropdownModule,
        OverlayPanelModule,
        SidebarModule,
        ReactiveFormsModule,
        FormsModule,
        InputTextModule,
        KeyFilterModule,
        ToastModule,
        ConfirmDialogModule,
        CurrencyMaskModule,
        AutoCompleteModule,
        CommonImplModule,
        ContextMenuModule
    ]
})
export class SubAccountModule { }
