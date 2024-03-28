import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectCodeRoutingModule } from './project-code-routing.module';
import { CodeHomeComponent } from './code-home/code-home.component';
import {DropdownModule} from 'primeng/dropdown';
import {MultiSelectModule} from 'primeng/multiselect';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {MenuModule} from 'primeng/menu';
import {CalendarModule} from 'primeng/calendar';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {KeyFilterModule} from 'primeng/keyfilter';
import { UploadProjectCodeComponent } from './upload-project-code/upload-project-code.component';
import {SidebarModule} from 'primeng/sidebar';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {CreateProjectCodeComponent} from './create-project-code/create-project-code.component';
import {ProjectCodeListComponent} from './project-code-list/project-code-list.component';
import {TreeTableModule} from 'primeng/treetable';
import {ToastModule} from 'primeng/toast';
import {CheckboxModule} from 'primeng/checkbox';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {TableModule} from 'primeng/table';
import {ProgressBarModule} from "primeng/progressbar";
import {PanelModule} from 'primeng/panel';
import {BlockUIModule} from 'primeng/blockui';
import {NgCircleProgressModule} from 'ng-circle-progress';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { ProjectDetailViewComponent } from './project-detail-view/project-detail-view.component';
import {CommonImplModule} from "../common/common-impl.module";
import {DialogModule} from "primeng/dialog";
import {BillsModule} from "../bills/bills.module";
import {TooltipModule} from "primeng/tooltip";
import {ListboxModule} from "primeng/listbox";
import {ContextMenuModule} from "primeng/contextmenu";


@NgModule({
  declarations: [CodeHomeComponent, UploadProjectCodeComponent, CreateProjectCodeComponent, ProjectCodeListComponent, ProjectDetailViewComponent],
  exports: [
    CreateProjectCodeComponent,
  ],
    imports: [
        CommonModule,
        ProjectCodeRoutingModule,
        DropdownModule,
        MultiSelectModule,
        OverlayPanelModule,
        MenuModule,
        CalendarModule,
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        InputTextModule,
        KeyFilterModule,
        SidebarModule,
        InputTextareaModule,
        ToastModule,
        CheckboxModule,
        ConfirmDialogModule,
        TreeTableModule,
        TableModule,
        ProgressBarModule,
        PanelModule,
        BlockUIModule,
        NgCircleProgressModule,
        CurrencyMaskModule,
        CommonImplModule,
        DialogModule,
        BillsModule,
        TooltipModule,
        ListboxModule,
        ContextMenuModule
    ]
})
export class ProjectCodeModule { }
