import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SupportTicketHomeComponent} from './support-ticket-home/support-ticket-home.component';
import {SupportTicketListComponent} from './support-ticket-list/support-ticket-list.component';
import {ButtonModule} from "primeng/button";
import {NgxDropzoneModule} from "ngx-dropzone";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputTextareaModule} from "primeng/inputtextarea";
import {InputTextModule} from "primeng/inputtext";
import {DropdownModule} from "primeng/dropdown";
import {SupportRoutingModule} from "./support-routing.module";
import { SupportTicketManageComponent } from './support-ticket-manage/support-ticket-manage.component';
import {CalendarModule} from "primeng/calendar";
import {TableModule} from "primeng/table";
import {MultiSelectModule} from "primeng/multiselect";
import {MenuModule} from "primeng/menu";
import {SidebarModule} from "primeng/sidebar";
import {DialogModule} from "primeng/dialog";
import {TimelineModule} from "primeng/timeline";
import {CardModule} from "primeng/card";
import {CommonImplModule} from "../common/common-impl.module";
import {CurrencyMaskModule} from "ng2-currency-mask";
import {KeyFilterModule} from "primeng/keyfilter";
import {ContextMenuModule} from "primeng/contextmenu";


@NgModule({
  declarations: [SupportTicketHomeComponent, SupportTicketListComponent, SupportTicketManageComponent],
    imports: [
        CommonModule,
        ButtonModule,
        NgxDropzoneModule,
        ReactiveFormsModule,
        InputTextareaModule,
        InputTextModule,
        DropdownModule,
        SupportRoutingModule,
        CalendarModule,
        TableModule,
        MultiSelectModule,
        MenuModule,
        FormsModule,
        SidebarModule,
        DialogModule,
        TimelineModule,
        CardModule,
        CommonImplModule,
        CurrencyMaskModule,
        KeyFilterModule,
        ContextMenuModule
    ]
})
export class SupportTicketModule {
}
