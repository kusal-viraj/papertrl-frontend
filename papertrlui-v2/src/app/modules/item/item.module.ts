import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ItemRoutingModule} from './item-routing.module';
import {ItemHomeComponent} from './item-home/item-home.component';
import {ItemCreateComponent} from './item-create/item-create.component';
import {ItemListComponent} from './item-list/item-list.component';
import {ItemUploadComponent} from './item-upload/item-upload.component';
import {TabViewModule} from 'primeng/tabview';
import {ButtonModule} from 'primeng/button';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {InputSwitchModule} from 'primeng/inputswitch';
import {TableModule} from 'primeng/table';
import {MultiSelectModule} from 'primeng/multiselect';
import {CalendarModule} from 'primeng/calendar';
import {MenuModule} from 'primeng/menu';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {SidebarModule} from 'primeng/sidebar';
import {CheckboxModule} from 'primeng/checkbox';
import {VirtualScrollerModule} from 'primeng/virtualscroller';
import {KeyFilterModule} from 'primeng/keyfilter';
import {UomCreateComponent} from './uom-create/uom-create.component';
import {CategoryCreateComponent} from './category-create/category-create.component';
import {CommonImplModule} from '../common/common-impl.module';
import {CurrencyMaskModule} from 'ng2-currency-mask';
import {ToastModule} from 'primeng/toast';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ProgressBarModule} from 'primeng/progressbar';
import {PanelModule} from 'primeng/panel';
import {NgCircleProgressModule} from 'ng-circle-progress';
import {BlockUIModule} from 'primeng/blockui';
import {DividerModule} from 'primeng/divider';
import {DecimalNumberDirective} from "./decimal-number.directive";
import {NumberDirective} from "./number-only";
import {TooltipModule} from "primeng/tooltip";
import {DialogModule} from "primeng/dialog";
import { ItemDetailViewComponent } from './item-detail-view/item-detail-view.component';
import {ContextMenuModule} from "primeng/contextmenu";


@NgModule({
  declarations: [ItemHomeComponent, ItemCreateComponent, ItemListComponent, ItemUploadComponent,
    UomCreateComponent, CategoryCreateComponent, DecimalNumberDirective, NumberDirective, ItemDetailViewComponent],
    exports: [
        ItemCreateComponent,
        ItemDetailViewComponent,
        CategoryCreateComponent
    ],
    imports: [
        CommonModule,
        ItemRoutingModule,
        TabViewModule,
        ButtonModule,
        FormsModule,
        ReactiveFormsModule,
        DropdownModule,
        InputTextModule,
        InputTextareaModule,
        InputSwitchModule,
        TableModule,
        MultiSelectModule,
        CalendarModule,
        MenuModule,
        OverlayPanelModule,
        SidebarModule,
        CheckboxModule,
        VirtualScrollerModule,
        KeyFilterModule,
        CommonImplModule,
        CurrencyMaskModule,
        ToastModule,
        ConfirmDialogModule,
        ProgressBarModule,
        PanelModule,
        NgCircleProgressModule,
        BlockUIModule,
        DividerModule,
        TooltipModule,
        DialogModule,
        ContextMenuModule,
    ],
  providers: [ItemListComponent]
})
export class ItemModule {
}
