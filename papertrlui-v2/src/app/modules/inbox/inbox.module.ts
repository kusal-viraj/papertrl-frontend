import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InboxRoutingModule} from './inbox-routing.module';
import {InboxHomeComponent} from './inbox-home/inbox-home.component';
import {TabViewModule} from "primeng/tabview";
import {VirtualScrollerModule} from "primeng/virtualscroller";
import {MenuModule} from "primeng/menu";
import {TooltipModule} from "primeng/tooltip";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {ButtonModule} from "primeng/button";
import {ProcessedListComponent} from './processed-list/processed-list.component';
import {DeletedListComponent} from './deleted-list/deleted-list.component';
import {ToProcessListComponent} from './to-process-list/to-process-list.component';
import {InputTextModule} from "primeng/inputtext";
import {CheckboxModule} from "primeng/checkbox";
import {DialogModule} from "primeng/dialog";
import {ClipboardModule} from "ngx-clipboard";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {NgxExtendedPdfViewerModule} from "ngx-extended-pdf-viewer";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {SidebarModule} from "primeng/sidebar";
import {BillsModule} from "../bills/bills.module";
import {CommonImplModule} from "../common/common-impl.module";
import {AccordionModule} from "primeng/accordion";
import {NumberDirective} from "./number-only";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {BadgeModule} from "primeng/badge";
import {DecimalNumberDirective} from "./decimal-number.directive";
import { ProcessingQueueListComponent } from './processing-queue-list/processing-queue-list.component';
import { InboxUploadDrawerComponent } from './inbox-upload-drawer/inbox-upload-drawer.component';
import {NgxDropzoneModule} from "ngx-dropzone";
import { InboxUploadingDrawerComponent } from './inbox-uploading-drawer/inbox-uploading-drawer.component';
import {ProgressBarModule} from "primeng/progressbar";


@NgModule({
  declarations: [InboxHomeComponent, ProcessedListComponent, DeletedListComponent,
    ToProcessListComponent, NumberDirective, DecimalNumberDirective, ProcessingQueueListComponent, InboxUploadDrawerComponent, InboxUploadingDrawerComponent],
  exports: [],
    imports: [
        CommonModule,
        InboxRoutingModule,
        TabViewModule,
        VirtualScrollerModule,
        MenuModule,
        TooltipModule,
        FormsModule,
        DropdownModule,
        ButtonModule,
        InputTextModule,
        CheckboxModule,
        DialogModule,
        ReactiveFormsModule,
        ClipboardModule,
        OverlayPanelModule,
        NgxExtendedPdfViewerModule,
        ConfirmDialogModule,
        SidebarModule,
        BadgeModule,
        BillsModule,
        CommonImplModule,
        AccordionModule,
        ProgressSpinnerModule,
        NgxDropzoneModule,
        ProgressBarModule,
    ]
})
export class InboxModule {
}
