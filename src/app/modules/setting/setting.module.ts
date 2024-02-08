import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingRoutingModule} from './setting-routing.module';
import {SettingHomeComponent} from './setting-home/setting-home.component';
import {TabViewModule} from 'primeng/tabview';
import {AdditionalFieldListComponent} from './additional-field-list/additional-field-list.component';
import {AdditionalFieldCreateComponent} from './additional-field-create/additional-field-create.component';
import {CompanyProfileComponent} from './company-profile/company-profile.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {MultiSelectModule} from 'primeng/multiselect';
import {DropdownModule} from 'primeng/dropdown';
import {CheckboxModule} from 'primeng/checkbox';
import {AdditionalFieldDropdownDatasourceComponent} from './additional-field-dropdown-datasource/additional-field-dropdown-datasource.component';
import {SidebarModule} from 'primeng/sidebar';
import {AdditionalFieldEditComponent} from './additional-field-edit/additional-field-edit.component';
import {AdditionalFieldBaseComponent} from './additional-field-base/additional-field-base.component';
import {ChangePackageComponent} from './change-package/change-package.component';
import {TenantConversionComponent} from './tenant-conversion/tenant-conversion.component';
import {TableModule} from 'primeng/table';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {MenuModule} from 'primeng/menu';
import {CalendarModule} from 'primeng/calendar';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {ToastModule} from 'primeng/toast';
import {ShowHideFieldsComponent} from './show-hide-fields/show-hide-fields.component';
import {InputSwitchModule} from 'primeng/inputswitch';
import {MessageModule} from 'primeng/message';
import {MessagesModule} from 'primeng/messages';
import {AccordionModule} from 'primeng/accordion';
import {PoNumberConfigurationComponent} from './po-number-configuration/po-number-configuration.component';
import {PoNumberListComponent} from './po-number-list/po-number-list.component';
import {PaymentConfigurationComponent} from './payments/payment-configuration/payment-configuration.component';
import {FieldsetModule} from 'primeng/fieldset';
import {ChipModule} from 'primeng/chip';
import {AvatarModule} from 'primeng/avatar';
import {CurrencyMaskModule} from 'ng2-currency-mask';
import {InputNumberModule} from 'primeng/inputnumber';
import {ContextMenuModule} from 'primeng/contextmenu';
import {KeyFilterModule} from 'primeng/keyfilter';
import {CommonImplModule} from '../common/common-impl.module';
import { AdditionalFieldAttachDocComponent } from './additional-field-attach-doc/additional-field-attach-doc.component';
import {DialogModule} from 'primeng/dialog';
import {DepartmentCreateComponent} from './department-create/department-create.component';
import {DepartmentListComponent} from './department-list/department-list.component';
import {AutoCompleteModule} from 'primeng/autocomplete';
import { ManageFeatureComponent } from './manage-feature/manage-feature.component';
import {DecimalNumberDirective} from './decimal-number.directive';
import { PoPriceVarianceComponent } from './po-price-variance/po-price-variance.component';
import { PoPriceVarianceListComponent } from './po-price-variance-list/po-price-variance-list.component';
import {NumberDirective} from './number-only';
import { ReminderConfigurationComponent } from './reminder-configuration/reminder-configuration.component';
import { ReminderListComponent } from './reminder-list/reminder-list.component';
import { MileageConfigurationComponent } from './mileage-configuration/mileage-configuration.component';
import { MileageRateListComponent } from './mileage-rate-list/mileage-rate-list.component';
import {MegaMenuModule} from 'primeng/megamenu';
import { PaymentProviderDetailComponent } from './payments/payment-provider-detail/payment-provider-detail.component';
import { FieldValidationComponent } from './field-validation/field-validation.component';
import { DepartmentDetailViewComponent } from './department-detail-view/department-detail-view.component';
import {ItemModule} from "../item/item.module";
import {NgxIntlTelInputModule} from "ngx-intl-tel-input";


@NgModule({
  declarations: [SettingHomeComponent, AdditionalFieldListComponent, AdditionalFieldCreateComponent, CompanyProfileComponent,
    AdditionalFieldDropdownDatasourceComponent, AdditionalFieldEditComponent, AdditionalFieldBaseComponent, ChangePackageComponent,
    TenantConversionComponent, NumberDirective, DepartmentCreateComponent, DepartmentListComponent, ShowHideFieldsComponent,
    PoNumberConfigurationComponent, PoNumberListComponent, PaymentConfigurationComponent, AdditionalFieldAttachDocComponent,
    ManageFeatureComponent, DecimalNumberDirective, PoPriceVarianceComponent, PoPriceVarianceListComponent,
    ReminderConfigurationComponent, ReminderListComponent, MileageConfigurationComponent, MileageRateListComponent,
    PaymentProviderDetailComponent, FieldValidationComponent, DepartmentDetailViewComponent, ],
  providers: [PoNumberListComponent],
  exports: [
    NumberDirective
  ],

    imports: [
        CommonModule,
        SettingRoutingModule,
        TabViewModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        InputTextareaModule,
        MultiSelectModule,
        DropdownModule,
        CheckboxModule,
        SidebarModule,
        TableModule,
        OverlayPanelModule,
        MenuModule,
        CalendarModule,
        FormsModule,
        ConfirmDialogModule,
        ProgressSpinnerModule,
        ToastModule,
        InputSwitchModule,
        MessageModule,
        MessagesModule,
        AccordionModule,
        FieldsetModule,
        ChipModule,
        AvatarModule,
        CurrencyMaskModule,
        InputNumberModule,
        ContextMenuModule,
        KeyFilterModule,
        CommonImplModule,
        DialogModule,
        AutoCompleteModule,
        MegaMenuModule,
        ItemModule,
        NgxIntlTelInputModule
    ]
})
export class SettingModule {
}
